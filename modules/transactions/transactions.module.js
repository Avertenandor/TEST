// modules/transactions/transactions.module.js
// MCP-MARKER:MODULE:TRANSACTIONS:MAIN - Основной класс модуля транзакций

import TransactionsAPI from './transactions.api.js';
import TransactionsState from './transactions.state.js';
import TransactionList from './components/transaction-list.js';
import TransactionFilter from './components/transaction-filter.js';
import TransactionExport from './components/transaction-export.js';

export default class TransactionsModule {
    constructor() {
        this.name = 'transactions';
        this.version = '1.0.0';
        this.dependencies = ['auth', 'platform-access'];
        
        this.state = null;
        this.api = null;
        this.components = new Map();
        this.subscriptions = [];
        this.updateInterval = null;
    }
    
    // MCP-MARKER:METHOD:TRANSACTIONS:INIT - Инициализация модуля
    async init(context) {
        this.context = context;
        this.container = context.container;
        
        try {
            // Инициализация состояния
            this.state = new TransactionsState();
            await this.state.load();
            
            // Инициализация API
            this.api = new TransactionsAPI(context.config);
            
            // Загрузка шаблона
            await this.loadTemplate();
            
            // Загрузка стилей
            await this.loadStyles();
            
            // Инициализация компонентов
            this.initComponents();
            
            // Инициализация обработчиков событий
            this.initEventHandlers();
            
            // Подписка на глобальные события
            this.subscribeToEvents();
            
            // Загрузка данных транзакций
            await this.loadTransactions();
            
            // Запуск автоматического обновления
            this.startAutoUpdate();
            
            return this;
            
        } catch (error) {
            console.error('[TransactionsModule] Ошибка инициализации:', error);
            this.showError('Ошибка загрузки модуля транзакций');
            throw error;
        }
    }
    
    // MCP-MARKER:METHOD:TRANSACTIONS:LOAD_TEMPLATE - Загрузка HTML шаблона
    async loadTemplate() {
        try {
            const response = await fetch('/modules/transactions/transactions.template.html');
            const html = await response.text();
            this.container.innerHTML = html;
        } catch (error) {
            console.error('[TransactionsModule] Ошибка загрузки шаблона:', error);
            throw error;
        }
    }
    
    // MCP-MARKER:METHOD:TRANSACTIONS:LOAD_STYLES - Загрузка стилей модуля
    async loadStyles() {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/modules/transactions/transactions.styles.css';
        link.dataset.module = this.name;
        document.head.appendChild(link);
    }
    
    // MCP-MARKER:METHOD:TRANSACTIONS:INIT_COMPONENTS - Инициализация компонентов
    initComponents() {
        // Список транзакций
        const listContainer = this.container.querySelector('#transaction-list');
        if (listContainer) {
            this.components.set('list', new TransactionList(listContainer, this.state));
        }
        
        // Фильтры
        const filterContainer = this.container.querySelector('#transaction-filter');
        if (filterContainer) {
            const filter = new TransactionFilter(filterContainer);
            filter.onFilterChange = this.handleFilterChange.bind(this);
            this.components.set('filter', filter);
        }
        
        // Экспорт
        const exportContainer = this.container.querySelector('#transaction-export');
        if (exportContainer) {
            const exporter = new TransactionExport(exportContainer, this.state);
            this.components.set('export', exporter);
        }
    }
    
    // MCP-MARKER:METHOD:TRANSACTIONS:INIT_HANDLERS - Инициализация обработчиков
    initEventHandlers() {
        // Кнопка обновления
        const refreshBtn = this.container.querySelector('.btn-refresh');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.handleRefresh());
        }
        
        // Переключение типов транзакций
        const typeButtons = this.container.querySelectorAll('.transaction-type-btn');
        typeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = e.target.dataset.type;
                this.handleTypeChange(type);
            });
        });
        
        // Поиск
        const searchInput = this.container.querySelector('#transaction-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }
    }
    
    // MCP-MARKER:METHOD:TRANSACTIONS:SUBSCRIBE_EVENTS - Подписка на события
    subscribeToEvents() {
        // Подписка на глобальные события
        this.subscriptions.push(
            this.context.eventBus.on('deposit:created', (data) => {
                this.handleNewDeposit(data);
            }),
            
            this.context.eventBus.on('payment:confirmed', (data) => {
                this.handlePaymentConfirmed(data);
            }),
            
            this.context.eventBus.on('withdrawal:completed', (data) => {
                this.handleWithdrawal(data);
            }),
            
            this.context.eventBus.on('user:logout', () => {
                this.handleLogout();
            })
        );
    }
    
    // MCP-MARKER:METHOD:TRANSACTIONS:LOAD_DATA - Загрузка транзакций
    async loadTransactions() {
        try {
            this.showLoader();
            
            // Получаем адрес пользователя
            const userAddress = this.context.store.get('user.address');
            if (!userAddress) {
                throw new Error('Адрес пользователя не найден');
            }
            
            // Загружаем транзакции
            const [deposits, withdrawals, platformPayments] = await Promise.all([
                this.api.getDepositTransactions(userAddress),
                this.api.getWithdrawalTransactions(userAddress),
                this.api.getPlatformPayments(userAddress)
            ]);
            
            // Сохраняем в состояние
            this.state.setDeposits(deposits);
            this.state.setWithdrawals(withdrawals);
            this.state.setPlatformPayments(platformPayments);
            
            // Обновляем UI
            this.updateUI();
            
            // Обновляем статистику
            this.updateStatistics();
            
        } catch (error) {
            console.error('[TransactionsModule] Ошибка загрузки транзакций:', error);
            this.showError('Не удалось загрузить транзакции');
        } finally {
            this.hideLoader();
        }
    }
    
    // MCP-MARKER:METHOD:TRANSACTIONS:UPDATE_UI - Обновление интерфейса
    updateUI() {
        // Обновляем список транзакций
        const list = this.components.get('list');
        if (list) {
            const transactions = this.state.getFilteredTransactions();
            list.render(transactions);
        }
        
        // Обновляем счетчики
        this.updateCounters();
    }
    
    // MCP-MARKER:METHOD:TRANSACTIONS:UPDATE_STATISTICS - Обновление статистики
    updateStatistics() {
        const stats = this.state.getStatistics();
        
        // Общая сумма депозитов
        const totalDepositsEl = this.container.querySelector('#total-deposits');
        if (totalDepositsEl) {
            totalDepositsEl.textContent = `$${stats.totalDeposits.toFixed(2)}`;
        }
        
        // Общая сумма выводов
        const totalWithdrawalsEl = this.container.querySelector('#total-withdrawals');
        if (totalWithdrawalsEl) {
            totalWithdrawalsEl.textContent = `$${stats.totalWithdrawals.toFixed(2)}`;
        }
        
        // Общий доход
        const totalEarningsEl = this.container.querySelector('#total-earnings');
        if (totalEarningsEl) {
            totalEarningsEl.textContent = `$${stats.totalEarnings.toFixed(2)}`;
        }
        
        // Количество транзакций
        const txCountEl = this.container.querySelector('#transaction-count');
        if (txCountEl) {
            txCountEl.textContent = stats.transactionCount;
        }
    }
    
    // MCP-MARKER:METHOD:TRANSACTIONS:UPDATE_COUNTERS - Обновление счетчиков
    updateCounters() {
        const counts = this.state.getTransactionCounts();
        
        // Счетчик депозитов
        const depositsCount = this.container.querySelector('.deposits-count');
        if (depositsCount) {
            depositsCount.textContent = counts.deposits;
        }
        
        // Счетчик выводов
        const withdrawalsCount = this.container.querySelector('.withdrawals-count');
        if (withdrawalsCount) {
            withdrawalsCount.textContent = counts.withdrawals;
        }
        
        // Счетчик платежей за платформу
        const platformCount = this.container.querySelector('.platform-count');
        if (platformCount) {
            platformCount.textContent = counts.platform;
        }
    }
    
    // MCP-MARKER:METHOD:TRANSACTIONS:HANDLE_REFRESH - Обработка обновления
    async handleRefresh() {
        const refreshBtn = this.container.querySelector('.btn-refresh');
        if (refreshBtn) {
            refreshBtn.classList.add('rotating');
        }
        
        await this.loadTransactions();
        
        if (refreshBtn) {
            setTimeout(() => {
                refreshBtn.classList.remove('rotating');
            }, 1000);
        }
        
        this.showNotification('Транзакции обновлены');
    }
    
    // MCP-MARKER:METHOD:TRANSACTIONS:HANDLE_TYPE_CHANGE - Изменение типа транзакций
    handleTypeChange(type) {
        // Обновляем активную кнопку
        const buttons = this.container.querySelectorAll('.transaction-type-btn');
        buttons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.type === type);
        });
        
        // Устанавливаем фильтр
        this.state.setFilter('type', type);
        
        // Обновляем UI
        this.updateUI();
    }
    
    // MCP-MARKER:METHOD:TRANSACTIONS:HANDLE_FILTER_CHANGE - Изменение фильтров
    handleFilterChange(filters) {
        // Применяем фильтры
        Object.entries(filters).forEach(([key, value]) => {
            this.state.setFilter(key, value);
        });
        
        // Обновляем UI
        this.updateUI();
    }
    
    // MCP-MARKER:METHOD:TRANSACTIONS:HANDLE_SEARCH - Поиск транзакций
    handleSearch(query) {
        this.state.setFilter('search', query);
        this.updateUI();
    }
    
    // MCP-MARKER:METHOD:TRANSACTIONS:HANDLE_NEW_DEPOSIT - Обработка нового депозита
    handleNewDeposit(data) {
        // Добавляем транзакцию в список
        const transaction = {
            type: 'deposit',
            amount: data.amount,
            hash: data.hash,
            timestamp: Date.now(),
            status: 'pending'
        };
        
        this.state.addTransaction(transaction);
        this.updateUI();
        
        // Показываем уведомление
        this.showNotification(`Новый депозит: $${data.amount}`);
    }
    
    // MCP-MARKER:METHOD:TRANSACTIONS:HANDLE_PAYMENT_CONFIRMED - Подтверждение платежа
    handlePaymentConfirmed(data) {
        // Обновляем статус транзакции
        this.state.updateTransactionStatus(data.hash, 'confirmed');
        this.updateUI();
    }
    
    // MCP-MARKER:METHOD:TRANSACTIONS:HANDLE_WITHDRAWAL - Обработка вывода
    handleWithdrawal(data) {
        const transaction = {
            type: 'withdrawal',
            amount: data.amount,
            hash: data.hash,
            timestamp: Date.now(),
            status: 'completed'
        };
        
        this.state.addTransaction(transaction);
        this.updateUI();
        
        this.showNotification(`Вывод выполнен: $${data.amount}`);
    }
    
    // MCP-MARKER:METHOD:TRANSACTIONS:START_AUTO_UPDATE - Автоматическое обновление
    startAutoUpdate() {
        // Обновляем каждые 30 секунд
        this.updateInterval = setInterval(() => {
            this.loadTransactions();
        }, 30000);
    }
    
    // MCP-MARKER:METHOD:TRANSACTIONS:STOP_AUTO_UPDATE - Остановка автообновления
    stopAutoUpdate() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }
    
    // MCP-MARKER:METHOD:TRANSACTIONS:HANDLE_LOGOUT - Обработка выхода
    handleLogout() {
        this.stopAutoUpdate();
        this.state.clear();
    }
    
    // MCP-MARKER:METHOD:TRANSACTIONS:SHOW_LOADER - Показать загрузчик
    showLoader() {
        const loader = this.container.querySelector('.transactions-loader');
        if (loader) {
            loader.style.display = 'flex';
        }
    }
    
    // MCP-MARKER:METHOD:TRANSACTIONS:HIDE_LOADER - Скрыть загрузчик
    hideLoader() {
        const loader = this.container.querySelector('.transactions-loader');
        if (loader) {
            loader.style.display = 'none';
        }
    }
    
    // MCP-MARKER:METHOD:TRANSACTIONS:SHOW_ERROR - Показать ошибку
    showError(message) {
        const errorEl = this.container.querySelector('.error-message');
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.style.display = 'block';
            
            setTimeout(() => {
                errorEl.style.display = 'none';
            }, 5000);
        }
    }
    
    // MCP-MARKER:METHOD:TRANSACTIONS:SHOW_NOTIFICATION - Показать уведомление
    showNotification(message) {
        // Используем глобальную систему уведомлений
        if (window.eventBus) {
            window.eventBus.emit('notification:show', {
                message,
                type: 'success'
            });
        }
    }
    
    // MCP-MARKER:METHOD:TRANSACTIONS:DESTROY - Очистка модуля
    destroy() {
        // Останавливаем автообновление
        this.stopAutoUpdate();
        
        // Отписываемся от событий
        this.subscriptions.forEach(unsub => unsub());
        this.subscriptions = [];
        
        // Очищаем компоненты
        this.components.forEach(component => {
            if (component.destroy) {
                component.destroy();
            }
        });
        this.components.clear();
        
        // Удаляем стили
        const link = document.querySelector(`link[data-module="${this.name}"]`);
        if (link) {
            link.remove();
        }
        
        // Очищаем контейнер
        if (this.container) {
            this.container.innerHTML = '';
        }
        
        // Очищаем состояние
        if (this.state) {
            this.state.clear();
        }
    }
}
