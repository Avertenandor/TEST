// modules/portfolio/portfolio.state.js

export default class PortfolioState {
    constructor() {
        this.deposits = [];
        this.statistics = {
            totalInvested: 0,
            totalEarned: 0,
            totalProfit: 0,
            activeDeposits: 0,
            completedDeposits: 0,
            totalDeposits: 0,
            roi: 0,
            dailyIncome: 0,
            avgDailyIncome: 0,
            projectedMonthly: 0,
            projectedYearly: 0
        };
        this.assetDistribution = {
            USDT: 0,
            PLEX: 0
        };
        this.filter = 'all'; // all, active, completed
        this.viewType = 'cards'; // cards, table
        this.chartPeriod = 'week'; // day, week, month, year
        
        this.load();
    }
    
    // Депозиты
    setDeposits(deposits) {
        this.deposits = deposits || [];
        this.save();
    }
    
    getDeposits() {
        return this.deposits;
    }
    
    getFilteredDeposits() {
        if (this.filter === 'all') {
            return this.deposits;
        }
        
        if (this.filter === 'active') {
            return this.deposits.filter(d => d.status === 'ACTIVE');
        }
        
        if (this.filter === 'completed') {
            return this.deposits.filter(d => d.status === 'COMPLETED');
        }
        
        return this.deposits;
    }
    
    // Статистика
    setStatistics(stats) {
        this.statistics = { ...this.statistics, ...stats };
        this.save();
    }
    
    getStatistics() {
        return this.statistics;
    }
    
    // Распределение активов
    setAssetDistribution(distribution) {
        this.assetDistribution = distribution;
        this.save();
    }
    
    getAssetDistribution() {
        return this.assetDistribution;
    }
    
    // Баланс
    updateBalance(balance) {
        // Обновление баланса если нужно
        this.save();
    }
    
    // Фильтр
    setFilter(filter) {
        this.filter = filter;
        this.save();
    }
    
    getFilter() {
        return this.filter;
    }
    
    // Тип отображения
    setViewType(viewType) {
        this.viewType = viewType;
        this.save();
    }
    
    getViewType() {
        return this.viewType;
    }
    
    // Период графика
    setChartPeriod(period) {
        this.chartPeriod = period;
        this.save();
    }
    
    getChartPeriod() {
        return this.chartPeriod;
    }
    
    // Сохранение и загрузка
    save() {
        try {
            const stateData = {
                deposits: this.deposits,
                statistics: this.statistics,
                assetDistribution: this.assetDistribution,
                filter: this.filter,
                viewType: this.viewType,
                chartPeriod: this.chartPeriod,
                savedAt: new Date().toISOString()
            };
            
            localStorage.setItem('portfolio_state', JSON.stringify(stateData));
        } catch (error) {
            console.error('Failed to save portfolio state:', error);
        }
    }
    
    load() {
        try {
            const saved = localStorage.getItem('portfolio_state');
            if (saved) {
                const stateData = JSON.parse(saved);
                
                this.deposits = stateData.deposits || [];
                this.statistics = stateData.statistics || this.statistics;
                this.assetDistribution = stateData.assetDistribution || this.assetDistribution;
                this.filter = stateData.filter || 'all';
                this.viewType = stateData.viewType || 'cards';
                this.chartPeriod = stateData.chartPeriod || 'week';
            }
        } catch (error) {
            console.error('Failed to load portfolio state:', error);
        }
    }
    
    // Экспорт данных
    export() {
        return {
            deposits: this.deposits,
            statistics: this.statistics,
            assetDistribution: this.assetDistribution,
            exportedAt: new Date().toISOString()
        };
    }
    
    // Очистка
    clear() {
        this.deposits = [];
        this.statistics = {
            totalInvested: 0,
            totalEarned: 0,
            totalProfit: 0,
            activeDeposits: 0,
            completedDeposits: 0,
            totalDeposits: 0,
            roi: 0,
            dailyIncome: 0,
            avgDailyIncome: 0,
            projectedMonthly: 0,
            projectedYearly: 0
        };
        this.assetDistribution = {
            USDT: 0,
            PLEX: 0
        };
        this.filter = 'all';
        this.viewType = 'cards';
        this.chartPeriod = 'week';
        
        localStorage.removeItem('portfolio_state');
    }
}
