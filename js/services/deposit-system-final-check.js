/**
 * GENESIS 1.1 - Финальная проверка и исправление функций депозитов
 * MCP-MARKER:MODULE:DEPOSIT_SYSTEM_FINAL_CHECK - Финальная проверка системы депозитов
 */

// MCP-MARKER:SECTION:CRITICAL_FIXES - Критические исправления

console.log('🔧 GENESIS 1.1 - Запуск финальной проверки депозитной системы...');

// Проверяем и исправляем все необходимые глобальные функции
document.addEventListener('DOMContentLoaded', () => {
    
    // MCP-MARKER:FUNCTION:ENSURE_DEPOSIT_FUNCTIONS - Обеспечение функций депозитов
    function ensureDepositFunctions() {
        console.log('🔍 Проверка функций депозитов...');
        
        // Функция создания депозита для кнопок в UI
        if (!window.createDeposit) {
            window.createDeposit = function(planId) {
                console.log('💰 Создание депозита для плана:', planId);
                if (window.GenesisCabinet && window.GenesisCabinet.showPurchaseModal) {
                    window.GenesisCabinet.showPurchaseModal(planId);
                } else if (window.CabinetDepositService && window.CabinetDepositService.startDepositProcess) {
                    window.CabinetDepositService.startDepositProcess(planId);
                } else {
                    alert('💰 Функция создания депозита временно недоступна. Попробуйте обновить страницу.');
                }
            };
        }
        
        // Функция показа модального окна депозита
        if (!window.showDepositModal) {
            window.showDepositModal = function(planId = null) {
                console.log('📋 Показ модального окна депозита');
                if (window.GenesisCabinet && window.GenesisCabinet.showDepositModal) {
                    window.GenesisCabinet.showDepositModal(planId);
                } else {
                    alert('📋 Модальное окно депозита временно недоступно');
                }
            };
        }
        
        // Функция обновления данных портфеля
        if (!window.refreshPortfolio) {
            window.refreshPortfolio = function() {
                console.log('🔄 Обновление данных портфеля');
                if (window.CabinetDepositService && window.CabinetDepositService.refreshData) {
                    window.CabinetDepositService.refreshData();
                } else if (window.cabinetApp && window.cabinetApp.loadPage) {
                    window.cabinetApp.loadPage('portfolio');
                } else {
                    location.reload();
                }
            };
        }
        
        // Функция калькулятора прибыли
        if (!window.calculateProfit) {
            window.calculateProfit = function() {
                const amount = document.getElementById('calc-amount')?.value;
                const plan = document.getElementById('calc-plan')?.value;
                const result = document.getElementById('calc-result');
                
                if (!amount || amount <= 0) {
                    if (result) {
                        result.style.display = 'block';
                        result.innerHTML = '<span style="color: var(--error-color);">❌ Введите корректную сумму</span>';
                    }
                    return;
                }
                
                const rates = {
                    basic: 0.06,
                    gold: 0.08,
                    platinum: 0.10,
                    vip: 0.12
                };
                
                const dailyProfit = amount * (rates[plan] || 0.06);
                const monthlyProfit = dailyProfit * 30;
                
                if (result) {
                    result.style.display = 'block';
                    result.innerHTML = `
                        <div style="color: var(--success-color);">💰 Ежедневно: $${dailyProfit.toFixed(2)}</div>
                        <div style="color: var(--primary-color);">📈 За месяц: $${monthlyProfit.toFixed(2)}</div>
                        <div style="color: var(--secondary-color); font-size: 0.8rem; margin-top: 0.5rem;">
                            ROI: ${((monthlyProfit / amount) * 100).toFixed(1)}% за месяц
                        </div>
                    `;
                }
            };
        }
        
        console.log('✅ Функции депозитов проверены и настроены');
    }
    
    // MCP-MARKER:FUNCTION:ENSURE_CABINET_INTEGRATION - Обеспечение интеграции кабинета
    function ensureCabinetIntegration() {
        console.log('🔍 Проверка интеграции кабинета...');
        
        // Проверяем наличие основных сервисов
        const requiredServices = [
            'GENESIS_CONFIG',
            'GenesisAPI', 
            'EnhancedDepositSystem',
            'CabinetDepositService',
            'GenesisCabinet'
        ];
        
        const missing = requiredServices.filter(service => !window[service]);
        
        if (missing.length > 0) {
            console.warn('⚠️ Отсутствуют сервисы:', missing);
            
            // Создаем fallback функции
            missing.forEach(service => {
                if (service === 'GENESIS_CONFIG' && !window.GENESIS_CONFIG) {
                    console.log('🔧 Создание fallback конфигурации...');
                    window.GENESIS_CONFIG = {
                        depositPlans: [
                            { id: 'trial', name: 'TRIAL', usdtAmount: 25, percentage: 110, days: 3, currencies: ['USDT'] },
                            { id: 'starter', name: 'STARTER', usdtAmount: 100, percentage: 120, days: 10, currencies: ['USDT'] }
                        ],
                        addresses: {
                            system: '0x399B22170B0AC7BB20bdC86772bfF478f201fFCD'
                        }
                    };
                }
            });
        }
        
        // Убеждаемся что cabinetApp инициализирован
        if (window.cabinetApp && typeof window.cabinetApp.init === 'function') {
            console.log('✅ CabinetApp доступен');
            
            // Добавляем проверку депозитной системы к checkAuth
            const originalCheckAuth = window.cabinetApp.checkAuth;
            if (originalCheckAuth) {
                window.cabinetApp.checkAuth = async function() {
                    await originalCheckAuth.call(this);
                    
                    // Инициализируем депозитную систему если пользователь авторизован
                    if (this.isAuthenticated && this.currentUser) {
                        console.log('🔄 Инициализация депозитной системы для пользователя:', this.currentUser);
                        
                        if (window.CabinetDepositService && window.CabinetDepositService.init) {
                            try {
                                await window.CabinetDepositService.init(this.currentUser);
                            } catch (error) {
                                console.warn('⚠️ Ошибка инициализации CabinetDepositService:', error);
                            }
                        }
                        
                        if (window.GenesisCabinet && window.GenesisCabinet.init) {
                            try {
                                window.GenesisCabinet.init(this.currentUser);
                            } catch (error) {
                                console.warn('⚠️ Ошибка инициализации GenesisCabinet:', error);
                            }
                        }
                    }
                };
            }
        }
        
        console.log('✅ Интеграция кабинета проверена');
    }
    
    // MCP-MARKER:FUNCTION:ENSURE_ERROR_HANDLING - Обеспечение обработки ошибок
    function ensureErrorHandling() {
        console.log('🔍 Настройка обработки ошибок...');
        
        // Глобальный обработчик ошибок JavaScript
        window.addEventListener('error', (event) => {
            console.error('❌ JavaScript Error:', event.error);
            
            if (window.GenesisTerminal && window.GenesisTerminal.log) {
                window.GenesisTerminal.log(`❌ Ошибка: ${event.error.message}`, 'error');
            }
            
            // Не показываем пользователю технические ошибки
            if (event.error.message.includes('undefined') || 
                event.error.message.includes('null')) {
                console.log('🔧 Попытка исправить ошибку автоматически...');
                
                // Попытка перезагрузки основных сервисов
                setTimeout(() => {
                    if (window.cabinetApp && window.cabinetApp.currentUser) {
                        ensureDepositFunctions();
                        ensureCabinetIntegration();
                    }
                }, 1000);
            }
        });
        
        // Обработчик ошибок Promise
        window.addEventListener('unhandledrejection', (event) => {
            console.error('❌ Promise Error:', event.reason);
            
            if (window.GenesisTerminal && window.GenesisTerminal.log) {
                window.GenesisTerminal.log(`❌ Promise ошибка: ${event.reason}`, 'error');
            }
            
            event.preventDefault(); // Предотвращаем вывод в консоль
        });
        
        console.log('✅ Обработка ошибок настроена');
    }
    
    // MCP-MARKER:FUNCTION:ENSURE_UI_FALLBACKS - Обеспечение fallback для UI
    function ensureUIFallbacks() {
        console.log('🔍 Проверка UI fallbacks...');
        
        // Fallback для кнопок создания депозита
        document.addEventListener('click', (event) => {
            const target = event.target;
            
            // Кнопки создания депозита
            if (target.textContent.includes('Создать депозит') || 
                target.textContent.includes('💰') ||
                target.getAttribute('onclick')?.includes('createDeposit')) {
                
                event.preventDefault();
                
                const planId = target.getAttribute('data-plan') || 'starter';
                console.log('💰 Клик по кнопке создания депозита, план:', planId);
                
                if (window.createDeposit) {
                    window.createDeposit(planId);
                } else {
                    alert('💰 Функция создания депозита загружается...\nПопробуйте через несколько секунд.');
                }
            }
            
            // Кнопки просмотра портфеля  
            if (target.textContent.includes('Портфель') || 
                target.textContent.includes('💼')) {
                
                if (window.cabinetApp && window.cabinetApp.navigateTo) {
                    window.cabinetApp.navigateTo('portfolio');
                }
            }
            
            // Кнопки обновления данных
            if (target.textContent.includes('Обновить') || 
                target.textContent.includes('🔄')) {
                
                if (window.refreshPortfolio) {
                    window.refreshPortfolio();
                } else {
                    location.reload();
                }
            }
        });
        
        console.log('✅ UI fallbacks настроены');
    }
    
    // MCP-MARKER:FUNCTION:SHOW_SYSTEM_STATUS - Показ статуса системы
    function showSystemStatus() {
        console.log('📊 Отображение статуса системы...');
        
        const statusInfo = {
            config: !!window.GENESIS_CONFIG,
            api: !!window.GenesisAPI,
            deposits: !!window.EnhancedDepositSystem,
            cabinet: !!window.CabinetDepositService,
            integration: !!window.GenesisCabinet,
            terminal: !!window.GenesisTerminal
        };
        
        const allReady = Object.values(statusInfo).every(status => status);
        
        if (allReady) {
            console.log('✅ Все системы депозитов готовы к работе');
            
            if (window.GenesisTerminal && window.GenesisTerminal.log) {
                window.GenesisTerminal.log('🚀 GENESIS 1.1 - Депозитная система полностью загружена', 'success');
                window.GenesisTerminal.log('💼 Доступно 13 планов депозитов от $25 до $2500', 'info');
                window.GenesisTerminal.log('🔗 BSC блокчейн интеграция активна', 'info');
                window.GenesisTerminal.log('📱 PWA режим поддерживается', 'info');
            }
        } else {
            console.warn('⚠️ Некоторые системы не готовы:', statusInfo);
            
            if (window.GenesisTerminal && window.GenesisTerminal.log) {
                window.GenesisTerminal.log('⚠️ Система загружается... Подождите немного', 'warning');
            }
        }
        
        // Показываем статус в UI если есть соответствующий элемент
        const statusElement = document.getElementById('system-status');
        if (statusElement) {
            statusElement.innerHTML = allReady ? 
                '<span style="color: var(--success-color);">🟢 Система готова</span>' :
                '<span style="color: var(--warning-color);">🔄 Загружается...</span>';
        }
    }
    
    // MCP-MARKER:EXECUTION:RUN_CHECKS - Запуск всех проверок
    console.log('🚀 Запуск финальных проверок GENESIS 1.1...');
    
    try {
        ensureDepositFunctions();
        ensureCabinetIntegration();
        ensureErrorHandling();
        ensureUIFallbacks();
        showSystemStatus();
        
        console.log('✅ Все проверки завершены успешно');
        
        // Показываем готовность системы через 2 секунды
        setTimeout(() => {
            if (window.GenesisTerminal && window.GenesisTerminal.log) {
                window.GenesisTerminal.log('🎯 GENESIS 1.1 готов к использованию!', 'success');
            }
        }, 2000);
        
    } catch (error) {
        console.error('❌ Ошибка при финальной проверке:', error);
        
        if (window.GenesisTerminal && window.GenesisTerminal.log) {
            window.GenesisTerminal.log(`❌ Ошибка проверки: ${error.message}`, 'error');
        }
    }
});

console.log('🔧 Финальная проверка депозитной системы загружена');
