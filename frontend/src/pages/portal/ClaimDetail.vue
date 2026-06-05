<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { ArrowLeft, MessageSquare } from 'lucide-vue-next';

import RoleShell from '@/layouts/RoleShell.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseCard from '@/components/ui/BaseCard.vue';
import BaseTabs from '@/components/ui/BaseTabs.vue';
import { portalNav } from '@/data/navigation';
import { aiLexPredictor, ensureAuth, getClaim, listClaimDocuments } from '@/lib/api';
import { useUi } from '@/stores/ui';

const ui = useUi();
const route = useRoute();
const activeTab = ref('Tafsilot');
const claim = ref(null);
const documents = ref([]);
const prediction = ref(null);
const loading = ref(true);

const score = computed(() => prediction.value?.win_probability ?? 0);
const scoreTone = computed(() => {
  if (score.value >= 75) return 'green';
  if (score.value >= 50) return 'blue';
  return 'red';
});
const statusLabel = computed(() => String(claim.value?.status || '').replace(/_/g, ' '));
const createdAt = computed(() => {
  try {
    return new Date(claim.value?.created_at).toLocaleDateString('uz-UZ');
  } catch {
    return '—';
  }
});

const load = async () => {
  loading.value = true;
  try {
    await ensureAuth('citizen');
    const id = route.params.id;
    claim.value = await getClaim(id);
    documents.value = await listClaimDocuments(id).catch(() => []);
    // LexPredictor — yutish ehtimoli + pretsedentlar.
    prediction.value = await aiLexPredictor({
      dispute_type: claim.value.dispute_type,
      description: claim.value.description || claim.value.title
    }).catch(() => null);
  } catch (e) {
    ui.pushToast({ type: 'error', title: 'Ariza topilmadi', text: e.message });
  } finally {
    loading.value = false;
  }
};

onMounted(load);
</script>

<template>
  <RoleShell title="Ariza tafsilotlari" subtitle="Sud jarayoni holati" :nav="portalNav">
    <section class="panel detail">
      <RouterLink to="/portal/dashboard" class="back"><ArrowLeft :size="18" />Orqaga</RouterLink>

      <p v-if="loading" class="muted">Yuklanmoqda...</p>

      <template v-else-if="claim">
        <div class="panel-header">
          <div>
            <p class="eyebrow">Yaratilgan: {{ createdAt }}</p>
            <h1>{{ claim.reference || `Ariza #${claim.id}` }}</h1>
            <p class="muted">{{ claim.title }}</p>
          </div>
          <BaseButton :icon="MessageSquare" @click="ui.pushToast({ type: 'info', title: 'Xat', text: 'Xat-xabar moduli tez orada.' })">Sudya bilan xat</BaseButton>
        </div>
        <BaseTabs
          :tabs="['Tafsilot', 'Hujjatlar', 'AI']"
          :active="activeTab"
          @change="activeTab = $event"
        />

        <div v-if="activeTab === 'Tafsilot'" class="grid grid-2 content">
          <BaseCard variant="filled">
            <h2>Holat</h2>
            <p><span class="status-dot" />{{ statusLabel }}</p>
            <p>Nizo turi: {{ claim.dispute_type }}</p>
            <p>Summa: {{ claim.amount ? `${claim.amount} ${claim.currency}` : '—' }}</p>
            <p>Davlat boji: {{ claim.state_fee ? `${claim.state_fee} UZS` : '—' }}</p>
          </BaseCard>
          <BaseCard variant="filled">
            <h2>Mohiyati</h2>
            <p class="muted">{{ claim.description || 'Tavsif kiritilmagan.' }}</p>
          </BaseCard>
        </div>

        <div v-else-if="activeTab === 'Hujjatlar'" class="content">
          <p v-if="!documents.length" class="muted">Hujjat yuklanmagan.</p>
          <BaseCard v-for="d in documents" :key="d.id" variant="filled" class="doc-row">
            <strong>{{ d.filename }}</strong>
            <p class="muted">{{ d.kind }} · {{ Math.round((d.size_bytes || 0) / 1024) }} KB</p>
            <p v-if="d.ai_analysis?.summary" class="muted">AI: {{ d.ai_analysis.summary }}</p>
          </BaseCard>
        </div>

        <div v-else class="content">
          <BaseCard variant="outlined" class="ai-card" :class="`tone-${scoreTone}`">
            <h2>LexPredictor — yutish ehtimoli</h2>
            <strong class="metric">{{ score }}%</strong>
            <div class="bar"><span :style="{ width: `${score}%` }" /></div>
            <p class="muted">
              {{ prediction ? `${prediction.similar_cases_found} ta o'xshash pretsedent topildi.` : 'AI tahlil mavjud emas.' }}
            </p>
          </BaseCard>
          <BaseCard v-if="prediction?.precedents?.length" variant="filled" style="margin-top: 14px">
            <h2>O'xshash pretsedentlar</h2>
            <p v-for="(p, i) in prediction.precedents" :key="i" class="muted">
              {{ p.reference }} — {{ p.outcome }} ({{ Math.round((p.similarity || 0) * 100) }}%)
            </p>
          </BaseCard>
        </div>
      </template>
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
