"""AI module request/response schemas."""
from typing import Optional

from pydantic import BaseModel


class ValidateClaimRequest(BaseModel):
    text: str


class PredictRequest(BaseModel):
    dispute_type: Optional[str] = None
    description: str
    amount: Optional[float] = None


class SmartJudgeRequest(BaseModel):
    case_id: Optional[int] = None
    dispute_type: Optional[str] = None
    title: str
    facts: str
    parties: Optional[str] = None


class MediationRequest(BaseModel):
    dispute_type: Optional[str] = None
    description: str
    amount: Optional[float] = None


class SentencingRequest(BaseModel):
    offense: str
    circumstances: str


class AnonymizeRequest(BaseModel):
    text: str
    use_llm: bool = True


class ChatMessage(BaseModel):
    message: str
    use_context: bool = True


class GraphRelationRequest(BaseModel):
    person_a: str
    person_b: str
    rel_type: str
    weight: float = 1.0


class ConflictCheckRequest(BaseModel):
    person_a: str
    person_b: str
    max_hops: int = 4
