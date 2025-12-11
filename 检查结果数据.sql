-- 检查结果数据的 task_id
-- 请在腾讯云 MySQL 的 SQL 窗口中执行

USE myapp;

-- 1. 查看所有任务的任务ID
SELECT task_id, project_name, status, created_at 
FROM audit_tasks 
ORDER BY created_at DESC 
LIMIT 10;

-- 2. 查看所有结果数据的 task_id（看看结果保存在哪个任务下）
SELECT task_id, COUNT(*) as result_count 
FROM audit_results 
GROUP BY task_id 
ORDER BY task_id DESC;

-- 3. 查看特定任务的结果（替换为实际的任务ID）
-- SELECT * FROM audit_results WHERE task_id = 'task_1765297334750_bzjs7ag6q';

-- 4. 对比：查看任务表中的任务ID和结果表中的任务ID是否匹配
SELECT 
  t.task_id as task_table_id,
  COUNT(r.task_id) as result_count
FROM audit_tasks t
LEFT JOIN audit_results r ON t.task_id = r.task_id
GROUP BY t.task_id
ORDER BY t.created_at DESC
LIMIT 10;








