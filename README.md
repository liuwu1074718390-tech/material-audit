# 材价审计系统

基于 **Nuxt 3 + Vue 3 + Element Plus** 开发的智能材价审计管理系统。

## ✨ 功能特性

- 📁 **Excel文件上传与解析** - 支持.xls/.xlsx格式，自动解析材料数据
- 🔍 **多维度数据筛选** - 支持按地区、时间范围、材料类别筛选
- 🤖 **AI智能审计** - 集成Dify工作流进行价格分析和偏差计算
- 📊 **结果可视化展示** - 清晰的列表展示，价格偏差颜色标识
- 🎯 **高级筛选功能** - 支持按编码、类别、名称、规格、价格偏差筛选
- 📤 **一键导出** - 将审计结果导出为Excel文件
- 💾 **数据持久化** - 支持历史记录查询（预留数据库集成）
- 🎨 **现代化UI** - 基于Element Plus的美观界面

## 🚀 快速开始

### 方式一：使用安装脚本（推荐）

```bash
# 运行自动安装脚本
./scripts/setup.sh
```

### 方式二：手动安装

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入 Dify API 配置

# 3. 启动开发服务器
npm run dev
```

**访问地址**: http://localhost:3000

📖 **详细说明**: 查看 [快速开始指南](QUICKSTART.md)

## 📋 环境要求

- Node.js >= 18.0
- npm >= 9.0
- 支持现代浏览器（Chrome、Firefox、Safari、Edge）

## ⚙️ 环境配置

在 `.env` 文件中配置以下环境变量：

```env
# Dify API配置（必填）
DIFY_API_KEY=app-xxxxxxxxxxxxxxxxxxxxxxxx
DIFY_API_URL=https://api.dify.ai/v1/workflows/your_workflow_id/run

# 腾讯云配置（可选）
TENCENT_SECRET_ID=your_secret_id
TENCENT_SECRET_KEY=your_secret_key
```

## 🔧 技术栈

### 前端
- **Nuxt 3** - Vue.js的SSR框架
- **Vue 3** - 渐进式JavaScript框架
- **Element Plus** - Vue 3 UI组件库
- **TypeScript** - 类型安全的JavaScript
- **SCSS** - CSS预处理器
- **XLSX** - Excel文件处理

### 后端
- **Nitro** - Nuxt的服务器引擎
- **Node.js** - JavaScript运行时

### 外部服务
- **Dify** - AI工作流平台
- **腾讯云** - 云服务（可选）

## 📁 项目结构

```
材价审计/
├── assets/              # 静态资源和样式
├── components/          # Vue组件
│   ├── UploadDialog.vue       # 上传弹窗
│   └── AuditResultTable.vue   # 结果表格
├── composables/         # 组合式函数
│   ├── useExcelParser.ts      # Excel解析
│   └── useDifyApi.ts          # Dify API
├── docs/               # 完整文档
│   ├── USAGE.md              # 使用说明
│   ├── API.md                # API文档
│   ├── DEPLOYMENT.md         # 部署指南
│   └── DIFY_INTEGRATION.md   # Dify集成
├── pages/              # 页面路由
│   └── index.vue            # 首页
├── server/             # 服务端API
│   ├── api/                 # API接口
│   └── utils/               # 工具类
├── types/              # TypeScript类型
├── scripts/            # 脚本工具
└── 上传材料/           # 示例Excel文件
```

**详细说明**: 查看 [项目结构文档](PROJECT_STRUCTURE.md)

## 📖 文档

- 📘 [快速开始指南](QUICKSTART.md) - 5分钟快速上手
- 📙 [使用说明](docs/USAGE.md) - 详细使用教程
- 📕 [API文档](docs/API.md) - 接口说明
- 📗 [部署指南](docs/DEPLOYMENT.md) - 生产环境部署
- 📔 [Dify集成](docs/DIFY_INTEGRATION.md) - AI工作流配置
- 📓 [项目结构](PROJECT_STRUCTURE.md) - 代码组织说明

## 🎯 使用流程

1. **上传Excel文件** - 点击"上传文件"按钮，选择材料清单Excel文件
2. **配置审计参数** - 选择地区、时间范围、材料类别（可选）
3. **发起审计** - 点击"发起材价审计"，AI自动分析
4. **查看结果** - 浏览审计结果，关注价格偏差
5. **筛选导出** - 使用筛选器定位问题，导出Excel报告

## 📊 Excel文件格式

| 列 | 字段名 | 类型 | 必填 |
|----|--------|------|------|
| A | 序号 | 数字/文本 | 否 |
| B | 编码 | 文本 | ✅ 是 |
| C | 类别 | 文本 | 否 |
| D | 名称 | 文本 | 否 |
| E | 规格型号 | 文本 | 否 |
| F | 单位 | 文本 | 否 |
| G | 数量 | 数字 | 否 |
| H | 不含税市场价 | 数字 | 否 |
| I | 税率 | 数字 | 否 |

**示例文件**: `上传材料/华工二期2025-10-12V2（控制价终稿）备案-人材机汇总.xls`

## 🐳 Docker部署

```bash
# 使用Docker Compose
docker-compose up -d

# 或直接使用Docker
docker build -t material-audit .
docker run -p 3000:3000 -e DIFY_API_KEY=your_key material-audit
```

## 🔨 开发命令

```bash
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run preview      # 预览生产版本
npm run generate     # 生成静态站点
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📝 许可证

MIT License

## 💡 常见问题

### Dify API调用失败？
- 检查API密钥是否正确配置
- 确认工作流已发布
- 开发模式会使用模拟数据

### Excel解析失败？
- 确认文件格式为 .xls 或 .xlsx
- 检查列顺序是否正确
- 确保编码字段（B列）不为空

### 更多问题？
查看 [使用说明](docs/USAGE.md) 或 [快速开始指南](QUICKSTART.md)

## 📧 联系方式

如有问题或建议，欢迎反馈！

---

**Made with ❤️ using Nuxt 3 + Vue 3**

