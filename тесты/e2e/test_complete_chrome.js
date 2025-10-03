/**
 * GENESIS Complete Chrome E2E Test
 * Полная проверка сайта https://crypto-processing.net/ в Chrome
 * Ловит все ошибки консоли, сети, DOM и производительности
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

// Конфигурация
const CONFIG = {
    URL: process.env.TEST_URL || 'https://crypto-processing.net/',
    HEADLESS: process.env.HEADLESS !== 'false',
    TIMEOUT: parseInt(process.env.TIMEOUT || '60000'),
    VIEWPORT: { width: 1920, height: 1080 },
    USER_AGENT: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
};

class CompleteChromeTest {
    constructor() {
        this.browser = null;
        this.page = null;
        this.results = {
            timestamp: new Date().toISOString(),
            url: CONFIG.URL,
            console: [],
            errors: [],
            warnings: [],
            network: {
                requests: [],
                failed: [],
                slow: []
            },
            dom: {},
            performance: {},
            coverage: {},
            accessibility: {},
            security: {},
            tests: []
        };
    }

    // Кросс-совместимая задержка
    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async initialize() {
        console.log('🚀 Запуск Chrome браузера...');

        this.browser = await puppeteer.launch({
            headless: CONFIG.HEADLESS,
            channel: 'chrome', // Использовать установленный Chrome
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-web-security',
                '--disable-features=IsolateOrigins,site-per-process',
                '--window-size=1920,1080'
            ]
        });

        this.page = await this.browser.newPage();
        await this.page.setViewport(CONFIG.VIEWPORT);
        await this.page.setUserAgent(CONFIG.USER_AGENT);

        // Включаем сбор покрытия кода
        await Promise.all([
            this.page.coverage.startJSCoverage(),
            this.page.coverage.startCSSCoverage()
        ]);

        await this.setupInterceptors();
        console.log('✅ Chrome инициализирован');
    }

    async setupInterceptors() {
        // Перехват консоли
        this.page.on('console', async msg => {
            const entry = {
                type: msg.type(),
                text: msg.text(),
                location: msg.location(),
                timestamp: new Date().toISOString(),
                args: []
            };

            // Получаем аргументы
            try {
                for (const arg of msg.args()) {
                    entry.args.push(await arg.jsonValue().catch(() => arg.toString()));
                }
            } catch (e) { }

            this.results.console.push(entry);

            if (entry.type === 'error') {
                this.results.errors.push(entry);
            } else if (entry.type === 'warning' || entry.type === 'warn') {
                this.results.warnings.push(entry);
            }

            // Выводим в консоль для отладки
            if (entry.type === 'error') {
                console.log(`❌ Console Error: ${entry.text}`);
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
            this.results.errors.push(errorEntry);
            console.log(`❌ Page Error: ${error.message}`);
        });

        // Перехват сетевых запросов
        this.page.on('request', request => {
            this.results.network.requests.push({
                url: request.url(),
                method: request.method(),
                type: request.resourceType(),
                timestamp: new Date().toISOString()
            });
        });

        // Перехват неудачных запросов
        this.page.on('requestfailed', request => {
            const failure = request.failure();
            const failedEntry = {
                url: request.url(),
                error: failure ? failure.errorText : 'Unknown error',
                timestamp: new Date().toISOString()
            };
            this.results.network.failed.push(failedEntry);
            console.log(`❌ Network Failed: ${request.url()}`);
        });

        // Перехват ответов
        this.page.on('response', response => {
            if (response.status() >= 400) {
                console.log(`⚠️ HTTP ${response.status()}: ${response.url()}`);
            }

            // Отслеживаем медленные запросы
            const timing = response.timing();
            if (timing && timing.receiveHeadersEnd > 1000) {
                this.results.network.slow.push({
                    url: response.url(),
                    duration: timing.receiveHeadersEnd,
                    status: response.status()
                });
            }
        });

        // Перехват диалогов
        this.page.on('dialog', async dialog => {
            console.log(`📢 Dialog: ${dialog.message()}`);
            await dialog.accept();
        });
    }

    async navigate() {
        console.log(`🌐 Переход на ${CONFIG.URL}...`);

        const startTime = Date.now();
        try {
            const response = await this.page.goto(CONFIG.URL, {
                waitUntil: ['networkidle2', 'domcontentloaded', 'load'],
                timeout: CONFIG.TIMEOUT
            });

            const loadTime = Date.now() - startTime;
            console.log(`✅ Страница загружена за ${loadTime}ms (HTTP ${response.status()})`);

            // Ждем дополнительную загрузку
            await this.sleep(3000);

            return response;
        } catch (error) {
            console.error(`❌ Ошибка навигации: ${error.message}`);
            throw error;
        }
    }

    async testConsoleErrors() {
        console.log('\n📋 Тест: Ошибки консоли');

        const test = {
            name: 'Console Errors',
            passed: this.results.errors.length === 0,
            errors: this.results.errors.length,
            warnings: this.results.warnings.length,
            details: this.results.errors.slice(0, 10)
        };

        this.results.tests.push(test);

        if (test.passed) {
            console.log('✅ Нет ошибок в консоли');
        } else {
            console.log(`❌ Найдено ${test.errors} ошибок`);
            this.results.errors.slice(0, 5).forEach(err => {
                console.log(`   - ${err.text || err.message}`);
            });
        }

        return test;
    }

    async testNetworkErrors() {
        console.log('\n📋 Тест: Сетевые ошибки');

        const test = {
            name: 'Network Errors',
            passed: this.results.network.failed.length === 0,
            failed: this.results.network.failed.length,
            slow: this.results.network.slow.length,
            totalRequests: this.results.network.requests.length
        };

        this.results.tests.push(test);

        if (test.passed) {
            console.log(`✅ Все ${test.totalRequests} запросов успешны`);
        } else {
            console.log(`❌ ${test.failed} неудачных запросов из ${test.totalRequests}`);
            this.results.network.failed.slice(0, 5).forEach(req => {
                console.log(`   - ${req.url}: ${req.error}`);
            });
        }

        return test;
    }

    async testDOMStructure() {
        console.log('\n📋 Тест: Структура DOM');

        const domAnalysis = await this.page.evaluate(() => {
            // Проверка дублирующихся ID
            const allIds = Array.from(document.querySelectorAll('[id]')).map(el => el.id);
            const duplicateIds = allIds.filter((id, index) => allIds.indexOf(id) !== index);

            // Проверка важных элементов
            const criticalElements = {
                terminal: document.querySelector('#cabinet-genesis-terminal'),
                oldTerminal: document.querySelector('#genesis-terminal'),
                forms: document.querySelectorAll('form'),
                buttons: document.querySelectorAll('button'),
                modals: document.querySelectorAll('.modal, [role="dialog"]'),
                errors: document.querySelectorAll('.error, .alert-danger'),
                images: document.querySelectorAll('img')
            };

            // Проверка на сыром код
            const bodyText = document.body.innerText || '';
            const hasRawCode = bodyText.includes('```') || bodyText.includes('<?php') || bodyText.includes('{{');

            // Проверка изображений
            const brokenImages = Array.from(document.querySelectorAll('img')).filter(img => !img.complete || img.naturalHeight === 0);

            // Проверка мета-тегов
            const meta = {
                viewport: !!document.querySelector('meta[name="viewport"]'),
                charset: !!document.querySelector('meta[charset]'),
                description: !!document.querySelector('meta[name="description"]'),
                title: document.title
            };

            return {
                totalElements: document.getElementsByTagName('*').length,
                duplicateIds,
                hasTerminal: !!criticalElements.terminal,
                hasOldTerminal: !!criticalElements.oldTerminal,
                formsCount: criticalElements.forms.length,
                buttonsCount: criticalElements.buttons.length,
                modalsCount: criticalElements.modals.length,
                errorsCount: criticalElements.errors.length,
                imagesCount: criticalElements.images.length,
                brokenImagesCount: brokenImages.length,
                hasRawCode,
                meta
            };
        });

        this.results.dom = domAnalysis;

        const issues = [];
        if (domAnalysis.duplicateIds.length > 0) {
            issues.push(`Дублирующиеся ID: ${domAnalysis.duplicateIds.join(', ')}`);
        }
        if (domAnalysis.hasOldTerminal) {
            issues.push('Найден старый терминал #genesis-terminal');
        }
        if (domAnalysis.hasRawCode) {
            issues.push('Обнаружен сырой код на странице');
        }
        if (domAnalysis.brokenImagesCount > 0) {
            issues.push(`Битых изображений: ${domAnalysis.brokenImagesCount}`);
        }
        if (!domAnalysis.meta.viewport) {
            issues.push('Отсутствует meta viewport');
        }

        const test = {
            name: 'DOM Structure',
            passed: issues.length === 0,
            issues: issues,
            analysis: domAnalysis
        };

        this.results.tests.push(test);

        if (test.passed) {
            console.log('✅ DOM структура корректна');
        } else {
            console.log(`❌ Проблемы в DOM: ${issues.length}`);
            issues.forEach(issue => console.log(`   - ${issue}`));
        }

        return test;
    }

    async testPerformance() {
        console.log('\n📋 Тест: Производительность');

        const metrics = await this.page.evaluate(() => {
            const perf = performance.timing;
            const paint = performance.getEntriesByType('paint');
            const navigation = performance.getEntriesByType('navigation')[0];

            return {
                pageLoadTime: perf.loadEventEnd - perf.navigationStart,
                domContentLoaded: perf.domContentLoadedEventEnd - perf.navigationStart,
                domInteractive: perf.domInteractive - perf.navigationStart,
                firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
                firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
                serverResponseTime: perf.responseEnd - perf.requestStart,
                dnsLookupTime: perf.domainLookupEnd - perf.domainLookupStart,
                resources: performance.getEntriesByType('resource').length,
                transferSize: navigation?.transferSize || 0,
                encodedBodySize: navigation?.encodedBodySize || 0
            };
        });

        // Память
        const memoryUsage = await this.page.evaluate(() => {
            if (performance.memory) {
                return {
                    usedJSHeapSize: (performance.memory.usedJSHeapSize / 1048576).toFixed(2),
                    totalJSHeapSize: (performance.memory.totalJSHeapSize / 1048576).toFixed(2),
                    jsHeapSizeLimit: (performance.memory.jsHeapSizeLimit / 1048576).toFixed(2)
                };
            }
            return null;
        });

        this.results.performance = { ...metrics, memory: memoryUsage };

        const issues = [];
        if (metrics.pageLoadTime > 3000) {
            issues.push(`Медленная загрузка: ${metrics.pageLoadTime}ms`);
        }
        if (metrics.firstContentfulPaint > 1500) {
            issues.push(`Медленный FCP: ${metrics.firstContentfulPaint}ms`);
        }
        if (memoryUsage && parseFloat(memoryUsage.usedJSHeapSize) > 50) {
            issues.push(`Высокое использование памяти: ${memoryUsage.usedJSHeapSize}MB`);
        }

        const test = {
            name: 'Performance',
            passed: issues.length === 0,
            issues: issues,
            metrics: metrics
        };

        this.results.tests.push(test);

        console.log(test.passed ? '✅ Производительность в норме' : `❌ Проблемы производительности: ${issues.length}`);
        if (!test.passed) {
            issues.forEach(issue => console.log(`   - ${issue}`));
        }

        return test;
    }

    async testAccessibility() {
        console.log('\n📋 Тест: Доступность');

        const a11y = await this.page.evaluate(() => {
            const issues = [];

            // Проверка alt текстов
            const imagesWithoutAlt = document.querySelectorAll('img:not([alt])');
            if (imagesWithoutAlt.length > 0) {
                issues.push(`Изображений без alt: ${imagesWithoutAlt.length}`);
            }

            // Проверка ARIA labels
            const buttonsWithoutLabel = document.querySelectorAll('button:not([aria-label]):empty');
            if (buttonsWithoutLabel.length > 0) {
                issues.push(`Кнопок без текста/aria-label: ${buttonsWithoutLabel.length}`);
            }

            // Проверка контраста (базовая)
            const lowContrastElements = [];
            document.querySelectorAll('*').forEach(el => {
                const style = window.getComputedStyle(el);
                const bg = style.backgroundColor;
                const color = style.color;
                // Простая проверка на очень низкий контраст
                if (bg === color && bg !== 'rgba(0, 0, 0, 0)') {
                    lowContrastElements.push(el.tagName);
                }
            });

            // Проверка языка
            const htmlLang = document.documentElement.lang;
            if (!htmlLang) {
                issues.push('Отсутствует атрибут lang');
            }

            // Проверка заголовков
            const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
            const h1Count = document.querySelectorAll('h1').length;
            if (h1Count === 0) {
                issues.push('Отсутствует H1');
            } else if (h1Count > 1) {
                issues.push(`Множественные H1: ${h1Count}`);
            }

            // Проверка форм
            const inputsWithoutLabel = document.querySelectorAll('input:not([aria-label]):not([placeholder])');
            const unlabeledInputs = Array.from(inputsWithoutLabel).filter(input => {
                return !document.querySelector(`label[for="${input.id}"]`);
            });
            if (unlabeledInputs.length > 0) {
                issues.push(`Полей ввода без label: ${unlabeledInputs.length}`);
            }

            return {
                issues: issues,
                imagesTotal: document.querySelectorAll('img').length,
                imagesWithoutAlt: imagesWithoutAlt.length,
                buttonsTotal: document.querySelectorAll('button').length,
                formsTotal: document.querySelectorAll('form').length,
                headingsTotal: headings.length,
                hasLang: !!htmlLang,
                h1Count: h1Count
            };
        });

        const test = {
            name: 'Accessibility',
            passed: a11y.issues.length === 0,
            issues: a11y.issues,
            stats: a11y
        };

        this.results.tests.push(test);
        this.results.accessibility = a11y;

        console.log(test.passed ? '✅ Доступность соответствует стандартам' : `❌ Проблемы доступности: ${a11y.issues.length}`);
        if (!test.passed) {
            a11y.issues.forEach(issue => console.log(`   - ${issue}`));
        }

        return test;
    }

    async testSecurity() {
        console.log('\n📋 Тест: Безопасность');

        const security = await this.page.evaluate(() => {
            const issues = [];

            // Проверка внешних скриптов
            const externalScripts = Array.from(document.querySelectorAll('script[src]'))
                .map(s => s.src)
                .filter(src => !src.startsWith(window.location.origin));

            // Проверка форм без HTTPS action
            const insecureForms = Array.from(document.querySelectorAll('form'))
                .filter(form => form.action && form.action.startsWith('http://'));

            if (insecureForms.length > 0) {
                issues.push(`Форм с небезопасным action: ${insecureForms.length}`);
            }

            // Проверка ссылок с target="_blank" без rel="noopener"
            const unsafeLinks = document.querySelectorAll('a[target="_blank"]:not([rel*="noopener"])');
            if (unsafeLinks.length > 0) {
                issues.push(`Ссылок без rel="noopener": ${unsafeLinks.length}`);
            }

            // Проверка localStorage на чувствительные данные
            const sensitiveKeys = ['password', 'token', 'secret', 'private', 'key'];
            const foundSensitive = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
                    foundSensitive.push(key);
                }
            }
            if (foundSensitive.length > 0) {
                issues.push(`Потенциально чувствительные данные в localStorage: ${foundSensitive.join(', ')}`);
            }

            // Проверка CSP
            const csp = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
            if (!csp) {
                issues.push('Отсутствует Content Security Policy');
            }

            return {
                issues: issues,
                externalScripts: externalScripts.length,
                externalScriptsList: externalScripts.slice(0, 5),
                hasHttps: window.location.protocol === 'https:',
                hasCsp: !!csp,
                insecureForms: insecureForms.length,
                unsafeLinks: unsafeLinks.length
            };
        });

        const test = {
            name: 'Security',
            passed: security.issues.length === 0 && security.hasHttps,
            issues: security.issues,
            analysis: security
        };

        this.results.tests.push(test);
        this.results.security = security;

        console.log(test.passed ? '✅ Базовая безопасность соблюдена' : `❌ Проблемы безопасности: ${security.issues.length}`);
        if (!test.passed) {
            security.issues.forEach(issue => console.log(`   - ${issue}`));
        }

        return test;
    }

    async testModules() {
        console.log('\n📋 Тест: Модульная система');

        const modules = await this.page.evaluate(() => {
            const result = {
                hasModuleSystem: false,
                modules: [],
                errors: [],
                routes: [],
                eventBus: false,
                store: false
            };

            try {
                // Проверка основных компонентов
                result.hasModuleSystem = !!(window.moduleLoader || window.ModuleLoader);
                result.eventBus = !!window.eventBus;
                result.store = !!window.store;
                result.router = !!window.router;

                // Получение загруженных модулей
                if (window.moduleLoader && window.moduleLoader.loadedModules) {
                    if (window.moduleLoader.loadedModules instanceof Map) {
                        window.moduleLoader.loadedModules.forEach((module, name) => {
                            result.modules.push({
                                name: name,
                                hasInit: typeof module.init === 'function',
                                hasDestroy: typeof module.destroy === 'function',
                                version: module.version || 'unknown'
                            });
                        });
                    }
                }

                // Получение маршрутов
                if (window.router && window.router.routes) {
                    result.routes = Object.keys(window.router.routes);
                }

                // Проверка критических модулей
                const criticalModules = ['auth', 'dashboard', 'platform-access'];
                const missingCritical = criticalModules.filter(name =>
                    !result.modules.some(m => m.name === name)
                );

                if (missingCritical.length > 0) {
                    result.errors.push(`Отсутствуют критические модули: ${missingCritical.join(', ')}`);
                }

            } catch (error) {
                result.errors.push(error.message);
            }

            return result;
        });

        const test = {
            name: 'Module System',
            passed: modules.hasModuleSystem && modules.errors.length === 0,
            modules: modules.modules.length,
            routes: modules.routes.length,
            errors: modules.errors,
            analysis: modules
        };

        this.results.tests.push(test);

        console.log(test.passed ?
            `✅ Модульная система работает (${test.modules} модулей, ${test.routes} маршрутов)` :
            `❌ Проблемы с модульной системой`
        );

        if (modules.errors.length > 0) {
            modules.errors.forEach(err => console.log(`   - ${err}`));
        }

        return test;
    }

    async testCoverage() {
        console.log('\n📋 Тест: Покрытие кода');

        const [jsCoverage, cssCoverage] = await Promise.all([
            this.page.coverage.stopJSCoverage(),
            this.page.coverage.stopCSSCoverage()
        ]);

        let usedJS = 0, totalJS = 0;
        let usedCSS = 0, totalCSS = 0;

        jsCoverage.forEach(entry => {
            totalJS += entry.text.length;
            entry.ranges.forEach(range => {
                usedJS += range.end - range.start;
            });
        });

        cssCoverage.forEach(entry => {
            totalCSS += entry.text.length;
            entry.ranges.forEach(range => {
                usedCSS += range.end - range.start;
            });
        });

        const jsPercentage = totalJS ? (usedJS / totalJS * 100).toFixed(2) : 0;
        const cssPercentage = totalCSS ? (usedCSS / totalCSS * 100).toFixed(2) : 0;

        this.results.coverage = {
            js: {
                used: usedJS,
                total: totalJS,
                percentage: jsPercentage
            },
            css: {
                used: usedCSS,
                total: totalCSS,
                percentage: cssPercentage
            }
        };

        const test = {
            name: 'Code Coverage',
            passed: jsPercentage > 30 && cssPercentage > 30,
            jsUsage: `${jsPercentage}%`,
            cssUsage: `${cssPercentage}%`
        };

        this.results.tests.push(test);

        console.log(`📊 Использование кода: JS ${jsPercentage}%, CSS ${cssPercentage}%`);

        return test;
    }

    async takeScreenshots() {
        console.log('\n📸 Создание скриншотов...');

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const screenshotDir = path.join(__dirname, '..', 'screenshots');

        // Создаем директорию если не существует
        await fs.mkdir(screenshotDir, { recursive: true });

        // Полный скриншот
        const fullPath = path.join(screenshotDir, `full_${timestamp}.png`);
        await this.page.screenshot({
            path: fullPath,
            fullPage: true
        });
        console.log(`✅ Полный скриншот: ${fullPath}`);

        // Скриншот viewport
        const viewportPath = path.join(screenshotDir, `viewport_${timestamp}.png`);
        await this.page.screenshot({
            path: viewportPath
        });
        console.log(`✅ Viewport скриншот: ${viewportPath}`);

        return { full: fullPath, viewport: viewportPath };
    }

    async generateReport() {
        console.log('\n📝 Генерация отчета...');

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const reportDir = path.join(__dirname, '..', 'reports');

        await fs.mkdir(reportDir, { recursive: true });

        // Подсчет результатов
        const summary = {
            totalTests: this.results.tests.length,
            passed: this.results.tests.filter(t => t.passed).length,
            failed: this.results.tests.filter(t => !t.passed).length,
            totalErrors: this.results.errors.length,
            totalWarnings: this.results.warnings.length,
            totalRequests: this.results.network.requests.length,
            failedRequests: this.results.network.failed.length
        };

        this.results.summary = summary;

        // JSON отчет
        const jsonPath = path.join(reportDir, `complete_test_${timestamp}.json`);
        await fs.writeFile(jsonPath, JSON.stringify(this.results, null, 2));
        console.log(`✅ JSON отчет: ${jsonPath}`);

        // HTML отчет
        const htmlPath = path.join(reportDir, `complete_test_${timestamp}.html`);
        const html = this.generateHTML();
        await fs.writeFile(htmlPath, html);
        console.log(`✅ HTML отчет: ${htmlPath}`);

        // Markdown отчет
        const mdPath = path.join(reportDir, `complete_test_${timestamp}.md`);
        const markdown = this.generateMarkdown();
        await fs.writeFile(mdPath, markdown);
        console.log(`✅ Markdown отчет: ${mdPath}`);

        return { json: jsonPath, html: htmlPath, markdown: mdPath };
    }

    generateHTML() {
        const summary = this.results.summary;
        const statusColor = summary.failed === 0 ? '#4CAF50' : '#f44336';

        return `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GENESIS Test Report - ${this.results.timestamp}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        h1 { color: #333; border-bottom: 3px solid ${statusColor}; padding-bottom: 10px; }
        h2 { color: #666; margin-top: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
        .stat { background: #f8f9fa; padding: 15px; border-radius: 5px; border-left: 4px solid #2196F3; }
        .stat.error { border-left-color: #f44336; }
        .stat.success { border-left-color: #4CAF50; }
        .stat.warning { border-left-color: #ff9800; }
        .stat-value { font-size: 24px; font-weight: bold; color: #333; }
        .stat-label { color: #666; font-size: 14px; margin-top: 5px; }
        .test { margin: 15px 0; padding: 15px; background: #f8f9fa; border-radius: 5px; }
        .test.passed { border-left: 4px solid #4CAF50; }
        .test.failed { border-left: 4px solid #f44336; }
        .test-name { font-weight: bold; font-size: 16px; }
        .test-status { display: inline-block; padding: 3px 8px; border-radius: 3px; color: white; font-size: 12px; margin-left: 10px; }
        .test-status.passed { background: #4CAF50; }
        .test-status.failed { background: #f44336; }
        .issues { margin-top: 10px; }
        .issue { color: #d32f2f; margin: 5px 0; padding-left: 20px; }
        .error-log { background: #ffebee; border: 1px solid #ffcdd2; padding: 10px; margin: 10px 0; border-radius: 4px; }
        .error-text { color: #c62828; font-family: monospace; font-size: 13px; }
        pre { background: #f5f5f5; padding: 10px; border-radius: 4px; overflow-x: auto; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin: 10px 0; }
        .metric { text-align: center; padding: 10px; background: #e3f2fd; border-radius: 4px; }
        .metric-value { font-size: 20px; font-weight: bold; color: #1976d2; }
        .metric-label { font-size: 12px; color: #666; margin-top: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🧪 GENESIS Complete Test Report</h1>
        <p><strong>URL:</strong> ${this.results.url}</p>
        <p><strong>Время:</strong> ${this.results.timestamp}</p>
        
        <h2>📊 Сводка</h2>
        <div class="summary">
            <div class="stat ${summary.failed === 0 ? 'success' : 'error'}">
                <div class="stat-value">${summary.passed}/${summary.totalTests}</div>
                <div class="stat-label">Тестов пройдено</div>
            </div>
            <div class="stat ${summary.totalErrors === 0 ? 'success' : 'error'}">
                <div class="stat-value">${summary.totalErrors}</div>
                <div class="stat-label">Ошибок консоли</div>
            </div>
            <div class="stat ${summary.totalWarnings === 0 ? 'success' : 'warning'}">
                <div class="stat-value">${summary.totalWarnings}</div>
                <div class="stat-label">Предупреждений</div>
            </div>
            <div class="stat ${summary.failedRequests === 0 ? 'success' : 'error'}">
                <div class="stat-value">${summary.failedRequests}/${summary.totalRequests}</div>
                <div class="stat-label">Неудачных запросов</div>
            </div>
        </div>

        <h2>🧪 Результаты тестов</h2>
        ${this.results.tests.map(test => `
            <div class="test ${test.passed ? 'passed' : 'failed'}">
                <span class="test-name">${test.name}</span>
                <span class="test-status ${test.passed ? 'passed' : 'failed'}">${test.passed ? 'PASSED' : 'FAILED'}</span>
                ${test.issues && test.issues.length > 0 ? `
                    <div class="issues">
                        ${test.issues.map(issue => `<div class="issue">⚠️ ${issue}</div>`).join('')}
                    </div>
                ` : ''}
            </div>
        `).join('')}

        ${this.results.errors.length > 0 ? `
            <h2>❌ Ошибки консоли</h2>
            ${this.results.errors.slice(0, 10).map(error => `
                <div class="error-log">
                    <div class="error-text">${error.text || error.message}</div>
                    ${error.location ? `<div style="font-size: 12px; color: #666; margin-top: 5px;">📍 ${error.location.url}:${error.location.lineNumber}</div>` : ''}
                </div>
            `).join('')}
        ` : ''}

        <h2>⚡ Производительность</h2>
        <div class="metrics">
            <div class="metric">
                <div class="metric-value">${this.results.performance.pageLoadTime || 0}ms</div>
                <div class="metric-label">Page Load</div>
            </div>
            <div class="metric">
                <div class="metric-value">${this.results.performance.firstContentfulPaint || 0}ms</div>
                <div class="metric-label">FCP</div>
            </div>
            <div class="metric">
                <div class="metric-value">${this.results.performance.domContentLoaded || 0}ms</div>
                <div class="metric-label">DOM Ready</div>
            </div>
            <div class="metric">
                <div class="metric-value">${this.results.dom.totalElements || 0}</div>
                <div class="metric-label">DOM Elements</div>
            </div>
        </div>

        <h2>📦 Покрытие кода</h2>
        <div class="metrics">
            <div class="metric">
                <div class="metric-value">${this.results.coverage.js?.percentage || 0}%</div>
                <div class="metric-label">JavaScript</div>
            </div>
            <div class="metric">
                <div class="metric-value">${this.results.coverage.css?.percentage || 0}%</div>
                <div class="metric-label">CSS</div>
            </div>
        </div>
    </div>
</body>
</html>`;
    }

    generateMarkdown() {
        const summary = this.results.summary;
        const status = summary.failed === 0 ? '✅ PASSED' : '❌ FAILED';

        return `# GENESIS Complete Test Report

**Status:** ${status}  
**URL:** ${this.results.url}  
**Timestamp:** ${this.results.timestamp}

## 📊 Summary

- **Tests Passed:** ${summary.passed}/${summary.totalTests}
- **Console Errors:** ${summary.totalErrors}
- **Warnings:** ${summary.totalWarnings}
- **Network Requests:** ${summary.totalRequests} (Failed: ${summary.failedRequests})

## 🧪 Test Results

${this.results.tests.map(test =>
            `### ${test.passed ? '✅' : '❌'} ${test.name}
${test.issues && test.issues.length > 0 ? test.issues.map(i => `- ⚠️ ${i}`).join('\n') : '- No issues found'}
`).join('\n')}

## ⚡ Performance Metrics

- **Page Load Time:** ${this.results.performance.pageLoadTime || 0}ms
- **First Contentful Paint:** ${this.results.performance.firstContentfulPaint || 0}ms
- **DOM Content Loaded:** ${this.results.performance.domContentLoaded || 0}ms
- **Total DOM Elements:** ${this.results.dom.totalElements || 0}

## 📦 Code Coverage

- **JavaScript:** ${this.results.coverage.js?.percentage || 0}%
- **CSS:** ${this.results.coverage.css?.percentage || 0}%

${this.results.errors.length > 0 ? `
## ❌ Console Errors

${this.results.errors.slice(0, 10).map(error =>
                `\`\`\`
${error.text || error.message}
${error.location ? `Location: ${error.location.url}:${error.location.lineNumber}` : ''}
\`\`\``).join('\n')}
` : ''}

## 🔍 DOM Analysis

- **Duplicate IDs:** ${this.results.dom.duplicateIds?.length || 0}
- **Forms:** ${this.results.dom.formsCount || 0}
- **Buttons:** ${this.results.dom.buttonsCount || 0}
- **Images:** ${this.results.dom.imagesCount || 0} (Broken: ${this.results.dom.brokenImagesCount || 0})
- **Has Terminal:** ${this.results.dom.hasTerminal ? 'Yes' : 'No'}
- **Has Old Terminal:** ${this.results.dom.hasOldTerminal ? 'Yes' : 'No'}

## 🔐 Security

- **HTTPS:** ${this.results.security?.hasHttps ? 'Yes' : 'No'}
- **CSP:** ${this.results.security?.hasCsp ? 'Yes' : 'No'}
- **External Scripts:** ${this.results.security?.externalScripts || 0}
- **Unsafe Links:** ${this.results.security?.unsafeLinks || 0}

---
*Generated by GENESIS Complete Chrome Test*`;
    }

    async cleanup() {
        console.log('\n🧹 Очистка...');
        if (this.browser) {
            await this.browser.close();
        }
    }

    async run() {
        try {
            await this.initialize();
            await this.navigate();

            // Выполняем все тесты
            await this.testConsoleErrors();
            await this.testNetworkErrors();
            await this.testDOMStructure();
            await this.testPerformance();
            await this.testAccessibility();
            await this.testSecurity();
            await this.testModules();
            await this.testCoverage();

            // Создаем скриншоты и отчеты
            await this.takeScreenshots();
            const reports = await this.generateReport();

            // Итоговый результат
            const summary = this.results.summary;
            console.log('\n' + '='.repeat(50));
            console.log('📊 ИТОГОВЫЙ РЕЗУЛЬТАТ');
            console.log('='.repeat(50));
            console.log(`Статус: ${summary.failed === 0 ? '✅ PASSED' : '❌ FAILED'}`);
            console.log(`Тестов пройдено: ${summary.passed}/${summary.totalTests}`);
            console.log(`Ошибок: ${summary.totalErrors}`);
            console.log(`Предупреждений: ${summary.totalWarnings}`);
            console.log('='.repeat(50));
            console.log('\n📁 Отчеты сохранены:');
            console.log(`   - JSON: ${reports.json}`);
            console.log(`   - HTML: ${reports.html}`);
            console.log(`   - Markdown: ${reports.markdown}`);

            return summary.failed === 0 ? 0 : 1;

        } catch (error) {
            console.error('💥 Критическая ошибка:', error);
            return 1;
        } finally {
            await this.cleanup();
        }
    }
}

// Запуск теста
if (require.main === module) {
    const test = new CompleteChromeTest();
    test.run().then(exitCode => {
        process.exit(exitCode);
    });
}

module.exports = CompleteChromeTest;
