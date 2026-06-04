"""JustiScribe — speech-to-text via faster-whisper (CPU, on-premise).

The Whisper model is lazy-loaded on first use to keep startup fast and memory
low until transcription is actually needed.
"""
import asyncio
from typing import Optional

from loguru import logger

from app.core.config import settings

_model = None  # lazy singleton


def _load_model():
    global _model
    if _model is None:
        from faster_whisper import WhisperModel

        logger.info(
            f"Loading Whisper model '{settings.WHISPER_MODEL}' "
            f"({settings.WHISPER_DEVICE}/{settings.WHISPER_COMPUTE_TYPE})..."
        )
        _model = WhisperModel(
            settings.WHISPER_MODEL,
            device=settings.WHISPER_DEVICE,
            compute_type=settings.WHISPER_COMPUTE_TYPE,
        )
        logger.info("Whisper model loaded.")
    return _model


def _transcribe_sync(audio_path: str, language: Optional[str]) -> dict:
    model = _load_model()
    segments, info = model.transcribe(
        audio_path,
        language=language or settings.WHISPER_LANGUAGE,
        beam_size=5,
        vad_filter=True,
    )
    seg_list = []
    full_text = []
    for seg in segments:
        seg_list.append(
            {
                "start": round(seg.start, 2),
                "end": round(seg.end, 2),
                "text": seg.text.strip(),
            }
        )
        full_text.append(seg.text.strip())
    return {
        "language": info.language,
        "duration": round(info.duration, 2),
        "segments": seg_list,
        "text": " ".join(full_text),
    }


async def transcribe(audio_path: str, language: Optional[str] = None) -> dict:
    """Run blocking Whisper transcription in a thread pool."""
    return await asyncio.to_thread(_transcribe_sync, audio_path, language)
