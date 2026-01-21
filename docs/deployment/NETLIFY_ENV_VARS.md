# Netlify 环境变量配置指南

## 📍 在哪里配置

1. 登录 Netlify 控制台：https://app.netlify.com
2. 选择你的站点
3. 点击左侧菜单 **"Site configuration"** → **"Environment variables"**
4. 点击 **"Add a variable"** 按钮添加每个变量

## 🔧 必需的环境变量

### 1. Netlify 构建配置

⚠️ **注意**：`NETLIFY` 是 Netlify 平台的**保留环境变量**，会自动设置，**不需要手动添加**！

| 变量名 | 值 | 说明 |
|--------|-----|------|
| ~~`NETLIFY`~~ | ~~`1`~~ | ⚠️ **保留变量，自动设置，跳过此项** |
| `NODE_VERSION` | `20.19.0` | Node.js 版本（已在 netlify.toml 中配置，可选添加） |

### 2. Dify API 配置（必需）

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `DIFY_API_KEY` | `app-CaJJxI5P0DrvwNXAhABB37M6` | Dify API 密钥 |
| `DIFY_API_URL` | `http://192.168.1.42/v1/workflows/run` | Dify API 地址 |
| `DIFY_WORKFLOW_ID` | `6495412f-cb02-4702-a1e4-5471a37919c7` | Dify 工作流 ID |

⚠️ **注意**：`DIFY_API_URL` 当前是内网地址 `http://192.168.1.42`，如果 Netlify 服务器无法访问内网，需要：
- 使用公网可访问的 Dify 地址
- 或配置内网穿透

### 3. 数据库配置（必需）

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `DB_HOST` | `gz-cdb-gaxrunxl.sql.tencentcdb.com` | 数据库主机地址 |
| `DB_PORT` | `28544` | 数据库端口 |
| `DB_USER` | `root` | 数据库用户名 |
| `DB_PASSWORD` | `Lw05044918` | 数据库密码 |
| `DB_NAME` | `myapp` | 数据库名称 |

## 🔐 可选的环境变量

### 腾讯云配置（如果使用腾讯云服务）

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `TENCENT_SECRET_ID` | `your-tencent-secret-id` | 腾讯云 Secret ID |
| `TENCENT_SECRET_KEY` | `your-tencent-secret-key` | 腾讯云 Secret Key |
| `TENCENT_REGION` | `ap-guangzhou` | 腾讯云区域 |

### COS 配置（如果使用对象存储）

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `COS_BUCKET` | `my-audit-bucket-1256824609` | COS 存储桶名称 |
| `COS_REGION` | `ap-guangzhou` | COS 区域 |
| `COS_BASE_URL` | `https://my-audit-bucket-1256824609.cos.ap-guangzhou.myqcloud.com` | COS 访问地址 |

### 其他配置

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `NUXT_PUBLIC_API_BASE` | `/api` | API 基础路径（可选，默认值） |
| `NODE_ENV` | `production` | 环境模式（可选） |

## 📝 配置步骤（详细）

### 步骤 1：进入环境变量设置

1. 在 Netlify 控制台，选择你的站点
2. 点击左侧菜单 **"Site configuration"**
3. 点击 **"Environment variables"**

### 步骤 2：添加每个变量

对每个变量：

1. 点击 **"Add a variable"** 按钮
2. 在 **"Key"** 字段输入变量名（例如：`DIFY_API_KEY`）
3. 在 **"Values"** 字段输入变量值（例如：`app-CaJJxI5P0DrvwNXAhABB37M6`）
4. 选择 **"Scopes"**（作用域）：
   - ✅ **All scopes**：所有环境（推荐用于必需变量）
   - **Production**：仅生产环境
   - **Deploy previews**：仅预览部署
   - **Branch deploys**：仅分支部署
5. 点击 **"Add variable"** 保存

### 步骤 3：重复添加所有变量

按照上面的列表，逐个添加所有必需的环境变量。

### 步骤 4：重新部署

配置完环境变量后，需要重新部署才能生效：

1. 在站点页面，点击 **"Deploys"** 标签
2. 点击最新部署右侧的 **"..."** 菜单
3. 选择 **"Trigger deploy"** → **"Deploy site"**

或者：

1. 在站点设置中，点击 **"Build & deploy"**
2. 点击 **"Trigger deploy"** → **"Deploy site"**

## ✅ 快速复制清单

你可以按照以下顺序逐个添加（复制变量名和值）：

⚠️ **跳过 `NETLIFY`** - 这是保留变量，会自动设置！

```
NODE_VERSION=20.19.0  （可选，已在 netlify.toml 中配置）
DIFY_API_KEY=app-CaJJxI5P0DrvwNXAhABB37M6
DIFY_API_URL=http://192.168.1.42/v1/workflows/run
DIFY_WORKFLOW_ID=6495412f-cb02-4702-a1e4-5471a37919c7
DB_HOST=gz-cdb-gaxrunxl.sql.tencentcdb.com
DB_PORT=28544
DB_USER=root
DB_PASSWORD=Lw05044918
DB_NAME=myapp
```

## ⚠️ 重要提示

### 0. 关于 NETLIFY 变量

- ⚠️ **`NETLIFY` 是 Netlify 平台的保留环境变量**
- ✅ Netlify 会自动设置 `NETLIFY=1`，无需手动添加
- ✅ Nuxt 会自动检测到这个变量并使用 Netlify preset
- ❌ 如果尝试手动添加会提示 "NETLIFY is a reserved environment variable"

### 1. 安全性

- 🔒 **敏感信息**（如密码、API 密钥）建议设置为 **Production only**
- 🔒 不要在代码中硬编码这些值
- 🔒 定期轮换密钥和密码

### 2. DIFY_API_URL 内网地址问题

当前 `DIFY_API_URL` 是内网地址 `http://192.168.1.42`，Netlify 服务器无法访问内网。

**解决方案**：
- ✅ 如果 Dify 部署在公网，使用公网地址
- ✅ 如果 Dify 在内网，需要配置内网穿透（如 ngrok、frp）
- ✅ 或者将 Dify 部署到公网可访问的服务器

### 3. 数据库连接

- ✅ 确保腾讯云数据库允许 Netlify 的 IP 访问
- ✅ 检查数据库安全组规则
- ✅ 确认数据库端口 `28544` 已开放

### 4. 环境变量作用域

- **All scopes**：适用于所有环境（开发、预览、生产）
- **Production only**：仅生产环境（推荐用于敏感信息）
- **Deploy previews**：仅预览部署（用于测试）

## 🔍 验证配置

部署后，检查：

1. **构建日志**：查看是否有环境变量相关的错误
2. **运行时日志**：在 Netlify Functions 日志中查看应用是否正常启动
3. **应用功能**：测试 API 调用和数据库连接

## 📚 参考

- [Netlify 环境变量文档](https://docs.netlify.com/environment-variables/overview/)
- [Nuxt 3 环境变量](https://nuxt.com/docs/guide/going-further/runtime-config)

