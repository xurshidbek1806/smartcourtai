<template>
  <div class="ai-visual" aria-label="AI huquqiy tahlil vizualizatsiyasi">
    <div v-for="row in 8" :key="row" class="row">
      <span v-for="dot in 14" :key="dot" />
    </div>
    <div class="scan-line" />
  </div>
</template>

<style scoped>
.ai-visual {
  position: relative;
  overflow: hidden;
  width: min(900px, 100%);
  height: 260px;
  margin: 44px auto 0;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  background:
    linear-gradient(180deg, transparent, color-mix(in srgb, var(--gray-100) 80%, transparent)),
    var(--color-white);
}

.row {
  display: flex;
  justify-content: space-between;
  padding: 16px 22px 0;
}

span {
  display: block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--gray-900);
  opacity: 0.12;
  animation: pulse 2.8s var(--ease-apple) infinite;
}

.row:nth-child(2n) span:nth-child(3n),
.row:nth-child(3n) span:nth-child(4n) {
  opacity: 0.62;
}

.scan-line {
  position: absolute;
  inset: 0 auto 0 0;
  width: 1px;
  background: var(--gray-900);
  opacity: 0.35;
  animation: scan 4s var(--ease-apple) infinite;
}

@keyframes scan {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(900px);
  }
}

@keyframes pulse {
  50% {
    transform: scale(1.7);
    opacity: 0.42;
  }
}
</style>
