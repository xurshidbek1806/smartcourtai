<script setup>
import {
  AlertTriangle,
  Archive,
  BarChart3,
  FileCheck,
  Network,
  Play,
  ShieldAlert
} from 'lucide-vue-next';

import RoleShell from '@/layouts/RoleShell.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseCard from '@/components/ui/BaseCard.vue';
import DataTable from '@/components/ui/DataTable.vue';
import { oversightNav } from '@/data/navigation';

const rows = [
  ['Q-2026-001', 'Ijroda', 'MIB', '18.02.2026'],
  ['Q-2026-002', 'Bank bloklandi', 'Bank bridge', '20.02.2026'],
  ['Q-2026-003', 'Bajarildi', 'MIB', '21.02.2026']
];

const metrics = [
  { label: 'Ijro muddati ichida', value: '91%', note: 'normal', tone: 'green' },
  { label: 'CorruptAlert', value: '5', note: 'signal', tone: 'red' },
  { label: 'Anonimlashtirish', value: '128', note: 'navbat', tone: 'blue' },
  { label: 'Ochiq reestr', value: '8.4k', note: 'nashr', tone: 'green' }
];

const riskSignals = [
  '2-hop ichida hammuassislik topildi',
  'Takroriy ijro jarayoni aniqlandi',
  'Bank bridge orqali bloklash kutilmoqda'
];
</script>

<template>
  <RoleShell
    title="Nazorat va ijro"
    subtitle="Qarorlar ijrosi va korrupsiya monitoringi"
    :nav="oversightNav"
  >
    <section class="dashboard">
      <header class="summary-panel">
        <div>
          <p class="eyebrow">Ijro markazi</p>
          <h1>3,842 ta qaror monitoringda</h1>
          <p>Ijro, reestr, anonimlashtirish va risk signallari.</p>
        </div>
        <div class="summary-actions">
          <RouterLink to="/oversight/auto-exec">
            <BaseButton :icon="Play">AutoExec</BaseButton>
          </RouterLink>
          <BaseButton variant="secondary" :icon="FileCheck">Hisobot yaratish</BaseButton>
        </div>
      </header>

      <section class="metrics">
        <article v-for="metric in metrics" :key="metric.label" :class="`tone-${metric.tone}`">
          <span>{{ metric.label }}</span>
          <strong>{{ metric.value }}</strong>
          <small>{{ metric.note }}</small>
        </article>
      </section>

      <section class="content-grid">
        <main class="grid">
          <section class="panel">
            <div class="panel-header">
              <div>
                <p class="eyebrow">Ijro navbati</p>
                <h2>Integratsiyalar bo‘yicha holat</h2>
              </div>
              <RouterLink to="/oversight/reports"
                ><BaseButton variant="ghost" :icon="BarChart3" size="sm"
                  >Hisobotlar</BaseButton
                ></RouterLink
              >
            </div>
            <DataTable :columns="['Qaror', 'Holat', 'Integratsiya', 'Muddat']" :rows="rows" />
          </section>

          <section class="workflow-grid">
            <BaseCard class="workflow-card" interactive>
              <Archive :size="22" :stroke-width="1.5" />
              <h3>Navbat</h3>
              <p>184 ta qaror ijroga yuborilishi kutilmoqda.</p>
              <RouterLink to="/oversight/auto-exec">AutoExec’ni ochish</RouterLink>
            </BaseCard>
            <BaseCard class="workflow-card" interactive>
              <Network :size="22" :stroke-width="1.5" />
              <h3>Graph</h3>
              <p>Neo4j aloqalar grafida 5 ta signal.</p>
            </BaseCard>
            <BaseCard class="workflow-card" interactive>
              <FileCheck :size="22" :stroke-width="1.5" />
              <h3>Nashr</h3>
              <p>128 ta qaror anonimlashtirish navbatida.</p>
            </BaseCard>
          </section>
        </main>

        <aside class="grid side-column">
          <section class="panel compact-panel">
            <ShieldAlert :size="24" :stroke-width="1.5" />
            <h2>Xavf signali</h2>
            <p>Xavf darajasi: 84 / 100. Graph sahifasida tekshiring.</p>
            <RouterLink to="/oversight/corruption/graph"
              ><BaseButton variant="secondary" size="sm">Grafni ochish</BaseButton></RouterLink
            >
          </section>

          <section class="panel">
            <div class="panel-header compact">
              <h2>Risk tafsilotlari</h2>
              <AlertTriangle :size="19" :stroke-width="1.5" />
            </div>
            <p v-for="signal in riskSignals" :key="signal" class="signal-row">
              <span class="status-dot danger" />{{ signal }}
            </p>
          </section>
        </aside>
      </section>
    </section>
  </RoleShell>
</template>

<style scoped>
.dashboard {
  display: grid;
  gap: 16px;
}

.summary-panel {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  background: var(--color-white);
  padding: 18px;
}

.summary-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

h1,
h2,
h3,
p {
  margin: 0;
}

h1 {
  font-size: clamp(28px, 4vw, 42px);
  line-height: 1.05;
}

.summary-panel p,
.workflow-card p,
.compact-panel p,
.signal-row {
  color: var(--gray-500);
  line-height: 1.5;
}

.metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.metrics article {
  display: grid;
  gap: 5px;
  border: 1px solid var(--border-subtle);
  border-left: 3px solid var(--stat-blue);
  border-radius: var(--radius-md);
  background: var(--color-white);
  padding: 14px;
}

.tone-green {
  border-left-color: var(--stat-green) !important;
}

.tone-red {
  border-left-color: var(--stat-red) !important;
}

.metrics span,
.metrics small {
  color: var(--gray-500);
  font-size: 12px;
  font-weight: 700;
}

.metrics strong {
  font-size: 28px;
  line-height: 1;
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 16px;
  align-items: start;
}

.workflow-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.workflow-card,
.compact-panel {
  display: grid;
  gap: 10px;
}

.workflow-card {
  border-top: 3px solid var(--stat-blue);
}

.side-column {
  position: sticky;
  top: 84px;
}

.compact {
  align-items: center;
}

.signal-row {
  border-bottom: 1px solid var(--border-subtle);
  padding: 10px 0;
}

.signal-row:last-child {
  border-bottom: 0;
}

@media (max-width: 980px) {
  .summary-panel {
    align-items: flex-start;
    flex-direction: column;
  }

  .metrics,
  .workflow-grid,
  .content-grid {
    grid-template-columns: 1fr;
  }

  .side-column {
    position: static;
  }
}
</style>
