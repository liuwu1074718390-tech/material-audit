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
      // 修复 dayjs 插件路径解析问题
      alias: {
        // 保持 dayjs 的正常导入，让 Element Plus 可以找到插件
        // dayjs: 'dayjs/esm/index.js'  // 注释掉，避免 Element Plus 找不到插件
      }
    },
    optimizeDeps: {
      include: ['dayjs/esm'],
      // 排除 element-plus，使用按需导入
      exclude: ['element-plus'],
      // 减少预构建的依赖数量
      force: false
    },
    ssr: {
      // 将 element-plus 设为 external，减少 SSR 构建负担
      // xlsx 和 dayjs 仍然需要 noExternal
      noExternal: ['xlsx', 'dayjs']
    },
    build: {
      // 减少内存使用
      chunkSizeWarningLimit: 2000,
      // 减少并发处理，降低内存峰值
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: false // 保留 console，减少压缩时间
        }
      },
      rollupOptions: {
        // 减少输出文件数量
        output: {
          // 更激进的代码分割，减少单个 chunk 大小
          manualChunks: (id) => {
            // Element Plus 单独打包
            if (id.includes('node_modules/element-plus')) {
              return 'element-plus'
            }
            // Vue 相关单独打包
            if (id.includes('node_modules/vue') || id.includes('node_modules/@vue')) {
              return 'vue-vendor'
            }
            // Nuxt 相关单独打包
            if (id.includes('node_modules/nuxt') || id.includes('node_modules/@nuxt')) {
              return 'nuxt-vendor'
            }
            // 其他 node_modules
            if (id.includes('node_modules')) {
              return 'vendor'
            }
          },
          // 减少 chunk 大小限制
          chunkFileNames: 'js/[name]-[hash].js',
          entryFileNames: 'js/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]'
        },
        // 减少并行处理
        maxParallelFileOps: 2
      }
    }
  }
})

