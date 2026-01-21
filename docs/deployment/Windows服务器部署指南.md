# 材价审计系统 - Windows 服务器部署指南

## 🔍 Windows 服务器检查 SSH 服务

### 方法一：通过图形界面检查

1. **打开服务管理器**
   - 按 `Win + R`，输入 `services.msc`，回车
   - 或：开始菜单 → 搜索"服务"

2. **查找 SSH 服务**
   - 找到 "OpenSSH SSH Server" 或 "SSH Server"
   - 查看状态是否为"正在运行"

3. **如果未运行**
   - 右键点击服务 → "启动"
   - 右键点击服务 → "属性" → 启动类型改为"自动"

### 方法二：通过 PowerShell 检查（推荐）

1. **打开 PowerShell（管理员权限）**
   - 开始菜单 → 搜索"PowerShell"
   - 右键点击 → "以管理员身份运行"

2. **检查 SSH 服务**

```powershell
# 检查 SSH 服务状态
Get-Service sshd

# 如果未运行，启动服务
Start-Service sshd

# 设置开机自启
Set-Service -Name sshd -StartupType Automatic

# 检查 22 端口是否监听
netstat -an | findstr :22
```

---

## 🔥 Windows 防火墙配置

### 通过图形界面配置

1. **打开防火墙设置**
   - 按 `Win + R`，输入 `wf.msc`，回车
   - 或：控制面板 → Windows Defender 防火墙 → 高级设置

2. **添加入站规则**
   - 左侧选择"入站规则"
   - 右侧点击"新建规则"
   - 选择"端口" → 下一步
   - 选择"TCP"，输入端口：`22` → 下一步
   - 选择"允许连接" → 下一步
   - 全部勾选（域、专用、公用）→ 下一步
   - 名称填写：`SSH` → 完成

3. **同样方式添加其他端口**
   - 端口 80（HTTP）
   - 端口 443（HTTPS）
   - 端口 3000（应用端口）

### 通过 PowerShell 配置

```powershell
# 以管理员身份运行 PowerShell

# 开放 22 端口（SSH）
New-NetFirewallRule -DisplayName "SSH" -Direction Inbound -LocalPort 22 -Protocol TCP -Action Allow

# 开放 80 端口（HTTP）
New-NetFirewallRule -DisplayName "HTTP" -Direction Inbound -LocalPort 80 -Protocol TCP -Action Allow

# 开放 443 端口（HTTPS）
New-NetFirewallRule -DisplayName "HTTPS" -Direction Inbound -LocalPort 443 -Protocol TCP -Action Allow

# 开放 3000 端口（应用）
New-NetFirewallRule -DisplayName "Material Audit App" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

---

## 🚀 Windows 服务器部署步骤

### 第一步：安装 Node.js

1. **下载 Node.js**
   - 访问：https://nodejs.org/
   - 下载 LTS 版本（推荐 18.x 或更高）
   - 运行安装程序，一路下一步

2. **验证安装**
   - 打开 PowerShell 或 CMD
   - 输入：
   ```cmd
   node -v
   npm -v
   ```

### 第二步：安装 Git（如果需要从 Git 克隆代码）

1. **下载 Git**
   - 访问：https://git-scm.com/download/win
   - 下载并安装

2. **验证安装**
   ```cmd
   git --version
   ```

### 第三步：部署应用代码

#### 方式 A：从 Git 仓库克隆

```powershell
# 创建应用目录
mkdir C:\material-audit
cd C:\material-audit

# 克隆代码（替换为你的仓库地址）
git clone https://github.com/your-username/your-repo.git .

# 或如果已有代码，直接拉取
git pull
```

#### 方式 B：从本地上传

1. **在本地电脑打包项目**
   ```bash
   # 在项目目录执行
   tar -czf material-audit.tar.gz --exclude='node_modules' --exclude='.git' .
   ```

2. **上传到服务器**
   - 使用 FTP 工具（如 FileZilla）
   - 或使用远程桌面直接复制粘贴
   - 解压到 `C:\material-audit`

### 第四步：安装依赖和构建

```powershell
# 进入项目目录
cd C:\material-audit

# 安装依赖
npm install

# 配置环境变量
# 创建 .env 文件（可以用记事本）
notepad .env
```

在 `.env` 文件中填入：

```env
# Dify API配置
DIFY_API_KEY=your_dify_api_key_here
DIFY_API_URL=your_dify_api_url_here

# 数据库配置
DB_HOST=your_db_host
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
```

```powershell
# 构建项目
npm run build
```

### 第五步：安装 PM2（进程管理器）

```powershell
# 全局安装 PM2
npm install -g pm2

# 验证安装
pm2 -v
```

### 第六步：启动应用

#### 方式 A：使用 PM2（推荐）

```powershell
# 进入项目目录
cd C:\material-audit

# 启动应用
pm2 start .output/server/index.mjs --name material-audit

# 保存 PM2 配置
pm2 save

# 设置开机自启
pm2 startup
# 执行输出的命令（通常是管理员权限的命令）
```

#### 方式 B：使用 Windows 服务（NSSM）

1. **下载 NSSM**
   - 访问：https://nssm.cc/download
   - 下载并解压

2. **安装为 Windows 服务**

```powershell
# 进入 NSSM 解压目录
cd C:\path\to\nssm\win64

# 安装服务
.\nssm.exe install MaterialAudit "C:\Program Files\nodejs\node.exe" "C:\material-audit\.output\server\index.mjs"

# 设置工作目录
.\nssm.exe set MaterialAudit AppDirectory "C:\material-audit"

# 启动服务
.\nssm.exe start MaterialAudit
```

#### 方式 C：直接运行（测试用）

```powershell
cd C:\material-audit
node .output/server/index.mjs
```

---

## 🔧 Windows 服务器常用命令对照表

| Linux 命令 | Windows 命令 |
|-----------|-------------|
| `systemctl status sshd` | `Get-Service sshd` |
| `systemctl start sshd` | `Start-Service sshd` |
| `systemctl enable sshd` | `Set-Service -Name sshd -StartupType Automatic` |
| `netstat -tlnp \| grep 22` | `netstat -an \| findstr :22` |
| `ufw allow 22/tcp` | `New-NetFirewallRule -DisplayName "SSH" -Direction Inbound -LocalPort 22 -Protocol TCP -Action Allow` |
| `pm2 status` | `pm2 status`（相同）|
| `pm2 logs` | `pm2 logs`（相同）|
| `pm2 restart` | `pm2 restart`（相同）|

---

## 📝 Windows 服务器管理命令

### 查看应用状态

```powershell
# PM2 状态
pm2 status

# PM2 日志
pm2 logs material-audit

# 查看端口占用
netstat -an | findstr :3000
```

### 重启应用

```powershell
pm2 restart material-audit
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

## 🌐 配置 IIS 反向代理（可选）

如果需要使用 IIS 作为反向代理：

1. **安装 IIS 和 URL Rewrite 模块**
   - 控制面板 → 程序和功能 → 启用或关闭 Windows 功能
   - 勾选 "Internet Information Services"
   - 下载并安装 URL Rewrite 模块

2. **配置反向代理**
   - 打开 IIS 管理器
   - 创建新网站或使用默认网站
   - 添加 URL 重写规则，将请求转发到 `http://localhost:3000`

---

## ✅ 部署检查清单

- [ ] Node.js 18+ 已安装
- [ ] Git 已安装（如需要）
- [ ] 代码已部署到服务器
- [ ] 环境变量已配置（.env 文件）
- [ ] 依赖已安装（npm install）
- [ ] 项目已构建（npm run build）
- [ ] PM2 已安装
- [ ] 应用已启动
- [ ] 防火墙已开放端口（22, 80, 443, 3000）
- [ ] 可以访问应用

---

## 🆘 故障排查

### 应用无法启动

```powershell
# 检查 Node.js 版本
node -v

# 检查端口是否被占用
netstat -an | findstr :3000

# 查看 PM2 日志
pm2 logs material-audit --err
```

### 端口被占用

```powershell
# 查找占用端口的进程
netstat -ano | findstr :3000

# 查看进程详情
tasklist | findstr <PID>

# 结束进程
taskkill /PID <PID> /F
```

---

**部署完成后，访问：`http://你的服务器IP:3000`**

