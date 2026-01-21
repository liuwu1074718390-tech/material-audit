import type { ExcelRowData } from '~/types'
import { taskManager } from '~/server/utils/task-manager'
import { processAuditTask } from '~/server/utils/dify-processor'

export default defineEventHandler(async (event) => {
  console.log('=========================================')
  console.log('[API] ===== 收到创建任务请求 =====')
  console.log('[API] 请求时间:', new Date().toISOString())
  console.log('=========================================')
  
  try {
    const body = await readBody(event)
    const { materials, region, timeRange, categories, projectName } = body

    console.log('[API] 收到审计请求:', {
      materialCount: materials?.length || 0,
      region,
      timeRange,
      categories,
      projectName
    })
    
    if (!materials || !Array.isArray(materials) || materials.length === 0) {
      throw new Error('材料数据为空或格式不正确')
    }

    // 筛选材料（如果指定了类别），用于计算实际推送数量
    let filteredMaterials = materials
    if (categories && categories.length > 0) {
      filteredMaterials = materials.filter(m => categories.includes(m.类别))
      console.log(`[API] 按类别筛选后剩余 ${filteredMaterials.length} 条材料（原始: ${materials.length}）`)
    }

    // 去重：根据编码、规格型号、单位、不含税市场价去重
    const uniqueKeySet = new Set<string>()
    const deduplicatedMaterials: typeof materials = []
    
    for (const material of filteredMaterials) {
      const uniqueKey = `${material.编码}|${material.规格型号}|${material.单位}|${material.不含税市场价}`
      if (!uniqueKeySet.has(uniqueKey)) {
        uniqueKeySet.add(uniqueKey)
        deduplicatedMaterials.push(material)
      }
    }
    
    const duplicateCount = filteredMaterials.length - deduplicatedMaterials.length
    if (duplicateCount > 0) {
      console.log(`[API] 去重前: ${filteredMaterials.length} 条，去重后: ${deduplicatedMaterials.length} 条，去除重复: ${duplicateCount} 条`)
    }

    // 创建任务
    console.log('[API] 开始创建任务...')
    const taskId = await taskManager.createTask(materials, projectName || '未命名项目')
    console.log(`[API] ✅ 任务已创建: ${taskId}`)
    
    // 立即返回任务ID，不等待处理完成
    // 后台异步处理
    console.log(`[API] 开始后台处理任务: ${taskId}`)
    processAuditTask(taskId, materials, region, timeRange, categories)
      .then(() => {
        console.log(`[API] 任务 ${taskId} 处理完成`)
      })
      .catch(error => {
        console.error(`[API] 后台任务处理失败: ${taskId}`, error)
        console.error(`[API] 错误堆栈:`, error.stack)
        taskManager.updateTaskStatus(taskId, 'failed').catch(err => {
          console.error(`[API] 更新任务状态失败:`, err)
        })
      })
    
    // 返回任务ID和初始状态
    // 使用去重前的材料数量作为totalMaterials，因为结果会展开到所有原始材料
    console.log('[API] ✅ 准备返回响应')
    const response = {
      taskId,
      status: 'processing',
      projectName: projectName || '未命名项目',
      totalMaterials: filteredMaterials.length, // 使用去重前的数量
      message: '审计任务已创建，正在后台处理'
    }
    console.log('[API] 返回响应:', response)
    console.log('=========================================')
    return response
    
  } catch (error: any) {
    console.error('[API] 创建审计任务失败:', error)
    console.error('[API] 错误类型:', typeof error)
    console.error('[API] 错误名称:', error?.name)
    console.error('[API] 错误消息:', error?.message)
    console.error('[API] 错误代码:', error?.code)
    console.error('[API] 错误堆栈:', error?.stack)
    
    // 提供更友好的错误信息
    let errorMessage = '创建审计任务失败'
    if (error?.message) {
      errorMessage = error.message
    } else if (error?.code === 'ER_NO_SUCH_TABLE') {
      errorMessage = '数据库表不存在，请先执行 database/schema.sql 创建表结构'
    } else if (error?.code === 'ECONNREFUSED' || error?.code === 'ENOTFOUND') {
      errorMessage = '数据库连接失败，请检查 .env 中的数据库配置'
    }
    
    throw createError({
      statusCode: 500,
      message: errorMessage,
      data: {
        originalError: error?.message,
        code: error?.code,
        name: error?.name
      }
    })
  }
})

