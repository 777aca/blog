<template>
  <div class="w-full">
    <ul>
      <NuxtLink
        v-for="item in articleList"
        :key="item.id"
        :to="'/posts/' + item.id"
        class="mb-20 block"
      >
        <h1 class="text-xl font-bold">{{ item.title }}</h1>
        <p class="text-sm ml-10">
          {{
            // 格式化时间 年月日
            new Date(item.created_at).toLocaleDateString()
          }}
        </p>
      </NuxtLink>
    </ul>
  </div>
</template>
<script lang="ts" setup>
import { getArticle } from "~/api";

useHead({
  title: "Blog - Joker Chor",
});

const { data: articleList } = await getArticle({});
</script>

<style></style>
