# Cloud Studio 快速部署指南

由于本地构建遇到环境问题，建议直接在 Cloud Studio 环境中进行构建和部署。

## 🚀 快速步骤

### 1. 准备代码
将项目代码上传到 Git 仓库（GitHub/GitLab/Gitee 等）

### 2. 在 Cloud Studio 中打开项目
- 访问 Cloud Studio 官网
- 从 Git 仓库导入项目
- 或直接上传项目文件夹

### 3. 在 Cloud Studio 终端执行以下命令

```bash
# 安装依赖
npm install --legacy-peer-deps

# 构建项目（增加内存限制）
NODE_OPTIONS="--max-old-space-size=4096" npm run build

# 启动服务
npm run preview
```

### 4. 配置环境变量

在 Cloud Studio 中创建 `.env` 文件：

```env
# Dify API配置
DIFY_API_KEY=app-CaJJxI5P0DrvwNXAhABB37M6
DIFY_API_URL=http://192.168.1.42/v1/workflows/run
DIFY_WORKFLOW_ID=6495412f-cb02-4702-a1e4-5471a37919c7

# 数据库配置
DB_HOST=gz-cdb-gaxrunxl.sql.tencentcdb.com
DB_PORT=28544
DB_USER=root
DB_PASSWORD=Lw05044918
DB_NAME=myapp
```

**注意**：如果 Dify API URL 使用的是内网地址（192.168.1.42），需要确保 Cloud Studio 环境可以访问该地址，或改用公网地址。

### 5. 启动服务

```bash
# 方式1：直接启动
npm run preview

# 方式2：使用 PM2（推荐生产环境）
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
```

### 6. 访问应用

Cloud Studio 会提供访问地址，格式类似：
- `https://your-workspace.cloudstudio.net`

## 🔧 构建配置说明

项目已优化配置：

### package.json
```json
{
  "scripts": {
    "build": "NODE_OPTIONS=--max-old-space-size=4096 nuxt build",
    "preview": "nuxt preview"
  }
}
```

### nuxt.config.ts
- 移除了 `@element-plus/nuxt` 模块（避免构建错误）
- 改为手动导入 Element Plus
- SSR 模式，适合服务端渲染

### plugins/element-plus.ts
```typescript
import ElementPlus from 'element-plus'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(ElementPlus)
})
```

## ❗ 已知问题和解决方案

### 问题1：Element Plus 导入错误
**错误信息**：`failed to find "ID_INJECTION_KEY"`  
**解决方案**：已移除 `@element-plus/nuxt` 模块，改为手动导入

### 问题2：内存溢出
**错误信息**：`JavaScript heap out of memory`  
**解决方案**：构建脚本中已添加 `NODE_OPTIONS=--max-old-space-size=4096`

### 问题3：Dify API 无法访问
**原因**：使用了内网地址 `192.168.1.42`  
**解决方案**：
- 方案A：配置 Cloud Studio 的网络访问内网
- 方案B：将 Dify 部署到公网，使用公网地址
- 方案C：在 Cloud Studio 中也部署 Dify

## 📦 项目依赖

已移除问题模块，当前依赖：

```json
{
  "dependencies": {
    "axios": "^1.6.5",
    "element-plus": "^2.8.4",
    "mysql2": "^3.15.3",
    "nuxt": "3.11.1",
    "vue": "^3.4.15",
    "vue-router": "^4.2.5",
    "xlsx": "^0.18.5"
  }
}
```

## 🎯 部署后测试

1. **首页访问**：打开应用，检查页面是否正常加载
2. **上传文件**：测试 Excel 文件上传功能
3. **Dify API**：检查 API 调用是否成功
4. **数据库连接**：验证数据库读写功能

## 📞 技术支持

如遇问题：
1. 查看 Cloud Studio 终端日志
2. 检查浏览器控制台错误
3. 验证环境变量配置
4. 确认网络访问权限

## 🎉 部署成功

部署成功后，你将看到：
- ✅ 应用正常访问
- ✅ Excel 上传和解析功能正常
- ✅ Dify AI 审计功能正常
- ✅ 数据库操作正常

---

**提示**：Cloud Studio 环境配置更统一，构建成功率更高，推荐使用！
