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
    <div v-if="open" class="drawer-layer" @click="$emit('close')">
      <aside class="drawer" @click.stop>
        <header>
          <h2>{{ title }}</h2>
          <button type="button" aria-label="Yopish" @click="$emit('close')">
            <X :size="18" :stroke-width="1.5" />
          </button>
        </header>
        <slot />
      </aside>
    </div>
  </Teleport>
</template>

<style scoped>
.drawer-layer {
  position: fixed;
  inset: 0;
  z-index: 110;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  background: rgba(0, 0, 0, 0.18);
  padding: 16px;
  backdrop-filter: blur(8px);
}

.drawer {
  width: min(420px, calc(100vw - 32px));
  max-height: calc(100vh - 32px);
  overflow-y: auto;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  background: var(--color-white);
  padding: 20px;
  box-shadow: var(--shadow-xl);
  animation: drawer-in 260ms var(--ease-apple) both;
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

@keyframes drawer-in {
  from {
    transform: translateX(24px);
    opacity: 0;
  }
}

@media (max-width: 560px) {
  .drawer-layer {
    align-items: stretch;
    padding: 0;
  }

  .drawer {
    width: 100vw;
    max-height: none;
    border-radius: 0;
  }
}
</style>
