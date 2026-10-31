from pathlib import Path
from types import SimpleNamespace

import pytest
from conftest import ROOT, FakeLLM

from sector_scout.analyze import ItemExtraction, Practice
from sector_scout.config import ConfigError, load_config, parse_config
from sector_scout.emailer import EmailConfigError, SmtpSettings, build_message
from sector_scout.llm import FALLBACK_BETA, ClaudeLLM, LLMError, Refused
from sector_scout.models import Item
from sector_scout.store import Store


# --- config -------------------------------------------------------------------

def test_shipped_config_loads():
    cfg = load_config(ROOT / "sectors.yaml")
    assert len(cfg.sectors) >= 3
    assert cfg.settings.extract_model == "claude-opus-5-5"
    for s in cfg.sectors.values():
        assert s.news_queries and s.focus


def test_config_validation():
    with pytest.raises(ConfigError, match="Unknown setting"):
        parse_config({"settings": {"nope": 1}, "sectors": {"a": {}}}, Path("."))
    with pytest.raises(ConfigError, match="news provider"):
        parse_config({"settings": {"news_providers": ["yahoo"]}, "sectors": {"a": {}}}, Path("."))
    with pytest.raises(ConfigError, match="at least one"):
        parse_config({"sectors": {}}, Path("."))
    cfg = parse_config({"sectors": {"my_sector": {"news_queries": "one query"}}}, Path("/tmp"))
    assert cfg.sectors["my_sector"].name == "My Sector"
    assert cfg.sectors["my_sector"].news_queries == ["one query"]
    with pytest.raises(ConfigError, match="Unknown sector"):
        cfg.select(["missing"])


# --- store --------------------------------------------------------------------

def _practice(title="Walk every unit", tags=("diligence",)):
    return Practice(title=title, practice="Inspect all units.", why_it_works="Rent rolls lie.",
                    how_to_apply=["Walk 100%"], evidence="75% vs 52%", tags=list(tags),
                    confidence="high")


def test_store_roundtrip_cache_and_search(tmp_path):
    store = Store(tmp_path / "kb.db")
    item = Item(sector="re", kind="news", title="Rent rolls", url="https://x.com/a", source="X",
                text="body")
    store.upsert_item(item)
    assert store.cached_extraction(item.id, "claude-opus-5-5") is None
    ext = ItemExtraction(relevant=True, summary="S", practices=[_practice()])
    store.save_extraction(item, ext, "claude-opus-5-5")

    cached = store.cached_extraction(item.id, "claude-opus-5-5")
    assert cached == ext
    assert store.cached_extraction(item.id, "heuristic") is None  # other analyzer re-runs

    # Re-saving replaces (not duplicates) practices
    store.save_extraction(item, ext, "claude-opus-5-5")
    assert store.stats() == {"items": 1, "analyzed": 1, "practices": 1}

    hits = store.search("walk units")
    assert hits and hits[0]["title"] == "Walk every unit" and hits[0]["url"] == "https://x.com/a"
    assert store.search("walk", sector="other") == []

    store.has_fts = False  # LIKE fallback path
    assert store.search("diligence")[0]["title"] == "Walk every unit"


# --- Claude wrapper -------------------------------------------------------------------

class _Stream:
    def __init__(self, message):
        self.message = message

    def __enter__(self):
        return self

    def __exit__(self, *exc):
        return False

    def get_final_message(self):
        return self.message


class _Client:
    def __init__(self, message):
        self.kwargs = None
        self.beta = SimpleNamespace(messages=SimpleNamespace(stream=self._stream))
        self.message = message

    def _stream(self, **kwargs):
        self.kwargs = kwargs
        return _Stream(self.message)


def _message(stop_reason="end_turn", parsed="PARSED", model="claude-opus-5-5"):
    usage = SimpleNamespace(input_tokens=1000, output_tokens=200, cache_read_input_tokens=0,
                            cache_creation_input_tokens=0)
    return SimpleNamespace(model=model, usage=usage, stop_reason=stop_reason,
                           stop_details=SimpleNamespace(category="cyber"), parsed_output=parsed)


def test_claude_llm_sends_schema_effort_and_fallbacks():
    client = _Client(_message())
    llm = ClaudeLLM(client=client)
    out = llm.structured(model="claude-opus-5-5", effort="low", system="sys", user="doc",
                         schema=ItemExtraction)
    assert out == "PARSED"
    kw = client.kwargs
    assert kw["output_format"] is ItemExtraction
    assert kw["output_config"] == {"effort": "low"}
    assert kw["fallbacks"] == "default" and kw["betas"] == [FALLBACK_BETA]
    assert kw["messages"] == [{"role": "user", "content": "doc"}]
    assert "1 calls" in llm.usage.summary() and "$0.01" in llm.usage.summary()


def test_claude_llm_no_fallbacks_for_haiku():
    client = _Client(_message(model="claude-haiku-5-5"))
    ClaudeLLM(client=client).structured(model="claude-haiku-5-5", effort="low", system="s",
                                        user="u", schema=ItemExtraction)
    assert "fallbacks" not in client.kwargs and "betas" not in client.kwargs


@pytest.mark.parametrize("stop_reason,parsed,exc", [
    ("refusal", None, Refused), ("max_tokens", None, LLMError), ("end_turn", None, LLMError),
])
def test_claude_llm_errors(stop_reason, parsed, exc):
    llm = ClaudeLLM(client=_Client(_message(stop_reason=stop_reason, parsed=parsed)))
    with pytest.raises(exc):
        llm.structured(model="claude-opus-5-5", effort="low", system="s", user="u",
                       schema=ItemExtraction)
    assert llm.usage.by_model["claude-opus-5-5"].calls == 1  # billed calls still counted


def test_fake_llm_matches_protocol():
    assert FakeLLM().structured(model="m", effort="low", system="", user="walk every unit",
                                schema=ItemExtraction).practices


# --- email -----------------------------------------------------------------------------

def test_email_settings_and_message():
    with pytest.raises(EmailConfigError, match="SMTP_HOST"):
        SmtpSettings.from_env({})
    smtp = SmtpSettings.from_env({"SMTP_HOST": "smtp.example.com", "SMTP_USER": "me@x.com",
                                  "SMTP_PASSWORD": "pw", "DIGEST_TO": "a@x.com, b@x.com"})
    assert smtp.port == 587 and smtp.sender == "me@x.com"
    assert smtp.recipients == ["a@x.com", "b@x.com"]
    msg = build_message("Subj", "# md", "<h1>html</h1>", smtp.sender, smtp.recipients)
    assert msg["To"] == "a@x.com, b@x.com"
    assert [p.get_content_type() for p in msg.iter_parts()] == ["text/plain", "text/html"]
