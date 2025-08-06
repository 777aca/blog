import config from "./config";

export default defineNuxtConfig({
  devServer: {
    port: 3000,
  },
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE,
    },
  },
  app: {
    head: {
      title: config.title,
      meta: [
        {
          name: "author",
          content: config.author,
        },
        {
          name: "description",
          content: config.description,
        },
        {
          name: "keywords",
          content: config.keywords,
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
