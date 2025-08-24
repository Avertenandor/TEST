// modules/deposits/deposits.api.js

export default class DepositsAPI {
    constructor(config) {
        this.config = config || window.GENESIS_CONFIG;
        this.bscApiUrl = this.config.bscscan.apiUrl;
        this.apiKey = window.getApiKeyForOperation('DEPOSITS');
        this.systemAddress = this.config.addresses.system;
        this.usdtContract = this.config.usdt.address;
        this.plexContract = this.config.plex.address;
    }
    
    /**
     * Получить активные депозиты пользователя
     */
    async getUserActiveDeposits(userAddress) {
        try {
            // Получаем депозиты из localStorage (в реальной системе это было бы из блокчейна)
            const storedDeposits = localStorage.getItem(`deposits_${userAddress}`);
            if (!storedDeposits) return [];
            
            const deposits = JSON.parse(storedDeposits);
            const now = Date.now();
            
            // Фильтруем только активные
            return deposits.filter(deposit => {
                const plan = window.getDepositPlanById(deposit.planId);
                if (!plan) return false;
                
                const expiryTime = new Date(deposit.createdAt).getTime() + (plan.days * 24 * 60 * 60 * 1000);
                return expiryTime > now && deposit.status === 'ACTIVE';
            });
            
        } catch (error) {
            console.error('Failed to get active deposits:', error);
            return [];
        }
    }
    
    /**
     * Получить историю депозитов пользователя
     */
    async getUserDepositHistory(userAddress) {
        try {
            const storedDeposits = localStorage.getItem(`deposits_${userAddress}`);
            if (!storedDeposits) return [];
            
            const deposits = JSON.parse(storedDeposits);
            
            // Возвращаем все депозиты как историю
            return deposits.map(deposit => {
                const plan = window.getDepositPlanById(deposit.planId);
                if (!plan) return deposit;
                
                // Рассчитываем прибыль для завершенных депозитов
                if (deposit.status === 'COMPLETED') {
                    deposit.profit = deposit.amount * (plan.percentage - 100) / 100;
                }
                
                return deposit;
            });
            
        } catch (error) {
            console.error('Failed to get deposit history:', error);
            return [];
        }
    }
    
    /**
     * Создать новый депозит
     */
    async createDeposit(params) {
        const { planId, currency, amount, userAddress } = params;
        
        try {
            // Создаем объект депозита
            const deposit = {
                id: this.generateDepositId(),
                planId,
                planName: window.getDepositPlanById(planId).title,
                currency,
                amount,
                userAddress,
                status: 'PENDING',
                createdAt: new Date().toISOString(),
                txHash: null,
                daysRemaining: window.getDepositPlanById(planId).days
            };
            
            // Сохраняем в localStorage
            this.saveDeposit(userAddress, deposit);
            
            // Запускаем мониторинг оплаты
            this.monitorPayment(deposit);
            
            return deposit;
            
        } catch (error) {
            console.error('Failed to create deposit:', error);
            throw error;
        }
    }
    
    /**
     * Мониторинг оплаты депозита
     */
    async monitorPayment(deposit) {
        const checkInterval = 10000; // 10 секунд
        const maxAttempts = 60; // 10 минут максимум
        let attempts = 0;
        
        const checkPayment = async () => {
            attempts++;
            
            try {
                const isPaid = await this.checkDepositPayment(deposit);
                
                if (isPaid) {
                    // Активируем депозит
                    this.activateDeposit(deposit.id, deposit.userAddress);
                    
                    // Уведомляем систему
                    if (window.eventBus) {
                        window.eventBus.emit('payment:confirmed', {
                            type: 'deposit',
                            depositId: deposit.id
                        });
                    }
                    
                    console.log('✅ Deposit payment confirmed:', deposit.id);
                    return;
                }
                
                if (attempts < maxAttempts) {
                    setTimeout(checkPayment, checkInterval);
                } else {
                    // Отменяем депозит по таймауту
                    this.cancelDeposit(deposit.id, deposit.userAddress);
                    console.warn('⚠️ Deposit payment timeout:', deposit.id);
                }
                
            } catch (error) {
                console.error('Payment monitoring error:', error);
                if (attempts < maxAttempts) {
                    setTimeout(checkPayment, checkInterval);
                }
            }
        };
        
        // Запускаем проверку через 5 секунд
        setTimeout(checkPayment, 5000);
    }
    
    /**
     * Проверить оплату депозита через BSCScan API
     */
    async checkDepositPayment(deposit) {
        const contractAddress = deposit.currency === 'USDT' ? this.usdtContract : this.plexContract;
        
        try {
            // Используем BSC API с RequestScheduler вместо прямого fetch
            const bscApi = window.bscApi;
            if (!bscApi) {
                console.error('BSC API not initialized');
                return false;
            }
            
            // Получаем транзакции через API с кэшированием
            const transactions = await bscApi.getTokenTransactions(
                contractAddress,
                deposit.userAddress,
                this.systemAddress,
                this.apiKey
            );
            
            if (!transactions || transactions.length === 0) {
                return false;
            }
            
            // Ищем транзакцию с нужной суммой
            const targetAmount = deposit.currency === 'USDT' ? 
                window.usdtToWei(deposit.amount) : 
                window.plexToWei(deposit.amount);
            
            const tolerance = 0.05; // 5% погрешность
            const minAmount = BigInt(Math.floor(parseFloat(targetAmount) * (1 - tolerance)));
            const maxAmount = BigInt(Math.floor(parseFloat(targetAmount) * (1 + tolerance)));
            
            const payment = transactions.find(tx => {
                const txAmount = BigInt(tx.value);
                return tx.from.toLowerCase() === deposit.userAddress.toLowerCase() &&
                       txAmount >= minAmount && 
                       txAmount <= maxAmount &&
                       parseInt(tx.timeStamp) * 1000 > new Date(deposit.createdAt).getTime();
            });
            
            if (payment) {
                deposit.txHash = payment.hash;
                return true;
            }
            
            return false;
            
        } catch (error) {
            console.error('Failed to check deposit payment:', error);
            return false;
        }
    }
    
    /**
     * Активировать депозит после подтверждения оплаты
     */
    activateDeposit(depositId, userAddress) {
        try {
            const deposits = this.getStoredDeposits(userAddress);
            const deposit = deposits.find(d => d.id === depositId);
            
            if (deposit) {
                deposit.status = 'ACTIVE';
                deposit.activatedAt = new Date().toISOString();
                this.saveAllDeposits(userAddress, deposits);
            }
        } catch (error) {
            console.error('Failed to activate deposit:', error);
        }
    }
    
    /**
     * Отменить депозит
     */
    cancelDeposit(depositId, userAddress) {
        try {
            const deposits = this.getStoredDeposits(userAddress);
            const deposit = deposits.find(d => d.id === depositId);
            
            if (deposit) {
                deposit.status = 'CANCELLED';
                deposit.cancelledAt = new Date().toISOString();
                this.saveAllDeposits(userAddress, deposits);
            }
        } catch (error) {
            console.error('Failed to cancel deposit:', error);
        }
    }
    
    /**
     * Проверить статус всех депозитов и обновить истекшие
     */
    async checkAndUpdateDepositStatuses(userAddress) {
        try {
            const deposits = this.getStoredDeposits(userAddress);
            const now = Date.now();
            let updated = false;
            
            deposits.forEach(deposit => {
                if (deposit.status === 'ACTIVE') {
                    const plan = window.getDepositPlanById(deposit.planId);
                    if (!plan) return;
                    
                    const expiryTime = new Date(deposit.activatedAt || deposit.createdAt).getTime() + 
                                      (plan.days * 24 * 60 * 60 * 1000);
                    
                    if (expiryTime <= now) {
                        deposit.status = 'COMPLETED';
                        deposit.completedAt = new Date().toISOString();
                        deposit.profit = deposit.amount * (plan.percentage - 100) / 100;
                        updated = true;
                        
                        // Уведомляем систему
                        if (window.eventBus) {
                            window.eventBus.emit('deposit:expired', deposit);
                        }
                    }
                }
            });
            
            if (updated) {
                this.saveAllDeposits(userAddress, deposits);
            }
            
            return deposits;
            
        } catch (error) {
            console.error('Failed to update deposit statuses:', error);
            return [];
        }
    }
    
    /**
     * Получить статистику по депозитам
     */
    async getDepositStatistics(userAddress) {
        try {
            const deposits = this.getStoredDeposits(userAddress);
            
            let totalInvested = 0;
            let totalEarned = 0;
            let activeCount = 0;
            let completedCount = 0;
            
            deposits.forEach(deposit => {
                const usdAmount = deposit.currency === 'USDT' ? 
                    deposit.amount : 
                    window.convertPlexToUSD(deposit.amount);
                
                if (deposit.status === 'ACTIVE') {
                    totalInvested += usdAmount;
                    activeCount++;
                } else if (deposit.status === 'COMPLETED') {
                    totalEarned += deposit.profit || 0;
                    completedCount++;
                }
            });
            
            return {
                totalInvested,
                totalEarned,
                activeCount,
                completedCount,
                totalDeposits: deposits.length
            };
            
        } catch (error) {
            console.error('Failed to get deposit statistics:', error);
            return {
                totalInvested: 0,
                totalEarned: 0,
                activeCount: 0,
                completedCount: 0,
                totalDeposits: 0
            };
        }
    }
    
    // Вспомогательные методы
    
    generateDepositId() {
        return `DEP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    getStoredDeposits(userAddress) {
        try {
            const stored = localStorage.getItem(`deposits_${userAddress}`);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Failed to get stored deposits:', error);
            return [];
        }
    }
    
    saveDeposit(userAddress, deposit) {
        try {
            const deposits = this.getStoredDeposits(userAddress);
            deposits.push(deposit);
            this.saveAllDeposits(userAddress, deposits);
        } catch (error) {
            console.error('Failed to save deposit:', error);
        }
    }
    
    saveAllDeposits(userAddress, deposits) {
        try {
            localStorage.setItem(`deposits_${userAddress}`, JSON.stringify(deposits));
        } catch (error) {
            console.error('Failed to save deposits:', error);
        }
    }
    
    /**
     * Очистить все депозиты пользователя (для тестирования)
     */
    clearUserDeposits(userAddress) {
        if (window.isDevelopment && window.isDevelopment()) {
            localStorage.removeItem(`deposits_${userAddress}`);
            console.log('✅ User deposits cleared');
        }
    }
}
