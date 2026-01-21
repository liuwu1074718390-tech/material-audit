#!/usr/bin/env node

/**
 * 检查依赖问题，特别是可能导致 banner 错误的损坏的 package.json
 */

import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')

console.log('🔍 Checking dependencies for potential issues...\n')

// 检查关键依赖的 package.json
const criticalDeps = [
  'nuxt',
  'nitropack',
  '@nuxt/kit',
  '@nuxt/schema'
]

let issuesFound = false

for (const dep of criticalDeps) {
  const depPath = join(rootDir, 'node_modules', dep, 'package.json')
  if (existsSync(depPath)) {
    try {
      const pkg = JSON.parse(readFileSync(depPath, 'utf8'))
      if (!pkg.name || !pkg.version) {
        console.error(`❌ ${dep}: package.json missing name or version`)
        issuesFound = true
      } else {
        console.log(`✅ ${dep}: ${pkg.version}`)
      }
    } catch (e) {
      console.error(`❌ ${dep}: package.json is invalid or corrupted`)
      console.error(`   Error: ${e.message}`)
      issuesFound = true
    }
  } else {
    console.warn(`⚠️  ${dep}: package.json not found`)
    issuesFound = true
  }
}

if (issuesFound) {
  console.log('\n💡 Try reinstalling dependencies:')
  console.log('   rm -rf node_modules package-lock.json')
  console.log('   npm install --legacy-peer-deps')
  process.exit(1)
} else {
  console.log('\n✅ All critical dependencies look good!')
  process.exit(0)
}

