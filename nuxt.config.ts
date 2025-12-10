// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: process.env.NODE_ENV === 'development' },
  
  modules: [
    '@element-plus/nuxt'
  ],

  css: [
    '~/assets/styles/main.scss'
  ],

  runtimeConfig: {
    // 服务端环境变量
    difyApiKey: process.env.DIFY_API_KEY || '',
    difyApiUrl: process.env.DIFY_API_URL || '',
    difyWorkflowId: process.env.DIFY_WORKFLOW_ID || '',
    
    // 数据库配置
    dbHost: process.env.DB_HOST || '',
    dbPort: process.env.DB_PORT || '3306',
    dbUser: process.env.DB_USER || '',
    dbPassword: process.env.DB_PASSWORD || '',
    dbName: process.env.DB_NAME || '',
    
    // 客户端可访问的环境变量
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || '/api'
    }
  },

  nitro: {
    // Netlify 适配器配置
    preset: 'netlify',
    // 服务端路由配置
    routeRules: {
      '/api/**': { cors: true }
    }
  },

  elementPlus: {
    /** Options */
  },

  compatibilityDate: '2024-12-09'
})

