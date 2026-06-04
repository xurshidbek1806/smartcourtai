<script setup>
defineProps({
  interactive: { type: Boolean, default: false },
  variant: { type: String, default: 'outlined' }
});
</script>

<template>
  <article class="card" :class="[`card-${variant}`, { interactive }]">
    <slot />
  </article>
</template>

<style scoped>
.card {
  border-radius: var(--radius-lg);
  padding: 18px;
  transition:
    transform 240ms var(--ease-apple),
    box-shadow 240ms var(--ease-apple),
    border-color 240ms var(--ease-apple);
}

.card-outlined {
  border: 1px solid var(--border-subtle);
  background: var(--color-white);
}

.card-filled {
  border: 1px solid transparent;
  background: var(--gray-100);
}

.card-elevated {
  border: 1px solid var(--border-subtle);
  background: var(--color-white);
  box-shadow: var(--shadow-sm);
}

.interactive:hover {
  transform: translateY(-1px);
  border-color: var(--border-default);
  box-shadow: var(--shadow-md);
}
</style>
