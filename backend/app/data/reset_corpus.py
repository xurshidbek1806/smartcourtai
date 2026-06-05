"""Wipe the Qdrant legal-corpus collections so the seed can recreate them
with the new embedding dimension. Run inside the backend container:

    docker compose exec backend python -m app.data.reset_corpus
"""
import asyncio

from loguru import logger
from qdrant_client import AsyncQdrantClient

from app.core.config import settings


async def main():
    client = AsyncQdrantClient(url=settings.QDRANT_URL)
    for name in (settings.QDRANT_LAWS_COLLECTION, settings.QDRANT_PRECEDENTS_COLLECTION):
        try:
            await client.delete_collection(name)
            logger.info(f"Deleted collection: {name}")
        except Exception as exc:  # noqa: BLE001
            logger.warning(f"Could not delete '{name}': {exc}")
    logger.info("Done. Now run: python -m app.data.seed")


if __name__ == "__main__":
    asyncio.run(main())
