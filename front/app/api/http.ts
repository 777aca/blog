import axios, { type AxiosResponse, type AxiosError, type AxiosInstance } from "axios";

// 创建一个工厂函数来获取axios实例
const createApi = (): AxiosInstance => {
  const config = useRuntimeConfig();
  
  // 创建axios实例
  const api = axios.create({
    baseURL: config.public.apiBase,
    headers: {
      "Content-Type": "application/json",
    },
  });
  
  // 请求拦截器
  api.interceptors.request.use(
    (config) => {
      // 添加请求时间戳
      config.headers["X-Request-Time"] = Date.now().toString();
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // 响应拦截器
  api.interceptors.response.use(
    (response: AxiosResponse) => {
      // 统一处理响应数据
      const data = response.data;
      // 如果后端返回的success字段为false，抛出错误
      if (data.success === false) {
        throw new Error(data.message || "请求失败");
      }

      return response.data;
    },
    async (error: AxiosError) => {
      const status = error.response?.status;

      // 统一错误处理
      switch (status) {
        case 500:
          throw new Error("服务器内部错误");
        default:
          throw new Error(error.message || "网络错误");
      }
    }
  );
  
  return api;
};

export default createApi;
