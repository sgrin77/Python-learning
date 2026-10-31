from conftest import fixture_bytes

from sector_scout.textutil import (
    advice_sentences, clip, extract_article, html_to_text, parse_json_transcript, parse_srt,
    parse_vtt, transcript_rank, transcript_to_text,
)


def test_html_to_text_keeps_structure_and_drops_scripts():
    text = html_to_text(
        "<p>Hello&nbsp;<b>world</b> &amp; friends</p><script>alert(1)</script>"
        "<ul><li>One</li><li>Two</li></ul>"
    )
    assert "Hello world & friends" in text
    assert "alert" not in text
    assert "- One" in text and "- Two" in text


def test_html_to_text_plain_string_passthrough():
    assert html_to_text("Tom &amp; Jerry") == "Tom & Jerry"
    assert html_to_text("") == ""


def test_parse_vtt_merges_speakers_and_drops_timing():
    text = parse_vtt(fixture_bytes("transcript.vtt").decode())
    assert "-->" not in text and "WEBVTT" not in text and "NOTE" not in text
    assert text.startswith("Jane Host: Welcome back")
    assert "Sam Guest: Thanks. The biggest change" in text
    # duplicate consecutive cue is removed
    assert text.count("Our renewal rate went from 48% to 61%") == 1
    assert "48 hours gets escalated" in text


def test_parse_srt_detects_speaker_prefix():
    text = parse_srt(fixture_bytes("transcript.srt").decode())
    assert "Jane Host: Welcome to the show." in text
    assert "Sam Guest: Start renewal conversations at 120 days." in text


def test_parse_json_transcript_groups_consecutive_speaker():
    text = parse_json_transcript(fixture_bytes("transcript.json").decode())
    assert text.split("\n\n") == [
        "Jane Host: Welcome. Today: retention.",
        "Sam Guest: Send renewal offers at 120 days.",
    ]


def test_transcript_dispatch_by_mime_and_extension():
    vtt = fixture_bytes("transcript.vtt").decode()
    assert "Sam Guest" in transcript_to_text(vtt, "text/vtt")
    assert "Sam Guest" in transcript_to_text(vtt, "", "https://x/ep.vtt")
    assert "Sam Guest" in transcript_to_text(fixture_bytes("transcript.json").decode(),
                                             "application/json")
    assert transcript_to_text("<p>Hi <i>there</i></p>", "text/html") == "Hi there"
    assert transcript_to_text("{not json", "application/json") == "{not json"


def test_transcript_rank_prefers_structured_formats():
    assert transcript_rank("application/json") < transcript_rank("text/vtt")
    assert transcript_rank("text/vtt") < transcript_rank("text/html")
    assert transcript_rank("application/octet-stream") > transcript_rank("text/html")


def test_clip_keeps_head_and_tail():
    text = "A" * 1000 + "B" * 1000
    out, clipped = clip(text, 400)
    assert clipped and out.startswith("A" * 300) and out.endswith("B" * 100)
    assert "omitted for length" in out
    assert clip("short", 400) == ("short", False)


def test_extract_article_drops_boilerplate():
    text = extract_article(fixture_bytes("article.html").decode(), "https://example.com/a")
    assert "walk every unit before you close" in text
    assert "Subscribe now" not in text
    assert "Privacy policy" not in text


def test_advice_sentences_prefers_actionable_lines():
    text = extract_article(fixture_bytes("article.html").decode())
    picked = advice_sentences(text, limit=2)
    assert len(picked) == 2
    assert any("always walk every unit" in s for s in picked)
    assert all("renegotiated the price" not in s for s in picked)
