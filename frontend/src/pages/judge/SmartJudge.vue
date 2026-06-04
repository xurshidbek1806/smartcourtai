<script setup>
import { ref } from 'vue';
import { FileDown, RefreshCcw, WandSparkles } from 'lucide-vue-next';

import RoleShell from '@/layouts/RoleShell.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseCard from '@/components/ui/BaseCard.vue';
import { judgeNav } from '@/data/navigation';
import { getDemoCase, updateDemoCase } from '@/services/demoCase';
import { useUi } from '@/stores/ui';

const ui = useUi();
const demoCase = ref(getDemoCase());
const streaming = ref(false);
const draft = ref(
  `${demoCase.value.claimant} va ${demoCase.value.respondent} o‘rtasidagi ish materiallarini o‘rganib, ${demoCase.value.amount} so‘mlik talabning bir qismi asosli deb topiladi...`
);

const streamDraft = () => {
  if (streaming.value) return;
  streaming.value = true;
  draft.value = '';
  const tokens = [
    'Sud ',
    'ish ',
    'materiallarini ',
    'o‘rganib, ',
    'taraflar ',
    'o‘rtasidagi ',
    'mehnat ',
    'shartnomasi ',
    'mavjudligi ',
    'va ',
    'kompensatsiya ',
    'talabi ',
    'qisman ',
    'asosli ',
    'ekani ',
    'aniqlandi. ',
    'Qaror ',
    'qoralamasi ',
    'Mehnat ',
    'kodeksi ',
    '161-167 ',
    'moddalariga ',
    'tayangan ',
    'holda ',
    'shakllantirildi.'
  ];
  let index = 0;
  const timer = window.setInterval(() => {
    draft.value += tokens[index];
    index += 1;
    if (index >= tokens.length) {
      window.clearInterval(timer);
      streaming.value = false;
      demoCase.value = updateDemoCase({
        decision: { status: 'Qoralama tayyor', executionStatus: 'Ijroga yuborilmagan' }
      });
      ui.pushToast({
        type: 'success',
        title: 'Qoralama tayyor',
        text: 'SmartJudge draft yaratishni yakunladi.'
      });
    }
  }, 90);
};

const exportDraft = () => {
  ui.pushToast({
    type: 'success',
    title: 'Eksport tayyor',
    text: 'DOCX/PDF qoralama tayyorlandi.'
  });
};
</script>

<template>
  <RoleShell title="SmartJudge" subtitle="Qaror generatori" :nav="judgeNav">
    <section class="smart-grid">
      <main class="panel">
        <div class="panel-header">
          <div>
            <p class="eyebrow">Ish #{{ demoCase.id }}</p>
            <h1>Qaror qoralamasi</h1>
          </div>
          <BaseButton :icon="WandSparkles" @click="streamDraft">Qoralama yaratish</BaseButton>
        </div>
        <div class="editor" contenteditable="true">
          {{ draft }}<span v-if="streaming" class="cursor" />
        </div>
        <p class="human-review">
          AI faqat qoralama tayyorlaydi. Yakuniy qaror sudya tomonidan tekshiriladi va tasdiqlanadi.
        </p>
        <div class="toolbar">
          <BaseButton variant="secondary">Qonun moddasi qo‘shish</BaseButton>
          <BaseButton variant="secondary" :icon="RefreshCcw">Qayta yozish</BaseButton>
          <BaseButton :icon="FileDown" @click="exportDraft">Eksport DOCX/PDF</BaseButton>
        </div>
      </main>
      <aside class="grid">
        <BaseCard variant="filled">
          <h2>ClaimValidator xulosasi</h2>
          <p>{{ demoCase.validation.score }}% tayyor • {{ demoCase.disputeType }}</p>
          <p>{{ demoCase.jurisdiction }}</p>
        </BaseCard>
        <BaseCard>
          <h2>Foydalanilgan moddalar</h2>
          <p v-for="article in demoCase.articles" :key="article">{{ article }}</p>
        </BaseCard>
        <BaseCard>
          <h2>O‘xshash pretsedentlar</h2>
          <p>#2025-004982 • 82% mos</p>
          <p>#2024-010214 • 77% mos</p>
          <p>#2023-006001 • 74% mos</p>
        </BaseCard>
        <RouterLink to="/oversight/auto-exec">
          <BaseButton>AutoExec’ga o‘tish</BaseButton>
        </RouterLink>
      </aside>
    </section>
  </RoleShell>
</template>

<style scoped>
.smart-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 18px;
}

h1 {
  margin: 0;
  font-size: clamp(34px, 5vw, 58px);
}

.editor {
  min-height: 420px;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  background: var(--gray-100);
  padding: 24px;
  font-size: 18px;
  line-height: 1.7;
  outline: 0;
}

.human-review {
  margin: 14px 0;
  border-left: 3px solid var(--stat-blue);
  background: var(--stat-blue-soft);
  padding: 12px;
  color: var(--gray-700);
  line-height: 1.5;
}

.cursor {
  display: inline-block;
  width: 2px;
  height: 1em;
  margin-left: 3px;
  background: var(--gray-900);
  animation: blink 900ms infinite;
}

@keyframes blink {
  50% {
    opacity: 0;
  }
}

@media (max-width: 980px) {
  .smart-grid {
    grid-template-columns: 1fr;
  }
}
</style>
