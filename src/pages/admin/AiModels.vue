<script setup>
import { Pause, RotateCcw, SlidersHorizontal } from 'lucide-vue-next';

import RoleShell from '@/layouts/RoleShell.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseBadge from '@/components/ui/BaseBadge.vue';
import BaseCard from '@/components/ui/BaseCard.vue';
import { adminNav } from '@/data/navigation';
import { modelCards } from '@/data/mock';
</script>

<template>
  <RoleShell title="AI modellari" subtitle="Model monitoring va boshqaruv" :nav="adminNav">
    <section class="panel">
      <div class="panel-header">
        <div>
          <p class="eyebrow">ModelOps</p>
          <h1>AI modellari boshqaruvi</h1>
        </div>
        <BaseButton :icon="RotateCcw">Qayta o‘qitish</BaseButton>
      </div>
      <div class="grid grid-2">
        <BaseCard v-for="model in modelCards" :key="model.name" interactive>
          <div class="model-head">
            <h2>{{ model.name }}</h2>
            <BaseBadge :variant="model.status === 'Faol' ? 'default' : 'outline'">{{ model.status }}</BaseBadge>
          </div>
          <p>Versiya: {{ model.version }}</p>
          <p>Aniqlik: {{ model.accuracy }}</p>
          <p>Bugungi so‘rovlar: {{ model.requests }}</p>
          <div class="toolbar">
            <BaseButton variant="secondary" :icon="SlidersHorizontal">Sozlamalar</BaseButton>
            <BaseButton variant="secondary" :icon="Pause">Faollik</BaseButton>
          </div>
        </BaseCard>
      </div>
    </section>
  </RoleShell>
</template>

<style scoped>
h1 {
  margin: 0;
  font-size: clamp(34px, 5vw, 56px);
}

.model-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
</style>
