"""Document / evidence model."""
from datetime import datetime
from typing import Optional

from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import JSONB
from sqlmodel import Field, SQLModel

from app.models.enums import DocumentKind


class Document(SQLModel, table=True):
    __tablename__ = "documents"

    id: Optional[int] = Field(default=None, primary_key=True)

    claim_id: Optional[int] = Field(default=None, foreign_key="claims.id", index=True)
    case_id: Optional[int] = Field(default=None, foreign_key="cases.id", index=True)
    uploaded_by: Optional[int] = Field(default=None, foreign_key="users.id")

    kind: DocumentKind = Field(default=DocumentKind.OTHER)
    filename: str
    path: str
    mime_type: Optional[str] = None
    size_bytes: int = Field(default=0)

    # EvidenceAnalyzer output: deepfake score, extracted facts, OCR text, etc.
    ai_analysis: Optional[dict] = Field(default=None, sa_column=Column(JSONB))
    extracted_text: Optional[str] = None

    created_at: datetime = Field(default_factory=datetime.utcnow)
