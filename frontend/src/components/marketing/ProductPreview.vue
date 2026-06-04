<script setup>
const lanes = [
  { label: 'Ariza', value: '2026-001234', tone: 'blue' },
  { label: 'AI tahlil', value: '73%', tone: 'green' },
  { label: 'Majlis', value: '22.02.2026', tone: 'blue' },
  { label: 'Xavf', value: '5 signal', tone: 'red' }
];
</script>

<template>
  <section class="product-preview" aria-label="SmartCourt AI mahsulot ko‘rinishi">
    <aside>
      <span class="window-dot" />
      <span class="window-dot" />
      <span class="window-dot" />
      <h3>SmartCourt AI</h3>
      <p>Role-based workflow preview</p>
    </aside>
    <main>
      <div class="preview-top">
        <strong>Sud jarayoni oqimi</strong>
        <span>Live</span>
      </div>
      <div class="flow">
        <article v-for="lane in lanes" :key="lane.label" :class="`tone-${lane.tone}`">
          <small>{{ lane.label }}</small>
          <strong>{{ lane.value }}</strong>
          <div><span /></div>
        </article>
      </div>
      <div class="preview-grid">
        <div>
          <strong>JustiScribe</strong>
          <p>Real-time stenogramma</p>
        </div>
        <div>
          <strong>SmartJudge</strong>
          <p>Qaror qoralamasi</p>
        </div>
      </div>
    </main>
  </section>
</template>

<style scoped>
.product-preview {
  display: grid;
  grid-template-columns: 230px minmax(0, 1fr);
  overflow: hidden;
  width: min(940px, 100%);
  margin: 34px auto 0;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-2xl);
  background: var(--color-white);
  box-shadow: var(--shadow-xl);
  text-align: left;
}

aside {
  border-right: 1px solid var(--border-subtle);
  background: var(--gray-100);
  padding: 20px;
}

.window-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  margin-right: 6px;
  border-radius: 50%;
  background: var(--gray-300);
}

h3 {
  margin: 32px 0 6px;
}

p {
  margin: 0;
  color: var(--gray-500);
}

main {
  padding: 20px;
}

.preview-top,
.preview-grid {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.preview-top span {
  border-radius: var(--radius-full);
  background: var(--stat-green-soft);
  color: var(--stat-green);
  padding: 5px 10px;
  font-size: 12px;
  font-weight: 800;
}

.flow {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin: 18px 0;
}

article {
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 14px;
}

small {
  display: block;
  color: var(--gray-500);
  font-weight: 700;
}

article strong {
  display: block;
  margin: 8px 0 14px;
  font-size: 24px;
}

article > div {
  overflow: hidden;
  height: 7px;
  border-radius: var(--radius-full);
  background: var(--gray-100);
}

article > div span {
  display: block;
  width: 74%;
  height: 100%;
  border-radius: inherit;
}

.tone-blue {
  background: var(--stat-blue-soft);
}

.tone-blue strong {
  color: var(--stat-blue);
}

.tone-blue div span {
  background: var(--stat-blue);
}

.tone-green {
  background: var(--stat-green-soft);
}

.tone-green strong {
  color: var(--stat-green);
}

.tone-green div span {
  background: var(--stat-green);
}

.tone-red {
  background: var(--stat-red-soft);
}

.tone-red strong {
  color: var(--stat-red);
}

.tone-red div span {
  background: var(--stat-red);
}

.preview-grid {
  align-items: stretch;
}

.preview-grid div {
  flex: 1;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 14px;
}

@media (max-width: 760px) {
  .product-preview,
  .flow {
    grid-template-columns: 1fr;
  }

  aside {
    border-right: 0;
    border-bottom: 1px solid var(--border-subtle);
  }
}
</style>
