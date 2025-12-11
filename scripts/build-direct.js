#!/usr/bin/env node

/**
 * 直接使用 Nitro API 构建，完全绕过 Nuxt CLI
 * 这是最彻底的解决方案，避免所有 banner 相关问题
 */

import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')

// 设置环境变量
process.env.NODE_OPTIONS = '--no-warnings'
process.env.NUXT_TELEMETRY_DISABLED = '1'
process.env.NODE_ENV = 'production'
process.env.NETLIFY = '1'

console.log('🚀 Starting direct Nitro build (bypassing Nuxt CLI)...')

try {
  // 动态导入模块
  console.log('📦 Loading modules...')
  const { loadNuxt, buildNuxt } = await import('nuxt')
  
  // 加载 Nuxt 实例（这会加载配置）
  console.log('📦 Loading Nuxt instance...')
  const nuxt = await loadNuxt({
    rootDir,
    dev: false,
    overrides: {
      nitro: {
        ...(process.env.NETLIFY ? { preset: 'netlify' } : {})
      }
    }
  })
  
  console.log('✅ Nuxt instance loaded successfully')
  console.log('🔨 Starting build...')
  
  // 使用 Nuxt Kit 的 buildNuxt 函数
  await buildNuxt(nuxt)
  
  console.log('✅ Build completed successfully!')
  process.exit(0)
  
} catch (error) {
  console.error('❌ Build failed:', error.message)
  console.error('Error stack:', error.stack)
  process.exit(1)
}

