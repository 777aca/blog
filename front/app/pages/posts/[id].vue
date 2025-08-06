<template>
  <div>
    <h1 class="text-xl font-bold mb-30">{{ post.title }}</h1>
    <p class="text-sm">{{ post.content }}</p>
  </div>
</template>

<script setup lang="ts">
import { getArticleById } from "~/api";
const route = useRoute();

const { data: post } = await getArticleById(route.params.id as string);

useHead({
  title: `${post.title} - Joker Chor`,
});
</script>
