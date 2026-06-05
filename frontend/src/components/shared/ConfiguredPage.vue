<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  FileText,
  PanelRight,
  Search,
  Sparkles,
  SlidersHorizontal
} from 'lucide-vue-next';

import RoleShell from '@/layouts/RoleShell.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseCard from '@/components/ui/BaseCard.vue';
import BaseInput from '@/components/ui/BaseInput.vue';
import DataTable from '@/components/ui/DataTable.vue';
import BaseModal from '@/components/ui/BaseModal.vue';
import { runDemoAction } from '@/services/demoActions';
import { LOADERS, RUNNERS } from '@/services/aiRunners';
import { useUi } from '@/stores/ui';

const props = defineProps({
  shellTitle: { type: String, required: true },
  nav: { type: Array, required: true },
  pages: { type: Object, required: true },
  fallback: { type: Object, required: true }
});

const route = useRoute();
const ui = useUi();
const pattern = computed(() => route.matched[0]?.path ?? route.path);
const page = computed(
  () => props.pages[pattern.value] ?? props.pages[route.path] ?? props.fallback
);
const formValues = ref({});
const selectedCard = ref(null);

// Real backend wiring for this route (if any).
const runner = computed(() => RUNNERS[pattern.value] || RUNNERS[route.path] || null);
const loader = computed(() => LOADERS[pattern.value] || LOADERS[route.path] || null);
const running = ref(false);
const apiResult = ref(null);
const liveTable = ref(null);
const liveLoading = ref(false);

// Fields shown in the form: runner fields take priority over static config.
const fields = computed(() => {
  if (runner.value) return runner.value.fields;
  return (page.value.formFields ?? []).map((f) => ({ key: f, label: f, type: 'text' }));
});

const storageKey = computed(() => `smartcourt-page:${route.path}`);

const loadForm = () => {
  const saved = JSON.parse(window.localStorage.getItem(storageKey.value) || '{}');
  formValues.value = Object.fromEntries(
    fields.value.map((f) => [f.key, f.type === 'file' ? null : saved[f.key] ?? ''])
  );
  apiResult.value = null;
};

const onFileChange = (key, event) => {
  const f = event.target.files?.[0] || null;
  formValues.value = { ...formValues.value, [key]: f };
};

const loadLive = async () => {
  liveTable.value = null;
  if (!loader.value) return;
  liveLoading.value = true;
  try {
    liveTable.value = await loader.value();
  } catch (e) {
    ui.pushToast({ type: 'error', title: 'Yuklab bo\'lmadi', text: e.message });
  } finally {
    liveLoading.value = false;
  }
};

watch(
  page,
  () => {
    loadForm();
    loadLive();
  },
  { immediate: true }
);

const tableData = computed(() => liveTable.value || page.value.table || null);

const saveForm = () => {
  const serializable = Object.fromEntries(
    Object.entries(formValues.value).filter(([, v]) => !(v instanceof File))
  );
  window.localStorage.setItem(storageKey.value, JSON.stringify(serializable));
};

const resetForm = () => {
  formValues.value = Object.fromEntries(
    fields.value.map((f) => [f.key, f.type === 'file' ? null : ''])
  );
  apiResult.value = null;
  window.localStorage.removeItem(storageKey.value);
  ui.pushToast({ type: 'info', title: 'Tozalandi', text: 'Kiritilgan qiymatlar tozalandi.' });
};

const runAction = async (label) => {
  if (fields.value.length) saveForm();
  // Real AI runner for this route?
  if (runner.value) {
    if (running.value) return;
    running.value = true;
    apiResult.value = null;
    try {
      apiResult.value = await runner.value.run(formValues.value);
      ui.pushToast({ type: 'success', title: 'AI natijasi tayyor', text: apiResult.value.title || 'Bajarildi' });
    } catch (e) {
      ui.pushToast({ type: 'error', title: 'AI xatosi', text: e.message || 'Bog\'lanib bo\'lmadi.' });
    } finally {
      running.value = false;
    }
    return;
  }
  runDemoAction({ label, ui, route, payload: formValues.value });
};
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
          <BaseButton
            v-if="page.secondaryAction"
            variant="secondary"
            :icon="SlidersHorizontal"
            @click="resetForm"
          >
            {{ page.secondaryAction }}
          </BaseButton>
          <BaseButton
            v-if="page.primaryAction || runner"
            :icon="runner ? Sparkles : ArrowRight"
            icon-position="right"
            :loading="running"
            @click="runAction(page.primaryAction || 'AI tahlil')"
          >
            {{ runner ? (running ? 'AI ishlamoqda...' : 'AI tahlil') : page.primaryAction }}
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
          <section v-if="fields.length" class="panel">
            <div class="panel-header">
              <h2>{{ runner ? 'AI kiritish' : 'Ma’lumotlar' }}</h2>
              <ClipboardList :size="22" :stroke-width="1.5" />
            </div>
            <div class="grid grid-2">
              <template v-for="field in fields" :key="field.key">
                <label v-if="field.type === 'textarea'" class="full textarea-field">
                  <span>{{ field.label }}</span>
                  <textarea v-model="formValues[field.key]" rows="5" :placeholder="field.label" />
                </label>
                <label v-else-if="field.type === 'file'" class="full file-field">
                  <span>{{ field.label }}</span>
                  <input
                    type="file"
                    :accept="field.accept"
                    @change="onFileChange(field.key, $event)"
                  />
                  <span v-if="formValues[field.key]?.name" class="file-name">
                    <FileText :size="14" /> {{ formValues[field.key].name }}
                  </span>
                </label>
                <BaseInput
                  v-else
                  v-model="formValues[field.key]"
                  :label="field.label"
                  :placeholder="field.label"
                  :icon="field.label.toLowerCase().includes('qidir') ? Search : undefined"
                />
              </template>
            </div>
            <div class="form-actions">
              <BaseButton variant="secondary" @click="resetForm">Tozalash</BaseButton>
              <BaseButton :icon="runner ? Sparkles : undefined" :loading="running" @click="runAction(page.primaryAction || 'AI tahlil')">
                {{ runner ? 'AI tahlil' : 'Saqlash' }}
              </BaseButton>
            </div>

            <div v-if="running" class="ai-loading">
              <span class="spinner" />
              <div>
                <p class="loading-title">AI tahlil qilmoqda…</p>
                <p class="loading-sub">{{ runner?.loadingText || 'Iltimos, biroz kuting.' }}</p>
              </div>
            </div>

            <div v-else-if="apiResult" class="ai-output">
              <p class="eyebrow">AI natijasi</p>
              <h3>{{ apiResult.title }}</h3>

              <div v-if="apiResult.meta?.length" class="meta-row">
                <span v-for="(m, i) in apiResult.meta" :key="i" class="meta-chip">{{ m }}</span>
              </div>

              <div v-if="apiResult.sections?.length" class="ai-sections">
                <article
                  v-for="(s, i) in apiResult.sections"
                  :key="i"
                  class="ai-section"
                  :class="{ warn: s.tone === 'warn' }"
                >
                  <h4>{{ s.label }}</h4>
                  <p v-if="s.text" class="section-text">{{ s.text }}</p>
                  <ul v-if="s.items?.length" class="section-list">
                    <li v-for="(item, j) in s.items" :key="j">
                      <CheckCircle2 :size="14" />
                      <span>{{ item }}</span>
                    </li>
                  </ul>
                </article>
              </div>

              <p v-else v-for="(line, i) in apiResult.lines || []" :key="i" class="ai-line">
                <CheckCircle2 :size="15" />{{ line }}
              </p>
            </div>
          </section>

          <section v-if="tableData" class="panel">
            <div class="panel-header">
              <h2>{{ liveLoading ? 'Yuklanmoqda...' : 'Jadval' }}</h2>
              <FileText :size="22" :stroke-width="1.5" />
            </div>
            <DataTable :columns="tableData.columns" :rows="tableData.rows" />
          </section>

          <section v-if="page.cards?.length" class="grid grid-3">
            <BaseCard
              v-for="card in page.cards"
              :key="card.title"
              interactive
              @click="selectedCard = card"
            >
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

    <BaseModal
      :open="Boolean(selectedCard)"
      :title="selectedCard?.title ?? page.title"
      @close="selectedCard = null"
    >
      <p>{{ selectedCard?.text }}</p>
      <div class="form-actions">
        <BaseButton variant="secondary" @click="selectedCard = null">Bekor qilish</BaseButton>
        <BaseButton @click="runAction(selectedCard?.title)">Davom etish</BaseButton>
      </div>
    </BaseModal>
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

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 18px;
}

.full {
  grid-column: 1 / -1;
}

.textarea-field {
  display: grid;
  gap: 8px;
  color: var(--gray-700);
  font-size: 13px;
  font-weight: 600;
}

.textarea-field textarea {
  resize: vertical;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  background: var(--color-white);
  color: var(--gray-900);
  padding: 12px;
  outline: 0;
  font-family: inherit;
  font-size: 13px;
  line-height: 1.6;
}

.file-field {
  display: grid;
  gap: 8px;
  color: var(--gray-700);
  font-size: 13px;
  font-weight: 600;
}

.file-field input[type='file'] {
  border: 1px dashed var(--border-default);
  border-radius: var(--radius-md);
  background: var(--color-white);
  color: var(--gray-700);
  padding: 12px;
  font-family: inherit;
  font-size: 13px;
  cursor: pointer;
}

.file-field input[type='file']:hover {
  border-color: var(--gray-500);
  background: var(--gray-50);
}

.file-field .file-name {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--gray-600);
  font-weight: 500;
  font-size: 12px;
}

.ai-loading {
  margin-top: 18px;
  display: flex;
  align-items: center;
  gap: 14px;
  border: 1px solid var(--border-subtle);
  border-left: 3px solid var(--stat-blue);
  border-radius: var(--radius-md);
  background: linear-gradient(90deg, var(--gray-50), var(--gray-100));
  background-size: 200% 100%;
  animation: shimmer 1.8s ease-in-out infinite;
  padding: 16px 18px;
}

.ai-loading .loading-title {
  margin: 0;
  font-weight: 600;
  font-size: 14px;
  color: var(--gray-900);
}

.ai-loading .loading-sub {
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--gray-600);
  line-height: 1.5;
}

.spinner {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 3px solid var(--gray-200);
  border-top-color: var(--stat-blue);
  animation: spin 0.85s linear infinite;
  flex-shrink: 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 0 0 14px;
}

.meta-chip {
  display: inline-flex;
  align-items: center;
  background: var(--color-white);
  border: 1px solid var(--border-subtle);
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 11.5px;
  font-weight: 500;
  color: var(--gray-700);
}

.ai-sections {
  display: grid;
  gap: 12px;
}

.ai-section {
  background: var(--color-white);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 12px 14px;
}

.ai-section.warn {
  border-color: #fbbf24;
  background: #fffbeb;
}

.ai-section h4 {
  margin: 0 0 8px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--gray-900);
  text-transform: uppercase;
}

.ai-section .section-text {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--gray-800);
}

.ai-section .section-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 6px;
}

.ai-section .section-list li {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13.5px;
  line-height: 1.55;
  color: var(--gray-800);
}

.ai-section.warn .section-list li :first-child {
  color: #d97706;
}

.ai-output {
  margin-top: 18px;
  border: 1px solid var(--border-subtle);
  border-left: 3px solid var(--stat-blue);
  border-radius: var(--radius-md);
  background: var(--gray-100);
  padding: 16px;
}

.ai-output h3 {
  margin: 6px 0 12px;
  font-size: 18px;
}

.ai-line {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin: 6px 0;
  color: var(--gray-700);
  font-size: 14px;
  line-height: 1.5;
}

.ai-line svg {
  margin-top: 3px;
  color: var(--stat-green);
  flex-shrink: 0;
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
