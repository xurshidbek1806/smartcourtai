<script setup>
import { computed, onMounted, ref } from 'vue';
import { Database, RotateCcw, Cpu } from 'lucide-vue-next';

import RoleShell from '@/layouts/RoleShell.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseBadge from '@/components/ui/BaseBadge.vue';
import BaseCard from '@/components/ui/BaseCard.vue';
import { adminNav } from '@/data/navigation';
import { adminAiModels, ensureAuth } from '@/lib/api';
import { useUi } from '@/stores/ui';

const ui = useUi();
const loading = ref(true);
const data = ref(null);

const load = async () => {
  loading.value = true;
  try {
    await ensureAuth('admin');
    data.value = await adminAiModels();
  } catch (e) {
    ui.pushToast({ type: 'error', title: 'Yuklab bo\'lmadi', text: e.message });
  } finally {
    loading.value = false;
  }
};

onMounted(load);

const models = computed(() => {
  const d = data.value;
  if (!d) return [];
  const list = (d.installed_models || []).map((name) => ({
    name,
    role: name === d.active_llm ? 'LLM (faol)' : name === d.active_embed ? 'Embedding (faol)' : 'O\'rnatilgan',
    active: name === d.active_llm || name === d.active_embed
  }));
  return list;
});
</script>

<template>
  <RoleShell title="AI modellari" subtitle="Ollama + vector store monitoring" :nav="adminNav">
    <section class="panel">
      <div class="panel-header">
        <div>
          <p class="eyebrow">ModelOps · jonli holat</p>
          <h1>AI modellari boshqaruvi</h1>
        </div>
        <BaseButton :icon="RotateCcw" @click="load">Yangilash</BaseButton>
      </div>

      <p v-if="loading" class="muted">Yuklanmoqda...</p>

      <template v-else-if="data">
        <div class="grid grid-3 status-row">
          <BaseCard variant="filled">
            <p class="muted">Ollama holati</p>
            <strong class="metric">{{ data.ollama_available ? 'Faol' : 'O\'chiq' }}</strong>
          </BaseCard>
          <BaseCard variant="filled">
            <p class="muted">Qonun vektorlari</p>
            <strong class="metric">{{ data.vector_store?.laws ?? 0 }}</strong>
          </BaseCard>
          <BaseCard variant="filled">
            <p class="muted">Pretsedent vektorlari</p>
            <strong class="metric">{{ data.vector_store?.precedents ?? 0 }}</strong>
          </BaseCard>
        </div>

        <div class="grid grid-2">
          <BaseCard v-for="model in models" :key="model.name" interactive>
            <div class="model-head">
              <h2><Cpu :size="18" :stroke-width="1.5" /> {{ model.name }}</h2>
              <BaseBadge :variant="model.active ? 'filled' : 'outline'">{{ model.role }}</BaseBadge>
            </div>
            <p>Provider: Ollama (lokal, on-premise)</p>
            <p>Holat: {{ data.ollama_available ? 'Yuklangan va tayyor' : 'Mavjud emas' }}</p>
          </BaseCard>
        </div>

        <BaseCard class="store-card">
          <h2><Database :size="18" :stroke-width="1.5" /> Ma'lumotlar bazalari</h2>
          <p>Faol LLM: <strong>{{ data.active_llm }}</strong></p>
          <p>Embedding modeli: <strong>{{ data.active_embed }}</strong></p>
          <p>Neo4j (CorruptAlert): <strong>{{ data.neo4j_available ? 'Ulangan' : 'O\'chiq (ixtiyoriy)' }}</strong></p>
        </BaseCard>
      </template>
    </section>
  </RoleShell>
</template>

<style scoped>
h1 {
  margin: 0;
  font-size: clamp(34px, 5vw, 56px);
}
.status-row {
  margin-bottom: 18px;
}
.metric {
  font-size: 32px;
}
.model-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.model-head h2 {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.store-card {
  margin-top: 18px;
}
.store-card h2 {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
</style>
