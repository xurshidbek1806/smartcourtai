"""Claim model — citizen-submitted dispute application (ariza)."""
from datetime import datetime
from typing import Optional

from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import JSONB
from sqlmodel import Field, SQLModel

from app.models.enums import ClaimStatus, DisputeType


class Claim(SQLModel, table=True):
    __tablename__ = "claims"

    id: Optional[int] = Field(default=None, primary_key=True)
    reference: Optional[str] = Field(default=None, index=True)  # 2026-001234

    claimant_id: int = Field(foreign_key="users.id", index=True)

    dispute_type: DisputeType = Field(default=DisputeType.CIVIL)
    title: str
    description: str = Field(default="")
    amount: Optional[float] = None
    currency: str = Field(default="UZS")
    event_date: Optional[datetime] = None
    location: Optional[str] = None

    # Respondent (javobgar) — stored as JSON for flexibility (one or many)
    respondents: Optional[dict] = Field(default=None, sa_column=Column(JSONB))

    status: ClaimStatus = Field(default=ClaimStatus.DRAFT, index=True)

    # ── AI fields ────────────────────────────────────────────
    # ClaimValidator output (structured parse + jurisdiction + gaps)
    ai_validation: Optional[dict] = Field(default=None, sa_column=Column(JSONB))
    # LexPredictor output (win probability, similar cases)
    ai_prediction: Optional[dict] = Field(default=None, sa_column=Column(JSONB))
    # MediatoBot suggestion
    mediation_suggestion: Optional[dict] = Field(default=None, sa_column=Column(JSONB))

    state_fee: Optional[float] = None  # davlat boji

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
