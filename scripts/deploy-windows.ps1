# 材价审计系统 - Windows 服务器自动化部署脚本
# 使用方法：以管理员身份运行 PowerShell，然后执行：
# Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
# .\scripts\deploy-windows.ps1

Write-Host "==========================================" -ForegroundColor Green
Write-Host "材价审计系统 - Windows 服务器部署脚本" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""

# 检查管理员权限
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "错误：请以管理员身份运行 PowerShell！" -ForegroundColor Red
    Write-Host "右键点击 PowerShell -> 以管理员身份运行" -ForegroundColor Yellow
    exit 1
}

# 配置变量
$AppName = "material-audit"
$AppDir = "C:\$AppName"
$NodeVersion = "18"

Write-Host "[1/8] 检查 Node.js..." -ForegroundColor Yellow

# 检查 Node.js
try {
    $nodeVersion = node -v 2>$null
    if ($nodeVersion) {
        Write-Host "Node.js 已安装: $nodeVersion" -ForegroundColor Green
    } else {
        throw "Node.js 未安装"
    }
} catch {
    Write-Host "Node.js 未安装，请先安装 Node.js 18+" -ForegroundColor Red
    Write-Host "下载地址: https://nodejs.org/zh-cn/" -ForegroundColor Yellow
    Write-Host "安装后请重启服务器，然后重新运行此脚本" -ForegroundColor Yellow
    exit 1
}

Write-Host "[2/8] 检查 Git..." -ForegroundColor Yellow

# 检查 Git
try {
    $gitVersion = git --version 2>$null
    if ($gitVersion) {
        Write-Host "Git 已安装: $gitVersion" -ForegroundColor Green
    } else {
        Write-Host "Git 未安装，将跳过 Git 相关操作" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Git 未安装（可选）" -ForegroundColor Yellow
}

Write-Host "[3/8] 创建应用目录..." -ForegroundColor Yellow

# 创建应用目录
if (-not (Test-Path $AppDir)) {
    New-Item -ItemType Directory -Path $AppDir -Force | Out-Null
    Write-Host "已创建目录: $AppDir" -ForegroundColor Green
} else {
    Write-Host "目录已存在: $AppDir" -ForegroundColor Green
}

Write-Host "[4/8] 部署应用代码..." -ForegroundColor Yellow

# 检查代码是否存在
$packageJson = Join-Path $AppDir "package.json"
if (-not (Test-Path $packageJson)) {
    Write-Host "未找到项目代码，请选择部署方式：" -ForegroundColor Yellow
    Write-Host "1) 从 Git 仓库克隆" -ForegroundColor Cyan
    Write-Host "2) 手动上传代码后继续" -ForegroundColor Cyan
    $choice = Read-Host "请输入选项 (1/2)"
    
    if ($choice -eq "1") {
        $gitRepo = Read-Host "请输入 Git 仓库地址"
        Set-Location $AppDir
        git clone $gitRepo .
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Git 克隆失败，请检查仓库地址" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "请将项目代码上传到 $AppDir 目录" -ForegroundColor Yellow
        Write-Host "完成后按 Enter 继续..."
        Read-Host
    }
} else {
    Write-Host "项目代码已存在" -ForegroundColor Green
}

Write-Host "[5/8] 配置环境变量..." -ForegroundColor Yellow

# 检查 .env 文件
$envFile = Join-Path $AppDir ".env"
if (-not (Test-Path $envFile)) {
    Write-Host "创建 .env 文件..." -ForegroundColor Yellow
    $envContent = @"
# Dify API配置
DIFY_API_KEY=your_dify_api_key_here
DIFY_API_URL=your_dify_api_url_here

# 数据库配置
DB_HOST=your_db_host
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
"@
    $envContent | Out-File -FilePath $envFile -Encoding UTF8
    Write-Host "已创建 .env 文件，请编辑配置：" -ForegroundColor Yellow
    Write-Host $envFile -ForegroundColor Cyan
    Write-Host "配置完成后按 Enter 继续..."
    Read-Host
} else {
    Write-Host ".env 文件已存在" -ForegroundColor Green
}

Write-Host "[6/8] 安装依赖..." -ForegroundColor Yellow

Set-Location $AppDir

# 配置 npm 镜像（加速下载）
npm config set registry https://registry.npmmirror.com

# 安装依赖
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "依赖安装失败" -ForegroundColor Red
    exit 1
}

Write-Host "[7/8] 构建项目..." -ForegroundColor Yellow

npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "项目构建失败" -ForegroundColor Red
    exit 1
}

Write-Host "[8/8] 安装 PM2..." -ForegroundColor Yellow

# 检查 PM2
try {
    $pm2Version = pm2 -v 2>$null
    if ($pm2Version) {
        Write-Host "PM2 已安装: $pm2Version" -ForegroundColor Green
    } else {
        throw "PM2 未安装"
    }
} catch {
    Write-Host "安装 PM2..." -ForegroundColor Yellow
    npm install -g pm2
    if ($LASTEXITCODE -ne 0) {
        Write-Host "PM2 安装失败" -ForegroundColor Red
        exit 1
    }
}

Write-Host "[9/9] 配置防火墙..." -ForegroundColor Yellow

# 配置防火墙规则
$ports = @(3000, 80, 443)
foreach ($port in $ports) {
    $ruleName = switch ($port) {
        3000 { "Material Audit App" }
        80 { "HTTP" }
        443 { "HTTPS" }
    }
    
    $existingRule = Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue
    if ($existingRule) {
        Write-Host "防火墙规则已存在: $ruleName ($port)" -ForegroundColor Green
    } else {
        New-NetFirewallRule -DisplayName $ruleName -Direction Inbound -LocalPort $port -Protocol TCP -Action Allow | Out-Null
        Write-Host "已添加防火墙规则: $ruleName ($port)" -ForegroundColor Green
    }
}

Write-Host "[10/10] 启动应用..." -ForegroundColor Yellow

# 停止旧进程（如果存在）
pm2 delete $AppName 2>$null

# 启动应用
$serverPath = Join-Path $AppDir ".output\server\index.mjs"
Set-Location $AppDir
pm2 start $serverPath --name $AppName

# 保存配置
pm2 save

# 设置开机自启
Write-Host "配置开机自启..." -ForegroundColor Yellow
$startupCmd = pm2 startup
Write-Host $startupCmd -ForegroundColor Cyan
Write-Host "如果上面有输出命令，请以管理员身份执行" -ForegroundColor Yellow

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "部署完成！" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "应用信息:" -ForegroundColor Cyan
Write-Host "  应用目录: $AppDir" -ForegroundColor White
Write-Host "  应用端口: 3000" -ForegroundColor White
Write-Host ""
Write-Host "常用命令:" -ForegroundColor Cyan
Write-Host "  查看状态: pm2 status" -ForegroundColor White
Write-Host "  查看日志: pm2 logs $AppName" -ForegroundColor White
Write-Host "  重启应用: pm2 restart $AppName" -ForegroundColor White
Write-Host ""
Write-Host "访问地址:" -ForegroundColor Cyan
Write-Host "  http://你的服务器IP:3000" -ForegroundColor White
Write-Host ""
Write-Host "请确保在腾讯云控制台配置安全组，开放 3000 端口！" -ForegroundColor Yellow
Write-Host ""

