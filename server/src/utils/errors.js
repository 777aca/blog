/**
 * 自定义错误类 - ApiError
 * 扩展自Error类，用于创建具有特定状态码和错误代码的API错误
 */
class ApiError extends Error {
  /**
   * 构造函数
   * @param {number} statusCode - HTTP状态码
   * @param {string} message - 错误消息
   * @param {string} errorCode - 自定义错误代码
   * @param {boolean} [isOperational=true] - 是否为可操作错误
   */
  constructor(statusCode, message, errorCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 全局错误处理中间件
 * 捕获所有未被处理的错误，返回结构化的错误响应
 */
const errorHandler = (err, req, res, next) => {
  // 记录错误堆栈信息
  console.error(`[${new Date().toISOString()}] ${err.stack}`);

  // 处理自定义ApiError
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.errorCode,
    });
  }

  // 处理JWT验证错误
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
      code: "INVALID_TOKEN",
    });
  }

  // 处理JWT过期错误
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token has expired",
      code: "TOKEN_EXPIRED",
    });
  }

  // 处理数据库错误
  if (err.code === "P2025") {
    return res.status(404).json({
      success: false,
      message: "Requested resource not found",
      code: "RESOURCE_NOT_FOUND",
    });
  }

  // 处理数据库唯一约束错误
  if (err.code === "P2002") {
    const field = err.meta?.target?.[0] || "resource";
    return res.status(409).json({
      success: false,
      message: `${field} already exists`,
      code: "RESOURCE_CONFLICT",
    });
  }

  // 处理数据库查询错误
  if (err.code?.startsWith("P")) {
    return res.status(500).json({
      success: false,
      message: "Database operation failed",
      code: "DATABASE_ERROR",
    });
  }

  // 处理验证错误
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      code: "VALIDATION_ERROR",
      errors,
    });
  }

  // 处理其他未处理错误
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal server error",
    code: err.errorCode || "UNKNOWN_ERROR",
  });
};

module.exports = {
  ApiError,
  errorHandler,
};
