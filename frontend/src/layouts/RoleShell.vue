<script setup>
import { computed, ref } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useColorMode } from '@vueuse/core';
import {
  Bell,
  CalendarDays,
  Command,
  CreditCard,
  Globe2,
  LogOut,
  Mail,
  Moon,
  Search,
  Settings,
  Sparkles,
  UserCircle
} from 'lucide-vue-next';

import SideDrawer from '@/components/shared/SideDrawer.vue';
import BaseBadge from '@/components/ui/BaseBadge.vue';
import { useUi } from '@/stores/ui';

const props = defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  nav: { type: Array, required: true }
});

const route = useRoute();
const router = useRouter();
const ui = useUi();
const { locale } = useI18n();
const mode = useColorMode({
  selector: 'html',
  attribute: 'data-theme',
  modes: { light: 'light', dark: 'dark' }
});

const notificationsOpen = ref(false);
const userMenuOpen = ref(false);
const tourStep = ref(0);
const tourOpen = ref(!window.localStorage.getItem('smartcourt-tour-done'));

const groupedNav = computed(() =>
  [
    { label: 'Asosiy', items: props.nav.slice(0, 3) },
    { label: 'Ishlar va AI', items: props.nav.slice(3, 7) },
    { label: 'Sozlamalar', items: props.nav.slice(7) }
  ].filter((group) => group.items.length)
);

const bottomNav = computed(() => props.nav.slice(0, 4));

const breadcrumbs = computed(() => {
  const map = {
    portal: 'Portal',
    judge: 'Sudya',
    admin: 'Admin',
    oversight: 'Nazorat',
    claims: 'Arizalar',
    cases: 'Ishlar',
    dashboard: 'Dashboard',
    security: 'Xavfsizlik',
    settings: 'Sozlamalar',
    'ai-assistant': 'AI Assistant',
    'smart-judge': 'SmartJudge'
  };

  const parts = route.path
    .split('/')
    .filter(Boolean)
    .slice(0, 4)
    .filter((part) => part !== 'dashboard')
    .map((part) => map[part] ?? (part.startsWith('2026') ? `#${part}` : part.replaceAll('-', ' ')));

  return parts.length > 1 ? parts : [];
});

const notifications = [
  { icon: Mail, title: 'Yangi xabar', text: 'Sudya qo‘shimcha dalil so‘radi.', tone: 'info' },
  {
    icon: CalendarDays,
    title: 'Majlis sanasi',
    text: '22.02.2026, 10:00 - Toshkent shahar sudi.',
    tone: 'success'
  },
  { icon: Sparkles, title: 'AI signal', text: 'LexPredictor: yutish ehtimoli 73%.', tone: 'info' },
  { icon: CreditCard, title: 'To‘lov holati', text: 'Davlat boji tasdiqlandi.', tone: 'success' }
];

const tourSteps = [
  { title: 'Dashboard', text: 'Rolga mos KPI, ishlar va AI signal shu yerda ko‘rinadi.' },
  { title: 'Ariza', text: 'Yangi ariza wizard orqali bosqichma-bosqich yaratiladi.' },
  { title: 'AI', text: 'SmartJudge va AI assistant streaming javob bilan ishlaydi.' },
  { title: 'Settings', text: 'Til, dark mode va profil sozlamalari profil menyusida.' }
];

const setLanguage = (lang) => {
  locale.value = lang;
  ui.pushToast({
    type: 'success',
    title: 'Til almashtirildi',
    text: `${lang.toUpperCase()} rejimi yoqildi.`
  });
};

const toggleTheme = () => {
  mode.value = mode.value === 'dark' ? 'light' : 'dark';
  ui.pushToast({
    type: 'info',
    title: mode.value === 'dark' ? 'Dark mode yoqildi' : 'Light mode yoqildi',
    text: 'Kontrast va ranglar yangilandi.'
  });
};

const logout = () => {
  userMenuOpen.value = false;
  ui.pushToast({ type: 'success', title: 'Chiqish', text: 'Sessiya yopildi.' });
  router.push('/login');
};

const finishTour = () => {
  window.localStorage.setItem('smartcourt-tour-done', '1');
  tourOpen.value = false;
};
</script>

<template>
  <div class="role-shell">
    <aside class="sidebar">
      <RouterLink class="brand" to="/">
        <span class="brand-mark">SC</span>
        <span>SmartCourt AI</span>
      </RouterLink>
      <nav aria-label="Asosiy navigatsiya">
        <section v-for="group in groupedNav" :key="group.label" class="nav-group">
          <p>{{ group.label }}</p>
          <RouterLink v-for="item in group.items" :key="item.to" class="side-link" :to="item.to">
            <span>
              <component :is="item.icon" :size="18" :stroke-width="1.5" />
              {{ item.label }}
            </span>
            <BaseBadge v-if="item.badge" variant="filled">{{ item.badge }}</BaseBadge>
          </RouterLink>
        </section>
      </nav>
    </aside>

    <main class="app-main">
      <header class="topbar">
        <div>
          <nav v-if="breadcrumbs.length" class="breadcrumbs" aria-label="Breadcrumbs">
            <span v-for="(crumb, index) in breadcrumbs" :key="`${crumb}-${index}`">
              {{ crumb }}
            </span>
          </nav>
          <strong>{{ title }}</strong>
          <p class="muted">{{ subtitle }}</p>
        </div>
        <div class="top-actions">
          <button
            aria-label="Qidirish"
            type="button"
            @click="
              ui.pushToast({
                type: 'info',
                title: 'Qidiruv',
                text: 'Global qidiruv oynasi tayyorlanmoqda.'
              })
            "
          >
            <Search :size="18" :stroke-width="1.5" />
          </button>
          <button
            aria-label="Command palette"
            type="button"
            @click="
              ui.pushToast({
                type: 'info',
                title: 'Command palette',
                text: 'Tezkor komandalar paneli ochiladi.'
              })
            "
          >
            <Command :size="18" :stroke-width="1.5" />
          </button>
          <div class="notification-menu">
            <button
              aria-label="Bildirishnomalar"
              type="button"
              class="bell"
              :aria-expanded="notificationsOpen"
              @click="notificationsOpen = !notificationsOpen"
            >
              <Bell :size="18" :stroke-width="1.5" />
              <span>4</span>
            </button>
            <section v-if="notificationsOpen" class="notification-popover">
              <header>
                <strong>Notification Center</strong>
                <small>4 ta yangi signal</small>
              </header>
              <div class="notification-list">
                <article
                  v-for="item in notifications"
                  :key="item.title"
                  :class="`tone-${item.tone}`"
                >
                  <component :is="item.icon" :size="18" :stroke-width="1.5" />
                  <div>
                    <h3>{{ item.title }}</h3>
                    <p>{{ item.text }}</p>
                  </div>
                </article>
              </div>
            </section>
          </div>
          <div class="profile-menu">
            <button aria-label="Profil" type="button" @click="userMenuOpen = !userMenuOpen">
              <UserCircle :size="20" :stroke-width="1.5" />
            </button>
            <section v-if="userMenuOpen" class="dropdown">
              <RouterLink to="/portal/profile"><UserCircle :size="16" />Profil</RouterLink>
              <RouterLink to="/settings/account"><Settings :size="16" />Sozlamalar</RouterLink>
              <div class="language-row">
                <Globe2 :size="16" />
                <button
                  type="button"
                  :class="{ active: locale === 'uz' }"
                  @click="setLanguage('uz')"
                >
                  UZ
                </button>
                <button
                  type="button"
                  :class="{ active: locale === 'ru' }"
                  @click="setLanguage('ru')"
                >
                  RU
                </button>
                <button
                  type="button"
                  :class="{ active: locale === 'en' }"
                  @click="setLanguage('en')"
                >
                  EN
                </button>
              </div>
              <button type="button" class="dropdown-button" @click="toggleTheme">
                <Moon :size="16" />Dark mode
              </button>
              <button type="button" class="dropdown-button" @click="logout">
                <LogOut :size="16" />Chiqish
              </button>
            </section>
          </div>
        </div>
      </header>
      <slot />
    </main>

    <nav class="bottom-nav" aria-label="Mobil navigatsiya">
      <RouterLink v-for="item in bottomNav" :key="item.to" :to="item.to">
        <component :is="item.icon" :size="18" :stroke-width="1.5" />
        <span>{{ item.label }}</span>
      </RouterLink>
    </nav>

    <SideDrawer :open="tourOpen" title="Onboarding tour" @close="finishTour">
      <div class="tour">
        <p class="eyebrow">{{ tourStep + 1 }} / {{ tourSteps.length }}</p>
        <h2>{{ tourSteps[tourStep].title }}</h2>
        <p class="muted">{{ tourSteps[tourStep].text }}</p>
        <div class="tour-dots">
          <span
            v-for="(_, index) in tourSteps"
            :key="index"
            :class="{ active: index === tourStep }"
          />
        </div>
        <div class="toolbar">
          <button type="button" class="text-button" @click="finishTour">O‘tkazib yuborish</button>
          <button
            type="button"
            class="solid-button"
            @click="tourStep === tourSteps.length - 1 ? finishTour() : tourStep++"
          >
            {{ tourStep === tourSteps.length - 1 ? 'Tugatish' : 'Keyingi' }}
          </button>
        </div>
      </div>
    </SideDrawer>
  </div>
</template>

<style scoped>
.topbar p {
  margin: 3px 0 0;
  font-size: 13px;
}

.breadcrumbs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 4px;
  color: var(--gray-500);
  font-size: 12px;
  font-weight: 700;
}

.breadcrumbs span:not(:last-child)::after {
  content: '/';
  margin-left: 6px;
  color: var(--gray-400);
}

.nav-group {
  display: grid;
  gap: 4px;
  margin-bottom: 14px;
}

.nav-group p {
  margin: 8px 10px 5px;
  color: var(--gray-400);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
}

.top-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.solid-button,
.text-button {
  display: grid;
  place-items: center;
  border: 1px solid var(--border-subtle);
  border-radius: 50%;
  background: var(--color-white);
  color: var(--gray-900);
}

.top-actions > button,
.notification-menu > button,
.profile-menu > button {
  display: grid;
  width: 40px;
  height: 40px;
  place-items: center;
  border: 1px solid var(--border-subtle);
  border-radius: 50%;
  background: var(--color-white);
  color: var(--gray-900);
}

.bell {
  position: relative;
}

.bell span {
  position: absolute;
  top: -2px;
  right: -2px;
  display: grid;
  width: 18px;
  height: 18px;
  place-items: center;
  border-radius: 50%;
  background: var(--stat-red);
  color: white;
  font-size: 10px;
  font-weight: 800;
}

.notification-menu {
  position: relative;
}

.notification-popover {
  position: absolute;
  top: calc(100% + 12px);
  right: -8px;
  z-index: 35;
  display: grid;
  width: min(360px, calc(100vw - 28px));
  gap: 12px;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  background: color-mix(in srgb, var(--color-white) 96%, transparent);
  padding: 12px;
  box-shadow: var(--shadow-xl);
  transform-origin: top right;
  animation: popover-flow 220ms var(--ease-apple) both;
  backdrop-filter: blur(20px);
}

.notification-popover::before {
  content: '';
  position: absolute;
  top: -7px;
  right: 20px;
  width: 14px;
  height: 14px;
  border-top: 1px solid var(--border-subtle);
  border-left: 1px solid var(--border-subtle);
  background: var(--color-white);
  transform: rotate(45deg);
}

.notification-popover header {
  display: grid;
  gap: 3px;
  padding: 2px 4px 0;
}

.notification-popover small {
  color: var(--gray-500);
  font-size: 12px;
  font-weight: 700;
}

.profile-menu {
  position: relative;
}

.dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  z-index: 30;
  display: grid;
  width: 230px;
  gap: 6px;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  background: var(--color-white);
  padding: 10px;
  box-shadow: var(--shadow-lg);
}

.dropdown a,
.dropdown-button,
.language-row {
  display: flex;
  min-height: 38px;
  align-items: center;
  gap: 8px;
  border: 0;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--gray-800);
  padding: 0 10px;
  font-weight: 700;
}

.dropdown-button {
  width: 100%;
  justify-content: flex-start;
  text-align: left;
}

.dropdown a:hover,
.dropdown-button:hover {
  background: var(--gray-100);
}

.language-row {
  justify-content: space-between;
}

.language-row button {
  width: auto;
  height: 28px;
  border-radius: var(--radius-full);
  padding: 0 8px;
  font-size: 12px;
}

.language-row button.active {
  background: var(--gray-900);
  color: var(--color-white);
}

.notification-list {
  display: grid;
  gap: 8px;
}

.notification-list article {
  display: flex;
  gap: 10px;
  border: 1px solid var(--border-subtle);
  border-left: 3px solid var(--stat-blue);
  border-radius: var(--radius-md);
  background: var(--gray-100);
  padding: 11px;
}

.notification-list .tone-success {
  border-left-color: var(--stat-green);
}

.notification-list h3,
.notification-list p,
.tour h2 {
  margin: 0;
}

.notification-list p {
  margin-top: 4px;
  color: var(--gray-500);
  font-size: 13px;
}

.tour {
  display: grid;
  gap: 16px;
}

.tour-dots {
  display: flex;
  gap: 6px;
}

.tour-dots span {
  width: 28px;
  height: 6px;
  border-radius: var(--radius-full);
  background: var(--gray-200);
}

.tour-dots span.active {
  background: var(--gray-900);
}

.solid-button,
.text-button {
  min-height: 40px;
  border-radius: var(--radius-full);
  padding: 0 14px;
  font-weight: 800;
}

.solid-button {
  background: var(--gray-900);
  color: var(--color-white);
}

.bottom-nav {
  position: fixed;
  right: 12px;
  bottom: 12px;
  left: 12px;
  z-index: 45;
  display: none;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 6px;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  background: color-mix(in srgb, var(--color-white) 88%, transparent);
  padding: 7px;
  box-shadow: var(--shadow-lg);
  backdrop-filter: blur(18px);
}

.bottom-nav a {
  display: grid;
  min-height: 50px;
  place-items: center;
  border-radius: var(--radius-md);
  color: var(--gray-500);
  font-size: 11px;
  font-weight: 700;
}

.bottom-nav a.router-link-active,
.bottom-nav a:hover {
  background: var(--gray-900);
  color: var(--color-white);
}

@media (max-width: 760px) {
  .topbar {
    align-items: flex-start;
    flex-direction: column;
    padding-block: 12px;
  }

  .top-actions {
    width: 100%;
    justify-content: flex-end;
  }
}

@keyframes popover-flow {
  from {
    opacity: 0;
    transform: translateY(-6px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (max-width: 640px) {
  .bottom-nav {
    display: grid;
  }

  .notification-popover {
    right: 0;
  }
}
</style>
