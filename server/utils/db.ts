import mysql from 'mysql2/promise'

/**
 * 数据库连接池
 * 使用连接池管理数据库连接，提高性能和稳定性
 */
let pool: mysql.Pool | null = null

/**
 * 获取数据库连接池
 */
export function getDbPool(): mysql.Pool {
  if (pool) {
    return pool
  }

  // 清理环境变量的辅助函数（去除换行符和首尾空白）
  const cleanEnvVar = (value: string | undefined, defaultValue: string): string => {
    if (!value) return defaultValue
    return value.trim().replace(/\n/g, '').replace(/\r/g, '')
  }

  // 从环境变量读取数据库配置（优先使用环境变量）
  // 自动清理换行符和空白字符，避免 Vercel 环境变量配置问题
  const dbConfig = {
    // 数据库配置 - 支持更多环境变量
    host: cleanEnvVar(process.env.DB_HOST, 'localhost'),
    port: Number(cleanEnvVar(process.env.DB_PORT, '3306')),
    user: cleanEnvVar(process.env.DB_USER, 'root'),
    password: cleanEnvVar(process.env.DB_PASSWORD, ''),
    database: cleanEnvVar(process.env.DB_NAME, 'audit_db'),

    // 连接池配置
    waitForConnections: true,
    connectionLimit: Number(cleanEnvVar(process.env.DB_POOL_SIZE, '10')), // 对应 DB_POOL_SIZE
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,

    // 超时配置
    connectTimeout: 10000, // 连接超时
    acquireTimeout: Number(cleanEnvVar(process.env.DB_POOL_TIMEOUT, '10')) * 1000, // 获取连接超时 (用户配置为秒，转换为毫秒)

    // SSL 配置：通过环境变量控制，如果 DB_SSL=true 才启用 SSL
    // 某些数据库实例可能不支持 SSL，所以默认不启用
    ssl: process.env.DB_SSL === 'true' ? {
      rejectUnauthorized: false
    } : undefined,
  }

  // 验证必要的配置
  if (!dbConfig.host || dbConfig.host === 'localhost') {
    console.warn('[DB] 警告: DB_HOST 未配置或使用默认值，请检查环境变量')
  }
  if (!dbConfig.database || dbConfig.database === 'audit_db') {
    console.warn('[DB] 警告: DB_NAME 未配置或使用默认值，请检查环境变量')
  }

  console.log('[DB] 初始化数据库连接池:', {
    host: dbConfig.host,
    port: dbConfig.port,
    database: dbConfig.database,
    user: dbConfig.user
  })

  pool = mysql.createPool(dbConfig)

  console.log('[DB] 连接池已创建，跳过连接测试')

  return pool
}

/**
 * 执行查询
 */
export async function query<T = any>(sql: string, params?: any[]): Promise<T> {
  try {
    const pool = getDbPool()

    // 是否开启日志
    if (process.env.DB_ECHO === 'true') {
      console.log('[DB] Execute:', sql, params)
    }

    const [rows] = await pool.execute(sql, params || [])
    return rows as T
  } catch (error: any) {
    // 增强错误信息
    console.error('[DB] 查询执行失败:', {
      sql: sql.substring(0, 100), // 只记录前100个字符
      errorCode: error.code,
      errorMessage: error.message,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage
    })
    throw error
  }
}

/**
 * 执行事务
 */
export async function transaction<T>(callback: (connection: mysql.PoolConnection) => Promise<T>): Promise<T> {
  const pool = getDbPool()
  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction()
    const result = await callback(connection)
    await connection.commit()
    return result
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

/**
 * 关闭数据库连接池（用于优雅关闭）
 */
export async function closeDbPool(): Promise<void> {
  if (pool) {
    await pool.end()
    pool = null
    console.log('[DB] 数据库连接池已关闭')
  }
}

