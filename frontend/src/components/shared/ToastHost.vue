<script setup>
import { CheckCircle2, Info, X, XCircle } from 'lucide-vue-next';

import { useUi } from '@/stores/ui';

const ui = useUi();
</script>

<template>
  <Teleport to="body">
    <div class="toast-host" aria-live="polite">
      <article
        v-for="toast in ui.state.toasts"
        :key="toast.id"
        class="toast"
        :class="`tone-${toast.type}`"
      >
        <CheckCircle2 v-if="toast.type === 'success'" :size="20" :stroke-width="1.5" />
        <XCircle v-else-if="toast.type === 'error'" :size="20" :stroke-width="1.5" />
        <Info v-else :size="20" :stroke-width="1.5" />
        <div>
          <strong>{{ toast.title }}</strong>
          <p v-if="toast.text">{{ toast.text }}</p>
        </div>
        <button type="button" aria-label="Toast yopish" @click="ui.removeToast(toast.id)">
          <X :size="16" :stroke-width="1.5" />
        </button>
      </article>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-host {
  position: fixed;
  right: 18px;
  bottom: 72px;
  z-index: 120;
  display: grid;
  width: min(390px, calc(100vw - 32px));
  gap: 10px;
}

.toast {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 12px;
  align-items: start;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  background: color-mix(in srgb, var(--color-white) 92%, transparent);
  padding: 14px;
  box-shadow: var(--shadow-lg);
  backdrop-filter: blur(18px);
  animation: toast-in 240ms var(--ease-apple) both;
}

.tone-success {
  color: var(--stat-green);
}

.tone-error {
  color: var(--stat-red);
}

.tone-info {
  color: var(--stat-blue);
}

strong {
  color: var(--gray-900);
}

p {
  margin: 4px 0 0;
  color: var(--gray-500);
  font-size: 13px;
}

button {
  display: grid;
  width: 28px;
  height: 28px;
  place-items: center;
  border: 0;
  border-radius: 50%;
  background: var(--gray-100);
  color: var(--gray-700);
}

@keyframes toast-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
}
</style>
