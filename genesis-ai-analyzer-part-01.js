                
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