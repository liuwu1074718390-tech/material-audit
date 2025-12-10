import { taskManager } from '~/server/utils/task-manager'

/**
 * 查询任务状态和结果
 * GET /api/dify/task/{taskId}
 */
export default defineEventHandler(async (event) => {
  const taskId = getRouterParam(event, 'taskId')
  
  if (!taskId) {
    throw createError({
      statusCode: 400,
      message: '缺少任务ID'
    })
  }
  
  console.log(`[API] 查询任务详情: ${taskId}`)
  const task = await taskManager.getTask(taskId)
  
  if (!task) {
    console.warn(`[API] 任务不存在: ${taskId}`)
    throw createError({
      statusCode: 404,
      message: '任务不存在'
    })
  }
  
  console.log(`[API] 任务查询成功: ${taskId}, 结果数量: ${task.results.length}`)
  
  return {
    taskId: task.taskId,
    projectName: task.projectName,
    status: task.status,
    progress: task.progress,
    totalMaterials: task.totalMaterials,
    resultCount: task.results.length,
    results: task.results,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt
  }
})

