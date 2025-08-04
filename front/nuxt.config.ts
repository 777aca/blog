// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // 我的 Nuxt 配置
  app: {
    head: {
      title: "JokerChor",
      meta: [
        {
          name: "author",
          content: "JokerChor",
        },
        {
          name: "description",
          content: "用追马的时间去种草。",
        },
        {
          name: "keywords",
          content: "JokerChor, 阿楚, chor, Nuxt, Vue, 前端开发, 种草",
        },
      ],
      link: [
        {
          rel: "icon",
          type: "image/x-icon",
          href: "/favicon.ico",
        },
      ],
    },
  },
  css: ["~/assets/main.css", "~/assets/reset.css"],
  ui: {
    fonts: false,
  },
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxt/eslint", "@nuxt/ui"],
  $development: {
    // 开发环境配置
  },
  $production: {
    // 生产环境配置
  },
});
