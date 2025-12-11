#!/usr/bin/env node

/**
 * 简化版构建脚本 - 尝试使用 @nuxt/kit 直接构建，完全绕过 CLI
 */

import { existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')

// 设置环境变量
// 确保有足够的内存限制
if (!process.env.NODE_OPTIONS) {
  process.env.NODE_OPTIONS = '--max-old-space-size=8192 --no-warnings'
} else if (!process.env.NODE_OPTIONS.includes('max-old-space-size')) {
  // 如果设置了 NODE_OPTIONS 但没有内存限制，添加默认值
  process.env.NODE_OPTIONS = process.env.NODE_OPTIONS + ' --max-old-space-size=8192'
}

process.env.NUXT_TELEMETRY_DISABLED = '1'
process.env.NUXT_NO_VERSION_CHECK = '1'
process.env.NODE_ENV = 'production'
if (process.env.NETLIFY !== '0') {
  process.env.NETLIFY = process.env.NETLIFY || '1'
}

console.log('🔧 NODE_OPTIONS:', process.env.NODE_OPTIONS)

const outputDir = join(rootDir, '.output', 'public')
const serverDir = join(rootDir, '.output', 'server')
const nitroJsonPath = join(rootDir, '.output', 'nitro.json')

console.log('🚀 Starting direct Nuxt build using @nuxt/kit...')
console.log('📁 Working directory:', rootDir)

async function main() {
  try {
    // 使用 @nuxt/kit 直接构建
    const { loadNuxt, buildNuxt } = await import('@nuxt/kit')
    
    console.log('📦 Loading Nuxt configuration...')
    const nuxt = await loadNuxt({
      rootDir,
      dev: false
    })
    
    console.log('✅ Config loaded')
    console.log('🔨 Starting build...')
    
    await buildNuxt(nuxt)
    
    // 检查输出
    if (existsSync(outputDir) || existsSync(serverDir) || existsSync(nitroJsonPath)) {
      console.log('\n✅ Build completed successfully!')
      if (existsSync(nitroJsonPath)) {
        console.log('✅ nitro.json found at:', nitroJsonPath)
      }
      if (existsSync(outputDir)) {
        console.log('✅ Public output found at:', outputDir)
      }
      if (existsSync(serverDir)) {
        console.log('✅ Server output found at:', serverDir)
      }
      process.exit(0)
    } else {
      console.error('\n❌ Build completed but no output found')
      console.error('Expected output at:', outputDir, 'or', serverDir)
      process.exit(1)
    }
  } catch (error) {
    console.error('\n❌ Build failed:')
    console.error(error.message)
    if (error.stack) {
      console.error('\nStack trace:')
      console.error(error.stack)
    }
    process.exit(1)
  }
}

main()

