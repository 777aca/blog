const { prisma } = require("../utils/db");

const createComment = async (req, res) => {
  const { articleId, content } = req.body;
  const { userId } = req.user;

  try {
    const comment = await prisma.comment.create({
      data: {
        content,
        article: {
          connect: {
            id: articleId,
          },
        },
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });

    res.status(201).json({
      message: "Article created successfully",
      comment,
    });
  } catch (error) {
    console.error("Get articles error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getCommentsByArticle = async (req, res) => {
  const { articleId } = req.params;

  try {
    const comments = await prisma.comment.findMany({
      where: {
        articleId: parseInt(articleId),
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            nickname: true,
          },
        },
      },
    });

    res.json(comments);
  } catch (error) {
    console.error("Get comments error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deleteComment = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;

  try {
    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(id) },
    });

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    // 检查是否是评论者或管理员
    if (comment.userId !== userId && req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Access denied" });
    }

    await prisma.comment.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Delete comment error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateComment = async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  const { userId } = req.user;

  try {
    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(id) },
    });

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    // 检查是否是评论者或管理员
    if (comment.userId !== userId && req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Access denied" });
    }

    const updatedComment = await prisma.comment.update({
      where: { id: parseInt(id) },
      data: { content },
    });

    res.json({
      message: "Comment updated successfully",
      comment: updatedComment,
    });
  } catch (error) {
    console.error("Update comment error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createComment,
  getCommentsByArticle,
  deleteComment,
  updateComment,
};
