<script setup>
defineProps({
  tabs: { type: Array, required: true },
  active: { type: String, required: true }
});

defineEmits(['change']);
</script>

<template>
  <div class="tabs" role="tablist">
    <button
      v-for="tab in tabs"
      :key="tab"
      type="button"
      role="tab"
      :aria-selected="active === tab"
      :class="{ active: active === tab }"
      @click="$emit('change', tab)"
    >
      {{ tab }}
    </button>
  </div>
</template>

<style scoped>
.tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  border-bottom: 1px solid var(--border-subtle);
  padding-bottom: 8px;
}

button {
  min-height: 38px;
  border: 0;
  border-radius: var(--radius-full);
  background: transparent;
  padding: 0 14px;
  color: var(--gray-500);
}

button.active,
button:hover {
  background: var(--gray-900);
  color: var(--color-white);
}
</style>
