<script setup>
import {
  ArrowRight,
  Bot,
  BrainCircuit,
  Building2,
  Database,
  FileCheck,
  FileSearch,
  Fingerprint,
  Gavel,
  Landmark,
  Lock,
  Mic,
  Network,
  Play,
  Scale,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Users
} from 'lucide-vue-next';

import BaseButton from '@/components/ui/BaseButton.vue';
import BaseCard from '@/components/ui/BaseCard.vue';
import GlassNav from '@/components/marketing/GlassNav.vue';
import ProductPreview from '@/components/marketing/ProductPreview.vue';
import SiteFooter from '@/components/marketing/SiteFooter.vue';

// ── Sahifaning asosiy ma'lumotlari ──────────────────────────
const stats = [
  { value: '556 → 16', label: 'Sudyaga oylik ish yuklamasi', tone: 'blue' },
  { value: '60%', label: 'Operatsion vaqt qisqaradi', tone: 'green' },
  { value: '4M+', label: 'Ish yiliga tahlil qilinadi', tone: 'blue' },
  { value: '0s', label: 'Protokol kutish vaqti', tone: 'red' }
];

const interfaces = [
  {
    no: '01',
    title: 'Fuqaro portali',
    text: 'OneID orqali tasdiqlash, ariza wizard, mediatsiya, AI maslahatchi va kutubxona.',
    icon: Users,
    to: '/portal/dashboard'
  },
  {
    no: '02',
    title: 'Sudya paneli',
    text: 'Ishlar boshqaruvi, jonli majlis stenogrammasi, SmartJudge qaror generatori.',
    icon: Gavel,
    to: '/judge/dashboard'
  },
  {
    no: '03',
    title: 'Admin panel',
    text: 'Foydalanuvchilar, AI modellar monitoringi, xavfsizlik va audit boshqaruvi.',
    icon: Database,
    to: '/admin/dashboard'
  },
  {
    no: '04',
    title: 'Nazorat / Ijro',
    text: 'AutoExec, CorruptAlert grafi, AnonimusLaw va ochiq qarorlar reestri.',
    icon: ShieldCheck,
    to: '/oversight/dashboard'
  }
];

// AI pipeline — sud jarayoni 5 bosqichda
const pipeline = [
  {
    no: '01',
    title: 'Qabul',
    icon: ScanSearch,
    text: 'ClaimValidator arizani o\'qiydi, yurisdiksiya va kamchiliklarni AI bilan aniqlaydi.'
  },
  {
    no: '02',
    title: 'Tahlil',
    icon: FileSearch,
    text: 'EvidenceAnalyzer hujjat va audioni tahlil qiladi. LexPredictor yutish ehtimolini baholaydi.'
  },
  {
    no: '03',
    title: 'Majlis',
    icon: Mic,
    text: 'JustiScribe real-time stenogramma yuritadi, muhim fakt va raqamlarni belgilaydi.'
  },
  {
    no: '04',
    title: 'Qaror',
    icon: BrainCircuit,
    text: 'SmartJudge qaror qoralamasini qonun moddalari va pretsedentlar bilan yozadi.'
  },
  {
    no: '05',
    title: 'Ijro',
    icon: ShieldCheck,
    text: 'AutoExec qarorni MIB, banklar va FHDYo tizimlariga avtomatik yuboradi.'
  }
];

// 10 ta AI moduli
const aiModules = [
  { name: 'ClaimValidator', icon: ScanSearch, text: 'Arizani tekshirish va sudga yo\'naltirish.', to: '/portal/claim-validator' },
  { name: 'MediatoBot', icon: Scale, text: 'Sudgacha kelishuv ehtimolini baholaydi.', to: '/portal/mediation' },
  { name: 'LexPredictor', icon: BrainCircuit, text: 'Pretsedent qidiruv va natija ehtimoli.', to: '/judge/ai-tools/lex-predictor' },
  { name: 'EvidenceAnalyzer', icon: FileSearch, text: 'Dalillardan huquqiy fakt ajratish.', to: '/judge/ai-tools/evidence-analyzer' },
  { name: 'JustiScribe', icon: Mic, text: 'Sud majlisi real-time stenogrammasi.', to: '/judge/hearing/live' },
  { name: 'SentencAI', icon: FileCheck, text: 'Jazo proporsionalligi kalkulyatori.', to: '/judge/ai-tools/sentencai' },
  { name: 'SmartJudge', icon: Gavel, text: 'Qaror qoralamasi generatori.', to: '/judge/ai-tools/smart-judge' },
  { name: 'CorruptAlert', icon: Network, text: 'Manfaatlar to\'qnashuvi grafi.', to: '/oversight/corruption/graph' },
  { name: 'AnonimusLaw', icon: Fingerprint, text: 'Qarorlarni anonimlashtirish.', to: '/oversight/anonymization' },
  { name: 'AutoExec', icon: Bot, text: 'Avtomatik ijro va integratsiya.', to: '/oversight/auto-exec' }
];

// Texnologiya stack
const techStack = [
  { name: 'Llama 3.2', role: 'On-premise LLM' },
  { name: 'Whisper', role: 'Speech-to-text' },
  { name: 'PostgreSQL', role: 'Relational DB' },
  { name: 'Qdrant', role: 'Vector DB' },
  { name: 'Neo4j', role: 'Graph DB' },
  { name: 'FastAPI', role: 'Backend' },
  { name: 'Vue 3', role: 'Frontend' },
  { name: 'OneID', role: 'Identifikatsiya' }
];

// Xavfsizlik tamoyillari
const trustItems = [
  {
    icon: Landmark,
    title: 'On-premise',
    text: 'Barcha modellar va ma\'lumotlar sud infratuzilmasi ichida ishlaydi. Tashqi cloud API chaqirilmaydi.'
  },
  {
    icon: Lock,
    title: 'ISO 27001 ready',
    text: 'Audit log, role-based access control, encryption at rest va transport bo\'yicha standartlar.'
  },
  {
    icon: Fingerprint,
    title: 'UzPrivacy',
    text: 'Shaxsiy ma\'lumotlar minimallashtiriladi, nashrdan oldin avtomatik anonimlashtiriladi.'
  }
];
</script>

<template>
  <GlassNav />
  <main>
    <!-- ── HERO ─────────────────────────────────────────── -->
    <section class="hero">
      <div class="container">
        <p class="eyebrow reveal">O‘zbekiston sud tizimi uchun AI ekotizimi</p>
        <h1 class="page-title reveal">Insonparvar adolat, soniyalar ichida.</h1>
        <p class="lead reveal">
          Sun'iy intellekt yordamida sud jarayonlarini 60% ga tezlashtiring, dalillarni avtomatik
          tahlil qiling va qarorlarni qonuniy asoslar bilan tayyorlang.
        </p>
        <div class="hero-actions reveal">
          <RouterLink to="/portal/dashboard">
            <BaseButton size="xl" :icon="Play">Demoni ko'rish</BaseButton>
          </RouterLink>
          <RouterLink to="/problems">
            <BaseButton variant="secondary" size="xl" :icon="ArrowRight" icon-position="right">
              Batafsil ma'lumot
            </BaseButton>
          </RouterLink>
        </div>
        <nav class="role-quick reveal" aria-label="SmartCourt interfeyslari">
          <RouterLink v-for="iface in interfaces" :key="iface.title" :to="iface.to">
            <span>{{ iface.no }}</span>
            {{ iface.title }}
          </RouterLink>
        </nav>
        <ProductPreview />
      </div>
    </section>

    <!-- ── STATS ────────────────────────────────────────── -->
    <section class="stats container" aria-label="Platforma ko'rsatkichlari">
      <article v-for="stat in stats" :key="stat.label" :class="`tone-${stat.tone}`">
        <strong>{{ stat.value }}</strong>
        <span>{{ stat.label }}</span>
      </article>
    </section>

    <!-- ── PIPELINE (5 bosqich) ─────────────────────────── -->
    <section class="section container">
      <header class="section-head">
        <p class="eyebrow">Sud jarayoni</p>
        <h2 class="section-title">Arizadan ijrogacha — bitta AI oqimda.</h2>
        <p class="section-lead">
          Har bir bosqichda lokal AI moduli sudya va fuqaroga yordam beradi.
          Hech qanday ma'lumot tashqi cloud'ga yuborilmaydi.
        </p>
      </header>
      <div class="pipeline">
        <article v-for="(step, i) in pipeline" :key="step.no" class="pipe-step">
          <div class="pipe-icon">
            <component :is="step.icon" :size="22" :stroke-width="1.5" />
          </div>
          <span class="pipe-no">{{ step.no }}</span>
          <h3>{{ step.title }}</h3>
          <p>{{ step.text }}</p>
          <div v-if="i < pipeline.length - 1" class="pipe-link" aria-hidden="true" />
        </article>
      </div>
    </section>

    <!-- ── 4 INTERFEYS ──────────────────────────────────── -->
    <section class="section container">
      <header class="section-head">
        <p class="eyebrow">4 ta ish stoli</p>
        <h2 class="section-title">Har bir rol uchun alohida workspace.</h2>
        <p class="section-lead">
          Fuqaro, sudya, administrator va nazorat xodimi uchun rasmiy, role-based interfeys.
          Bitta platforma, to'rt xil oqim.
        </p>
      </header>
      <div class="interfaces">
        <RouterLink v-for="iface in interfaces" :key="iface.title" :to="iface.to" class="iface-card">
          <span class="iface-no">{{ iface.no }}</span>
          <component :is="iface.icon" :size="26" :stroke-width="1.5" />
          <h3>{{ iface.title }}</h3>
          <p>{{ iface.text }}</p>
          <span class="iface-link">Panelga o'tish <ArrowRight :size="14" /></span>
        </RouterLink>
      </div>
    </section>

    <!-- ── 10 AI MODUL ──────────────────────────────────── -->
    <section class="section container">
      <header class="section-head">
        <p class="eyebrow">AI ekotizimi</p>
        <h2 class="section-title">10 ta moduldan iborat to'liq AI stek.</h2>
        <p class="section-lead">
          ClaimValidator'dan AutoExec'gacha — har bir modul bitta huquqiy vazifani hal qiladi
          va ular birgalikda sud jarayonini boshidan oxirigacha qoplaydi.
        </p>
      </header>
      <div class="modules">
        <RouterLink v-for="mod in aiModules" :key="mod.name" :to="mod.to" class="mod-card">
          <component :is="mod.icon" :size="22" :stroke-width="1.5" />
          <h3>{{ mod.name }}</h3>
          <p>{{ mod.text }}</p>
        </RouterLink>
      </div>
    </section>

    <!-- ── TEXNOLOGIYA STACK ────────────────────────────── -->
    <section class="section container">
      <header class="section-head">
        <p class="eyebrow">Texnologiya</p>
        <h2 class="section-title">Lokal stek, ochiq standartlar.</h2>
        <p class="section-lead">
          Mahalliy Ollama orqali Llama 3.2 va Whisper. Hech qaysi komponentda
          tashqi API kalitlari yoki cloud bog'liqliklari yo'q.
        </p>
      </header>
      <div class="tech-grid">
        <div v-for="t in techStack" :key="t.name" class="tech-tile">
          <strong>{{ t.name }}</strong>
          <span>{{ t.role }}</span>
        </div>
      </div>
    </section>

    <!-- ── XAVFSIZLIK (dark) ────────────────────────────── -->
    <section class="security">
      <div class="container">
        <header class="section-head">
          <p class="eyebrow">Xavfsizlik</p>
          <h2 class="section-title">Davlat darajasi uchun yopiq va auditli.</h2>
          <p class="section-lead dark">
            On-premise arxitektura — sud serverida ishlaydi. Audit log har bir
            harakatni vaqt, rol va IP bilan saqlaydi.
          </p>
        </header>
        <div class="trust-cards">
          <article v-for="item in trustItems" :key="item.title" class="trust-card">
            <component :is="item.icon" :size="24" :stroke-width="1.5" />
            <h3>{{ item.title }}</h3>
            <p>{{ item.text }}</p>
          </article>
        </div>
      </div>
    </section>

    <!-- ── MANIFEST ─────────────────────────────────────── -->
    <section class="testimonial container">
      <p class="eyebrow">Manifest</p>
      <blockquote>
        Sud — adolatning oxirgi qal'asi. Bizning vazifamiz sudyaning vaqtini emas,
        balki adolat sifatini oshirish. AI insonni almashtirmaydi — uni mustahkamlaydi.
      </blockquote>
      <cite>— SmartCourt AI jamoasi</cite>
    </section>

    <!-- ── YAKUNIY CTA ──────────────────────────────────── -->
    <section class="cta container">
      <div class="cta-content">
        <p class="eyebrow">Birinchi qadam</p>
        <h2>Sud tizimini raqamlashtirishni bugun boshlang.</h2>
        <p class="cta-text">
          5 ta interfeys, 10 ta AI moduli va lokal LLM bilan to'liq ishlaydigan demo
          hozir tayyor. Pilot loyihasi uchun bog'laning.
        </p>
      </div>
      <div class="cta-actions">
        <RouterLink to="/portal/dashboard">
          <BaseButton size="xl" :icon="Play">Demoni ko'rish</BaseButton>
        </RouterLink>
        <RouterLink to="/contact">
          <BaseButton variant="secondary" size="xl" :icon="ArrowRight" icon-position="right">
            Aloqaga chiqish
          </BaseButton>
        </RouterLink>
      </div>
    </section>
  </main>
  <SiteFooter />
</template>

<style scoped>
/* ── HERO ─────────────────────────────────────────────── */
.hero {
  min-height: calc(100vh - 64px);
  display: grid;
  align-items: center;
  padding: 64px 0 34px;
  text-align: center;
}

.lead {
  width: min(760px, 100%);
  margin: 22px auto 0;
  color: var(--gray-500);
  font-size: clamp(18px, 2vw, 24px);
  line-height: 1.45;
}

.hero-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 30px;
}

.role-quick {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin: 24px auto 0;
}

.role-quick a {
  display: inline-flex;
  min-height: 38px;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-full);
  background: var(--color-white);
  padding: 0 13px;
  color: var(--gray-700);
  font-size: 13px;
  font-weight: 700;
  box-shadow: var(--shadow-sm);
  transition: transform 200ms var(--ease-apple), box-shadow 200ms var(--ease-apple);
}

.role-quick a:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.role-quick span {
  color: var(--gray-400);
}

/* ── STATS ────────────────────────────────────────────── */
.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  overflow: hidden;
  margin-top: 32px;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  background: var(--border-subtle);
}

.stats article {
  display: grid;
  gap: 8px;
  background: var(--color-white);
  padding: 32px 28px;
  border-top: 3px solid transparent;
}

.stats strong {
  font-size: clamp(30px, 4.5vw, 48px);
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.02em;
}

.stats span {
  color: var(--gray-500);
  font-size: 14px;
  line-height: 1.45;
}

.stats .tone-blue {
  border-top-color: var(--stat-blue);
  background: linear-gradient(180deg, var(--stat-blue-soft), var(--color-white) 50%);
}
.stats .tone-blue strong { color: var(--stat-blue); }

.stats .tone-green {
  border-top-color: var(--stat-green);
  background: linear-gradient(180deg, var(--stat-green-soft), var(--color-white) 50%);
}
.stats .tone-green strong { color: var(--stat-green); }

.stats .tone-red {
  border-top-color: var(--stat-red);
  background: linear-gradient(180deg, var(--stat-red-soft), var(--color-white) 50%);
}
.stats .tone-red strong { color: var(--stat-red); }

/* ── SECTION HEAD (umumiy) ───────────────────────────── */
.section {
  padding: 120px 0 0;
}

.section-head {
  max-width: 760px;
  margin-bottom: 48px;
}

.section-title {
  margin: 0;
  font-size: clamp(28px, 4vw, 52px);
  font-weight: 700;
  line-height: 1.05;
  letter-spacing: -0.01em;
}

.section-lead {
  margin: 18px 0 0;
  color: var(--gray-500);
  font-size: 17px;
  line-height: 1.55;
}

.section-lead.dark {
  color: color-mix(in srgb, var(--color-white) 65%, transparent);
}

/* ── PIPELINE (5 bosqich) ────────────────────────────── */
.pipeline {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 14px;
  position: relative;
}

.pipe-step {
  position: relative;
  display: grid;
  align-content: start;
  gap: 10px;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  background: var(--color-white);
  padding: 22px 20px 24px;
  transition: transform 220ms var(--ease-apple), box-shadow 220ms var(--ease-apple);
}

.pipe-step:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
}

.pipe-icon {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  border-radius: 50%;
  background: var(--gray-900);
  color: var(--color-white);
}

.pipe-no {
  color: var(--gray-400);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.pipe-step h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
}

.pipe-step p {
  margin: 0;
  color: var(--gray-500);
  font-size: 13px;
  line-height: 1.55;
}

.pipe-link {
  position: absolute;
  top: 38px;
  right: -14px;
  width: 14px;
  height: 1px;
  background: var(--border-default);
}

/* ── INTERFACES (4 role kartlari) ────────────────────── */
.interfaces {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.iface-card {
  display: grid;
  align-content: start;
  gap: 10px;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  background: var(--color-white);
  padding: 26px 22px;
  color: var(--gray-900);
  transition: transform 220ms var(--ease-apple), border-color 220ms var(--ease-apple), box-shadow 220ms var(--ease-apple);
}

.iface-card:hover {
  transform: translateY(-3px);
  border-color: var(--gray-900);
  box-shadow: var(--shadow-md);
}

.iface-card svg {
  color: var(--gray-900);
}

.iface-no {
  color: var(--gray-400);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.iface-card h3 {
  margin: 6px 0 0;
  font-size: 22px;
  font-weight: 700;
}

.iface-card p {
  margin: 0;
  color: var(--gray-500);
  font-size: 14px;
  line-height: 1.55;
}

.iface-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
  color: var(--gray-900);
  font-size: 13px;
  font-weight: 700;
}

/* ── MODULES (10 ta AI moduli) ───────────────────────── */
.modules {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
}

.mod-card {
  display: grid;
  align-content: start;
  gap: 10px;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  background: var(--color-white);
  padding: 20px 18px;
  color: var(--gray-900);
  transition: transform 220ms var(--ease-apple), border-color 220ms var(--ease-apple);
}

.mod-card:hover {
  transform: translateY(-2px);
  border-color: var(--gray-900);
}

.mod-card svg {
  color: var(--gray-900);
}

.mod-card h3 {
  margin: 4px 0 0;
  font-size: 15px;
  font-weight: 700;
}

.mod-card p {
  margin: 0;
  color: var(--gray-500);
  font-size: 12.5px;
  line-height: 1.5;
}

/* ── TECH STACK ──────────────────────────────────────── */
.tech-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1px;
  overflow: hidden;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  background: var(--border-subtle);
}

.tech-tile {
  display: grid;
  gap: 6px;
  background: var(--color-white);
  padding: 22px 20px;
}

.tech-tile strong {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.tech-tile span {
  color: var(--gray-500);
  font-size: 12.5px;
}

/* ── SECURITY (dark) ─────────────────────────────────── */
.security {
  margin-top: 120px;
  background: var(--gray-900);
  color: var(--color-white);
  padding: 96px 0;
}

.security .eyebrow {
  color: color-mix(in srgb, var(--color-white) 50%, transparent);
}

.trust-cards {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.trust-card {
  display: grid;
  gap: 12px;
  border: 1px solid color-mix(in srgb, var(--color-white) 12%, transparent);
  border-radius: var(--radius-xl);
  background: color-mix(in srgb, var(--color-white) 4%, transparent);
  padding: 28px 26px;
  transition: border-color 220ms var(--ease-apple), transform 220ms var(--ease-apple);
}

.trust-card:hover {
  border-color: color-mix(in srgb, var(--color-white) 26%, transparent);
  transform: translateY(-2px);
}

.trust-card svg {
  color: var(--color-white);
}

.trust-card h3 {
  margin: 4px 0 0;
  color: var(--color-white);
  font-size: 20px;
  font-weight: 700;
}

.trust-card p {
  margin: 0;
  color: color-mix(in srgb, var(--color-white) 70%, transparent);
  font-size: 14px;
  line-height: 1.55;
}

/* ── TESTIMONIAL / MANIFEST ──────────────────────────── */
.testimonial {
  padding: 120px 0 0;
}

.testimonial blockquote {
  margin: 18px 0 0;
  width: min(940px, 100%);
  color: var(--gray-900);
  font-size: clamp(28px, 4vw, 50px);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.01em;
}

.testimonial cite {
  display: block;
  margin-top: 24px;
  color: var(--gray-500);
  font-size: 14px;
  font-style: normal;
  font-weight: 600;
}

/* ── FINAL CTA ───────────────────────────────────────── */
.cta {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: end;
  gap: 32px;
  margin-top: 120px;
  padding: 56px 56px 60px;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-2xl);
  background: linear-gradient(180deg, var(--gray-100), var(--color-white) 80%);
  box-shadow: var(--shadow-sm);
}

.cta-content {
  max-width: 680px;
}

.cta h2 {
  margin: 8px 0 14px;
  font-size: clamp(28px, 3.8vw, 44px);
  font-weight: 700;
  line-height: 1.08;
  letter-spacing: -0.01em;
}

.cta-text {
  margin: 0;
  color: var(--gray-500);
  font-size: 16px;
  line-height: 1.55;
}

.cta-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

main {
  padding-bottom: 96px;
}

/* ── RESPONSIVE ──────────────────────────────────────── */
@media (max-width: 1100px) {
  .pipeline {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  .pipe-link {
    display: none;
  }
  .interfaces {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .modules {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  .tech-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 820px) {
  .stats {
    grid-template-columns: 1fr 1fr;
  }
  .pipeline {
    grid-template-columns: 1fr 1fr;
  }
  .modules {
    grid-template-columns: 1fr 1fr;
  }
  .trust-cards {
    grid-template-columns: 1fr;
  }
  .cta {
    grid-template-columns: 1fr;
    align-items: flex-start;
    padding: 36px;
  }
  .hero-actions {
    flex-direction: column;
  }
  .cta-actions {
    width: 100%;
  }
  .cta-actions > * {
    width: 100%;
  }
}

@media (max-width: 520px) {
  .stats,
  .interfaces,
  .pipeline,
  .modules,
  .tech-grid {
    grid-template-columns: 1fr;
  }
  .section {
    padding-top: 80px;
  }
  .testimonial,
  .security {
    padding: 72px 0;
  }
  .cta {
    margin-top: 80px;
    padding: 28px;
  }
}
</style>
