"""JustiScribe — court audio transcription (file upload)."""
import os
import uuid

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.api.deps import CurrentUser
from app.core.config import settings
from app.services.whisper_service import transcribe

router = APIRouter(prefix="/justiscribe", tags=["ai", "justiscribe"])

AUDIO_DIR = os.path.join(settings.STORAGE_DIR, "audio")


@router.post("/transcribe")
async def transcribe_audio(
    user: CurrentUser,
    file: UploadFile = File(...),
    language: str | None = None,
):
    """Upload an audio file → return transcript with timestamped segments."""
    os.makedirs(AUDIO_DIR, exist_ok=True)
    ext = os.path.splitext(file.filename or "audio.wav")[1] or ".wav"
    path = os.path.join(AUDIO_DIR, f"{uuid.uuid4().hex}{ext}")

    content = await file.read()
    if len(content) > settings.MAX_UPLOAD_MB * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Fayl juda katta")
    with open(path, "wb") as f:
        f.write(content)

    try:
        result = await transcribe(path, language=language)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=f"Transkripsiya xatosi: {exc}")

    return {
        "filename": file.filename,
        "language": result["language"],
        "duration": result["duration"],
        "segments": result["segments"],
        "text": result["text"],
    }
