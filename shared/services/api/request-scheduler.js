/**
 * RequestScheduler - Управление лимитами запросов к BSCScan API
 * BSCScan имеет лимит 2 запроса в секунду
 * 
 * MCP-MARKER:SERVICE:REQUEST_SCHEDULER - Планировщик запросов с учетом лимитов
 */

export class RequestScheduler {
    constructor(options = {}) {
        // Настройки лимитов
        this.maxConcurrent = options.maxConcurrent || 2; // Максимум одновременных запросов
        this.requestInterval = options.requestInterval || 500; // Минимальный интервал между запросами (мс)
        this.slidingWindowMs = options.slidingWindowMs || 1000; // Окно для подсчета лимитов (1 секунда)
        this.maxRequestsPerWindow = options.maxRequestsPerWindow || 2; // Максимум запросов в окне
        
        // Состояние
        this.queue = []; // Очередь ожидающих запросов
        this.activeRequests = 0; // Количество активных запросов
        this.requestHistory = []; // История запросов для sliding window
        this.processing = false; // Флаг обработки очереди
        
        // Кэш результатов
        this.cache = new Map();
        this.cacheMaxAge = options.cacheMaxAge || 30000; // TTL кэша (30 секунд по умолчанию)
        
        // Backoff при rate limit
        this.backoffBase = options.backoffBase || 800; // Базовая задержка
        this.backoffMultiplier = 2; // Множитель для экспоненциального backoff
        this.backoffJitter = 120; // Случайная задержка 0-120ms
        this.retryCount = new Map(); // Счетчик повторов для каждого запроса
        
        // Метрики
        this.metrics = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            rateLimitHits: 0,
            cacheHits: 0,
            averageLatency: 0,
            emptyResults: 0
        };
        
        // Статус API
        this.apiHealth = 'UP'; // UP | DEGRADED | THROTTLED
        this.rateLimitWindow = [];
        
        console.log('🚀 RequestScheduler initialized:', {
            maxConcurrent: this.maxConcurrent,
            requestInterval: this.requestInterval,
            slidingWindowMs: this.slidingWindowMs,
            maxRequestsPerWindow: this.maxRequestsPerWindow
        });
    }
    
    /**
     * Добавить запрос в очередь
     * @param {Function} requestFn - Функция запроса
     * @param {Object} options - Опции запроса
     * @returns {Promise} - Результат выполнения запроса
     */
    async schedule(requestFn, options = {}) {
        const requestId = this.generateRequestId();
        const cacheKey = options.cacheKey || this.generateCacheKey(options);
        
        // Проверяем кэш
        if (!options.skipCache && this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheMaxAge) {
                this.metrics.cacheHits++;
                console.log(`📦 Cache hit for ${cacheKey}`);
                return cached.data;
            } else {
                this.cache.delete(cacheKey);
            }
        }
        
        return new Promise((resolve, reject) => {
            const request = {
                id: requestId,
                fn: requestFn,
                resolve,
                reject,
                options,
                cacheKey,
                timestamp: Date.now(),
                attempts: 0
            };
            
            this.queue.push(request);
            this.processQueue();
        });
    }
    
    /**
     * Обработать очередь запросов
     */
    async processQueue() {
        if (this.processing) return;
        this.processing = true;
        
        while (this.queue.length > 0) {
            // Проверяем лимиты
            if (!this.canMakeRequest()) {
                await this.waitForSlot();
                continue;
            }
            
            // Извлекаем запрос из очереди
            const request = this.queue.shift();
            
            // Выполняем запрос
            this.executeRequest(request);
            
            // Ждем минимальный интервал
            await this.delay(this.requestInterval);
        }
        
        this.processing = false;
    }
    
    /**
     * Проверить, можно ли выполнить запрос
     */
    canMakeRequest() {
        // Проверяем количество активных запросов
        if (this.activeRequests >= this.maxConcurrent) {
            return false;
        }
        
        // Проверяем sliding window
        const now = Date.now();
        this.requestHistory = this.requestHistory.filter(
            time => now - time < this.slidingWindowMs
        );
        
        if (this.requestHistory.length >= this.maxRequestsPerWindow) {
            return false;
        }
        
        return true;
    }
    
    /**
     * Подождать освобождения слота
     */
    async waitForSlot() {
        const waitTime = this.calculateWaitTime();
        console.log(`⏳ Waiting ${waitTime}ms for rate limit slot...`);
        await this.delay(waitTime);
    }
    
    /**
     * Рассчитать время ожидания
     */
    calculateWaitTime() {
        const now = Date.now();
        const oldestRequest = Math.min(...this.requestHistory);
        const timeSinceOldest = now - oldestRequest;
        const baseWait = Math.max(this.slidingWindowMs - timeSinceOldest, this.requestInterval);
        
        // Добавляем jitter для предотвращения синхронных запросов
        const jitter = Math.random() * this.backoffJitter;
        
        return baseWait + jitter;
    }
    
    /**
     * Выполнить запрос
     */
    async executeRequest(request) {
        const startTime = Date.now();
        this.activeRequests++;
        this.requestHistory.push(startTime);
        request.attempts++;
        
        try {
            this.metrics.totalRequests++;
            
            // Выполняем функцию запроса
            const result = await request.fn();
            
            // Проверяем результат
            if (this.isRateLimitError(result)) {
                throw new Error('RATE_LIMIT');
            }
            
            if (this.isEmptyResult(result)) {
                this.metrics.emptyResults++;
                console.log(`📭 Empty result for request ${request.id}`);
            }
            
            // Сохраняем в кэш
            if (!request.options.skipCache && result) {
                this.cache.set(request.cacheKey, {
                    data: result,
                    timestamp: Date.now()
                });
            }
            
            // Обновляем метрики
            const latency = Date.now() - startTime;
            this.updateLatency(latency);
            this.metrics.successfulRequests++;
            
            // Обновляем статус API
            this.updateApiHealth();
            
            // Возвращаем результат
            request.resolve(result);
            
        } catch (error) {
            console.error(`❌ Request ${request.id} failed:`, error.message);
            
            // Обработка rate limit
            if (error.message === 'RATE_LIMIT' || error.message.includes('rate limit')) {
                this.metrics.rateLimitHits++;
                this.updateApiHealth('THROTTLED');
                
                // Retry с экспоненциальным backoff
                if (request.attempts < 3) {
                    const backoffTime = this.calculateBackoff(request.attempts);
                    console.log(`🔄 Retrying request ${request.id} after ${backoffTime}ms (attempt ${request.attempts})`);
                    
                    await this.delay(backoffTime);
                    this.queue.unshift(request); // Добавляем в начало очереди
                } else {
                    this.metrics.failedRequests++;
                    request.reject(error);
                }
            } else {
                this.metrics.failedRequests++;
                request.reject(error);
            }
        } finally {
            this.activeRequests--;
        }
    }
    
    /**
     * Рассчитать время backoff
     */
    calculateBackoff(attemptNumber) {
        const exponentialDelay = this.backoffBase * Math.pow(this.backoffMultiplier, attemptNumber - 1);
        const jitter = Math.random() * this.backoffJitter;
        return exponentialDelay + jitter;
    }
    
    /**
     * Проверить, является ли ошибка rate limit
     */
    isRateLimitError(result) {
        if (!result) return false;
        
        if (typeof result === 'string') {
            return result.toLowerCase().includes('rate limit') || 
                   result.toLowerCase().includes('too many requests');
        }
        
        if (result.status === '0' && result.message) {
            return result.message.toLowerCase().includes('rate limit');
        }
        
        return false;
    }
    
    /**
     * Проверить, является ли результат пустым
     */
    isEmptyResult(result) {
        if (!result) return true;
        
        if (result.status === '1' && Array.isArray(result.result)) {
            return result.result.length === 0;
        }
        
        if (result.status === '0' && result.message) {
            return result.message.toLowerCase().includes('no transactions found') ||
                   result.message.toLowerCase().includes('no records found');
        }
        
        return false;
    }
    
    /**
     * Обновить среднюю задержку
     */
    updateLatency(latency) {
        const totalRequests = this.metrics.successfulRequests + 1;
        const currentAvg = this.metrics.averageLatency;
        this.metrics.averageLatency = ((currentAvg * (totalRequests - 1)) + latency) / totalRequests;
    }
    
    /**
     * Обновить статус API
     */
    updateApiHealth(forcedStatus = null) {
        if (forcedStatus) {
            this.apiHealth = forcedStatus;
            return;
        }
        
        // Обновляем окно rate limit
        const now = Date.now();
        this.rateLimitWindow = this.rateLimitWindow.filter(
            time => now - time < 60000 // Последняя минута
        );
        
        // Определяем статус на основе метрик
        const rateLimitRatio = this.rateLimitWindow.length / 60; // Hits per second
        
        if (rateLimitRatio > 0.5) {
            this.apiHealth = 'THROTTLED';
        } else if (rateLimitRatio > 0.2) {
            this.apiHealth = 'DEGRADED';
        } else {
            this.apiHealth = 'UP';
        }
    }
    
    /**
     * Генерировать ID запроса
     */
    generateRequestId() {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * Генерировать ключ кэша
     */
    generateCacheKey(options) {
        return JSON.stringify(options);
    }
    
    /**
     * Задержка
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * Очистить кэш
     */
    clearCache() {
        this.cache.clear();
        console.log('🗑️ Cache cleared');
    }
    
    /**
     * Получить метрики
     */
    getMetrics() {
        return {
            ...this.metrics,
            queueLength: this.queue.length,
            activeRequests: this.activeRequests,
            cacheSize: this.cache.size,
            apiHealth: this.apiHealth
        };
    }
    
    /**
     * Сбросить метрики
     */
    resetMetrics() {
        this.metrics = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            rateLimitHits: 0,
            cacheHits: 0,
            averageLatency: 0,
            emptyResults: 0
        };
        console.log('📊 Metrics reset');
    }
}

// Singleton экземпляр для всего приложения
let schedulerInstance = null;

/**
 * Получить или создать экземпляр RequestScheduler
 */
export function getRequestScheduler(options = {}) {
    if (!schedulerInstance) {
        schedulerInstance = new RequestScheduler(options);
    }
    return schedulerInstance;
}

// Export default
export default RequestScheduler;
