import { getDbPool } from '~/server/utils/db'

/**
 * 数据库连接检查（诊断工具）
 * GET /api/health/db-check
 */
export default defineEventHandler(async (event) => {
  // 清理环境变量的辅助函数
  const cleanEnvVar = (value: string | undefined, defaultValue: string): string => {
    if (!value) return defaultValue
    return value.trim().replace(/\n/g, '').replace(/\r/g, '')
  }

  try {
    const config = {
      host: cleanEnvVar(process.env.DB_HOST, 'localhost'),
      port: Number(cleanEnvVar(process.env.DB_PORT, '3306')),
      user: cleanEnvVar(process.env.DB_USER, 'root'),
      database: cleanEnvVar(process.env.DB_NAME, 'audit_db'),
      hasPassword: !!process.env.DB_PASSWORD
    }
    
    // 不暴露敏感信息
    const safeConfig = {
      host: config.host,
      port: config.port,
      user: config.user,
      database: config.database,
      hasPassword: config.hasPassword
    }
    
    // 尝试连接数据库
    const pool = getDbPool()
    const connection = await pool.getConnection()
    
    try {
      // 执行简单查询测试（使用反引号转义关键字）
      const [rows] = await connection.execute('SELECT 1 as test, NOW() as `current_time`, DATABASE() as current_db')
      
      // 检查表是否存在 - 使用多种方式查询确保准确性
      let existingTables: string[] = []
      
      try {
        // 方式1: 使用 information_schema 查询（区分大小写）
        const tablesResult1 = await connection.execute<any>(
          `SELECT table_name FROM information_schema.tables 
           WHERE table_schema = ? 
           AND table_name IN ('audit_tasks', 'audit_materials', 'audit_results')`,
          [config.database]
        )
        const rows1 = Array.isArray(tablesResult1) ? tablesResult1[0] : tablesResult1
        if (Array.isArray(rows1)) {
          rows1.forEach((row: any) => {
            if (row && row.table_name) {
              existingTables.push(row.table_name)
            }
          })
        }
      } catch (err) {
        console.warn('[DB-Check] information_schema 查询失败，尝试其他方式', err)
      }
      
      // 如果方式1没有找到，尝试方式2: 使用 SHOW TABLES（不区分大小写）
      if (existingTables.length === 0) {
        try {
          const tablesResult2 = await connection.execute<any>(
            `SHOW TABLES LIKE 'audit_%'`
          )
          const rows2 = Array.isArray(tablesResult2) ? tablesResult2[0] : tablesResult2
          if (Array.isArray(rows2)) {
            // SHOW TABLES 返回的字段名是动态的，取第一个字段的值
            rows2.forEach((row: any) => {
              const tableName = Object.values(row)[0] as string
              if (tableName && tableName.startsWith('audit_')) {
                existingTables.push(tableName)
              }
            })
          }
        } catch (err) {
          console.warn('[DB-Check] SHOW TABLES 查询失败', err)
        }
      }
      
      // 方式3: 直接查询所有表，然后过滤
      if (existingTables.length === 0) {
        try {
          const tablesResult3 = await connection.execute<any>(
            `SELECT table_name FROM information_schema.tables WHERE table_schema = ?`,
            [config.database]
          )
          const rows3 = Array.isArray(tablesResult3) ? tablesResult3[0] : tablesResult3
          if (Array.isArray(rows3)) {
            rows3.forEach((row: any) => {
              const tableName = row?.table_name || row?.TABLE_NAME
              if (tableName && ['audit_tasks', 'audit_materials', 'audit_results'].includes(tableName)) {
                existingTables.push(tableName)
              }
            })
          }
        } catch (err) {
          console.warn('[DB-Check] 查询所有表失败', err)
        }
      }
      
      // 去重
      existingTables = [...new Set(existingTables)]
      
      const requiredTables = ['audit_tasks', 'audit_materials', 'audit_results']
      const missingTables = requiredTables.filter(t => !existingTables.includes(t))
      
      connection.release()
      
      return {
        status: 'ok',
        message: '数据库连接正常',
        config: safeConfig,
        test: rows,
        tables: {
          existing: existingTables,
          missing: missingTables,
          allRequired: missingTables.length === 0
        },
        timestamp: new Date().toISOString()
      }
    } catch (queryError: any) {
      connection.release()
      throw queryError
    }
  } catch (error: any) {
    // 清理环境变量的辅助函数
    const cleanEnvVar = (value: string | undefined, defaultValue: string): string => {
      if (!value) return defaultValue
      return value.trim().replace(/\n/g, '').replace(/\r/g, '')
    }

    const config = {
      host: cleanEnvVar(process.env.DB_HOST, 'localhost'),
      port: Number(cleanEnvVar(process.env.DB_PORT, '3306')),
      user: cleanEnvVar(process.env.DB_USER, 'root'),
      database: cleanEnvVar(process.env.DB_NAME, 'audit_db'),
      hasPassword: !!process.env.DB_PASSWORD
    }
    
    return {
      status: 'error',
      message: error.message || '数据库连接失败',
      error: {
        code: error.code,
        errno: error.errno,
        sqlState: error.sqlState,
        sqlMessage: error.sqlMessage,
        message: error.message
      },
      config: {
        host: config.host,
        port: config.port,
        user: config.user,
        database: config.database,
        hasPassword: config.hasPassword
      },
      hints: getErrorHints(error),
      timestamp: new Date().toISOString()
    }
  }
})

function getErrorHints(error: any): string[] {
  const hints: string[] = []
  
  if (error.code === 'ECONNREFUSED') {
    hints.push('无法连接到数据库服务器')
    hints.push('请检查 DB_HOST 和 DB_PORT 是否正确')
    hints.push('请确认数据库服务器是否运行')
    hints.push('如果是云数据库，请检查外网访问是否开启')
  }
  
  if (error.code === 'ETIMEDOUT') {
    hints.push('连接超时')
    hints.push('可能是网络问题或数据库服务器不可访问')
    hints.push('如果是云数据库，请检查安全组设置')
    hints.push('请检查 Vercel 能否访问数据库服务器')
  }
  
  if (error.code === 'ER_ACCESS_DENIED_ERROR') {
    hints.push('数据库认证失败')
    hints.push('请检查 DB_USER 和 DB_PASSWORD 是否正确')
  }
  
  if (error.code === 'ER_BAD_DB_ERROR') {
    hints.push('数据库不存在')
    hints.push('请检查 DB_NAME 是否正确')
    hints.push('或者先创建数据库')
  }
  
  if (error.code === 'ENOTFOUND') {
    hints.push('无法解析数据库主机名')
    hints.push('请检查 DB_HOST 是否正确')
  }
  
  if (!error.code) {
    hints.push('未知错误，请查看 error.message 获取详细信息')
  }
  
  return hints
}

