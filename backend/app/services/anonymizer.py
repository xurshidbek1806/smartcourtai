"""AnonimusLaw — PII masking for public registry publication.

Regex-based PII detection tuned for the Uzbek context (passport series,
PINFL/JSHSHIR, phone numbers, card numbers). For the MVP this is rule-based
and deterministic; an LLM/NER pass can be layered on top for names.
"""
import re
from typing import Optional

from app.services.llm.ollama_client import llm

# ── Regex patterns ───────────────────────────────────────────
PATTERNS: dict[str, re.Pattern] = {
    # Passport: 2 latin letters + 7 digits (e.g. AA1234567)
    "PASSPORT": re.compile(r"\b[A-Z]{2}\s?\d{7}\b"),
    # PINFL / JSHSHIR: 14 digits
    "PINFL": re.compile(r"\b\d{14}\b"),
    # INN: 9 digits
    "INN": re.compile(r"\b\d{9}\b"),
    # Phone: +998 XX XXX XX XX and variants
    "PHONE": re.compile(r"(?:\+998|998)?[\s\-]?\(?\d{2}\)?[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}"),
    # Card: 16 digits (grouped or not)
    "CARD": re.compile(r"\b(?:\d{4}[\s\-]?){4}\b"),
    # Email
    "EMAIL": re.compile(r"\b[\w.+-]+@[\w-]+\.[\w.-]+\b"),
}

MASKS = {
    "PASSPORT": "[PASPORT]",
    "PINFL": "[JSHSHIR]",
    "INN": "[INN]",
    "PHONE": "[TELEFON]",
    "CARD": "[KARTA]",
    "EMAIL": "[EMAIL]",
}

NER_SYSTEM = """Sen matndan shaxsiy ma'lumotlarni (ism-familiya, otasining ismi, \
aniq manzil) ajratuvchi tizimsan. FAQAT JSON ro'yxat qaytar: \
{"names": ["..."], "addresses": ["..."]}. Boshqa hech narsa yozma."""


def mask_regex(text: str) -> tuple[str, list[dict]]:
    """Apply regex-based masking. Returns (masked_text, detected_entities)."""
    detected: list[dict] = []
    masked = text
    # Order matters: card (16) before phone/pinfl to avoid partial overlaps.
    for label in ("CARD", "PINFL", "PASSPORT", "INN", "PHONE", "EMAIL"):
        pattern = PATTERNS[label]
        for m in pattern.finditer(masked):
            detected.append({"type": label, "value": m.group()})
        masked = pattern.sub(MASKS[label], masked)
    return masked, detected


async def mask_names_llm(text: str) -> list[str]:
    """Use the local LLM to detect person names (NER)."""
    import json

    try:
        out = await llm.chat(text[:4000], system=NER_SYSTEM, format_json=True, temperature=0)
        data = json.loads(out)
        return data.get("names", []) + data.get("addresses", [])
    except Exception:  # noqa: BLE001
        return []


async def anonymize(text: str, use_llm: bool = True) -> dict:
    """Full anonymization pipeline."""
    masked, detected = mask_regex(text)

    name_count = 0
    if use_llm:
        names = await mask_names_llm(text)
        for i, name in enumerate(sorted(set(names), key=len, reverse=True), start=1):
            if name and len(name) > 2 and name in masked:
                masked = masked.replace(name, f"[SHAXS_{i}]")
                detected.append({"type": "NAME", "value": name})
                name_count += 1

    return {
        "anonymized_text": masked,
        "entities_found": len(detected),
        "names_masked": name_count,
        "detail": detected,
    }
