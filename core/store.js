// core/store.js
// Глобальное хранилище состояния для GENESIS

export class Store {
    constructor(initialState = {}) {
        this.state = this.deepClone(initialState);
        this.subscribers = new Map();
        this.history = [];
        this.maxHistorySize = 50;
        this.debug = false;
    }
    
    /**
     * Get value from store by path
     * @param {string} path - Dot-notation path (e.g., 'user.address')
     * @param {*} defaultValue - Default value if path doesn't exist
     * @returns {*} Value at path or default value
     */
    get(path, defaultValue = undefined) {
        if (!path) return this.state;
        
        const keys = path.split('.');
        let value = this.state;
        
        for (const key of keys) {
            if (value && typeof value === 'object' && key in value) {
                value = value[key];
            } else {
                return defaultValue;
            }
        }
        
        return value;
    }
    
    /**
     * Set value in store by path
     * @param {string} path - Dot-notation path
     * @param {*} value - Value to set
     */
    set(path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        
        // Navigate to parent object, creating path if needed
        let target = this.state;
        for (const key of keys) {
            if (!(key in target) || typeof target[key] !== 'object') {
                target[key] = {};
            }
            target = target[key];
        }
        
        // Store old value for history
        const oldValue = target[lastKey];
        
        // Set new value
        target[lastKey] = value;
        
        // Add to history
        this.addToHistory('set', path, value, oldValue);
        
        // Notify subscribers
        this.notify(path, value, oldValue);
        
        if (this.debug) {
            console.log(`[Store] Set ${path}:`, value);
        }
    }
    
    /**
     * Update multiple values at once
     * @param {Object} updates - Object with path-value pairs
     */
    update(updates) {
        Object.entries(updates).forEach(([path, value]) => {
            this.set(path, value);
        });
    }
    
    /**
     * Delete value from store
     * @param {string} path - Dot-notation path
     */
    delete(path) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        
        let target = this.state;
        for (const key of keys) {
            if (!(key in target)) return;
            target = target[key];
        }
        
        const oldValue = target[lastKey];
        delete target[lastKey];
        
        // Add to history
        this.addToHistory('delete', path, undefined, oldValue);
        
        // Notify subscribers
        this.notify(path, undefined, oldValue);
        
        if (this.debug) {
            console.log(`[Store] Deleted ${path}`);
        }
    }
    
    /**
     * Subscribe to changes at a path
     * @param {string} path - Dot-notation path (use '*' for all changes)
     * @param {Function} handler - Handler function
     * @returns {Function} Unsubscribe function
     */
    subscribe(path, handler) {
        if (typeof handler !== 'function') {
            throw new Error('Handler must be a function');
        }
        
        if (!this.subscribers.has(path)) {
            this.subscribers.set(path, new Set());
        }
        
        this.subscribers.get(path).add(handler);
        
        if (this.debug) {
            console.log(`[Store] Subscribed to ${path}`);
        }
        
        // Return unsubscribe function
        return () => this.unsubscribe(path, handler);
    }
    
    /**
     * Unsubscribe from changes
     * @param {string} path - Dot-notation path
     * @param {Function} handler - Handler function
     */
    unsubscribe(path, handler) {
        if (this.subscribers.has(path)) {
            this.subscribers.get(path).delete(handler);
            
            // Clean up empty sets
            if (this.subscribers.get(path).size === 0) {
                this.subscribers.delete(path);
            }
            
            if (this.debug) {
                console.log(`[Store] Unsubscribed from ${path}`);
            }
        }
    }
    
    /**
     * Notify subscribers of changes
     * @param {string} path - Changed path
     * @param {*} newValue - New value
     * @param {*} oldValue - Old value
     */
    notify(path, newValue, oldValue) {
        // Notify exact path subscribers
        if (this.subscribers.has(path)) {
            this.subscribers.get(path).forEach(handler => {
                try {
                    handler(newValue, oldValue, path);
                } catch (error) {
                    console.error(`[Store] Error in subscriber for ${path}:`, error);
                }
            });
        }
        
        // Notify wildcard subscribers
        if (this.subscribers.has('*')) {
            this.subscribers.get('*').forEach(handler => {
                try {
                    handler(newValue, oldValue, path);
                } catch (error) {
                    console.error('[Store] Error in wildcard subscriber:', error);
                }
            });
        }
        
        // Notify parent path subscribers
        const parts = path.split('.');
        for (let i = parts.length - 1; i > 0; i--) {
            const parentPath = parts.slice(0, i).join('.');
            if (this.subscribers.has(parentPath)) {
                const parentValue = this.get(parentPath);
                this.subscribers.get(parentPath).forEach(handler => {
                    try {
                        handler(parentValue, undefined, parentPath);
                    } catch (error) {
                        console.error(`[Store] Error in parent subscriber for ${parentPath}:`, error);
                    }
                });
            }
        }
    }
    
    /**
     * Create a computed value
     * @param {Function} getter - Function to compute value
     * @param {string[]} dependencies - Paths to watch for changes
     * @returns {Function} Function to get computed value
     */
    computed(getter, dependencies = []) {
        // Subscribe to dependencies
        dependencies.forEach(dep => {
            this.subscribe(dep, () => {
                // Trigger recomputation
                const value = getter();
                if (this.debug) {
                    console.log('[Store] Computed value updated:', value);
                }
            });
        });
        
        // Return getter function
        return () => getter();
    }
    
    /**
     * Watch for changes with a reaction
     * @param {Function} selector - Function to select value to watch
     * @param {Function} reaction - Function to run when value changes
     * @returns {Function} Unwatch function
     */
    watch(selector, reaction) {
        let oldValue = selector(this.state);
        
        const unsubscribe = this.subscribe('*', () => {
            const newValue = selector(this.state);
            if (newValue !== oldValue) {
                reaction(newValue, oldValue);
                oldValue = newValue;
            }
        });
        
        return unsubscribe;
    }
    
    /**
     * Reset store to initial state
     * @param {Object} newState - New state (optional)
     */
    reset(newState = {}) {
        const oldState = this.state;
        this.state = this.deepClone(newState);
        
        // Add to history
        this.addToHistory('reset', null, this.state, oldState);
        
        // Notify all subscribers
        this.notify('*', this.state, oldState);
        
        if (this.debug) {
            console.log('[Store] Reset to:', this.state);
        }
    }
    
    /**
     * Get entire state
     * @returns {Object} Current state
     */
    getState() {
        return this.deepClone(this.state);
    }
    
    /**
     * Replace entire state
     * @param {Object} newState - New state
     */
    setState(newState) {
        this.reset(newState);
    }
    
    /**
     * Add to history
     * @param {string} action - Action type
     * @param {string} path - Changed path
     * @param {*} newValue - New value
     * @param {*} oldValue - Old value
     */
    addToHistory(action, path, newValue, oldValue) {
        this.history.push({
            action,
            path,
            newValue: this.deepClone(newValue),
            oldValue: this.deepClone(oldValue),
            timestamp: Date.now()
        });
        
        // Limit history size
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        }
    }
    
    /**
     * Get history
     * @returns {Array} History entries
     */
    getHistory() {
        return [...this.history];
    }
    
    /**
     * Clear history
     */
    clearHistory() {
        this.history = [];
        
        if (this.debug) {
            console.log('[Store] History cleared');
        }
    }
    
    /**
     * Deep clone an object
     * @param {*} obj - Object to clone
     * @returns {*} Cloned object
     */
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        if (obj instanceof Object) {
            const cloned = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    cloned[key] = this.deepClone(obj[key]);
                }
            }
            return cloned;
        }
    }
    
    /**
     * Persist store to localStorage
     * @param {string} key - Storage key
     */
    persist(key = 'genesis_store') {
        try {
            localStorage.setItem(key, JSON.stringify(this.state));
            if (this.debug) {
                console.log(`[Store] Persisted to localStorage: ${key}`);
            }
        } catch (error) {
            console.error('[Store] Failed to persist:', error);
        }
    }
    
    /**
     * Load store from localStorage
     * @param {string} key - Storage key
     * @returns {boolean} Success status
     */
    load(key = 'genesis_store') {
        try {
            const stored = localStorage.getItem(key);
            if (stored) {
                this.state = JSON.parse(stored);
                this.notify('*', this.state, {});
                
                if (this.debug) {
                    console.log(`[Store] Loaded from localStorage: ${key}`);
                }
                return true;
            }
        } catch (error) {
            console.error('[Store] Failed to load:', error);
        }
        return false;
    }
    
    /**
     * Enable/disable debug mode
     * @param {boolean} enabled - Debug mode state
     */
    setDebug(enabled) {
        this.debug = enabled;
        console.log(`[Store] Debug mode ${enabled ? 'enabled' : 'disabled'}`);
    }
}

// Export for direct use
export default Store;
