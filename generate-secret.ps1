# 生成安全的 SESSION_SECRET
# 使用方式：powershell -ExecutionPolicy Bypass -File generate-secret.ps1

Write-Host "正在生成安全的 SESSION_SECRET..." -ForegroundColor Cyan
Write-Host ""

$secret = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})

Write-Host "✅ 您的 SESSION_SECRET（64 字元）：" -ForegroundColor Green
Write-Host ""
Write-Host "SESSION_SECRET=$secret" -ForegroundColor Yellow
Write-Host ""
Write-Host "請複製上方字串到 .env.local 檔案中" -ForegroundColor Cyan
Write-Host ""

# 自動複製到剪貼簿（如果可用）
try {
    Set-Clipboard -Value $secret
    Write-Host "✅ 已自動複製到剪貼簿！" -ForegroundColor Green
} catch {
    Write-Host "⚠️ 無法自動複製，請手動複製上方字串" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "按任意鍵關閉..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
