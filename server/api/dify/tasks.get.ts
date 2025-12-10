import { taskManager } from '~/server/utils/task-manager'

/**
 * 列出所有审计任务（一级页面列表）
 * GET /api/dify/tasks
 */
export default defineEventHandler(async (event) => {
  try {
    // 减少日志输出，避免终端刷屏
    // console.log('[API] 获取任务列表')
    const tasks = await taskManager.listTasks()
    // console.log(`[API] 获取到 ${tasks.length} 个任务`)

    return tasks.map(task => ({
      taskId: task.taskId,
      projectName: task.projectName,
      status: task.status,
      progress: task.progress,
      resultCount: task.resultCount || 0,
      totalMaterials: task.totalMaterials,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt
    }))
  } catch (error: any) {
    console.error('[API] 获取任务列表失败:', error)
    console.error('[API] 错误堆栈:', error.stack)
    
    throw createError({
      statusCode: 500,
      message: error.message || '获取任务列表失败',
      data: {
        error: error.message,
        code: error.code
      }
    })
  }
})

