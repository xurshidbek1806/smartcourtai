"""AI modules API — the 10 SmartCourt AI components.

ClaimValidator · MediatoBot · LexPredictor · EvidenceAnalyzer · JustiScribe
SentencAI · SmartJudge · CorruptAlert · AnonimusLaw · AutoExec
"""
import json

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from app.api.deps import CurrentUser
from app.schemas.ai import (
    AnonymizeRequest,
    ChatMessage,
    ConflictCheckRequest,
    GraphRelationRequest,
    MediationRequest,
    PredictRequest,
    SentencingRequest,
    SmartJudgeRequest,
    ValidateClaimRequest,
)
from app.services import rag
from app.services.anonymizer import anonymize
from app.services.graph_service import graph_service
from app.services.llm.ollama_client import llm
from app.services.llm.prompts import (
    CLAIM_VALIDATOR_SYSTEM,
    LEGAL_ASSISTANT_SYSTEM,
    MEDIATO_BOT_SYSTEM,
    SENTENC_AI_SYSTEM,
    SMART_JUDGE_SYSTEM,
    build_smart_judge_prompt,
)

router = APIRouter(prefix="/ai", tags=["ai"])


def _parse_json(text: str) -> dict:
    """Best-effort JSON extraction from an LLM response."""
    text = text.strip()
    if text.startswith("```"):
        text = text.split("```")[1].lstrip("json").strip()
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


# ── 1. ClaimValidator ────────────────────────────────────────
@router.post("/claim-validator")
async def claim_validator(payload: ValidateClaimRequest, user: CurrentUser):
    """Parse free-text claim into structured JSON + jurisdiction + gaps."""
    out = await llm.chat(
        payload.text, system=CLAIM_VALIDATOR_SYSTEM, format_json=True, temperature=0.1
    )
    return _parse_json(out)


# ── 2. MediatoBot ────────────────────────────────────────────
@router.post("/mediato-bot")
async def mediato_bot(payload: MediationRequest, user: CurrentUser):
    """Propose a pre-court mediation settlement."""
    prompt = (
        f"Nizo turi: {payload.dispute_type}\n"
        f"Summa: {payload.amount}\n"
        f"Tafsilot: {payload.description}"
    )
    out = await llm.chat(prompt, system=MEDIATO_BOT_SYSTEM, format_json=True, temperature=0.4)
    return _parse_json(out)


# ── 3. LexPredictor ──────────────────────────────────────────
@router.post("/lex-predictor")
async def lex_predictor(payload: PredictRequest, user: CurrentUser):
    """Win-probability + similar precedents via RAG."""
    laws = await rag.retrieve_laws(payload.description, limit=5)
    precedents = await rag.retrieve_precedents(payload.description, limit=5)

    # Heuristic win probability from precedent outcomes + similarity scores.
    if precedents:
        favorable = sum(
            1 for p in precedents if "qanoatlantir" in str(p.get("outcome", "")).lower()
        )
        avg_score = sum(p.get("score", 0) for p in precedents) / len(precedents)
        base = (favorable / len(precedents)) * 100
        win_probability = round(min(95, max(15, 0.7 * base + 0.3 * avg_score * 100)))
    else:
        win_probability = 50

    return {
        "win_probability": win_probability,
        "similar_cases_found": len(precedents),
        "precedents": [
            {
                "reference": p.get("reference"),
                "outcome": p.get("outcome"),
                "similarity": round(p.get("score", 0), 3),
            }
            for p in precedents
        ],
        "relevant_laws": [
            {"code": l.get("code"), "article": l.get("article"), "title": l.get("title")}
            for l in laws
        ],
    }


# ── 4. EvidenceAnalyzer (lightweight; full media analysis in documents.py) ──
@router.post("/evidence-analyzer/text")
async def evidence_analyzer_text(payload: ValidateClaimRequest, user: CurrentUser):
    """Extract legal facts from a text/document body."""
    system = (
        "Sen dalil tahlilchisisan. Berilgan matndan huquqiy faktlarni ajrat. "
        'FAQAT JSON: {"facts": ["..."], "dates": ["..."], "amounts": ["..."], '
        '"parties": ["..."], "summary": "..."}'
    )
    out = await llm.chat(payload.text, system=system, format_json=True, temperature=0.1)
    return _parse_json(out)


# ── 5. JustiScribe is in justiscribe.py (file upload + websocket) ──

# ── 6. SentencAI ─────────────────────────────────────────────
@router.post("/sentenc-ai")
async def sentenc_ai(payload: SentencingRequest, user: CurrentUser):
    """Score mitigating/aggravating factors → recommended sentence range."""
    prompt = f"Huquqbuzarlik: {payload.offense}\nHolatlar: {payload.circumstances}"
    out = await llm.chat(prompt, system=SENTENC_AI_SYSTEM, format_json=True, temperature=0.2)
    return _parse_json(out)


# ── 7. SmartJudge (streaming) ────────────────────────────────
@router.post("/smart-judge/stream")
async def smart_judge_stream(payload: SmartJudgeRequest, user: CurrentUser):
    """Generate a court-decision draft with token streaming (SSE)."""
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
        # First, send the retrieved sources as a metadata event.
        meta = {
            "type": "sources",
            "laws": [
                {"code": l.get("code"), "article": l.get("article"), "title": l.get("title")}
                for l in laws
            ],
            "precedents": [
                {"reference": p.get("reference"), "outcome": p.get("outcome")}
                for p in precedents
            ],
        }
        yield f"data: {json.dumps(meta, ensure_ascii=False)}\n\n"

        async for token in llm.stream_chat(prompt, system=SMART_JUDGE_SYSTEM):
            yield f"data: {json.dumps({'type': 'token', 'content': token}, ensure_ascii=False)}\n\n"
        yield f"data: {json.dumps({'type': 'done'})}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")


@router.post("/smart-judge")
async def smart_judge(payload: SmartJudgeRequest, user: CurrentUser):
    """Non-streaming decision draft (returns full text)."""
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
        "laws_used": [{"code": l.get("code"), "article": l.get("article")} for l in laws],
        "precedents_used": [p.get("reference") for p in precedents],
    }


# ── 8. CorruptAlert ──────────────────────────────────────────
@router.post("/corrupt-alert/relation")
async def add_relation(payload: GraphRelationRequest, user: CurrentUser):
    ok = await graph_service.add_relation(
        payload.person_a, payload.person_b, payload.rel_type, payload.weight
    )
    if not ok:
        raise HTTPException(status_code=503, detail="Neo4j mavjud emas (graph profili)")
    return {"status": "ok"}


@router.post("/corrupt-alert/check")
async def check_conflict(payload: ConflictCheckRequest, user: CurrentUser):
    result = await graph_service.find_path(
        payload.person_a, payload.person_b, payload.max_hops
    )
    if result is None:
        raise HTTPException(status_code=503, detail="Neo4j mavjud emas (graph profili)")
    return result


# ── 9. AnonimusLaw ───────────────────────────────────────────
@router.post("/anonimus-law")
async def anonimus_law(payload: AnonymizeRequest, user: CurrentUser):
    """Mask PII for public registry publication."""
    return await anonymize(payload.text, use_llm=payload.use_llm)


# ── 10. AutoExec (mock integration) ──────────────────────────
@router.post("/auto-exec/{case_id}")
async def auto_exec(case_id: int, user: CurrentUser):
    """Mock execution: trigger bank/MIB integration after a decision."""
    return {
        "case_id": case_id,
        "status": "execution_started",
        "steps": [
            {"system": "Bank", "action": "Hisobni bloklash", "status": "queued"},
            {"system": "MIB", "action": "Chiqish cheklovi", "status": "queued"},
            {"system": "FHDYo", "action": "Reestr yangilash", "status": "queued"},
        ],
        "note": "Demo rejimi — haqiqiy integratsiya API kalitlarini talab qiladi.",
    }


# ── AI Legal Assistant (chatbot) ─────────────────────────────
@router.post("/assistant")
async def assistant(payload: ChatMessage, user: CurrentUser):
    context = ""
    if payload.use_context:
        laws = await rag.retrieve_laws(payload.message, limit=3)
        context = rag.format_laws(laws)
    prompt = payload.message
    if context:
        prompt = f"## TEGISHLI QONUNLAR\n{context}\n\n## SAVOL\n{payload.message}"
    answer = await llm.chat(
        prompt,
        system=LEGAL_ASSISTANT_SYSTEM,
        temperature=0.3,
        num_predict=320,
    )
    return {"answer": answer, "used_context": bool(context)}


@router.post("/assistant/stream")
async def assistant_stream(payload: ChatMessage, user: CurrentUser):
    context = ""
    if payload.use_context:
        laws = await rag.retrieve_laws(payload.message, limit=3)
        context = rag.format_laws(laws)
    prompt = payload.message
    if context:
        prompt = f"## TEGISHLI QONUNLAR\n{context}\n\n## SAVOL\n{payload.message}"

    async def gen():
        async for token in llm.stream_chat(
            prompt,
            system=LEGAL_ASSISTANT_SYSTEM,
            temperature=0.3,
            num_predict=320,
        ):
            yield f"data: {json.dumps({'content': token}, ensure_ascii=False)}\n\n"
        yield f"data: {json.dumps({'type': 'done'})}\n\n"

    return StreamingResponse(gen(), media_type="text/event-stream")
