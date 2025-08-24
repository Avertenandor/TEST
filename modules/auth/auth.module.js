// modules/auth/auth.module.js
// Модуль авторизации GENESIS DeFi Platform

import AuthAPI from './auth.api.js';
import AuthState from './auth.state.js';

export default class AuthModule {
    constructor() {
        this.name = 'auth';
        this.version = '1.0.0';
        this.dependencies = [];
        
        this.state = null;
        this.api = null;
        this.container = null;
        this.context = null;
        this.subscriptions = [];
    }
    
    async init(context) {
        console.log('🔐 Initializing Auth Module...');
        
        this.context = context;
        this.container = context.container;
        
        try {
            // 1. Инициализация состояния
            this.state = new AuthState();
            this.state.load();
            
            // 2. Инициализация API
            const config = context.config || window.store.get('config');
            this.api = new AuthAPI(config);
            
            // 3. Загрузка шаблона
            await this.loadTemplate();
            
            // 4. Загрузка стилей
            await this.loadStyles();
            
            // 5. Инициализация обработчиков событий
            this.initEventHandlers();
            
            // 6. Подписка на глобальные события
            this.subscribeToEvents();
            
            // 7. Проверка сохраненной авторизации
            await this.checkSavedAuth();
            
            console.log('✅ Auth Module initialized successfully');
            
            return this;
            
        } catch (error) {
            console.error('❌ Failed to initialize Auth Module:', error);
            throw error;
        }
    }
    
    async loadTemplate() {
        // Если нет контейнера, значит модуль загружен как зависимость
        // В этом случае не нужно загружать шаблон
        if (!this.container) {
            console.log('⚠️ Auth Module loaded as dependency, skipping template loading');
            return;
        }
        
        try {
            const response = await fetch('./modules/auth/auth.template.html');
            const html = await response.text();
            this.container.innerHTML = html;
        } catch (error) {
            console.error('Failed to load auth template:', error);
            // Fallback встроенный шаблон
            this.container.innerHTML = this.getFallbackTemplate();
        }
    }
    
    async loadStyles() {
        // Проверяем, не загружены ли уже стили
        const existingLink = document.querySelector(`link[data-module="${this.name}"]`);
        if (existingLink) return;
        
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = './modules/auth/auth.styles.css';
        link.dataset.module = this.name;
        document.head.appendChild(link);
    }
    
    initEventHandlers() {
        // Если нет контейнера, не инициализируем обработчики
        if (!this.container) {
            return;
        }
        
        // Форма авторизации
        const form = this.container.querySelector('#auth-form');
        if (form) {
            form.addEventListener('submit', this.handleAuth.bind(this));
        }
        
        // ТЕСТОВАЯ КНОПКА ДЛЯ ОТЛАДКИ
        const testBtn = this.container.querySelector('#test-auth-button');
        if (testBtn) {
            testBtn.addEventListener('click', this.handleTestAuth.bind(this));
        }
        
        // Поле ввода адреса
        const input = this.container.querySelector('#wallet-address');
        if (input) {
            // Автозаполнение для тестирования
            input.addEventListener('dblclick', () => {
                input.value = '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD8e';
            });
            
            // Валидация при вводе
            input.addEventListener('input', (e) => {
                const value = e.target.value;
                if (value && !this.isValidBSCAddress(value)) {
                    input.classList.add('invalid');
                } else {
                    input.classList.remove('invalid');
                }
            });
        }
        
        // Кнопка копирования адреса системы
        const copyBtn = this.container.querySelector('.copy-btn');
        if (copyBtn) {
            copyBtn.addEventListener('click', this.copySystemAddress.bind(this));
        }
    }
    
    async handleAuth(e) {
        e.preventDefault();
        
        const addressInput = this.container.querySelector('#wallet-address');
        const submitBtn = this.container.querySelector('#auth-button');
        const errorEl = this.container.querySelector('.error-message');
        
        if (!addressInput || !submitBtn) return;
        
        const address = addressInput.value.trim();
        
        // Валидация адреса
        if (!this.isValidBSCAddress(address)) {
            this.showError('Введите корректный BSC адрес');
            return;
        }
        
        // Блокируем кнопку
        submitBtn.disabled = true;
        submitBtn.textContent = 'Проверка...';
        
        // Скрываем предыдущие ошибки
        if (errorEl) errorEl.style.display = 'none';
        
        try {
            // Проверка оплаты 1 PLEX через API
            const isAuthorized = await this.api.checkAuthorization(address);
            
            if (isAuthorized) {
                // Сохраняем состояние
                this.state.setAuthenticated(address);
                
                // Обновляем глобальное состояние
                if (this.context.store) {
                    this.context.store.set('user.address', address);
                    this.context.store.set('user.authenticated', true);
                }
                
                // Генерируем событие успешной авторизации
                if (this.context.eventBus) {
                    this.context.eventBus.emit('user:authenticated', { address });
                    this.context.eventBus.emit('user:login', { address });
                }
                
                // Показываем уведомление
                this.showSuccess('Авторизация успешна!');
                
                // Переход к панели управления
                setTimeout(() => {
                    if (this.context.router) {
                        this.context.router.navigate('/dashboard');
                    }
                }, 1000);
                
            } else {
                // Пользователь не оплатил 1 PLEX
                this.showError('Для доступа к платформе необходимо оплатить 1 PLEX');
                this.showPaymentInfo();
            }
            
        } catch (error) {
            console.error('Auth error:', error);
            this.showError('Ошибка авторизации. Попробуйте позже.');
        } finally {
            // Разблокируем кнопку
            submitBtn.disabled = false;
            submitBtn.textContent = 'Войти в кабинет';
        }
    }
    
    async handleTestAuth() {
        console.log('🔧 TEST AUTH: Forcing authentication...');
        
        const testAddress = '0x1234567890123456789012345678901234567890';
        
        try {
            // Принудительно устанавливаем авторизацию
            this.state.setAuthenticated(testAddress);
            
            // Обновляем глобальное состояние
            if (window.store) {
                window.store.set('user.address', testAddress);
                window.store.set('user.authenticated', true);
                console.log('🔧 TEST AUTH: Store updated');
            }
            
            // Генерируем событие успешной авторизации
            if (window.eventBus) {
                window.eventBus.emit('user:authenticated', { address: testAddress });
                window.eventBus.emit('user:login', { address: testAddress });
                console.log('🔧 TEST AUTH: Events emitted');
            }
            
            // Скрываем auth модуль
            if (this.container) {
                this.container.style.display = 'none';
                console.log('🔧 TEST AUTH: Auth container hidden');
            }
            
            // Показываем уведомление
            this.showSuccess('ТЕСТ: Авторизация принудительно установлена!');
            
            // Переход к панели управления
            setTimeout(() => {
                if (this.context && this.context.router) {
                    this.context.router.navigate('/');
                    console.log('🔧 TEST AUTH: Navigating to dashboard');
                } else if (window.router) {
                    window.router.navigate('/');
                    console.log('🔧 TEST AUTH: Using global router');
                }
            }, 1000);
            
        } catch (error) {
            console.error('🔧 TEST AUTH ERROR:', error);
        }
    }
    
    async checkSavedAuth() {
        // Проверяем сохраненную авторизацию
        if (this.state.isAuthenticated && this.state.userAddress) {
            console.log('🔐 Found saved authentication for:', this.state.userAddress);
            
            try {
                // Проверяем, что авторизация еще действительна
                const isStillValid = await this.api.checkAuthorization(this.state.userAddress);
                
                if (isStillValid) {
                    // Восстанавливаем авторизацию
                    if (this.context.store) {
                        this.context.store.set('user.address', this.state.userAddress);
                        this.context.store.set('user.authenticated', true);
                    }
                    
                    if (this.context.eventBus) {
                        this.context.eventBus.emit('user:authenticated', { 
                            address: this.state.userAddress,
                            restored: true 
                        });
                    }
                    
                    // Автоматический переход только если это основной модуль (с контейнером)
                    if (this.container && this.context.router) {
                        setTimeout(() => {
                            this.context.router.navigate('/dashboard');
                        }, 500);
                    }
                } else {
                    // Авторизация больше не действительна
                    this.state.clear();
                    console.log('⚠️ Saved authorization is no longer valid');
                }
            } catch (error) {
                console.error('Error checking saved auth:', error);
                this.state.clear();
            }
        }
    }
    
    subscribeToEvents() {
        // Подписка на глобальные события
        if (this.context.eventBus) {
            this.subscriptions.push(
                this.context.eventBus.on('user:logout', () => {
                    this.handleLogout();
                })
            );
            
            this.subscriptions.push(
                this.context.eventBus.on('auth:required', () => {
                    this.showAuthRequired();
                })
            );
        }
    }
    
    handleLogout() {
        // Очищаем состояние
        this.state.clear();
        
        // Показываем форму авторизации
        this.render();
    }
    
    showAuthRequired() {
        this.showError('Требуется авторизация для доступа к этому разделу');
    }
    
    isValidBSCAddress(address) {
        return /^0x[a-fA-F0-9]{40}$/.test(address);
    }
    
    copySystemAddress() {
        const config = this.context.config || window.store.get('config');
        const systemAddress = config.systemAddress || '0x...';
        
        navigator.clipboard.writeText(systemAddress).then(() => {
            this.showSuccess('Адрес скопирован!');
        }).catch(() => {
            this.showError('Не удалось скопировать адрес');
        });
    }
    
    showPaymentInfo() {
        const paymentInfo = this.container.querySelector('.payment-info');
        if (paymentInfo) {
            paymentInfo.style.display = 'block';
            paymentInfo.classList.add('highlight');
            
            // Генерируем QR код для оплаты
            this.generatePaymentQR();
        }
    }
    
    generatePaymentQR() {
        const qrContainer = this.container.querySelector('#payment-qr');
        if (!qrContainer) return;
        
        const config = this.context.config || window.store.get('config');
        const systemAddress = config.systemAddress || '0x...';
        
        // Здесь должна быть генерация QR кода
        // Для примера просто показываем заглушку
        qrContainer.innerHTML = `
            <div class="qr-placeholder">
                <p>QR код для оплаты</p>
                <small>${systemAddress}</small>
            </div>
        `;
    }
    
    showError(message) {
        if (!this.container) {
            console.error('Auth error:', message);
            return;
        }
        
        const errorEl = this.container.querySelector('.error-message');
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.style.display = 'block';
            errorEl.classList.add('shake');
            setTimeout(() => errorEl.classList.remove('shake'), 500);
        }
    }
    
    showSuccess(message) {
        if (!this.container) {
            console.log('Auth success:', message);
            return;
        }
        
        const successEl = this.container.querySelector('.success-message');
        if (successEl) {
            successEl.textContent = message;
            successEl.style.display = 'block';
        } else {
            // Fallback на глобальные уведомления
            if (window.eventBus) {
                window.eventBus.emit('notification:show', {
                    type: 'success',
                    title: 'Успешно',
                    message: message
                });
            }
        }
    }
    
    render() {
        // Перерисовка интерфейса при необходимости
        this.loadTemplate().then(() => {
            this.initEventHandlers();
        });
    }
    
    getFallbackTemplate() {
        // Резервный шаблон на случай ошибки загрузки
        return `
            <div class="auth-screen-content">
                <div class="auth-container">
                    <h2 class="auth-title">🔐 Авторизация</h2>
                    <p class="auth-subtitle">Введите BSC адрес для доступа к кабинету</p>
                    
                    <form id="auth-form" class="auth-form">
                        <div class="form-group">
                            <label for="wallet-address" class="form-label">BSC Адрес:</label>
                            <input type="text" 
                                   id="wallet-address" 
                                   class="form-control" 
                                   placeholder="0x1234567890abcdef..."
                                   autocomplete="off"
                                   required>
                        </div>
                        
                        <div class="error-message" style="display: none;"></div>
                        <div class="success-message" style="display: none;"></div>
                        
                        <button id="auth-button" type="submit" class="btn btn-full">
                            Войти в кабинет
                        </button>
                    </form>
                    
                    <div class="auth-test-info">
                        <p>Для тестирования используйте:</p>
                        <code class="auth-test-code">0x742d35Cc6634C0532925a3b844Bc9e7595f2bD8e</code>
                    </div>
                    
                    <div class="payment-info" style="display: none;">
                        <h3>Инструкция по оплате:</h3>
                        <ol>
                            <li>Отправьте 1 PLEX на адрес системы</li>
                            <li>Дождитесь подтверждения транзакции</li>
                            <li>Введите свой адрес и нажмите "Войти"</li>
                        </ol>
                        
                        <div id="payment-qr" class="qr-code"></div>
                    </div>
                </div>
            </div>
        `;
    }
    
    destroy() {
        console.log('🧹 Destroying Auth Module...');
        
        // Отписка от событий
        this.subscriptions.forEach(unsub => {
            if (typeof unsub === 'function') unsub();
        });
        
        // Удаление стилей
        const link = document.querySelector(`link[data-module="${this.name}"]`);
        if (link) link.remove();
        
        // Очистка контейнера
        if (this.container) {
            this.container.innerHTML = '';
        }
        
        // Очистка состояния (но не сохраненной авторизации)
        // this.state остается для возможности восстановления
        
        console.log('✅ Auth Module destroyed');
    }
}
