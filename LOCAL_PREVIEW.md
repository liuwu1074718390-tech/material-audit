# 本地预览系统指南

## 🚀 快速开始

### 1. 检查 Node.js 版本

```bash
node --version
# 应该是 >= 20.19.0
```

如果版本不对，请先安装或升级 Node.js。

### 2. 安装依赖

```bash
npm install --legacy-peer-deps
```

### 3. 配置环境变量

创建 `.env` 文件（如果还没有）：

```bash
# 复制示例文件
cp .env.example .env
```

编辑 `.env` 文件，填入你的配置：

```env
# Dify API 配置
DIFY_API_KEY=你的API密钥
DIFY_API_URL=你的API地址
DIFY_WORKFLOW_ID=你的工作流ID

# 数据库配置
DB_HOST=你的数据库地址
DB_PORT=3306
DB_USER=你的数据库用户名
DB_PASSWORD=你的数据库密码
DB_NAME=你的数据库名称
```

### 4. 启动开发服务器

```bash
npm run dev
```

服务器会在 `http://localhost:3000` 启动。

## 📋 详细步骤

### 步骤 1: 环境准备

确保你的本地环境满足要求：

- **Node.js**: >= 20.19.0
- **npm**: >= 9.0.0
- **数据库**: MySQL（如果需要）

### 步骤 2: 安装依赖

```bash
# 进入项目目录
cd /Users/liuwu/Desktop/材价审计

# 安装依赖
npm install --legacy-peer-deps
```

### 步骤 3: 配置环境变量

创建 `.env` 文件：

```bash
# 如果已有 .env.example，可以复制
cp .env.example .env

# 然后编辑 .env 文件
# 在 macOS 上可以使用：
open -e .env
# 或者在 Linux 上使用：
nano .env
```

**必需的环境变量**：

```env
# Dify API 配置（必需）
DIFY_API_KEY=app-CaJJxI5P0DrvwNXAhABB37M6
DIFY_API_URL=http://192.168.1.42/v1/workflows/run
DIFY_WORKFLOW_ID=6495412f-cb02-4702-a1e4-5471a37919c7

# 数据库配置（必需）
DB_HOST=gz-cdb-gaxrunxl.sql.tencentcdb.com
DB_PORT=28544
DB_USER=root
DB_PASSWORD=Lw05044918
DB_NAME=myapp
```

### 步骤 4: 启动开发服务器

```bash
npm run dev
```

你会看到类似这样的输出：

```
  ➜  Local:   http://localhost:3000/
  ➜  Network: http://192.168.x.x:3000/
```

### 步骤 5: 访问系统

在浏览器中打开：`http://localhost:3000`

## 🔧 常见问题

### 问题 1: 端口被占用

如果 3000 端口被占用，Nuxt 会自动使用下一个可用端口（3001, 3002...）

或者手动指定端口：

```bash
PORT=3001 npm run dev
```

### 问题 2: 依赖安装失败

```bash
# 清理并重新安装
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### 问题 3: 数据库连接失败

1. 检查数据库是否运行
2. 检查 `.env` 文件中的数据库配置是否正确
3. 检查网络连接（如果是远程数据库）

### 问题 4: Dify API 连接失败

1. 检查 `.env` 文件中的 Dify 配置
2. 检查 Dify API 地址是否可访问
3. 如果是内网地址（如 192.168.x.x），确保本地可以访问

## 🎯 开发模式 vs 生产模式

### 开发模式（推荐）

```bash
npm run dev
```

- ✅ 热重载（修改代码自动刷新）
- ✅ 详细的错误信息
- ✅ 开发工具支持
- ⚠️ 性能较慢

### 生产模式预览

```bash
# 1. 构建项目
npm run build

# 2. 预览构建结果
npm run preview
```

- ✅ 接近生产环境的性能
- ✅ 可以测试构建后的效果
- ⚠️ 需要先构建

## 📝 开发提示

1. **修改代码后自动刷新**：开发模式下，修改代码会自动刷新浏览器
2. **查看控制台**：打开浏览器开发者工具查看日志和错误
3. **API 调试**：可以在 `server/api/` 目录下添加 `console.log` 来调试
4. **数据库查询**：可以在 `server/utils/db.ts` 中查看数据库操作

## 🚀 下一步

- 查看 `README.md` 了解项目结构
- 查看 `docs/` 目录下的文档
- 查看 `pages/` 目录了解页面结构
- 查看 `components/` 目录了解组件

---

**提示**：如果遇到问题，请查看浏览器控制台和终端输出的错误信息。

