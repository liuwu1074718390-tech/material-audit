# 🚀 Vercel 快速部署指南

## 三种部署方式，选择最适合你的

### ⭐ 方式一：GitHub 自动部署（推荐，最简单）

**优点**：每次推送代码自动部署，无需手动操作

**步骤**：

1. **推送代码到 GitHub**
   ```bash
   git add .
   git commit -m "准备部署"
   git push
   ```

2. **在 Vercel 导入项目**
   - 访问：https://vercel.com
   - 使用 GitHub 账号登录
   - 点击 "Add New..." → "Project"
   - 选择你的仓库，点击 "Import"

3. **配置环境变量**
   - 在项目设置 → Environment Variables 中添加：
     ```
     DIFY_API_KEY=你的密钥
     DIFY_API_URL=你的地址
     DB_HOST=数据库地址（如果有）
     DB_PORT=3306
     DB_USER=数据库用户（如果有）
     DB_PASSWORD=数据库密码（如果有）
     DB_NAME=数据库名称（如果有）
     ```

4. **点击 Deploy**
   - 等待 2-3 分钟
   - 获得链接：`https://your-project.vercel.app`

✅ **完成！** 以后每次 `git push` 都会自动部署。

---

### 🖥️ 方式二：使用自动化脚本

**macOS/Linux**：
```bash
chmod +x scripts/deploy-vercel.sh
./scripts/deploy-vercel.sh
```

**Windows**：
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\scripts\deploy-vercel.ps1
```

脚本会自动完成所有步骤！

---

### ⌨️ 方式三：手动使用 CLI

```bash
# 1. 安装 Vercel CLI
npm install -g vercel

# 2. 登录
vercel login

# 3. 部署
vercel --prod

# 4. 配置环境变量
vercel env add DIFY_API_KEY
vercel env add DIFY_API_URL
# ... 添加其他变量
```

---

## 📝 必需的环境变量

至少需要配置这两个：

- `DIFY_API_KEY` - Dify API 密钥
- `DIFY_API_URL` - Dify API 地址

其他环境变量根据你的需求配置。

---

## 📖 详细文档

查看完整文档：`docs/VERCEL_DEPLOYMENT.md`

---

## ❓ 遇到问题？

1. 查看 Vercel 部署日志
2. 检查环境变量配置
3. 查看详细文档：`docs/VERCEL_DEPLOYMENT.md`

