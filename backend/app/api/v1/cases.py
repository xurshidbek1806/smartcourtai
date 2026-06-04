"""Cases endpoints — court proceedings (judge side)."""
from datetime import datetime

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from sqlmodel import select

from app.api.deps import CurrentUser, SessionDep
from app.models.case import Case
from app.models.claim import Claim
from app.models.enums import CaseStatus, ClaimStatus, UserRole
from app.schemas.claim import CaseOut
from app.services.utils import generate_reference

router = APIRouter(prefix="/cases", tags=["cases"])


class CaseFromClaim(BaseModel):
    claim_id: int
    judge_id: int | None = None


class SignDecision(BaseModel):
    decision_text: str


@router.post("/from-claim", response_model=CaseOut, status_code=201)
async def open_case_from_claim(
    payload: CaseFromClaim, user: CurrentUser, session: SessionDep
):
    """Accept a claim into court — creates a Case (judge/admin only)."""
    if user.role not in (UserRole.JUDGE, UserRole.ADMIN):
        raise HTTPException(status_code=403, detail="Faqat sudya yoki admin")
    claim = await session.get(Claim, payload.claim_id)
    if not claim:
        raise HTTPException(status_code=404, detail="Ariza topilmadi")

    case = Case(
        reference=claim.reference or generate_reference(),
        claim_id=claim.id,
        judge_id=payload.judge_id or (user.id if user.role == UserRole.JUDGE else None),
        dispute_type=claim.dispute_type,
        title=claim.title,
        status=CaseStatus.OPEN,
    )
    claim.status = ClaimStatus.ACCEPTED
    session.add(case)
    session.add(claim)
    await session.commit()
    await session.refresh(case)
    return case


@router.get("", response_model=list[CaseOut])
async def list_cases(user: CurrentUser, session: SessionDep, status: CaseStatus | None = None):
    query = select(Case)
    if user.role == UserRole.JUDGE:
        query = query.where(Case.judge_id == user.id)
    if status:
        query = query.where(Case.status == status)
    result = await session.exec(query.order_by(Case.created_at.desc()))
    return result.all()


@router.get("/{case_id}", response_model=CaseOut)
async def get_case(case_id: int, user: CurrentUser, session: SessionDep):
    case = await session.get(Case, case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Ish topilmadi")
    return case


@router.post("/{case_id}/sign", response_model=CaseOut)
async def sign_decision(
    case_id: int, payload: SignDecision, user: CurrentUser, session: SessionDep
):
    """Judge signs the final decision (human-in-the-loop)."""
    if user.role != UserRole.JUDGE:
        raise HTTPException(status_code=403, detail="Faqat sudya imzolay oladi")
    case = await session.get(Case, case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Ish topilmadi")
    case.decision_final = payload.decision_text
    case.decision_signed_at = datetime.utcnow()
    case.status = CaseStatus.DECIDED
    session.add(case)
    await session.commit()
    await session.refresh(case)
    return case
