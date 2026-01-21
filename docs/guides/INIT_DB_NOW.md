# 🎯 立即初始化数据库

## ✅ 当前状态

- ✅ 数据库连接成功
- ❌ 数据库表不存在（需要创建）

## 📋 需要创建的表

- `audit_tasks` - 审计任务表
- `audit_materials` - 材料数据表
- `audit_results` - 审计结果表

## 🚀 快速初始化

### 方式一：使用 MySQL 客户端（推荐）

1. **连接数据库**：
   ```bash
   mysql -h gz-cdb-gaxrunxl.sql.tencentcdb.com -P 28544 -u root -p
   ```
   输入密码后进入 MySQL

2. **选择数据库**：
   ```sql
   USE myapp;
   ```

3. **执行 SQL**：
   复制以下 SQL 并执行：

```sql
-- 审计任务表
CREATE TABLE IF NOT EXISTS `audit_tasks` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `task_id` VARCHAR(64) NOT NULL UNIQUE COMMENT '任务ID',
  `project_name` VARCHAR(255) NOT NULL COMMENT '项目名称（Excel文件名）',
  `status` ENUM('pending', 'processing', 'completed', 'failed', 'cancelled') NOT NULL DEFAULT 'pending' COMMENT '任务状态',
  `progress` INT NOT NULL DEFAULT 0 COMMENT '进度百分比 0-100',
  `total_materials` INT NOT NULL DEFAULT 0 COMMENT '推送给Dify的材料总数',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_status` (`status`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='审计任务表';

-- 审计结果表
CREATE TABLE IF NOT EXISTS `audit_results` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `task_id` VARCHAR(64) NOT NULL COMMENT '任务ID',
  `material_id` VARCHAR(32) NOT NULL COMMENT '材料ID',
  `data` JSON NOT NULL COMMENT '审计结果数据（JSON格式）',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX `idx_task_id` (`task_id`),
  INDEX `idx_material_id` (`material_id`),
  UNIQUE KEY `uk_task_material` (`task_id`, `material_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='审计结果表';

-- 材料数据表（存储原始材料数据）
CREATE TABLE IF NOT EXISTS `audit_materials` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `task_id` VARCHAR(64) NOT NULL COMMENT '任务ID',
  `material_id` VARCHAR(32) NOT NULL COMMENT '材料ID',
  `data` JSON NOT NULL COMMENT '材料数据（JSON格式）',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX `idx_task_id` (`task_id`),
  INDEX `idx_material_id` (`material_id`),
  UNIQUE KEY `uk_task_material` (`task_id`, `material_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='材料数据表';
```

### 方式二：使用腾讯云控制台

1. **登录腾讯云控制台**
   - 进入云数据库 MySQL
   - 找到你的数据库实例

2. **打开 SQL 窗口**
   - 点击"数据库管理" → "SQL窗口"
   - 选择数据库 `myapp`

3. **执行 SQL**
   - 复制上面的 SQL 语句
   - 粘贴到 SQL 窗口
   - 点击"执行"

### 方式三：使用命令行直接执行

```bash
mysql -h gz-cdb-gaxrunxl.sql.tencentcdb.com -P 28544 -u root -p myapp < database/schema.sql
```

## ✅ 验证表已创建

执行完 SQL 后，访问诊断接口验证：

```
https://material-price-audit-5ln1t2ld3-liuwu1074718390-2892s-projects.vercel.app/api/health/db-check
```

应该看到：
```json
{
  "status": "ok",
  "tables": {
    "existing": ["audit_tasks", "audit_materials", "audit_results"],
    "missing": [],
    "allRequired": true
  }
}
```

## 🎉 完成！

表创建成功后，访问应用主页应该可以正常使用了！




