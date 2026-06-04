<script setup>
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { ArrowLeft, MessageSquare } from 'lucide-vue-next';

import RoleShell from '@/layouts/RoleShell.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseCard from '@/components/ui/BaseCard.vue';
import BaseTabs from '@/components/ui/BaseTabs.vue';
import { portalNav } from '@/data/navigation';
import { claims } from '@/data/mock';

const route = useRoute();
const activeTab = ref('Tafsilot');
const claim = computed(() => claims.find((item) => item.id === route.params.id) ?? claims[0]);
const scoreTone = computed(() => {
  if (claim.value.score >= 75) return 'green';
  if (claim.value.score >= 65) return 'blue';
  return 'red';
});
</script>

<template>
  <RoleShell title="Ariza tafsilotlari" subtitle="Sud jarayoni holati" :nav="portalNav">
    <section class="panel detail">
      <RouterLink to="/portal/dashboard" class="back"><ArrowLeft :size="18" />Orqaga</RouterLink>
      <div class="panel-header">
        <div>
          <p class="eyebrow">Yaratilgan: {{ claim.date }}</p>
          <h1>Ariza #{{ claim.id }}</h1>
          <p class="muted">{{ claim.title }}</p>
        </div>
        <BaseButton :icon="MessageSquare">Sudya bilan xat</BaseButton>
      </div>
      <BaseTabs
        :tabs="['Tafsilot', 'Hujjatlar', 'Vaqt jadvali', 'Xat', 'AI']"
        :active="activeTab"
        @change="activeTab = $event"
      />
      <div class="grid grid-2 content">
        <BaseCard variant="filled">
          <h2>Holat</h2>
          <p><span class="status-dot" />{{ claim.status }}</p>
          <p>Sudya: {{ claim.judge }}</p>
          <p>Keyingi majlis: {{ claim.next }}</p>
        </BaseCard>
        <BaseCard variant="outlined" class="ai-card" :class="`tone-${scoreTone}`">
          <h2>AI Tahlil</h2>
          <strong class="metric">{{ claim.score }}%</strong>
          <div class="bar"><span :style="{ width: `${claim.score}%` }" /></div>
          <p class="muted">O‘xshash 142 ta ish topildi. Tavsiya: dalillarni to‘liq yuklash.</p>
        </BaseCard>
      </div>
    </section>
  </RoleShell>
</template>

<style scoped>
.detail {
  display: grid;
  gap: 18px;
}

h1 {
  margin: 0;
  font-size: clamp(34px, 5vw, 56px);
}

.back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: max-content;
  color: var(--gray-600);
}

.content {
  margin-top: 10px;
}

.bar {
  overflow: hidden;
  height: 10px;
  margin: 12px 0;
  border-radius: var(--radius-full);
  background: var(--gray-100);
}

.bar span {
  display: block;
  height: 100%;
}

.ai-card {
  border-top: 3px solid transparent;
}

.ai-card.tone-green {
  border-top-color: var(--stat-green);
  background: linear-gradient(180deg, var(--stat-green-soft), var(--color-white) 58%);
}

.ai-card.tone-blue {
  border-top-color: var(--stat-blue);
  background: linear-gradient(180deg, var(--stat-blue-soft), var(--color-white) 58%);
}

.ai-card.tone-red {
  border-top-color: var(--stat-red);
  background: linear-gradient(180deg, var(--stat-red-soft), var(--color-white) 58%);
}

.ai-card.tone-green .metric {
  color: var(--stat-green);
}

.ai-card.tone-green .bar span {
  background: var(--stat-green);
}

.ai-card.tone-blue .metric {
  color: var(--stat-blue);
}

.ai-card.tone-blue .bar span {
  background: var(--stat-blue);
}

.ai-card.tone-red .metric {
  color: var(--stat-red);
}

.ai-card.tone-red .bar span {
  background: var(--stat-red);
}
</style>
