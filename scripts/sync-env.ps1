<#
.SYNOPSIS
    同步本地環境變數到 Vercel

.DESCRIPTION
    從 .env.local 讀取環境變數並同步到 Vercel 專案
    
.EXAMPLE
    .\scripts\sync-env.ps1
    
.EXAMPLE
    .\scripts\sync-env.ps1 -Force
    強制覆蓋現有的環境變數
#>

param(
    [switch]$Force
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  環境變數同步工具" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 需要同步的環境變數（不含 NEXT_PUBLIC_ 前綴的會設定到所有環境）
$envVarsToSync = @(
    @{ Name = "LINE_CHANNEL_ID"; Envs = "production" },
    @{ Name = "LINE_CHANNEL_SECRET"; Envs = "production,preview,development" },
    @{ Name = "LINE_CHANNEL_ACCESS_TOKEN"; Envs = "production" },
    @{ Name = "SESSION_SECRET"; Envs = "production,preview,development" },
    @{ Name = "NEXT_PUBLIC_LIFF_ID"; Envs = "production,preview,development" },
    @{ Name = "NEXT_PUBLIC_LINE_OA_BASIC_ID"; Envs = "production,preview,development" },
    @{ Name = "NEXT_PUBLIC_APP_ORIGIN"; Envs = "production" }
)

if (-not (Test-Path ".env.local")) {
    Write-Host "❌ 找不到 .env.local 文件" -ForegroundColor Red
    exit 1
}

$envContent = Get-Content ".env.local"

foreach ($envVar in $envVarsToSync) {
    $name = $envVar.Name
    $envs = $envVar.Envs
    
    # 從 .env.local 取得值
    $line = $envContent | Where-Object { $_ -match "^$name=" }
    if (-not $line) {
        Write-Host "⏭️  跳過 $name（未在 .env.local 中設定）" -ForegroundColor Gray
        continue
    }
    
    $value = $line -replace "^$name=", ""
    
    if ([string]::IsNullOrWhiteSpace($value)) {
        Write-Host "⏭️  跳過 $name（值為空）" -ForegroundColor Gray
        continue
    }
    
    Write-Host "📤 設定 $name -> $envs" -ForegroundColor Yellow
    
    if ($Force) {
        # 先刪除再新增
        vercel env rm $name $envs.Split(",")[0] -y 2>$null
    }
    
    # 使用管道傳入值
    $value | vercel env add $name $envs.Split(",")[0] 2>$null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ 成功" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  可能已存在（使用 -Force 覆蓋）" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  同步完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "提示：部署後才會生效，執行: .\scripts\deploy.ps1" -ForegroundColor Cyan
