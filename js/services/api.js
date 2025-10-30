/**
 * GENESIS 1.1 - API Сервис
 * MCP-MARKER:MODULE:API_SERVICE - Сервис API
 * MCP-MARKER:FILE:API_JS - Основной файл API
 */

// MCP-MARKER:CLASS:GENESIS_API - Класс API сервиса
window.GenesisAPI = {
    // MCP-MARKER:SECTION:API_CACHE - Кеш для оптимизации
    cache: new Map(),
    cacheTimeout: 300000, // 5 минут
    
    // Флаг инициализации
    isInitialized: false,
    
    // MCP-MARKER:METHOD:INIT_API - Инициализация API
    init() {
        if (!window.GENESIS_CONFIG) {
            console.error('❌ GENESIS_CONFIG не загружен');
            return false;
        }
        
        // Проверяем наличие API ключей
        const apiKeys = window.GENESIS_CONFIG.bscscan?.apiKeys;
        if (!apiKeys || !apiKeys.AUTHORIZATION) {
            console.error('❌ BSCScan API ключи не настроены');
            return false;
        }
        
        this.isInitialized = true;
        if (window.GenesisTerminal) {
            window.GenesisTerminal.log('🌐 GENESIS API инициализирован', 'system');
        }
        return true;
    },
    
    // Статистика
    stats: {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        cacheHits: 0,
        rateLimitHits: 0
    },
    
    // Rate limiting
    requestQueue: [],
    lastRequestTime: 0,
    
    // Основной метод для BSCScan API с специализированными ключами
    async bscRequest(params, operationType = 'AUTHORIZATION', retryCount = 0) {
        // Проверяем инициализацию
        if (!this.isInitialized) {
            const initSuccess = this.init();
            if (!initSuccess) {
                throw new Error('API не инициализирован');
            }
        }
        
        const config = window.GENESIS_CONFIG;
        const maxRetries = config?.bscscan?.retryAttempts || 3;
        
        // Проверяем rate limit
        await this.checkRateLimit();
        
        // Получаем специализированный ключ
        const apiKey = window.getApiKeyForOperation(operationType);
        // Поддержка нового Etherscan API v2 формата (с параметрами в URL)
        let baseUrl = config.bscscan.apiUrl;
        if (!baseUrl.includes('chainid=56')) {
            baseUrl = 'https://api.etherscan.io/v2/api?chainid=56';
        }
        const url = new URL(baseUrl);
        
        // Добавляем параметры
        Object.entries(params).forEach(([key, value]) => {
            url.searchParams.append(key, value);
        });
        url.searchParams.append('apikey', apiKey);
        
        // Проверяем кеш
        const cacheKey = url.toString();
        const cached = this.getFromCache(cacheKey);
        if (cached) {
            this.stats.cacheHits++;
            return cached;
        }
        
        // Увеличиваем счетчик
        this.stats.totalRequests++;
        if (window.GenesisTerminal) {
            window.GenesisTerminal.stats.apiCalls++;
        }
        
        try {
            // Делаем запрос с таймаутом
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), config.app.apiTimeout);
            
            const response = await fetch(url.toString(), {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'GENESIS-1.1/1.0'
                },
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Проверяем ответ API
            if (data.status === '0' && data.message === 'NOTOK') {
                // Если превышен лимит, меняем ключ и повторяем
                if (data.result && data.result.includes('Max rate limit reached')) {
                    this.stats.rateLimitHits++;
                    console.warn(`API rate limit reached for ${operationType}, switching key...`);
                    
                    // Повторяем запрос с другим ключом если возможно
                    if (retryCount < maxRetries) {
                        return this.bscRequest(params, operationType, retryCount + 1);
                    }
                }
                
                // Другие ошибки API
                if (retryCount < maxRetries) {
                    console.warn(`API request failed, retrying... (${retryCount + 1}/${maxRetries})`);
                    await this.delay(1000 * (retryCount + 1)); // Экспоненциальная задержка
                    return this.bscRequest(params, operationType, retryCount + 1);
                }
                
                throw new Error(data.result || 'API request failed');
            }
            
            // Успешный запрос
            this.stats.successfulRequests++;
            
            // Сохраняем в кеш
            this.saveToCache(cacheKey, data);
            
            return data;
            
        } catch (error) {
            this.stats.failedRequests++;
            
            // Обработка различных типов ошибок
            if (error.name === 'AbortError') {
                console.error('API request timeout');
                if (window.GenesisTerminal) {
                    window.GenesisTerminal.log('API timeout', 'error');
                }
            } else {
                console.error('BSCScan API error:', error);
                if (window.GenesisTerminal) {
                    window.GenesisTerminal.log(`API Error: ${error.message}`, 'error');
                }
            }
            
            // Retry для сетевых ошибок
            if (retryCount < maxRetries && this.isRetryableError(error)) {
                console.warn(`Retrying request... (${retryCount + 1}/${maxRetries})`);
                await this.delay(1000 * (retryCount + 1));
                return this.bscRequest(params, operationType, retryCount + 1);
            }
            
            throw error;
        }
    },
    
    // Проверка rate limit
    async checkRateLimit() {
        const config = window.GENESIS_CONFIG;
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        const minInterval = 1000 / config.bscscan.rateLimit; // миллисекунды между запросами
        
        if (timeSinceLastRequest < minInterval) {
            const delay = minInterval - timeSinceLastRequest;
            await this.delay(delay);
        }
        
        this.lastRequestTime = Date.now();
    },
    
    // Проверка, можно ли повторить запрос
    isRetryableError(error) {
        const retryableErrors = [
            'AbortError',
            'TypeError',
            'NetworkError'
        ];
        
        return retryableErrors.includes(error.name) || 
               error.message.includes('network') ||
               error.message.includes('timeout');
    },
    
    // Задержка
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },
    
    // Получить баланс адреса
    async getBalance(address) {
        try {
            const data = await this.bscRequest({
                module: 'account',
                action: 'balance',
                address: address,
                tag: 'latest'
            });
            
            return window.GenesisUtils.weiToBNB(data.result);
        } catch (error) {
            console.error('Error getting balance:', error);
            return 0;
        }
    },
    
            // Получаем баланс токена
    async getTokenBalance(address, tokenAddress) {
        try {
            const data = await this.bscRequest({
                module: 'account',
                action: 'tokenbalance',
                contractaddress: tokenAddress,
                address: address,
                tag: 'latest'
            });
            
            // Для PLEX токена (9 decimals)
            if (tokenAddress.toLowerCase() === window.GENESIS_CONFIG.plex.address.toLowerCase()) {
                return window.GenesisUtils ? 
                    window.GenesisUtils.weiToPlex(data.result) : 
                    parseFloat(data.result) / 1e9;
            }
            
            // Для USDT токена (18 decimals)
            if (tokenAddress.toLowerCase() === window.GENESIS_CONFIG.usdt.address.toLowerCase()) {
                return window.GenesisUtils ? 
                    window.GenesisUtils.weiToUSDT(data.result) : 
                    parseFloat(data.result) / 1e18;
            }
            
            // Для других токенов (предполагаем 18 decimals)
            return window.GenesisUtils ? 
                window.GenesisUtils.weiToBNB(data.result) : 
                parseFloat(data.result) / 1e18;
        } catch (error) {
            console.error('Error getting token balance:', error);
            return 0;
        }
    },
    
    // Получить список транзакций
    async getTransactions(address, startBlock = 0, endBlock = 99999999, sort = 'desc') {
        try {
            const data = await this.bscRequest({
                module: 'account',
                action: 'txlist',
                address: address,
                startblock: startBlock,
                endblock: endBlock,
                sort: sort
            });
            
            return data.result || [];
        } catch (error) {
            console.error('Error getting transactions:', error);
            return [];
        }
    },
    
    // Получить токен-транзакции
    async getTokenTransactions(address, tokenAddress = null, startBlock = 0, endBlock = 99999999) {
        try {
            const params = {
                module: 'account',
                action: 'tokentx',
                address: address,
                startblock: startBlock,
                endblock: endBlock,
                sort: 'desc'
            };
            
            if (tokenAddress) {
                params.contractaddress = tokenAddress;
            }
            
            const data = await this.bscRequest(params);
            
            return data.result || [];
        } catch (error) {
            console.error('Error getting token transactions:', error);
            return [];
        }
    },
    
    // Получить внутренние транзакции
    async getInternalTransactions(address) {
        try {
            const data = await this.bscRequest({
                module: 'account',
                action: 'txlistinternal',
                address: address,
                sort: 'desc'
            });
            
            return data.result || [];
        } catch (error) {
            console.error('Error getting internal transactions:', error);
            return [];
        }
    },
    
    // Получить текущую цену газа
    async getGasPrice() {
        try {
            const data = await this.bscRequest({
                module: 'proxy',
                action: 'eth_gasPrice'
            });
            
            return parseInt(data.result, 16);
        } catch (error) {
            console.error('Error getting gas price:', error);
            return 5000000000; // 5 Gwei default
        }
    },
    
    // Получить номер последнего блока
    async getBlockNumber() {
        try {
            const data = await this.bscRequest({
                module: 'proxy',
                action: 'eth_blockNumber'
            });
            
            return parseInt(data.result, 16);
        } catch (error) {
            console.error('Error getting block number:', error);
            return 0;
        }
    },
    
    // Проверить статус транзакции
    async getTransactionStatus(txHash) {
        try {
            const data = await this.bscRequest({
                module: 'transaction',
                action: 'gettxreceiptstatus',
                txhash: txHash
            });
            
            return data.result && data.result.status === '1';
        } catch (error) {
            console.error('Error getting transaction status:', error);
            return false;
        }
    },
    
    // Получить информацию о транзакции
    async getTransactionInfo(txHash) {
        try {
            const data = await this.bscRequest({
                module: 'proxy',
                action: 'eth_getTransactionByHash',
                txhash: txHash
            });
            
            return data.result;
        } catch (error) {
            console.error('Error getting transaction info:', error);
            return null;
        }
    },
    
    // Получить цену BNB
    async getBNBPrice() {
        try {
            const data = await this.bscRequest({
                module: 'stats',
                action: 'bnbprice'
            });
            
            return parseFloat(data.result.ethusd);
        } catch (error) {
            console.error('Error getting BNB price:', error);
            return 0;
        }
    },
    
    // Методы кеширования
    saveToCache(key, data) {
        this.cache.set(key, {
            data: data,
            timestamp: Date.now()
        });
    },
    
    getFromCache(key) {
        const cached = this.cache.get(key);
        if (!cached) return null;
        
        // Проверяем время жизни кеша
        if (Date.now() - cached.timestamp > this.cacheTimeout) {
            this.cache.delete(key);
            return null;
        }
        
        return cached.data;
    },
    
    // Очистить кеш
    clearCache() {
        this.cache.clear();
        console.log('API cache cleared');
    },
    
    // Получить статистику
    getStats() {
        return {
            ...this.stats,
            cacheSize: this.cache.size,
            successRate: this.stats.totalRequests > 0 
                ? (this.stats.successfulRequests / this.stats.totalRequests * 100).toFixed(2) + '%'
                : '0%'
        };
    },
    
    // Специальные методы для GENESIS
    
    // Проверить авторизацию (оплату 1 PLEX) - специализированный ключ
    async checkAuthorizationPayment(userAddress) {
        const systemAddress = window.GENESIS_CONFIG.addresses.system;
        const plexAddress = window.GENESIS_CONFIG.plex.address;
        const config = window.GENESIS_CONFIG;
        
        try {
            // Используем специализированный ключ для авторизации
            const transactions = await this.bscRequest({
                module: 'account',
                action: 'tokentx',
                address: userAddress,
                contractaddress: plexAddress,
                startblock: 0,
                endblock: 99999999,
                sort: 'desc'
            }, 'AUTHORIZATION');
            
            if (!transactions.result) return { isAuthorized: false, payment: null };
            
            // Ищем транзакцию от пользователя на 1 PLEX ±5%
            const authTx = transactions.result.find(tx => {
                if (tx.from.toLowerCase() !== userAddress.toLowerCase() ||
                    tx.to.toLowerCase() !== systemAddress.toLowerCase()) {
                    return false;
                }
                
                const plexAmount = window.GenesisUtils ? 
                    window.GenesisUtils.weiToPlex(tx.value) : 
                    parseFloat(tx.value) / 1e9;
                const minAmount = 1 * (1 - config.plexPrice.tolerance);
                const maxAmount = 1 * (1 + config.plexPrice.tolerance);
                
                return plexAmount >= minAmount && plexAmount <= maxAmount;
            });
            
            return {
                isAuthorized: !!authTx,
                payment: authTx || null,
                amount: authTx ? (window.GenesisUtils ? 
                    window.GenesisUtils.weiToPlex(authTx.value) : 
                    parseFloat(authTx.value) / 1e9) : 0
            };
        } catch (error) {
            console.error('Error checking authorization:', error);
            return { isAuthorized: false, payment: null, error: error.message };
        }
    },
    
    // MCP-MARKER:METHOD:CHECK_ACCESS_PAYMENTS - Проверить платежи за доступ - специализированный ключ
    async checkAccessPayments(userAddress) {
        const accessAddress = window.GENESIS_CONFIG.addresses.access;
        const usdtAddress = window.GENESIS_CONFIG.usdt.address;
        const config = window.GENESIS_CONFIG;
        
        try {
            // MCP-CHANGE:2025-07-27:FIXED - Исправлена критическая ошибка: теперь проверяем транзакции С адреса пользователя
            // Используем специализированный ключ для подписки
            const transactions = await this.bscRequest({
                module: 'account',
                action: 'tokentx',
                address: userAddress,  // Проверяем транзакции ПОЛЬЗОВАТЕЛЯ
                contractaddress: usdtAddress,  // USDT контракт
                startblock: 0,
                endblock: 99999999,
                sort: 'desc'
            }, 'SUBSCRIPTION');
            
            if (!transactions.result) {
                return {
                    payments: [],
                    totalUSDT: 0,
                    accessDays: 0,
                    isActive: false,
                    daysRemaining: 0
                };
            }
            
            // Фильтруем транзакции ОТ пользователя К кошельку подписки
            const userPayments = transactions.result.filter(tx => {
                // Проверяем что это транзакция на адрес подписки
                if (tx.to.toLowerCase() !== accessAddress.toLowerCase()) {
                    return false;
                }
                
                // ИСПРАВЛЕНО: используем правильную конвертацию USDT
                const usdtAmount = window.GenesisUtils ? 
                    window.GenesisUtils.weiToUSDT(tx.value) : 
                    parseFloat(tx.value) / 1e18;
                const minAmount = 10 * (1 - config.plexPrice.tolerance); // 9.5 USDT
                const maxAmount = 100 * (1 + config.plexPrice.tolerance); // 105.0 USDT (учитываем возможность пополнения на большую сумму)
                
                return usdtAmount >= minAmount && usdtAmount <= maxAmount;
            });
            
            // Считаем общую сумму и дни доступа
            let totalDays = 0;
            let lastPaymentTime = 0;
            
            userPayments.forEach(tx => {
                const usdtAmount = window.GenesisUtils ? 
                    window.GenesisUtils.weiToUSDT(tx.value) : 
                    parseFloat(tx.value) / 1e18;
                const days = Math.floor(usdtAmount); // $1 = 1 день
                totalDays += days;
                lastPaymentTime = Math.max(lastPaymentTime, parseInt(tx.timeStamp));
            });
            
            const now = Math.floor(Date.now() / 1000);
            const subscriptionEnd = lastPaymentTime + (totalDays * 86400);
            const daysRemaining = Math.max(0, Math.ceil((subscriptionEnd - now) / 86400));
            
            return {
                payments: userPayments,
                totalUSDT: userPayments.reduce((sum, tx) => 
                    sum + (window.GenesisUtils ? 
                        window.GenesisUtils.weiToUSDT(tx.value) : 
                        parseFloat(tx.value) / 1e18), 0),
                accessDays: totalDays,
                isActive: daysRemaining > 0,
                daysRemaining: daysRemaining,
                endDate: subscriptionEnd
            };
        } catch (error) {
            console.error('Error checking access payments:', error);
            return {
                payments: [],
                totalUSDT: 0,
                accessDays: 0,
                isActive: false,
                daysRemaining: 0,
                error: error.message
            };
        }
    },
    
    // Получить депозиты пользователя - специализированный ключ
    async getUserDeposits(userAddress) {
        const systemAddress = window.GENESIS_CONFIG.addresses.system;
        const plexAddress = window.GENESIS_CONFIG.plex.address;
        const usdtAddress = window.GENESIS_CONFIG.usdt.address;
        const config = window.GENESIS_CONFIG;
        
        try {
            // ИСПРАВЛЕНО: Получаем PLEX транзакции НА системный адрес
            const plexTransactions = await this.bscRequest({
                module: 'account',
                action: 'tokentx',
                address: systemAddress,  // Проверяем транзакции НА системный адрес
                contractaddress: plexAddress,
                startblock: 0,
                endblock: 99999999,
                sort: 'desc'
            }, 'DEPOSITS');
            
            // ИСПРАВЛЕНО: Получаем USDT транзакции НА системный адрес
            const usdtTransactions = await this.bscRequest({
                module: 'account',
                action: 'tokentx',
                address: systemAddress,  // Проверяем транзакции НА системный адрес
                contractaddress: usdtAddress,
                startblock: 0,
                endblock: 99999999,
                sort: 'desc'
            }, 'DEPOSITS');
            
            const allDeposits = [];
            
            // Обрабатываем PLEX депозиты
            if (plexTransactions.result) {
                const plexSystemTxs = plexTransactions.result.filter(tx => 
                    tx.from.toLowerCase() === userAddress.toLowerCase() &&
                    tx.to.toLowerCase() === systemAddress.toLowerCase()
                );
                
                plexSystemTxs.forEach(tx => {
                    const plexAmount = window.GenesisUtils ? 
                        parseFloat(window.GenesisUtils.weiToPlex(tx.value)) : 
                        parseFloat(tx.value) / 1e9;
                    const usdAmount = window.convertPlexToUSD ? 
                        window.convertPlexToUSD(plexAmount) : 
                        plexAmount * 0.05; // fallback price
                    
                    // Исключаем авторизационные платежи (около $0.05)
                    if (usdAmount < 0.1) return;
                    
                    // Определяем план по сумме с допуском
                    const plan = window.getDepositPlanByAmount(usdAmount);
                    
                    if (plan) {
                        allDeposits.push(this.createDepositObject(tx, plan, usdAmount, plexAmount, 'PLEX'));
                    }
                });
            }
            
            // Обрабатываем USDT депозиты
            if (usdtTransactions.result) {
                const usdtSystemTxs = usdtTransactions.result.filter(tx => 
                    tx.from.toLowerCase() === userAddress.toLowerCase() &&
                    tx.to.toLowerCase() === systemAddress.toLowerCase()
                );
                
                usdtSystemTxs.forEach(tx => {
                    const usdtAmount = window.GenesisUtils ? 
                        window.GenesisUtils.weiToUSDT(tx.value) : 
                        parseFloat(tx.value) / 1e18;
                    
                    // Определяем план по сумме с допуском
                    const plan = window.getDepositPlanByAmount(usdtAmount);
                    
                    if (plan) {
                        allDeposits.push(this.createDepositObject(tx, plan, usdtAmount, usdtAmount, 'USDT'));
                    }
                });
            }
            
            return allDeposits.sort((a, b) => a.timestamp - b.timestamp);
        } catch (error) {
            console.error('Error getting user deposits:', error);
            return [];
        }
    },
    
    // Вспомогательная функция для создания объекта депозита
    createDepositObject(tx, plan, usdAmount, originalAmount, tokenType) {
        const startDate = new Date(tx.timeStamp * 1000);
        const endDate = new Date(startDate.getTime() + (plan.days * 24 * 60 * 60 * 1000));
        const now = new Date();
        const isActive = now < endDate;
        const daysRemaining = isActive ? Math.ceil((endDate - now) / (24 * 60 * 60 * 1000)) : 0;
        
        return {
            txHash: tx.hash,
            plan: plan,
            planId: plan.id,
            amount: usdAmount,
            originalAmount: originalAmount,
            tokenType: tokenType,
            timestamp: startDate,
            endDate: endDate,
            blockNumber: tx.blockNumber,
            status: isActive ? 'ACTIVE' : 'COMPLETED',
            daysRemaining: daysRemaining,
            expectedProfit: (usdAmount * plan.percentage / 100) - usdAmount,
            totalReturn: usdAmount * plan.percentage / 100
        };
    },
    
    // Получить общую статистику депозитов пользователя
    async getUserDepositStats(userAddress) {
        try {
            const deposits = await this.getUserDeposits(userAddress);
            
            const activeDeposits = deposits.filter(d => d.status === 'ACTIVE');
            const completedDeposits = deposits.filter(d => d.status === 'COMPLETED');
            
            const totalInvested = deposits.reduce((sum, d) => sum + d.amount, 0);
            const totalExpectedProfit = deposits.reduce((sum, d) => sum + d.expectedProfit, 0);
            const activeAmount = activeDeposits.reduce((sum, d) => sum + d.amount, 0);
            
            return {
                totalDeposits: deposits.length,
                activeDeposits: activeDeposits.length,
                completedDeposits: completedDeposits.length,
                totalInvested: totalInvested,
                activeAmount: activeAmount,
                totalExpectedProfit: totalExpectedProfit,
                totalExpectedReturn: totalInvested + totalExpectedProfit,
                deposits: deposits
            };
        } catch (error) {
            console.error('Error getting deposit stats:', error);
            return {
                totalDeposits: 0,
                activeDeposits: 0,
                completedDeposits: 0,
                totalInvested: 0,
                activeAmount: 0,
                totalExpectedProfit: 0,
                totalExpectedReturn: 0,
                deposits: []
            };
        }
    },
    
    // Проверить лимиты депозитов для адреса
    async checkDepositLimitsForAddress(userAddress, newAmount) {
        try {
            const stats = await this.getUserDepositStats(userAddress);
            const config = window.GENESIS_CONFIG;
            const maxLimit = 2500; // Максимальный лимит в USD
            
            const totalAfterNew = stats.activeAmount + newAmount;
            
            return {
                currentAmount: stats.activeAmount,
                newAmount: newAmount,
                totalAfter: totalAfterNew,
                maxLimit: maxLimit,
                allowed: totalAfterNew <= maxLimit,
                remaining: Math.max(0, maxLimit - totalAfterNew),
                reason: totalAfterNew > maxLimit ? 
                    `Превышен максимальный лимит депозитов: $${maxLimit}` : null
            };
        } catch (error) {
            console.error('Error checking deposit limits:', error);
            return {
                allowed: false,
                reason: 'Ошибка проверки лимитов депозитов',
                currentAmount: 0,
                newAmount: newAmount,
                totalAfter: newAmount
            };
        }
    },
    
    // Получить историю выплат по депозитам
    async getDepositPayouts(userAddress) {
        try {
            // Здесь будет логика получения выплат
            // Пока возвращаем заглушку
            return [];
        } catch (error) {
            console.error('Error getting deposit payouts:', error);
            return [];
        }
    },
    
    // Проверить существование транзакции
    async checkTransaction(fromAddress, toAddress, amount, currency) {
        try {
            let transactions = [];
            
            if (currency === 'USDT') {
                transactions = await this.bscRequest({
                    module: 'account',
                    action: 'tokentx',
                    address: toAddress,
                    contractaddress: window.GENESIS_CONFIG.usdt.address,
                    startblock: 0,
                    endblock: 99999999,
                    sort: 'desc'
                }, 'DEPOSITS');
            } else if (currency === 'PLEX') {
                transactions = await this.bscRequest({
                    module: 'account',
                    action: 'tokentx',
                    address: toAddress,
                    contractaddress: window.GENESIS_CONFIG.plex.address,
                    startblock: 0,
                    endblock: 99999999,
                    sort: 'desc'
                }, 'DEPOSITS');
            }
            
            if (!transactions.result) return { found: false };
            
            // Ищем транзакцию с допустимым отклонением
            const tolerance = window.GENESIS_CONFIG.plexPrice.tolerance || 0.05;
            const minAmount = amount * (1 - tolerance);
            const maxAmount = amount * (1 + tolerance);
            
            const foundTx = transactions.result.find(tx => {
                if (tx.from.toLowerCase() !== fromAddress.toLowerCase() ||
                    tx.to.toLowerCase() !== toAddress.toLowerCase()) {
                    return false;
                }
                
                let txAmount;
                if (currency === 'USDT') {
                    txAmount = window.GenesisUtils ? 
                        window.GenesisUtils.weiToUSDT(tx.value) : 
                        parseFloat(tx.value) / 1e18;
                } else if (currency === 'PLEX') {
                    txAmount = window.GenesisUtils ? 
                        window.GenesisUtils.weiToPlex(tx.value) : 
                        parseFloat(tx.value) / 1e9;
                }
                
                return txAmount >= minAmount && txAmount <= maxAmount;
            });
            
            return {
                found: !!foundTx,
                transaction: foundTx || null
            };
            
        } catch (error) {
            console.error('Error checking transaction:', error);
            return { found: false, error: error.message };
        }
    },
    
    // Проверить транзакцию по хешу
    async verifyTransaction(txHash) {
        try {
            const status = await this.getTransactionStatus(txHash);
            return status;
        } catch (error) {
            console.error('Error verifying transaction:', error);
            return false;
        }
    }
};

console.log('🌐 GENESIS API loaded');
