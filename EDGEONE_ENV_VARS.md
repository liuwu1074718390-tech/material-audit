# EdgeOne 环境变量配置清单

## 📋 需要配置的环境变量

从 `.env` 文件中提取的配置：

### Dify API 配置（必需）

```
DIFY_API_KEY=app-CaJJxI5P0DrvwNXAhABB37M6
DIFY_API_URL=http://192.168.1.42/v1/workflows/run
DIFY_WORKFLOW_ID=6495412f-cb02-4702-a1e4-5471a37919c7
```

### 数据库配置（必需）

```
DB_HOST=gz-cdb-gaxrunxl.sql.tencentcdb.com
DB_PORT=28544
DB_USER=root
DB_PASSWORD=Lw05044918
DB_NAME=myapp
```

### 腾讯云配置（可选）

```
TENCENT_SECRET_ID=your-tencent-secret-id
TENCENT_SECRET_KEY=your-tencent-secret-key
TENCENT_REGION=ap-guangzhou
```

### 其他配置（可选）

```
COS_BUCKET=my-audit-bucket-1256824609
COS_REGION=ap-guangzhou
COS_BASE_URL=https://my-audit-bucket-1256824609.cos.ap-guangzhou.myqcloud.com
```

---

## ⚠️ 重要提示

### 关于 DIFY_API_URL

当前配置是内网地址：`http://192.168.1.42/v1/workflows/run`

**如果部署到 EdgeOne 后的服务器**：
- ✅ **如果服务器在同一内网**：可以使用内网地址
- ❌ **如果服务器不在同一内网**：需要：
  1. 配置内网穿透（如 ngrok、frp）
  2. 或使用公网 IP 访问
  3. 或部署 Dify 到公网可访问的地址

### 关于数据库

- ✅ 数据库配置看起来是正确的（外网地址和端口）
- ✅ 确保数据库安全组已允许服务器 IP 访问

---

## 📝 使用说明

### 方式一：在 EdgeOne 控制台配置

如果 EdgeOne 支持环境变量配置（通常通过服务器配置）：
1. 登录 EdgeOne 控制台
2. 找到环境变量配置
3. 添加上述环境变量

### 方式二：在服务器上配置

如果应用部署在服务器上：
1. 在服务器上创建 `.env` 文件
2. 复制上述环境变量
3. 确保文件权限正确

### 方式三：使用系统环境变量

在服务器上设置系统环境变量（Linux）：
```bash
export DIFY_API_KEY="app-CaJJxI5P0DrvwNXAhABB37M6"
export DIFY_API_URL="http://192.168.1.42/v1/workflows/run"
# ... 其他变量
```

---

## 🔒 安全建议

1. **不要提交 `.env` 到 Git**
2. **生产环境使用强密码**
3. **定期轮换 API 密钥**
4. **限制数据库访问 IP**

---

## 📚 相关文档

- EdgeOne 部署指南：`docs/EDGEONE_DEPLOYMENT.md`（如果需要）
- 数据库配置：`数据库配置指南.md`
- Vercel 部署：`docs/VERCEL_DEPLOYMENT.md`




