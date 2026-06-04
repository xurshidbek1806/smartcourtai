<script setup>
import { ArrowRight, Play } from 'lucide-vue-next';
import { useI18n } from 'vue-i18n';

import BaseButton from '@/components/ui/BaseButton.vue';
import BaseCard from '@/components/ui/BaseCard.vue';
import GlassNav from '@/components/marketing/GlassNav.vue';
import ProductPreview from '@/components/marketing/ProductPreview.vue';
import SiteFooter from '@/components/marketing/SiteFooter.vue';
import { modules, stats, trustItems } from '@/data/mock';

const { t } = useI18n();
const roles = [
  { no: '01', title: 'Landing', text: 'Public marketing site va mahsulot sahifalari.', to: '/' },
  {
    no: '02',
    title: 'Fuqaro portali',
    text: 'Ariza, mediatsiya, advokat, kutubxona va AI chat.',
    to: '/portal/dashboard'
  },
  {
    no: '03',
    title: 'Sudya paneli',
    text: 'Ishlar, live hearing, SmartJudge va statistikalar.',
    to: '/judge/dashboard'
  },
  {
    no: '04',
    title: 'Admin panel',
    text: 'Foydalanuvchilar, AI models, security va database.',
    to: '/admin/dashboard'
  },
  {
    no: '05',
    title: 'Nazorat/Ijro',
    text: 'Ijro, CorruptAlert, AnonimusLaw va ochiq reestr.',
    to: '/oversight/dashboard'
  }
];
</script>

<template>
  <GlassNav />
  <main>
    <section class="hero">
      <div class="container">
        <p class="eyebrow reveal">O‘zbekiston sud tizimi uchun AI ekotizimi</p>
        <h1 class="page-title reveal">Adolat. Tezroq. Aniqroq.</h1>
        <p class="lead reveal">
          Sun’iy intellekt yordamida sud jarayonlarini 60% ga tezlashtiring, dalillarni avtomatik
          tahlil qiling va qarorlarni qonuniy asoslar bilan tayyorlang.
        </p>
        <div class="hero-actions reveal">
          <BaseButton size="xl" :icon="Play">{{ t('app.demo') }}</BaseButton>
          <BaseButton variant="secondary" size="xl" :icon="ArrowRight" icon-position="right">
            {{ t('app.details') }}
          </BaseButton>
        </div>
        <nav class="role-quick reveal" aria-label="SmartCourt interfeyslari">
          <RouterLink v-for="role in roles" :key="role.title" :to="role.to">
            <span>{{ role.no }}</span>
            {{ role.title }}
          </RouterLink>
        </nav>
        <ProductPreview />
      </div>
    </section>

    <section class="stats container" aria-label="Platforma statistikasi">
      <div v-for="(item, index) in stats" :key="item.label" :class="`tone-${index % 3}`">
        <strong>{{ item.value }}</strong>
        <span>{{ item.label }}</span>
      </div>
    </section>

    <section class="section container">
      <p class="eyebrow">Jarayon</p>
      <h2 class="section-title">Sud ishlarini AI bilan bitta oqimga yig‘ing.</h2>
      <div class="grid grid-4 steps">
        <BaseCard
          v-for="(step, index) in ['Qabul', 'Tahlil', 'Majlis', 'Qaror']"
          :key="step"
          interactive
        >
          <span class="step-no">0{{ index + 1 }}</span>
          <h3>{{ step }}</h3>
          <p>{{ step }} bosqichi uchun avtomatik tekshiruv, audit izi va real-time tavsiyalar.</p>
        </BaseCard>
      </div>
    </section>

    <section class="section container">
      <p class="eyebrow">5 ta interfeys</p>
      <h2 class="section-title">Har bir rol uchun alohida, rasmiy va ishlaydigan panel.</h2>
      <div class="interfaces">
        <BaseCard v-for="role in roles" :key="role.title" interactive>
          <span class="step-no">{{ role.no }}</span>
          <h3>{{ role.title }}</h3>
          <p>{{ role.text }}</p>
          <RouterLink :to="role.to">Panelga o‘tish</RouterLink>
        </BaseCard>
      </div>
    </section>

    <section class="section container role-showcase">
      <div>
        <p class="eyebrow">Role preview</p>
        <h2 class="section-title">Bitta platforma, besh xil ish stoli.</h2>
      </div>
      <div class="role-screen">
        <div v-for="role in roles.slice(1)" :key="role.title" class="mini-window">
          <strong>{{ role.title }}</strong>
          <span>{{ role.text }}</span>
          <div class="mini-bars">
            <i />
            <i />
            <i />
          </div>
        </div>
      </div>
    </section>

    <section class="section container feature-flow">
      <div>
        <p class="eyebrow">Fuqaro portali</p>
        <h2 class="section-title">Ariza, dalil, to‘lov va AI maslahat bitta joyda.</h2>
      </div>
      <BaseCard variant="filled">
        <h3>5 bosqichli ariza wizardi</h3>
        <p>
          Nizo turi, tomonlar, tafsilotlar, dalillar, ko‘rib chiqish va yuborish bosqichlari TZdagi
          tartib bo‘yicha ishlaydi.
        </p>
      </BaseCard>
      <BaseCard variant="filled">
        <h3>AI yuridik maslahatchi</h3>
        <p>
          Chat oynasi, oldingi suhbatlar, fayl/mikrofon/yuborish tugmalari va tezkor savollar bilan.
        </p>
      </BaseCard>
    </section>

    <section class="section container">
      <p class="eyebrow">10 ta modul</p>
      <h2 class="section-title">Har bir rol uchun to‘liq AI vositalar.</h2>
      <div class="grid grid-3 modules">
        <BaseCard v-for="module in modules" :key="module.name" interactive>
          <component :is="module.icon" :size="28" :stroke-width="1.5" />
          <h3>{{ module.name }}</h3>
          <p>{{ module.text }}</p>
        </BaseCard>
      </div>
    </section>

    <section class="tech">
      <div class="marquee" aria-label="Texnologiyalar">
        <span
          v-for="tech in [
            'Llama-3',
            'Whisper',
            'Neo4j',
            'PostgreSQL',
            'Qdrant',
            'OneID',
            'Mapbox',
            'Vue 3'
          ]"
          :key="tech"
        >
          {{ tech }}
        </span>
      </div>
    </section>

    <section class="security">
      <div class="container">
        <p class="eyebrow">Xavfsizlik</p>
        <h2 class="section-title">Rasmiy tizimlar uchun yopiq, auditli va shaffof.</h2>
        <div class="grid grid-3">
          <div v-for="item in trustItems" :key="item.title">
            <component :is="item.icon" :size="30" :stroke-width="1.5" />
            <h3>{{ item.title }}</h3>
            <p>{{ item.text }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="testimonial container">
      <p class="eyebrow">CTA</p>
      <blockquote>
        “Sudingizni raqamlashtirishni boshlang. SmartCourt AI ish yuklamasini kamaytiradi,
        protokolni avtomatlashtiradi va qaror tayyorlashni huquqiy asoslar bilan tezlashtiradi.”
      </blockquote>
    </section>

    <section class="cta container">
      <h2>Sud tizimini raqamlashtirishni bugun boshlang.</h2>
      <BaseButton size="xl">Demo band qilish</BaseButton>
    </section>
  </main>
  <SiteFooter />
</template>

<style scoped>
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
}

.role-quick span {
  color: var(--gray-400);
}

.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  overflow: hidden;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  background: var(--border-subtle);
}

.stats div {
  display: grid;
  gap: 8px;
  background: var(--color-white);
  padding: 28px;
  border-top: 3px solid transparent;
}

.stats strong {
  font-size: clamp(30px, 5vw, 54px);
  line-height: 1;
}

.stats .tone-0 {
  border-top-color: var(--stat-blue);
  background: linear-gradient(180deg, var(--stat-blue-soft), var(--color-white) 48%);
}

.stats .tone-1 {
  border-top-color: var(--stat-green);
  background: linear-gradient(180deg, var(--stat-green-soft), var(--color-white) 48%);
}

.stats .tone-2 {
  border-top-color: var(--stat-red);
  background: linear-gradient(180deg, var(--stat-red-soft), var(--color-white) 48%);
}

.stats .tone-0 strong {
  color: var(--stat-blue);
}

.stats .tone-1 strong {
  color: var(--stat-green);
}

.stats .tone-2 strong {
  color: var(--stat-red);
}

.stats span,
.steps p,
.modules p,
.security p {
  color: var(--gray-500);
  line-height: 1.55;
}

.section {
  padding: 96px 0 0;
}

.section-title {
  width: min(820px, 100%);
}

.steps,
.modules,
.interfaces {
  margin-top: 30px;
}

.interfaces {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 16px;
}

.interfaces a {
  color: var(--gray-900);
  font-weight: 700;
}

.feature-flow {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(220px, 0.8fr) minmax(220px, 0.8fr);
  gap: 16px;
  align-items: stretch;
}

.role-showcase {
  display: grid;
  grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
  gap: 22px;
  align-items: start;
}

.role-screen {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.mini-window {
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  background: var(--color-white);
  padding: 16px;
  box-shadow: var(--shadow-sm);
}

.mini-window span {
  display: block;
  min-height: 42px;
  margin-top: 8px;
  color: var(--gray-500);
  line-height: 1.45;
}

.mini-bars {
  display: grid;
  gap: 6px;
  margin-top: 16px;
}

.mini-bars i {
  height: 8px;
  border-radius: var(--radius-full);
}

.mini-bars i:nth-child(1) {
  width: 88%;
  background: var(--stat-blue);
}

.mini-bars i:nth-child(2) {
  width: 64%;
  background: var(--stat-green);
}

.mini-bars i:nth-child(3) {
  width: 42%;
  background: var(--stat-red);
}

.step-no {
  color: var(--gray-400);
  font-size: 42px;
  font-weight: 700;
}

.modules h3 {
  margin: 18px 0 8px;
}

.tech {
  overflow: hidden;
  margin: 96px 0 0;
  border-block: 1px solid var(--border-subtle);
  background: var(--gray-100);
}

.marquee {
  display: flex;
  width: max-content;
  gap: 72px;
  padding: 30px 0;
  animation: marquee 22s linear infinite;
}

.marquee span {
  color: var(--gray-500);
  font-size: 24px;
  font-weight: 700;
}

.security {
  margin-top: 0;
  background: var(--gray-900);
  color: var(--color-white);
  padding: 96px 0;
}

.security .grid {
  margin-top: 34px;
}

.security .eyebrow,
.security p {
  color: color-mix(in srgb, var(--color-white) 70%, transparent);
}

.testimonial {
  padding: 86px 0 0;
}

.testimonial blockquote {
  margin: 0;
  width: min(940px, 100%);
  color: var(--gray-900);
  font-size: clamp(28px, 4.5vw, 58px);
  font-weight: 700;
  line-height: 1.05;
  letter-spacing: 0;
}

.cta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 86px 0;
}

.cta h2 {
  margin: 0;
  font-size: clamp(32px, 5vw, 64px);
  line-height: 1;
}

@keyframes marquee {
  to {
    transform: translateX(-50%);
  }
}

@media (max-width: 820px) {
  .stats,
  .cta,
  .feature-flow,
  .role-showcase {
    grid-template-columns: 1fr;
    flex-direction: column;
    align-items: flex-start;
  }

  .stats {
    grid-template-columns: 1fr 1fr;
  }

  .interfaces {
    grid-template-columns: 1fr 1fr;
  }

  .hero-actions {
    flex-direction: column;
  }
}

@media (max-width: 520px) {
  .stats,
  .interfaces {
    grid-template-columns: 1fr;
  }
}
</style>
