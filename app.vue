<template>
  <el-config-provider :locale="locale">
    <NuxtPage />
  </el-config-provider>
</template>

<script setup lang="ts">
// 动态导入语言包，避免 SSR 问题
let zhCn: any = null
if (process.client) {
  import('element-plus/es/locale/lang/zh-cn').then(module => {
    zhCn = module.default
  })
} else {
  // 服务端使用默认配置
  zhCn = {}
}

// 全局配置
useHead({
  title: '材价审计系统',
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'description', content: '材价审计管理系统' }
  ]
})

// 配置Element Plus使用中文
const locale = zhCn || {}
</script>

