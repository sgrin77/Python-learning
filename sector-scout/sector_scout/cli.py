"""Command line interface: `python -m sector_scout <command>`."""

from __future__ import annotations

import argparse
import logging
import os
import sys
from pathlib import Path

from .config import ConfigError, load_config

DEFAULT_CONFIG = Path(__file__).resolve().parent.parent / "sectors.yaml"

log = logging.getLogger("sector_scout")


def _config_path(arg: str | None) -> Path:
    return Path(arg or os.environ.get("SECTOR_SCOUT_CONFIG") or DEFAULT_CONFIG)


def make_llm(no_llm: bool):
    """Return a ClaudeLLM, or None for keyword-highlight mode."""
    if no_llm:
        return None
    try:
        import anthropic  # noqa: F401
    except ImportError:
        log.warning("The `anthropic` package is not installed; using keyword highlights")
        return None
    from .llm import ClaudeLLM

    llm = ClaudeLLM()
    c = llm.client
    if not (c.api_key or c.auth_token or getattr(c, "credentials", None)):
        log.warning("No Claude credentials found (set ANTHROPIC_API_KEY or run "
                    "`ant auth login`); using keyword highlights instead")
        return None
    return llm


def cmd_run(args: argparse.Namespace) -> int:
    from .pipeline import RunOptions, run

    cfg = load_config(_config_path(args.config))
    llm = make_llm(args.no_llm)
    opts = RunOptions(
        sectors=[s.strip() for s in args.sectors.split(",")] if args.sectors else None,
        days=args.days,
        dry_run=args.dry_run,
        transcribe=True if args.transcribe else None,
        max_items=args.max_items,
        out_dir=Path(args.out) if args.out else None,
    )
    result = run(cfg, opts, llm=llm)

    if args.dry_run:
        print("\nDry run (no Claude calls made).")
        by_source: dict[str, int] = {}
        for item in result.items:
            by_source[item.text_source or "cached"] = by_source.get(item.text_source or "cached",
                                                                    0) + 1
        print("Text found: " + ", ".join(f"{k}: {v}" for k, v in sorted(by_source.items())))
        for item in result.items[:60]:
            print(f"  [{item.sector}] {item.kind:7} {item.text_source or 'cached':10} "
                  f"{len(item.text):>7,} chars  {item.title[:80]}")
        if len(result.items) > 60:
            print(f"  ... and {len(result.items) - 60} more")
        print("\n" + result.estimate)
        return 0

    assert result.paths and result.digest
    md_path, html_path = result.paths
    print(f"\nDigest written:\n  {md_path}\n  {html_path}")
    if result.digest.usage_summary:
        print(f"Claude usage: {result.digest.usage_summary}")
    if args.email:
        from .emailer import EmailConfigError, SmtpSettings, build_message, send

        try:
            smtp = SmtpSettings.from_env()
        except EmailConfigError as exc:
            print(f"Email not sent: {exc}", file=sys.stderr)
            return 1
        subject = f"Sector Scout: best practices for {result.digest.generated:%b %d, %Y}"
        send(build_message(subject, md_path.read_text(encoding="utf-8"),
                           html_path.read_text(encoding="utf-8"), smtp.sender,
                           smtp.recipients), smtp)
        print(f"Emailed to {', '.join(smtp.recipients)}")
    return 0


def cmd_search(args: argparse.Namespace) -> int:
    from .store import Store

    cfg = load_config(_config_path(args.config))
    store = Store(cfg.resolve(cfg.settings.db_path))
    rows = store.search(args.query, sector=args.sector, limit=args.limit)
    if not rows:
        print("No matching practices yet. Run `python -m sector_scout run` first.")
        return 0
    for r in rows:
        published = (r.get("published") or "")[:10]
        print(f"\n[{r['sector']}] {r['title']}  ({r['confidence']})")
        print(f"  {r['practice']}")
        if r.get("evidence"):
            print(f"  Evidence: {r['evidence']}")
        print(f"  Source: {r['item_title']} · {r['source']} {published}\n  {r['url']}")
    return 0


def cmd_sectors(args: argparse.Namespace) -> int:
    cfg = load_config(_config_path(args.config))
    for s in cfg.sectors.values():
        print(f"{s.key:26} {s.name}")
        print(f"{'':26} {len(s.news_queries)} news queries, {len(s.rss_feeds)} feeds, "
              f"{len(s.podcast_search_terms)} podcast searches, "
              f"{len(s.podcast_feeds)} podcast feeds")
    return 0


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        prog="sector_scout",
        description="Scrape news and podcasts and distill best practices by sector.",
    )
    p.add_argument("--config", help=f"Path to sectors.yaml (default: {DEFAULT_CONFIG})")
    p.add_argument("-v", "--verbose", action="store_true", help="Debug logging")
    sub = p.add_subparsers(dest="command", required=True)

    r = sub.add_parser("run", help="Collect, analyze and write a digest")
    r.add_argument("--sectors", help="Comma separated sector keys (default: all)")
    r.add_argument("--days", type=int, help="Look back N days (default from config)")
    r.add_argument("--no-llm", action="store_true",
                   help="Skip Claude and produce keyword highlights")
    r.add_argument("--dry-run", action="store_true",
                   help="Collect and fetch text, then show what would be analyzed and "
                        "the estimated cost")
    r.add_argument("--transcribe", action="store_true",
                   help="Transcribe podcast audio when no transcript exists (needs "
                        "faster-whisper)")
    r.add_argument("--max-items", type=int, help="Cap total items (cheap trial runs)")
    r.add_argument("--out", help="Output folder for the digest")
    r.add_argument("--email", action="store_true", help="Email the digest (SMTP_* env vars)")
    r.set_defaults(func=cmd_run)

    s = sub.add_parser("search", help="Search every practice collected so far")
    s.add_argument("query")
    s.add_argument("--sector")
    s.add_argument("--limit", type=int, default=15)
    s.set_defaults(func=cmd_search)

    ls = sub.add_parser("sectors", help="List configured sectors")
    ls.set_defaults(func=cmd_sectors)
    return p


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    logging.basicConfig(
        level=logging.DEBUG if args.verbose else logging.INFO,
        format="%(asctime)s %(levelname)-7s %(message)s",
        datefmt="%H:%M:%S",
    )
    for noisy in ("httpx", "httpx2", "trafilatura", "anthropic", "charset_normalizer"):
        logging.getLogger(noisy).setLevel(logging.WARNING)
    # urllib3 logs every retry as a warning; our own warning covers the failure.
    logging.getLogger("urllib3").setLevel(logging.ERROR)
    try:
        return args.func(args)
    except ConfigError as exc:
        print(f"Config error: {exc}", file=sys.stderr)
        return 2
