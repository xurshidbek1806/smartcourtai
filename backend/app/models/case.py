"""Case and Hearing models — court proceedings."""
from datetime import datetime
from typing import Optional

from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import JSONB
from sqlmodel import Field, SQLModel

from app.models.enums import CaseStatus, DisputeType


class Case(SQLModel, table=True):
    __tablename__ = "cases"

    id: Optional[int] = Field(default=None, primary_key=True)
    reference: str = Field(index=True)  # 2026-001234

    claim_id: Optional[int] = Field(default=None, foreign_key="claims.id", index=True)
    judge_id: Optional[int] = Field(default=None, foreign_key="users.id", index=True)

    dispute_type: DisputeType = Field(default=DisputeType.CIVIL)
    title: str
    status: CaseStatus = Field(default=CaseStatus.OPEN, index=True)

    next_hearing_at: Optional[datetime] = None

    # SmartJudge generated decision draft
    decision_draft: Optional[str] = None
    decision_final: Optional[str] = None
    decision_signed_at: Optional[datetime] = None

    # SentencAI / EvidenceAnalyzer / CorruptAlert aggregated AI metadata
    ai_meta: Optional[dict] = Field(default=None, sa_column=Column(JSONB))

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class Hearing(SQLModel, table=True):
    __tablename__ = "hearings"

    id: Optional[int] = Field(default=None, primary_key=True)
    case_id: int = Field(foreign_key="cases.id", index=True)

    scheduled_at: Optional[datetime] = None
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None

    # JustiScribe transcript: list of {ts, speaker, text}
    transcript: Optional[dict] = Field(default=None, sa_column=Column(JSONB))
    audio_path: Optional[str] = None
    ai_insights: Optional[dict] = Field(default=None, sa_column=Column(JSONB))

    created_at: datetime = Field(default_factory=datetime.utcnow)
