// modules/deposits/deposits.module.js
import DepositsAPI from './deposits.api.js';
import DepositsState from './deposits.state.js';
import QRGenerator from '../../shared/services/qr-generator.js';

export default class DepositsModule {
    constructor() {
        this.name = 'deposits';
        this.version = '1.0.0';
        this.dependencies = ['auth', 'platform-access'];
        
        this.state = null;
        this.api = null;
        this.components = new Map();
        this.subscriptions = [];
        this.container = null;
        this.context = null;
    }
    
    async init(context) {
        this.context = context;
        this.container = context.container;
        
        try {
            // Инициализация состояния
            this.state = new DepositsState();
            
            // Инициализация API
            this.api = new DepositsAPI(context.config);
            
            // Загрузка шаблона
            await this.loadTemplate();
            
            // Загрузка стилей
            await this.loadStyles();
            
            // Инициализация компонентов
            this.initComponents();
            
            // Инициализация обработчиков событий
            this.initEventHandlers();
            
            // Подписка на события
            this.subscribeToEvents();
            
            // Загрузка данных
            await this.loadData();
            
            // Первичный рендеринг
            this.render();
            
            console.log('✅ Deposits module initialized');
            return this;
        } catch (error) {
            console.error('❌ Failed to initialize deposits module:', error);
            throw error;
        }
    }
    
    async loadTemplate() {
        try {
            const response = await fetch('/modules/deposits/deposits.template.html');
            const html = await response.text();
            this.container.innerHTML = html;
        } catch (error) {
            console.error('Failed to load deposits template:', error);
            this.container.innerHTML = '<div class="error">Не удалось загрузить шаблон депозитов</div>';
        }
    }
    
    async loadStyles() {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/modules/deposits/deposits.styles.css';
        link.dataset.module = this.name;
        document.head.appendChild(link);
    }
    
    initComponents() {
        // Инициализация подкомпонентов будет здесь
        // Например: DepositCard, DepositModal, QRGenerator и т.д.
    }
    
    initEventHandlers() {
        // Обработчики для карточек депозитов
        const depositCards = this.container.querySelectorAll('.deposit-card');
        depositCards.forEach(card => {
            card.addEventListener('click', this.handleDepositCardClick.bind(this));
        });
        
        // Обработчик для модального окна создания депозита
        const modal = this.container.querySelector('#deposit-modal');
        if (modal) {
            const closeBtn = modal.querySelector('.modal-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.closeDepositModal());
            }
            
            // Обработчик выбора валюты
            const currencyButtons = modal.querySelectorAll('.currency-selector button');
            currencyButtons.forEach(btn => {
                btn.addEventListener('click', (e) => this.selectCurrency(e.target.dataset.currency));
            });
            
            // Обработчик подтверждения депозита
            const confirmBtn = modal.querySelector('#confirm-deposit');
            if (confirmBtn) {
                confirmBtn.addEventListener('click', () => this.confirmDeposit());
            }
        }
        
        // Обработчик для табов (активные/завершенные депозиты)
        const tabs = this.container.querySelectorAll('.deposits-tabs button');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });
    }
    
    subscribeToEvents() {
        // Подписка на глобальные события
        this.subscriptions.push(
            this.context.eventBus.on('payment:confirmed', this.onPaymentConfirmed.bind(this)),
            this.context.eventBus.on('deposit:created', this.onDepositCreated.bind(this)),
            this.context.eventBus.on('deposit:expired', this.onDepositExpired.bind(this)),
            this.context.eventBus.on('user:balance:updated', this.updateBalanceDisplay.bind(this))
        );
    }
    
    async loadData() {
        try {
            // Загрузка депозитов пользователя
            const userAddress = this.context.store.get('user.address');
            if (!userAddress) {
                console.warn('No user address found');
                return;
            }
            
            // Загрузка активных депозитов
            const activeDeposits = await this.api.getUserActiveDeposits(userAddress);
            this.state.setActiveDeposits(activeDeposits);
            
            // Загрузка истории депозитов
            const depositHistory = await this.api.getUserDepositHistory(userAddress);
            this.state.setDepositHistory(depositHistory);
            
            // Обновление статистики
            this.calculateStatistics();
            
        } catch (error) {
            console.error('Failed to load deposits data:', error);
        }
    }
    
    render() {
        // Рендеринг активных депозитов
        this.renderActiveDeposits();
        
        // Рендеринг карточек планов
        this.renderDepositPlans();
        
        // Обновление статистики
        this.renderStatistics();
    }
    
    renderActiveDeposits() {
        const container = this.container.querySelector('#active-deposits-list');
        if (!container) return;
        
        const activeDeposits = this.state.getActiveDeposits();
        
        if (activeDeposits.length === 0) {
            container.innerHTML = `
                <div class="no-deposits">
                    <i class="icon-info"></i>
                    <p>У вас пока нет активных депозитов</p>
                    <button class="btn btn-primary" onclick="document.querySelector('.deposit-card').click()">
                        Создать первый депозит
                    </button>
                </div>
            `;
            return;
        }
        
        container.innerHTML = activeDeposits.map(deposit => this.renderDepositItem(deposit)).join('');
    }
    
    renderDepositItem(deposit) {
        const progress = this.calculateDepositProgress(deposit);
        const earnings = this.calculateDepositEarnings(deposit);
        
        return `
            <div class="deposit-item" data-deposit-id="${deposit.id}">
                <div class="deposit-item-header">
                    <h4>${deposit.planName}</h4>
                    <span class="deposit-status status-${deposit.status.toLowerCase()}">${deposit.status}</span>
                </div>
                <div class="deposit-item-body">
                    <div class="deposit-info-row">
                        <span>Инвестировано:</span>
                        <strong>${deposit.amount} ${deposit.currency}</strong>
                    </div>
                    <div class="deposit-info-row">
                        <span>Заработано:</span>
                        <strong class="text-success">+${earnings.toFixed(2)} ${deposit.currency}</strong>
                    </div>
                    <div class="deposit-info-row">
                        <span>Прогресс:</span>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                        <span>${progress}%</span>
                    </div>
                    <div class="deposit-info-row">
                        <span>Осталось дней:</span>
                        <strong>${deposit.daysRemaining}</strong>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderDepositPlans() {
        const container = this.container.querySelector('#deposit-plans-grid');
        if (!container) return;
        
        const plans = window.GENESIS_CONFIG.depositPlans;
        const userDeposits = this.state.getAllDeposits();
        
        container.innerHTML = plans.map(plan => {
            const validation = window.validateDepositSequence(userDeposits, plan.id);
            const isAvailable = validation.allowed || plan.id === 'trial';
            const hasActive = this.state.hasActivePlan(plan.id);
            
            return `
                <div class="deposit-card ${!isAvailable ? 'disabled' : ''} ${hasActive ? 'has-active' : ''}" 
                     data-plan-id="${plan.id}">
                    <div class="deposit-card-header">
                        <h3>${plan.title}</h3>
                        ${plan.id === 'trial' ? '<span class="badge badge-info">ПРОБНЫЙ</span>' : ''}
                        ${plan.order >= 10 ? '<span class="badge badge-premium">ПРЕМИУМ</span>' : ''}
                    </div>
                    <div class="deposit-card-body">
                        <div class="deposit-amount">
                            ${plan.currencies.includes('USDT') ? 
                                `<div class="amount-usdt">$${plan.usdtAmount} USDT</div>` : ''}
                            ${plan.currencies.includes('PLEX') ? 
                                `<div class="amount-plex">${plan.plexAmount} PLEX</div>` : ''}
                        </div>
                        <div class="deposit-details">
                            <div class="detail-row">
                                <span>Прибыль:</span>
                                <strong class="text-success">${plan.percentage}%</strong>
                            </div>
                            <div class="detail-row">
                                <span>Срок:</span>
                                <strong>${plan.days} дней</strong>
                            </div>
                            <div class="detail-row">
                                <span>Доход:</span>
                                <strong class="text-primary">+$${(plan.usdtAmount * plan.percentage / 100 - plan.usdtAmount).toFixed(2)}</strong>
                            </div>
                        </div>
                        <p class="deposit-description">${plan.description}</p>
                        ${!isAvailable ? 
                            `<div class="deposit-locked">
                                <i class="icon-lock"></i>
                                <span>${validation.message}</span>
                            </div>` : 
                            hasActive ? 
                            `<button class="btn btn-success" disabled>
                                <i class="icon-check"></i> Активен
                            </button>` :
                            `<button class="btn btn-primary">
                                Инвестировать
                            </button>`
                        }
                    </div>
                </div>
            `;
        }).join('');
    }
    
    renderStatistics() {
        const stats = this.state.getStatistics();
        
        // Обновление общей статистики
        const totalInvested = this.container.querySelector('#total-invested');
        if (totalInvested) {
            totalInvested.textContent = `$${stats.totalInvested.toFixed(2)}`;
        }
        
        const totalEarned = this.container.querySelector('#total-earned');
        if (totalEarned) {
            totalEarned.textContent = `$${stats.totalEarned.toFixed(2)}`;
        }
        
        const activeCount = this.container.querySelector('#active-deposits-count');
        if (activeCount) {
            activeCount.textContent = stats.activeDepositsCount;
        }
        
        const dailyIncome = this.container.querySelector('#daily-income');
        if (dailyIncome) {
            dailyIncome.textContent = `$${stats.dailyIncome.toFixed(2)}`;
        }
    }
    
    handleDepositCardClick(event) {
        const card = event.currentTarget;
        const planId = card.dataset.planId;
        
        if (card.classList.contains('disabled')) {
            this.showNotification('Этот план пока недоступен', 'warning');
            return;
        }
        
        if (card.classList.contains('has-active')) {
            this.showNotification('У вас уже есть активный депозит этого плана', 'info');
            return;
        }
        
        this.openDepositModal(planId);
    }
    
    openDepositModal(planId) {
        const plan = window.getDepositPlanById(planId);
        if (!plan) return;
        
        const modal = this.container.querySelector('#deposit-modal');
        if (!modal) return;
        
        // Заполнение данных в модальном окне
        modal.querySelector('.modal-title').textContent = `Создание депозита: ${plan.title}`;
        modal.querySelector('#deposit-plan-name').textContent = plan.title;
        modal.querySelector('#deposit-amount-usdt').textContent = `$${plan.usdtAmount}`;
        modal.querySelector('#deposit-amount-plex').textContent = `${plan.plexAmount} PLEX`;
        modal.querySelector('#deposit-percentage').textContent = `${plan.percentage}%`;
        modal.querySelector('#deposit-days').textContent = `${plan.days} дней`;
        modal.querySelector('#deposit-expected-profit').textContent = 
            `$${(plan.usdtAmount * plan.percentage / 100 - plan.usdtAmount).toFixed(2)}`;
        
        // Показ доступных валют
        const currencySelector = modal.querySelector('.currency-selector');
        currencySelector.innerHTML = plan.currencies.map(currency => `
            <button class="currency-btn" data-currency="${currency}">
                ${currency}
            </button>
        `).join('');
        
        // Установка первой валюты по умолчанию
        this.selectCurrency(plan.currencies[0]);
        
        // Сохранение текущего плана
        this.state.setCurrentPlan(plan);
        
        // Показ модального окна
        modal.classList.add('show');
    }
    
    closeDepositModal() {
        const modal = this.container.querySelector('#deposit-modal');
        if (modal) {
            modal.classList.remove('show');
            this.state.setCurrentPlan(null);
        }
    }
    
    selectCurrency(currency) {
        const plan = this.state.getCurrentPlan();
        if (!plan) return;
        
        // Обновление выбранной валюты
        this.state.setSelectedCurrency(currency);
        
        // Обновление UI
        const buttons = this.container.querySelectorAll('.currency-btn');
        buttons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.currency === currency);
        });
        
        // Генерация адреса для оплаты и QR кода
        this.generatePaymentDetails(plan, currency);
    }
    
    async generatePaymentDetails(plan, currency) {
        const systemAddress = window.GENESIS_CONFIG.addresses.system;
        const amount = currency === 'USDT' ? plan.usdtAmount : plan.plexAmount;
        
        // Обновление адреса и суммы
        const addressElement = this.container.querySelector('#payment-address');
        if (addressElement) {
            addressElement.textContent = systemAddress;
        }
        
        const amountElement = this.container.querySelector('#payment-amount');
        if (amountElement) {
            amountElement.textContent = `${amount} ${currency}`;
        }
        
        // Генерация QR кода с реальным генератором
        const qrContainer = this.container.querySelector('#payment-qr');
        if (qrContainer) {
            try {
                // Показываем загрузку
                qrContainer.innerHTML = '<div class="qr-loading">Генерация QR кода...</div>';
                
                // Используем импортированный QRGenerator
                await QRGenerator.generatePaymentQR(qrContainer, systemAddress, amount, currency);
                
                console.log('✅ QR код успешно сгенерирован для депозита');
                
            } catch (error) {
                console.error('Ошибка генерации QR кода:', error);
                // QRGenerator уже показывает fallback, но добавим дополнительную информацию
                const fallback = qrContainer.querySelector('.qr-fallback');
                if (fallback) {
                    fallback.innerHTML += `
                        <div class="deposit-info">
                            <p>План: <strong>${plan.title}</strong></p>
                            <p>Сеть: <strong>BSC (BEP-20)</strong></p>
                        </div>
                    `;
                }
            }
        }
    }
    
    async confirmDeposit() {
        const plan = this.state.getCurrentPlan();
        const currency = this.state.getSelectedCurrency();
        
        if (!plan || !currency) {
            this.showNotification('Ошибка: не выбран план или валюта', 'error');
            return;
        }
        
        try {
            // Показываем индикатор загрузки
            this.showLoader();
            
            // Создание депозита
            const deposit = await this.api.createDeposit({
                planId: plan.id,
                currency: currency,
                amount: currency === 'USDT' ? plan.usdtAmount : plan.plexAmount,
                userAddress: this.context.store.get('user.address')
            });
            
            // Сохранение в состоянии
            this.state.addActiveDeposit(deposit);
            
            // Закрытие модального окна
            this.closeDepositModal();
            
            // Обновление UI
            this.render();
            
            // Уведомление об успехе
            this.showNotification('Депозит успешно создан! Ожидайте подтверждения оплаты.', 'success');
            
            // Событие для других модулей
            this.context.eventBus.emit('deposit:created', deposit);
            
        } catch (error) {
            console.error('Failed to create deposit:', error);
            this.showNotification('Ошибка создания депозита: ' + error.message, 'error');
        } finally {
            this.hideLoader();
        }
    }
    
    switchTab(tabName) {
        const tabs = this.container.querySelectorAll('.deposits-tabs button');
        const contents = this.container.querySelectorAll('.tab-content');
        
        tabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        
        contents.forEach(content => {
            content.classList.toggle('active', content.dataset.tab === tabName);
        });
        
        // Загрузка данных для выбранной вкладки
        if (tabName === 'history') {
            this.renderDepositHistory();
        }
    }
    
    renderDepositHistory() {
        const container = this.container.querySelector('#deposit-history-list');
        if (!container) return;
        
        const history = this.state.getDepositHistory();
        
        if (history.length === 0) {
            container.innerHTML = '<div class="no-history">История депозитов пуста</div>';
            return;
        }
        
        container.innerHTML = history.map(deposit => `
            <div class="history-item">
                <div class="history-date">${new Date(deposit.createdAt).toLocaleDateString()}</div>
                <div class="history-plan">${deposit.planName}</div>
                <div class="history-amount">${deposit.amount} ${deposit.currency}</div>
                <div class="history-profit text-success">+${deposit.profit} ${deposit.currency}</div>
                <div class="history-status status-${deposit.status.toLowerCase()}">${deposit.status}</div>
            </div>
        `).join('');
    }
    
    calculateStatistics() {
        const activeDeposits = this.state.getActiveDeposits();
        const history = this.state.getDepositHistory();
        
        let totalInvested = 0;
        let totalEarned = 0;
        let dailyIncome = 0;
        
        // Расчет по активным депозитам
        activeDeposits.forEach(deposit => {
            const usdAmount = deposit.currency === 'USDT' ? 
                deposit.amount : 
                window.convertPlexToUSD(deposit.amount);
            
            totalInvested += usdAmount;
            
            const plan = window.getDepositPlanById(deposit.planId);
            if (plan) {
                dailyIncome += (usdAmount * plan.percentage / 100) / plan.days;
            }
        });
        
        // Расчет по истории
        history.forEach(deposit => {
            if (deposit.status === 'COMPLETED') {
                totalEarned += deposit.profit || 0;
            }
        });
        
        this.state.setStatistics({
            totalInvested,
            totalEarned,
            dailyIncome,
            activeDepositsCount: activeDeposits.length
        });
    }
    
    calculateDepositProgress(deposit) {
        const now = Date.now();
        const created = new Date(deposit.createdAt).getTime();
        const plan = window.getDepositPlanById(deposit.planId);
        
        if (!plan) return 0;
        
        const totalDuration = plan.days * 24 * 60 * 60 * 1000; // в миллисекундах
        const elapsed = now - created;
        
        return Math.min(100, Math.floor((elapsed / totalDuration) * 100));
    }
    
    calculateDepositEarnings(deposit) {
        const progress = this.calculateDepositProgress(deposit);
        const plan = window.getDepositPlanById(deposit.planId);
        
        if (!plan) return 0;
        
        const totalProfit = deposit.amount * (plan.percentage - 100) / 100;
        return totalProfit * progress / 100;
    }
    
    // Обработчики событий
    onPaymentConfirmed(data) {
        if (data.type === 'deposit') {
            this.loadData().then(() => this.render());
        }
    }
    
    onDepositCreated(deposit) {
        this.showNotification(`Депозит ${deposit.planName} успешно создан!`, 'success');
    }
    
    onDepositExpired(deposit) {
        this.showNotification(`Депозит ${deposit.planName} завершен. Прибыль начислена!`, 'info');
        this.loadData().then(() => this.render());
    }
    
    updateBalanceDisplay(balance) {
        // Обновление отображения баланса если нужно
    }
    
    // Утилиты
    showNotification(message, type = 'info') {
        if (this.context && this.context.eventBus) {
            this.context.eventBus.emit('notification:show', { message, type });
        }
    }
    
    showLoader() {
        const loader = document.getElementById('global-loader');
        if (loader) loader.classList.remove('hidden');
    }
    
    hideLoader() {
        const loader = document.getElementById('global-loader');
        if (loader) loader.classList.add('hidden');
    }
    
    // Очистка при выгрузке модуля
    destroy() {
        // Отписка от событий
        this.subscriptions.forEach(unsub => unsub());
        
        // Очистка компонентов
        this.components.forEach(component => {
            if (component.destroy) component.destroy();
        });
        
        // Удаление стилей
        const link = document.querySelector(`link[data-module="${this.name}"]`);
        if (link) link.remove();
        
        // Очистка контейнера
        if (this.container) {
            this.container.innerHTML = '';
        }
        
        // Очистка состояния
        if (this.state) this.state.clear();
        
        console.log('✅ Deposits module destroyed');
    }
}
