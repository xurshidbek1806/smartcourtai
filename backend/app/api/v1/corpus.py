"""RAG corpus admin — upload laws/precedents (PDF/DOCX/JSON/JSONL), chunk, embed, store.

Designed for the admin panel UI: drag-drop a file, it is parsed into
chunks, each chunk is embedded via Ollama and stored in Qdrant. Stats
endpoint shows live vector counts; clear endpoint wipes a collection.
"""
import asyncio
import io
import json
import os
import re
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from loguru import logger
from pydantic import BaseModel
from qdrant_client.models import Distance, VectorParams

from app.api.deps import require_roles
from app.core.config import settings
from app.models.enums import UserRole
from app.services.vector_store import vector_store

router = APIRouter(
    prefix="/admin/corpus",
    tags=["admin", "corpus"],
    dependencies=[Depends(require_roles(UserRole.ADMIN))],
)

# ── Constants ───────────────────────────────────────────────
COLLECTIONS = {
    "laws": settings.QDRANT_LAWS_COLLECTION,
    "precedents": settings.QDRANT_PRECEDENTS_COLLECTION,
}
MAX_BYTES = 30 * 1024 * 1024  # 30 MB per file
CHUNK_SIZE = 900  # characters per chunk for free text
CHUNK_OVERLAP = 100

# Modda boshini topish: "234-modda", "234 modda", "Modda 234"
ARTICLE_RE = re.compile(
    r"(?:^|\n)\s*(?:Modda\s+)?(\d{1,4})[\s\.-]*(?:modda)?(?=[\.\s\:])",
    re.IGNORECASE,
)


# ── Text extraction ────────────────────────────────────────
def _extract_text_pdf(data: bytes) -> str:
    from pypdf import PdfReader

    reader = PdfReader(io.BytesIO(data))
    return "\n".join((p.extract_text() or "") for p in reader.pages)


def _extract_text_docx(data: bytes) -> str:
    import docx

    doc = docx.Document(io.BytesIO(data))
    return "\n".join(p.text for p in doc.paragraphs)


def _extract_text_plain(data: bytes) -> str:
    return data.decode("utf-8", errors="ignore")


# ── Chunking ───────────────────────────────────────────────
def _chunk_by_articles(text: str, code: str = "") -> list[dict]:
    """Split a kodeks-style text by article markers (best for laws).

    Returns [{text, payload}] ready for vector_store.upsert.
    """
    matches = list(ARTICLE_RE.finditer(text))
    if not matches:
        return _chunk_by_size(text)

    chunks = []
    for i, m in enumerate(matches):
        article = m.group(1)
        start = m.start()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        body = text[start:end].strip()
        if len(body) < 30:
            continue

        # Title — first ~150 chars of the article body (one-liner).
        first_line = body.split("\n", 1)[0][:160]
        chunks.append(
            {
                "text": body[:2500],
                "payload": {
                    "code": code or "—",
                    "article": article,
                    "title": first_line,
                    "text": body[:2500],
                    "source": "admin_upload",
                },
            }
        )
    return chunks


def _chunk_by_size(text: str) -> list[dict]:
    """Fixed-size chunking with overlap for free-form text or precedents."""
    text = text.strip()
    if not text:
        return []
    chunks = []
    i = 0
    while i < len(text):
        piece = text[i : i + CHUNK_SIZE].strip()
        if len(piece) >= 60:
            chunks.append(
                {
                    "text": piece,
                    "payload": {"text": piece, "source": "admin_upload"},
                }
            )
        i += CHUNK_SIZE - CHUNK_OVERLAP
    return chunks


def _from_json_records(records: list[dict], collection_key: str) -> list[dict]:
    """Convert a JSON/JSONL list of records into vector items."""
    chunks = []
    for r in records:
        if not isinstance(r, dict):
            continue
        text_parts = []
        if collection_key == "laws":
            head = " ".join(
                str(r.get(k, "")) for k in ("code", "article", "title") if r.get(k)
            )
            body = str(r.get("text") or r.get("body") or "")
            text = f"{head}. {body}".strip(". ").strip()
        else:  # precedents or other
            head = " ".join(str(r.get(k, "")) for k in ("reference", "outcome") if r.get(k))
            body = str(r.get("text") or r.get("body") or r.get("description") or "")
            text = f"{head}. {body}".strip(". ").strip()
        if len(text) < 30:
            continue
        chunks.append({"text": text[:2500], "payload": {**r, "source": "admin_upload"}})
    return chunks


# ── Endpoints ──────────────────────────────────────────────
@router.get("/stats")
async def stats():
    out = {}
    for key, coll in COLLECTIONS.items():
        out[key] = {"collection": coll, "count": await vector_store.count(coll)}
    return out


class ClearReq(BaseModel):
    collection: str  # "laws" | "precedents"


@router.post("/clear")
async def clear(payload: ClearReq):
    coll = COLLECTIONS.get(payload.collection)
    if not coll:
        raise HTTPException(status_code=400, detail="Noma'lum kolleksiya")
    try:
        await vector_store.client.delete_collection(collection_name=coll)
    except Exception as exc:  # noqa: BLE001
        logger.warning(f"delete_collection failed: {exc}")
    # Recreate empty
    await vector_store.client.create_collection(
        collection_name=coll,
        vectors_config=VectorParams(size=vector_store.dim, distance=Distance.COSINE),
    )
    return {"status": "ok", "collection": coll, "count": 0}


@router.post("/upload")
async def upload(
    file: UploadFile = File(...),
    collection: str = Form("laws"),  # "laws" | "precedents"
    code: str = Form(""),
    mode: str = Form("auto"),  # "auto" | "articles" | "size"
):
    """Upload a corpus file. Returns chunk + indexed count.

    PDF / DOCX → text extraction, then article-chunking (if `mode=auto` and
    matches found) or size-chunking. JSON / JSONL → record-based ingestion.
    """
    coll = COLLECTIONS.get(collection)
    if not coll:
        raise HTTPException(status_code=400, detail="collection 'laws' yoki 'precedents' bo'lsin")

    data = await file.read()
    if len(data) > MAX_BYTES:
        raise HTTPException(status_code=413, detail=f"Fayl {MAX_BYTES // (1024*1024)}MB dan katta")

    name = (file.filename or "").lower()
    items: list[dict] = []

    try:
        if name.endswith(".pdf"):
            text = _extract_text_pdf(data)
            items = (
                _chunk_by_articles(text, code) if mode != "size" else _chunk_by_size(text)
            )
            if not items and mode == "auto":
                items = _chunk_by_size(text)
        elif name.endswith(".docx"):
            text = _extract_text_docx(data)
            items = (
                _chunk_by_articles(text, code) if mode != "size" else _chunk_by_size(text)
            )
            if not items and mode == "auto":
                items = _chunk_by_size(text)
        elif name.endswith(".json"):
            records = json.loads(_extract_text_plain(data))
            if not isinstance(records, list):
                records = [records]
            items = _from_json_records(records, collection)
        elif name.endswith(".jsonl"):
            records = [
                json.loads(line)
                for line in _extract_text_plain(data).splitlines()
                if line.strip()
            ]
            items = _from_json_records(records, collection)
        elif name.endswith(".txt") or name.endswith(".md"):
            text = _extract_text_plain(data)
            items = (
                _chunk_by_articles(text, code) if mode != "size" else _chunk_by_size(text)
            )
            if not items and mode == "auto":
                items = _chunk_by_size(text)
        else:
            raise HTTPException(status_code=400, detail="Faqat PDF, DOCX, TXT, JSON, JSONL")
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001
        logger.exception("corpus parse failed")
        raise HTTPException(status_code=500, detail=f"Faylni o'qib bo'lmadi: {exc}")

    if not items:
        return {"status": "empty", "filename": file.filename, "chunks": 0, "indexed": 0}

    # Embed in concurrent batches for speed (Ollama allows parallel calls).
    BATCH = 8
    indexed = 0
    for i in range(0, len(items), BATCH):
        batch = items[i : i + BATCH]
        try:
            n = await vector_store.upsert(coll, batch)
            indexed += n
        except Exception as exc:  # noqa: BLE001
            logger.warning(f"corpus upsert batch failed: {exc}")
            continue
        # Yield to event loop so the response isn't starved on huge files.
        await asyncio.sleep(0)

    total = await vector_store.count(coll)
    return {
        "status": "ok",
        "filename": file.filename,
        "collection": collection,
        "chunks": len(items),
        "indexed": indexed,
        "total_in_collection": total,
    }


@router.get("/search")
async def search(q: str, collection: str = "laws", limit: int = 5):
    coll = COLLECTIONS.get(collection)
    if not coll:
        raise HTTPException(status_code=400, detail="Noma'lum kolleksiya")
    results = await vector_store.search(coll, q, limit=limit)
    return {"query": q, "collection": collection, "results": results}
