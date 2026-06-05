"""SmartCourt AI — FastAPI application entrypoint."""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.database import init_db
from app.services.llm.ollama_client import llm
from app.ws.hearing import router as hearing_ws_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Starting {settings.APP_NAME} ...")
    await init_db()
    if await llm.is_available():
        logger.info(f"Ollama OK — models: {await llm.list_models()}")
    else:
        logger.warning("Ollama NOT available — AI endpoints will fail until it's up.")

    # Pre-warm the Whisper model in a background thread so the first live-hearing
    # clip transcribes immediately instead of paying a one-time ~8s load cost
    # (which previously dropped the first segment before the WS could deliver it).
    import asyncio

    async def _warm_whisper():
        try:
            from app.services.whisper_service import _load_model

            await asyncio.to_thread(_load_model)
            logger.info("Whisper model pre-warmed (JustiScribe ready).")
        except Exception as exc:  # noqa: BLE001
            logger.warning(f"Whisper pre-warm skipped: {exc}")

    asyncio.create_task(_warm_whisper())

    yield
    logger.info("Shutting down.")


app = FastAPI(
    title=settings.APP_NAME,
    description="O'zbekiston sud tizimi uchun AI ekotizimi — Adolat Ekotizimi",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_PREFIX)
app.include_router(hearing_ws_router)  # WebSocket at /ws/hearing/{case_id}


@app.get("/")
async def root():
    return {
        "app": settings.APP_NAME,
        "motto": "Insonparvar adolat, soniyalar ichida",
        "docs": "/docs",
        "api": settings.API_V1_PREFIX,
    }
