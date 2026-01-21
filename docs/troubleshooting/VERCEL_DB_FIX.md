# Vercel 数据库连接问题排查

## 问题描述

访问任务列表页面时出现 500 错误：
```
获取任务列表失败: [GET] "/api/dify/tasks": 500
```

## 可能的原因

### 1. 数据库连接失败

在 Vercel 无服务器环境中，数据库连接可能因为以下原因失败：

- **连接超时**：Vercel 函数有执行时间限制
- **网络访问限制**：数据库可能没有允许 Vercel 的 IP 访问
- **SSL 配置**：某些云数据库需要 SSL 连接
- **环境变量未配置**：数据库连接信息可能没有正确配置

### 2. 环境变量问题

确保在 Vercel 中正确配置了以下环境变量：

```
DB_HOST=你的数据库地址
DB_PORT=数据库端口
DB_USER=数据库用户名
DB_PASSWORD=数据库密码
DB_NAME=数据库名称
```

### 3. 数据库白名单

**重要**：如果使用云数据库（如腾讯云 CDB），需要：

1. 开启数据库的**外网访问**
2. 在**安全组**中添加 Vercel 的 IP 地址
3. 或者使用**数据库代理**服务

**Vercel 的 IP 地址是动态的**，建议：
- 使用数据库代理（如腾讯云 DCDB Proxy）
- 或者允许所有 IP 访问（不推荐，安全性较低）

## 解决方案

### 方案一：配置数据库白名单

1. **腾讯云数据库**：
   - 进入数据库控制台
   - 点击"数据安全" → "白名单"
   - 添加 Vercel 的 IP 范围（或临时允许所有 IP 测试）

2. **检查数据库外网访问**：
   - 确保已开启外网访问
   - 记录外网访问地址和端口

### 方案二：使用数据库代理

如果直接连接有问题，可以使用数据库代理服务：
- 腾讯云 DCDB Proxy
- 其他数据库代理服务

### 方案三：使用 Vercel Postgres（推荐）

Vercel 提供了内置的数据库服务：
1. 在 Vercel 项目中添加 Postgres 数据库
2. 使用 Vercel 的数据库连接字符串
3. 迁移 MySQL 数据到 Postgres（如果需要）

### 方案四：使用 PlanetScale（推荐）

PlanetScale 是专门为无服务器环境设计的 MySQL 数据库：
1. 注册 PlanetScale 账号
2. 创建数据库
3. 获取连接字符串
4. 在 Vercel 中配置环境变量

## 检查步骤

### 1. 检查环境变量

```bash
# 在 Vercel 控制台检查环境变量
vercel env ls production
```

### 2. 检查日志

```bash
# 查看部署日志
vercel logs --follow
```

### 3. 测试数据库连接

创建一个测试 API 路由来检查数据库连接：

```typescript
// server/api/health/db.get.ts
export default defineEventHandler(async (event) => {
  try {
    const pool = getDbPool()
    const [rows] = await pool.execute('SELECT 1 as test')
    return { status: 'ok', message: '数据库连接正常' }
  } catch (error: any) {
    return { 
      status: 'error', 
      message: error.message,
      code: error.code 
    }
  }
})
```

然后访问：`/api/health/db`

## 临时解决方案

如果暂时无法解决数据库连接问题，可以：

1. **返回空列表**：修改 API 在数据库不可用时返回空数组
2. **使用内存存储**：暂时使用内存存储任务数据（重启后会丢失）
3. **使用本地数据库**：在本地运行数据库，使用内网穿透服务（如 ngrok）

## 最佳实践

1. **使用连接池**：✅ 已实现
2. **设置连接超时**：✅ 已实现（10秒）
3. **错误处理**：✅ 已改进
4. **SSL 支持**：✅ 已添加（自动检测腾讯云 CDB）
5. **环境变量验证**：✅ 已添加警告

## 相关文件

- `server/utils/db.ts` - 数据库连接配置
- `server/api/dify/tasks.get.ts` - 任务列表 API
- `server/utils/task-manager.ts` - 任务管理器

