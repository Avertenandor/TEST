/**
 * GENESIS 1.1 - Модели данных
 * MCP-MARKER:MODULE:DATA_MODELS - Модели данных
 * MCP-MARKER:FILE:MODELS_JS - Файл моделей данных
 */

// MCP-MARKER:CLASS:USER_MODEL - Модель пользователя
class User {
    constructor(address) {
        this.address = address;
        this.createdAt = new Date();
        this.isAuthorized = false;
        this.balance = 0;
        this.deposits = [];
        this.accessDays = 0;
    }
}

// MCP-MARKER:CLASS:DEPOSIT_MODEL - Модель депозита
class Deposit {
    constructor(id, plan, amount, percentage, days) {
        this.id = id;
        this.plan = plan;
        this.amount = amount;
        this.percentage = percentage;
        this.days = days;
        this.createdAt = new Date();
        this.expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
        this.status = 'active';
        this.earned = 0;
    }
    
    // MCP-MARKER:METHOD:DAILY_PROFIT - Расчет дневной прибыли
    getDailyProfit() {
        return (this.amount * (this.percentage - 100) / 100) / this.days;
    }
    
    // MCP-MARKER:METHOD:TOTAL_PROFIT - Расчет общей прибыли
    getTotalProfit() {
        return this.amount * (this.percentage - 100) / 100;
    }
    
    // MCP-MARKER:METHOD:DAYS_LEFT - Оставшиеся дни
    getDaysLeft() {
        const now = new Date();
        const diff = this.expiresAt - now;
        return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)));
    }
    
    // MCP-MARKER:METHOD:IS_ACTIVE - Проверка активности
    isActive() {
        return this.status === 'active' && this.getDaysLeft() > 0;
    }
}

// MCP-MARKER:CLASS:TRANSACTION_MODEL - Модель транзакции
class Transaction {
    constructor(hash, from, to, value, token = 'BNB') {
        this.hash = hash;
        this.from = from;
        this.to = to;
        this.value = value;
        this.token = token;
        this.timestamp = new Date();
        this.status = 'pending';
        this.confirmations = 0;
    }
}

// MCP-MARKER:CLASS:SYSTEM_DATA_MODEL - Модель системных данных
class SystemData {
    constructor() {
        this.totalUsers = 0;
        this.totalDeposits = 0;
        this.totalVolume = 0;
        this.onlineUsers = 0;
        this.lastUpdate = new Date();
    }
}

// MCP-MARKER:SECTION:MODELS_EXPORT - Экспорт моделей
window.GenesisModels = {
    User,
    Deposit,
    Transaction,
    SystemData
};

console.log('📊 GENESIS MODELS loaded');
