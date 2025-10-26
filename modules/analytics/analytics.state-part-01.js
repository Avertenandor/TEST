    setChartType(type) {
        this.chartType = type;
        this.save();
    }
    
    setMetricEnabled(metric, enabled) {
        if (enabled) {
            this.enabledMetrics.add(metric);
        } else {
            this.enabledMetrics.delete(metric);
        }
        this.save();
    }
    
    setGoal(goalName, value) {
        this.goals[goalName] = value;
        this.save();
    }
    
    setPreference(key, value) {
        this.preferences[key] = value;
        this.save();
    }
    
    // MCP-MARKER:METHOD:ANALYTICS:STATE:ADD_DATA - Добавление данных
    
    addDeposit(deposit) {
        if (!this.depositsData) {
            this.depositsData = this.getEmptyDepositsData();
        }
        
        this.depositsData.totalDeposits++;
        this.depositsData.activeDeposits++;
        this.depositsData.totalInvested += deposit.amount;
        
        // Добавляем в timeline
        this.depositsData.depositTimeline.push({
            date: deposit.timestamp || Date.now(),
            amount: deposit.amount,
            plan: deposit.plan
        });
        
        // Обновляем группировку по планам
        const planName = deposit.plan || 'Unknown';
        if (!this.depositsData.depositsByPlan[planName]) {
            this.depositsData.depositsByPlan[planName] = {
                count: 0,
                totalAmount: 0,
                averageAmount: 0
            };
        }
        this.depositsData.depositsByPlan[planName].count++;
        this.depositsData.depositsByPlan[planName].totalAmount += deposit.amount;
        
        this.cachedMetrics = null;
        this.save();
    }
    
    addTransaction(transaction) {
        if (!this.transactionsData) {
            this.transactionsData = this.getEmptyTransactionsData();
        }
        
        this.transactionsData.totalTransactions++;
        this.transactionsData.totalVolume += transaction.amount;
        
        this.cachedMetrics = null;
        this.save();
    }
    
    updateDepositStatus(depositId, status) {
        if (!this.depositsData) return;
        
        if (status === 'matured') {
            this.depositsData.activeDeposits--;
            this.depositsData.maturedDeposits++;
        }
        
        this.cachedMetrics = null;
        this.save();
    }
    
    // MCP-MARKER:METHOD:ANALYTICS:STATE:HELPERS - Вспомогательные методы
    
    filterByPeriod(data) {
        if (!Array.isArray(data)) return [];
        
        const now = Date.now();
        let startTime;
        
        switch (this.period) {
            case 'day':
                startTime = now - 86400000;
                break;
            case 'week':
                startTime = now - 604800000;
                break;
            case 'month':
                startTime = now - 2592000000;
                break;
            case 'year':
                startTime = now - 31536000000;
                break;
            case 'all':
            default:
                return data;
        }
        
        return data.filter(item => {
            const timestamp = item.date || item.timestamp;
            return timestamp >= startTime;
        });
    }
    
    groupByDate(data) {
        const grouped = {};
        
        for (const item of data) {
            const date = new Date(item.date || item.timestamp);
            const dateKey = date.toLocaleDateString('ru-RU');
            
            if (!grouped[dateKey]) {
                grouped[dateKey] = [];
            }
            
            grouped[dateKey].push(item);
        }
        
        return grouped;
    }
    
    calculateROIOverTime(timeline) {
        const roiData = [];
        let totalInvested = 0;
        let totalReturns = 0;
        
        for (const item of timeline) {
            totalInvested += item.amount;
            
            // Симуляция доходности (в реальности нужны данные о выплатах)
            totalReturns += item.amount * 0.1; // 10% для примера
            
            const roi = totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0;
            
            roiData.push({
                date: new Date(item.date).toLocaleDateString('ru-RU'),
                roi: roi.toFixed(2)
            });
        }
        
        return roiData;
    }
    
    calculatePerformanceScore(metrics) {
        let score = 50; // Базовый score
        
        // Факторы, влияющие на score
        if (metrics.roi > 100) score += 20;
        if (metrics.roi > 150) score += 10;
        if (metrics.activeDeposits > 5) score += 10;
        if (metrics.totalInvested > 5000) score += 10;
        if (metrics.diversificationScore > 70) score += 10;
        if (metrics.riskLevel === 'low') score += 5;
        if (metrics.growthRate > 20) score += 10;
        
        // Штрафы
        if (metrics.riskLevel === 'high') score -= 10;
        if (metrics.activeDeposits === 0) score -= 20;
        
        return Math.min(100, Math.max(0, score));
    }
    
    getEmptyChartData() {
        return {
            labels: [],
            datasets: [{
                label: 'Нет данных',
                data: [],
                backgroundColor: 'rgba(200, 200, 200, 0.2)',
                borderColor: 'rgba(200, 200, 200, 1)',
                borderWidth: 1
            }]
        };
    }
    
    getEmptyDepositsData() {
        return {
            totalDeposits: 0,
            activeDeposits: 0,
            maturedDeposits: 0,
            totalInvested: 0,
            totalReturns: 0,
            averageROI: 0,
            depositsByPlan: {},
            depositTimeline: [],
            topPerformers: []
        };
    }
    
    getEmptyTransactionsData() {
        return {
            totalTransactions: 0,
            totalVolume: 0,
            incomingTransactions: 0,
            outgoingTransactions: 0,
            incomingVolume: 0,
            outgoingVolume: 0,
            transactionsByType: {},
            transactionsByToken: {},
            dailyVolume: [],
            gasSpent: 0
        };
    }
    
    // MCP-MARKER:METHOD:ANALYTICS:STATE:CLEAR - Очистка состояния
    clear() {
        this.depositsData = null;
        this.transactionsData = null;
        this.portfolioData = null;
        this.earningsData = null;
        this.cachedMetrics = null;
        this.lastUpdateTime = null;
        
        localStorage.removeItem('analytics_state');
    }
}
