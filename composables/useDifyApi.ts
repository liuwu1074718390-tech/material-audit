import type { ExcelRowData, AuditResultData } from '~/types'

/**
 * Dify API组合式函数
 */
export const useDifyApi = () => {
  const config = useRuntimeConfig()

  /**
   * 调用Dify审计工作流
   * @param materials 材料数据
   * @param params 审计参数
   */
  const runAuditWorkflow = async (
    materials: ExcelRowData[],
    params: {
      region?: string | string[]
      timeRange?: string[]
      categories?: string[]
    }
  ): Promise<AuditResultData[]> => {
    try {
      const { data, error } = await useFetch('/api/dify/audit', {
        method: 'POST',
        body: {
          materials,
          region: params.region,
          timeRange: params.timeRange,
          categories: params.categories
        }
      })

      if (error.value) {
        throw new Error(error.value.message || '调用Dify API失败')
      }

      return data.value as AuditResultData[]
    } catch (error: any) {
      console.error('Dify API错误:', error)
      throw error
    }
  }

  /**
   * 获取Dify工作流状态（如果需要异步查询）
   */
  const getWorkflowStatus = async (workflowRunId: string) => {
    // TODO: 实现工作流状态查询
    return { status: 'completed' }
  }

  return {
    runAuditWorkflow,
    getWorkflowStatus
  }
}

