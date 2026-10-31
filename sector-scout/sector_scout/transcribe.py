"""Optional: transcribe podcast audio locally when no transcript is published.

Needs `pip install faster-whisper`. Runs on CPU by default, which takes
roughly a few minutes per hour of audio with the `base` model."""

from __future__ import annotations

import logging
import tempfile
from pathlib import Path

from .fetcher import Fetcher

log = logging.getLogger(__name__)


class TranscriptionUnavailable(RuntimeError):
    pass


_MODEL_CACHE: dict[str, object] = {}


def _load_model(size: str):
    try:
        from faster_whisper import WhisperModel
    except ImportError as exc:
        raise TranscriptionUnavailable(
            "Audio transcription needs `pip install faster-whisper`"
        ) from exc
    if size not in _MODEL_CACHE:
        _MODEL_CACHE[size] = WhisperModel(size, device="auto", compute_type="int8")
    return _MODEL_CACHE[size]


def transcribe_url(fetcher: Fetcher, audio_url: str, model_size: str = "base",
                   max_minutes: int = 60) -> str:
    model = _load_model(model_size)
    with tempfile.TemporaryDirectory() as tmp:
        suffix = Path(audio_url.split("?")[0]).suffix or ".mp3"
        path = fetcher.download(audio_url, Path(tmp) / f"episode{suffix}")
        segments, _info = model.transcribe(str(path), vad_filter=True)
        parts: list[str] = []
        limit = max_minutes * 60
        for seg in segments:
            if seg.start > limit:
                parts.append("[... transcription stopped at the configured time limit ...]")
                break
            parts.append(seg.text.strip())
    text = " ".join(p for p in parts if p)
    # Break the wall of text into ~10 sentence paragraphs for readability.
    sentences = text.replace("? ", "?|").replace(". ", ".|").replace("! ", "!|").split("|")
    paragraphs = [" ".join(sentences[i:i + 10]) for i in range(0, len(sentences), 10)]
    return "\n\n".join(paragraphs)
