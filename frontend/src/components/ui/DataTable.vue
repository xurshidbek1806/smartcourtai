<script setup>
import { computed, onMounted, ref } from 'vue';
import { Archive, Download, FileText, Filter, Search, SlidersHorizontal } from 'lucide-vue-next';

import BaseButton from '@/components/ui/BaseButton.vue';
import BaseModal from '@/components/ui/BaseModal.vue';
import SideDrawer from '@/components/shared/SideDrawer.vue';
import { useUi } from '@/stores/ui';

const props = defineProps({
  columns: { type: Array, required: true },
  rows: { type: Array, required: true }
});

const ui = useUi();
const search = ref('');
const loading = ref(true);
const filtersOpen = ref(false);
const exportOpen = ref(false);
const selectedRow = ref(null);
const statusFilter = ref('');
const roleFilter = ref('');
const dateFilter = ref('');
const minScore = ref('');

onMounted(() => {
  window.setTimeout(() => {
    loading.value = false;
  }, 520);
});

const rowText = (row) => row.join(' ').toLowerCase();

const filteredRows = computed(() => {
  const query = search.value.trim().toLowerCase();
  const status = statusFilter.value.trim().toLowerCase();
  const role = roleFilter.value.trim().toLowerCase();
  const date = dateFilter.value.trim().toLowerCase();
  const score = Number(minScore.value || 0);

  return props.rows.filter((row) => {
    const text = rowText(row);
    const rowScore = Math.max(...row.map((cell) => Number(String(cell).match(/\d+/)?.[0] ?? 0)));

    return (
      (!query || text.includes(query)) &&
      (!status || text.includes(status)) &&
      (!role || text.includes(role)) &&
      (!date || text.includes(date)) &&
      (!score || rowScore >= score)
    );
  });
});

const statusTone = (cell) => {
  const value = String(cell).toLowerCase();
  if (/(blocked|xavf|rad|pauza|signal|xato|external)/.test(value)) return 'red';
  if (/(success|faol|bajarildi|tasdiqlandi|published|qanoat|ochiq)/.test(value)) return 'green';
  if (/(kutil|ijro|tekshir|draft|queue|running|qabul|yangi)/.test(value)) return 'blue';
  return '';
};

const clearFilters = () => {
  search.value = '';
  statusFilter.value = '';
  roleFilter.value = '';
  dateFilter.value = '';
  minScore.value = '';
};

const exportTable = (format) => {
  exportOpen.value = false;
  ui.pushToast({
    type: 'success',
    title: 'Eksport tayyor',
    text: `${format} formatida ${filteredRows.value.length} ta yozuv tayyorlandi.`
  });
};
</script>

<template>
  <div class="data-table">
    <div class="table-toolbar">
      <label class="search-field">
        <Search :size="17" :stroke-width="1.5" />
        <input v-model="search" type="search" placeholder="Jadvaldan qidirish" />
      </label>
      <div class="toolbar-actions">
        <span>{{ filteredRows.length }} ta yozuv</span>
        <BaseButton
          variant="secondary"
          size="sm"
          :icon="Filter"
          @click="filtersOpen = !filtersOpen"
        >
          Filter
        </BaseButton>
        <BaseButton variant="secondary" size="sm" :icon="Download" @click="exportOpen = true">
          Eksport
        </BaseButton>
      </div>
    </div>

    <div v-if="filtersOpen" class="advanced-filters">
      <label>
        <span>Status</span>
        <input v-model="statusFilter" placeholder="Faol, Kutilmoqda..." />
      </label>
      <label>
        <span>Role / sud</span>
        <input v-model="roleFilter" placeholder="Admin, Sudya, MIB..." />
      </label>
      <label>
        <span>Sana oralig‘i</span>
        <input v-model="dateFilter" placeholder="22.02.2026 yoki Iyun" />
      </label>
      <label>
        <span>AI score</span>
        <input v-model="minScore" type="number" min="0" max="100" placeholder="70" />
      </label>
      <BaseButton variant="ghost" size="sm" :icon="SlidersHorizontal" @click="clearFilters">
        Tozalash
      </BaseButton>
    </div>

    <div v-if="loading" class="table-wrap">
      <table>
        <thead>
          <tr>
            <th v-for="column in columns" :key="column">{{ column }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in 5" :key="row">
            <td v-for="column in columns" :key="`${row}-${column}`"><span class="skeleton" /></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else-if="filteredRows.length" class="table-wrap">
      <table>
        <thead>
          <tr>
            <th v-for="column in columns" :key="column">{{ column }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, rowIndex) in filteredRows"
            :key="row.join('-')"
            @click="selectedRow = row"
          >
            <td v-for="(cell, cellIndex) in row" :key="`${rowIndex}-${cellIndex}`">
              <span v-if="statusTone(cell)" class="status-pill" :class="`tone-${statusTone(cell)}`">
                {{ cell }}
              </span>
              <span v-else>{{ cell }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <section v-else class="empty-state">
      <Archive :size="36" :stroke-width="1.5" />
      <h3>Bo‘sh ro‘yxat</h3>
      <p>Mos yozuv topilmadi. Filterlarni tozalab qayta tekshiring.</p>
      <BaseButton variant="secondary" size="sm" @click="clearFilters"
        >Filterlarni tozalash</BaseButton
      >
    </section>

    <BaseModal :open="exportOpen" title="Eksport formatini tanlang" @close="exportOpen = false">
      <p class="muted">Jadval natijalarini CSV, JSON yoki PDF ko‘rinishida tayyorlash.</p>
      <div class="export-grid">
        <button type="button" @click="exportTable('CSV')"><FileText :size="20" />CSV</button>
        <button type="button" @click="exportTable('JSON')"><FileText :size="20" />JSON</button>
        <button type="button" @click="exportTable('PDF')"><FileText :size="20" />PDF</button>
      </div>
    </BaseModal>

    <SideDrawer :open="Boolean(selectedRow)" title="Tafsilot drawer" @close="selectedRow = null">
      <div v-if="selectedRow" class="drawer-content">
        <article v-for="(cell, index) in selectedRow" :key="`${columns[index]}-${cell}`">
          <span>{{ columns[index] }}</span>
          <strong>{{ cell }}</strong>
        </article>
        <section>
          <h3>Audit log</h3>
          <p><span class="status-dot success" />14:32 - foydalanuvchi yozuvni ko‘rdi</p>
          <p><span class="status-dot info" />14:30 - filterlar qo‘llandi</p>
          <p><span class="status-dot danger" />14:21 - access tekshiruvi</p>
        </section>
      </div>
    </SideDrawer>
  </div>
</template>

<style scoped>
.data-table {
  display: grid;
  gap: 10px;
}

.table-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.search-field {
  display: flex;
  min-height: 40px;
  min-width: min(320px, 100%);
  align-items: center;
  gap: 8px;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-full);
  background: var(--gray-100);
  padding: 0 12px;
}

.search-field input,
.advanced-filters input {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--gray-900);
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar-actions > span {
  color: var(--gray-500);
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
}

.advanced-filters {
  display: grid;
  grid-template-columns: repeat(4, minmax(130px, 1fr)) auto;
  gap: 10px;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  background: var(--gray-100);
  padding: 12px;
}

.advanced-filters label {
  display: grid;
  gap: 6px;
  border-radius: var(--radius-md);
  background: var(--color-white);
  padding: 9px 10px;
}

.advanced-filters span {
  color: var(--gray-500);
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
}

.table-wrap {
  overflow-x: auto;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
}

table {
  width: 100%;
  border-collapse: collapse;
  background: var(--color-white);
}

th,
td {
  min-width: 120px;
  border-bottom: 1px solid var(--border-subtle);
  padding: 13px 14px;
  text-align: left;
  white-space: nowrap;
}

th {
  position: sticky;
  top: 0;
  z-index: 1;
  background: var(--color-white);
  color: var(--gray-500);
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

tr:last-child td {
  border-bottom: 0;
}

tbody tr {
  cursor: pointer;
}

tbody tr:hover {
  background: var(--gray-100);
}

.status-pill {
  display: inline-flex;
  min-height: 24px;
  align-items: center;
  border-radius: var(--radius-full);
  padding: 0 9px;
  font-size: 12px;
  font-weight: 700;
}

.tone-green {
  background: var(--stat-green-soft);
  color: var(--stat-green);
}

.tone-blue {
  background: var(--stat-blue-soft);
  color: var(--stat-blue);
}

.tone-red {
  background: var(--stat-red-soft);
  color: var(--stat-red);
}

.skeleton {
  display: block;
  width: 82%;
  height: 16px;
  border-radius: var(--radius-full);
  background: linear-gradient(90deg, var(--gray-100), var(--gray-200), var(--gray-100));
  background-size: 200% 100%;
  animation: shimmer 1.1s infinite linear;
}

.empty-state {
  display: grid;
  min-height: 220px;
  place-items: center;
  gap: 10px;
  border: 1px dashed var(--border-default);
  border-radius: var(--radius-lg);
  background: var(--gray-100);
  padding: 26px;
  text-align: center;
}

.empty-state h3,
.empty-state p {
  margin: 0;
}

.empty-state p {
  color: var(--gray-500);
}

.export-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.export-grid button {
  display: grid;
  min-height: 92px;
  place-items: center;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  background: var(--gray-100);
  color: var(--gray-900);
  font-weight: 800;
}

.drawer-content {
  display: grid;
  gap: 12px;
}

.drawer-content article {
  display: grid;
  gap: 5px;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  background: var(--gray-100);
  padding: 12px;
}

.drawer-content span {
  color: var(--gray-500);
  font-size: 12px;
  font-weight: 800;
}

@keyframes shimmer {
  to {
    background-position: -200% 0;
  }
}

@media (max-width: 760px) {
  .table-toolbar,
  .toolbar-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .advanced-filters,
  .export-grid {
    grid-template-columns: 1fr;
  }
}
</style>
