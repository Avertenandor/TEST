/**
 * Console Monitor Test
 * Мониторинг консоли в реальном времени
 * Ловит все ошибки, предупреждения и логи
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

class ConsoleMonitor {
    constructor(config = {}) {
        this.config = {
            url: config.url || 'https://crypto-processing.net/',
            duration: config.duration || 30000, // 30 секунд мониторинга
            headless: config.headless !== false,
            captureScreenshots: config.captureScreenshots !== false,
            ...config
        };
        
        this.logs = {
            all: [],
            errors: [],
            warnings: [],
            info: [],
            debug: []
        };
        
        this.stats = {
            startTime: null,
            endTime: null,
            errorCount: 0,
            warningCount: 0,
            totalLogs: 0
        };
    }

    async start() {
        console.log('🔍 Запуск мониторинга консоли...');
        console.log(`📍 URL: ${this.config.url}`);
        console.log(`⏱️ Длительность: ${this.config.duration / 1000} секунд`);
        
        this.stats.startTime = new Date();
        
        // Запуск браузера
        this.browser = await puppeteer.launch({
            headless: this.config.headless,
            channel: 'chrome',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        this.page = await this.browser.newPage();
        await this.page.setViewport({ width: 1920, height: 1080 });
        
        // Настройка перехватчиков
        this.setupInterceptors();
        
        // Переход на страницу
        await this.page.goto(this.config.url, { 
            waitUntil: 'networkidle2',
            timeout: 30000 
        });
        
        console.log('✅ Страница загружена, начинаю мониторинг...\n');
        
        // Мониторинг с периодическими отчетами
        return new Promise(resolve => {
            let elapsed = 0;
            const interval = setInterval(() => {
                elapsed += 5000;
                this.printProgress(elapsed);
                
                if (elapsed >= this.config.duration) {
                    clearInterval(interval);
                    this.stop().then(resolve);
                }
            }, 5000);
        });
    }

    setupInterceptors() {
        // Перехват всех типов консольных сообщений
        this.page.on('console', async msg => {
            const type = msg.type();
            const text = msg.text();
            const location = msg.location();
            
            const logEntry = {
                type: type,
                text: text,
                timestamp: new Date().toISOString(),
                location: location,
                args: []
            };
            
            // Получаем аргументы
            try {
                for (const arg of msg.args()) {
                    const value = await arg.jsonValue().catch(() => arg.toString());
                    logEntry.args.push(value);
                }
            } catch (e) {}
            
            // Сохраняем в соответствующие категории
            this.logs.all.push(logEntry);
            this.stats.totalLogs++;
            
            switch (type) {
                case 'error':
                    this.logs.errors.push(logEntry);
                    this.stats.errorCount++;
                    console.log(`❌ [ERROR] ${text}`);
                    break;
                case 'warning':
                case 'warn':
                    this.logs.warnings.push(logEntry);
                    this.stats.warningCount++;
                    console.log(`⚠️ [WARN] ${text}`);
                    break;
                case 'info':
                    this.logs.info.push(logEntry);
                    break;
                case 'debug':
                    this.logs.debug.push(logEntry);
                    break;
            }
        });
        
        // Перехват ошибок страницы
        this.page.on('pageerror', error => {
            const errorEntry = {
                type: 'pageerror',
                message: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString()
            };
            
            this.logs.errors.push(errorEntry);
            this.stats.errorCount++;
            console.log(`💥 [PAGE ERROR] ${error.message}`);
        });
        
        // Перехват необработанных промисов
        this.page.evaluateOnNewDocument(() => {
            window.addEventListener('unhandledrejection', event => {
                console.error('Unhandled promise rejection:', event.reason);
            });
        });
    }

    printProgress(elapsed) {
        const remaining = Math.max(0, this.config.duration - elapsed);
        console.log(`\n⏱️ Прошло: ${elapsed / 1000}с | Осталось: ${remaining / 1000}с`);
        console.log(`📊 Статистика: Ошибок: ${this.stats.errorCount} | Предупреждений: ${this.stats.warningCount} | Всего логов: ${this.stats.totalLogs}`);
    }

    async stop() {
        console.log('\n🛑 Остановка мониторинга...');
        
        this.stats.endTime = new Date();
        
        // Создаем скриншот если есть ошибки
        if (this.config.captureScreenshots && this.stats.errorCount > 0) {
            await this.captureScreenshot();
        }
        
        // Генерируем отчет
        await this.generateReport();
        
        // Закрываем браузер
        await this.browser.close();
        
        console.log('✅ Мониторинг завершен');
        
        return this.stats;
    }

    async captureScreenshot() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const screenshotPath = path.join(__dirname, '..', 'screenshots', `console-monitor-${timestamp}.png`);
        
        await fs.mkdir(path.dirname(screenshotPath), { recursive: true });
        await this.page.screenshot({ path: screenshotPath, fullPage: true });
        
        console.log(`📸 Скриншот сохранен: ${screenshotPath}`);
    }

    async generateReport() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const reportDir = path.join(__dirname, '..', 'reports');
        await fs.mkdir(reportDir, { recursive: true });
        
        const report = {
            url: this.config.url,
            duration: this.config.duration,
            startTime: this.stats.startTime,
            endTime: this.stats.endTime,
            statistics: {
                totalLogs: this.stats.totalLogs,
                errors: this.stats.errorCount,
                warnings: this.stats.warningCount,
                info: this.logs.info.length,
                debug: this.logs.debug.length
            },
            logs: this.logs,
            topErrors: this.analyzeTopErrors(),
            errorPatterns: this.findErrorPatterns()
        };
        
        // JSON отчет
        const jsonPath = path.join(reportDir, `console-monitor-${timestamp}.json`);
        await fs.writeFile(jsonPath, JSON.stringify(report, null, 2));
        
        // Markdown отчет
        const mdPath = path.join(reportDir, `console-monitor-${timestamp}.md`);
        const markdown = this.generateMarkdown(report);
        await fs.writeFile(mdPath, markdown);
        
        console.log(`\n📄 Отчеты сохранены:`);
        console.log(`   - JSON: ${jsonPath}`);
        console.log(`   - Markdown: ${mdPath}`);
        
        return report;
    }

    analyzeTopErrors() {
        const errorMap = new Map();
        
        this.logs.errors.forEach(error => {
            const key = error.text || error.message;
            if (!errorMap.has(key)) {
                errorMap.set(key, { count: 0, firstOccurrence: error.timestamp });
            }
            errorMap.get(key).count++;
        });
        
        return Array.from(errorMap.entries())
            .map(([message, data]) => ({ message, ...data }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
    }

    findErrorPatterns() {
        const patterns = {
            networkErrors: this.logs.errors.filter(e => 
                e.text && (e.text.includes('fetch') || e.text.includes('network') || e.text.includes('Failed to load'))
            ).length,
            
            syntaxErrors: this.logs.errors.filter(e => 
                e.text && (e.text.includes('SyntaxError') || e.text.includes('Unexpected token'))
            ).length,
            
            referenceErrors: this.logs.errors.filter(e => 
                e.text && (e.text.includes('ReferenceError') || e.text.includes('is not defined'))
            ).length,
            
            typeErrors: this.logs.errors.filter(e => 
                e.text && (e.text.includes('TypeError') || e.text.includes('Cannot read'))
            ).length,
            
            moduleErrors: this.logs.errors.filter(e => 
                e.text && (e.text.includes('module') || e.text.includes('import') || e.text.includes('export'))
            ).length,
            
            qrCodeErrors: this.logs.errors.filter(e => 
                e.text && e.text.includes('QR')
            ).length
        };
        
        return patterns;
    }

    generateMarkdown(report) {
        const status = report.statistics.errors === 0 ? '✅ CLEAN' : '❌ ERRORS FOUND';
        
        return `# Console Monitor Report

**Status:** ${status}  
**URL:** ${report.url}  
**Duration:** ${report.duration / 1000} seconds  
**Time:** ${report.startTime} - ${report.endTime}

## 📊 Statistics

| Metric | Count |
|--------|-------|
| Total Logs | ${report.statistics.totalLogs} |
| Errors | ${report.statistics.errors} |
| Warnings | ${report.statistics.warnings} |
| Info | ${report.statistics.info} |
| Debug | ${report.statistics.debug} |

## 🔍 Error Patterns

| Pattern | Count |
|---------|-------|
| Network Errors | ${report.errorPatterns.networkErrors} |
| Syntax Errors | ${report.errorPatterns.syntaxErrors} |
| Reference Errors | ${report.errorPatterns.referenceErrors} |
| Type Errors | ${report.errorPatterns.typeErrors} |
| Module Errors | ${report.errorPatterns.moduleErrors} |
| QR Code Errors | ${report.errorPatterns.qrCodeErrors} |

## 🔥 Top Errors

${report.topErrors.length > 0 ? report.topErrors.map((error, i) => 
`${i + 1}. **${error.message}** (${error.count} occurrences)
   First seen: ${error.firstOccurrence}`
).join('\n\n') : 'No errors found ✅'}

## 📝 Error Details

${report.logs.errors.slice(0, 20).map(error => 
`### ${error.timestamp}
\`\`\`
${error.text || error.message}
${error.location ? `Location: ${error.location.url}:${error.location.lineNumber}` : ''}
\`\`\``
).join('\n\n')}

## ⚠️ Warning Details

${report.logs.warnings.slice(0, 10).map(warning => 
`- **${warning.timestamp}**: ${warning.text}`
).join('\n')}

---
*Generated by Console Monitor*`;
    }
}

// CLI запуск
if (require.main === module) {
    const monitor = new ConsoleMonitor({
        url: process.env.TEST_URL || 'https://crypto-processing.net/',
        duration: parseInt(process.env.DURATION || '30000'),
        headless: process.env.HEADLESS !== 'false'
    });
    
    monitor.start().then(stats => {
        const exitCode = stats.errorCount > 0 ? 1 : 0;
        process.exit(exitCode);
    });
}

module.exports = ConsoleMonitor;
