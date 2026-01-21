import { taskManager } from '~/server/utils/task-manager'

/**
 * 删除/取消任务
 * DELETE /api/dify/task/{taskId}
 */
export default defineEventHandler(async (event) => {
  const taskId = getRouterParam(event, 'taskId')

  if (!taskId) {
    console.error('[DELETE] 缺少任务ID')
    throw createError({
      statusCode: 400,
      message: '缺少任务ID'
    })
  }

  console.log(`[DELETE] 开始删除任务: ${taskId}`)
  
  try {
    const task = await taskManager.getTask(taskId)
    if (!task) {
      console.warn(`[DELETE] 任务不存在: ${taskId}`)
      throw createError({
        statusCode: 404,
        message: '任务不存在'
      })
    }

    console.log(`[DELETE] 任务状态: ${task.status}`)
    
    // 标记取消并中断正在进行的请求
    await taskManager.cancelTask(taskId)
    console.log(`[DELETE] 已取消任务: ${taskId}`)
    
    // 删除任务（带重试机制）
    let deleteSuccess = false
    let lastError: any = null
    
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`[DELETE] 第 ${attempt} 次尝试删除任务: ${taskId}`)
        await taskManager.deleteTask(taskId)
        deleteSuccess = true
        console.log(`[DELETE] 任务删除成功: ${taskId}`)
        break
      } catch (error: any) {
        lastError = error
        console.error(`[DELETE] 第 ${attempt} 次删除失败:`, error)
        if (attempt < 3) {
          console.log(`[DELETE] 等待后重试...`)
          await new Promise(resolve => setTimeout(resolve, 300))
        }
      }
    }
    
    if (!deleteSuccess) {
      console.error(`[DELETE] 删除任务失败（已重试3次）: ${taskId}`, lastError)
      throw createError({
        statusCode: 500,
        message: `删除任务失败: ${lastError?.message || '数据库操作失败'}`,
        data: { error: lastError }
      })
    }

    return {
      taskId,
      message: '任务已删除并中断'
    }
  } catch (error: any) {
    console.error(`[DELETE] 删除任务异常: ${taskId}`, error)
    console.error(`[DELETE] 错误详情:`, {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      stack: error.stack
    })
    throw error
  }
})

