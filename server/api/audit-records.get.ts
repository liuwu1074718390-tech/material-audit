import type { AuditResultData } from '~/types'

// 临时内存存储（实际应该用数据库）
let auditRecords: AuditResultData[] = []

export default defineEventHandler(async (event) => {
  try {
    // TODO: 从数据库查询审计记录
    // 这里返回空数组，实际应该从腾讯云数据库等查询
    
    const query = getQuery(event)
    const limit = parseInt(query.limit as string) || 100
    const offset = parseInt(query.offset as string) || 0

    // 返回分页结果
    return auditRecords.slice(offset, offset + limit)
  } catch (error: any) {
    console.error('查询审计记录失败:', error)
    throw createError({
      statusCode: 500,
      message: '查询失败'
    })
  }
})

// 导出函数供其他模块使用
export function addAuditRecord(record: AuditResultData) {
  auditRecords.unshift(record)
}

export function getAuditRecords() {
  return auditRecords
}

