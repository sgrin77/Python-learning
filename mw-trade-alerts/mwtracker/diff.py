"""Compare the newest Snapshot with what we saw last time and decide what to alert on.

Three independent signals, from most to least precise:
  1. Transaction history: exact action, shares and fill price. The main signal.
  2. Open orders: a limit/stop order shows up here BEFORE it fills, so you get a head start.
  3. Holdings: share counts per symbol. A safety net in case the history lags or can't be read.

`process()` is a pure function (state in, events + new state out) so it is easy to test.
"""

from __future__ import annotations

import copy
import math
from collections import Counter
from dataclasses import asdict, dataclass
from datetime import datetime, timedelta
from typing import Optional

from .models import (
    BUY,
    COVER,
    LONG_SIDE,
    SELL,
    SHORT,
    Event,
    Order,
    Snapshot,
    Transaction,
)

PAST_TENSE = {BUY: "bought", SELL: "sold", SHORT: "shorted", COVER: "covered (bought back)"}


@dataclass
class DiffSettings:
    player_name: str = "The player"
    mirror_scale: float = 1.0  # used when my_portfolio_value is 0
    my_portfolio_value: float = 0.0  # if set, size mirror trades by portfolio %
    failure_alert_after: int = 3  # consecutive failed polls before a "tracker is blind" alert
    holdings_quiet_minutes: int = 30  # ignore holdings moves right after a known trade


def fresh_state() -> dict:
    return {
        "initialized": {"holdings": False, "transactions": False, "orders": False},
        "holdings": {},
        "seen_transactions": {},
        "orders": {},
        "net_worth": None,
        "recent_trades": {},
        "inferred": {},
        "empty_holdings_strikes": 0,
        "health": {"failures": 0, "alerted": False, "last_success": None},
    }


# ---------------------------------------------------------------- formatting helpers


def _shares(n: float) -> str:
    return f"{n:,.0f}" if float(n).is_integer() else f"{n:,.4g}"


def _money(x: float) -> str:
    return f"${x:,.2f}"


def mirror_size(shares: float, settings: DiffSettings, their_value: Optional[float]) -> float:
    if settings.my_portfolio_value and their_value:
        ratio = settings.my_portfolio_value / their_value
    else:
        ratio = settings.mirror_scale
    return math.floor(shares * ratio)


def _mirror_line(action: str, symbol: str, shares: float, settings: DiffSettings,
                 their_value: Optional[float], suffix: str = "") -> str:
    mine = mirror_size(shares, settings, their_value)
    if mine < 1:
        return f"Your mirror: under 1 share at your size, skip or round up {symbol}."
    return f"Your mirror: {action} {_shares(mine)} {symbol}{suffix}"


def _trade_event(t: Transaction, settings: DiffSettings, their_value: Optional[float],
                 confirmed: bool) -> Event:
    title = f"{t.action} {_shares(t.shares)} {t.symbol}"
    if t.price is not None:
        title += f" @ {_money(t.price)}"
    line = f"{settings.player_name} {PAST_TENSE[t.action]} {_shares(t.shares)} shares of {t.symbol}"
    if t.price is not None:
        cost = t.price * t.shares
        line += f" at {_money(t.price)} (~{_money(cost)}"
        if their_value:
            line += f", {cost / their_value:.1%} of their portfolio"
        line += ")"
    lines = [line + "."]
    if t.transaction_date:
        lines.append(f"Filled: {t.transaction_date}")
    if confirmed:
        title = "Confirmed: " + title
        lines.append("(Exact details for the holdings-change alert you already got.)")
    lines.append(_mirror_line(t.action, t.symbol, t.shares, settings, their_value))
    return Event(kind="trade", title=title, body="\n".join(lines),
                 priority="default" if confirmed else "high", action=t.action, symbol=t.symbol)


# ---------------------------------------------------------------- the three signals


def _new_transactions(state: dict, txns: list[Transaction]) -> list[Transaction]:
    """Transactions we have not seen before. Counts duplicates, so two identical fills both count."""
    seen = state["seen_transactions"]
    counts = Counter(t.key() for t in txns)
    emitted: Counter = Counter()
    new = []
    for t in txns:
        k = t.key()
        if emitted[k] < counts[k] - seen.get(k, 0):
            new.append(t)
            emitted[k] += 1
    for k, c in counts.items():
        seen[k] = max(seen.get(k, 0), c)
    return new


def _holding_moves(prev: dict, cur: dict) -> list[tuple[str, str, float, float]]:
    moves = []
    for key in sorted(set(prev) | set(cur)):
        before, after = prev.get(key, 0.0), cur.get(key, 0.0)
        if abs(after - before) > 1e-9:
            symbol, side = key.split("|")
            moves.append((symbol, side, before, after))
    return moves


def _within(ts: Optional[str], now: datetime, minutes: float) -> bool:
    return bool(ts) and now - datetime.fromisoformat(ts) <= timedelta(minutes=minutes)


def _prune(stamps: dict, now: datetime, minutes: float) -> dict:
    return {k: v for k, v in stamps.items() if _within(v, now, minutes)}


def _health(state: dict, snap: Snapshot, settings: DiffSettings, now: datetime) -> list[Event]:
    health = state["health"]
    if snap.anything_read():
        events = []
        if health["alerted"]:
            events.append(Event(kind="health", priority="default", title="Tracker is back online",
                                body="Reading the portfolio again. Alerts have resumed."))
        state["health"] = {"failures": 0, "alerted": False, "last_success": now.isoformat()}
        return events

    health["failures"] += 1
    if health["failures"] >= settings.failure_alert_after and not health["alerted"]:
        health["alerted"] = True
        why = "MarketWatch is blocking the requests" if snap.blocked else "the pages could not be read"
        return [Event(
            kind="health", priority="high",
            title="Tracker can't see the portfolio",
            body=(f"{health['failures']} checks in a row failed: {why}.\n"
                  f"Last good read: {health['last_success'] or 'never'}.\n"
                  f"Errors: {'; '.join(snap.errors) or 'none recorded'}\n"
                  "You will NOT get trade alerts until this is fixed. Run `python -m mwtracker check`."),
        )]
    return []


def process(state: Optional[dict], snap: Snapshot, settings: DiffSettings,
            now: datetime) -> tuple[list[Event], dict]:
    st = copy.deepcopy(state) if state else fresh_state()
    events: list[Event] = _health(st, snap, settings, now)
    starting = not any(st["initialized"].values()) and snap.anything_read()

    if snap.net_worth:
        st["net_worth"] = snap.net_worth
    their_value = st["net_worth"]

    # 1. Transactions -------------------------------------------------------
    new_txns: list[Transaction] = []
    if snap.transactions is not None:
        new_txns = _new_transactions(st, snap.transactions)
        if st["initialized"]["transactions"]:
            for t in new_txns:
                key = f"{t.symbol}|{t.action}"
                confirmed = _within(st["inferred"].pop(key, None), now, 24 * 60)
                events.append(_trade_event(t, settings, their_value, confirmed))
                st["recent_trades"][t.symbol] = now.isoformat()
        else:
            new_txns = []  # first look: everything is history, not news
        st["initialized"]["transactions"] = True
    traded_now = {(t.symbol, t.action) for t in new_txns}

    # 2. Open orders --------------------------------------------------------
    if snap.orders is not None:
        current = {o.key(): o for o in snap.orders}
        if st["initialized"]["orders"]:
            for key, o in current.items():
                if key not in st["orders"]:
                    events.append(Event(
                        kind="order_placed", priority="default", action=o.action, symbol=o.symbol,
                        title=f"Order placed: {o.describe()}",
                        body=(f"{settings.player_name} placed an order that has NOT filled yet: "
                              f"{o.describe()}.\n"
                              + _mirror_line(o.action, o.symbol, o.shares, settings, their_value,
                                             suffix=f" as a {o.price_type} order"
                                             + (f" @ {_money(o.price)}" if o.price else ""))),
                    ))
            for key, data in st["orders"].items():
                o = Order(**data)
                if key not in current and (o.symbol, o.action) not in traded_now:
                    events.append(Event(
                        kind="order_gone", priority="low", action=o.action, symbol=o.symbol,
                        title=f"Order no longer open: {o.describe()}",
                        body="It was filled or cancelled. If it filled, a trade alert will follow.",
                    ))
        st["orders"] = {k: asdict(o) for k, o in current.items()}
        st["initialized"]["orders"] = True

    # 3. Holdings (safety net) ---------------------------------------------
    if snap.holdings is not None:
        current_h = {h.key(): h.shares for h in snap.holdings}
        prev_h = st["holdings"]
        looks_like_glitch = (not current_h and len(prev_h) >= 2 and not new_txns
                             and st["empty_holdings_strikes"] < 1)
        if not st["initialized"]["holdings"]:
            st["holdings"] = current_h
            st["initialized"]["holdings"] = True
        elif looks_like_glitch:
            # Everything vanished with no sell in the history: wait one more poll to be sure.
            st["empty_holdings_strikes"] += 1
        else:
            st["empty_holdings_strikes"] = 0
            for symbol, side, before, after in _holding_moves(prev_h, current_h):
                if _within(st["recent_trades"].get(symbol), now, settings.holdings_quiet_minutes):
                    continue  # already explained by a transaction alert
                growing = after > before
                if side == LONG_SIDE:
                    action = BUY if growing else SELL
                else:
                    action = SHORT if growing else COVER
                if (symbol, action) in traded_now:
                    continue
                delta = abs(after - before)
                what = ("opened" if before == 0 else "closed" if after == 0
                        else "added to" if growing else "trimmed")
                events.append(Event(
                    kind="position", priority="high", action=action, symbol=symbol,
                    title=f"{action} ~{_shares(delta)} {symbol} (holdings change)",
                    body=(f"{settings.player_name} {what} a {side.lower()} position in {symbol}: "
                          f"{_shares(before)} -> {_shares(after)} shares.\n"
                          "Price not known yet; a confirmation follows once it shows in their "
                          "transaction history.\n"
                          + _mirror_line(action, symbol, delta, settings, their_value)),
                ))
                st["inferred"][f"{symbol}|{action}"] = now.isoformat()
            st["holdings"] = current_h

    if starting:
        events.append(_startup_event(snap, settings, their_value))

    st["recent_trades"] = _prune(st["recent_trades"], now, 24 * 60)
    st["inferred"] = _prune(st["inferred"], now, 24 * 60)
    return events, st


def _startup_event(snap: Snapshot, settings: DiffSettings, their_value: Optional[float]) -> Event:
    lines = [f"Now following {settings.player_name}. Existing trades are treated as history; "
             "you'll be alerted on anything new."]
    if their_value:
        lines.append(f"Portfolio value: {_money(their_value)}")
    if snap.holdings is not None:
        held = ", ".join(f"{h.symbol} {_shares(h.shares)}{' (short)' if h.side != LONG_SIDE else ''}"
                         for h in sorted(snap.holdings, key=lambda h: h.symbol))
        lines.append(f"Holdings: {held or 'all cash'}")
    if snap.orders:
        lines.append("Open orders: " + "; ".join(o.describe() for o in snap.orders))
    if snap.transactions is not None:
        lines.append(f"Trades on record: {len(snap.transactions)}")
    return Event(kind="startup", priority="low", title="Trade tracker started", body="\n".join(lines))

