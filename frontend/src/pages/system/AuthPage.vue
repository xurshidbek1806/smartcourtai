<script setup>
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Fingerprint, KeyRound, ShieldCheck } from 'lucide-vue-next';

import BaseInput from '@/components/ui/BaseInput.vue';
import { useUi } from '@/stores/ui';

const route = useRoute();
const router = useRouter();
const ui = useUi();
const pinfl = ref('');
const password = ref('');

const destination = computed(() => {
  if (route.path.includes('/judge')) return '/judge/dashboard';
  if (route.path.includes('/admin')) return '/admin/dashboard';
  if (route.path.includes('/oversight')) return '/oversight/dashboard';
  return '/portal/dashboard';
});

const submitLogin = () => {
  ui.pushToast({
    type: 'success',
    title: 'Tizimga kirish muvaffaqiyatli',
    text: 'Dashboardga yo‘naltirilmoqda.'
  });
  router.push(destination.value);
};
</script>

<template>
  <main class="auth">
    <section class="auth-card">
      <RouterLink class="brand" to="/">
        <span class="brand-mark">SC</span>
        <span>SmartCourt AI</span>
      </RouterLink>
      <p class="eyebrow">{{ route.path.includes('register') ? 'Ro‘yxatdan o‘tish' : 'Kirish' }}</p>
      <h1>
        {{ route.path.includes('portal') ? 'OneID orqali tasdiqlash' : 'Xavfsiz tizimga kirish' }}
      </h1>
      <form class="auth-form" @submit.prevent="submitLogin">
        <BaseInput
          v-model="pinfl"
          label="PINFL / Login"
          placeholder="12345678901234"
          :icon="Fingerprint"
        />
        <BaseInput
          v-model="password"
          label="Parol"
          type="password"
          placeholder="••••••••"
          :icon="KeyRound"
        />
        <button class="submit" type="submit">Davom etish</button>
      </form>
      <div class="role-links" aria-label="Rol bo‘yicha kirish">
        <RouterLink to="/portal/login">Fuqaro</RouterLink>
        <RouterLink to="/judge/login">Sudya</RouterLink>
        <RouterLink to="/admin/login">Admin</RouterLink>
        <RouterLink to="/oversight/login">Nazorat</RouterLink>
      </div>
      <p class="secure">
        <ShieldCheck :size="17" :stroke-width="1.5" /> Role-based dashboardga yo‘naltiradi
      </p>
      <RouterLink class="muted" to="/portal/forgot-password">Parolni tiklash</RouterLink>
    </section>
  </main>
</template>

<style scoped>
.auth {
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: var(--gray-100);
  padding: 20px;
}

.auth-card {
  display: grid;
  width: min(440px, 100%);
  gap: 18px;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  background: var(--color-white);
  padding: 28px;
  box-shadow: var(--shadow-lg);
}

.brand {
  padding: 0;
}

h1 {
  margin: 0;
  font-size: 34px;
  line-height: 1.05;
}

.auth-form {
  display: grid;
  gap: 18px;
}

.submit {
  min-height: 50px;
  border: 0;
  border-radius: var(--radius-full);
  background: var(--gray-900);
  color: var(--color-white);
  font-weight: 700;
}

.role-links {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}

.role-links a {
  display: grid;
  min-height: 38px;
  place-items: center;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-full);
  color: var(--gray-700);
  font-size: 13px;
  font-weight: 700;
}

.role-links a:hover,
.role-links a.router-link-active {
  background: var(--gray-900);
  color: var(--color-white);
}

.secure {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  color: var(--gray-500);
  font-size: 13px;
}
</style>
