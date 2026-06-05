<script setup>
import { computed, onMounted, ref } from 'vue';
import {
  CalendarDays,
  CreditCard,
  FileText,
  Plus,
  Scale,
  ScanSearch,
  Send,
  Sparkles
} from 'lucide-vue-next';

import RoleShell from '@/layouts/RoleShell.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseCard from '@/components/ui/BaseCard.vue';
import BaseBadge from '@/components/ui/BaseBadge.vue';
import DataTable from '@/components/ui/DataTable.vue';
import { portalNav } from '@/data/navigation';
import { ensureAuth, getCitizenDashboard, listClaims } from '@/lib/api';
import { downloadDemoFile } from '@/services/demoActions';
import { useUi } from '@/stores/ui';

const ui = useUi();
const dash = ref(null);
const claims = ref([]);
const userName = ref('Fuqaro');

const load = async () => {
  try {
    const me = await ensureAuth('citizen');
    if (me?.full_name) userName.value = me.full_name;
    const [d, c] = await Promise.all([getCitizenDashboard(), listClaims()]);
    dash.value = d;
    if (d?.greeting_name) userName.value = d.greeting_name;
    claims.value = c;
  } catch (e) {
    ui.pushToast({ type: 'error', title: 'Yuklab bo\'lmadi', text: e.message });
  }
};

onMounted(load);

const metrics = computed(() => [
  { label: 'Jami arizalar', value: String(dash.value?.total_claims ?? 0), note: 'umumiy', tone: 'blue' },
  { label: 'Aktiv arizalar', value: String(dash.value?.active_claims ?? 0), note: 'jarayonda', tone: 'green' },
  { label: 'Qoralamalar', value: String(dash.value?.drafts ?? 0), note: 'tugallanmagan', tone: 'red' },
  { label: 'AI tavsiya', value: 'RAG', note: 'mediatsiya', tone: 'blue' }
]);

const statusLabel = (s) => String(s || '').replace(/_/g, ' ');

const exportClaims = () => {
  downloadDemoFile('arizalarim.json', claims.value);
  ui.pushToast({ type: 'success', title: 'Eksport', text: 'Arizalar JSON yuklab olindi.' });
};

const nextEvents = [
  { icon: CreditCard, title: 'Davlat boji holati', meta: 'Portal' },
  { icon: FileText, title: 'Hujjatlarni yuklash', meta: 'Ariza' },
  { icon: CalendarDays, title: 'Sud majlisi sanasi', meta: 'Kutilmoqda' }
];
</script>

<template>
  <RoleShell title="Fuqaro portali" subtitle="OneID tasdiqlangan profil" :nav="portalNav">
    <section class="dashboard">
      <header class="summary-panel">
        <div>
          <p class="eyebrow">Bugungi holat</p>
          <h1>{{ userName }}</h1>
          <p>Arizalar, to‘lov va majlis sanalari nazoratda.</p>
        </div>
        <div class="summary-actions">
          <RouterLink to="/portal/claims/new"
            ><BaseButton :icon="Plus">Yangi ariza</BaseButton></RouterLink
          >
          <RouterLink to="/portal/claim-validator"
            ><BaseButton variant="secondary" :icon="ScanSearch"
              >Arizani tekshirish</BaseButton
            ></RouterLink
          >
          <RouterLink to="/portal/ai-assistant"
            ><BaseButton variant="secondary" :icon="Sparkles">AI yordam</BaseButton></RouterLink
          >
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
                <p class="eyebrow">Arizalar</p>
                <h2>Aktiv ishlar</h2>
              </div>
              <BaseButton variant="ghost" :icon="Send" size="sm" @click="exportClaims">Eksport</BaseButton>
            </div>
            <p v-if="!claims.length" class="muted">
              Hozircha arizangiz yo'q. "Yangi ariza" tugmasi orqali birinchi arizangizni yarating.
            </p>
            <div v-else class="claim-grid">
              <BaseCard
                v-for="claim in claims"
                :key="claim.id"
                class="claim-card tone-blue"
                interactive
              >
                <div class="card-top">
                  <BaseBadge variant="outline">{{ statusLabel(claim.status) }}</BaseBadge>
                  <strong>{{ claim.dispute_type }}</strong>
                </div>
                <h3>{{ claim.title }}</h3>
                <p>#{{ claim.reference || claim.id }}</p>
                <RouterLink :to="`/portal/claims/${claim.id}`">Tafsilotlar</RouterLink>
              </BaseCard>
            </div>
          </section>

          <section v-if="claims.length" class="panel">
            <div class="panel-header">
              <h2>Arizalar ro'yxati</h2>
              <RouterLink to="/portal/claims"
                ><BaseButton variant="ghost" size="sm">Hammasi</BaseButton></RouterLink
              >
            </div>
            <DataTable
              :columns="['Reference', 'Sarlavha', 'Turi', 'Holat']"
              :rows="claims.map((claim) => [claim.reference || claim.id, claim.title, claim.dispute_type, statusLabel(claim.status)])"
            />
          </section>
        </main>

        <aside class="grid side-column">
          <section class="panel compact-panel">
            <Sparkles :size="22" :stroke-width="1.5" />
            <h2>AI tavsiyasi</h2>
            <p>1 ta ariza mediatsiya orqali tezroq hal bo‘lishi mumkin.</p>
            <RouterLink to="/portal/mediation"
              ><BaseButton variant="secondary" size="sm" :icon="Scale"
                >Mediatsiya</BaseButton
              ></RouterLink
            >
          </section>

          <section class="panel compact-panel">
            <ScanSearch :size="22" :stroke-width="1.5" />
            <h2>ClaimValidator</h2>
            <p>Arizani yuborishdan oldin kamchiliklar va yurisdiksiyani tekshiring.</p>
            <RouterLink to="/portal/claim-validator">
              <BaseButton variant="secondary" size="sm">Tekshirish</BaseButton>
            </RouterLink>
          </section>

          <section class="panel">
            <h2>Keyingi qadamlar</h2>
            <article v-for="event in nextEvents" :key="event.title" class="event-row">
              <component :is="event.icon" :size="17" :stroke-width="1.5" />
              <div>
                <strong>{{ event.title }}</strong>
                <span>{{ event.meta }}</span>
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
h3,
p {
  margin: 0;
}

h1 {
  font-size: clamp(28px, 4vw, 42px);
  line-height: 1.05;
}

.summary-panel p,
.claim-card p,
.compact-panel p {
  color: var(--gray-500);
  line-height: 1.5;
}

.summary-actions,
.card-top {
  display: flex;
  align-items: center;
  gap: 8px;
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

.metrics .tone-green {
  border-left-color: var(--stat-green);
}

.metrics .tone-red {
  border-left-color: var(--stat-red);
}

.metrics span,
.metrics small,
.event-row span {
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

.claim-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.claim-card {
  display: grid;
  gap: 10px;
  border-top: 3px solid var(--stat-blue);
}

.claim-card.tone-green {
  border-top-color: var(--stat-green);
}

.claim-card.tone-red {
  border-top-color: var(--stat-red);
}

.score {
  overflow: hidden;
  height: 7px;
  border-radius: var(--radius-full);
  background: var(--gray-100);
}

.score span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--stat-blue);
}

.tone-green .score span {
  background: var(--stat-green);
}

.tone-red .score span {
  background: var(--stat-red);
}

.side-column {
  position: sticky;
  top: 84px;
}

.compact-panel {
  display: grid;
  gap: 10px;
}

.event-row {
  display: flex;
  gap: 10px;
  border-bottom: 1px solid var(--border-subtle);
  padding: 12px 0;
}

.event-row:last-child {
  border-bottom: 0;
}

.event-row div {
  display: grid;
  gap: 3px;
}

a {
  color: var(--gray-900);
  font-weight: 700;
}

@media (max-width: 980px) {
  .summary-panel,
  .summary-actions {
    align-items: flex-start;
    flex-direction: column;
  }

  .metrics,
  .claim-grid,
  .content-grid {
    grid-template-columns: 1fr;
  }

  .side-column {
    position: static;
  }
}
</style>
