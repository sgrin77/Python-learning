"""Load and validate sectors.yaml."""

from __future__ import annotations

from dataclasses import dataclass, field, fields
from pathlib import Path
from typing import Any

import yaml

DEFAULT_USER_AGENT = (
    "SectorScout/0.1 (personal research digest; "
    "+https://github.com/sgrin77/Python-learning)"
)


@dataclass
class Settings:
    lookback_days: int = 7
    news_providers: list[str] = field(default_factory=lambda: ["google", "bing"])
    max_news_per_query: int = 6
    max_items_per_feed: int = 5
    max_podcasts_per_term: int = 3
    max_episodes_per_podcast: int = 2
    max_items_per_sector: int = 40
    fetch_full_text: bool = True
    min_text_chars: int = 300
    max_chars_per_item: int = 120_000
    request_delay_seconds: float = 1.0
    respect_robots_txt: bool = True
    language: str = "en"
    country: str = "US"
    user_agent: str = DEFAULT_USER_AGENT
    extract_model: str = "claude-opus-5-5"
    extract_effort: str = "low"
    synthesize_model: str = "claude-opus-5-5"
    synthesize_effort: str = "high"
    max_workers: int = 4
    transcribe_audio: bool = False
    whisper_model: str = "base"
    max_audio_minutes: int = 60
    output_dir: str = "digests"
    db_path: str = "data/sector_scout.db"


@dataclass
class Sector:
    key: str
    name: str
    focus: str = ""
    news_queries: list[str] = field(default_factory=list)
    rss_feeds: list[str] = field(default_factory=list)
    podcast_search_terms: list[str] = field(default_factory=list)
    podcast_feeds: list[str] = field(default_factory=list)


@dataclass
class Config:
    settings: Settings
    sectors: dict[str, Sector]
    base_dir: Path

    def resolve(self, relative: str) -> Path:
        """Resolve a path from the config relative to the config file's folder."""
        p = Path(relative)
        return p if p.is_absolute() else self.base_dir / p

    def select(self, keys: list[str] | None) -> list[Sector]:
        if not keys:
            return list(self.sectors.values())
        unknown = [k for k in keys if k not in self.sectors]
        if unknown:
            raise ConfigError(
                f"Unknown sector(s): {', '.join(unknown)}. "
                f"Configured: {', '.join(self.sectors)}"
            )
        return [self.sectors[k] for k in keys]


class ConfigError(ValueError):
    pass


_VALID_PROVIDERS = {"google", "bing"}
_VALID_EFFORTS = {"low", "medium", "high", "xhigh", "max"}


def _as_str_list(value: Any, where: str) -> list[str]:
    if value is None:
        return []
    if isinstance(value, str):
        return [value]
    if not isinstance(value, list) or not all(isinstance(v, str) for v in value):
        raise ConfigError(f"{where} must be a list of strings")
    return [v.strip() for v in value if v.strip()]


def parse_config(raw: dict[str, Any], base_dir: Path) -> Config:
    if not isinstance(raw, dict):
        raise ConfigError("Config must be a mapping with 'settings' and 'sectors'")

    settings_raw = raw.get("settings") or {}
    known = {f.name for f in fields(Settings)}
    unknown = set(settings_raw) - known
    if unknown:
        raise ConfigError(f"Unknown setting(s): {', '.join(sorted(unknown))}")
    settings = Settings(**settings_raw)
    settings.news_providers = _as_str_list(settings.news_providers, "settings.news_providers")
    bad = set(settings.news_providers) - _VALID_PROVIDERS
    if bad:
        raise ConfigError(f"Unknown news provider(s): {', '.join(sorted(bad))}")
    for name in ("extract_effort", "synthesize_effort"):
        if getattr(settings, name) not in _VALID_EFFORTS:
            raise ConfigError(f"settings.{name} must be one of {sorted(_VALID_EFFORTS)}")

    sectors_raw = raw.get("sectors") or {}
    if not isinstance(sectors_raw, dict) or not sectors_raw:
        raise ConfigError("Config needs at least one entry under 'sectors'")
    sectors: dict[str, Sector] = {}
    for key, body in sectors_raw.items():
        body = body or {}
        where = f"sectors.{key}"
        sectors[key] = Sector(
            key=key,
            name=str(body.get("name") or key.replace("_", " ").title()),
            focus=" ".join(str(body.get("focus") or "").split()),
            news_queries=_as_str_list(body.get("news_queries"), f"{where}.news_queries"),
            rss_feeds=_as_str_list(body.get("rss_feeds"), f"{where}.rss_feeds"),
            podcast_search_terms=_as_str_list(
                body.get("podcast_search_terms"), f"{where}.podcast_search_terms"
            ),
            podcast_feeds=_as_str_list(body.get("podcast_feeds"), f"{where}.podcast_feeds"),
        )
    return Config(settings=settings, sectors=sectors, base_dir=base_dir)


def load_config(path: str | Path) -> Config:
    path = Path(path)
    if not path.exists():
        raise ConfigError(f"Config file not found: {path}")
    with path.open(encoding="utf-8") as fh:
        raw = yaml.safe_load(fh)
    return parse_config(raw, base_dir=path.resolve().parent)
