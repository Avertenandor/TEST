/**
 * GENESIS DeFi Platform - Diagnostic Suite
 * Автоматизированная система диагностики для ChatGPT/AI анализа
 * Version: 1.0.0
 * Created: 2025-08-24
 * 
 * Запуск: 
 * 1. Откройте сайт в браузере
 * 2. Откройте консоль (F12)
 * 3. Вставьте: await loadDiagnostics()
 * 4. Или запустите автоматически через URL: site.com?diagnostics=true
 */

(function() {
    'use strict';

    // Глобальный объект диагностики
    window.GenesisDiagnostics = {
        version: '1.0.0',
        startTime: null,
        endTime: null,
        duration: 60000, // 60 секунд
        interval: 1000, // Проверка каждую секунду
        
        data: {
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            screen: {
                width: screen.width,
                height: screen.height,
                colorDepth: screen.colorDepth,
                pixelRatio: window.devicePixelRatio
            },
            
            // Результаты диагностики
            console: [],
            errors: [],
            warnings: [],
            network: [],
            modules: {},
            dom: {},
            performance: {},
            storage: {},
            api: {},
            events: [],
            state: {}
        },
        
        collectors: {},
        isRunning: false,
        progressInterval: null
    };

    const GD = window.GenesisDiagnostics;

    // ===========================================
    // СБОРЩИК ДАННЫХ КОНСОЛИ
    // ===========================================
    GD.collectors.console = {
        originalMethods: {},
        logs: [],
        
        start() {
            // Перехват console методов
            const methods = ['log', 'error', 'warn', 'info', 'debug'];
            
            methods.forEach(method => {
                this.originalMethods[method] = console[method];
                
                console[method] = (...args) => {
                    // Сохраняем в коллекцию
                    this.logs.push({
                        type: method,
                        timestamp: new Date().toISOString(),
                        message: args.map(arg => {
                            try {
                                return typeof arg === 'object' ? JSON.stringify(arg) : String(arg);
                            } catch (e) {
                                return String(arg);
                            }
                        }).join(' '),
                        stack: new Error().stack
                    });
                    
                    // Вызываем оригинальный метод
                    this.originalMethods[method].apply(console, args);
                };
            });
            
            // Перехват ошибок
            window.addEventListener('error', (e) => {
                GD.data.errors.push({
                    timestamp: new Date().toISOString(),
                    message: e.message,
                    filename: e.filename,
                    line: e.lineno,
                    column: e.colno,
                    stack: e.error ? e.error.stack : null
                });
            });
            
            // Перехват promise rejections
            window.addEventListener('unhandledrejection', (e) => {
                GD.data.errors.push({
                    timestamp: new Date().toISOString(),
                    type: 'unhandledRejection',
                    reason: e.reason,
                    promise: String(e.promise)
                });
            });
        },
        
        stop() {
            // Восстанавливаем оригинальные методы
            Object.keys(this.originalMethods).forEach(method => {
                console[method] = this.originalMethods[method];
            });
            
            // Сохраняем собранные логи
            GD.data.console = this.logs;
            GD.data.warnings = this.logs.filter(l => l.type === 'warn');
        }
    };

    // ===========================================
    // АНАЛИЗАТОР МОДУЛЕЙ
    // ===========================================
    GD.collectors.modules = {
        async analyze() {
            const results = {
                loaded: [],
                available: [],
                errors: [],
                routes: {},
                dependencies: {}
            };
            
            // Проверка загруженных модулей
            if (window.moduleLoader && window.moduleLoader.loadedModules) {
                window.moduleLoader.loadedModules.forEach((module, name) => {
                    results.loaded.push({
                        name: name,
                        version: module.version || 'unknown',
                        dependencies: module.dependencies || [],
                        hasInit: typeof module.init === 'function',
                        hasDestroy: typeof module.destroy === 'function',
                        state: module.state ? Object.keys(module.state) : []
                    });
                });
            }
            
            // Проверка доступных маршрутов
            if (window.router && window.router.routes) {
                results.routes = { ...window.router.routes };
            }
            
            // Проверка core системы
            results.coreSystem = {
                eventBus: !!window.eventBus,
                store: !!window.store,
                router: !!window.router,
                moduleLoader: !!window.moduleLoader
            };
            
            // Попытка загрузить каждый модуль для проверки
            const moduleNames = [
                'auth', 'platform-access', 'dashboard', 'deposits', 'portfolio',
                'transactions', 'analytics', 'bonuses', 'gifts', 'referrals',
                'multipliers', 'mining-rent', 'device', 'experience', 'rank',
                'plex-coin', 'how-it-works', 'terminal', 'settings', 'home'
            ];
            
            for (const moduleName of moduleNames) {
                try {
                    const moduleExists = await this.checkModuleExists(moduleName);
                    results.available.push({
                        name: moduleName,
                        exists: moduleExists,
                        path: `/modules/${moduleName}/`
                    });
                } catch (error) {
                    results.errors.push({
                        module: moduleName,
                        error: error.message
                    });
                }
            }
            
            GD.data.modules = results;
        },
        
        async checkModuleExists(moduleName) {
            try {
                const response = await fetch(`/modules/${moduleName}/index.js`, { method: 'HEAD' });
                return response.ok;
            } catch {
                return false;
            }
        }
    };

    // ===========================================
    // АНАЛИЗАТОР DOM
    // ===========================================
    GD.collectors.dom = {
        analyze() {
            const results = {
                structure: {},
                elements: {},
                forms: [],
                buttons: [],
                links: [],
                images: [],
                scripts: [],
                styles: []
            };
            
            // Общая структура
            results.structure = {
                title: document.title,
                url: window.location.href,
                totalElements: document.getElementsByTagName('*').length,
                bodyClasses: document.body.className,
                htmlLang: document.documentElement.lang,
                charset: document.characterSet
            };
            
            // Формы
            const forms = document.querySelectorAll('form');
            results.forms = Array.from(forms).map(form => ({
                id: form.id,
                action: form.action,
                method: form.method,
                fields: Array.from(form.elements).map(el => ({
                    type: el.type,
                    name: el.name,
                    id: el.id,
                    required: el.required
                }))
            }));
            
            // Кнопки
            const buttons = document.querySelectorAll('button, input[type="button"], input[type="submit"]');
            results.buttons = Array.from(buttons).map(btn => ({
                text: btn.textContent || btn.value,
                type: btn.type,
                id: btn.id,
                classes: btn.className,
                disabled: btn.disabled,
                hasOnclick: !!btn.onclick,
                dataAttributes: Object.keys(btn.dataset)
            }));
            
            // Ссылки
            const links = document.querySelectorAll('a');
            results.links = Array.from(links).slice(0, 50).map(link => ({
                text: link.textContent.trim().substring(0, 50),
                href: link.href,
                target: link.target,
                hasOnclick: !!link.onclick
            }));
            
            // Изображения
            const images = document.querySelectorAll('img');
            results.images = Array.from(images).slice(0, 20).map(img => ({
                src: img.src,
                alt: img.alt,
                width: img.width,
                height: img.height,
                loaded: img.complete
            }));
            
            // Скрипты
            const scripts = document.querySelectorAll('script');
            results.scripts = Array.from(scripts).map(script => ({
                src: script.src || 'inline',
                type: script.type || 'text/javascript',
                async: script.async,
                defer: script.defer
            }));
            
            // Стили
            const styles = document.querySelectorAll('link[rel="stylesheet"], style');
            results.styles = Array.from(styles).map(style => ({
                href: style.href || 'inline',
                media: style.media || 'all'
            }));
            
            // Модальные окна
            const modals = document.querySelectorAll('.modal, [role="dialog"]');
            results.modals = Array.from(modals).map(modal => ({
                id: modal.id,
                classes: modal.className,
                visible: window.getComputedStyle(modal).display !== 'none'
            }));
            
            GD.data.dom = results;
        }
    };

    // ===========================================
    // МОНИТОРИНГ СЕТИ И API
    // ===========================================
    GD.collectors.network = {
        requests: [],
        
        start() {
            // Перехват fetch
            const originalFetch = window.fetch;
            window.fetch = async (...args) => {
                const startTime = performance.now();
                const [resource, config] = args;
                
                const request = {
                    timestamp: new Date().toISOString(),
                    url: typeof resource === 'string' ? resource : resource.url,
                    method: (config && config.method) || 'GET',
                    startTime: startTime
                };
                
                try {
                    const response = await originalFetch(...args);
                    const endTime = performance.now();
                    
                    request.status = response.status;
                    request.statusText = response.statusText;
                    request.duration = endTime - startTime;
                    request.success = response.ok;
                    
                    // Особая обработка для BSCScan API
                    if (request.url.includes('bscscan.com')) {
                        request.type = 'BSCScan API';
                        request.endpoint = this.extractBscEndpoint(request.url);
                    }
                    
                    this.requests.push(request);
                    return response;
                    
                } catch (error) {
                    const endTime = performance.now();
                    request.error = error.message;
                    request.duration = endTime - startTime;
                    request.success = false;
                    
                    this.requests.push(request);
                    throw error;
                }
            };
            
            // Перехват XMLHttpRequest
            const XHR = XMLHttpRequest.prototype;
            const originalOpen = XHR.open;
            const originalSend = XHR.send;
            
            XHR.open = function(method, url) {
                this._requestInfo = {
                    method: method,
                    url: url,
                    timestamp: new Date().toISOString(),
                    startTime: performance.now()
                };
                return originalOpen.apply(this, arguments);
            };
            
            XHR.send = function() {
                const xhr = this;
                
                xhr.addEventListener('load', function() {
                    if (xhr._requestInfo) {
                        xhr._requestInfo.status = xhr.status;
                        xhr._requestInfo.duration = performance.now() - xhr._requestInfo.startTime;
                        xhr._requestInfo.success = xhr.status >= 200 && xhr.status < 300;
                        GD.collectors.network.requests.push(xhr._requestInfo);
                    }
                });
                
                xhr.addEventListener('error', function() {
                    if (xhr._requestInfo) {
                        xhr._requestInfo.error = 'Network error';
                        xhr._requestInfo.duration = performance.now() - xhr._requestInfo.startTime;
                        xhr._requestInfo.success = false;
                        GD.collectors.network.requests.push(xhr._requestInfo);
                    }
                });
                
                return originalSend.apply(this, arguments);
            };
        },
        
        extractBscEndpoint(url) {
            const params = new URL(url).searchParams;
            return {
                module: params.get('module'),
                action: params.get('action'),
                contractaddress: params.get('contractaddress')
            };
        },
        
        stop() {
            GD.data.network = this.requests;
            
            // Анализ API вызовов
            GD.data.api = {
                total: this.requests.length,
                bscCalls: this.requests.filter(r => r.type === 'BSCScan API').length,
                failures: this.requests.filter(r => !r.success).length,
                averageTime: this.requests.length > 0 
                    ? this.requests.reduce((sum, r) => sum + (r.duration || 0), 0) / this.requests.length 
                    : 0,
                endpoints: [...new Set(this.requests.map(r => new URL(r.url).hostname))]
            };
        }
    };

    // ===========================================
    // АНАЛИЗАТОР СОСТОЯНИЯ
    // ===========================================
    GD.collectors.state = {
        analyze() {
            const results = {
                store: {},
                localStorage: {},
                sessionStorage: {},
                cookies: {},
                eventBus: {},
                router: {}
            };
            
            // Store состояние
            if (window.store) {
                try {
                    results.store = {
                        user: window.store.get('user'),
                        config: window.store.get('config'),
                        deposits: window.store.get('deposits'),
                        balance: window.store.get('balance'),
                        platformAccess: window.store.get('platformAccess')
                    };
                } catch (e) {
                    results.store.error = e.message;
                }
            }
            
            // LocalStorage
            try {
                const lsKeys = Object.keys(localStorage);
                results.localStorage = {
                    keys: lsKeys,
                    size: lsKeys.length,
                    data: {}
                };
                
                // Сохраняем важные ключи
                const importantKeys = ['authToken', 'userAddress', 'auth_state', 'deposits', 'settings'];
                importantKeys.forEach(key => {
                    if (localStorage.getItem(key)) {
                        try {
                            results.localStorage.data[key] = JSON.parse(localStorage.getItem(key));
                        } catch {
                            results.localStorage.data[key] = localStorage.getItem(key);
                        }
                    }
                });
            } catch (e) {
                results.localStorage.error = e.message;
            }
            
            // SessionStorage
            try {
                const ssKeys = Object.keys(sessionStorage);
                results.sessionStorage = {
                    keys: ssKeys,
                    size: ssKeys.length
                };
            } catch (e) {
                results.sessionStorage.error = e.message;
            }
            
            // Cookies
            results.cookies = {
                enabled: navigator.cookieEnabled,
                list: document.cookie.split(';').map(c => c.trim().split('=')[0])
            };
            
            // EventBus состояние
            if (window.eventBus) {
                results.eventBus = {
                    exists: true,
                    eventsCount: window.eventBus.events ? window.eventBus.events.size : 0,
                    historyLength: window.eventBus.history ? window.eventBus.history.length : 0
                };
            }
            
            // Router состояние
            if (window.router) {
                results.router = {
                    exists: true,
                    currentPath: window.location.pathname,
                    currentModule: window.router.currentModule,
                    routes: Object.keys(window.router.routes || {})
                };
            }
            
            GD.data.state = results;
        }
    };

    // ===========================================
    // АНАЛИЗАТОР ПРОИЗВОДИТЕЛЬНОСТИ
    // ===========================================
    GD.collectors.performance = {
        analyze() {
            const results = {
                timing: {},
                memory: {},
                resources: [],
                metrics: {}
            };
            
            // Navigation timing
            if (performance.timing) {
                const timing = performance.timing;
                results.timing = {
                    pageLoadTime: timing.loadEventEnd - timing.navigationStart,
                    domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
                    domInteractive: timing.domInteractive - timing.navigationStart,
                    serverResponseTime: timing.responseEnd - timing.requestStart,
                    dnsLookupTime: timing.domainLookupEnd - timing.domainLookupStart
                };
            }
            
            // Memory
            if (performance.memory) {
                results.memory = {
                    usedJSHeapSize: (performance.memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB',
                    totalJSHeapSize: (performance.memory.totalJSHeapSize / 1048576).toFixed(2) + ' MB',
                    jsHeapSizeLimit: (performance.memory.jsHeapSizeLimit / 1048576).toFixed(2) + ' MB'
                };
            }
            
            // Resource timing
            const resources = performance.getEntriesByType('resource');
            results.resources = resources.slice(-20).map(resource => ({
                name: resource.name.split('/').pop(),
                type: resource.initiatorType,
                duration: resource.duration.toFixed(2),
                size: resource.transferSize || 0
            }));
            
            // Core Web Vitals (если доступны)
            try {
                const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
                if (fcpEntry) {
                    results.metrics.FCP = fcpEntry.startTime.toFixed(2);
                }
            } catch (e) {}
            
            GD.data.performance = results;
        }
    };

    // ===========================================
    // МОНИТОРИНГ СОБЫТИЙ
    // ===========================================
    GD.collectors.events = {
        capturedEvents: [],
        
        start() {
            if (window.eventBus) {
                // Перехват emit для отслеживания событий
                const originalEmit = window.eventBus.emit;
                window.eventBus.emit = function(event, data) {
                    GD.collectors.events.capturedEvents.push({
                        timestamp: new Date().toISOString(),
                        event: event,
                        data: data,
                        hasListeners: window.eventBus.events && window.eventBus.events.has(event)
                    });
                    
                    return originalEmit.apply(this, arguments);
                };
            }
        },
        
        stop() {
            GD.data.events = this.capturedEvents;
        }
    };

    // ===========================================
    // ГЛАВНЫЙ КОНТРОЛЛЕР
    // ===========================================
    GD.run = async function(duration = 60000) {
        if (this.isRunning) {
            console.warn('⚠️ Диагностика уже запущена!');
            return;
        }
        
        console.log('🚀 Запуск диагностики GENESIS DeFi Platform...');
        console.log(`⏱️ Продолжительность: ${duration / 1000} секунд`);
        
        this.isRunning = true;
        this.startTime = Date.now();
        this.endTime = this.startTime + duration;
        
        // Запускаем сборщики
        this.collectors.console.start();
        this.collectors.network.start();
        this.collectors.events.start();
        
        // Показываем прогресс
        let secondsElapsed = 0;
        this.progressInterval = setInterval(() => {
            secondsElapsed++;
            const remaining = Math.ceil((duration / 1000) - secondsElapsed);
            
            if (remaining % 10 === 0) {
                console.log(`⏳ Осталось ${remaining} секунд...`);
            }
            
            // Периодический сбор DOM и состояния
            if (secondsElapsed % 5 === 0) {
                this.collectors.dom.analyze();
                this.collectors.state.analyze();
            }
        }, 1000);
        
        // Анализируем модули сразу
        await this.collectors.modules.analyze();
        
        // Ждем завершения
        return new Promise((resolve) => {
            setTimeout(() => {
                this.complete();
                resolve(this.data);
            }, duration);
        });
    };

    GD.complete = function() {
        console.log('🏁 Завершение диагностики...');
        
        // Останавливаем интервал прогресса
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
        }
        
        // Финальный сбор данных
        this.collectors.console.stop();
        this.collectors.network.stop();
        this.collectors.events.stop();
        this.collectors.dom.analyze();
        this.collectors.state.analyze();
        this.collectors.performance.analyze();
        
        // Добавляем метаданные
        this.data.summary = this.generateSummary();
        this.data.duration = Date.now() - this.startTime;
        this.data.endTime = new Date().toISOString();
        
        this.isRunning = false;
        
        // Выводим результаты
        this.displayResults();
        
        // Сохраняем в глобальную переменную для доступа
        window.GENESIS_DIAGNOSTIC_RESULTS = this.data;
        
        console.log('✅ Диагностика завершена!');
        console.log('📊 Результаты доступны в: window.GENESIS_DIAGNOSTIC_RESULTS');
        console.log('💾 Для экспорта используйте: GenesisDiagnostics.export()');
    };

    GD.generateSummary = function() {
        return {
            totalErrors: this.data.errors.length,
            totalWarnings: this.data.warnings.length,
            totalConsoleLog: this.data.console.length,
            totalNetworkRequests: this.data.network.length,
            totalEvents: this.data.events.length,
            modulesLoaded: this.data.modules.loaded ? this.data.modules.loaded.length : 0,
            modulesAvailable: this.data.modules.available ? this.data.modules.available.length : 0,
            bscApiCalls: this.data.api.bscCalls || 0,
            failedRequests: this.data.api.failures || 0,
            domElements: this.data.dom.structure ? this.data.dom.structure.totalElements : 0,
            forms: this.data.dom.forms ? this.data.dom.forms.length : 0,
            buttons: this.data.dom.buttons ? this.data.dom.buttons.length : 0,
            hasAuthentication: !!(this.data.state.store && this.data.state.store.user),
            hasPlatformAccess: !!(this.data.state.store && this.data.state.store.platformAccess)
        };
    };

    GD.displayResults = function() {
        const summary = this.data.summary;
        
        console.group('📊 РЕЗУЛЬТАТЫ ДИАГНОСТИКИ GENESIS');
        
        console.group('🔍 Общая статистика');
        console.table(summary);
        console.groupEnd();
        
        if (this.data.errors.length > 0) {
            console.group(`❌ Ошибки (${this.data.errors.length})`);
            console.table(this.data.errors.slice(0, 10));
            console.groupEnd();
        }
        
        if (this.data.warnings.length > 0) {
            console.group(`⚠️ Предупреждения (${this.data.warnings.length})`);
            console.table(this.data.warnings.slice(0, 10));
            console.groupEnd();
        }
        
        console.group('🔌 Модули');
        console.log('Загружено:', this.data.modules.loaded);
        console.log('Доступно:', this.data.modules.available);
        console.groupEnd();
        
        console.group('🌐 Сетевая активность');
        console.log(`Всего запросов: ${this.data.network.length}`);
        console.log(`BSCScan API: ${this.data.api.bscCalls}`);
        console.log(`Неудачных: ${this.data.api.failures}`);
        console.log(`Среднее время: ${this.data.api.averageTime?.toFixed(2)}ms`);
        console.groupEnd();
        
        console.group('💾 Состояние');
        console.log('Store:', this.data.state.store);
        console.log('LocalStorage keys:', this.data.state.localStorage?.keys);
        console.log('Router:', this.data.state.router);
        console.groupEnd();
        
        console.groupEnd();
    };

    GD.export = function(format = 'json') {
        const data = JSON.stringify(this.data, null, 2);
        
        if (format === 'json') {
            // Создаем blob и скачиваем
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `genesis-diagnostics-${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);
            
            console.log('📥 Файл диагностики скачан');
        } else if (format === 'clipboard') {
            // Копируем в буфер обмена
            navigator.clipboard.writeText(data).then(() => {
                console.log('📋 Результаты скопированы в буфер обмена');
            });
        } else if (format === 'console') {
            // Выводим в консоль
            console.log(data);
        }
        
        return data;
    };

    // ===========================================
    // АВТОЗАПУСК
    // ===========================================
    
    // Проверяем параметр URL для автозапуска
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('diagnostics') === 'true') {
        console.log('🤖 Обнаружен параметр diagnostics=true, запуск через 3 секунды...');
        setTimeout(() => {
            GD.run();
        }, 3000);
    }

    // Глобальная функция для удобного запуска
    window.loadDiagnostics = async function(duration = 60000) {
        return await GenesisDiagnostics.run(duration);
    };

    // Команды для быстрого доступа
    window.diag = {
        run: (seconds = 60) => GenesisDiagnostics.run(seconds * 1000),
        stop: () => GenesisDiagnostics.complete(),
        export: () => GenesisDiagnostics.export('json'),
        copy: () => GenesisDiagnostics.export('clipboard'),
        results: () => window.GENESIS_DIAGNOSTIC_RESULTS,
        clear: () => {
            window.GENESIS_DIAGNOSTIC_RESULTS = null;
            console.clear();
            console.log('🧹 Результаты очищены');
        }
    };

    console.log('✅ GENESIS Diagnostic Suite загружен!');
    console.log('🚀 Для запуска используйте:');
    console.log('   - diag.run(60) - запустить на 60 секунд');
    console.log('   - diag.stop() - остановить досрочно');
    console.log('   - diag.export() - скачать результаты');
    console.log('   - diag.copy() - скопировать в буфер');
    console.log('   - diag.results() - посмотреть результаты');
    
})();