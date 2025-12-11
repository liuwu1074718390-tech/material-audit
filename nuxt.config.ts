// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false },
  
  modules: [],

  css: [
    '~/assets/styles/main.scss',
    'element-plus/dist/index.css'
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
    // Nitro 兼容性日期
    compatibilityDate: '2025-12-11',
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
      // 不排除 element-plus，让它正常预构建
      // 但通过其他方式优化
    },
    ssr: {
      // 将 element-plus 设为 external，减少 SSR 构建负担
      // xlsx 和 dayjs 仍然需要 noExternal
      noExternal: ['xlsx', 'dayjs']
    },
    build: {
      // 减少内存使用
      chunkSizeWarningLimit: 2000,
      // 增加构建超时时间
      rollupOptions: {
        output: {
          // 手动代码分割，将 element-plus 单独打包
          manualChunks: (id) => {
            if (id.includes('node_modules/element-plus')) {
              return 'element-plus'
            }
            if (id.includes('node_modules')) {
              return 'vendor'
            }
          }
        },
        // 增加外部依赖，减少构建负担
        external: (id) => {
          // 在客户端构建时，element-plus 不应该被 external
          // 这里主要是为了优化 SSR 构建
          return false
        }
      },
      // 增加构建超时（30分钟）
      // 注意：这个选项可能不被 Vite 支持，但我们可以通过其他方式处理
    }
  }
})

