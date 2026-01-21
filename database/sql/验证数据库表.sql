-- 验证数据库表是否存在
-- 请在腾讯云 MySQL 的 SQL 窗口中执行这些 SQL

-- 1. 选择数据库
USE myapp;

-- 2. 查看所有表
SHOW TABLES;

-- 应该看到三个表：
-- audit_tasks
-- audit_materials
-- audit_results

-- 3. 检查每个表的结构
DESCRIBE audit_tasks;
DESCRIBE audit_materials;
DESCRIBE audit_results;

-- 4. 检查表是否有数据（可选）
SELECT COUNT(*) as task_count FROM audit_tasks;
SELECT COUNT(*) as material_count FROM audit_materials;
SELECT COUNT(*) as result_count FROM audit_results;

-- 5. 测试查询（模拟 listTasks 的查询）
SELECT t.*, 
 (SELECT COUNT(*) FROM audit_results WHERE task_id = t.task_id) as result_count
 FROM audit_tasks t 
 ORDER BY t.created_at DESC;

