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

  // 从环境变量读取数据库配置（优先使用环境变量）
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'audit_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    connectTimeout: 10000 // 连接超时时间（10秒）
    // 注意：acquireTimeout 和 timeout 不是 mysql2 的有效配置选项
  }

  console.log('[DB] 初始化数据库连接池:', {
    host: dbConfig.host,
    port: dbConfig.port,
    database: dbConfig.database,
    user: dbConfig.user
  })

  pool = mysql.createPool(dbConfig)
  
  // 测试连接
  pool.getConnection()
    .then(connection => {
      console.log('[DB] 数据库连接成功')
      connection.release()
    })
    .catch(error => {
      console.error('[DB] 数据库连接失败:', error)
      console.error('[DB] 错误详情:', {
        code: error.code,
        errno: error.errno,
        sqlMessage: error.sqlMessage,
        message: error.message
      })
      if (error.code === 'ER_ACCESS_DENIED_ERROR') {
        console.error('[DB] 提示: 数据库用户名或密码错误')
      } else if (error.code === 'ECONNREFUSED') {
        console.error('[DB] 提示: 无法连接到数据库服务器，请检查 DB_HOST 和 DB_PORT')
      } else if (error.code === 'ER_BAD_DB_ERROR') {
        console.error('[DB] 提示: 数据库不存在，请先创建数据库')
      } else if (error.code === 'ETIMEDOUT') {
        console.error('[DB] 提示: 连接超时，可能的原因：')
        console.error('  1. 使用了内网地址但服务器不在腾讯云内网')
        console.error('  2. 外网访问未开启（如果使用外网地址）')
        console.error('  3. 安全组未开放 3306 端口')
        console.error('  4. 数据库地址或端口不正确')
        console.error('  解决方案：请查看 数据库连接问题排查.md 文件')
      }
    })

  return pool
}

/**
 * 执行查询
 */
export async function query<T = any>(sql: string, params?: any[]): Promise<T> {
  const pool = getDbPool()
  const [rows] = await pool.execute(sql, params || [])
  return rows as T
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

