import { createI18n } from 'vue-i18n';

export const i18n = createI18n({
  legacy: false,
  locale: window.localStorage.getItem('smartcourt-locale') || 'uz',
  fallbackLocale: 'en',
  messages: {
    uz: {
      app: {
        demo: "Demo ko'rish",
        details: 'Batafsil',
        login: 'Tizimga kirish'
      }
    },
    en: {
      app: {
        demo: 'View demo',
        details: 'Learn more',
        login: 'Sign in'
      }
    },
    ru: {
      app: {
        demo: 'Смотреть демо',
        details: 'Подробнее',
        login: 'Войти'
      }
    },
    'uz-cyrl': {
      app: {
        demo: 'Демо кўриш',
        details: 'Батафсил',
        login: 'Тизимга кириш'
      }
    }
  }
});
