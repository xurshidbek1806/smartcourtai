<script setup>
import { ref } from 'vue';
import { Download, Maximize2, Minus, Plus, Search } from 'lucide-vue-next';

import RoleShell from '@/layouts/RoleShell.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseInput from '@/components/ui/BaseInput.vue';
import { oversightNav } from '@/data/navigation';
import { graphNodes } from '@/data/mock';

const selected = ref(graphNodes[0]);
</script>

<template>
  <RoleShell title="Aloqalar grafi" subtitle="Neo4j visual risk monitoring" :nav="oversightNav">
    <section class="graph-page">
      <div class="panel filters">
        <BaseInput label="Shaxs qidirish" placeholder="Ism yoki tashkilot" :icon="Search" />
        <BaseInput label="Bog‘lanish darajasi" placeholder="1-5 hops" />
        <BaseInput label="Vaqt oralig‘i" placeholder="2024-2026" />
        <BaseButton>Anomaliyalarni topish</BaseButton>
      </div>
      <main class="graph panel">
        <div class="graph-toolbar">
          <BaseButton variant="secondary" :icon="Plus" size="sm">Zoom</BaseButton>
          <BaseButton variant="secondary" :icon="Minus" size="sm">Out</BaseButton>
          <BaseButton variant="secondary" :icon="Maximize2" size="sm">Fit</BaseButton>
          <BaseButton :icon="Download" size="sm">Eksport</BaseButton>
        </div>
        <svg viewBox="0 0 100 100" role="img" aria-label="Korrupsiya monitoring aloqalar grafi">
          <line x1="42" y1="34" x2="64" y2="50" />
          <line x1="64" y1="50" x2="76" y2="28" />
          <line x1="42" y1="34" x2="30" y2="58" />
          <line x1="64" y1="50" x2="52" y2="76" />
          <g v-for="node in graphNodes" :key="node.name" @click="selected = node">
            <circle :cx="node.x" :cy="node.y" :r="node.name === selected.name ? 6 : 4.8" />
            <text :x="node.x" :y="node.y + 9">{{ node.name }}</text>
          </g>
        </svg>
      </main>
      <aside class="panel">
        <p class="eyebrow">Tanlangan tugun</p>
        <h2>{{ selected.name }}</h2>
        <strong class="metric">{{ selected.risk }}</strong>
        <p>Xavf darajasi</p>
        <p class="muted">Bog‘lanishlar: qarindoshlik, hammuassislik, takroriy ijro jarayoni.</p>
      </aside>
    </section>
  </RoleShell>
</template>

<style scoped>
.graph-page {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr) 300px;
  gap: 18px;
}

.filters {
  display: grid;
  align-content: start;
  gap: 14px;
}

.graph {
  min-height: calc(100vh - 118px);
  position: relative;
}

.graph-toolbar {
  position: absolute;
  top: 18px;
  right: 18px;
  z-index: 2;
  display: flex;
  gap: 8px;
}

svg {
  width: 100%;
  height: 100%;
  min-height: 560px;
  border-radius: var(--radius-lg);
  background:
    linear-gradient(var(--border-subtle) 1px, transparent 1px),
    linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px),
    var(--gray-100);
  background-size: 22px 22px;
}

line {
  stroke: var(--gray-400);
  stroke-width: 0.35;
}

circle {
  fill: var(--gray-900);
  cursor: pointer;
  transition: r 200ms var(--ease-apple);
}

text {
  fill: var(--gray-700);
  font-size: 3px;
  text-anchor: middle;
}

h2 {
  margin: 0;
}

@media (max-width: 1100px) {
  .graph-page {
    grid-template-columns: 1fr;
  }
}
</style>
