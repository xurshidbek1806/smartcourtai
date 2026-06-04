<script setup>
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { Languages, Menu } from 'lucide-vue-next';

import { marketingLinks } from '@/data/navigation';

const { locale, t } = useI18n();
const open = ref(false);
const setLanguage = (lang) => {
  locale.value = lang;
  open.value = false;
};
</script>

<template>
  <header class="glass-nav">
    <RouterLink class="brand" to="/">
      <span class="brand-mark">SC</span>
      <span>SmartCourt AI</span>
    </RouterLink>
    <nav aria-label="Marketing">
      <RouterLink v-for="link in marketingLinks" :key="link.to" :to="link.to">{{
        link.label
      }}</RouterLink>
    </nav>
    <div class="actions">
      <div class="lang-menu">
        <button aria-label="Til tanlash" type="button" class="icon" @click="open = !open">
          <Languages :size="18" :stroke-width="1.5" />
        </button>
        <div v-if="open" class="lang-popover">
          <button type="button" :class="{ active: locale === 'uz' }" @click="setLanguage('uz')">
            UZ
          </button>
          <button type="button" :class="{ active: locale === 'ru' }" @click="setLanguage('ru')">
            RU
          </button>
          <button type="button" :class="{ active: locale === 'en' }" @click="setLanguage('en')">
            EN
          </button>
        </div>
      </div>
      <RouterLink class="login-link" to="/login">{{ t('app.login') }}</RouterLink>
      <button aria-label="Menyu" type="button" class="icon menu">
        <Menu :size="18" :stroke-width="1.5" />
      </button>
    </div>
  </header>
</template>

<style scoped>
.glass-nav {
  position: sticky;
  top: 0;
  z-index: 30;
  display: flex;
  min-height: 64px;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-subtle);
  background: color-mix(in srgb, var(--color-white) 78%, transparent);
  padding: 0 max(18px, calc((100vw - 1180px) / 2));
  backdrop-filter: blur(20px);
}

.brand {
  padding: 0;
}

nav {
  display: flex;
  gap: 28px;
  color: var(--gray-600);
  font-size: 14px;
}

nav a:hover,
nav a.router-link-active {
  color: var(--gray-900);
}

.actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.lang-menu {
  position: relative;
}

.lang-popover {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 35;
  display: grid;
  gap: 4px;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  background: var(--color-white);
  padding: 6px;
  box-shadow: var(--shadow-lg);
}

.lang-popover button {
  min-width: 52px;
  min-height: 32px;
  border: 0;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--gray-800);
  font-weight: 800;
}

.lang-popover button.active,
.lang-popover button:hover {
  background: var(--gray-900);
  color: var(--color-white);
}

.login-link {
  display: inline-flex;
  min-height: 34px;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  background: var(--gray-900);
  color: var(--color-white);
  padding: 0 14px;
  font-size: 13px;
  font-weight: 600;
  transition:
    transform 180ms var(--ease-apple),
    background 180ms var(--ease-apple);
}

.login-link:hover {
  background: var(--gray-700);
  transform: translateY(-1px);
}

.login-link:active {
  transform: scale(0.98);
}

.icon {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--gray-900);
}

.icon:hover {
  background: var(--gray-100);
}

.menu {
  display: none;
}

@media (max-width: 760px) {
  nav {
    display: none;
  }

  .actions > :not(.menu) {
    display: none;
  }

  .menu {
    display: grid;
  }
}
</style>
