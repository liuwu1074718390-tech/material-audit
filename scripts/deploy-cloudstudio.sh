#!/bin/bash

echo "🚀 开始部署到 Cloud Studio..."
echo "================================"

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. 检查 Node.js 版本
echo -e "${YELLOW}📋 步骤 1/5: 检查环境...${NC}"
NODE_VERSION=$(node --version)
echo "Node.js 版本: $NODE_VERSION"

# 2. 安装依赖
echo -e "\n${YELLOW}📦 步骤 2/5: 安装依赖...${NC}"
if [ ! -d "node_modules" ]; then
    echo "正在安装依赖..."
    npm install --legacy-peer-deps
else
    echo "依赖已存在，跳过安装"
fi

# 3. 构建项目
echo -e "\n${YELLOW}🔨 步骤 3/5: 构建生产版本...${NC}"
echo "正在构建项目..."
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ 构建失败！${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 构建成功！${NC}"

# 4. 创建部署包
echo -e "\n${YELLOW}📦 步骤 4/5: 创建部署包...${NC}"
DEPLOY_DIR="deploy-package"
rm -rf $DEPLOY_DIR
mkdir -p $DEPLOY_DIR

# 复制必要文件
echo "复制文件到部署目录..."
cp -r .output $DEPLOY_DIR/
cp package.json $DEPLOY_DIR/
cp package-lock.json $DEPLOY_DIR/ 2>/dev/null || true
cp .env $DEPLOY_DIR/
cp ecosystem.config.js $DEPLOY_DIR/ 2>/dev/null || true
cp .cloudstudio.yml $DEPLOY_DIR/ 2>/dev/null || true

# 创建启动脚本
cat > $DEPLOY_DIR/start.sh << 'EOF'
#!/bin/bash
echo "🚀 启动材价审计系统..."

# 设置环境变量
export NODE_ENV=production
export PORT=3000
export HOST=0.0.0.0

# 启动服务
node .output/server/index.mjs
EOF

chmod +x $DEPLOY_DIR/start.sh

# 创建 README
cat > $DEPLOY_DIR/README.md << 'EOF'
# 材价审计系统 - 部署包

## 快速启动

### 方法 1: 直接启动
```bash
npm run preview
```

### 方法 2: 使用启动脚本
```bash
./start.sh
```

### 方法 3: 使用 PM2（推荐）
```bash
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 环境变量配置

请确保 `.env` 文件包含以下配置：

```env
DIFY_API_KEY=你的API密钥
DIFY_API_URL=你的API地址
DIFY_WORKFLOW_ID=你的工作流ID
DB_HOST=数据库地址
DB_PORT=数据库端口
DB_USER=数据库用户
DB_PASSWORD=数据库密码
DB_NAME=数据库名称
```

## 访问地址

- 本地: http://localhost:3000
- 生产: 根据 Cloud Studio 提供的地址

## 端口配置

默认端口: 3000
可通过环境变量 `PORT` 修改

## 健康检查

```bash
curl http://localhost:3000/
```

## 日志查看

如果使用 PM2:
```bash
pm2 logs material-audit
```

## 停止服务

如果使用 PM2:
```bash
pm2 stop material-audit
```

直接启动的可以用 Ctrl+C 停止
EOF

echo -e "${GREEN}✅ 部署包创建完成！${NC}"
echo "部署目录: $DEPLOY_DIR"

# 5. 显示部署信息
echo -e "\n${YELLOW}📋 步骤 5/5: 部署信息${NC}"
echo "================================"
echo -e "${GREEN}✅ 所有准备工作已完成！${NC}"
echo ""
echo "📦 部署包位置: $(pwd)/$DEPLOY_DIR"
echo "📝 部署包内容:"
ls -lh $DEPLOY_DIR
echo ""
echo "🚀 Cloud Studio 部署步骤:"
echo "1. 将 $DEPLOY_DIR 目录上传到 Cloud Studio"
echo "2. 在 Cloud Studio 中执行: chmod +x start.sh"
echo "3. 配置环境变量（.env 文件）"
echo "4. 启动服务: ./start.sh 或 npm run preview"
echo ""
echo "📖 详细文档: CLOUDSTUDIO_DEPLOY.md"
echo "================================"

# 创建压缩包（可选）
echo -e "\n${YELLOW}💾 创建部署压缩包...${NC}"
tar -czf material-audit-deploy.tar.gz -C $DEPLOY_DIR .
echo -e "${GREEN}✅ 压缩包已创建: material-audit-deploy.tar.gz${NC}"
echo "可以直接上传这个压缩包到 Cloud Studio"

echo -e "\n${GREEN}🎉 部署准备完成！${NC}"
