"""Application configuration loaded from environment variables."""
from functools import lru_cache
from typing import List

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )

    # App
    APP_NAME: str = "SmartCourt AI"
    APP_ENV: str = "development"
    DEBUG: bool = True
    SECRET_KEY: str = "dev-secret-change-me"
    API_V1_PREFIX: str = "/api/v1"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days
    ALGORITHM: str = "HS256"

    # CORS
    CORS_ORIGINS: str = "http://localhost:3000"

    # Database
    DATABASE_URL: str = (
        "postgresql+asyncpg://smartcourt:smartcourt_secret@localhost:5432/smartcourt"
    )

    # Ollama / LLM
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    LLM_MODEL: str = "llama3.1:8b"
    LLM_NUM_CTX: int = 4096
    # GPU layers for the LLM. -1 = let Ollama auto-place (recommended): on a
    # 6 GB card it puts the whole 8b model on GPU at ctx 4096 on its own.
    # Forcing 99 caused a cudaMalloc OOM at startup. Embeddings always run on
    # CPU (EMBED_NUM_GPU=0) so the two models never fight over the same VRAM.
    LLM_NUM_GPU: int = -1
    EMBED_MODEL: str = "bge-m3"
    EMBED_NUM_GPU: int = 0  # bge-m3 on CPU (tiny, ~150ms) — keeps VRAM free for LLM
    LLM_TEMPERATURE: float = 0.3

    # Qdrant
    QDRANT_URL: str = "http://localhost:6333"
    QDRANT_LAWS_COLLECTION: str = "uz_laws"
    QDRANT_PRECEDENTS_COLLECTION: str = "uz_precedents"
    EMBED_DIM: int = 1024

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # Neo4j
    NEO4J_URI: str = "bolt://localhost:7687"
    NEO4J_USER: str = "neo4j"
    NEO4J_PASSWORD: str = "smartcourt_graph"

    # Whisper. On GPU (cuda/float16) 'medium' does a 5 s clip in ~1-2 s with
    # good Uzbek accuracy. On CPU only 'base' keeps up (~2 s) but its Uzbek is
    # poor. The service auto-falls back to CPU if CUDA isn't available/OOMs.
    WHISPER_MODEL: str = "medium"
    WHISPER_DEVICE: str = "cuda"
    WHISPER_COMPUTE_TYPE: str = "float16"
    WHISPER_LANGUAGE: str = "uz"
    # Unload the Whisper model from VRAM after this many idle seconds so the
    # LLM can use the GPU between hearings (6 GB can't hold both at once).
    WHISPER_IDLE_UNLOAD_S: int = 45

    # Storage
    STORAGE_DIR: str = "./storage"
    MAX_UPLOAD_MB: int = 50

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
