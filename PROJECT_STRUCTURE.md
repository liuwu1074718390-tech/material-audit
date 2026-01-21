# 项目结构说明

```
材价审计/
├── .env                     # 环境变量 (已包含密钥，敏感)
├── .env.example             # 环境变量示例
├── .gitignore               # Git 忽略规则
├── .dockerignore           # Docker 忽略规则
├── Dockerfile               # 容器构建配置
├── docker-compose.yml       # 容器编排配置
├── nuxt.config.ts           # Nuxt 核心配置
├── package.json             # 项目依赖与脚本
├── package-lock.json        # 依赖锁文件
├── tsconfig.json            # TypeScript 配置
├── README.md                # 项目快速入门
├── PROJECT_STRUCTURE.md     # 本文件 (详细结构说明)
├── app.vue                 # 应用入口组件
├── assets/                  # 静态资源 (样式、图标)
├── components/              # Vue 组件库
├── composables/             # 前端核心逻辑 (API调用、Excel解析)
├── database/                # 数据库相关 (SQL 脚本、初始化)
├── docs/                    # 文档库 (部署/排错/指南/归档)
├── pages/                   # 路由页面 (首页、任务详情)
├── plugins/                 # 框架插件 (ElementPlus, Dayjs)
├── public/                  # 公共资源 (Excel 模板、网站图标)
├── scripts/                 # 自动化运维脚本 (内网部署)
├── server/                  # 服务端核心逻辑 (Nitro API, Utils)
└── types/                   # TypeScript 类型定义
```

## 核心文件说明

### 配置文件

- **nuxt.config.ts**: Nuxt框架配置，包括模块、运行时配置等
- **package.json**: 项目依赖和脚本配置
- **tsconfig.json**: TypeScript编译配置
- **.env**: 环境变量配置（需手动创建，参考.env.example）

### 前端代码

- **app.vue**: 应用入口文件
- **pages/index.vue**: 首页，包含上传按钮和历史记录列表
- **components/UploadDialog.vue**: 多步骤上传弹窗，包括文件上传和参数配置
- **components/AuditResultTable.vue**: 审计结果表格，包含筛选和导出功能

### 后端代码

- **server/api/dify/audit.post.ts**: 处理审计请求，调用Dify API
- **server/api/audit-records.get.ts**: 查询历史审计记录
- **server/utils/database.ts**: 数据库操作工具（预留腾讯云集成）

### 工具函数

- **composables/useExcelParser.ts**: Excel文件解析和导出
- **composables/useDifyApi.ts**: Dify API调用封装
- **types/index.ts**: TypeScript类型定义

### 文档

- **docs/USAGE.md**: 用户使用说明
- **docs/API.md**: API接口文档
- **docs/DEPLOYMENT.md**: 部署指南
- **docs/DIFY_INTEGRATION.md**: Dify工作流集成详细指南

### 脚本

- **scripts/setup.sh**: 自动安装和配置脚本
- **scripts/start.sh**: 快速启动脚本

## 数据流程

```
用户操作流程：
1. 点击"上传文件" → UploadDialog.vue
2. 选择Excel文件 → useExcelParser.parseExcel()
3. 配置审计参数 → 表单填写
4. 点击"发起材价审计" → useDifyApi.runAuditWorkflow()
5. 后端处理 → server/api/dify/audit.post.ts
6. 调用Dify API → 外部服务
7. 处理返回结果 → 数据合并和格式化
8. 显示审计结果 → AuditResultTable.vue
9. 筛选/导出 → 本地操作
```

## 技术栈

### 前端
- **Nuxt 3**: Vue.js的SSR框架
- **Vue 3**: 渐进式JavaScript框架
- **Element Plus**: Vue 3 UI组件库
- **TypeScript**: 类型安全的JavaScript超集
- **SCSS**: CSS预处理器

### 后端
- **Nitro**: Nuxt的服务器引擎
- **Node.js**: JavaScript运行时
- **XLSX**: Excel文件处理库

### 外部服务
- **Dify**: AI工作流平台
- **腾讯云**: 云服务提供商（可选）

## 开发命令

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview

# 生成静态站点
npm run generate
```

## 环境要求

- Node.js >= 18.x
- npm >= 9.x
- 支持现代浏览器（Chrome、Firefox、Safari、Edge）

## 注意事项

1. **环境变量**: 必须配置 `.env` 文件中的 `DIFY_API_KEY` 和 `DIFY_API_URL`
2. **Excel格式**: 上传的Excel文件必须符合规定的格式（见docs/USAGE.md）
3. **数据存储**: 当前使用内存存储，生产环境需要集成数据库
4. **文件大小**: 建议上传的Excel文件不超过10MB
5. **浏览器兼容**: 需要支持ES2020+的现代浏览器

## 扩展开发

### 添加新页面

在 `pages/` 目录下创建新的 `.vue` 文件，Nuxt会自动生成路由。

### 添加新组件

在 `components/` 目录下创建新的 `.vue` 文件，可以在任何地方直接使用。

### 添加新API

在 `server/api/` 目录下创建新的 `.ts` 文件，文件名即为路由路径。

### 添加组合式函数

在 `composables/` 目录下创建新的 `.ts` 文件，导出可复用的逻辑。

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

本项目采用 MIT 许可证。

