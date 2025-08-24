// core/event-bus.js
// Event Bus для коммуникации между модулями

class EventBus {
    constructor() {
        this.events = new Map();
        this.history = [];
        this.maxHistorySize = 100;
        this.debug = false;
        this.wildcardHandlers = new Set();
    }
    
    /**
     * Subscribe to an event
     * @param {string} event - Event name (use * for wildcard)
     * @param {Function} handler - Event handler function
     * @returns {Function} Unsubscribe function
     */
    on(event, handler) {
        if (typeof handler !== 'function') {
            throw new Error('Event handler must be a function');
        }
        
        // Handle wildcard subscriptions
        if (event === '*') {
            this.wildcardHandlers.add(handler);
            
            if (this.debug) {
                console.log(`[EventBus] Wildcard handler registered`);
            }
            
            return () => this.wildcardHandlers.delete(handler);
        }
        
        // Regular event subscription
        if (!this.events.has(event)) {
            this.events.set(event, new Set());
        }
        
        this.events.get(event).add(handler);
        
        if (this.debug) {
            console.log(`[EventBus] Handler registered for: ${event}`);
        }
        
        // Return unsubscribe function
        return () => this.off(event, handler);
    }
    
    /**
     * Subscribe to an event once
     * @param {string} event - Event name
     * @param {Function} handler - Event handler function
     * @returns {Function} Unsubscribe function
     */
    once(event, handler) {
        const wrappedHandler = (data) => {
            handler(data);
            this.off(event, wrappedHandler);
        };
        
        return this.on(event, wrappedHandler);
    }
    
    /**
     * Unsubscribe from an event
     * @param {string} event - Event name
     * @param {Function} handler - Event handler function
     */
    off(event, handler) {
        if (event === '*') {
            this.wildcardHandlers.delete(handler);
            return;
        }
        
        if (this.events.has(event)) {
            this.events.get(event).delete(handler);
            
            // Clean up empty event sets
            if (this.events.get(event).size === 0) {
                this.events.delete(event);
            }
            
            if (this.debug) {
                console.log(`[EventBus] Handler unregistered for: ${event}`);
            }
        }
    }
    
    /**
     * Emit an event
     * @param {string} event - Event name
     * @param {*} data - Event data
     */
    emit(event, data = {}) {
        const timestamp = Date.now();
        
        if (this.debug) {
            console.log(`[EventBus] Emit: ${event}`, data);
        }
        
        // Add to history
        this.addToHistory(event, data, timestamp);
        
        // Call specific event handlers
        if (this.events.has(event)) {
            const handlers = this.events.get(event);
            handlers.forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                    console.error(`[EventBus] Error in handler for ${event}:`, error);
                }
            });
        }
        
        // Call wildcard handlers
        this.wildcardHandlers.forEach(handler => {
            try {
                handler(event, data);
            } catch (error) {
                console.error(`[EventBus] Error in wildcard handler:`, error);
            }
        });
    }
    
    /**
     * Emit an event asynchronously
     * @param {string} event - Event name
     * @param {*} data - Event data
     * @returns {Promise} Promise that resolves when all handlers complete
     */
    async emitAsync(event, data = {}) {
        const timestamp = Date.now();
        
        if (this.debug) {
            console.log(`[EventBus] EmitAsync: ${event}`, data);
        }
        
        // Add to history
        this.addToHistory(event, data, timestamp);
        
        const promises = [];
        
        // Call specific event handlers
        if (this.events.has(event)) {
            const handlers = this.events.get(event);
            handlers.forEach(handler => {
                promises.push(
                    Promise.resolve().then(() => handler(data)).catch(error => {
                        console.error(`[EventBus] Error in async handler for ${event}:`, error);
                    })
                );
            });
        }
        
        // Call wildcard handlers
        this.wildcardHandlers.forEach(handler => {
            promises.push(
                Promise.resolve().then(() => handler(event, data)).catch(error => {
                    console.error(`[EventBus] Error in async wildcard handler:`, error);
                })
            );
        });
        
        await Promise.all(promises);
    }
    
    /**
     * Wait for an event to occur
     * @param {string} event - Event name
     * @param {number} timeout - Timeout in milliseconds (optional)
     * @returns {Promise} Promise that resolves with event data
     */
    waitFor(event, timeout = 0) {
        return new Promise((resolve, reject) => {
            let timeoutId;
            
            // Set up one-time listener
            const unsubscribe = this.once(event, (data) => {
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
                resolve(data);
            });
            
            // Set up timeout if specified
            if (timeout > 0) {
                timeoutId = setTimeout(() => {
                    unsubscribe();
                    reject(new Error(`Timeout waiting for event: ${event}`));
                }, timeout);
            }
        });
    }
    
    /**
     * Clear all event handlers
     */
    clear() {
        this.events.clear();
        this.wildcardHandlers.clear();
        
        if (this.debug) {
            console.log('[EventBus] All handlers cleared');
        }
    }
    
    /**
     * Clear handlers for a specific event
     * @param {string} event - Event name
     */
    clearEvent(event) {
        if (event === '*') {
            this.wildcardHandlers.clear();
        } else {
            this.events.delete(event);
        }
        
        if (this.debug) {
            console.log(`[EventBus] Handlers cleared for: ${event}`);
        }
    }
    
    /**
     * Get number of handlers for an event
     * @param {string} event - Event name
     * @returns {number} Number of handlers
     */
    getHandlerCount(event) {
        if (event === '*') {
            return this.wildcardHandlers.size;
        }
        
        return this.events.has(event) ? this.events.get(event).size : 0;
    }
    
    /**
     * Get list of all registered events
     * @returns {string[]} Array of event names
     */
    getEvents() {
        return Array.from(this.events.keys());
    }
    
    /**
     * Add event to history
     * @param {string} event - Event name
     * @param {*} data - Event data
     * @param {number} timestamp - Event timestamp
     */
    addToHistory(event, data, timestamp) {
        this.history.push({
            event,
            data,
            timestamp
        });
        
        // Limit history size
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        }
    }
    
    /**
     * Get event history
     * @param {string} event - Optional event name filter
     * @returns {Array} Event history
     */
    getHistory(event = null) {
        if (event) {
            return this.history.filter(item => item.event === event);
        }
        return [...this.history];
    }
    
    /**
     * Clear event history
     */
    clearHistory() {
        this.history = [];
        
        if (this.debug) {
            console.log('[EventBus] History cleared');
        }
    }
    
    /**
     * Enable/disable debug mode
     * @param {boolean} enabled - Debug mode state
     */
    setDebug(enabled) {
        this.debug = enabled;
        console.log(`[EventBus] Debug mode ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * Create a namespaced event bus
     * @param {string} namespace - Namespace prefix
     * @returns {Object} Namespaced event bus interface
     */
    namespace(namespace) {
        const prefix = namespace + ':';
        
        return {
            on: (event, handler) => this.on(prefix + event, handler),
            once: (event, handler) => this.once(prefix + event, handler),
            off: (event, handler) => this.off(prefix + event, handler),
            emit: (event, data) => this.emit(prefix + event, data),
            emitAsync: (event, data) => this.emitAsync(prefix + event, data),
            waitFor: (event, timeout) => this.waitFor(prefix + event, timeout),
            clearEvent: (event) => this.clearEvent(prefix + event)
        };
    }
}

// Create singleton instance
const eventBus = new EventBus();

// Export both class and instance
export { EventBus, eventBus };
export default eventBus;
