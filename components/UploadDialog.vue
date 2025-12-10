<template>
  <el-dialog
    v-model="visible"
    :title="currentStep === 1 ? '上传文件' : '配置审计参数'"
    width="700px"
    class="audit-dialog"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <!-- 步骤1: 文件上传 -->
    <div v-if="currentStep === 1">
      <el-upload
        ref="uploadRef"
        class="upload-demo"
        drag
        :auto-upload="false"
        :on-change="handleFileChange"
        :limit="1"
        accept=".xls,.xlsx"
        :file-list="fileList"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          将文件拖到此处，或<em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            只支持 .xls / .xlsx 格式的Excel文件
          </div>
        </template>
      </el-upload>

      <div v-if="parseError" style="color: red; margin-top: 10px;">
        {{ parseError }}
      </div>
    </div>

    <!-- 步骤2: 配置参数 -->
    <div v-else-if="currentStep === 2">
      <el-form :model="formData" label-width="100px">
        <el-form-item label="地区">
          <el-cascader
            v-model="formData.地区"
            :options="regionOptions"
            :props="cascaderProps"
            placeholder="请选择省或市（选填）"
            clearable
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="时间范围">
          <el-date-picker
            v-model="formData.时间"
            type="monthrange"
            range-separator="至"
            start-placeholder="开始月份"
            end-placeholder="结束月份"
            format="YYYY年MM月"
            value-format="YYYY-MM"
            clearable
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="材料类别">
          <el-select
            v-model="formData.类别"
            multiple
            collapse-tags
            collapse-tags-tooltip
            placeholder="请选择类别（选填）"
            clearable
            style="width: 100%"
          >
            <el-option
              v-for="category in categoryOptions"
              :key="category"
              :label="category"
              :value="category"
            />
          </el-select>
        </el-form-item>
      </el-form>

      <div v-if="parsedData.length > 0" style="margin-top: 20px;">
        <el-text type="info">
          已解析 {{ parsedData.length }} 条材料数据
        </el-text>
      </div>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button 
          v-if="currentStep === 2" 
          @click="currentStep = 1"
        >
          上一步
        </el-button>
        <el-button
          v-if="currentStep === 1"
          type="primary"
          @click="handleNext"
          :disabled="!fileList.length"
          :loading="parsing"
        >
          下一步
        </el-button>
        <el-button
          v-else
          type="primary"
          @click="handleSubmit"
          :loading="submitting"
        >
          发起材价审计
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { UploadFilled } from '@element-plus/icons-vue'
import type { UploadProps, UploadUserFile, UploadInstance } from 'element-plus'
import type { ExcelRowData, AuditFormData, AuditResultData } from '~/types'
import * as XLSX from 'xlsx'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'success', results: AuditResultData[]): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const uploadRef = ref<UploadInstance>()
const currentStep = ref(1)
const fileList = ref<UploadUserFile[]>([])
const parsedData = ref<ExcelRowData[]>([])
const categoryOptions = ref<string[]>([])
const parseError = ref('')
const parsing = ref(false)
const submitting = ref(false)

const formData = ref<AuditFormData>({
  地区: undefined,
  时间: undefined,
  类别: []
})

// 级联选择器配置：支持只选择省
const cascaderProps = {
  checkStrictly: true,
  emitPath: false
}

// 地区选项（完整的省市数据）
const regionOptions = [
  {
    value: '广东省',
    label: '广东省',
    children: [
      { value: '广州市', label: '广州市' },
      { value: '深圳市', label: '深圳市' },
      { value: '珠海市', label: '珠海市' },
      { value: '汕头市', label: '汕头市' },
      { value: '佛山市', label: '佛山市' },
      { value: '韶关市', label: '韶关市' },
      { value: '湛江市', label: '湛江市' },
      { value: '肇庆市', label: '肇庆市' },
      { value: '江门市', label: '江门市' },
      { value: '茂名市', label: '茂名市' },
      { value: '惠州市', label: '惠州市' },
      { value: '梅州市', label: '梅州市' },
      { value: '汕尾市', label: '汕尾市' },
      { value: '河源市', label: '河源市' },
      { value: '阳江市', label: '阳江市' },
      { value: '清远市', label: '清远市' },
      { value: '东莞市', label: '东莞市' },
      { value: '中山市', label: '中山市' },
      { value: '潮州市', label: '潮州市' },
      { value: '揭阳市', label: '揭阳市' },
      { value: '云浮市', label: '云浮市' }
    ]
  },
  {
    value: '北京市',
    label: '北京市',
    children: [
      { value: '东城区', label: '东城区' },
      { value: '西城区', label: '西城区' },
      { value: '朝阳区', label: '朝阳区' },
      { value: '丰台区', label: '丰台区' },
      { value: '石景山区', label: '石景山区' },
      { value: '海淀区', label: '海淀区' },
      { value: '门头沟区', label: '门头沟区' },
      { value: '房山区', label: '房山区' },
      { value: '通州区', label: '通州区' },
      { value: '顺义区', label: '顺义区' },
      { value: '昌平区', label: '昌平区' },
      { value: '大兴区', label: '大兴区' },
      { value: '怀柔区', label: '怀柔区' },
      { value: '平谷区', label: '平谷区' },
      { value: '密云区', label: '密云区' },
      { value: '延庆区', label: '延庆区' }
    ]
  },
  {
    value: '上海市',
    label: '上海市',
    children: [
      { value: '黄浦区', label: '黄浦区' },
      { value: '徐汇区', label: '徐汇区' },
      { value: '长宁区', label: '长宁区' },
      { value: '静安区', label: '静安区' },
      { value: '普陀区', label: '普陀区' },
      { value: '虹口区', label: '虹口区' },
      { value: '杨浦区', label: '杨浦区' },
      { value: '闵行区', label: '闵行区' },
      { value: '宝山区', label: '宝山区' },
      { value: '嘉定区', label: '嘉定区' },
      { value: '浦东新区', label: '浦东新区' },
      { value: '金山区', label: '金山区' },
      { value: '松江区', label: '松江区' },
      { value: '青浦区', label: '青浦区' },
      { value: '奉贤区', label: '奉贤区' },
      { value: '崇明区', label: '崇明区' }
    ]
  },
  {
    value: '天津市',
    label: '天津市',
    children: [
      { value: '和平区', label: '和平区' },
      { value: '河东区', label: '河东区' },
      { value: '河西区', label: '河西区' },
      { value: '南开区', label: '南开区' },
      { value: '河北区', label: '河北区' },
      { value: '红桥区', label: '红桥区' },
      { value: '东丽区', label: '东丽区' },
      { value: '西青区', label: '西青区' },
      { value: '津南区', label: '津南区' },
      { value: '北辰区', label: '北辰区' },
      { value: '武清区', label: '武清区' },
      { value: '宝坻区', label: '宝坻区' },
      { value: '滨海新区', label: '滨海新区' },
      { value: '宁河区', label: '宁河区' },
      { value: '静海区', label: '静海区' },
      { value: '蓟州区', label: '蓟州区' }
    ]
  },
  {
    value: '重庆市',
    label: '重庆市',
    children: [
      { value: '万州区', label: '万州区' },
      { value: '涪陵区', label: '涪陵区' },
      { value: '渝中区', label: '渝中区' },
      { value: '大渡口区', label: '大渡口区' },
      { value: '江北区', label: '江北区' },
      { value: '沙坪坝区', label: '沙坪坝区' },
      { value: '九龙坡区', label: '九龙坡区' },
      { value: '南岸区', label: '南岸区' },
      { value: '北碚区', label: '北碚区' },
      { value: '綦江区', label: '綦江区' },
      { value: '大足区', label: '大足区' },
      { value: '渝北区', label: '渝北区' },
      { value: '巴南区', label: '巴南区' },
      { value: '黔江区', label: '黔江区' },
      { value: '长寿区', label: '长寿区' },
      { value: '江津区', label: '江津区' },
      { value: '合川区', label: '合川区' },
      { value: '永川区', label: '永川区' },
      { value: '南川区', label: '南川区' },
      { value: '璧山区', label: '璧山区' },
      { value: '铜梁区', label: '铜梁区' },
      { value: '潼南区', label: '潼南区' },
      { value: '荣昌区', label: '荣昌区' },
      { value: '开州区', label: '开州区' },
      { value: '梁平区', label: '梁平区' },
      { value: '武隆区', label: '武隆区' }
    ]
  },
  {
    value: '浙江省',
    label: '浙江省',
    children: [
      { value: '杭州市', label: '杭州市' },
      { value: '宁波市', label: '宁波市' },
      { value: '温州市', label: '温州市' },
      { value: '嘉兴市', label: '嘉兴市' },
      { value: '湖州市', label: '湖州市' },
      { value: '绍兴市', label: '绍兴市' },
      { value: '金华市', label: '金华市' },
      { value: '衢州市', label: '衢州市' },
      { value: '舟山市', label: '舟山市' },
      { value: '台州市', label: '台州市' },
      { value: '丽水市', label: '丽水市' }
    ]
  },
  {
    value: '江苏省',
    label: '江苏省',
    children: [
      { value: '南京市', label: '南京市' },
      { value: '无锡市', label: '无锡市' },
      { value: '徐州市', label: '徐州市' },
      { value: '常州市', label: '常州市' },
      { value: '苏州市', label: '苏州市' },
      { value: '南通市', label: '南通市' },
      { value: '连云港市', label: '连云港市' },
      { value: '淮安市', label: '淮安市' },
      { value: '盐城市', label: '盐城市' },
      { value: '扬州市', label: '扬州市' },
      { value: '镇江市', label: '镇江市' },
      { value: '泰州市', label: '泰州市' },
      { value: '宿迁市', label: '宿迁市' }
    ]
  },
  {
    value: '福建省',
    label: '福建省',
    children: [
      { value: '福州市', label: '福州市' },
      { value: '厦门市', label: '厦门市' },
      { value: '莆田市', label: '莆田市' },
      { value: '三明市', label: '三明市' },
      { value: '泉州市', label: '泉州市' },
      { value: '漳州市', label: '漳州市' },
      { value: '南平市', label: '南平市' },
      { value: '龙岩市', label: '龙岩市' },
      { value: '宁德市', label: '宁德市' }
    ]
  },
  {
    value: '山东省',
    label: '山东省',
    children: [
      { value: '济南市', label: '济南市' },
      { value: '青岛市', label: '青岛市' },
      { value: '淄博市', label: '淄博市' },
      { value: '枣庄市', label: '枣庄市' },
      { value: '东营市', label: '东营市' },
      { value: '烟台市', label: '烟台市' },
      { value: '潍坊市', label: '潍坊市' },
      { value: '济宁市', label: '济宁市' },
      { value: '泰安市', label: '泰安市' },
      { value: '威海市', label: '威海市' },
      { value: '日照市', label: '日照市' },
      { value: '临沂市', label: '临沂市' },
      { value: '德州市', label: '德州市' },
      { value: '聊城市', label: '聊城市' },
      { value: '滨州市', label: '滨州市' },
      { value: '菏泽市', label: '菏泽市' }
    ]
  },
  {
    value: '四川省',
    label: '四川省',
    children: [
      { value: '成都市', label: '成都市' },
      { value: '自贡市', label: '自贡市' },
      { value: '攀枝花市', label: '攀枝花市' },
      { value: '泸州市', label: '泸州市' },
      { value: '德阳市', label: '德阳市' },
      { value: '绵阳市', label: '绵阳市' },
      { value: '广元市', label: '广元市' },
      { value: '遂宁市', label: '遂宁市' },
      { value: '内江市', label: '内江市' },
      { value: '乐山市', label: '乐山市' },
      { value: '南充市', label: '南充市' },
      { value: '眉山市', label: '眉山市' },
      { value: '宜宾市', label: '宜宾市' },
      { value: '广安市', label: '广安市' },
      { value: '达州市', label: '达州市' },
      { value: '雅安市', label: '雅安市' },
      { value: '巴中市', label: '巴中市' },
      { value: '资阳市', label: '资阳市' }
    ]
  }
]

// 文件变化处理
const handleFileChange: UploadProps['onChange'] = (file) => {
  fileList.value = [file]
  parseError.value = ''
}

// 解析Excel文件
const parseExcelFile = (file: File): Promise<ExcelRowData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: 'binary' })
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        
        // 获取表格范围
        const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1')
        const mappedData: ExcelRowData[] = []
        
        // 从第2行开始读取（第1行是表头，索引从0开始，所以从1开始）
        for (let rowNum = range.s.r + 1; rowNum <= range.e.r; rowNum++) {
          // 按列位置读取单元格（A=0, B=1, C=2...）
          const getCellValue = (col: number) => {
            const cellAddress = XLSX.utils.encode_cell({ r: rowNum, c: col })
            const cell = worksheet[cellAddress]
            return cell ? (cell.v !== undefined ? String(cell.v).trim() : '') : ''
          }
          
          const 编码 = getCellValue(1) // B列（索引1）
          
          // 只处理有编码的行
          if (编码) {
            const 数量 = parseFloat(getCellValue(6)) || 0
            const 不含税市场价 = parseFloat(getCellValue(8)) || 0 // I列（索引8）
            
            mappedData.push({
              序号: getCellValue(0) || (mappedData.length + 1), // A列
              编码: 编码,                                          // B列
              类别: getCellValue(2),                              // C列（重要：类别在C列）
              名称: getCellValue(3),                              // D列
              规格型号: getCellValue(4),                          // E列
              单位: getCellValue(5),                              // F列
              数量: 数量,                                          // G列
              不含税市场价: 不含税市场价,                          // I列（索引8）
              税率: parseFloat(getCellValue(10)) || 0,            // K列（索引10）
              不含税市场价合计: parseFloat(getCellValue(11)) || 0 // L列（索引11）
            })
          }
        }
        
        console.log('解析完成，共', mappedData.length, '条数据')
        console.log('类别示例：', mappedData.slice(0, 3).map(item => item.类别))
        
        resolve(mappedData)
      } catch (error) {
        console.error('Excel解析错误：', error)
        reject(error)
      }
    }
    
    reader.onerror = () => {
      reject(new Error('文件读取失败'))
    }
    
    reader.readAsBinaryString(file)
  })
}

// 下一步
const handleNext = async () => {
  if (!fileList.value.length) {
    return
  }

  parsing.value = true
  parseError.value = ''

  try {
    const file = fileList.value[0].raw
    if (!file) {
      throw new Error('文件不存在')
    }

    const data = await parseExcelFile(file)
    parsedData.value = data

    // 提取类别选项（C列，去重）
    const categories = new Set<string>()
    data.forEach(item => {
      if (item.类别) {
        categories.add(item.类别)
      }
    })
    categoryOptions.value = Array.from(categories).sort()

    currentStep.value = 2
  } catch (error: any) {
    parseError.value = error.message || '文件解析失败，请确认文件格式正确'
    console.error('解析错误:', error)
  } finally {
    parsing.value = false
  }
}

// 提交审计
const handleSubmit = async () => {
  submitting.value = true

  try {
    // 先检查数据库健康状态
    const { data: healthData, error: healthError } = await useFetch('/api/health/db')
    if (healthError.value || !healthData.value || !(healthData.value as any).healthy) {
      const healthInfo = healthData.value as any
      let errorMsg = '数据库配置异常，无法创建审计任务\n\n'
      
      if (healthInfo.checks) {
        if (healthInfo.checks.connection?.status === 'error') {
          errorMsg += `❌ 数据库连接失败\n${healthInfo.checks.connection.message}\n\n`
          if (healthInfo.suggestion) {
            errorMsg += `💡 建议: ${healthInfo.suggestion}\n\n`
          }
        }
        if (healthInfo.checks.tables?.status === 'error') {
          errorMsg += `❌ 缺少数据表: ${healthInfo.checks.tables.missing?.join(', ')}\n\n`
          errorMsg += `💡 解决方案: 请在腾讯云 MySQL 数据库中执行 database/schema.sql 文件中的 SQL 语句\n\n`
        }
        if (healthInfo.checks.config?.status === 'error') {
          errorMsg += `❌ 配置不完整: ${healthInfo.checks.config.message}\n\n`
          errorMsg += `💡 解决方案: 请在 .env 文件中配置数据库连接信息\n\n`
        }
      }
      
      errorMsg += '详细诊断信息已输出到控制台，请查看浏览器开发者工具'
      console.error('[数据库诊断]', healthData.value)
      
      ElMessageBox.alert(errorMsg, '数据库配置错误', {
        confirmButtonText: '我知道了',
        type: 'error',
        dangerouslyUseHTMLString: false
      })
      return
    }

    // 调用后端API，创建审计任务
    const { data, error } = await useFetch('/api/dify/audit', {
      method: 'POST',
      body: {
        materials: parsedData.value,
        region: formData.value.地区,
        timeRange: formData.value.时间,
        categories: formData.value.类别,
        projectName: fileList.value[0]?.name || '未命名项目'
      }
    })

    if (error.value) {
      // 如果创建任务失败，再次检查数据库状态
      const { data: recheckData } = await useFetch('/api/health/db')
      if (recheckData.value && !(recheckData.value as any).healthy) {
        const healthInfo = recheckData.value as any
        let errorMsg = '创建任务失败，数据库可能存在问题\n\n'
        if (healthInfo.message) {
          errorMsg += `${healthInfo.message}\n\n`
        }
        if (healthInfo.suggestion) {
          errorMsg += `💡 建议: ${healthInfo.suggestion}`
        }
        console.error('[数据库诊断]', recheckData.value)
        ElMessageBox.alert(errorMsg, '操作失败', {
          confirmButtonText: '我知道了',
          type: 'error'
        })
        return
      }
      throw new Error(error.value.message || '审计失败')
    }

    if (data.value) {
      const taskId = (data.value as any).taskId
      const projectName = (data.value as any).projectName || fileList.value[0]?.name || '未命名项目'
      const totalMaterials = parsedData.value.length
      
      ElMessage.success('审计任务已创建，正在后台处理...')
      
      // 传递任务ID给父组件
      emit('success', { taskId, projectName, totalMaterials } as any)
      handleClose()
    }
  } catch (error: any) {
    ElMessage.error(error.message || '审计失败，请稍后重试')
    console.error('审计错误:', error)
  } finally {
    submitting.value = false
  }
}

// 关闭弹窗
const handleClose = () => {
  visible.value = false
  // 重置状态
  setTimeout(() => {
    currentStep.value = 1
    fileList.value = []
    parsedData.value = []
    categoryOptions.value = []
    parseError.value = ''
    formData.value = {
      地区: undefined,
      时间: undefined,
      类别: []
    }
  }, 300)
}
</script>

<style scoped lang="scss">
.upload-demo {
  width: 100%;
}

:deep(.el-upload-dragger) {
  width: 100%;
}

.el-icon--upload {
  font-size: 67px;
  color: #409eff;
  margin-bottom: 16px;
}

.el-upload__text {
  font-size: 14px;
  em {
    color: #409eff;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>

