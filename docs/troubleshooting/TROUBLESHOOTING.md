# 🔧 问题排查指南

## 当前问题：任务列表 500 错误

访问应用时出现：`获取任务列表失败: [GET] "/api/dify/tasks": 500`

## 🔍 诊断步骤

### 步骤 1：检查数据库健康状态

访问数据库健康检查接口：
```
https://material-price-audit-j6ijan2jc-liuwu1074718390-2892s-projects.vercel.app/api/health/db
```

或使用详细的数据库检查：
```
https://material-price-audit-j6ijan2jc-liuwu1074718390-2892s-projects.vercel.app/api/health/db-check
```

这些接口会告诉你：
- ✅ 数据库连接是否成功
- ✅ 环境变量是否配置完整
- ✅ 数据库表是否存在
- ✅ 具体的错误信息和建议

### 步骤 2：检查 Vercel 环境变量

1. 访问 Vercel 控制台：
   https://vercel.com/liuwu1074718390-2892s-projects/material-price-audit/settings/environment-variables

2. 确认以下环境变量已配置：
   - `DB_HOST` - 数据库地址
   - `DB_PORT` - 数据库端口（通常是 3306）
   - `DB_USER` - 数据库用户名
   - `DB_PASSWORD` - 数据库密码
   - `DB_NAME` - 数据库名称

3. 确认环境变量作用域：
   - 至少要在 **Production** 环境中配置
   - 建议也在 **Preview** 和 **Development** 中配置

### 步骤 3：检查数据库配置

#### 如果是腾讯云 MySQL 数据库：

1. **确认数据库信息**：
   - 登录腾讯云控制台
   - 进入云数据库 MySQL
   - 查看数据库实例信息

2. **开启外网访问**：
   - 在数据库实例详情页
   - 找到"外网地址"或"外网访问"
   - 点击"开启外网访问"
   - 记录外网地址和端口

3. **配置安全组**：
   - 在数据库实例页面，点击"安全组"
   - 添加规则，允许所有 IP（临时测试）
   - 或添加 Vercel 的 IP 范围（生产环境）

4. **更新环境变量**：
   ```
   DB_HOST=外网地址（例如：gz-cdb-xxx.sql.tencentcdb.com）
   DB_PORT=外网端口（例如：28544）
   ```

#### 如果是其他数据库：

- **AWS RDS**：确保安全组允许 Vercel IP 访问
- **阿里云 RDS**：开启外网访问，配置白名单
- **PlanetScale**：使用连接字符串，已针对无服务器优化

### 步骤 4：验证数据库连接

#### 方式一：使用健康检查 API

访问：`/api/health/db-check`

查看返回结果，根据错误代码采取对应措施。

#### 方式二：使用命令行工具

```bash
# 测试数据库连接
mysql -h 你的数据库地址 -P 端口 -u 用户名 -p

# 或使用 Vercel CLI
npx vercel env pull .env.local
# 然后测试连接
```

### 步骤 5：初始化数据库表

如果数据库连接成功但表不存在：

1. **查看表结构文件**：
   - 打开 `database/schema.sql`

2. **在数据库中执行 SQL**：
   ```sql
   -- 连接到数据库后执行
   USE 你的数据库名;
   SOURCE database/schema.sql;
   ```

   或直接在腾讯云数据库控制台执行 SQL 语句。

3. **验证表是否创建**：
   - 访问 `/api/health/db` 检查

## 🚨 常见错误及解决方案

### 错误 1: ECONNREFUSED（连接被拒绝）

**原因**：
- 数据库地址或端口错误
- 数据库服务器未运行
- 外网访问未开启

**解决方案**：
1. 确认数据库地址和端口正确
2. 开启数据库外网访问
3. 检查防火墙设置

### 错误 2: ETIMEDOUT（连接超时）

**原因**：
- 网络不通
- 安全组未配置
- Vercel 无法访问数据库

**解决方案**：
1. 在数据库安全组中添加允许规则
2. 临时允许所有 IP（仅用于测试）
3. 确认外网访问已开启

### 错误 3: ER_ACCESS_DENIED_ERROR（访问被拒绝）

**原因**：
- 用户名或密码错误
- 用户没有访问权限

**解决方案**：
1. 检查 `DB_USER` 和 `DB_PASSWORD`
2. 确认数据库用户有足够权限
3. 重置数据库密码

### 错误 4: ER_BAD_DB_ERROR（数据库不存在）

**原因**：
- `DB_NAME` 配置错误
- 数据库未创建

**解决方案**：
1. 检查数据库名称是否正确
2. 在数据库服务器中创建数据库
3. 更新 `DB_NAME` 环境变量

### 错误 5: ER_NO_SUCH_TABLE（表不存在）

**原因**：
- 数据库表未创建

**解决方案**：
1. 执行 `database/schema.sql` 创建表
2. 访问 `/api/health/db` 验证

## 📝 快速修复清单

- [ ] 检查环境变量是否配置（Vercel 控制台）
- [ ] 确认数据库外网访问已开启
- [ ] 配置数据库安全组（允许访问）
- [ ] 执行 `database/schema.sql` 创建表
- [ ] 访问 `/api/health/db` 验证连接
- [ ] 访问 `/api/health/db-check` 获取详细诊断
- [ ] 重新部署应用（如果有配置更改）

## 🔄 重新部署

如果修改了环境变量，需要重新部署：

```bash
npx vercel --prod
```

或者在 Vercel 控制台点击 "Redeploy"。

## 💡 临时解决方案

如果暂时无法连接数据库，可以：

1. **返回空列表**：
   修改 `server/api/dify/tasks.get.ts`，在数据库不可用时返回空数组而不是错误

2. **使用内存存储**：
   修改任务管理器使用内存存储（重启后数据会丢失）

3. **使用 PlanetScale**：
   迁移到 PlanetScale，它专门为无服务器环境优化

## 📚 相关文档

- `VERCEL_DB_FIX.md` - 详细的数据库连接问题解决方案
- `database/schema.sql` - 数据库表结构
- `server/utils/db.ts` - 数据库连接配置

## 🆘 需要帮助？

如果以上步骤都无法解决问题：

1. 访问 `/api/health/db-check` 获取详细错误信息
2. 查看 Vercel 部署日志
3. 检查数据库服务器日志
4. 联系数据库服务提供商技术支持

