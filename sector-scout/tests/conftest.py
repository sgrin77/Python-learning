from __future__ import annotations

import sys
from datetime import datetime, timezone
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from sector_scout.analyze import (  # noqa: E402
    BriefPractice, CitedPoint, CrossIdea, CrossSectorIdeas, ItemExtraction, Practice,
    SectorBrief,
)
from sector_scout.fetcher import FetchError, Response  # noqa: E402
from sector_scout.llm import UsageTracker  # noqa: E402

FIXTURES = Path(__file__).parent / "fixtures"
NOW = datetime(2026, 10, 31, 12, 0, tzinfo=timezone.utc)

ARTICLE_URL = "https://www.example-news.com/2026/10/walk-every-unit?utm_source=bing"
PODCAST_FEED = "https://feeds.example-pod.com/apartment-operators.xml"


def fixture_bytes(name: str) -> bytes:
    return (FIXTURES / name).read_bytes()


class FakeFetcher:
    """Serves fixtures by URL; anything unknown is a 404."""

    def __init__(self, routes: dict[str, tuple[str, str]] | None = None) -> None:
        self.routes = routes if routes is not None else {
            "https://news.google.com/rss/search": ("google_news.xml", "application/rss+xml"),
            "https://www.bing.com/news/search": ("bing_news.xml", "application/rss+xml"),
            "https://itunes.apple.com/search": ("itunes_search.json", "application/json"),
            PODCAST_FEED: ("podcast_feed.xml", "application/rss+xml"),
            "https://cdn.example-pod.com/ep88.vtt": ("transcript.vtt", "text/vtt"),
            ARTICLE_URL: ("article.html", "text/html; charset=utf-8"),
        }
        self.calls: list[tuple[str, bool]] = []

    def get(self, url: str, *, check_robots: bool = False, params=None, max_bytes=0):
        self.calls.append((url, check_robots))
        for prefix, (name, ctype) in self.routes.items():
            if url.startswith(prefix):
                return Response(url=url, status=200, content=fixture_bytes(name),
                                content_type=ctype)
        raise FetchError(f"HTTP 404 for {url}")

    def allowed(self, url: str) -> bool:
        return True

    def download(self, url, dest, max_bytes=0):
        raise FetchError("no downloads in tests")


class FakeLLM:
    """Returns canned structured outputs keyed on what is in the prompt."""

    def __init__(self, fail_on: str | None = None, exc: Exception | None = None) -> None:
        self.calls: list[dict] = []
        self.usage = UsageTracker()
        self.fail_on = fail_on
        self.exc = exc

    def structured(self, *, model, effort, system, user, schema, max_tokens=0):
        self.calls.append(dict(model=model, effort=effort, system=system, user=user,
                               schema=schema.__name__))
        if self.fail_on and self.fail_on in user:
            raise self.exc or RuntimeError("boom")
        if schema is ItemExtraction:
            return self._extract(user)
        if schema is SectorBrief:
            return SectorBrief(
                headline="Verify before you trust the numbers.",
                top_practices=[BriefPractice(
                    title="Walk every unit before closing",
                    what_to_do="Inspect every unit and tie each door to a lease and a deposit.",
                    why_it_matters="A rent roll showed 75% occupancy; reality was 52%.",
                    how_to_start=["Add a 100% unit walk to your diligence checklist"],
                    strength="strong", sources=[1, 2, 99],
                )],
                signals=[CitedPoint(text="Renewal offers are moving earlier.", sources=[2])],
                pitfalls=[CitedPoint(text="Sampling 10% of units misses problems.",
                                     sources=[1, 0])],
            )
        if schema is CrossSectorIdeas:
            return CrossSectorIdeas(ideas=[
                CrossIdea(from_sector="Real Estate & Multifamily", to_sector="Second Sector",
                          idea="Verify cash, not paperwork.", how_to_adapt="Reconcile deposits."),
                CrossIdea(from_sector="Made Up Sector", to_sector="Second Sector",
                          idea="Should be filtered out.", how_to_adapt="n/a"),
            ])
        raise AssertionError(f"unexpected schema {schema}")

    @staticmethod
    def _extract(user: str) -> ItemExtraction:
        lowered = user.lower()
        practices = []
        if "walk every" in lowered:
            practices.append(Practice(
                title="Walk every unit before closing",
                practice="Inspect all units during diligence instead of a sample.",
                why_it_works="Rent rolls are the seller's claim.",
                how_to_apply=["Walk 100% of units", "Match doors to leases and deposits"],
                evidence="Rent roll said 75% occupied; actual was 52%.",
                tags=["due diligence", "acquisitions"], confidence="high",
            ))
        if "120 days" in lowered:
            practices.append(Practice(
                title="Send renewal offers at 120 days",
                practice="Start renewals at 120 days instead of 60.",
                why_it_works="Residents have time to plan.",
                how_to_apply=["Move the renewal trigger to 120 days"],
                evidence="Renewal rate rose from 48% to 61%.",
                tags=["retention"], confidence="high",
            ))
        return ItemExtraction(relevant=bool(practices), summary="A test document.",
                              practices=practices)


@pytest.fixture
def fake_fetcher():
    return FakeFetcher()


@pytest.fixture
def fake_llm():
    return FakeLLM()


@pytest.fixture(autouse=True)
def no_google_decoding(monkeypatch):
    """Never hit the network to decode Google News links during tests."""
    import sector_scout.pipeline as pipeline

    monkeypatch.setattr(pipeline, "resolve_google_links", lambda items, timeout=10.0: 0)
