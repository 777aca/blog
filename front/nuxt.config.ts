// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devServer: {
    port: 3000,
  },
  runtimeConfig: {
    public: {
      apiBase: "http://localhost:8000/api",
    },
  },
  app: {
    head: {
      title: "Joker Chor",
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
  devtools: { enabled: true },
  modules: ["@nuxt/eslint", "@nuxt/ui"],
});
