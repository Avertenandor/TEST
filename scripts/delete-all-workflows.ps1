# Скрипт для массового удаления всех workflow runs через GitHub API
# Требуется: GitHub Personal Access Token с правами repo

param(
    [string]$Token = "",
    [string]$Owner = "Avertenandor",
    [string]$Repo = "TEST"
)

$ErrorActionPreference = "Stop"

# Проверка токена
if ([string]::IsNullOrEmpty($Token)) {
    Write-Host "❌ Токен не указан!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Создайте Personal Access Token:" -ForegroundColor Yellow
    Write-Host "1. Зайдите: https://github.com/settings/tokens" -ForegroundColor Cyan
    Write-Host "2. Нажмите 'Generate new token (classic)'" -ForegroundColor Cyan
    Write-Host "3. Выберите права: repo (все)" -ForegroundColor Cyan
    Write-Host "4. Скопируйте токен" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Запустите скрипт так:" -ForegroundColor Yellow
    Write-Host "  .\scripts\delete-all-workflows.ps1 -Token 'ваш_токен'" -ForegroundColor Cyan
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $Token"
    "Accept" = "application/vnd.github.v3+json"
    "User-Agent" = "PowerShell-Script"
}

$baseUrl = "https://api.github.com/repos/$Owner/$Repo"

Write-Host "🔍 Получаю список всех workflow runs..." -ForegroundColor Yellow

# Получаем список всех workflows
try {
    $workflowsResponse = Invoke-RestMethod -Uri "$baseUrl/actions/workflows" -Headers $headers -Method Get
    $workflows = $workflowsResponse.workflows
    
    Write-Host "✅ Найдено workflows: $($workflows.Count)" -ForegroundColor Green
    
    $totalDeleted = 0
    $totalFailed = 0
    
    foreach ($workflow in $workflows) {
        $workflowId = $workflow.id
        $workflowName = $workflow.name
        Write-Host ""
        Write-Host "📦 Обрабатываю: $workflowName" -ForegroundColor Cyan
        
        $page = 1
        $perPage = 100
        
        do {
            try {
                $runsUrl = "$baseUrl/actions/workflows/$workflowId/runs?per_page=$perPage&page=$page"
                $runsResponse = Invoke-RestMethod -Uri $runsUrl -Headers $headers -Method Get
                $runs = $runsResponse.workflow_runs
                
                if ($runs.Count -eq 0) {
                    break
                }
                
                Write-Host "  📄 Страница $page: найдено $($runs.Count) запусков" -ForegroundColor Gray
                
                foreach ($run in $runs) {
                    $runId = $run.id
                    $runStatus = $run.status
                    $runConclusion = $run.conclusion
                    
                    try {
                        $deleteUrl = "$baseUrl/actions/runs/$runId"
                        Invoke-RestMethod -Uri $deleteUrl -Headers $headers -Method Delete
                        Write-Host "    ✅ Удален run #$runId ($runStatus/$runConclusion)" -ForegroundColor Green
                        $totalDeleted++
                    }
                    catch {
                        Write-Host "    ❌ Ошибка удаления run #$runId : $($_.Exception.Message)" -ForegroundColor Red
                        $totalFailed++
                    }
                    
                    # Небольшая задержка чтобы не превысить rate limit
                    Start-Sleep -Milliseconds 100
                }
                
                $page++
            }
            catch {
                Write-Host "  ❌ Ошибка получения runs: $($_.Exception.Message)" -ForegroundColor Red
                break
            }
        } while ($runs.Count -eq $perPage)
        
        Write-Host "  ✅ Завершено: $workflowName" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "✅ Успешно удалено: $totalDeleted" -ForegroundColor Green
    if ($totalFailed -gt 0) {
        Write-Host "❌ Ошибок: $totalFailed" -ForegroundColor Red
    }
    Write-Host "════════════════════════════════════" -ForegroundColor Cyan
    
}
catch {
    Write-Host "❌ Критическая ошибка: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Возможные причины:" -ForegroundColor Yellow
    Write-Host "- Неверный токен" -ForegroundColor Gray
    Write-Host "- Нет прав доступа" -ForegroundColor Gray
    Write-Host "- Проблемы с интернетом" -ForegroundColor Gray
    exit 1
}

Write-Host ""
Write-Host "🎉 Готово! Все workflow runs удалены." -ForegroundColor Green

