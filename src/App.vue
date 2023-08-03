<script setup lang="tsx">
  import { zhCN, dateZhCN } from 'naive-ui';
  import hljs from 'highlight.js/lib/core';
  import javascript from 'highlight.js/lib/languages/javascript';

  hljs.registerLanguage('javascript', javascript);
</script>

<template>
  <NConfigProvider :locale="zhCN" :date-locale="dateZhCN" :hljs="hljs">
    <NDialogProvider>
      <Content />
    </NDialogProvider>
  </NConfigProvider>
</template>

<style scoped></style>
