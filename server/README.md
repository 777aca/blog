# 1. 配置数据库 URL

# 编辑 .env 文件

# 2. 生成 Prisma 客户端

npm run db:generate

# 3. 推送数据库结构(开发环境)

npm run db:push

# 4. 启动开发服务器

npm run dev

```

## API接口文档

### 认证接口
- POST `/api/auth/register` - 用户注册
- POST `/api/auth/login` - 用户登录
- GET `/api/auth/profile` - 获取用户信息

### 文章接口
- GET `/api/articles` - 获取文章列表
- GET `/api/articles/:slug` - 根据slug获取文章详情
- POST `/api/articles` - 创建文章(需认证)
- PUT `/api/articles/:id` - 更新文章(需认证)
- DELETE `/api/articles/:id` - 删除文章(需认证)

这个博客API系统具备了完整的用户认证、文章管理、评论系统等功能，使用了现代化的技术栈，代码结构清晰，易于维护和扩展。
```
