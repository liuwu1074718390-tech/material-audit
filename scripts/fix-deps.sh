#!/bin/bash

# 修复依赖安装问题的脚本

echo "🔧 修复依赖安装问题..."
echo "================================"

# 1. 检查并安装缺失的依赖
echo "📦 检查缺失的依赖..."

# 检查 vite 是否存在
if [ ! -d "node_modules/vite" ]; then
    echo "⚠️  vite 未找到，正在安装..."
    npm install --legacy-peer-deps vite@latest
fi

# 检查其他可能缺失的依赖
if [ ! -d "node_modules/@vitejs/plugin-vue" ]; then
    echo "⚠️  @vitejs/plugin-vue 未找到，正在安装..."
    npm install --legacy-peer-deps @vitejs/plugin-vue@latest
fi

# 2. 重新安装所有依赖以确保完整性
echo ""
echo "🔄 重新安装所有依赖..."
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

# 3. 验证关键依赖
echo ""
echo "✅ 验证关键依赖..."
node scripts/check-deps.js

echo ""
echo "✅ 依赖修复完成！"
echo "💡 现在可以尝试运行: NODE_OPTIONS=\"--max-old-space-size=4096\" npm run build"

