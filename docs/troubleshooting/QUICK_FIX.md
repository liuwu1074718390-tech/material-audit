# 🚀 快速修复：任务列表 500 错误

## 问题
访问应用时看到：`获取任务列表失败: [GET] "/api/dify/tasks": 500`

## 🔧 快速修复步骤

### 1️⃣ 诊断问题（1分钟）

访问诊断接口查看具体问题：
```
https://你的vercel地址.vercel.app/api/health/db-check
```

### 2️⃣ 根据诊断结果操作

#### 如果显示"连接失败"或"超时"：

**问题**：Vercel 无法连接到数据库

**解决**：
1. ✅ 确保数据库已开启**外网访问**
2. ✅ 在数据库**安全组**中添加允许规则（临时可允许所有 IP）
3. ✅ 确认环境变量 `DB_HOST` 使用的是**外网地址**
4. ✅ 确认环境变量 `DB_PORT` 使用的是**外网端口**

#### 如果显示"表不存在"：

**问题**：数据库表未创建

**解决**：
1. ✅ 登录数据库管理界面
2. ✅ 执行 `database/schema.sql` 中的 SQL 语句
3. ✅ 重新访问应用

#### 如果显示"配置不完整"：

**问题**：环境变量未配置

**解决**：
1. ✅ 访问 Vercel 控制台：https://vercel.com/liuwu1074718390-2892s-projects/material-price-audit/settings/environment-variables
2. ✅ 添加缺失的环境变量：
   - `DB_HOST`
   - `DB_PORT`
   - `DB_USER`
   - `DB_PASSWORD`
   - `DB_NAME`
3. ✅ 重新部署应用

### 3️⃣ 重新部署

修改环境变量后，需要重新部署：

```bash
npx vercel --prod
```

或在 Vercel 控制台点击 "Redeploy"

### 4️⃣ 验证修复

1. 访问 `/api/health/db-check` 应该显示 `status: 'ok'`
2. 访问主页，任务列表应该能正常加载

## 📋 检查清单

- [ ] 访问 `/api/health/db-check` 诊断问题
- [ ] 数据库已开启外网访问
- [ ] 数据库安全组已配置允许访问
- [ ] Vercel 环境变量已配置完整
- [ ] 数据库表已创建（执行 schema.sql）
- [ ] 已重新部署应用

## 💡 常见问题

### Q: 数据库地址和端口在哪里找？

A: 在腾讯云数据库控制台：
- 查看数据库实例详情
- 找到"外网地址"和"外网端口"
- 复制到环境变量中

### Q: 为什么需要外网访问？

A: Vercel 运行在云端，无法直接访问内网数据库，必须通过外网连接。

### Q: 安全组如何配置？

A: 
1. 进入数据库实例页面
2. 点击"安全组"
3. 添加规则：允许所有 IP（0.0.0.0/0）访问 3306 端口
4. 或者添加 Vercel 的具体 IP 范围

### Q: 环境变量在哪里配置？

A: 
1. 访问：https://vercel.com/liuwu1074718390-2892s-projects/material-price-audit/settings/environment-variables
2. 点击 "Add" 添加变量
3. 选择环境范围（Production）
4. 保存后重新部署

## 🆘 仍然有问题？

1. 查看详细排查指南：`TROUBLESHOOTING.md`
2. 查看数据库连接文档：`VERCEL_DB_FIX.md`
3. 访问 Vercel 部署日志查看详细错误

