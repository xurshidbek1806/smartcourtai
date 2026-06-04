<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  FileText,
  PanelRight,
  Search,
  SlidersHorizontal
} from 'lucide-vue-next';

import RoleShell from '@/layouts/RoleShell.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseCard from '@/components/ui/BaseCard.vue';
import BaseInput from '@/components/ui/BaseInput.vue';
import DataTable from '@/components/ui/DataTable.vue';

const props = defineProps({
  shellTitle: { type: String, required: true },
  nav: { type: Array, required: true },
  pages: { type: Object, required: true },
  fallback: { type: Object, required: true }
});

const route = useRoute();
const pattern = computed(() => route.matched[0]?.path ?? route.path);
const page = computed(() => props.pages[pattern.value] ?? props.pages[route.path] ?? props.fallback);
</script>

<template>
  <RoleShell :title="shellTitle" :subtitle="page.title" :nav="nav">
    <section class="configured">
      <header class="panel hero-panel">
        <div>
          <p class="eyebrow">{{ page.eyebrow }}</p>
          <h1>{{ page.title }}</h1>
          <p class="lead">{{ page.description }}</p>
        </div>
        <div v-if="page.primaryAction || page.secondaryAction" class="toolbar">
          <BaseButton v-if="page.secondaryAction" variant="secondary" :icon="SlidersHorizontal">
            {{ page.secondaryAction }}
          </BaseButton>
          <BaseButton v-if="page.primaryAction" :icon="ArrowRight" icon-position="right">
            {{ page.primaryAction }}
          </BaseButton>
        </div>
      </header>

      <div v-if="page.metrics?.length" class="grid grid-3">
        <BaseCard
          v-for="(metric, index) in page.metrics"
          :key="metric.label"
          variant="elevated"
          class="metric-tile"
          :class="`tone-${index % 3}`"
        >
          <p class="muted">{{ metric.label }}</p>
          <strong class="metric">{{ metric.value }}</strong>
          <p v-if="metric.note">{{ metric.note }}</p>
        </BaseCard>
      </div>

      <div class="content-grid">
        <main class="grid">
          <section v-if="page.formFields?.length" class="panel">
            <div class="panel-header">
              <h2>Ma’lumotlar</h2>
              <ClipboardList :size="22" :stroke-width="1.5" />
            </div>
            <div class="grid grid-2">
              <BaseInput
                v-for="field in page.formFields"
                :key="field"
                :label="field"
                :placeholder="field"
                :icon="field.toLowerCase().includes('qidir') ? Search : undefined"
              />
            </div>
          </section>

          <section v-if="page.table" class="panel">
            <div class="panel-header">
              <h2>Jadval</h2>
              <FileText :size="22" :stroke-width="1.5" />
            </div>
            <DataTable :columns="page.table.columns" :rows="page.table.rows" />
          </section>

          <section v-if="page.cards?.length" class="grid grid-3">
            <BaseCard v-for="card in page.cards" :key="card.title" interactive>
              <CheckCircle2 :size="22" :stroke-width="1.5" />
              <h2>{{ card.title }}</h2>
              <p>{{ card.text }}</p>
              <span v-if="card.meta" class="meta">{{ card.meta }}</span>
            </BaseCard>
          </section>

          <section v-if="page.timeline?.length" class="panel">
            <div class="panel-header">
              <h2>Vaqt jadvali</h2>
              <PanelRight :size="22" :stroke-width="1.5" />
            </div>
            <article v-for="item in page.timeline" :key="item.title" class="timeline-row">
              <span class="status-dot" />
              <div>
                <h3>{{ item.title }}</h3>
                <p>{{ item.text }}</p>
              </div>
            </article>
          </section>
        </main>

        <aside v-if="page.sideTitle || page.sideItems?.length" class="panel side-panel">
          <p class="eyebrow">{{ page.sideTitle ?? 'Yon panel' }}</p>
          <h2>{{ page.sideTitle ?? page.title }}</h2>
          <p v-for="item in page.sideItems" :key="item"><span class="status-dot" />{{ item }}</p>
        </aside>
      </div>
    </section>
  </RoleShell>
</template>

<style scoped>
.configured {
  display: grid;
  gap: 18px;
}

.hero-panel {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
}

h1 {
  margin: 0;
  font-size: clamp(34px, 5vw, 60px);
  line-height: 1;
  letter-spacing: 0;
}

.lead {
  width: min(760px, 100%);
  margin: 14px 0 0;
  color: var(--gray-500);
  font-size: 18px;
  line-height: 1.55;
}

.metric-tile {
  border-top: 3px solid transparent;
}

.metric-tile.tone-0 {
  border-top-color: var(--stat-blue);
  background: linear-gradient(180deg, var(--stat-blue-soft), var(--color-white) 58%);
}

.metric-tile.tone-1 {
  border-top-color: var(--stat-green);
  background: linear-gradient(180deg, var(--stat-green-soft), var(--color-white) 58%);
}

.metric-tile.tone-2 {
  border-top-color: var(--stat-red);
  background: linear-gradient(180deg, var(--stat-red-soft), var(--color-white) 58%);
}

.metric-tile.tone-0 .metric {
  color: var(--stat-blue);
}

.metric-tile.tone-1 .metric {
  color: var(--stat-green);
}

.metric-tile.tone-2 .metric {
  color: var(--stat-red);
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 18px;
}

.content-grid > main:only-child {
  grid-column: 1 / -1;
}

.meta {
  color: var(--gray-500);
  font-size: 13px;
  font-weight: 600;
}

.timeline-row {
  display: flex;
  gap: 14px;
  border-bottom: 1px solid var(--border-subtle);
  padding: 14px 0;
}

.timeline-row:last-child {
  border-bottom: 0;
}

.timeline-row h3,
.timeline-row p {
  margin: 0;
}

.timeline-row p,
.grid-3 p {
  color: var(--gray-500);
  line-height: 1.5;
}

.side-panel {
  position: sticky;
  top: 84px;
  height: max-content;
}

@media (max-width: 980px) {
  .hero-panel {
    flex-direction: column;
  }

  .content-grid {
    grid-template-columns: 1fr;
  }
}
</style>
