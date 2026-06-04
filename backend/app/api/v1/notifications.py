"""Notifications endpoints."""
from fastapi import APIRouter, HTTPException
from sqlmodel import select

from app.api.deps import CurrentUser, SessionDep
from app.models.notification import Notification

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("")
async def list_notifications(user: CurrentUser, session: SessionDep):
    result = await session.exec(
        select(Notification)
        .where(Notification.user_id == user.id)
        .order_by(Notification.created_at.desc())
    )
    return result.all()


@router.get("/unread-count")
async def unread_count(user: CurrentUser, session: SessionDep):
    result = await session.exec(
        select(Notification).where(
            Notification.user_id == user.id, Notification.is_read == False  # noqa: E712
        )
    )
    return {"count": len(result.all())}


@router.post("/{notif_id}/read")
async def mark_read(notif_id: int, user: CurrentUser, session: SessionDep):
    notif = await session.get(Notification, notif_id)
    if not notif or notif.user_id != user.id:
        raise HTTPException(status_code=404, detail="Topilmadi")
    notif.is_read = True
    session.add(notif)
    await session.commit()
    return {"status": "ok"}
