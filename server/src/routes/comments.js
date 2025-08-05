// routes/comments.js
const express = require("express");
const router = express.Router();
const {
  createComment,
  getCommentsByArticle,
  deleteComment,
  updateComment,
} = require("../controllers/commentController");
const { authenticate } = require("../middleware/auth");

// 创建新评论 (需要认证)
router.post("/", authenticate, createComment);

// 获取文章的所有评论
router.get("/article/:articleId", getCommentsByArticle);

// 删除评论 (需要认证且是评论者或管理员)
router.delete("/:id", authenticate, deleteComment);

// 更新评论 (需要认证且是评论者)
router.put("/:id", authenticate, updateComment);

module.exports = router;
