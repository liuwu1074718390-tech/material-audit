# 📦 Netlify 拖拽部署指南

## ⚠️ 重要提示

**Nuxt 3 项目使用拖拽部署有重要限制：**

1. ❌ **不能直接上传源代码文件夹** - Netlify 需要构建环境来生成服务器端功能
2. ✅ **可以上传构建后的文件夹** - 但需要先本地构建
3. ⚠️ **拖拽部署不支持自动构建** - API 路由和 SSR 功能可能无法正常工作

**推荐方式：使用 Git 集成部署**（见 `docs/NETLIFY_DEPLOYMENT.md`）

---

## 🎯 方式一：拖拽部署（仅静态文件）

### 步骤 1: 本地构建项目

在项目目录执行：

```bash
# 1. 安装依赖（如果还没安装）
npm install

# 2. 修改 nuxt.config.ts 以支持 Netlify
# 需要在 nitro 配置中添加 preset: 'netlify'
# （见下方配置说明）

# 3. 构建项目
npm run build

# 4. 构建完成后，.output 目录会生成构建文件
```

### 步骤 2: 准备上传文件

拖拽部署需要上传 `.output/public` 目录和 `.netlify` 目录（如果存在）。

但是，**Nuxt 3 的服务器端功能需要 Netlify Functions**，这些在拖拽部署中**无法正常工作**。

### 步骤 3: 在 Netlify 上拖拽部署

1. 访问 **https://app.netlify.com/drop**
2. 将 `.output/public` 文件夹拖到页面上
3. 等待上传完成
4. Netlify 会自动发布

**⚠️ 限制**：
- ❌ API 路由（`/api/*`）无法工作
- ❌ 服务器端渲染（SSR）可能有问题
- ❌ 服务器端环境变量可能无法使用

---

## ✅ 方式二：Git 集成部署（推荐）

这是**最佳方式**，支持完整的 Nuxt 3 功能。

### 优点

- ✅ 自动构建和部署
- ✅ 支持 API 路由（Netlify Functions）
- ✅ 支持服务器端渲染（SSR）
- ✅ 支持环境变量
- ✅ 自动部署（Git push 即部署）

### 步骤

详见：`docs/NETLIFY_DEPLOYMENT.md`

1. 连接 GitHub 仓库
2. Netlify 会自动检测 `netlify.toml` 配置
3. 配置环境变量
4. 自动部署

---

## ⚙️ 配置 Netlify preset（必需）

如果要部署到 Netlify，需要修改 `nuxt.config.ts`：

```typescript
export default defineNuxtConfig({
  // ... 其他配置
  
  nitro: {
    // 添加 Netlify preset（如果部署到 Netlify）
    preset: 'netlify',  // 或者 'netlify-edge'
    
    routeRules: {
      '/api/**': { 
        cors: true,
        headers: { 'cache-control': 'no-store' }
      },
      '/_nuxt/**': { 
        headers: { 'cache-control': 'public, max-age=31536000, immutable' } 
      }
    }
  }
})
```

**注意**：当前配置是为 Vercel 优化的。如果要同时支持 Vercel 和 Netlify，可以根据环境变量切换：

```typescript
nitro: {
  preset: process.env.NETLIFY ? 'netlify' : undefined,
  // ...
}
```

---

## 📋 项目当前状态

### ✅ 已有配置

- ✅ `netlify.toml` - Netlify 构建配置
- ✅ 构建命令和发布目录已配置

### ⚠️ 需要修改

- ⚠️ `nuxt.config.ts` - 当前没有 `preset: 'netlify'`，需要添加才能支持 Netlify Functions

---

## 🚀 推荐操作

### 如果要部署到 Netlify：

1. **使用 Git 集成部署**（推荐）
   - 项目已有完整的 Netlify 配置
   - 按照 `docs/NETLIFY_DEPLOYMENT.md` 操作即可

2. **如果要拖拽部署**：
   - 先修改 `nuxt.config.ts` 添加 `preset: 'netlify'`
   - 本地执行 `npm run build`
   - 上传 `.output` 目录（但这仍然无法完全支持服务器端功能）

---

## 💡 总结

| 部署方式 | API 路由 | SSR | 环境变量 | 推荐度 |
|---------|---------|-----|---------|--------|
| Git 集成 | ✅ | ✅ | ✅ | ⭐⭐⭐⭐⭐ |
| 拖拽部署 | ❌ | ⚠️ | ❌ | ⭐ |

**建议**：使用 Git 集成部署，这是 Netlify 推荐的方式，也是唯一能完整支持 Nuxt 3 所有功能的部署方式。




