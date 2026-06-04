"""Generate an architecture overview PDF.

Output: tests/SmartCourt_Architecture.pdf
Visual technical overview — for sharing with technical reviewers.
"""
import os
from datetime import datetime

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
    Preformatted,
)

HERE = os.path.dirname(__file__)
OUT_PATH = os.path.join(HERE, "SmartCourt_Architecture.pdf")

FONT_REG = "DejaVu"
FONT_BOLD = "DejaVu-Bold"
FONT_MONO = "Courier"
for path in (
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    "C:/Windows/Fonts/DejaVuSans.ttf",
    "C:/Windows/Fonts/arial.ttf",
):
    if os.path.exists(path):
        pdfmetrics.registerFont(TTFont(FONT_REG, path))
        bold_path = path.replace("Sans.ttf", "Sans-Bold.ttf").replace("arial.ttf", "arialbd.ttf")
        if os.path.exists(bold_path):
            pdfmetrics.registerFont(TTFont(FONT_BOLD, bold_path))
        else:
            FONT_BOLD = FONT_REG
        break
else:
    FONT_REG = "Helvetica"
    FONT_BOLD = "Helvetica-Bold"

BLACK = colors.HexColor("#1D1D1F")
GRAY_700 = colors.HexColor("#424245")
GRAY_500 = colors.HexColor("#86868B")
GRAY_300 = colors.HexColor("#D2D2D7")
GRAY_100 = colors.HexColor("#F5F5F7")

styles = getSampleStyleSheet()
H1 = ParagraphStyle("H1", parent=styles["Heading1"], fontName=FONT_BOLD, fontSize=32,
                     leading=38, textColor=BLACK, alignment=TA_CENTER, spaceAfter=12)
H1S = ParagraphStyle("H1S", parent=styles["Heading2"], fontName=FONT_REG, fontSize=14,
                       leading=18, textColor=GRAY_500, alignment=TA_CENTER)
H2 = ParagraphStyle("H2", parent=styles["Heading2"], fontName=FONT_BOLD, fontSize=20,
                     leading=26, textColor=BLACK, spaceBefore=16, spaceAfter=10)
H3 = ParagraphStyle("H3", parent=styles["Heading3"], fontName=FONT_BOLD, fontSize=12,
                     leading=16, textColor=BLACK, spaceBefore=10, spaceAfter=6)
BODY = ParagraphStyle("Body", parent=styles["BodyText"], fontName=FONT_REG, fontSize=10,
                       leading=14, textColor=GRAY_700, spaceAfter=4)
MUTED = ParagraphStyle("Muted", parent=BODY, fontSize=9, textColor=GRAY_500)
TAG = ParagraphStyle("Tag", parent=BODY, fontSize=9, textColor=GRAY_500, alignment=TA_LEFT)


def build_cover(story):
    story.append(Spacer(1, 6 * cm))
    story.append(Paragraph("Texnik Arxitektura", H1))
    story.append(Paragraph("SmartCourt AI — Backend & AI", H1S))
    story.append(Spacer(1, 3 * cm))
    story.append(Paragraph(
        f"Sana: {datetime.now().strftime('%d.%m.%Y')}", MUTED))
    story.append(PageBreak())


def build_overview(story):
    story.append(Paragraph("1. Tizim sxemasi", H2))
    story.append(Paragraph(
        "SmartCourt AI mikroservis arxitekturasi asosida qurilgan. Barcha AI modellari host'da "
        "(Ollama orqali) ishlaydi, qolgan barcha xizmatlar Docker konteynerlarda.", BODY))
    story.append(Spacer(1, 0.3 * cm))

    diagram = """
+--------------------------------------------------------------------+
|  HOST MACHINE (Windows / Linux)                                    |
|                                                                    |
|  +--------------------------------------------------------+        |
|  |  Ollama (port 11434)                                   |        |
|  |  - llama3.2:3b        LLM (qaror, ariza tahlili)       |        |
|  |  - nomic-embed-text   Embedding (768-dim)              |        |
|  |  - qwen2.5-coder:7b   zaxira                           |        |
|  +--------------------------------------------------------+        |
|                       ^                                            |
|                       | host.docker.internal:11434                 |
|                       |                                            |
|  +--------------------+------------------------------------+       |
|  |  Docker Compose Network                                 |       |
|  |                                                         |       |
|  |  +-----------------------------------------------+      |       |
|  |  |  FastAPI Backend  (port 8000)                 |      |       |
|  |  |  - /api/v1/auth      (JWT)                    |      |       |
|  |  |  - /api/v1/claims    (CRUD)                   |      |       |
|  |  |  - /api/v1/cases     (Sudya)                  |      |       |
|  |  |  - /api/v1/ai/*      (10 ta AI moduli)        |      |       |
|  |  |  - /api/v1/admin/*   (RBAC: admin)            |      |       |
|  |  |  - /ws/hearing/*     (WebSocket)              |      |       |
|  |  +-----------------------------------------------+      |       |
|  |       |             |             |            |        |       |
|  |       v             v             v            v        |       |
|  |  +--------+   +---------+   +---------+   +---------+   |       |
|  |  | PG 16  |   | Qdrant  |   | Redis   |   | Neo4j   |   |       |
|  |  | 5432   |   | 6333    |   | 6379    |   | 7687    |   |       |
|  |  | users  |   | uz_laws |   | cache   |   | graph   |   |       |
|  |  | claims |   | preced. |   | stream  |   | corr.   |   |       |
|  |  | cases  |   |         |   |         |   | alert   |   |       |
|  |  | audit  |   |         |   |         |   |         |   |       |
|  |  +--------+   +---------+   +---------+   +---------+   |       |
|  |                                                         |       |
|  +---------------------------------------------------------+       |
|                                                                    |
+--------------------------------------------------------------------+
"""
    story.append(Preformatted(diagram, ParagraphStyle(
        "diagram", fontName="Courier", fontSize=6.8, leading=8, textColor=BLACK)))
    story.append(Spacer(1, 0.4 * cm))


def build_ai_modules(story):
    story.append(PageBreak())
    story.append(Paragraph("2. 10 ta AI moduli", H2))
    story.append(Paragraph(
        "Har bir modul alohida endpoint sifatida implementatsiya qilingan. RAG (Retrieval-"
        "Augmented Generation) qatlami SmartJudge, LexPredictor va Assistant tomonidan ishlatiladi.",
        BODY))
    story.append(Spacer(1, 0.3 * cm))

    rows = [
        ["#", "Modul", "Endpoint", "Texnologiya"],
        ["1", "ClaimValidator", "POST /ai/claim-validator", "LLM + JSON output"],
        ["2", "MediatoBot", "POST /ai/mediato-bot", "LLM + JSON output"],
        ["3", "LexPredictor", "POST /ai/lex-predictor", "RAG (Qdrant + Embed)"],
        ["4", "EvidenceAnalyzer", "POST /documents/upload", "LLM + PDF/DOCX extract"],
        ["5", "JustiScribe", "POST /justiscribe/transcribe + WS", "faster-whisper"],
        ["6", "SentencAI", "POST /ai/sentenc-ai", "LLM + JSON scoring"],
        ["7", "SmartJudge", "POST /ai/smart-judge/stream", "RAG + LLM streaming"],
        ["8", "CorruptAlert", "POST /ai/corrupt-alert/check", "Neo4j graph"],
        ["9", "AnonimusLaw", "POST /ai/anonimus-law", "REGEX + NER"],
        ["10", "AutoExec", "POST /ai/auto-exec/{id}", "API integratsiya (mock)"],
    ]
    t = Table(rows, colWidths=[0.8 * cm, 3.8 * cm, 6.5 * cm, 4.9 * cm])
    t.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (-1, 0), FONT_BOLD),
        ("FONTNAME", (0, 1), (-1, -1), FONT_REG),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("BACKGROUND", (0, 0), (-1, 0), GRAY_100),
        ("LINEBELOW", (0, 0), (-1, 0), 0.5, GRAY_300),
        ("LINEBELOW", (0, 1), (-1, -1), 0.25, GRAY_300),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]))
    story.append(t)
    story.append(Spacer(1, 0.4 * cm))

    story.append(Paragraph("RAG arxitekturasi", H3))
    rag = """
   [Ariza matni / Sud holatlari]
                |
                v
   [ nomic-embed-text ]  -->  768-dim vektor
                |
                v
   [ Qdrant Vector DB ]
        - uz_laws       (16 ta qonun moddasi)
        - uz_precedents (8 ta pretsedent)
                |
        Kosinus o'xshashligi
                |
                v
   Top 5 ta qonun + 3 ta pretsedent
                |
                v
   [ Prompt + Context ]  -->  [ llama3.2:3b ]
                |
                v
   [ Sud qarori qoralamasi ]
"""
    story.append(Preformatted(rag, ParagraphStyle(
        "rag", fontName="Courier", fontSize=8, leading=10, textColor=BLACK)))


def build_data_model(story):
    story.append(PageBreak())
    story.append(Paragraph("3. Ma'lumotlar modeli", H2))
    rows = [
        ["Jadval", "Vazifa", "Asosiy maydonlar"],
        ["users", "5 rol: citizen, judge, lawyer, admin, oversight",
         "id, email, hashed_password, role, pinfl, court_name"],
        ["claims", "Fuqaro arizalari",
         "id, claimant_id, dispute_type, title, description, amount, "
         "status, ai_validation, ai_prediction"],
        ["cases", "Sud ishlari",
         "id, reference, judge_id, decision_draft, decision_final, "
         "decision_signed_at, ai_meta"],
        ["hearings", "Sud majlislari (JustiScribe transcripti)",
         "id, case_id, transcript JSONB, audio_path, ai_insights"],
        ["documents", "Dalillar, hujjatlar",
         "id, claim_id, case_id, kind, path, mime_type, "
         "ai_analysis JSONB, extracted_text"],
        ["notifications", "Bildirishnomalar",
         "id, user_id, title, body, is_read"],
        ["audit_logs", "Xavfsizlik audit",
         "id, user_id, action, resource, ip_address, status, meta"],
    ]
    t = Table(rows, colWidths=[3 * cm, 5 * cm, 8 * cm])
    t.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (-1, 0), FONT_BOLD),
        ("FONTNAME", (0, 1), (-1, -1), FONT_REG),
        ("FONTSIZE", (0, 0), (-1, -1), 8.5),
        ("BACKGROUND", (0, 0), (-1, 0), GRAY_100),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LINEBELOW", (0, 0), (-1, 0), 0.5, GRAY_300),
        ("LINEBELOW", (0, 1), (-1, -1), 0.25, GRAY_300),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(t)
    story.append(Spacer(1, 0.4 * cm))

    story.append(Paragraph("Xavfsizlik qatlamlari", H3))
    sec_rows = [
        ["JWT", "python-jose, HS256, 7 kunlik token"],
        ["Parol", "bcrypt (12 rounds), ochiq matn yo'q"],
        ["RBAC", "5 rol, require_roles() dependency"],
        ["CORS", "Whitelist orqali (CORS_ORIGINS)"],
        ["Audit log", "Har bir muhim harakat PostgreSQL'da yoziladi"],
        ["PII Masking", "AnonimusLaw — REGEX + NER, ochiq reestrga chiqishdan oldin"],
        ["On-Premise", "Ollama lokal — ma'lumot chet elga ketmaydi"],
    ]
    t2 = Table(sec_rows, colWidths=[3.5 * cm, 12.5 * cm])
    t2.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (0, -1), FONT_BOLD),
        ("FONTNAME", (1, 0), (1, -1), FONT_REG),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LINEBELOW", (0, 0), (-1, -1), 0.25, GRAY_300),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
    ]))
    story.append(t2)


def build_endpoints(story):
    story.append(PageBreak())
    story.append(Paragraph("4. API endpointlari ro'yxati", H2))
    story.append(Paragraph(
        "Jami 30+ ta endpoint. To'liq ro'yxat va interaktiv test — http://localhost:8000/docs", BODY))
    story.append(Spacer(1, 0.3 * cm))

    categories = [
        ("Auth & profile", [
            "POST  /api/v1/auth/register",
            "POST  /api/v1/auth/login",
            "POST  /api/v1/auth/token  (OAuth2)",
            "GET   /api/v1/auth/me",
        ]),
        ("Citizen — Claims", [
            "POST  /api/v1/claims",
            "GET   /api/v1/claims",
            "GET   /api/v1/claims/{id}",
            "PATCH /api/v1/claims/{id}",
            "POST  /api/v1/claims/{id}/submit",
            "DELETE /api/v1/claims/{id}",
        ]),
        ("Judge — Cases", [
            "POST  /api/v1/cases/from-claim",
            "GET   /api/v1/cases",
            "GET   /api/v1/cases/{id}",
            "POST  /api/v1/cases/{id}/sign",
        ]),
        ("Documents (EvidenceAnalyzer)", [
            "POST  /api/v1/documents/upload",
            "GET   /api/v1/documents/claim/{id}",
        ]),
        ("AI modules (10)", [
            "POST  /api/v1/ai/claim-validator",
            "POST  /api/v1/ai/mediato-bot",
            "POST  /api/v1/ai/lex-predictor",
            "POST  /api/v1/ai/evidence-analyzer/text",
            "POST  /api/v1/ai/sentenc-ai",
            "POST  /api/v1/ai/smart-judge",
            "POST  /api/v1/ai/smart-judge/stream  (SSE)",
            "POST  /api/v1/ai/anonimus-law",
            "POST  /api/v1/ai/corrupt-alert/check",
            "POST  /api/v1/ai/auto-exec/{case_id}",
            "POST  /api/v1/ai/assistant",
            "POST  /api/v1/ai/assistant/stream  (SSE)",
            "POST  /api/v1/justiscribe/transcribe",
            "WS    /ws/hearing/{case_id}",
        ]),
        ("Admin (RBAC: admin)", [
            "GET   /api/v1/admin/users",
            "GET   /api/v1/admin/stats",
            "GET   /api/v1/admin/audit-log",
            "GET   /api/v1/admin/ai-models",
        ]),
        ("Dashboard", [
            "GET   /api/v1/dashboard/citizen",
            "GET   /api/v1/dashboard/judge",
        ]),
        ("System", [
            "GET   /api/v1/system/health",
            "GET   /api/v1/system/status",
        ]),
    ]
    for cat, eps in categories:
        story.append(Paragraph(cat, H3))
        for ep in eps:
            story.append(Preformatted(f"  {ep}", ParagraphStyle(
                "ep", fontName="Courier", fontSize=8.5, leading=11, textColor=GRAY_700,
                spaceAfter=2)))
        story.append(Spacer(1, 0.15 * cm))


def main():
    doc = SimpleDocTemplate(
        OUT_PATH,
        pagesize=A4,
        leftMargin=1.5 * cm, rightMargin=1.5 * cm,
        topMargin=2 * cm, bottomMargin=2 * cm,
        title="SmartCourt AI — Architecture",
        author="SmartCourt AI Team",
    )
    story = []
    build_cover(story)
    build_overview(story)
    build_ai_modules(story)
    build_data_model(story)
    build_endpoints(story)

    def footer(canvas, doc_):
        canvas.saveState()
        canvas.setFont(FONT_REG, 8)
        canvas.setFillColor(GRAY_500)
        canvas.drawString(1.5 * cm, 1.2 * cm, "SmartCourt AI — Texnik Arxitektura")
        canvas.drawRightString(19.5 * cm, 1.2 * cm, f"Sahifa {doc_.page}")
        canvas.restoreState()

    doc.build(story, onFirstPage=footer, onLaterPages=footer)
    size_kb = os.path.getsize(OUT_PATH) / 1024
    print(f"OK Architecture PDF: {OUT_PATH} ({size_kb:.1f} KB)")


if __name__ == "__main__":
    main()
