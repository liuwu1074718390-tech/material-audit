#!/bin/bash

echo "=================================="
echo "材价审计系统 - 部署包验证"
echo "=================================="
echo ""

# 检查必要文件
echo "✅ 检查核心文件..."
files=(
  "package.json"
  "nuxt.config.ts"
  "app.vue"
  ".env.example"
  "Dockerfile"
  "docker-compose.yml"
  "ecosystem.config.js"
)

missing_files=0
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✓ $file"
  else
    echo "  ✗ $file (缺失)"
    missing_files=$((missing_files + 1))
  fi
done

echo ""
echo "✅ 检查目录结构..."
dirs=(
  "assets"
  "components"
  "composables"
  "database"
  "pages"
  "plugins"
  "public"
  "server"
  "types"
)

missing_dirs=0
for dir in "${dirs[@]}"; do
  if [ -d "$dir" ]; then
    echo "  ✓ $dir/"
  else
    echo "  ✗ $dir/ (缺失)"
    missing_dirs=$((missing_dirs + 1))
  fi
done

echo ""
echo "✅ 检查Node版本..."
if command -v node &> /dev/null; then
  node_version=$(node -v)
  echo "  当前版本: $node_version"
  
  # 提取主版本号
  major_version=$(echo $node_version | cut -d'.' -f1 | sed 's/v//')
  if [ "$major_version" -ge 20 ]; then
    echo "  ✓ Node版本符合要求 (>= 20.0.0)"
  else
    echo "  ✗ Node版本过低，需要 >= 20.0.0"
  fi
else
  echo "  ✗ 未安装Node.js"
fi

echo ""
echo "✅ 检查npm版本..."
if command -v npm &> /dev/null; then
  npm_version=$(npm -v)
  echo "  当前版本: $npm_version"
  
  major_version=$(echo $npm_version | cut -d'.' -f1)
  if [ "$major_version" -ge 9 ]; then
    echo "  ✓ npm版本符合要求 (>= 9.0.0)"
  else
    echo "  ✗ npm版本过低，需要 >= 9.0.0"
  fi
else
  echo "  ✗ 未安装npm"
fi

echo ""
echo "=================================="
echo "验证结果统计"
echo "=================================="

if [ $missing_files -eq 0 ] && [ $missing_dirs -eq 0 ]; then
  echo "✅ 部署包完整，可以开始部署"
  echo ""
  echo "下一步："
  echo "1. npm install          # 安装依赖"
  echo "2. cp .env.example .env # 配置环境变量"
  echo "3. npm run build        # 构建项目"
  echo "4. npm run dev          # 启动服务（开发）"
  echo "   或"
  echo "   pm2 start ecosystem.config.js  # 启动服务（生产）"
  exit 0
else
  echo "❌ 部署包不完整"
  echo "  缺失文件: $missing_files"
  echo "  缺失目录: $missing_dirs"
  exit 1
fi
