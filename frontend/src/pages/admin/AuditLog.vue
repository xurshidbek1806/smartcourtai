<script setup>
import { ref } from 'vue';
import { Filter, FileDown } from 'lucide-vue-next';

import RoleShell from '@/layouts/RoleShell.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseModal from '@/components/ui/BaseModal.vue';
import DataTable from '@/components/ui/DataTable.vue';
import { adminNav } from '@/data/navigation';
import { auditRows } from '@/data/mock';
import { useUi } from '@/stores/ui';

const ui = useUi();
const open = ref(false);
const auditTimeline = [
  { time: '14:32', title: 'Login', text: 'Karimov A. SmartJudge moduliga kirdi.', tone: 'success' },
  {
    time: '14:30',
    title: 'Export',
    text: 'Admin Root audit loglarni JSON formatda eksport qildi.',
    tone: 'info'
  },
  {
    time: '14:21',
    title: 'Permission change',
    text: 'External login attempt bloklandi.',
    tone: 'danger'
  }
];

const exportAudit = (format) => {
  open.value = false;
  ui.pushToast({
    type: 'success',
    title: 'Eksport tayyor',
    text: `Audit log ${format} formatida tayyor.`
  });
};
</script>

<template>
  <RoleShell title="Audit log" subtitle="Real-time security events" :nav="adminNav">
    <section class="panel">
      <div class="panel-header">
        <div>
          <p class="eyebrow">Xavfsizlik</p>
          <h1>Audit log</h1>
        </div>
        <div class="toolbar">
          <BaseButton
            variant="secondary"
            :icon="Filter"
            @click="
              ui.pushToast({
                type: 'info',
                title: 'Filterlar',
                text: 'Jadvaldagi advanced filters panelidan foydalaning.'
              })
            "
            >Filterlar</BaseButton
          >
          <BaseButton :icon="FileDown" @click="open = true">Eksport</BaseButton>
        </div>
      </div>
      <DataTable
        :columns="['Vaqt', 'Foydalanuvchi', 'Rol', 'Harakat', 'Manba IP', 'Holati']"
        :rows="auditRows"
      />
      <section class="audit-timeline">
        <h2>Audit timeline</h2>
        <article v-for="item in auditTimeline" :key="item.time" :class="`tone-${item.tone}`">
          <time>{{ item.time }}</time>
          <span />
          <div>
            <h3>{{ item.title }}</h3>
            <p>{{ item.text }}</p>
          </div>
        </article>
      </section>
    </section>
    <BaseModal :open="open" title="Eksport sozlamalari" @close="open = false">
      <p class="muted">CSV, JSON yoki PDF formatida audit loglarni eksport qilish mumkin.</p>
      <div class="toolbar">
        <BaseButton @click="exportAudit('CSV')">CSV</BaseButton>
        <BaseButton variant="secondary" @click="exportAudit('JSON')">JSON</BaseButton>
        <BaseButton variant="secondary" @click="exportAudit('PDF')">PDF</BaseButton>
      </div>
    </BaseModal>
  </RoleShell>
</template>

<style scoped>
h1 {
  margin: 0;
  font-size: clamp(34px, 5vw, 56px);
}

.audit-timeline {
  display: grid;
  gap: 12px;
  margin-top: 24px;
}

.audit-timeline h2 {
  margin: 0;
}

.audit-timeline article {
  display: grid;
  grid-template-columns: 70px auto 1fr;
  gap: 12px;
  align-items: start;
}

.audit-timeline time {
  color: var(--gray-500);
  font-size: 13px;
  font-weight: 800;
}

.audit-timeline article > span {
  width: 13px;
  height: 13px;
  margin-top: 3px;
  border: 3px solid var(--stat-blue);
  border-radius: 50%;
  background: var(--color-white);
  box-shadow: 0 0 0 5px var(--stat-blue-soft);
}

.audit-timeline .tone-success > span {
  border-color: var(--stat-green);
  box-shadow: 0 0 0 5px var(--stat-green-soft);
}

.audit-timeline .tone-danger > span {
  border-color: var(--stat-red);
  box-shadow: 0 0 0 5px var(--stat-red-soft);
}

.audit-timeline h3,
.audit-timeline p {
  margin: 0;
}

.audit-timeline p {
  margin-top: 4px;
  color: var(--gray-500);
}
</style>
