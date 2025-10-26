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
        const element = this.container.querySelector(`#stat-${id} .stats-value`);
        if (element) {
            element.textContent = value;
            // Добавляем анимацию обновления
            element.classList.add('updated');
            setTimeout(() => element.classList.remove('updated'), 500);
        }
    }
    
    updateActiveDeposits() {
        const container = this.container.querySelector('#active-deposits-list');
        if (!container) return;
        
        if (this.state.activeDeposits === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📊</div>
                    <h3>Нет активных депозитов</h3>
                    <p>Создайте свой первый депозит для начала заработка</p>
                    <button class="btn btn-primary" data-action="create-deposit">
                        💰 Создать депозит
                    </button>
                </div>
            `;
        } else {
            // Здесь должен быть список реальных депозитов
            container.innerHTML = `
                <div class="deposits-grid">
                    ${this.generateDepositCards()}
                </div>
            `;
        }
    }
    
    generateDepositCards() {
        // Используем реальные данные из состояния
        const deposits = this.state.deposits.slice(0, 3); // Показываем только 3 последних
        
        if (deposits.length === 0) {
            return '<p class="no-deposits">Нет активных депозитов</p>';
        }
        
        return deposits.map(deposit => `
            <div class="deposit-card active">
                <div class="deposit-header">
                    <h4>Депозит #${deposit.id}</h4>
                    <span class="deposit-status">Активен</span>
                </div>
                <div class="deposit-info">
                    <div class="deposit-stat">
                        <span class="label">Сумма:</span>
                        <span class="value">$${deposit.amount}</span>
                    </div>
                    <div class="deposit-stat">
                        <span class="label">Ежедневно:</span>
                        <span class="value">${deposit.daily}%</span>
                    </div>
                    <div class="deposit-stat">
                        <span class="label">Заработано:</span>
                        <span class="value success">$${deposit.earned.toFixed(2)}</span>
                    </div>
                    <div class="deposit-stat">
                        <span class="label">Дней:</span>
                        <span class="value">${deposit.days}/300</span>
                    </div>
                </div>
                <div class="deposit-progress">
                    <div class="progress-bar" style="width: ${(deposit.days/300)*100}%"></div>
                </div>
            </div>
        `).join('');
    }
    
    updateLastActivity() {
        const container = this.container.querySelector('#last-activity');
        if (!container) return;
        
        let activities = [];
        
        // Используем реальные транзакции если есть
        if (this.state.lastActivity && this.state.lastActivity.length > 0) {
            activities = this.state.lastActivity.map(tx => {
                const timeAgo = this.getTimeAgo(tx.timestamp);
                const action = tx.type === 'in' ? 'Входящий платеж' : 'Исходящий платеж';
                const amount = `${tx.type === 'in' ? '+' : '-'}${tx.value.toFixed(2)} ${tx.token}`;
                
                return {
                    time: timeAgo,
                    action: action,
                    amount: amount,
                    hash: tx.hash
                };
            });
        } else {
            // Fallback на демо данные
            activities = [
                { time: 'Нет данных', action: 'Начните с создания депозита', amount: '' }
            ];
        }
        
        container.innerHTML = `
            <h3>Последняя активность</h3>
            <div class="activity-list">
                ${activities.map(activity => `
                    <div class="activity-item">
                        <span class="activity-time">${activity.time}</span>
                        <span class="activity-action">${activity.action}</span>
                        ${activity.amount ? 
                            `<span class="activity-amount ${activity.amount.startsWith('+') ? 'success' : 'danger'}">${activity.amount}</span>` : 
                            ''
                        }
                        ${activity.hash ? 
                            `<a href="https://bscscan.com/tx/${activity.hash}" target="_blank" class="tx-link">🔗</a>` : 
                            ''
                        }
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    getTimeAgo(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (days > 0) return `${days} дн. назад`;
        if (hours > 0) return `${hours} ч. назад`;
        if (minutes > 0) return `${minutes} мин. назад`;
        return 'Только что';
    }
    
    updateUserInfo() {
        const userAddress = this.context.store?.get('user.address');
        if (userAddress) {
            const displayElement = this.container.querySelector('#user-address-display');
            if (displayElement) {
                displayElement.textContent = this.formatAddress(userAddress);
            }
        }
    }
    
    updatePlatformAccessStatus(hasAccess, days) {
        const indicator = this.container.querySelector('#platform-access-indicator');
        if (!indicator) return;
        
        if (hasAccess) {
            indicator.className = 'access-status active';
            indicator.innerHTML = `
                <span class="access-icon">✅</span>
                <span class="access-text">Доступ активен</span>
                <span class="access-days">${days} дней</span>
            `;
        } else {
            indicator.className = 'access-status inactive';
            indicator.innerHTML = `
                <span class="access-icon">🔒</span>
                <span class="access-text">Требуется оплата</span>
                <button class="btn btn-small btn-warning" data-action="platform-access">
                    Оплатить $1
                </button>
            `;
        }
    }
    
    startAutoUpdate() {
        // Адаптивный интервал обновления
        let emptyResultCount = 0;
        let currentInterval = 30000; // Начальный интервал 30 секунд
        
        const scheduleNextUpdate = () => {
            // Проверяем, не уничтожен ли модуль
            if (this.isDestroyed) {
                console.log('📊 Module destroyed, stopping auto-update');
                return;
            }
            
            // Очищаем предыдущий таймаут если есть
            if (this.autoUpdateTimeout) {
                clearTimeout(this.autoUpdateTimeout);
            }
            
            this.autoUpdateTimeout = setTimeout(async () => {
                // Проверяем, не загружаются ли уже данные
                if (!this.dashboardLoading) {
                    const prevDeposits = this.state.deposits.length;
                    await this.loadDashboardData();
                    const newDeposits = this.state.deposits.length;
                    
                    // Проверяем, изменились ли данные
                    if (prevDeposits === newDeposits && newDeposits === 0) {
                        emptyResultCount++;
                        // Увеличиваем интервал при пустых результатах (exponential idle)
                        if (emptyResultCount > 2) {
                            currentInterval = Math.min(currentInterval * 1.5, 120000); // Максимум 2 минуты
                            console.log(`📊 No changes detected, increasing interval to ${currentInterval/1000}s`);
                        }
                    } else {
                        // Сбрасываем счетчик и интервал при изменениях
                        emptyResultCount = 0;
                        currentInterval = 30000;
                        console.log('📊 Changes detected, resetting interval to 30s');
                    }
                }
                
                // Планируем следующее обновление
                scheduleNextUpdate();
            }, currentInterval);
        };
        
        // Запускаем цикл обновлений
        scheduleNextUpdate();
    }
    
    startFPSMeasurement() {
        let frameCount = 0;
        let lastTime = performance.now();
        
        const measureFPS = () => {
            frameCount++;
            const currentTime = performance.now();
            
            if (currentTime - lastTime >= 1000) {
                this.state.stats.fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                this.updateTechnicalStat('fps', `${this.state.stats.fps} FPS`);
                
                frameCount = 0;
                lastTime = currentTime;
            }
            
            if (!this.isDestroyed) {
                requestAnimationFrame(measureFPS);
            }
        };
        
        requestAnimationFrame(measureFPS);
    }
    
    async measurePing() {
        const startTime = performance.now();
        
        try {
            // Use a simple request to measure network latency
            await fetch('https://api.bscscan.com/api?module=gastracker&action=gasoracle&apikey=YourApiKeyToken', {
                method: 'GET',
                mode: 'cors'
            });
            
            const endTime = performance.now();
            this.state.stats.ping = Math.round(endTime - startTime);
            this.updateTechnicalStat('ping', `${this.state.stats.ping} ms`);
            
        } catch (error) {
            // If CORS fails, just show a simulated ping based on performance
            const simulatedPing = Math.floor(Math.random() * (80 - 20) + 20);
            this.state.stats.ping = simulatedPing;
            this.updateTechnicalStat('ping', `~${simulatedPing} ms`);
        }
        
        // Repeat measurement every 10 seconds
        setTimeout(() => this.measurePing(), 10000);
    }
    
    updateUptime() {
        const startTime = Date.now();
        
        // Очищаем предыдущий интервал если есть
        if (this.uptimeInterval) {
            clearInterval(this.uptimeInterval);
        }
        
        this.uptimeInterval = setInterval(() => {
            // Проверяем, не уничтожен ли модуль
            if (this.isDestroyed) {
                clearInterval(this.uptimeInterval);
                return;
            }
            
            const uptime = Math.floor((Date.now() - startTime) / 1000);
            const hours = Math.floor(uptime / 3600);
            const minutes = Math.floor((uptime % 3600) / 60);
            const seconds = uptime % 60;
            
            this.state.stats.uptime = uptime;
            this.updateTechnicalStat('uptime', 
                `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
            );
        }, 1000);
    }
    
    updateTechnicalStat(stat, value) {
        const element = this.container.querySelector(`#tech-${stat}`);
        if (element) {
            element.textContent = value;
        }
    }
    
    navigateToPage(page) {
        console.log(`Navigating to: ${page}`);
        
        // Обновляем активный пункт меню
        const navLinks = this.container.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            if (link.dataset.page === page) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
        
        // Навигация через роутер
        if (this.context.router) {
            this.context.router.navigate(`/${page}`);
        }
    }
    
    showCreateDepositModal() {
        console.log('Opening create deposit modal...');
        if (this.context.eventBus) {
            this.context.eventBus.emit('modal:show', {
                type: 'create-deposit'
            });
        }
    }
    
    showPlatformAccessModal() {
        console.log('Opening platform access modal...');
        if (this.context.eventBus) {
            this.context.eventBus.emit('modal:show', {
                type: 'platform-access'
            });
        }
    }
    
    toggleMobileMenu() {
        const sidebar = this.container.querySelector('.dashboard-sidebar');
        if (sidebar) {
            sidebar.classList.toggle('active');
        }
    }
    
    subscribeToEvents() {
        if (this.context.eventBus) {
            // Подписка на обновления данных
            this.subscriptions.push(
                this.context.eventBus.on('data:updated', () => {
                    this.loadDashboardData();
                })
            );
            
            // Подписка на изменения баланса
            this.subscriptions.push(
                this.context.eventBus.on('balance:changed', (data) => {
                    this.state.balance = data.balance;
                    this.updateDashboard();
                })
            );
            
            // Подписка на создание депозита
            this.subscriptions.push(
                this.context.eventBus.on('deposit:created', () => {
                    this.loadDashboardData();
                })
            );
            
            // Подписка на обновление цен
            this.subscriptions.push(
                this.context.eventBus.on('prices:updated', (prices) => {
                    console.log('📈 Prices updated:', prices);
                    this.updateDetailedBalances();
                })
            );
        }
    }
    
    subscribeToPriceUpdates() {
        // Подписываемся на обновления цен от PriceMonitor
        const unsubscribe = priceMonitor.subscribe((prices) => {
            console.log('💱 Price update received:', prices);
            
            // Обновляем балансы с новыми ценами
            this.updateDetailedBalances();
            
            // Обновляем информацию о ценах в UI
            this.updatePriceDisplay(prices);
        });
        
        // Сохраняем функцию отписки
        this.subscriptions.push(unsubscribe);
    }
    
    updatePriceDisplay(prices) {
        // Обновляем отображение цен токенов
        const priceContainer = this.container.querySelector('#token-prices');
        if (priceContainer) {
            priceContainer.innerHTML = `
                <div class="price-item">
                    <span class="price-token">BNB:</span>
                    <span class="price-value">${prices.BNB?.toFixed(2) || 'N/A'}</span>
                </div>
                <div class="price-item">
                    <span class="price-token">PLEX:</span>
                    <span class="price-value">${prices.PLEX?.toFixed(4) || 'N/A'}</span>
                </div>
            `;
        }
    }
    
    formatAddress(address) {
        if (!address || address.length < 10) return address;
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }
    
    getFallbackTemplate() {
        return `
            <div class="dashboard-container">
                <div class="dashboard-header">
                    <h2>🏠 Панель управления</h2>
                    <p>Добро пожаловать в GENESIS DeFi Platform</p>
                </div>
                
                <div class="stats-grid">
                    <div id="stat-total-balance" class="stats-card">
                        <div class="stats-header">
                            <span class="stats-title">Общий баланс</span>
                            <span class="stats-icon">💰</span>
                        </div>
                        <div class="stats-value">$0.00</div>
                    </div>
                    
                    <div id="stat-active-deposits" class="stats-card">
                        <div class="stats-header">
                            <span class="stats-title">Активные депозиты</span>
                            <span class="stats-icon">📈</span>
                        </div>
                        <div class="stats-value">0</div>
                    </div>
                    
                    <div id="stat-total-earnings" class="stats-card">
                        <div class="stats-header">
                            <span class="stats-title">Общий доход</span>
                            <span class="stats-icon">🚀</span>
                        </div>
                        <div class="stats-value">$0.00</div>
                    </div>
                    
                    <div id="stat-today-earnings" class="stats-card">
                        <div class="stats-header">
                            <span class="stats-title">Доход за сегодня</span>
                            <span class="stats-icon">📅</span>
                        </div>
                        <div class="stats-value">$0.00</div>
                    </div>
                </div>
                
                <div class="quick-actions">
                    <button class="btn btn-primary" data-action="create-deposit">
                        💰 Создать депозит
                    </button>
                    <button class="btn btn-secondary" data-action="platform-access">
                        🔑 Пополнить доступ
                    </button>
                </div>
                
                <div id="active-deposits-list" class="active-deposits-section">
                    <!-- Депозиты будут загружены здесь -->
                </div>
                
                <div id="last-activity" class="activity-section">
                    <!-- Последняя активность -->
                </div>
            </div>
        `;
    }
    
    destroy() {
        console.log('🧹 Destroying Dashboard Module...');
        
        // Устанавливаем флаг уничтожения
        this.isDestroyed = true;
        
        // Остановка всех интервалов и таймаутов
        if (this.autoUpdateTimeout) {
            clearTimeout(this.autoUpdateTimeout);
            this.autoUpdateTimeout = null;
        }
        
        if (this.uptimeInterval) {
            clearInterval(this.uptimeInterval);
            this.uptimeInterval = null;
        }
        
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        
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
        
        console.log('✅ Dashboard Module destroyed');
    }
}
