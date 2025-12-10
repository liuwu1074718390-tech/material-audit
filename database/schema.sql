-- 材价审计系统数据库表结构
-- 请在腾讯云 MySQL 数据库中执行此 SQL

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

