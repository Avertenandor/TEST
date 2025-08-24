// modules/dashboard/dashboard.api.js
// API сервис для модуля dashboard

export default class DashboardAPI {
    constructor(bscApi) {
        this.bscApi = bscApi || window.bscApi;
    }
    
    async loadUserData(address, options = {}) {
        if (!address) {
            throw new Error('User address is required');
        }
        
        console.log('📊 Loading dashboard data for:', address);
        
        // Options for partial loading
        const { onProgress, sequential = true } = options;
        
        // Initialize result object
        const result = {
            deposits: [],
            activeDepositsCount: 0,
            totalDeposited: 0,
            balances: {
                bnb: 0,
                plex: 0,
                usdt: 0,
                totalUSD: 0
            },
            earnings: {
                total: 0,
                today: 0,
                yesterday: 0,
                week: 0,
                month: 0
            },
            errors: []
        };
        
        if (sequential) {
            // Sequential loading with partial updates
            
            // 1. Load deposits first (most important)
            try {
                console.log('⏳ Loading deposits...');
                const deposits = await this.bscApi.getUserDeposits(address);
                result.deposits = deposits;
                
                // Calculate deposit statistics
                const activeDeposits = deposits.filter(d => d.status === 'active');
                result.activeDepositsCount = activeDeposits.length;
                
                result.totalDeposited = deposits.reduce((sum, d) => {
                    if (d.currency === 'USDT') {
                        return sum + d.amount;
                    } else if (d.currency === 'PLEX') {
                        const plexPrice = 0.05;
                        return sum + (d.amount * plexPrice);
                    }
                    return sum;
                }, 0);
                
                result.earnings = this.calculateEarnings(deposits);
                
                if (onProgress) onProgress('deposits', result);
                
            } catch (error) {
                console.error('Failed to load deposits:', error);
                result.errors.push({ type: 'deposits', error: error.message });
            }
            
            // 2. Load balances one by one
            
            // BNB Balance
            try {
                console.log('⏳ Loading BNB balance...');
                result.balances.bnb = await this.bscApi.getBNBBalance(address);
                if (onProgress) onProgress('bnb', result);
            } catch (error) {
                console.error('Failed to load BNB balance:', error);
                result.errors.push({ type: 'bnb', error: error.message });
            }
            
            // Small delay between requests
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // PLEX Balance
            try {
                console.log('⏳ Loading PLEX balance...');
                result.balances.plex = await this.bscApi.getTokenBalance(
                    address, 
                    this.bscApi.plex.address, 
                    this.bscApi.plex.decimals
                );
                if (onProgress) onProgress('plex', result);
            } catch (error) {
                console.error('Failed to load PLEX balance:', error);
                result.errors.push({ type: 'plex', error: error.message });
            }
            
            // Small delay between requests
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // USDT Balance
            try {
                console.log('⏳ Loading USDT balance...');
                result.balances.usdt = await this.bscApi.getTokenBalance(
                    address, 
                    this.bscApi.usdt.address, 
                    this.bscApi.usdt.decimals
                );
                if (onProgress) onProgress('usdt', result);
            } catch (error) {
                console.error('Failed to load USDT balance:', error);
                result.errors.push({ type: 'usdt', error: error.message });
            }
            
            // Calculate total USD value
            result.balances.totalUSD = this.calculateTotalBalance(
                result.balances.bnb,
                result.balances.plex,
                result.balances.usdt
            );
            
        } else {
            // Original parallel loading (if needed for comparison)
            try {
                const [
                    deposits,
                    bnbBalance,
                    plexBalance,
                    usdtBalance
                ] = await Promise.all([
                    this.bscApi.getUserDeposits(address),
                    this.bscApi.getBNBBalance(address),
                    this.bscApi.getTokenBalance(address, this.bscApi.plex.address, this.bscApi.plex.decimals),
                    this.bscApi.getTokenBalance(address, this.bscApi.usdt.address, this.bscApi.usdt.decimals)
                ]);
                
                result.deposits = deposits;
                result.balances.bnb = bnbBalance;
                result.balances.plex = plexBalance;
                result.balances.usdt = usdtBalance;
                
                // Calculate statistics
                const activeDeposits = deposits.filter(d => d.status === 'active');
                result.activeDepositsCount = activeDeposits.length;
                
                result.totalDeposited = deposits.reduce((sum, d) => {
                    if (d.currency === 'USDT') {
                        return sum + d.amount;
                    } else if (d.currency === 'PLEX') {
                        const plexPrice = 0.05;
                        return sum + (d.amount * plexPrice);
                    }
                    return sum;
                }, 0);
                
                result.earnings = this.calculateEarnings(deposits);
                result.balances.totalUSD = this.calculateTotalBalance(bnbBalance, plexBalance, usdtBalance);
                
            } catch (error) {
                console.error('Failed to load dashboard data (parallel):', error);
                result.errors.push({ type: 'general', error: error.message });
            }
        }
        
        // Log summary
        if (result.errors.length > 0) {
            console.warn('⚠️ Dashboard loaded with errors:', result.errors);
        } else {
            console.log('✅ Dashboard data loaded successfully');
        }
        
        return result;
    }
    
    calculateEarnings(deposits) {
        const now = Date.now();
        const todayStart = new Date();
        todayStart.setUTCHours(0, 0, 0, 0);
        
        const yesterdayStart = new Date(todayStart);
        yesterdayStart.setDate(yesterdayStart.getDate() - 1);
        
        const weekStart = new Date(todayStart);
        weekStart.setDate(weekStart.getDate() - 7);
        
        const monthStart = new Date(todayStart);
        monthStart.setMonth(monthStart.getMonth() - 1);
        
        let totalEarnings = 0;
        let todayEarnings = 0;
        let yesterdayEarnings = 0;
        let weekEarnings = 0;
        let monthEarnings = 0;
        
        deposits.forEach(deposit => {
            const depositTime = deposit.timestamp;
            const daysActive = Math.floor((now - depositTime) / 86400000);
            
            if (daysActive > 0 && daysActive <= deposit.days) {
                // Расчет общего дохода
                const dailyProfit = (deposit.amount * deposit.percentage / 100) / deposit.days;
                const totalProfit = dailyProfit * daysActive;
                totalEarnings += totalProfit;
                
                // Доход за сегодня
                if (depositTime < todayStart.getTime()) {
                    todayEarnings += dailyProfit;
                }
                
                // Доход за вчера
                if (depositTime < yesterdayStart.getTime()) {
                    yesterdayEarnings += dailyProfit;
                }
                
                // Доход за неделю
                if (depositTime < weekStart.getTime()) {
                    const weekDays = Math.min(7, daysActive);
                    weekEarnings += dailyProfit * weekDays;
                }
                
                // Доход за месяц
                if (depositTime < monthStart.getTime()) {
                    const monthDays = Math.min(30, daysActive);
                    monthEarnings += dailyProfit * monthDays;
                }
            }
        });
        
        return {
            total: totalEarnings,
            today: todayEarnings,
            yesterday: yesterdayEarnings,
            week: weekEarnings,
            month: monthEarnings
        };
    }
    
    calculateTotalBalance(bnb, plex, usdt) {
        // Примерные цены (должны браться из внешнего источника)
        const bnbPrice = 300; // USD
        const plexPrice = 0.05; // USD
        
        return (bnb * bnbPrice) + (plex * plexPrice) + usdt;
    }
    
    async getRecentTransactions(address, limit = 10) {
        try {
            // Получаем последние транзакции USDT
            const usdtTxs = await this.bscApi.getTokenTransactions(
                this.bscApi.usdt.address,
                null,
                address,
                this.bscApi.apiKeys.DEPOSITS
            );
            
            // Получаем последние транзакции PLEX
            const plexTxs = await this.bscApi.getTokenTransactions(
                this.bscApi.plex.address,
                null,
                address,
                this.bscApi.apiKeys.DEPOSITS
            );
            
            // Объединяем и сортируем по времени
            const allTxs = [...usdtTxs, ...plexTxs];
            allTxs.sort((a, b) => parseInt(b.timeStamp) - parseInt(a.timeStamp));
            
            // Берем только последние limit транзакций
            return allTxs.slice(0, limit).map(tx => ({
                hash: tx.hash,
                timestamp: parseInt(tx.timeStamp) * 1000,
                from: tx.from,
                to: tx.to,
                value: this.formatTxValue(tx),
                token: tx.tokenSymbol,
                type: tx.from.toLowerCase() === address.toLowerCase() ? 'out' : 'in'
            }));
            
        } catch (error) {
            console.error('Failed to get recent transactions:', error);
            return [];
        }
    }
    
    formatTxValue(tx) {
        if (tx.tokenSymbol === 'USDT') {
            return this.bscApi.formatTokenAmount(tx.value, 18);
        } else if (tx.tokenSymbol === 'PLEX') {
            return this.bscApi.formatTokenAmount(tx.value, 9);
        }
        return 0;
    }
}
