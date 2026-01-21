#!/bin/bash

# 材价审计系统 - 更新脚本
# 使用方法: bash scripts/update.sh

set -e

APP_DIR="/opt/material-audit"
PM2_NAME="material-audit"

echo "=========================================="
echo "更新材价审计系统"
echo "=========================================="

cd ${APP_DIR}

# 备份当前版本
echo "备份当前版本..."
cp -r .output .output.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || true

# 从 Git 更新代码
if [ -d ".git" ]; then
    echo "从 Git 拉取最新代码..."
    git pull
else
    echo "未检测到 Git 仓库，请手动更新代码"
    exit 1
fi

# 安装依赖
echo "安装依赖..."
npm install

# 构建项目
echo "构建项目..."
npm run build

# 重启应用
echo "重启应用..."
pm2 restart ${PM2_NAME}

echo "更新完成！"

