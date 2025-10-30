// modules/platform-access/platform-access.api.js
// API для проверки и управления доступом к платформе

export default class PlatformAccessAPI {
    constructor(config) {
        this.config = config;
        this.bscApiKey = config.api?.bscScanKey || '';
        this.usdtContract = config.contracts?.USDT || '0x55d398326f99059fF775485246999027B3197955'; // BSC USDT
        this.systemAddress = config.systemAddress || '0x...';
        this.apiUrl = 'https://api.etherscan.io/v2/api?chainid=56';
    }
    
    /**
     * Проверка доступа к платформе для пользователя
     * @param {string} userAddress - BSC адрес пользователя
     * @returns {Promise<{hasAccess: boolean, lastPayment: Date|null, expiresAt: Date|null}>}
     */
    async checkPlatformAccess(userAddress) {
        try {
            console.log(`🔍 Checking platform access for: ${userAddress}`);
            
            // Получаем транзакции USDT от пользователя к системе
            const transactions = await this.getUserPaymentTransactions(userAddress);
            
            // Фильтруем транзакции за последние 30 дней
            const recentPayments = this.filterRecentPayments(transactions);
            
            if (recentPayments.length === 0) {
                return {
                    hasAccess: false,
                    lastPayment: null,
                    expiresAt: null
                };
            }
            
            // Находим последнюю оплату
            const lastPayment = this.findLastValidPayment(recentPayments);
            
            if (!lastPayment) {
                return {
                    hasAccess: false,
                    lastPayment: null,
                    expiresAt: null
                };
            }
            
            // Проверяем, действителен ли доступ
            const paymentDate = new Date(lastPayment.timeStamp * 1000);
            const expiresAt = new Date(paymentDate);
            expiresAt.setDate(expiresAt.getDate() + 1); // Доступ на 1 день
            
            const now = new Date();
            const hasAccess = now < expiresAt;
            
            return {
                hasAccess,
                lastPayment: paymentDate,
                expiresAt
            };
            
        } catch (error) {
            console.error('Error checking platform access:', error);
            throw error;
        }
    }
    
    /**
     * Получение транзакций оплаты от пользователя
     * @param {string} userAddress - BSC адрес пользователя
     * @returns {Promise<Array>} Массив транзакций
     */
    async getUserPaymentTransactions(userAddress) {
        try {
            const params = new URLSearchParams({
                module: 'account',
                action: 'tokentx',
                contractaddress: this.usdtContract,
                address: this.systemAddress,
                page: 1,
                offset: 100,
                sort: 'desc',
                apikey: this.bscApiKey
            });
            
            const response = await fetch(`${this.apiUrl}?${params}`);
            const data = await response.json();
            
            if (data.status !== '1') {
                console.warn('No transactions found or API error:', data.message);
                return [];
            }
            
            // Фильтруем только транзакции от нужного пользователя
            const userTransactions = data.result.filter(tx => 
                tx.from.toLowerCase() === userAddress.toLowerCase()
            );
            
            return userTransactions;
            
        } catch (error) {
            console.error('Error fetching payment transactions:', error);
            return [];
        }
    }
    
    /**
     * Фильтрация транзакций за последние 30 дней
     * @param {Array} transactions - Массив транзакций
     * @returns {Array} Отфильтрованные транзакции
     */
    filterRecentPayments(transactions) {
        const thirtyDaysAgo = Date.now() / 1000 - (30 * 24 * 60 * 60);
        
        return transactions.filter(tx => {
            const txTime = parseInt(tx.timeStamp);
            return txTime > thirtyDaysAgo;
        });
    }
    
    /**
     * Поиск последней валидной оплаты ($1 USDT или больше)
     * @param {Array} transactions - Массив транзакций
     * @returns {Object|null} Транзакция или null
     */
    findLastValidPayment(transactions) {
        // USDT имеет 18 десятичных знаков в BSC
        const minAmount = BigInt('1000000000000000000'); // 1 USDT
        
        for (const tx of transactions) {
            const amount = BigInt(tx.value);
            
            if (amount >= minAmount) {
                // Проверяем количество дней оплаты
                const days = Number(amount / minAmount);
                console.log(`✅ Found valid payment: ${days} day(s) access`);
                return tx;
            }
        }
        
        return null;
    }
    
    /**
     * Проверка конкретной транзакции по hash
     * @param {string} txHash - Hash транзакции
     * @returns {Promise<boolean>} Валидна ли транзакция
     */
    async verifyPaymentTransaction(txHash) {
        try {
            const params = new URLSearchParams({
                module: 'transaction',
                action: 'gettxreceiptstatus',
                txhash: txHash,
                apikey: this.bscApiKey
            });
            
            const response = await fetch(`${this.apiUrl}?${params}`);
            const data = await response.json();
            
            if (data.status !== '1' || data.result.status !== '1') {
                return false;
            }
            
            // Получаем детали транзакции
            const txDetails = await this.getTransactionDetails(txHash);
            
            if (!txDetails) {
                return false;
            }
            
            // Проверяем, что это транзакция USDT на наш адрес
            const isValidPayment = 
                txDetails.to?.toLowerCase() === this.systemAddress.toLowerCase() &&
                txDetails.contractAddress?.toLowerCase() === this.usdtContract.toLowerCase() &&
                BigInt(txDetails.value || '0') >= BigInt('1000000000000000000'); // >= 1 USDT
            
            return isValidPayment;
            
        } catch (error) {
            console.error('Error verifying transaction:', error);
            return false;
        }
    }
    
    /**
     * Получение деталей транзакции
     * @param {string} txHash - Hash транзакции
     * @returns {Promise<Object|null>} Детали транзакции
     */
    async getTransactionDetails(txHash) {
        try {
            const params = new URLSearchParams({
                module: 'proxy',
                action: 'eth_getTransactionByHash',
                txhash: txHash,
                apikey: this.bscApiKey
            });
            
            const response = await fetch(`${this.apiUrl}?${params}`);
            const data = await response.json();
            
            return data.result || null;
            
        } catch (error) {
            console.error('Error getting transaction details:', error);
            return null;
        }
    }
    
    /**
     * Расчет стоимости доступа на N дней
     * @param {number} days - Количество дней
     * @returns {number} Стоимость в USDT
     */
    calculateAccessCost(days) {
        return days * 1; // $1 за день
    }
    
    /**
     * Форматирование суммы USDT для отображения
     * @param {string|BigInt} value - Значение в wei
     * @returns {string} Форматированная строка
     */
    formatUSDTAmount(value) {
        const amount = BigInt(value);
        const decimals = BigInt('1000000000000000000'); // 18 decimals
        const whole = amount / decimals;
        const fraction = amount % decimals;
        
        return `${whole}.${fraction.toString().padStart(18, '0').slice(0, 2)} USDT`;
    }
    
    /**
     * Получение истории платежей пользователя
     * @param {string} userAddress - BSC адрес пользователя
     * @param {number} limit - Максимальное количество записей
     * @returns {Promise<Array>} История платежей
     */
    async getPaymentHistory(userAddress, limit = 10) {
        try {
            const transactions = await this.getUserPaymentTransactions(userAddress);
            
            // Форматируем и сортируем
            const history = transactions
                .filter(tx => BigInt(tx.value) >= BigInt('1000000000000000000')) // >= 1 USDT
                .slice(0, limit)
                .map(tx => ({
                    hash: tx.hash,
                    date: new Date(tx.timeStamp * 1000),
                    amount: this.formatUSDTAmount(tx.value),
                    days: Number(BigInt(tx.value) / BigInt('1000000000000000000')),
                    status: 'completed'
                }));
            
            return history;
            
        } catch (error) {
            console.error('Error getting payment history:', error);
            return [];
        }
    }
    
    /**
     * Мониторинг новых платежей
     * @param {string} userAddress - BSC адрес пользователя
     * @param {Function} callback - Callback при обнаружении платежа
     * @returns {Function} Функция остановки мониторинга
     */
    startPaymentMonitoring(userAddress, callback) {
        let lastCheckTime = Date.now();
        
        const interval = setInterval(async () => {
            try {
                const transactions = await this.getUserPaymentTransactions(userAddress);
                
                // Проверяем новые транзакции
                const newTransactions = transactions.filter(tx => {
                    const txTime = tx.timeStamp * 1000;
                    return txTime > lastCheckTime;
                });
                
                if (newTransactions.length > 0) {
                    for (const tx of newTransactions) {
                        if (BigInt(tx.value) >= BigInt('1000000000000000000')) {
                            callback({
                                success: true,
                                transaction: tx,
                                amount: this.formatUSDTAmount(tx.value),
                                days: Number(BigInt(tx.value) / BigInt('1000000000000000000'))
                            });
                        }
                    }
                    
                    lastCheckTime = Date.now();
                }
            } catch (error) {
                console.error('Error monitoring payments:', error);
            }
        }, 15000); // Проверяем каждые 15 секунд
        
        // Возвращаем функцию остановки
        return () => clearInterval(interval);
    }
}
