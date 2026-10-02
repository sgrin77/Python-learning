"""End to end: fake MarketWatch responses -> Tracker.poll() -> alerts and saved state."""

from datetime import datetime, timedelta, timezone
from pathlib import Path

from mwtracker.alerts import Dispatcher
from mwtracker.config import load_config
from mwtracker.fetch import FetchResult
from mwtracker.schedule import backoff, market_window
from mwtracker.tracker import Tracker

FIX = Path(__file__).parent / "fixtures"
T0 = datetime(2026, 10, 2, 14, 0, tzinfo=timezone.utc)


class FakeFetcher:
    """Serves fixture files based on which MarketWatch URL is requested."""

    def __init__(self, pages):
        self.pages, self.requested = pages, []

    def get(self, url):
        self.requested.append(url)
        for marker, (status, text) in self.pages.items():
            if marker in url:
                return FetchResult(url, status, text)
        return FetchResult(url, 404, "not found")

    def close(self):
        pass


class Recorder:
    def __init__(self):
        self.events = []

    def send(self, event):
        self.events.append(event)


def write_config(tmp_path, extra=""):
    path = tmp_path / "config.toml"
    path.write_text(
        '[target]\nurl = "https://www.marketwatch.com/games/demo-game/portfolio?pub=PUB123"\n'
        'name = "Leader"\n[alerts.console]\nenabled = false\n' + extra,
        encoding="utf-8",
    )
    return load_config(path)


def fixture_pages():
    return {
        "view=holdings": (200, (FIX / "holdings.csv").read_text()),
        "view=transactions": (200, (FIX / "transactions.csv").read_text()),
        "/portfolio": (200, (FIX / "portfolio.html").read_text()),
    }


def test_full_cycle(tmp_path):
    cfg = write_config(tmp_path)
    pages = fixture_pages()
    fetcher, recorder = FakeFetcher(pages), Recorder()
    tracker = Tracker(cfg, fetcher, Dispatcher([recorder]))

    tracker.poll(T0)
    assert [e.kind for e in recorder.events] == ["startup"]
    assert cfg.state_file.exists()
    assert any("pub=PUB123" in u and "view=transactions" in u for u in fetcher.requested)

    # The player covers 20 TSLA and the export updates.
    pages["view=transactions"] = (200, (FIX / "transactions.csv").read_text()
                                  + "TSLA,10/02/26 10:05a,10/02/26 10:05a,Cover,20,$205.00\n")
    pages["view=holdings"] = (200, pages["view=holdings"][1].replace("TSLA,50", "TSLA,30"))
    recorder.events.clear()
    tracker.poll(T0 + timedelta(minutes=2))
    assert [e.title for e in recorder.events] == ["COVER 20 TSLA @ $205.00"]


def test_transactions_page_fallback_when_csv_is_blocked(tmp_path):
    cfg = write_config(tmp_path)
    pages = fixture_pages()
    pages["view=transactions"] = (403, "<html>captcha-delivery.com</html>")
    pages["/transactions"] = (200, (FIX / "transactions.html").read_text())
    tracker = Tracker(cfg, FakeFetcher(pages), Dispatcher([Recorder()]))
    tracker.poll(T0)
    state = (tmp_path / "state.json").read_text()
    assert "TSLA|SHORT|50|213.1" in state


def test_blocked_everywhere_raises_health_alert(tmp_path):
    cfg = write_config(tmp_path, "[polling]\nfailure_alert_after = 2\n")
    blocked = {"marketwatch": (403, "<html>captcha-delivery.com</html>")}
    recorder = Recorder()
    tracker = Tracker(cfg, FakeFetcher(blocked), Dispatcher([recorder]))
    tracker.poll(T0)
    tracker.poll(T0 + timedelta(minutes=2))
    assert [e.title for e in recorder.events] == ["Tracker can't see the portfolio"]
    assert "blocking" in recorder.events[0].body
    assert tracker.failures == 2


def test_market_window_and_backoff():
    assert market_window(datetime(2026, 10, 2, 14, 0, tzinfo=timezone.utc))  # Fri 10:00 ET
    assert not market_window(datetime(2026, 10, 3, 14, 0, tzinfo=timezone.utc))  # Saturday
    assert not market_window(datetime(2026, 10, 2, 23, 0, tzinfo=timezone.utc))  # 7pm ET
    assert backoff(120, 1) == 240 and backoff(120, 10) == 1800
