const jwt = require("jsonwebtoken");

/**
 * 生成访问令牌
 * @param {Object} payload - 用户信息
 * @returns {string} JWT token
 */
const generateAccessToken = (payload) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1h",
    issuer: "blog-api",
    audience: "blog-users",
  });
};

/**
 * 生成刷新令牌
 * @param {Object} payload - 用户信息
 * @returns {string} Refresh token
 */
const generateRefreshToken = (payload) => {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error(
      "JWT_REFRESH_SECRET is not defined in environment variables"
    );
  }

  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    issuer: "blog-api",
    audience: "blog-users",
  });
};

/**
 * 生成令牌对(访问令牌和刷新令牌)
 * @param {Object} user - 用户信息
 * @returns {Object} { accessToken, refreshToken }
 */
const generateTokens = (user) => {
  const payload = {
    userId: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken({ userId: user.id });

  return {
    accessToken,
    refreshToken,
    expiresIn: process.env.JWT_EXPIRES_IN || "1h",
  };
};

/**
 * 验证访问令牌
 * @param {string} token - JWT token
 * @returns {Object} 解码后的用户信息
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET, {
      issuer: "blog-api",
      audience: "blog-users",
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new Error("Access token has expired");
    } else if (error.name === "JsonWebTokenError") {
      throw new Error("Invalid access token");
    } else {
      throw new Error("Token verification failed");
    }
  }
};

/**
 * 验证刷新令牌
 * @param {string} token - Refresh token
 * @returns {Object} 解码后的用户信息
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET, {
      issuer: "blog-api",
      audience: "blog-users",
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new Error("Refresh token has expired");
    } else if (error.name === "JsonWebTokenError") {
      throw new Error("Invalid refresh token");
    } else {
      throw new Error("Refresh token verification failed");
    }
  }
};

/**
 * 从请求头中提取令牌
 * @param {string} authHeader - Authorization header
 * @returns {string|null} JWT token
 */
const extractTokenFromHeader = (authHeader) => {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null;
  }

  return parts[1];
};

/**
 * 解码令牌(不验证签名)
 * @param {string} token - JWT token
 * @returns {Object} 解码后的令牌信息
 */
const decodeToken = (token) => {
  try {
    return jwt.decode(token, { complete: true });
  } catch (error) {
    throw new Error("Failed to decode token");
  }
};

/**
 * 检查令牌是否即将过期(剩余时间少于5分钟)
 * @param {string} token - JWT token
 * @returns {boolean} 是否即将过期
 */
const isTokenExpiringSoon = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      return true;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = decoded.exp - currentTime;

    // 如果剩余时间少于5分钟(300秒)
    return timeUntilExpiry < 300;
  } catch (error) {
    return true;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
  extractTokenFromHeader,
  decodeToken,
  isTokenExpiringSoon,
};
