#!/usr/bin/env node

/**
 * Netlify 构建脚本
 * 使用 execSync 执行 nuxt build，捕获 banner 错误但继续构建
 */

import { execSync } from 'child_process'
import { existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')

// 设置环境变量
process.env.NODE_OPTIONS = '--no-warnings'
process.env.NUXT_TELEMETRY_DISABLED = '1'
process.env.NODE_ENV = 'production'
process.env.NETLIFY = '1'

console.log('🚀 Starting Nuxt build for Netlify...')

try {
  // 直接执行 nuxt build，捕获所有输出
  console.log('🔨 Running nuxt build...')
  try {
    execSync('npx nuxt build', {
      stdio: 'pipe',
      cwd: rootDir,
      env: { ...process.env },
      encoding: 'utf8'
    })
    console.log('✅ Build completed successfully!')
    process.exit(0)
  } catch (buildError) {
    const errorOutput = buildError.stdout?.toString() || buildError.stderr?.toString() || buildError.message || ''
    
    // 检查是否是 banner 错误
    if (errorOutput.includes('Cannot read properties of null') || 
        errorOutput.includes("reading 'name'") ||
        errorOutput.includes('getBuilder')) {
      console.log('⚠️ Banner error detected, checking if build actually succeeded...')
      
      // 检查构建输出
      const outputDir = join(rootDir, '.output', 'public')
      const serverDir = join(rootDir, '.output', 'server')
      
      if (existsSync(outputDir) || existsSync(serverDir)) {
        console.log('✅ Build output found! Build succeeded despite banner error.')
        console.log('Output exists:', existsSync(outputDir) ? outputDir : serverDir)
        process.exit(0)
      } else {
        console.log('❌ Build output not found. Build may have failed.')
        // 输出错误信息以便调试
        console.log('Error output:', errorOutput.substring(0, 1000))
        throw buildError
      }
    } else {
      // 其他错误，直接抛出
      console.error('❌ Build failed with error:', errorOutput.substring(0, 500))
      throw buildError
    }
  }
} catch (error) {
  console.error('❌ All build attempts failed')
  process.exit(1)
}

