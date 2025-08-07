const { prisma } = require("../utils/db");

const getArticles = async (req, res) => {
  try {
    const { page = 1, size = 10, tag, status = "PUBLISHED" } = req.query;
    const skip = (page - 1) * size;

    const where = {
      status: status,
      published: true,
    };

    if (tag) {
      where.tags = {
        some: {
          tag: { name: tag },
        },
      };
    }

    const [data, total] = await Promise.all([
      prisma.article.findMany({
        where,
        include: {
          tags: {
            include: { tag: true },
          },
        },
        orderBy: { created_at: "desc" },
        skip: parseInt(skip),
        take: parseInt(size),
      }),
      prisma.article.count({ where }),
    ]);

    res.json({
      data,
      page: parseInt(page),
      total,
    });
  } catch (error) {
    console.error("Get articles error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getArticle = async (req, res) => {
  try {
    const article = await prisma.article.findUnique({
      where: {
        id: parseInt(req.params.id),
      },
      include: {
        tags: {
          include: { tag: true },
        },
      },
    });

    if (!article) {
      return res.status(404).json({ error: "Article not found" });
    }

    // 增加浏览量
    await prisma.article.update({
      where: {
        id: parseInt(req.params.id),
      },
      data: { views: { increment: 1 } },
    });

    res.json({ data: article });
  } catch (error) {
    console.error("Get article error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const createArticle = async (req, res) => {
  try {
    const { title, content, tags, status = "DRAFT" } = req.body;

    const article = await prisma.article.create({
      data: {
        title,
        content,
        status,
        published: status === "PUBLISHED",
        publish_at: status === "PUBLISHED" ? new Date() : null,
        tags: {
          create:
            tags?.map((tagId) => ({
              tag: { connect: { id: parseInt(tagId) } },
            })) || [],
        },
      },
      include: {
        tags: {
          include: { tag: true },
        },
      },
    });

    res.status(201).json({
      message: "Article created successfully",
      article,
    });
  } catch (error) {
    console.error("Create article error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 更新文章
const updateArticle = async (req, res) => {
  try {
    // 获取请求参数中的id
    const { id } = req.params;
    // 获取请求体中的参数
    const { title, content, tags, status = "DRAFT" } = req.body;

    // 更新文章
    const article = await prisma.article.update({
      where: { id: parseInt(id) },
      data: {
        title,
        content,
        status,
        published: status === "PUBLISHED",
        publish_at: status === "PUBLISHED" ? new Date() : null,
        tags: {
          deleteMany: {},
          create:
            tags?.map((tagId) => ({
              tag: { connect: { id: parseInt(tagId) } },
            })) || [],
        },
      },
      include: {
        tags: {
          include: { tag: true },
        },
      },
    });

    res.status(201).json({
      message: "Article created successfully",
      article,
    });
  } catch (error) {
    console.error("Create article error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;

    // 检查文章是否存在
    const article = await prisma.article.findUnique({
      where: { id: parseInt(id) },
    });

    if (!article) {
      return res.status(404).json({ error: "Article not found" });
    }

    // 删除文章
    await prisma.article.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: "Article deleted successfully" });
  } catch (error) {
    console.error("Delete article error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getArticles,
  getArticle,
  createArticle,
  updateArticle,
  deleteArticle,
};
