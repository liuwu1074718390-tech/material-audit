import { taskManager } from '~/server/utils/task-manager'

/**
 * 查询任务状态（轻量级，用于轮询）
 * GET /api/dify/task/{taskId}/status
 */
export default defineEventHandler(async (event) => {
  const taskId = getRouterParam(event, 'taskId')
  
  if (!taskId) {
    throw createError({
      statusCode: 400,
      message: '缺少任务ID'
    })
  }
  
  const task = await taskManager.getTask(taskId)
  
  if (!task) {
    throw createError({
      statusCode: 404,
      message: '任务不存在'
    })
  }
  
  // 只返回状态相关的字段，不包含results
  return {
    taskId: task.taskId,
    projectName: task.projectName,
    status: task.status,
    progress: task.progress,
    totalMaterials: task.totalMaterials,
    resultCount: task.results.length,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt
  }
})

