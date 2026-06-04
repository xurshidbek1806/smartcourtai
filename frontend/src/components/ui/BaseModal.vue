<script setup>
import { X } from 'lucide-vue-next';

defineProps({
  open: { type: Boolean, required: true },
  title: { type: String, required: true }
});

defineEmits(['close']);
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="overlay" role="presentation" @click="$emit('close')">
      <section class="modal" role="dialog" aria-modal="true" :aria-label="title" @click.stop>
        <header>
          <h2>{{ title }}</h2>
          <button type="button" aria-label="Yopish" @click="$emit('close')">
            <X :size="18" :stroke-width="1.5" />
          </button>
        </header>
        <slot />
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: center;
  background: rgba(0, 0, 0, 0.24);
  padding: 20px;
  backdrop-filter: blur(14px);
}

.modal {
  width: min(520px, calc(100vw - 32px));
  max-height: min(720px, calc(100vh - 32px));
  overflow-y: auto;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  background: var(--color-white);
  padding: 20px;
  box-shadow: var(--shadow-xl);
}

@media (max-width: 560px) {
  .overlay {
    align-items: end;
    padding: 0;
  }

  .modal {
    width: 100%;
    max-height: calc(100vh - 24px);
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  }
}

header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

h2 {
  margin: 0;
}

button {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  border: 0;
  border-radius: 50%;
  background: var(--gray-100);
  color: var(--gray-900);
}
</style>
