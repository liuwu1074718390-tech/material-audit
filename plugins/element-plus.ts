// 按需导入 Element Plus 组件，减少构建负担
import {
  ElButton,
  ElTable,
  ElTableColumn,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElSelect,
  ElOption,
  ElUpload,
  ElCascader,
  ElDatePicker,
  ElTag,
  ElIcon,
  ElPagination,
  ElText,
  ElAlert,
  ElConfigProvider,
  ElMessage,
  ElMessageBox
} from 'element-plus'

export default defineNuxtPlugin((nuxtApp) => {
  // 注册组件
  nuxtApp.vueApp.component('ElButton', ElButton)
  nuxtApp.vueApp.component('ElTable', ElTable)
  nuxtApp.vueApp.component('ElTableColumn', ElTableColumn)
  nuxtApp.vueApp.component('ElDialog', ElDialog)
  nuxtApp.vueApp.component('ElForm', ElForm)
  nuxtApp.vueApp.component('ElFormItem', ElFormItem)
  nuxtApp.vueApp.component('ElInput', ElInput)
  nuxtApp.vueApp.component('ElSelect', ElSelect)
  nuxtApp.vueApp.component('ElOption', ElOption)
  nuxtApp.vueApp.component('ElUpload', ElUpload)
  nuxtApp.vueApp.component('ElCascader', ElCascader)
  nuxtApp.vueApp.component('ElDatePicker', ElDatePicker)
  nuxtApp.vueApp.component('ElTag', ElTag)
  nuxtApp.vueApp.component('ElIcon', ElIcon)
  nuxtApp.vueApp.component('ElPagination', ElPagination)
  nuxtApp.vueApp.component('ElText', ElText)
  nuxtApp.vueApp.component('ElAlert', ElAlert)
  nuxtApp.vueApp.component('ElConfigProvider', ElConfigProvider)
  
  // 注册全局方法
  nuxtApp.vueApp.config.globalProperties.$message = ElMessage
  nuxtApp.vueApp.config.globalProperties.$msgbox = ElMessageBox
  nuxtApp.vueApp.config.globalProperties.$alert = ElMessageBox.alert
  nuxtApp.vueApp.config.globalProperties.$confirm = ElMessageBox.confirm
  nuxtApp.vueApp.config.globalProperties.$prompt = ElMessageBox.prompt
})
