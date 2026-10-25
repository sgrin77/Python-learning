"""Load config.toml into a simple object."""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path

try:
    import tomllib  # Python 3.11+
except ImportError:  # pragma: no cover
    import tomli as tomllib  # type: ignore

from .diff import DiffSettings
from .fetch import parse_portfolio_url


@dataclass
class Config:
    game: str
    pub: str
    diff: DiffSettings
    market_interval: float = 120
    off_hours_interval: float = 900
    fetch_method: str = "http"
    cookie: str = ""
    headless: bool = True
    browser_profile: str = "browser-profile"
    browser: str = ""
    state_file: Path = Path("state.json")
    debug_dir: Path = Path("debug")
    log_file: str = "tracker.log"
    alerts: dict = field(default_factory=dict)


def load_config(path: str | Path) -> Config:
    path = Path(path)
    if not path.exists():
        raise SystemExit(f"Config file {path} not found. Copy config.example.toml to {path} first.")
    raw = tomllib.loads(path.read_text(encoding="utf-8"))
    here = path.parent

    target = raw.get("target", {})
    game, pub = parse_portfolio_url(target.get("url", ""))
    game, pub = target.get("game") or game, target.get("pub") or pub
    if not game or not pub:
        raise SystemExit("[target] needs either url = '<portfolio link>' or both game and pub.")

    polling = raw.get("polling", {})
    fetch = raw.get("fetch", {})
    mirror = raw.get("mirror", {})
    storage = raw.get("storage", {})
    log_name = storage.get("log_file", "tracker.log")

    return Config(
        game=game,
        pub=pub,
        diff=DiffSettings(
            player_name=target.get("name", "The player"),
            mirror_scale=float(mirror.get("scale", 1.0)),
            my_portfolio_value=float(mirror.get("my_portfolio_value", 0) or 0),
            failure_alert_after=int(polling.get("failure_alert_after", 3)),
            holdings_quiet_minutes=int(polling.get("holdings_quiet_minutes", 30)),
        ),
        market_interval=float(polling.get("market_interval_seconds", 120)),
        off_hours_interval=float(polling.get("off_hours_interval_seconds", 900)),
        fetch_method=fetch.get("method", "http"),
        cookie=fetch.get("cookie", ""),
        headless=bool(fetch.get("headless", True)),
        browser_profile=str(here / fetch.get("browser_profile", "browser-profile")),
        browser=fetch.get("browser", ""),
        state_file=here / storage.get("state_file", "state.json"),
        debug_dir=here / storage.get("debug_dir", "debug"),
        log_file=str(here / log_name) if log_name else "",
        alerts=raw.get("alerts", {}),
    )
