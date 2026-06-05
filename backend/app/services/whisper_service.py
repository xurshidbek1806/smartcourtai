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


def _is_garbage(text: str) -> bool:
    """Detect Whisper hallucinations on noise (e.g. 'ʃʃʃʃ', 'ᗈᗆᗆ', 'ha ha ha').

    These appear when the mic captures broadband noise instead of clear speech.
    Heuristics: very low character diversity, or one char/word dominating.
    """
    t = text.strip()
    if len(t) < 2:
        return True
    letters = [c for c in t if c.isalpha()]
    if not letters:
        return True
    unique_ratio = len(set(letters)) / len(letters)
    # Real speech has many distinct letters; 'ʃʃʃ' has ratio ~0.01.
    if len(letters) >= 8 and unique_ratio < 0.18:
        return True
    # One word repeated over and over (e.g. "ha ha ha ha").
    words = t.split()
    if len(words) >= 6 and len(set(words)) / len(words) < 0.25:
        return True
    # Non-Latin/Cyrillic exotic script dominance (Uzbek uses Latin/Cyrillic).
    exotic = sum(1 for c in letters if ord(c) > 0x500)
    if exotic / len(letters) > 0.5:
        return True
    return False


def _transcribe_sync(audio_path: str, language: Optional[str]) -> dict:
    model = _load_model()
    segments, info = model.transcribe(
        audio_path,
        language=language or settings.WHISPER_LANGUAGE,
        # Aniqlik ustuvor (sekin bo'lsa ham mayli): beam search + best_of.
        # Axlat filtrlari va anti-takror pathologik hallucinationni to'sadi.
        beam_size=5,
        best_of=5,
        temperature=0.0,
        # Don't carry hallucinated context between clips.
        condition_on_previous_text=False,
        # Suppress runaway repeated tokens ('ʃʃʃʃ' noise hallucination).
        repetition_penalty=1.3,
        no_repeat_ngram_size=3,
        # VAD trims silence/noise so Whisper doesn't invent words.
        vad_filter=True,
        vad_parameters=dict(min_silence_duration_ms=500),
        # Drop segments the model itself flags as silence / low-confidence.
        no_speech_threshold=0.6,
        log_prob_threshold=-0.8,
    )
    seg_list = []
    full_text = []
    for seg in segments:
        if getattr(seg, "no_speech_prob", 0.0) > 0.6:
            continue
        if getattr(seg, "avg_logprob", 0.0) < -0.8:
            continue
        clean = seg.text.strip()
        if not clean or _is_garbage(clean):
            continue
        seg_list.append(
            {"start": round(seg.start, 2), "end": round(seg.end, 2), "text": clean}
        )
        full_text.append(clean)
    return {
        "language": info.language,
        "duration": round(info.duration, 2),
        "segments": seg_list,
        "text": " ".join(full_text),
    }


async def transcribe(audio_path: str, language: Optional[str] = None) -> dict:
    """Run blocking Whisper transcription in a thread pool."""
    return await asyncio.to_thread(_transcribe_sync, audio_path, language)
