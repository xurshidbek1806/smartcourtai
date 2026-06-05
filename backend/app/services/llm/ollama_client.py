"""Ollama client — LLM chat (sync + streaming) and embeddings.

All AI text generation in SmartCourt runs through a locally-hosted Ollama
instance (on-premise requirement). No data leaves the machine.
"""
import json
from typing import AsyncGenerator, Optional

import httpx
from loguru import logger

from app.core.config import settings


class OllamaClient:
    def __init__(
        self,
        base_url: Optional[str] = None,
        model: Optional[str] = None,
        embed_model: Optional[str] = None,
    ):
        self.base_url = (base_url or settings.OLLAMA_BASE_URL).rstrip("/")
        self.model = model or settings.LLM_MODEL
        self.embed_model = embed_model or settings.EMBED_MODEL

    # ── Health / model management ─────────────────────────────
    async def list_models(self) -> list[str]:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.get(f"{self.base_url}/api/tags")
            r.raise_for_status()
            return [m["name"] for m in r.json().get("models", [])]

    async def is_available(self) -> bool:
        try:
            await self.list_models()
            return True
        except Exception as exc:  # noqa: BLE001
            logger.warning(f"Ollama unavailable: {exc}")
            return False

    # ── Generation ────────────────────────────────────────────
    async def chat(
        self,
        prompt: str,
        system: Optional[str] = None,
        temperature: Optional[float] = None,
        model: Optional[str] = None,
        format_json: bool = False,
        num_predict: Optional[int] = None,
    ) -> str:
        """Single-shot completion (non-streaming)."""
        messages = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})

        options = {
            "temperature": temperature
            if temperature is not None
            else settings.LLM_TEMPERATURE,
            "num_ctx": settings.LLM_NUM_CTX,
            "repeat_penalty": 1.15,
        }
        if settings.LLM_NUM_GPU >= 0:
            options["num_gpu"] = settings.LLM_NUM_GPU
        if num_predict is not None:
            options["num_predict"] = num_predict

        payload = {
            "model": model or self.model,
            "messages": messages,
            "stream": False,
            "options": options,
        }
        if format_json:
            payload["format"] = "json"

        # CPU-bound 3B model can take several minutes for long contexts; set generous timeout.
        timeout = httpx.Timeout(connect=10.0, read=900.0, write=30.0, pool=10.0)
        async with httpx.AsyncClient(timeout=timeout) as client:
            r = await client.post(f"{self.base_url}/api/chat", json=payload)
            r.raise_for_status()
            return r.json()["message"]["content"]

    async def stream_chat(
        self,
        prompt: str,
        system: Optional[str] = None,
        temperature: Optional[float] = None,
        model: Optional[str] = None,
        num_predict: Optional[int] = None,
    ) -> AsyncGenerator[str, None]:
        """Token-by-token streaming (SmartJudge live generation)."""
        messages = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})

        options = {
            "temperature": temperature
            if temperature is not None
            else settings.LLM_TEMPERATURE,
            "num_ctx": settings.LLM_NUM_CTX,
            "repeat_penalty": 1.15,
        }
        if settings.LLM_NUM_GPU >= 0:
            options["num_gpu"] = settings.LLM_NUM_GPU
        if num_predict is not None:
            options["num_predict"] = num_predict

        payload = {
            "model": model or self.model,
            "messages": messages,
            "stream": True,
            "options": options,
        }

        timeout = httpx.Timeout(connect=10.0, read=900.0, write=30.0, pool=10.0)
        async with httpx.AsyncClient(timeout=timeout) as client:
            async with client.stream(
                "POST", f"{self.base_url}/api/chat", json=payload
            ) as resp:
                resp.raise_for_status()
                buffer = ""
                async for chunk_bytes in resp.aiter_bytes():
                    buffer += chunk_bytes.decode("utf-8", errors="ignore")
                    while "\n" in buffer:
                        line, buffer = buffer.split("\n", 1)
                        line = line.strip()
                        if not line:
                            continue
                        try:
                            chunk = json.loads(line)
                        except json.JSONDecodeError:
                            continue
                        token = chunk.get("message", {}).get("content", "")
                        if token:
                            yield token
                        if chunk.get("done"):
                            return

    # ── Embeddings ────────────────────────────────────────────
    # First call to bge-m3 (~1.2 GB) can take 30-90 s to load on CPU,
    # so we give the embed client a generous read timeout.
    _embed_timeout = httpx.Timeout(connect=10.0, read=300.0, write=30.0, pool=10.0)

    # Force embeddings onto CPU (num_gpu=0): bge-m3 is small and fast on CPU,
    # and keeping it off the GPU means the LLM never gets evicted from VRAM —
    # which on a 6 GB card was causing a ~30 s model swap on every request.
    _embed_options = {"num_gpu": settings.EMBED_NUM_GPU}

    async def embed(self, text: str, model: Optional[str] = None) -> list[float]:
        payload = {
            "model": model or self.embed_model,
            "input": text,
            "options": self._embed_options,
        }
        async with httpx.AsyncClient(timeout=self._embed_timeout) as client:
            r = await client.post(f"{self.base_url}/api/embed", json=payload)
            r.raise_for_status()
            data = r.json()
            embeddings = data.get("embeddings") or [data.get("embedding")]
            return embeddings[0]

    async def embed_batch(self, texts: list[str]) -> list[list[float]]:
        payload = {
            "model": self.embed_model,
            "input": texts,
            "options": self._embed_options,
        }
        async with httpx.AsyncClient(timeout=self._embed_timeout) as client:
            r = await client.post(f"{self.base_url}/api/embed", json=payload)
            r.raise_for_status()
            return r.json()["embeddings"]


# Singleton
llm = OllamaClient()
