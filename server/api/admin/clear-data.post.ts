import { query, transaction } from '~/server/utils/db'

/**
 * 清空所有历史业务数据
 * POST /api/admin/clear-data
 * 
 * 警告：此操作会删除所有任务、结果和材料数据，不可恢复！
 */
export default defineEventHandler(async (event) => {
  try {
    console.log('[Admin] 开始清空所有历史业务数据...')

    // 使用事务确保数据一致性
    const result = await transaction(async (connection) => {
      // 1. 清空审计结果表
      await connection.execute('DELETE FROM audit_results', [])
      console.log(`[Admin] 已清空 audit_results 表`)

      // 2. 清空材料数据表
      await connection.execute('DELETE FROM audit_materials', [])
      console.log(`[Admin] 已清空 audit_materials 表`)

      // 3. 清空审计任务表
      await connection.execute('DELETE FROM audit_tasks', [])
      console.log(`[Admin] 已清空 audit_tasks 表`)

      return {
        success: true,
        message: '所有历史业务数据已成功清空',
        cleared: {
          tasks: '已清空',
          materials: '已清空',
          results: '已清空'
        }
      }
    })

    console.log('[Admin] 所有历史业务数据已成功清空')
    return result
  } catch (error: any) {
    console.error('[Admin] 清空数据失败:', error)
    throw createError({
      statusCode: 500,
      message: error.message || '清空数据失败',
      data: {
        error: error.message,
        stack: error.stack
      }
    })
  }
})

