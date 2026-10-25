"""Glue: fetch a snapshot, diff it against saved state, send alerts, save state, repeat."""

from __future__ import annotations

import json
import logging
import os
import time
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Optional

from .alerts import Dispatcher
from .config import Config
from .diff import process
from .fetch import BrowserFetcher, Fetcher, HttpFetcher, take_snapshot
from .models import Event, Snapshot
from .schedule import backoff, next_delay

log = logging.getLogger(__name__)

# Pages that answered "sign in first" aren't asked again for this long.
LOGIN_RETRY = timedelta(hours=1)


def load_state(path: Path) -> Optional[dict]:
    if not path.exists():
        return None
    return json.loads(path.read_text(encoding="utf-8"))


def save_state(path: Path, state: dict) -> None:
    """Write to a temp file then rename, so a crash mid-write can't corrupt the state."""
    tmp = path.with_suffix(".tmp")
    tmp.write_text(json.dumps(state, indent=2, sort_keys=True), encoding="utf-8")
    os.replace(tmp, path)


def make_fetcher(cfg: Config) -> Fetcher:
    if cfg.fetch_method == "browser":
        return BrowserFetcher(cfg.browser_profile, headless=cfg.headless, browser=cfg.browser)
    return HttpFetcher(cookie=cfg.cookie)


class Tracker:
    def __init__(self, cfg: Config, fetcher: Fetcher, dispatcher: Dispatcher):
        self.cfg, self.fetcher, self.dispatcher = cfg, fetcher, dispatcher
        self.failures = 0
        self.paused_until: dict[str, datetime] = {}

    def poll(self, now: Optional[datetime] = None) -> list[Event]:
        now = now or datetime.now(timezone.utc)
        skip = {name for name, until in self.paused_until.items() if until > now}
        try:
            snap = take_snapshot(self.fetcher, self.cfg.game, self.cfg.pub, skip=skip)
        except Exception as exc:  # a parser bug still counts toward the "tracker is blind" alert
            log.exception("Snapshot failed")
            snap = Snapshot(errors=[f"crash: {exc}"])
        for name, (status, _) in snap.failed.items():
            if status == 401:
                self.paused_until[name] = now + LOGIN_RETRY
                log.info("%s needs a signed-in MarketWatch user; retrying in an hour", name)
        if snap.errors:
            # While sign-in-only pages are paused, their "could not read" lines are expected.
            quiet = skip and not snap.failed
            log.log(logging.DEBUG if quiet else logging.WARNING, "Partial read: %s",
                    "; ".join(snap.errors))
        events, state = process(load_state(self.cfg.state_file), snap, self.cfg.diff, now)
        for event in events:
            log.info("ALERT %s | %s", event.title, event.body.replace("\n", " | "))
            self.dispatcher.send(event)
        save_state(self.cfg.state_file, state)
        self.failures = state["health"]["failures"]
        log.debug("Poll done: %d holdings, %d transactions, %d open orders",
                  len(snap.holdings or []), len(snap.transactions or []), len(snap.orders or []))
        return events

    def run_forever(self) -> None:
        log.info("Following game=%s pub=%s (Ctrl+C to stop)", self.cfg.game, self.cfg.pub)
        while True:
            try:
                self.poll()
            except Exception:  # e.g. the state file could not be written
                log.exception("Poll crashed; will retry")
                self.failures += 1
            delay = next_delay(datetime.now(timezone.utc), self.cfg.market_interval,
                               self.cfg.off_hours_interval)
            if self.failures:
                delay = backoff(min(delay, self.cfg.market_interval), self.failures)
            log.debug("Sleeping %.0f s", delay)
            time.sleep(delay)
