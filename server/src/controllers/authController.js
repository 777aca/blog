const bcrypt = require("bcryptjs");
const { prisma } = require("../utils/db");
const { generateTokens, verifyRefreshToken } = require("../utils/jwt");
const { ROLES, USER_STATUS } = require("./enums");

/**
 * 用户注册
 */
const register = async (req, res) => {
  try {
    const { email, username, password, nickname } = req.body;

    // 检查用户是否已存在
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { username: username.toLowerCase() },
        ],
      },
    });

    if (existingUser) {
      const field =
        existingUser.email === email.toLowerCase() ? "email" : "username";
      return res.status(400).json({
        success: false,
        message: `User with this ${field} already exists`,
        code: "USER_EXISTS",
        field,
      });
    }

    // 密码加密
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 创建用户
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        password: hashedPassword,
        nickname: nickname || username,
        role: ROLES.USER,
        status: USER_STATUS.ACTIVE,
        emailVerified: false,
      },
      select: {
        id: true,
        email: true,
        username: true,
        nickname: true,
        avatar: true,
        role: true,
        status: true,
        emailVerified: true,
        created_at: true,
      },
    });

    // 生成令牌
    const tokens = generateTokens(user);

    // 记录注册日志
    console.log(`New user registered: ${user.email} (ID: ${user.id})`);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user,
        ...tokens,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during registration",
      code: "REGISTRATION_ERROR",
    });
  }
};

/**
 * 用户登录
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
        code: "INVALID_CREDENTIALS",
      });
    }

    // 检查用户状态
    if (user.status === "INACTIVE") {
      return res.status(401).json({
        success: false,
        message: "Your account is inactive. Please contact support.",
        code: "ACCOUNT_INACTIVE",
      });
    }

    if (user.status === "BANNED") {
      return res.status(403).json({
        success: false,
        message: "Your account has been banned. Please contact support.",
        code: "ACCOUNT_BANNED",
      });
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
        code: "INVALID_CREDENTIALS",
      });
    }

    // 生成令牌
    const userForToken = {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };
    const tokens = generateTokens(userForToken);

    // 更新最后登录时间（可选）
    await prisma.user.update({
      where: { id: user.id },
      data: { updated_at: new Date() },
    });

    // 记录登录日志
    console.log(`User logged in: ${user.email} (ID: ${user.id})`);

    res.json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          nickname: user.nickname,
          avatar: user.avatar,
          role: user.role,
          status: user.status,
          emailVerified: user.emailVerified,
          created_at: user.created_at,
        },
        ...tokens,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during login",
      code: "LOGIN_ERROR",
    });
  }
};

/**
 * 刷新令牌
 */
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token is required",
        code: "REFRESH_TOKEN_REQUIRED",
      });
    }

    // 验证刷新令牌
    const decoded = verifyRefreshToken(refreshToken);

    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        nickname: true,
        role: true,
        status: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
        code: "USER_NOT_FOUND",
      });
    }

    if (user.status !== USER_STATUS.ACTIVE) {
      return res.status(401).json({
        success: false,
        message: "Account is not active",
        code: "ACCOUNT_NOT_ACTIVE",
      });
    }

    // 生成新令牌
    const tokens = generateTokens(user);

    res.json({
      success: true,
      message: "Token refreshed successfully",
      data: tokens,
    });
  } catch (error) {
    console.error("Refresh token error:", error);

    if (error.message.includes("expired")) {
      return res.status(401).json({
        success: false,
        message: "Refresh token has expired",
        code: "REFRESH_TOKEN_EXPIRED",
      });
    }

    if (error.message.includes("Invalid")) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
        code: "INVALID_REFRESH_TOKEN",
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error during token refresh",
      code: "REFRESH_ERROR",
    });
  }
};

/**
 * 获取用户资料
 */
const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        username: true,
        nickname: true,
        avatar: true,
        bio: true,
        role: true,
        status: true,
        emailVerified: true,
        created_at: true,
        updated_at: true,
        _count: {
          select: {
            articles: {
              where: { published: true },
            },
            comments: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        code: "USER_NOT_FOUND",
      });
    }

    res.json({
      success: true,
      message: "Profile retrieved successfully",
      data: { user },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching profile",
      code: "PROFILE_FETCH_ERROR",
    });
  }
};

/**
 * 更新用户资料
 */
const updateProfile = async (req, res) => {
  try {
    const { nickname, bio, avatar } = req.body;
    const userId = req.user.id;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(nickname && { nickname }),
        ...(bio !== undefined && { bio }),
        ...(avatar !== undefined && { avatar }),
      },
      select: {
        id: true,
        email: true,
        username: true,
        nickname: true,
        avatar: true,
        bio: true,
        role: true,
        updated_at: true,
      },
    });

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: { user: updatedUser },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while updating profile",
      code: "PROFILE_UPDATE_ERROR",
    });
  }
};

/**
 * 修改密码
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // 获取用户当前密码
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        code: "USER_NOT_FOUND",
      });
    }

    // 验证当前密码
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
        code: "INVALID_CURRENT_PASSWORD",
      });
    }

    // 检查新密码是否与当前密码相同
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from current password",
        code: "SAME_PASSWORD",
      });
    }

    // 加密新密码
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // 更新密码
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while changing password",
      code: "PASSWORD_CHANGE_ERROR",
    });
  }
};

/**
 * 用户登出
 */
const logout = async (req, res) => {
  try {
    // 在实际应用中，你可能想要将token加入黑名单
    // 这里我们只是返回成功响应
    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during logout",
      code: "LOGOUT_ERROR",
    });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  getProfile,
  updateProfile,
  changePassword,
  logout,
};
