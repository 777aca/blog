<template>
  <div>
    <h1 class="text-xl font-bold mb-30">{{ post.title }}</h1>
    <p class="text-sm">{{ post.content }}</p>
  </div>
</template>

<script setup lang="ts">
import type { Article } from "~/types/article";
import { getArticleById } from "~/api";
const route = useRoute();
useHead({
  title: "Blog - Joker Chor",
});

const post = ref<Article>({});

onMounted(async () => {
  const { data } = await getArticleById(route.params.id as string);
  post.value = data;
});
</script>
