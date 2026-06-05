<script setup>
import { computed, onMounted, ref } from 'vue';
import {
  Activity,
  AlertTriangle,
  Cpu,
  Database,
  Download,
  Server,
  ShieldCheck,
  Users
} from 'lucide-vue-next';

import RoleShell from '@/layouts/RoleShell.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseCard from '@/components/ui/BaseCard.vue';
import DataTable from '@/components/ui/DataTable.vue';
import MetricCharts from '@/components/shared/MetricCharts.vue';
import { adminNav } from '@/data/navigation';
import { adminAiModels, adminAuditLog, adminStats, ensureAuth } from '@/lib/api';
import { downloadDemoFile } from '@/services/demoActions';
import { useUi } from '@/stores/ui';

const ui = useUi();
const stats = ref(null);
const models = ref(null);
const records = ref([]);

const load = async () => {
  try {
    await ensureAuth('admin');
    const [s, m, a] = await Promise.all([
      adminStats(),
      adminAiModels().catch(() => null),
      adminAuditLog(20).catch(() => [])
    ]);
    stats.value = s;
    models.value = m;
    records.value = a;
  } catch (e) {
    ui.pushToast({ type: 'error', title: 'Yuklab bo\'lmadi', text: e.message });
  }
};

onMounted(load);

const fmtTime = (iso) => {
  try {
    return new Date(iso).toLocaleTimeString('uz-UZ');
  } catch {
    return iso;
  }
};

const kpis = computed(() => [
  { label: 'Foydalanuvchilar', value: String(stats.value?.total_users ?? '—'), delta: 'jami' },
  { label: 'Arizalar', value: String(stats.value?.total_claims ?? '—'), delta: 'jami' },
  { label: 'Sud ishlari', value: String(stats.value?.total_cases ?? '—'), delta: 'jami' },
  { label: 'AI vektorlar', value: String(models.value?.vector_store?.laws ?? '—'), delta: 'qonun' }
]);

const auditRows = computed(() =>
  records.value.map((r) => [
    fmtTime(r.created_at),
    String(r.user_id ?? '—'),
    r.action ?? '—',
    r.entity_type ?? '—',
    r.ip_address ?? '—',
    r.status ?? 'OK'
  ])
);

const health = computed(() => [
  { label: 'Ollama', value: models.value?.ollama_available ? 'Faol' : 'O\'chiq', icon: Cpu, tone: models.value?.ollama_available ? 'green' : 'red' },
  { label: 'Qonun vektorlari', value: String(models.value?.vector_store?.laws ?? 0), icon: Database, tone: 'blue' },
  { label: 'Pretsedentlar', value: String(models.value?.vector_store?.precedents ?? 0), icon: Server, tone: 'blue' },
  { label: 'Neo4j', value: models.value?.neo4j_available ? 'On' : 'Off', icon: ShieldCheck, tone: models.value?.neo4j_available ? 'green' : 'red' }
]);

const exportStats = () => {
  downloadDemoFile('admin-stats.json', { stats: stats.value, models: models.value });
  ui.pushToast({ type: 'success', title: 'Eksport', text: 'Statistika yuklab olindi.' });
};
</script>

<template>
  <RoleShell title="Admin panel" subtitle="System administrator workspace" :nav="adminNav">
    <section class="dashboard">
      <header class="summary-panel">
        <div>
          <p class="eyebrow">System overview</p>
          <h1>Platforma nazorati</h1>
          <p>Foydalanuvchi, AI, audit va infratuzilma holati.</p>
        </div>
        <BaseButton variant="secondary" :icon="Download" @click="exportStats">Eksport</BaseButton>
      </header>

      <section class="metrics">
        <article
          v-for="(kpi, index) in kpis"
          :key="kpi.label"
          :class="`tone-${index === 1 ? 'green' : index === 2 ? 'red' : 'blue'}`"
        >
          <span>{{ kpi.label }}</span>
          <strong>{{ kpi.value }}</strong>
          <small>{{ kpi.delta }}</small>
        </article>
      </section>

      <section class="health-strip">
        <article v-for="item in health" :key="item.label" :class="`tone-${item.tone}`">
          <component :is="item.icon" :size="18" :stroke-width="1.5" />
          <div>
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
          </div>
        </article>
      </section>

      <section class="content-grid">
        <main class="grid">
          <section class="panel">
            <div class="panel-header">
              <div>
                <p class="eyebrow">Analytics</p>
                <h2>Platforma analitikasi</h2>
              </div>
              <BaseButton variant="ghost" :icon="Activity" size="sm">Real-time</BaseButton>
            </div>
            <MetricCharts :bars="[20, 34, 28, 48, 44, 62, 68, 82, 76, 92]" :score="94" />
          </section>

          <section class="panel">
            <div class="panel-header">
              <div>
                <p class="eyebrow">Audit</p>
                <h2>So‘nggi audit loglar</h2>
              </div>
              <RouterLink to="/admin/users"
                ><BaseButton variant="ghost" :icon="Users" size="sm">Users</BaseButton></RouterLink
              >
            </div>
            <p v-if="!auditRows.length" class="muted">Audit yozuvlari hali yo'q.</p>
            <DataTable
              v-else
              :columns="['Vaqt', 'Foydalanuvchi', 'Harakat', 'Obyekt', 'IP', 'Holat']"
              :rows="auditRows"
            />
          </section>
        </main>

        <aside class="grid side-column">
          <section class="panel compact-panel">
            <AlertTriangle :size="22" :stroke-width="1.5" />
            <h2>Security signal</h2>
            <p>External login attempt bloklandi. Audit logda tafsilot bor.</p>
          </section>

          <section class="panel">
            <h2>Live feed</h2>
            <article v-for="row in auditRows.slice(0, 5)" :key="row.join('-')" class="feed-row">
              <span class="status-dot" :class="row[5] === 'Blocked' ? 'danger' : 'success'" />
              <div>
                <strong>{{ row[0] }} — {{ row[3] }}</strong>
                <small>{{ row[1] }} • {{ row[2] }}</small>
              </div>
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
p {
  margin: 0;
}

h1 {
  font-size: clamp(28px, 4vw, 42px);
  line-height: 1.05;
}

.summary-panel p,
.compact-panel p {
  color: var(--gray-500);
  line-height: 1.5;
}

.metrics,
.health-strip {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.metrics article,
.health-strip article {
  border: 1px solid var(--border-subtle);
  border-left: 3px solid var(--stat-blue);
  border-radius: var(--radius-md);
  background: var(--color-white);
  padding: 14px;
}

.metrics article {
  display: grid;
  gap: 5px;
}

.health-strip article {
  display: flex;
  align-items: center;
  gap: 10px;
}

.tone-green {
  border-left-color: var(--stat-green) !important;
}

.tone-red {
  border-left-color: var(--stat-red) !important;
}

.metrics span,
.metrics small,
.health-strip span,
.feed-row small {
  color: var(--gray-500);
  font-size: 12px;
  font-weight: 700;
}

.metrics strong {
  font-size: 28px;
  line-height: 1;
}

.health-strip strong {
  display: block;
  margin-top: 3px;
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 12px;
  align-items: start;
}

.content-grid > main,
.content-grid .panel {
  min-width: 0;
}

.side-column {
  position: sticky;
  top: 84px;
  gap: 12px;
}

.compact-panel {
  display: grid;
  gap: 10px;
}

.feed-row {
  display: flex;
  gap: 10px;
  border-bottom: 1px solid var(--border-subtle);
  padding: 11px 0;
}

.feed-row strong {
  font-size: 14px;
  line-height: 1.25;
}

.feed-row:last-child {
  border-bottom: 0;
}

.feed-row div {
  display: grid;
  gap: 3px;
}

@media (max-width: 980px) {
  .summary-panel {
    align-items: flex-start;
    flex-direction: column;
  }

  .metrics,
  .health-strip,
  .content-grid {
    grid-template-columns: 1fr;
  }

  .side-column {
    position: static;
  }
}
</style>
