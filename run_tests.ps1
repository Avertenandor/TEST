# GENESIS Test Runner PowerShell Script
# Продвинутый запуск тестов для сайта https://crypto-processing.net/

param(
    [string]$TestUrl = "https://crypto-processing.net/",
    [bool]$Headless = $true,
    [int]$Timeout = 60000,
    [string]$TestType = "all",
    [bool]$OpenReport = $true
)

$ErrorActionPreference = "Stop"

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "   GENESIS COMPLETE TEST SUITE" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Проверка Node.js
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js $nodeVersion найден" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js не найден! Установите с https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Проверка Chrome
try {
    $chromePath = Get-ItemProperty 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\chrome.exe' -ErrorAction SilentlyContinue
    if ($chromePath) {
        Write-Host "✓ Chrome браузер найден" -ForegroundColor Green
    } else {
        Write-Host "⚠ Chrome не найден, будет использован Chromium" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠ Chrome не найден, будет использован Chromium" -ForegroundColor Yellow
}

# Переход в директорию тестов
$testDir = Join-Path $PSScriptRoot "тесты"
Set-Location $testDir

# Установка зависимостей если нужно
if (-not (Test-Path "node_modules")) {
    Write-Host ""
    Write-Host "📦 Установка зависимостей..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Ошибка установки зависимостей!" -ForegroundColor Red
        exit 1
    }
}

# Настройка переменных окружения
$env:TEST_URL = $TestUrl
$env:HEADLESS = if ($Headless) { "true" } else { "false" }
$env:TIMEOUT = $Timeout

Write-Host ""
Write-Host "Конфигурация теста:" -ForegroundColor Cyan
Write-Host "  URL: $TestUrl" -ForegroundColor White
Write-Host "  Режим: $(if ($Headless) { 'Headless' } else { 'С браузером' })" -ForegroundColor White
Write-Host "  Таймаут: $($Timeout/1000) секунд" -ForegroundColor White
Write-Host "  Тип: $TestType" -ForegroundColor White
Write-Host ""

# Запуск тестов
$startTime = Get-Date

try {
    switch ($TestType) {
        "all" {
            Write-Host "🧪 Запуск всех тестов..." -ForegroundColor Green
            npm test
        }
        "chrome" {
            Write-Host "🔍 Запуск Chrome теста..." -ForegroundColor Green
            npm run test:chrome
        }
        "console" {
            Write-Host "📊 Запуск мониторинга консоли..." -ForegroundColor Green
            npm run test:console
        }
        "quick" {
            Write-Host "⚡ Запуск быстрого теста..." -ForegroundColor Green
            npm run test:quick
        }
        default {
            Write-Host "✗ Неизвестный тип теста: $TestType" -ForegroundColor Red
            exit 1
        }
    }
    
    $success = $LASTEXITCODE -eq 0
    
} catch {
    Write-Host "✗ Ошибка при выполнении тестов: $_" -ForegroundColor Red
    $success = $false
}

$endTime = Get-Date
$duration = $endTime - $startTime

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "   РЕЗУЛЬТАТЫ ТЕСТИРОВАНИЯ" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

if ($success) {
    Write-Host "✅ ТЕСТЫ ПРОЙДЕНЫ УСПЕШНО" -ForegroundColor Green
} else {
    Write-Host "❌ ТЕСТЫ ПРОВАЛЕНЫ" -ForegroundColor Red
}

Write-Host "⏱️  Время выполнения: $($duration.TotalSeconds) секунд" -ForegroundColor White
Write-Host ""

# Поиск последнего отчета
$reportsDir = Join-Path $testDir "reports"
if (Test-Path $reportsDir) {
    $latestReport = Get-ChildItem "$reportsDir\*.html" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    
    if ($latestReport) {
        Write-Host "📄 Последний отчет: $($latestReport.Name)" -ForegroundColor Cyan
        
        if ($OpenReport) {
            Write-Host "📂 Открытие отчета в браузере..." -ForegroundColor Yellow
            Start-Process $latestReport.FullName
        }
    }
}

Write-Host ""
Write-Host "📁 Все отчеты сохранены в: $reportsDir" -ForegroundColor White
Write-Host ""

# Возврат кода выхода
exit $(if ($success) { 0 } else { 1 })
