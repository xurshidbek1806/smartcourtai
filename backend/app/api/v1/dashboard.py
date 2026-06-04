"""Role-specific dashboard summaries (citizen / judge)."""
from fastapi import APIRouter
from sqlalchemy import func
from sqlmodel import select

from app.api.deps import CurrentUser, SessionDep
from app.models.case import Case
from app.models.claim import Claim
from app.models.enums import CaseStatus, ClaimStatus, UserRole

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/citizen")
async def citizen_dashboard(user: CurrentUser, session: SessionDep):
    result = await session.exec(
        select(Claim).where(Claim.claimant_id == user.id).order_by(Claim.created_at.desc())
    )
    claims = result.all()
    active = [c for c in claims if c.status not in (ClaimStatus.REJECTED, ClaimStatus.DRAFT)]
    return {
        "greeting_name": user.full_name,
        "total_claims": len(claims),
        "active_claims": len(active),
        "drafts": len([c for c in claims if c.status == ClaimStatus.DRAFT]),
        "recent": [
            {"id": c.id, "reference": c.reference, "title": c.title, "status": c.status}
            for c in claims[:5]
        ],
    }


@router.get("/judge")
async def judge_dashboard(user: CurrentUser, session: SessionDep):
    if user.role != UserRole.JUDGE:
        return {"detail": "Faqat sudya"}
    result = await session.exec(select(Case).where(Case.judge_id == user.id))
    cases = result.all()
    norm = 16  # international monthly norm
    return {
        "judge_name": user.full_name,
        "court": user.court_name,
        "total_cases": len(cases),
        "active_cases": len([c for c in cases if c.status == CaseStatus.IN_HEARING]),
        "pending": len([c for c in cases if c.status == CaseStatus.PENDING]),
        "decided": len([c for c in cases if c.status == CaseStatus.DECIDED]),
        "monthly_norm": norm,
        "ai_drafts_ready": len([c for c in cases if c.decision_draft]),
        "today_cases": [
            {"id": c.id, "reference": c.reference, "title": c.title, "status": c.status}
            for c in cases[:8]
        ],
    }
