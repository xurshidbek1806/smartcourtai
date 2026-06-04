<script setup>
defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: { type: String, required: true },
  type: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
  hint: { type: String, default: '' },
  error: { type: String, default: '' },
  icon: { type: [Object, Function], default: null }
});

defineEmits(['update:modelValue']);
</script>

<template>
  <label class="field">
    <span>{{ label }}</span>
    <span class="input-wrap">
      <component :is="icon" v-if="icon" :size="18" :stroke-width="1.5" />
      <input
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        @input="$emit('update:modelValue', $event.target.value)"
      />
    </span>
    <small v-if="error" class="error">{{ error }}</small>
    <small v-else-if="hint">{{ hint }}</small>
  </label>
</template>

<style scoped>
.field {
  display: grid;
  gap: 8px;
  color: var(--gray-700);
  font-size: 13px;
  font-weight: 600;
}

.input-wrap {
  display: flex;
  min-height: 44px;
  align-items: center;
  gap: 10px;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  background: var(--color-white);
  padding: 0 12px;
}

input {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--gray-900);
}

small {
  color: var(--gray-500);
  font-weight: 400;
}

.error {
  color: var(--gray-900);
}
</style>
