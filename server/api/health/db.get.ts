import { query, getDbPool } from '~/server/utils/db'

/**
 * 数据库健康检查接口
 * GET /api/health/db
 * 自动检测数据库连接和表结构
 */
export default defineEventHandler(async (event) => {
  const checks: any = {
    connection: { status: 'unknown', message: '' },
    tables: { status: 'unknown', message: '', missing: [] as string[] },
    config: { status: 'unknown', message: '' }
  }

  // 1. 检查配置
  try {
    const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME']
    const missing = requiredEnvVars.filter(key => !process.env[key])
    
    if (missing.length > 0) {
      checks.config = {
        status: 'error',
        message: `缺少环境变量: ${missing.join(', ')}`,
        missing
      }
      return {
        healthy: false,
        checks,
        message: '数据库配置不完整'
      }
    }
    
    checks.config = {
      status: 'ok',
      message: '配置完整',
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || '3306',
      database: process.env.DB_NAME,
      user: process.env.DB_USER
    }
  } catch (error: any) {
    checks.config = {
      status: 'error',
      message: error.message || '检查配置时出错'
    }
  }

  // 2. 检查数据库连接
  try {
    const pool = getDbPool()
    const connection = await pool.getConnection()
    
    // 测试查询
    await connection.query('SELECT 1 as test')
    connection.release()
    
    checks.connection = {
      status: 'ok',
      message: '数据库连接成功'
    }
  } catch (error: any) {
    checks.connection = {
      status: 'error',
      message: error.message || '连接失败',
      code: error.code,
      errno: error.errno,
      sqlMessage: error.sqlMessage
    }
    
    // 如果连接失败，直接返回
    return {
      healthy: false,
      checks,
      message: '数据库连接失败',
      suggestion: getConnectionSuggestion(error)
    }
  }

  // 3. 检查表结构
  const requiredTables = ['audit_tasks', 'audit_materials', 'audit_results']
  const missingTables: string[] = []
  
  for (const tableName of requiredTables) {
    try {
      const result = await query<any[]>(
        `SELECT COUNT(*) as count FROM information_schema.tables 
         WHERE table_schema = ? AND table_name = ?`,
        [process.env.DB_NAME, tableName]
      )
      
      const count = result[0]?.count || 0
      if (count === 0) {
        missingTables.push(tableName)
      }
    } catch (error: any) {
      console.error(`[Health Check] 检查表 ${tableName} 失败:`, error)
      missingTables.push(tableName)
    }
  }

  if (missingTables.length > 0) {
    checks.tables = {
      status: 'error',
      message: `缺少数据表: ${missingTables.join(', ')}`,
      missing: missingTables
    }
    return {
      healthy: false,
      checks,
      message: '数据库表不存在',
      suggestion: '请在腾讯云 MySQL 数据库中执行 database/schema.sql 文件中的 SQL 语句'
    }
  }

  checks.tables = {
    status: 'ok',
    message: '所有必需的表都存在',
    tables: requiredTables
  }

  return {
    healthy: true,
    checks,
    message: '数据库配置正常'
  }
})

/**
 * 根据错误代码提供建议
 */
function getConnectionSuggestion(error: any): string {
  if (error.code === 'ER_ACCESS_DENIED_ERROR') {
    return '数据库用户名或密码错误，请检查 .env 中的 DB_USER 和 DB_PASSWORD'
  }
  if (error.code === 'ECONNREFUSED') {
    return '无法连接到数据库服务器，请检查 .env 中的 DB_HOST 和 DB_PORT 是否正确'
  }
  if (error.code === 'ER_BAD_DB_ERROR') {
    return '数据库不存在，请先在腾讯云创建数据库，或检查 .env 中的 DB_NAME'
  }
  if (error.code === 'ENOTFOUND') {
    return '数据库地址无法解析，请检查 .env 中的 DB_HOST 是否正确'
  }
  if (error.code === 'ETIMEDOUT') {
    return '连接超时，请检查网络连接和数据库地址'
  }
  return '请检查数据库配置和网络连接'
}

