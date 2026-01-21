# 安装说明

## 系统要求

### 必需软件
- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **操作系统**: macOS、Linux、Windows

### 推荐配置
- **内存**: >= 4GB RAM
- **磁盘空间**: >= 500MB
- **浏览器**: Chrome、Firefox、Safari、Edge（最新版本）

## 检查环境

### 1. 检查Node.js版本

```bash
node -v
# 应显示 v18.x.x 或更高版本
```

如果未安装或版本过低，请访问 https://nodejs.org/ 下载安装。

### 2. 检查npm版本

```bash
npm -v
# 应显示 9.x.x 或更高版本
```

## 安装步骤

### 方法一：自动安装（推荐）

```bash
# 1. 进入项目目录
cd /Users/liuwu/Desktop/材价审计

# 2. 给脚本添加执行权限（如果还没有）
chmod +x scripts/setup.sh

# 3. 运行安装脚本
./scripts/setup.sh
```

安装脚本会自动完成以下操作：
- ✅ 检查Node.js和npm环境
- ✅ 安装项目依赖
- ✅ 创建.env配置文件
- ✅ 提示配置Dify API
- ✅ 询问是否立即启动

### 方法二：手动安装

#### 步骤1: 安装依赖

```bash
cd /Users/liuwu/Desktop/材价审计
npm install
```

等待依赖安装完成（可能需要几分钟）。

#### 步骤2: 配置环境变量

```bash
# 复制环境变量示例文件
cp .env.example .env
```

使用文本编辑器打开 `.env` 文件：

```bash
# macOS
open .env

# 或使用其他编辑器
nano .env
# vim .env
# code .env  # VS Code
```

编辑以下必填项：

```env
DIFY_API_KEY=app-xxxxxxxxxxxxxxxxxxxxxxxx
DIFY_API_URL=https://api.dify.ai/v1/workflows/your_workflow_id/run
```

#### 步骤3: 启动开发服务器

```bash
npm run dev
```

看到以下输出表示启动成功：

```
Nuxt 3.10.0 with Nitro 2.8.1
  > Local:    http://localhost:3000/
  > Network:  use --host to expose
```

在浏览器中访问 http://localhost:3000

## 获取Dify API配置

### 1. 注册Dify账号

访问 https://dify.ai 并注册账号（如果还没有）。

### 2. 创建工作流

1. 登录Dify控制台
2. 创建新的工作流
3. 配置输入节点（参考 `docs/DIFY_INTEGRATION.md`）
4. 配置处理逻辑
5. 配置输出节点
6. 测试工作流
7. 点击"发布"

### 3. 获取API密钥

1. 进入"工作区设置"
2. 点击"API密钥"
3. 点击"创建密钥"
4. 复制生成的密钥（格式：app-xxxxxxxxxxxxxxxxxxxxxxxx）

### 4. 获取工作流URL

1. 打开已发布的工作流
2. 点击"API访问"
3. 复制API URL（格式：https://api.dify.ai/v1/workflows/{workflow_id}/run）

### 5. 配置到.env文件

将获取的密钥和URL填入 `.env` 文件：

```env
DIFY_API_KEY=app-your-actual-key-here
DIFY_API_URL=https://api.dify.ai/v1/workflows/your-workflow-id/run
```

## 验证安装

### 1. 访问系统

打开浏览器访问 http://localhost:3000

应该看到"材价审计系统"主页，包含"上传文件"按钮。

### 2. 测试上传

1. 点击"上传文件"按钮
2. 选择示例文件：`上传材料/华工二期2025-10-12V2（控制价终稿）备案-人材机汇总.xls`
3. 点击"下一步"
4. 应该看到参数配置页面，类别下拉框中有选项

### 3. 测试审计（可选）

如果已配置Dify API：
1. 在参数配置页面选择参数（可选）
2. 点击"发起材价审计"
3. 等待几秒到几十秒
4. 应该看到审计结果列表

如果未配置Dify API：
- 开发模式下会使用模拟数据
- 可以测试UI功能和筛选导出功能

## 常见安装问题

### 问题1: npm install 失败

**错误信息**: `npm ERR! code ECONNREFUSED` 或网络错误

**解决方案**:
```bash
# 设置npm镜像为淘宝源
npm config set registry https://registry.npmmirror.com

# 重新安装
npm install
```

### 问题2: 权限错误

**错误信息**: `EACCES: permission denied`

**解决方案**:
```bash
# macOS/Linux
sudo chown -R $USER ~/.npm
sudo chown -R $USER ./node_modules

# 重新安装
npm install
```

### 问题3: Node版本过低

**错误信息**: `The engine "node" is incompatible`

**解决方案**:
1. 访问 https://nodejs.org/
2. 下载并安装最新的LTS版本（18.x或20.x）
3. 重新运行安装命令

### 问题4: 端口3000被占用

**错误信息**: `Port 3000 is already in use`

**解决方案**:
```bash
# 方式1: 使用其他端口
PORT=3001 npm run dev

# 方式2: 在.env中设置
echo "PORT=3001" >> .env
npm run dev

# 方式3: 查找并关闭占用端口的进程
# macOS/Linux
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### 问题5: Element Plus样式不显示

**解决方案**:
```bash
# 清除缓存重新构建
rm -rf .nuxt .output node_modules
npm install
npm run dev
```

### 问题6: TypeScript错误

**解决方案**:
```bash
# 重新生成类型定义
npm run postinstall
```

## 卸载

如需卸载项目：

```bash
# 1. 停止开发服务器（Ctrl+C）

# 2. 删除node_modules
rm -rf node_modules

# 3. 删除构建产物
rm -rf .nuxt .output

# 4. 可选：删除整个项目目录
cd ..
rm -rf 材价审计
```

## 更新依赖

定期更新依赖以获取最新功能和安全补丁：

```bash
# 检查可更新的包
npm outdated

# 更新所有依赖到最新版本
npm update

# 或使用npm-check-updates工具
npx npm-check-updates -u
npm install
```

## 生产环境安装

生产环境部署请参考 [部署文档](docs/DEPLOYMENT.md)。

简要步骤：

```bash
# 1. 安装依赖（仅生产依赖）
npm ci --only=production

# 2. 构建
npm run build

# 3. 启动
node .output/server/index.mjs
```

## 开发工具推荐

### VS Code扩展
- **Vue Language Features (Volar)** - Vue 3支持
- **TypeScript Vue Plugin (Volar)** - TypeScript支持
- **ESLint** - 代码检查
- **Prettier** - 代码格式化

### 浏览器扩展
- **Vue.js devtools** - Vue调试工具

## 获取帮助

### 文档
- [快速开始](QUICKSTART.md)
- [使用说明](docs/USAGE.md)
- [常见问题](QUICKSTART.md#常见问题)

### 社区
- Nuxt文档: https://nuxt.com/docs
- Vue文档: https://vuejs.org/
- Element Plus文档: https://element-plus.org/

### 支持
如遇到其他问题，请查看项目文档或提交Issue。

---

**安装完成后，请阅读 [快速开始指南](QUICKSTART.md) 了解如何使用系统。**

