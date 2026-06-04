<script setup>
import ConfiguredPage from '@/components/shared/ConfiguredPage.vue';
import { judgeNav } from '@/data/navigation';
import { judgePages } from '@/data/pageRegistry';

const fallback = {
  eyebrow: 'Sudya paneli',
  title: 'Sudya paneli sahifasi',
  description: 'TZ bo‘yicha sudya panelidagi route.',
  cards: []
};
</script>

<template>
  <ConfiguredPage shell-title="Sudya paneli" :nav="judgeNav" :pages="judgePages" :fallback="fallback" />
</template>
