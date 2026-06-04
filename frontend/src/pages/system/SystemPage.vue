<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { WifiOff, Wrench } from 'lucide-vue-next';

import BaseButton from '@/components/ui/BaseButton.vue';

const route = useRoute();
const title = computed(() => {
  if (route.path.includes('403')) return 'Ruxsat berilmagan';
  if (route.path.includes('500')) return 'Server xatosi';
  if (route.path.includes('maintenance')) return 'Texnik xizmat';
  if (route.path.includes('offline')) return 'Internet yo‘q';
  return 'Sahifa topilmadi';
});
</script>

<template>
  <main class="system">
    <component :is="route.path.includes('offline') ? WifiOff : Wrench" :size="42" :stroke-width="1.5" />
    <h1>{{ title }}</h1>
    <p class="muted">SmartCourt AI marshrutlari himoyalangan va monitoring ostida.</p>
    <RouterLink to="/"><BaseButton>Bosh sahifaga qaytish</BaseButton></RouterLink>
  </main>
</template>

<style scoped>
.system {
  min-height: 100vh;
  display: grid;
  align-content: center;
  justify-items: center;
  gap: 16px;
  padding: 24px;
  text-align: center;
}

h1 {
  margin: 0;
  font-size: clamp(38px, 7vw, 82px);
}
</style>
