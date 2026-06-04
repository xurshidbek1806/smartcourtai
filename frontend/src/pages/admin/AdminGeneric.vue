<script setup>
import ConfiguredPage from '@/components/shared/ConfiguredPage.vue';
import { adminNav } from '@/data/navigation';
import { adminPages } from '@/data/pageRegistry';

const fallback = {
  eyebrow: 'Admin panel',
  title: 'Admin panel sahifasi',
  description: 'TZ bo‘yicha admin paneldagi route.',
  cards: []
};
</script>

<template>
  <ConfiguredPage shell-title="Admin panel" :nav="adminNav" :pages="adminPages" :fallback="fallback" />
</template>
