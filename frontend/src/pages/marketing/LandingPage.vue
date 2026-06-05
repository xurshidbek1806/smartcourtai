<script setup>
import { ArrowRight, CheckCircle2, Play, Scale, ShieldCheck } from 'lucide-vue-next';

import BaseButton from '@/components/ui/BaseButton.vue';
import BrandLogo from '@/components/ui/BrandLogo.vue';
import GlassNav from '@/components/marketing/GlassNav.vue';

const modules = ['ClaimValidator', 'SmartJudge', 'JustiScribe', 'AutoExec'];

const securityItems = [
  'On-premise arxitektura',
  'Rol asosida kirish',
  'Audit log',
  'Rasmiy hujjat preview'
];
</script>

<template>
  <GlassNav />
  <main class="landing">
    <section class="hero" aria-labelledby="hero-title">
      <div class="orb orb-left" />
      <div class="orb orb-right" />

      <div class="hero-copy">
        <p class="eyebrow reveal">O‘zbekiston sud tizimi uchun AI platforma</p>
        <h1 id="hero-title" class="headline reveal delay-1">
          Insonparvar adolat - soniyalar ichida.
        </h1>
        <p class="lead reveal delay-2">
          Ariza qabul qilish, hujjat tahlili, sud majlisi va qaror qoralamasi uchun yagona rasmiy
          raqamli muhit.
        </p>
        <div class="actions reveal delay-3">
          <RouterLink to="/login">
            <BaseButton size="xl" :icon="Play">Tizimga kirish</BaseButton>
          </RouterLink>
          <RouterLink to="/portal/claims/new">
            <BaseButton variant="secondary" size="xl" :icon="ArrowRight" icon-position="right">
              Ariza boshlash
            </BaseButton>
          </RouterLink>
        </div>
      </div>

      <div class="official-preview reveal delay-4">
        <div class="preview-top">
          <span />
          <strong>SmartCourt AI</strong>
          <small>Rasmiy hujjat rejimi</small>
        </div>
        <div class="preview-body">
          <article class="paper">
            <p>Fuqarolik ishlari bo‘yicha sudga</p>
            <h2>DA’VO ARIZASI</h2>
            <div class="line wide" />
            <div class="line" />
            <div class="line short" />
            <footer>Imzo / ERI</footer>
          </article>
          <aside>
            <Scale :size="22" :stroke-width="1.5" />
            <strong>Qonuniy asos</strong>
            <p>FPK, IPK va ma’muriy sud tartibi asosida ixcham ko‘rsatma.</p>
          </aside>
        </div>
      </div>
    </section>

    <section id="problems" class="statement">
      <p class="eyebrow">Muammolar</p>
      <h2>Sud jarayonida vaqt eng qimmat resurs.</h2>
      <p>
        Ariza, dalil, majlis bayoni va qaror qoralamasi alohida-alohida yuritilganda jarayon
        sekinlashadi. SmartCourt AI shu oqimni bitta tartibga keltiradi.
      </p>
    </section>

    <section id="features" class="split">
      <div>
        <p class="eyebrow">Features</p>
        <h2>Kamroq bosish. Aniqroq hujjat.</h2>
      </div>
      <div class="feature-list">
        <p><CheckCircle2 :size="18" /> Rasmiy A4 preview</p>
        <p><CheckCircle2 :size="18" /> AI tekshiruv ogohlantirishi</p>
        <p><CheckCircle2 :size="18" /> Qonuniy asoslarni ixcham ko‘rsatish</p>
      </div>
    </section>

    <section id="modules" class="modules">
      <p class="eyebrow">Modules</p>
      <h2>Asosiy ish oqimi to‘rtta modulda jamlangan.</h2>
      <div class="module-line">
        <span v-for="module in modules" :key="module">{{ module }}</span>
      </div>
    </section>

    <section id="security" class="dark-section">
      <div>
        <p class="eyebrow">Security</p>
        <h2>Davlat tizimi uchun yopiq va nazoratli.</h2>
      </div>
      <div class="security-list">
        <span v-for="item in securityItems" :key="item">
          <ShieldCheck :size="17" />
          {{ item }}
        </span>
      </div>
    </section>

    <section id="about" class="about">
      <BrandLogo :size="44" />
      <p class="eyebrow">About</p>
      <h2>SmartCourt AI sudyaning o‘rnini egallamaydi.</h2>
      <p>
        Platformaning vazifasi - hujjatlarni tartibga solish, qonuniy asoslarni ko‘rsatish va mas’ul
        shaxs qaror qabul qilishi uchun aniqroq ish muhiti yaratish.
      </p>
      <RouterLink to="/login">
        <BaseButton size="xl" :icon="ArrowRight" icon-position="right"
          >Platformaga kirish</BaseButton
        >
      </RouterLink>
    </section>
  </main>
</template>

<style scoped>
.landing {
  overflow: hidden;
  background:
    radial-gradient(circle at 20% 10%, rgb(59 130 246 / 10%), transparent 28rem),
    radial-gradient(circle at 82% 28%, rgb(17 24 39 / 8%), transparent 26rem), #f5f5f7;
  color: #111827;
}

.hero {
  position: relative;
  display: grid;
  min-height: calc(100vh - 64px);
  place-items: center;
  padding: 88px 20px 74px;
  text-align: center;
}

.hero-copy {
  position: relative;
  z-index: 1;
  width: min(1040px, 100%);
}

.eyebrow {
  margin: 0;
  color: #6b7280;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.headline {
  max-width: 980px;
  margin: 14px auto 0;
  font-size: clamp(56px, 9vw, 118px);
  font-weight: 760;
  line-height: 0.92;
  letter-spacing: -0.07em;
}

.lead {
  max-width: 720px;
  margin: 28px auto 0;
  color: #4b5563;
  font-size: clamp(20px, 2.2vw, 28px);
  line-height: 1.35;
  letter-spacing: -0.025em;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-top: 34px;
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(20px);
  opacity: 0.75;
  animation: floatOrb 10s ease-in-out infinite;
}

.orb-left {
  top: 18%;
  left: 8%;
  width: 280px;
  height: 280px;
  background: rgb(37 99 235 / 12%);
}

.orb-right {
  right: 8%;
  bottom: 28%;
  width: 340px;
  height: 340px;
  background: rgb(17 24 39 / 8%);
  animation-delay: -4s;
}

.official-preview {
  position: relative;
  z-index: 1;
  width: min(980px, 100%);
  margin: 56px auto 0;
  overflow: hidden;
  border: 1px solid rgb(17 24 39 / 9%);
  border-radius: 36px;
  background: rgb(255 255 255 / 72%);
  box-shadow: 0 42px 120px rgb(15 23 42 / 14%);
  backdrop-filter: blur(24px);
}

.official-preview::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(115deg, transparent, rgb(255 255 255 / 55%), transparent);
  transform: translateX(-120%);
  animation: shine 7s ease-in-out infinite;
}

.preview-top {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid rgb(17 24 39 / 8%);
  padding: 16px 20px;
  text-align: left;
}

.preview-top span {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: #111827;
}

.preview-top small {
  color: #6b7280;
}

.preview-body {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
  gap: 24px;
  padding: 28px;
}

.paper {
  min-height: 430px;
  border: 1px solid rgb(17 24 39 / 10%);
  border-radius: 24px;
  background: #ffffff;
  padding: 38px 44px;
  text-align: left;
  box-shadow: 0 28px 70px rgb(15 23 42 / 10%);
  font-family: 'Times New Roman', Times, serif;
}

.paper p {
  margin: 0 0 36px auto;
  max-width: 260px;
  text-align: right;
  color: #4b5563;
  font-size: 15px;
  line-height: 1.45;
}

.paper h2 {
  margin: 0 0 42px;
  text-align: center;
  font-size: clamp(30px, 4vw, 44px);
  letter-spacing: -0.02em;
}

.line {
  height: 12px;
  margin-top: 16px;
  border-radius: 999px;
  background: #e5e7eb;
}

.line.wide {
  width: 100%;
}

.line:not(.wide):not(.short) {
  width: 76%;
}

.line.short {
  width: 48%;
}

.paper footer {
  display: inline-flex;
  margin-top: 62px;
  border: 1px solid #111827;
  border-radius: 999px;
  padding: 9px 15px;
  font-family: Arial, sans-serif;
  font-size: 12px;
  font-weight: 800;
}

.preview-body aside {
  display: grid;
  align-content: end;
  min-height: 430px;
  border-radius: 24px;
  background: #111827;
  color: #ffffff;
  padding: 26px;
  text-align: left;
}

.preview-body aside p {
  margin: 14px 0 0;
  color: rgb(255 255 255 / 68%);
  line-height: 1.55;
}

.statement,
.split,
.modules,
.dark-section,
.about {
  width: min(1120px, calc(100% - 40px));
  margin: 0 auto;
  scroll-margin-top: 84px;
}

.statement {
  padding: 122px 0 80px;
  text-align: center;
}

.statement h2,
.split h2,
.modules h2,
.dark-section h2,
.about h2 {
  margin: 12px 0 0;
  font-size: clamp(42px, 6.4vw, 82px);
  font-weight: 760;
  line-height: 0.96;
  letter-spacing: -0.06em;
}

.statement h2,
.modules h2,
.about h2 {
  margin-right: auto;
  margin-left: auto;
  max-width: 820px;
}

.statement p:not(.eyebrow),
.about p:not(.eyebrow) {
  max-width: 720px;
  margin: 24px auto 0;
  color: #4b5563;
  font-size: 20px;
  line-height: 1.55;
  letter-spacing: -0.025em;
}

.split {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 420px;
  gap: 64px;
  align-items: center;
  padding: 92px 0;
  border-top: 1px solid rgb(17 24 39 / 8%);
}

.feature-list {
  display: grid;
  gap: 18px;
}

.feature-list p {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
  color: #111827;
  font-size: 18px;
  font-weight: 700;
}

.modules {
  padding: 98px 0 112px;
  text-align: center;
}

.module-line {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-top: 34px;
}

.module-line span {
  border: 1px solid rgb(17 24 39 / 10%);
  border-radius: 999px;
  background: rgb(255 255 255 / 72%);
  padding: 12px 18px;
  color: #111827;
  font-weight: 800;
  box-shadow: 0 10px 30px rgb(15 23 42 / 6%);
}

.dark-section {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 380px;
  gap: 48px;
  align-items: end;
  border-radius: 42px;
  background: #111827;
  color: #ffffff;
  padding: clamp(34px, 6vw, 68px);
}

.dark-section .eyebrow {
  color: rgb(255 255 255 / 54%);
}

.dark-section h2 {
  color: #ffffff;
}

.security-list {
  display: grid;
  gap: 10px;
}

.security-list span {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid rgb(255 255 255 / 12%);
  border-radius: 999px;
  background: rgb(255 255 255 / 6%);
  padding: 13px 16px;
  color: rgb(255 255 255 / 84%);
  font-weight: 700;
}

.about {
  display: grid;
  place-items: center;
  padding: 124px 0 96px;
  text-align: center;
}

.about a {
  margin-top: 34px;
}

.reveal {
  opacity: 0;
  transform: translateY(22px);
  animation: revealUp 760ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.delay-1 {
  animation-delay: 90ms;
}

.delay-2 {
  animation-delay: 180ms;
}

.delay-3 {
  animation-delay: 270ms;
}

.delay-4 {
  animation-delay: 360ms;
}

@keyframes revealUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes shine {
  0%,
  46% {
    transform: translateX(-120%);
  }
  72%,
  100% {
    transform: translateX(120%);
  }
}

@keyframes floatOrb {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    transform: translate3d(0, 18px, 0) scale(1.05);
  }
}

@media (prefers-reduced-motion: reduce) {
  .reveal,
  .orb,
  .official-preview::after {
    animation: none;
  }

  .reveal {
    opacity: 1;
    transform: none;
  }
}

@media (max-width: 900px) {
  .preview-body,
  .split,
  .dark-section {
    grid-template-columns: 1fr;
  }

  .preview-body aside {
    min-height: auto;
  }
}

@media (max-width: 640px) {
  .hero {
    padding-top: 56px;
  }

  .headline {
    font-size: clamp(46px, 15vw, 74px);
  }

  .actions,
  .actions > *,
  .about a {
    width: 100%;
  }

  .preview-body {
    padding: 16px;
  }

  .official-preview {
    border-radius: 26px;
  }

  .paper {
    min-height: 330px;
    padding: 28px 24px;
  }

  .statement,
  .modules,
  .about {
    padding-top: 84px;
  }
}
</style>
