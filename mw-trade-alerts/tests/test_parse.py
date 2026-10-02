from pathlib import Path

import pytest

from mwtracker.fetch import parse_portfolio_url
from mwtracker.models import BUY, COVER, SELL, SHORT, normalize_action
from mwtracker.parse import (
    parse_holdings_csv,
    parse_number,
    parse_portfolio_html,
    parse_transactions_csv,
    parse_transactions_html,
)

FIX = Path(__file__).parent / "fixtures"


def read(name):
    return (FIX / name).read_text(encoding="utf-8")


@pytest.mark.parametrize("text,expected", [
    ("$1,234.50", 1234.5), ("-$5.00", -5.0), ("(12)", -12.0), ("200 Shares", 200.0),
    ("0.83%", 0.83), ("", None), ("Buy", None), (None, None),
])
def test_parse_number(text, expected):
    assert parse_number(text) == expected


@pytest.mark.parametrize("text,expected", [
    ("Buy", BUY), ("Sell", SELL), ("Short", SHORT), ("Sell Short", SHORT),
    ("Cover", COVER), ("Buy to Cover", COVER), ("Buy: Limit", BUY), ("Dividend", None),
])
def test_normalize_action(text, expected):
    assert normalize_action(text) == expected


def test_holdings_csv():
    holdings = {h.symbol: h for h in parse_holdings_csv(read("holdings.csv"))}
    assert holdings["AAPL"].shares == 200 and holdings["AAPL"].side == "LONG"
    assert holdings["AAPL"].price == 160.25
    assert holdings["TSLA"].shares == 50 and holdings["TSLA"].side == "SHORT"


def test_empty_portfolio_csv_is_empty_list_not_none():
    header = read("holdings.csv").splitlines()[0]
    assert parse_holdings_csv(header + "\n") == []


def test_html_instead_of_csv_is_none():
    # A login or captcha page must never be read as "they hold nothing".
    assert parse_holdings_csv("<html><body>Please sign in</body></html>") is None
    assert parse_transactions_csv("<!doctype html><p>blocked</p>") is None
    assert parse_holdings_csv("") is None


def test_transactions_csv():
    txns = parse_transactions_csv(read("transactions.csv"))
    assert [(t.symbol, t.action, t.shares, t.price) for t in txns] == [
        ("TSLA", SHORT, 50, 213.10), ("AAPL", BUY, 200, 158.77)]
    assert txns[1].transaction_date == "09/30/26 9:45a"


def test_transactions_csv_tolerates_bom_and_renamed_columns():
    text = "﻿Ticker,Date,Transaction Type,Shares,Price\nMSFT,10/02/26,Sell,10,$400\n"
    (t,) = parse_transactions_csv(text)
    assert (t.symbol, t.action, t.shares, t.price, t.transaction_date) == (
        "MSFT", SELL, 10, 400, "10/02/26")


def test_portfolio_html():
    page = parse_portfolio_html(read("portfolio.html"), "https://www.marketwatch.com", "PUB123")
    assert page.recognised
    assert page.net_worth == 100000.0
    assert {(h.symbol, h.shares, h.side) for h in page.holdings} == {
        ("AAPL", 200, "LONG"), ("TSLA", 50, "SHORT")}
    nvda, aapl = page.orders
    assert (nvda.symbol, nvda.action, nvda.shares, nvda.price_type, nvda.price, nvda.order_id) == (
        "NVDA", BUY, 25, "LIMIT", 110.0, "9001")
    assert (aapl.action, aapl.price_type) == (SELL, "STOP")
    # The empty pub= in the transactions download link gets filled in.
    assert "pub=PUB123" in page.links["transactions_csv"]
    assert "isDownload=true" in page.links["holdings_csv"]
    assert page.links["transactions_page"].endswith("/games/demo-game/transactions?pub=PUB123")


def test_unrecognised_page_gives_none_not_empty():
    page = parse_portfolio_html("<html><body>Access denied</body></html>", "https://x", "P")
    assert page.holdings is None and page.orders is None and not page.recognised


def test_transactions_html():
    txns = parse_transactions_html(read("transactions.html"))
    assert [(t.symbol, t.action, t.shares, t.price) for t in txns] == [
        ("TSLA", SHORT, 50, 213.10), ("AAPL", BUY, 200, 158.77)]
    assert parse_transactions_html("<html>nope</html>") is None


def test_parse_portfolio_url():
    url = "https://www.marketwatch.com/games/mka-finance-club-2026-2027/portfolio?pub=fI5MMiMkkUKx"
    assert parse_portfolio_url(url) == ("mka-finance-club-2026-2027", "fI5MMiMkkUKx")
