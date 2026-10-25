"""Turn MarketWatch CSV exports and HTML pages into Holding / Transaction / Order objects.

MarketWatch can rename CSS classes at any time, so the parsers lean on things that change
less often: CSV column names, table headers, and the words "Buy", "Sell", "Short", "Cover".
Every parser returns None when it can't recognise the page, rather than guessing.
"""

from __future__ import annotations

import csv
import io
import re
from dataclasses import dataclass, field
from typing import Optional
from urllib.parse import parse_qsl, urlencode, urljoin, urlsplit, urlunsplit

from bs4 import BeautifulSoup

from .models import (
    LONG_SIDE,
    SHORT_SIDE,
    Holding,
    Order,
    Transaction,
    normalize_action,
    normalize_price_type,
)

# Canonical field name -> header spellings we accept (compared lower-case, exact match,
# so "Price Change" does not get mistaken for "Price").
HEADER_ALIASES = {
    "symbol": ("symbol", "ticker", "stock"),
    "shares": ("shares", "amount", "qty", "quantity", "share amount"),
    "type": ("type", "transaction type", "trade type", "holding type", "order type"),
    "price": ("price", "execution price", "price per share", "limit price", "stop price"),
    "value": ("value", "market value", "total value"),
    "order_date": ("order date", "date placed", "order placed"),
    "transaction_date": ("transaction date", "date", "executed", "execution date", "trade date"),
}

# Column order the transactions table used historically, for tables without usable headers.
TXN_POSITIONAL = ("symbol", "order_date", "transaction_date", "type", "shares", "price")

_NUMBER = re.compile(r"\d[\d,]*(?:\.\d+)?|\.\d+")


def parse_number(text) -> Optional[float]:
    """'$1,234.50' -> 1234.5, '-$5' -> -5.0, '(12)' -> -12.0, '200 Shares' -> 200.0."""
    if text is None:
        return None
    s = str(text).strip()
    match = _NUMBER.search(s)
    if not match:
        return None
    value = float(match.group().replace(",", ""))
    before = s[: match.start()]
    if "-" in before or "−" in before or (s.startswith("(") and s.endswith(")")):
        value = -value
    return value


def _clean_symbol(text: str) -> str:
    parts = (text or "").strip().split()
    return parts[0].upper() if parts else ""


def _canonical(header: str) -> Optional[str]:
    h = " ".join((header or "").replace("﻿", "").strip().lower().split())
    for name, spellings in HEADER_ALIASES.items():
        if h in spellings:
            return name
    return None


def _map_headers(headers: list[str]) -> dict[str, int]:
    mapping: dict[str, int] = {}
    for i, header in enumerate(headers):
        name = _canonical(header)
        if name and name not in mapping:
            mapping[name] = i
    return mapping


def _records(rows: list[list[str]], positional: Optional[tuple] = None) -> Optional[list[dict]]:
    """Find the header row, then turn every following row into {canonical_name: text}."""
    for idx, row in enumerate(rows):
        mapping = _map_headers(row)
        if "symbol" in mapping:
            body = rows[idx + 1:]
            break
    else:
        if not positional:
            return None
        mapping = {name: i for i, name in enumerate(positional)}
        body = rows

    out = []
    for row in body:
        if not any(cell.strip() for cell in row):
            continue
        out.append({name: row[i] for name, i in mapping.items() if i < len(row)})
    return out


def _looks_like_html(text: str) -> bool:
    return text.lstrip()[:1] == "<"


def _csv_rows(text: str) -> list[list[str]]:
    return list(csv.reader(io.StringIO(text.replace("﻿", ""))))


# ---------------------------------------------------------------- record -> model


def _make_holding(rec: dict) -> Optional[Holding]:
    symbol = _clean_symbol(rec.get("symbol", ""))
    shares = parse_number(rec.get("shares"))
    if not symbol or shares is None:
        return None
    side = SHORT_SIDE if ("short" in rec.get("type", "").lower() or shares < 0) else LONG_SIDE
    return Holding(
        symbol=symbol,
        shares=abs(shares),
        side=side,
        price=parse_number(rec.get("price")),
        value=parse_number(rec.get("value")),
    )


def _make_transaction(rec: dict) -> Optional[Transaction]:
    symbol = _clean_symbol(rec.get("symbol", ""))
    raw_type = " ".join(rec.get("type", "").split())
    action = normalize_action(raw_type)
    shares = parse_number(rec.get("shares"))
    if not symbol or action is None or shares is None:
        return None
    price = parse_number(rec.get("price"))
    return Transaction(
        symbol=symbol,
        action=action,
        shares=abs(shares),
        price=abs(price) if price is not None else None,
        order_date=" ".join(rec.get("order_date", "").split()),
        transaction_date=" ".join(rec.get("transaction_date", "").split()),
        raw_type=raw_type,
    )


# ---------------------------------------------------------------- CSV exports


def parse_holdings_csv(text: str) -> Optional[list[Holding]]:
    """Parse the 'download?view=holdings' CSV. Returns [] for a genuinely empty portfolio."""
    if not text or _looks_like_html(text):
        return None
    records = _records(_csv_rows(text))
    if records is None:
        return None
    return [h for h in (_make_holding(r) for r in records) if h]


def parse_transactions_csv(text: str) -> Optional[list[Transaction]]:
    """Parse the 'download?view=transactions' CSV."""
    if not text or _looks_like_html(text):
        return None
    records = _records(_csv_rows(text))
    if records is None:
        return None
    return [t for t in (_make_transaction(r) for r in records) if t]


# ---------------------------------------------------------------- HTML pages


def _table_rows(table) -> list[list[str]]:
    rows = []
    for tr in table.find_all("tr"):
        cells = tr.find_all(["th", "td"])
        if cells:
            rows.append([c.get_text(" ", strip=True) for c in cells])
    return rows


@dataclass
class PortfolioPage:
    holdings: Optional[list[Holding]] = None
    orders: Optional[list[Order]] = None
    net_worth: Optional[float] = None
    cash: Optional[float] = None
    links: dict[str, str] = field(default_factory=dict)
    recognised: bool = False


def all_cash(net_worth: Optional[float], cash: Optional[float]) -> bool:
    """True when cash is within 1% of net worth, i.e. the player holds no stock."""
    return bool(net_worth) and cash is not None and abs(net_worth - cash) <= 0.01 * abs(net_worth)


def _profile_stats(soup) -> list[tuple[str, float]]:
    """[(label, value)] from the stats box at the top of the portfolio page, in page order."""
    stats = []
    for item in soup.select(".element--profile .kv__item"):
        primary = item.select_one(".primary")
        value = parse_number(primary.get_text()) if primary else None
        if value is None:
            continue
        label = item.get_text(" ", strip=True).replace(primary.get_text(" ", strip=True), "")
        stats.append((" ".join(label.lower().split()), value))
    return stats


_SHARES_IN_TEXT = re.compile(r"([\d,]*\.?\d+)\s*shares?\b", re.I)
_SIDE_WORD = re.compile(r"^\s*(buy|long|short)\s*$", re.I)


def _holdings_from_html(soup) -> Optional[list[Holding]]:
    container = soup.find("mw-table-dropdown")
    if container is None:
        return None
    holdings = []
    for row in container.select("tbody tr"):
        quote = row.find("mini-quote") or row.select_one("a.primary")
        symbol = _clean_symbol(quote.get_text() if quote else "")
        match = _SHARES_IN_TEXT.search(row.get_text(" ", strip=True))
        if not symbol or not match:
            continue
        side_word = row.find(string=_SIDE_WORD)
        side = SHORT_SIDE if side_word and "short" in side_word.lower() else LONG_SIDE
        holdings.append(Holding(symbol=symbol, shares=parse_number(match.group(1)), side=side))
    return holdings


def _orders_from_html(soup) -> list[Order]:
    orders = []
    for row in soup.find_all("tr"):
        ticker_cell = row.find("td", class_="ticker")
        type_cell = row.find("td", class_="type")
        if not ticker_cell or not type_cell:
            continue
        type_text = type_cell.get_text(" ", strip=True)
        action = normalize_action(type_text)
        shares_cell = row.find("td", class_="shares")
        shares = parse_number(shares_cell.get_text()) if shares_cell else None
        if action is None or shares is None:
            continue
        price_cell = row.find("td", class_="price")
        price_text = price_cell.get_text(" ", strip=True) if price_cell else ""
        orders.append(
            Order(
                symbol=_clean_symbol(ticker_cell.get_text()),
                action=action,
                shares=abs(shares),
                price_type=normalize_price_type(f"{type_text} {price_text}"),
                price=parse_number(price_text) if "$" in price_text else None,
                order_id=row.get("data-order") or None,
                raw_type=type_text,
            )
        )
    return orders


def with_pub(url: str, pub: str, download: bool = False) -> str:
    """Make sure a URL points at the followed player's portfolio (pub=...)."""
    parts = urlsplit(url)
    query = dict(parse_qsl(parts.query, keep_blank_values=True))
    query["pub"] = pub
    if download:
        query["isDownload"] = "true"
    return urlunsplit(parts._replace(query=urlencode(query)))


def parse_portfolio_html(html: str, base_url: str, pub: str) -> PortfolioPage:
    """Read holdings, open orders, net worth and export links from the portfolio page."""
    page = PortfolioPage()
    if not html:
        return page
    soup = BeautifulSoup(html, "html.parser")

    page.recognised = bool(
        soup.select_one(".element--profile, mw-table-dropdown, a[href*='download?view=']")
    )
    page.holdings = _holdings_from_html(soup)

    orders = _orders_from_html(soup)
    # An empty order list is only trustworthy if this really was a portfolio page.
    page.orders = orders if (orders or page.recognised) else None

    stats = _profile_stats(soup)
    if stats:
        page.net_worth = stats[0][1]  # the first stat is always the portfolio's net worth
    page.cash = next((v for label, v in stats if "cash remaining" in label or label == "cash"),
                     None)

    # With no stock left the holdings table vanishes. Only call that "all cash" when the
    # cash balance agrees; otherwise it may just be a page that didn't finish loading.
    if page.holdings is None and page.recognised and all_cash(page.net_worth, page.cash):
        page.holdings = []

    for a in soup.select("a[href]"):
        href = a["href"]
        if "download?view=holdings" in href:
            page.links["holdings_csv"] = with_pub(urljoin(base_url, href), pub, download=True)
        elif "download?view=transactions" in href:
            page.links["transactions_csv"] = with_pub(urljoin(base_url, href), pub, download=True)
        elif re.search(r"/transactions(\?|$)", href):
            page.links["transactions_page"] = with_pub(urljoin(base_url, href), pub)
    return page


def parse_transactions_html(html: str) -> Optional[list[Transaction]]:
    """Fallback for when the transactions CSV export isn't available."""
    if not html:
        return None
    soup = BeautifulSoup(html, "html.parser")
    container = soup.select_one(".element--table.transactions") or soup.select_one(".transactions")
    table = container.find("table") if container else None
    if table is None:
        return None
    records = _records(_table_rows(table), positional=TXN_POSITIONAL)
    return [t for t in (_make_transaction(r) for r in records or []) if t]
