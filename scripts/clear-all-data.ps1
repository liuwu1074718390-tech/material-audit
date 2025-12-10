# 清空所有历史业务数据脚本（Windows PowerShell）
# 警告：此操作会删除所有任务、结果和材料数据，不可恢复！

Write-Host "⚠️  警告：此操作将删除所有历史业务数据（任务、结果、材料），不可恢复！" -ForegroundColor Yellow
Write-Host ""

$confirm = Read-Host "确认要清空所有数据吗？(输入 'yes' 确认)"

if ($confirm -ne "yes") {
    Write-Host "操作已取消" -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "正在清空所有历史业务数据..." -ForegroundColor Cyan

# 获取服务器地址（默认本地）
$serverUrl = if ($env:SERVER_URL) { $env:SERVER_URL } else { "http://localhost:3000" }

# 调用清空数据API
try {
    $response = Invoke-RestMethod -Uri "$serverUrl/api/admin/clear-data" -Method Post -ContentType "application/json"
    
    Write-Host ""
    Write-Host "响应结果：" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10
    
    Write-Host ""
    Write-Host "✅ 操作完成" -ForegroundColor Green
} catch {
    Write-Host ""
    Write-Host "❌ 操作失败: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "详细错误: $($_.Exception)" -ForegroundColor Red
}

