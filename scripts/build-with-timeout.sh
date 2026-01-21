#!/bin/bash

# 带超时保护的构建脚本
# 用于 CloudStudio 环境，防止构建卡死

set -e

echo "🚀 Starting build with timeout protection..."
echo "⏱️  Maximum build time: 45 minutes"
echo ""

# 设置环境变量
export NODE_OPTIONS="--max-old-space-size=8192"
export NUXT_TELEMETRY_DISABLED=1
export NUXT_NO_VERSION_CHECK=1
export NODE_ENV=production

# 使用 timeout 命令（如果可用）或使用后台进程 + 等待
if command -v timeout &> /dev/null; then
    echo "✅ Using timeout command..."
    timeout 45m npm run build || {
        EXIT_CODE=$?
        if [ $EXIT_CODE -eq 124 ]; then
            echo ""
            echo "❌ Build timeout after 45 minutes"
            echo "💡 This might be due to:"
            echo "   1. Element Plus is too large for the environment"
            echo "   2. CloudStudio resource limits"
            echo "   3. Network issues"
            echo ""
            echo "🔍 Checking if any output was generated..."
            if [ -d ".output" ]; then
                echo "✅ Found .output directory, checking contents..."
                ls -lah .output/ || true
            fi
            exit 1
        else
            exit $EXIT_CODE
        fi
    }
else
    echo "⚠️  timeout command not available, running without timeout..."
    echo "💡 If build hangs, you may need to manually kill it"
    npm run build
fi

echo ""
echo "✅ Build completed successfully!"

