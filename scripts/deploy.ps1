<# 
.SYNOPSIS
    360LINE 專案自動部署腳本

.DESCRIPTION
    此腳本會執行以下操作：
    1. 驗證環境變數
    2. 同步環境變數到 Vercel（如有需要）
    3. 部署到 Vercel 生產環境
    4. 驗證部署結果

.EXAMPLE
    .\scripts\deploy.ps1
    
.EXAMPLE
    .\scripts\deploy.ps1 -Preview
    部署到預覽環境（不影響生產）
#>

param(
    [switch]$Preview,
    [switch]$SkipEnvSync
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  360LINE 自動部署腳本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. 檢查 Vercel CLI
Write-Host "[1/4] 檢查 Vercel CLI..." -ForegroundColor Yellow
$vercelVersion = vercel --version 2>$null
if (-not $vercelVersion) {
    Write-Host "❌ 未安裝 Vercel CLI，請執行: npm i -g vercel" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Vercel CLI $vercelVersion" -ForegroundColor Green

# 2. 檢查本地環境變數
Write-Host ""
Write-Host "[2/4] 檢查環境變數..." -ForegroundColor Yellow

$requiredEnvVars = @(
    "NEXT_PUBLIC_LIFF_ID",
    "NEXT_PUBLIC_LINE_OA_BASIC_ID", 
    "LINE_CHANNEL_ID",
    "SESSION_SECRET"
)

$optionalEnvVars = @(
    "LINE_CHANNEL_SECRET",
    "LINE_CHANNEL_ACCESS_TOKEN",
    "DATABASE_URL"
)

if (Test-Path ".env.local") {
    $envContent = Get-Content ".env.local" -Raw
    
    foreach ($var in $requiredEnvVars) {
        if ($envContent -match "^$var=.+") {
            Write-Host "  ✅ $var" -ForegroundColor Green
        } else {
            Write-Host "  ❌ $var (必填)" -ForegroundColor Red
            exit 1
        }
    }
    
    foreach ($var in $optionalEnvVars) {
        if ($envContent -match "^$var=.+") {
            Write-Host "  ✅ $var" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️  $var (選填，未設定)" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "❌ 找不到 .env.local 文件" -ForegroundColor Red
    exit 1
}

# 3. 顯示 Vercel 環境變數狀態
Write-Host ""
Write-Host "[3/4] Vercel 環境變數狀態..." -ForegroundColor Yellow
vercel env ls

# 4. 部署
Write-Host ""
Write-Host "[4/4] 開始部署..." -ForegroundColor Yellow

if ($Preview) {
    Write-Host "📦 部署到預覽環境..." -ForegroundColor Cyan
    vercel
} else {
    Write-Host "🚀 部署到生產環境..." -ForegroundColor Cyan
    vercel --prod
}

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  ✅ 部署成功！" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "生產環境: https://line360-card.vercel.app" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "測試連結:" -ForegroundColor Yellow
    Write-Host "  - 首頁: https://line360-card.vercel.app"
    Write-Host "  - 編輯器: https://line360-card.vercel.app/editor"
    Write-Host "  - Webhook: https://line360-card.vercel.app/api/webhook"
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ 部署失敗，請檢查錯誤訊息" -ForegroundColor Red
    exit 1
}
