"""News discovery through search-result RSS feeds and direct publisher feeds."""

from __future__ import annotations

import calendar
import logging
from datetime import datetime, timezone
from urllib.parse import parse_qs, quote_plus, urlsplit

import feedparser

from ..config import Sector, Settings
from ..fetcher import FetchError, Fetcher
from ..models import Item
from ..textutil import html_to_text

log = logging.getLogger(__name__)


def google_news_url(query: str, days: int, language: str = "en", country: str = "US") -> str:
    q = quote_plus(f"{query} when:{days}d")
    return (f"https://news.google.com/rss/search?q={q}"
            f"&hl={language}-{country}&gl={country}&ceid={country}:{language}")


def bing_news_url(query: str, language: str = "en", country: str = "US") -> str:
    return (f"https://www.bing.com/news/search?q={quote_plus(query)}"
            f"&format=rss&setlang={language}-{country}&cc={country}")


def entry_datetime(entry) -> datetime | None:
    parsed = entry.get("published_parsed") or entry.get("updated_parsed")
    if not parsed:
        return None
    return datetime.fromtimestamp(calendar.timegm(parsed), tz=timezone.utc)


def unwrap_bing(url: str) -> str:
    """Bing RSS links are click-tracking redirects carrying the real URL in `url=`."""
    parts = urlsplit(url)
    if parts.netloc.endswith("bing.com") and "apiclick" in parts.path:
        target = parse_qs(parts.query).get("url")
        if target and target[0].startswith("http"):
            return target[0]
    return url


def strip_publisher_suffix(title: str, source: str) -> str:
    """Google News titles end in ' - Publisher'."""
    if source and title.endswith(f" - {source}"):
        return title[: -len(source) - 3].strip()
    return title


def _entry_source(entry, provider: str, fallback: str) -> str:
    src = entry.get("source")
    if isinstance(src, dict) and src.get("title"):
        return src["title"]
    for key in ("news_source", "source_title", "author"):
        if entry.get(key):
            return str(entry[key])
    return fallback


def parse_news_feed(content: bytes | str, *, sector: str, provider: str,
                    fallback_source: str = "", since: datetime | None = None) -> list[Item]:
    feed = feedparser.parse(content)
    if feed.bozo and not feed.entries:
        raise ValueError(f"Unreadable feed: {feed.get('bozo_exception')}")
    channel_title = feed.feed.get("title", "") if feed.get("feed") else ""
    items: list[Item] = []
    for entry in feed.entries:
        link = entry.get("link") or ""
        title = html_to_text(entry.get("title", "")).strip()
        if not link or not title:
            continue
        published = entry_datetime(entry)
        if since and published and published < since:
            continue
        source = _entry_source(entry, provider, fallback_source or channel_title)
        if provider == "bing":
            link = unwrap_bing(link)
        if provider == "google":
            title = strip_publisher_suffix(title, source)
        summary_html = entry.get("summary", "")
        if entry.get("content"):
            body = max((c.get("value", "") for c in entry["content"]), key=len)
            if len(body) > len(summary_html):
                summary_html = body
        summary = html_to_text(summary_html)
        if provider == "google":
            # Google's description just repeats the headline and publisher.
            summary = ""
        items.append(Item(
            sector=sector, kind="news", title=title, url=link, source=source,
            published=published, summary=summary, provider=provider,
        ))
    items.sort(key=lambda i: i.published or datetime.min.replace(tzinfo=timezone.utc),
               reverse=True)
    return items


def resolve_google_links(items: list[Item], timeout: float = 10.0) -> int:
    """Swap opaque news.google.com links for publisher URLs so full text can be
    fetched. Uses the optional `googlenewsdecoder` package; returns how many
    links were resolved."""
    pending = [i for i in items if "news.google.com" in urlsplit(i.url).netloc]
    if not pending:
        return 0
    try:
        from googlenewsdecoder import gnewsdecoder
    except ImportError:
        log.info("googlenewsdecoder not installed; Google News items keep headline only")
        return 0
    resolved = 0
    for item in pending:
        try:
            result = gnewsdecoder(item.url, interval=1, timeout=timeout)
        except Exception as exc:  # third-party scraper: never let it break a run
            log.debug("Google News decode failed for %s: %s", item.url, exc)
            continue
        ok = result.get("success", result.get("status")) if isinstance(result, dict) else False
        url = result.get("decoded_url") if ok else None
        if url and url.startswith("http"):
            item.url = url
            resolved += 1
    return resolved


def collect_news(sector: Sector, settings: Settings, fetcher: Fetcher,
                 since: datetime) -> list[Item]:
    found: list[Item] = []
    for query in sector.news_queries:
        for provider in settings.news_providers:
            if provider == "google":
                url = google_news_url(query, settings.lookback_days, settings.language,
                                      settings.country)
            else:
                url = bing_news_url(query, settings.language, settings.country)
            try:
                resp = fetcher.get(url)
                batch = parse_news_feed(resp.content, sector=sector.key, provider=provider,
                                        since=since)
            except (FetchError, ValueError) as exc:
                log.warning("[%s] %s news search failed for %r: %s",
                            sector.key, provider, query, exc)
                continue
            log.info("[%s] %s: %d results for %r", sector.key, provider, len(batch), query)
            found.extend(batch[: settings.max_news_per_query])

    for feed_url in sector.rss_feeds:
        try:
            resp = fetcher.get(feed_url)
            batch = parse_news_feed(resp.content, sector=sector.key, provider="rss",
                                    fallback_source=urlsplit(feed_url).netloc, since=since)
        except (FetchError, ValueError) as exc:
            log.warning("[%s] feed failed %s: %s", sector.key, feed_url, exc)
            continue
        log.info("[%s] feed %s: %d recent items", sector.key, feed_url, len(batch))
        found.extend(batch[: settings.max_items_per_feed])
    return found
