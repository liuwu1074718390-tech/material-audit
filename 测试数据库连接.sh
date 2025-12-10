#!/bin/bash

echo "========================================="
echo "数据库连接测试工具"
echo "========================================="
echo ""

# 检查 .env 文件
if [ ! -f .env ]; then
    echo "❌ .env 文件不存在"
    exit 1
fi

# 读取配置
source .env 2>/dev/null || true

DB_HOST=${DB_HOST:-""}
DB_PORT=${DB_PORT:-3306}
DB_USER=${DB_USER:-""}
DB_PASSWORD=${DB_PASSWORD:-""}
DB_NAME=${DB_NAME:-""}

echo "当前配置："
echo "  地址: ${DB_HOST}"
echo "  端口: ${DB_PORT}"
echo "  用户: ${DB_USER}"
echo "  数据库: ${DB_NAME}"
echo ""

if [ -z "$DB_HOST" ] || [ -z "$DB_USER" ] || [ -z "$DB_PASSWORD" ]; then
    echo "❌ 配置不完整，请先填写 .env 文件"
    exit 1
fi

# 检查地址类型
if [[ $DB_HOST =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    echo "📍 检测到内网地址（IP格式）"
    echo "   提示：内网地址只能在腾讯云内网使用"
    echo "   如果你的服务器在本地，需要使用外网地址"
elif [[ $DB_HOST =~ \.tencentcdb\.com$ ]] || [[ $DB_HOST =~ \.sql\.tencentcdb\.com$ ]]; then
    echo "📍 检测到外网地址（域名格式）"
    echo "   提示：外网地址可以从任何地方连接"
else
    echo "⚠️  地址格式异常，请检查"
fi

echo ""
echo "========================================="
echo "测试连接..."
echo "========================================="
echo ""

# 检查是否安装了 mysql 客户端
if command -v mysql &> /dev/null; then
    echo "使用 mysql 客户端测试连接..."
    echo ""
    
    # 测试连接（不指定数据库）
    timeout 5 mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" -e "SELECT 1;" 2>&1
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ 连接成功！"
        echo ""
        echo "测试查询数据库列表..."
        mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" -e "SHOW DATABASES;" 2>&1 | head -10
    else
        echo ""
        echo "❌ 连接失败"
        echo ""
        echo "可能的原因："
        echo "1. 数据库地址不正确"
        echo "2. 用户名或密码错误"
        echo "3. 网络无法访问（如果是内网地址，需要确保在腾讯云内网）"
        echo "4. 外网访问未开启（如果使用外网地址）"
        echo "5. 安全组未开放 3306 端口"
    fi
else
    echo "⚠️  未安装 mysql 客户端，无法直接测试"
    echo ""
    echo "可以使用以下方法测试："
    echo "1. 在腾讯云控制台的 SQL 窗口中测试"
    echo "2. 使用数据库管理工具（如 Navicat、DBeaver）"
    echo "3. 访问健康检查页面：http://localhost:3000/health"
    echo ""
    echo "安装 mysql 客户端（可选）："
    echo "  macOS: brew install mysql-client"
fi

echo ""
echo "========================================="

