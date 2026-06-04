<script setup>
import ConfiguredPage from '@/components/shared/ConfiguredPage.vue';
import { portalNav } from '@/data/navigation';
import { portalPages, settingsPages } from '@/data/pageRegistry';

const fallback = {
  eyebrow: 'Fuqaro portali',
  title: 'Fuqaro portali sahifasi',
  description: 'TZ bo‘yicha fuqaro portalidagi route.',
  cards: []
};

const pages = {
  ...portalPages,
  ...settingsPages
};
</script>

<template>
  <ConfiguredPage
    shell-title="Fuqaro portali"
    :nav="portalNav"
    :pages="pages"
    :fallback="fallback"
  />
</template>
