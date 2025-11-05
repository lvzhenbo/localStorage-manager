import { globalIgnores } from 'eslint/config';
import pluginVue from 'eslint-plugin-vue';
import {
  defineConfigWithVueTs,
  vueTsConfigs,
  configureVueProject,
} from '@vue/eslint-config-typescript';
import prettierConfig from '@vue/eslint-config-prettier';
import parserVue from 'vue-eslint-parser';

configureVueProject({
  scriptLangs: ['ts', 'tsx'],
});

export default defineConfigWithVueTs(
  vueTsConfigs.recommended,
  {
    extends: [...pluginVue.configs['flat/recommended']],
    name: 'app/vue-files',
    files: ['**/*.vue'],
    languageOptions: {
      parser: parserVue,
      parserOptions: {
        ecmaVersion: 'latest',
      },
    },
  },
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}'],
    rules: {
      // 允许被禁止的类型 https://typescript-eslint.io/rules/ban-types/
      '@typescript-eslint/ban-types': 'off',
      // 允许any类型 https://typescript-eslint.io/rules/no-explicit-any/
      '@typescript-eslint/no-explicit-any': 'off',
      // 允许任何TS指令注释 https://typescript-eslint.io/rules/ban-ts-comment
      '@typescript-eslint/ban-ts-comment': 'off',
      // 允许空函数 https://typescript-eslint.io/rules/no-empty-function/
      '@typescript-eslint/no-empty-function': 'off',
      // 关闭强制多词组件名 https://eslint.vuejs.org/rules/multi-word-component-names.html
      'vue/multi-word-component-names': 'off',
    },
  },
  prettierConfig,
  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**', '.output/**', '.wxt/**']),
);
