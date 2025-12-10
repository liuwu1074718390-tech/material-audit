<template>
  <el-config-provider :locale="locale">
    <NuxtPage />
  </el-config-provider>
</template>

<script setup lang="ts">
import zhCn from 'element-plus/es/locale/lang/zh-cn'

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
const locale = zhCn
</script>

