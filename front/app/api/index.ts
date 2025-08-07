
import createApi from "./http";

// 获取文章
export const getArticle = (params: any) => {
  const http = createApi();
  return http.get("/articles", { params });
};

// 根据id获取文章
export const getArticleById = (id: number | string) => {
  const http = createApi();
  return http.get(`/articles/${id}`);
};
