<script setup>
import { RouterView } from 'vue-router';
import ToastHost from '@/components/shared/ToastHost.vue';
import { useDomTranslation } from '@/composables/useDomTranslation';

useDomTranslation();
</script>

<template>
  <RouterView />
  <ToastHost />
</template>
