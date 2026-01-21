#!/bin/bash

# =================================================================
# 材价审计系统 - 内网一键部署脚本 (deploy-intranet.sh)
# 说明：本脚本用于在内网服务器快速构建并启动 Docker 服务
# =================================================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}>>> 开始内网部署流程...${NC}"

# 1. 环境检查
echo -e "${YELLOW}[1/5] 正在检查部署环境...${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${RED}错误: 未检测到 Docker，请先安装 Docker。${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}错误: 未检测到 docker-compose，请先安装。${NC}"
    exit 1
fi

# 2. 检查 .env 文件
echo -e "${YELLOW}[2/5] 正在检查配置文件...${NC}"

if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        echo -e "${YELLOW}警告: 未找到 .env 文件，正在从 .env.example 创建副本。${NC}"
        cp .env.example .env
        echo -e "${RED}请立即修改 .env 文件，填写正确的 DIFY_API_KEY 和数据库参数，然后重新运行此脚本。${NC}"
        exit 1
    else
        echo -e "${RED}错误: 缺少 .env.example 和 .env 文件。${NC}"
        exit 1
    fi
fi

# 3. 停止旧容器（如果存在）
echo -e "${YELLOW}[3/5] 正在清理旧容器...${NC}"
docker-compose down --remove-orphans

# 4. 构建并启动镜像
echo -e "${YELLOW}[4/5] 正在构建并启动 Docker 服务 (这可能需要几分钟)...${NC}"
# 使用 --build 强制重新构建，确保代码更新已包含
docker-compose up -d --build

# 5. 验证部署
echo -e "${YELLOW}[5/5] 正在验证服务状态...${NC}"

# 等待应用启动
SLEEP_SEC=5
echo "等待系统初始化 ($SLEEP_SEC 秒)..."
sleep $SLEEP_SEC

# 查看容器状态
docker-compose ps

# 检查健康状况
APP_STATUS=$(docker inspect --format='{{.State.Health.Status}}' material-audit-app 2>/dev/null || echo "unknown")

if [ "$APP_STATUS" == "healthy" ]; then
    echo -e "${GREEN}====================================================${NC}"
    echo -e "${GREEN}✅ 部署成功！${NC}"
    echo -e "${GREEN}>>> 访问地址: http://$(hostname -I | awk '{print $1}'):3000${NC}"
    echo -e "${GREEN}====================================================${NC}"
else
    echo -e "${YELLOW}====================================================${NC}"
    echo -e "${YELLOW}⚠️ 服务已启动，但健康检查尚未通过 (当前状态: $APP_STATUS)${NC}"
    echo -e "${YELLOW}可以使用以下命令查看日志：${NC}"
    echo -e "   docker-compose logs -f app"
    echo -e "${YELLOW}====================================================${NC}"
fi
