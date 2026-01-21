# 部署文档

## 开发环境部署

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env`：

```bash
cp .env.example .env
```

编辑 `.env` 文件，配置必要的环境变量：

```env
# Dify API配置
DIFY_API_KEY=your_dify_api_key_here
DIFY_API_URL=https://api.dify.ai/v1/workflows/run

# 腾讯云配置
TENCENT_SECRET_ID=your_secret_id
TENCENT_SECRET_KEY=your_secret_key
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## 生产环境部署

### 方案一：传统服务器部署

#### 1. 构建项目

```bash
npm run build
```

#### 2. 启动服务

```bash
node .output/server/index.mjs
```

或使用 PM2：

```bash
npm install -g pm2
pm2 start .output/server/index.mjs --name material-audit
```

### 方案二：Docker部署

#### 1. 创建 Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
```

#### 2. 构建镜像

```bash
docker build -t material-audit .
```

#### 3. 运行容器

```bash
docker run -d \
  -p 3000:3000 \
  -e DIFY_API_KEY=your_key \
  -e DIFY_API_URL=your_url \
  --name material-audit \
  material-audit
```

### 方案三：腾讯云部署

#### 使用腾讯云云托管（Cloud Base）

1. 安装腾讯云CLI工具：
```bash
npm install -g @cloudbase/cli
```

2. 登录腾讯云：
```bash
cloudbase login
```

3. 部署应用：
```bash
cloudbase framework deploy
```

#### 使用腾讯云Serverless

1. 安装 Serverless Framework：
```bash
npm install -g serverless
```

2. 创建 `serverless.yml`：

```yaml
component: nuxt
name: material-audit

inputs:
  src:
    src: ./
    exclude:
      - .env
  region: ap-guangzhou
  runtime: Nodejs18.15
  apiGatewayConf:
    protocols:
      - http
      - https
    environment: release
```

3. 部署：
```bash
serverless deploy
```

## 环境变量说明

### 必需的环境变量

- `DIFY_API_KEY`: Dify API密钥
- `DIFY_API_URL`: Dify API地址

### 可选的环境变量

- `TENCENT_SECRET_ID`: 腾讯云Secret ID
- `TENCENT_SECRET_KEY`: 腾讯云Secret Key
- `NUXT_PUBLIC_API_BASE`: API基础路径（默认 /api）

## 性能优化建议

1. **启用CDN加速**: 将静态资源托管到CDN
2. **启用Gzip压缩**: 减少传输数据量
3. **启用HTTP/2**: 提升加载速度
4. **数据库索引**: 为常用查询字段添加索引
5. **缓存策略**: 使用Redis缓存热点数据

## 监控和日志

### 使用PM2监控

```bash
pm2 logs material-audit
pm2 monit
```

### 日志文件路径

- 应用日志: `~/.pm2/logs/`
- 系统日志: `/var/log/`

## 故障排查

### 常见问题

1. **端口占用**
   - 检查端口：`lsof -i :3000`
   - 修改端口：在启动时指定 `PORT=3001 npm run dev`

2. **模块未找到**
   - 重新安装依赖：`rm -rf node_modules && npm install`

3. **Excel解析失败**
   - 确认文件格式为 .xls 或 .xlsx
   - 确认文件结构符合规范

4. **Dify API调用失败**
   - 检查环境变量配置
   - 检查API密钥是否有效
   - 查看网络连接状态

## 安全建议

1. **密钥管理**: 不要将密钥提交到代码仓库
2. **HTTPS**: 生产环境必须使用HTTPS
3. **CORS配置**: 限制允许的来源
4. **输入验证**: 对用户输入进行验证和清理
5. **SQL注入防护**: 使用参数化查询
6. **XSS防护**: 对输出内容进行转义

