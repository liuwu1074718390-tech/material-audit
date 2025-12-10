#!/bin/bash

# 材价审计系统 - 快速安装脚本

echo "======================================"
echo "  材价审计系统 - 安装向导"
echo "======================================"
echo ""

# 检查 Node.js
echo "检查 Node.js 环境..."
if ! command -v node &> /dev/null; then
    echo "❌ 未检测到 Node.js，请先安装 Node.js 18 或更高版本"
    echo "下载地址: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v)
echo "✅ Node.js 版本: $NODE_VERSION"
echo ""

# 检查 npm
if ! command -v npm &> /dev/null; then
    echo "❌ 未检测到 npm"
    exit 1
fi

NPM_VERSION=$(npm -v)
echo "✅ npm 版本: $NPM_VERSION"
echo ""

# 安装依赖
echo "开始安装项目依赖..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ 依赖安装失败"
    exit 1
fi

echo "✅ 依赖安装成功"
echo ""

# 配置环境变量
if [ ! -f .env ]; then
    echo "配置环境变量..."
    cp .env.example .env
    echo "✅ 已创建 .env 文件"
    echo ""
    echo "⚠️  请编辑 .env 文件，填入您的 Dify API 配置："
    echo "   - DIFY_API_KEY"
    echo "   - DIFY_API_URL"
    echo ""
else
    echo "✅ .env 文件已存在"
    echo ""
fi

# 询问是否立即启动
read -p "是否立即启动开发服务器？(y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "启动开发服务器..."
    echo "访问地址: http://localhost:3000"
    echo ""
    npm run dev
else
    echo ""
    echo "======================================"
    echo "  安装完成！"
    echo "======================================"
    echo ""
    echo "接下来的步骤："
    echo "1. 编辑 .env 文件，配置 Dify API"
    echo "2. 运行 'npm run dev' 启动开发服务器"
    echo "3. 访问 http://localhost:3000"
    echo ""
    echo "查看文档："
    echo "- 使用说明: docs/USAGE.md"
    echo "- API文档: docs/API.md"
    echo "- 部署文档: docs/DEPLOYMENT.md"
    echo "- Dify集成: docs/DIFY_INTEGRATION.md"
    echo ""
fi

