"""Live hearing WebSocket — JustiScribe real-time transcription channel.

Protocol (JSON text frames, or binary audio frames):
  • Client → Server (binary): a short self-contained audio clip (e.g. 5s webm/wav)
  • Client → Server (text):   {"type": "speaker", "speaker": "Sudya"}
  • Server → Client (text):   {"type": "segment", "ts", "speaker", "text", "insight"}
                              {"type": "status",  "message"}
                              {"type": "processing", "stage": "transcribing"|"insight"}
                              {"type": "insight", "for_text", "text"}
                              {"type": "error", "message"}
"""
import asyncio
import os
import uuid
from typing import Optional

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from loguru import logger
from starlette.websockets import WebSocketState

from app.core.config import settings
from app.core.security import decode_token
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
        # num_gpu=0 → insight runs on CPU. During a hearing the GPU is busy
        # with Whisper; on 6 GB they can't both fit, so we keep this off the
        # GPU. It's async and non-critical, so CPU latency is acceptable.
        out = await llm.chat(
            text, system=INSIGHT_SYSTEM, temperature=0.1, num_predict=80, num_gpu=0
        )
        out = out.strip()
        if out.lower().startswith("yo'q") or out.lower() == "yoq":
            return None
        return out
    except Exception:  # noqa: BLE001
        return None


async def _send_insight_async(
    websocket: WebSocket, text: str, segment_idx: int
) -> None:
    """Run LLM insight in the background; deliver as a separate WS frame.

    This MUST NOT block the main transcription loop — on CPU the LLM can
    take 3-10 s per call, and the next audio clip would queue up behind it.
    """
    try:
        ins = await _quick_insight(text)
    except Exception:  # noqa: BLE001
        ins = None
    if not ins:
        return
    if websocket.client_state != WebSocketState.CONNECTED:
        return
    try:
        await websocket.send_json(
            {"type": "insight", "segment_idx": segment_idx, "text": ins}
        )
    except Exception:  # noqa: BLE001
        pass


# Roles allowed to drive a live hearing.
_ALLOWED_ROLES = {"judge", "admin", "oversight"}


def _authorize(websocket: WebSocket) -> Optional[dict]:
    """Validate the JWT passed as ?token=... query param.

    Returns the decoded payload if the token is valid and the role is
    permitted, else None. WebSockets can't use the normal Authorization
    header from the browser, so the token rides in the query string.
    """
    token = websocket.query_params.get("token")
    if not token:
        return None
    payload = decode_token(token)
    if not payload or "sub" not in payload:
        return None
    if payload.get("role") not in _ALLOWED_ROLES:
        return None
    return payload


@router.websocket("/ws/hearing/{case_id}")
async def hearing_ws(websocket: WebSocket, case_id: int):
    # ── Auth gate ────────────────────────────────────────────
    # In dev (DEBUG) we allow a tokenless connection so the demo works
    # without login; in production a valid judge/admin token is required.
    payload = _authorize(websocket)
    if payload is None and not settings.DEBUG:
        await websocket.close(code=4401)  # 4401 = custom "unauthorized"
        logger.warning(f"Hearing #{case_id}: unauthorized WS rejected")
        return

    await websocket.accept()
    os.makedirs(TMP_DIR, exist_ok=True)
    current_speaker = "Noma'lum"
    # Per-session language: ?lang=auto|uz|ru|en (default from settings).
    session_lang = websocket.query_params.get("lang") or settings.WHISPER_LANGUAGE
    elapsed = 0.0
    segment_idx = 0
    insight_tasks: list[asyncio.Task] = []
    user_label = payload.get("sub") if payload else "demo"
    logger.info(f"Hearing #{case_id} opened by user={user_label}, lang={session_lang}")
    await websocket.send_json({"type": "status", "message": f"Majlis #{case_id} ulandi"})

    try:
        while True:
            message = await websocket.receive()

            # Client closed the socket — stop the loop cleanly.
            if message.get("type") == "websocket.disconnect":
                logger.info(f"Hearing #{case_id} client disconnected")
                break

            # Text control frame (e.g. set speaker / language)
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
                elif data.get("type") == "lang":
                    session_lang = data.get("lang", session_lang)
                    await websocket.send_json(
                        {"type": "status", "message": f"Til: {session_lang}"}
                    )
                continue

            # Binary audio frame → transcribe
            if "bytes" in message and message["bytes"]:
                audio_bytes = message["bytes"]
                logger.info(f"[hearing #{case_id}] audio clip: {len(audio_bytes)} bytes")

                # Tell client we're working — lets the UI show a spinner so
                # users don't think the system is frozen during the 3-4 s wait.
                await websocket.send_json(
                    {"type": "processing", "stage": "transcribing"}
                )

                clip_path = os.path.join(TMP_DIR, f"{uuid.uuid4().hex}.webm")
                with open(clip_path, "wb") as f:
                    f.write(audio_bytes)
                try:
                    result = await transcribe(clip_path, language=session_lang)
                except Exception as exc:  # noqa: BLE001
                    logger.error(f"[hearing #{case_id}] transcribe FAILED: {exc}")
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
                logger.info(
                    f"[hearing #{case_id}] transcript: '{text}' "
                    f"(lang={result.get('language')}, dur={result.get('duration')})"
                )
                if not text:
                    await websocket.send_json(
                        {"type": "silent", "ts": round(elapsed, 1)}
                    )
                    elapsed += result.get("duration", 0)
                    continue

                # Send the transcript immediately. The LLM-driven insight runs
                # in the background and arrives later as a separate frame keyed
                # by segment_idx, so the UI can attach it to the right line
                # without blocking the next audio clip's transcription.
                await websocket.send_json(
                    {
                        "type": "segment",
                        "ts": round(elapsed, 1),
                        "idx": segment_idx,
                        "speaker": current_speaker,
                        "text": text,
                        "insight": None,
                    }
                )
                insight_tasks.append(
                    asyncio.create_task(_send_insight_async(websocket, text, segment_idx))
                )
                segment_idx += 1
                elapsed += result.get("duration", 0)

    except WebSocketDisconnect:
        logger.info(f"Hearing #{case_id} WebSocket disconnected")
    except Exception as exc:  # noqa: BLE001
        logger.error(f"Hearing WS error: {exc}")
    finally:
        # Cancel pending insight tasks — the socket is going away.
        for t in insight_tasks:
            if not t.done():
                t.cancel()
        try:
            if websocket.client_state == WebSocketState.CONNECTED:
                await websocket.close()
        except Exception:  # noqa: BLE001
            pass
