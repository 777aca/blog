const { verifyAccessToken, extractTokenFromHeader } = require("../utils/jwt");
const { prisma } = require("../utils/db");
const { ApiError } = require("../utils/errors");

/**
 * 身份认证中间件
 * 验证JWT token并将用户信息添加到req.user
 */
const authenticate = async (req, res, next) => {
  try {
    // 从请求头中提取token
    const authHeader = req.header("Authorization");
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
        code: "NO_TOKEN",
      });
    }

    // 验证token
    const decoded = verifyAccessToken(token);

    // 从数据库中获取最新的用户信息
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        nickname: true,
        role: true,
        status: true,
        avatar: true,
        emailVerified: true,
        created_at: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid token. User not found.",
        code: "USER_NOT_FOUND",
      });
    }

    // 检查用户状态
    if (user.status === "INACTIVE") {
      return res.status(401).json({
        success: false,
        message: "Account is inactive.",
        code: "ACCOUNT_INACTIVE",
      });
    }

    if (user.status === "BANNED") {
      return res.status(403).json({
        success: false,
        message: "Account has been banned.",
        code: "ACCOUNT_BANNED",
      });
    }

    // 将用户信息添加到请求对象
    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    console.error("Authentication error:", error);

    if (error.message.includes("expired")) {
      return res.status(401).json({
        success: false,
        message: "Token has expired.",
        code: "TOKEN_EXPIRED",
      });
    }

    if (error.message.includes("Invalid")) {
      return res.status(401).json({
        success: false,
        message: "Invalid token.",
        code: "INVALID_TOKEN",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Authentication failed.",
      code: "AUTH_FAILED",
    });
  }
};

/**
 * 可选认证中间件
 * 如果提供了token则验证，否则继续执行
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    const token = extractTokenFromHeader(authHeader);

    if (token) {
      try {
        const decoded = verifyAccessToken(token);
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: {
            id: true,
            email: true,
            username: true,
            nickname: true,
            role: true,
            status: true,
            avatar: true,
          },
        });

        if (user && user.status === "ACTIVE") {
          req.user = user;
          req.token = token;
        }
      } catch (error) {
        // 如果token无效，继续执行但不设置用户信息
        console.warn("Optional auth failed:", error.message);
      }
    }

    next();
  } catch (error) {
    // 出错时也继续执行
    console.error("Optional auth error:", error);
    next();
  }
};

/**
 * 权限验证中间件工厂函数
 * @param {...string} roles - 允许的角色列表
 * @returns {Function} 中间件函数
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
        code: "AUTH_REQUIRED",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Insufficient permissions.",
        code: "INSUFFICIENT_PERMISSIONS",
        required: roles,
        current: req.user.role,
      });
    }

    next();
  };
};

/**
 * 检查是否为资源所有者或管理员
 * @param {string} userIdField - 用户ID字段名(如 'authorId', 'userId')
 * @returns {Function} 中间件函数
 */
const authorizeOwnerOrAdmin = (userIdField = "userId") => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required.",
          code: "AUTH_REQUIRED",
        });
      }

      // 管理员可以访问所有资源
      if (req.user.role === "ADMIN") {
        return next();
      }

      // 获取资源ID
      const resourceId = req.params.id;
      if (!resourceId) {
        return res.status(400).json({
          success: false,
          message: "Resource ID is required.",
          code: "RESOURCE_ID_REQUIRED",
        });
      }

      // 这里需要根据具体的资源类型来查询
      // 示例：检查文章所有权
      let resource;
      const route = req.route.path;

      if (route.includes("/articles")) {
        resource = await prisma.article.findUnique({
          where: { id: parseInt(resourceId) },
          select: { authorId: true },
        });
      } else if (route.includes("/comments")) {
        resource = await prisma.comment.findUnique({
          where: { id: parseInt(resourceId) },
          select: { userId: true },
        });
      }

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: "Resource not found.",
          code: "RESOURCE_NOT_FOUND",
        });
      }

      // 检查所有权
      const resourceUserId =
        resource[userIdField] || resource.authorId || resource.userId;
      if (resourceUserId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "Access denied. You can only access your own resources.",
          code: "ACCESS_DENIED",
        });
      }

      next();
    } catch (error) {
      console.error("Authorization error:", error);
      return res.status(500).json({
        success: false,
        message: "Authorization check failed.",
        code: "AUTH_CHECK_FAILED",
      });
    }
  };
};

/**
 * 检查邮箱验证状态
 */
const requireEmailVerification = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
      code: "AUTH_REQUIRED",
    });
  }

  if (!req.user.emailVerified) {
    return res.status(403).json({
      success: false,
      message: "Email verification required.",
      code: "EMAIL_VERIFICATION_REQUIRED",
    });
  }

  next();
};

module.exports = {
  authenticate,
  optionalAuth,
  authorize,
  authorizeOwnerOrAdmin,
  requireEmailVerification,
};
