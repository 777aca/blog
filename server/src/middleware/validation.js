const Joi = require('joi');

/**
 * 通用验证中间件
 * @param {Object} schema - Joi验证模式
 * @param {string} property - 要验证的属性 ('body', 'query', 'params')
 * @returns {Function} 中间件函数
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false, // 显示所有错误
      stripUnknown: true // 移除未知字段
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context.value
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        errors
      });
    }

    req[property] = value;
    next();
  };
};

// 用户相关验证模式
const userSchemas = {
  register: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
    username: Joi.string()
      .alphanum()
      .min(3)
      .max(30)
      .required()
      .messages({
        'string.alphanum': 'Username can only contain letters and numbers',
        'string.min': 'Username must be at least 3 characters long',
        'string.max': 'Username cannot exceed 30 characters',
        'any.required': 'Username is required'
      }),
    password: Joi.string()
      .min(6)
      .max(128)
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)'))
      .required()
      .messages({
        'string.min': 'Password must be at least 6 characters long',
        'string.max': 'Password cannot exceed 128 characters',
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
        'any.required': 'Password is required'
      }),
    nickname: Joi.string()
      .min(1)
      .max(50)
      .optional()
      .messages({
        'string.min': 'Nickname must be at least 1 character long',
        'string.max': 'Nickname cannot exceed 50 characters'
      })
  }),

  login: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
    password: Joi.string()
      .required()
      .messages({
        'any.required': 'Password is required'
      })
  }),

  updateProfile: Joi.object({
    nickname: Joi.string()
      .min(1)
      .max(50)
      .optional()
      .messages({
        'string.min': 'Nickname must be at least 1 character long',
        'string.max': 'Nickname cannot exceed 50 characters'
      }),
    bio: Joi.string()
      .max(500)
      .optional()
      .allow('')
      .messages({
        'string.max': 'Bio cannot exceed 500 characters'
      }),
    avatar: Joi.string()
      .uri()
      .optional()
      .allow('')
      .messages({
        'string.uri': 'Avatar must be a valid URL'
      })
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string()
      .required()
      .messages({
        'any.required': 'Current password is required'
      }),
    newPassword: Joi.string()
      .min(6)
      .max(128)
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)'))
      .required()
      .messages({
        'string.min': 'New password must be at least 6 characters long',
        'string.max': 'New password cannot exceed 128 characters',
        'string.pattern.base': 'New password must contain at least one uppercase letter, one lowercase letter, and one number',
        'any.required': 'New password is required'
      })
  })
};

// 文章相关验证模式
const articleSchemas = {
  create: Joi.object({
    title: Joi.string()
      .min(1)
      .max(200)
      .required()
      .messages({
        'string.min': 'Title is required',
        'string.max': 'Title cannot exceed 200 characters',
        'any.required': 'Title is required'
      }),
    content: Joi.string()
      .min(1)
      .required()
      .messages({
        'string.min': 'Content is required',
        'any.required': 'Content is required'
      }),
    excerpt: Joi.string()
      .max(500)
      .optional()
      .allow('')
      .messages({
        'string.max': 'Excerpt cannot exceed 500 characters'
      }),
    cover: Joi.string()
      .uri()
      .optional()
      .allow('')
      .messages({
        'string.uri': 'Cover must be a valid URL'
      }),
    categoryId: Joi.number()
      .integer()
      .positive()
      .required()
      .messages({
        'number.base': 'Category ID must be a number',
        'number.integer': 'Category ID must be an integer',
        'number.positive': 'Category ID must be positive',
        'any.required': 'Category is required'
      }),
    tags: Joi.array()
      .items(Joi.number().integer().positive())
      .optional()
      .messages({
        'array.base': 'Tags must be an array',
        'number.base': 'Tag ID must be a number',
        'number.integer': 'Tag ID must be an integer',
        'number.positive': 'Tag ID must be positive'
      }),
    status: Joi.string()
      .valid('DRAFT', 'PUBLISHED', 'ARCHIVED')
      .optional()
      .default('DRAFT')
      .messages({
        'any.only': 'Status must be one of: DRAFT, PUBLISHED, ARCHIVED'
      }),
    published: Joi.boolean()
      .optional()
      .default(false),
    featured: Joi.boolean()
      .optional()
      .default(false),
    allowComments: Joi.boolean()
      .optional()
      .default(true)
  }),

  update: Joi.object({
    title: Joi.string()
      .min(1)
      .max(200)
      .optional()
      .messages({
        'string.min': 'Title cannot be empty',
        'string.max': 'Title cannot exceed 200 characters'
      }),
    content: Joi.string()
      .min(1)
      .optional()
      .messages({
        'string.min': 'Content cannot be empty'
      }),
    excerpt: Joi.string()
      .max(500)
      .optional()
      .allow('')
      .messages({
        'string.max': 'Excerpt cannot exceed 500 characters'
      }),
    cover: Joi.string()
      .uri()
      .optional()
      .allow('')
      .messages({
        'string.uri': 'Cover must be a valid URL'
      }),
    categoryId: Joi.number()
      .integer()
      .positive()
      .optional()
      .messages({
        'number.base': 'Category ID must be a number',
        'number.integer': 'Category ID must be an integer',
        'number.positive': 'Category ID must be positive'
      }),
    tags: Joi.array()
      .items(Joi.number().integer().positive())
      .optional()
      .messages({
        'array.base': 'Tags must be an array',
        'number.base': 'Tag ID must be a number',
        'number.integer': 'Tag ID must be an integer',
        'number.positive': 'Tag ID must be positive'
      }),
    status: Joi.string()
      .valid('DRAFT', 'PUBLISHED', 'ARCHIVED')
      .optional()
      .messages({
        'any.only': 'Status must be one of: DRAFT, PUBLISHED, ARCHIVED'
      }),
    published: Joi.boolean()
      .optional(),
    featured: Joi.boolean()
      .optional(),
    allowComments: Joi.boolean()
      .optional()
  }),

  query: Joi.object({
    page: Joi.number()
      .integer()
      .min(1)
      .optional()
      .default(1)
      .messages({
        'number.base': 'Page must be a number',
        'number.integer': 'Page must be an integer',
        'number.min': 'Page must be at least 1'
      }),
    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .optional()
      .default(10)
      .messages({
        'number.base': 'Limit must be a number',
        'number.integer': 'Limit must be an integer',
        'number.min': 'Limit must be at least 1',
        'number.max': 'Limit cannot exceed 100'
      }),
    category: Joi.string()
      .optional(),
    tag: Joi.string()
      .optional(),
    status: Joi.string()
      .valid('DRAFT', 'PUBLISHED', 'ARCHIVED')
      .optional(),
    featured: Joi.boolean()
      .optional(),
    search: Joi.string()
      .optional(),
    sortBy: Joi.string()
      .valid('created_at', 'publish_at', 'views', 'likes', 'title')
      .optional()
      .default('created_at'),
    sortOrder: Joi.string()
      .valid('asc', 'desc')
      .optional()
      .default('desc')
  })
};

// 评论相关验证模式
const commentSchemas = {
  create: Joi.object({
    content: Joi.string()
      .min(1)
      .max(1000)
      .required()
      .messages({
        'string.min': 'Comment content is required',
        'string.max': 'Comment cannot exceed 1000 characters',
        'any.required': 'Comment content is required'
      }),
    articleId: Joi.number()
      .integer()
      .positive()
      .required()
      .messages({
        'number.base': 'Article ID must be a number',
        'number.integer': 'Article ID must be an integer',
        'number.positive': 'Article ID must be positive',
        'any.required': 'Article ID is required'
      }),
    parentId: Joi.number()
      .integer()
      .positive()
      .optional()
      .messages({
        'number.base': 'Parent ID must be a number',
        'number.integer': 'Parent ID must be an integer',
        'number.positive': 'Parent ID must be positive'
      })
  }),

  update: Joi.object({
    content: Joi.string()
      .min(1)
      .max(1000)
      .required()
      .messages({
        'string.min': 'Comment content is required',
        'string.max': 'Comment cannot exceed 1000 characters',
        'any.required': 'Comment content is required'
      }),
    status: Joi.string()
      .valid('PENDING', 'APPROVED', 'REJECTED')
      .optional()
      .messages({
        'any.only': 'Status must be one of: PENDING, APPROVED, REJECTED'
      })
  })
};

// 分类相关验证模式
const categorySchemas = {
  create: Joi.object({
    name: Joi.string()
      .min(1)
      .max(50)
      .required()
      .messages({
        'string.min': 'Category name is required',
        'string.max': 'Category name cannot exceed 50 characters',
        'any.required': 'Category name is required'
      }),
    description: Joi.string()
      .max(200)
      .optional()
      .allow('')
      .messages({
        'string.max': 'Description cannot exceed 200 characters'
      }),
    cover: Joi.string()
      .uri()
      .optional()
      .allow('')
      .messages({
        'string.uri': 'Cover must be a valid URL'
      }),
    sort: Joi.number()
      .integer()
      .optional()
      .default(0)
      .messages({
        'number.base': 'Sort must be a number',
        'number.integer': 'Sort must be an integer'
      })
  }),

  update: Joi.object({
    name: Joi.string()
      .min(1)
      .max(50)
      .optional()
      .messages({
        'string.min': 'Category name cannot be empty',
        'string.max': 'Category name cannot exceed 50 characters'
      }),
    description: Joi.string()
      .max(200)
      .optional()
      .allow('')
      .messages({
        'string.max': 'Description cannot exceed 200 characters'
      }),
    cover: Joi.string()
      .uri()
      .optional()
      .allow('')
      .messages({
        'string.uri': 'Cover must be a valid URL'
      }),
    sort: Joi.number()
      .integer()
      .optional()
      .messages({
        'number.base': 'Sort must be a number',
        'number.integer': 'Sort must be an integer'
      })
  })
};

// 标签相关验证模式
const tagSchemas = {
  create: Joi.object({
    name: Joi.string()
      .min(1)
      .max(30)
      .required()
      .messages({
        'string.min': 'Tag name is required',
        'string.max': 'Tag name cannot exceed 30 characters',
        'any.required': 'Tag name is required'
      }),
    color: Joi.string()
      .pattern(new RegExp('^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})))
      .optional()
      .default('#6366f1')
      .messages({
        'string.pattern.base': 'Color must be a valid hex color code'
      })
  }),

  update: Joi.object({
    name: Joi.string()
      .min(1)
      .max(30)
      .optional()
      .messages({
        'string.min': 'Tag name cannot be empty',
        'string.max': 'Tag name cannot exceed 30 characters'
      }),
    color: Joi.string()
      .pattern(new RegExp('^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})))
      .optional()
      .messages({
        'string.pattern.base': 'Color must be a valid hex color code'
      })
  })
};

// 通用参数验证模式
const paramSchemas = {
  id: Joi.object({
    id: Joi.number()
      .integer()
      .positive()
      .required()
      .messages({
        'number.base': 'ID must be a number',
        'number.integer': 'ID must be an integer',
        'number.positive': 'ID must be positive',
        'any.required': 'ID is required'
      })
  }),

  slug: Joi.object({
    slug: Joi.string()
      .pattern(new RegExp('^[a-z0-9-]+))
      .required()
      .messages({
        'string.pattern.base': 'Slug can only contain lowercase letters, numbers, and hyphens',
        'any.required': 'Slug is required'
      })
  })
};

module.exports = {
  validate,
  userSchemas,
  articleSchemas,
  commentSchemas,
  categorySchemas,
  tagSchemas,
  paramSchemas
};
