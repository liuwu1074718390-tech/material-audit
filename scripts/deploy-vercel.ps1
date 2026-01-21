# 材价审计系统 - Vercel 自动化部署脚本 (PowerShell)
# 使用方法：以管理员身份运行 PowerShell，然后执行：
# Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
# .\scripts\deploy-vercel.ps1

Write-Host "==========================================" -ForegroundColor Green
Write-Host "材价审计系统 - Vercel 自动化部署" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""

$ErrorActionPreference = "Stop"

# 检查是否安装了 Vercel CLI
Write-Host "[1/6] 检查 Vercel CLI..." -ForegroundColor Yellow
try {
    $vercelVersion = vercel --version 2>$null
    if ($vercelVersion) {
        Write-Host "Vercel CLI 已安装: $vercelVersion" -ForegroundColor Green
    } else {
        throw "Vercel CLI 未安装"
    }
} catch {
    Write-Host "Vercel CLI 未安装，正在安装..." -ForegroundColor Yellow
    npm install -g vercel
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Vercel CLI 安装失败！" -ForegroundColor Red
        exit 1
    }
    Write-Host "Vercel CLI 安装成功" -ForegroundColor Green
}

# 检查是否已登录
Write-Host "[2/6] 检查登录状态..." -ForegroundColor Yellow
try {
    $user = vercel whoami 2>$null
    if ($user) {
        Write-Host "已登录: $user" -ForegroundColor Green
    } else {
        throw "未登录"
    }
} catch {
    Write-Host "未登录 Vercel，开始登录..." -ForegroundColor Yellow
    vercel login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "登录失败！" -ForegroundColor Red
        exit 1
    }
}

# 检查项目根目录
Write-Host "[3/6] 检查项目配置..." -ForegroundColor Yellow
if (-not (Test-Path "package.json")) {
    Write-Host "错误：请在项目根目录运行此脚本！" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "nuxt.config.ts")) {
    Write-Host "错误：未找到 nuxt.config.ts 文件！" -ForegroundColor Red
    exit 1
}

Write-Host "项目配置检查通过" -ForegroundColor Green

# 检查环境变量文件
Write-Host "[4/6] 检查环境变量配置..." -ForegroundColor Yellow
if (-not (Test-Path ".env") -and -not (Test-Path ".env.local")) {
    Write-Host "警告：未找到 .env 文件" -ForegroundColor Yellow
    Write-Host "请确保已在 Vercel 项目中配置环境变量：" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "必需的环境变量："
    Write-Host "  - DIFY_API_KEY"
    Write-Host "  - DIFY_API_URL"
    Write-Host "  - DIFY_WORKFLOW_ID (可选)"
    Write-Host "  - DB_HOST (可选)"
    Write-Host "  - DB_PORT (可选)"
    Write-Host "  - DB_USER (可选)"
    Write-Host "  - DB_PASSWORD (可选)"
    Write-Host "  - DB_NAME (可选)"
    Write-Host ""
    $continue = Read-Host "是否继续部署？(y/n)"
    if ($continue -ne "y" -and $continue -ne "Y") {
        exit 1
    }
} else {
    Write-Host "环境变量文件存在" -ForegroundColor Green
}

# 安装依赖
Write-Host "[5/6] 安装依赖..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "依赖安装失败！" -ForegroundColor Red
    exit 1
}
Write-Host "依赖安装完成" -ForegroundColor Green

# 部署到 Vercel
Write-Host "[6/6] 部署到 Vercel..." -ForegroundColor Yellow
Write-Host ""
Write-Host "提示：" -ForegroundColor Yellow
Write-Host "  - 如果是首次部署，Vercel 会询问项目设置"
Write-Host "  - 输入 'y' 确认使用默认设置"
Write-Host "  - 或者按照提示进行自定义配置"
Write-Host ""

# 检查是否有 .vercel 目录（已链接项目）
if (Test-Path ".vercel") {
    Write-Host "项目已链接到 Vercel，直接部署..." -ForegroundColor Green
    vercel --prod
} else {
    Write-Host "首次部署，需要链接项目..." -ForegroundColor Yellow
    vercel --prod
}

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host "部署成功！" -ForegroundColor Green
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "项目已部署到 Vercel"
    Write-Host "使用 'vercel' 命令查看部署链接"
    Write-Host "使用 'vercel env ls' 查看环境变量"
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "部署失败，请检查错误信息" -ForegroundColor Red
    exit 1
}

