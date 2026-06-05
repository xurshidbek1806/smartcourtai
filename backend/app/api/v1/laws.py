"""Legal corpus — browse/search laws & precedents + serve mock PDF files.

Auth-free so the frontend legal library works without a login. Listing
reads the seed JSON directly (fast, reliable); `q` does a substring filter.
"""
import json
import os

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from app.services.pdf_gen import LAWS_PDF_DIR, generate_law_pdfs

router = APIRouter(prefix="/laws", tags=["laws"])

_BASE = os.path.join(os.path.dirname(__file__), "..", "..", "data")
_LAWS = os.path.join(_BASE, "laws_sample.json")
_PRECEDENTS = os.path.join(_BASE, "precedents_sample.json")

CODE_NAMES = {
    "FK": "Fuqarolik kodeksi",
    "MK": "Mehnat kodeksi",
    "OK": "Oila kodeksi",
    "JK": "Jinoyat kodeksi",
    "MJK": "Ma'muriy javobgarlik kodeksi",
    "FPK": "Fuqarolik protsessual kodeksi",
    "IPK": "Iqtisodiy protsessual kodeks",
}


def _load(path: str) -> list[dict]:
    try:
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    except Exception:  # noqa: BLE001
        return []


def _filter(items: list[dict], q: str | None, fields: list[str]) -> list[dict]:
    if not q:
        return items
    ql = q.lower()
    return [it for it in items if any(ql in str(it.get(f, "")).lower() for f in fields)]


@router.get("")
async def list_laws(q: str | None = None, limit: int = 50):
    laws = _load(_LAWS)
    for law in laws:
        law["code_name"] = CODE_NAMES.get(law.get("code"), law.get("code"))
    filtered = _filter(laws, q, ["code", "code_name", "article", "title", "text"])
    return {"total": len(filtered), "items": filtered[:limit]}


@router.get("/pdfs")
async def list_law_pdfs():
    """List the generated law PDFs (auto-generates them on first call)."""
    if not os.path.isdir(LAWS_PDF_DIR) or not os.listdir(LAWS_PDF_DIR):
        try:
            generate_law_pdfs()
        except Exception:  # noqa: BLE001
            pass
    files = sorted(os.listdir(LAWS_PDF_DIR)) if os.path.isdir(LAWS_PDF_DIR) else []
    out = []
    for f in files:
        if not f.lower().endswith(".pdf"):
            continue
        code = f.split("_")[0]
        path = os.path.join(LAWS_PDF_DIR, f)
        out.append(
            {
                "name": f,
                "title": CODE_NAMES.get(code, code),
                "size_bytes": os.path.getsize(path),
            }
        )
    return {"total": len(out), "items": out}


@router.get("/pdfs/{name}")
async def get_law_pdf(name: str):
    # prevent path traversal
    safe = os.path.basename(name)
    path = os.path.join(LAWS_PDF_DIR, safe)
    if not os.path.isfile(path):
        raise HTTPException(status_code=404, detail="PDF topilmadi")
    return FileResponse(path, media_type="application/pdf", filename=safe)


# ── Precedents (separate prefix) ─────────────────────────────
precedents_router = APIRouter(prefix="/precedents", tags=["precedents"])


@precedents_router.get("")
async def list_precedents(q: str | None = None, limit: int = 50):
    precedents = _load(_PRECEDENTS)
    filtered = _filter(precedents, q, ["reference", "dispute_type", "outcome", "text", "court"])
    return {"total": len(filtered), "items": filtered[:limit]}
