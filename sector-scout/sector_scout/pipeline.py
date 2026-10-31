"""Orchestrates a run: collect -> fetch text -> extract -> synthesize -> digest."""

from __future__ import annotations

import logging
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
from pathlib import Path
from urllib.parse import urlsplit

from .analyze import Analyzer, ItemExtraction, SectorBrief, heuristic_brief
from .config import Config, Sector, Settings
from .digest import DigestData, SectorReport, write_digest
from .fetcher import BlockedByRobots, FetchError, Fetcher
from .llm import PRICES, LLMError
from .models import Item
from .sources import collect_news, collect_podcasts, resolve_google_links
from .store import Store
from .textutil import clip, extract_article, transcript_to_text

log = logging.getLogger(__name__)


def _fatal_api_errors() -> tuple[type[BaseException], ...]:
    """Errors that will fail every call (bad key, no access, unknown model)."""
    try:
        import anthropic
    except ImportError:  # pragma: no cover
        return ()
    return (anthropic.AuthenticationError, anthropic.PermissionDeniedError,
            anthropic.NotFoundError)


def _item_api_errors() -> tuple[type[BaseException], ...]:
    """Errors that only affect one call: skip that item and keep going."""
    from pydantic import ValidationError

    try:
        import anthropic
    except ImportError:  # pragma: no cover
        return (LLMError, ValidationError)
    return (LLMError, ValidationError, anthropic.APIError)


@dataclass
class RunOptions:
    sectors: list[str] | None = None
    days: int | None = None
    dry_run: bool = False
    transcribe: bool | None = None  # None = use the config setting
    max_items: int | None = None  # overall cap, handy for a cheap first run
    out_dir: Path | None = None


@dataclass
class RunResult:
    digest: DigestData | None
    paths: tuple[Path, Path] | None
    items: list[Item] = field(default_factory=list)
    estimate: str = ""


# --- collection -------------------------------------------------------------------------

def dedupe(items: list[Item]) -> list[Item]:
    seen: set[str] = set()
    out = []
    for item in items:
        keys = {item.id, item.dedupe_key}
        if keys & seen:
            continue
        seen |= keys
        out.append(item)
    return out


def collect_sector(sector: Sector, settings: Settings, fetcher: Fetcher,
                   since: datetime) -> list[Item]:
    news = dedupe(collect_news(sector, settings, fetcher, since))
    pods = dedupe(collect_podcasts(sector, settings, fetcher, since))
    cap = settings.max_items_per_sector
    pods = pods[: max(cap // 2, cap - len(news))]
    items = pods + news[: cap - len(pods)]
    log.info("[%s] collected %d news items and %d podcast episodes",
             sector.key, len(items) - len(pods), len(pods))
    return items


# --- text enrichment ----------------------------------------------------------------------

def enrich(item: Item, fetcher: Fetcher, settings: Settings) -> Item:
    """Fill item.text with the best text available (network only, thread safe)."""
    if item.kind == "news":
        host = urlsplit(item.url).netloc
        if settings.fetch_full_text and item.url and "news.google.com" not in host:
            try:
                resp = fetcher.get(item.url, check_robots=settings.respect_robots_txt)
                if "html" in resp.content_type or resp.content.lstrip()[:1] == b"<":
                    text = extract_article(resp.text, resp.url)
                    if len(text) > len(item.summary):
                        item.text, item.text_source = text, "article"
            except BlockedByRobots:
                log.info("robots.txt disallows %s; using the feed snippet", item.url)
            except FetchError as exc:
                log.debug("Article fetch failed: %s", exc)
        if not item.text:
            item.text, item.text_source = item.summary, "snippet"
    else:
        for url, mime in item.transcripts:
            try:
                resp = fetcher.get(url, max_bytes=20 * 1024 * 1024)
                text = transcript_to_text(resp.text, mime or resp.content_type, url)
            except FetchError as exc:
                log.debug("Transcript fetch failed: %s", exc)
                continue
            if len(text) > 200:
                item.text, item.text_source = text, "transcript"
                break
        if not item.text:
            item.text, item.text_source = item.summary, "show_notes"
    item.text, item.truncated = clip(item.text, settings.max_chars_per_item)
    if item.truncated:
        log.warning("Clipped long text to %d chars: %s", settings.max_chars_per_item, item.title)
    return item


def transcribe_missing(items: list[Item], fetcher: Fetcher, settings: Settings) -> None:
    """Sequential (CPU heavy): transcribe episodes that only have show notes."""
    from .transcribe import TranscriptionUnavailable, transcribe_url

    for item in items:
        if item.kind != "podcast" or item.text_source != "show_notes" or not item.audio_url:
            continue
        log.info("Transcribing audio: %s", item.title)
        try:
            text = transcribe_url(fetcher, item.audio_url, settings.whisper_model,
                                  settings.max_audio_minutes)
        except TranscriptionUnavailable as exc:
            log.warning("%s; skipping audio transcription", exc)
            return
        except Exception as exc:  # decoding errors, bad audio, etc.
            log.warning("Transcription failed for %s: %s", item.title, exc)
            continue
        if len(text) > len(item.text):
            item.text, item.truncated = clip(text, settings.max_chars_per_item)
            item.text_source = "audio"


# --- estimates -----------------------------------------------------------------------------

def estimate_cost(items: list[Item], settings: Settings, n_sectors: int) -> str:
    analyzable = [i for i in items if len(i.text) >= settings.min_text_chars]
    in_tokens = sum(len(i.text) for i in analyzable) // 4 + 900 * len(analyzable)
    out_tokens = 1500 * len(analyzable)  # includes thinking at low effort; rough
    syn_in, syn_out = 8000 * n_sectors, 8000 * n_sectors
    lines = [f"{len(items)} items collected, {len(analyzable)} with enough text to analyze, "
             f"~{in_tokens:,} input tokens for extraction."]
    p_ext, p_syn = PRICES.get(settings.extract_model), PRICES.get(settings.synthesize_model)
    if p_ext and p_syn:
        cost = (in_tokens * p_ext[0] + out_tokens * p_ext[1]
                + syn_in * p_syn[0] + syn_out * p_syn[1]) / 1e6
        lines.append(f"Rough Claude cost for this run: ${cost:.2f} "
                     f"(extract: {settings.extract_model}, synthesize: "
                     f"{settings.synthesize_model}). Already-analyzed items are free.")
    return " ".join(lines)


# --- run --------------------------------------------------------------------------------------

def run(cfg: Config, opts: RunOptions, *, llm=None, fetcher: Fetcher | None = None,
        store: Store | None = None, now: datetime | None = None) -> RunResult:
    settings = cfg.settings
    if opts.days:
        settings.lookback_days = opts.days
    now = now or datetime.now(timezone.utc)
    since = now - timedelta(days=settings.lookback_days)
    sectors = cfg.select(opts.sectors)
    fetcher = fetcher or Fetcher(settings.user_agent, settings.request_delay_seconds,
                                 settings.respect_robots_txt)
    store = store or Store(cfg.resolve(settings.db_path))
    analyzer = Analyzer(settings, llm)

    # 1. Collect
    per_sector: dict[str, list[Item]] = {}
    for sector in sectors:
        per_sector[sector.key] = collect_sector(sector, settings, fetcher, since)
    if opts.max_items:
        budget = opts.max_items
        for key in per_sector:
            per_sector[key] = per_sector[key][: max(1, budget // len(per_sector))]
    all_items = [i for items in per_sector.values() for i in items]

    # 2. Text. Items already analyzed by this analyzer skip the network entirely.
    extractions: dict[str, ItemExtraction] = {}
    for item in all_items:
        cached = store.cached_extraction(item.id, analyzer.name)
        if cached is not None:
            extractions[item.id] = cached
            item.text_source = store.text_source(item.id)
    to_fetch = [i for i in all_items if i.id not in extractions]
    if settings.fetch_full_text:
        n = resolve_google_links([i for i in to_fetch if i.provider == "google"])
        if n:
            log.info("Resolved %d Google News links to publisher URLs", n)
    with ThreadPoolExecutor(max_workers=settings.max_workers) as pool:
        list(pool.map(lambda i: enrich(i, fetcher, settings), to_fetch))
    transcribe = settings.transcribe_audio if opts.transcribe is None else opts.transcribe
    if transcribe:
        transcribe_missing(to_fetch, fetcher, settings)
    for item in all_items:
        store.upsert_item(item)

    estimate = estimate_cost(to_fetch, settings, len(sectors)) if llm else ""
    if opts.dry_run:
        return RunResult(digest=None, paths=None, items=all_items,
                         estimate=estimate or estimate_cost(to_fetch, settings, len(sectors)))

    # 3. Extract practices from each item (map)
    sector_by_key = {s.key: s for s in sectors}
    pending = [i for i in to_fetch if len(i.text) >= settings.min_text_chars]
    log.info("Analyzing %d items with %s (%d cached)", len(pending), analyzer.name,
             len(extractions))
    failed: dict[str, int] = {}
    fatal, per_item = _fatal_api_errors(), _item_api_errors()
    with ThreadPoolExecutor(max_workers=settings.max_workers) as pool:
        futures = {pool.submit(analyzer.extract, sector_by_key[i.sector], i): i for i in pending}
        for done, fut in enumerate(as_completed(futures), start=1):
            item = futures[fut]
            try:
                ext = fut.result()
            except fatal:
                for f in futures:
                    f.cancel()
                raise
            except per_item as exc:
                log.warning("Skipped %r: %s", item.title, exc)
                failed[item.sector] = failed.get(item.sector, 0) + 1
                continue
            extractions[item.id] = ext
            store.save_extraction(item, ext, analyzer.name)
            if done % 10 == 0 or done == len(pending):
                log.info("Analyzed %d/%d", done, len(pending))

    # 4. Synthesize each sector (reduce)
    notes: list[str] = []
    if not all_items:
        notes.append("No sources were found. Check the run log for network errors, or "
                     "widen the lookback window with --days.")
    reports: list[SectorReport] = []
    for sector in sectors:
        items = per_sector[sector.key]
        sources = [i for i in items if extractions.get(i.id) and extractions[i.id].practices]
        cited = {i.id for i in sources}
        others = [i for i in items if i.id not in cited]
        brief: SectorBrief | None
        try:
            brief = analyzer.synthesize(sector, sources, extractions)
        except fatal:
            raise
        except per_item as exc:
            log.warning("[%s] synthesis failed: %s", sector.key, exc)
            notes.append(f"{sector.name}: Claude synthesis failed ({exc}); "
                         "showing per-source highlights instead.")
            brief = heuristic_brief(sources, extractions)
        reports.append(SectorReport(sector=sector, brief=brief, sources=sources,
                                    other_items=others, failed=failed.get(sector.key, 0)))
        if failed.get(sector.key):
            notes.append(f"{sector.name}: {failed[sector.key]} item(s) could not be analyzed.")

    # 5. Cross-sector ideas
    cross = []
    if llm is not None:
        briefs = {r.sector.key: (r.sector, r.brief) for r in reports
                  if r.brief and r.brief.top_practices}
        try:
            cross = analyzer.cross_sector(briefs)
        except per_item as exc:
            log.warning("Cross-sector step failed: %s", exc)

    digest = DigestData(
        generated=now, since=since, reports=reports, cross_ideas=cross,
        usage_summary=llm.usage.summary() if llm is not None and hasattr(llm, "usage") else "",
        heuristic=llm is None, notes=notes,
    )
    out_dir = opts.out_dir or cfg.resolve(settings.output_dir)
    paths = write_digest(digest, Path(out_dir))
    return RunResult(digest=digest, paths=paths, items=all_items, estimate=estimate)
