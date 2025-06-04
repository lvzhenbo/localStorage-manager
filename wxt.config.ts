import { defineConfig } from 'wxt';
import vueJsx from '@vitejs/plugin-vue-jsx';
import Components from 'unplugin-vue-components/vite';
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'node:path';
import { existsSync, mkdirSync } from 'node:fs';

// 确保 chrome-data 目录存在
const chromiumProfilePath = resolve('.wxt/chrome-data');
if (!existsSync(chromiumProfilePath)) {
  mkdirSync(chromiumProfilePath, { recursive: true });
}

// See https://wxt.dev/api/config.html
export default defineConfig({
  webExt: {
    chromiumProfile: resolve('.wxt/chrome-data'),
    keepProfileChanges: true,
  },
  modules: ['@wxt-dev/module-vue'],
  manifest: {
    name: 'localStorage 管理器',
    description: '用于添加、删除、修改localStorage和sessionStorage的简单插件',
  },
  imports: {
    // addons: {
    //   vueTemplate: true,
    // },
    // eslintrc: {
    //   enabled: true,
    // },
    // presets: ['vue'],
    imports: [
      {
        name: 'useDialog',
        from: 'naive-ui',
      },
      {
        name: 'useMessage',
        from: 'naive-ui',
      },
      {
        name: 'useNotification',
        from: 'naive-ui',
      },
      {
        name: 'useLoadingBar',
        from: 'naive-ui',
      },
      {
        name: 'useOsTheme',
        from: 'naive-ui',
      },
    ],
  },
  analysis: {
    enabled: true,
  },
  vite: () => ({
    plugins: [
      vueJsx(),
      Components({
        resolvers: [NaiveUiResolver()],
        dirs: ['components/'],
      }),
      tailwindcss(),
    ],
    build: {
      chunkSizeWarningLimit: 1024,
    },
  }),
});
