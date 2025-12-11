# Cloud Studio 部署指南

本指南将帮助你快速将材价审计系统部署到 Cloud Studio。

## 📋 部署前准备

### 1. 环境要求
- Node.js >= 20.19.0
- npm >= 9.0.0
- MySQL 数据库（可选，用于数据持久化）

### 2. 必需的环境变量
```env
# Dify API配置
DIFY_API_KEY=你的Dify API密钥
DIFY_API_URL=https://api.dify.ai/v1/workflows/run
DIFY_WORKFLOW_ID=你的工作流ID

# 数据库配置（如需数据持久化）
DB_HOST=数据库地址
DB_PORT=3306
DB_USER=数据库用户名
DB_PASSWORD=数据库密码
DB_NAME=material_audit
```

## 🚀 部署步骤

### 步骤 1: 连接 Cloud Studio

1. 在 IDE 顶部菜单栏找到 **集成（Integration）** 菜单
2. 点击 **Cloud Studio** 选项
3. 按照提示完成授权和登录

### 步骤 2: 配置环境变量

在 Cloud Studio 部署界面配置以下环境变量：

```
DIFY_API_KEY=你的实际API密钥
DIFY_API_URL=https://api.dify.ai/v1/workflows/run
DIFY_WORKFLOW_ID=你的实际工作流ID
DB_HOST=你的数据库地址
DB_PORT=3306
DB_USER=你的数据库用户名
DB_PASSWORD=你的数据库密码
DB_NAME=material_audit
```

### 步骤 3: 初始化数据库（可选）

如果需要数据持久化功能，请先创建数据库表：

```bash
# 连接到你的MySQL数据库
mysql -h 你的数据库地址 -u 用户名 -p

# 创建数据库
CREATE DATABASE IF NOT EXISTS material_audit DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 使用数据库
USE material_audit;

# 执行建表脚本
source init-tables.sql;
```

或者直接执行 `init-tables.sql` 文件中的 SQL 语句。

### 步骤 4: 部署项目

1. Cloud Studio 会自动检测 `package.json` 
2. 执行安装和构建命令：
   ```bash
   npm install
   npm run build
   ```
3. 启动服务：
   ```bash
   npm run preview
   ```

### 步骤 5: 验证部署

部署成功后：
1. 访问 Cloud Studio 提供的访问地址
2. 测试上传 Excel 文件功能
3. 检查 Dify API 是否正常调用
4. 验证数据库连接（如果配置了数据库）

## 🔧 构建配置

项目已配置为通用部署模式，支持多种云平台：

### package.json 构建脚本
```json
{
  "scripts": {
    "build": "nuxt build",
    "preview": "nuxt preview"
  }
}
```

### Nuxt 配置
- SSR 模式（Server-Side Rendering）
- Nitro 服务器引擎
- 自动适配云平台环境

## 📊 性能优化

### 1. 静态资源缓存
项目已配置静态资源长期缓存策略：
```javascript
'/_nuxt/**': { 
  headers: { 'cache-control': 'public, max-age=31536000, immutable' } 
}
```

### 2. API 路由优化
API 路由禁用缓存，确保数据实时性：
```javascript
'/api/**': { 
  cors: true,
  headers: { 'cache-control': 'no-store' }
}
```

## 🐛 常见问题

### 1. 部署失败：Node.js 版本不匹配
**解决方案**：
- 确保 Cloud Studio 环境使用 Node.js >= 20.19.0
- 检查 `package.json` 中的 engines 配置

### 2. 数据库连接失败
**解决方案**：
- 检查数据库地址是否可从 Cloud Studio 访问
- 验证数据库用户名和密码
- 确认数据库端口（默认 3306）是否开放
- 检查防火墙规则

### 3. Dify API 调用失败
**解决方案**：
- 验证 `DIFY_API_KEY` 是否正确
- 确认 `DIFY_WORKFLOW_ID` 是否有效
- 检查工作流是否已发布
- 查看 API 调用日志

### 4. Excel 文件上传失败
**解决方案**：
- 检查文件大小限制（建议 < 10MB）
- 确认文件格式为 .xls 或 .xlsx
- 验证服务器临时目录权限

### 5. 静态资源加载失败
**解决方案**：
- 检查 `NUXT_PUBLIC_API_BASE` 环境变量
- 验证 CDN 配置（如果使用）
- 清除浏览器缓存

## 📝 部署后检查清单

- [ ] 网站可正常访问
- [ ] 首页加载正常，无控制台错误
- [ ] Excel 文件上传功能正常
- [ ] Dify API 调用成功
- [ ] 审计结果显示正常
- [ ] 筛选功能工作正常
- [ ] 导出 Excel 功能正常
- [ ] 数据库连接正常（如果配置）
- [ ] 响应式设计在移动端正常

## 🔒 安全建议

1. **环境变量安全**
   - 不要在代码中硬编码敏感信息
   - 使用 Cloud Studio 的环境变量管理功能
   - 定期更换 API 密钥

2. **数据库安全**
   - 使用强密码
   - 限制数据库访问 IP
   - 定期备份数据

3. **API 安全**
   - 实施请求频率限制
   - 验证上传文件类型和大小
   - 添加 CORS 策略

## 📞 获取帮助

如遇到部署问题：
1. 查看 Cloud Studio 部署日志
2. 检查服务器错误日志
3. 参考 [项目文档](README.md)
4. 查看 [快速开始指南](QUICKSTART.md)

## 🎉 部署成功

恭喜！你的材价审计系统已成功部署到 Cloud Studio。

现在你可以：
- 分享访问链接给团队成员
- 上传材料清单进行审计
- 查看和导出审计结果
- 配置数据库实现数据持久化

---

**提示**：首次部署建议先在测试环境验证功能，确认无误后再用于生产环境。
