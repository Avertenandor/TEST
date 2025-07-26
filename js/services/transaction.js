/**
 * GENESIS 1.1 - Сервис управления транзакциями
 * MCP-MARKER:MODULE:TRANSACTION_SERVICE - Сервис транзакций
 * MCP-MARKER:FILE:TRANSACTION_JS - Файл управления транзакциями
 */

// MCP-MARKER:CLASS:GENESIS_TRANSACTION - Класс управления транзакциями
window.GenesisTransaction = {
    // MCP-MARKER:PROPERTY:TRANSACTIONS - Локальное хранилище транзакций
    transactions: [],
    
    // MCP-MARKER:METHOD:INIT - Инициализация
    init() {
        // Загружаем сохраненные транзакции
        this.loadTransactions();
        console.log('💸 Transaction service initialized');
    },
    
    // MCP-MARKER:METHOD:CREATE_TRANSACTION - Создание транзакции
    async createTransaction(type, data) {
        const transaction = {
            id: this.generateTransactionId(),
            type: type, // 'deposit', 'withdrawal', 'payment', 'bonus'
            data: data,
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        // Добавляем в локальное хранилище
        this.transactions.push(transaction);
        this.saveTransactions();
        
        if (window.GenesisTerminal) {
            window.GenesisTerminal.log(`📝 Создана транзакция: ${type}`, 'info');
        }
        
        return transaction;
    },
    
    // MCP-MARKER:METHOD:UPDATE_TRANSACTION - Обновление транзакции
    updateTransaction(transactionId, updates) {
        const index = this.transactions.findIndex(t => t.id === transactionId);
        if (index !== -1) {
            this.transactions[index] = {
                ...this.transactions[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            this.saveTransactions();
            return this.transactions[index];
        }
        return null;
    },
    
    // MCP-MARKER:METHOD:GET_TRANSACTION - Получение транзакции
    getTransaction(transactionId) {
        return this.transactions.find(t => t.id === transactionId);
    },
    
    // MCP-MARKER:METHOD:GET_USER_TRANSACTIONS - Получение транзакций пользователя
    getUserTransactions(userAddress, type = null) {
        let userTransactions = this.transactions.filter(t => 
            t.data.userAddress?.toLowerCase() === userAddress.toLowerCase()
        );
        
        if (type) {
            userTransactions = userTransactions.filter(t => t.type === type);
        }
        
        return userTransactions.sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
        );
    },
    
    // MCP-MARKER:METHOD:GET_ACTIVE_DEPOSITS - Получение активных депозитов
    getActiveDeposits() {
        const now = new Date();
        return this.transactions.filter(t => {
            if (t.type !== 'deposit' || t.status !== 'success') return false;
            
            const expiresAt = new Date(t.data.expiresAt);
            return expiresAt > now;
        });
    },
    
    // MCP-MARKER:METHOD:CALCULATE_TOTAL_PROFIT - Расчет общей прибыли
    calculateTotalProfit(deposits) {
        return deposits.reduce((total, deposit) => {
            if (deposit.data && deposit.data.returns) {
                const daysPassed = this.calculateDaysPassed(deposit.data.createdAt);
                const dailyProfit = deposit.data.returns.dailyReturn;
                const earnedProfit = Math.min(
                    daysPassed * dailyProfit,
                    deposit.data.returns.totalReturns
                );
                return total + earnedProfit;
            }
            return total;
        }, 0);
    },
    
    // MCP-MARKER:METHOD:CALCULATE_DAYS_PASSED - Расчет прошедших дней
    calculateDaysPassed(startDate) {
        const start = new Date(startDate);
        const now = new Date();
        const diffTime = Math.abs(now - start);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    },
    
    // MCP-MARKER:METHOD:GENERATE_ID - Генерация ID транзакции
    generateTransactionId() {
        return 'tx_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },
    
    // MCP-MARKER:METHOD:SAVE_TRANSACTIONS - Сохранение транзакций
    saveTransactions() {
        try {
            localStorage.setItem('genesis_transactions', JSON.stringify(this.transactions));
        } catch (error) {
            console.error('Error saving transactions:', error);
        }
    },
    
    // MCP-MARKER:METHOD:LOAD_TRANSACTIONS - Загрузка транзакций
    loadTransactions() {
        try {
            const saved = localStorage.getItem('genesis_transactions');
            if (saved) {
                this.transactions = JSON.parse(saved);
            }
        } catch (error) {
            console.error('Error loading transactions:', error);
            this.transactions = [];
        }
    },
    
    // MCP-MARKER:METHOD:CLEAR_TRANSACTIONS - Очистка транзакций
    clearTransactions() {
        this.transactions = [];
        localStorage.removeItem('genesis_transactions');
        console.log('🧹 Transactions cleared');
    },
    
    // MCP-MARKER:METHOD:GET_STATISTICS - Получение статистики
    getStatistics(userAddress = null) {
        let transactions = this.transactions;
        
        if (userAddress) {
            transactions = this.getUserTransactions(userAddress);
        }
        
        const stats = {
            total: transactions.length,
            pending: transactions.filter(t => t.status === 'pending').length,
            success: transactions.filter(t => t.status === 'success').length,
            failed: transactions.filter(t => t.status === 'failed').length,
            deposits: transactions.filter(t => t.type === 'deposit').length,
            withdrawals: transactions.filter(t => t.type === 'withdrawal').length,
            payments: transactions.filter(t => t.type === 'payment').length,
            bonuses: transactions.filter(t => t.type === 'bonus').length
        };
        
        return stats;
    },
    
    // MCP-MARKER:METHOD:EXPORT_TRANSACTIONS - Экспорт транзакций
    exportTransactions(format = 'json') {
        if (format === 'json') {
            return JSON.stringify(this.transactions, null, 2);
        } else if (format === 'csv') {
            // CSV экспорт
            const headers = ['ID', 'Type', 'Status', 'Amount', 'Currency', 'Created', 'Updated'];
            const rows = this.transactions.map(t => [
                t.id,
                t.type,
                t.status,
                t.data.amount || 0,
                t.data.currency || 'USD',
                t.createdAt,
                t.updatedAt
            ]);
            
            const csv = [headers, ...rows]
                .map(row => row.join(','))
                .join('\n');
                
            return csv;
        }
        
        return null;
    }
};

// MCP-MARKER:INITIALIZATION:AUTO_INIT - Автоматическая инициализация
document.addEventListener('DOMContentLoaded', () => {
    window.GenesisTransaction.init();
});

console.log('💸 GENESIS TRANSACTION SERVICE loaded');
