# 🚀 从这里开始

欢迎使用材价审计系统！这是一个快速入门指南，帮助您在5分钟内启动系统。

## 📋 前置检查

在开始之前，请确保已安装：

- ✅ Node.js >= 18.0
- ✅ npm >= 9.0

检查版本：
```bash
node -v    # 应显示 v18.x.x 或更高
npm -v     # 应显示 9.x.x 或更高
```

❌ 如果未安装，请访问 https://nodejs.org/ 下载安装。

## ⚡ 快速启动（3步）

### 步骤1: 安装依赖

```bash
cd /Users/liuwu/Desktop/材价审计
npm install
```

⏱️ 等待1-3分钟...

### 步骤2: 配置环境

```bash
# 复制环境变量文件
cp .env.example .env

# 编辑配置文件（使用任意编辑器）
open .env
```

**必填项**（暂时可以先不填，使用模拟数据测试）：
```env
DIFY_API_KEY=app-xxxxxxxxxxxxxxxxxxxxxxxx
DIFY_API_URL=https://api.dify.ai/v1/workflows/your_workflow_id/run
```

💡 **提示**: 如果还没有Dify配置，可以先跳过此步骤，系统会使用模拟数据。

### 步骤3: 启动系统

```bash
npm run dev
```

✅ 看到以下信息表示启动成功：
```
Nuxt 3.10.0 with Nitro 2.8.1
  > Local:    http://localhost:3000/
```

🎉 **打开浏览器访问**: http://localhost:3000

## 🎯 快速测试

### 1. 测试文件上传

1. 点击页面上的 **"上传文件"** 按钮
2. 选择示例文件：
   ```
   上传材料/华工二期2025-10-12V2（控制价终稿）备案-人材机汇总.xls
   ```
3. 点击 **"下一步"**
4. 应该看到参数配置页面

### 2. 测试审计功能

1. 在参数配置页面：
   - **地区**（选填）：可以选择"广东省 > 广州市"
   - **时间**（选填）：可以选择"2024-01 至 2024-12"
   - **类别**（选填）：可以多选类别
2. 点击 **"发起材价审计"**
3. 等待几秒，查看审计结果

💡 **注意**: 如果没有配置Dify API，系统会使用模拟数据，同样可以测试所有功能。

### 3. 测试筛选和导出

1. 在结果列表上方，尝试使用筛选器
2. 点击 **"导出Excel"** 按钮，下载结果文件

## 📚 下一步

### 配置Dify API（重要）

如果要使用真实的AI审计功能，需要配置Dify：

1. 📖 阅读 [Dify集成指南](docs/DIFY_INTEGRATION.md)
2. 🔑 获取Dify API密钥
3. ⚙️ 创建Dify工作流
4. 📝 配置.env文件

### 学习使用

- 📘 [快速开始指南](QUICKSTART.md) - 详细的快速入门
- 📙 [使用说明](docs/USAGE.md) - 完整的使用教程
- 📕 [API文档](docs/API.md) - 接口说明

### 部署到生产

- 📗 [部署指南](docs/DEPLOYMENT.md) - 生产环境部署
- 🐳 [Docker部署](docker-compose.yml) - 容器化部署

## 🆘 遇到问题？

### 常见问题

#### ❓ npm install 失败

```bash
# 切换npm镜像源
npm config set registry https://registry.npmmirror.com
npm install
```

#### ❓ 端口3000被占用

```bash
# 使用其他端口
PORT=3001 npm run dev
```

#### ❓ Excel解析失败

- 确认文件格式为 .xls 或 .xlsx
- 确认文件结构符合要求（见 [使用说明](docs/USAGE.md)）

#### ❓ 更多问题

查看 [安装说明](INSTALL.md) 或 [常见问题](QUICKSTART.md#常见问题)

## 📖 完整文档列表

| 文档 | 说明 |
|------|------|
| [README.md](README.md) | 项目总览 |
| [QUICKSTART.md](QUICKSTART.md) | 快速开始 |
| [INSTALL.md](INSTALL.md) | 安装说明 |
| [项目交付说明.md](项目交付说明.md) | 项目交付文档 |
| [docs/USAGE.md](docs/USAGE.md) | 使用教程 |
| [docs/API.md](docs/API.md) | API文档 |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | 部署指南 |
| [docs/DIFY_INTEGRATION.md](docs/DIFY_INTEGRATION.md) | Dify集成 |

## 🎨 系统功能预览

### 主要功能
- ✅ Excel文件上传与解析
- ✅ 智能价格审计（AI驱动）
- ✅ 多维度数据筛选
- ✅ 价格偏差分析
- ✅ 一键导出Excel
- ✅ 历史记录查询

### 技术特点
- 🚀 基于Nuxt 3 + Vue 3
- 🎨 Element Plus UI组件
- 🤖 Dify AI工作流集成
- 📊 Excel文件处理
- 🔒 TypeScript类型安全
- 🐳 Docker容器化支持

## 💡 使用提示

1. **开发模式**: 当前是开发模式，代码修改会自动刷新
2. **模拟数据**: 未配置Dify时，会使用模拟数据进行测试
3. **内存存储**: 当前使用内存存储，重启后数据会丢失
4. **生产部署**: 生产环境需要配置数据库和Dify API

## 🎯 快速命令参考

```bash
# 开发
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run preview      # 预览生产版本

# 工具
./scripts/setup.sh   # 自动安装（推荐）
./scripts/start.sh   # 快速启动

# Docker
docker-compose up -d # 启动Docker服务
docker-compose down  # 停止Docker服务
```

## 📧 需要帮助？

- 📚 查看完整文档
- 💬 提交Issue
- 📖 阅读源码注释

---

**准备好了吗？开始使用吧！** 🎉

运行命令：
```bash
npm run dev
```

然后访问：http://localhost:3000

祝使用愉快！

