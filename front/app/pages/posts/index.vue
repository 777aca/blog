
<template>
  <div class="w-full">
    <div class="flex items-center mb-8">
      <h1 class="text-2xl font-bold mr-4">Blog</h1>
    </div>

    <div v-for="(yearGroup, year) in groupedArticles" :key="year" class="mt-30 relative">
      <div class="text-8xl font-bold text-gray-100 opacity-80 mb-6 absolute z-0 -top-10">{{ year }}</div>
      
      <ul class="space-y-6 relative z-1">
        <li v-for="article in yearGroup" :key="article.id" class="group">
          <NuxtLink :to="'/posts/' + article.id" class="block mt-10 mb-10">
            <div class="flex items-baseline">
              <h2 class="text-lg font-medium group-hover:text-primary-500 transition-colors">
                {{ article.title }}
              </h2>
              <div class="flex items-center ml-4 text-sm text-gray-400 space-x-2">
                <span>{{ formatDate(article.created_at) }}</span>
                <span>·</span>
                <span>{{ estimateReadingTime(article.content) }}分钟</span>
              </div>
            </div>
          </NuxtLink>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { getArticle } from "~/api";
import type { Article } from "~/types/article";

useHead({
  title: "Blog - Joker Chor",
});

// 使用服务器端排序，不需要在前端再次排序
const { data: articleList } = await getArticle({
  page: 1,
  size: 1000, 
});

// 按年份分组文章
const groupedArticles = computed(() => {
  if (!articleList) return {};
  
  const groups: Record<string, Article[]> = {};
  
  articleList.forEach((article: Article) => {
    const year = new Date(article.created_at).getFullYear().toString();
    if (!groups[year]) {
      groups[year] = [];
    }
    groups[year].push(article);
  });
  
  // 返回按年份降序排序的对象
  return Object.fromEntries(
    Object.entries(groups).sort((a, b) => Number(b[0]) - Number(a[0]))
  );
});

// 格式化日期为 "月 日" 格式
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}月${day}日`;
};

// 估算阅读时间（假设每分钟阅读300个字）
const estimateReadingTime = (content: string) => {
  if (!content) return 1;
  const wordsPerMinute = 300;
  const wordCount = content.length;
  const readingTime = Math.ceil(wordCount / wordsPerMinute);
  return Math.max(1, readingTime); // 至少1分钟
};
</script>

<style scoped>
.text-primary-500 {
  color: #3b82f6;
}
</style>
