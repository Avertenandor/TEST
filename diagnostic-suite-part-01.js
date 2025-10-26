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