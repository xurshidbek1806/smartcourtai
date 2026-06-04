"""CorruptAlert — Neo4j graph service for conflict-of-interest detection.

Builds a graph of people/companies/courts and finds hidden indirect links
between case participants (e.g. judge ↔ claimant via a 3-hop relationship).
Neo4j is optional; if unavailable the service degrades gracefully.
"""
from typing import Optional

from loguru import logger

from app.core.config import settings

try:
    from neo4j import AsyncGraphDatabase
except ImportError:  # pragma: no cover
    AsyncGraphDatabase = None


class GraphService:
    def __init__(self):
        self._driver = None

    def _get_driver(self):
        if AsyncGraphDatabase is None:
            return None
        if self._driver is None:
            try:
                self._driver = AsyncGraphDatabase.driver(
                    settings.NEO4J_URI,
                    auth=(settings.NEO4J_USER, settings.NEO4J_PASSWORD),
                )
            except Exception as exc:  # noqa: BLE001
                logger.warning(f"Neo4j connect failed: {exc}")
                return None
        return self._driver

    async def is_available(self) -> bool:
        driver = self._get_driver()
        if not driver:
            return False
        try:
            await driver.verify_connectivity()
            return True
        except Exception:  # noqa: BLE001
            return False

    async def add_relation(
        self, person_a: str, person_b: str, rel_type: str, weight: float = 1.0
    ) -> bool:
        driver = self._get_driver()
        if not driver:
            return False
        query = (
            "MERGE (a:Person {name: $a}) "
            "MERGE (b:Person {name: $b}) "
            "MERGE (a)-[r:RELATED {type: $rel}]->(b) "
            "SET r.weight = $weight"
        )
        async with driver.session() as session:
            await session.run(query, a=person_a, b=person_b, rel=rel_type, weight=weight)
        return True

    async def find_path(
        self, person_a: str, person_b: str, max_hops: int = 4
    ) -> Optional[dict]:
        """Detect indirect connection between two people (conflict of interest)."""
        driver = self._get_driver()
        if not driver:
            return None
        query = (
            f"MATCH path = shortestPath("
            f"(a:Person {{name: $a}})-[*1..{max_hops}]-(b:Person {{name: $b}})) "
            f"RETURN [n IN nodes(path) | n.name] AS names, "
            f"[r IN relationships(path) | r.type] AS rels, "
            f"length(path) AS hops"
        )
        async with driver.session() as session:
            result = await session.run(query, a=person_a, b=person_b)
            record = await result.single()
            if not record:
                return {"connected": False}
            hops = record["hops"]
            risk = max(0, 100 - (hops - 1) * 25)  # closer link = higher risk
            return {
                "connected": True,
                "hops": hops,
                "chain": record["names"],
                "relations": record["rels"],
                "risk_score": risk,
                "alert": hops <= 3,
            }


graph_service = GraphService()
