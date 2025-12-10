import { taskManager } from '~/server/utils/task-manager'

/**
 * 删除/取消任务
 * DELETE /api/dify/task/{taskId}
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

  // 标记取消并中断正在进行的请求
  await taskManager.cancelTask(taskId)
  // 删除任务
  await taskManager.deleteTask(taskId)

  return {
    taskId,
    message: '任务已删除并中断'
  }
})

