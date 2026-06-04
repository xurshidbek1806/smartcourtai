"""System health & status endpoints (public)."""
from fastapi import APIRouter

from app.core.config import settings
from app.services.graph_service import graph_service
from app.services.llm.ollama_client import llm
from app.services.vector_store import vector_store

router = APIRouter(prefix="/system", tags=["system"])


@router.get("/health")
async def health():
    return {"status": "ok", "app": settings.APP_NAME}


@router.get("/status")
async def status():
    """Full stack status — useful for the admin system-health page."""
    ollama_ok = await llm.is_available()
    return {
        "app": settings.APP_NAME,
        "env": settings.APP_ENV,
        "services": {
            "ollama": {
                "available": ollama_ok,
                "llm_model": settings.LLM_MODEL,
                "embed_model": settings.EMBED_MODEL,
                "models": (await llm.list_models()) if ollama_ok else [],
            },
            "qdrant": {
                "laws": await vector_store.count(settings.QDRANT_LAWS_COLLECTION),
                "precedents": await vector_store.count(settings.QDRANT_PRECEDENTS_COLLECTION),
            },
            "neo4j": {"available": await graph_service.is_available()},
        },
    }
