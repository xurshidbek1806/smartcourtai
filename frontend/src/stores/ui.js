import { reactive } from 'vue';

const state = reactive({
  toasts: []
});

export const useUi = () => {
  const pushToast = (toast) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    state.toasts.push({ id, ...toast });
    window.setTimeout(() => {
      const index = state.toasts.findIndex((item) => item.id === id);
      if (index >= 0) state.toasts.splice(index, 1);
    }, 3200);
  };

  const removeToast = (id) => {
    const index = state.toasts.findIndex((item) => item.id === id);
    if (index >= 0) state.toasts.splice(index, 1);
  };

  return {
    state,
    pushToast,
    removeToast
  };
};
