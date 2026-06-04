<script setup>
import ConfiguredPage from '@/components/shared/ConfiguredPage.vue';
import { oversightNav } from '@/data/navigation';
import { oversightPages } from '@/data/pageRegistry';

const fallback = {
  eyebrow: 'Nazorat va ijro',
  title: 'Nazorat sahifasi',
  description: 'TZ bo‘yicha nazorat va ijro route.',
  cards: []
};
</script>

<template>
  <ConfiguredPage
    shell-title="Nazorat va ijro"
    :nav="oversightNav"
    :pages="oversightPages"
    :fallback="fallback"
  />
</template>
