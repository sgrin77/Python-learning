"""Command line: python -m mwtracker [check|run|once|test-alert|login]"""

from __future__ import annotations

import argparse
import logging
import sys

from .alerts import Dispatcher, build_notifiers
from .config import load_config
from .fetch import BrowserFetcher, game_urls, take_snapshot
from .models import Event
from .tracker import Tracker, make_fetcher


def _setup_logging(verbose: bool, log_file: str) -> None:
    handlers: list[logging.Handler] = [logging.StreamHandler(sys.stderr)]
    if log_file:
        handlers.append(logging.FileHandler(log_file, encoding="utf-8"))
    logging.basicConfig(
        level=logging.DEBUG if verbose else logging.INFO,
        format="%(asctime)s %(levelname)-7s %(message)s",
        handlers=handlers,
    )
    logging.getLogger("urllib3").setLevel(logging.WARNING)


def cmd_check(cfg) -> int:
    """Fetch once and print what was understood. Touches no state and sends no alerts."""
    print(f"Game: {cfg.game}   Player (pub): {cfg.pub}")
    for name, url in game_urls(cfg.game, cfg.pub).items():
        print(f"  {name:18} {url}")
    fetcher = make_fetcher(cfg)
    try:
        snap = take_snapshot(fetcher, cfg.game, cfg.pub, debug_dir=cfg.debug_dir)
    finally:
        fetcher.close()

    def show(label, items, fmt):
        if items is None:
            print(f"\n{label}: COULD NOT READ")
            return
        print(f"\n{label}: {len(items)}")
        for item in items[:15]:
            print("   " + fmt(item))
        if len(items) > 15:
            print(f"   ... and {len(items) - 15} more")

    money = lambda x: "unknown" if x is None else f"${x:,.2f}"
    print(f"\nPortfolio value: {money(snap.net_worth)}    Cash: {money(snap.cash)}")
    show("Holdings", snap.holdings, lambda h: f"{h.symbol:8} {h.shares:>10g}  {h.side}")
    show("Open orders", snap.orders, lambda o: o.describe())
    show("Transactions", snap.transactions,
         lambda t: f"{t.transaction_date or t.order_date:22} {t.action:5} {t.shares:>8g} "
                   f"{t.symbol:8} {'' if t.price is None else f'${t.price:,.2f}'}")
    if snap.errors:
        print("\nProblems:\n   " + "\n   ".join(snap.errors))
    for name, (status, snippet) in snap.failed.items():
        print(f"\n{name} (HTTP {status}) said: {snippet or '(empty response)'}")
    if snap.needs_login:
        print("\nMarketWatch only shows some pages to signed-in users. Holdings and open orders"
              "\nstill work, so alerts work, but without exact fill prices. For those, see"
              "\nREADME > 'Signing in for exact prices'.")
    if snap.blocked:
        print("\nMarketWatch blocked the request. See README > 'If MarketWatch blocks you'.")
    print(f"\nRaw responses saved in {cfg.debug_dir}/ for troubleshooting.")
    return 0 if snap.transactions is not None or snap.holdings is not None else 1


def cmd_test_alert(cfg) -> int:
    dispatcher = Dispatcher(build_notifiers(cfg.alerts))
    names = ", ".join(type(n).__name__ for n in dispatcher.notifiers) or "none"
    print(f"Sending a test alert via: {names}")
    dispatcher.send(Event(
        kind="trade", priority="high", action="BUY", symbol="TEST",
        title="TEST: BUY 10 AAPL @ $123.45",
        body=f"This is what a trade alert from {cfg.diff.player_name} will look like.\n"
             "Your mirror: BUY 10 AAPL",
    ))
    return 0


def cmd_login(cfg) -> int:
    """Open a visible browser so you can sign in to MarketWatch once (browser method only)."""
    fetcher = BrowserFetcher(cfg.browser_profile, headless=False, browser=cfg.browser)
    try:
        fetcher.open_for_login()
        input("Sign in to MarketWatch in the browser window, then press Enter here... ")
    finally:
        fetcher.close()
    print("Saved. Set [fetch] method = \"browser\" in config.toml to use this login.")
    return 0


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        prog="python -m mwtracker",
        description="Alert me when a MarketWatch game player trades.",
    )
    parser.add_argument("command", nargs="?", default="run",
                        choices=["check", "run", "once", "test-alert", "login"],
                        help="check = test the connection, run = watch forever (default), "
                             "once = single check (for cron), test-alert, login")
    parser.add_argument("-c", "--config", default="config.toml")
    parser.add_argument("-v", "--verbose", action="store_true")
    args = parser.parse_args(argv)

    cfg = load_config(args.config)
    _setup_logging(args.verbose, cfg.log_file if args.command in ("run", "once") else "")

    if args.command == "check":
        return cmd_check(cfg)
    if args.command == "test-alert":
        return cmd_test_alert(cfg)
    if args.command == "login":
        return cmd_login(cfg)

    tracker = Tracker(cfg, make_fetcher(cfg), Dispatcher(build_notifiers(cfg.alerts)))
    try:
        if args.command == "once":
            tracker.poll()
        else:
            tracker.run_forever()
    except KeyboardInterrupt:
        print("\nStopped.")
    finally:
        tracker.fetcher.close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
