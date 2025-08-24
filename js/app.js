/**
 * GENESIS 1.1 - Основное приложение
 * MCP-MARKER:MODULE:MAIN_APP - Основное приложение
 * MCP-MARKER:FILE:APP_JS - Основной файл приложения
 */

// Глобальная обработка ошибок
window.addEventListener('error', (event) => {
    console.warn('Global error caught:', event.error);
    // Предотвращаем показ ошибок в консоли для известных проблем
    if (event.error && event.error.message && 
        (event.error.message.includes('Extension context invalidated') ||
         event.error.message.includes('chrome-extension') ||
         event.error.message.includes('moz-extension'))) {
        event.preventDefault();
        return false;
    }
});

window.addEventListener('unhandledrejection', (event) => {
    console.warn('Unhandled promise rejection:', event.reason);
    // Предотвращаем показ ошибок для известных проблем
    if (event.reason && event.reason.toString && 
        (event.reason.toString().includes('Extension context invalidated') ||
         event.reason.toString().includes('Network request failed'))) {
        event.preventDefault();
        return false;
    }
});

// MCP-MARKER:CLASS:GENESIS_APP - Класс основного приложения
window.GenesisApp = {
    version: '1.1',
    initialized: false,
    currentUser: null,
    services: {},
    
    // MCP-MARKER:METHOD:APP_INIT - Инициализация приложения
    async init() {
        console.log('🚀 GENESIS 1.1 - Инициализация...');
        
        try {
            // Показываем экран загрузки
            this.updateLoadingStatus('Загрузка конфигурации...');
            console.log('📱 Экран загрузки активирован');
            
            // Проверяем готовность DOM
            if (document.readyState === 'loading') {
                console.log('⏳ DOM еще загружается, ждем...');
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }
            console.log('✅ DOM готов');
            
            // Инициализируем сервисы
            this.updateLoadingStatus('Загрузка сервисов...');
            await this.initializeServices();
            
            // Проверяем авторизацию
            this.updateLoadingStatus('Проверка авторизации...');
            await this.checkAuthorization();
            
            // Инициализируем UI
            this.updateLoadingStatus('Инициализация интерфейса...');
            this.initializeUI();
            
            // Регистрируем Service Worker
            this.updateLoadingStatus('Регистрация Service Worker...');
            await this.registerServiceWorker();
            
            // Скрываем экран загрузки
            this.updateLoadingStatus('Завершение инициализации...');
            this.hideLoadingScreen();
            
            this.initialized = true;
            console.log('✅ GENESIS 1.1 - Готов к работе!');
            
        } catch (error) {
            console.error('❌ Ошибка инициализации:', error);
            this.showError('Ошибка загрузки приложения');
            
            // В случае ошибки все равно показываем приложение
            setTimeout(() => {
                this.hideLoadingScreen();
            }, 2000);
        }
    },
    
    // MCP-MARKER:METHOD:INIT_SERVICES - Инициализация сервисов
    async initializeServices() {
        this.updateLoadingStatus('Загрузка сервисов...');
        
        // Инициализируем терминал
        if (window.GenesisTerminal) {
            this.services.terminal = window.GenesisTerminal;
            this.services.terminal.init();
        } else {
            console.warn('⚠️ GenesisTerminal не найден, создаем заглушку');
            this.services.terminal = {
                log: (msg, type = 'info') => console.log(`[TERMINAL-${type.toUpperCase()}] ${msg}`),
                init: () => console.log('Terminal fallback initialized')
            };
        }
        
        // MCP-MARKER:PLATFORM_ACCESS_INIT - Инициализация системы доступа
        // Инициализируем систему оплаты доступа к платформе
        if (window.GenesisPlatformAccess) {
            this.services.platformAccess = window.GenesisPlatformAccess;
            await this.services.platformAccess.init();
        } else {
            console.warn('⚠️ GenesisPlatformAccess не найден, создаем заглушку');
            this.services.platformAccess = {
                checkUserAccessBalance: () => Promise.resolve({ isActive: true, daysRemaining: 999 }),
                blockFunctionsIfNoAccess: () => false,
                init: () => Promise.resolve()
            };
        }
        
        // Проверяем GenesisUtils
        if (!window.GenesisUtils) {
            console.warn('⚠️ GenesisUtils не найден, создаем fallback');
            window.GenesisUtils = {
                formatAddress: (addr) => addr ? addr.substring(0, 6) + '...' + addr.slice(-4) : '',
                copyToClipboard: async (text) => {
                    try {
                        await navigator.clipboard.writeText(text);
                        console.log('✅ Скопировано в буфер');
                    } catch (e) {
                        console.error('❌ Ошибка копирования:', e);
                    }
                },
                showToast: (msg, type) => console.log(`[${type.toUpperCase()}] ${msg}`),
                isValidAddress: (addr) => /^0x[a-fA-F0-9]{40}$/.test(addr)
            };
        }
        
        // Инициализируем API сервис
        if (window.GenesisAPI) {
            this.services.api = window.GenesisAPI;
        } else {
            console.warn('⚠️ GenesisAPI не найден, создаем заглушку');
            this.services.api = {
                get: () => Promise.resolve({ data: {} }),
                post: () => Promise.resolve({ data: {} })
            };
        }
        
        // Инициализируем сервис авторизации
        if (window.GenesisAuth) {
            this.services.auth = window.GenesisAuth;
        } else {
            console.warn('⚠️ GenesisAuth не найден, создаем заглушку');
            this.services.auth = {
                validateAddress: (addr) => /^0x[a-fA-F0-9]{40}$/.test(addr),
                checkAuthorization: () => Promise.resolve(false),
                isValidAddress: (addr) => /^0x[a-fA-F0-9]{40}$/.test(addr)
            };
        }
        
        // Инициализируем сервис транзакций
        if (window.GenesisTransaction) {
            this.services.transaction = window.GenesisTransaction;
        } else {
            console.warn('⚠️ GenesisTransaction не найден, создаем заглушку');
            this.services.transaction = {
                getTransactions: () => Promise.resolve([])
            };
        }
        
        console.log('✅ Сервисы инициализированы');
    },
    
    // MCP-MARKER:METHOD:CHECK_AUTH - Проверка авторизации
    async checkAuthorization() {
        this.updateLoadingStatus('Проверка авторизации...');
        
        const savedAddress = localStorage.getItem('genesis_user_address');
        if (savedAddress) {
            try {
                const isValid = await this.services.auth.validateAddress(savedAddress);
                if (isValid) {
                    // Создаем пользователя с fallback для моделей
                    if (window.GenesisModels && window.GenesisModels.User) {
                        this.currentUser = new window.GenesisModels.User(savedAddress);
                    } else {
                        console.warn('⚠️ GenesisModels не найден, создаем простой объект пользователя');
                        this.currentUser = {
                            address: savedAddress,
                            isAuthorized: true,
                            balance: 0,
                            transactions: [],
                            createdAt: new Date(),
                            accessDays: 0,
                            deposits: []
                        };
                    }
                    this.currentUser.isAuthorized = true;
                    console.log('✅ Пользователь авторизован:', savedAddress);
                    
                    // MCP-MARKER:PLATFORM_ACCESS_CHECK - Проверка доступа к платформе
                    // КРИТИЧНО: Проверяем оплаченный доступ к платформе
                    try {
                        this.updateLoadingStatus('Проверка доступа к платформе...');
                        const accessData = await this.services.platformAccess.checkUserAccessBalance(savedAddress);
                        
                        if (accessData.isActive && accessData.daysRemaining > 0) {
                            // Доступ есть - переходим в кабинет
                            this.showAuthorizedUI();
                        } else {
                            // Доступа нет - показываем форму оплаты доступа
                            this.showAccessPaymentRequired(savedAddress);
                        }
                    } catch (error) {
                        console.error('Ошибка проверки доступа:', error);
                        // При ошибке показываем предупреждение, но разрешаем доступ
                        this.showAuthorizedUI();
                    }
                } else {
                    this.showAuthForm();
                }
            } catch (error) {
                console.error('Ошибка проверки авторизации:', error);
                this.showAuthForm();
            }
        } else {
            this.showAuthForm();
        }
    },
    
    // MCP-MARKER:METHOD:INIT_UI - Инициализация UI
    initializeUI() {
        console.log('🎨 Инициализация UI...');
        
        // Инициализируем навигацию
        if (window.GenesisNavigation) {
            console.log('🧭 Инициализируем навигацию...');
            window.GenesisNavigation.init();
        } else {
            console.error('❌ GenesisNavigation не найден!');
        }
        
        // Показываем основное приложение
        const appContainer = document.getElementById('app');
        if (appContainer) {
            appContainer.classList.remove('hidden');
            console.log('✅ Основное приложение показано');
        }
        
        // Навешиваем обработчики событий
        this.attachEventListeners();
        
        // Инициализируем анимации
        this.initAnimations();
        
        // Показываем текущее время
        this.updateSystemTime();
        setInterval(() => this.updateSystemTime(), 1000);
        
        // Обновляем информацию об устройстве
        this.updateDeviceInfo();
        
        console.log('✅ UI инициализирован');
    },
    
    // MCP-MARKER:METHOD:REGISTER_SW - Регистрация Service Worker
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('✅ Service Worker зарегистрирован');
                
                // Проверяем обновления
                registration.addEventListener('updatefound', () => {
                    console.log('🔄 Найдено обновление Service Worker');
                });
            } catch (error) {
                console.error('❌ Ошибка регистрации Service Worker:', error);
            }
        }
    },
    
    // Обработчики событий
    attachEventListeners() {
        // Форма авторизации
        const authForm = document.getElementById('genesis-auth-form');
        if (authForm) {
            authForm.addEventListener('submit', (e) => this.handleAuthSubmit(e));
        }
        
        // Кнопка вставки адреса
        const pasteBtn = document.getElementById('paste-address');
        if (pasteBtn) {
            pasteBtn.addEventListener('click', () => this.pasteAddress());
        }
        
        // Кнопки копирования
        document.querySelectorAll('.genesis-btn-copy').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetId = e.target.onclick.toString().match(/'([^']+)'/)?.[1];
                if (targetId) {
                    if (window.GenesisUtils && window.GenesisUtils.copyToClipboard) {
                        window.GenesisUtils.copyToClipboard(targetId);
                    } else {
                        // Fallback для копирования
                        const element = document.getElementById(targetId);
                        if (element && element.value) {
                            navigator.clipboard.writeText(element.value).then(() => {
                                console.log('✅ Скопировано:', element.value);
                            }).catch(err => {
                                console.error('❌ Ошибка копирования:', err);
                            });
                        }
                    }
                }
            });
        });
    },
    
    // MCP-MARKER:METHOD:HANDLE_AUTH - Обработка авторизации
    async handleAuthSubmit(event) {
        event.preventDefault();
        
        const addressInput = document.getElementById('user-address');
        const address = addressInput.value.trim();
        const submitBtn = document.getElementById('auth-submit');
        
        if (!address || !this.services.auth.isValidAddress(address)) {
            this.showError('Введите корректный BSC адрес');
            return;
        }
        
        // Показываем загрузку
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        
        try {
            // Сохраняем адрес
            localStorage.setItem('genesis_user_address', address);
            if (window.GenesisModels && window.GenesisModels.User) {
                this.currentUser = new window.GenesisModels.User(address);
            } else {
                this.currentUser = { address: address, isAuthorized: false };
            }
            
            // Проверяем авторизацию (оплату 1 PLEX)
            const isAuthorized = await this.services.auth.checkAuthorization(address);
            
            if (isAuthorized) {
                this.currentUser.isAuthorized = true;
                
                // MCP-MARKER:ACCESS_CHECK_ON_AUTH - Проверка доступа при авторизации
                // КРИТИЧНО: После авторизации проверяем доступ к платформе
                try {
                    const accessData = await this.services.platformAccess.checkUserAccessBalance(address);
                    
                    if (accessData.isActive && accessData.daysRemaining > 0) {
                        // Доступ есть - переходим в кабинет
                        this.showAuthorizedUI();
                        this.showSuccess(`Добро пожаловать! Доступ: ${accessData.daysRemaining} дней`);
                    } else {
                        // Доступа нет - показываем оплату доступа
                        this.showAccessPaymentRequired(address);
                    }
                } catch (error) {
                    console.error('Ошибка проверки доступа:', error);
                    // При ошибке разрешаем вход
                    this.showAuthorizedUI();
                    this.showSuccess('Авторизация успешна!');
                }
            } else {
                // Показываем QR код для оплаты авторизации
                this.showPaymentQR();
                this.services.terminal.log('Ожидание оплаты 1 PLEX...', 'warning');
                
                // Запускаем мониторинг оплаты
                this.startPaymentMonitoring(address);
            }
        } catch (error) {
            console.error('Ошибка авторизации:', error);
            this.showError('Ошибка проверки авторизации');
        } finally {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    },
    
    // Вставка адреса из буфера обмена
    async pasteAddress() {
        try {
            const text = await navigator.clipboard.readText();
            const addressInput = document.getElementById('user-address');
            addressInput.value = text;
            addressInput.focus();
        } catch (error) {
            console.error('Ошибка вставки:', error);
            this.showError('Не удалось вставить адрес');
        }
    },
    
    // MCP-MARKER:METHOD:PAYMENT_MONITORING - Мониторинг оплаты
    async startPaymentMonitoring(address) {
        const checkInterval = setInterval(async () => {
            try {
                const isAuthorized = await this.services.auth.checkAuthorization(address);
                if (isAuthorized) {
                    clearInterval(checkInterval);
                    this.currentUser.isAuthorized = true;
                    
                    // MCP-MARKER:ACCESS_CHECK_AFTER_AUTH - Проверка доступа после авторизации
                    // После успешной авторизации проверяем доступ к платформе
                    try {
                        const accessData = await this.services.platformAccess.checkUserAccessBalance(address);
                        
                        if (accessData.isActive && accessData.daysRemaining > 0) {
                            this.showAuthorizedUI();
                            this.showSuccess(`Авторизация успешна! Доступ: ${accessData.daysRemaining} дней`);
                        } else {
                            this.showAccessPaymentRequired(address);
                        }
                    } catch (error) {
                        console.error('Ошибка проверки доступа:', error);
                        this.showAuthorizedUI();
                        this.showSuccess('Оплата получена! Добро пожаловать!');
                    }
                }
            } catch (error) {
                console.error('Ошибка проверки оплаты:', error);
            }
        }, 5000); // Проверяем каждые 5 секунд
        
        // Останавливаем проверку через 10 минут
        setTimeout(() => clearInterval(checkInterval), 600000);
    },
    
    // MCP-MARKER:SECTION:UI_METHODS - Методы UI
    showAuthForm() {
        const authSection = document.getElementById('genesis-auth-section');
        if (authSection) {
            authSection.style.display = 'block';
        }
    },
    
    showAuthorizedUI() {
        // Показываем индикатор загрузки
        const loadingEl = document.createElement('div');
        loadingEl.className = 'genesis-transition-loading';
        loadingEl.innerHTML = `
            <div class="transition-content">
                <div class="spinner"></div>
                <p>Загрузка личного кабинета...</p>
            </div>
        `;
        document.body.appendChild(loadingEl);
        
        // Скрываем форму авторизации
        const authSection = document.getElementById('genesis-auth-section');
        if (authSection) {
            authSection.style.display = 'none';
        }
        
        // Перенаправляем в модульный кабинет с относительным путем и небольшой задержкой для плавности
        setTimeout(() => {
            window.location.href = 'app.html';
        }, 500);
    },
    
    // MCP-MARKER:METHOD:SHOW_ACCESS_PAYMENT - Показать требование оплаты доступа
    showAccessPaymentRequired(userAddress) {
        // Скрываем форму авторизации
        const authSection = document.getElementById('genesis-auth-section');
        if (authSection) {
            authSection.style.display = 'none';
        }
        
        // Показываем экран требования оплаты доступа
        if (this.services.platformAccess && this.services.platformAccess.showPaymentModal) {
            this.services.platformAccess.showPaymentModal(10);
        } else {
            // Fallback - показываем уведомление
            alert('Требуется оплата доступа к платформе: $10-100 USDT');
            this.showAuthForm();
        }
        
        if (this.services.terminal) {
            this.services.terminal.log('⚠️ Требуется оплата доступа к платформе', 'warning');
        }
    },
    
    showPaymentQR() {
        const qrSection = document.getElementById('qr-section');
        if (qrSection) {
            qrSection.style.display = 'block';
            // Генерируем QR код
            const qrContainer = document.getElementById('genesis-qr-code');
            if (qrContainer) {
                if (window.QRCode) {
                    new window.QRCode(qrContainer, {
                        text: window.GENESIS_CONFIG?.addresses?.system || '0x399B22170B0AC7BB20bdC86772BfF478f201fFCD',
                        width: 200,
                        height: 200,
                        colorDark: '#000000',
                        colorLight: '#ffffff',
                        correctLevel: window.QRCode.CorrectLevel.M
                    });
                } else {
                    // Fallback для QR кода
                    console.warn('⚠️ QRCode не найден, показываем текстовую версию');
                    qrContainer.innerHTML = `
                        <div style="width:200px;height:200px;background:#f0f0f0;display:flex;align-items:center;justify-content:center;border-radius:10px;color:#333;text-align:center;font-size:12px;padding:10px;">
                            📱 QR КОД<br><br>
                            ${window.GENESIS_CONFIG?.addresses?.system || '0x399B22170B0AC7BB20bdC86772BfF478f201fFCD'}
                        </div>
                    `;
                }
            }
        }
    },
    
    updateLoadingStatus(message) {
        const statusEl = document.getElementById('loading-status');
        if (statusEl) {
            statusEl.textContent = message;
        }
    },
    
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('genesis-loading');
        const mainApp = document.getElementById('genesis-app');
        
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                
                // Показываем основное приложение
                if (mainApp) {
                    mainApp.classList.remove('hidden-initially');
                    mainApp.style.display = 'block';
                }
            }, 300);
        }
    },
    
    showError(message) {
        if (this.services.terminal) {
            this.services.terminal.log(message, 'error');
        }
        // Можно добавить показ уведомления
    },
    
    showSuccess(message) {
        if (this.services.terminal) {
            this.services.terminal.log(message, 'success');
        }
        // Можно добавить показ уведомления
    },
    
    updateSystemTime() {
        const timeElements = document.querySelectorAll('[data-time]');
        const now = new Date();
        timeElements.forEach(el => {
            el.textContent = now.toLocaleTimeString();
        });
    },
    
    updateDeviceInfo() {
        // Обновляем информацию об устройстве
        if (window.updateTechInfo) {
            window.updateTechInfo();
        }
    },
    
    // Инициализация анимаций
    initAnimations() {
        // Анимация шагов авторизации
        const steps = document.querySelectorAll('.genesis-step-list li');
        let currentStep = 0;
        
        setInterval(() => {
            steps.forEach((step, index) => {
                step.classList.remove('step-active');
                if (index === currentStep) {
                    step.classList.add('step-active');
                }
            });
            currentStep = (currentStep + 1) % steps.length;
        }, 3000);
    },
    
    // MCP-MARKER:METHOD:CHECK_ACCESS_ON_LOAD - Проверка доступа при загрузке
    async checkPlatformAccessOnLoad() {
        const userAddress = localStorage.getItem('genesis_user_address');
        if (userAddress && this.services.platformAccess) {
            try {
                const accessData = await this.services.platformAccess.checkUserAccessBalance(userAddress);
                
                // Блокируем функции если нет доступа
                const isBlocked = this.services.platformAccess.blockFunctionsIfNoAccess();
                
                if (isBlocked) {
                    console.log('🔒 Функции заблокированы - нет доступа к платформе');
                } else {
                    console.log(`✅ Доступ к платформе активен: ${accessData.daysRemaining} дней`);
                }
                
                return accessData;
            } catch (error) {
                console.error('Ошибка проверки доступа при загрузке:', error);
            }
        }
        return null;
    }
};

// Запускаем приложение при загрузке (только на app.html)
document.addEventListener('DOMContentLoaded', () => {
    // Дополнительные предохранители: не инициализировать на главной и иных страницах
    const path = (location && location.pathname) || '';
    const isAppPage = /app\.html$/i.test(path);
    if (!isAppPage || window.GENESIS_LANDING === true) {
        console.log('⏭️ GenesisApp init skipped on this page');
        return;
    }

    window.GenesisApp.init();
    
    // MCP-MARKER:ACCESS_CHECK_DOM_READY - Проверка доступа при готовности DOM
    // Дополнительная проверка доступа при готовности DOM
    setTimeout(() => {
        window.GenesisApp.checkPlatformAccessOnLoad();
    }, 2000);
});

// Экспортируем для глобального доступа
window.Genesis = window.GenesisApp;

console.log('🎮 GENESIS APP loaded');
