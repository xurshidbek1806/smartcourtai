<script setup>
import { computed, onMounted, ref } from 'vue';
import {
  Database,
  FileText,
  RotateCcw,
  Search,
  Sparkles,
  Trash2,
  Upload,
  X
} from 'lucide-vue-next';

import RoleShell from '@/layouts/RoleShell.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseCard from '@/components/ui/BaseCard.vue';
import BaseInput from '@/components/ui/BaseInput.vue';
import { adminNav } from '@/data/navigation';
import { corpusClear, corpusSearch, corpusStats, corpusUpload, ensureAuth } from '@/lib/api';
import { useUi } from '@/stores/ui';

const ui = useUi();

const ACCEPT = '.pdf,.docx,.json,.jsonl,.txt,.md';
const collection = ref('laws'); // 'laws' | 'precedents'
const code = ref(''); // FK / MK / OK / JK ...
const fileInputRef = ref(null);
const dragOver = ref(false);

// File queue — each item: { id, file, status, progress, result, error }
const queue = ref([]);
const uploading = ref(false);

// Live stats
const stats = ref({ laws: { count: 0 }, precedents: { count: 0 } });

// Search test
const query = ref('');
const searching = ref(false);
const searchResults = ref([]);

const totalCount = computed(
  () => (stats.value.laws?.count || 0) + (stats.value.precedents?.count || 0)
);

const fmtSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
};

const loadStats = async () => {
  try {
    await ensureAuth('admin');
    stats.value = await corpusStats();
  } catch (e) {
    ui.pushToast({ type: 'error', title: 'Statistika xatosi', text: e.message });
  }
};

onMounted(loadStats);

// ── File handling ─────────────────────────────────────────
const acceptFile = (f) => {
  const ext = (f.name.split('.').pop() || '').toLowerCase();
  return ['pdf', 'docx', 'json', 'jsonl', 'txt', 'md'].includes(ext);
};

const enqueue = (files) => {
  for (const f of files) {
    if (!acceptFile(f)) {
      ui.pushToast({
        type: 'error',
        title: 'Qo\'llab-quvvatlanmaydigan format',
        text: `${f.name} — faqat PDF, DOCX, JSON, JSONL, TXT, MD`
      });
      continue;
    }
    queue.value.push({
      id: `${Date.now()}-${f.name}-${Math.random().toString(36).slice(2, 7)}`,
      file: f,
      status: 'pending', // pending | uploading | done | error
      progress: 0,
      result: null,
      error: null
    });
  }
};

const onDrop = (e) => {
  e.preventDefault();
  dragOver.value = false;
  enqueue(Array.from(e.dataTransfer?.files || []));
};

const onPick = (e) => {
  enqueue(Array.from(e.target.files || []));
  e.target.value = '';
};

const removeItem = (id) => {
  queue.value = queue.value.filter((q) => q.id !== id);
};

const clearQueue = () => {
  queue.value = queue.value.filter((q) => q.status === 'uploading');
};

// ── Upload pipeline ───────────────────────────────────────
const uploadOne = async (item) => {
  item.status = 'uploading';
  item.progress = 10;
  try {
    const res = await corpusUpload(item.file, {
      collection: collection.value,
      code: code.value.trim(),
      mode: 'auto'
    });
    item.progress = 100;
    item.status = 'done';
    item.result = res;
  } catch (e) {
    item.status = 'error';
    item.error = e.message || 'Yuklab bo\'lmadi';
  }
};

const uploadAll = async () => {
  if (uploading.value) return;
  const pending = queue.value.filter((q) => q.status === 'pending');
  if (!pending.length) {
    ui.pushToast({ type: 'info', title: 'Navbat bo\'sh', text: 'Avval fayl tanlang.' });
    return;
  }
  uploading.value = true;
  await ensureAuth('admin');

  // Up to 3 files in parallel for fast ingest.
  const CONCURRENT = 3;
  let idx = 0;
  const workers = Array.from({ length: CONCURRENT }, async () => {
    while (idx < pending.length) {
      const my = pending[idx++];
      await uploadOne(my);
      await loadStats(); // live refresh after every file
    }
  });
  await Promise.all(workers);
  uploading.value = false;
  const doneCount = pending.filter((q) => q.status === 'done').length;
  ui.pushToast({
    type: 'success',
    title: 'Yuklash tugadi',
    text: `${doneCount}/${pending.length} fayl Qdrant'ga indekslandi.`
  });
};

const clearCollection = async (name) => {
  if (!window.confirm(`"${name}" kolleksiyasidagi BARCHA vektorlar o'chiriladi. Davom etilsinmi?`)) return;
  try {
    await corpusClear(name);
    await loadStats();
    ui.pushToast({ type: 'success', title: 'Tozalandi', text: `${name} kolleksiyasi qayta yaratildi.` });
  } catch (e) {
    ui.pushToast({ type: 'error', title: 'Xato', text: e.message });
  }
};

// ── Live search test ──────────────────────────────────────
const runSearch = async () => {
  if (!query.value.trim()) return;
  searching.value = true;
  try {
    const res = await corpusSearch(query.value, collection.value, 5);
    searchResults.value = res.results || [];
  } catch (e) {
    ui.pushToast({ type: 'error', title: 'Qidiruv xatosi', text: e.message });
  } finally {
    searching.value = false;
  }
};
</script>

<template>
  <RoleShell title="RAG korpusi" subtitle="Qonun va pretsedentlarni yuklash" :nav="adminNav">
    <section class="corpus">
      <!-- ── Stats strip ───────────────────────────────────── -->
      <header class="stats-strip">
        <BaseCard variant="filled" class="stat">
          <Database :size="22" :stroke-width="1.5" />
          <div>
            <p class="muted">Qonun moddalari</p>
            <strong>{{ stats.laws?.count ?? 0 }}</strong>
          </div>
        </BaseCard>
        <BaseCard variant="filled" class="stat">
          <Sparkles :size="22" :stroke-width="1.5" />
          <div>
            <p class="muted">Pretsedentlar</p>
            <strong>{{ stats.precedents?.count ?? 0 }}</strong>
          </div>
        </BaseCard>
        <BaseCard variant="filled" class="stat total">
          <FileText :size="22" :stroke-width="1.5" />
          <div>
            <p class="muted">Jami vektorlar</p>
            <strong>{{ totalCount }}</strong>
          </div>
        </BaseCard>
        <div class="strip-actions">
          <BaseButton variant="secondary" size="sm" :icon="RotateCcw" @click="loadStats">
            Yangilash
          </BaseButton>
        </div>
      </header>

      <!-- ── Upload zone ───────────────────────────────────── -->
      <section class="panel">
        <div class="panel-header">
          <div>
            <p class="eyebrow">RAG ingest</p>
            <h1>Korpusga fayl yuklash</h1>
          </div>
          <div class="head-actions">
            <BaseButton
              :icon="Upload"
              :loading="uploading"
              :disabled="!queue.length"
              @click="uploadAll"
            >
              Hammasini yuborish
            </BaseButton>
          </div>
        </div>

        <!-- Settings row -->
        <div class="settings">
          <label class="field">
            <span>Kolleksiya</span>
            <select v-model="collection">
              <option value="laws">Qonunlar (kodekslar)</option>
              <option value="precedents">Pretsedentlar (sud qarorlari)</option>
            </select>
          </label>
          <BaseInput
            v-model="code"
            label="Kodeks belgisi (ixtiyoriy)"
            placeholder="FK / MK / JK / OK / FPK ..."
          />
        </div>

        <!-- Dropzone -->
        <div
          class="dropzone"
          :class="{ 'is-over': dragOver }"
          role="button"
          tabindex="0"
          @click="fileInputRef?.click()"
          @keydown.enter="fileInputRef?.click()"
          @dragover.prevent="dragOver = true"
          @dragleave.prevent="dragOver = false"
          @drop="onDrop"
        >
          <Upload :size="40" :stroke-width="1.5" />
          <strong>Fayllarni shu yerga tashlang</strong>
          <p>PDF · DOCX · JSON · JSONL · TXT · MD &nbsp;·&nbsp; ko'p fayl bir vaqtda</p>
          <input
            ref="fileInputRef"
            type="file"
            multiple
            hidden
            :accept="ACCEPT"
            @change="onPick"
          />
        </div>

        <!-- File queue -->
        <div v-if="queue.length" class="queue">
          <div class="queue-head">
            <strong>{{ queue.length }} ta fayl navbatda</strong>
            <button type="button" class="link" @click="clearQueue">Tozalash</button>
          </div>
          <article v-for="item in queue" :key="item.id" :class="['queue-row', `s-${item.status}`]">
            <FileText :size="18" :stroke-width="1.5" />
            <div class="row-info">
              <strong>{{ item.file.name }}</strong>
              <span>{{ fmtSize(item.file.size) }}</span>
            </div>
            <div class="row-status">
              <template v-if="item.status === 'pending'">Kutilmoqda</template>
              <template v-else-if="item.status === 'uploading'">Yuborilmoqda...</template>
              <template v-else-if="item.status === 'done'">
                <span class="ok">✓ {{ item.result?.indexed }} chunk / {{ item.result?.chunks }} topildi</span>
              </template>
              <template v-else-if="item.status === 'error'">
                <span class="err">{{ item.error }}</span>
              </template>
            </div>
            <div class="row-progress">
              <span :style="{ width: `${item.progress}%` }" />
            </div>
            <button
              v-if="item.status !== 'uploading'"
              type="button"
              class="row-x"
              aria-label="O'chirish"
              @click="removeItem(item.id)"
            >
              <X :size="14" />
            </button>
          </article>
        </div>
      </section>

      <!-- ── Live search test ──────────────────────────────── -->
      <section class="panel">
        <div class="panel-header">
          <div>
            <p class="eyebrow">Tekshirish</p>
            <h2>Yuklangan korpusda qidirish</h2>
          </div>
          <BaseButton :icon="Search" :loading="searching" @click="runSearch">Qidirish</BaseButton>
        </div>
        <BaseInput
          v-model="query"
          label="Qidiruv (semantic, embedding orqali)"
          placeholder="masalan: shartnoma buzilganda zararni qoplash"
          :icon="Search"
          @keydown.enter="runSearch"
        />
        <div v-if="searchResults.length" class="results">
          <BaseCard v-for="(r, i) in searchResults" :key="i" variant="filled" class="result">
            <div class="result-head">
              <strong>
                {{ r.code || r.reference || 'Natija' }}
                {{ r.article ? `· ${r.article}-modda` : '' }}
              </strong>
              <span class="badge">{{ (r.score * 100).toFixed(0) }}%</span>
            </div>
            <p v-if="r.title">{{ r.title }}</p>
            <p class="text">{{ (r.text || '').slice(0, 240) }}…</p>
          </BaseCard>
        </div>
        <p v-else-if="!searching && query" class="muted">Natija yo'q — boshqa kalit so'z bilan urinib ko'ring.</p>
      </section>

      <!-- ── Danger zone ──────────────────────────────────── -->
      <section class="panel danger">
        <div class="panel-header">
          <div>
            <p class="eyebrow">Xavfli zona</p>
            <h2>Kolleksiyani tozalash</h2>
          </div>
        </div>
        <p class="muted">
          Tanlangan kolleksiyadagi <strong>barcha vektorlar</strong> o'chiriladi va kolleksiya
          bo'sh qayta yaratiladi. Bu amal qaytarib bo'lmaydi.
        </p>
        <div class="danger-actions">
          <BaseButton variant="secondary" :icon="Trash2" @click="clearCollection('laws')">
            Qonunlarni tozalash
          </BaseButton>
          <BaseButton variant="secondary" :icon="Trash2" @click="clearCollection('precedents')">
            Pretsedentlarni tozalash
          </BaseButton>
        </div>
      </section>
    </section>
  </RoleShell>
</template>

<style scoped>
.corpus {
  display: grid;
  gap: 18px;
}

h1 {
  margin: 0;
  font-size: clamp(28px, 4vw, 44px);
  font-weight: 700;
  letter-spacing: -0.01em;
}

h2 {
  margin: 0;
  font-size: 22px;
}

/* ── Stats strip ─────────────────────────────────────── */
.stats-strip {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr auto;
  gap: 12px;
  align-items: center;
}

.stat {
  display: flex;
  align-items: center;
  gap: 14px;
}

.stat p {
  margin: 0;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.stat strong {
  display: block;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.stat.total {
  background: var(--gray-900);
  color: var(--color-white);
}
.stat.total p { color: color-mix(in srgb, var(--color-white) 60%, transparent); }
.stat.total svg { color: var(--color-white); }

.strip-actions {
  display: flex;
  gap: 8px;
}

/* ── Settings ───────────────────────────────────────── */
.settings {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin: 18px 0 20px;
}

.field {
  display: grid;
  gap: 8px;
  color: var(--gray-700);
  font-size: 13px;
  font-weight: 700;
}

.field select {
  min-height: 42px;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  background: var(--color-white);
  color: var(--gray-900);
  padding: 0 12px;
  font-size: 14px;
}

/* ── Dropzone ──────────────────────────────────────── */
.dropzone {
  display: grid;
  place-items: center;
  gap: 10px;
  min-height: 220px;
  border: 1.5px dashed var(--border-default);
  border-radius: var(--radius-xl);
  background: var(--gray-100);
  padding: 30px;
  color: var(--gray-700);
  text-align: center;
  cursor: pointer;
  transition:
    border-color 200ms var(--ease-apple),
    background 200ms var(--ease-apple),
    transform 200ms var(--ease-apple);
}

.dropzone strong {
  font-size: 18px;
  font-weight: 700;
}

.dropzone p {
  margin: 0;
  color: var(--gray-500);
  font-size: 13px;
}

.dropzone.is-over,
.dropzone:hover {
  border-color: var(--gray-900);
  background: var(--stat-blue-soft);
  transform: scale(1.005);
}

.dropzone svg {
  color: var(--gray-900);
}

/* ── Queue ─────────────────────────────────────────── */
.queue {
  margin-top: 20px;
  display: grid;
  gap: 8px;
}

.queue-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
  font-size: 13px;
}

.queue-head .link {
  background: transparent;
  border: 0;
  color: var(--gray-500);
  font-weight: 700;
  cursor: pointer;
}

.queue-row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) 220px auto;
  align-items: center;
  gap: 14px;
  position: relative;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  background: var(--color-white);
  padding: 12px 14px;
  overflow: hidden;
}

.queue-row.s-done {
  border-left: 3px solid var(--stat-green);
}
.queue-row.s-error {
  border-left: 3px solid var(--stat-red);
}
.queue-row.s-uploading {
  border-left: 3px solid var(--stat-blue);
}

.row-info {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.row-info strong {
  font-size: 14px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.row-info span {
  color: var(--gray-500);
  font-size: 12px;
}

.row-status {
  color: var(--gray-700);
  font-size: 13px;
  font-weight: 600;
}

.row-status .ok {
  color: var(--stat-green);
}

.row-status .err {
  color: var(--stat-red);
  font-size: 12px;
}

.row-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: var(--gray-100);
}

.row-progress span {
  display: block;
  height: 100%;
  width: 0;
  background: var(--stat-blue);
  transition: width 220ms var(--ease-apple);
}

.s-done .row-progress span {
  background: var(--stat-green);
}
.s-error .row-progress span {
  background: var(--stat-red);
}

.row-x {
  width: 26px;
  height: 26px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--gray-500);
  cursor: pointer;
}

.row-x:hover {
  background: var(--gray-100);
  color: var(--gray-900);
}

/* ── Search results ───────────────────────────────── */
.results {
  display: grid;
  gap: 10px;
  margin-top: 18px;
}

.result-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 6px;
}

.badge {
  border-radius: var(--radius-full);
  background: var(--stat-blue-soft);
  color: var(--stat-blue);
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 800;
}

.result .text {
  margin: 6px 0 0;
  color: var(--gray-500);
  font-size: 13px;
  line-height: 1.55;
}

/* ── Danger ────────────────────────────────────────── */
.danger {
  border-color: color-mix(in srgb, var(--stat-red) 35%, var(--border-subtle));
}

.danger-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 14px;
}

.head-actions {
  display: flex;
  gap: 8px;
}

@media (max-width: 820px) {
  .stats-strip,
  .settings {
    grid-template-columns: 1fr;
  }
  .queue-row {
    grid-template-columns: auto minmax(0, 1fr) auto;
  }
  .row-status {
    grid-column: 1 / -1;
  }
}
</style>
