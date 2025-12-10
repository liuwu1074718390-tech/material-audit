# Windows 服务器详细部署步骤

## 📋 准备工作

1. ✅ 已购买腾讯云 Windows 服务器
2. ✅ 已通过远程桌面连接到服务器
3. ✅ 服务器可以访问互联网

---

## 第一步：安装 Node.js

### 1.1 下载 Node.js

1. **在服务器上打开浏览器**（IE 或 Edge）
2. **访问**：https://nodejs.org/zh-cn/
3. **下载 LTS 版本**（推荐 18.x 或更高）
   - 点击 "Windows 安装程序 (.msi)" 下载

### 1.2 安装 Node.js

1. **运行下载的安装程序**
2. **一路点击"下一步"**，使用默认设置
3. **安装完成后，重启服务器**（重要！）

### 1.3 验证安装

1. **打开 PowerShell**（开始菜单搜索 "PowerShell"）
2. **输入命令验证**：
   ```powershell
   node -v
   npm -v
   ```
3. **应该显示版本号**，例如：`v18.17.0` 和 `9.6.7`

---

## 第二步：安装 Git（用于下载代码）

### 2.1 下载 Git

1. **访问**：https://git-scm.com/download/win
2. **下载 Windows 版本**

### 2.2 安装 Git

1. **运行安装程序**
2. **一路点击"下一步"**，使用默认设置

### 2.3 验证安装

在 PowerShell 中输入：
```powershell
git --version
```

---

## 第三步：部署应用代码

### 方式 A：从 Git 仓库克隆（推荐）

1. **打开 PowerShell**
2. **创建项目目录**：
   ```powershell
   mkdir C:\material-audit
   cd C:\material-audit
   ```
3. **克隆代码**（替换为你的仓库地址）：
   ```powershell
   git clone https://github.com/your-username/your-repo.git .
   ```

### 方式 B：从本地上传

1. **在本地电脑打包项目**：
   - 在项目文件夹中，选中所有文件
   - 右键 → 发送到 → 压缩(zipped)文件夹
   - 命名为 `material-audit.zip`

2. **上传到服务器**：
   - 通过远程桌面，直接复制粘贴文件
   - 或使用 FTP 工具上传

3. **在服务器上解压**：
   - 右键 `material-audit.zip` → 全部提取
   - 提取到 `C:\material-audit`

---

## 第四步：安装项目依赖

1. **打开 PowerShell**
2. **进入项目目录**：
   ```powershell
   cd C:\material-audit
   ```
3. **安装依赖**（可能需要几分钟）：
   ```powershell
   npm install
   ```

---

## 第五步：配置环境变量

1. **在项目目录创建 `.env` 文件**：
   ```powershell
   notepad .env
   ```

2. **在记事本中输入以下内容**（替换为你的实际值）：
   ```env
   # Dify API配置
   DIFY_API_KEY=app-xxxxxxxxxxxxxxxxxxxxxxxx
   DIFY_API_URL=https://api.dify.ai/v1/workflows/your_workflow_id/run

   # 数据库配置
   DB_HOST=your_db_host
   DB_PORT=3306
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_NAME=your_db_name
   ```

3. **保存并关闭记事本**

---

## 第六步：构建项目

在 PowerShell 中执行：
```powershell
cd C:\material-audit
npm run build
```

等待构建完成（可能需要 1-2 分钟）

---

## 第七步：安装 PM2（进程管理器）

在 PowerShell 中执行：
```powershell
npm install -g pm2
```

验证安装：
```powershell
pm2 -v
```

---

## 第八步：启动应用

### 8.1 使用 PM2 启动

在 PowerShell 中执行：
```powershell
cd C:\material-audit
pm2 start .output/server/index.mjs --name material-audit
```

### 8.2 保存 PM2 配置

```powershell
pm2 save
```

### 8.3 设置开机自启

```powershell
pm2 startup
```

**重要**：会输出一个命令，类似：
```
[PM2] To setup the Startup Script, copy/paste the following command:
pm2 startup
```

如果输出类似上面的命令，直接执行即可。如果输出的是管理员命令，需要：
1. **以管理员身份打开 PowerShell**
2. **执行输出的命令**

---

## 第九步：配置防火墙

### 9.1 通过图形界面配置（最简单）

1. **打开防火墙设置**：
   - 按 `Win + R`，输入 `wf.msc`，回车

2. **添加入站规则**：
   - 左侧点击"入站规则"
   - 右侧点击"新建规则"
   - 选择"端口" → 下一步
   - 选择"TCP"，输入端口：`3000` → 下一步
   - 选择"允许连接" → 下一步
   - 全部勾选（域、专用、公用）→ 下一步
   - 名称填写：`Material Audit App` → 完成

3. **同样方式添加其他端口**：
   - 端口 80（HTTP）
   - 端口 443（HTTPS）

### 9.2 通过 PowerShell 配置（快速）

**以管理员身份打开 PowerShell**，执行：

```powershell
# 开放 3000 端口
New-NetFirewallRule -DisplayName "Material Audit App" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow

# 开放 80 端口
New-NetFirewallRule -DisplayName "HTTP" -Direction Inbound -LocalPort 80 -Protocol TCP -Action Allow

# 开放 443 端口
New-NetFirewallRule -DisplayName "HTTPS" -Direction Inbound -LocalPort 443 -Protocol TCP -Action Allow
```

---

## 第十步：验证部署

### 10.1 检查应用状态

在 PowerShell 中执行：
```powershell
pm2 status
```

应该看到 `material-audit` 状态为 `online`

### 10.2 查看日志

```powershell
pm2 logs material-audit
```

### 10.3 测试访问

在浏览器中访问：
- `http://你的服务器IP:3000`
- 或 `http://localhost:3000`（在服务器上测试）

---

## 📝 常用管理命令

### 查看应用状态
```powershell
pm2 status
```

### 查看日志
```powershell
pm2 logs material-audit
```

### 重启应用
```powershell
pm2 restart material-audit
```

### 停止应用
```powershell
pm2 stop material-audit
```

### 更新应用
```powershell
cd C:\material-audit
git pull
npm install
npm run build
pm2 restart material-audit
```

---

## 🐛 常见问题

### 问题 1：npm install 很慢或失败

**解决**：使用国内镜像
```powershell
npm config set registry https://registry.npmmirror.com
```

### 问题 2：端口被占用

**检查端口占用**：
```powershell
netstat -ano | findstr :3000
```

**结束进程**（替换 PID）：
```powershell
taskkill /PID <PID> /F
```

### 问题 3：应用无法启动

**查看错误日志**：
```powershell
pm2 logs material-audit --err
```

**检查环境变量**：
```powershell
# 确认 .env 文件存在且配置正确
notepad C:\material-audit\.env
```

### 问题 4：无法访问应用

1. **检查防火墙**：确认已开放 3000 端口
2. **检查安全组**：在腾讯云控制台确认安全组已开放 3000 端口
3. **检查应用状态**：`pm2 status`

---

## ✅ 部署检查清单

- [ ] Node.js 已安装并验证
- [ ] Git 已安装（如需要）
- [ ] 代码已部署到 `C:\material-audit`
- [ ] 依赖已安装（npm install）
- [ ] `.env` 文件已配置
- [ ] 项目已构建（npm run build）
- [ ] PM2 已安装
- [ ] 应用已启动（pm2 status 显示 online）
- [ ] 防火墙已开放 3000 端口
- [ ] 安全组已开放 3000 端口
- [ ] 可以访问 `http://服务器IP:3000`

---

## 🎉 完成！

部署完成后，你的系统就可以通过 `http://你的服务器IP:3000` 访问了！

如果需要使用域名访问，可以：
1. 配置域名解析指向服务器 IP
2. 使用 IIS 配置反向代理
3. 或使用 Nginx for Windows

