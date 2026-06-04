# SmartCourt AI — Backend

> **Adolat Ekotizimi** — O'zbekiston sud tizimi uchun AI platformasi
> *"Insonparvar adolat, soniyalar ichida"*

To'liq lokal (on-premise) ishlovchi AI backend. Hech qanday ma'lumot tashqi
cloud'larga (OpenAI, AWS) yuborilmaydi — barcha modellar mahalliy Ollama orqali.

---

## Texnologik stack

| Qatlam | Texnologiya |
|--------|-------------|
| API | FastAPI (Python 3.11) |
| LLM | Ollama — `llama3.2:3b` |
| Embeddings | Ollama — `nomic-embed-text` (768-dim) |
| Speech-to-Text | faster-whisper (CPU, int8) |
| Relational DB | PostgreSQL 16 |
| Vector DB | Qdrant (qonunlar + pretsedentlar) |
| Cache | Redis |
| Graph DB | Neo4j (CorruptAlert — ixtiyoriy) |
| Auth | JWT (python-jose) + bcrypt |

---

## 10 ta AI moduli

| # | Modul | Endpoint | Tavsif |
|---|-------|----------|--------|
| 1 | **ClaimValidator** | `POST /ai/claim-validator` | Erkin matnli arizani JSON ga parslash |
| 2 | **MediatoBot** | `POST /ai/mediato-bot` | Sudgacha mediatsiya taklifi |
| 3 | **LexPredictor** | `POST /ai/lex-predictor` | Yutish ehtimoli + pretsedentlar (RAG) |
| 4 | **EvidenceAnalyzer** | `POST /documents/upload` | Dalil tahlili (PDF/DOCX fakt ajratish) |
| 5 | **JustiScribe** | `POST /justiscribe/transcribe` + WS | Audio → matn (stenogramma) |
| 6 | **SentencAI** | `POST /ai/sentenc-ai` | Jazo diapazoni hisoblash |
| 7 | **SmartJudge** | `POST /ai/smart-judge/stream` | Sud qarori qoralamasi (token streaming) |
| 8 | **CorruptAlert** | `POST /ai/corrupt-alert/check` | Manfaatlar to'qnashuvi (Neo4j graf) |
| 9 | **AnonimusLaw** | `POST /ai/anonimus-law` | Shaxsiy ma'lumotlarni maskalash (PII) |
| 10 | **AutoExec** | `POST /ai/auto-exec/{case_id}` | Avto-ijro (bank/MIB mock) |

Bonus: **AI Yuridik Maslahatchi** — `POST /ai/assistant/stream` (chatbot, RAG).

---

## Ishga tushirish

### 1. Talablar
- Docker Desktop (ishlab turgan bo'lsin)
- Ollama (host'da o'rnatilgan) + modellar:

```bash
ollama pull llama3.2:3b
ollama pull nomic-embed-text
```

### 2. Stack'ni ishga tushirish

```bash
cd backend
cp .env.example .env          # birinchi marta
docker compose up -d --build  # core servislar (postgres, qdrant, redis, backend)
```

Neo4j (CorruptAlert) bilan:
```bash
docker compose --profile graph up -d
```

### 3. Demo ma'lumotlarni yuklash (foydalanuvchilar + qonun korpusi)

```bash
docker compose exec backend python -m app.data.seed
```

### 4. Tekshirish

- API: http://localhost:8000
- Swagger docs: http://localhost:8000/docs
- Holat: http://localhost:8000/api/v1/system/status

---

## Demo foydalanuvchilar

Parol (barchasi): `Demo1234!`

| Email | Rol |
|-------|-----|
| `fuqaro@smartcourt.uz` | Fuqaro |
| `sudya@smartcourt.uz` | Sudya |
| `advokat@smartcourt.uz` | Advokat |
| `admin@smartcourt.uz` | Admin |
| `nazorat@smartcourt.uz` | Nazorat |

---

## Arxitektura

```
Host (Windows):  Ollama (llama3.2:3b + nomic-embed-text)
       ▲ host.docker.internal:11434
       │
Docker Compose:
  ├── backend    :8000   FastAPI
  ├── postgres   :5432   users, claims, cases
  ├── qdrant     :6333   laws + precedents (vectors)
  ├── redis      :6379   cache / streaming
  └── neo4j      :7687   CorruptAlert (optional, --profile graph)
```

## Loyiha tuzilishi

```
backend/
├── app/
│   ├── main.py              # FastAPI entrypoint
│   ├── core/                # config, database, security
│   ├── models/              # SQLModel ORM
│   ├── schemas/             # Pydantic request/response
│   ├── api/v1/              # routers (auth, claims, cases, ai, admin...)
│   ├── services/            # LLM, vector store, RAG, whisper, anonymizer, graph
│   ├── ws/                  # WebSocket (live hearing)
│   └── data/                # legal corpus + seed script
├── docker-compose.yml
├── Dockerfile
└── requirements.txt
```
