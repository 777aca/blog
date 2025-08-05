const { PrismaClient } = require("@prisma/client");

// 创建 Prisma 客户端实例
const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "info", "warn", "error"]
      : ["error"],
  errorFormat: "colorless",
});

/**
 * 连接数据库
 */
const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log("📦 Database connected successfully");

    // 测试数据库连接
    await prisma.$queryRaw`SELECT 1`;
    console.log("✅ Database connection test passed");
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    console.error("Full error:", error);
    process.exit(1);
  }
};

/**
 * 优雅关闭数据库连接
 */
const disconnectDB = async () => {
  try {
    await prisma.$disconnect();
    console.log("📦 Database disconnected successfully");
  } catch (error) {
    console.error("❌ Database disconnection error:", error.message);
  }
};

/**
 * 数据库健康检查
 */
const healthCheck = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: "healthy", timestamp: new Date().toISOString() };
  } catch (error) {
    return {
      status: "unhealthy",
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
};

/**
 * 获取数据库统计信息
 */
const getDBStats = async () => {
  try {
    const [userCount, articleCount, commentCount, categoryCount, tagCount] =
      await Promise.all([
        prisma.user.count(),
        prisma.article.count(),
        prisma.comment.count(),
        prisma.category.count(),
        prisma.tag.count(),
      ]);

    return {
      users: userCount,
      articles: articleCount,
      comments: commentCount,
      categories: categoryCount,
      tags: tagCount,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    throw new Error(`Failed to get database stats: ${error.message}`);
  }
};

/**
 * 事务包装器
 */
const withTransaction = async (callback) => {
  return await prisma.$transaction(callback);
};

/**
 * 处理进程退出时的清理工作
 */
process.on("beforeExit", async () => {
  await disconnectDB();
});

process.on("SIGINT", async () => {
  await disconnectDB();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await disconnectDB();
  process.exit(0);
});

module.exports = {
  prisma,
  connectDB,
  disconnectDB,
  healthCheck,
  getDBStats,
  withTransaction,
};
