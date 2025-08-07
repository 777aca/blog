// routes/auth.js
const express = require("express");
const router = express.Router();
const {
  login,
  getProfile,
} = require("../controllers/authController");
const { authenticate } = require("../middleware/auth");

// 用户登录
router.post("/login", login);

// 获取当前用户信息 (需要认证)
router.get("/info", authenticate, getProfile);

module.exports = router;
