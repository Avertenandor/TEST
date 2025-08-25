/**
 * GENESIS ChatGPT Analyzer
 * Упрощенный интерфейс диагностики для AI анализа
 * Version: 1.0.0
 * 
 * ИНСТРУКЦИЯ ДЛЯ ChatGPT/AI:
 * 1. Откройте сайт GENESIS в браузере
 * 2. Откройте консоль разработчика (F12)
 * 3. Вставьте этот скрипт целиком
 * 4. Запустите: await analyzeGenesis()
 * 5. Результаты будут автоматически собраны и отформатированы
 */

(async function() {
    'use strict';

    // Проверяем, не загружен ли уже основной диагностический пакет
    if (!window.GenesisDiagnostics) {
        console.log('📦 Загрузка диагностического пакета...');
        
        // Пытаемся загрузить основной пакет
        try {
            const script = document.createElement('script');
            script.src = '/diagnostic-suite.js';
            document.head.appendChild(script);
            
            // Ждем загрузки
            await new Promise((resolve) => {
                script.onload = resolve;
                setTimeout(resolve, 3000); // Таймаут 3 секунды
            });
        } catch (error) {
            console.error('❌ Не удалось загрузить diagnostic-suite.js');
            console.log('📋 Используем встроенную версию...');
        }
    }

    // ===========================================
    // УПРОЩЕННЫЙ AI-FRIENDLY АНАЛИЗАТОР
    // ===========================================
    window.GenesisAI = {
        version: '1.0.0',
        
        // Структурированные результаты для AI
        results: {
            metadata: {
                timestamp: null,
                url: null,
                duration: null
            },
            
            status: {
                isAuthenticated: false,
                hasPlatformAccess: false,
                currentModule: null,
                errors: [],
                warnings: []
            },
            
            modules: {
                total: 20,
                loaded: [],
                available: [],
                missing: []
            },
            
            blockchain: {
                network: 'BSC',
                tokens: ['USDT', 'PLEX'],
                apiCalls: 0,
                transactions: []
            },
            
            deposits: {
                active: [],
                history: [],
                plans: []
            },
            
            ui: {
                forms: 0,
                buttons: 0,
                modals: 0,
                navigation: []
            },
            
            performance: {
                loadTime: null,
                memoryUsage: null,
                domElements: null
            },
            
            issues: {
                critical: [],
                warnings: [],
                suggestions: []
            }
        },

        // ===========================================
        // БЫСТРЫЙ АНАЛИЗ (10 секунд)
        // ===========================================
        quickAnalyze: async function() {
            console.log('🚀 Запуск быстрого анализа GENESIS (10 секунд)...');
            
            this.results.metadata.timestamp = new Date().toISOString();
            this.results.metadata.url = window.location.href;
            
            const startTime = Date.now();
            
            // 1. Проверка аутентификации
            this.checkAuthentication();
            
            // 2. Анализ модулей
            await this.analyzeModules();
            
            // 3. Проверка UI
            this.analyzeUI();
            
            // 4. Проверка депозитов
            this.analyzeDeposits();
            
            // 5. Производительность
            this.analyzePerformance();
            
            // 6. Поиск проблем
            this.detectIssues();
            
            // Ждем 10 секунд для сбора сетевой активности
            await new Promise(resolve => setTimeout(resolve, 10000));
            
            // 7. Анализ сети
            this.analyzeNetwork();
            
            this.results.metadata.duration = Date.now() - startTime;
            
            return this.formatResults();
        },

        // ===========================================
        // ПОЛНЫЙ АНАЛИЗ (60 секунд)
        // ===========================================
        fullAnalyze: async function() {
            console.log('🔍 Запуск полного анализа GENESIS (60 секунд)...');
            
            // Используем основной диагностический пакет если доступен
            if (window.GenesisDiagnostics) {
                const diagnosticData = await window.GenesisDiagnostics.run(60000);
                return this.processeDiagnosticData(diagnosticData);
            } else {
                // Иначе используем упрощенный анализ
                return await this.extendedAnalyze(60000);
            }
        },

        // ===========================================
        // АНАЛИЗАТОРЫ
        // ===========================================
        checkAuthentication: function() {
            // Проверка через store
            if (window.store) {
                this.results.status.isAuthenticated = !!window.store.get('user.authenticated');
                this.results.status.hasPlatformAccess = !!window.store.get('user.platformAccess');
            }
            
            // Проверка через localStorage
            const authState = localStorage.getItem('auth_state');
            if (authState) {
                try {
                    const auth = JSON.parse(authState);
                    this.results.status.isAuthenticated = auth.isAuthenticated || false;
                } catch (e) {}
            }
            
            // Проверка текущего модуля
            if (window.router) {
                this.results.status.currentModule = window.router.currentModule || 'unknown';
            }
        },

        analyzeModules: async function() {
            const moduleNames = [
                'auth', 'platform-access', 'dashboard', 'deposits', 'portfolio',
                'transactions', 'analytics', 'bonuses', 'gifts', 'referrals',
                'multipliers', 'mining-rent', 'device', 'experience', 'rank',
                'plex-coin', 'how-it-works', 'terminal', 'settings', 'home'
            ];
            
            // Проверка загруженных модулей
            if (window.moduleLoader && window.moduleLoader.loadedModules) {
                window.moduleLoader.loadedModules.forEach((module, name) => {
                    this.results.modules.loaded.push(name);
                });
            }
            
            // Проверка доступных модулей
            for (const name of moduleNames) {
                try {
                    const response = await fetch(`/modules/${name}/index.js`, { method: 'HEAD' });
                    if (response.ok) {
                        this.results.modules.available.push(name);
                    } else {
                        this.results.modules.missing.push(name);
                    }
                } catch (error) {
                    this.results.modules.missing.push(name);
                }
            }
        },

        analyzeUI: function() {
            // Формы
            const forms = document.querySelectorAll('form');
            this.results.ui.forms = forms.length;
            
            // Кнопки
            const buttons = document.querySelectorAll('button, input[type="button"], input[type="submit"]');
            this.results.ui.buttons = buttons.length;
            
            // Модальные окна
            const modals = document.querySelectorAll('.modal, [role="dialog"]');
            this.results.ui.modals = modals.length;
            
            // Навигация
            const navLinks = document.querySelectorAll('[data-route], nav a');
            this.results.ui.navigation = Array.from(navLinks).map(link => ({
                text: link.textContent.trim(),
                route: link.dataset.route || link.href
            }));
        },

        analyzeDeposits: function() {
            // Проверка планов депозитов из конфигурации
            if (window.store) {
                const config = window.store.get('config');
                if (config && config.depositPlans) {
                    this.results.deposits.plans = config.depositPlans;
                }
            }
            
            // Проверка активных депозитов из localStorage
            const deposits = localStorage.getItem('deposits');
            if (deposits) {
                try {
                    const depositData = JSON.parse(deposits);
                    if (Array.isArray(depositData)) {
                        this.results.deposits.active = depositData;
                    }
                } catch (e) {}
            }
            
            // Проверка UI элементов депозитов
            const depositCards = document.querySelectorAll('.deposit-card, [data-deposit-id]');
            depositCards.forEach(card => {
                const depositInfo = {
                    id: card.dataset.depositId,
                    amount: card.querySelector('.amount')?.textContent,
                    status: card.querySelector('.status')?.textContent
                };
                if (depositInfo.id) {
                    this.results.deposits.active.push(depositInfo);
                }
            });
        },

        analyzePerformance: function() {
            // Время загрузки
            if (performance.timing) {
                const timing = performance.timing;
                this.results.performance.loadTime = timing.loadEventEnd - timing.navigationStart;
            }
            
            // Использование памяти
            if (performance.memory) {
                this.results.performance.memoryUsage = {
                    used: (performance.memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB',
                    total: (performance.memory.totalJSHeapSize / 1048576).toFixed(2) + ' MB'
                };
            }
            
            // Количество DOM элементов
            this.results.performance.domElements = document.getElementsByTagName('*').length;
        },

        analyzeNetwork: function() {
            // Подсчет API вызовов через performance API
            const resources = performance.getEntriesByType('resource');
            const apiCalls = resources.filter(r => r.name.includes('bscscan.com'));
            this.results.blockchain.apiCalls = apiCalls.length;
        },

        detectIssues: function() {
            // Критические проблемы
            if (!this.results.status.isAuthenticated) {
                this.results.issues.critical.push('Пользователь не авторизован');
            }
            
            if (this.results.modules.missing.length > 0) {
                this.results.issues.critical.push(`Отсутствуют модули: ${this.results.modules.missing.join(', ')}`);
            }
            
            // Предупреждения
            if (!this.results.status.hasPlatformAccess) {
                this.results.issues.warnings.push('Нет доступа к платформе (требуется оплата $1 USDT)');
            }
            
            if (this.results.ui.forms === 0) {
                this.results.issues.warnings.push('Не найдено форм на странице');
            }
            
            // Предложения
            if (this.results.performance.domElements > 5000) {
                this.results.issues.suggestions.push('Большое количество DOM элементов может влиять на производительность');
            }
            
            if (this.results.blockchain.apiCalls === 0) {
                this.results.issues.suggestions.push('Нет активности BSCScan API - возможно требуется проверка интеграции');
            }
        },

        // ===========================================
        // ФОРМАТИРОВАНИЕ РЕЗУЛЬТАТОВ
        // ===========================================
        formatResults: function() {
            const report = `
╔══════════════════════════════════════════════════════════════╗
║             GENESIS DEFI PLATFORM - AI ANALYSIS              ║
╚══════════════════════════════════════════════════════════════╝

📅 МЕТАДАННЫЕ
├─ Время: ${this.results.metadata.timestamp}
├─ URL: ${this.results.metadata.url}
└─ Длительность анализа: ${this.results.metadata.duration}ms

👤 СТАТУС ПОЛЬЗОВАТЕЛЯ
├─ Авторизован: ${this.results.status.isAuthenticated ? '✅ Да' : '❌ Нет'}
├─ Доступ к платформе: ${this.results.status.hasPlatformAccess ? '✅ Да' : '❌ Нет'}
└─ Текущий модуль: ${this.results.status.currentModule}

📦 МОДУЛИ (${this.results.modules.total})
├─ Загружено: ${this.results.modules.loaded.length}
├─ Доступно: ${this.results.modules.available.length}
└─ Отсутствует: ${this.results.modules.missing.length}

🔗 BLOCKCHAIN
├─ Сеть: ${this.results.blockchain.network}
├─ Токены: ${this.results.blockchain.tokens.join(', ')}
└─ API вызовов: ${this.results.blockchain.apiCalls}

💰 ДЕПОЗИТЫ
├─ Активных: ${this.results.deposits.active.length}
├─ Планов: ${this.results.deposits.plans.length}
└─ История: ${this.results.deposits.history.length}

🖥️ ИНТЕРФЕЙС
├─ Форм: ${this.results.ui.forms}
├─ Кнопок: ${this.results.ui.buttons}
├─ Модальных окон: ${this.results.ui.modals}
└─ Навигация: ${this.results.ui.navigation.length} ссылок

⚡ ПРОИЗВОДИТЕЛЬНОСТЬ
├─ Время загрузки: ${this.results.performance.loadTime}ms
├─ Память: ${this.results.performance.memoryUsage?.used || 'N/A'}
└─ DOM элементов: ${this.results.performance.domElements}

🔍 ОБНАРУЖЕННЫЕ ПРОБЛЕМЫ
${this.formatIssues()}

📊 РЕКОМЕНДАЦИИ ДЛЯ AI
${this.getAIRecommendations()}
`;
            
            console.log(report);
            
            // Сохраняем для доступа
            window.GENESIS_AI_RESULTS = this.results;
            
            return this.results;
        },

        formatIssues: function() {
            let issues = '';
            
            if (this.results.issues.critical.length > 0) {
                issues += '├─ ❌ КРИТИЧЕСКИЕ:\n';
                this.results.issues.critical.forEach(issue => {
                    issues += `│  └─ ${issue}\n`;
                });
            }
            
            if (this.results.issues.warnings.length > 0) {
                issues += '├─ ⚠️ ПРЕДУПРЕЖДЕНИЯ:\n';
                this.results.issues.warnings.forEach(warning => {
                    issues += `│  └─ ${warning}\n`;
                });
            }
            
            if (this.results.issues.suggestions.length > 0) {
                issues += '└─ 💡 ПРЕДЛОЖЕНИЯ:\n';
                this.results.issues.suggestions.forEach(suggestion => {
                    issues += `   └─ ${suggestion}\n`;
                });
            }
            
            return issues || '└─ ✅ Проблем не обнаружено';
        },

        getAIRecommendations: function() {
            const recommendations = [];
            
            if (!this.results.status.isAuthenticated) {
                recommendations.push('1. Необходима авторизация через оплату 1 PLEX');
            }
            
            if (!this.results.status.hasPlatformAccess) {
                recommendations.push('2. Требуется оплата $1 USDT для доступа к платформе');
            }
            
            if (this.results.modules.missing.length > 0) {
                recommendations.push('3. Проверить отсутствующие модули и их зависимости');
            }
            
            if (this.results.deposits.active.length === 0) {
                recommendations.push('4. Нет активных депозитов - проверить функционал создания');
            }
            
            if (this.results.blockchain.apiCalls === 0) {
                recommendations.push('5. Проверить интеграцию с BSCScan API');
            }
            
            return recommendations.length > 0 
                ? recommendations.join('\n') 
                : '✅ Система работает нормально';
        },

        // ===========================================
        // РАСШИРЕННЫЙ АНАЛИЗ
        // ===========================================
        extendedAnalyze: async function(duration) {
            console.log(`🔬 Расширенный анализ на ${duration/1000} секунд...`);
            
            const startTime = Date.now();
            const interval = 5000; // Проверка каждые 5 секунд
            
            // Начальный анализ
            await this.quickAnalyze();
            
            // Периодический сбор данных
            const checkInterval = setInterval(() => {
                console.log(`⏳ Анализ... ${Math.round((Date.now() - startTime) / 1000)}s`);
                
                // Обновляем данные
                this.checkAuthentication();
                this.analyzeUI();
                this.analyzePerformance();
                this.analyzeNetwork();
                
            }, interval);
            
            // Ждем завершения
            await new Promise(resolve => setTimeout(resolve, duration));
            
            clearInterval(checkInterval);
            
            // Финальный анализ
            this.detectIssues();
            
            return this.formatResults();
        },

        // ===========================================
        // ОБРАБОТКА ДАННЫХ ИЗ DIAGNOSTIC-SUITE
        // ===========================================
        processeDiagnosticData: function(data) {
            // Конвертируем данные из полной диагностики в наш формат
            
            this.results.metadata = {
                timestamp: data.timestamp,
                url: data.url,
                duration: data.duration
            };
            
            // Статус
            if (data.state && data.state.store) {
                this.results.status.isAuthenticated = !!data.state.store.user;
                this.results.status.hasPlatformAccess = !!data.state.store.platformAccess;
            }
            
            // Модули
            if (data.modules) {
                this.results.modules.loaded = data.modules.loaded?.map(m => m.name) || [];
                this.results.modules.available = data.modules.available?.filter(m => m.exists).map(m => m.name) || [];
                this.results.modules.missing = data.modules.available?.filter(m => !m.exists).map(m => m.name) || [];
            }
            
            // Blockchain
            if (data.api) {
                this.results.blockchain.apiCalls = data.api.bscCalls || 0;
            }
            
            // UI
            if (data.dom) {
                this.results.ui.forms = data.dom.forms?.length || 0;
                this.results.ui.buttons = data.dom.buttons?.length || 0;
                this.results.ui.modals = data.dom.modals?.length || 0;
            }
            
            // Performance
            if (data.performance) {
                this.results.performance.loadTime = data.performance.timing?.pageLoadTime;
                this.results.performance.memoryUsage = data.performance.memory;
                this.results.performance.domElements = data.dom?.structure?.totalElements;
            }
            
            // Errors & Warnings
            if (data.errors && data.errors.length > 0) {
                data.errors.forEach(error => {
                    this.results.issues.critical.push(`Error: ${error.message}`);
                });
            }
            
            if (data.warnings && data.warnings.length > 0) {
                data.warnings.forEach(warning => {
                    this.results.issues.warnings.push(`Warning: ${warning.message}`);
                });
            }
            
            return this.formatResults();
        }
    };

    // ===========================================
    // ГЛОБАЛЬНЫЕ ФУНКЦИИ ДЛЯ УДОБСТВА
    // ===========================================
    
    // Основная функция для ChatGPT
    window.analyzeGenesis = async function(mode = 'quick') {
        if (mode === 'quick') {
            return await GenesisAI.quickAnalyze();
        } else if (mode === 'full') {
            return await GenesisAI.fullAnalyze();
        } else {
            console.error('❌ Неверный режим. Используйте "quick" или "full"');
        }
    };
    
    // Упрощенные команды
    window.genesis = {
        // Быстрый анализ (10 секунд)
        quick: () => GenesisAI.quickAnalyze(),
        
        // Полный анализ (60 секунд)
        full: () => GenesisAI.fullAnalyze(),
        
        // Проверка статуса
        status: () => {
            GenesisAI.checkAuthentication();
            return GenesisAI.results.status;
        },
        
        // Проверка модулей
        modules: () => GenesisAI.analyzeModules(),
        
        // Получить результаты
        results: () => window.GENESIS_AI_RESULTS,
        
        // Экспорт в JSON
        export: () => {
            const data = JSON.stringify(window.GENESIS_AI_RESULTS, null, 2);
            console.log(data);
            return data;
        },
        
        // Справка
        help: () => {
            console.log(`
╔════════════════════════════════════════════════════════╗
║           GENESIS AI ANALYZER - КОМАНДЫ               ║
╠════════════════════════════════════════════════════════╣
║                                                        ║
║  genesis.quick()   - Быстрый анализ (10 сек)         ║
║  genesis.full()    - Полный анализ (60 сек)          ║
║  genesis.status()  - Проверка статуса пользователя   ║
║  genesis.modules() - Анализ модулей                  ║
║  genesis.results() - Получить результаты             ║
║  genesis.export()  - Экспорт в JSON                  ║
║  genesis.help()    - Эта справка                     ║
║                                                        ║
║  Или используйте:                                     ║
║  await analyzeGenesis('quick')                        ║
║  await analyzeGenesis('full')                         ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
            `);
        }
    };
    
    // Вывод приветствия
    console.log(`
╔════════════════════════════════════════════════════════╗
║         🚀 GENESIS AI ANALYZER ЗАГРУЖЕН! 🚀           ║
╠════════════════════════════════════════════════════════╣
║                                                        ║
║  Для ChatGPT/AI анализа используйте:                  ║
║                                                        ║
║  1. БЫСТРЫЙ АНАЛИЗ (10 секунд):                      ║
║     await analyzeGenesis('quick')                     ║
║                                                        ║
║  2. ПОЛНЫЙ АНАЛИЗ (60 секунд):                       ║
║     await analyzeGenesis('full')                      ║
║                                                        ║
║  3. СПРАВКА ПО КОМАНДАМ:                             ║
║     genesis.help()                                    ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
    `);
    
})();