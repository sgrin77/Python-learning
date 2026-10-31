"""Thin wrapper over the Anthropic SDK for schema-validated (Pydantic) outputs,
with usage and cost tracking."""

from __future__ import annotations

import logging
import threading
from dataclasses import dataclass, field
from typing import Any, TypeVar

from pydantic import BaseModel

log = logging.getLogger(__name__)

T = TypeVar("T", bound=BaseModel)

# Server-side refusal fallback: if a safety classifier declines a request, the
# API re-runs it on Anthropic's recommended fallback model inside the same call.
FALLBACK_BETA = "server-side-fallback-2026-07-01"
_FALLBACK_MODELS = ("claude-opus-5", "claude-fable-5", "claude-sonnet-5-5")

# USD per million tokens (input, output). Used only for the cost estimate.
PRICES: dict[str, tuple[float, float]] = {
    "claude-fable-5-1": (10.0, 50.0),
    "claude-fable-5": (10.0, 50.0),
    "claude-opus-5-5": (4.0, 20.0),
    "claude-opus-5": (5.0, 25.0),
    "claude-opus-4-8": (5.0, 25.0),
    "claude-sonnet-5-5": (2.0, 10.0),
    "claude-sonnet-5": (2.0, 10.0),
    "claude-haiku-5-5": (0.10, 0.50),
}


def supports_default_fallback(model: str) -> bool:
    return model.startswith(_FALLBACK_MODELS)


class LLMError(RuntimeError):
    pass


class Refused(LLMError):
    pass


@dataclass
class ModelUsage:
    calls: int = 0
    input_tokens: int = 0
    output_tokens: int = 0
    cache_read_tokens: int = 0
    cache_write_tokens: int = 0


@dataclass
class UsageTracker:
    by_model: dict[str, ModelUsage] = field(default_factory=dict)
    _lock: threading.Lock = field(default_factory=threading.Lock, repr=False)

    def add(self, model: str, usage: Any) -> None:
        with self._lock:
            u = self.by_model.setdefault(model, ModelUsage())
            u.calls += 1
            u.input_tokens += getattr(usage, "input_tokens", 0) or 0
            u.output_tokens += getattr(usage, "output_tokens", 0) or 0
            u.cache_read_tokens += getattr(usage, "cache_read_input_tokens", 0) or 0
            u.cache_write_tokens += getattr(usage, "cache_creation_input_tokens", 0) or 0

    def cost(self) -> float | None:
        total = 0.0
        for model, u in self.by_model.items():
            price = PRICES.get(model)
            if price is None:
                return None
            pin, pout = price
            total += (u.input_tokens * pin + u.cache_write_tokens * pin * 1.25
                      + u.cache_read_tokens * pin * 0.1 + u.output_tokens * pout) / 1e6
        return total

    def summary(self) -> str:
        if not self.by_model:
            return "No Claude calls."
        parts = [
            f"{m}: {u.calls} calls, {u.input_tokens + u.cache_read_tokens + u.cache_write_tokens:,}"
            f" in / {u.output_tokens:,} out tokens"
            for m, u in sorted(self.by_model.items())
        ]
        cost = self.cost()
        if cost is not None:
            parts.append(f"estimated cost ${cost:.2f}")
        return "; ".join(parts)


class ClaudeLLM:
    """Calls Claude and returns a validated Pydantic object."""

    def __init__(self, client: Any = None, max_retries: int = 4) -> None:
        if client is None:
            import anthropic

            client = anthropic.Anthropic(max_retries=max_retries)
        self.client = client
        self.usage = UsageTracker()

    def structured(self, *, model: str, effort: str, system: str, user: str,
                   schema: type[T], max_tokens: int = 32000) -> T:
        kwargs: dict[str, Any] = dict(
            model=model,
            max_tokens=max_tokens,
            system=system,
            messages=[{"role": "user", "content": user}],
            output_format=schema,
            output_config={"effort": effort},
        )
        if supports_default_fallback(model):
            kwargs["betas"] = [FALLBACK_BETA]
            kwargs["fallbacks"] = "default"

        # Streaming avoids HTTP timeouts on long transcripts and large outputs.
        with self.client.beta.messages.stream(**kwargs) as stream:
            message = stream.get_final_message()

        self.usage.add(getattr(message, "model", None) or model, message.usage)
        if message.stop_reason == "refusal":
            details = getattr(message, "stop_details", None)
            category = getattr(details, "category", None) if details else None
            raise Refused(f"Claude declined this request (category: {category})")
        if message.stop_reason == "max_tokens":
            raise LLMError(f"Response hit max_tokens={max_tokens}")
        parsed = message.parsed_output
        if parsed is None:
            raise LLMError("Response contained no structured output")
        return parsed
