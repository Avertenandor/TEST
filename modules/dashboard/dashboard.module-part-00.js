// modules/dashboard/dashboard.module.js
// Модуль главной панели управления GENESIS DeFi Platform

import DashboardAPI from './dashboard.api.js';
import priceMonitor from '../../shared/services/price-monitor.js';

export default class DashboardModule {
    constructor() {
        this.name = 'dashboard';
        this.version = '1.1.0';
        this.dependencies = ['auth'];
        
        this.container = null;
        this.context = null;
        this.api = null;
        this.subscriptions = [];
        this.updateInterval = null;
        this.autoUpdateTimeout = null; // Отдельный таймер для автообновления
        this.uptimeInterval = null; // Отдельный интервал для uptime
        
        // Флаг загрузки для предотвращения параллельных запросов
        this.dashboardLoading = false;
        this.isDestroyed = false; // Флаг для проверки уничтожен ли модуль
        
        // Состояние дашборда
        this.state = {
            balance: 0,
            balances: {
                bnb: 0,
                plex: 0,
                usdt: 0,
                totalUSD: 0
            },
            deposits: [],
            activeDeposits: 0,
            totalDeposited: 0,
            totalEarnings: 0,
            todayEarnings: 0,
            platformAccessDays: 0,
            lastActivity: [],
            stats: {
                fps: 0,
                ping: 0,
                uptime: 0
            }
        };
    }
    
    async init(context) {
        console.log('📊 Initializing Dashboard Module...');
        
        this.context = context;
        this.container = context.container;
        
        try {
            // 1. Инициализация API
            this.api = new DashboardAPI(window.bscApi);
            
            // 2. Загрузка шаблона
            await this.loadTemplate();
            
            // 3. Загрузка стилей
            await this.loadStyles();
            
            // 4. Инициализация компонентов
            this.initComponents();
            
            // 5. Подписка на события
            this.subscribeToEvents();
            
            // 6. Подписка на обновления цен
            this.subscribeToPriceUpdates();
            
            // 7. Загрузка данных
            await this.loadDashboardData();
            
            // 8. Запуск обновлений
            this.startAutoUpdate();
            
            console.log('✅ Dashboard Module initialized successfully');
            
            return this;
            
        } catch (error) {
            console.error('❌ Failed to initialize Dashboard Module:', error);
            throw error;
        }
    }
    
    async loadTemplate() {
        try {
            const response = await fetch('./modules/dashboard/dashboard.template.html');
            const html = await response.text();
            this.container.innerHTML = html;
        } catch (error) {
            console.error('Failed to load dashboard template:', error);
            this.container.innerHTML = this.getFallbackTemplate();
        }
    }
    
    async loadStyles() {
        const existingLink = document.querySelector(`link[data-module="${this.name}"]`);
        if (existingLink) return;
        
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = './modules/dashboard/dashboard.styles.css';
        link.dataset.module = this.name;
        document.head.appendChild(link);
    }
    
    initComponents() {
        // Инициализация навигации
        this.initNavigation();
        
        // Инициализация быстрых действий
        this.initQuickActions();
        
        // Инициализация статистики
        this.initStats();
        
        // Обновление информации пользователя
        this.updateUserInfo();
    }
    
    initNavigation() {
        // Добавляем обработчики для навигационного меню
        const navLinks = this.container.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                this.navigateToPage(page);
            });
        });
        
        // Мобильное меню
        const mobileToggle = this.container.querySelector('.mobile-menu-toggle');
        if (mobileToggle) {
            mobileToggle.addEventListener('click', () => {
                this.toggleMobileMenu();
            });
        }
    }
    
    initQuickActions() {
        // Кнопка создания депозита
        const createDepositBtn = this.container.querySelector('[data-action="create-deposit"]');
        if (createDepositBtn) {
            createDepositBtn.addEventListener('click', () => {
                this.showCreateDepositModal();
            });
        }
        
        // Кнопка пополнения доступа
        const accessBtn = this.container.querySelector('[data-action="platform-access"]');
        if (accessBtn) {
            accessBtn.addEventListener('click', () => {
                this.showPlatformAccessModal();
            });
        }
        
        // Кнопка аналитики
        const analyticsBtn = this.container.querySelector('[data-action="analytics"]');
        if (analyticsBtn) {
            analyticsBtn.addEventListener('click', () => {
                this.navigateToPage('analytics');
            });
        }
        
        // Кнопка настроек
        const settingsBtn = this.container.querySelector('[data-action="settings"]');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.navigateToPage('settings');
            });
        }
    }
    
    initStats() {
        // Запуск измерения FPS
        this.startFPSMeasurement();
        
        // Измерение пинга
        this.measurePing();
        
        // Обновление времени работы
        this.updateUptime();
    }
    
    async loadDashboardData() {
        // Проверяем флаг загрузки для предотвращения параллельных запросов
        if (this.dashboardLoading) {
            console.log('⚠️ Dashboard already loading, skipping duplicate request');
            return;
        }
        
        this.dashboardLoading = true;
        console.log('📊 Loading dashboard data...');
        
        try {
            // Получаем данные пользователя из store
            const userAddress = this.context.store?.get('user.address');
            const platformAccess = this.context.store?.get('user.platformAccess');
            const accessDays = this.context.store?.get('user.accessDays') || 0;
            
            if (!userAddress) {
                console.warn('No user address found, using demo data');
                this.loadDemoData();
                return;
            }
            
            // Показываем загрузку
            this.showLoadingState();
            
            // Показываем placeholder для пользователя
            this.showPlaceholder('Загружаем данные с блокчейна...');
            
            // Загружаем реальные данные через API с последовательной загрузкой
            const data = await this.api.loadUserData(userAddress, {
                sequential: true,
                onProgress: (stage, partialData) => {
                    console.log(`ℹ️ Partial update: ${stage}`);
                    
                    // Обновляем UI постепенно по мере загрузки данных
                    if (stage === 'deposits') {
                        // Обновляем депозиты
                        this.state.deposits = partialData.deposits;
                        this.state.activeDeposits = partialData.activeDepositsCount;
                        this.state.totalDeposited = partialData.totalDeposited;
                        this.state.totalEarnings = partialData.earnings.total;
                        this.state.todayEarnings = partialData.earnings.today;
                        
                        // Обновляем карточки депозитов
                        this.updateStatCard('active-deposits', this.state.activeDeposits);
                        this.updateStatCard('total-earnings', `${this.state.totalEarnings.toFixed(2)}`);
                        this.updateStatCard('today-earnings', `${this.state.todayEarnings.toFixed(2)}`);
                        this.updateActiveDeposits();
                        
                        this.showPlaceholder('Депозиты загружены. Загружаем балансы...');
                        
                    } else if (stage === 'bnb' || stage === 'plex' || stage === 'usdt') {
                        // Обновляем балансы постепенно
                        this.state.balances = partialData.balances;
                        this.state.balance = partialData.balances.totalUSD;
                        
                        // Обновляем отображение балансов
                        this.updateDetailedBalances();
                        
                        if (stage === 'usdt') {
                            this.hidePlaceholder();
                        }
                    }
                }
            });
            
            // Обновляем финальное состояние
            this.state.balances = data.balances;
            this.state.balance = data.balances.totalUSD;
            this.state.deposits = data.deposits;
            this.state.activeDeposits = data.activeDepositsCount;
            this.state.totalDeposited = data.totalDeposited;
            this.state.totalEarnings = data.earnings.total;
            this.state.todayEarnings = data.earnings.today;
            this.state.platformAccessDays = accessDays;
            
            // Проверяем на наличие ошибок
            if (data.errors && data.errors.length > 0) {
                console.warn('⚠️ Dashboard loaded with errors:', data.errors);
                
                // Показываем уведомление об ошибках, но не блокируем UI
                this.showWarning(`Некоторые данные не удалось загрузить. Ошибок: ${data.errors.length}`);
            }
            
            // Загружаем последнюю активность отдельно (не блокирует основные данные)
            this.api.getRecentTransactions(userAddress, 5)
                .then(transactions => {
                    this.state.lastActivity = transactions;
                    this.updateLastActivity();
                })
                .catch(error => {
                    console.error('Failed to load recent transactions:', error);
                });
            
            // Обновляем UI с финальными данными
            this.updateDashboard();
            
            // Показываем статус доступа к платформе
            this.updatePlatformAccessStatus(platformAccess, accessDays);
            
            // Скрываем загрузку
            this.hideLoadingState();
            
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.hideLoadingState();
            this.hidePlaceholder();
            this.showError(`Ошибка загрузки данных. Попробуйте обновить страницу. ${error.message ? `(${error.message})` : ''}`);
            
            // Показываем кнопку повторной попытки
            this.showRetryButton();
        } finally {
            // Всегда сбрасываем флаг загрузки
            this.dashboardLoading = false;
            console.log('✅ Dashboard loading flag reset');
        }
    }
    
    showPlaceholder(message) {
        const placeholder = this.container.querySelector('.dashboard-placeholder');
        if (placeholder) {
            placeholder.textContent = message;
            placeholder.style.display = 'block';
        } else {
            // Создаем placeholder если его нет
            const newPlaceholder = document.createElement('div');
            newPlaceholder.className = 'dashboard-placeholder';
            newPlaceholder.textContent = message;
            const header = this.container.querySelector('.dashboard-header');
            if (header) {
                header.insertAdjacentElement('afterend', newPlaceholder);
            }
        }
    }
    
    hidePlaceholder() {
        const placeholder = this.container.querySelector('.dashboard-placeholder');
        if (placeholder) {
            placeholder.style.display = 'none';
        }
    }
    
    showWarning(message) {
        if (this.context.eventBus) {
            this.context.eventBus.emit('notification:show', {
                message: message,
                type: 'warning',
                duration: 5000
            });
        }
    }
    
    showRetryButton() {
        const container = this.container.querySelector('.quick-actions');
        if (container && !container.querySelector('.retry-button')) {
            const retryBtn = document.createElement('button');
            retryBtn.className = 'btn btn-warning retry-button';
            retryBtn.innerHTML = '🔄 Повторить загрузку';
            retryBtn.onclick = () => {
                retryBtn.remove();
                this.loadDashboardData();
            };
            container.insertAdjacentElement('afterbegin', retryBtn);
        }
    }
    
    loadDemoData() {
        // Демо данные для неавторизованных пользователей
        this.state.balance = 0;
        this.state.activeDeposits = 0;
        this.state.totalEarnings = 0;
        this.state.todayEarnings = 0;
        this.updateDashboard();
    }
    
    showLoadingState() {
        const loader = this.container.querySelector('.dashboard-loader');
        if (loader) {
            loader.style.display = 'flex';
        }
    }
    
    hideLoadingState() {
        const loader = this.container.querySelector('.dashboard-loader');
        if (loader) {
            loader.style.display = 'none';
        }
    }
    
    showError(message) {
        if (this.context.eventBus) {
            this.context.eventBus.emit('notification:show', {
                message: message,
                type: 'error'
            });
        }
    }
    
    updateDashboard() {
        // Обновление статистических карточек
        this.updateStatCard('total-balance', `${this.state.balance.toFixed(2)}`);
        this.updateStatCard('active-deposits', this.state.activeDeposits);
        this.updateStatCard('total-earnings', `${this.state.totalEarnings.toFixed(2)}`);
        this.updateStatCard('today-earnings', `${this.state.todayEarnings.toFixed(2)}`);
        
        // Обновление детальных балансов
        this.updateDetailedBalances();
        
        // Обновление активных депозитов
        this.updateActiveDeposits();
        
        // Обновление последней активности
        this.updateLastActivity();
    }
    
    updateDetailedBalances() {
        const balancesContainer = this.container.querySelector('#detailed-balances');
        if (balancesContainer) {
            // Получаем актуальные цены
            const bnbPrice = priceMonitor.getPrice('BNB');
            const plexPrice = priceMonitor.getPrice('PLEX');
            const usdtPrice = priceMonitor.getPrice('USDT');
            
            // Рассчитываем USD эквиваленты
            const bnbUSD = this.state.balances.bnb * bnbPrice;
            const plexUSD = this.state.balances.plex * plexPrice;
            const usdtUSD = this.state.balances.usdt * usdtPrice;
            
            // Обновляем общий баланс в USD
            this.state.balances.totalUSD = bnbUSD + plexUSD + usdtUSD;
            this.state.balance = this.state.balances.totalUSD;
            
            balancesContainer.innerHTML = `
                <div class="balance-item">
                    <span class="balance-label">BNB:</span>
                    <span class="balance-value">${this.state.balances.bnb.toFixed(6)}</span>
                    <span class="balance-usd">(${bnbUSD.toFixed(2)})</span>
                </div>
                <div class="balance-item">
                    <span class="balance-label">PLEX:</span>
                    <span class="balance-value">${this.state.balances.plex.toFixed(2)}</span>
                    <span class="balance-usd">(${plexUSD.toFixed(2)})</span>
                </div>
                <div class="balance-item">
                    <span class="balance-label">USDT:</span>
                    <span class="balance-value">${this.state.balances.usdt.toFixed(2)}</span>
                    <span class="balance-usd">(${usdtUSD.toFixed(2)})</span>
                </div>
                <div class="balance-item balance-total">
                    <span class="balance-label">Итого USD:</span>
                    <span class="balance-value-total">${this.state.balances.totalUSD.toFixed(2)}</span>
                </div>
            `;
            
            // Обновляем главную карточку баланса
            this.updateStatCard('total-balance', `${this.state.balances.totalUSD.toFixed(2)}`);
        }
    }
    
    updateStatCard(id, value) {
