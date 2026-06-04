"""Claims endpoints — citizen dispute applications."""
from fastapi import APIRouter, HTTPException
from sqlmodel import select

from app.api.deps import CurrentUser, SessionDep
from app.models.claim import Claim
from app.models.enums import ClaimStatus
from app.schemas.claim import ClaimCreate, ClaimOut, ClaimUpdate
from app.services.utils import calculate_state_fee, generate_reference

router = APIRouter(prefix="/claims", tags=["claims"])


@router.post("", response_model=ClaimOut, status_code=201)
async def create_claim(payload: ClaimCreate, user: CurrentUser, session: SessionDep):
    claim = Claim(
        claimant_id=user.id,
        reference=generate_reference(),
        dispute_type=payload.dispute_type,
        title=payload.title,
        description=payload.description,
        amount=payload.amount,
        currency=payload.currency,
        event_date=payload.event_date,
        location=payload.location,
        respondents=payload.respondents,
        state_fee=calculate_state_fee(payload.amount, payload.dispute_type.value),
        status=ClaimStatus.DRAFT,
    )
    session.add(claim)
    await session.commit()
    await session.refresh(claim)
    return claim


@router.get("", response_model=list[ClaimOut])
async def list_my_claims(user: CurrentUser, session: SessionDep):
    result = await session.exec(
        select(Claim).where(Claim.claimant_id == user.id).order_by(Claim.created_at.desc())
    )
    return result.all()


@router.get("/{claim_id}", response_model=ClaimOut)
async def get_claim(claim_id: int, user: CurrentUser, session: SessionDep):
    claim = await session.get(Claim, claim_id)
    if not claim:
        raise HTTPException(status_code=404, detail="Ariza topilmadi")
    if claim.claimant_id != user.id and user.role.value not in ("judge", "admin", "oversight"):
        raise HTTPException(status_code=403, detail="Ruxsat yo'q")
    return claim


@router.patch("/{claim_id}", response_model=ClaimOut)
async def update_claim(
    claim_id: int, payload: ClaimUpdate, user: CurrentUser, session: SessionDep
):
    claim = await session.get(Claim, claim_id)
    if not claim:
        raise HTTPException(status_code=404, detail="Ariza topilmadi")
    if claim.claimant_id != user.id:
        raise HTTPException(status_code=403, detail="Ruxsat yo'q")

    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(claim, key, value)
    if "amount" in data:
        claim.state_fee = calculate_state_fee(claim.amount, claim.dispute_type.value)
    session.add(claim)
    await session.commit()
    await session.refresh(claim)
    return claim


@router.post("/{claim_id}/submit", response_model=ClaimOut)
async def submit_claim(claim_id: int, user: CurrentUser, session: SessionDep):
    claim = await session.get(Claim, claim_id)
    if not claim:
        raise HTTPException(status_code=404, detail="Ariza topilmadi")
    if claim.claimant_id != user.id:
        raise HTTPException(status_code=403, detail="Ruxsat yo'q")
    claim.status = ClaimStatus.SUBMITTED
    session.add(claim)
    await session.commit()
    await session.refresh(claim)
    return claim


@router.delete("/{claim_id}", status_code=204)
async def delete_claim(claim_id: int, user: CurrentUser, session: SessionDep):
    claim = await session.get(Claim, claim_id)
    if not claim:
        raise HTTPException(status_code=404, detail="Ariza topilmadi")
    if claim.claimant_id != user.id:
        raise HTTPException(status_code=403, detail="Ruxsat yo'q")
    await session.delete(claim)
    await session.commit()
