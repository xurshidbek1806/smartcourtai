"""Qdrant vector store — legal corpus & precedents (LexPredictor, RAG)."""
import uuid
from typing import Optional

from loguru import logger
from qdrant_client import AsyncQdrantClient
from qdrant_client.models import Distance, PointStruct, VectorParams

from app.core.config import settings
from app.services.llm.ollama_client import llm


class VectorStore:
    def __init__(self):
        self.client = AsyncQdrantClient(url=settings.QDRANT_URL)
        self.dim = settings.EMBED_DIM

    async def ensure_collection(self, name: str) -> None:
        existing = await self.client.get_collections()
        names = {c.name for c in existing.collections}
        if name not in names:
            await self.client.create_collection(
                collection_name=name,
                vectors_config=VectorParams(size=self.dim, distance=Distance.COSINE),
            )
            logger.info(f"Created Qdrant collection: {name}")

    async def upsert(self, collection: str, items: list[dict]) -> int:
        """items: [{text, payload}]. Embeds text via Ollama and stores."""
        await self.ensure_collection(collection)
        points: list[PointStruct] = []
        for item in items:
            vector = await llm.embed(item["text"])
            points.append(
                PointStruct(
                    id=str(uuid.uuid4()),
                    vector=vector,
                    payload={"text": item["text"], **item.get("payload", {})},
                )
            )
        if points:
            await self.client.upsert(collection_name=collection, points=points)
        return len(points)

    async def search(
        self, collection: str, query: str, limit: int = 5, score_threshold: Optional[float] = None
    ) -> list[dict]:
        try:
            await self.ensure_collection(collection)
            vector = await llm.embed(query)
            results = await self.client.search(
                collection_name=collection,
                query_vector=vector,
                limit=limit,
                score_threshold=score_threshold,
            )
            return [
                {"score": r.score, **(r.payload or {})} for r in results
            ]
        except Exception as exc:  # noqa: BLE001
            logger.warning(f"Vector search failed for '{collection}': {exc}")
            return []

    async def count(self, collection: str) -> int:
        try:
            res = await self.client.count(collection_name=collection)
            return res.count
        except Exception:  # noqa: BLE001
            return 0


vector_store = VectorStore()
