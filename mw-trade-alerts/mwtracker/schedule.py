"""How long to wait between checks: fast while the market is open, slow otherwise."""

from __future__ import annotations

import random
from datetime import datetime, time

try:
    from zoneinfo import ZoneInfo
except ImportError:  # pragma: no cover - Python 3.8
    from backports.zoneinfo import ZoneInfo  # type: ignore

EASTERN = ZoneInfo("America/New_York")
# A few minutes of padding on each side catches orders queued for the open and late fills.
WATCH_START, WATCH_END = time(9, 20), time(16, 10)


def market_window(now: datetime) -> bool:
    """True on weekdays between 9:20 and 16:10 New York time (holidays are not excluded)."""
    et = now.astimezone(EASTERN)
    return et.weekday() < 5 and WATCH_START <= et.time() <= WATCH_END


def next_delay(now: datetime, market_seconds: float, off_hours_seconds: float,
               jitter: float = 0.15) -> float:
    """Seconds until the next check, with a little randomness so requests don't look robotic."""
    base = market_seconds if market_window(now) else off_hours_seconds
    return max(30.0, base * random.uniform(1 - jitter, 1 + jitter))


def backoff(base: float, failures: int, cap: float = 1800.0) -> float:
    """Wait longer after repeated failures (2x, 4x, 8x...) so we don't hammer a blocked site."""
    return min(cap, base * (2 ** min(failures, 6)))
