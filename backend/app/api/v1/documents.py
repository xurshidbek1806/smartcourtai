"""Documents & evidence — upload, text extraction, EvidenceAnalyzer."""
import json
import os
import uuid

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from sqlmodel import select

from app.api.deps import CurrentUser, SessionDep
from app.core.config import settings
from app.models.document import Document
from app.models.enums import DocumentKind
from app.services.llm.ollama_client import llm

router = APIRouter(prefix="/documents", tags=["documents"])

UPLOAD_DIR = os.path.join(settings.STORAGE_DIR, "uploads")

EVIDENCE_SYSTEM = (
    "Sen sud dalillarini tahlil qiluvchi kiber-ekspertsan. Berilgan hujjat matnidan "
    "huquqiy faktlarni ajrat. FAQAT JSON: "
    '{"facts": ["..."], "key_dates": ["..."], "amounts": ["..."], '
    '"named_parties": ["..."], "risk_notes": ["..."], "summary": "..."}'
)


def _extract_text(path: str, mime: str | None) -> str:
    """Extract text from PDF / DOCX / TXT. Images return empty (OCR stub)."""
    lower = path.lower()
    try:
        if lower.endswith(".pdf"):
            from pypdf import PdfReader

            reader = PdfReader(path)
            return "\n".join((p.extract_text() or "") for p in reader.pages)
        if lower.endswith(".docx"):
            import docx

            doc = docx.Document(path)
            return "\n".join(p.text for p in doc.paragraphs)
        if lower.endswith((".txt", ".md")):
            with open(path, encoding="utf-8", errors="ignore") as f:
                return f.read()
    except Exception:  # noqa: BLE001
        return ""
    return ""


def _kind_from_mime(filename: str) -> DocumentKind:
    lower = filename.lower()
    if lower.endswith(".pdf"):
        return DocumentKind.CLAIM_PDF
    if lower.endswith((".mp3", ".wav", ".m4a", ".ogg")):
        return DocumentKind.AUDIO
    if lower.endswith((".mp4", ".mov", ".avi")):
        return DocumentKind.VIDEO
    if lower.endswith((".jpg", ".jpeg", ".png", ".gif")):
        return DocumentKind.IMAGE
    return DocumentKind.EVIDENCE


@router.post("/upload")
async def upload_document(
    user: CurrentUser,
    session: SessionDep,
    file: UploadFile = File(...),
    claim_id: int | None = Form(None),
    case_id: int | None = Form(None),
    analyze: bool = Form(True),
):
    """Upload a document/evidence file; optionally run EvidenceAnalyzer."""
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    ext = os.path.splitext(file.filename or "file")[1]
    stored = os.path.join(UPLOAD_DIR, f"{uuid.uuid4().hex}{ext}")
    content = await file.read()
    if len(content) > settings.MAX_UPLOAD_MB * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Fayl juda katta")
    with open(stored, "wb") as f:
        f.write(content)

    text = _extract_text(stored, file.content_type)
    ai_analysis = None
    if analyze and text.strip():
        out = await llm.chat(text[:6000], system=EVIDENCE_SYSTEM, format_json=True, temperature=0.1)
        try:
            ai_analysis = json.loads(out)
        except json.JSONDecodeError:
            ai_analysis = {"raw": out}

    doc = Document(
        claim_id=claim_id,
        case_id=case_id,
        uploaded_by=user.id,
        kind=_kind_from_mime(file.filename or ""),
        filename=file.filename or "file",
        path=stored,
        mime_type=file.content_type,
        size_bytes=len(content),
        extracted_text=text[:10000] if text else None,
        ai_analysis=ai_analysis,
    )
    session.add(doc)
    await session.commit()
    await session.refresh(doc)
    return {
        "id": doc.id,
        "filename": doc.filename,
        "kind": doc.kind,
        "size_bytes": doc.size_bytes,
        "text_extracted": bool(text),
        "ai_analysis": ai_analysis,
    }


@router.get("/claim/{claim_id}")
async def list_claim_documents(claim_id: int, user: CurrentUser, session: SessionDep):
    result = await session.exec(select(Document).where(Document.claim_id == claim_id))
    docs = result.all()
    return [
        {
            "id": d.id,
            "filename": d.filename,
            "kind": d.kind,
            "size_bytes": d.size_bytes,
            "ai_analysis": d.ai_analysis,
        }
        for d in docs
    ]
