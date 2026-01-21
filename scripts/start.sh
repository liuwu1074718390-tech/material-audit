#!/bin/bash

# 材价审计系统 - 启动脚本

echo "======================================"
echo "  材价审计系统"
echo "======================================"
echo ""

# 检查 .env 文件
if [ ! -f .env ]; then
    echo "⚠️  未找到 .env 文件"
    echo "正在创建..."
    cp .env.example .env
    echo "✅ 已创建 .env 文件"
    echo ""
    echo "❌ 请先配置 .env 文件中的 API 密钥，然后重新运行此脚本"
    exit 1
fi

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
fi

# 启动开发服务器
echo "🚀 启动开发服务器..."
echo ""
echo "访问地址: http://localhost:3000"
echo "按 Ctrl+C 停止服务器"
echo ""

npm run dev

