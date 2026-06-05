"""JustiScribe — speech-to-text via faster-whisper (GPU/CPU, on-premise).

The Whisper model is lazy-loaded on first use. On a 6 GB GPU it time-shares
VRAM with the LLM: it loads on CUDA when transcription is needed and unloads
itself after a short idle period so the LLM can reclaim the GPU. If CUDA is
unavailable or out of memory, it transparently falls back to CPU.
"""
import asyncio
import threading
import time
from typing import Optional

from loguru import logger

from app.core.config import settings

_model = None  # lazy singleton
_model_device = None  # which device the loaded model is actually on
_last_used = 0.0
_lock = threading.Lock()
_unloader_started = False


# On CPU fallback we use a smaller model so the hearing stays real-time
# (medium on CPU is 13-21 s/clip; base is ~2 s).
_CPU_FALLBACK_MODEL = "base"


def _build_model(device: str, compute_type: str, model_name: Optional[str] = None):
    from faster_whisper import WhisperModel

    name = model_name or settings.WHISPER_MODEL
    logger.info(f"Loading Whisper model '{name}' ({device}/{compute_type})...")
    m = WhisperModel(name, device=device, compute_type=compute_type)
    logger.info(f"Whisper model '{name}' loaded on {device}.")
    return m


def _load_model():
    """Load the model, falling back GPU→CPU if CUDA can't be used."""
    global _model, _model_device
    if _model is not None:
        return _model

    device = settings.WHISPER_DEVICE
    compute = settings.WHISPER_COMPUTE_TYPE
    try:
        _model = _build_model(device, compute)
        _model_device = device
    except Exception as exc:  # noqa: BLE001
        if device != "cpu":
            logger.warning(
                f"Whisper CUDA load failed ({exc}); falling back to CPU "
                f"(model '{_CPU_FALLBACK_MODEL}' for real-time speed)."
            )
            _model = _build_model("cpu", "int8", model_name=_CPU_FALLBACK_MODEL)
            _model_device = "cpu"
        else:
            raise
    _start_unloader()
    return _model


def _unload_model():
    """Free the model (and its VRAM) so the LLM can use the GPU."""
    global _model, _model_device
    with _lock:
        if _model is not None:
            logger.info(f"Whisper idle → unloading from {_model_device} (freeing VRAM)")
            _model = None
            _model_device = None
    import gc

    gc.collect()


def _start_unloader():
    """Background thread that unloads the model after idle timeout."""
    global _unloader_started
    if _unloader_started or settings.WHISPER_IDLE_UNLOAD_S <= 0:
        return
    _unloader_started = True

    def _loop():
        while True:
            time.sleep(10)
            if _model is not None and _last_used > 0:
                idle = time.time() - _last_used
                if idle >= settings.WHISPER_IDLE_UNLOAD_S:
                    _unload_model()

    threading.Thread(target=_loop, daemon=True, name="whisper-unloader").start()


def _is_garbage(text: str) -> bool:
    """Detect Whisper hallucinations on noise (e.g. 'ʃʃʃʃ', 'ᗈᗆᗆ').

    These appear when the mic captures broadband noise instead of clear speech.
    Heuristics: extremely low character diversity in long output, or
    foreign-script dominance. MUST NOT reject real Uzbek words or sequences
    of digits ('1, 2, 3, 4, 5' is valid speech, not garbage).
    """
    t = text.strip().lower()
    if len(t) < 2:
        return True
    # Mostly digits/punctuation? Treat as real (numbers, dates, amounts).
    letters = [c for c in t if c.isalpha()]
    if len(letters) < 3:
        return False
    unique_ratio = len(set(letters)) / len(letters)
    # Real speech has many distinct letters; 'ʃʃʃ' has ratio ~0.01.
    # Only trigger on long-and-repetitive output.
    if len(letters) >= 15 and unique_ratio < 0.08:
        return True
    # Non-Latin/Cyrillic exotic script dominance (Uzbek uses Latin/Cyrillic).
    exotic = sum(1 for c in letters if ord(c) > 0x500)
    if exotic / len(letters) > 0.7:
        return True
    return False


def _resolve_language(language: Optional[str]) -> Optional[str]:
    """Map the requested language to what faster-whisper expects.

    - "auto" / "" → None  (model auto-detects per clip; handles uz/ru/en mix)
    - explicit code (e.g. "uz", "ru", "en") → used as-is
    - None → fall back to the configured default (WHISPER_LANGUAGE)
    """
    if language is None:
        language = settings.WHISPER_LANGUAGE
    language = (language or "").strip().lower()
    if language in ("", "auto"):
        return None
    return language


def _run_whisper(model, audio_path: str, resolved_lang: Optional[str], use_vad: bool):
    """One transcription pass. Returns (raw_segments_list, info).

    beam_size=1 (greedy) — jonli majlis uchun tezlik kritik: 5 s klip CPU'da
    beam_size=5 bilan ~20-30 s ketardi (real-vaqtdan orqada qolardi). Greedy
    bilan ~4-6 s — medium model bunda ham yetarli aniq.
    """
    segments, info = model.transcribe(
        audio_path,
        language=resolved_lang,  # None → auto-detect (uz/ru/en aralash nutq)
        beam_size=1,
        best_of=1,
        temperature=0.0,
        condition_on_previous_text=False,
        repetition_penalty=1.2,
        no_repeat_ngram_size=3,
        vad_filter=use_vad,
        vad_parameters=dict(min_silence_duration_ms=500) if use_vad else None,
        no_speech_threshold=0.6,
        log_prob_threshold=-1.0,
    )
    # Materialize the generator so we can count raw segments.
    return list(segments), info


def _is_oom(exc: Exception) -> bool:
    s = str(exc).lower()
    return "out of memory" in s or "cuda" in s or "cublas" in s or "cudnn" in s


def _transcribe_sync(audio_path: str, language: Optional[str]) -> dict:
    global _model, _model_device, _last_used
    model = _load_model()
    resolved_lang = _resolve_language(language)
    _last_used = time.time()

    # First pass WITH VAD (trims silence/noise). If it kills everything —
    # which happens on quiet mics or short webm/opus clips — retry WITHOUT
    # VAD so genuine speech isn't silently dropped.
    try:
        raw, info = _run_whisper(model, audio_path, resolved_lang, use_vad=True)
    except Exception as exc:  # noqa: BLE001
        # CUDA OOM — the LLM probably grabbed the GPU. Drop to CPU and retry
        # so the hearing keeps working (a bit slower) instead of erroring.
        if _model_device != "cpu" and _is_oom(exc):
            logger.warning(f"Whisper CUDA OOM ({exc}); reloading on CPU ('{_CPU_FALLBACK_MODEL}')")
            _unload_model()
            _model = _build_model("cpu", "int8", model_name=_CPU_FALLBACK_MODEL)
            _model_device = "cpu"
            model = _model
            raw, info = _run_whisper(model, audio_path, resolved_lang, use_vad=True)
        else:
            raise
    if not raw:
        logger.info("Whisper: VAD produced 0 segments → retrying without VAD")
        raw, info = _run_whisper(model, audio_path, resolved_lang, use_vad=False)
    _last_used = time.time()

    logger.info(
        f"Whisper: {len(raw)} raw segments "
        f"(lang={info.language}, lang_prob={getattr(info, 'language_probability', 0):.2f}, "
        f"dur={info.duration:.2f}s)"
    )

    seg_list = []
    full_text = []
    dropped = []
    for seg in raw:
        no_speech = getattr(seg, "no_speech_prob", 0.0)
        avg_lp = getattr(seg, "avg_logprob", 0.0)
        clean = seg.text.strip()
        # Soft post-filters — log everything we drop so we can tune.
        if no_speech > 0.9:
            dropped.append(f"no_speech={no_speech:.2f} '{clean[:30]}'")
            continue
        if avg_lp < -1.5:
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
        logger.info(f"Whisper dropped {len(dropped)}/{len(raw)} segments: {dropped[:3]}")
    if not seg_list:
        logger.warning(
            f"Whisper: no segments survived filtering "
            f"(raw={len(raw)}, lang={info.language}, dur={info.duration:.2f}s)"
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
