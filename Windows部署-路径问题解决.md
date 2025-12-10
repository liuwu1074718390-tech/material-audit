# Windows 部署 - 路径问题解决

## 问题：找不到路径 `C:\material-audit`

这说明代码还没有上传到服务器，或者路径不对。

---

## 解决方案

### 方案一：先上传代码到服务器

#### 步骤 1：在本地电脑打包项目

1. **在本地电脑**，进入项目目录（`材价审计`）
2. **选中所有文件**（除了 `node_modules` 和 `.git`）
3. **右键 → 发送到 → 压缩(zipped)文件夹**
4. 命名为 `material-audit.zip`

#### 步骤 2：上传到服务器

**方法 A：通过远程桌面直接复制**
1. 在本地电脑，复制 `material-audit.zip`
2. 在服务器远程桌面中，按 `Ctrl + V` 粘贴
3. 粘贴到 `C:\` 目录

**方法 B：通过 FTP 工具**
1. 下载 FileZilla 等 FTP 工具
2. 连接到服务器并上传文件

#### 步骤 3：在服务器上解压

1. **在服务器上**，找到 `C:\material-audit.zip`
2. **右键点击** → "全部提取"
3. **提取到** `C:\material-audit`

#### 步骤 4：验证文件存在

在 PowerShell 中执行：
```powershell
cd C:\material-audit
dir
```

应该能看到 `package.json` 等文件。

---

### 方案二：从 Git 仓库克隆（如果代码在 Git）

在 PowerShell 中执行：

```powershell
# 创建目录
mkdir C:\material-audit
cd C:\material-audit

# 克隆代码（替换为你的仓库地址）
git clone https://github.com/your-username/your-repo.git .

# 验证
dir
```

---

### 方案三：直接在当前位置运行脚本

如果代码已经在其他位置，可以：

1. **找到代码位置**
   ```powershell
   # 搜索 package.json 文件
   Get-ChildItem -Path C:\ -Filter package.json -Recurse -ErrorAction SilentlyContinue
   ```

2. **进入代码目录**
   ```powershell
   cd C:\找到的路径
   ```

3. **运行脚本**
   ```powershell
   .\scripts\deploy-windows.ps1
   ```

---

## 快速检查

在 PowerShell 中执行以下命令，检查代码在哪里：

```powershell
# 检查 C:\material-audit 是否存在
Test-Path C:\material-audit

# 如果返回 False，说明目录不存在
# 如果返回 True，检查是否有 package.json
Test-Path C:\material-audit\package.json
```

---

## 如果代码还没有上传

**最简单的方法**：

1. **在本地电脑**：
   - 进入 `材价审计` 文件夹
   - 全选文件（Ctrl+A）
   - 复制（Ctrl+C）

2. **在服务器远程桌面**：
   - 在 `C:\` 创建文件夹 `material-audit`
   - 进入文件夹
   - 粘贴（Ctrl+V）

3. **验证**：
   ```powershell
   cd C:\material-audit
   dir
   ```

应该能看到所有项目文件。

---

## 下一步

代码上传完成后，再执行：

```powershell
cd C:\material-audit
.\scripts\deploy-windows.ps1
```

