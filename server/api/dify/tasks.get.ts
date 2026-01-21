import { taskManager } from '~/server/utils/task-manager'

/**
 * 列出所有审计任务（一级页面列表）
 * GET /api/dify/tasks
 */
export default defineEventHandler(async (event) => {
  try {
    console.log('[API] 获取任务列表...')
    const tasks = await taskManager.getAllTasks()
    console.log(`[API] 返回 ${tasks.length} 个任务`)
    return tasks
  } catch (error: any) {
    console.error('[API] 获取任务列表失败:', error)
    console.error('[API] 错误代码:', error.code)
    console.error('[API] 错误消息:', error.message)
    console.error('[API] 错误堆栈:', error.stack)
    
    // 数据库错误类型
    const isConnectionError = error.code === 'ECONNREFUSED' || 
                              error.code === 'ETIMEDOUT' || 
                              error.code === 'ENOTFOUND' ||
                              error.code === 'ER_ACCESS_DENIED_ERROR' ||
                              error.code === 'ER_BAD_DB_ERROR'
    
    const isTableError = error.code === 'ER_NO_SUCH_TABLE'
    
    // 如果是数据库连接错误或表不存在，返回空数组（优雅降级）
    // 这样前端不会因为数据库问题而完全无法使用
    if (isConnectionError || isTableError) {
      console.warn('[API] 数据库不可用，返回空任务列表')
      // 返回空数组而不是错误，让前端可以正常显示（虽然列表为空）
      return []
    }
    
    // 其他未知错误，返回错误信息
    throw createError({
      statusCode: 500,
      message: error.message || '获取任务列表失败',
      data: {
        error: error.message,
        code: error.code,
        hint: isConnectionError ? '请检查数据库连接配置' : 
              isTableError ? '请执行 database/schema.sql 创建数据库表' :
              '请查看服务器日志获取详细信息'
      }
    })
  }
})

