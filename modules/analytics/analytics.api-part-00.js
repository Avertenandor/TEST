// modules/analytics/analytics.api.js
// MCP-MARKER:MODULE:ANALYTICS:API - API для получения данных аналитики

export default class AnalyticsAPI {
    constructor(config) {
        this.config = config;
        this.bscApiKey = config.api?.bscScanKey || '';
        this.baseUrl = 'https://api.bscscan.com/api';
        
        // Адреса контрактов
        this.contracts = {
            USDT: config.contracts?.USDT || '0x55d398326f99059fF775485246999027B3197955',
            PLEX: config.contracts?.PLEX_ONE || '0x3a9c659Fe09C67dE2eC5e37ea66b6e15Bb5a2617'
        };
        
        // Системный адрес
        this.systemAddress = config.systemAddress || '0x476566104Ff0071b726fa988c96C396417bC0E12';
        
        // Планы депозитов из конфигурации
        this.depositPlans = config.depositPlans || [];
    }
    
    // MCP-MARKER:METHOD:ANALYTICS:GET_DEPOSITS - Получение аналитики депозитов
    async getDepositsAnalytics(userAddress) {
        try {
            const analytics = {
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
            
            // Получаем историю депозитов
            const deposits = await this.getUserDeposits(userAddress);
            
            // Обрабатываем каждый депозит
            for (const deposit of deposits) {
                analytics.totalDeposits++;
                analytics.totalInvested += deposit.amount;
                
                // Определяем статус депозита
                const isActive = this.isDepositActive(deposit);
                if (isActive) {
                    analytics.activeDeposits++;
                } else {
                    analytics.maturedDeposits++;
                    analytics.totalReturns += deposit.returns || 0;
                }
                
                // Группировка по планам
                const planName = deposit.plan || 'Unknown';
                if (!analytics.depositsByPlan[planName]) {
                    analytics.depositsByPlan[planName] = {
                        count: 0,
                        totalAmount: 0,
                        averageAmount: 0
                    };
                }
                analytics.depositsByPlan[planName].count++;
                analytics.depositsByPlan[planName].totalAmount += deposit.amount;
                
                // Добавляем в timeline
                analytics.depositTimeline.push({
                    date: deposit.timestamp,
                    amount: deposit.amount,
                    plan: planName
                });
            }
            
            // Вычисляем средние показатели
            if (analytics.totalInvested > 0) {
                analytics.averageROI = ((analytics.totalReturns / analytics.totalInvested) * 100).toFixed(2);
            }
            
            // Вычисляем средние для каждого плана
            Object.keys(analytics.depositsByPlan).forEach(plan => {
                const planData = analytics.depositsByPlan[plan];
                planData.averageAmount = planData.totalAmount / planData.count;
            });
            
            // Сортируем timeline по дате
            analytics.depositTimeline.sort((a, b) => b.date - a.date);
            
            // Определяем топ депозиты
            analytics.topPerformers = deposits
                .filter(d => d.returns > 0)
                .sort((a, b) => b.returns - a.returns)
                .slice(0, 5);
            
            return analytics;
            
        } catch (error) {
            console.error('[AnalyticsAPI] Ошибка получения аналитики депозитов:', error);
            return this.getEmptyDepositsAnalytics();
        }
    }
    
    // MCP-MARKER:METHOD:ANALYTICS:GET_TRANSACTIONS - Получение аналитики транзакций
    async getTransactionsAnalytics(userAddress) {
        try {
            const analytics = {
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
            
            // Получаем транзакции USDT
            const usdtTx = await this.getTokenTransactions(this.contracts.USDT, userAddress);
            
            // Получаем транзакции PLEX
            const plexTx = await this.getTokenTransactions(this.contracts.PLEX, userAddress);
            
            // Объединяем и обрабатываем
            const allTransactions = [...usdtTx, ...plexTx];
            
            for (const tx of allTransactions) {
                const amount = this.formatAmount(tx.value, tx.tokenDecimal);
                const isIncoming = tx.to.toLowerCase() === userAddress.toLowerCase();
                
                analytics.totalTransactions++;
                analytics.totalVolume += amount;
                
                if (isIncoming) {
                    analytics.incomingTransactions++;
                    analytics.incomingVolume += amount;
                } else {
                    analytics.outgoingTransactions++;
                    analytics.outgoingVolume += amount;
                }
                
                // Группировка по типам
                const txType = this.determineTransactionType(tx, userAddress);
                if (!analytics.transactionsByType[txType]) {
                    analytics.transactionsByType[txType] = {
                        count: 0,
                        volume: 0
                    };
                }
                analytics.transactionsByType[txType].count++;
                analytics.transactionsByType[txType].volume += amount;
                
                // Группировка по токенам
                const token = tx.tokenSymbol;
                if (!analytics.transactionsByToken[token]) {
                    analytics.transactionsByToken[token] = {
                        count: 0,
                        volume: 0
                    };
                }
                analytics.transactionsByToken[token].count++;
                analytics.transactionsByToken[token].volume += amount;
                
                // Подсчет газа
                if (tx.gasUsed && tx.gasPrice) {
                    analytics.gasSpent += (tx.gasUsed * tx.gasPrice) / 1e18;
                }
            }
            
            // Группировка по дням для графика объема
            analytics.dailyVolume = this.groupTransactionsByDay(allTransactions);
            
            return analytics;
            
        } catch (error) {
            console.error('[AnalyticsAPI] Ошибка получения аналитики транзакций:', error);
            return this.getEmptyTransactionsAnalytics();
        }
    }
    
    // MCP-MARKER:METHOD:ANALYTICS:GET_PORTFOLIO - Получение аналитики портфеля
    async getPortfolioAnalytics(userAddress) {
        try {
            const analytics = {
                totalValue: 0,
                usdtBalance: 0,
                plexBalance: 0,
                usdtValue: 0,
                plexValue: 0,
                distribution: [],
                diversificationScore: 0,
                riskLevel: 'medium',
                performanceRating: 0
            };
            
            // Получаем балансы токенов
            const [usdtBalance, plexBalance] = await Promise.all([
                this.getTokenBalance(this.contracts.USDT, userAddress),
                this.getTokenBalance(this.contracts.PLEX, userAddress)
            ]);
            
            analytics.usdtBalance = usdtBalance;
            analytics.plexBalance = plexBalance;
            
            // Рассчитываем стоимость в USD
            analytics.usdtValue = usdtBalance;
            analytics.plexValue = plexBalance * (this.config.plexPrice?.usd || 0.05);
            analytics.totalValue = analytics.usdtValue + analytics.plexValue;
            
            // Распределение портфеля
            if (analytics.totalValue > 0) {
                analytics.distribution = [
                    {
                        asset: 'USDT',
                        value: analytics.usdtValue,
                        percentage: (analytics.usdtValue / analytics.totalValue) * 100
                    },
                    {
                        asset: 'PLEX',
                        value: analytics.plexValue,
                        percentage: (analytics.plexValue / analytics.totalValue) * 100
                    }
                ];
            }
            
            // Оценка диверсификации (простая формула)
            analytics.diversificationScore = this.calculateDiversificationScore(analytics.distribution);
            
            // Определение уровня риска
            analytics.riskLevel = this.calculateRiskLevel(analytics);
            
            // Рейтинг производительности
            analytics.performanceRating = this.calculatePerformanceRating(analytics);
            
            return analytics;
            
        } catch (error) {
            console.error('[AnalyticsAPI] Ошибка получения аналитики портфеля:', error);
            return this.getEmptyPortfolioAnalytics();
        }
    }
    
    // MCP-MARKER:METHOD:ANALYTICS:GET_EARNINGS - Получение аналитики доходов
    async getEarningsAnalytics(userAddress) {
        try {
            const analytics = {
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
            
            // Получаем историю входящих транзакций от системы
            const earnings = await this.getSystemPayments(userAddress);
            
            // Обрабатываем каждую выплату
            const now = Date.now();
            const dayAgo = now - 86400000;
            const weekAgo = now - 604800000;
            const monthAgo = now - 2592000000;
            
            for (const earning of earnings) {
                const amount = earning.amount;
                const timestamp = earning.timestamp;
                
                analytics.totalEarnings += amount;
                
                // Подсчет по периодам
                if (timestamp >= dayAgo) {
                    analytics.dailyEarnings += amount;
                }
                if (timestamp >= weekAgo) {
                    analytics.weeklyEarnings += amount;
                }
                if (timestamp >= monthAgo) {
                    analytics.monthlyEarnings += amount;
                }
                
                // Группировка по источникам
                const source = this.determineEarningSource(earning);
                if (!analytics.earningsBySource[source]) {
                    analytics.earningsBySource[source] = {
                        count: 0,
                        total: 0
                    };
                }
                analytics.earningsBySource[source].count++;
                analytics.earningsBySource[source].total += amount;
                
                // Добавляем в timeline
                analytics.earningsTimeline.push({
                    date: timestamp,
                    amount: amount,
                    source: source
                });
            }
            
            // Вычисляем средний дневной доход
            if (analytics.monthlyEarnings > 0) {
                analytics.averageDailyIncome = analytics.monthlyEarnings / 30;
                // Проекция на год
                analytics.yearlyProjection = analytics.averageDailyIncome * 365;
            }
            
            // Вычисляем темп роста
            analytics.growthRate = this.calculateGrowthRate(analytics.earningsTimeline);
            
            // Сортируем timeline
            analytics.earningsTimeline.sort((a, b) => b.date - a.date);
            
            return analytics;
            
        } catch (error) {
            console.error('[AnalyticsAPI] Ошибка получения аналитики доходов:', error);
            return this.getEmptyEarningsAnalytics();
        }
    }
    
    // MCP-MARKER:METHOD:ANALYTICS:GET_USER_DEPOSITS - Получение депозитов пользователя
    async getUserDeposits(userAddress) {
        // Симуляция получения депозитов из блокчейна
        // В реальной реализации это будет запрос к смарт-контракту или API
        
        const deposits = [];
        const savedDeposits = localStorage.getItem('user_deposits');
        
        if (savedDeposits) {
            const parsedDeposits = JSON.parse(savedDeposits);
            return parsedDeposits.map(d => ({
                ...d,
                returns: this.calculateDepositReturns(d)
            }));
        }
        
        return deposits;
    }
    
    // MCP-MARKER:METHOD:ANALYTICS:GET_TOKEN_TX - Получение транзакций токена
    async getTokenTransactions(contractAddress, address) {
        try {
            const params = new URLSearchParams({
                module: 'account',
                action: 'tokentx',
                contractaddress: contractAddress,
                address: address,
                startblock: 0,
                endblock: 99999999,
                page: 1,
                offset: 100,
                sort: 'desc',
                apikey: this.bscApiKey
            });
            
            const response = await fetch(`${this.baseUrl}?${params}`);
            const data = await response.json();
            
            if (data.status === '1' && data.result) {
                return data.result;
            }
            
            return [];
            
        } catch (error) {
            console.error('[AnalyticsAPI] Ошибка получения транзакций:', error);
            return [];
        }
    }
    
    // MCP-MARKER:METHOD:ANALYTICS:GET_TOKEN_BALANCE - Получение баланса токена
    async getTokenBalance(contractAddress, address) {
        try {
            const params = new URLSearchParams({
                module: 'account',
                action: 'tokenbalance',
                contractaddress: contractAddress,
                address: address,
                tag: 'latest',
                apikey: this.bscApiKey
            });
            
            const response = await fetch(`${this.baseUrl}?${params}`);
            const data = await response.json();
            
            if (data.status === '1' && data.result) {
                // Конвертируем из wei в нормальные единицы
                return parseFloat(data.result) / 1e18;
            }
            
            return 0;
            
        } catch (error) {
            console.error('[AnalyticsAPI] Ошибка получения баланса:', error);
            return 0;
        }
    }
    
    // MCP-MARKER:METHOD:ANALYTICS:GET_SYSTEM_PAYMENTS - Получение выплат от системы
    async getSystemPayments(userAddress) {
        const payments = [];
        
        // Получаем входящие транзакции от системного адреса
        const [usdtPayments, plexPayments] = await Promise.all([
            this.getTokenTransactions(this.contracts.USDT, userAddress),
            this.getTokenTransactions(this.contracts.PLEX, userAddress)
        ]);
        
        // Фильтруем только выплаты от системы
        const allPayments = [...usdtPayments, ...plexPayments];
        
        for (const tx of allPayments) {
            if (tx.from.toLowerCase() === this.systemAddress.toLowerCase()) {
                payments.push({
                    amount: this.formatAmount(tx.value, tx.tokenDecimal),
                    timestamp: parseInt(tx.timeStamp) * 1000,
                    token: tx.tokenSymbol,
                    hash: tx.hash
                });
            }
        }
        
        return payments;
    }
    
    // MCP-MARKER:METHOD:ANALYTICS:HELPERS - Вспомогательные методы
    
    isDepositActive(deposit) {
        const now = Date.now();
        const endTime = deposit.timestamp + (deposit.days * 86400000);
        return now < endTime;
    }
    
    calculateDepositReturns(deposit) {
        if (!deposit.percentage || !deposit.amount) return 0;
        return deposit.amount * (deposit.percentage / 100);
    }
    
    formatAmount(value, decimals = 18) {
        const divisor = Math.pow(10, parseInt(decimals));
        return parseFloat(value) / divisor;
    }
    
    determineTransactionType(tx, userAddress) {
        const isIncoming = tx.to.toLowerCase() === userAddress.toLowerCase();
        const isSystem = tx.from.toLowerCase() === this.systemAddress.toLowerCase() ||
