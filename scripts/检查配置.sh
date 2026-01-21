#!/bin/bash

echo "========================================="
echo "数据库配置检查工具"
echo "========================================="
echo ""

# 检查 .env 文件是否存在
if [ ! -f .env ]; then
    echo "❌ .env 文件不存在"
    echo "请创建 .env 文件并配置数据库信息"
    exit 1
fi

echo "✓ .env 文件存在"
echo ""

# 检查必需的配置项
echo "检查配置项..."
echo ""

REQUIRED_VARS=("DB_HOST" "DB_PORT" "DB_USER" "DB_PASSWORD" "DB_NAME")
MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if grep -q "^${var}=" .env; then
        value=$(grep "^${var}=" .env | cut -d '=' -f2)
        if [ -z "$value" ] || [ "$value" = "your-${var,,}" ] || [ "$value" = "your-mysql-host" ] || [ "$value" = "your-username" ] || [ "$value" = "your-password" ]; then
            echo "⚠️  ${var} 已配置但值为空或未修改"
            MISSING_VARS+=("${var}")
        else
            echo "✓ ${var} 已配置"
        fi
    else
        echo "❌ ${var} 未配置"
        MISSING_VARS+=("${var}")
    fi
done

echo ""

if [ ${#MISSING_VARS[@]} -eq 0 ]; then
    echo "========================================="
    echo "✅ 所有必需的配置项都已填写"
    echo "========================================="
    echo ""
    echo "提示："
    echo "1. 请确认配置的值是否正确"
    echo "2. 请确认数据库已创建"
    echo "3. 请确认已执行 database/schema.sql 创建表"
    echo "4. 配置修改后需要重启服务器"
else
    echo "========================================="
    echo "❌ 以下配置项需要填写："
    echo "========================================="
    for var in "${MISSING_VARS[@]}"; do
        echo "  - ${var}"
    done
    echo ""
    echo "请编辑 .env 文件，填写以上配置项"
    echo ""
    echo "配置格式："
    echo "DB_HOST=你的数据库地址"
    echo "DB_PORT=3306"
    echo "DB_USER=你的用户名"
    echo "DB_PASSWORD=你的密码"
    echo "DB_NAME=你的数据库名"
fi

