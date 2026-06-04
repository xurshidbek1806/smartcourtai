<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import GlassNav from '@/components/marketing/GlassNav.vue';
import SiteFooter from '@/components/marketing/SiteFooter.vue';
import BaseCard from '@/components/ui/BaseCard.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseInput from '@/components/ui/BaseInput.vue';
import DataTable from '@/components/ui/DataTable.vue';
import BaseModal from '@/components/ui/BaseModal.vue';
import { marketingPages } from '@/data/pageRegistry';
import { runDemoAction } from '@/services/demoActions';
import { useUi } from '@/stores/ui';

const route = useRoute();
const ui = useUi();
const pageKey = computed(() => String(route.name ?? 'features'));
const page = computed(() => marketingPages[pageKey.value] ?? marketingPages.features);
const formValues = ref({});
const selectedCard = ref(null);

watch(
  page,
  () => {
    const saved = JSON.parse(
      window.localStorage.getItem(`smartcourt-marketing:${pageKey.value}`) || '{}'
    );
    formValues.value = Object.fromEntries(
      (page.value.formFields ?? []).map((field) => [field, saved[field] ?? ''])
    );
  },
  { immediate: true }
);

const saveForm = () => {
  window.localStorage.setItem(
    `smartcourt-marketing:${pageKey.value}`,
    JSON.stringify(formValues.value)
  );
  ui.pushToast({
    type: 'success',
    title: 'Ma’lumot saqlandi',
    text: 'Demo ma’lumotlar yangilandi.'
  });
};

const runAction = (label) => {
  if (page.value.formFields?.length) saveForm();
  runDemoAction({ label, ui, route, payload: formValues.value });
};
</script>

<template>
  <GlassNav />
  <main class="container page">
    <p class="eyebrow">{{ page.eyebrow }}</p>
    <h1 class="page-title">{{ page.title }}</h1>
    <p class="lead">{{ page.description }}</p>

    <div v-if="page.metrics?.length" class="grid grid-3 cards">
      <BaseCard v-for="metric in page.metrics" :key="metric.label" variant="elevated">
        <p class="muted">{{ metric.label }}</p>
        <strong class="metric">{{ metric.value }}</strong>
        <p v-if="metric.note">{{ metric.note }}</p>
      </BaseCard>
    </div>

    <div v-if="page.cards?.length" class="grid grid-3 cards">
      <BaseCard
        v-for="item in page.cards"
        :key="item.title"
        interactive
        @click="selectedCard = item"
      >
        <h2>{{ item.title }}</h2>
        <p>{{ item.text }}</p>
      </BaseCard>
    </div>

    <section v-if="page.formFields?.length" class="panel cards">
      <h2>Ma’lumotlar</h2>
      <div class="grid grid-2 form">
        <BaseInput
          v-for="field in page.formFields"
          :key="field"
          v-model="formValues[field]"
          :label="field"
          :placeholder="field"
        />
      </div>
      <div class="form-actions">
        <BaseButton @click="saveForm">Saqlash</BaseButton>
      </div>
    </section>

    <section v-if="page.table" class="panel cards">
      <h2>Jadval</h2>
      <DataTable :columns="page.table.columns" :rows="page.table.rows" />
    </section>

    <section v-if="page.timeline?.length" class="panel cards">
      <h2>Vaqt jadvali</h2>
      <article v-for="item in page.timeline" :key="item.title" class="timeline-row">
        <span class="status-dot" />
        <div>
          <h3>{{ item.title }}</h3>
          <p>{{ item.text }}</p>
        </div>
      </article>
    </section>

    <BaseButton v-if="page.primaryAction" size="lg" @click="runAction(page.primaryAction)">{{
      page.primaryAction
    }}</BaseButton>
  </main>
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
  <SiteFooter />
</template>

<style scoped>
.page {
  padding: 84px 0;
}

.lead {
  width: min(720px, 100%);
  color: var(--gray-500);
  font-size: 20px;
  line-height: 1.5;
}

.cards {
  margin: 40px 0;
}

h2 {
  margin: 18px 0 8px;
}

p {
  color: var(--gray-500);
}

.form {
  margin-top: 18px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 18px;
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
</style>
