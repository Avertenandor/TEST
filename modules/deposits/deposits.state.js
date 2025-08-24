// modules/deposits/deposits.state.js

export default class DepositsState {
    constructor() {
        this.activeDeposits = [];
        this.depositHistory = [];
        this.currentPlan = null;
        this.selectedCurrency = null;
        this.statistics = {
            totalInvested: 0,
            totalEarned: 0,
            dailyIncome: 0,
            activeDepositsCount: 0
        };
        
        // Загрузка сохраненного состояния
        this.load();
    }
    
    // Активные депозиты
    setActiveDeposits(deposits) {
        this.activeDeposits = deposits || [];
        this.save();
    }
    
    getActiveDeposits() {
        return this.activeDeposits;
    }
    
    addActiveDeposit(deposit) {
        this.activeDeposits.push(deposit);
        this.save();
    }
    
    removeActiveDeposit(depositId) {
        this.activeDeposits = this.activeDeposits.filter(d => d.id !== depositId);
        this.save();
    }
    
    updateActiveDeposit(depositId, updates) {
        const deposit = this.activeDeposits.find(d => d.id === depositId);
        if (deposit) {
            Object.assign(deposit, updates);
            this.save();
        }
    }
    
    hasActivePlan(planId) {
        return this.activeDeposits.some(d => d.planId === planId && d.status === 'ACTIVE');
    }
    
    // История депозитов
    setDepositHistory(history) {
        this.depositHistory = history || [];
        this.save();
    }
    
    getDepositHistory() {
        return this.depositHistory;
    }
    
    addToHistory(deposit) {
        this.depositHistory.push(deposit);
        this.save();
    }
    
    getAllDeposits() {
        // Объединяем активные и историю
        const allDeposits = [...this.activeDeposits];
        
        // Добавляем из истории те, которых нет в активных
        this.depositHistory.forEach(historyDeposit => {
            if (!allDeposits.find(d => d.id === historyDeposit.id)) {
                allDeposits.push(historyDeposit);
            }
        });
        
        return allDeposits;
    }
    
    // Текущий выбранный план
    setCurrentPlan(plan) {
        this.currentPlan = plan;
    }
    
    getCurrentPlan() {
        return this.currentPlan;
    }
    
    // Выбранная валюта
    setSelectedCurrency(currency) {
        this.selectedCurrency = currency;
    }
    
    getSelectedCurrency() {
        return this.selectedCurrency;
    }
    
    // Статистика
    setStatistics(stats) {
        this.statistics = { ...this.statistics, ...stats };
        this.save();
    }
    
    getStatistics() {
        return this.statistics;
    }
    
    updateStatistic(key, value) {
        if (key in this.statistics) {
            this.statistics[key] = value;
            this.save();
        }
    }
    
    // Поиск депозита
    findDeposit(depositId) {
        return this.activeDeposits.find(d => d.id === depositId) ||
               this.depositHistory.find(d => d.id === depositId);
    }
    
    // Фильтрация депозитов
    getDepositsByStatus(status) {
        return this.getAllDeposits().filter(d => d.status === status);
    }
    
    getDepositsByPlan(planId) {
        return this.getAllDeposits().filter(d => d.planId === planId);
    }
    
    getDepositsByCurrency(currency) {
        return this.getAllDeposits().filter(d => d.currency === currency);
    }
    
    // Расчеты
    calculateTotalInvested() {
        let total = 0;
        
        this.activeDeposits.forEach(deposit => {
            if (deposit.status === 'ACTIVE') {
                const usdAmount = deposit.currency === 'USDT' ? 
                    deposit.amount : 
                    window.convertPlexToUSD(deposit.amount);
                total += usdAmount;
            }
        });
        
        return total;
    }
    
    calculateTotalEarned() {
        let total = 0;
        
        this.depositHistory.forEach(deposit => {
            if (deposit.status === 'COMPLETED' && deposit.profit) {
                const usdProfit = deposit.currency === 'USDT' ? 
                    deposit.profit : 
                    window.convertPlexToUSD(deposit.profit);
                total += usdProfit;
            }
        });
        
        return total;
    }
    
    calculateDailyIncome() {
        let daily = 0;
        
        this.activeDeposits.forEach(deposit => {
            if (deposit.status === 'ACTIVE') {
                const plan = window.getDepositPlanById(deposit.planId);
                if (plan) {
                    const usdAmount = deposit.currency === 'USDT' ? 
                        deposit.amount : 
                        window.convertPlexToUSD(deposit.amount);
                    
                    const totalProfit = usdAmount * (plan.percentage - 100) / 100;
                    daily += totalProfit / plan.days;
                }
            }
        });
        
        return daily;
    }
    
    // Валидация
    canCreateDeposit(planId) {
        // Проверяем последовательность
        const validation = window.validateDepositSequence(this.getAllDeposits(), planId);
        
        // Проверяем, нет ли уже активного депозита этого плана
        if (this.hasActivePlan(planId)) {
            return {
                allowed: false,
                reason: 'У вас уже есть активный депозит этого плана'
            };
        }
        
        return {
            allowed: validation.allowed,
            reason: validation.message
        };
    }
    
    // Сохранение и загрузка состояния
    save() {
        try {
            const stateData = {
                activeDeposits: this.activeDeposits,
                depositHistory: this.depositHistory,
                statistics: this.statistics,
                savedAt: new Date().toISOString()
            };
            
            localStorage.setItem('deposits_state', JSON.stringify(stateData));
        } catch (error) {
            console.error('Failed to save deposits state:', error);
        }
    }
    
    load() {
        try {
            const saved = localStorage.getItem('deposits_state');
            if (saved) {
                const stateData = JSON.parse(saved);
                
                this.activeDeposits = stateData.activeDeposits || [];
                this.depositHistory = stateData.depositHistory || [];
                this.statistics = stateData.statistics || this.statistics;
                
                // Проверяем актуальность данных (обновляем если старше часа)
                const savedAt = new Date(stateData.savedAt).getTime();
                const now = Date.now();
                const hourAgo = now - (60 * 60 * 1000);
                
                if (savedAt < hourAgo) {
                    this.updateExpiredDeposits();
                }
            }
        } catch (error) {
            console.error('Failed to load deposits state:', error);
        }
    }
    
    // Обновление истекших депозитов
    updateExpiredDeposits() {
        const now = Date.now();
        const expiredDeposits = [];
        
        this.activeDeposits = this.activeDeposits.filter(deposit => {
            if (deposit.status !== 'ACTIVE') return true;
            
            const plan = window.getDepositPlanById(deposit.planId);
            if (!plan) return false;
            
            const activatedAt = deposit.activatedAt || deposit.createdAt;
            const expiryTime = new Date(activatedAt).getTime() + (plan.days * 24 * 60 * 60 * 1000);
            
            if (expiryTime <= now) {
                // Депозит истек
                deposit.status = 'COMPLETED';
                deposit.completedAt = new Date().toISOString();
                deposit.profit = deposit.amount * (plan.percentage - 100) / 100;
                
                expiredDeposits.push(deposit);
                this.addToHistory(deposit);
                
                return false; // Удаляем из активных
            }
            
            return true; // Оставляем в активных
        });
        
        // Уведомляем о завершенных депозитах
        expiredDeposits.forEach(deposit => {
            if (window.eventBus) {
                window.eventBus.emit('deposit:expired', deposit);
            }
        });
        
        if (expiredDeposits.length > 0) {
            this.save();
        }
    }
    
    // Очистка состояния
    clear() {
        this.activeDeposits = [];
        this.depositHistory = [];
        this.currentPlan = null;
        this.selectedCurrency = null;
        this.statistics = {
            totalInvested: 0,
            totalEarned: 0,
            dailyIncome: 0,
            activeDepositsCount: 0
        };
        
        localStorage.removeItem('deposits_state');
    }
    
    // Экспорт данных (для отладки)
    export() {
        return {
            activeDeposits: this.activeDeposits,
            depositHistory: this.depositHistory,
            statistics: this.statistics,
            exportedAt: new Date().toISOString()
        };
    }
    
    // Импорт данных (для отладки)
    import(data) {
        if (data.activeDeposits) this.activeDeposits = data.activeDeposits;
        if (data.depositHistory) this.depositHistory = data.depositHistory;
        if (data.statistics) this.statistics = data.statistics;
        
        this.save();
    }
}
