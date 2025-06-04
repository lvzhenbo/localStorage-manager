<script setup lang="tsx">
  import { zhCN, dateZhCN, darkTheme, lightTheme } from 'naive-ui';
  import hljs from 'highlight.js/lib/core';
  import json from 'highlight.js/lib/languages/json';

  hljs.registerLanguage('json', json);
  const osThemeRef = useOsTheme();
  const theme = computed(() => {
    return osThemeRef.value === 'dark' ? darkTheme : lightTheme;
  });
</script>

<template>
  <NConfigProvider :locale="zhCN" :date-locale="dateZhCN" :hljs="hljs" :theme="theme">
    <NDialogProvider>
      <NMessageProvider>
        <Content />
      </NMessageProvider>
    </NDialogProvider>
  </NConfigProvider>
</template>

<style scoped></style>
