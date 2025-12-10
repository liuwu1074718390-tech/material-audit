# Node.js 安装指南

## ⚠️ 问题说明

运行项目时出现错误：
```
zsh: command not found: npm
```

这表示您的系统还没有安装 Node.js 和 npm。

## 📦 什么是 Node.js？

Node.js 是运行本项目所必需的 JavaScript 运行环境。npm 是 Node.js 的包管理器，用于安装项目依赖。

## 🔧 安装方法

### 方法一：官网下载安装（⭐ 推荐，最简单）

#### 步骤：

1. **打开浏览器**，访问 Node.js 官网：
   ```
   https://nodejs.org/
   ```

2. **下载 LTS 版本**
   - 页面上会有两个下载按钮
   - 选择左边的 **"LTS"**（长期支持版）
   - 推荐下载 v18.x 或 v20.x 版本

3. **安装**
   - 下载完成后，双击 `.pkg` 文件
   - 按照安装向导的提示，一路点击"继续"
   - 可能需要输入您的 Mac 密码

4. **验证安装**
   - 关闭当前终端窗口
   - 重新打开终端
   - 运行以下命令：
   ```bash
   node -v
   npm -v
   ```
   - 如果显示版本号（如 v18.19.0 和 9.2.0），说明安装成功！

### 方法二：使用 Homebrew 安装（适合熟悉命令行的用户）

如果您已经安装了 Homebrew：

```bash
# 安装 Node.js
brew install node

# 验证安装
node -v
npm -v
```

如果还没有安装 Homebrew，先安装它：

```bash
# 安装 Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 然后安装 Node.js
brew install node
```

### 方法三：使用 nvm 安装（适合需要管理多个 Node.js 版本的开发者）

```bash
# 1. 安装 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 2. 重启终端或运行
source ~/.zshrc

# 3. 安装 Node.js 18
nvm install 18
nvm use 18

# 4. 验证安装
node -v
npm -v
```

## ✅ 验证安装成功

安装完成后，在终端运行：

```bash
node -v
```

应该看到类似输出：
```
v18.19.0
```

再运行：
```bash
npm -v
```

应该看到类似输出：
```
9.2.0
```

## 🚀 安装成功后，启动项目

```bash
# 1. 进入项目目录
cd /Users/liuwu/Desktop/材价审计

# 2. 安装项目依赖
npm install

# 3. 启动开发服务器
npm run dev

# 4. 在浏览器中访问
# http://localhost:3000
```

## ❓ 常见问题

### Q1: 安装后仍然提示 "command not found"

**解决方案**：
- 确保已经**关闭并重新打开终端**
- 或者运行：`source ~/.zshrc`

### Q2: 安装过程中提示权限错误

**解决方案**：
- 使用官网下载的安装包，会自动处理权限
- 如果使用命令行安装，可能需要输入密码

### Q3: 不确定是否安装成功

**解决方案**：
运行以下命令检查：
```bash
which node
which npm
```

如果显示路径（如 `/usr/local/bin/node`），说明安装成功。

### Q4: 想要卸载 Node.js

**解决方案**：

如果通过官网安装包安装的：
```bash
sudo rm -rf /usr/local/bin/node
sudo rm -rf /usr/local/bin/npm
sudo rm -rf /usr/local/lib/node_modules
```

如果通过 Homebrew 安装的：
```bash
brew uninstall node
```

如果通过 nvm 安装的：
```bash
nvm uninstall 18
```

## 📚 推荐版本

- **Node.js**: v18.x（LTS）或 v20.x（LTS）
- **npm**: 9.x 或更高版本（随 Node.js 自动安装）

## 🔗 相关链接

- Node.js 官网: https://nodejs.org/
- Node.js 中文网: https://nodejs.cn/
- npm 官网: https://www.npmjs.com/
- Homebrew 官网: https://brew.sh/

## 💡 提示

- LTS（Long Term Support）版本是长期支持版本，更稳定，推荐使用
- Current 版本是最新版本，包含最新特性，但可能不够稳定
- 本项目需要 Node.js >= 18.0

## 🎯 下一步

安装完 Node.js 后，请返回查看：
- `START_HERE.md` - 快速开始指南
- `QUICKSTART.md` - 详细使用说明

---

**需要帮助？** 查看项目文档或参考 Node.js 官方文档。

