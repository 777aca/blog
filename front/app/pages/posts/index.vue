<template>
  <div class="w-full">
    <ul>
      <NuxtLink
        v-for="item in articleList"
        :key="item.id"
        :to="'/posts/' + item.id"
        class="mb-30 block"
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
import type { Article } from "~/types/article";

useHead({
  title: "Blog - Joker Chor",
});

const articleList = ref<Article[]>([]);
const getArticleList = async () => {
  const res = await getArticle({});
  console.log(res);
  articleList.value = res.data;
};

onMounted(() => {
  getArticleList();
});
</script>

<style></style>
