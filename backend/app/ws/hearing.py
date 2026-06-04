"""Live hearing WebSocket — JustiScribe real-time transcription channel.

Protocol (JSON text frames, or binary audio frames):
  • Client → Server (binary): a short self-contained audio clip (e.g. 5s webm/wav)
  • Client → Server (text):   {"type": "speaker", "speaker": "Sudya"}
  • Server → Client (text):   {"type": "segment", "ts", "speaker", "text", "insight"}
                              {"type": "status",  "message"}
"""
import os
import uuid

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from loguru import logger

from app.core.config import settings
from app.services.llm.ollama_client import llm
from app.services.whisper_service import transcribe

router = APIRouter()

TMP_DIR = os.path.join(settings.STORAGE_DIR, "audio", "live")

INSIGHT_SYSTEM = (
    "Sen sud majlisining jonli AI tahlilchisisan. Berilgan gapdan MUHIM yangi fakt, "
    "raqam, sana yoki qonun moddasi eslatilgan bo'lsa, bitta qisqa o'zbekcha jumlada "
    "ko'rsat. Agar muhim narsa yo'q bo'lsa, faqat 'yo'q' deb javob ber."
)


async def _quick_insight(text: str) -> str | None:
    if len(text.strip()) < 8:
        return None
    try:
        out = await llm.chat(text, system=INSIGHT_SYSTEM, temperature=0.1)
        out = out.strip()
        if out.lower().startswith("yo'q") or out.lower() == "yoq":
            return None
        return out
    except Exception:  # noqa: BLE001
        return None


@router.websocket("/ws/hearing/{case_id}")
async def hearing_ws(websocket: WebSocket, case_id: int):
    await websocket.accept()
    os.makedirs(TMP_DIR, exist_ok=True)
    current_speaker = "Noma'lum"
    elapsed = 0.0
    await websocket.send_json({"type": "status", "message": f"Majlis #{case_id} ulandi"})

    try:
        while True:
            message = await websocket.receive()

            # Text control frame (e.g. set speaker)
            if "text" in message and message["text"] is not None:
                import json

                try:
                    data = json.loads(message["text"])
                except json.JSONDecodeError:
                    continue
                if data.get("type") == "speaker":
                    current_speaker = data.get("speaker", current_speaker)
                    await websocket.send_json(
                        {"type": "status", "message": f"Gapiruvchi: {current_speaker}"}
                    )
                continue

            # Binary audio frame → transcribe
            if "bytes" in message and message["bytes"]:
                clip_path = os.path.join(TMP_DIR, f"{uuid.uuid4().hex}.webm")
                with open(clip_path, "wb") as f:
                    f.write(message["bytes"])
                try:
                    result = await transcribe(clip_path)
                except Exception as exc:  # noqa: BLE001
                    await websocket.send_json(
                        {"type": "error", "message": f"Transkripsiya xatosi: {exc}"}
                    )
                    continue
                finally:
                    try:
                        os.remove(clip_path)
                    except OSError:
                        pass

                text = result.get("text", "").strip()
                if not text:
                    continue
                insight = await _quick_insight(text)
                await websocket.send_json(
                    {
                        "type": "segment",
                        "ts": round(elapsed, 1),
                        "speaker": current_speaker,
                        "text": text,
                        "insight": insight,
                    }
                )
                elapsed += result.get("duration", 0)

    except WebSocketDisconnect:
        logger.info(f"Hearing #{case_id} WebSocket disconnected")
    except Exception as exc:  # noqa: BLE001
        logger.error(f"Hearing WS error: {exc}")
        await websocket.close()
