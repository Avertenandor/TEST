                        tx.to.toLowerCase() === this.systemAddress.toLowerCase();
        
        if (isSystem) {
            return isIncoming ? 'earning' : 'deposit';
        }
        return isIncoming ? 'incoming' : 'outgoing';
    }
    
    determineEarningSource(earning) {
        // Определяем источник дохода по сумме или другим параметрам
        if (earning.amount >= 100) {
            return 'deposit_return';
        } else if (earning.amount >= 10) {
            return 'referral_bonus';
        } else {
            return 'daily_reward';
        }
    }
    
    groupTransactionsByDay(transactions) {
        const grouped = {};
        
        for (const tx of transactions) {
            const date = new Date(parseInt(tx.timeStamp) * 1000);
            const dateKey = date.toISOString().split('T')[0];
            
            if (!grouped[dateKey]) {
                grouped[dateKey] = {
                    date: dateKey,
                    volume: 0,
                    count: 0
                };
            }
            
            grouped[dateKey].volume += this.formatAmount(tx.value, tx.tokenDecimal);
            grouped[dateKey].count++;
        }
        
        return Object.values(grouped).sort((a, b) => new Date(a.date) - new Date(b.date));
    }
    
    calculateDiversificationScore(distribution) {
        if (distribution.length === 0) return 0;
        
        // Простая формула: чем равномернее распределение, тем выше score
        const idealPercentage = 100 / distribution.length;
        let totalDeviation = 0;
        
        for (const item of distribution) {
            totalDeviation += Math.abs(item.percentage - idealPercentage);
        }
        
        return Math.max(0, 100 - totalDeviation);
    }
    
    calculateRiskLevel(portfolio) {
        const plexPercentage = portfolio.distribution.find(d => d.asset === 'PLEX')?.percentage || 0;
        
        if (plexPercentage > 70) return 'high';
        if (plexPercentage > 40) return 'medium';
        return 'low';
    }
    
    calculatePerformanceRating(portfolio) {
        // Простая оценка от 0 до 100
        let rating = 50; // Базовый рейтинг
        
        // Бонус за диверсификацию
        rating += portfolio.diversificationScore * 0.2;
        
        // Бонус за объем портфеля
        if (portfolio.totalValue > 10000) rating += 20;
        else if (portfolio.totalValue > 5000) rating += 10;
        else if (portfolio.totalValue > 1000) rating += 5;
        
        // Штраф за высокий риск
        if (portfolio.riskLevel === 'high') rating -= 10;
        
        return Math.min(100, Math.max(0, rating));
    }
    
    calculateGrowthRate(timeline) {
        if (timeline.length < 2) return 0;
        
        // Сортируем по дате
        const sorted = [...timeline].sort((a, b) => a.date - b.date);
        
        // Берем первую и последнюю точки
        const first = sorted[0];
        const last = sorted[sorted.length - 1];
        
        if (first.amount === 0) return 0;
        
        // Рассчитываем процент роста
        return ((last.amount - first.amount) / first.amount) * 100;
    }
    
    // MCP-MARKER:METHOD:ANALYTICS:EMPTY_DATA - Пустые данные для fallback
    
    getEmptyDepositsAnalytics() {
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
    
    getEmptyTransactionsAnalytics() {
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
    
    getEmptyPortfolioAnalytics() {
        return {
            totalValue: 0,
            usdtBalance: 0,
            plexBalance: 0,
            usdtValue: 0,
            plexValue: 0,
            distribution: [],
            diversificationScore: 0,
            riskLevel: 'low',
            performanceRating: 0
        };
    }
    
    getEmptyEarningsAnalytics() {
        return {
            totalEarnings: 0,
            dailyEarnings: 0,
            weeklyEarnings: 0,
            monthlyEarnings: 0,
            yearlyProjection: 0,
            earningsBySource: {},
            earningsTimeline: [],
            growthRate: 0,
            averageDailyIncome: 0
        };
    }
}
