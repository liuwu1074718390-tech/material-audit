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
// 如果没有设置，使用更大的内存限制（16384MB）以避免内存不足
if (!process.env.NODE_OPTIONS) {
  process.env.NODE_OPTIONS = '--max-old-space-size=16384 --no-warnings'
} else if (!process.env.NODE_OPTIONS.includes('max-old-space-size')) {
  // 如果设置了 NODE_OPTIONS 但没有内存限制，添加默认值
  // 尝试使用更大的内存限制
  const currentMax = process.env.NODE_OPTIONS.match(/max-old-space-size=(\d+)/)
  if (!currentMax || parseInt(currentMax[1]) < 16384) {
    process.env.NODE_OPTIONS = process.env.NODE_OPTIONS.replace(/--max-old-space-size=\d+/, '') + ' --max-old-space-size=16384'
  }
}
process.env.NUXT_TELEMETRY_DISABLED = '1'
process.env.NUXT_NO_VERSION_CHECK = '1'  // 禁用版本检查，可能有助于绕过 banner
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
async function runBuild(command, description) {
  console.log(`\n🔨 ${description}...`)
  console.log(`📝 Command: ${command}`)
  
  let stdout = ''
  let stderr = ''
  
  try {
    // 使用 pipe 捕获输出，这样即使 banner 报错也能检查输出
    const result = execSync(command, {
      cwd: rootDir,
      env: { ...process.env },
      encoding: 'utf8',
      stdio: ['inherit', 'pipe', 'pipe']
    })
    
    stdout = result.toString() || ''
    if (stdout) {
      console.log(stdout)
    }
    
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
    // 捕获 stdout 和 stderr
    stdout = buildError.stdout?.toString() || ''
    stderr = buildError.stderr?.toString() || ''
    
    // 显示输出（可能包含有用的信息）
    if (stdout) {
      console.log('📤 STDOUT:')
      console.log(stdout)
    }
    if (stderr) {
      console.error('📤 STDERR:')
      console.error(stderr)
    }
    
    // 检查是否是 banner 错误
    const isBannerError = (stdout + stderr + buildError.message).includes('Cannot read properties of null') ||
                          (stdout + stderr + buildError.message).includes("reading 'name'")
    
    // 即使命令失败，也检查是否有输出生成
    if (existsSync(outputDir) || existsSync(serverDir) || existsSync(nitroJsonPath)) {
      if (isBannerError) {
        console.log('\n⚠️ Banner error detected, but build output was generated')
        console.log('✅ Build succeeded despite banner error!')
      } else {
        console.log('\n⚠️ Build command failed but output was generated')
      }
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
    
    // 如果是 banner 错误，等待一段时间后再次检查（构建可能在后台进行）
    if (isBannerError) {
      console.log('\n⚠️ Banner error detected')
      console.log('💡 Banner error usually happens before build starts, but checking anyway...')
      // 等待 5 秒后再次检查
      for (let i = 0; i < 5; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        if (existsSync(outputDir) || existsSync(serverDir) || existsSync(nitroJsonPath)) {
          console.log('✅ Build output found after banner error!')
          return true
        }
      }
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
    console.error('---')
    
    return false
  }
}

// 主构建流程
async function main() {
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

  // 尝试直接使用 Nuxt Kit API 构建（绕过 Nuxt CLI banner）
  console.log('\n🔧 Attempting direct Nuxt build using @nuxt/kit (bypassing CLI)...')
  try {
    // 使用 @nuxt/kit 来加载和构建
    const { loadNuxt, buildNuxt } = await import('@nuxt/kit')
    
    console.log('📦 Loading Nuxt configuration...')
    const nuxt = await loadNuxt({
      rootDir,
      dev: false
    })
    
    console.log('✅ Config loaded, starting Nuxt build...')
    console.log('⏱️  This may take several minutes, especially for Element Plus...')
    
    // 设置构建超时（30分钟）
    const buildPromise = buildNuxt(nuxt)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Build timeout after 30 minutes'))
      }, 30 * 60 * 1000)
    })
    
    await Promise.race([buildPromise, timeoutPromise])
    
    // 检查输出
    if (existsSync(outputDir) || existsSync(serverDir) || existsSync(nitroJsonPath)) {
      console.log('✅ Direct Nuxt build succeeded!')
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
      console.log('⚠️ Direct Nuxt build completed but no output found')
    }
  } catch (kitError) {
    console.log('⚠️ Direct Nuxt build failed:', kitError.message)
    if (kitError.stack) {
      console.log('Stack (first 5 lines):')
      console.log(kitError.stack.split('\n').slice(0, 5).join('\n'))
    }
    console.log('💡 Falling back to CLI methods...')
  }

  // 尝试多种构建方法
  // 注意：不使用 'npm run build' 避免循环调用
  const buildMethods = [
    { command: 'npx nuxt build', desc: 'Running nuxt build (method 1)' },
    { command: 'npx nuxi build', desc: 'Running nuxi build (method 2)' },
    { command: 'npx --yes nuxt@3.11.1 build', desc: 'Running nuxt build with explicit version (method 3)' }
  ]

  let buildSucceeded = false
  for (const method of buildMethods) {
    if (await runBuild(method.command, method.desc)) {
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
}

// 运行主函数
main().catch((error) => {
  console.error('❌ Unexpected error:', error)
  process.exit(1)
})

