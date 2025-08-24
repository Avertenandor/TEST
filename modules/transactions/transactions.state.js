// modules/transactions/transactions.state.js
// MCP-MARKER:MODULE:TRANSACTIONS:STATE - Управление состоянием транзакций

export default class TransactionsState {
    constructor() {
        this.deposits = [];
        this.withdrawals = [];
        this.platformPayments = [];
        this.filters = {
            type: 'all',
            dateFrom: null,
            dateTo: null,
            search: '',
            token: 'all',
            status: 'all'
        };
        this.sortBy = 'date';
        this.sortOrder = 'desc';
    }
    
    // MCP-MARKER:METHOD:TRANSACTIONS:STATE:LOAD - Загрузка состояния из localStorage
    async load() {
        try {
            const saved = localStorage.getItem('transactions_state');
            if (saved) {
                const data = JSON.parse(saved);
                this.deposits = data.deposits || [];
                this.withdrawals = data.withdrawals || [];
                this.platformPayments = data.platformPayments || [];
                this.filters = { ...this.filters, ...(data.filters || {}) };
            }
        } catch (error) {
            console.error('[TransactionsState] Ошибка загрузки состояния:', error);
        }
    }
    
    // MCP-MARKER:METHOD:TRANSACTIONS:STATE:SAVE - Сохранение состояния
    save() {
        try {
            const data = {
                deposits: this.deposits,
                withdrawals: this.withdrawals,
                platformPayments: this.platformPayments,
                filters: this.filters,
                lastUpdate: Date.now()
            };
            localStorage.setItem('transactions_state', JSON.stringify(data));
        } catch (error) {
            console.error('[TransactionsState] Ошибка сохранения состояния:', error);
        }
    }
    
    // MCP-MARKER:METHOD:TRANSACTIONS:STATE:SET_DEPOSITS - Установка депозитов
    setDeposits(deposits) {
        this.deposits = deposits;
        this.save();
    }
    
    // MCP-MARKER:METHOD:TRANSACTIONS:STATE:SET_WITHDRAWALS - Установка выводов
    setWithdrawals(withdrawals) {
        this.withdrawals = withdrawals;
        this.save();
    }
    
    // MCP-MARKER:METHOD:TRANSACTIONS:STATE:SET_PLATFORM - Установка платежей
    setPlatformPayments(payments) {
        this.platformPayments = payments;
        this.save();
    }
    
    // MCP-MARKER:METHOD:TRANSACTIONS:STATE:ADD_TX - Добавление транзакции
    addTransaction(transaction) {
        switch (transaction.type) {
            case 'deposit':
                this.deposits.unshift(transaction);
                break;
            case 'withdrawal':
                this.withdrawals.unshift(transaction);
                break;
            case 'platform':
                this.platformPayments.unshift(transaction);
                break;
        }
        this.save();
    }
    
    // MCP-MARKER:METHOD:TRANSACTIONS:STATE:UPDATE_STATUS - Обновление статуса
    updateTransactionStatus(hash, status) {
        // Обновляем во всех массивах
        const updateInArray = (arr) => {
            const tx = arr.find(t => t.hash === hash);
            if (tx) {
                tx.status = status;
                return true;
            }
            return false;
        };
        
        const updated = updateInArray(this.deposits) ||
                       updateInArray(this.withdrawals) ||
                       updateInArray(this.platformPayments);
        
        if (updated) {
            this.save();
        }
    }
    
    // MCP-MARKER:METHOD:TRANSACTIONS:STATE:SET_FILTER - Установка фильтра
    setFilter(key, value) {
        this.filters[key] = value;
        this.save();
    }
    
    // MCP-MARKER:METHOD:TRANSACTIONS:STATE:GET_ALL - Получение всех транзакций
    getAllTransactions() {
        const all = [
            ...this.deposits.map(t => ({ ...t, category: 'Депозит' })),
            ...this.withdrawals.map(t => ({ ...t, category: 'Вывод' })),
            ...this.platformPayments.map(t => ({ ...t, category: 'Оплата платформы' }))
        ];
        
        // Сортировка по дате
        all.sort((a, b) => b.timestamp - a.timestamp);
        
        return all;
    }
    
    // MCP-MARKER:METHOD:TRANSACTIONS:STATE:GET_FILTERED - Получение отфильтрованных
    getFilteredTransactions() {
        let transactions = [];
        
        // Фильтр по типу
        switch (this.filters.type) {
            case 'deposits':
                transactions = this.deposits.map(t => ({ ...t, category: 'Депозит' }));
                break;
            case 'withdrawals':
                transactions = this.withdrawals.map(t => ({ ...t, category: 'Вывод' }));
                break;
            case 'platform':
                transactions = this.platformPayments.map(t => ({ ...t, category: 'Оплата платформы' }));
                break;
            case 'all':
            default:
                transactions = this.getAllTransactions();
                break;
        }
        
        // Фильтр по дате
        if (this.filters.dateFrom) {
            const fromDate = new Date(this.filters.dateFrom).getTime();
            transactions = transactions.filter(t => t.timestamp >= fromDate);
        }
        
        if (this.filters.dateTo) {
            const toDate = new Date(this.filters.dateTo).getTime() + 86400000; // +1 день
            transactions = transactions.filter(t => t.timestamp <= toDate);
        }
        
        // Фильтр по токену
        if (this.filters.token && this.filters.token !== 'all') {
            transactions = transactions.filter(t => t.token === this.filters.token);
        }
        
        // Фильтр по статусу
        if (this.filters.status && this.filters.status !== 'all') {
            transactions = transactions.filter(t => t.status === this.filters.status);
        }
        
        // Поиск
        if (this.filters.search) {
            const search = this.filters.search.toLowerCase();
            transactions = transactions.filter(t => 
                t.hash.toLowerCase().includes(search) ||
                t.from?.toLowerCase().includes(search) ||
                t.to?.toLowerCase().includes(search) ||
                t.category.toLowerCase().includes(search) ||
                (t.token && t.token.toLowerCase().includes(search))
            );
        }
        
        // Сортировка
        transactions = this.sortTransactions(transactions);
        
        return transactions;
    }
    
    // MCP-MARKER:METHOD:TRANSACTIONS:STATE:SORT - Сортировка транзакций
    sortTransactions(transactions) {
        const sorted = [...transactions];
        
        switch (this.sortBy) {
            case 'date':
                sorted.sort((a, b) => b.timestamp - a.timestamp);
                break;
            case 'amount':
                sorted.sort((a, b) => b.amount - a.amount);
                break;
            case 'type':
                sorted.sort((a, b) => a.type.localeCompare(b.type));
                break;
        }
        
        if (this.sortOrder === 'asc') {
            sorted.reverse();
        }
        
        return sorted;
    }
    
    // MCP-MARKER:METHOD:TRANSACTIONS:STATE:GET_STATISTICS - Получение статистики
    getStatistics() {
        const stats = {
            totalDeposits: 0,
            totalWithdrawals: 0,
            totalPlatformPayments: 0,
            totalEarnings: 0,
            transactionCount: 0,
            avgDepositAmount: 0,
            lastDepositDate: null,
            lastWithdrawalDate: null
        };
        
        // Подсчет депозитов
        stats.totalDeposits = this.deposits.reduce((sum, t) => sum + t.amount, 0);
        stats.avgDepositAmount = this.deposits.length > 0 
            ? stats.totalDeposits / this.deposits.length 
            : 0;
        
        // Подсчет выводов
        stats.totalWithdrawals = this.withdrawals.reduce((sum, t) => sum + t.amount, 0);
        
        // Подсчет платежей за платформу
        stats.totalPlatformPayments = this.platformPayments.reduce((sum, t) => sum + t.amount, 0);
        
        // Общий доход (выводы минус депозиты минус платежи)
        stats.totalEarnings = stats.totalWithdrawals - stats.totalDeposits - stats.totalPlatformPayments;
        
        // Общее количество транзакций
        stats.transactionCount = this.deposits.length + 
                                 this.withdrawals.length + 
                                 this.platformPayments.length;
        
        // Последние даты
        if (this.deposits.length > 0) {
            stats.lastDepositDate = this.deposits[0].timestamp;
        }
        
        if (this.withdrawals.length > 0) {
            stats.lastWithdrawalDate = this.withdrawals[0].timestamp;
        }
        
        return stats;
    }
    
    // MCP-MARKER:METHOD:TRANSACTIONS:STATE:GET_COUNTS - Получение количества
    getTransactionCounts() {
        return {
            deposits: this.deposits.length,
            withdrawals: this.withdrawals.length,
            platform: this.platformPayments.length,
            total: this.deposits.length + this.withdrawals.length + this.platformPayments.length
        };
    }
    
    // MCP-MARKER:METHOD:TRANSACTIONS:STATE:GET_CHART_DATA - Данные для графиков
    getChartData(period = 'week') {
        const now = Date.now();
        const data = {
            labels: [],
            deposits: [],
            withdrawals: [],
            earnings: []
        };
        
        let days = 7;
        if (period === 'month') days = 30;
        if (period === 'year') days = 365;
        
        // Генерируем метки дат
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now - (i * 86400000));
            data.labels.push(date.toLocaleDateString('ru-RU', { 
                day: '2-digit', 
                month: '2-digit' 
            }));
            
            // Начало и конец дня
            const dayStart = new Date(date.setHours(0, 0, 0, 0)).getTime();
            const dayEnd = new Date(date.setHours(23, 59, 59, 999)).getTime();
            
            // Подсчет транзакций за день
            const dayDeposits = this.deposits.filter(t => 
                t.timestamp >= dayStart && t.timestamp <= dayEnd
            ).reduce((sum, t) => sum + t.amount, 0);
            
            const dayWithdrawals = this.withdrawals.filter(t => 
                t.timestamp >= dayStart && t.timestamp <= dayEnd
            ).reduce((sum, t) => sum + t.amount, 0);
            
            data.deposits.push(dayDeposits);
            data.withdrawals.push(dayWithdrawals);
            data.earnings.push(dayWithdrawals - dayDeposits);
        }
        
        return data;
    }
    
    // MCP-MARKER:METHOD:TRANSACTIONS:STATE:EXPORT_DATA - Экспорт данных
    exportData(format = 'csv') {
        const transactions = this.getFilteredTransactions();
        
        if (format === 'csv') {
            return this.exportToCSV(transactions);
        } else if (format === 'json') {
            return this.exportToJSON(transactions);
        }
        
        return null;
    }
    
    // MCP-MARKER:METHOD:TRANSACTIONS:STATE:EXPORT_CSV - Экспорт в CSV
    exportToCSV(transactions) {
        const headers = ['Дата', 'Время', 'Тип', 'Сумма', 'Токен', 'Хеш', 'Статус'];
        const rows = transactions.map(t => {
            const date = new Date(t.timestamp);
            return [
                date.toLocaleDateString('ru-RU'),
                date.toLocaleTimeString('ru-RU'),
                t.category,
                t.amount.toFixed(2),
                t.token,
                t.hash,
                t.status
            ];
        });
        
        const csv = [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');
        
        return csv;
    }
    
    // MCP-MARKER:METHOD:TRANSACTIONS:STATE:EXPORT_JSON - Экспорт в JSON
    exportToJSON(transactions) {
        return JSON.stringify(transactions, null, 2);
    }
    
    // MCP-MARKER:METHOD:TRANSACTIONS:STATE:CLEAR - Очистка состояния
    clear() {
        this.deposits = [];
        this.withdrawals = [];
        this.platformPayments = [];
        this.filters = {
            type: 'all',
            dateFrom: null,
            dateTo: null,
            search: '',
            token: 'all',
            status: 'all'
        };
        localStorage.removeItem('transactions_state');
    }
}
