<script setup>
import { getCurrentInstance } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { runDemoAction } from '@/services/demoActions';
import { useUi } from '@/stores/ui';

defineProps({
  variant: { type: String, default: 'primary' },
  size: { type: String, default: 'md' },
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  icon: { type: [Object, Function], default: null },
  iconPosition: { type: String, default: 'left' },
  actionLabel: { type: String, default: '' }
});

const instance = getCurrentInstance();
const route = useRoute();
const router = useRouter();
const ui = useUi();

const handleClick = (event) => {
  if (instance?.vnode.props?.onClick) return;
  const label = event.currentTarget.dataset.actionLabel || event.currentTarget.innerText;
  runDemoAction({ label, ui, router, route });
};
</script>

<template>
  <button
    class="btn"
    :class="[`btn-${variant}`, `btn-${size}`, { loading }]"
    :disabled="loading || disabled"
    :data-action-label="actionLabel"
    type="button"
    @click="handleClick"
  >
    <component :is="icon" v-if="icon && iconPosition !== 'right'" :size="18" :stroke-width="1.5" />
    <span><slot /></span>
    <component :is="icon" v-if="icon && iconPosition === 'right'" :size="18" :stroke-width="1.5" />
  </button>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px solid transparent;
  border-radius: var(--radius-full);
  font-weight: 650;
  letter-spacing: 0;
  transition:
    transform 180ms var(--ease-apple),
    background 180ms var(--ease-apple),
    border-color 180ms var(--ease-apple);
}

.btn:hover {
  transform: translateY(-0.5px);
}

.btn:active {
  transform: scale(0.98);
}

.btn:focus-visible {
  outline: 2px solid var(--gray-900);
  outline-offset: 2px;
}

.btn-primary {
  background: var(--gray-900);
  color: var(--color-white);
}

.btn-primary:hover {
  background: var(--gray-700);
}

.btn-secondary {
  border-color: var(--border-default);
  background: color-mix(in srgb, var(--color-white) 92%, var(--gray-100));
  color: var(--gray-900);
}

.btn-ghost {
  background: transparent;
  color: var(--gray-800);
}

.btn-ghost:hover,
.btn-secondary:hover {
  background: var(--gray-100);
}

.btn-destructive {
  border-color: var(--border-default);
  background: var(--color-white);
  color: var(--gray-900);
}

.btn-sm {
  min-height: 34px;
  padding: 0 14px;
  font-size: 13px;
}

.btn-md {
  min-height: 42px;
  padding: 0 18px;
  font-size: 14px;
}

.btn-lg {
  min-height: 50px;
  padding: 0 24px;
  font-size: 15px;
}

.btn-xl {
  min-height: 58px;
  padding: 0 30px;
  font-size: 17px;
}

.loading {
  opacity: 0.7;
}
</style>
