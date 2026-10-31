"""Core data types shared across the pipeline."""

from __future__ import annotations

import hashlib
import re
from dataclasses import dataclass, field
from datetime import datetime
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

# Query parameters that only track clicks; dropping them lets the same article
# found through two providers dedupe to one id.
_TRACKING_PARAMS = re.compile(r"^(utm_|fbclid$|gclid$|mc_cid$|mc_eid$|ref$|ocid$|cmpid$)")


def canonical_url(url: str) -> str:
    parts = urlsplit(url.strip())
    query = [(k, v) for k, v in parse_qsl(parts.query, keep_blank_values=True)
             if not _TRACKING_PARAMS.match(k.lower())]
    path = parts.path.rstrip("/") or "/"
    return urlunsplit((parts.scheme.lower(), parts.netloc.lower(), path, urlencode(query), ""))


def normalize_title(title: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", title.lower()).strip()


@dataclass
class Item:
    """One article or podcast episode found for a sector."""

    sector: str
    kind: str  # "news" or "podcast"
    title: str
    url: str
    source: str  # publisher or show name
    published: datetime | None = None
    summary: str = ""  # short text from the feed itself
    text: str = ""  # full article text, transcript, or show notes
    text_source: str = ""  # article | transcript | audio | show_notes | snippet
    truncated: bool = False
    audio_url: str = ""
    transcripts: list[tuple[str, str]] = field(default_factory=list)  # (url, mime)
    provider: str = ""  # google | bing | rss | podcast
    guid: str = ""  # podcast episode guid; many feeds reuse one <link> for every episode
    # Fixed at discovery time so later URL changes (e.g. resolving a Google News
    # redirect to the publisher URL) do not change the cache key.
    id: str = field(init=False)

    def __post_init__(self) -> None:
        if self.guid:
            key = f"guid:{self.source}|{self.guid}"
        elif self.url:
            key = canonical_url(self.url)
        else:
            key = f"{self.source}|{normalize_title(self.title)}"
        self.id = hashlib.sha1(f"{self.sector}|{key}".encode()).hexdigest()[:16]

    @property
    def dedupe_key(self) -> str:
        title = normalize_title(self.title)
        return f"news|{title}" if self.kind == "news" else f"pod|{self.source}|{title}"

    @property
    def date_label(self) -> str:
        return self.published.strftime("%b %d, %Y") if self.published else "date unknown"
