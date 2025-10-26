// modules/analytics/analytics.state.js
// MCP-MARKER:MODULE:ANALYTICS:STATE - Управление состоянием аналитики

export default class AnalyticsState {
    constructor() {
        // Данные аналитики
        this.depositsData = null;
        this.transactionsData = null;
        this.portfolioData = null;
        this.earningsData = null;
        
        // Настройки отображения
        this.period = 'month'; // day, week, month, year, all
        this.chartType = 'line'; // line, bar, doughnut, area
        this.enabledMetrics = new Set(['total-invested', 'total-earned', 'roi', 'active-deposits']);
        
        // Кэшированные метрики
        this.cachedMetrics = null;
        this.lastUpdateTime = null;
        
        // Цели и достижения
        this.goals = {
            monthlyEarnings: 1000,
            totalInvestment: 10000,
            roi: 150,
            referrals: 10
        };
        
        // Пользовательские настройки
        this.preferences = {
            currency: 'USD',
            dateFormat: 'DD.MM.YYYY',
            showProjections: true,
            autoRefresh: true,
            refreshInterval: 60000
        };
    }
    
    // MCP-MARKER:METHOD:ANALYTICS:STATE:LOAD - Загрузка состояния
    async load() {
        try {
            const saved = localStorage.getItem('analytics_state');
            if (saved) {
                const data = JSON.parse(saved);
                
                // Восстанавливаем настройки
                this.period = data.period || this.period;
                this.chartType = data.chartType || this.chartType;
                this.enabledMetrics = new Set(data.enabledMetrics || [...this.enabledMetrics]);
                this.goals = { ...this.goals, ...(data.goals || {}) };
                this.preferences = { ...this.preferences, ...(data.preferences || {}) };
                
                // Восстанавливаем данные если они свежие (менее 5 минут)
                if (data.lastUpdateTime && Date.now() - data.lastUpdateTime < 300000) {
                    this.depositsData = data.depositsData;
                    this.transactionsData = data.transactionsData;
                    this.portfolioData = data.portfolioData;
                    this.earningsData = data.earningsData;
                    this.cachedMetrics = data.cachedMetrics;
                    this.lastUpdateTime = data.lastUpdateTime;
                }
            }
        } catch (error) {
            console.error('[AnalyticsState] Ошибка загрузки состояния:', error);
        }
    }
    
    // MCP-MARKER:METHOD:ANALYTICS:STATE:SAVE - Сохранение состояния
    save() {
        try {
            const data = {
                period: this.period,
                chartType: this.chartType,
                enabledMetrics: [...this.enabledMetrics],
                goals: this.goals,
                preferences: this.preferences,
                depositsData: this.depositsData,
                transactionsData: this.transactionsData,
                portfolioData: this.portfolioData,
                earningsData: this.earningsData,
                cachedMetrics: this.cachedMetrics,
                lastUpdateTime: this.lastUpdateTime
            };
            
            localStorage.setItem('analytics_state', JSON.stringify(data));
        } catch (error) {
            console.error('[AnalyticsState] Ошибка сохранения состояния:', error);
        }
    }
    
    // MCP-MARKER:METHOD:ANALYTICS:STATE:SET_DATA - Установка данных
    
    setDepositsData(data) {
        this.depositsData = data;
        this.lastUpdateTime = Date.now();
        this.cachedMetrics = null; // Сброс кэша метрик
        this.save();
    }
    
    setTransactionsData(data) {
        this.transactionsData = data;
        this.lastUpdateTime = Date.now();
        this.cachedMetrics = null;
        this.save();
    }
    
    setPortfolioData(data) {
        this.portfolioData = data;
        this.lastUpdateTime = Date.now();
        this.cachedMetrics = null;
        this.save();
    }
    
    setEarningsData(data) {
        this.earningsData = data;
        this.lastUpdateTime = Date.now();
        this.cachedMetrics = null;
        this.save();
    }
    
    // MCP-MARKER:METHOD:ANALYTICS:STATE:CALCULATE_METRICS - Вычисление метрик
    calculateMetrics() {
        // Используем кэш если он есть и свежий
        if (this.cachedMetrics && Date.now() - this.lastUpdateTime < 60000) {
            return this.cachedMetrics;
        }
        
        const metrics = {
            // Основные метрики
            totalInvested: 0,
            totalEarned: 0,
            totalProfit: 0,
            roi: 0,
            activeDeposits: 0,
            
            // Средние показатели
            avgDepositAmount: 0,
            avgDailyIncome: 0,
            avgROI: 0,
            
            // Прогнозы
            projectedMonthlyEarnings: 0,
            projectedYearlyEarnings: 0,
            
            // Портфель
            portfolioValue: 0,
            usdtBalance: 0,
            plexBalance: 0,
            
            // Транзакции
            totalTransactions: 0,
            totalVolume: 0,
            gasSpent: 0,
            
            // Производительность
            performanceScore: 0,
            riskLevel: 'medium',
            diversificationScore: 0,
            
            // Временные метрики
            dailyEarnings: 0,
            weeklyEarnings: 0,
            monthlyEarnings: 0,
            
            // Рост
            growthRate: 0,
            compoundingRate: 0
        };
        
        // Вычисляем метрики из данных депозитов
        if (this.depositsData) {
            metrics.totalInvested = this.depositsData.totalInvested || 0;
            metrics.activeDeposits = this.depositsData.activeDeposits || 0;
            metrics.avgDepositAmount = metrics.activeDeposits > 0 
                ? metrics.totalInvested / metrics.activeDeposits 
                : 0;
        }
        
        // Вычисляем метрики из данных доходов
        if (this.earningsData) {
            metrics.totalEarned = this.earningsData.totalEarnings || 0;
            metrics.dailyEarnings = this.earningsData.dailyEarnings || 0;
            metrics.weeklyEarnings = this.earningsData.weeklyEarnings || 0;
            metrics.monthlyEarnings = this.earningsData.monthlyEarnings || 0;
            metrics.avgDailyIncome = this.earningsData.averageDailyIncome || 0;
            metrics.projectedMonthlyEarnings = metrics.avgDailyIncome * 30;
            metrics.projectedYearlyEarnings = this.earningsData.yearlyProjection || 0;
            metrics.growthRate = this.earningsData.growthRate || 0;
        }
        
        // Вычисляем метрики портфеля
        if (this.portfolioData) {
            metrics.portfolioValue = this.portfolioData.totalValue || 0;
            metrics.usdtBalance = this.portfolioData.usdtBalance || 0;
            metrics.plexBalance = this.portfolioData.plexBalance || 0;
            metrics.diversificationScore = this.portfolioData.diversificationScore || 0;
            metrics.riskLevel = this.portfolioData.riskLevel || 'medium';
        }
        
        // Вычисляем метрики транзакций
        if (this.transactionsData) {
            metrics.totalTransactions = this.transactionsData.totalTransactions || 0;
            metrics.totalVolume = this.transactionsData.totalVolume || 0;
            metrics.gasSpent = this.transactionsData.gasSpent || 0;
        }
        
        // Вычисляем производные метрики
        metrics.totalProfit = metrics.totalEarned - metrics.totalInvested;
        
        if (metrics.totalInvested > 0) {
            metrics.roi = (metrics.totalProfit / metrics.totalInvested) * 100;
            metrics.avgROI = metrics.roi;
        }
        
        // Вычисляем производительность
        metrics.performanceScore = this.calculatePerformanceScore(metrics);
        
        // Вычисляем сложный процент
        if (metrics.totalInvested > 0 && metrics.monthlyEarnings > 0) {
            metrics.compoundingRate = (metrics.monthlyEarnings / metrics.totalInvested) * 100;
        }
        
        // Кэшируем результат
        this.cachedMetrics = metrics;
        
        return metrics;
    }
    
    // MCP-MARKER:METHOD:ANALYTICS:STATE:CHART_DATA - Данные для графиков
    
    getEarningsChartData() {
        if (!this.earningsData || !this.earningsData.earningsTimeline) {
            return this.getEmptyChartData();
        }
        
        const timeline = this.filterByPeriod(this.earningsData.earningsTimeline);
        const grouped = this.groupByDate(timeline);
        
        return {
            labels: Object.keys(grouped),
            datasets: [{
                label: 'Доходы',
                data: Object.values(grouped).map(items => 
                    items.reduce((sum, item) => sum + item.amount, 0)
                ),
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.1
            }]
        };
    }
    
    getDepositsChartData() {
        if (!this.depositsData) {
            return this.getEmptyChartData();
        }
        
        const planData = this.depositsData.depositsByPlan || {};
        
        return {
            labels: Object.keys(planData),
            datasets: [{
                label: 'Количество депозитов',
                data: Object.values(planData).map(p => p.count),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)'
                ],
                borderWidth: 1
            }]
        };
    }
    
    getPortfolioChartData() {
        if (!this.portfolioData || !this.portfolioData.distribution) {
            return this.getEmptyChartData();
        }
        
        const distribution = this.portfolioData.distribution;
        
        return {
            labels: distribution.map(d => d.asset),
            datasets: [{
                label: 'Распределение активов',
                data: distribution.map(d => d.value),
                backgroundColor: [
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)'
                ],
                borderWidth: 1
            }]
        };
    }
    
    getROIChartData() {
        if (!this.depositsData || !this.depositsData.depositTimeline) {
            return this.getEmptyChartData();
        }
        
        const timeline = this.filterByPeriod(this.depositsData.depositTimeline);
        const roiOverTime = this.calculateROIOverTime(timeline);
        
        return {
            labels: roiOverTime.map(item => item.date),
            datasets: [{
                label: 'ROI (%)',
                data: roiOverTime.map(item => item.roi),
                borderColor: 'rgb(153, 102, 255)',
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                tension: 0.1
            }]
        };
    }
    
    getTransactionsChartData() {
        if (!this.transactionsData || !this.transactionsData.dailyVolume) {
            return this.getEmptyChartData();
        }
        
        const dailyVolume = this.filterByPeriod(this.transactionsData.dailyVolume);
        
        return {
            labels: dailyVolume.map(d => d.date),
            datasets: [{
                label: 'Объем транзакций',
                data: dailyVolume.map(d => d.volume),
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        };
    }
    
    getAllChartsData() {
        return {
            earnings: this.getEarningsChartData(),
            deposits: this.getDepositsChartData(),
            portfolio: this.getPortfolioChartData(),
            roi: this.getROIChartData(),
            transactions: this.getTransactionsChartData()
        };
    }
    
    // MCP-MARKER:METHOD:ANALYTICS:STATE:GETTERS - Геттеры данных
    
    getMetrics() {
        return this.calculateMetrics();
    }
    
    getTopDeposits(limit = 5) {
        if (!this.depositsData || !this.depositsData.topPerformers) {
            return [];
        }
        
        return this.depositsData.topPerformers.slice(0, limit);
    }
    
    getRecentTransactions(limit = 10) {
        // Получаем из localStorage или из API
        const savedTx = localStorage.getItem('recent_transactions');
        if (savedTx) {
            const parsed = JSON.parse(savedTx);
            return parsed.slice(0, limit);
        }
        
        return [];
    }
    
    getLevelProgress() {
        const metrics = this.calculateMetrics();
        const totalInvested = metrics.totalInvested;
        
        // Уровни инвестиций
        const levels = [
            { threshold: 100, level: 1 },
            { threshold: 500, level: 2 },
            { threshold: 1000, level: 3 },
            { threshold: 5000, level: 4 },
            { threshold: 10000, level: 5 },
            { threshold: 25000, level: 6 },
            { threshold: 50000, level: 7 },
            { threshold: 100000, level: 8 }
        ];
        
        let currentLevel = 0;
        let nextThreshold = 100;
        
        for (const level of levels) {
            if (totalInvested >= level.threshold) {
                currentLevel = level.level;
            } else {
                nextThreshold = level.threshold;
                break;
            }
        }
        
        const progress = (totalInvested / nextThreshold) * 100;
        return Math.min(100, progress);
    }
    
    getGoalProgress(goalName) {
        const metrics = this.calculateMetrics();
        const goal = this.goals[goalName];
        
        if (!goal) return 0;
        
        let current = 0;
        switch (goalName) {
            case 'monthlyEarnings':
                current = metrics.monthlyEarnings;
                break;
            case 'totalInvestment':
                current = metrics.totalInvested;
                break;
            case 'roi':
                current = metrics.roi;
                break;
            default:
                current = 0;
        }
        
        const progress = (current / goal) * 100;
        return Math.min(100, progress);
    }
    
    getPeriod() {
        return this.period;
    }
    
    // MCP-MARKER:METHOD:ANALYTICS:STATE:SETTERS - Сеттеры
    
    setPeriod(period) {
        this.period = period;
        this.save();
    }
    
