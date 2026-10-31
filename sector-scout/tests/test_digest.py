from datetime import timedelta

from conftest import NOW

from sector_scout.analyze import BriefPractice, SectorBrief
from sector_scout.config import Sector
from sector_scout.digest import DigestData, SectorReport, render_html, render_markdown
from sector_scout.models import Item


def _data():
    item = Item(sector="s", kind="news", title="Odd [title] <script>x</script>",
                url="https://e.com/a?x=1&y=2", source="E", published=NOW, text_source="article")
    brief = SectorBrief(
        headline="Theme <b>bold</b>",
        top_practices=[BriefPractice(title="Do <it>", what_to_do="Now & then",
                                     why_it_matters="", how_to_start=[], strength="emerging",
                                     sources=[1])],
        signals=[], pitfalls=[],
    )
    report = SectorReport(sector=Sector(key="s", name="Sector & Co"), brief=brief,
                          sources=[item], other_items=[])
    empty = SectorReport(sector=Sector(key="t", name="Quiet"), brief=None, sources=[],
                         other_items=[])
    return DigestData(generated=NOW, since=NOW - timedelta(days=7), reports=[report, empty])


def test_markdown_escapes_link_text_and_handles_empty_sector():
    md = render_markdown(_data())
    assert "[Odd \\[title\\] <script>x</script>](https://e.com/a?x=1&y=2)" in md
    assert "Oct 24 to Oct 31, 2026" in md
    assert "1 sources scanned (1 articles, 0 podcast episodes)" in md
    assert "No actionable practices found" in md
    assert "\u2014" not in md  # house style: no em dashes


def test_html_escapes_everything():
    page = render_html(_data())
    assert "<script>x</script>" not in page
    assert "&lt;script&gt;" in page
    assert "Theme &lt;b&gt;bold&lt;/b&gt;" in page
    assert "href='https://e.com/a?x=1&amp;y=2'" in page
    assert "<span class='badge emerging'>emerging</span>" in page
    assert "\u2014" not in page
