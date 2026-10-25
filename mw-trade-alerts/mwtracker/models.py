"""Plain data objects that the rest of the tracker passes around."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Optional

# The four kinds of trade the MarketWatch game allows.
BUY, SELL, SHORT, COVER = "BUY", "SELL", "SHORT", "COVER"
LONG_SIDE, SHORT_SIDE = "LONG", "SHORT"


def normalize_action(text: str) -> Optional[str]:
    """Turn MarketWatch wording ("Buy", "Sell Short", "Buy to Cover"...) into an action."""
    t = (text or "").strip().lower()
    # Order matters: "buy to cover" is a cover and "sell short" is a short.
    if "cover" in t:
        return COVER
    if "short" in t:
        return SHORT
    if "sell" in t:
        return SELL
    if "buy" in t:
        return BUY
    return None


def normalize_price_type(text: str) -> str:
    t = (text or "").lower()
    if "limit" in t:
        return "LIMIT"
    if "stop" in t:
        return "STOP"
    return "MARKET"


def _fmt(value: Optional[float]) -> str:
    return "" if value is None else f"{value:g}"


@dataclass(frozen=True)
class Holding:
    symbol: str
    shares: float
    side: str  # LONG_SIDE or SHORT_SIDE
    price: Optional[float] = None
    value: Optional[float] = None

    def key(self) -> str:
        return f"{self.symbol}|{self.side}"


@dataclass(frozen=True)
class Transaction:
    """One executed trade from the player's transaction history."""

    symbol: str
    action: str
    shares: float
    price: Optional[float] = None
    order_date: str = ""
    transaction_date: str = ""
    raw_type: str = ""

    def key(self) -> str:
        return "|".join(
            [self.symbol, self.action, _fmt(self.shares), _fmt(self.price),
             self.order_date, self.transaction_date]
        )


@dataclass(frozen=True)
class Order:
    """An order that has been placed but not filled yet (limit, stop, or queued market order)."""

    symbol: str
    action: str
    shares: float
    price_type: str = "MARKET"
    price: Optional[float] = None
    order_id: Optional[str] = None
    raw_type: str = ""

    def key(self) -> str:
        if self.order_id:
            return f"id:{self.order_id}"
        return "|".join(
            [self.symbol, self.action, _fmt(self.shares), self.price_type, _fmt(self.price)]
        )

    def describe(self) -> str:
        text = f"{self.price_type} {self.action} {_fmt(self.shares)} {self.symbol}"
        if self.price is not None:
            text += f" @ ${self.price:,.2f}"
        return text


@dataclass
class Snapshot:
    """Everything read from MarketWatch in one poll.

    A field left as None means "could not read it this time", which is different from an
    empty list ("read it, and there is nothing there"). The diff logic never compares
    against a None, so a failed page load can't produce fake "they sold everything" alerts.
    """

    holdings: Optional[list[Holding]] = None
    transactions: Optional[list[Transaction]] = None
    orders: Optional[list[Order]] = None
    net_worth: Optional[float] = None
    cash: Optional[float] = None
    blocked: bool = False  # bot protection (403/429/captcha)
    needs_login: bool = False  # 401: MarketWatch wants a signed-in user
    errors: list[str] = field(default_factory=list)
    failed: dict[str, tuple[int, str]] = field(default_factory=dict)  # name -> (status, snippet)

    def anything_read(self) -> bool:
        return any(x is not None for x in (self.holdings, self.transactions, self.orders))


@dataclass
class Event:
    """Something worth telling the user about. Notifiers turn these into messages."""

    kind: str  # trade | position | order_placed | order_gone | startup | health
    title: str
    body: str
    priority: str = "high"  # high | default | low
    action: Optional[str] = None
    symbol: Optional[str] = None
