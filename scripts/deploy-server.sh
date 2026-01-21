#!/bin/bash

# 材价审计系统 - 服务器一键部署脚本
# 使用方法: bash scripts/deploy-server.sh

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置变量
APP_NAME="material-audit"
APP_DIR="/opt/${APP_NAME}"
PM2_NAME="material-audit"
PORT="3000"
NODE_VERSION="20.19.0"

echo -e "${BLUE}=========================================="
echo "  材价审计系统 - 服务器部署脚本"
echo "==========================================${NC}"
echo ""

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ 请使用 root 用户运行此脚本${NC}"
    echo "使用: sudo bash scripts/deploy-server.sh"
    exit 1
fi

# 1. 更新系统
echo -e "${YELLOW}[1/10] 更新系统包...${NC}"
if command -v apt-get &> /dev/null; then
    apt-get update -y
    apt-get upgrade -y
    apt-get install -y curl wget git build-essential
elif command -v yum &> /dev/null; then
    yum update -y
    yum install -y curl wget git gcc gcc-c++ make
else
    echo -e "${RED}❌ 不支持的操作系统${NC}"
    exit 1
fi

# 2. 安装 Node.js
echo -e "${YELLOW}[2/10] 安装 Node.js ${NODE_VERSION}...${NC}"
if ! command -v node &> /dev/null || [ "$(node -v | cut -d'v' -f2 | cut -d'.' -f1)" -lt 20 ]; then
    if command -v apt-get &> /dev/null; then
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
        apt-get install -y nodejs
    elif command -v yum &> /dev/null; then
        curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
        yum install -y nodejs
    fi
    echo -e "${GREEN}✅ Node.js 安装完成: $(node -v)${NC}"
else
    echo -e "${GREEN}✅ Node.js 已安装: $(node -v)${NC}"
fi

# 验证 Node.js 版本
NODE_VER=$(node -v | cut -d'v' -f2)
if [ "$(echo $NODE_VER | cut -d'.' -f1)" -lt 20 ]; then
    echo -e "${RED}❌ Node.js 版本过低，需要 20.19.0 或更高${NC}"
    exit 1
fi

# 3. 安装 PM2
echo -e "${YELLOW}[3/10] 安装 PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
    pm2 startup systemd -u root --hp /root 2>/dev/null || true
    echo -e "${GREEN}✅ PM2 安装完成${NC}"
else
    echo -e "${GREEN}✅ PM2 已安装: $(pm2 -v)${NC}"
fi

# 4. 安装 Nginx
echo -e "${YELLOW}[4/10] 安装 Nginx（可选）...${NC}"
read -p "是否安装 Nginx 反向代理? (y/n, 默认 y): " install_nginx
install_nginx=${install_nginx:-y}

if [ "$install_nginx" == "y" ]; then
    if ! command -v nginx &> /dev/null; then
        if command -v apt-get &> /dev/null; then
            apt-get install -y nginx
        elif command -v yum &> /dev/null; then
            yum install -y nginx
        fi
        systemctl enable nginx
        systemctl start nginx
        echo -e "${GREEN}✅ Nginx 安装完成${NC}"
    else
        echo -e "${GREEN}✅ Nginx 已安装${NC}"
    fi
fi

# 5. 创建应用目录
echo -e "${YELLOW}[5/10] 创建应用目录...${NC}"
mkdir -p ${APP_DIR}
mkdir -p ${APP_DIR}/logs

# 6. 部署代码
echo -e "${YELLOW}[6/10] 部署应用代码...${NC}"
echo "请选择部署方式:"
echo "  1) 从 Git 仓库克隆（推荐）"
echo "  2) 当前目录已包含代码"
read -p "请输入选项 (1/2, 默认 2): " deploy_method
deploy_method=${deploy_method:-2}

if [ "$deploy_method" == "1" ]; then
    read -p "请输入 Git 仓库地址: " git_repo
    if [ -d "${APP_DIR}/.git" ]; then
        cd ${APP_DIR}
        git pull
    else
        git clone ${git_repo} ${APP_DIR}
    fi
    cd ${APP_DIR}
elif [ "$deploy_method" == "2" ]; then
    # 获取脚本所在目录
    SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
    PROJECT_DIR="$( cd "$SCRIPT_DIR/.." && pwd )"
    
    echo "从当前目录复制代码到 ${APP_DIR}..."
    rsync -av --exclude='node_modules' --exclude='.git' --exclude='.output' --exclude='.nuxt' \
        ${PROJECT_DIR}/ ${APP_DIR}/
    cd ${APP_DIR}
fi

# 7. 配置环境变量
echo -e "${YELLOW}[7/10] 配置环境变量...${NC}"
if [ ! -f "${APP_DIR}/.env" ]; then
    echo -e "${YELLOW}创建 .env 文件...${NC}"
    cat > ${APP_DIR}/.env << 'EOF'
# ==========================================
# Dify API 配置（必需）
# ==========================================
DIFY_API_KEY=app-CaJJxI5P0DrvwNXAhABB37M6
DIFY_API_URL=http://192.168.1.42/v1/workflows/run
DIFY_WORKFLOW_ID=6495412f-cb02-4702-a1e4-5471a37919c7

# ==========================================
# 数据库配置（必需）
# ==========================================
DB_HOST=gz-cdb-gaxrunxl.sql.tencentcdb.com
DB_PORT=28544
DB_USER=root
DB_PASSWORD=Lw05044918
DB_NAME=myapp

# ==========================================
# 应用配置
# ==========================================
NODE_ENV=production
PORT=3000
NUXT_PUBLIC_API_BASE=/api

# ==========================================
# 腾讯云配置（可选）
# ==========================================
TENCENT_SECRET_ID=your-tencent-secret-id
TENCENT_SECRET_KEY=your-tencent-secret-key
TENCENT_REGION=ap-guangzhou

# ==========================================
# COS 配置（可选）
# ==========================================
COS_BUCKET=my-audit-bucket-1256824609
COS_REGION=ap-guangzhou
COS_BASE_URL=https://my-audit-bucket-1256824609.cos.ap-guangzhou.myqcloud.com
EOF
    chmod 600 ${APP_DIR}/.env
    echo -e "${YELLOW}⚠️  请编辑 ${APP_DIR}/.env 文件配置环境变量${NC}"
    read -p "按 Enter 继续（稍后可以编辑）..."
else
    echo -e "${GREEN}✅ .env 文件已存在${NC}"
fi

# 8. 安装依赖
echo -e "${YELLOW}[8/10] 安装项目依赖...${NC}"
cd ${APP_DIR}
npm install --legacy-peer-deps

# 9. 构建项目
echo -e "${YELLOW}[9/10] 构建项目...${NC}"
npm run build

if [ ! -d "${APP_DIR}/.output" ]; then
    echo -e "${RED}❌ 构建失败，.output 目录不存在${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 构建成功${NC}"

# 10. 配置 PM2
echo -e "${YELLOW}[10/10] 配置 PM2...${NC}"

# 停止旧进程（如果存在）
pm2 delete ${PM2_NAME} 2>/dev/null || true

# 创建 PM2 配置文件
cat > ${APP_DIR}/ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: '${PM2_NAME}',
    script: '.output/server/index.mjs',
    cwd: '${APP_DIR}',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: ${PORT}
    },
    env_file: '.env',
    error_file: '${APP_DIR}/logs/pm2-error.log',
    out_file: '${APP_DIR}/logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '500M',
    min_uptime: '10s',
    max_restarts: 10
  }]
}
EOF

# 启动应用
pm2 start ${APP_DIR}/ecosystem.config.js
pm2 save

echo -e "${GREEN}✅ PM2 配置完成${NC}"

# 11. 配置 Nginx（如果安装了）
if [ "$install_nginx" == "y" ] && command -v nginx &> /dev/null; then
    echo -e "${YELLOW}配置 Nginx 反向代理...${NC}"
    read -p "请输入域名（留空使用 IP）: " domain_name
    
    if [ -z "$domain_name" ]; then
        domain_name="_"
    fi
    
    # 创建 Nginx 配置
    cat > /etc/nginx/sites-available/${APP_NAME} << EOF
server {
    listen 80;
    server_name ${domain_name};

    access_log /var/log/nginx/${APP_NAME}-access.log;
    error_log /var/log/nginx/${APP_NAME}-error.log;

    client_max_body_size 50M;

    proxy_connect_timeout 300s;
    proxy_send_timeout 300s;
    proxy_read_timeout 300s;
    send_timeout 300s;

    location / {
        proxy_pass http://localhost:${PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_buffering off;
    }

    location /_nuxt/ {
        proxy_pass http://localhost:${PORT};
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /assets/ {
        proxy_pass http://localhost:${PORT};
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

    # 启用站点
    if command -v apt-get &> /dev/null; then
        ln -sf /etc/nginx/sites-available/${APP_NAME} /etc/nginx/sites-enabled/
    elif command -v yum &> /dev/null; then
        cp /etc/nginx/sites-available/${APP_NAME} /etc/nginx/conf.d/${APP_NAME}.conf
    fi
    
    # 测试配置
    nginx -t
    
    # 重启 Nginx
    systemctl restart nginx
    
    echo -e "${GREEN}✅ Nginx 配置完成${NC}"
fi

# 12. 配置防火墙
echo -e "${YELLOW}配置防火墙...${NC}"
if command -v ufw &> /dev/null; then
    ufw allow ${PORT}/tcp 2>/dev/null || true
    ufw allow 80/tcp 2>/dev/null || true
    ufw allow 443/tcp 2>/dev/null || true
    echo -e "${GREEN}✅ 防火墙规则已添加${NC}"
elif command -v firewall-cmd &> /dev/null; then
    firewall-cmd --permanent --add-port=${PORT}/tcp 2>/dev/null || true
    firewall-cmd --permanent --add-port=80/tcp 2>/dev/null || true
    firewall-cmd --permanent --add-port=443/tcp 2>/dev/null || true
    firewall-cmd --reload 2>/dev/null || true
    echo -e "${GREEN}✅ 防火墙规则已添加${NC}"
else
    echo -e "${YELLOW}⚠️  未检测到防火墙工具，请手动开放端口 ${PORT}, 80, 443${NC}"
fi

# 13. 显示部署信息
echo ""
echo -e "${GREEN}=========================================="
echo "  部署完成！"
echo "==========================================${NC}"
echo ""
echo -e "${BLUE}应用信息:${NC}"
echo "  应用目录: ${APP_DIR}"
echo "  应用端口: ${PORT}"
echo "  PM2 名称: ${PM2_NAME}"
echo ""
echo -e "${BLUE}常用命令:${NC}"
echo "  查看状态: pm2 status"
echo "  查看日志: pm2 logs ${PM2_NAME}"
echo "  重启应用: pm2 restart ${PM2_NAME}"
echo "  停止应用: pm2 stop ${PM2_NAME}"
echo ""
echo -e "${BLUE}访问地址:${NC}"
if [ "$install_nginx" == "y" ] && [ -n "$domain_name" ] && [ "$domain_name" != "_" ]; then
    echo "  http://${domain_name}"
else
    SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || echo "your-server-ip")
    echo "  http://${SERVER_IP}:${PORT}"
    if [ "$install_nginx" == "y" ]; then
        echo "  http://${SERVER_IP} (通过 Nginx)"
    fi
fi
echo ""
echo -e "${YELLOW}⚠️  重要提示:${NC}"
echo "  1. 请检查并编辑 ${APP_DIR}/.env 文件配置环境变量"
echo "  2. 如果修改了环境变量，需要重启应用: pm2 restart ${PM2_NAME}"
echo "  3. 查看部署文档: 服务器部署详细指南.md"
echo ""

