# 材价审计系统 - Vercel 自动化部署指南

## 🚀 快速开始

### 方式一：使用自动化脚本（推荐）

#### macOS/Linux 用户

```bash
# 1. 给脚本添加执行权限
chmod +x scripts/deploy-vercel.sh

# 2. 运行部署脚本
./scripts/deploy-vercel.sh
```

#### Windows 用户

```powershell
# 1. 以管理员身份运行 PowerShell
# 2. 设置执行策略（首次运行需要）
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# 3. 运行部署脚本
.\scripts\deploy-vercel.ps1
```

脚本会自动完成：
- ✅ 检查并安装 Vercel CLI
- ✅ 登录 Vercel 账号
- ✅ 检查项目配置
- ✅ 安装依赖
- ✅ 部署到 Vercel

---

### 方式二：通过 GitHub 自动部署（最推荐）

这是最简单、最自动化的方式，每次推送到 GitHub 都会自动部署。

#### 步骤 1: 将代码推送到 GitHub

```bash
# 如果还没有 Git 仓库
git init
git add .
git commit -m "准备部署到 Vercel"

# 在 GitHub 上创建新仓库，然后：
git remote add origin https://github.com/你的用户名/材价审计.git
git branch -M main
git push -u origin main
```

#### 步骤 2: 在 Vercel 导入项目

1. **访问 Vercel**
   - 打开 https://vercel.com
   - 使用 GitHub 账号登录（推荐）

2. **导入项目**
   - 点击 **"Add New..."** → **"Project"**
   - 选择你的 GitHub 仓库
   - 点击 **"Import"**

3. **配置项目**
   - **Framework Preset**: Nuxt.js（会自动检测）
   - **Root Directory**: `./`（默认）
   - **Build Command**: `npm run build`（自动填充）
   - **Output Directory**: `.output/public`（自动填充）
   - **Install Command**: `npm install`（自动填充）

4. **配置环境变量**
   - 点击 **"Environment Variables"**
   - 添加以下变量：

```env
# Dify API 配置（必需）
DIFY_API_KEY=你的Dify_API密钥
DIFY_API_URL=https://api.dify.ai/v1/workflows/run
DIFY_WORKFLOW_ID=你的工作流ID（可选）

# 数据库配置（如果使用）
DB_HOST=你的数据库地址
DB_PORT=3306
DB_USER=你的数据库用户名
DB_PASSWORD=你的数据库密码
DB_NAME=你的数据库名称

# 其他配置（可选）
NUXT_PUBLIC_API_BASE=/api
NODE_ENV=production
```

5. **部署**
   - 点击 **"Deploy"**
   - 等待 2-3 分钟
   - 部署完成后会获得一个链接：`https://your-project.vercel.app`

6. **设置自动部署**
   - ✅ 自动完成！每次推送代码到 GitHub，Vercel 会自动重新部署

---

### 方式三：使用 Vercel CLI 手动部署

#### 步骤 1: 安装 Vercel CLI

```bash
npm install -g vercel
```

#### 步骤 2: 登录 Vercel

```bash
vercel login
```

#### 步骤 3: 部署项目

```bash
# 首次部署（会提示配置项目）
vercel

# 生产环境部署
vercel --prod
```

#### 步骤 4: 配置环境变量

```bash
# 查看环境变量
vercel env ls

# 添加环境变量
vercel env add DIFY_API_KEY
vercel env add DIFY_API_URL
# ... 依次添加其他环境变量

# 添加后需要重新部署
vercel --prod
```

---

## 📋 环境变量配置

### 必需的环境变量

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `DIFY_API_KEY` | Dify API 密钥 | `app-xxxxxxxxxxxxxxxxxxxxxxxx` |
| `DIFY_API_URL` | Dify API 地址 | `https://api.dify.ai/v1/workflows/run` |

### 可选的环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `DIFY_WORKFLOW_ID` | Dify 工作流 ID | - |
| `DB_HOST` | 数据库地址 | - |
| `DB_PORT` | 数据库端口 | `3306` |
| `DB_USER` | 数据库用户名 | - |
| `DB_PASSWORD` | 数据库密码 | - |
| `DB_NAME` | 数据库名称 | - |
| `NUXT_PUBLIC_API_BASE` | API 基础路径 | `/api` |
| `NODE_ENV` | 环境模式 | `production` |

### 在 Vercel 控制台配置环境变量

1. 进入项目设置
2. 点击左侧菜单 **"Environment Variables"**
3. 点击 **"Add"** 添加变量
4. 选择环境范围（Production、Preview、Development）
5. 保存后，需要重新部署才能生效

---

## ⚙️ 项目配置说明

### vercel.json

项目已包含 `vercel.json` 配置文件，包含以下配置：

- **构建命令**: `npm run build`
- **框架**: Nuxt.js（自动检测）
- **输出目录**: `.output/public`
- **区域**: 香港（hkg1），可修改为其他区域
- **API 路由 CORS 配置**
- **静态资源缓存策略**

### nuxt.config.ts

Nuxt 配置已优化适配 Vercel：
- ✅ 自动检测 Vercel 环境
- ✅ API 路由 CORS 支持
- ✅ 静态资源缓存优化

---

## 🔧 常用命令

### 查看部署列表

```bash
vercel ls
```

### 查看部署详情

```bash
vercel inspect [deployment-url]
```

### 查看日志

```bash
vercel logs [deployment-url]
```

### 删除部署

```bash
vercel remove [deployment-url]
```

### 查看环境变量

```bash
vercel env ls
```

### 链接本地项目到 Vercel

```bash
vercel link
```

---

## 🌐 自定义域名

### 添加自定义域名

1. 在 Vercel 项目设置中，点击 **"Domains"**
2. 输入你的域名（如 `example.com`）
3. 按照提示配置 DNS 记录：
   - **CNAME**: `cname.vercel-dns.com`
   - 或 **A 记录**: Vercel 提供的 IP 地址
4. 等待 DNS 生效（通常几分钟）
5. Vercel 会自动配置 SSL 证书

### 配置子域名

```bash
# 在 Vercel 控制台添加域名时，直接输入子域名
www.example.com
api.example.com
```

---

## 📊 监控和分析

### Vercel Analytics

1. 在项目设置中启用 **"Analytics"**
2. 查看访问统计、性能指标等

### 实时日志

```bash
# 查看实时日志
vercel logs --follow
```

---

## 🔄 持续部署工作流

### GitHub Actions（可选）

如果需要在部署前运行测试，可以创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      # Vercel 会自动通过 GitHub 集成部署
```

---

## ❓ 常见问题

### 1. 部署失败：构建错误

**解决方案**：
- 检查 `package.json` 中的构建脚本
- 查看 Vercel 构建日志
- 确保所有依赖都已安装

### 2. 环境变量不生效

**解决方案**：
- 确认环境变量已添加到 Vercel 项目设置
- 添加环境变量后需要重新部署
- 检查环境变量名称是否正确

### 3. API 路由返回 404

**解决方案**：
- 确认 `nuxt.config.ts` 中的路由配置正确
- 检查 `vercel.json` 中的 rewrites 配置
- 查看服务器端日志

### 4. 数据库连接失败

**解决方案**：
- 确认数据库允许外部连接（Vercel 的 IP 地址）
- 检查数据库连接字符串是否正确
- 考虑使用云数据库服务（如 Vercel Postgres、PlanetScale 等）

### 5. 静态资源加载失败

**解决方案**：
- 确认静态资源路径正确
- 检查 `public` 目录中的文件
- 查看浏览器控制台的错误信息

---

## 🎯 最佳实践

1. **使用 GitHub 集成**
   - 每次推送代码自动部署
   - 代码审查和协作更方便

2. **环境变量管理**
   - 敏感信息使用环境变量，不要硬编码
   - 不同环境使用不同的环境变量

3. **性能优化**
   - 启用 Vercel Analytics 监控性能
   - 优化图片和静态资源
   - 使用 CDN 缓存

4. **安全配置**
   - 定期更新依赖
   - 使用强密码和 API 密钥
   - 启用 HTTPS（Vercel 自动提供）

---

## 📚 相关资源

- [Vercel 官方文档](https://vercel.com/docs)
- [Nuxt 3 部署指南](https://nuxt.com/docs/getting-started/deployment)
- [Vercel CLI 文档](https://vercel.com/docs/cli)

---

## 🆘 需要帮助？

如果遇到问题：
1. 查看 Vercel 部署日志
2. 检查项目 GitHub Issues
3. 访问 Vercel 社区论坛

