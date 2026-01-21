# 📋 初始化数据库指南

## 问题

如果任务列表返回空或报错，可能是因为数据库表不存在。

## 解决方案

### 步骤 1: 获取数据库连接信息

确保你有以下信息：
- 数据库地址（DB_HOST）
- 数据库端口（DB_PORT）
- 数据库用户名（DB_USER）
- 数据库密码（DB_PASSWORD）
- 数据库名称（DB_NAME）

### 步骤 2: 连接数据库

#### 方式一：使用 MySQL 客户端

```bash
mysql -h 你的数据库地址 -P 端口 -u 用户名 -p
# 输入密码后进入 MySQL
```

#### 方式二：使用腾讯云数据库控制台

1. 登录腾讯云控制台
2. 进入云数据库 MySQL
3. 选择你的数据库实例
4. 点击"数据库管理" → "SQL窗口"
5. 选择你的数据库

#### 方式三：使用数据库管理工具

- **Navicat**：图形化界面
- **DBeaver**：免费开源
- **MySQL Workbench**：官方工具
- **phpMyAdmin**：Web 界面

### 步骤 3: 执行 SQL 脚本

连接数据库后，执行 `database/schema.sql` 文件中的 SQL 语句。

#### 方法一：直接复制执行

1. 打开 `database/schema.sql` 文件
2. 复制所有 SQL 语句
3. 在数据库客户端中粘贴并执行

#### 方法二：使用命令行

```bash
mysql -h 你的数据库地址 -P 端口 -u 用户名 -p 数据库名 < database/schema.sql
```

#### 方法三：在腾讯云控制台

1. 在 SQL 窗口中
2. 点击"上传文件"
3. 选择 `database/schema.sql`
4. 执行

### 步骤 4: 验证表是否创建成功

执行以下 SQL 检查表是否存在：

```sql
USE 你的数据库名;

SHOW TABLES;

-- 应该看到以下表：
-- audit_tasks
-- audit_materials
-- audit_results
```

### 步骤 5: 验证应用

1. 访问应用的健康检查接口：
   ```
   https://你的vercel地址.vercel.app/api/health/db
   ```

2. 应该显示：
   ```json
   {
     "healthy": true,
     "checks": {
       "tables": {
         "status": "ok",
         "message": "所有必需的表都存在"
       }
     }
   }
   ```

## 数据库表说明

创建的表：

1. **audit_tasks** - 存储审计任务基本信息
   - task_id: 任务ID
   - project_name: 项目名称
   - status: 任务状态
   - progress: 进度
   - total_materials: 材料总数

2. **audit_materials** - 存储材料数据
   - task_id: 任务ID
   - material_id: 材料ID
   - data: 材料数据（JSON格式）

3. **audit_results** - 存储审计结果
   - task_id: 任务ID
   - material_id: 材料ID
   - data: 审计结果（JSON格式）

## 常见问题

### Q: 执行 SQL 时报错 "Table already exists"

A: 表已经存在，可以忽略或删除后重新创建：

```sql
DROP TABLE IF EXISTS audit_results;
DROP TABLE IF EXISTS audit_materials;
DROP TABLE IF EXISTS audit_tasks;
```

然后重新执行 `schema.sql`。

### Q: 执行 SQL 时报错 "Access denied"

A: 确认数据库用户有足够的权限：
- CREATE TABLE
- INSERT
- UPDATE
- DELETE
- SELECT

### Q: 连接数据库失败

A: 检查：
1. 数据库地址和端口是否正确
2. 是否开启了外网访问
3. 安全组是否允许你的 IP 访问

## 快速验证

执行完 SQL 后，访问：

```
https://你的vercel地址.vercel.app/api/health/db-check
```

应该看到 `status: 'ok'` 和所有表都存在。




