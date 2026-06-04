<script setup>
defineProps({
  variant: { type: String, default: 'default' }
});
</script>

<template>
  <span class="badge" :class="`badge-${variant}`"><slot /></span>
</template>

<style scoped>
.badge {
  display: inline-flex;
  min-height: 24px;
  align-items: center;
  border-radius: var(--radius-full);
  padding: 0 9px;
  font-size: 12px;
  font-weight: 600;
}

.badge-default {
  background: var(--gray-900);
  color: var(--color-white);
}

.badge-outline {
  border: 1px solid var(--border-default);
  color: var(--gray-700);
}

.badge-filled {
  background: var(--gray-100);
  color: var(--gray-800);
}
</style>
