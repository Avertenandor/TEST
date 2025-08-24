// shared/services/request-scheduler.js
// Централизованный планировщик запросов для управления rate limits

class RequestScheduler {
    constructor(options = {}) {
        // Configuration
        this.maxConcurrent = options.maxConcurrent || 2; // Max concurrent requests
        this.requestsPerSecond = options.requestsPerSecond || 2; // Rate limit
        this.minInterval = 1000 / this.requestsPerSecond; // Min time between requests (500ms for 2/sec)
        this.maxRetries = options.maxRetries || 3;
        this.baseBackoff = options.baseBackoff || 800; // Base backoff time in ms
        this.maxBackoff = options.maxBackoff || 30000; // Max backoff time in ms
        
        // State
        this.queue = [];
        this.activeRequests = 0;
        this.lastRequestTime = 0;
        this.rateLimitHits = 0;
        this.totalRequests = 0;
        this.successfulRequests = 0;
        this.failedRequests = 0;
        
        // Cache
        this.cache = new Map();
        this.cacheOptions = {
            enabled: options.cacheEnabled !== false,
            ttl: options.cacheTTL || 60000, // Default 60 seconds
            maxSize: options.cacheMaxSize || 100
        };
        
        // Health state
        this.health = {
            status: 'UP', // UP, DEGRADED, THROTTLED, DOWN
            lastUpdate: Date.now(),
            rateLimitPercentage: 0
        };
        
        // Debug mode
        this.debug = options.debug || false;
        
        // Start processing queue
        this.processQueue();
    }
    
    /**
     * Schedule a request
     * @param {Function} requestFn - Function that returns a Promise
     * @param {Object} options - Request options
     * @returns {Promise} Request result
     */
    async schedule(requestFn, options = {}) {
        const {
            cacheKey = null,
            cacheTTL = this.cacheOptions.ttl,
            priority = 0,
            retries = this.maxRetries,
            correlationId = null
        } = options;
        
        // Check cache first
        if (this.cacheOptions.enabled && cacheKey) {
            const cachedResult = this.getFromCache(cacheKey);
            if (cachedResult !== null) {
                if (this.debug) {
                    console.log(`[RequestScheduler] Cache hit for: ${cacheKey}`);
                }
                return cachedResult;
            }
        }
        
        // Create request object
        const request = {
            id: this.generateId(),
            correlationId,
            requestFn,
            cacheKey,
            cacheTTL,
            priority,
            retries,
            retriesLeft: retries,
            timestamp: Date.now(),
            resolve: null,
            reject: null
        };
        
        // Create promise for the request
        const promise = new Promise((resolve, reject) => {
            request.resolve = resolve;
            request.reject = reject;
        });
        
        // Add to queue with priority
        this.addToQueue(request);
        
        // Update stats
        this.totalRequests++;
        
        if (this.debug) {
            console.log(`[RequestScheduler] Request queued: ${request.id}, queue size: ${this.queue.length}`);
        }
        
        return promise;
    }
    
    /**
     * Add request to queue with priority
     * @param {Object} request - Request object
     */
    addToQueue(request) {
        // Find position based on priority (higher priority = earlier execution)
        let insertIndex = this.queue.length;
        for (let i = 0; i < this.queue.length; i++) {
            if (request.priority > this.queue[i].priority) {
                insertIndex = i;
                break;
            }
        }
        
        this.queue.splice(insertIndex, 0, request);
    }
    
    /**
     * Process the request queue
     */
    async processQueue() {
        while (true) {
            // Check if we can process a request
            if (this.queue.length > 0 && this.activeRequests < this.maxConcurrent) {
                const now = Date.now();
                const timeSinceLastRequest = now - this.lastRequestTime;
                
                // Check rate limit
                if (timeSinceLastRequest >= this.minInterval) {
                    const request = this.queue.shift();
                    this.lastRequestTime = now;
                    this.activeRequests++;
                    
                    // Process the request
                    this.processRequest(request);
                } else {
                    // Wait for rate limit
                    const waitTime = this.minInterval - timeSinceLastRequest;
                    await this.sleep(waitTime);
                }
            } else {
                // No requests to process or at max concurrent
                await this.sleep(100);
            }
            
            // Update health status periodically
            if (Date.now() - this.health.lastUpdate > 5000) {
                this.updateHealthStatus();
            }
        }
    }
    
    /**
     * Process a single request
     * @param {Object} request - Request object
     */
    async processRequest(request) {
        if (this.debug) {
            console.log(`[RequestScheduler] Processing request: ${request.id}`);
        }
        
        try {
            // Execute the request
            const result = await request.requestFn();
            
            // Cache the result if needed
            if (this.cacheOptions.enabled && request.cacheKey) {
                this.addToCache(request.cacheKey, result, request.cacheTTL);
            }
            
            // Resolve the promise
            request.resolve(result);
            
            // Update stats
            this.successfulRequests++;
            
            if (this.debug) {
                console.log(`[RequestScheduler] Request successful: ${request.id}`);
            }
            
        } catch (error) {
            // Check if it's a rate limit error
            if (this.isRateLimitError(error)) {
                this.rateLimitHits++;
                
                if (this.debug) {
                    console.log(`[RequestScheduler] Rate limit hit for request: ${request.id}`);
                }
                
                // Retry with exponential backoff
                if (request.retriesLeft > 0) {
                    request.retriesLeft--;
                    const backoffTime = this.calculateBackoff(request.retries - request.retriesLeft);
                    
                    if (this.debug) {
                        console.log(`[RequestScheduler] Retrying request ${request.id} in ${backoffTime}ms`);
                    }
                    
                    // Add back to queue after backoff
                    setTimeout(() => {
                        this.addToQueue(request);
                    }, backoffTime);
                } else {
                    // No more retries
                    request.reject(error);
                    this.failedRequests++;
                }
            } else {
                // Other error, don't retry
                request.reject(error);
                this.failedRequests++;
                
                if (this.debug) {
                    console.error(`[RequestScheduler] Request failed: ${request.id}`, error);
                }
            }
        } finally {
            this.activeRequests--;
        }
    }
    
    /**
     * Check if error is a rate limit error
     * @param {Error} error - Error object
     * @returns {boolean} True if rate limit error
     */
    isRateLimitError(error) {
        const message = error.message?.toLowerCase() || '';
        return (
            message.includes('rate limit') ||
            message.includes('too many requests') ||
            message.includes('throttled') ||
            (error.response?.status === 429) ||
            (error.code === 'RATE_LIMIT')
        );
    }
    
    /**
     * Calculate exponential backoff with jitter
     * @param {number} attempt - Attempt number
     * @returns {number} Backoff time in milliseconds
     */
    calculateBackoff(attempt) {
        // Exponential backoff: base * 2^(attempt-1) + jitter
        const exponential = this.baseBackoff * Math.pow(2, attempt - 1);
        const jitter = Math.random() * 120; // 0-120ms jitter
        const backoff = Math.min(exponential + jitter, this.maxBackoff);
        
        return Math.floor(backoff);
    }
    
    /**
     * Get from cache
     * @param {string} key - Cache key
     * @returns {*} Cached value or null
     */
    getFromCache(key) {
        const cached = this.cache.get(key);
        
        if (cached) {
            const now = Date.now();
            if (now - cached.timestamp < cached.ttl) {
                return cached.value;
            } else {
                // Expired
                this.cache.delete(key);
            }
        }
        
        return null;
    }
    
    /**
     * Add to cache
     * @param {string} key - Cache key
     * @param {*} value - Value to cache
     * @param {number} ttl - Time to live in milliseconds
     */
    addToCache(key, value, ttl) {
        // Check cache size limit
        if (this.cache.size >= this.cacheOptions.maxSize) {
            // Remove oldest entry
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        
        this.cache.set(key, {
            value,
            timestamp: Date.now(),
            ttl
        });
    }
    
    /**
     * Clear cache
     * @param {string} pattern - Optional pattern to match keys
     */
    clearCache(pattern = null) {
        if (pattern) {
            // Clear matching keys
            for (const key of this.cache.keys()) {
                if (key.includes(pattern)) {
                    this.cache.delete(key);
                }
            }
        } else {
            // Clear all
            this.cache.clear();
        }
        
        if (this.debug) {
            console.log(`[RequestScheduler] Cache cleared${pattern ? ` for pattern: ${pattern}` : ''}`);
        }
    }
    
    /**
     * Update health status
     */
    updateHealthStatus() {
        const rateLimitPercentage = (this.rateLimitHits / Math.max(this.totalRequests, 1)) * 100;
        
        // Determine health status
        if (rateLimitPercentage > 50) {
            this.health.status = 'THROTTLED';
        } else if (rateLimitPercentage > 20) {
            this.health.status = 'DEGRADED';
        } else if (this.failedRequests / Math.max(this.totalRequests, 1) > 0.5) {
            this.health.status = 'DOWN';
        } else {
            this.health.status = 'UP';
        }
        
        this.health.rateLimitPercentage = rateLimitPercentage;
        this.health.lastUpdate = Date.now();
    }
    
    /**
     * Get statistics
     * @returns {Object} Statistics
     */
    getStats() {
        return {
            queueSize: this.queue.length,
            activeRequests: this.activeRequests,
            totalRequests: this.totalRequests,
            successfulRequests: this.successfulRequests,
            failedRequests: this.failedRequests,
            rateLimitHits: this.rateLimitHits,
            cacheSize: this.cache.size,
            health: { ...this.health }
        };
    }
    
    /**
     * Generate unique ID
     * @returns {string} Unique ID
     */
    generateId() {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * Sleep helper
     * @param {number} ms - Milliseconds to sleep
     * @returns {Promise} Promise that resolves after sleep
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * Set debug mode
     * @param {boolean} enabled - Debug mode enabled
     */
    setDebug(enabled) {
        this.debug = enabled;
        console.log(`[RequestScheduler] Debug mode ${enabled ? 'enabled' : 'disabled'}`);
    }
}

// Create singleton instance for BSC API
const bscScheduler = new RequestScheduler({
    maxConcurrent: 2,
    requestsPerSecond: 2,
    cacheEnabled: true,
    cacheTTL: 30000, // 30 seconds cache
    debug: true
});

// Export both class and instance
export { RequestScheduler, bscScheduler };
export default bscScheduler;