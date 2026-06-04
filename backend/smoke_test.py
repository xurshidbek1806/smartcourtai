"""Quick end-to-end smoke test of the SmartCourt AI API.

Usage (from host, after `docker compose up` and seeding):
    python smoke_test.py
"""
import sys

import httpx

BASE = "http://localhost:8000"
API = f"{BASE}/api/v1"


def section(name: str):
    print(f"\n{'='*60}\n  {name}\n{'='*60}")


def main():
    client = httpx.Client(timeout=300, base_url=API)

    section("1. System status")
    r = client.get("/system/status")
    print(r.status_code, r.json())

    section("2. Login (demo sudya)")
    r = client.post("/auth/login", json={"email": "sudya@smartcourt.uz", "password": "Demo1234!"})
    if r.status_code != 200:
        print("LOGIN FAILED — did you seed? `docker compose exec backend python -m app.data.seed`")
        print(r.status_code, r.text)
        sys.exit(1)
    token = r.json()["access_token"]
    print("token OK, role:", r.json()["role"])
    auth = {"Authorization": f"Bearer {token}"}

    section("3. ClaimValidator")
    r = client.post(
        "/ai/claim-validator",
        headers=auth,
        json={
            "text": "Men Akmal Karimov, ish beruvchim meni asossiz ishdan boshatdi. "
            "3 oylik ish haqim 9 million sum tolanmagan. Ishga tiklashni so20rayman."
        },
    )
    print(r.status_code)
    print(r.json())

    section("4. LexPredictor")
    r = client.post(
        "/ai/lex-predictor",
        headers=auth,
        json={"dispute_type": "labor", "description": "Noqonuniy ishdan boshatish, ishga tiklash"},
    )
    print(r.status_code, r.json())

    section("5. AnonimusLaw")
    r = client.post(
        "/ai/anonimus-law",
        headers=auth,
        json={"text": "Akmal Karimov, pasport AA1234567, tel +998901234567", "use_llm": False},
    )
    print(r.status_code, r.json())

    section("6. SmartJudge (non-streaming, may take 20-40s on CPU)")
    r = client.post(
        "/ai/smart-judge",
        headers=auth,
        json={
            "dispute_type": "labor",
            "title": "Ishga tiklash to'g'risida",
            "facts": "Xodim shtat qisqartirilishi bahonasida ishdan boshatilgan, "
            "lekin shtat aslida qisqartirilmagan.",
            "parties": "Da'vogar: A.Karimov; Javobgar: 'Alfa' MChJ",
        },
    )
    print(r.status_code)
    data = r.json()
    print("Draft (first 400 chars):\n", data.get("draft", "")[:400])
    print("Laws used:", data.get("laws_used"))

    print("\n✓ Smoke test complete.")


if __name__ == "__main__":
    main()
