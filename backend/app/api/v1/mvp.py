"""MVP endpoints — auth-free public access for the demo.

Hackathon-focused: the 2 core flows from the project doc:
  1. ClaimValidator  — free-text claim → structured JSON
  2. SmartJudge      — case facts → streamed decision draft (token streaming)

These mirror app/api/v1/ai.py but skip authentication so the frontend
demo can call them directly without a login screen.
"""
import json

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from app.schemas.ai import SmartJudgeRequest, ValidateClaimRequest
from app.services import rag
from app.services.llm.ollama_client import llm
from app.services.llm.prompts import (
    CLAIM_VALIDATOR_SYSTEM,
    SMART_JUDGE_SYSTEM,
    build_smart_judge_prompt,
)

router = APIRouter(prefix="/mvp", tags=["mvp"])


def _parse_json(text: str) -> dict:
    text = text.strip()
    if text.startswith("```"):
        text = text.split("```", 2)[1].lstrip("json").strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        start, end = text.find("{"), text.rfind("}")
        if start != -1 and end != -1:
            try:
                return json.loads(text[start : end + 1])
            except json.JSONDecodeError:
                pass
    return {"raw": text, "parse_error": True}


# ── MVP Fokus 1: ClaimValidator ──────────────────────────────
@router.post("/claim-validator")
async def claim_validator(payload: ValidateClaimRequest):
    """Free-text claim → structured JSON (yurisdiksiya, tomonlar, kamchiliklar)."""
    out = await llm.chat(
        payload.text,
        system=CLAIM_VALIDATOR_SYSTEM,
        format_json=True,
        temperature=0.1,
    )
    return _parse_json(out)


# ── MVP Fokus 2: SmartJudge (token streaming) ────────────────
@router.post("/smart-judge/stream")
async def smart_judge_stream(payload: SmartJudgeRequest):
    """Token-by-token decision draft via Server-Sent Events.

    Frontend reads the SSE stream and renders tokens as they arrive — exactly
    the demo flow described in the project document.
    """
    laws = await rag.retrieve_laws(payload.facts, limit=5)
    precedents = await rag.retrieve_precedents(payload.facts, limit=3)

    case_data = {
        "Ish nomi": payload.title,
        "Nizo turi": payload.dispute_type,
        "Tomonlar": payload.parties,
        "Ish holatlari": payload.facts,
    }
    prompt = build_smart_judge_prompt(
        case_data, rag.format_laws(laws), rag.format_precedents(precedents)
    )

    async def event_stream():
        # First — sources event so the UI can render the right rail right away
        meta = {
            "type": "sources",
            "laws": [
                {
                    "code": l.get("code"),
                    "article": l.get("article"),
                    "title": l.get("title"),
                }
                for l in laws
            ],
            "precedents": [
                {
                    "reference": p.get("reference"),
                    "outcome": p.get("outcome"),
                    "score": round(p.get("score", 0), 2),
                }
                for p in precedents
            ],
        }
        yield f"data: {json.dumps(meta, ensure_ascii=False)}\n\n"

        async for token in llm.stream_chat(prompt, system=SMART_JUDGE_SYSTEM):
            yield f"data: {json.dumps({'type': 'token', 'content': token}, ensure_ascii=False)}\n\n"
        yield f"data: {json.dumps({'type': 'done'})}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",  # disable proxy buffering
            "Connection": "keep-alive",
        },
    )


@router.post("/smart-judge")
async def smart_judge(payload: SmartJudgeRequest):
    """Non-streaming variant (returns full text in one response)."""
    laws = await rag.retrieve_laws(payload.facts, limit=5)
    precedents = await rag.retrieve_precedents(payload.facts, limit=3)
    case_data = {
        "Ish nomi": payload.title,
        "Nizo turi": payload.dispute_type,
        "Tomonlar": payload.parties,
        "Ish holatlari": payload.facts,
    }
    prompt = build_smart_judge_prompt(
        case_data, rag.format_laws(laws), rag.format_precedents(precedents)
    )
    draft = await llm.chat(prompt, system=SMART_JUDGE_SYSTEM, temperature=0.3)
    return {
        "draft": draft,
        "laws": [
            {"code": l.get("code"), "article": l.get("article"), "title": l.get("title")}
            for l in laws
        ],
        "precedents": [
            {
                "reference": p.get("reference"),
                "outcome": p.get("outcome"),
                "score": round(p.get("score", 0), 2),
            }
            for p in precedents
        ],
    }
