"""Full end-to-end test of every panel and AI module.

Runs from host (or inside container). Hits http://localhost:8000.
Saves structured results to tests/results.json for the PDF reporter.
"""
import json
import os
import sys
import time
import urllib.request
import urllib.error
import ssl

BASE = os.environ.get("API_BASE", "http://localhost:8000")
API = f"{BASE}/api/v1"
RESULTS_PATH = os.path.join(os.path.dirname(__file__), "results.json")

# ── HTTP helper ─────────────────────────────────────────────
def req(method: str, path: str, *, token: str | None = None,
        json_body: dict | None = None, timeout: int = 600) -> tuple[int, dict | str, float]:
    url = f"{API}{path}" if path.startswith("/") else path
    if not url.startswith("http"):
        url = f"{API}/{url}"
    headers = {"Accept": "application/json"}
    data = None
    if json_body is not None:
        data = json.dumps(json_body).encode("utf-8")
        headers["Content-Type"] = "application/json"
    if token:
        headers["Authorization"] = f"Bearer {token}"
    request = urllib.request.Request(url, data=data, headers=headers, method=method)
    t0 = time.time()
    try:
        with urllib.request.urlopen(request, timeout=timeout, context=ssl._create_unverified_context()) as resp:
            body = resp.read().decode("utf-8", errors="replace")
            elapsed = time.time() - t0
            try:
                return resp.status, json.loads(body), elapsed
            except json.JSONDecodeError:
                return resp.status, body, elapsed
    except urllib.error.HTTPError as e:
        elapsed = time.time() - t0
        body = e.read().decode("utf-8", errors="replace")
        try:
            return e.code, json.loads(body), elapsed
        except json.JSONDecodeError:
            return e.code, body, elapsed
    except Exception as e:
        return 0, f"NETWORK ERROR: {e}", time.time() - t0


# ── Test result collector ──────────────────────────────────
RESULTS: list[dict] = []


def record(category: str, name: str, status_code: int, ok: bool,
           elapsed: float, sample: str = "", details: str = ""):
    RESULTS.append({
        "category": category,
        "name": name,
        "status_code": status_code,
        "ok": ok,
        "elapsed_ms": round(elapsed * 1000),
        "sample": sample[:600],
        "details": details,
    })
    mark = "✓" if ok else "✗"
    print(f"  {mark} [{status_code}] {name}  ({round(elapsed * 1000)}ms)")


def truncate(obj, n=300) -> str:
    s = json.dumps(obj, ensure_ascii=False) if isinstance(obj, (dict, list)) else str(obj)
    return s if len(s) <= n else s[:n] + "…"


# ── 1. AUTH & ROLES ─────────────────────────────────────────
def test_auth() -> dict[str, str]:
    print("\n═══ 1. AUTH & ROLLAR ═══")
    tokens: dict[str, str] = {}
    accounts = [
        ("fuqaro@smartcourt.uz", "Demo1234!", "citizen"),
        ("sudya@smartcourt.uz", "Demo1234!", "judge"),
        ("advokat@smartcourt.uz", "Demo1234!", "lawyer"),
        ("admin@smartcourt.uz", "Demo1234!", "admin"),
        ("nazorat@smartcourt.uz", "Demo1234!", "oversight"),
    ]
    for email, pw, role in accounts:
        status, body, elapsed = req("POST", "/auth/login",
                                     json_body={"email": email, "password": pw})
        ok = status == 200 and isinstance(body, dict) and "access_token" in body
        if ok:
            tokens[role] = body["access_token"]
        record("Auth", f"Login: {role} ({email})", status, ok, elapsed, truncate(body))

    # /me for each
    for role, tok in tokens.items():
        status, body, elapsed = req("GET", "/auth/me", token=tok)
        ok = status == 200 and isinstance(body, dict) and body.get("role") == role
        record("Auth", f"/auth/me [{role}]", status, ok, elapsed, truncate(body))

    # Invalid login
    status, body, elapsed = req("POST", "/auth/login",
                                 json_body={"email": "fuqaro@smartcourt.uz", "password": "wrong"})
    record("Auth", "Login: noto'g'ri parol (401 kutiladi)",
           status, status == 401, elapsed, truncate(body))

    # No token
    status, body, elapsed = req("GET", "/auth/me")
    record("Auth", "/auth/me tokensiz (401 kutiladi)",
           status, status == 401, elapsed, truncate(body))

    # Register (yangi foydalanuvchi)
    new_email = f"test_{int(time.time())}@smartcourt.uz"
    status, body, elapsed = req("POST", "/auth/register", json_body={
        "email": new_email, "password": "Test1234!", "full_name": "Test Foydalanuvchi",
        "role": "citizen", "phone": "+998901234567",
    })
    ok = status == 201 and isinstance(body, dict) and "access_token" in body
    record("Auth", "Yangi ro'yxatdan o'tish (201)", status, ok, elapsed, truncate(body))

    return tokens


# ── 2. CITIZEN PANEL ────────────────────────────────────────
def test_citizen(tokens: dict[str, str]) -> int | None:
    print("\n═══ 2. FUQARO PANELI ═══")
    tok = tokens.get("citizen")
    if not tok:
        print("  (citizen token yo'q — o'tkazib yuborildi)")
        return None

    # Dashboard
    status, body, elapsed = req("GET", "/dashboard/citizen", token=tok)
    record("Fuqaro paneli", "Dashboard", status, status == 200, elapsed, truncate(body))

    # Create claim
    claim_payload = {
        "dispute_type": "labor",
        "title": "Noqonuniy ishdan bo'shatish to'g'risida da'vo",
        "description": "Men 'Alfa' MChJ da 5 yil ishladim. 2026-yil 15-may kuni shtat qisqartirilishi "
                       "bahonasida ishdan bo'shatildim. Aslida shtat qisqartirilmagan, mening o'rnimga "
                       "boshqa odam olingan. Ishga tiklash va majburiy ishda yurmagan davr uchun ish "
                       "haqini undirib berishni so'rayman. Yetkazilgan zarar 12,000,000 so'm.",
        "amount": 12_000_000,
        "currency": "UZS",
        "location": "Andijon viloyati",
        "respondents": {"name": "'Alfa' MChJ", "inn": "200123456", "address": "Andijon sh."},
    }
    status, body, elapsed = req("POST", "/claims", token=tok, json_body=claim_payload)
    ok = status == 201 and isinstance(body, dict) and "id" in body
    claim_id = body.get("id") if ok else None
    record("Fuqaro paneli", "Yangi ariza yaratish (POST /claims)",
           status, ok, elapsed, truncate(body))

    # List
    status, body, elapsed = req("GET", "/claims", token=tok)
    ok = status == 200 and isinstance(body, list) and len(body) >= 1
    record("Fuqaro paneli", "Arizalarim ro'yxati", status, ok, elapsed,
           f"jami {len(body) if isinstance(body, list) else 0} ta ariza")

    if claim_id:
        # Get one
        status, body, elapsed = req("GET", f"/claims/{claim_id}", token=tok)
        record("Fuqaro paneli", f"Ariza tafsiloti #{claim_id}",
               status, status == 200, elapsed, truncate(body))

        # Update
        status, body, elapsed = req("PATCH", f"/claims/{claim_id}", token=tok,
                                     json_body={"description": claim_payload["description"] + " (yangilangan)"})
        record("Fuqaro paneli", "Arizani tahrirlash (PATCH)",
               status, status == 200, elapsed, truncate(body))

        # Submit
        status, body, elapsed = req("POST", f"/claims/{claim_id}/submit", token=tok)
        record("Fuqaro paneli", "Arizani yuborish (submit)",
               status, status == 200, elapsed, truncate(body))

    # Authorization check — fuqaro admin panelga kira olmaydi
    status, body, elapsed = req("GET", "/admin/stats", token=tok)
    record("Fuqaro paneli", "RBAC: fuqaro admin panelga kira olmasligi (403)",
           status, status == 403, elapsed, truncate(body))

    return claim_id


# ── 3. JUDGE PANEL ──────────────────────────────────────────
def test_judge(tokens: dict[str, str], claim_id: int | None) -> int | None:
    print("\n═══ 3. SUDYA PANELI ═══")
    tok = tokens.get("judge")
    if not tok:
        return None

    status, body, elapsed = req("GET", "/dashboard/judge", token=tok)
    record("Sudya paneli", "Sudya dashboard", status, status == 200, elapsed, truncate(body))

    status, body, elapsed = req("GET", "/cases", token=tok)
    record("Sudya paneli", "Mening ishlarim ro'yxati", status, status == 200, elapsed,
           f"jami {len(body) if isinstance(body, list) else 0} ta ish")

    case_id = None
    if claim_id:
        status, body, elapsed = req("POST", "/cases/from-claim", token=tok,
                                     json_body={"claim_id": claim_id})
        ok = status == 201 and isinstance(body, dict) and "id" in body
        case_id = body.get("id") if ok else None
        record("Sudya paneli", "Arizadan ish ochish (POST /cases/from-claim)",
               status, ok, elapsed, truncate(body))

        if case_id:
            status, body, elapsed = req("GET", f"/cases/{case_id}", token=tok)
            record("Sudya paneli", f"Ish tafsiloti #{case_id}",
                   status, status == 200, elapsed, truncate(body))

            # Sign decision
            status, body, elapsed = req("POST", f"/cases/{case_id}/sign", token=tok,
                                         json_body={"decision_text": "Da'vo qisman qanoatlantirildi. "
                                                                       "Ishga tiklash haqida sud qarori chiqarildi."})
            record("Sudya paneli", "Qaror imzolash (decision_signed_at)",
                   status, status == 200, elapsed, truncate(body))

    # RBAC: judge admin'ga kira olmasligi
    status, body, elapsed = req("GET", "/admin/stats", token=tok)
    record("Sudya paneli", "RBAC: sudya admin panelga kira olmasligi (403)",
           status, status == 403, elapsed, truncate(body))

    return case_id


# ── 4. ADMIN PANEL ──────────────────────────────────────────
def test_admin(tokens: dict[str, str]):
    print("\n═══ 4. ADMIN PANELI ═══")
    tok = tokens.get("admin")
    if not tok:
        return

    status, body, elapsed = req("GET", "/admin/stats", token=tok)
    record("Admin paneli", "Dashboard statistika", status, status == 200, elapsed, truncate(body))

    status, body, elapsed = req("GET", "/admin/users", token=tok)
    ok = status == 200 and isinstance(body, list) and len(body) >= 5
    record("Admin paneli", "Barcha foydalanuvchilar ro'yxati",
           status, ok, elapsed, f"jami {len(body) if isinstance(body, list) else 0} ta foydalanuvchi")

    # Filter by role
    status, body, elapsed = req("GET", "/admin/users?role=judge", token=tok)
    record("Admin paneli", "Foydalanuvchilarni rol bo'yicha filtrlash",
           status, status == 200, elapsed, truncate(body))

    status, body, elapsed = req("GET", "/admin/audit-log", token=tok)
    record("Admin paneli", "Audit log",
           status, status == 200, elapsed, f"{len(body) if isinstance(body, list) else 0} ta yozuv")

    status, body, elapsed = req("GET", "/admin/ai-models", token=tok)
    record("Admin paneli", "AI modellari holati",
           status, status == 200, elapsed, truncate(body, 400))


# ── 5. AI MODULES ───────────────────────────────────────────
def test_ai_modules(tokens: dict[str, str]):
    print("\n═══ 5. 10 ta AI MODULI ═══")
    citizen = tokens.get("citizen")
    judge = tokens.get("judge")
    oversight = tokens.get("oversight")
    if not (citizen and judge):
        return

    print("  → 1/10 ClaimValidator (Aqlli Kantselyariya)")
    status, body, elapsed = req("POST", "/ai/claim-validator", token=citizen,
        json_body={"text": "Men Akmal Karimov, Andijon viloyatida yashayman. Ish beruvchim "
                            "'Beta' MChJ meni 2026-yil aprelda noqonuniy ishdan boshatdi. "
                            "3 oylik ish haqim 9,000,000 so'm tolanmagan. Ishga tiklashni soрайман."})
    record("AI: ClaimValidator", "Erkin matnli arizani JSON ga parslash",
           status, status == 200, elapsed, truncate(body, 500))

    print("  → 2/10 MediatoBot")
    status, body, elapsed = req("POST", "/ai/mediato-bot", token=citizen, json_body={
        "dispute_type": "labor", "amount": 9_000_000,
        "description": "Xodim 3 oylik ish haqi to'lanmasligi va noqonuniy bo'shatish."})
    record("AI: MediatoBot", "Sudgacha mediatsiya taklifi",
           status, status == 200, elapsed, truncate(body, 500))

    print("  → 3/10 LexPredictor (RAG)")
    status, body, elapsed = req("POST", "/ai/lex-predictor", token=judge, json_body={
        "dispute_type": "labor", "description": "Noqonuniy ishdan bo'shatish, ishga tiklash da'vosi",
        "amount": 12_000_000})
    ok = status == 200 and isinstance(body, dict) and "win_probability" in body
    record("AI: LexPredictor", "Yutish ehtimoli + pretsedentlar",
           status, ok, elapsed, truncate(body, 500))

    print("  → 4/10 EvidenceAnalyzer")
    status, body, elapsed = req("POST", "/ai/evidence-analyzer/text", token=judge, json_body={
        "text": "Shartnoma sanasi: 2024-yil 15-mart. Tomonlar: 'Alfa' MChJ (INN 200123456) "
                "va A. Karimov. Summa: 25,000,000 so'm. Bajarish muddati: 2024-yil 30-iyun. "
                "Lekin yetkazib beruvchi tovarni yetkazmagan. Avans 10 mln. so'm to'langan."})
    record("AI: EvidenceAnalyzer", "Hujjatdan huquqiy faktlar ajratish",
           status, status == 200, elapsed, truncate(body, 500))

    print("  → 5/10 SentencAI")
    status, body, elapsed = req("POST", "/ai/sentenc-ai", token=judge, json_body={
        "offense": "Firibgarlik (JK 168-modda), 50 mln so'm zarar",
        "circumstances": "Ayblanuvchi aybiga iqror, zararni qopladi, jabrlanuvchi bilan yarashdi, "
                          "ilgari sudlanmagan, oilada 3 bola bor."})
    record("AI: SentencAI", "Jazo diapazoni hisoblash",
           status, status == 200, elapsed, truncate(body, 500))

    print("  → 6/10 SmartJudge (non-streaming, 30-60s)")
    status, body, elapsed = req("POST", "/ai/smart-judge", token=judge, json_body={
        "dispute_type": "labor",
        "title": "Ishga tiklash va ish haqi undirish to'g'risida",
        "facts": "Xodim shtat qisqartirilishi bahonasida noqonuniy ishdan boshatilgan. "
                  "Shtat aslida qisqartirilmagan, o'rniga boshqa odam olingan. 3 oylik ish haqi "
                  "ham to'lanmagan, jami 9 mln so'm.",
        "parties": "Da'vogar: A. Karimov; Javobgar: 'Alfa' MChJ"}, timeout=600)
    ok = status == 200 and isinstance(body, dict) and len(body.get("draft", "")) > 50
    draft_len = len(body.get("draft", "")) if isinstance(body, dict) else 0
    record("AI: SmartJudge", f"Sud qarori qoralamasi ({draft_len} belgi)",
           status, ok, elapsed, truncate(body.get("draft", "") if isinstance(body, dict) else body, 600))

    print("  → 7/10 AnonimusLaw")
    status, body, elapsed = req("POST", "/ai/anonimus-law", token=oversight or judge, json_body={
        "text": "Akmal Karimov, JSHSHIR: 12345678901234, pasport seriyasi AA1234567, "
                 "telefon +998901234567, email akmal@example.com, karta 8600123456789012. "
                 "Manzil: Andijon shahri, A.Navoiy ko'chasi.",
        "use_llm": False})
    ok = status == 200 and isinstance(body, dict) and body.get("entities_found", 0) >= 5
    record("AI: AnonimusLaw", "Shaxsiy ma'lumotlarni maskalash (PII)",
           status, ok, elapsed, truncate(body, 500))

    print("  → 8/10 CorruptAlert (Neo4j optional)")
    status, body, elapsed = req("POST", "/ai/corrupt-alert/check", token=oversight or judge,
        json_body={"person_a": "Karimov A.", "person_b": "Toshev B.", "max_hops": 3})
    ok = status in (200, 503)
    record("AI: CorruptAlert", "Aloqalar grafidan tekshirish (Neo4j)",
           status, ok, elapsed, truncate(body, 300))

    print("  → 9/10 AutoExec")
    status, body, elapsed = req("POST", "/ai/auto-exec/1", token=oversight or judge)
    record("AI: AutoExec", "Avto-ijro (bank/MIB/FHDYo mock)",
           status, status == 200, elapsed, truncate(body, 400))

    print("  → 10/10 AI Legal Assistant (Chatbot)")
    status, body, elapsed = req("POST", "/ai/assistant", token=citizen, json_body={
        "message": "Mehnat nizoni qanday hal qilaman?", "use_context": True})
    ok = status == 200 and isinstance(body, dict) and len(body.get("answer", "")) > 30
    record("AI: Assistant", "Yuridik chatbot (RAG + LLM)",
           status, ok, elapsed, truncate(body.get("answer", "") if isinstance(body, dict) else body, 500))


# ── 6. SYSTEM HEALTH ────────────────────────────────────────
def test_system():
    print("\n═══ 6. TIZIM HOLATI ═══")
    status, body, elapsed = req("GET", "/system/health")
    record("Tizim", "/system/health", status, status == 200, elapsed, truncate(body))

    status, body, elapsed = req("GET", "/system/status")
    record("Tizim", "/system/status (to'liq holat)",
           status, status == 200, elapsed, truncate(body, 600))


# ── Entry ───────────────────────────────────────────────────
def main():
    print(f"╔{'═'*58}╗")
    print(f"║  SmartCourt AI — TO'LIQ E2E TEST                         ║")
    print(f"║  API: {BASE:<50} ║")
    print(f"╚{'═'*58}╝")
    t_start = time.time()

    test_system()
    tokens = test_auth()
    claim_id = test_citizen(tokens)
    case_id = test_judge(tokens, claim_id)
    test_admin(tokens)
    test_ai_modules(tokens)

    total_elapsed = time.time() - t_start
    passed = sum(1 for r in RESULTS if r["ok"])
    failed = len(RESULTS) - passed

    summary = {
        "total": len(RESULTS),
        "passed": passed,
        "failed": failed,
        "pass_rate": round(100 * passed / max(1, len(RESULTS)), 1),
        "total_elapsed_s": round(total_elapsed, 2),
        "results": RESULTS,
    }
    with open(RESULTS_PATH, "w", encoding="utf-8") as f:
        json.dump(summary, f, ensure_ascii=False, indent=2)

    print(f"\n{'─'*60}")
    print(f"  JAMI: {len(RESULTS)} test | ✓ {passed} muvaffaqiyatli | ✗ {failed} xato")
    print(f"  Muvaffaqiyat: {summary['pass_rate']}%  |  Umumiy vaqt: {total_elapsed:.1f}s")
    print(f"  Natijalar: {RESULTS_PATH}")

    sys.exit(0 if failed == 0 else 1)


if __name__ == "__main__":
    main()
