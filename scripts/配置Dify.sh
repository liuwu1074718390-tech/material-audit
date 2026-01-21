#!/bin/bash

echo "======================================"
echo "  Dify API 配置助手"
echo "======================================"
echo ""

# 读取当前配置
ENV_FILE="/Users/liuwu/Desktop/材价审计/.env"

echo "请按照提示输入您从Dify获取的信息："
echo ""

# 输入API密钥
echo "1️⃣  请输入Dify API密钥（格式：app-xxxxxxxxxxxxxxxxxxxxxxxx）："
read -p "   API密钥: " API_KEY

# 输入API URL
echo ""
echo "2️⃣  请输入Dify API URL（格式：https://api.dify.ai/v1/workflows/xxxxx/run）："
read -p "   API URL: " API_URL

# 确认信息
echo ""
echo "======================================"
echo "请确认您输入的信息："
echo "======================================"
echo "API密钥: $API_KEY"
echo "API URL: $API_URL"
echo ""
read -p "确认无误？(y/n): " CONFIRM

if [[ $CONFIRM == "y" || $CONFIRM == "Y" ]]; then
    # 写入配置文件
    cat > "$ENV_FILE" << EOF
# Dify API配置
DIFY_API_KEY=$API_KEY
DIFY_API_URL=$API_URL

# 腾讯云配置（可选）
# TENCENT_SECRET_ID=your_secret_id
# TENCENT_SECRET_KEY=your_secret_key
EOF

    echo ""
    echo "✅ 配置已保存到 .env 文件"
    echo ""
    echo "======================================"
    echo "下一步："
    echo "======================================"
    echo "1. 重启开发服务器（按 Ctrl+C 停止当前服务器）"
    echo "2. 运行: npm run dev"
    echo "3. 在浏览器中测试上传和审计功能"
    echo ""
else
    echo ""
    echo "❌ 已取消配置"
    echo ""
fi

