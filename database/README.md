# 数据库配置说明

## 1. 创建数据库表

请在腾讯云 MySQL 数据库中执行 `schema.sql` 文件中的 SQL 语句来创建所需的表结构。

```bash
# 方式1: 使用 MySQL 客户端
mysql -h <数据库地址> -u <用户名> -p <数据库名> < schema.sql

# 方式2: 在腾讯云控制台的 SQL 窗口中直接执行 schema.sql 的内容
```

## 2. 环境变量配置

在项目根目录的 `.env` 文件中配置以下数据库连接信息：

```env
# 数据库配置
DB_HOST=your-mysql-host        # 数据库地址（如：gz-cdb-xxxxx.sql.tencentcdb.com）
DB_PORT=3306                   # 数据库端口（默认3306）
DB_USER=your-username          # 数据库用户名
DB_PASSWORD=your-password      # 数据库密码
DB_NAME=audit_db               # 数据库名称
```

## 3. 验证连接

启动项目后，系统会自动尝试连接数据库。如果连接成功，会在控制台看到：

```
[DB] 初始化数据库连接池: { host: '...', port: 3306, ... }
[DB] 数据库连接成功
```

如果连接失败，请检查：
- 数据库地址、端口、用户名、密码是否正确
- 数据库是否已创建
- 网络连接是否正常（如果是内网地址，确保服务器可以访问）
- 数据库用户是否有足够的权限

## 4. 数据表说明

### audit_tasks（审计任务表）
存储审计任务的基本信息：
- `task_id`: 任务唯一标识
- `project_name`: 项目名称（Excel文件名）
- `status`: 任务状态（pending/processing/completed/failed/cancelled）
- `progress`: 进度百分比（0-100）
- `total_materials`: 推送给Dify的材料总数

### audit_materials（材料数据表）
存储原始材料数据：
- `task_id`: 关联的任务ID
- `material_id`: 材料ID
- `data`: 材料数据（JSON格式）

### audit_results（审计结果表）
存储审计结果：
- `task_id`: 关联的任务ID
- `material_id`: 材料ID
- `data`: 审计结果数据（JSON格式，包含推荐价格、偏差等信息）

## 5. 数据迁移

如果之前使用的是内存存储，现在切换到数据库后：
- 旧的任务数据不会自动迁移
- 新的任务会自动保存到数据库
- 建议在切换前完成所有进行中的任务

