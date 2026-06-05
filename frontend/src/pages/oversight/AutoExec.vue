<script setup>
import { computed, ref } from 'vue';
import {
  Building2,
  CheckCircle2,
  Landmark,
  Play,
  RefreshCcw,
  Send,
  ShieldCheck
} from 'lucide-vue-next';

import RoleShell from '@/layouts/RoleShell.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseCard from '@/components/ui/BaseCard.vue';
import BaseBadge from '@/components/ui/BaseBadge.vue';
import { oversightNav } from '@/data/navigation';
import { getDemoCase, updateDemoCase } from '@/services/demoCase';
import { aiAutoExec, ensureAuth } from '@/lib/api';
import { useUi } from '@/stores/ui';

const ui = useUi();
const demoCase = ref(getDemoCase());
const running = ref(false);
const timer = ref(null);
const backendNote = ref('');

const SYS_ICON = { Bank: Landmark, MIB: Building2, FHDYo: Send, SmartCourt: ShieldCheck };

const steps = ref([
  { title: 'Qaror kuchga kirdi', system: 'SmartCourt', status: 'Tayyor', icon: ShieldCheck },
  { title: 'Ijro ishi ochildi', system: 'MIB', status: 'Kutilmoqda', icon: Building2 },
  { title: 'Hisoblar tekshirildi', system: 'Bank bridge', status: 'Kutilmoqda', icon: Landmark },
  { title: 'Cheklovlar sinxronlandi', system: 'FHDYo', status: 'Kutilmoqda', icon: Send }
]);

const completed = computed(() => steps.value.filter((step) => step.status === 'Bajarildi').length);
const progress = computed(() => `${(completed.value / steps.value.length) * 100}%`);

const startExecution = async () => {
  if (running.value) return;
  running.value = true;
  try {
    await ensureAuth('oversight');
    // Backend AutoExec — qaror ijrosini bank/MIB/FHDYo bo'yicha ishga tushiradi.
    const caseId = demoCase.value?.decision?.caseId || 1;
    const res = await aiAutoExec(caseId);
    backendNote.value = res.note || '';
    // Backenddan kelgan bosqichlardan qadamlar yasaymiz.
    const apiSteps = (res.steps || []).map((s) => ({
      title: s.action,
      system: s.system,
      status: 'Kutilmoqda',
      icon: SYS_ICON[s.system] || ShieldCheck
    }));
    steps.value = [
      { title: 'Qaror kuchga kirdi', system: 'SmartCourt', status: 'Bajarildi', icon: ShieldCheck },
      ...apiSteps
    ];
  } catch (e) {
    running.value = false;
    ui.pushToast({ type: 'error', title: 'AutoExec xatosi', text: e.message });
    return;
  }

  let index = 1;
  timer.value = window.setInterval(() => {
    if (index < steps.value.length) {
      steps.value[index].status = 'Bajarildi';
      index += 1;
    }
    if (index >= steps.value.length) {
      window.clearInterval(timer.value);
      timer.value = null;
      running.value = false;
      demoCase.value = updateDemoCase({
        decision: { status: 'Kuchga kirgan', executionStatus: 'Bajarildi' }
      });
      ui.pushToast({
        type: 'success',
        title: 'AutoExec yakunlandi',
        text: 'Qaror bank/MIB/FHDYo integratsiyalari orqali ijroga yuborildi.'
      });
    }
  }, 650);
};

const resetExecution = () => {
  if (timer.value) window.clearInterval(timer.value);
  timer.value = null;
  running.value = false;
  steps.value = steps.value.map((step, index) => ({
    ...step,
    status: index === 0 ? 'Tayyor' : 'Kutilmoqda'
  }));
  demoCase.value = updateDemoCase({
    decision: { status: 'Qoralama', executionStatus: 'Ijroga yuborilmagan' }
  });
};
</script>

<template>
  <RoleShell title="AutoExec" subtitle="Qarorlarni avtomatik ijro etish" :nav="oversightNav">
    <section class="auto-exec">
      <header class="panel hero-panel">
        <div>
          <p class="eyebrow">Xavfsizlik, shaffoflik va yakuniy ijro</p>
          <h1>Qarorni inson omilisiz ijroga yuboring.</h1>
          <p class="lead">
            AutoExec qaror kuchga kirgach MIB, bank va FHDYo integratsiyalari bo‘yicha ijro
            bosqichlarini ishga tushiradi.
          </p>
        </div>
        <BaseBadge variant="filled">{{ demoCase.decision.executionStatus }}</BaseBadge>
      </header>

      <div class="exec-grid">
        <main class="panel">
          <div class="panel-header">
            <div>
              <p class="eyebrow">Qaror {{ demoCase.decision.id }}</p>
              <h2>{{ demoCase.title }}</h2>
            </div>
            <div class="toolbar">
              <BaseButton variant="secondary" :icon="RefreshCcw" @click="resetExecution"
                >Qayta boshlash</BaseButton
              >
              <BaseButton :icon="Play" :disabled="running" @click="startExecution">
                {{ running ? 'Ijro qilinmoqda...' : 'AutoExec ishga tushirish' }}
              </BaseButton>
            </div>
          </div>
          <div class="progress"><span :style="{ width: progress }" /></div>
          <article v-for="step in steps" :key="step.title" class="step-row">
            <component :is="step.icon" :size="22" :stroke-width="1.5" />
            <div>
              <strong>{{ step.title }}</strong>
              <span>{{ step.system }}</span>
            </div>
            <BaseBadge :variant="step.status === 'Bajarildi' ? 'filled' : 'outline'">
              {{ step.status }}
            </BaseBadge>
          </article>
        </main>

        <aside class="grid">
          <BaseCard variant="elevated">
            <CheckCircle2 :size="24" :stroke-width="1.5" />
            <h2>{{ completed }} / {{ steps.length }}</h2>
            <p>Bajarilgan integratsiya bosqichlari</p>
          </BaseCard>
          <BaseCard>
            <h3>Ijro ma’lumotlari</h3>
            <p><strong>Da’vogar:</strong> {{ demoCase.claimant }}</p>
            <p><strong>Javobgar:</strong> {{ demoCase.respondent }}</p>
            <p><strong>Summa:</strong> {{ demoCase.amount }} so‘m</p>
          </BaseCard>
        </aside>
      </div>
    </section>
  </RoleShell>
</template>

<style scoped>
.auto-exec,
.grid {
  display: grid;
  gap: 18px;
}

.hero-panel {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
}

h1,
h2,
h3,
p {
  margin: 0;
}

h1 {
  max-width: 780px;
  font-size: clamp(34px, 5vw, 58px);
  line-height: 1.03;
}

.lead {
  max-width: 760px;
  margin-top: 14px;
  color: var(--gray-500);
  font-size: 18px;
  line-height: 1.55;
}

.exec-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 18px;
  align-items: start;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.progress {
  overflow: hidden;
  height: 9px;
  margin-bottom: 18px;
  border-radius: var(--radius-full);
  background: var(--gray-100);
}

.progress span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--stat-blue), var(--stat-green));
  transition: width 300ms var(--ease-apple);
}

.step-row {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid var(--border-subtle);
  padding: 16px 0;
}

.step-row:last-child {
  border-bottom: 0;
}

.step-row div {
  display: grid;
  gap: 4px;
}

.step-row span,
aside p {
  color: var(--gray-500);
}

@media (max-width: 980px) {
  .exec-grid {
    grid-template-columns: 1fr;
  }

  .hero-panel {
    flex-direction: column;
  }
}
</style>
