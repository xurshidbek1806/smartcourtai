"""Generate a single polished PDF combining all 3 mentor pitches.

Output: tests/SmartCourt_Mentor_Pitch.pdf
Apple-minimalist black/white aesthetic.
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
    KeepTogether,
)

HERE = os.path.dirname(__file__)
OUT_PATH = os.path.join(HERE, "SmartCourt_Mentor_Pitch.pdf")

FONT_REG = "DejaVu"
FONT_BOLD = "DejaVu-Bold"
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
H1 = ParagraphStyle("H1", parent=styles["Heading1"], fontName=FONT_BOLD, fontSize=36,
                     leading=42, textColor=BLACK, spaceBefore=0, spaceAfter=8)
H1_SUB = ParagraphStyle("H1Sub", parent=styles["Heading2"], fontName=FONT_REG, fontSize=14,
                          leading=20, textColor=GRAY_500, alignment=TA_CENTER, spaceBefore=0,
                          spaceAfter=12)
H2 = ParagraphStyle("H2", parent=styles["Heading2"], fontName=FONT_BOLD, fontSize=22,
                     leading=28, textColor=BLACK, spaceBefore=20, spaceAfter=12)
H3 = ParagraphStyle("H3", parent=styles["Heading3"], fontName=FONT_BOLD, fontSize=14,
                     leading=18, textColor=BLACK, spaceBefore=14, spaceAfter=6)
BODY = ParagraphStyle("Body", parent=styles["BodyText"], fontName=FONT_REG, fontSize=10.5,
                       leading=16, textColor=GRAY_700, spaceAfter=6)
QUOTE = ParagraphStyle("Quote", parent=BODY, fontName=FONT_REG, fontSize=12,
                         leading=20, textColor=BLACK, leftIndent=20, rightIndent=20,
                         spaceBefore=10, spaceAfter=10, borderColor=GRAY_300,
                         borderPadding=12, backColor=GRAY_100)
TAG = ParagraphStyle("Tag", parent=BODY, fontSize=9, textColor=GRAY_500)
BULLET = ParagraphStyle("Bullet", parent=BODY, fontSize=10.5, leftIndent=14,
                          bulletIndent=0, spaceAfter=4)
SECTION_LABEL = ParagraphStyle("SecLabel", parent=BODY, fontSize=10, fontName=FONT_BOLD,
                                  textColor=GRAY_500, alignment=TA_CENTER, leading=14)
COVER_TITLE = ParagraphStyle("CoverTitle", parent=H1, fontSize=48, leading=56,
                                alignment=TA_CENTER, spaceBefore=40, spaceAfter=8)
COVER_MOTTO = ParagraphStyle("CoverMotto", parent=BODY, fontSize=16, textColor=GRAY_500,
                                alignment=TA_CENTER, leading=22, spaceBefore=20)


def hr(width=16 * cm) -> Table:
    t = Table([[""]], colWidths=[width], rowHeights=[0.5])
    t.setStyle(TableStyle([("LINEBELOW", (0, 0), (-1, -1), 0.5, GRAY_300)]))
    return t


def build_cover(story):
    story.append(Spacer(1, 5 * cm))
    story.append(Paragraph("SmartCourt AI", COVER_TITLE))
    story.append(Paragraph("Adolat Ekotizimi", H1_SUB))
    story.append(Spacer(1, 2 * cm))
    story.append(Paragraph("Mentorlar uchun nutq qo'llanmasi", H1_SUB))
    story.append(Spacer(1, 1 * cm))
    story.append(Paragraph("Texnik · Biznes · Soha", SECTION_LABEL))
    story.append(Spacer(1, 4 * cm))
    story.append(Paragraph("Insonparvar adolat, soniyalar ichida", COVER_MOTTO))
    story.append(Spacer(1, 3 * cm))
    story.append(Paragraph(
        f"Sana: {datetime.now().strftime('%d.%m.%Y')} · Milliy AI Xakaton · Andijon bosqichi",
        SECTION_LABEL))
    story.append(PageBreak())


def build_intro(story):
    story.append(Paragraph("Qo'llanma haqida", H2))
    story.append(Paragraph(
        "Bu hujjat Milliy AI Xakatonning Andijon bosqichida SmartCourt AI loyihasini "
        "uchta mentorga (Texnik, Biznes, Soha) taqdim qilish uchun mo'ljallangan. "
        "Har bir mentor uchun alohida bo'lim, ochilish jumlasi, asosiy faktlar va "
        "kutilayotgan savollarga tayyor javoblar berilgan.", BODY))
    story.append(Spacer(1, 0.4 * cm))

    story.append(Paragraph("Check Point mexanikasi", H3))
    items = [
        "• Har bir mentor jamoani <b>alohida</b> 10 daqiqada tinglaydi (jami 30 daqiqa)",
        "• Har biri 5 ta mezon bo'yicha 1-10 ball qo'yadi",
        "• Yakuniy reyting = 0.4 × CP1 + 0.6 × CP2 (ikkinchi tekshiruv muhimroq)",
        "• Har bir trekdan eng yuqori ball olgan 5 ta jamoa finalga chiqadi",
    ]
    for item in items:
        story.append(Paragraph(item, BULLET))
    story.append(Spacer(1, 0.4 * cm))

    story.append(Paragraph("Asosiy iboralar (har 3 pitch'da takrorlanadigan)", H3))
    quotes = [
        ("To'liq lokal — on-premise", "Xavfsizlikning fundamental tamoyili"),
        ("Inson nazoratidagi AI", "AI sudyani almashtirmaydi, yordam beradi"),
        ("Insonparvar adolat, soniyalar ichida", "Loyihaning shiori"),
        ("Sudyani robotga aylantirmaymiz", "Insoniylikni saqlash"),
    ]
    qrows = [[Paragraph(f"<b>{q}</b>", BODY), Paragraph(t, TAG)] for q, t in quotes]
    qt = Table(qrows, colWidths=[8 * cm, 8 * cm])
    qt.setStyle(TableStyle([
        ("LINEBELOW", (0, 0), (-1, -1), 0.25, GRAY_300),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))
    story.append(qt)
    story.append(PageBreak())


# ── TEXNIK PITCH ────────────────────────────────────────────
def build_technical(story):
    story.append(Paragraph("01", SECTION_LABEL))
    story.append(Paragraph("Texnik Mentor", H2))
    story.append(Paragraph("Backend, AI, xavfsizlik va arxitektura savollari", TAG))
    story.append(Spacer(1, 0.4 * cm))
    story.append(hr())
    story.append(Spacer(1, 0.4 * cm))

    story.append(Paragraph("Ochilish (hook)", H3))
    story.append(Paragraph(
        "Biz SmartCourt AI'ning butun backend va AI yadrosini to'liq lokal — on-premise "
        "qurdik. Ya'ni sudning birorta ham maxfiy ma'lumoti tashqi serverga (OpenAI, AWS) "
        "chiqmaydi. Hammasi shu kompyuter ichida, Docker konteynerlarda ishlaydi.", QUOTE))

    story.append(Paragraph("Texnologik stack", H3))
    rows = [
        ["Backend", "FastAPI (Python 3.11) — asinxron, mikroservis arxitekturasi"],
        ["LLM", "Llama 3.2:3b (Ollama orqali, on-premise)"],
        ["Embedding", "nomic-embed-text (768-dim)"],
        ["Speech-to-Text", "faster-whisper (CPU, int8) — JustiScribe"],
        ["Relyatsion DB", "PostgreSQL 16 (ACID — yuridik aniqlik)"],
        ["Vector DB", "Qdrant (qonunlar, pretsedentlar — RAG)"],
        ["Cache", "Redis (token oqimi)"],
        ["Graph DB", "Neo4j (CorruptAlert — korrupsiya aloqalari)"],
        ["Auth", "JWT (python-jose) + bcrypt"],
        ["Konteynerizatsiya", "Docker Compose, mikroservis"],
    ]
    t = Table(rows, colWidths=[4 * cm, 12 * cm])
    t.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (-1, -1), FONT_REG),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("TEXTCOLOR", (0, 0), (0, -1), GRAY_500),
        ("TEXTCOLOR", (1, 0), (1, -1), BLACK),
        ("FONTNAME", (1, 0), (1, -1), FONT_BOLD),
        ("LINEBELOW", (0, 0), (-1, -1), 0.25, GRAY_300),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
    ]))
    story.append(t)
    story.append(Spacer(1, 0.3 * cm))

    story.append(Paragraph("Frontend (Texnik mentor doirasida)", H3))
    fe_items = [
        "• <b>Next.js 15</b> (App Router) + <b>TypeScript</b> strict mode",
        "• <b>TailwindCSS 4</b> + <b>Shadcn/ui</b> — Apple-style minimalist",
        "• <b>Framer Motion</b> — silliq animatsiyalar, token streaming vizualizatsiyasi",
        "• <b>WebSocket</b> — jonli sud majlisi (real-time stenogramma)",
        "• <b>5 ta interfeys</b> bitta backend'ga: Landing, Fuqaro, Sudya, Admin, Nazorat",
        "• <b>next-intl</b> — 3 til: O'zbek (lotin/kirill), rus, ingliz",
    ]
    for item in fe_items:
        story.append(Paragraph(item, BULLET))
    story.append(Spacer(1, 0.3 * cm))

    story.append(Paragraph("Eng muhim arxitektura qarori — RAG", H3))
    story.append(Paragraph(
        "Oddiy LLM gallyutsinatsiya qiladi — yo'q qonun moddasini o'ylab topishi mumkin. "
        "Sud uchun bu falokat. Biz RAG (Retrieval-Augmented Generation) qo'lladik:", BODY))
    rag = [
        "1. Ariza matni → nomic-embed-text → 768-o'lchamli vektor",
        "2. Qdrant'dan Kosinus o'xshashligi bo'yicha 5 ta eng mos qonun + 3 ta pretsedent",
        "3. Topilgan REAL qonunlar + ariza → Llama 3.2 kontekst sifatida",
        "4. Model FAQAT berilgan moddalarga tayanib qaror yozadi",
    ]
    for r in rag:
        story.append(Paragraph(r, BULLET))
    story.append(Paragraph(
        "Natija: gallyutsinatsiya 90% kamayadi, model real qonunga tayanadi.", BODY))
    story.append(Spacer(1, 0.3 * cm))

    story.append(PageBreak())
    story.append(Paragraph("Xavfsizlik qatlamlari", H3))
    sec = [
        "<b>1. To'liq On-Premise</b> — barcha modellar lokal Ollama'da. Internet uzilsa ham ishlaydi.",
        "<b>2. Human-in-the-loop</b> — AI faqat qoralama yozadi, qarorni sudya imzolaydi. "
        "Bazada decision_draft (AI) va decision_final (sudya) alohida saqlanadi.",
        "<b>3. PII Masking (AnonimusLaw)</b> — REGEX + NER orqali pasport, JSHSHIR, telefon, "
        "karta avtomatik maskalanadi.",
        "<b>4. JWT + bcrypt</b> — sanoat standarti, parol ochiq saqlanmaydi.",
        "<b>5. RBAC</b> — 5 ta rol, har bir endpoint rol bilan himoyalangan.",
        "<b>6. Audit Log</b> — har bir harakat (kim, qachon, IP, nima) PostgreSQL'da yoziladi.",
    ]
    for s in sec:
        story.append(Paragraph(s, BULLET))
    story.append(Spacer(1, 0.4 * cm))

    story.append(Paragraph("Mentor savollariga tayyor javoblar", H3))
    qa = [
        ("Nega lokal model, OpenAI tezroq-ku?",
         "Sud ma'lumotlari davlat siri. Qonun bo'yicha chet el serveriga yuborib bo'lmaydi. "
         "Lokal = doimiy xarajatsiz, internet talab qilmaydi."),
        ("3B model yetarlimi?",
         "MVP va demo uchun ha. Arxitektura model-agnostik — kuchli serverda 1 qatorni "
         "o'zgartirib 8B/70B'ga o'tamiz. RAG tufayli kichik model ham aniq."),
        ("Gallyutsinatsiyani qanday oldini olasiz?",
         "RAG + past temperatura (0.1-0.3) + faqat berilgan kontekstga tayanish. Model "
         "o'zidan modda to'qiy olmaydi."),
        ("4M ish/yil ko'taradimi?",
         "Mikroservis + async FastAPI + Docker = gorizontal masshtab. Qdrant millionlab "
         "vektorni ko'taradi."),
        ("Nega 3 xil DB?",
         "Har biri o'z ishida kuchli: relyatsion → PG, semantik → Qdrant, graf → Neo4j."),
    ]
    for q, a in qa:
        story.append(Paragraph(f"<b>S:</b> {q}", BODY))
        story.append(Paragraph(f"<b>J:</b> {a}", BODY))
        story.append(Spacer(1, 0.15 * cm))

    story.append(PageBreak())


# ── BIZNES PITCH ────────────────────────────────────────────
def build_business(story):
    story.append(Paragraph("02", SECTION_LABEL))
    story.append(Paragraph("Biznes Mentor", H2))
    story.append(Paragraph("Bozor, monetizatsiya, raqobat, o'sish", TAG))
    story.append(Spacer(1, 0.4 * cm))
    story.append(hr())
    story.append(Spacer(1, 0.4 * cm))

    story.append(Paragraph("Ochilish — diqqatni tortish", H3))
    story.append(Paragraph(
        "Bir daqiqa tasavvur qiling. Siz haqsiz. Sizning haqingiz bor. Lekin uni isbotlash "
        "uchun sudga borasiz va... ikki yil kutasiz. Bola katta bo'ladi, biznes yopiladi, "
        "asab tugaydi. Adolat bor — lekin u shunchalik sekin keladiki, ba'zida kech bo'ladi. "
        "Biz aynan shu vaqtni sotyapmiz. Adolatning tezligini.", QUOTE))

    story.append(Paragraph("Muammo — pul va vaqt tilida", H3))
    facts = [
        "• O'zbekistonda bir sudya oyiga 556 ta ish ko'radi. Xalqaro me'yor — 16 ta. "
        "<b>35 barobar ortiqcha</b>.",
        "• Yiliga 4 milliondan ortiq ish. Har biriga qo'lda protokol, qo'lda qaror.",
        "• Sud xodimi vaqtining 60-70% faqat texnik ishga ketadi.",
        "• Har bir kechikkan ish = byudjet pul + band sud zal + charchagan sudya + "
        "ishonchini yo'qotgan fuqaro.",
    ]
    for f in facts:
        story.append(Paragraph(f, BULLET))
    story.append(Spacer(1, 0.3 * cm))

    story.append(Paragraph("Asosiy va'damiz", H3))
    story.append(Paragraph(
        "Sud yuklamasini <b>60% ga kamaytiramiz</b>. Bu shunchaki chatbot emas — sudning "
        "butun zanjirini (ariza → tahlil → majlis → qaror → ijro) bitta tizimga jamlagan "
        "platforma. 10 ta AI moduli birga ishlaydi.", BODY))
    story.append(Spacer(1, 0.3 * cm))

    story.append(Paragraph("Monetizatsiya (B2G — Business-to-Government)", H3))
    biz = [
        "<b>1. Litsenziya</b> — har bir sud yoki viloyat uchun yillik to'lov",
        "<b>2. Texnik xizmat</b> — doimiy kontrakt (server, yangilanish, o'qitish)",
        "<b>3. Bosqichli joriy etish</b> — bitta pilot viloyatdan boshlaymiz, natija ko'rsatamiz, "
        "respublikaga kengaytamiz",
    ]
    for b in biz:
        story.append(Paragraph(b, BULLET))
    story.append(Paragraph(
        "Davlat nega to'laydi? Chunki tizim unga yuz millionlab so'mlik vaqt va resursni "
        "tejaydi. Biz oladigan pul — davlat tejaydigan pulning kichik ulushi.", BODY))
    story.append(Spacer(1, 0.3 * cm))

    story.append(Paragraph("Raqobatdagi ustunlik", H3))
    adv = [
        "<b>1. To'liq lokal (on-premise)</b> — raqobatchilar OpenAI API ishlatadi, davlat "
        "bermaydi. Bizning eshigimiz ochiq.",
        "<b>2. O'zbek tiliga moslashtirilgan</b> — yuridik o'zbek tili va mahalliy qonunchilik.",
        "<b>3. End-to-End yaxlitlik</b> — 10 modul bitta ekotizimda.",
        "<b>4. Human-in-the-loop</b> — siyosiy va huquqiy jihatdan qabul qilinadigan yagona yo'l.",
    ]
    for a in adv:
        story.append(Paragraph(a, BULLET))
    story.append(Spacer(1, 0.3 * cm))

    story.append(Paragraph("O'sish yo'nalishlari", H3))
    growth = [
        "• Sudlardan → prokuratura, notariat, advokatura, arbitraj",
        "• O'zbekistondan → MDH davlatlari (bir xil muammo, o'xshash huquqiy tizim)",
        "• Yangi modullar → har biri qo'shimcha qiymat va daromad",
    ]
    for g in growth:
        story.append(Paragraph(g, BULLET))
    story.append(Spacer(1, 0.3 * cm))

    story.append(Paragraph("Yopuvchi jumla", H3))
    story.append(Paragraph(
        "Biz pul ishlash uchun emas, muammoni yechish uchun boshladik. Lekin shu muammoni "
        "yechish o'zi katta biznes ekan. Chunki adolat — har bir insonga kerak. Va biz uni "
        "har bir insonga tezroq yetkazyapmiz. Bu — to'xtamaydigan ehtiyoj.", QUOTE))

    story.append(PageBreak())


# ── SOHA PITCH ──────────────────────────────────────────────
def build_domain(story):
    story.append(Paragraph("03", SECTION_LABEL))
    story.append(Paragraph("Soha Mentori", H2))
    story.append(Paragraph("Sud tizimi, qonunchilik, amaliy ta'sir", TAG))
    story.append(Spacer(1, 0.4 * cm))
    story.append(hr())
    story.append(Spacer(1, 0.4 * cm))

    story.append(Paragraph("Ochilish — insoniy boshlanish", H3))
    story.append(Paragraph(
        "Sudya ham inson. Uning ham oilasi, charchog'i, uyqusi bor. U oyiga 16 ta ish ko'rishi "
        "kerak edi — xalqaro me'yor shunday. Lekin u 556 ta ko'ryapti. O'ttiz besh barobar "
        "ko'p. Bunday yukda odam o'ylab qaror chiqara oladimi? Yo'q. Mana shu yerda adolat "
        "zarar ko'radi. Biz sudyani qutqaryapmiz — uni texnik ishdan xalos qilib, asosiy "
        "ishiga — o'ylashga, adolat qilishga vaqt beryapmiz.", QUOTE))

    story.append(Paragraph("Sohani chuqur tushunish — raqamlar ortidagi haqiqat", H3))
    rows = [
        ["4M+ ish/yil", "Har biriga qo'lda protokol, qo'lda qaror — jismonan imkonsiz yuk"],
        ["556 vs 16", "Sudyada o'ylashga vaqt yo'q → sifat tushadi → shikoyatlar ortadi"],
        ["13 224", "Jinoiy ishlarning shunchasigina mediatsiya bilan yopilgan — juda kam"],
        ["85%", "Dalillarning aksari raqamli (skrinshot, audio, video) — qo'lda tekshirib bo'lmaydi"],
        ["60-70%", "Sud xodimi vaqti faqat texnik ishga ketadi"],
    ]
    t = Table(rows, colWidths=[3 * cm, 13 * cm])
    t.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (-1, -1), FONT_REG),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("FONTNAME", (0, 0), (0, -1), FONT_BOLD),
        ("TEXTCOLOR", (0, 0), (0, -1), BLACK),
        ("TEXTCOLOR", (1, 0), (1, -1), GRAY_700),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LINEBELOW", (0, 0), (-1, -1), 0.25, GRAY_300),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
    ]))
    story.append(t)
    story.append(Spacer(1, 0.3 * cm))

    story.append(Paragraph("Har bir modul — real sud muammosiga aniq javob", H3))
    mappings = [
        ("Sudya 556 ish ostida ko'milgan", "SmartJudge + ClaimValidator → yuk 60% kamayadi"),
        ("Protokol qo'lda yoziladi, soatlab vaqt ketadi", "JustiScribe audioni real vaqtda matnga → 0 soniyada"),
        ("Dalillar raqamli, qo'lda tekshirib bo'lmaydi", "EvidenceAnalyzer deepfake va montajni tekshiradi"),
        ("Kichik nizolar sudni band qiladi", "MediatoBot sudgacha kelishuvni taklif qiladi"),
        ("Korrupsiya xavfi", "CorruptAlert sudya va tomonlar orasidagi yashirin aloqani topadi"),
    ]
    mr = Table([[Paragraph(f"<b>{p}</b>", BODY), Paragraph(s, BODY)] for p, s in mappings],
                colWidths=[7 * cm, 9 * cm])
    mr.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LINEBELOW", (0, 0), (-1, -1), 0.25, GRAY_300),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
    ]))
    story.append(mr)
    story.append(Spacer(1, 0.3 * cm))

    story.append(PageBreak())
    story.append(Paragraph("Qonunchilikka muvofiqlik — eng nozik nuqta", H3))
    compliance = [
        "<b>1. Human-in-the-loop</b> — AI sudyani almashtirmaydi. U faqat qoralama. "
        "Qarorni faqat sudya imzolaydi. Qonunan qaror chiqarish huquqi insonda.",
        "<b>2. Gallyutsinatsiyaga yo'l yo'q</b> — AI faqat real qonun bazasidan (RAG) "
        "tasdiqlangan moddalarga tayanadi.",
        "<b>3. PII himoyasi</b> — qaror jamoatchilikka chiqishdan oldin shaxsiy ma'lumotlar "
        "avtomatik yashiriladi. Konstitutsiya va maxfiylik talabiga mos.",
        "<b>4. To'liq lokal</b> — sud sirlari hech qachon chet el serveriga ketmaydi. "
        "Ma'lumotlar suvereniteti.",
    ]
    for c in compliance:
        story.append(Paragraph(c, BULLET))
    story.append(Spacer(1, 0.3 * cm))

    story.append(Paragraph("Ta'sir ko'lami — kimga foyda", H3))
    impact = [
        "<b>Fuqaro</b> — adolatni yillab emas, tezroq oladi. Tizimga ishonchi tiklanadi.",
        "<b>Sudya</b> — texnik yukdan xalos bo'lib, haqiqiy ishiga vaqt topadi.",
        "<b>Davlat</b> — sud tizimi shaffof, tez va arzon bo'ladi.",
        "<b>Jamiyat</b> — adolatga ishonch ortadi. Bu — eng katta ijtimoiy kapital.",
    ]
    for i in impact:
        story.append(Paragraph(i, BULLET))
    story.append(Spacer(1, 0.3 * cm))

    story.append(Paragraph("Mentor savollariga tayyor javoblar", H3))
    qa = [
        ("AI noto'g'ri qaror chiqarsa-chi?",
         "AI qaror chiqarmaydi, faqat qoralama beradi. Sudya tekshiradi va imzolaydi. "
         "Javobgarlik insonda."),
        ("Qonunni qayerdan oladi?",
         "Real qonun bazasidan (RAG). O'zidan to'qimaydi."),
        ("Maxfiylik buzilmaydimi?",
         "Lokal ishlaydi + PII avtomatik yashiriladi."),
        ("Sudyalar qabul qiladimi?",
         "Biz ularni almashtirmaymiz, yengillashtiramiz — qarshilik bo'lmaydi."),
    ]
    for q, a in qa:
        story.append(Paragraph(f"<b>S:</b> {q}", BODY))
        story.append(Paragraph(f"<b>J:</b> {a}", BODY))
        story.append(Spacer(1, 0.15 * cm))

    story.append(Paragraph("Yopuvchi jumla", H3))
    story.append(Paragraph(
        "Adolat kechiksa — u adolat bo'lmay qoladi. Biz adolatni tezlashtiryapmiz, lekin "
        "insoniyligini saqlab qolib. Sudyani robot qilmaymiz — unga nafas olishga, "
        "o'ylashga, haqiqiy odam bo'lib qolishga imkon beramiz. "
        "Insonparvar adolat — soniyalar ichida. Bizning shiorimiz shu.", QUOTE))


def main():
    doc = SimpleDocTemplate(
        OUT_PATH,
        pagesize=A4,
        leftMargin=2 * cm, rightMargin=2 * cm,
        topMargin=2 * cm, bottomMargin=2 * cm,
        title="SmartCourt AI — Mentorlar uchun nutq",
        author="SmartCourt AI Team",
    )
    story: list = []
    build_cover(story)
    build_intro(story)
    build_technical(story)
    build_business(story)
    build_domain(story)

    def footer(canvas, doc_):
        canvas.saveState()
        canvas.setFont(FONT_REG, 8)
        canvas.setFillColor(GRAY_500)
        canvas.drawString(2 * cm, 1.2 * cm, "SmartCourt AI — Adolat Ekotizimi")
        canvas.drawRightString(19 * cm, 1.2 * cm, f"Sahifa {doc_.page}")
        canvas.restoreState()

    doc.build(story, onFirstPage=footer, onLaterPages=footer)
    size_kb = os.path.getsize(OUT_PATH) / 1024
    print(f"OK Pitch PDF yaratildi: {OUT_PATH} ({size_kb:.1f} KB)")


if __name__ == "__main__":
    main()
