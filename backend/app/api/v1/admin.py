"""Admin endpoints — users, stats, audit log, AI model management."""
from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlmodel import select

from app.api.deps import SessionDep, require_roles
from app.models.audit import AuditLog
from app.models.case import Case
from app.models.claim import Claim
from app.models.enums import UserRole
from app.models.user import User
from app.schemas.auth import UserOut
from app.services.graph_service import graph_service
from app.services.llm.ollama_client import llm
from app.services.vector_store import vector_store
from app.core.config import settings

router = APIRouter(
    prefix="/admin",
    tags=["admin"],
    dependencies=[Depends(require_roles(UserRole.ADMIN))],
)


@router.get("/users", response_model=list[UserOut])
async def list_users(session: SessionDep, role: UserRole | None = None):
    query = select(User)
    if role:
        query = query.where(User.role == role)
    result = await session.exec(query.order_by(User.created_at.desc()))
    return result.all()


@router.get("/stats")
async def dashboard_stats(session: SessionDep):
    total_users = (await session.exec(select(func.count(User.id)))).one()
    total_claims = (await session.exec(select(func.count(Claim.id)))).one()
    total_cases = (await session.exec(select(func.count(Case.id)))).one()
    return {
        "total_users": total_users,
        "total_claims": total_claims,
        "total_cases": total_cases,
    }


@router.get("/audit-log")
async def audit_log(session: SessionDep, limit: int = 100):
    result = await session.exec(
        select(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit)
    )
    return result.all()


@router.get("/ai-models")
async def ai_models():
    """List Ollama models + vector store status (AI models management page)."""
    available = await llm.is_available()
    models = await llm.list_models() if available else []
    return {
        "ollama_available": available,
        "active_llm": settings.LLM_MODEL,
        "active_embed": settings.EMBED_MODEL,
        "installed_models": models,
        "vector_store": {
            "laws": await vector_store.count(settings.QDRANT_LAWS_COLLECTION),
            "precedents": await vector_store.count(settings.QDRANT_PRECEDENTS_COLLECTION),
        },
        "neo4j_available": await graph_service.is_available(),
    }
