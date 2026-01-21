#!/bin/bash

# 材价审计系统 - Vercel 自动化部署脚本
# 使用方法：chmod +x scripts/deploy-vercel.sh && ./scripts/deploy-vercel.sh

set -e

echo "=========================================="
echo "材价审计系统 - Vercel 自动化部署"
echo "=========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 检查是否安装了 Vercel CLI
echo -e "${YELLOW}[1/6] 检查 Vercel CLI...${NC}"
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}Vercel CLI 未安装，正在安装...${NC}"
    npm install -g vercel
    if [ $? -ne 0 ]; then
        echo -e "${RED}Vercel CLI 安装失败！${NC}"
        exit 1
    fi
    echo -e "${GREEN}Vercel CLI 安装成功${NC}"
else
    VERCEL_VERSION=$(vercel --version)
    echo -e "${GREEN}Vercel CLI 已安装: $VERCEL_VERSION${NC}"
fi

# 检查是否已登录
echo -e "${YELLOW}[2/6] 检查登录状态...${NC}"
if ! vercel whoami &> /dev/null; then
    echo -e "${YELLOW}未登录 Vercel，开始登录...${NC}"
    vercel login
    if [ $? -ne 0 ]; then
        echo -e "${RED}登录失败！${NC}"
        exit 1
    fi
else
    USER=$(vercel whoami)
    echo -e "${GREEN}已登录: $USER${NC}"
fi

# 检查项目根目录
echo -e "${YELLOW}[3/6] 检查项目配置...${NC}"
if [ ! -f "package.json" ]; then
    echo -e "${RED}错误：请在项目根目录运行此脚本！${NC}"
    exit 1
fi

if [ ! -f "nuxt.config.ts" ]; then
    echo -e "${RED}错误：未找到 nuxt.config.ts 文件！${NC}"
    exit 1
fi

echo -e "${GREEN}项目配置检查通过${NC}"

# 检查环境变量文件
echo -e "${YELLOW}[4/6] 检查环境变量配置...${NC}"
if [ ! -f ".env" ] && [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}警告：未找到 .env 文件${NC}"
    echo -e "${YELLOW}请确保已在 Vercel 项目中配置环境变量：${NC}"
    echo ""
    echo "必需的环境变量："
    echo "  - DIFY_API_KEY"
    echo "  - DIFY_API_URL"
    echo "  - DIFY_WORKFLOW_ID (可选)"
    echo "  - DB_HOST (可选)"
    echo "  - DB_PORT (可选)"
    echo "  - DB_USER (可选)"
    echo "  - DB_PASSWORD (可选)"
    echo "  - DB_NAME (可选)"
    echo ""
    read -p "是否继续部署？(y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo -e "${GREEN}环境变量文件存在${NC}"
fi

# 安装依赖
echo -e "${YELLOW}[5/6] 安装依赖...${NC}"
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}依赖安装失败！${NC}"
    exit 1
fi
echo -e "${GREEN}依赖安装完成${NC}"

# 部署到 Vercel
echo -e "${YELLOW}[6/6] 部署到 Vercel...${NC}"
echo ""
echo -e "${YELLOW}提示：${NC}"
echo "  - 如果是首次部署，Vercel 会询问项目设置"
echo "  - 输入 'y' 确认使用默认设置"
echo "  - 或者按照提示进行自定义配置"
echo ""

# 检查是否有 .vercel 目录（已链接项目）
if [ -d ".vercel" ]; then
    echo -e "${GREEN}项目已链接到 Vercel，直接部署...${NC}"
    vercel --prod
else
    echo -e "${YELLOW}首次部署，需要链接项目...${NC}"
    vercel --prod
fi

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}=========================================="
    echo "部署成功！"
    echo "==========================================${NC}"
    echo ""
    echo "项目已部署到 Vercel"
    echo "使用 'vercel' 命令查看部署链接"
    echo "使用 'vercel env ls' 查看环境变量"
    echo ""
else
    echo ""
    echo -e "${RED}部署失败，请检查错误信息${NC}"
    exit 1
fi

