"""Aggregate v1 API router."""
from fastapi import APIRouter

from app.api.v1 import (
    admin,
    ai,
    auth,
    cases,
    claims,
    dashboard,
    documents,
    justiscribe,
    notifications,
    system,
)

api_router = APIRouter()
api_router.include_router(system.router)
api_router.include_router(auth.router)
api_router.include_router(dashboard.router)
api_router.include_router(claims.router)
api_router.include_router(cases.router)
api_router.include_router(documents.router)
api_router.include_router(notifications.router)
api_router.include_router(ai.router)
api_router.include_router(justiscribe.router)
api_router.include_router(admin.router)
