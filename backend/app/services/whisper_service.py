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
    Heuristics: extremely low character diversity, or one char/word dominating.
    Tuned for short live-hearing clips — must not reject real Uzbek words.
    """
    t = text.strip().lower()
    if len(t) < 2:
        return True
    letters = [c for c in t if c.isalpha()]
    if not letters:
        return True
    unique_ratio = len(set(letters)) / len(letters)
    # Real speech has many distinct letters; 'ʃʃʃ' has ratio ~0.01.
    # Threshold lowered (0.18 → 0.10) to avoid killing short Uzbek phrases.
    if len(letters) >= 12 and unique_ratio < 0.10:
        return True
    # One word repeated over and over (e.g. "ha ha ha ha ha ha ha").
    words = t.split()
    if len(words) >= 8 and len(set(words)) / len(words) < 0.20:
        return True
    # Non-Latin/Cyrillic exotic script dominance (Uzbek uses Latin/Cyrillic).
    exotic = sum(1 for c in letters if ord(c) > 0x500)
    if exotic / len(letters) > 0.7:
        return True
    return False


def _transcribe_sync(audio_path: str, language: Optional[str]) -> dict:
    model = _load_model()
    segments, info = model.transcribe(
        audio_path,
        language=language or settings.WHISPER_LANGUAGE,
        # Aniqlik ustuvor (sekin bo'lsa ham mayli): beam search + best_of.
        beam_size=5,
        best_of=5,
        temperature=0.0,
        # Don't carry hallucinated context between clips.
        condition_on_previous_text=False,
        # Suppress runaway repeated tokens ('ʃʃʃʃ' noise hallucination).
        repetition_penalty=1.2,
        no_repeat_ngram_size=3,
        # VAD trims silence/noise. min_silence=300ms is lenient enough for
        # 5-second live clips where natural pauses are short.
        vad_filter=True,
        vad_parameters=dict(min_silence_duration_ms=300),
        # Whisper's own silence/confidence filters — keep at defaults so
        # short live clips with quieter audio aren't entirely discarded.
        no_speech_threshold=0.6,
        log_prob_threshold=-1.0,
    )
    seg_list = []
    full_text = []
    dropped = []
    for seg in segments:
        no_speech = getattr(seg, "no_speech_prob", 0.0)
        avg_lp = getattr(seg, "avg_logprob", 0.0)
        clean = seg.text.strip()
        # Soft post-filters — log everything we drop so we can tune.
        if no_speech > 0.85:
            dropped.append(f"no_speech={no_speech:.2f} '{clean[:30]}'")
            continue
        if avg_lp < -1.2:
            dropped.append(f"low_logprob={avg_lp:.2f} '{clean[:30]}'")
            continue
        if not clean:
            continue
        if _is_garbage(clean):
            dropped.append(f"garbage '{clean[:30]}'")
            continue
        seg_list.append(
            {"start": round(seg.start, 2), "end": round(seg.end, 2), "text": clean}
        )
        full_text.append(clean)
    if dropped:
        logger.info(f"Whisper dropped {len(dropped)} segments: {dropped[:3]}")
    if not seg_list:
        logger.warning(
            f"Whisper: no segments survived filtering "
            f"(lang={info.language}, dur={info.duration:.2f}s)"
        )
    return {
        "language": info.language,
        "duration": round(info.duration, 2),
        "segments": seg_list,
        "text": " ".join(full_text),
    }


async def transcribe(audio_path: str, language: Optional[str] = None) -> dict:
    """Run blocking Whisper transcription in a thread pool."""
    return await asyncio.to_thread(_transcribe_sync, audio_path, language)
