// 数据类型定义

// Excel行数据
export interface ExcelRowData {
  序号: string | number
  编码: string
  类别: string
  名称: string
  规格型号: string
  单位: string
  数量: number
  不含税市场价: number
  税率: number
  不含税市场价合计: number
}

// 审计表单数据
export interface AuditFormData {
  地区?: string
  时间?: string // 改为字符串类型（兼容旧格式）
  时间范围?: string[] // 年月范围选择器的值 [开始月份, 结束月份]
  类别?: string[]
}

// 审计结果数据
export interface AuditResultData extends ExcelRowData {
  ID: string // 材料唯一ID
  推荐价格范围: string
  价格偏差: string
  价格偏差值: number
  状态: '查价中' | '查价完成' | '查价失败'
  推荐明细?: DifyRecommendation[] // Dify 返回的推荐明细列表
}

// 筛选条件
export interface FilterConditions {
  编码?: string
  类别?: string
  名称?: string
  规格型号?: string
}

// Dify材料输入格式
export interface DifyMaterialInput {
  ID: string
  名称: string
  规格型号: string
  单位: string
}

// Dify请求参数（新格式）
export interface DifyRequestParams {
  inputs: {
    city?: string // 城市编码
    date?: string // 时间范围格式：'2025-01-01'|'2025-10-31'
    material: string // JSON字符串格式的材料数组
  }
  response_mode: 'blocking'
  user: string
}

// Dify返回的单条推荐数据
export interface DifyRecommendation {
  id: string // Dify数据库中的记录ID
  name: string // 材料名称
  spec: string // 规格型号
  remark: string // 单位
  tax_include_amount: string // 含税金额
  tax_exclude_amount: string // 不含税金额
  tax_rate: string // 税率
  publish_date: string // 发布日期
  source?: string | number // 价格类型: 1-厂商报价, 2-市场询价, 3-交易中标价, 4-项目价
  get_way?: string | number // 渠道: 1-慧讯网, 2-广材网, 3-造价通, 4-自行询价, 5-融建网, 6-指标库
  ID: string // 对应我们推送的材料ID
  w: string // 权重系数
}

// Dify响应数据
export interface DifyResponseData {
  workflow_run_id?: string
  task_id?: string
  data?: {
    outputs?: {
      text?: string // JSON字符串，包含推荐数据数组
    }
  }
}

// 审计任务状态
export interface AuditTask {
  taskId: string
  projectName: string // 项目名称（Excel文件名）
  totalMaterials: number // 推送给Dify的材料总数（过滤后）
  materials: ExcelRowData[]
  materialMap: Map<string, ExcelRowData> // ID到材料的映射
  results: AuditResultData[]
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  progress: number // 0-100
  createdAt: Date
  updatedAt: Date
  cancelled?: boolean // 标记是否取消
  abortControllers?: AbortController[] // 用于取消中的Dify调用
}

