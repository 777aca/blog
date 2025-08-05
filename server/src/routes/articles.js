// routes/articles.js
const express = require("express");
const router = express.Router();
const {
  createArticle,
  getArticles,
  getArticle,
  updateArticle,
  deleteArticle,
} = require("../controllers/articleController");
const { authenticate } = require("../middleware/auth");

// 创建新文章 (需要认证)
router.post("/", authenticate, createArticle);

// 获取所有文章（带分页）
router.get("/", getArticles);

// 获取单个文章详情
router.get("/:id", getArticle);

// 更新文章 (需要认证且是作者)
router.put("/:id", authenticate, updateArticle);

// 删除文章 (需要认证且是作者或管理员)
router.delete("/:id", authenticate, deleteArticle);

module.exports = router;
