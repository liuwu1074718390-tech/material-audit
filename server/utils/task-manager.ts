import type { AuditTask, ExcelRowData, AuditResultData } from '~/types'
import { query, transaction } from './db'

/**
 * 后台任务管理器（使用数据库存储）
 * 管理审计任务的生命周期，支持长时间运行的后台任务
 */
class TaskManager {
  // 内存中存储 AbortController，用于取消请求
  private abortControllers: Map<string, AbortController[]> = new Map()

  /**
   * 创建新任务
   */
  async createTask(materials: ExcelRowData[], projectName: string): Promise<string> {
    try {
      const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // 为每个材料生成唯一ID
      const materialMap = new Map<string, ExcelRowData>()
      materials.forEach((material, index) => {
        const id = String(index + 1).padStart(4, '0') // 0001, 0002, ...
        materialMap.set(id, material)
      })

      console.log(`[TaskManager] 开始创建任务: ${taskId}, 项目名: ${projectName}, 材料数量: ${materials.length}`)

      // 保存任务到数据库
      try {
        const insertResult = await query(
          `INSERT INTO audit_tasks (task_id, project_name, status, progress, total_materials) 
           VALUES (?, ?, 'pending', 0, ?)`,
          [taskId, projectName, materials.length]
        )
        console.log(`[TaskManager] 任务基本信息已保存到数据库，插入结果:`, insertResult)

        // 立即验证任务是否真的插入成功
        const verifyInsert = await query<any[]>(
          `SELECT task_id FROM audit_tasks WHERE task_id = ?`,
          [taskId]
        )
        console.log(`[TaskManager] 立即验证插入: ${verifyInsert.length} 条记录`)
        if (verifyInsert.length === 0) {
          throw new Error('任务插入后立即验证失败，任务可能未正确保存')
        }
      } catch (dbError: any) {
        console.error(`[TaskManager] 保存任务到数据库失败:`, dbError)
        if (dbError.code === 'ER_NO_SUCH_TABLE') {
          throw new Error('数据库表不存在，请先执行 database/schema.sql 创建表结构')
        }
        if (dbError.code === 'ECONNREFUSED' || dbError.code === 'ENOTFOUND') {
          throw new Error('数据库连接失败，请检查 .env 中的数据库配置')
        }
        throw new Error(`数据库操作失败: ${dbError.message || dbError}`)
      }

      // 保存材料数据到数据库 (分批插入，避免 SQL 过长)
      const materialInserts = Array.from(materialMap.entries()).map(([id, material]) => [
        taskId,
        id,
        JSON.stringify(material)
      ])

      if (materialInserts.length > 0) {
        try {
          const BATCH_SIZE = 50
          for (let i = 0; i < materialInserts.length; i += BATCH_SIZE) {
            const batch = materialInserts.slice(i, i + BATCH_SIZE)
            const placeholders = batch.map(() => '(?, ?, ?)').join(', ')
            const values = batch.flat()

            await query(
              `INSERT INTO audit_materials (task_id, material_id, data) 
               VALUES ${placeholders}
               ON DUPLICATE KEY UPDATE data = VALUES(data)`,
              values
            )
            console.log(`[TaskManager] 材料数据已保存 (${i + batch.length}/${materialInserts.length})`)
          }
        } catch (dbError: any) {
          console.error(`[TaskManager] 保存材料数据到数据库失败:`, dbError)
          if (dbError.code === 'ER_NO_SUCH_TABLE') {
            throw new Error('数据库表不存在，请先执行 database/schema.sql 创建表结构')
          }
          throw new Error(`保存材料数据失败: ${dbError.message || dbError}`)
        }
      }

      // 初始化 AbortController 列表
      this.abortControllers.set(taskId, [])

      console.log(`[TaskManager] 创建任务成功: ${taskId}`)

      // 验证任务是否真的创建成功（延迟一点时间，确保数据库写入完成）
      await new Promise(resolve => setTimeout(resolve, 100))
      const verifyTask = await this.getTask(taskId)
      if (!verifyTask) {
        console.error(`[TaskManager] 警告: 任务创建后验证失败，任务可能未正确保存到数据库`)
        // 不抛出错误，因为任务可能已经创建成功，只是查询有延迟
        console.warn(`[TaskManager] 任务 ${taskId} 验证失败，但继续执行（可能是数据库延迟）`)
      } else {
        console.log(`[TaskManager] 任务验证成功: ${taskId}`)
      }

      return taskId
    } catch (error: any) {
      console.error(`[TaskManager] 创建任务失败:`, error)
      console.error(`[TaskManager] 错误堆栈:`, error.stack)
      throw error
    }
  }

  /**
   * 获取任务（从数据库加载）
   */
  async getTask(taskId: string): Promise<AuditTask | null> {
    try {
      console.log(`[TaskManager] 查询任务: ${taskId}`)
      // 获取任务基本信息
      const tasks = await query<any[]>(
        `SELECT * FROM audit_tasks WHERE task_id = ?`,
        [taskId]
      )

      console.log(`[TaskManager] 查询结果: ${tasks.length} 条记录`)

      if (tasks.length === 0) {
        console.warn(`[TaskManager] 任务 ${taskId} 在数据库中不存在`)
        return null
      }

      const taskRow = tasks[0]

      // 获取材料数据
      const materialRows = await query<any[]>(
        `SELECT material_id, data FROM audit_materials WHERE task_id = ?`,
        [taskId]
      )

      const materials: ExcelRowData[] = []
      const materialMap = new Map<string, ExcelRowData>()

      for (const row of materialRows) {
        try {
          // MySQL JSON 字段可能返回对象或字符串
          let material: ExcelRowData
          if (typeof row.data === 'string') {
            material = JSON.parse(row.data) as ExcelRowData
          } else {
            // 如果已经是对象，直接使用
            material = row.data as ExcelRowData
          }
          materials.push(material)
          materialMap.set(row.material_id, material)
        } catch (error: any) {
          console.error(`[TaskManager] 解析材料数据失败 (material_id: ${row.material_id}):`, error)
          console.error(`[TaskManager] 原始数据:`, row.data, `类型:`, typeof row.data)
          // 跳过这条有问题的数据
        }
      }

      // 获取结果数据
      console.log(`[TaskManager] 准备查询结果，task_id: ${taskId}`)
      const resultRows = await query<any[]>(
        `SELECT material_id, data FROM audit_results WHERE task_id = ? ORDER BY material_id`,
        [taskId]
      )

      console.log(`[TaskManager] 查询到 ${resultRows.length} 条结果记录`)

      // 如果查询结果为空，检查数据库中是否有其他任务的结果
      if (resultRows.length === 0) {
        const allResults = await query<any[]>(
          `SELECT task_id, COUNT(*) as count FROM audit_results GROUP BY task_id ORDER BY task_id DESC LIMIT 5`
        )
        console.log(`[TaskManager] 数据库中所有任务的结果统计:`, allResults)

        // 检查是否有相似的任务ID
        const similarTasks = await query<any[]>(
          `SELECT DISTINCT task_id FROM audit_results WHERE task_id LIKE ? LIMIT 5`,
          [`${taskId.substring(0, 20)}%`]
        )
        console.log(`[TaskManager] 相似的任务ID:`, similarTasks)
      }

      const results: AuditResultData[] = []
      for (const row of resultRows) {
        try {
          // MySQL JSON 字段可能返回对象或字符串
          let result: AuditResultData
          if (typeof row.data === 'string') {
            result = JSON.parse(row.data) as AuditResultData
          } else if (row.data && typeof row.data === 'object') {
            // 如果已经是对象，直接使用
            result = row.data as AuditResultData
          } else {
            console.warn(`[TaskManager] 结果数据格式异常 (material_id: ${row.material_id}):`, row.data)
            continue
          }

          // 确保结果有必需的字段
          if (!result.ID) {
            result.ID = row.material_id
          }

          results.push(result)
          console.log(`[TaskManager] 成功解析结果 (material_id: ${row.material_id}, ID: ${result.ID})`)
        } catch (error: any) {
          console.error(`[TaskManager] 解析结果数据失败 (material_id: ${row.material_id}):`, error)
          console.error(`[TaskManager] 原始数据:`, row.data)
          console.error(`[TaskManager] 数据类型:`, typeof row.data)
          console.error(`[TaskManager] 数据内容:`, JSON.stringify(row.data, null, 2))
          // 跳过这条有问题的数据，继续处理其他结果
        }
      }

      console.log(`[TaskManager] 成功解析 ${results.length} 条结果（共查询到 ${resultRows.length} 条记录）`)

      // 如果查询到记录但解析结果为空，记录详细信息
      if (resultRows.length > 0 && results.length === 0) {
        console.error(`[TaskManager] ⚠️ 警告: 查询到 ${resultRows.length} 条记录，但解析结果为空`)
        console.error(`[TaskManager] 第一条记录的详细信息:`, {
          material_id: resultRows[0]?.material_id,
          data_type: typeof resultRows[0]?.data,
          data_preview: JSON.stringify(resultRows[0]?.data).substring(0, 200)
        })
      }

      return {
        taskId: taskRow.task_id,
        projectName: taskRow.project_name,
        totalMaterials: taskRow.total_materials,
        materials,
        materialMap,
        results,
        status: taskRow.status as AuditTask['status'],
        progress: taskRow.progress,
        createdAt: new Date(taskRow.created_at),
        updatedAt: new Date(taskRow.updated_at),
        cancelled: taskRow.status === 'cancelled',
        abortControllers: this.abortControllers.get(taskId) || []
      }
    } catch (error) {
      console.error(`[TaskManager] 获取任务失败: ${taskId}`, error)
      return null
    }
  }

  /**
   * 更新任务状态
   */
  async updateTaskStatus(taskId: string, status: AuditTask['status']): Promise<void> {
    try {
      await query(
        `UPDATE audit_tasks SET status = ?, updated_at = NOW() WHERE task_id = ?`,
        [status, taskId]
      )
      console.log(`[TaskManager] 任务 ${taskId} 状态更新: ${status}`)
    } catch (error) {
      console.error(`[TaskManager] 更新任务状态失败: ${taskId}`, error)
    }
  }

  /**
   * 标记任务取消
   */
  async cancelTask(taskId: string): Promise<void> {
    await this.updateTaskStatus(taskId, 'cancelled')
    this.abortTaskRequests(taskId)
    console.log(`[TaskManager] 任务 ${taskId} 已取消`)
  }

  /**
   * 判断任务是否取消
   */
  async isCancelled(taskId: string): Promise<boolean> {
    const task = await this.getTask(taskId)
    return task?.status === 'cancelled' || false
  }

  /**
   * 注册一个AbortController用于后续取消
   */
  registerAbortController(taskId: string, controller: AbortController): void {
    if (!this.abortControllers.has(taskId)) {
      this.abortControllers.set(taskId, [])
    }
    this.abortControllers.get(taskId)!.push(controller)
  }

  /**
   * 取消当前正在进行的请求
   */
  abortTaskRequests(taskId: string): void {
    const controllers = this.abortControllers.get(taskId)
    if (controllers) {
      for (const controller of controllers) {
        try {
          controller.abort()
        } catch (err) {
          console.warn(`[TaskManager] abort controller error:`, err)
        }
      }
      this.abortControllers.set(taskId, [])
    }
  }

  /**
   * 更新任务进度
   */
  async updateTaskProgress(taskId: string, progress: number): Promise<void> {
    try {
      const finalProgress = Math.min(100, Math.max(0, progress))
      await query(
        `UPDATE audit_tasks SET progress = ?, updated_at = NOW() WHERE task_id = ?`,
        [finalProgress, taskId]
      )
    } catch (error) {
      console.error(`[TaskManager] 更新任务进度失败: ${taskId}`, error)
    }
  }

  /**
   * 更新任务总材料数
   */
  async updateTaskTotalMaterials(taskId: string, totalMaterials: number): Promise<void> {
    try {
      await query(
        `UPDATE audit_tasks SET total_materials = ?, updated_at = NOW() WHERE task_id = ?`,
        [totalMaterials, taskId]
      )
    } catch (error) {
      console.error(`[TaskManager] 更新任务总材料数失败: ${taskId}`, error)
    }
  }

  /**
   * 添加结果到任务
   */
  async addResults(taskId: string, results: AuditResultData[]): Promise<void> {
    if (results.length === 0) {
      console.log(`[TaskManager] 跳过空结果数组 (taskId: ${taskId})`)
      return
    }

    try {
      console.log(`[TaskManager] 开始添加结果: taskId=${taskId}, 结果数量=${results.length}`)
      await transaction(async (connection) => {
        // 批量插入结果 (分批处理)
        const allInserts = results.map(result => [
          taskId,
          result.ID,
          JSON.stringify(result)
        ])

        const BATCH_SIZE = 50
        for (let i = 0; i < allInserts.length; i += BATCH_SIZE) {
          const batch = allInserts.slice(i, i + BATCH_SIZE)
          const placeholders = batch.map(() => '(?, ?, ?)').join(', ')
          const values = batch.flat()

          await connection.execute(
            `INSERT INTO audit_results (task_id, material_id, data) 
             VALUES ${placeholders}
             ON DUPLICATE KEY UPDATE data = VALUES(data)`,
            values
          )
        }

        console.log(`[TaskManager] 插入结果完成 (共 ${allInserts.length} 条)`)

        // 更新任务进度
        const resultCount = await connection.execute<any[]>(
          `SELECT COUNT(*) as count FROM audit_results WHERE task_id = ?`,
          [taskId]
        )

        const count = (resultCount[0] as any[])[0]?.count || 0
        const taskInfo = await connection.execute<any[]>(
          `SELECT total_materials FROM audit_tasks WHERE task_id = ?`,
          [taskId]
        )

        const total = (taskInfo[0] as any[])[0]?.total_materials || 1
        const progress = Math.min(100, Math.round((count / total) * 100))

        await connection.execute(
          `UPDATE audit_tasks SET progress = ?, updated_at = NOW() WHERE task_id = ?`,
          [progress, taskId]
        )
      })

      console.log(`[TaskManager] 任务 ${taskId} 添加 ${results.length} 条结果`)

      // 验证结果是否真的保存成功
      const verifyCount = await query<any[]>(
        `SELECT COUNT(*) as count FROM audit_results WHERE task_id = ?`,
        [taskId]
      )
      const savedCount = verifyCount[0]?.count || 0
      console.log(`[TaskManager] 验证：数据库中已有 ${savedCount} 条结果`)
    } catch (error: any) {
      console.error(`[TaskManager] 添加结果失败: ${taskId}`, error)
      console.error(`[TaskManager] 错误堆栈:`, error.stack)
      throw error
    }
  }

  /**
   * 获取任务结果
   */
  async getResults(taskId: string): Promise<AuditResultData[]> {
    try {
      const rows = await query<any[]>(
        `SELECT data FROM audit_results WHERE task_id = ? ORDER BY material_id`,
        [taskId]
      )
      return rows.map(row => JSON.parse(row.data) as AuditResultData)
    } catch (error) {
      console.error(`[TaskManager] 获取结果失败: ${taskId}`, error)
      return []
    }
  }

  /**
   * 获取任务进度信息
   */
  async getTaskProgress(taskId: string): Promise<{ status: string; progress: number; resultCount: number } | null> {
    try {
      const tasks = await query<any[]>(
        `SELECT status, progress, 
         (SELECT COUNT(*) FROM audit_results WHERE task_id = ?) as result_count
         FROM audit_tasks WHERE task_id = ?`,
        [taskId, taskId]
      )

      if (tasks.length === 0) return null

      const task = tasks[0]
      return {
        status: task.status,
        progress: task.progress,
        resultCount: task.result_count || 0
      }
    } catch (error) {
      console.error(`[TaskManager] 获取任务进度失败: ${taskId}`, error)
      return null
    }
  }

  /**
   * 列出所有任务（按创建时间倒序）
   */
  async listTasks(): Promise<AuditTask[]> {
    try {
      // 减少日志输出，避免终端刷屏
      // console.log('[TaskManager] 开始查询任务列表')
      const rows = await query<any[]>(
        `SELECT t.*, 
         (SELECT COUNT(*) FROM audit_results WHERE task_id = t.task_id) as result_count
         FROM audit_tasks t 
         ORDER BY t.created_at DESC`
      )
      // console.log(`[TaskManager] 查询到 ${rows.length} 条任务记录`)

      return rows.map(row => ({
        taskId: row.task_id,
        projectName: row.project_name,
        status: row.status as AuditTask['status'],
        progress: row.progress,
        totalMaterials: row.total_materials,
        resultCount: row.result_count || 0,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
        materials: [],
        materialMap: new Map(),
        results: [],
        cancelled: row.status === 'cancelled',
        abortControllers: []
      }))
    } catch (error: any) {
      console.error(`[TaskManager] 列出任务失败`, error)
      console.error(`[TaskManager] 错误代码:`, error.code)
      console.error(`[TaskManager] 错误消息:`, error.message)
      console.error(`[TaskManager] 错误堆栈:`, error.stack)

      // 如果是表不存在错误，抛出更明确的错误
      if (error.code === 'ER_NO_SUCH_TABLE') {
        throw new Error('数据库表不存在，请先执行 database/schema.sql 创建表结构')
      }

      // 重新抛出错误，让调用者处理
      throw error
    }
  }

  /**
   * 获取所有任务（别名，与 listTasks 相同）
   */
  async getAllTasks(): Promise<AuditTask[]> {
    return this.listTasks()
  }

  /**
   * 删除任务
   */
  async deleteTask(taskId: string): Promise<void> {
    try {
      await transaction(async (connection) => {
        // 删除结果
        await connection.execute(
          `DELETE FROM audit_results WHERE task_id = ?`,
          [taskId]
        )

        // 删除材料
        await connection.execute(
          `DELETE FROM audit_materials WHERE task_id = ?`,
          [taskId]
        )

        // 删除任务
        await connection.execute(
          `DELETE FROM audit_tasks WHERE task_id = ?`,
          [taskId]
        )
      })

      // 清理内存中的 AbortController
      this.abortControllers.delete(taskId)
      this.abortTaskRequests(taskId)

      console.log(`[TaskManager] 删除任务: ${taskId}`)
    } catch (error) {
      console.error(`[TaskManager] 删除任务失败: ${taskId}`, error)
      throw error
    }
  }

  /**
   * 清理超过指定天数的旧任务（可选功能）
   */
  async cleanOldTasks(days: number = 30): Promise<void> {
    try {
      const rows = await query<any[]>(
        `SELECT task_id FROM audit_tasks 
         WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)`,
        [days]
      )

      for (const row of rows) {
        await this.deleteTask(row.task_id)
      }

      console.log(`[TaskManager] 清理了 ${rows.length} 个旧任务`)
    } catch (error) {
      console.error(`[TaskManager] 清理旧任务失败`, error)
    }
  }
}

// 单例模式
export const taskManager = new TaskManager()
