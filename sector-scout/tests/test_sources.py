from datetime import timedelta

from conftest import NOW, PODCAST_FEED, FakeFetcher, fixture_bytes

from sector_scout.models import Item, canonical_url
from sector_scout.sources import news as news_mod
from sector_scout.sources.news import (
    bing_news_url, google_news_url, parse_news_feed, resolve_google_links, unwrap_bing,
)
from sector_scout.sources.podcasts import (
    itunes_search, parse_podcast_feed, transcripts_by_episode,
)

SINCE = NOW - timedelta(days=7)


def test_google_feed_filters_old_items_and_cleans_titles():
    items = parse_news_feed(fixture_bytes("google_news.xml"), sector="re", provider="google",
                            since=SINCE)
    assert [i.title for i in items] == [
        "Apartment REIT reports quarterly earnings",
        "How one operator cut turn times in half",
    ]
    assert items[1].source == "Multifamily Dive"
    assert items[1].summary == ""  # Google descriptions only repeat the headline
    assert all(i.provider == "google" for i in items)


def test_bing_feed_unwraps_click_tracking_links():
    items = parse_news_feed(fixture_bytes("bing_news.xml"), sector="re", provider="bing",
                            since=SINCE)
    first = items[0]
    assert first.url == "https://www.example-news.com/2026/10/walk-every-unit?utm_source=bing"
    assert first.source == "Example News"
    assert "Due diligence lessons" in first.summary


def test_search_urls():
    g = google_news_url("multifamily best practices", 7)
    assert g.startswith("https://news.google.com/rss/search?q=")
    assert "when%3A7d" in g and "ceid=US:en" in g
    assert "format=rss" in bing_news_url("x y")
    assert unwrap_bing("https://example.com/a?url=https://evil") == "https://example.com/a?url=https://evil"


def test_podcast_feed_episodes_transcripts_and_ids():
    items = parse_podcast_feed(fixture_bytes("podcast_feed.xml"), sector="re", since=SINCE,
                               max_episodes=5)
    assert [i.title for i in items] == ["Ep 88: Resident retention playbook",
                                        "Ep 87: Show notes only episode"]
    ep88, ep87 = items
    assert ep88.source == "Apartment Operators Show"
    assert ep88.audio_url == "https://cdn.example-pod.com/ep88.mp3"
    # both transcripts kept, best format first
    assert [m for _, m in ep88.transcripts] == ["text/vtt", "text/html"]
    assert ep87.transcripts == []
    assert "make-ready" in ep87.summary
    # Both episodes share one <link>; ids must still differ
    assert ep88.url == ep87.url and ep88.id != ep87.id


def test_podcast_feed_respects_max_episodes():
    items = parse_podcast_feed(fixture_bytes("podcast_feed.xml"), sector="re", since=None,
                               max_episodes=1)
    assert len(items) == 1 and items[0].title.startswith("Ep 88")


def test_transcripts_by_episode_reads_every_tag_in_order():
    found = transcripts_by_episode(fixture_bytes("podcast_feed.xml"))
    assert [key for key, _ in found] == ["ep-88", "ep-87", "ep-70"]
    assert len(found[0][1]) == 2 and found[1][1] == [] and found[2][1] == []
    assert transcripts_by_episode(b"<not xml") == []


def test_itunes_search_skips_shows_without_feed():
    shows = itunes_search(FakeFetcher(), "multifamily", limit=5)
    assert shows == [{"title": "Apartment Operators Show", "feed_url": PODCAST_FEED,
                      "author": "Jane Host"}]


def test_resolve_google_links_uses_decoder(monkeypatch):
    import googlenewsdecoder

    def fake_decoder(url, interval=None, timeout=None):
        if url.endswith("AAA1?oc=5"):
            return {"success": True, "decoded_url": "https://publisher.example/story"}
        return {"success": False, "message": "nope"}

    monkeypatch.setattr(googlenewsdecoder, "gnewsdecoder", fake_decoder)
    items = parse_news_feed(fixture_bytes("google_news.xml"), sector="re", provider="google",
                            since=SINCE)
    ids_before = [i.id for i in items]
    assert news_mod.resolve_google_links(items) == 1
    resolved = [i for i in items if i.url == "https://publisher.example/story"]
    assert len(resolved) == 1
    assert [i.id for i in items] == ids_before  # cache key does not change


def test_canonical_url_and_dedupe_key():
    assert canonical_url("HTTPS://Example.com/a/?utm_source=x&id=3#frag") == \
        "https://example.com/a?id=3"
    a = Item(sector="s", kind="news", title="Hello, World!", url="https://a.com/1", source="A")
    b = Item(sector="s", kind="news", title="hello world", url="https://b.com/2", source="B")
    assert a.dedupe_key == b.dedupe_key
    assert a.id != b.id
