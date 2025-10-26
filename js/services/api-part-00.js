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
        const url = new URL(config.bscscan.apiUrl);
        
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
            
