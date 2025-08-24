/**
 * Price Monitor Service for GENESIS Platform
 * MCP-MARKER:SERVICE:PRICE_MONITOR:MAIN - Сервис мониторинга цен токенов
 */

export class PriceMonitor {
    constructor(config = {}) {
        this.config = {
            updateInterval: config.updateInterval || 30000, // 30 секунд по умолчанию
            tokens: config.tokens || ['BNB', 'USDT'],
            customTokens: config.customTokens || {
                PLEX: {
                    contract: '0x1234...', // Адрес контракта PLEX
                    decimals: 18,
                    symbol: 'PLEX'
                }
            }
        };
        
        this.prices = new Map();
        this.updateTimer = null;
        this.listeners = new Set();
        this.lastUpdate = null;
        this.isUpdating = false;
        
        // Инициализация цен по умолчанию
        this.initDefaultPrices();
    }

    /**
     * MCP-MARKER:METHOD:PRICE_MONITOR:INIT_DEFAULTS - Инициализация цен по умолчанию
     */
    initDefaultPrices() {
        // Устанавливаем начальные цены (будут обновлены при первом запросе)
        this.prices.set('BNB', 320); // Примерная цена BNB
        this.prices.set('USDT', 1); // USDT всегда = $1
        this.prices.set('PLEX', 0.01); // Начальная цена PLEX
    }

    /**
     * MCP-MARKER:METHOD:PRICE_MONITOR:START - Запуск мониторинга цен
     */
    async start() {
        console.log('[PriceMonitor] Starting price monitoring...');
        
        // Первое обновление сразу
        await this.updatePrices();
        
        // Запуск периодического обновления
        this.updateTimer = setInterval(() => {
            this.updatePrices();
        }, this.config.updateInterval);
        
        console.log(`[PriceMonitor] Monitoring started, updating every ${this.config.updateInterval/1000}s`);
    }

    /**
     * MCP-MARKER:METHOD:PRICE_MONITOR:STOP - Остановка мониторинга
     */
    stop() {
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
            this.updateTimer = null;
            console.log('[PriceMonitor] Monitoring stopped');
        }
    }

    /**
     * MCP-MARKER:METHOD:PRICE_MONITOR:UPDATE_PRICES - Обновление цен токенов
     */
    async updatePrices() {
        if (this.isUpdating) {
            console.log('[PriceMonitor] Already updating, skipping...');
            return;
        }
        
        this.isUpdating = true;
        
        try {
            // Пробуем получить цены из разных источников
            const prices = await this.fetchPricesFromAPI();
            
            if (prices && Object.keys(prices).length > 0) {
                // Обновляем цены
                Object.entries(prices).forEach(([token, price]) => {
                    this.prices.set(token, price);
                });
                
                this.lastUpdate = Date.now();
                
                // Уведомляем слушателей
                this.notifyListeners();
                
                console.log('[PriceMonitor] Prices updated:', Object.fromEntries(this.prices));
            } else {
                console.warn('[PriceMonitor] No prices received, using cached values');
            }
            
        } catch (error) {
            console.error('[PriceMonitor] Error updating prices:', error);
            // Используем кешированные цены
            this.useFallbackPrices();
        } finally {
            this.isUpdating = false;
        }
    }

    /**
     * MCP-MARKER:METHOD:PRICE_MONITOR:FETCH_API - Получение цен из API
     */
    async fetchPricesFromAPI() {
        try {
            // Попытка 1: CoinGecko API (бесплатный лимит)
            const prices = await this.fetchFromCoinGecko();
            if (prices) return prices;
            
        } catch (error) {
            console.error('[PriceMonitor] CoinGecko API error:', error);
        }
        
        try {
            // Попытка 2: Binance API
            const prices = await this.fetchFromBinance();
            if (prices) return prices;
            
        } catch (error) {
            console.error('[PriceMonitor] Binance API error:', error);
        }
        
        try {
            // Попытка 3: PancakeSwap API для BSC токенов
            const prices = await this.fetchFromPancakeSwap();
            if (prices) return prices;
            
        } catch (error) {
            console.error('[PriceMonitor] PancakeSwap API error:', error);
        }
        
        return null;
    }

    /**
     * MCP-MARKER:METHOD:PRICE_MONITOR:FETCH_COINGECKO - Получение цен из CoinGecko
     */
    async fetchFromCoinGecko() {
        try {
            // CoinGecko Simple Price API (без ключа, лимит 10-50 запросов в минуту)
            const ids = 'binancecoin,tether';
            const vs_currencies = 'usd';
            const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=${vs_currencies}`;
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`CoinGecko API error: ${response.status}`);
            }
            
            const data = await response.json();
            
            const prices = {};
            if (data.binancecoin?.usd) prices.BNB = data.binancecoin.usd;
            if (data.tether?.usd) prices.USDT = data.tether.usd;
            
            return prices;
            
        } catch (error) {
            console.error('[PriceMonitor] CoinGecko fetch error:', error);
            return null;
        }
    }

    /**
     * MCP-MARKER:METHOD:PRICE_MONITOR:FETCH_BINANCE - Получение цен из Binance
     */
    async fetchFromBinance() {
        try {
            const prices = {};
            
            // Binance public API для BNB/USDT
            const bnbResponse = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BNBUSDT');
            if (bnbResponse.ok) {
                const bnbData = await bnbResponse.json();
                prices.BNB = parseFloat(bnbData.price);
            }
            
            // USDT всегда = 1
            prices.USDT = 1;
            
            return Object.keys(prices).length > 0 ? prices : null;
            
        } catch (error) {
            console.error('[PriceMonitor] Binance fetch error:', error);
            return null;
        }
    }

    /**
     * MCP-MARKER:METHOD:PRICE_MONITOR:FETCH_PANCAKESWAP - Получение цен из PancakeSwap
     */
    async fetchFromPancakeSwap() {
        try {
            // PancakeSwap API для BSC токенов
            const response = await fetch('https://api.pancakeswap.info/api/v2/tokens');
            
            if (!response.ok) {
                throw new Error(`PancakeSwap API error: ${response.status}`);
            }
            
            const data = await response.json();
            const prices = {};
            
            // Ищем нужные токены
            if (data.data) {
                // BNB (WBNB на PancakeSwap)
                const wbnb = data.data['0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'];
                if (wbnb) {
                    prices.BNB = parseFloat(wbnb.price);
                }
                
                // USDT
                const usdt = data.data['0x55d398326f99059fF775485246999027B3197955'];
                if (usdt) {
                    prices.USDT = parseFloat(usdt.price);
                }
                
                // PLEX (если есть на PancakeSwap)
                // Нужно добавить реальный адрес контракта PLEX
                // const plex = data.data[this.config.customTokens.PLEX.contract];
                // if (plex) prices.PLEX = parseFloat(plex.price);
            }
            
            return Object.keys(prices).length > 0 ? prices : null;
            
        } catch (error) {
            console.error('[PriceMonitor] PancakeSwap fetch error:', error);
            return null;
        }
    }

    /**
     * MCP-MARKER:METHOD:PRICE_MONITOR:USE_FALLBACK - Использование резервных цен
     */
    useFallbackPrices() {
        // Если не можем получить реальные цены, используем последние известные
        // или устанавливаем приблизительные
        if (this.prices.size === 0) {
            this.prices.set('BNB', 320);
            this.prices.set('USDT', 1);
            this.prices.set('PLEX', 0.01);
        }
        
        console.log('[PriceMonitor] Using fallback prices');
    }

    /**
     * MCP-MARKER:METHOD:PRICE_MONITOR:GET_PRICE - Получение цены токена
     */
    getPrice(token) {
        return this.prices.get(token) || 0;
    }

    /**
     * MCP-MARKER:METHOD:PRICE_MONITOR:GET_ALL_PRICES - Получение всех цен
     */
    getAllPrices() {
        return Object.fromEntries(this.prices);
    }

    /**
     * MCP-MARKER:METHOD:PRICE_MONITOR:CONVERT_TO_USD - Конвертация в USD
     */
    convertToUSD(amount, token) {
        const price = this.getPrice(token);
        return amount * price;
    }

    /**
     * MCP-MARKER:METHOD:PRICE_MONITOR:CONVERT_FROM_USD - Конвертация из USD
     */
    convertFromUSD(usdAmount, token) {
        const price = this.getPrice(token);
        if (price === 0) return 0;
        return usdAmount / price;
    }

    /**
     * MCP-MARKER:METHOD:PRICE_MONITOR:FORMAT_USD - Форматирование USD
     */
    formatUSD(amount, includeSign = true) {
        const formatted = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
        
        return includeSign ? formatted : formatted.replace('$', '');
    }

    /**
     * MCP-MARKER:METHOD:PRICE_MONITOR:SUBSCRIBE - Подписка на обновления цен
     */
    subscribe(callback) {
        if (typeof callback === 'function') {
            this.listeners.add(callback);
            
            // Сразу отправляем текущие цены
            callback(this.getAllPrices());
            
            // Возвращаем функцию отписки
            return () => this.unsubscribe(callback);
        }
    }

    /**
     * MCP-MARKER:METHOD:PRICE_MONITOR:UNSUBSCRIBE - Отписка от обновлений
     */
    unsubscribe(callback) {
        this.listeners.delete(callback);
    }

    /**
     * MCP-MARKER:METHOD:PRICE_MONITOR:NOTIFY - Уведомление слушателей
     */
    notifyListeners() {
        const prices = this.getAllPrices();
        this.listeners.forEach(callback => {
            try {
                callback(prices);
            } catch (error) {
                console.error('[PriceMonitor] Listener error:', error);
            }
        });
        
        // Также отправляем событие через EventBus если доступен
        if (window.eventBus) {
            window.eventBus.emit('prices:updated', prices);
        }
    }

    /**
     * MCP-MARKER:METHOD:PRICE_MONITOR:GET_LAST_UPDATE - Время последнего обновления
     */
    getLastUpdate() {
        return this.lastUpdate;
    }

    /**
     * MCP-MARKER:METHOD:PRICE_MONITOR:IS_STALE - Проверка устаревших данных
     */
    isDataStale() {
        if (!this.lastUpdate) return true;
        
        const staleThreshold = 5 * 60 * 1000; // 5 минут
        return Date.now() - this.lastUpdate > staleThreshold;
    }

    /**
     * MCP-MARKER:METHOD:PRICE_MONITOR:CALCULATE_PORTFOLIO - Расчет стоимости портфеля
     */
    calculatePortfolioValue(holdings) {
        let totalUSD = 0;
        
        Object.entries(holdings).forEach(([token, amount]) => {
            totalUSD += this.convertToUSD(amount, token);
        });
        
        return totalUSD;
    }

    /**
     * MCP-MARKER:METHOD:PRICE_MONITOR:GET_PRICE_CHANGE - Получение изменения цены
     */
    async getPriceChange(token, period = '24h') {
        // Для полноценной реализации нужно хранить историю цен
        // Пока возвращаем заглушку
        return {
            change: 0,
            changePercent: 0,
            period: period
        };
    }
}

// Экспортируем singleton
const priceMonitor = new PriceMonitor({
    updateInterval: 30000, // Обновление каждые 30 секунд
    tokens: ['BNB', 'USDT', 'PLEX']
});

// Автоматический запуск при импорте
if (typeof window !== 'undefined') {
    // Запускаем мониторинг после загрузки страницы
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            priceMonitor.start();
        });
    } else {
        priceMonitor.start();
    }
    
    // Делаем доступным глобально для отладки
    window.PriceMonitor = priceMonitor;
}

export default priceMonitor;