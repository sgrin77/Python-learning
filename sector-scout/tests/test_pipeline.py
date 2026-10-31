import httpx2
import pytest
from conftest import ARTICLE_URL, NOW, FakeFetcher, FakeLLM

import anthropic
from sector_scout.config import parse_config
from sector_scout.llm import LLMError
from sector_scout.pipeline import RunOptions, run
from sector_scout.store import Store


def make_config(tmp_path):
    raw = {
        "settings": {
            "lookback_days": 7,
            "request_delay_seconds": 0,
            "max_podcasts_per_term": 2,
            "max_episodes_per_podcast": 2,
            "output_dir": str(tmp_path / "digests"),
            "db_path": str(tmp_path / "kb.db"),
            "max_workers": 2,
        },
        "sectors": {
            "real_estate": {
                "name": "Real Estate & Multifamily",
                "focus": "Apartment operators.",
                "news_queries": ["multifamily operations"],
                "podcast_search_terms": ["multifamily"],
            },
            "second": {
                "name": "Second Sector",
                "news_queries": ["anything"],
                "podcast_search_terms": ["anything"],
            },
        },
    }
    return parse_config(raw, tmp_path)


def _run(tmp_path, llm, fetcher=None, store=None, **opts):
    cfg = make_config(tmp_path)
    store = store or Store(tmp_path / "kb.db")
    return run(cfg, RunOptions(**opts), llm=llm, fetcher=fetcher or FakeFetcher(), store=store,
               now=NOW)


def test_full_run_with_claude(tmp_path):
    llm, fetcher = FakeLLM(), FakeFetcher()
    result = _run(tmp_path, llm, fetcher)
    md_path, html_path = result.paths
    md = md_path.read_text()
    html = html_path.read_text()

    assert md_path.name == "2026-10-31.md"
    assert (tmp_path / "digests" / "latest.html").exists()

    # Collection: old items filtered, the Google+Bing duplicate collapsed
    re_items = [i for i in result.items if i.sector == "real_estate"]
    titles = [i.title for i in re_items]
    assert titles.count("How one operator cut turn times in half") == 1
    assert "Old story outside the window" not in titles
    assert "Ep 70: Too old" not in titles

    # Text: article fetched with robots check; Google redirect links never fetched;
    # podcast used the VTT transcript (preferred over HTML)
    assert (ARTICLE_URL, True) in fetcher.calls
    assert not any("news.google.com/rss/articles" in url for url, _ in fetcher.calls)
    ep88 = next(i for i in re_items if i.title.startswith("Ep 88"))
    assert ep88.text_source == "transcript" and "Sam Guest:" in ep88.text
    ep87 = next(i for i in re_items if i.title.startswith("Ep 87"))
    assert ep87.text_source == "show_notes"

    # Claude calls: 3 analyzable items per sector, 1 synthesis per sector, 1 cross-sector
    schemas = [c["schema"] for c in llm.calls]
    assert schemas.count("ItemExtraction") == 6
    assert schemas.count("SectorBrief") == 2
    assert schemas.count("CrossSectorIdeas") == 1
    extract_call = next(c for c in llm.calls if "walk every" in c["user"].lower())
    assert extract_call["effort"] == "low" and extract_call["model"] == "claude-opus-5-5"
    assert "untrusted" in extract_call["system"]
    assert '<document kind="news article"' in extract_call["user"]

    # Digest: citations point at the real sources; out-of-range citations dropped
    assert "**1. Walk every unit before closing** · strong" in md
    assert f"[[2]]({ARTICLE_URL})" in md
    assert "[[99]]" not in md and "[[0]]" not in md
    assert "1. [Ep 88: Resident retention playbook](https://example-pod.com)" in md
    assert "podcast, transcript" in md
    assert "Also scanned, nothing actionable" in md
    assert "Cross-sector ideas" in md and "Made Up Sector" not in md
    assert "<script" not in html and "Walk every unit before closing" in html


def test_rerun_uses_cache(tmp_path):
    store = Store(tmp_path / "kb.db")
    _run(tmp_path, FakeLLM(), store=store)
    llm2, fetcher2 = FakeLLM(), FakeFetcher()
    result = _run(tmp_path, llm2, fetcher2, store=store)
    schemas = [c["schema"] for c in llm2.calls]
    assert schemas.count("ItemExtraction") == 0
    assert schemas.count("SectorBrief") == 2
    assert (ARTICLE_URL, True) not in fetcher2.calls
    md = result.paths[0].read_text()
    assert "Walk every unit before closing" in md
    assert "podcast, transcript" in md  # text source restored from the knowledge base


def test_keyword_mode_without_llm(tmp_path):
    result = _run(tmp_path, llm=None)
    md = result.paths[0].read_text()
    assert "keyword highlights" in md.lower()
    assert "always walk every unit before you close" in md
    assert "Cross-sector ideas" not in md


def test_dry_run_writes_nothing(tmp_path):
    llm = FakeLLM()
    result = _run(tmp_path, llm, dry_run=True)
    assert result.paths is None and llm.calls == []
    assert "items collected" in result.estimate and "$" in result.estimate
    assert not (tmp_path / "digests").exists()


def test_failed_item_is_skipped_and_noted(tmp_path):
    llm = FakeLLM(fail_on="walk every", exc=LLMError("Response hit max_tokens"))
    md = _run(tmp_path, llm).paths[0].read_text()
    assert "1 item(s) could not be analyzed" in md
    assert "Ep 88" in md  # the rest of the run still produced a digest


def test_synthesis_failure_falls_back_to_highlights(tmp_path):
    llm = FakeLLM(fail_on="<sources>", exc=LLMError("boom"))
    md = _run(tmp_path, llm).paths[0].read_text()
    assert "Claude synthesis failed" in md
    assert "Send renewal offers at 120 days" in md


def test_bad_api_key_aborts_run(tmp_path):
    request = httpx2.Request("POST", "https://api.anthropic.com/v1/messages")
    exc = anthropic.AuthenticationError("invalid x-api-key",
                                        response=httpx2.Response(401, request=request), body=None)
    with pytest.raises(anthropic.AuthenticationError):
        _run(tmp_path, FakeLLM(fail_on="120 days", exc=exc))


def test_max_items_caps_collection(tmp_path):
    result = _run(tmp_path, FakeLLM(), max_items=2)
    assert len(result.items) == 2
    assert {i.sector for i in result.items} == {"real_estate", "second"}
