// core/module-loader.js
// Динамический загрузчик модулей для GENESIS

export class ModuleLoader {
    constructor(config) {
        this.config = config;
        this.modules = new Map();
        this.loadedModules = new Map();
        this.loadingPromises = new Map();
    }
    
    /**
     * Load a module dynamically
     * @param {string} moduleName - Name of the module to load
     * @param {HTMLElement} container - Container element for the module
     * @returns {Promise<Module>} Loaded module instance
     */
    async loadModule(moduleName, container) {
        console.log(`📦 Loading module: ${moduleName}`);
        
        // Check if module is already loaded
        if (this.loadedModules.has(moduleName)) {
            console.log(`✅ Module ${moduleName} already loaded, returning cached instance`);
            return this.loadedModules.get(moduleName);
        }
        
        // Check if module is currently loading
        if (this.loadingPromises.has(moduleName)) {
            console.log(`⏳ Module ${moduleName} is already loading, waiting...`);
            return this.loadingPromises.get(moduleName);
        }
        
        // Create loading promise
        const loadingPromise = this._loadModuleInternal(moduleName, container);
        this.loadingPromises.set(moduleName, loadingPromise);
        
        try {
            const module = await loadingPromise;
            this.loadingPromises.delete(moduleName);
            return module;
        } catch (error) {
            this.loadingPromises.delete(moduleName);
            throw error;
        }
    }
    
    async _loadModuleInternal(moduleName, container) {
        try {
            // Emit loading start event
            window.eventBus.emit('module:loading', { name: moduleName });
            
            // Dynamic import of module
            const modulePath = `/modules/${moduleName}/index.js`;
            console.log(`📂 Importing module from: ${modulePath}`);
            
            const moduleExports = await import(modulePath);
            const ModuleClass = moduleExports.default;
            
            if (!ModuleClass) {
                throw new Error(`Module ${moduleName} does not export a default class`);
            }
            
            // Create module instance
            const module = new ModuleClass();
            
            // Check and load dependencies
            if (module.dependencies && module.dependencies.length > 0) {
                console.log(`📦 Loading dependencies for ${moduleName}:`, module.dependencies);
                await this.loadDependencies(module.dependencies);
            }
            
            // Initialize module with context
            const context = this.createModuleContext(container);
            await module.init(context);
            
            // Cache the module
            this.loadedModules.set(moduleName, module);
            
            // Emit loaded event
            window.eventBus.emit('module:loaded', { 
                name: moduleName,
                version: module.version || '1.0.0'
            });
            
            console.log(`✅ Module ${moduleName} loaded successfully`);
            return module;
            
        } catch (error) {
            console.error(`❌ Failed to load module ${moduleName}:`, error);
            
            // Emit error event
            window.eventBus.emit('module:error', { 
                name: moduleName, 
                error: error.message 
            });
            
            throw error;
        }
    }
    
    /**
     * Load module dependencies
     * @param {string[]} dependencies - Array of dependency module names
     */
    async loadDependencies(dependencies = []) {
        const loadPromises = dependencies.map(async (dep) => {
            if (!this.loadedModules.has(dep)) {
                console.log(`📦 Loading dependency: ${dep}`);
                // Load dependency without container (service modules)
                await this.loadModule(dep, null);
            }
        });
        
        await Promise.all(loadPromises);
    }
    
    /**
     * Create context object for module initialization
     * @param {HTMLElement} container - Container element
     * @returns {Object} Module context
     */
    createModuleContext(container) {
        return {
            container,
            config: this.config,
            eventBus: window.eventBus,
            store: window.store,
            router: window.router,
            moduleLoader: this,
            
            // Helper methods
            getModule: (name) => this.getModule(name),
            loadModule: (name, container) => this.loadModule(name, container),
            unloadModule: (name) => this.unloadModule(name)
        };
    }
    
    /**
     * Get a loaded module instance
     * @param {string} moduleName - Name of the module
     * @returns {Module|null} Module instance or null
     */
    getModule(moduleName) {
        return this.loadedModules.get(moduleName) || null;
    }
    
    /**
     * Unload a module
     * @param {string} moduleName - Name of the module to unload
     */
    unloadModule(moduleName) {
        const module = this.loadedModules.get(moduleName);
        
        if (module) {
            console.log(`🗑️ Unloading module: ${moduleName}`);
            
            // Call module destroy method if it exists
            if (typeof module.destroy === 'function') {
                try {
                    module.destroy();
                } catch (error) {
                    console.error(`Error destroying module ${moduleName}:`, error);
                }
            }
            
            // Remove from cache
            this.loadedModules.delete(moduleName);
            
            // Emit unloaded event
            window.eventBus.emit('module:unloaded', { name: moduleName });
            
            console.log(`✅ Module ${moduleName} unloaded`);
        }
    }
    
    /**
     * Unload all modules
     */
    unloadAll() {
        console.log('🗑️ Unloading all modules...');
        
        // Unload in reverse order to handle dependencies
        const moduleNames = Array.from(this.loadedModules.keys()).reverse();
        
        for (const moduleName of moduleNames) {
            this.unloadModule(moduleName);
        }
        
        console.log('✅ All modules unloaded');
    }
    
    /**
     * Reload a module
     * @param {string} moduleName - Name of the module to reload
     * @param {HTMLElement} container - Container element
     * @returns {Promise<Module>} Reloaded module instance
     */
    async reloadModule(moduleName, container) {
        console.log(`🔄 Reloading module: ${moduleName}`);
        
        // Unload if already loaded
        if (this.loadedModules.has(moduleName)) {
            this.unloadModule(moduleName);
        }
        
        // Load again
        return this.loadModule(moduleName, container);
    }
    
    /**
     * Check if a module is loaded
     * @param {string} moduleName - Name of the module
     * @returns {boolean} True if loaded
     */
    isLoaded(moduleName) {
        return this.loadedModules.has(moduleName);
    }
    
    /**
     * Get list of loaded modules
     * @returns {string[]} Array of loaded module names
     */
    getLoadedModules() {
        return Array.from(this.loadedModules.keys());
    }
    
    /**
     * Preload modules for faster access
     * @param {string[]} moduleNames - Array of module names to preload
     */
    async preloadModules(moduleNames) {
        console.log('📦 Preloading modules:', moduleNames);
        
        const preloadPromises = moduleNames.map(name => {
            return import(`/modules/${name}/index.js`)
                .then(() => {
                    console.log(`✅ Module ${name} preloaded`);
                })
                .catch(error => {
                    console.warn(`⚠️ Failed to preload module ${name}:`, error);
                });
        });
        
        await Promise.all(preloadPromises);
    }
}

// Export for direct use
export default ModuleLoader;
