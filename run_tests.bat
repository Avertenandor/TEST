@echo off
REM GENESIS Test Runner for Windows
REM Запуск тестов для сайта https://crypto-processing.net/

echo ========================================
echo   GENESIS COMPLETE TEST SUITE
echo ========================================
echo.

REM Проверка наличия Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js не найден! Установите Node.js с https://nodejs.org/
    pause
    exit /b 1
)

REM Переход в директорию тестов
cd /d "%~dp0тесты"

REM Проверка наличия node_modules
if not exist "node_modules" (
    echo [INFO] Установка зависимостей...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Ошибка установки зависимостей!
        pause
        exit /b 1
    )
)

echo.
echo Выберите тип теста:
echo ========================================
echo 1. Полный тест (все тесты)
echo 2. Быстрый тест Chrome
echo 3. Мониторинг консоли (30 сек)
echo 4. Тест с видимым браузером
echo 5. Тест локального сервера
echo 6. Очистить отчеты
echo 7. Открыть последний отчет
echo 0. Выход
echo ========================================
echo.

set /p choice="Введите номер опции: "

if "%choice%"=="1" (
    echo.
    echo Запуск полного тестирования...
    call npm test
) else if "%choice%"=="2" (
    echo.
    echo Запуск быстрого теста Chrome...
    call npm run test:chrome
) else if "%choice%"=="3" (
    echo.
    echo Запуск мониторинга консоли на 30 секунд...
    call npm run test:console
) else if "%choice%"=="4" (
    echo.
    echo Запуск тестов с видимым браузером...
    set HEADLESS=false
    call npm test
) else if "%choice%"=="5" (
    echo.
    echo Запуск тестов для локального сервера...
    set TEST_URL=http://localhost:5500/
    call npm test
) else if "%choice%"=="6" (
    echo.
    echo Очистка отчетов и скриншотов...
    if exist "reports" rd /s /q reports
    if exist "screenshots" rd /s /q screenshots
    mkdir reports
    mkdir screenshots
    echo Очищено!
) else if "%choice%"=="7" (
    echo.
    echo Открытие папки с отчетами...
    start "" "reports"
) else if "%choice%"=="0" (
    echo.
    echo До свидания!
    exit /b 0
) else (
    echo.
    echo [ERROR] Неверный выбор!
    pause
    goto :eof
)

echo.
echo ========================================
echo Тестирование завершено!
echo Отчеты сохранены в: %cd%\reports
echo ========================================
echo.
pause
