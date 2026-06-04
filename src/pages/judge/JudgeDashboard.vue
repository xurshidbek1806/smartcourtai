<script setup>
import { CalendarDays, FileSearch, FileText, Gavel, Mic, PenLine, Play, Sparkles } from 'lucide-vue-next';

import RoleShell from '@/layouts/RoleShell.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseCard from '@/components/ui/BaseCard.vue';
import DataTable from '@/components/ui/DataTable.vue';
import { judgeNav } from '@/data/navigation';
import { claims } from '@/data/mock';

const metrics = [
  { label: 'Navbatda', value: '12', note: 'ish', tone: 'blue' },
  { label: 'Bugungi majlis', value: '4', note: 'jadvalda', tone: 'green' },
  { label: 'AI draft', value: '2', note: 'tayyor', tone: 'blue' },
  { label: 'Risk signal', value: '1', note: 'tekshiruv', tone: 'red' }
];

const quickActions = [
  { label: 'Jonli majlis', icon: Mic, to: '/judge/hearing/live' },
  { label: 'Qaror yozish', icon: PenLine, to: '/judge/ai-tools/smart-judge' },
  { label: 'Dalil tekshirish', icon: FileSearch, to: '/judge/ai-tools/evidence-analyzer' },
  { label: 'Kalendar', icon: CalendarDays, to: '/judge/schedule' }
];

const schedule = [
  { time: '09:00', title: '#2026-001234 tayyorlov majlisi' },
  { time: '11:00', title: '#2026-001209 dalillar ko‘rigi' },
  { time: '14:30', title: '#2026-001178 asosiy majlis' },
  { time: '16:00', title: 'Qarorlarni imzolash' }
];
</script>

<template>
  <RoleShell title="Sudya paneli" subtitle="Bugun: 12 ta ish, 4 ta majlis" :nav="judgeNav">
    <section class="dashboard">
      <header class="summary-panel">
        <div>
          <p class="eyebrow">Bugungi ish stoli</p>
          <h1>12 ta ish navbatda</h1>
          <p>Majlislar, AI qoralamalar va aktiv ishlar nazoratda.</p>
        </div>
        <RouterLink to="/judge/hearing/live"><BaseButton :icon="Play">Jonli majlis</BaseButton></RouterLink>
      </header>

      <section class="metrics">
        <article v-for="metric in metrics" :key="metric.label" :class="`tone-${metric.tone}`">
          <span>{{ metric.label }}</span>
          <strong>{{ metric.value }}</strong>
          <small>{{ metric.note }}</small>
        </article>
      </section>

      <section class="quick-actions">
        <RouterLink v-for="action in quickActions" :key="action.label" :to="action.to">
          <component :is="action.icon" :size="18" :stroke-width="1.5" />
          {{ action.label }}
        </RouterLink>
      </section>

      <section class="content-grid">
        <main class="grid">
          <section class="panel">
            <div class="panel-header">
              <div>
                <p class="eyebrow">Ustuvor ishlar</p>
                <h2>LexPredictor bo‘yicha</h2>
              </div>
              <RouterLink to="/judge/cases"><BaseButton variant="ghost" size="sm">Ishlar</BaseButton></RouterLink>
            </div>
            <div class="case-grid">
              <BaseCard v-for="claim in claims" :key="claim.id" class="case-card" interactive>
                <FileText :size="22" :stroke-width="1.5" />
                <h3>#{{ claim.id }}</h3>
                <p>{{ claim.title }}</p>
                <strong>{{ claim.score }}% LexPredictor</strong>
              </BaseCard>
            </div>
          </section>

          <section class="panel">
            <h2>Aktiv ishlar</h2>
            <DataTable
              :columns="['Ish', 'Holat', 'Tomonlar', 'Sana']"
              :rows="claims.map((claim) => [claim.id, claim.status, claim.title, claim.next])"
            />
          </section>
        </main>

        <aside class="grid side-column">
          <section class="panel compact-panel">
            <Sparkles :size="22" :stroke-width="1.5" />
            <h2>AI Copilot</h2>
            <p>2 ta qaror qoralamasi tayyor. 1 ta ishda dalillar bo‘yicha signal bor.</p>
            <RouterLink to="/judge/ai-tools/smart-judge"><BaseButton variant="secondary" size="sm">Qoralamalar</BaseButton></RouterLink>
          </section>

          <section class="panel">
            <div class="panel-header compact">
              <h2>Bugungi jadval</h2>
              <Gavel :size="19" :stroke-width="1.5" />
            </div>
            <article v-for="item in schedule" :key="item.time" class="schedule-row">
              <time>{{ item.time }}</time>
              <p>{{ item.title }}</p>
            </article>
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
.case-card p,
.compact-panel p {
  color: var(--gray-500);
  line-height: 1.5;
}

.metrics,
.quick-actions {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.metrics article,
.quick-actions a {
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  background: var(--color-white);
  padding: 14px;
}

.metrics article {
  display: grid;
  gap: 5px;
  border-left: 3px solid var(--stat-blue);
}

.metrics .tone-green {
  border-left-color: var(--stat-green);
}

.metrics .tone-red {
  border-left-color: var(--stat-red);
}

.metrics span,
.metrics small,
.schedule-row time {
  color: var(--gray-500);
  font-size: 12px;
  font-weight: 700;
}

.metrics strong {
  font-size: 28px;
  line-height: 1;
}

.quick-actions a {
  display: flex;
  align-items: center;
  gap: 9px;
  min-height: 48px;
  color: var(--gray-900);
  font-weight: 800;
}

.quick-actions a:hover {
  background: var(--gray-100);
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 16px;
  align-items: start;
}

.case-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.case-card {
  display: grid;
  gap: 10px;
  border-top: 3px solid var(--stat-blue);
}

.case-card strong {
  color: var(--stat-blue);
}

.side-column {
  position: sticky;
  top: 84px;
}

.compact-panel {
  display: grid;
  gap: 10px;
}

.compact {
  align-items: center;
}

.schedule-row {
  display: grid;
  grid-template-columns: 54px 1fr;
  gap: 10px;
  border-bottom: 1px solid var(--border-subtle);
  padding: 11px 0;
}

.schedule-row:last-child {
  border-bottom: 0;
}

@media (max-width: 980px) {
  .summary-panel {
    align-items: flex-start;
    flex-direction: column;
  }

  .metrics,
  .quick-actions,
  .case-grid,
  .content-grid {
    grid-template-columns: 1fr;
  }

  .side-column {
    position: static;
  }
}
</style>
