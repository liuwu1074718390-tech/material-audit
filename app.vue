<template>
  <el-config-provider :locale="locale">
    <NuxtPage />
  </el-config-provider>
</template>

<script setup lang="ts">
// 全局配置
useHead({
  title: '材价审计系统',
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'description', content: '材价审计管理系统' }
  ]
})

// Element Plus 语言配置 - 使用默认配置避免 SSR 问题
// 如果需要中文，可以在组件中单独配置
const locale = {}
</script>

