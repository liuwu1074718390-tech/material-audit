// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false },
  
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
    // 多平台部署配置
    // - Vercel: 自动检测，无需 preset
    // - Netlify: 需要 preset: 'netlify'（在 Netlify 部署时会自动设置）
    // 可以通过环境变量控制：NETLIFY=1 时使用 netlify preset
    preset: process.env.NETLIFY ? 'netlify' : undefined,
    // 服务端路由配置
    routeRules: {
      // API 路由允许 CORS
      '/api/**': { 
        cors: true,
        headers: { 'cache-control': 'no-store' }
      },
      // 静态资源缓存策略
      '/_nuxt/**': { 
        headers: { 'cache-control': 'public, max-age=31536000, immutable' } 
      }
    }
  },
  
  vite: {
    resolve: {
      // 使用 ESM 版本的 dayjs，避免浏览器原生 ESM 导致的 default 导出报错
      alias: {
        dayjs: 'dayjs/esm/index.js'
      }
    },
    optimizeDeps: {
      include: ['dayjs/esm']
    },
    ssr: {
      // 确保 xlsx 在服务器端也被正确处理（虽然不会用到）
      noExternal: ['xlsx', 'dayjs']
    }
  },

  elementPlus: {
    /** Options */
  },

  compatibilityDate: '2024-12-09'
})

