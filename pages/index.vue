<template>
  <div class="container">
    <div class="page-header">
      <h1>材价审计工具</h1>
      <p>上传计价文件中导出的材料excel，工具自动解析材料并给出广咨材价库的价格范围作为参考</p>
    </div>

    <div class="main-content">
      <div class="toolbar">
        <el-button 
          type="primary" 
          size="large" 
          @click="openUploadDialog"
          :icon="Upload"
        >
          发起材价审计
        </el-button>
        <!-- 系统健康检查入口已隐藏 -->
        <!-- <el-button 
          type="info" 
          size="large" 
          @click="goToHealthCheck"
          plain
        >
          系统健康检查
        </el-button> -->
      </div>

      <el-table
        :data="tasks"
        border
        stripe
        style="width: 100%; margin-top: 20px;"
        v-loading="loading"
        empty-text="暂无数据"
      >
        <el-table-column label="序号" width="80" align="center">
          <template #default="{ $index }">
            {{ $index + 1 }}
          </template>
        </el-table-column>
        <el-table-column prop="projectName" label="项目名称" min-width="220" />
        <el-table-column label="进度" width="160" align="center">
          <template #default="{ row }">
            {{ row.resultCount || 0 }} / {{ row.totalMaterials || 0 }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getTaskStatusType(row.status)">
              <el-icon v-if="row.status === 'pending' || row.status === 'processing'" class="refresh-icon">
                <Refresh />
              </el-icon>
              {{ getTaskStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="200" align="center">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center">
          <template #default="{ row }">
            <el-button size="small" @click="handleView(row)">查看</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 上传弹窗 -->
    <UploadDialog 
      v-model="uploadDialogVisible" 
      @success="handleUploadSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { Upload, Refresh } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import UploadDialog from '~/components/UploadDialog.vue'

const uploadDialogVisible = ref(false)
const tasks = ref<any[]>([])
const loading = ref(false)
const pollingInterval = ref<any>(null)
const taskPollingIntervals = ref<Map<string, any>>(new Map()) // 每个任务的独立轮询定时器
const router = useRouter()

const openUploadDialog = () => {
  uploadDialogVisible.value = true
}

const goToHealthCheck = () => {
  navigateTo('/health')
}

// 获取完整任务列表
const fetchTasks = async () => {
  loading.value = true
  try {
    const { data, error } = await useFetch('/api/dify/tasks')
    
    if (error.value) {
      console.error('获取任务列表失败:', error.value)
      ElMessage.error('获取任务列表失败')
      return
    }
    
    if (data.value) {
      tasks.value = data.value as any[]
      console.log(`已加载 ${tasks.value.length} 个任务`)
      
      // 为所有进行中的任务启动轮询
      updateTaskPolling(tasks.value)
    }
  } catch (err: any) {
    console.error('获取任务列表异常:', err)
    if (err.message && err.message.includes('Failed to fetch')) {
      ElMessage.error('无法连接到服务器，请确认服务器是否正在运行（npm run dev）')
    } else {
      ElMessage.error('获取任务列表失败: ' + (err.message || '未知错误'))
    }
  } finally {
    loading.value = false
  }
}

// 更新单个任务的状态（局部刷新）
const updateTaskStatus = async (taskId: string) => {
  try {
    const taskStatus = await $fetch(`/api/dify/task/${taskId}/status`) as any
    const index = tasks.value.findIndex(t => t.taskId === taskId)
    if (index !== -1) {
      // 只更新状态相关字段，保留其他字段
      tasks.value[index] = {
        ...tasks.value[index],
        status: taskStatus.status,
        progress: taskStatus.progress,
        resultCount: taskStatus.resultCount,
        totalMaterials: taskStatus.totalMaterials,
        updatedAt: taskStatus.updatedAt
      }
    }
  } catch (err: any) {
    console.error(`更新任务 ${taskId} 状态失败:`, err)
    // 如果任务不存在或已删除，停止轮询
    if (err.statusCode === 404) {
      stopTaskPolling(taskId)
    }
  }
}

// 更新任务轮询：为进行中的任务启动轮询，为已完成的任务停止轮询
const updateTaskPolling = (taskList: any[]) => {
  const currentTaskIds = new Set(taskList.map(t => t.taskId))
  
  // 停止已不存在任务的轮询
  for (const [taskId, interval] of taskPollingIntervals.value.entries()) {
    if (!currentTaskIds.has(taskId)) {
      stopTaskPolling(taskId)
    }
  }
  
  // 为进行中的任务启动或继续轮询
  for (const task of taskList) {
    if (task.status === 'processing' || task.status === 'pending') {
      if (!taskPollingIntervals.value.has(task.taskId)) {
        startTaskPolling(task.taskId)
      }
    } else {
      // 已完成的任务停止轮询
      stopTaskPolling(task.taskId)
    }
  }
}

// 启动单个任务的轮询
const startTaskPolling = (taskId: string) => {
  // 如果已经有轮询，先清除
  if (taskPollingIntervals.value.has(taskId)) {
    clearInterval(taskPollingIntervals.value.get(taskId))
  }
  
  // 立即更新一次
  updateTaskStatus(taskId)
  
  // 每5秒轮询一次
  const interval = setInterval(() => {
    updateTaskStatus(taskId)
  }, 5000)
  
  taskPollingIntervals.value.set(taskId, interval)
}

// 停止单个任务的轮询
const stopTaskPolling = (taskId: string) => {
  const interval = taskPollingIntervals.value.get(taskId)
  if (interval) {
    clearInterval(interval)
    taskPollingIntervals.value.delete(taskId)
  }
}

const handleUploadSuccess = (result: any) => {
  // 本地先插入一条任务，立即反馈
  const newTask = {
    taskId: result.taskId,
    projectName: result.projectName || '未命名项目',
    status: 'pending', // 初始状态为pending
    progress: 0,
    resultCount: 0,
    totalMaterials: result.totalMaterials || 0,
    createdAt: new Date().toISOString()
  }
  tasks.value.unshift(newTask)
  
  // 立即启动该任务的轮询
  startTaskPolling(result.taskId)
  
  // 注释掉自动刷新，避免清空列表
  // setTimeout(() => {
  //   fetchTasks()
  // }, 1000)
}

const handleView = (task: any) => {
  // 在当前标签页打开任务详情页
  router.push(`/task/${task.taskId}`)
}

const handleDelete = async (task: any) => {
  try {
    await ElMessageBox.confirm('确定要删除该任务并中断审计吗？', '提示', {
      type: 'warning'
    })
    
    console.log('开始删除任务:', task.taskId)
    
    try {
      const result = await $fetch(`/api/dify/task/${task.taskId}`, { method: 'DELETE' })
      console.log('删除成功:', result)
      ElMessage.success('任务已删除')
      tasks.value = tasks.value.filter(t => t.taskId !== task.taskId)
      // 停止该任务的轮询
      stopTaskPolling(task.taskId)
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
      
      // 如果是404错误，仍然从列表中移除
      if (error.statusCode === 404) {
        tasks.value = tasks.value.filter(t => t.taskId !== task.taskId)
        stopTaskPolling(task.taskId)
      }
    }
  } catch (err) {
    if (err !== 'cancel') {
      console.error('删除操作异常:', err)
    }
  }
}

const getTaskStatusType = (status: string) => {
  const typeMap: Record<string, any> = {
    'pending': 'info',
    'processing': 'warning',
    'completed': 'success',
    'failed': 'danger',
    'cancelled': 'info'
  }
  return typeMap[status] || 'info'
}

const getTaskStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    'pending': '等待中',
    'processing': '进行中',
    'completed': '已完成',
    'failed': '失败',
    'cancelled': '已取消'
  }
  return textMap[status] || status
}

const formatDateTime = (val: string | Date) => {
  const d = new Date(val)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

onMounted(() => {
  // 初始加载任务列表
  fetchTasks()
  
  // 每30秒刷新一次完整列表（用于检测新任务或已删除的任务）
  pollingInterval.value = setInterval(() => {
    fetchTasks()
  }, 30000)
})

onUnmounted(() => {
  // 清除全局轮询
  if (pollingInterval.value) {
    clearInterval(pollingInterval.value)
  }
  
  // 清除所有任务的局部轮询
  for (const interval of taskPollingIntervals.value.values()) {
    clearInterval(interval)
  }
  taskPollingIntervals.value.clear()
})
</script>

<style scoped lang="scss">
.toolbar {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 10px;
}

// 任务列表表格文字大小调整为13px
:deep(.el-table) {
  font-size: 13px;
  
  .el-table__cell {
    font-size: 13px;
    padding: 8px 0;
  }
  
  .el-table__header th {
    font-size: 13px;
  }
  
  .el-table__body td {
    font-size: 13px;
  }
}

// 刷新图标旋转动画（在状态标签中）
:deep(.el-tag) {
  .refresh-icon {
    animation: rotate 1s linear infinite;
    margin-right: 4px;
    vertical-align: middle;
    display: inline-block;
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

// 审计结果弹窗样式
:deep(.result-dialog) {
  .el-dialog {
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    margin: 10vh auto !important; // 垂直居中（上下各10vh）
  }
  
  // 弹窗标题左对齐
  .el-dialog__header {
    text-align: left;
    padding: 20px 20px 10px;
    flex-shrink: 0; // 防止标题被压缩
  }
  
  .el-dialog__title {
    text-align: left;
  }
  
  .el-dialog__body {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    padding: 20px;
    text-align: left;
    min-height: 0; // 确保flex子元素可以正确收缩
  }
  
  // 确保弹窗不会超出视口
  .el-dialog__wrapper {
    overflow: hidden;
  }
}
</style>

