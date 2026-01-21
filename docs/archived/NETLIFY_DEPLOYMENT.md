# Netlify 部署指南

本指南将详细说明如何在 Netlify 上使用 GitHub 创建和部署材价审计系统项目。

## 📋 前置要求

1. **GitHub 账户**：确保你的代码已经推送到 GitHub
2. **Netlify 账户**：如果没有，访问 [netlify.com](https://www.netlify.com) 注册（可以使用 GitHub 账户直接登录）
3. **项目仓库**：确保项目已在 GitHub 上（例如：`https://github.com/liuwu1074718390-tech/material-audit`）

## 🚀 步骤一：登录 Netlify 并连接 GitHub

### 1.1 访问 Netlify

1. 打开浏览器，访问：**https://app.netlify.com**
2. 点击右上角的 **"Sign up"** 或 **"Log in"**

### 1.2 使用 GitHub 登录（推荐）

1. 在登录页面，点击 **"Continue with GitHub"** 按钮
2. 授权 Netlify 访问你的 GitHub 账户
3. 完成登录后，进入 Netlify 控制台

## 🔗 步骤二：从 GitHub 导入项目

### 2.1 添加新站点

1. 在 Netlify 控制台首页，点击 **"Add new site"** 按钮
2. 选择 **"Import an existing project"**

### 2.2 连接 GitHub

1. 在 "Import from Git" 页面，点击 **"GitHub"** 图标
2. 如果是第一次连接，会提示授权 Netlify 访问 GitHub
3. 点击 **"Authorize Netlify"** 完成授权

### 2.3 选择仓库

1. 在仓库列表中，找到并选择你的项目：**`material-audit`**
2. 如果看不到仓库，点击 **"Configure the Netlify app on GitHub"** 进行配置
3. 选择要连接的仓库（可以选择所有仓库或特定仓库）

## ⚙️ 步骤三：配置构建设置

### 3.1 基本构建设置

在 "Site settings" 页面，配置以下信息：

#### **Branch to deploy（部署分支）**
- 选择：`main`（或你的主分支名称）

#### **Base directory（基础目录）**
- 留空（如果项目在仓库根目录）

#### **Build command（构建命令）**
```
npm run build
```

#### **Publish directory（发布目录）**
```
.output/public
```

> ⚠️ **重要**：Nuxt 3 项目需要特殊配置，见下方详细说明

### 3.2 Nuxt 3 特殊配置

由于这是 Nuxt 3 项目，需要特殊配置：

#### ✅ 已包含的配置

项目已包含 `netlify.toml` 配置文件，包含以下配置：

```toml
[build]
  command = "npm run build"
  publish = ".output/public"

[build.environment]
  NODE_VERSION = "18"
  NPM_FLAGS = "--legacy-peer-deps"
```

#### ⚙️ Nuxt 配置

`nuxt.config.ts` 中已配置 Netlify preset：

```typescript
nitro: {
  preset: 'netlify',  // 自动生成 Netlify Functions
  routeRules: {
    '/api/**': { cors: true }
  }
}
```

**重要**：Nitro 会自动处理 Netlify Functions，不需要手动配置重定向规则。

### 3.3 高级构建设置（可选）

如果需要自定义 Node.js 版本：

1. 在构建设置中，点击 **"Show advanced"**
2. 在 "Environment variables" 部分，可以添加：
   - `NODE_VERSION`: `18`（或更高版本）

## 🔐 步骤四：配置环境变量

### 4.1 添加环境变量

1. 在站点设置页面，点击左侧菜单的 **"Environment variables"**
2. 点击 **"Add a variable"** 按钮
3. 添加以下必需的环境变量：

#### **必需的环境变量**

```
DIFY_API_KEY=你的Dify_API密钥
DIFY_API_URL=https://api.dify.ai/v1/workflows/run
DIFY_WORKFLOW_ID=你的工作流ID
```

#### **数据库配置（如果使用）**

```
DB_HOST=你的数据库地址
DB_PORT=3306
DB_USER=你的数据库用户名
DB_PASSWORD=你的数据库密码
DB_NAME=你的数据库名称
```

#### **其他配置（可选）**

```
NUXT_PUBLIC_API_BASE=/api
NODE_ENV=production
```

### 4.2 环境变量作用域

- **All scopes**：所有环境（生产、预览、分支部署）
- **Production**：仅生产环境
- **Deploy previews**：仅预览部署
- **Branch deploys**：仅分支部署

建议：敏感信息（如 API 密钥）设置为 **Production only**

## 🚀 步骤五：部署项目

### 5.1 首次部署

1. 配置完成后，点击 **"Deploy site"** 按钮
2. Netlify 会自动：
   - 克隆 GitHub 仓库
   - 安装依赖（`npm install`）
   - 执行构建命令（`npm run build`）
   - 部署到 CDN

### 5.2 查看部署日志

1. 在部署过程中，可以点击部署项查看实时日志
2. 如果构建失败，检查日志中的错误信息
3. 常见问题：
   - **依赖安装失败**：检查 `package.json` 是否正确
   - **构建失败**：检查环境变量是否配置完整
   - **Node 版本不匹配**：在环境变量中设置 `NODE_VERSION`

### 5.3 部署成功

部署成功后，你会看到：
- ✅ 绿色的 "Published" 状态
- 🌐 一个自动生成的域名（例如：`random-name-123.netlify.app`）

## 🎨 步骤六：自定义域名（可选）

### 6.1 添加自定义域名

1. 在站点设置中，点击 **"Domain settings"**
2. 点击 **"Add custom domain"**
3. 输入你的域名（例如：`audit.yourdomain.com`）
4. 按照提示配置 DNS 记录

### 6.2 DNS 配置

根据 Netlify 提供的 DNS 记录，在你的域名服务商处配置：
- **A 记录** 或 **CNAME 记录**
- 等待 DNS 生效（通常几分钟到几小时）

## 🔄 步骤七：自动部署配置

### 7.1 自动部署已启用

默认情况下，Netlify 会在以下情况自动部署：
- ✅ 推送到 `main` 分支
- ✅ 创建 Pull Request
- ✅ 合并 Pull Request

### 7.2 部署通知

1. 在站点设置中，点击 **"Build & deploy"**
2. 在 "Deploy notifications" 部分，可以配置：
   - **Email notifications**：邮件通知
   - **Slack notifications**：Slack 通知
   - **GitHub notifications**：GitHub 通知

## 📝 步骤八：创建 netlify.toml 文件（推荐）

为了更好的配置管理，建议在项目根目录创建 `netlify.toml` 文件：

```toml
[build]
  command = "npm run build"
  publish = ".output/public"

[build.environment]
  NODE_VERSION = "18"
  NPM_FLAGS = "--legacy-peer-deps"

# Nuxt 3 需要服务器端渲染支持
[[redirects]]
  from = "/*"
  to = "/.netlify/functions/server"
  status = 200

# 静态资源缓存
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

# API 路由
[[headers]]
  for = "/api/*"
  [headers.values]
    Access-Control-Allow-Origin = "*"
    Access-Control-Allow-Methods = "GET, POST, PUT, DELETE, OPTIONS"
    Access-Control-Allow-Headers = "Content-Type, Authorization"
```

## ⚠️ 注意事项

### 1. Nuxt 3 服务器端功能

⚠️ **重要**：Netlify 的免费计划对服务器端功能有限制：
- 函数执行时间限制：10 秒（免费计划）
- 函数调用次数限制：125,000 次/月（免费计划）

如果你的项目需要长时间运行的服务器端任务（如审计处理），建议：
- 使用 Netlify Functions 处理 API 请求
- 或者考虑使用其他平台（如 Vercel、Railway、Render）

### 2. 数据库连接

如果使用外部数据库（如腾讯云 MySQL）：
- ✅ 确保数据库允许外部 IP 访问
- ✅ 在 Netlify 环境变量中配置数据库连接信息
- ⚠️ 注意数据库连接池配置，避免连接数过多

### 3. 文件上传限制

Netlify 对文件上传有限制：
- 函数请求体大小：6MB（免费计划）
- 如果需要上传大文件，考虑使用：
  - Netlify Large Media
  - 或直接上传到云存储（如 AWS S3、腾讯云 COS）

### 4. 环境变量安全

- 🔒 不要在代码中硬编码敏感信息
- 🔒 使用 Netlify 的环境变量功能
- 🔒 定期轮换 API 密钥和密码

## 🔧 故障排查

### 问题1：Initializing 失败

**症状**：部署日志显示 "Initializing failed" 或初始化阶段失败

**可能原因和解决方案**：

#### 原因1：Node.js 版本不匹配
**解决方案**：
1. 在 Netlify 站点设置中，进入 **"Environment variables"**
2. 添加环境变量：`NODE_VERSION = 18`
3. 或者在 `netlify.toml` 中已配置（已包含）

#### 原因2：Nuxt 3 适配器未配置
**解决方案**：
1. 确保 `nuxt.config.ts` 中包含 `nitro.preset = 'netlify'`（已修复）
2. 重新提交代码并部署

#### 原因3：依赖安装失败
**解决方案**：
1. 检查 `package.json` 中的依赖是否正确
2. 在 Netlify 环境变量中添加：`NPM_FLAGS = "--legacy-peer-deps"`
3. 清除构建缓存：在 Netlify 站点设置 → **"Build & deploy"** → **"Clear cache and retry deploy"**

#### 原因4：构建命令错误
**解决方案**：
1. 确认构建命令为：`npm run build`
2. 确认发布目录为：`.output/public`
3. 检查 `netlify.toml` 配置是否正确

#### 原因5：缺少必需文件
**解决方案**：
1. 确保 `netlify.toml` 文件在项目根目录
2. 确保 `package.json` 存在且格式正确
3. 确保 `.gitignore` 没有排除必需文件

### 问题2：构建失败

**症状**：部署时显示 "Build failed"

**解决方案**：
1. 查看构建日志，找到错误信息
2. 检查 `package.json` 中的依赖是否正确
3. 确保 Node.js 版本兼容（建议 18+）
4. 检查环境变量是否配置完整
5. 尝试本地构建测试：`npm run build`

### 问题2：页面显示 404

**症状**：访问站点显示 404 Not Found

**解决方案**：
1. 检查 `publish directory` 是否正确（应该是 `.output/public`）
2. 确保 `netlify.toml` 中的重定向规则正确
3. 检查 Nuxt 路由配置

### 问题3：API 路由不工作

**症状**：API 请求返回 404 或错误

**解决方案**：
1. 确保 `server/api/` 目录下的文件正确
2. 检查 Netlify Functions 配置
3. 查看函数日志排查错误

### 问题4：环境变量未生效

**症状**：代码中读取不到环境变量

**解决方案**：
1. 确保环境变量名称正确（区分大小写）
2. 检查环境变量作用域设置
3. 重新部署站点使环境变量生效

## 📚 参考资源

- [Netlify 官方文档](https://docs.netlify.com/)
- [Nuxt 3 部署指南](https://nuxt.com/docs/getting-started/deployment)
- [Netlify Functions 文档](https://docs.netlify.com/functions/overview/)
- [环境变量配置](https://docs.netlify.com/environment-variables/overview/)

## 🎉 完成！

部署成功后，你的站点将：
- ✅ 自动从 GitHub 部署
- ✅ 拥有 HTTPS 证书（自动配置）
- ✅ 全球 CDN 加速
- ✅ 支持自定义域名

访问你的站点，开始使用材价审计系统！

---

**需要帮助？** 查看 [Netlify 社区论坛](https://answers.netlify.com/) 或提交 Issue。

