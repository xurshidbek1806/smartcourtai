import pluginVue from 'eslint-plugin-vue';
import prettier from '@vue/eslint-config-prettier';

export default [
  {
    ignores: ['dist', 'node_modules', 'coverage']
  },
  ...pluginVue.configs['flat/recommended'],
  prettier,
  {
    files: ['**/*.{js,vue}'],
    rules: {
      'vue/multi-word-component-names': 'off'
    }
  }
];
