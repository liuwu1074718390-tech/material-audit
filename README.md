# 材价审计系统 - 部署包

## 📦 包含内容

纯净的生产环境部署文件，包含：
- ✅ 完整的源代码
- ✅ 配置文件
- ✅ 部署脚本
- ✅ 数据库初始化脚本
- ✅ 部署文档

## 🚀 快速部署

### 1. 环境要求
- Node.js >= 20.19.0
- npm >= 9.0.0
- MySQL 8.0+（如需数据库功能）

### 2. 安装依赖
```bash
npm install
```

### 3. 配置环境变量
```bash
cp .env.example .env
# 编辑 .env 文件，填入必要配置
```

必填配置：
```env
# Dify API配置（必填）
DIFY_API_KEY=app-xxxxxxxxxxxxxxxxxxxxxxxx
DIFY_API_URL=https://api.dify.ai/v1/workflows/your_workflow_id/run

# 数据库配置（可选，如不使用数据库功能可不配置）
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=material_audit
```

### 4. 数据库初始化（可选）
如需使用数据库功能：
```bash
# 1. 创建数据库
mysql -u root -p < database/schema.sql

# 2. 初始化表结构
mysql -u root -p material_audit < database/sql/init-tables.sql
```

### 5. 构建项目
```bash
npm run build
```

### 6. 启动服务
```bash
# 开发环境
npm run dev

# 生产环境（推荐使用 PM2）
npm install -g pm2
pm2 start ecosystem.config.js
```

## 🐳 Docker部署（推荐）

```bash
# 1. 构建镜像
docker build -t material-audit .

# 2. 启动容器
docker run -d \
  -p 3000:3000 \
  -e DIFY_API_KEY=your_key \
  -e DIFY_API_URL=your_url \
  --name material-audit \
  material-audit

# 或使用 docker-compose
docker-compose up -d
```

## 📖 部署文档

详细部署说明请查看：
- [部署指南](docs/DEPLOYMENT.md) - 完整部署步骤
- [环境配置](docs/ENV_CONFIG.md) - 环境变量说明
- [数据库配置](docs/DATABASE.md) - 数据库设置

## 🔧 服务管理

### PM2管理（推荐）
```bash
# 启动
pm2 start ecosystem.config.js

# 停止
pm2 stop material-audit

# 重启
pm2 restart material-audit

# 查看日志
pm2 logs material-audit

# 查看状态
pm2 status
```

### 系统服务（可选）
参考 `docs/DEPLOYMENT.md` 中的系统服务配置说明

## 🌐 访问地址

- 开发环境：http://localhost:3000
- 生产环境：根据实际部署配置

## ⚠️ 注意事项

1. **环境变量**: 务必配置正确的 `.env` 文件
2. **Node版本**: 确保使用 Node.js >= 20.19.0
3. **端口冲突**: 默认使用3000端口，如有冲突请修改
4. **数据库**: 数据库功能为可选，不影响核心审计功能
5. **API密钥**: Dify API密钥请妥善保管

## 🆘 常见问题

### 1. 依赖安装失败
```bash
# 清理缓存重试
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### 2. 构建失败
```bash
# 检查Node版本
node -v  # 应该 >= 20.19.0

# 增加内存限制
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

### 3. 服务启动失败
- 检查端口是否被占用
- 查看日志排查错误
- 确认环境变量配置正确

## 📞 技术支持

如遇问题，请提供：
- 错误日志
- 环境信息（Node版本、系统版本）
- 配置文件（隐藏敏感信息）

---

**版本**: 1.0.0  
**更新时间**: 2024-12-18
