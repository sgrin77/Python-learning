"""Download pages from MarketWatch and build a Snapshot of the followed player's portfolio.

Two ways to fetch:
  * HttpFetcher: plain HTTP with `requests`. Light and fast; works from most home networks.
  * BrowserFetcher: drives a real Chromium through Playwright. Use it if MarketWatch's
    bot protection starts answering HttpFetcher with 401/403 or a captcha page.
"""

from __future__ import annotations

import logging
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Collection, Optional, Protocol

from .models import Snapshot
from .parse import (
    parse_holdings_csv,
    parse_portfolio_html,
    parse_transactions_csv,
    parse_transactions_html,
    with_pub,
)

log = logging.getLogger(__name__)

BASE_URL = "https://www.marketwatch.com"
USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36"
)


@dataclass
class FetchResult:
    url: str
    status: int
    text: str

    @property
    def blocked(self) -> bool:
        """Bot protection said no."""
        return self.status in (403, 429) or "captcha-delivery.com" in self.text

    @property
    def needs_login(self) -> bool:
        """The page exists but MarketWatch only shows it to signed-in users."""
        return self.status == 401 and not self.blocked

    @property
    def ok(self) -> bool:
        return self.status == 200 and not self.blocked

    def snippet(self, limit: int = 200) -> str:
        """The first words of the response, to show what MarketWatch actually said."""
        text = self.text
        if text.lstrip()[:1] == "<":
            from bs4 import BeautifulSoup

            text = BeautifulSoup(text, "html.parser").get_text(" ")
        return " ".join(text.split())[:limit]


class Fetcher(Protocol):
    def get(self, url: str) -> FetchResult: ...

    def close(self) -> None: ...


class HttpFetcher:
    def __init__(self, cookie: str = "", timeout: float = 30.0):
        import requests

        self.timeout = timeout
        self.session = requests.Session()
        self.session.headers.update(
            {
                "User-Agent": USER_AGENT,
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,"
                "text/csv;q=0.9,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.9",
                "Referer": BASE_URL + "/games",
            }
        )
        if cookie:
            self.session.headers["Cookie"] = cookie

    def get(self, url: str) -> FetchResult:
        resp = self.session.get(url, timeout=self.timeout)
        return FetchResult(url=url, status=resp.status_code, text=resp.text)

    def close(self) -> None:
        self.session.close()


class BrowserFetcher:
    """Real browser with a saved profile, so a MarketWatch login (if needed) sticks."""

    def __init__(self, profile_dir: str, headless: bool = True, browser: str = ""):
        """`browser`: "" for Playwright's own Chromium, "msedge" or "chrome" for the one
        installed on this computer, or a path to a Chromium-based browser executable."""
        try:
            from playwright.sync_api import sync_playwright
        except ImportError as exc:  # pragma: no cover - optional dependency
            raise SystemExit(
                "fetch.method = 'browser' needs Playwright:  pip install playwright\n"
                "Then either set browser = \"msedge\" (or \"chrome\") under [fetch],\n"
                "or download Playwright's browser:  python -m playwright install chromium"
            ) from exc
        options: dict = {"headless": headless}
        if browser in ("msedge", "chrome", "chrome-beta", "msedge-beta"):
            options["channel"] = browser
        elif browser:
            options["executable_path"] = browser
        if headless:
            options["user_agent"] = USER_AGENT  # hide the "HeadlessChrome" giveaway
        self._pw = sync_playwright().start()
        self._ctx = self._pw.chromium.launch_persistent_context(profile_dir, **options)
        self._page = self._ctx.pages[0] if self._ctx.pages else self._ctx.new_page()

    def get(self, url: str) -> FetchResult:
        if "download?" in url:
            # CSV exports: reuse the browser's cookies without rendering anything.
            resp = self._ctx.request.get(url)
            return FetchResult(url=url, status=resp.status, text=resp.text())
        resp = self._page.goto(url, wait_until="domcontentloaded", timeout=45_000)
        self._page.wait_for_timeout(1500)  # let any client-side tables render
        return FetchResult(url=url, status=resp.status if resp else 0, text=self._page.content())

    def open_for_login(self) -> None:
        self._page.goto(BASE_URL + "/games")

    def close(self) -> None:
        self._ctx.close()
        self._pw.stop()


def game_urls(game: str, pub: str) -> dict[str, str]:
    g = f"{BASE_URL}/games/{game}"
    return {
        "portfolio": with_pub(f"{g}/portfolio", pub),
        "transactions_page": with_pub(f"{g}/transactions", pub),
        "holdings_csv": with_pub(f"{g}/download?view=holdings", pub, download=True),
        "transactions_csv": with_pub(f"{g}/download?view=transactions", pub, download=True),
    }


def take_snapshot(
    fetcher: Fetcher, game: str, pub: str, debug_dir: Optional[Path] = None,
    skip: Collection[str] = (),
) -> Snapshot:
    """One look at the player's portfolio: 1 to 4 requests. Names in `skip` aren't fetched."""
    snap = Snapshot()
    urls = game_urls(game, pub)

    def get(name: str) -> Optional[str]:
        if name in skip:
            return None
        url = urls[name]
        try:
            result = fetcher.get(url)
        except Exception as exc:  # network errors, timeouts...
            snap.errors.append(f"{name}: {exc}")
            return None
        if debug_dir is not None:
            debug_dir.mkdir(parents=True, exist_ok=True)
            ext = "csv" if "download?" in url else "html"
            (debug_dir / f"{name}.{ext}").write_text(result.text, encoding="utf-8")
        if not result.ok:
            snap.blocked = snap.blocked or result.blocked
            snap.needs_login = snap.needs_login or result.needs_login
            why = " (blocked)" if result.blocked else " (sign-in required)" if result.needs_login else ""
            snap.errors.append(f"{name}: HTTP {result.status}{why}")
            snap.failed[name] = (result.status, result.snippet())
            return None
        return result.text

    # 1. Portfolio page: open orders, net worth, and the real export links.
    page = parse_portfolio_html(get("portfolio") or "", BASE_URL, pub)
    snap.orders = page.orders
    snap.net_worth = page.net_worth
    snap.cash = page.cash
    urls.update(page.links)

    # 2. Holdings: the CSV export is cleanest; the page table is the fallback.
    snap.holdings = parse_holdings_csv(get("holdings_csv") or "")
    if snap.holdings is None:
        snap.holdings = page.holdings

    # 3. Transactions: CSV export first, transactions page as fallback.
    snap.transactions = parse_transactions_csv(get("transactions_csv") or "")
    if snap.transactions is None:
        snap.transactions = parse_transactions_html(get("transactions_page") or "")

    for name, value in (("holdings", snap.holdings), ("transactions", snap.transactions),
                        ("open orders", snap.orders)):
        if value is None:
            snap.errors.append(f"could not read {name}")
    return snap


def parse_portfolio_url(url: str) -> tuple[Optional[str], Optional[str]]:
    """'https://www.marketwatch.com/games/<game>/portfolio?pub=<id>' -> (game, pub)."""
    game = re.search(r"/games/([^/?#]+)", url or "")
    pub = re.search(r"[?&]pub=([^&#]+)", url or "")
    return (game.group(1) if game else None, pub.group(1) if pub else None)
