#!/bin/bash

# 修复 Vercel 环境变量中的换行符问题
# 使用方法：bash fix-env.sh

echo "=========================================="
echo "修复 Vercel 环境变量（去除换行符）"
echo "=========================================="
echo ""

# 从 .env 文件读取值（如果存在）
if [ -f .env ]; then
    echo "从 .env 文件读取配置..."
    source .env
fi

# 环境变量值（如果 .env 中没有，使用默认值）
DB_HOST="${DB_HOST:-gz-cdb-gaxrunxl.sql.tencentcdb.com}"
DB_PORT="${DB_PORT:-28544}"
DB_USER="${DB_USER:-root}"
DB_PASSWORD="${DB_PASSWORD:-Lw05044918}"
DB_NAME="${DB_NAME:-myapp}"

# 去除换行符和空白字符
DB_HOST=$(echo -n "$DB_HOST" | tr -d '\r\n' | xargs)
DB_PORT=$(echo -n "$DB_PORT" | tr -d '\r\n' | xargs)
DB_USER=$(echo -n "$DB_USER" | tr -d '\r\n' | xargs)
DB_PASSWORD=$(echo -n "$DB_PASSWORD" | tr -d '\r\n' | xargs)
DB_NAME=$(echo -n "$DB_NAME" | tr -d '\r\n' | xargs)

echo "清理后的环境变量值："
echo "  DB_HOST: $DB_HOST"
echo "  DB_PORT: $DB_PORT"
echo "  DB_USER: $DB_USER"
echo "  DB_NAME: $DB_NAME"
echo "  DB_PASSWORD: [已隐藏]"
echo ""

read -p "是否继续更新 Vercel 环境变量？(y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "已取消"
    exit 1
fi

echo ""
echo "开始更新环境变量..."

# 删除旧的环境变量（忽略错误，使用 -y 跳过确认）
echo "删除旧的环境变量..."
npx vercel env rm DB_HOST production -y 2>/dev/null || true
npx vercel env rm DB_PORT production -y 2>/dev/null || true
npx vercel env rm DB_USER production -y 2>/dev/null || true
npx vercel env rm DB_PASSWORD production -y 2>/dev/null || true
npx vercel env rm DB_NAME production -y 2>/dev/null || true

# 添加新的环境变量（使用 echo -n 避免换行符）
echo "添加新的环境变量..."
echo -n "$DB_HOST" | npx vercel env add DB_HOST production
echo -n "$DB_PORT" | npx vercel env add DB_PORT production
echo -n "$DB_USER" | npx vercel env add DB_USER production
echo -n "$DB_PASSWORD" | npx vercel env add DB_PASSWORD production
echo -n "$DB_NAME" | npx vercel env add DB_NAME production

echo ""
echo "✅ 环境变量更新完成！"
echo ""
echo "下一步："
echo "1. 运行 'npx vercel --prod' 重新部署"
echo "2. 或访问 Vercel 控制台点击 'Redeploy'"
echo ""
echo "验证："
echo "部署后访问 /api/health/db-check 检查数据库连接"

