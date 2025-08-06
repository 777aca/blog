import http from "./http";

// 获取文章
export const getArticle = (params) => http.get("/articles", { params });

// 根据id获取文章
export const getArticleById = (id) => http.get(`/articles/${id}`);
