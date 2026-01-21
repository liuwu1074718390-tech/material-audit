# 🚀 多平台部署指南

## ✅ 好消息：不需要复制项目！

同一个项目可以同时部署到 **Vercel** 和 **Netlify**，无需复制或修改代码。

## 🎯 部署方式

### 方式一：Git 集成部署（推荐）

#### 优势
- ✅ **同一个仓库**，同时部署到两个平台
- ✅ **自动部署** - Git push 即部署
- ✅ **无需修改代码** - 配置自动切换
- ✅ **统一管理** - 代码在一个地方

#### Vercel 部署
1. 连接 GitHub 仓库：https://vercel.com
2. 导入项目
3. 配置环境变量
4. 自动部署 ✅

#### Netlify 部署
1. 连接 GitHub 仓库：https://app.netlify.com
2. 导入项目
3. 配置环境变量
4. 自动部署 ✅

**两个平台可以同时运行，互不影响！**

---

## ⚙️ 配置说明

### 自动切换机制

项目已配置为根据环境自动切换：

- **Vercel 部署**：
  - 自动检测，不需要 `preset`
  - 使用默认的 Nitro 配置

- **Netlify 部署**：
  - 通过 `netlify.toml` 设置 `NETLIFY=1`
  - 自动使用 `preset: 'netlify'`
  - 生成 Netlify Functions

### 配置文件

#### `nuxt.config.ts`
```typescript
nitro: {
  // 根据环境变量自动切换
  preset: process.env.NETLIFY ? 'netlify' : undefined,
  // ...
}
```

#### `netlify.toml`
```toml
[build.environment]
  NETLIFY = "1"  # 告诉 Nuxt 使用 Netlify preset
```

---

## 📋 部署步骤

### Vercel 部署（已有）

你已经部署到 Vercel 了：
- ✅ 项目已连接
- ✅ 环境变量已配置
- ✅ 正常运行中

### Netlify 部署（新增）

#### 步骤 1: 登录 Netlify

1. 访问：https://app.netlify.com
2. 使用 GitHub 账号登录

#### 步骤 2: 导入项目

1. 点击 **"Add new site"** → **"Import an existing project"**
2. 选择 **"GitHub"**
3. 授权 Netlify 访问 GitHub
4. 选择你的仓库：`material-audit`（或你的仓库名）

#### 步骤 3: 配置构建设置

Netlify 会自动检测 `netlify.toml` 文件，配置如下：

- **Branch to deploy**: `main`（或你的主分支）
- **Build command**: `npm run build`（自动检测）
- **Publish directory**: `.output/public`（自动检测）

#### 步骤 4: 配置环境变量

在 Netlify 控制台添加环境变量：

```
DIFY_API_KEY=你的密钥
DIFY_API_URL=你的地址
DB_HOST=gz-cdb-gaxrunxl.sql.tencentcdb.com
DB_PORT=28544
DB_USER=root
DB_PASSWORD=你的密码
DB_NAME=myapp
```

#### 步骤 5: 部署

1. 点击 **"Deploy site"**
2. 等待构建完成
3. 获得 Netlify 域名（如：`your-project.netlify.app`）

---

## 🔄 同时维护两个部署

### 好处

1. **冗余备份** - 一个平台故障，另一个可用
2. **测试对比** - 可以对比不同平台的性能
3. **灵活切换** - 随时可以切换主要使用的平台

### 工作流程

1. **本地开发**：
   ```bash
   npm run dev
   ```

2. **提交代码**：
   ```bash
   git add .
   git commit -m "更新功能"
   git push
   ```

3. **自动部署**：
   - ✅ Vercel 自动部署
   - ✅ Netlify 自动部署
   - 🎉 两个平台同时更新！

---

## ⚙️ 环境变量管理

### 方式一：分别在两个平台配置

- Vercel: 在 Vercel 控制台配置
- Netlify: 在 Netlify 控制台配置

### 方式二：使用环境变量文件（不推荐）

环境变量文件（`.env`）不应该提交到 Git，所以每个平台需要单独配置。

---

## 🎯 推荐方案

### 方案一：只部署到 Vercel（当前）

如果你只需要一个平台：
- ✅ 继续使用 Vercel
- ✅ 已经部署完成
- ✅ 运行正常

### 方案二：同时部署到两个平台（推荐）

如果你想有备用方案：
1. **主平台**：Vercel（当前使用）
2. **备用平台**：Netlify
3. 两个平台同时运行，DNS 指向主平台

### 方案三：切换平台

如果你想从 Vercel 切换到 Netlify：
1. 在 Netlify 部署
2. 测试确认正常
3. 更新 DNS 指向 Netlify
4. 保留 Vercel 作为备用

---

## 📝 注意事项

1. **环境变量**：需要在两个平台分别配置
2. **数据库连接**：确保数据库允许两个平台的 IP 访问
3. **域名**：每个平台都有自己的默认域名
4. **自定义域名**：可以绑定同一个域名到两个平台（但通常只指向一个）

---

## 🆘 常见问题

### Q: 两个平台会冲突吗？

A: 不会。它们完全独立运行，互不影响。

### Q: 需要修改代码吗？

A: 不需要。配置已经自动切换，代码无需修改。

### Q: 环境变量需要配置两遍吗？

A: 是的。需要在 Vercel 和 Netlify 分别配置环境变量。

### Q: 两个平台可以绑定同一个域名吗？

A: 技术上可以，但通常只指向一个平台，另一个作为备用。

---

## ✅ 总结

**不需要复制项目！**

- ✅ 同一个仓库可以部署到多个平台
- ✅ 配置自动切换，无需修改代码
- ✅ 可以同时运行，互不影响
- ✅ Git push 自动部署到所有平台

**推荐**：如果你只需要一个平台，继续使用 Vercel 即可。如果需要备用方案，可以添加 Netlify 部署。




