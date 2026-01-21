# 快速开始指南

## 5分钟快速部署

### 方式一：使用安装脚本（推荐）

```bash
# 1. 进入项目目录
cd /Users/liuwu/Desktop/材价审计

# 2. 运行安装脚本
./scripts/setup.sh
```

脚本会自动：
- ✅ 检查Node.js环境
- ✅ 安装项目依赖
- ✅ 创建环境配置文件
- ✅ 提示启动开发服务器

### 方式二：手动安装

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量
cp .env.example .env

# 3. 编辑 .env 文件，填入Dify API配置
# 使用任意文本编辑器打开 .env

# 4. 启动开发服务器
npm run dev
```

## Dify配置（重要！）

### 1. 获取Dify API密钥

1. 访问 https://dify.ai 并登录
2. 进入"工作区设置"
3. 点击"API密钥"
4. 点击"创建密钥"并复制

### 2. 创建Dify工作流

参考 `docs/DIFY_INTEGRATION.md` 创建审计工作流

关键输入变量：
- `materials`: 材料数据（JSON字符串）
- `region`: 地区（可选）
- `timeRange`: 时间范围（可选）
- `categories`: 类别（可选）

关键输出格式：
```json
{
  "results": [
    {
      "序号": 1,
      "编码": "010101001001",
      "推荐价格范围": "3800 - 4100",
      "价格偏差": "+5.26%"
    }
  ]
}
```

### 3. 配置.env文件

```env
DIFY_API_KEY=app-xxxxxxxxxxxxxxxxxxxxxxxx
DIFY_API_URL=https://api.dify.ai/v1/workflows/{workflow_id}/run
```

## 测试系统

### 1. 访问系统

打开浏览器访问：http://localhost:3000

### 2. 上传测试文件

使用项目自带的示例文件进行测试：

`上传材料/华工二期2025-10-12V2（控制价终稿）备案-人材机汇总.xls`

### 3. 配置审计参数

- **地区**（选填）：广东省 > 广州市
- **时间**（选填）：2024-01 至 2024-12
- **类别**（选填）：可多选，如"钢筋"、"水泥"等

### 4. 查看结果

点击"发起材价审计"后，系统会：
1. 调用Dify工作流进行分析
2. 显示审计结果列表
3. 支持按多个维度筛选
4. 支持导出为Excel文件

## Excel文件格式

您的Excel文件应该包含以下列（A-I列）：

| 列 | 字段 | 示例 |
|----|------|------|
| A | 序号 | 1 |
| B | 编码 | 010101001001 |
| C | 类别 | 钢筋 |
| D | 名称 | 热轧带肋钢筋 |
| E | 规格型号 | HRB400 Φ12 |
| F | 单位 | t |
| G | 数量 | 10.5 |
| H | 不含税市场价 | 4200 |
| I | 税率 | 13 |

**重要提示**：
- 第1行为表头
- 数据从第2行开始
- 编码字段（B列）必填

## 常见问题

### ❓ npm install 失败

**解决方案**：
```bash
# 清除缓存
npm cache clean --force

# 删除node_modules重新安装
rm -rf node_modules package-lock.json
npm install
```

### ❓ 端口3000被占用

**解决方案**：
```bash
# 方式1: 修改端口
PORT=3001 npm run dev

# 方式2: 在.env中设置
# 编辑.env文件，添加：
PORT=3001
```

### ❓ Dify API调用失败

**检查清单**：
- [ ] API密钥配置正确
- [ ] API URL格式正确（包含workflow_id）
- [ ] Dify工作流已发布
- [ ] 网络连接正常
- [ ] API密钥有效期未过

**开发模式提示**：
在开发环境下，如果Dify调用失败，系统会自动使用模拟数据，便于测试UI功能。

### ❓ Excel解析失败

**检查清单**：
- [ ] 文件格式为 .xls 或 .xlsx
- [ ] 文件未损坏
- [ ] 列顺序符合要求
- [ ] 编码字段（B列）不为空

### ❓ 页面空白或报错

**解决方案**：
```bash
# 清除Nuxt缓存
rm -rf .nuxt .output

# 重新启动
npm run dev
```

## 开发模式特性

在开发模式下（`NODE_ENV=development`）：

- 🔧 热重载：代码修改后自动刷新
- 🐛 详细错误信息：显示完整的错误堆栈
- 📝 开发工具：可以使用Vue DevTools
- 🎭 模拟数据：Dify调用失败时使用模拟数据

## 下一步

- 📖 阅读 [使用说明](docs/USAGE.md)
- 🔌 配置 [Dify集成](docs/DIFY_INTEGRATION.md)
- 🚀 查看 [部署文档](docs/DEPLOYMENT.md)
- 📚 浏览 [API文档](docs/API.md)

## 需要帮助？

- 查看完整文档：`docs/` 目录
- 查看项目结构：`PROJECT_STRUCTURE.md`
- 检查示例文件：`上传材料/` 目录

## 快速命令参考

```bash
# 开发
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run preview      # 预览生产版本

# 工具
./scripts/setup.sh   # 快速安装
./scripts/start.sh   # 快速启动
```

祝您使用愉快！🎉

