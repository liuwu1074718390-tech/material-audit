<template>
  <div class="audit-result-table">
    <!-- 筛选器 -->
    <div v-if="showFilters" class="filter-section">
      <el-form :inline="true" :model="filters">
        <el-form-item label="编码">
          <el-input 
            v-model="filters.编码" 
            placeholder="请输入编码"
            clearable
          />
        </el-form-item>
        
        <el-form-item label="类别">
          <el-select 
            v-model="filters.类别" 
            placeholder="请选择类别"
            clearable
            style="width: 180px;"
          >
            <el-option
              v-for="category in categoryList"
              :key="category"
              :label="category"
              :value="category"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="名称">
          <el-input 
            v-model="filters.名称" 
            placeholder="请输入名称"
            clearable
          />
        </el-form-item>
        
        <el-form-item label="规格型号">
          <el-input 
            v-model="filters.规格型号" 
            placeholder="请输入规格型号"
            clearable
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleFilter">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="success" @click="handleExport">导出Excel</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 数据表格 -->
    <div class="table-container">
      <el-table
        :data="paginatedData"
        style="width: 100%"
        border
        stripe
      class="audit-table"
    >
      <el-table-column label="序号" width="80" align="center" fixed="left">
        <template #default="{ $index }">
          {{ (currentPage - 1) * pageSize + $index + 1 }}
        </template>
      </el-table-column>
      <el-table-column prop="编码" label="编码" width="120" align="center" fixed="left" />
      <el-table-column prop="类别" label="类别" width="100" align="center" />
      <el-table-column prop="名称" label="名称" min-width="180" align="center" />
      <el-table-column prop="规格型号" label="规格型号" min-width="200" align="center" />
      <el-table-column prop="单位" label="单位" width="80" align="center" />
      <el-table-column prop="数量" label="数量" width="100" align="center">
        <template #default="{ row }">
          {{ formatQuantity(row.数量) }}
        </template>
      </el-table-column>
      <el-table-column 
        prop="不含税市场价" 
        label="不含税市场价" 
        width="130" 
        align="center"
      >
        <template #default="{ row }">
          {{ formatNumber(row.不含税市场价) }}
        </template>
      </el-table-column>
      <el-table-column prop="税率" label="税率" width="80" align="center">
        <template #default="{ row }">
          {{ row.税率 }}%
        </template>
      </el-table-column>
      <el-table-column 
        prop="不含税市场价合计" 
        label="不含税市场价合计" 
        width="150" 
        align="center"
      >
        <template #default="{ row }">
          {{ formatNumber(row.不含税市场价合计) }}
        </template>
      </el-table-column>
      <el-table-column 
        prop="推荐价格范围" 
        label="推荐价格范围(不含税)" 
        width="180"
        align="center"
        fixed="right"
      />
      <el-table-column 
        prop="价格偏差值" 
        label="价格偏差" 
        width="120"
        align="center"
        fixed="right"
      >
        <template #header>
          <div class="sort-header" @click="toggleSortOrder">
            <span>价格偏差</span>
            <el-icon class="sort-icon">
              <SortDown v-if="sortOrder === 'descending'" />
              <SortUp v-else />
            </el-icon>
          </div>
        </template>
        <template #default="{ row }">
          <span :class="getDeviationClass(row.价格偏差值)">
            {{ row.价格偏差 }}
          </span>
        </template>
      </el-table-column>
    </el-table>
    </div>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="filteredData.length"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AuditResultData, FilterConditions } from '~/types'
import * as XLSX from 'xlsx'
import { SortUp, SortDown } from '@element-plus/icons-vue'

const props = defineProps<{
  data: AuditResultData[]
  showFilters?: boolean
}>()

const emit = defineEmits<{
  (e: 'export', data: AuditResultData[]): void
}>()

const currentPage = ref(1)
const pageSize = ref(20)

const filters = ref<FilterConditions>({
  编码: '',
  类别: '',
  名称: '',
  规格型号: ''
})

// 排序状态
const sortOrder = ref<'descending' | 'ascending'>('descending')

// 类别列表
const categoryList = computed(() => {
  const categories = new Set<string>()
  props.data.forEach(item => {
    if (item.类别) {
      categories.add(item.类别)
    }
  })
  return Array.from(categories).sort()
})

// 筛选后的数据
const filteredData = computed(() => {
  let result = props.data

  if (filters.value.编码) {
    result = result.filter(item => 
      item.编码.includes(filters.value.编码!)
    )
  }

  if (filters.value.类别) {
    result = result.filter(item => 
      item.类别 === filters.value.类别
    )
  }

  if (filters.value.名称) {
    result = result.filter(item => 
      item.名称.includes(filters.value.名称!)
    )
  }

  if (filters.value.规格型号) {
    result = result.filter(item => 
      item.规格型号.includes(filters.value.规格型号!)
    )
  }

  // 按价格偏差绝对值排序
  result = [...result].sort((a, b) => {
    const absA = Math.abs(a.价格偏差值 || 0)
    const absB = Math.abs(b.价格偏差值 || 0)
    if (sortOrder.value === 'descending') {
      return absB - absA // 从高到低
    } else {
      return absA - absB // 从低到高
    }
  })

  return result
})

// 分页后的数据
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredData.value.slice(start, end)
})

// 格式化数字
const formatNumber = (num: number) => {
  return num.toFixed(2)
}

// 格式化数量（四舍五入，最多保留4位小数）
const formatQuantity = (num: number) => {
  if (num === null || num === undefined || isNaN(num)) {
    return ''
  }
  // 四舍五入到4位小数
  const rounded = Math.round(num * 10000) / 10000
  // 移除末尾的0，最多保留4位小数
  return rounded.toFixed(4).replace(/\.?0+$/, '')
}

// 获取价格偏差样式类
const getDeviationClass = (deviation: number) => {
  if (deviation > 20) return 'price-deviation high'
  if (deviation < -20) return 'price-deviation low'
  return 'price-deviation medium'
}

// 筛选
const handleFilter = () => {
  currentPage.value = 1
}

// 重置
const handleReset = () => {
  filters.value = {
    编码: '',
    类别: '',
    名称: '',
    规格型号: ''
  }
  sortOrder.value = 'descending'
  currentPage.value = 1
}

// 切换排序方向
const toggleSortOrder = () => {
  if (sortOrder.value === 'descending') {
    sortOrder.value = 'ascending' // 切换到从小到大
  } else {
    sortOrder.value = 'descending' // 切换到从大到小
  }
  currentPage.value = 1
}

// 导出Excel
const handleExport = () => {
  try {
    // 准备导出数据
    const exportData = filteredData.value.map(row => ({
      '序号': row.序号,
      '编码': row.编码,
      '类别': row.类别,
      '名称': row.名称,
      '规格型号': row.规格型号,
      '单位': row.单位,
      '数量': row.数量,
      '不含税市场价': row.不含税市场价,
      '税率': row.税率 + '%',
      '不含税市场价合计': row.不含税市场价合计,
      '推荐价格范围(不含税)': row.推荐价格范围,
      '价格偏差': row.价格偏差
    }))

    // 创建工作表
    const ws = XLSX.utils.json_to_sheet(exportData)
    
    // 创建工作簿
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '审计结果')

    // 导出文件
    const fileName = `材价审计结果_${new Date().getTime()}.xlsx`
    XLSX.writeFile(wb, fileName)

    ElMessage.success('导出成功！')
    emit('export', filteredData.value)
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败，请稍后重试')
  }
}
</script>

<style scoped lang="scss">
.audit-result-table {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0; // 确保flex子元素可以正确收缩
  overflow: hidden; // 防止内容溢出
}

.filter-section {
  background: #f8f9fa;
  padding: 8px 20px;
  border-radius: 4px;
  margin-bottom: 5px;
  flex-shrink: 0;
  font-size: 13px;
  
  // 表单项标签和内容文字大小
  :deep(.el-form-item__label) {
    font-size: 13px;
  }
  
  :deep(.el-input__inner),
  :deep(.el-select__placeholder),
  :deep(.el-select__selected-item) {
    font-size: 13px;
  }
  
  :deep(.el-button) {
    font-size: 13px;
  }
  
  // 减少表单项之间的间距，确保在同一行
  :deep(.el-form-item) {
    margin-bottom: 0;
    margin-right: 12px;
  }
  
  // 减少表单项内容的高度
  :deep(.el-form-item__content) {
    line-height: 1.2;
  }
  
  // 减少输入框和选择框的高度和宽度
  :deep(.el-input__inner),
  :deep(.el-select .el-input__inner) {
    height: 28px;
    line-height: 28px;
    width: 140px;
  }
  
  // 类别和价格偏差选择框保持180px宽度
  :deep(.el-select[style*="width: 180px"] .el-input__inner) {
    width: 180px;
  }
  
  // 减少按钮高度和间距
  :deep(.el-button) {
    padding: 6px 12px;
    height: 28px;
    margin-left: 0;
    margin-right: 8px;
  }
  
  // 确保表单不换行
  :deep(.el-form) {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
  }
  
  // 按钮组紧凑排列
  :deep(.el-form-item:last-child) {
    margin-left: auto;
    margin-right: 0;
  }
}

// 结果列表表格文字大小调整为13px
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

// 表格容器优化
.table-container {
  flex: 1;
  min-height: 0;
  overflow: auto;
  display: flex;
  flex-direction: column;
}

:deep(.el-table) {
  flex: 1;
  overflow: auto;
}

// 分页容器
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0; // 防止分页被压缩
}

// 排序图标样式
.sort-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s;
  
  &:hover {
    color: #409eff;
    
    .sort-icon {
      color: #409eff;
      transform: scale(1.2);
    }
  }
}

.sort-icon {
  font-size: 18px;
  color: #409eff;
  font-weight: bold;
  transition: all 0.2s;
}

.price-deviation {
  font-weight: bold;
  
  &.high {
    color: #f56c6c;
  }
  
  &.medium {
    color: #67c23a;
  }
  
  &.low {
    color: #e6a23c;
  }
}
</style>

