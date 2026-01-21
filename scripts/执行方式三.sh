#!/bin/bash

# 数据库表初始化脚本（方式三）
# 使用方法：bash 执行方式三.sh

echo "=========================================="
echo "数据库表初始化（方式三：命令行执行）"
echo "=========================================="
echo ""

# 检查 MySQL 客户端是否安装
if ! command -v mysql &> /dev/null; then
    echo "❌ 错误：未安装 MySQL 客户端"
    echo ""
    echo "请选择以下方式之一："
    echo "1. 安装 MySQL 客户端后重新执行此脚本"
    echo "2. 使用方式二（腾讯云控制台）："
    echo "   - 登录腾讯云控制台"
    echo "   - 进入数据库实例 → SQL窗口"
    echo "   - 执行 init-tables.sql 中的 SQL"
    echo ""
    echo "安装 MySQL 客户端（macOS）："
    echo "  brew install mysql-client"
    echo ""
    exit 1
fi

echo "✅ MySQL 客户端已安装"
echo ""

# 数据库连接信息
DB_HOST="gz-cdb-gaxrunxl.sql.tencentcdb.com"
DB_PORT="28544"
DB_USER="root"
DB_NAME="myapp"
SQL_FILE="init-tables.sql"

echo "数据库连接信息："
echo "  主机: $DB_HOST"
echo "  端口: $DB_PORT"
echo "  用户: $DB_USER"
echo "  数据库: $DB_NAME"
echo "  SQL 文件: $SQL_FILE"
echo ""

# 检查 SQL 文件是否存在
if [ ! -f "$SQL_FILE" ]; then
    echo "❌ 错误：找不到 SQL 文件 $SQL_FILE"
    echo "请确保在项目根目录执行此脚本"
    exit 1
fi

echo "⚠️  提示：执行此命令需要输入数据库密码"
echo ""
read -p "是否继续执行？(y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "已取消"
    exit 1
fi

echo ""
echo "正在执行 SQL 脚本..."
echo ""

# 执行 SQL 脚本
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p "$DB_NAME" < "$SQL_FILE"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 数据库表创建成功！"
    echo ""
    echo "验证："
    echo "访问以下链接检查表是否已创建："
    echo "https://material-price-audit-5ln1t2ld3-liuwu1074718390-2892s-projects.vercel.app/api/health/db-check"
    echo ""
else
    echo ""
    echo "❌ 执行失败"
    echo "请检查："
    echo "1. 数据库密码是否正确"
    echo "2. 网络连接是否正常"
    echo "3. 数据库地址和端口是否正确"
    echo ""
fi




