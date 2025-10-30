# Удаление всех workflow runs используя текущий GITHUB_TOKEN

$ErrorActionPreference = "Stop"

$token = $env:GITHUB_TOKEN
$owner = "Avertenandor"
$repo = "TEST"

if ([string]::IsNullOrEmpty($token)) {
    Write-Host "❌ GITHUB_TOKEN не найден в переменных окружения!" -ForegroundColor Red
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $token"
    "Accept" = "application/vnd.github.v3+json"
    "User-Agent" = "PowerShell-Script"
}

$baseUrl = "https://api.github.com/repos/$owner/$repo"

Write-Host "🔍 Используя текущий GITHUB_TOKEN..." -ForegroundColor Yellow
Write-Host "📦 Репозиторий: $owner/$repo" -ForegroundColor Cyan
Write-Host ""

try {
    # Проверка доступа
    $testResponse = Invoke-RestMethod -Uri $baseUrl -Headers $headers -Method Get
    Write-Host "✅ Доступ подтвержден: $($testResponse.full_name)" -ForegroundColor Green
    Write-Host ""
    
    # Получаем все workflows
    Write-Host "🔍 Получаю список workflows..." -ForegroundColor Yellow
    $workflowsResponse = Invoke-RestMethod -Uri "$baseUrl/actions/workflows" -Headers $headers -Method Get
    $workflows = $workflowsResponse.workflows
    
    Write-Host "✅ Найдено workflows: $($workflows.Count)" -ForegroundColor Green
    Write-Host ""
    
    $totalDeleted = 0
    $totalFailed = 0
    
    foreach ($workflow in $workflows) {
        $workflowId = $workflow.id
        $workflowName = $workflow.name
        
        Write-Host "📦 Обрабатываю: $workflowName (ID: $workflowId)" -ForegroundColor Cyan
        
        $page = 1
        $perPage = 100
        $workflowRunsDeleted = 0
        
        do {
            try {
                $runsUrl = "$baseUrl/actions/workflows/$workflowId/runs?per_page=$perPage&page=$page"
                $runsResponse = Invoke-RestMethod -Uri $runsUrl -Headers $headers -Method Get
                $runs = $runsResponse.workflow_runs
                
                if ($runs.Count -eq 0) {
                    break
                }
                
                Write-Host "  📄 Страница $page : $($runs.Count) запусков..." -ForegroundColor Gray
                
                foreach ($run in $runs) {
                    $runId = $run.id
                    $runNumber = $run.run_number
                    $runStatus = $run.status
                    
                    try {
                        $deleteUrl = "$baseUrl/actions/runs/$runId"
                        Invoke-RestMethod -Uri $deleteUrl -Headers $headers -Method Delete | Out-Null
                        Write-Host "    ✅ Удален run #$runNumber (ID: $runId, статус: $runStatus)" -ForegroundColor Green
                        $totalDeleted++
                        $workflowRunsDeleted++
                    }
                    catch {
                        $errorMsg = $_.Exception.Message
                        if ($errorMsg -like "*404*") {
                            Write-Host "    ⚠️  Run #$runNumber уже удален" -ForegroundColor Yellow
                        } else {
                            Write-Host "    ❌ Ошибка удаления run #$runNumber : $errorMsg" -ForegroundColor Red
                            $totalFailed++
                        }
                    }
                    
                    # Небольшая задержка чтобы не превысить rate limit
                    Start-Sleep -Milliseconds 150
                }
                
                $page++
            }
            catch {
                Write-Host "  ❌ Ошибка получения runs: $($_.Exception.Message)" -ForegroundColor Red
                break
            }
        } while ($runs.Count -eq $perPage)
        
        Write-Host "  ✅ Удалено из $workflowName : $workflowRunsDeleted запусков" -ForegroundColor Green
        Write-Host ""
    }
    
    Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "🎉 РЕЗУЛЬТАТЫ:" -ForegroundColor Yellow
    Write-Host "  ✅ Успешно удалено: $totalDeleted" -ForegroundColor Green
    if ($totalFailed -gt 0) {
        Write-Host "  ❌ Ошибок: $totalFailed" -ForegroundColor Red
    }
    Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
    
}
catch {
    Write-Host ""
    Write-Host "❌ КРИТИЧЕСКАЯ ОШИБКА:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    
    if ($_.Exception.Message -like "*401*" -or $_.Exception.Message -like "*403*") {
        Write-Host "⚠️  Проблема с правами доступа токена" -ForegroundColor Yellow
        Write-Host "Токен должен иметь права: repo (полные права на репозиторий)" -ForegroundColor Yellow
    }
    
    exit 1
}

Write-Host ""
Write-Host "✨ Готово! Все workflow runs удалены автоматически." -ForegroundColor Green

