"""Podcast discovery (Apple Podcasts directory search) and episode parsing,
including Podcasting 2.0 <podcast:transcript> links."""

from __future__ import annotations

import json
import logging
import xml.etree.ElementTree as ET
from datetime import datetime, timezone

import feedparser

from ..config import Sector, Settings
from ..fetcher import FetchError, Fetcher
from ..models import Item
from ..textutil import html_to_text, transcript_rank
from .news import entry_datetime

log = logging.getLogger(__name__)

ITUNES_SEARCH_URL = "https://itunes.apple.com/search"


def itunes_search(fetcher: Fetcher, term: str, limit: int, country: str = "US") -> list[dict]:
    """Find podcast shows for a term. Returns [{title, feed_url, author}]."""
    resp = fetcher.get(ITUNES_SEARCH_URL, params={
        "term": term, "media": "podcast", "entity": "podcast",
        "limit": max(limit * 2, limit), "country": country,
    })
    data = json.loads(resp.text)
    shows = []
    for r in data.get("results", []):
        if r.get("feedUrl"):
            shows.append({
                "title": r.get("collectionName") or r.get("trackName") or "",
                "feed_url": r["feedUrl"],
                "author": r.get("artistName") or "",
            })
    return shows[:limit]


def transcripts_by_episode(content: bytes | str) -> list[tuple[str, list[tuple[str, str]]]]:
    """Every <item> in document order as (key, [(transcript_url, mime), ...]).

    feedparser keeps only the last <podcast:transcript>, so read them directly.
    The key is the guid, else the title. Links are not used as keys because many
    feeds give every episode the same <link>."""
    out: list[tuple[str, list[tuple[str, str]]]] = []
    try:
        root = ET.fromstring(content.encode() if isinstance(content, str) else content)
    except ET.ParseError:
        return out
    for item in root.iter("item"):
        found = []
        for el in item:
            tag = el.tag
            if isinstance(tag, str) and tag.endswith("}transcript") and "podcastindex" in tag:
                url = el.get("url")
                if url:
                    found.append((url, el.get("type", "")))
        key = ""
        for key_tag in ("guid", "title"):
            key_el = item.find(key_tag)
            if key_el is not None and key_el.text and key_el.text.strip():
                key = key_el.text.strip()
                break
        out.append((key, found))
    return out


def _audio_url(entry) -> str:
    for enc in entry.get("enclosures", []) or []:
        href = enc.get("href", "")
        if enc.get("type", "").startswith("audio") or href.lower().split("?")[0].endswith(
            (".mp3", ".m4a", ".aac", ".ogg", ".wav")
        ):
            return href
    return ""


def parse_podcast_feed(content: bytes | str, *, sector: str, since: datetime | None,
                       max_episodes: int, show_title: str = "") -> list[Item]:
    feed = feedparser.parse(content)
    if feed.bozo and not feed.entries:
        raise ValueError(f"Unreadable podcast feed: {feed.get('bozo_exception')}")
    show = feed.feed.get("title") or show_title or "Podcast"
    raw_items = transcripts_by_episode(content)
    # Same document order as feedparser when both parsers read the same items;
    # otherwise fall back to matching on guid/title.
    aligned = len(raw_items) == len(feed.entries)
    by_key = {key: found for key, found in raw_items if key}
    items: list[Item] = []
    for index, entry in enumerate(feed.entries):
        published = entry_datetime(entry)
        if since and (published is None or published < since):
            continue
        title = html_to_text(entry.get("title", "")).strip()
        if not title:
            continue
        notes_html = entry.get("summary", "")
        for c in entry.get("content", []) or []:
            if len(c.get("value", "")) > len(notes_html):
                notes_html = c["value"]
        guid = (entry.get("id") or "").strip()
        link = entry.get("link") or ""
        if aligned:
            found = raw_items[index][1]
        else:
            found = by_key.get(guid) or by_key.get(title) or []
        if not found and isinstance(entry.get("podcast_transcript"), dict):
            t = entry["podcast_transcript"]
            if t.get("url"):
                found = [(t["url"], t.get("type", ""))]
        audio = _audio_url(entry)
        items.append(Item(
            sector=sector, kind="podcast", title=title, url=link or audio, source=show,
            published=published, summary=html_to_text(notes_html), audio_url=audio,
            transcripts=sorted(found, key=lambda t: transcript_rank(t[1])),
            provider="podcast", guid=guid or link or audio or title,
        ))
    items.sort(key=lambda i: i.published or datetime.min.replace(tzinfo=timezone.utc),
               reverse=True)
    return items[:max_episodes]


def collect_podcasts(sector: Sector, settings: Settings, fetcher: Fetcher,
                     since: datetime) -> list[Item]:
    feeds: list[tuple[str, str]] = [(u, "") for u in sector.podcast_feeds]
    for term in sector.podcast_search_terms:
        try:
            shows = itunes_search(fetcher, term, settings.max_podcasts_per_term, settings.country)
        except (FetchError, ValueError) as exc:
            log.warning("[%s] podcast search failed for %r: %s", sector.key, term, exc)
            continue
        log.info("[%s] podcasts for %r: %s", sector.key, term,
                 ", ".join(s["title"] for s in shows) or "none")
        feeds.extend((s["feed_url"], s["title"]) for s in shows)

    seen: set[str] = set()
    episodes: list[Item] = []
    for feed_url, label in feeds:
        if feed_url in seen:
            continue
        seen.add(feed_url)
        try:
            resp = fetcher.get(feed_url, max_bytes=30 * 1024 * 1024)
            batch = parse_podcast_feed(resp.content, sector=sector.key, since=since,
                                       max_episodes=settings.max_episodes_per_podcast,
                                       show_title=label)
        except (FetchError, ValueError) as exc:
            log.warning("[%s] podcast feed failed %s: %s", sector.key, feed_url, exc)
            continue
        episodes.extend(batch)
    return episodes
