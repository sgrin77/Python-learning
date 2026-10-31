"""Text helpers: HTML to text, transcript parsing, article extraction, and a
keyword heuristic used when no Claude API key is configured."""

from __future__ import annotations

import html
import json
import logging
import re
from html.parser import HTMLParser

log = logging.getLogger(__name__)

_BLOCK_TAGS = {
    "p", "div", "br", "li", "ul", "ol", "h1", "h2", "h3", "h4", "h5", "h6",
    "section", "article", "blockquote", "tr", "table", "hr", "pre",
}
_SKIP_TAGS = {"script", "style", "noscript", "template", "svg"}


class _Stripper(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.parts: list[str] = []
        self._skip = 0

    def handle_starttag(self, tag, attrs):
        if tag in _SKIP_TAGS:
            self._skip += 1
        elif tag in _BLOCK_TAGS:
            self.parts.append("\n")
        if tag == "li":
            self.parts.append("- ")

    def handle_endtag(self, tag):
        if tag in _SKIP_TAGS and self._skip:
            self._skip -= 1
        elif tag in _BLOCK_TAGS:
            self.parts.append("\n")

    def handle_data(self, data):
        if not self._skip:
            self.parts.append(data)


def html_to_text(markup: str) -> str:
    """Convert a snippet of HTML (feed descriptions, show notes) to plain text."""
    if not markup:
        return ""
    if "<" not in markup:
        return _tidy(html.unescape(markup))
    stripper = _Stripper()
    try:
        stripper.feed(markup)
        stripper.close()
    except Exception:  # malformed markup: fall back to a crude strip
        return _tidy(html.unescape(re.sub(r"<[^>]+>", " ", markup)))
    return _tidy("".join(stripper.parts))


def _tidy(text: str) -> str:
    lines = [re.sub(r"[ \t ]+", " ", ln).strip() for ln in text.splitlines()]
    out: list[str] = []
    for ln in lines:
        if ln or (out and out[-1]):
            out.append(ln)
    return "\n".join(out).strip()


def extract_article(page_html: str, url: str = "") -> str:
    """Main-content extraction for a news article page."""
    try:
        import trafilatura
    except ImportError:  # pragma: no cover - dependency is in requirements.txt
        return html_to_text(page_html)
    # Note: no deduplicate=True. trafilatura's dedupe cache is process-wide, so
    # the same article found for two sectors would come back empty the second time.
    text = trafilatura.extract(
        page_html,
        url=url or None,
        include_comments=False,
        include_tables=True,
        favor_precision=True,
    )
    return _tidy(text or "")


# --- transcripts --------------------------------------------------------------

_TIMESTAMP = re.compile(r"\d{1,2}:\d{2}(?::\d{2})?[.,]\d{1,3}\s*-->")
_VOICE = re.compile(r"<v(?:\.[^ >]*)?\s+([^>]+)>")


def _cue_text_to_paragraphs(cues: list[tuple[str | None, str]]) -> str:
    """Merge consecutive cues by speaker into readable paragraphs."""
    paragraphs: list[str] = []
    current_speaker: str | None = None
    buffer: list[str] = []
    last_line = None

    def flush():
        if buffer:
            body = " ".join(buffer)
            paragraphs.append(f"{current_speaker}: {body}" if current_speaker else body)

    for speaker, line in cues:
        line = line.strip()
        if not line or line == last_line:
            continue
        last_line = line
        if speaker != current_speaker and (speaker or buffer):
            flush()
            buffer = []
            current_speaker = speaker
        buffer.append(line)
        if not speaker and len(buffer) >= 12:  # keep anonymous text in chunks
            flush()
            buffer = []
    flush()
    return "\n\n".join(paragraphs)


def parse_vtt(text: str) -> str:
    cues: list[tuple[str | None, str]] = []
    blocks = re.split(r"\n\s*\n", text.replace("\r\n", "\n").replace("\r", "\n"))
    for block in blocks:
        lines = [ln for ln in block.split("\n") if ln.strip()]
        if not lines:
            continue
        head = lines[0].strip()
        if head.startswith(("WEBVTT", "NOTE", "STYLE", "REGION")):
            continue
        # drop optional cue identifier and the timing line
        while lines and not _TIMESTAMP.search(lines[0]):
            lines = lines[1:]
        lines = lines[1:]
        for ln in lines:
            speaker = None
            m = _VOICE.search(ln)
            if m:
                speaker = m.group(1).strip()
            clean = html.unescape(re.sub(r"<[^>]+>", "", ln)).strip()
            if clean:
                cues.append((speaker, clean))
    return _cue_text_to_paragraphs(cues)


def parse_srt(text: str) -> str:
    cues: list[tuple[str | None, str]] = []
    blocks = re.split(r"\n\s*\n", text.replace("\r\n", "\n").replace("\r", "\n"))
    for block in blocks:
        lines = [ln for ln in block.split("\n") if ln.strip()]
        while lines and not _TIMESTAMP.search(lines[0]):
            lines = lines[1:]
        for ln in lines[1:]:
            clean = html.unescape(re.sub(r"<[^>]+>", "", ln)).strip()
            speaker = None
            m = re.match(r"^([A-Z][\w .'-]{1,40}):\s+(.*)$", clean)
            if m:
                speaker, clean = m.group(1), m.group(2)
            if clean:
                cues.append((speaker, clean))
    return _cue_text_to_paragraphs(cues)


def parse_json_transcript(text: str) -> str:
    """Podcasting 2.0 JSON transcript: {"segments": [{"speaker", "body"}...]}."""
    data = json.loads(text)
    segments = data.get("segments", []) if isinstance(data, dict) else data
    cues = [
        (seg.get("speaker") or None, str(seg.get("body", "")))
        for seg in segments
        if isinstance(seg, dict)
    ]
    return _cue_text_to_paragraphs(cues)


_TRANSCRIPT_PREFERENCE = [
    "application/json",
    "text/vtt",
    "application/x-subrip",
    "application/srt",
    "text/srt",
    "text/plain",
    "text/html",
]


def transcript_rank(mime: str) -> int:
    mime = (mime or "").lower().split(";")[0].strip()
    return _TRANSCRIPT_PREFERENCE.index(mime) if mime in _TRANSCRIPT_PREFERENCE else len(
        _TRANSCRIPT_PREFERENCE
    )


def transcript_to_text(content: str, mime: str, url: str = "") -> str:
    mime = (mime or "").lower().split(";")[0].strip()
    lowered = url.lower().split("?")[0]
    try:
        if mime == "application/json" or lowered.endswith(".json"):
            return parse_json_transcript(content)
        if mime == "text/vtt" or lowered.endswith(".vtt") or content.lstrip().startswith("WEBVTT"):
            return parse_vtt(content)
        if "srt" in mime or "subrip" in mime or lowered.endswith(".srt"):
            return parse_srt(content)
    except (ValueError, KeyError, TypeError) as exc:
        log.debug("Transcript parse failed for %s: %s", url, exc)
    if mime == "text/html" or "<p" in content[:2000].lower():
        return html_to_text(content)
    return _tidy(content)


# --- size control -------------------------------------------------------------

def clip(text: str, max_chars: int) -> tuple[str, bool]:
    """Keep the head and tail of very long text. Returns (text, was_clipped)."""
    if len(text) <= max_chars:
        return text, False
    head = int(max_chars * 0.75)
    tail = max_chars - head
    marker = "\n\n[... middle of the transcript/article omitted for length ...]\n\n"
    return text[:head] + marker + text[-tail:], True


# --- heuristic extraction (no API key) -----------------------------------------

_CUES = [
    (r"\bbest practices?\b", 3), (r"\bwe recommend\b", 3), (r"\brecommend(s|ed)?\b", 2),
    (r"\bthe key (is|was|to)\b", 3), (r"\blessons?\b", 2), (r"\bmake sure\b", 2),
    (r"\bstart (by|with)\b", 2), (r"\bshould\b", 1), (r"\bavoid\b", 2), (r"\bdon'?t\b", 1),
    (r"\bthe trick\b", 2), (r"\bwhat works\b", 2), (r"\bfocus on\b", 2), (r"\bplaybook\b", 2),
    (r"\bstep \d\b", 2), (r"\bframework\b", 1), (r"\bmistakes?\b", 2), (r"\btip\b", 2),
    (r"\d+(\.\d+)?\s?%", 1), (r"\$\d", 1), (r"\b(always|never)\b", 1),
]
_SENTENCE_SPLIT = re.compile(r"(?<=[.!?])\s+(?=[A-Z0-9\"'])")


def advice_sentences(text: str, limit: int = 3) -> list[str]:
    """Pick the sentences that read most like actionable advice."""
    scored: list[tuple[int, int, str]] = []
    seen: set[str] = set()
    for idx, sentence in enumerate(_SENTENCE_SPLIT.split(" ".join(text.split()))):
        sentence = sentence.strip()
        if not 35 <= len(sentence) <= 400:
            continue
        key = sentence.lower()[:80]
        if key in seen:
            continue
        seen.add(key)
        score = sum(w for pat, w in _CUES if re.search(pat, sentence, re.I))
        if score >= 2:
            scored.append((score, -idx, sentence))
    scored.sort(reverse=True)
    picked = sorted(scored[:limit], key=lambda t: -t[1])  # restore reading order
    return [s for _, _, s in picked]
