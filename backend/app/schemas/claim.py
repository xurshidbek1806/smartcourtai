"""Claim & case schemas."""
from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel

from app.models.enums import CaseStatus, ClaimStatus, DisputeType


class ClaimCreate(BaseModel):
    dispute_type: DisputeType = DisputeType.CIVIL
    title: str
    description: str = ""
    amount: Optional[float] = None
    currency: str = "UZS"
    event_date: Optional[datetime] = None
    location: Optional[str] = None
    respondents: Optional[dict] = None


class ClaimUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    amount: Optional[float] = None
    status: Optional[ClaimStatus] = None
    respondents: Optional[dict] = None


class ClaimOut(BaseModel):
    id: int
    reference: Optional[str]
    claimant_id: int
    dispute_type: DisputeType
    title: str
    description: str
    amount: Optional[float]
    currency: str
    status: ClaimStatus
    ai_validation: Optional[dict]
    ai_prediction: Optional[dict]
    mediation_suggestion: Optional[dict]
    state_fee: Optional[float]
    created_at: datetime

    class Config:
        from_attributes = True


class CaseOut(BaseModel):
    id: int
    reference: str
    claim_id: Optional[int]
    judge_id: Optional[int]
    dispute_type: DisputeType
    title: str
    status: CaseStatus
    next_hearing_at: Optional[datetime]
    decision_draft: Optional[str]
    decision_final: Optional[str]
    ai_meta: Optional[dict]
    created_at: datetime

    class Config:
        from_attributes = True
