<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import GlassNav from '@/components/marketing/GlassNav.vue';
import SiteFooter from '@/components/marketing/SiteFooter.vue';
import BaseCard from '@/components/ui/BaseCard.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseInput from '@/components/ui/BaseInput.vue';
import DataTable from '@/components/ui/DataTable.vue';
import { marketingPages } from '@/data/pageRegistry';

const route = useRoute();
const pageKey = computed(() => String(route.name ?? 'features'));
const page = computed(() => marketingPages[pageKey.value] ?? marketingPages.features);
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
      <BaseCard v-for="item in page.cards" :key="item.title" interactive>
        <h2>{{ item.title }}</h2>
        <p>{{ item.text }}</p>
      </BaseCard>
    </div>

    <section v-if="page.formFields?.length" class="panel cards">
      <h2>Ma’lumotlar</h2>
      <div class="grid grid-2 form">
        <BaseInput v-for="field in page.formFields" :key="field" :label="field" :placeholder="field" />
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

    <BaseButton v-if="page.primaryAction" size="lg">{{ page.primaryAction }}</BaseButton>
  </main>
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
