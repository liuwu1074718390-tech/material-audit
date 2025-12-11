<template>
  <el-config-provider :locale="locale">
    <NuxtPage />
  </el-config-provider>
</template>

<script setup lang="ts">
// 只在客户端导入语言包，避免 SSR 问题
const locale = ref({})

onMounted(async () => {
  if (process.client) {
    const zhCnModule = await import('element-plus/es/locale/lang/zh-cn')
    locale.value = zhCnModule.default
  }
})

// 全局配置
useHead({
  title: '材价审计系统',
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'description', content: '材价审计管理系统' }
  ]
})
</script>

