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
