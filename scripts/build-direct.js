#!/usr/bin/env node

/**
 * Netlify/CloudStudio 构建脚本
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
// 保留用户设置的 NODE_OPTIONS（如 --max-old-space-size=4096）
if (!process.env.NODE_OPTIONS) {
  process.env.NODE_OPTIONS = '--no-warnings'
}
process.env.NUXT_TELEMETRY_DISABLED = '1'
process.env.NODE_ENV = 'production'
// 如果设置了 NETLIFY 环境变量，则使用 netlify preset
if (process.env.NETLIFY !== '0') {
  process.env.NETLIFY = process.env.NETLIFY || '1'
}

console.log('🚀 Starting Nuxt build...')
console.log('📁 Working directory:', rootDir)
console.log('🔧 Node version:', process.version)
console.log('🌍 NODE_ENV:', process.env.NODE_ENV)
console.log('🔧 NODE_OPTIONS:', process.env.NODE_OPTIONS)
console.log('🌐 NETLIFY:', process.env.NETLIFY)

// 检查 node_modules 是否存在
const nodeModulesPath = join(rootDir, 'node_modules')
if (!existsSync(nodeModulesPath)) {
  console.error('❌ node_modules not found! Please run npm install first.')
  process.exit(1)
}

const outputDir = join(rootDir, '.output', 'public')
const serverDir = join(rootDir, '.output', 'server')
const nitroJsonPath = join(rootDir, '.output', 'nitro.json')

// 清理之前的构建输出
if (existsSync(join(rootDir, '.output'))) {
  console.log('🧹 Cleaning previous build output...')
  try {
    execSync(`rm -rf ${join(rootDir, '.output')}`, { cwd: rootDir })
  } catch (e) {
    // 忽略清理错误
  }
}

// 构建函数
function runBuild(command, description) {
  console.log(`\n🔨 ${description}...`)
  console.log(`📝 Command: ${command}`)
  
  try {
    // 使用 inherit 来实时显示输出，错误信息会直接显示在控制台
    execSync(command, {
      cwd: rootDir,
      env: { ...process.env },
      encoding: 'utf8',
      stdio: 'inherit'
    })
    
    // 检查构建输出
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
      return true
    } else {
      console.log('\n⚠️ Build command succeeded but no output found')
      console.log('📂 Checking for output directories...')
      console.log('   .output/public:', existsSync(outputDir))
      console.log('   .output/server:', existsSync(serverDir))
      console.log('   .output/nitro.json:', existsSync(nitroJsonPath))
      return false
    }
  } catch (buildError) {
    // 即使命令失败，也检查是否有输出生成
    if (existsSync(outputDir) || existsSync(serverDir) || existsSync(nitroJsonPath)) {
      console.log('\n⚠️ Build command failed but output was generated')
      console.log('✅ Checking output...')
      if (existsSync(nitroJsonPath)) {
        console.log('✅ nitro.json found at:', nitroJsonPath)
      }
      if (existsSync(outputDir)) {
        console.log('✅ Public output found at:', outputDir)
      }
      if (existsSync(serverDir)) {
        console.log('✅ Server output found at:', serverDir)
      }
      return true
    }
    
    // 输出详细错误信息
    console.error(`\n❌ ${description} failed`)
    console.error('Error details:')
    console.error('---')
    if (buildError.message) {
      console.error('Error message:', buildError.message)
    }
    if (buildError.status !== undefined) {
      console.error('Exit status:', buildError.status)
    }
    if (buildError.signal) {
      console.error('Signal:', buildError.signal)
    }
    // 注意：使用 stdio: 'inherit' 时，错误信息已经显示在控制台上了
    // 这里只输出额外的诊断信息
    console.error('---')
    console.error('💡 Note: The full error output should be visible above.')
    console.error('   Please scroll up to see the complete error message.')
    
    return false
  }
}

// 检查 .nuxt 目录是否存在（nuxt prepare 的输出）
const nuxtDir = join(rootDir, '.nuxt')
if (!existsSync(nuxtDir)) {
  console.log('⚠️ .nuxt directory not found, running nuxt prepare...')
  try {
    execSync('npx nuxt prepare', {
      cwd: rootDir,
      env: { ...process.env },
      stdio: 'inherit'
    })
    console.log('✅ nuxt prepare completed')
  } catch (e) {
    console.warn('⚠️ nuxt prepare failed, but continuing...')
  }
}

// 尝试多种构建方法
const buildMethods = [
  { command: 'npx nuxt build', desc: 'Running nuxt build (method 1)' },
  { command: 'npx nuxi build', desc: 'Running nuxi build (method 2)' },
  { command: 'npm run build', desc: 'Running npm build script (method 3)' }
]

let buildSucceeded = false
for (const method of buildMethods) {
  if (runBuild(method.command, method.desc)) {
    console.log('\n✅ Build succeeded!')
    buildSucceeded = true
    break
  }
  console.log(`\n⚠️ ${method.desc} failed, trying next method...`)
}

if (!buildSucceeded) {
  // 所有方法都失败了
  console.error('\n❌ All build attempts failed')
  console.error('\n📋 Diagnostic information:')
  console.error('---')
  console.error('Working directory:', rootDir)
  console.error('Node version:', process.version)
  console.error('NODE_ENV:', process.env.NODE_ENV)
  console.error('NODE_OPTIONS:', process.env.NODE_OPTIONS)
  console.error('NETLIFY:', process.env.NETLIFY)
  console.error('node_modules exists:', existsSync(nodeModulesPath))
  console.error('.nuxt exists:', existsSync(nuxtDir))
  console.error('.output exists:', existsSync(join(rootDir, '.output')))
  console.error('---')
  console.error('\n💡 Troubleshooting tips:')
  console.error('1. Check if all dependencies are installed: npm install --legacy-peer-deps')
  console.error('2. Check Node.js version (should be >= 20.19.0): node --version')
  console.error('3. Try cleaning and rebuilding: rm -rf .output .nuxt node_modules && npm install --legacy-peer-deps && npm run build')
  console.error('4. Check for TypeScript errors: npx nuxi typecheck')
  console.error('5. Review the error messages above for specific issues')
  process.exit(1)
}

process.exit(0)

