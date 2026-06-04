"""RAG retrieval helpers — fetch laws & precedents for SmartJudge / LexPredictor."""
from app.core.config import settings
from app.services.vector_store import vector_store


async def retrieve_laws(query: str, limit: int = 5) -> list[dict]:
    return await vector_store.search(settings.QDRANT_LAWS_COLLECTION, query, limit=limit)


async def retrieve_precedents(query: str, limit: int = 3) -> list[dict]:
    return await vector_store.search(
        settings.QDRANT_PRECEDENTS_COLLECTION, query, limit=limit
    )


def format_laws(laws: list[dict]) -> str:
    if not laws:
        return ""
    blocks = []
    for law in laws:
        code = law.get("code", "")
        article = law.get("article", "")
        title = law.get("title", "")
        text = law.get("text", "")
        blocks.append(f"[{code} {article}-modda] {title}\n{text}")
    return "\n\n".join(blocks)


def format_precedents(precedents: list[dict]) -> str:
    if not precedents:
        return ""
    blocks = []
    for p in precedents:
        ref = p.get("reference", "")
        outcome = p.get("outcome", "")
        text = p.get("text", "")
        score = p.get("score", 0)
        blocks.append(
            f"[Pretsedent {ref}] (o'xshashlik: {score:.0%}) — Natija: {outcome}\n{text}"
        )
    return "\n\n".join(blocks)
