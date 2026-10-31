"""Render the digest as Markdown and as a self-contained HTML page."""

from __future__ import annotations

import html
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path

from .analyze import CrossIdea, SectorBrief
from .config import Sector
from .models import Item

_SOURCE_LABEL = {
    "article": "article",
    "transcript": "podcast, transcript",
    "audio": "podcast, transcribed audio",
    "show_notes": "podcast, show notes",
    "snippet": "news snippet",
}


@dataclass
class SectorReport:
    sector: Sector
    brief: SectorBrief | None
    sources: list[Item]  # cited list: sources[n-1] is citation [n]
    other_items: list[Item]  # scanned, nothing actionable (or too little text)
    failed: int = 0


@dataclass
class DigestData:
    generated: datetime
    since: datetime
    reports: list[SectorReport]
    cross_ideas: list[CrossIdea] = field(default_factory=list)
    usage_summary: str = ""
    heuristic: bool = False
    notes: list[str] = field(default_factory=list)

    @property
    def all_items(self) -> list[Item]:
        return [i for r in self.reports for i in r.sources + r.other_items]


def _period(d: DigestData) -> str:
    return f"{d.since:%b %d} to {d.generated:%b %d, %Y}"


def _counts(d: DigestData) -> str:
    items = d.all_items
    news = sum(1 for i in items if i.kind == "news")
    pods = len(items) - news
    return (f"{len(d.reports)} sectors · {len(items)} sources scanned "
            f"({news} articles, {pods} podcast episodes)")


def _source_meta(item: Item) -> str:
    label = _SOURCE_LABEL.get(item.text_source, item.kind)
    if item.truncated:
        label += ", clipped for length"
    return f"{item.source} · {label} · {item.date_label}"


# --- Markdown -------------------------------------------------------------------------

def _md_escape(text: str) -> str:
    return text.replace("[", "\\[").replace("]", "\\]")


def _md_cites(nums: list[int], sources: list[Item]) -> str:
    return "".join(f"[[{n}]]({sources[n - 1].url})" for n in nums if 0 < n <= len(sources))


def render_markdown(d: DigestData) -> str:
    out = [f"# Sector Scout: best practices", "",
           f"**{_period(d)}** · {_counts(d)}", ""]
    if d.heuristic:
        out += ["> Running without a Claude API key, so these are keyword highlights. "
                "Set `ANTHROPIC_API_KEY` for ranked, deduplicated practices.", ""]
    for note in d.notes:
        out += [f"> {note}", ""]
    out += ["**Sectors:** " + " · ".join(r.sector.name for r in d.reports), ""]

    for r in d.reports:
        out += ["---", "", f"## {r.sector.name}", ""]
        b = r.brief
        if b is None:
            out += ["_No actionable practices found in this period's sources._", ""]
        else:
            if b.headline:
                out += [f"_{b.headline}_", ""]
            if b.top_practices:
                out += ["### Top practices", ""]
            for n, p in enumerate(b.top_practices, start=1):
                cites = _md_cites(p.sources, r.sources)
                out.append(f"**{n}. {p.title}** · {p.strength} {cites}".rstrip())
                out.append("")
                out.append(p.what_to_do)
                if p.why_it_matters:
                    out += ["", f"*Why it matters:* {p.why_it_matters}"]
                if p.how_to_start:
                    out += ["", "*First steps:*"] + [f"- {s}" for s in p.how_to_start]
                out.append("")
            for heading, points in (("Signals to watch", b.signals),
                                    ("Pitfalls to avoid", b.pitfalls)):
                if points:
                    out += [f"### {heading}", ""]
                    out += [f"- {pt.text} {_md_cites(pt.sources, r.sources)}".rstrip()
                            for pt in points]
                    out.append("")
        if r.sources:
            out += ["### Sources", ""]
            for n, item in enumerate(r.sources, start=1):
                out.append(f"{n}. [{_md_escape(item.title)}]({item.url}) · {_source_meta(item)}")
            out.append("")
        if r.other_items:
            shown = r.other_items[:12]
            more = len(r.other_items) - len(shown)
            links = " · ".join(f"[{_md_escape(i.title)}]({i.url})" for i in shown)
            tail = f" · and {more} more" if more > 0 else ""
            out += [f"<sub>Also scanned, nothing actionable: {links}{tail}</sub>", ""]

    if d.cross_ideas:
        out += ["---", "", "## Cross-sector ideas", ""]
        for idea in d.cross_ideas:
            out.append(f"- **From {idea.from_sector} to {idea.to_sector}:** {idea.idea} "
                       f"*First step:* {idea.how_to_adapt}")
        out.append("")

    out += ["---", "", f"<sub>Generated {d.generated:%Y-%m-%d %H:%M} UTC by Sector Scout. "
            f"{d.usage_summary}</sub>", ""]
    return "\n".join(out)


# --- HTML ---------------------------------------------------------------------------------

_CSS = """
:root{--bg:#f7f7f5;--card:#fff;--ink:#1d1d1b;--muted:#5f6368;--line:#e3e3df;
--accent:#1f5f8b;--strong:#1e7a46;--emerging:#9a6b00;--anecdotal:#7a7a7a}
@media (prefers-color-scheme:dark){:root{--bg:#141414;--card:#1e1e1e;--ink:#ececec;
--muted:#a0a0a0;--line:#333;--accent:#7cb7e0;--strong:#5fcf8f;--emerging:#e0b24f;--anecdotal:#9a9a9a}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);
font:16px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}
main{max-width:760px;margin:0 auto;padding:24px 16px 48px}
h1{font-size:1.6rem;margin:0 0 4px}
h2{font-size:1.3rem;margin:40px 0 6px;padding-top:12px;border-top:2px solid var(--line)}
h3{font-size:.95rem;text-transform:uppercase;letter-spacing:.04em;color:var(--muted);margin:24px 0 8px}
a{color:var(--accent)}
.meta{color:var(--muted);font-size:.9rem;margin:0 0 16px}
.note{background:var(--card);border-left:4px solid var(--emerging);padding:10px 14px;margin:12px 0;font-size:.95rem}
.toc a{margin-right:12px;white-space:nowrap}
.theme{font-style:italic;margin:4px 0 12px}
.card{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:14px 16px;margin:12px 0}
.card h4{margin:0 0 6px;font-size:1.05rem}
.card p{margin:6px 0}
.card ul{margin:4px 0 0;padding-left:20px}
.badge{display:inline-block;font-size:.72rem;font-weight:600;text-transform:uppercase;
letter-spacing:.05em;border:1px solid currentColor;border-radius:999px;padding:1px 8px;margin-left:6px;vertical-align:2px}
.strong{color:var(--strong)}.emerging{color:var(--emerging)}.anecdotal{color:var(--anecdotal)}
.cite{font-size:.85rem;text-decoration:none;margin-left:2px}
.label{font-weight:600}
ol.sources{padding-left:22px;font-size:.92rem}
ol.sources li{margin:4px 0}
.small{font-size:.85rem;color:var(--muted)}
footer{margin-top:40px;font-size:.8rem;color:var(--muted)}
"""


def _e(text: str) -> str:
    return html.escape(text or "", quote=True)


def _h_cites(nums: list[int], sources: list[Item]) -> str:
    return "".join(
        f'<a class="cite" href="{_e(sources[n - 1].url)}">[{n}]</a>'
        for n in nums if 0 < n <= len(sources)
    )


def render_html(d: DigestData) -> str:
    h: list[str] = [
        "<!doctype html><html lang='en'><head><meta charset='utf-8'>",
        "<meta name='viewport' content='width=device-width,initial-scale=1'>",
        f"<title>Sector Scout {_e(f'{d.generated:%Y-%m-%d}')}</title>",
        f"<style>{_CSS}</style></head><body><main>",
        "<h1>Sector Scout: best practices</h1>",
        f"<p class='meta'><strong>{_e(_period(d))}</strong> · {_e(_counts(d))}</p>",
    ]
    if d.heuristic:
        h.append("<p class='note'>Running without a Claude API key, so these are keyword "
                 "highlights. Set <code>ANTHROPIC_API_KEY</code> for ranked, deduplicated "
                 "practices.</p>")
    for note in d.notes:
        h.append(f"<p class='note'>{_e(note)}</p>")
    h.append("<p class='toc'>" + "".join(
        f"<a href='#{_e(r.sector.key)}'>{_e(r.sector.name)}</a>" for r in d.reports) + "</p>")

    for r in d.reports:
        h.append(f"<h2 id='{_e(r.sector.key)}'>{_e(r.sector.name)}</h2>")
        b = r.brief
        if b is None:
            h.append("<p class='small'>No actionable practices found in this period's "
                     "sources.</p>")
        else:
            if b.headline:
                h.append(f"<p class='theme'>{_e(b.headline)}</p>")
            if b.top_practices:
                h.append("<h3>Top practices</h3>")
            for n, p in enumerate(b.top_practices, start=1):
                h.append("<div class='card'>")
                h.append(f"<h4>{n}. {_e(p.title)}<span class='badge {_e(p.strength)}'>"
                         f"{_e(p.strength)}</span>{_h_cites(p.sources, r.sources)}</h4>")
                h.append(f"<p>{_e(p.what_to_do)}</p>")
                if p.why_it_matters:
                    h.append(f"<p><span class='label'>Why it matters:</span> "
                             f"{_e(p.why_it_matters)}</p>")
                if p.how_to_start:
                    h.append("<p class='label'>First steps:</p><ul>" + "".join(
                        f"<li>{_e(s)}</li>" for s in p.how_to_start) + "</ul>")
                h.append("</div>")
            for heading, points in (("Signals to watch", b.signals),
                                    ("Pitfalls to avoid", b.pitfalls)):
                if points:
                    h.append(f"<h3>{heading}</h3><ul>" + "".join(
                        f"<li>{_e(pt.text)} {_h_cites(pt.sources, r.sources)}</li>"
                        for pt in points) + "</ul>")
        if r.sources:
            h.append("<h3>Sources</h3><ol class='sources'>" + "".join(
                f"<li><a href='{_e(i.url)}'>{_e(i.title)}</a> "
                f"<span class='small'>· {_e(_source_meta(i))}</span></li>"
                for i in r.sources) + "</ol>")
        if r.other_items:
            h.append("<p class='small'>Also scanned, nothing actionable: " + " · ".join(
                f"<a href='{_e(i.url)}'>{_e(i.title)}</a>" for i in r.other_items[:12])
                + (f" · and {len(r.other_items) - 12} more" if len(r.other_items) > 12 else "")
                + "</p>")

    if d.cross_ideas:
        h.append("<h2 id='cross'>Cross-sector ideas</h2>")
        for idea in d.cross_ideas:
            h.append(f"<div class='card'><h4>From {_e(idea.from_sector)} to "
                     f"{_e(idea.to_sector)}</h4><p>{_e(idea.idea)}</p>"
                     f"<p><span class='label'>First step:</span> {_e(idea.how_to_adapt)}</p>"
                     "</div>")

    h.append(f"<footer>Generated {d.generated:%Y-%m-%d %H:%M} UTC by Sector Scout. "
             f"{_e(d.usage_summary)}</footer></main></body></html>")
    return "\n".join(h)


def write_digest(d: DigestData, out_dir: Path) -> tuple[Path, Path]:
    out_dir.mkdir(parents=True, exist_ok=True)
    stem = f"{d.generated:%Y-%m-%d}"
    md_path, html_path = out_dir / f"{stem}.md", out_dir / f"{stem}.html"
    md, page = render_markdown(d), render_html(d)
    md_path.write_text(md, encoding="utf-8")
    html_path.write_text(page, encoding="utf-8")
    (out_dir / "latest.md").write_text(md, encoding="utf-8")
    (out_dir / "latest.html").write_text(page, encoding="utf-8")
    return md_path, html_path
