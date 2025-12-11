# 🔧 环境变量换行符问题修复

## 问题诊断

诊断结果显示环境变量中包含换行符（`\n`）：
```json
{
  "host": "gz-cdb-gaxrunxl.sql.tencentcdb.com\n",  // ❌ 末尾有换行符
  "user": "root\n",                                 // ❌ 末尾有换行符
  "database": "myapp\n"                            // ❌ 末尾有换行符
}
```

这导致数据库无法连接，因为主机名 `gz-cdb-gaxrunxl.sql.tencentcdb.com\n` 无法被 DNS 解析。

## ✅ 自动修复

我已经更新了代码，现在会自动清理环境变量中的换行符和空白字符。**重新部署后即可生效**。

## 🔧 手动修复（推荐）

虽然代码会自动处理，但最好在 Vercel 中修复环境变量，避免其他潜在问题：

### 步骤 1: 进入环境变量设置

访问：
https://vercel.com/liuwu1074718390-2892s-projects/material-price-audit/settings/environment-variables

### 步骤 2: 修复每个环境变量

对于以下每个环境变量：
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`

**操作**：
1. 点击变量名称进入编辑
2. 或者删除后重新添加
3. **确保值中没有任何换行符或多余空白**
4. 保存

### 步骤 3: 正确的值示例

```
DB_HOST: gz-cdb-gaxrunxl.sql.tencentcdb.com
DB_PORT: 28544
DB_USER: root
DB_PASSWORD: Lw05044918
DB_NAME: myapp
```

**注意**：
- ✅ 不要有多余的空格
- ✅ 不要在末尾按 Enter（会产生换行符）
- ✅ 复制粘贴时要小心，不要包含隐藏字符

### 步骤 4: 验证修复

1. 重新部署应用
2. 访问 `/api/health/db-check`
3. 应该看到 `status: 'ok'` 或正确的错误信息（不再是 `ENOTFOUND`）

## 🚀 重新部署

修复环境变量后，需要重新部署：

```bash
npx vercel --prod
```

或在 Vercel 控制台点击 "Redeploy"

## 💡 如何避免此问题

1. **使用 Vercel CLI 设置环境变量**：
   ```bash
   echo "gz-cdb-gaxrunxl.sql.tencentcdb.com" | npx vercel env rm DB_HOST production
   echo "gz-cdb-gaxrunxl.sql.tencentcdb.com" | npx vercel env add DB_HOST production
   ```

2. **在 Vercel 控制台编辑时**：
   - 仔细检查值的末尾
   - 使用 `Ctrl+A` 全选后再粘贴
   - 不要在值后面按 Enter

3. **使用环境变量文件**：
   ```bash
   # 先清理 .env 文件
   cat .env | tr -d '\r' > .env.clean
   mv .env.clean .env
   
   # 然后推送环境变量
   npx vercel env pull .env.local
   ```

## 📋 修复检查清单

- [ ] 在 Vercel 控制台修复环境变量（去除换行符）
- [ ] 验证每个环境变量的值正确
- [ ] 重新部署应用
- [ ] 访问 `/api/health/db-check` 验证连接
- [ ] 访问应用主页，验证任务列表正常

## 🎯 快速修复命令

如果你想用命令行快速修复，可以运行：

```bash
# 删除旧的环境变量
npx vercel env rm DB_HOST production
npx vercel env rm DB_USER production
npx vercel env rm DB_NAME production

# 添加正确的值（不带换行符）
echo -n "gz-cdb-gaxrunxl.sql.tencentcdb.com" | npx vercel env add DB_HOST production
echo -n "root" | npx vercel env add DB_USER production
echo -n "myapp" | npx vercel env add DB_NAME production
echo -n "28544" | npx vercel env add DB_PORT production
echo -n "Lw05044918" | npx vercel env add DB_PASSWORD production

# 重新部署
npx vercel --prod
```

注意：`echo -n` 可以防止在末尾添加换行符。

