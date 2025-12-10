#!/bin/bash
set -e

# 设置环境变量
export NODE_OPTIONS='--no-warnings'
export NUXT_TELEMETRY_DISABLED=1
export NODE_ENV=production

# 尝试构建，如果遇到 banner 错误则重试
npx nuxt build 2>&1 | tee /tmp/build.log || {
  # 检查是否是 banner 错误
  if grep -q "Cannot read properties of null" /tmp/build.log; then
    echo "Banner error detected, retrying with different approach..."
    # 尝试使用 nuxi build
    npx nuxi build || {
      echo "All build methods failed"
      exit 1
    }
  else
    echo "Build failed with different error"
    exit 1
  fi
}
