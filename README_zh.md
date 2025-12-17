# Mori Tags - AI 绘画标签管理器

[English](README.md) | [中文](README_zh.md)

这是一个现代化的、基于玻璃拟态风格的 AI 标签管理工具，使用 Remix、Cloudflare Pages 和 D1 Database 构建。

## ✨ 功能特点

- **标签管理**：浏览和选择 AI 绘画标签（支持中英文对照）。
- **Prompt 构建器**：选择标签以构建 Prompt，支持一键复制和清空。
- **智能搜索/筛选**：高效的标签筛选，支持客户端分页优化。
- **收藏夹**：保存常用的标签组合，支持预览图。
  - **访客模式**：未登录时自动保存到浏览器本地存储。
  - **云端同步**：登录后支持云端保存。
- **用户系统**：管理员认证和账户管理（支持修改用户名/密码）。
- **响应式设计**：适配移动端的布局，拥有精美的粉色玻璃拟态主题。

## 🛠️ 技术栈

- **框架**: [Remix](https://remix.run) (Vite)
- **部署**: Cloudflare Pages
- **数据库**: Cloudflare D1 (SQLite)
- **样式**: 原生 CSS + 玻璃拟态 (Glassmorphism)

---

## 🚀 生产环境部署指南

要将应用程序部署到互联网，请按照以下步骤操作：

### 1. 准备工作
- 一个 [Cloudflare](https://dash.cloudflare.com/) 账户。
- 本地安装了 `npm`。

### 2. 登录 Cloudflare
在项目文件夹中打开终端并登录：
```bash
npx wrangler login
```

### 3. 创建远程数据库
在 Cloudflare 上创建一个 D1 数据库：
```bash
npx wrangler d1 create mori-tags-db
```
*请记下此命令输出的 `database_id`。*

### 4. 更新配置
打开 `wrangler.toml`，用你的 **新 database_id** 更新 `[[d1_databases]]` 部分：
```toml
[[d1_databases]]
binding = "DB"
database_name = "mori-tags-db"
database_id = "YOUR-GENERATED-ID-HERE" 
```

### 5. 部署 Schema 和数据
使用 Schema 初始化远程数据库：
```bash
npx wrangler d1 execute DB --remote --file=./schema.sql
```
*(可选) 如果有迁移文件，可以导入初始数据：*
```bash
npx wrangler d1 execute DB --remote --file=./seed.sql
```

### 6. 部署应用
构建并将网站部署到 Cloudflare Pages：
```bash
npm run deploy
```
部署完成后，你会获得一个访问链接（例如 `https://mori-tags.pages.dev`）。

### 7.首次登录
访问你的在线网站。使用用户名 `admin` 登录。
*   如果是第一个用户，系统将自动创建账户。
*   你输入的密码将直接成为管理员密码。
*   稍后可以去 **设置** (点击右上角用户名) 修改密码。

---

## 💻 本地开发

1. **安装依赖**
   ```bash
   npm install
   ```

2. **本地数据库设置**
   ```bash
   npx wrangler d1 execute DB --local --file=./schema.sql
   # 导入数据
   # npx wrangler d1 execute DB --local --file=./seed.sql
   ```

3. **运行开发服务器**
   ```bash
   npm run dev
   ```
