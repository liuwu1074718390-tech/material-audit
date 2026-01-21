#!/bin/bash

# 清空所有历史业务数据脚本
# 警告：此操作会删除所有任务、结果和材料数据，不可恢复！

echo "⚠️  警告：此操作将删除所有历史业务数据（任务、结果、材料），不可恢复！"
echo ""
read -p "确认要清空所有数据吗？(输入 'yes' 确认): " confirm

if [ "$confirm" != "yes" ]; then
  echo "操作已取消"
  exit 0
fi

echo ""
echo "正在清空所有历史业务数据..."

# 获取服务器地址（默认本地）
SERVER_URL="${SERVER_URL:-http://localhost:3000}"

# 调用清空数据API
response=$(curl -s -X POST "${SERVER_URL}/api/admin/clear-data" \
  -H "Content-Type: application/json")

echo ""
echo "响应结果："
echo "$response" | python3 -m json.tool 2>/dev/null || echo "$response"

echo ""
echo "✅ 操作完成"

