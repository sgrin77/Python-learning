from datetime import datetime, timedelta, timezone

from mwtracker.diff import DiffSettings, mirror_size, process
from mwtracker.models import BUY, COVER, SELL, SHORT, Holding, Order, Snapshot, Transaction

T0 = datetime(2026, 10, 2, 14, 0, tzinfo=timezone.utc)
SETTINGS = DiffSettings(player_name="Leader")


def snap(holdings=(), txns=(), orders=(), net_worth=100_000.0):
    return Snapshot(holdings=list(holdings), transactions=list(txns), orders=list(orders),
                    net_worth=net_worth)


AAPL_LONG = Holding("AAPL", 200, "LONG")
BUY_AAPL = Transaction("AAPL", BUY, 200, 158.77, "09/30 9:45a", "09/30 9:45a", "Buy")


def baseline(**kw):
    events, state = process(None, snap(**kw), SETTINGS, T0)
    return events, state


def test_first_run_is_silent_except_startup_summary():
    events, state = baseline(holdings=[AAPL_LONG], txns=[BUY_AAPL])
    assert [e.kind for e in events] == ["startup"]
    assert "AAPL 200" in events[0].body
    assert all(state["initialized"].values())


def test_new_buy_transaction_alerts_once():
    _, state = baseline(holdings=[AAPL_LONG], txns=[BUY_AAPL])
    new = Transaction("MSFT", BUY, 10, 400.0, "10/02 10:00a", "10/02 10:00a", "Buy")
    s2 = snap(holdings=[AAPL_LONG, Holding("MSFT", 10, "LONG")], txns=[new, BUY_AAPL])
    events, state = process(state, s2, SETTINGS, T0 + timedelta(minutes=2))
    assert [(e.kind, e.action, e.symbol) for e in events] == [("trade", BUY, "MSFT")]
    assert events[0].title == "BUY 10 MSFT @ $400.00"
    assert "4.0% of their portfolio" in events[0].body
    # Same data again: nothing new.
    events, _ = process(state, s2, SETTINGS, T0 + timedelta(minutes=4))
    assert events == []


def test_identical_repeat_trade_still_alerts():
    t = Transaction("F", BUY, 10, 12.0, "10/02", "10/02", "Buy")
    _, state = baseline(txns=[t])
    events, _ = process(state, snap(txns=[t, t]), SETTINGS, T0 + timedelta(minutes=2))
    assert [e.symbol for e in events if e.kind == "trade"] == ["F"]


def test_all_four_actions_are_reported():
    _, state = baseline()
    txns = [Transaction(sym, act, 5, 10.0, "d", "d", act) for sym, act in
            [("A", BUY), ("B", SELL), ("C", SHORT), ("D", COVER)]]
    events, _ = process(state, snap(txns=txns), SETTINGS, T0 + timedelta(minutes=1))
    assert [e.title.split()[0] for e in events] == [BUY, SELL, SHORT, COVER]


def test_holdings_change_without_transaction_is_inferred_then_confirmed():
    _, state = baseline(holdings=[AAPL_LONG], txns=[BUY_AAPL])
    # Holdings show a sale but the history hasn't caught up yet.
    events, state = process(state, snap(holdings=[Holding("AAPL", 50, "LONG")], txns=[BUY_AAPL]),
                            SETTINGS, T0 + timedelta(minutes=2))
    assert [(e.kind, e.action, e.title) for e in events] == [
        ("position", SELL, "SELL ~150 AAPL (holdings change)")]
    # Next poll the transaction shows up: labelled as a confirmation, not a new trade.
    sell = Transaction("AAPL", SELL, 150, 170.0, "10/02", "10/02", "Sell")
    events, _ = process(state, snap(holdings=[Holding("AAPL", 50, "LONG")], txns=[sell, BUY_AAPL]),
                        SETTINGS, T0 + timedelta(minutes=4))
    assert len(events) == 1 and events[0].title.startswith("Confirmed: SELL 150 AAPL")
    assert events[0].priority == "default"


def test_holdings_lagging_behind_transaction_does_not_double_alert():
    _, state = baseline(holdings=[AAPL_LONG], txns=[BUY_AAPL])
    sell = Transaction("AAPL", SELL, 200, 170.0, "10/02", "10/02", "Sell")
    events, state = process(state, snap(holdings=[AAPL_LONG], txns=[sell, BUY_AAPL]),
                            SETTINGS, T0 + timedelta(minutes=2))
    assert [e.kind for e in events] == ["trade"]
    events, _ = process(state, snap(holdings=[], txns=[sell, BUY_AAPL]),
                        SETTINGS, T0 + timedelta(minutes=4))
    assert events == []


def test_short_side_moves():
    _, state = baseline(holdings=[Holding("TSLA", 50, "SHORT")])
    events, _ = process(state, snap(holdings=[Holding("TSLA", 20, "SHORT"),
                                              Holding("GME", 10, "SHORT")]),
                        SETTINGS, T0 + timedelta(minutes=2))
    assert {(e.symbol, e.action) for e in events} == {("GME", SHORT), ("TSLA", COVER)}


def test_missing_data_never_triggers_alerts():
    _, state = baseline(holdings=[AAPL_LONG], txns=[BUY_AAPL])
    events, state2 = process(state, Snapshot(holdings=None, transactions=[BUY_AAPL]),
                             SETTINGS, T0 + timedelta(minutes=2))
    assert events == []
    assert state2["holdings"] == state["holdings"]


def test_sudden_empty_portfolio_waits_for_second_look():
    holds = [AAPL_LONG, Holding("MSFT", 10, "LONG")]
    _, state = baseline(holdings=holds)
    events, state = process(state, snap(holdings=[]), SETTINGS, T0 + timedelta(minutes=2))
    assert events == []
    events, _ = process(state, snap(holdings=[]), SETTINGS, T0 + timedelta(minutes=4))
    assert sorted(e.symbol for e in events) == ["AAPL", "MSFT"]


def test_orders_placed_and_gone():
    _, state = baseline()
    limit = Order("NVDA", BUY, 25, "LIMIT", 110.0, order_id="9001")
    events, state = process(state, snap(orders=[limit]), SETTINGS, T0 + timedelta(minutes=2))
    assert [(e.kind, e.title) for e in events] == [
        ("order_placed", "Order placed: LIMIT BUY 25 NVDA @ $110.00")]
    assert "Your mirror: BUY 25 NVDA as a LIMIT order @ $110.00" in events[0].body
    # The order fills: the trade alert covers it, no separate "order gone" noise.
    fill = Transaction("NVDA", BUY, 25, 110.0, "10/02", "10/02", "Buy")
    events, _ = process(state, snap(orders=[], txns=[fill]), SETTINGS, T0 + timedelta(minutes=4))
    assert [e.kind for e in events] == ["trade"]


def test_cancelled_order():
    limit = Order("NVDA", BUY, 25, "LIMIT", 110.0, order_id="9001")
    _, state = baseline(orders=[limit])
    events, _ = process(state, snap(orders=[]), SETTINGS, T0 + timedelta(minutes=2))
    assert [(e.kind, e.priority) for e in events] == [("order_gone", "low")]


def test_health_alert_after_repeated_failures_and_recovery():
    _, state = baseline(holdings=[AAPL_LONG])
    blind = Snapshot(blocked=True, errors=["portfolio: HTTP 403 (blocked)"])
    kinds = []
    for i in range(4):
        events, state = process(state, blind, SETTINGS, T0 + timedelta(minutes=2 * (i + 1)))
        kinds.append([e.title for e in events])
    assert kinds == [[], [], ["Tracker can't see the portfolio"], []]
    events, state = process(state, snap(holdings=[AAPL_LONG]), SETTINGS, T0 + timedelta(hours=1))
    assert [e.title for e in events] == ["Tracker is back online"]
    assert state["health"]["failures"] == 0


def test_mirror_sizing():
    assert mirror_size(200, DiffSettings(mirror_scale=0.5), 100_000) == 100
    proportional = DiffSettings(my_portfolio_value=25_000)
    assert mirror_size(200, proportional, 100_000) == 50
    assert mirror_size(3, proportional, 100_000) == 0
