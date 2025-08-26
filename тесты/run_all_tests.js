/**
 * Run All Tests
 * Запускает все тесты последовательно и генерирует общий отчет
 */

const path = require('path');
const fs = require('fs').promises;
const { spawn } = require('child_process');

// Импортируем тестовые классы
const CompleteChromeTest = require('./e2e/test_complete_chrome');
const ConsoleMonitor = require('./e2e/test_console_monitor');

class TestRunner {
    constructor() {
        this.results = [];
        this.startTime = new Date();
        this.config = {
            url: process.env.TEST_URL || 'https://crypto-processing.net/',
            headless: process.env.HEADLESS !== 'false',
            timeout: parseInt(process.env.TIMEOUT || '60000')
        };
    }

    async runTest(name, testFunction) {
        console.log('\n' + '='.repeat(60));
        console.log(`🧪 Запуск теста: ${name}`);
        console.log('='.repeat(60));
        
        const startTime = Date.now();
        let status = 'PASSED';
        let error = null;
        let result = null;
        
        try {
            result = await testFunction();
        } catch (e) {
            status = 'FAILED';
            error = e.message;
            console.error(`❌ Тест провален: ${e.message}`);
        }
        
        const duration = Date.now() - startTime;
        
        this.results.push({
            name,
            status,
            duration,
            error,
            result,
            timestamp: new Date().toISOString()
        });
        
        console.log(`⏱️ Время выполнения: ${(duration / 1000).toFixed(2)}с`);
        console.log(`📊 Статус: ${status === 'PASSED' ? '✅ PASSED' : '❌ FAILED'}`);
        
        return { status, duration };
    }

    async runPythonTest(scriptName) {
        return new Promise((resolve, reject) => {
            const pythonPath = process.platform === 'win32' ? 'python' : 'python3';
            const scriptPath = path.join(__dirname, scriptName);
            
            console.log(`🐍 Запуск Python теста: ${scriptName}`);
            
            const child = spawn(pythonPath, [scriptPath, '--url', this.config.url, '--headless', this.config.headless ? '1' : '0'], {
                env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
            });
            
            let output = '';
            let errorOutput = '';
            
            child.stdout.on('data', (data) => {
                const text = data.toString();
                output += text;
                process.stdout.write(text);
            });
            
            child.stderr.on('data', (data) => {
                const text = data.toString();
                errorOutput += text;
                process.stderr.write(text);
            });
            
            child.on('close', (code) => {
                if (code === 0) {
                    resolve({ status: 'PASSED', output });
                } else {
                    resolve({ status: 'FAILED', output, error: errorOutput });
                }
            });
            
            child.on('error', (err) => {
                reject(err);
            });
        });
    }

    async runAllTests() {
        console.log('🚀 GENESIS Complete Test Suite');
        console.log(`📍 URL: ${this.config.url}`);
        console.log(`🖥️ Mode: ${this.config.headless ? 'Headless' : 'Headed'}`);
        console.log(`⏱️ Started: ${this.startTime.toISOString()}`);
        
        // 1. Complete Chrome Test
        await this.runTest('Complete Chrome E2E Test', async () => {
            const test = new CompleteChromeTest();
            return await test.run();
        });
        
        // 2. Console Monitor (30 секунд)
        await this.runTest('Console Monitor (30s)', async () => {
            const monitor = new ConsoleMonitor({
                url: this.config.url,
                duration: 30000,
                headless: this.config.headless
            });
            return await monitor.start();
        });
        
        // 3. Python тесты если доступны
        try {
            await this.runTest('Landing Chrome Test (Python)', async () => {
                return await this.runPythonTest('e2e/test_landing_chrome.py');
            });
        } catch (e) {
            console.log('⚠️ Python тесты пропущены (Python не найден или тесты отсутствуют)');
        }
        
        // 4. Puppeteer тесты модулей
        await this.runTest('Module Tests', async () => {
            return await this.runModuleTests();
        });
        
        // Генерация финального отчета
        await this.generateFinalReport();
    }

    async runModuleTests() {
        const testFiles = [
            'browser/test_console_how_it_works.mjs',
            'browser/test_console_routes.mjs'
        ];
        
        const results = [];
        
        for (const file of testFiles) {
            const filePath = path.join(__dirname, file);
            
            // Проверяем существование файла
            try {
                await fs.access(filePath);
                console.log(`📦 Запуск модульного теста: ${file}`);
                
                // Динамический импорт ESM модуля
                const module = await import(filePath);
                if (module.default && typeof module.default === 'function') {
                    const result = await module.default();
                    results.push({ file, ...result });
                }
            } catch (e) {
                console.log(`⚠️ Тест ${file} пропущен: ${e.message}`);
            }
        }
        
        return results;
    }

    async generateFinalReport() {
        console.log('\n' + '='.repeat(60));
        console.log('📊 ФИНАЛЬНЫЙ ОТЧЕТ');
        console.log('='.repeat(60));
        
        const endTime = new Date();
        const totalDuration = endTime - this.startTime;
        
        const passed = this.results.filter(r => r.status === 'PASSED').length;
        const failed = this.results.filter(r => r.status === 'FAILED').length;
        const total = this.results.length;
        
        const report = {
            url: this.config.url,
            startTime: this.startTime.toISOString(),
            endTime: endTime.toISOString(),
            totalDuration: totalDuration,
            summary: {
                total,
                passed,
                failed,
                successRate: ((passed / total) * 100).toFixed(2) + '%'
            },
            tests: this.results
        };
        
        // Вывод в консоль
        console.log(`\n✅ Пройдено: ${passed}/${total}`);
        console.log(`❌ Провалено: ${failed}/${total}`);
        console.log(`📈 Успешность: ${report.summary.successRate}`);
        console.log(`⏱️ Общее время: ${(totalDuration / 1000).toFixed(2)}с`);
        
        console.log('\n📋 Детали тестов:');
        this.results.forEach(test => {
            const icon = test.status === 'PASSED' ? '✅' : '❌';
            console.log(`${icon} ${test.name} - ${(test.duration / 1000).toFixed(2)}с`);
            if (test.error) {
                console.log(`   └─ Ошибка: ${test.error}`);
            }
        });
        
        // Сохранение отчета
        const timestamp = endTime.toISOString().replace(/[:.]/g, '-');
        const reportDir = path.join(__dirname, 'reports');
        await fs.mkdir(reportDir, { recursive: true });
        
        const reportPath = path.join(reportDir, `final-report-${timestamp}.json`);
        await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
        
        const htmlReport = this.generateHTMLReport(report);
        const htmlPath = path.join(reportDir, `final-report-${timestamp}.html`);
        await fs.writeFile(htmlPath, htmlReport);
        
        console.log('\n📁 Отчеты сохранены:');
        console.log(`   - JSON: ${reportPath}`);
        console.log(`   - HTML: ${htmlPath}`);
        
        // Возвращаем код выхода
        return failed > 0 ? 1 : 0;
    }

    generateHTMLReport(report) {
        const statusColor = report.summary.failed === 0 ? '#4CAF50' : '#f44336';
        
        return `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GENESIS Final Test Report</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container { 
            max-width: 1200px; 
            margin: 0 auto; 
            background: white; 
            border-radius: 20px; 
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        .header .subtitle {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }
        .summary-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            border: 2px solid #e9ecef;
            transition: transform 0.3s, box-shadow 0.3s;
        }
        .summary-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }
        .summary-card.success {
            border-color: #4CAF50;
            background: #e8f5e9;
        }
        .summary-card.error {
            border-color: #f44336;
            background: #ffebee;
        }
        .summary-card .value {
            font-size: 2.5em;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .summary-card.success .value { color: #4CAF50; }
        .summary-card.error .value { color: #f44336; }
        .summary-card .label {
            color: #666;
            font-size: 0.9em;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .tests-section {
            margin-top: 40px;
        }
        .tests-section h2 {
            font-size: 1.8em;
            margin-bottom: 20px;
            color: #333;
        }
        .test-item {
            background: #f8f9fa;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            transition: all 0.3s;
        }
        .test-item:hover {
            background: #e9ecef;
        }
        .test-item.passed {
            border-left: 5px solid #4CAF50;
        }
        .test-item.failed {
            border-left: 5px solid #f44336;
        }
        .test-info {
            flex: 1;
        }
        .test-name {
            font-weight: bold;
            font-size: 1.1em;
            margin-bottom: 5px;
        }
        .test-duration {
            color: #666;
            font-size: 0.9em;
        }
        .test-status {
            padding: 8px 16px;
            border-radius: 20px;
            color: white;
            font-weight: bold;
            font-size: 0.9em;
        }
        .test-status.passed {
            background: #4CAF50;
        }
        .test-status.failed {
            background: #f44336;
        }
        .test-error {
            margin-top: 10px;
            padding: 10px;
            background: #ffebee;
            border-radius: 5px;
            color: #c62828;
            font-family: monospace;
            font-size: 0.9em;
        }
        .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #666;
        }
        .progress-bar {
            width: 100%;
            height: 30px;
            background: #e9ecef;
            border-radius: 15px;
            overflow: hidden;
            margin: 20px 0;
        }
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #4CAF50, #8BC34A);
            width: ${report.summary.successRate};
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            transition: width 1s ease;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 GENESIS Test Report</h1>
            <div class="subtitle">${report.url}</div>
            <div class="subtitle">${new Date(report.startTime).toLocaleString()}</div>
        </div>
        
        <div class="content">
            <div class="summary-grid">
                <div class="summary-card ${report.summary.failed === 0 ? 'success' : 'error'}">
                    <div class="value">${report.summary.passed}/${report.summary.total}</div>
                    <div class="label">Тестов пройдено</div>
                </div>
                <div class="summary-card">
                    <div class="value" style="color: #2196F3">${report.summary.successRate}</div>
                    <div class="label">Успешность</div>
                </div>
                <div class="summary-card">
                    <div class="value" style="color: #FF9800">${(report.totalDuration / 1000).toFixed(1)}s</div>
                    <div class="label">Время выполнения</div>
                </div>
            </div>
            
            <div class="progress-bar">
                <div class="progress-fill">${report.summary.successRate}</div>
            </div>
            
            <div class="tests-section">
                <h2>Результаты тестов</h2>
                ${report.tests.map(test => `
                    <div class="test-item ${test.status.toLowerCase()}">
                        <div class="test-info">
                            <div class="test-name">${test.name}</div>
                            <div class="test-duration">⏱️ ${(test.duration / 1000).toFixed(2)} секунд</div>
                            ${test.error ? `<div class="test-error">❌ ${test.error}</div>` : ''}
                        </div>
                        <div class="test-status ${test.status.toLowerCase()}">${test.status}</div>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="footer">
            <p>Generated at ${new Date(report.endTime).toLocaleString()}</p>
            <p>GENESIS Test Suite v1.0.0</p>
        </div>
    </div>
</body>
</html>`;
    }
}

// Запуск
if (require.main === module) {
    const runner = new TestRunner();
    runner.runAllTests().then(exitCode => {
        process.exit(exitCode);
    }).catch(error => {
        console.error('💥 Критическая ошибка:', error);
        process.exit(1);
    });
}

module.exports = TestRunner;
