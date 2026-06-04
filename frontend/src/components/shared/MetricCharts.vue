<script setup>
defineProps({
  bars: { type: Array, default: () => [20, 34, 28, 48, 44, 62, 68, 82, 76, 92] },
  score: { type: Number, default: 94 }
});
</script>

<template>
  <div class="charts">
    <svg
      class="line-chart"
      viewBox="0 0 320 180"
      role="img"
      aria-label="Platforma metrikalari chizig‘i"
    >
      <polyline
        fill="none"
        stroke="var(--stat-blue)"
        stroke-width="5"
        stroke-linecap="round"
        stroke-linejoin="round"
        :points="bars.map((value, index) => `${18 + index * 33},${170 - value * 1.55}`).join(' ')"
      />
      <circle
        v-for="(value, index) in bars"
        :key="`${value}-${index}`"
        :cx="18 + index * 33"
        :cy="170 - value * 1.55"
        r="5"
        :class="`tone-${index % 3}`"
      />
    </svg>

    <div class="bar-chart" aria-label="Kunlik so‘rovlar">
      <span
        v-for="(point, index) in bars"
        :key="`${point}-${index}`"
        :class="`tone-${index % 3}`"
        :style="{ height: `${point}%` }"
      />
    </div>

    <div class="donut" :style="{ '--score': `${score}%` }">
      <strong>{{ score }}%</strong>
      <span>AI accuracy</span>
    </div>
  </div>
</template>

<style scoped>
.charts {
  display: grid;
  grid-template-columns: minmax(260px, 1.7fr) minmax(190px, 1fr) 160px;
  gap: 12px;
  align-items: center;
  min-width: 0;
}

.line-chart,
.bar-chart {
  min-width: 0;
  min-height: 180px;
  border-radius: var(--radius-lg);
  background: var(--gray-100);
  padding: 12px;
}

.line-chart {
  width: 100%;
  height: 100%;
}

circle.tone-0 {
  fill: var(--stat-blue);
}

circle.tone-1 {
  fill: var(--stat-green);
}

circle.tone-2 {
  fill: var(--stat-red);
}

.bar-chart {
  display: flex;
  align-items: end;
  gap: 7px;
}

.bar-chart span {
  flex: 1;
  min-height: 18px;
  border-radius: var(--radius-sm);
}

.bar-chart .tone-0 {
  background: var(--stat-blue);
}

.bar-chart .tone-1 {
  background: var(--stat-green);
}

.bar-chart .tone-2 {
  background: var(--stat-red);
}

.donut {
  display: grid;
  place-items: center;
  place-content: center;
  width: 160px;
  border-radius: 50%;
  background:
    radial-gradient(var(--color-white) 54%, transparent 55%),
    conic-gradient(var(--stat-green) 0 var(--score), var(--gray-200) var(--score) 100%);
  aspect-ratio: 1;
}

.donut strong {
  font-size: 34px;
}

.donut span {
  color: var(--gray-500);
  font-size: 12px;
  font-weight: 800;
}

@media (max-width: 1180px) {
  .charts {
    grid-template-columns: minmax(0, 1fr) 150px;
  }

  .bar-chart {
    display: none;
  }

  .donut {
    width: 150px;
  }
}

@media (max-width: 720px) {
  .charts {
    grid-template-columns: 1fr;
  }

  .bar-chart {
    display: flex;
  }

  .donut {
    width: min(150px, 100%);
  }
}
</style>
