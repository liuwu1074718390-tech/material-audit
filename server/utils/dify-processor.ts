import type {
  ExcelRowData,
  AuditResultData,
  DifyMaterialInput,
  DifyRequestParams,
  DifyResponseData,
  DifyRecommendation
} from '~/types'
import { getCityCode } from './city-code-map'
import { taskManager } from './task-manager'
import fs from 'fs'

/**
 * Dify数据处理器
 * 负责调用Dify API并处理返回结果
 */

// 日志函数
import path from 'path'
const logFile = path.resolve(process.cwd(), 'dify-debug.log')
function log(msg: string) {
  const timestamp = new Date().toISOString()
  const logMsg = `[${timestamp}] ${msg}\n`
  console.log(msg)
  try {
    fs.appendFileSync(logFile, logMsg)
  } catch (e) {
    // 忽略文件写入错误
  }
}

/**
 * 格式化时间范围
 * @param timeRange ['2024-01', '2024-12']
 * @returns '2024-01-01'|'2024-12-31'
 */
function formatTimeRange(timeRange?: [string, string]): string | undefined {
  if (!timeRange || timeRange.length !== 2) return undefined

  const [start, end] = timeRange

  // 获取结束月份的最后一天
  const endDate = new Date(end + '-01')
  endDate.setMonth(endDate.getMonth() + 1)
  endDate.setDate(0)
  const lastDay = endDate.getDate()

  return `${start}-01|${end}-${lastDay}`
}

/**
 * 生成材料输入数据
 * @param materials 材料列表
 * @param materialMap ID到材料的映射
 * @returns Dify材料输入格式的JSON字符串
 */
function generateMaterialInput(
  materials: ExcelRowData[],
  materialMap: Map<string, ExcelRowData>
): string {
  const difyMaterials: DifyMaterialInput[] = []

  materials.forEach((material, index) => {
    const id = String(index + 1).padStart(4, '0')
    difyMaterials.push({
      ID: id,
      名称: material.名称,
      规格型号: material.规格型号,
      单位: material.单位
    })
  })

  return JSON.stringify(difyMaterials)
}

/**
 * 计算推荐价格范围
 * @param recommendations Dify返回的推荐数据
 * @returns 价格范围字符串，如 "10.38～15.64"
 */
function calculatePriceRange(recommendations: DifyRecommendation[]): string {
  const prices: number[] = []

  for (const rec of recommendations) {
    let price: number

    // 优先使用 tax_exclude_amount
    if (rec.tax_exclude_amount && rec.tax_exclude_amount !== 'NULL' && rec.tax_exclude_amount !== '0.00') {
      price = parseFloat(rec.tax_exclude_amount)
    } else if (rec.tax_include_amount && rec.tax_include_amount !== 'NULL' && rec.tax_include_amount !== '0.00') {
      // 使用含税金额计算不含税金额
      const taxInclude = parseFloat(rec.tax_include_amount)
      let taxRate = parseFloat(rec.tax_rate) || 0

      // 如果税率为0或空，默认使用13%
      if (taxRate === 0) {
        taxRate = 13
      }

      price = taxInclude / (1 + taxRate / 100)
    } else {
      continue // 跳过无效数据
    }

    // 应用单位换算系数 w（将价格统一换算到材料的单位）
    // w=0.001 表示从吨(t)换算到千克(kg)，w=1 表示已经是相同单位
    const conversionFactor = parseFloat(rec.w) || 1
    price = price * conversionFactor

    if (!isNaN(price) && price > 0) {
      prices.push(price)
    }
  }

  if (prices.length === 0) {
    return '暂无数据'
  }

  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)

  return `${minPrice.toFixed(2)}～${maxPrice.toFixed(2)}`
}

/**
 * 计算价格偏差
 * @param marketPrice 市场价（不含税）
 * @param priceRange 推荐价格范围
 * @returns 价格偏差字符串和数值
 */
function calculatePriceDeviation(
  marketPrice: number,
  priceRange: string
): { deviation: string; deviationValue: number } {
  if (priceRange === '暂无数据' || !priceRange.includes('～')) {
    return { deviation: '', deviationValue: 0 }
  }

  const [minStr, maxStr] = priceRange.split('～')
  const minPrice = parseFloat(minStr)
  const maxPrice = parseFloat(maxStr)

  if (isNaN(minPrice) || isNaN(maxPrice)) {
    return { deviation: '', deviationValue: 0 }
  }

  let deviationValue: number
  let deviation: string

  if (marketPrice < minPrice) {
    // 低于最小值：偏差 = (最小推荐价 - 市场价) / 最小推荐价 × 100
    deviationValue = ((minPrice - marketPrice) / minPrice * 100)
    deviation = `-${deviationValue.toFixed(2)}%`
  } else if (marketPrice > maxPrice) {
    // 高于最大值：偏差 = (市场价 - 最大推荐价) / 最大推荐价 × 100
    deviationValue = ((marketPrice - maxPrice) / maxPrice * 100)
    deviation = `+${deviationValue.toFixed(2)}%`
  } else {
    // 在范围内
    return { deviation: '', deviationValue: 0 }
  }

  return { deviation, deviationValue }
}

/**
 * 调用Dify API（带重试机制）
 * @param materials 材料列表
 * @param city 城市编码
 * @param date 时间范围
 * @param signal 取消信号
 * @param maxRetries 最大重试次数
 * @returns Dify响应数据
 */
async function callDifyAPI(
  materials: DifyMaterialInput[],
  city?: string,
  date?: string,
  signal?: AbortSignal,
  maxRetries: number = 3
): Promise<DifyResponseData> {
  const config = useRuntimeConfig()
  const apiKey = config.difyApiKey
  const apiUrl = config.difyApiUrl
  const workflowId = config.difyWorkflowId

  if (!apiKey || !apiUrl) {
    throw new Error('Dify API配置缺失')
  }

  const requestBody: any = {
    inputs: {
      material: JSON.stringify(materials)  // 注意：字段名是material（单数）
    },
    response_mode: 'blocking',
    user: `audit_${Date.now()}`
  }

  // 添加可选参数
  if (city) {
    requestBody.inputs.city = city  // 字段名应该是city，不是region
  }
  if (date) {
    requestBody.inputs.date = date  // 字段名应该是date，不是timeRange
  }

  // 重试逻辑
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      log('[callDifyAPI] ========== 开始调用API ==========')
      log(`[callDifyAPI] 尝试次数: ${attempt}/${maxRetries}`)
      log(`[callDifyAPI] URL: ${apiUrl}`)
      log(`[callDifyAPI] 材料数量: ${materials.length}`)
      log(`[callDifyAPI] 城市: ${city || '未指定'}`)
      log(`[callDifyAPI] 日期: ${date || '未指定'}`)
      log(`[callDifyAPI] 请求体: ${JSON.stringify(requestBody, null, 2)}`)
      log('[callDifyAPI] =====================================')

      const response = await $fetch<any>(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: requestBody,
        signal,
        timeout: 60000 // 60秒超时
      })

      // 打印完整响应以便调试
      log('[callDifyAPI] ========== 收到响应 ==========')
      log(`[callDifyAPI] 响应类型: ${typeof response}`)
      log(`[callDifyAPI] 完整响应: ${JSON.stringify(response, null, 2)}`)
      log(`[callDifyAPI] 响应的所有键: ${Object.keys(response).join(', ')}`)
      if (response.data) {
        log(`[callDifyAPI] data的键: ${Object.keys(response.data).join(', ')}`)
        if (response.data.outputs) {
          log(`[callDifyAPI] outputs的键: ${Object.keys(response.data.outputs).join(', ')}`)
        }
      }
      log('[callDifyAPI] =====================================')

      return response as DifyResponseData

    } catch (error: any) {
      log(`[callDifyAPI] 第 ${attempt} 次尝试失败: ${error}`)
      log(`[callDifyAPI] 错误类型: ${error.constructor.name}`)
      if (error.data) {
        log(`[callDifyAPI] 错误详情: ${JSON.stringify(error.data, null, 2)}`)
      }
      if (error.response) {
        log(`[callDifyAPI] 响应状态: ${error.response.status}`)
        log(`[callDifyAPI] 响应数据: ${JSON.stringify(error.response._data || error.response.data, null, 2)}`)
      }
      log(`[callDifyAPI] 错误堆栈: ${error instanceof Error ? error.stack : ''}`)

      // 如果是最后一次尝试，抛出错误
      if (attempt === maxRetries) {
        log(`[callDifyAPI] 已达到最大重试次数，放弃`)
        throw error
      }

      // 等待一段时间后重试（指数退避）
      const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 5000) // 最多等待5秒
      log(`[callDifyAPI] 等待 ${waitTime}ms 后重试...`)
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
  }

  // 这里永远不会执行到，但 TypeScript 需要这个返回语句
  throw new Error('Unexpected error in callDifyAPI')
}

/**
 * 解析Dify返回结果
 * @param response Dify响应
 * @param materialMap ID到材料的映射
 * @param expectedMaterialIds 期望的材料ID列表（用于确保所有材料都有结果）
 * @returns 审计结果数组
 */
function parseDifyResponse(
  response: DifyResponseData,
  materialMap: Map<string, ExcelRowData>,
  expectedMaterialIds?: string[]
): AuditResultData[] {
  const results: AuditResultData[] = []
  const processedIds = new Set<string>()

  try {
    log(`[parseDifyResponse] 开始解析响应`)

    // 打印响应结构以便调试
    log(`[parseDifyResponse] 响应结构: hasData=${!!response.data}, hasOutputs=${!!response.data?.outputs}`)
    if (response.data?.outputs) {
      log(`[parseDifyResponse] outputs的键: ${Object.keys(response.data.outputs).join(', ')}`)
    }

    // 检查响应状态（Dify API 可能返回错误）
    if ((response as any).data?.status === 'failed') {
      log(`[parseDifyResponse] Dify调用失败: ${(response as any).data?.error || '未知错误'}`)
      // 为所有期望的材料创建失败结果
      if (expectedMaterialIds) {
        for (const id of expectedMaterialIds) {
          const material = materialMap.get(id)
          if (material) {
            results.push({
              ...material,
              ID: id,
              推荐价格范围: '查询失败',
              价格偏差: '',
              价格偏差值: 0,
              状态: '查价失败'
            })
            processedIds.add(id)
          }
        }
      }
      return results
    }

    // 提取text字段中的JSON字符串
    const textData = response.data?.outputs?.text
    if (!textData) {
      log('[parseDifyResponse] 响应中没有text字段')
      log(`[parseDifyResponse] 完整响应对象: ${JSON.stringify(response, null, 2)}`)
      // 为所有期望的材料创建失败结果
      if (expectedMaterialIds) {
        for (const id of expectedMaterialIds) {
          const material = materialMap.get(id)
          if (material) {
            results.push({
              ...material,
              ID: id,
              推荐价格范围: '查询失败',
              价格偏差: '',
              价格偏差值: 0,
              状态: '查价失败'
            })
            processedIds.add(id)
          }
        }
      }
      return results
    }

    log(`[parseDifyResponse] 找到text字段，长度: ${textData.length}`)

    // 解析JSON
    const recommendations: DifyRecommendation[] = JSON.parse(textData)
    log(`[parseDifyResponse] 解析到 ${recommendations.length} 条推荐数据`)

    // 按材料ID分组
    const groupedByID = new Map<string, DifyRecommendation[]>()
    for (const rec of recommendations) {
      const id = rec.ID
      if (!groupedByID.has(id)) {
        groupedByID.set(id, [])
      }
      groupedByID.get(id)!.push(rec)
    }

    // 为每个材料生成结果
    for (const [id, recs] of groupedByID.entries()) {
      const material = materialMap.get(id)
      if (!material) {
        console.warn(`[Dify] 找不到ID为 ${id} 的材料`)
        continue
      }

      // 计算推荐价格范围
      const priceRange = calculatePriceRange(recs)

      // 计算价格偏差
      const { deviation, deviationValue } = calculatePriceDeviation(
        material.不含税市场价,
        priceRange
      )

      results.push({
        ...material,
        ID: id,
        推荐价格范围: priceRange,
        价格偏差: deviation,
        价格偏差值: deviationValue,
        状态: '查价完成',
        推荐明细: recs
      })
      log(`[parseDifyResponse] 材料 ${id} 生成结果: 价格范围=${priceRange}, 明细数=${recs.length}`)
      if (recs.length > 0) {
        log(`[parseDifyResponse] 第一条明细: ${JSON.stringify(recs[0])}`)
      }
      processedIds.add(id)
    }

    // 为未返回结果的材料创建失败记录
    if (expectedMaterialIds) {
      for (const id of expectedMaterialIds) {
        if (!processedIds.has(id)) {
          const material = materialMap.get(id)
          if (material) {
            log(`[parseDifyResponse] 材料 ${id} 没有返回结果，创建失败记录`)
            results.push({
              ...material,
              ID: id,
              推荐价格范围: '暂无数据',
              价格偏差: '',
              价格偏差值: 0,
              状态: '查价完成' // 即使没有数据，也算完成（Dify可能没有找到匹配的材料）
            })
          }
        }
      }
    }

  } catch (error) {
    log(`[parseDifyResponse] 解析Dify响应失败: ${error}`)
    log(`[parseDifyResponse] 错误堆栈: ${error instanceof Error ? error.stack : ''}`)
    // 发生错误时，为所有期望的材料创建失败结果
    if (expectedMaterialIds) {
      for (const id of expectedMaterialIds) {
        if (!processedIds.has(id)) {
          const material = materialMap.get(id)
          if (material) {
            results.push({
              ...material,
              ID: id,
              推荐价格范围: '查询失败',
              价格偏差: '',
              价格偏差值: 0,
              状态: '查价失败'
            })
          }
        }
      }
    }
  }

  log(`[parseDifyResponse] 解析完成，返回 ${results.length} 条结果`)
  return results
}

/**
 * 处理单组材料
 * @param materials 材料列表（最多10条）
 * @param materialMap ID到材料的映射
 * @param city 城市编码
 * @param date 时间范围
 * @returns 审计结果
 */
async function processGroup(
  taskId: string,
  materials: ExcelRowData[],
  materialMap: Map<string, ExcelRowData>,
  city?: string,
  date?: string,
  deduplicatedMaterialToIdMap?: Map<string, string>
): Promise<AuditResultData[]> {
  try {
    log(`[processGroup] 开始处理 ${materials.length} 条材料`)

    // 生成Dify输入格式
    log(`[processGroup] materialMap 大小: ${materialMap.size}`)
    const difyMaterials: DifyMaterialInput[] = []
    const usedIds = new Set<string>() // 记录已使用的ID，避免重复

    for (let index = 0; index < materials.length; index++) {
      const material = materials[index]
      let id = ''

      // 优先使用去重后的材料到ID的映射（如果提供）
      // 使用唯一键来查找ID，确保去重后的材料使用相同的ID
      if (deduplicatedMaterialToIdMap) {
        const uniqueKey = `${material.编码}|${material.规格型号}|${material.单位}|${material.不含税市场价}`
        id = deduplicatedMaterialToIdMap.get(uniqueKey) || ''

        // 如果从去重映射中找到了ID，直接使用（去重后的材料应该总是有唯一ID）
        if (id) {
          if (usedIds.has(id)) {
            log(`[processGroup] ⚠️ 警告: 去重后的材料ID ${id} 已使用，这不应该发生！材料: ${material.名称}`)
            // 即使已使用，也继续使用这个ID，因为去重后的材料应该共享同一个ID
          }
          usedIds.add(id)
        }
      }

      // 如果去重映射中没有找到ID，从materialMap中查找（兼容旧逻辑）
      if (!id) {
        for (const [key, value] of materialMap.entries()) {
          // 使用深度比较或唯一标识来匹配
          if (value === material ||
            (value.名称 === material.名称 &&
              value.规格型号 === material.规格型号 &&
              value.单位 === material.单位)) {
            id = key
            break
          }
        }

        // 如果ID已使用，生成新的唯一ID
        if (id && usedIds.has(id)) {
          log(`[processGroup] ⚠️ 警告: ID ${id} 已使用，生成新ID`)
          id = ''
        }

        if (!id) {
          // 如果找不到匹配的ID，使用索引生成唯一ID
          let newId = ''
          let counter = 1
          do {
            newId = String((index + 1) * 1000 + counter).padStart(4, '0')
            counter++
          } while (usedIds.has(newId))
          id = newId
          log(`[processGroup] ⚠️ 警告: 材料 ${index} 在 materialMap 中找不到，使用生成的ID: ${id}`)
        }

        usedIds.add(id)
      }

      difyMaterials.push({
        ID: id,
        名称: material.名称,
        规格型号: material.规格型号,
        单位: material.单位
      })
    }

    // 检查是否有重复的ID
    const idSet = new Set<string>()
    const duplicateIds: string[] = []
    for (const m of difyMaterials) {
      if (idSet.has(m.ID)) {
        duplicateIds.push(m.ID)
        log(`[processGroup] ⚠️ 警告: 发现重复ID: ${m.ID}, 材料: ${m.名称} (${m.规格型号})`)
      }
      idSet.add(m.ID)
    }

    if (duplicateIds.length > 0) {
      log(`[processGroup] ⚠️ 严重警告: 发现 ${duplicateIds.length} 个重复ID: ${duplicateIds.join(', ')}`)
      log(`[processGroup] 所有ID: ${difyMaterials.map(m => m.ID).join(', ')}`)
    }

    log(`[processGroup] 生成了 ${difyMaterials.length} 条Dify材料，ID列表: ${difyMaterials.map(m => m.ID).join(', ')}`)
    if (difyMaterials.length > 0) {
      log(`[processGroup] 第一条材料: ${JSON.stringify(difyMaterials[0])}`)
    }

    // 调用Dify API
    log(`[processGroup] 开始调用Dify API`)
    const controller = new AbortController()
    taskManager.registerAbortController(taskId, controller)
    const response = await callDifyAPI(difyMaterials, city, date, controller.signal)
    log(`[processGroup] Dify API调用完成`)

    // 获取所有材料的ID列表
    const materialIds = difyMaterials.map(m => m.ID).filter(id => id)

    // 解析结果
    log(`[processGroup] 开始解析结果`)
    const results = parseDifyResponse(response, materialMap, materialIds)
    log(`[processGroup] 解析完成，得到 ${results.length} 条结果`)

    return results
  } catch (error) {
    log(`[processGroup] 处理组失败: ${error}`)
    log(`[processGroup] 错误堆栈: ${error instanceof Error ? error.stack : ''}`)

    // 返回失败状态的结果
    return materials.map((material, index) => {
      let id = ''
      for (const [key, value] of materialMap.entries()) {
        if (value === material) {
          id = key
          break
        }
      }

      return {
        ...material,
        ID: id,
        推荐价格范围: '查询失败',
        价格偏差: '',
        价格偏差值: 0,
        状态: '查价失败'
      }
    })
  }
}

/**
 * 处理审计任务（主函数）
 * @param taskId 任务ID
 * @param materials 材料列表
 * @param region 地区
 * @param timeRange 时间范围
 * @param categories 类别筛选
 */
export async function processAuditTask(
  taskId: string,
  materials: ExcelRowData[],
  region?: string | string[],
  timeRange?: [string, string],
  categories?: string[]
): Promise<void> {
  log(`[Dify] 开始处理任务 ${taskId}`)

  // 等待一小段时间，确保数据库写入完成
  await new Promise(resolve => setTimeout(resolve, 200))

  // 重试机制：最多重试3次
  let task = null
  for (let i = 0; i < 3; i++) {
    task = await taskManager.getTask(taskId)
    if (task) {
      log(`[Dify] 任务 ${taskId} 查询成功（第 ${i + 1} 次尝试）`)
      break
    }
    if (i < 2) {
      log(`[Dify] 任务 ${taskId} 查询失败，等待后重试（第 ${i + 1} 次）...`)
      await new Promise(resolve => setTimeout(resolve, 300))
    }
  }

  if (!task) {
    log(`[Dify] 任务 ${taskId} 不存在，无法处理（已重试3次）`)
    await taskManager.updateTaskStatus(taskId, 'failed')
    throw new Error(`任务 ${taskId} 不存在`)
  }

  // 检查 materialMap 是否为空
  log(`[Dify] materialMap 大小: ${task.materialMap.size}`)
  if (task.materialMap.size === 0) {
    log(`[Dify] ⚠️ 警告: materialMap 为空，无法处理任务`)
    await taskManager.updateTaskStatus(taskId, 'failed')
    throw new Error('materialMap 为空，无法处理任务')
  }

  // 筛选材料（如果指定了类别）
  let filteredMaterials = materials
  if (categories && categories.length > 0) {
    filteredMaterials = materials.filter(m => categories.includes(m.类别))
    log(`[Dify] 按类别筛选后剩余 ${filteredMaterials.length} 条材料`)
  }

  // 重要：在去重之前先保存原始材料列表！
  const originalFilteredCount = filteredMaterials.length
  const originalFilteredMaterials = [...filteredMaterials] // 深拷贝原始列表

  // 去重：根据编码、规格型号、单位、不含税市场价去重
  // 生成唯一键：编码+规格型号+单位+不含税市场价
  const uniqueKeyMap = new Map<string, { material: ExcelRowData; materialId: string; duplicateIds: string[] }>()
  const duplicateMaterialIdsMap = new Map<string, string[]>() // 记录所有材料ID（包括原始和重复）对应的所有原始材料ID列表
  const deduplicatedMaterialToIdMap = new Map<string, string>() // 唯一键到去重后材料ID的映射

  // 先对筛选后的材料进行去重，并建立映射关系
  const seenUniqueKeys = new Set<string>()
  const deduplicatedMaterials: ExcelRowData[] = []

  // 遍历筛选后的材料，进行去重
  // 首先为所有筛选后的材料建立ID映射
  // 重要：使用Map追踪已使用的materialMap ID，确保每个ID只被分配一次
  const filteredMaterialToIdMap = new Map<ExcelRowData, string>()
  const usedMaterialMapIds = new Set<string>() // 追踪已使用的materialMap ID

  for (const material of filteredMaterials) {
    // 从 materialMap 中找到对应的ID（使用更宽松的匹配）
    let materialId = ''
    for (const [id, mapMaterial] of task.materialMap.entries()) {
      // 跳过已经使用的ID
      if (usedMaterialMapIds.has(id)) {
        continue
      }

      if (mapMaterial === material || (
        mapMaterial.编码 === material.编码 &&
        mapMaterial.规格型号 === material.规格型号 &&
        mapMaterial.单位 === material.单位 &&
        mapMaterial.不含税市场价 === material.不含税市场价
      )) {
        materialId = id
        usedMaterialMapIds.add(id) // 标记为已使用
        break
      }
    }
    if (materialId) {
      filteredMaterialToIdMap.set(material, materialId)
      log(`[Dify] 筛选材料 ${material.编码} (${material.名称}) -> ID: ${materialId}`)
    } else {
      log(`[Dify] ⚠️ 警告: 筛选后的材料在materialMap中找不到ID: ${material.编码} ${material.名称}`)
    }
  }

  log(`[Dify] 筛选材料ID映射完成: ${filteredMaterialToIdMap.size} 个材料，使用了 ${usedMaterialMapIds.size} 个唯一ID`)

  // 然后进行去重
  for (const material of filteredMaterials) {
    const uniqueKey = `${material.编码}|${material.规格型号}|${material.单位}|${material.不含税市场价}`
    const materialId = filteredMaterialToIdMap.get(material)

    if (!materialId) {
      log(`[Dify] ⚠️ 警告: 跳过没有ID的材料: ${material.编码}`)
      continue
    }

    if (!seenUniqueKeys.has(uniqueKey)) {
      // 第一次出现，保留
      seenUniqueKeys.add(uniqueKey)
      deduplicatedMaterials.push(material)

      // 创建一个共享的duplicateIds数组，确保uniqueKeyMap和duplicateMaterialIdsMap使用同一个引用
      const duplicateIds = [materialId]
      uniqueKeyMap.set(uniqueKey, {
        material,
        materialId,
        duplicateIds  // 使用共享数组
      })
      // 重要：为该材料ID建立映射，使用同一个共享数组
      duplicateMaterialIdsMap.set(materialId, duplicateIds)
      deduplicatedMaterialToIdMap.set(uniqueKey, materialId)

      log(`[Dify] 去重: 新材料 ${materialId} (${material.编码}), uniqueKey: ${uniqueKey.substring(0, 50)}...`)
    } else {
      // 重复材料，找到对应的去重后材料ID
      const existing = uniqueKeyMap.get(uniqueKey)
      if (existing) {
        if (!existing.duplicateIds.includes(materialId)) {
          existing.duplicateIds.push(materialId)
          // 注意：不需要重新设置existing.materialId的映射，因为它们共享同一个数组引用
          // 但为了确保映射正确，还是设置一下
          duplicateMaterialIdsMap.set(existing.materialId, existing.duplicateIds)
          // 重要：为重复材料ID也建立映射，指向同一个列表
          duplicateMaterialIdsMap.set(materialId, existing.duplicateIds)

          log(`[Dify] 去重: 重复材料 ${materialId} (${material.编码}) -> 归并到 ${existing.materialId}, 当前组大小: ${existing.duplicateIds.length}`)
        }
      }
    }
  }

  const duplicateCount = filteredMaterials.length - deduplicatedMaterials.length

  log(`[Dify] === 去重统计 ===`)
  log(`[Dify] 去重前: ${filteredMaterials.length} 条`)
  log(`[Dify] 去重后: ${deduplicatedMaterials.length} 条`)
  log(`[Dify] 去除重复: ${duplicateCount} 条`)
  log(`[Dify] duplicateMaterialIdsMap 大小: ${duplicateMaterialIdsMap.size}`)

  // 打印duplicateMaterialIdsMap中的所有ID
  const allMappedIds = new Set<string>()
  for (const ids of duplicateMaterialIdsMap.values()) {
    ids.forEach(id => allMappedIds.add(id))
  }
  log(`[Dify] duplicateMaterialIdsMap中的所有ID (${allMappedIds.size}个): [${Array.from(allMappedIds).sort().join(', ')}]`)

  // 详细打印每个去重组的映射关系
  const printedGroups = new Set<string>()
  for (const [id, ids] of duplicateMaterialIdsMap.entries()) {
    const groupKey = ids.sort().join(',')
    if (!printedGroups.has(groupKey)) {
      printedGroups.add(groupKey)
      if (ids.length > 1) {
        log(`[Dify] 重复组: [${ids.join(',')}] (共${ids.length}个材料)`)
      }
    }
  }

  // 验证去重后的列表确实没有重复
  const finalUniqueKeys = new Set<string>()
  for (const material of deduplicatedMaterials) {
    const uniqueKey = `${material.编码}|${material.规格型号}|${material.单位}|${material.不含税市场价}`
    if (finalUniqueKeys.has(uniqueKey)) {
      log(`[Dify] ⚠️ 严重警告: 去重后的列表中仍有重复材料: ${uniqueKey}`)
    }
    finalUniqueKeys.add(uniqueKey)
  }

  // 更新 filteredMaterials 为去重后的列表
  filteredMaterials = deduplicatedMaterials

  // 更新任务的总材料数为去重前的原始数量
  // 因为结果会展开到所有原始材料，所以分母应该是原始材料数量
  await taskManager.updateTaskTotalMaterials(taskId, originalFilteredCount)
  log(`[Dify] 已更新任务总材料数为原始数量（去重前）: ${originalFilteredCount}，去重后: ${filteredMaterials.length}`)

  // 将去重映射关系传递给后续处理，以便将结果复制到所有重复的原始材料
  // 我们需要在保存结果时使用这个映射关系

  log(`[Dify] 任务 ${taskId} 存在，开始更新状态为 processing`)
  // 更新任务状态
  await taskManager.updateTaskStatus(taskId, 'processing')
  log(`[Dify] 任务 ${taskId} 状态已更新为 processing`)

  // 转换地区为编码
  const cityCode = getCityCode(region)
  log(`[Dify] 地区编码: ${cityCode}`)

  // 格式化时间范围
  const dateRange = formatTimeRange(timeRange)
  log(`[Dify] 时间范围: ${dateRange}`)

  // 分组：每1条一组
  const BATCH_ITEM_COUNT = 1
  const groups: ExcelRowData[][] = []
  for (let i = 0; i < filteredMaterials.length; i += BATCH_ITEM_COUNT) {
    groups.push(filteredMaterials.slice(i, i + BATCH_ITEM_COUNT))
  }

  log(`[Dify] 共分为 ${groups.length} 组`)

  try {
    // 并发处理，每30组同时运行
    const CONCURRENT_LIMIT = 30
    let processedGroups = 0

    log(`[Dify] 开始并发处理，并发量: ${CONCURRENT_LIMIT}`)

    // 将组分成批次，每批次处理08组
    for (let batchStart = 0; batchStart < groups.length; batchStart += CONCURRENT_LIMIT) {
      // 检查是否取消
      if (await taskManager.isCancelled(taskId)) {
        log(`[Dify] 任务 ${taskId} 已取消，停止后续处理`)
        await taskManager.updateTaskStatus(taskId, 'cancelled')
        return
      }

      const batchEnd = Math.min(batchStart + CONCURRENT_LIMIT, groups.length)
      const currentBatch = groups.slice(batchStart, batchEnd)

      log(`[Dify] 处理批次 ${Math.floor(batchStart / CONCURRENT_LIMIT) + 1}/${Math.ceil(groups.length / CONCURRENT_LIMIT)}，包含 ${currentBatch.length} 组 (第 ${batchStart + 1}-${batchEnd} 组)`)

      // 并发处理当前批次的所有组
      const batchPromises = currentBatch.map(async (group, batchIndex) => {
        const groupIndex = batchStart + batchIndex

        // 错峰启动，避免瞬间并发请求
        if (batchIndex > 0) {
          await new Promise(resolve => setTimeout(resolve, batchIndex * 1000))
        }

        log(`[Dify] 开始处理第 ${groupIndex + 1}/${groups.length} 组，材料数: ${group.length}`)

        try {
          // 处理该组
          const results = await processGroup(taskId, group, task.materialMap, cityCode, dateRange, deduplicatedMaterialToIdMap)

          log(`[Dify] 第 ${groupIndex + 1} 组处理完成`)

          // 添加结果到任务
          if (results.length > 0) {
            // 将去重后的结果复制到所有重复的原始材料
            const expandedResults: AuditResultData[] = []
            const expandedIds = new Set<string>() // 记录已展开的ID，避免重复

            log(`[Dify] 开始展开结果，去重映射表大小: ${duplicateMaterialIdsMap.size}`)

            for (const result of results) {
              // 先查找去重映射关系
              let duplicateIds = duplicateMaterialIdsMap.get(result.ID)

              log(`[Dify] 处理结果 ${result.ID}: duplicateIds = ${duplicateIds ? `[${duplicateIds.join(',')}]` : 'undefined'}`)

              // 如果映射关系不存在,说明这个材料可能没有重复,直接添加
              if (!duplicateIds || duplicateIds.length === 0) {
                log(`[Dify] 结果 ${result.ID} 没有找到去重映射，直接添加`)
                if (!expandedIds.has(result.ID)) {
                  expandedResults.push(result)
                  expandedIds.add(result.ID)
                }
                continue
              }

              // 展开到所有重复的原始材料
              log(`[Dify] 结果 ${result.ID} 对应 ${duplicateIds.length} 个原始材料: [${duplicateIds.join(',')}]`)
              for (const originalId of duplicateIds) {
                // 检查是否已经添加过
                if (expandedIds.has(originalId)) {
                  log(`[Dify] 材料ID ${originalId} 已添加，跳过`)
                  continue
                }

                const originalMaterial = task.materialMap.get(originalId)
                if (originalMaterial) {
                  expandedResults.push({
                    ...originalMaterial,
                    ID: originalId,
                    推荐价格范围: result.推荐价格范围,
                    价格偏差: result.价格偏差,
                    价格偏差值: result.价格偏差值,
                    状态: result.状态,
                    推荐明细: result.推荐明细
                  })
                  expandedIds.add(originalId)
                  log(`[Dify] 已展开: ${result.ID} -> ${originalId}`)
                } else {
                  log(`[Dify] ⚠️ 警告: 材料ID ${originalId} 在materialMap中找不到`)
                }
              }
            }

            log(`[Dify] 展开完成: 去重后结果数 ${results.length} -> 展开后结果数 ${expandedResults.length}, 已展开ID数: ${expandedIds.size}`)
            await taskManager.addResults(taskId, expandedResults)
            log(`[Dify] 已添加 ${expandedResults.length} 条结果到数据库`)
          } else {
            log(`[Dify] ⚠️ 警告: 第 ${groupIndex + 1} 组的结果数组为空`)
          }

          // 获取当前进度
          const progressInfo = await taskManager.getTaskProgress(taskId)
          if (progressInfo) {
            log(`[Dify] 任务 ${taskId} 进度: ${progressInfo.progress}% (${progressInfo.resultCount} / ${task.totalMaterials})`)
          }

          return { success: true, groupIndex }
        } catch (error) {
          log(`[Dify] 第 ${groupIndex + 1} 组处理失败: ${error}`)
          return { success: false, groupIndex, error }
        }
      })

      // 等待当前批次所有组处理完成
      const batchResults = await Promise.all(batchPromises)

      // 统计成功和失败数
      const successCount = batchResults.filter(r => r.success).length
      const failCount = batchResults.filter(r => !r.success).length

      processedGroups += successCount

      log(`[Dify] 批次完成: 成功 ${successCount} 组, 失败 ${failCount} 组, 总进度: ${processedGroups}/${groups.length}`)

      // 批次之间稍微延迟，避免请求过于频繁
      if (batchEnd < groups.length) {
        await new Promise(resolve => setTimeout(resolve, 200))
      }
    }

    // 所有批次处理完后，确保所有筛选后的原始材料都有结果
    log(`[Dify] 开始检查并补充遗漏的结果...`)
    const finalProgressInfo = await taskManager.getTaskProgress(taskId)
    const currentResultCount = finalProgressInfo?.resultCount || 0

    log(`[Dify] === 结果统计 ===`)
    log(`[Dify] 原始材料数 (去重前): ${originalFilteredCount}`)
    log(`[Dify] 去重后材料数: ${deduplicatedMaterials.length}`)
    log(`[Dify] 当前数据库结果数: ${currentResultCount}`)
    log(`[Dify] 是否需要补充: ${currentResultCount < originalFilteredCount}`)

    if (currentResultCount < originalFilteredCount) {
      log(`[Dify] 当前结果数 ${currentResultCount} 小于原始材料数 ${originalFilteredCount}，开始补充遗漏的结果`)

      // 获取已保存的所有结果
      const savedResults = await taskManager.getTask(taskId)
      const savedMaterialIds = new Set(savedResults?.results.map(r => r.ID) || [])
      log(`[Dify] 已保存的材料ID数量: ${savedMaterialIds.size}, IDs: ${Array.from(savedMaterialIds).join(', ')}`)

      // 为每个原始材料创建结果映射（直接使用originalFilteredMaterials）
      // 首先建立原始材料到ID的映射
      const originalMaterialToIdMap = new Map<ExcelRowData, string>()
      for (const material of originalFilteredMaterials) {
        // 从materialMap中找到对应的ID
        let materialId = ''
        for (const [id, mapMaterial] of task.materialMap.entries()) {
          if (mapMaterial === material || (
            mapMaterial.编码 === material.编码 &&
            mapMaterial.规格型号 === material.规格型号 &&
            mapMaterial.单位 === material.单位 &&
            mapMaterial.不含税市场价 === material.不含税市场价
          )) {
            materialId = id
            break
          }
        }
        if (materialId) {
          originalMaterialToIdMap.set(material, materialId)
        } else {
          log(`[Dify] ⚠️ 警告: 原始材料在materialMap中找不到ID: ${material.编码} ${material.名称}`)
        }
      }

      log(`[Dify] 原始材料ID映射完成: ${originalMaterialToIdMap.size} 个材料有ID`)

      // 打印所有原始材料的ID
      const allOriginalIds = Array.from(originalMaterialToIdMap.values()).sort()
      log(`[Dify] 所有原始材料ID: [${allOriginalIds.join(', ')}]`)
      log(`[Dify] 缺失的材料ID: [${allOriginalIds.filter(id => !savedMaterialIds.has(id)).join(', ')}]`)

      // 为遗漏的材料创建结果
      const missingResults: AuditResultData[] = []
      for (const material of originalFilteredMaterials) {
        const materialId = originalMaterialToIdMap.get(material)
        if (!materialId) {
          log(`[Dify] ⚠️ 警告: 原始材料找不到ID，跳过: ${material.编码}`)
          continue
        }

        if (!savedMaterialIds.has(materialId)) {
          log(`[Dify] 检测到缺失材料 ${materialId} (${material.编码}), 开始补充...`)

          // 找到这个材料对应的去重后材料ID
          const uniqueKey = `${material.编码}|${material.规格型号}|${material.单位}|${material.不含税市场价}`
          const deduplicatedId = deduplicatedMaterialToIdMap.get(uniqueKey)

          log(`[Dify] 材料 ${materialId} 的uniqueKey: ${uniqueKey}`)
          log(`[Dify] 对应的去重后ID: ${deduplicatedId || '未找到'}`)

          if (deduplicatedId) {
            // 从已保存的结果中找到对应的去重后材料的结果
            const deduplicatedResult = savedResults?.results.find(r => r.ID === deduplicatedId)
            if (deduplicatedResult) {
              log(`[Dify] 为遗漏的材料 ${materialId} (${material.编码}) 创建结果（使用去重后材料 ${deduplicatedId} 的结果）`)
              missingResults.push({
                ...material,
                ID: materialId,
                推荐价格范围: deduplicatedResult.推荐价格范围,
                价格偏差: deduplicatedResult.价格偏差,
                价格偏差值: deduplicatedResult.价格偏差值,
                状态: deduplicatedResult.状态,
                推荐明细: deduplicatedResult.推荐明细
              })
            } else {
              log(`[Dify] ⚠️ 警告: 找不到去重后材料 ${deduplicatedId} 的结果，无法为材料 ${materialId} 创建结果`)
              // 创建一个查价失败的结果
              missingResults.push({
                ...material,
                ID: materialId,
                推荐价格范围: '暂无数据',
                价格偏差: '',
                价格偏差值: 0,
                状态: '查价失败',
                推荐明细: []
              })
            }
          } else {
            log(`[Dify] ⚠️ 警告: 材料 ${materialId} 找不到对应的去重后材料ID (uniqueKey: ${uniqueKey})`)
            // 创建一个查价失败的结果
            missingResults.push({
              ...material,
              ID: materialId,
              推荐价格范围: '暂无数据',
              价格偏差: '',
              价格偏差值: 0,
              状态: '查价失败',
              推荐明细: []
            })
          }
        }
      }

      if (missingResults.length > 0) {
        log(`[Dify] 补充 ${missingResults.length} 条遗漏的结果`)
        await taskManager.addResults(taskId, missingResults)
      } else {
        log(`[Dify] 没有需要补充的结果`)
      }
    } else {
      log(`[Dify] 结果数量已完整，无需补充`)
    }

    // 完成任务
    await taskManager.updateTaskStatus(taskId, 'completed')
    await taskManager.updateTaskProgress(taskId, 100)

    // 最终验证
    const finalTask = await taskManager.getTask(taskId)
    const finalResultCount = finalTask?.results.length || 0

    log(`[Dify] === 任务完成 ===`)
    log(`[Dify] 任务ID: ${taskId}`)
    log(`[Dify] 原始材料数 (分母): ${originalFilteredCount}`)
    log(`[Dify] 最终结果数 (分子): ${finalResultCount}`)
    log(`[Dify] 分子分母是否一致: ${finalResultCount === originalFilteredCount ? '✅ 是' : '❌ 否'}`)

    if (finalResultCount !== originalFilteredCount) {
      log(`[Dify] ⚠️ 警告: 分子分母不一致！差异: ${originalFilteredCount - finalResultCount} 条`)
    }
  } catch (error) {
    log(`[Dify] 任务 ${taskId} 处理失败: ${error}`)
    log(`[Dify] 错误堆栈: ${error instanceof Error ? error.stack : ''}`)
    await taskManager.updateTaskStatus(taskId, 'failed')
    throw error
  }
}

