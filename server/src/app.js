const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { connectDB } = require("./utils/db");

// 路由引入
const authRoutes = require("./routes/auth");
const articleRoutes = require("./routes/articles");
const commentRoutes = require("./routes/comments");

const app = express();

// 中间件
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

console.log(new Date().getTime(), " - Server started");

// 限流
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 限制每个IP 100次请求
});
app.use("/api", limiter);

// 静态文件
app.use("/uploads", express.static("uploads"));

// 路由
app.use("/api/auth", authRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/comments", commentRoutes);

// 健康检查
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// 404处理
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// 错误处理
app.use((error, req, res, next) => {
  console.error("Unhandled error:", error);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 8000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
