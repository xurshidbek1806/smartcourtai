<script setup>
import { computed, onMounted, ref } from 'vue';
import {
  CalendarDays,
  FileSearch,
  FileText,
  Gavel,
  Mic,
  PenLine,
  Play,
  Sparkles
} from 'lucide-vue-next';

import RoleShell from '@/layouts/RoleShell.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseCard from '@/components/ui/BaseCard.vue';
import DataTable from '@/components/ui/DataTable.vue';
import { judgeNav } from '@/data/navigation';
import { ensureAuth, getJudgeDashboard, listCases } from '@/lib/api';
import { useUi } from '@/stores/ui';

const ui = useUi();
const dash = ref(null);
const cases = ref([]);

const load = async () => {
  try {
    await ensureAuth('judge');
    const [d, c] = await Promise.all([getJudgeDashboard(), listCases()]);
    dash.value = d;
    cases.value = Array.isArray(c) ? c : [];
  } catch (e) {
    ui.pushToast({ type: 'error', title: 'Yuklab bo\'lmadi', text: e.message });
  }
};

onMounted(load);

const metrics = computed(() => [
  { label: 'Jami ishlar', value: String(dash.value?.total_cases ?? cases.value.length), note: 'ish', tone: 'blue' },
  { label: 'Aktiv', value: String(dash.value?.active_cases ?? 0), note: 'majlisda', tone: 'green' },
  { label: 'AI draft', value: String(dash.value?.ai_drafts_ready ?? 0), note: 'tayyor', tone: 'blue' },
  { label: 'Qaror chiqarilgan', value: String(dash.value?.decided ?? 0), note: 'yakunlangan', tone: 'red' }
]);

const statusLabel = (s) => String(s || '').replace(/_/g, ' ');

const quickActions = [
  { label: 'Jonli majlis', icon: Mic, to: '/judge/hearing/live' },
  { label: 'Qaror yozish', icon: PenLine, to: '/judge/ai-tools/smart-judge' },
  { label: 'Dalil tekshirish', icon: FileSearch, to: '/judge/ai-tools/evidence-analyzer' },
  { label: 'Kalendar', icon: CalendarDays, to: '/judge/schedule' }
];

// Bugungi jadval — biriktirilgan ishlardan tuziladi.
const schedule = computed(() =>
  (cases.value.slice(0, 4)).map((c, i) => ({
    time: ['09:00', '11:00', '14:30', '16:00'][i] || '—',
    title: `#${c.reference || c.id} — ${c.title}`
  }))
);
</script>

<template>
  <RoleShell title="Sudya paneli" :subtitle="dash?.court || 'Sud ish stoli'" :nav="judgeNav">
    <section class="dashboard">
      <header class="summary-panel">
        <div>
          <p class="eyebrow">Bugungi ish stoli</p>
          <h1>{{ dash?.total_cases ?? cases.length }} ta ish</h1>
          <p>Majlislar, AI qoralamalar va aktiv ishlar nazoratda.</p>
        </div>
        <RouterLink to="/judge/hearing/live"
          ><BaseButton :icon="Play">Jonli majlis</BaseButton></RouterLink
        >
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
              <RouterLink to="/judge/cases"
                ><BaseButton variant="ghost" size="sm">Ishlar</BaseButton></RouterLink
              >
            </div>
            <p v-if="!cases.length" class="muted">
              Hozircha ish biriktirilmagan. Arizalar sudga qabul qilingach, ishlar shu yerda paydo bo'ladi.
            </p>
            <div v-else class="case-grid">
              <BaseCard v-for="c in cases.slice(0, 6)" :key="c.id" class="case-card" interactive>
                <FileText :size="22" :stroke-width="1.5" />
                <h3>#{{ c.reference || c.id }}</h3>
                <p>{{ c.title }}</p>
                <strong>{{ statusLabel(c.status) }}</strong>
              </BaseCard>
            </div>
          </section>

          <section v-if="cases.length" class="panel">
            <h2>Aktiv ishlar</h2>
            <DataTable
              :columns="['Ish', 'Holat', 'Sarlavha', 'Turi']"
              :rows="cases.map((c) => [c.reference || c.id, statusLabel(c.status), c.title, c.dispute_type])"
            />
          </section>
        </main>

        <aside class="grid side-column">
          <section class="panel compact-panel">
            <Sparkles :size="22" :stroke-width="1.5" />
            <h2>AI Copilot</h2>
            <p>2 ta qaror qoralamasi tayyor. 1 ta ishda dalillar bo‘yicha signal bor.</p>
            <RouterLink to="/judge/ai-tools/smart-judge"
              ><BaseButton variant="secondary" size="sm">Qoralamalar</BaseButton></RouterLink
            >
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
