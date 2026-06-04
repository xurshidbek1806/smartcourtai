"""Seed script — load legal corpus into Qdrant and create demo users.

Run inside the backend container:
    docker compose exec backend python -m app.data.seed
"""
import asyncio
import json
import os

from loguru import logger
from sqlmodel import select

from app.core.config import settings
from app.core.database import async_session_maker, init_db
from app.core.security import hash_password
from app.models.enums import UserRole
from app.models.user import User
from app.services.vector_store import vector_store

DATA_DIR = os.path.dirname(__file__)


async def seed_laws():
    with open(os.path.join(DATA_DIR, "laws_sample.json"), encoding="utf-8") as f:
        laws = json.load(f)
    items = [
        {
            "text": f"{law['code']} {law['article']}-modda. {law['title']}. {law['text']}",
            "payload": law,
        }
        for law in laws
    ]
    n = await vector_store.upsert(settings.QDRANT_LAWS_COLLECTION, items)
    logger.info(f"Seeded {n} laws into Qdrant.")


async def seed_precedents():
    with open(os.path.join(DATA_DIR, "precedents_sample.json"), encoding="utf-8") as f:
        precedents = json.load(f)
    items = [{"text": p["text"], "payload": p} for p in precedents]
    n = await vector_store.upsert(settings.QDRANT_PRECEDENTS_COLLECTION, items)
    logger.info(f"Seeded {n} precedents into Qdrant.")


DEMO_USERS = [
    ("fuqaro@smartcourt.uz", "Demo Fuqaro", UserRole.CITIZEN),
    ("sudya@smartcourt.uz", "Karimov Alisher Akramovich", UserRole.JUDGE),
    ("advokat@smartcourt.uz", "Demo Advokat", UserRole.LAWYER),
    ("admin@smartcourt.uz", "Tizim Administratori", UserRole.ADMIN),
    ("nazorat@smartcourt.uz", "Nazorat Xodimi", UserRole.OVERSIGHT),
]


async def seed_users():
    async with async_session_maker() as session:
        for email, name, role in DEMO_USERS:
            existing = await session.exec(select(User).where(User.email == email))
            if existing.first():
                continue
            user = User(
                email=email,
                hashed_password=hash_password("Demo1234!"),
                full_name=name,
                role=role,
                is_verified=True,
                court_name="Andijon viloyat sudi" if role == UserRole.JUDGE else None,
            )
            session.add(user)
        await session.commit()
    logger.info(f"Seeded {len(DEMO_USERS)} demo users (parol: Demo1234!).")


async def main():
    logger.info("Initializing database...")
    await init_db()
    logger.info("Seeding demo users...")
    await seed_users()
    logger.info("Seeding legal corpus into Qdrant (embedding via Ollama)...")
    await seed_laws()
    await seed_precedents()
    logger.info("✓ Seed complete.")


if __name__ == "__main__":
    asyncio.run(main())
