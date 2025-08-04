<template>
  <div>友情链接</div>
</template>

<script setup lang="ts">
useHead({
  title: "我的应用",
  meta: [{ name: "description", content: "我的精彩网站。" }],
  bodyAttrs: {
    class: "test",
  },
  script: [{ innerHTML: "console.log('Hello world')" }],
});
</script>

<style></style>
