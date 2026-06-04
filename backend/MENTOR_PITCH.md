# 🎤 Backend & AI — Mentorlarga Nutq (SmartCourt AI)

> Texnik Mentor va Soha Mentori uchun. Har biri ~10 daqiqa.
> Birinchi shaxsda ("men") yozilgan — o'qib o'rganib, o'z so'zlaringiz bilan ayting.

---

## 0. Bir jumlali ochilish (hook)

> "Biz SmartCourt AI'ning **butun backend va AI yadrosini to'liq lokal — on-premise**
> qurdik. Ya'ni sudning birorta ham maxfiy ma'lumoti tashqi serverga (OpenAI, AWS)
> chiqmaydi. Hammasi shu kompyuterning ichida, Docker konteynerlarda ishlaydi."

Bu bitta jumla mentorni darrov qiziqtiradi, chunki sud tizimi uchun **maxfiylik #1**.

---

## 1. STACK — Texnologiyalar to'plami (Texnik Mentor uchun)

### Backend
- **FastAPI (Python 3.11)** — asinxron, yuqori unumdor API. Sud tizimida bir vaqtda
  minglab so'rov bo'lishi mumkin, FastAPI async shuni ko'taradi.
- **Mikroservis yondashuvi** — har bir komponent (DB, vector, cache, AI) alohida
  Docker konteynerda. Bittasi yiqilsa, butun tizim to'xtamaydi.
- **SQLModel + asyncpg** — PostgreSQL bilan to'liq asinxron, ACID tranzaksiyalar
  (sud ma'lumotlari uchun yaxlitlik kafolati).

### Ma'lumotlar qatlami (3 xil DB — har biri o'z vazifasiga)
| DB | Vazifa | Nega aynan shu |
|----|--------|----------------|
| **PostgreSQL** | Foydalanuvchilar, arizalar, ishlar, audit-log | ACID — moliyaviy/yuridik aniqlik |
| **Qdrant (Vector DB)** | Qonunlar va pretsedentlarning semantik vektorlari | RAG qidiruvi uchun |
| **Redis** | Kesh + LLM token oqimi | Tezlik |
| **Neo4j (Graph DB)** | Shaxslararo aloqalar (korrupsiya) | Grafik tahlil uchun SQL yaramaydi |

### AI modellari (hammasi LOKAL — Ollama orqali)
- **LLM:** `llama3.2:3b` — sud qarori qoralamasi, ariza tahlili generatsiyasi
- **Embedding:** `nomic-embed-text` (768 o'lchamli) — semantik qidiruv
- **Speech-to-Text:** `faster-whisper` — sud majlisi audiosini matnga (CPU'da, int8)

> **Muhim ochiqlik:** "Hozir MVP uchun 3B modeldan foydalanyapmiz, chunki bizda
> oddiy i7/16GB kompyuter. Lekin arxitekturamiz model-agnostik — kuchli serverda
> bitta sozlama o'zgartirib Llama-3-8B yoki 70B'ga o'tamiz. Kod o'zgarmaydi."

Bu juda kuchli gap: **kamtarlik + masshtablanuvchanlik** birga.

### Frontend (xakatonda alohida "frontend mentori" yo'q — bu ham Texnik mentorga)
> "Frontendni ham xuddi backend kabi jiddiy oldik. Dizayn falsafamiz — **Apple.com
> uslubi**: minimalist, premium, oq-qora. Davlat tizimi ishonchli va jiddiy ko'rinishi shart."

- **Next.js 15 (App Router) + TypeScript (strict)** — SSR, tezkor, type-xavfsiz
- **TailwindCSS 4 + Shadcn/ui** — Apple estetikasiga moslangan komponentlar
- **Framer Motion** — silliq animatsiyalar, SmartJudge token streaming vizualizatsiyasi
- **Zustand + React Query** — global holat va server holati boshqaruvi
- **WebSocket** — jonli sud majlisi (real-time stenogramma) uchun
- **next-intl** — 3 til (o'zbek lotin/kirill, rus, ingliz)
- **Bitta backend, 5 ta interfeys** — Landing, Fuqaro portali, Sudya paneli, Admin,
  Nazorat moduli. Hammasi shu FastAPI API'ga ulanadi.

> Frontend dasturchi bu qismni o'zi 1-2 daqiqada aytishi mumkin — Texnik mentor butun
> jamoaning yechimini baholaydi, frontend ham shunga kiradi. Alohida pitch shart emas.

---

## 2. AI ARXITEKTURASI — Eng muhim qism (farqlovchi ustunlik)

### Muammo: LLM "gallyutsinatsiya" qiladi (yolg'on to'qiydi)
> "Oddiy chatbot sudda ishlatib bo'lmaydi, chunki u mavjud bo'lmagan qonun moddasini
> o'ylab topishi mumkin. Sud uchun bu falokat."

### Yechim: RAG (Retrieval-Augmented Generation)
Men buni 3 bosqichda tushuntiraman:

```
1. Ariza matni → nomic-embed-text → 768 o'lchamli vektor
2. Qdrant'dan Kosinus o'xshashligi orqali eng mos 5 ta qonun + 3 pretsedent topiladi
3. Topilgan REAL qonunlar + ariza → llama3.2 ga kontekst sifatida beriladi
   → Model FAQAT berilgan moddalarga tayanib qaror yozadi
```

> "Ya'ni model o'zidan modda to'qimaydi — biz unga real qonun bazasidan tasdiqlangan
> moddalarni beramiz, u faqat shularni ishlatadi. Bu gallyutsinatsiyani 90% kamaytiradi."

### 10 ta AI moduli (qisqacha)
- **ClaimValidator** — erkin matnli arizani strukturali JSON'ga (yurisdiksiya, kamchiliklar)
- **LexPredictor** — pretsedentlar asosida yutish ehtimoli (RAG)
- **SmartJudge** — qaror qoralamasi, **token streaming** bilan (real vaqtda yoziladi)
- **JustiScribe** — sud audiosi → protokol (Whisper)
- **SentencAI** — yengillashtiruvchi/og'irlashtiruvchi omillarni ballab, jazo diapazoni
- **AnonimusLaw** — shaxsiy ma'lumotlarni maskalash
- **CorruptAlert** — Neo4j grafida yashirin aloqalarni topish
- (+ MediatoBot, EvidenceAnalyzer, AutoExec)

---

## 3. XAVFSIZLIK — Soha Mentori uchun eng muhim (3 ta zarba)

### 🔒 1-zarba: To'liq On-Premise (eng kuchli argument)
> "Barcha AI modellari **lokal serverda** ishlaydi — Ollama orqali. Internet uzilsa ham
> tizim ishlaydi. Fuqaroning pasporti, sud sirlari hech qachon OpenAI yoki boshqa
> chet el serveriga ketmaydi. Bu O'zbekiston ma'lumotlar suvereniteti talabiga mos."

Bu boshqa jamoalardan ASOSIY farqingiz — ular 99% OpenAI API ishlatadi.

### 🔒 2-zarba: Inson nazoratidagi AI (Human-in-the-loop)
> "AI sudyani ALMASHTIRMAYDI. SmartJudge faqat **qoralama** tayyorlaydi. Yakuniy qarorni
> har doim inson — sudya — o'qib, tahrirlab, IMZOLAYDI. Bizning bazada `decision_draft`
> (AI) va `decision_final` (sudya imzosi) alohida saqlanadi. Etik va huquqiy jihatdan
> bu loyihani xavfsiz qiladi."

### 🔒 3-zarba: Shaxsiy ma'lumotlarni himoya (PII Masking — AnonimusLaw)
> "Sud qarori jamoatchilikka ochiq reestrga chiqishdan oldin, AnonimusLaw moduli
> matndan barcha shaxsiy ma'lumotlarni — ism, pasport (AA1234567), JSHSHIR (14 raqam),
> telefon, karta — REGEX + NER (neyron tarmoq) bilan topib `[SHAXS_1]`, `[PASPORT]`
> ko'rinishida maskalaydi. GDPR/UzPrivacy talabiga mos."

### Texnik xavfsizlik qatlamlari (Texnik Mentor so'rasa)
- **JWT autentifikatsiya** + **bcrypt** parol hashlash (ochiq parol saqlanmaydi)
- **Role-Based Access Control (RBAC)** — 5 rol: fuqaro/sudya/advokat/admin/nazorat.
  Har bir endpoint rol bilan himoyalangan (fuqaro sudya paneliga kira olmaydi)
- **Audit Log** — har bir harakat (kim, qachon, qaysi IP, nima qildi) PostgreSQL'da
  yoziladi. Korrupsiya tergovida bu izlanadigan dalil.
- **ACID tranzaksiyalar** — ma'lumot yarim yozilib qolmaydi (pul/qaror aniqligi)

---

## 4. Mentor beradigan SAVOLLAR + tayyor JAVOBLAR

**S: Nega lokal model, OpenAI tezroq-ku?**
> J: Sud ma'lumotlari davlat siri. Qonun bo'yicha ularni chet el serveriga yuborib
> bo'lmaydi. Tezlikdan ko'ra maxfiylik muhimroq. Qolaversa, lokal = doimiy xarajatsiz,
> internet talab qilmaydi.

**S: 3B model yetarlimi, sifati past emasmi?**
> J: MVP va demo uchun yetarli. Arxitekturamiz model almashtirishga tayyor — kuchli
> serverda Llama-3-8B/70B'ga 1 qatorda o'tamiz. RAG tufayli kichik model ham aniq
> ishlaydi, chunki javobni o'zidan emas, real qonundan oladi.

**S: Gallyutsinatsiyani qanday oldini olasiz?**
> J: RAG + past temperatura (0.1-0.3) + faqat berilgan kontekstga tayanish ko'rsatmasi.
> Model qonunni o'ylab topa olmaydi, faqat Qdrant'dan kelganini ishlatadi.

**S: Masshtablashadimi? 4 million ish/yil-chi?**
> J: Mikroservis arxitekturasi + async FastAPI + Docker. Har bir servisni alohida
> gorizontal masshtablash mumkin. Qdrant millionlab vektorni ko'taradi.

**S: Ma'lumotlar bazasi nega 3 xil?**
> J: Har biri o'z ishida eng kuchli. Relyatsion ma'lumot → PostgreSQL, semantik qidiruv
> → Qdrant, aloqalar grafi → Neo4j. Bittasiga hammasini tiqish noto'g'ri dizayn bo'lardi.

---

## 5. Yopuvchi jumla (closing)

> "Biz shunchaki bitta chatbot emas — sud jarayonining **butun zanjirini** (ariza →
> tahlil → majlis → qaror → ijro) raqamlashtiruvchi, **to'liq lokal va xavfsiz**
> ekotizim qurdik. Sudyani robotga aylantirmaymiz — uni texnik ishdan xalos qilib,
> haqiqiy adolatga vaqt yaratamiz."

---

### 💡 Maslahat
- Demo'da **SmartJudge token streaming**'ni ko'rsating — qaror real vaqtda yozilishi
  vizual jihatdan kuchli taassurot qoldiradi.
- **AnonimusLaw**'ni jonli ko'rsating — matn kiriting, PII maskalanishini ko'rsating.
- "On-premise" va "human-in-the-loop" so'zlarini ko'p marta takrorlang — bu eslab
  qoladigan kuchli iboralar.
