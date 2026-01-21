<template>
  <div class="task-detail-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <el-button @click="goBack" :icon="ArrowLeft">返回列表</el-button>
        <div class="task-title">
          <h1>{{ taskInfo?.projectName || '审计详情' }}</h1>
          <el-tag :type="getTaskStatusType(taskInfo?.status)" size="large">
            {{ getTaskStatusText(taskInfo?.status) }}
          </el-tag>
        </div>
      </div>
      <div class="header-right">
        <el-button @click="refreshData" :icon="Refresh" :loading="loading">刷新</el-button>
        <el-button type="danger" @click="handleDelete" :icon="Delete">删除任务</el-button>
      </div>
    </div>

    <!-- 任务信息卡片 -->
    <el-card class="info-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="card-title">任务信息</span>
        </div>
      </template>
      <el-descriptions :column="6" border>
        <el-descriptions-item label="任务ID">{{ taskId }}</el-descriptions-item>
        <el-descriptions-item label="项目名称">{{ taskInfo?.projectName }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDateTime(taskInfo?.createdAt) }}</el-descriptions-item>
        <el-descriptions-item label="材料总数">{{ taskInfo?.totalMaterials }}</el-descriptions-item>
        <el-descriptions-item label="完成数量">{{ taskInfo?.resultCount }}</el-descriptions-item>
        <el-descriptions-item label="完成进度">
          <el-progress 
            :percentage="Math.round((taskInfo?.resultCount || 0) / (taskInfo?.totalMaterials || 1) * 100)" 
            :status="taskInfo?.status === 'completed' ? 'success' : undefined"
          />
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 审计结果表格 -->
    <el-card class="result-card" shadow="never" v-loading="loading">
      <template #header>
        <div class="card-header">
          <span class="card-title">审计结果 ({{ results.length }} 条)</span>
        </div>
      </template>
      
      <div v-if="results.length === 0" class="empty-state">
        <el-empty description="暂无审计结果" />
      </div>
      
      <AuditResultTable 
        v-else
        :data="results"
        :show-filters="true"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, Refresh, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import AuditResultTable from '~/components/AuditResultTable.vue'
import type { AuditResultData } from '~/types'

const route = useRoute()
const router = useRouter()
const taskId = route.params.id as string

const loading = ref(true)
const taskInfo = ref<any>(null)
const results = ref<AuditResultData[]>([])

// 获取任务详情
const fetchTaskDetail = async () => {
  loading.value = true
  try {
    console.log('[TaskDetail] 获取任务详情:', taskId)
    const { data, error } = await useFetch(`/api/dify/task/${taskId}`)
    
    if (error.value) {
      console.error('[TaskDetail] 获取失败:', error.value)
      ElMessage.error('获取任务详情失败')
      return
    }
    
    if (data.value) {
      const info = data.value as any
      console.log('[TaskDetail] 收到任务数据:', {
        taskId: info.taskId,
        resultCount: info.resultCount,
        resultsLength: info.results?.length || 0
      })
      
      taskInfo.value = {
        taskId: info.taskId,
        projectName: info.projectName,
        status: info.status,
        totalMaterials: info.totalMaterials,
        resultCount: info.resultCount || info.results?.length || 0,
        createdAt: info.createdAt,
        updatedAt: info.updatedAt
      }
      
      results.value = info.results || []
      
      if (results.value.length === 0) {
        console.warn('[TaskDetail] 结果为空')
      }
    }
  } catch (err: any) {
    console.error('[TaskDetail] 获取异常:', err)
    ElMessage.error('获取任务详情失败: ' + (err.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

// 刷新数据
const refreshData = () => {
  fetchTaskDetail()
}

// 返回列表
const goBack = () => {
  router.push('/')
}

// 删除任务
const handleDelete = async () => {
  try {
    await ElMessageBox.confirm('确定要删除该任务吗？', '提示', {
      type: 'warning'
    })
    
    console.log('开始删除任务:', taskId)
    
    try {
      const result = await $fetch(`/api/dify/task/${taskId}`, { method: 'DELETE' })
      console.log('删除成功:', result)
      ElMessage.success('任务已删除')
      
      // 返回列表页
      router.push('/')
    } catch (error: any) {
      console.error('删除请求失败:', error)
      
      // 提取详细错误信息
      let errorMessage = '删除任务失败'
      if (error.data?.message) {
        errorMessage = error.data.message
      } else if (error.message) {
        errorMessage = error.message
      }
      
      // 显示详细错误
      ElMessage({
        type: 'error',
        message: errorMessage,
        duration: 5000,
        showClose: true
      })
      
      // 如果是404错误，仍然返回列表页
      if (error.statusCode === 404) {
        router.push('/')
      }
    }
  } catch (err) {
    if (err !== 'cancel') {
      console.error('删除操作异常:', err)
    }
  }
}

// 状态类型
const getTaskStatusType = (status: string | undefined) => {
  const typeMap: Record<string, any> = {
    'pending': 'info',
    'processing': 'warning',
    'completed': 'success',
    'failed': 'danger',
    'cancelled': 'info'
  }
  return typeMap[status || ''] || 'info'
}

// 状态文本
const getTaskStatusText = (status: string | undefined) => {
  const textMap: Record<string, string> = {
    'pending': '等待中',
    'processing': '进行中',
    'completed': '已完成',
    'failed': '失败',
    'cancelled': '已取消'
  }
  return textMap[status || ''] || status || '未知'
}

// 格式化时间
const formatDateTime = (val: string | Date | undefined) => {
  if (!val) return '-'
  const d = new Date(val)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

// 页面加载时获取数据
onMounted(() => {
  fetchTaskDetail()
})

// 设置页面标题
useHead({
  title: computed(() => `${taskInfo.value?.projectName || '任务详情'} - 材价审计`)
})
</script>

<style scoped lang="scss">
.task-detail-page {
  max-width: 1600px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  
  .header-left {
    display: flex;
    align-items: center;
    gap: 20px;
    
    .task-title {
      display: flex;
      align-items: center;
      gap: 15px;
      
      h1 {
        margin: 0;
        font-size: 24px;
        font-weight: 600;
        color: #303133;
      }
    }
  }
  
  .header-right {
    display: flex;
    gap: 10px;
  }
}

.info-card,
.result-card {
  margin-bottom: 20px;
  
  :deep(.el-card__header) {
    padding: 15px 20px;
    background-color: #fafafa;
    border-bottom: 1px solid #ebeef5;
  }
  
  :deep(.el-card__body) {
    padding: 20px;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .card-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
  }
}

.empty-state {
  padding: 60px 0;
  text-align: center;
}

// 描述列表样式优化
:deep(.el-descriptions) {
  .el-descriptions__label {
    font-weight: 500;
    background-color: #fafafa;
  }
  
  .el-descriptions__content {
    font-weight: 400;
  }
}
</style>
