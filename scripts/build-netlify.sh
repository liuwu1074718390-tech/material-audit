#!/bin/bash
# Netlify 构建脚本，绕过版本横幅问题

set -e

# 禁用版本横幅显示
export NUXT_TELEMETRY_DISABLED=1
export NODE_OPTIONS="--no-warnings"

# 直接调用 Nitro 构建，跳过 Nuxt CLI 的版本显示
npx nuxi build || {
  # 如果失败，尝试使用标准构建命令
  npm run build
}

