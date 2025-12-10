#!/bin/bash

# 材价审计系统 - 腾讯云服务器自动化部署脚本
# 使用方法: bash scripts/deploy-tencent.sh

set -e  # 遇到错误立即退出

echo "=========================================="
echo "材价审计系统 - 腾讯云服务器部署脚本"
echo "=========================================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}请使用 root 用户运行此脚本${NC}"
    exit 1
fi

# 配置变量
APP_NAME="material-audit"
APP_DIR="/opt/${APP_NAME}"
APP_USER="www-data"
NODE_VERSION="18"
PORT="3000"
PM2_NAME="material-audit"

echo -e "${GREEN}开始部署...${NC}"

# 1. 更新系统
echo -e "${YELLOW}[1/8] 更新系统包...${NC}"
apt-get update -y
apt-get upgrade -y

# 2. 安装基础工具
echo -e "${YELLOW}[2/8] 安装基础工具...${NC}"
apt-get install -y curl wget git build-essential

# 3. 安装 Node.js
echo -e "${YELLOW}[3/8] 安装 Node.js ${NODE_VERSION}...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
    apt-get install -y nodejs
else
    echo "Node.js 已安装: $(node -v)"
fi

# 4. 安装 PM2
echo -e "${YELLOW}[4/8] 安装 PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
    pm2 startup systemd -u root --hp /root
else
    echo "PM2 已安装: $(pm2 -v)"
fi

# 5. 安装 Nginx（可选，用于反向代理）
echo -e "${YELLOW}[5/8] 安装 Nginx...${NC}"
if ! command -v nginx &> /dev/null; then
    apt-get install -y nginx
    systemctl enable nginx
else
    echo "Nginx 已安装"
fi

# 6. 创建应用目录和用户
echo -e "${YELLOW}[6/8] 创建应用目录...${NC}"
mkdir -p ${APP_DIR}
if ! id -u ${APP_USER} &>/dev/null; then
    useradd -r -s /bin/false ${APP_USER}
fi
chown -R ${APP_USER}:${APP_USER} ${APP_DIR}

# 7. 部署应用代码
echo -e "${YELLOW}[7/8] 部署应用代码...${NC}"
echo "请选择部署方式:"
echo "1) 从 Git 仓库克隆（推荐）"
echo "2) 从本地文件上传"
read -p "请输入选项 (1/2): " deploy_method

if [ "$deploy_method" == "1" ]; then
    read -p "请输入 Git 仓库地址: " git_repo
    if [ -d "${APP_DIR}/.git" ]; then
        cd ${APP_DIR}
        git pull
    else
        git clone ${git_repo} ${APP_DIR}
    fi
elif [ "$deploy_method" == "2" ]; then
    echo "请将项目文件上传到 ${APP_DIR} 目录"
    echo "可以使用 scp 命令: scp -r ./材价审计 root@your-server-ip:${APP_DIR}"
    read -p "文件上传完成后按 Enter 继续..."
fi

# 8. 安装依赖和构建
echo -e "${YELLOW}[8/8] 安装依赖并构建项目...${NC}"
cd ${APP_DIR}

# 检查 .env 文件
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}创建 .env 文件...${NC}"
    cat > .env << EOF
# Dify API配置
DIFY_API_KEY=your_dify_api_key_here
DIFY_API_URL=your_dify_api_url_here

# 数据库配置
DB_HOST=your_db_host
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
EOF
    echo -e "${RED}请编辑 ${APP_DIR}/.env 文件配置环境变量${NC}"
    read -p "配置完成后按 Enter 继续..."
fi

# 安装依赖
echo "安装 npm 依赖..."
npm install

# 构建项目
echo "构建项目..."
npm run build

# 9. 配置 PM2
echo -e "${GREEN}配置 PM2...${NC}"
pm2 delete ${PM2_NAME} 2>/dev/null || true

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
    error_file: '${APP_DIR}/logs/pm2-error.log',
    out_file: '${APP_DIR}/logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '500M'
  }]
}
EOF

# 创建日志目录
mkdir -p ${APP_DIR}/logs

# 启动应用
pm2 start ${APP_DIR}/ecosystem.config.js
pm2 save

# 10. 配置 Nginx 反向代理
echo -e "${GREEN}配置 Nginx...${NC}"
read -p "是否配置 Nginx 反向代理? (y/n): " setup_nginx

if [ "$setup_nginx" == "y" ]; then
    read -p "请输入域名（如: audit.example.com）: " domain_name
    
    cat > /etc/nginx/sites-available/${APP_NAME} << EOF
server {
    listen 80;
    server_name ${domain_name};

    # 重定向到 HTTPS（可选）
    # return 301 https://\$server_name\$request_uri;

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
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # 静态文件缓存
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://localhost:${PORT};
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
EOF

    # 启用站点
    ln -sf /etc/nginx/sites-available/${APP_NAME} /etc/nginx/sites-enabled/
    
    # 测试配置
    nginx -t
    
    # 重启 Nginx
    systemctl restart nginx
    
    echo -e "${GREEN}Nginx 配置完成！${NC}"
    echo -e "${YELLOW}如需 HTTPS，请使用 Certbot 配置 SSL 证书:${NC}"
    echo "  apt-get install -y certbot python3-certbot-nginx"
    echo "  certbot --nginx -d ${domain_name}"
fi

# 11. 配置防火墙
echo -e "${GREEN}配置防火墙...${NC}"
if command -v ufw &> /dev/null; then
    ufw allow ${PORT}/tcp
    ufw allow 80/tcp
    ufw allow 443/tcp
    echo -e "${GREEN}防火墙规则已添加${NC}"
elif command -v firewall-cmd &> /dev/null; then
    firewall-cmd --permanent --add-port=${PORT}/tcp
    firewall-cmd --permanent --add-port=80/tcp
    firewall-cmd --permanent --add-port=443/tcp
    firewall-cmd --reload
    echo -e "${GREEN}防火墙规则已添加${NC}"
else
    echo -e "${YELLOW}未检测到防火墙工具，请手动开放端口 ${PORT}, 80, 443${NC}"
fi

# 12. 显示部署信息
echo ""
echo -e "${GREEN}=========================================="
echo "部署完成！"
echo "==========================================${NC}"
echo ""
echo "应用信息:"
echo "  应用目录: ${APP_DIR}"
echo "  应用端口: ${PORT}"
echo "  PM2 名称: ${PM2_NAME}"
echo ""
echo "常用命令:"
echo "  查看状态: pm2 status"
echo "  查看日志: pm2 logs ${PM2_NAME}"
echo "  重启应用: pm2 restart ${PM2_NAME}"
echo "  停止应用: pm2 stop ${PM2_NAME}"
echo ""
echo "访问地址:"
if [ "$setup_nginx" == "y" ] && [ -n "$domain_name" ]; then
    echo "  http://${domain_name}"
else
    echo "  http://$(curl -s ifconfig.me):${PORT}"
fi
echo ""
echo -e "${YELLOW}请确保已配置 .env 文件中的环境变量！${NC}"
echo ""

