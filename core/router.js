// core/router.js
// Router для управления навигацией между модулями

export class Router {
    constructor(moduleLoader) {
        this.moduleLoader = moduleLoader;
        this.currentModule = null;
        this.currentPath = null;
        this.container = null;
        this.navigationContainer = null;
        
        // Routes mapping from config
        this.routes = {
            '/': 'dashboard',
            '/home': 'home',
            '/dashboard': 'dashboard',
            '/auth': 'auth',
            '/deposits': 'deposits',
            '/portfolio': 'portfolio',
            '/transactions': 'transactions',
            '/analytics': 'analytics',
            '/bonuses': 'bonuses',
            '/gifts': 'gifts',
            '/referrals': 'referrals',
            '/multipliers': 'multipliers',
            '/mining-rent': 'mining-rent',
            '/my-device': 'device',
            '/plex-coin': 'plex-coin',
            '/settings': 'settings',
            '/experience': 'experience',
            '/rank': 'rank',
            '/how-it-works': 'how-it-works',
            '/terminal': 'terminal',
            '/platform-access': 'platform-access'
        };
        
        // Public modules that don't require authentication
        this.publicModules = ['auth', 'how-it-works'];
        
        // Modules that require platform access
        this.restrictedModules = ['deposits', 'portfolio', 'analytics'];
        
        this.init();
    }
    
    init() {
        // Get container elements
        this.container = document.getElementById('app-container');
        this.navigationContainer = document.getElementById('app-navigation');
        
        if (!this.container) {
            console.error('❌ App container not found');
            return;
        }
        
        // Handle browser back/forward buttons
        window.addEventListener('popstate', (event) => {
            this.handleRoute(false);
        });
        
        // Handle link clicks
        document.addEventListener('click', (event) => {
            // Check if clicked element is a link with data-route
            const link = event.target.closest('[data-route]');
            if (link) {
                event.preventDefault();
                const route = link.dataset.route;
                this.navigate(route);
            }
            
            // Check for regular links that should be handled by router
            const anchor = event.target.closest('a');
            if (anchor && anchor.href && anchor.href.startsWith(window.location.origin)) {
                const url = new URL(anchor.href);
                if (this.routes[url.pathname]) {
                    event.preventDefault();
                    this.navigate(url.pathname);
                }
            }
        });
        
        // Build navigation menu
        this.buildNavigation();
    }
    
    /**
     * Build navigation menu
     */
    buildNavigation() {
        if (!this.navigationContainer) return;
        
        const navItems = [
            { path: '/home', icon: '🏠', text: 'Главная' },
            { path: '/', icon: '📊', text: 'Панель управления' },
            { path: '/how-it-works', icon: '🛠️', text: 'Как все устроено' },
            { path: '/deposits', icon: '💰', text: 'Депозиты' },
            { path: '/portfolio', icon: '💼', text: 'Портфель' },
            { path: '/transactions', icon: '📋', text: 'Транзакции' },
            { path: '/analytics', icon: '📈', text: 'Аналитика' },
            { path: '/terminal', icon: '⚡', text: 'Терминал' },
            { path: '/bonuses', icon: '🎁', text: 'Бонусы' },
            { path: '/gifts', icon: '🎈', text: 'Подарки' },
            { path: '/referrals', icon: '👥', text: 'Рефералы' },
            { path: '/multipliers', icon: '🚀', text: 'Множители' },
            { path: '/mining-rent', icon: '💻', text: 'Аренда мощностей' },
            { path: '/my-device', icon: '📱', text: 'Мое устройство' },
            { path: '/plex-coin', icon: '🪙', text: 'PLEX Монета' },
            { path: '/settings', icon: '⚙️', text: 'Настройки' },
            { path: '/experience', icon: '📅', text: 'Стаж' },
            { path: '/rank', icon: '🏅', text: 'Ранг' }
        ];
        
        const nav = document.createElement('nav');
        nav.className = 'sidebar-nav';
        
        const ul = document.createElement('ul');
        ul.className = 'nav-list';
        
        navItems.forEach(item => {
            const li = document.createElement('li');
            li.className = 'nav-item';
            
            const a = document.createElement('a');
            a.href = '#';
            a.className = 'nav-link';
            a.dataset.route = item.path;
            
            a.innerHTML = `
                <span class="nav-icon">${item.icon}</span>
                <span class="nav-text">${item.text}</span>
            `;
            
            li.appendChild(a);
            ul.appendChild(li);
        });
        
        nav.appendChild(ul);
        this.navigationContainer.appendChild(nav);
    }
    
    /**
     * Navigate to a route
     * @param {string} path - Path to navigate to
     */
    async navigate(path) {
        // Normalize path
        if (!path.startsWith('/')) {
            path = '/' + path;
        }
        
        // Check if path exists in routes
        if (!this.routes[path]) {
            console.warn(`⚠️ Unknown route: ${path}`);
            path = '/';
        }
        
        // Update URL without triggering popstate
        if (window.location.pathname !== path) {
            history.pushState({ path }, '', path);
        }
        
        // Handle the route
        await this.handleRoute(true);
    }
    
    /**
     * Handle current route
     * @param {boolean} addToHistory - Whether to add to browser history
     */
    async handleRoute(addToHistory = true) {
        let path = window.location.pathname;
        
        // Handle special cases for app.html and test-module.html
        if (path === '/app.html' || path === '/test-module.html' || path.endsWith('.html')) {
            path = '/';
            // Update URL to clean path
            history.replaceState({ path }, '', path);
        }
        
        const moduleName = this.routes[path] || 'dashboard';
        
        console.log(`🛣️ Routing to: ${path} -> ${moduleName}`);
        
        // Check access permissions
        const canAccess = await this.checkAccess(moduleName);
        if (!canAccess) {
            console.warn(`🔒 Access denied to module: ${moduleName}`);
            this.navigate('/auth');
            return;
        }
        
        // Update current path
        this.currentPath = path;
        
        // Update active navigation item
        this.updateActiveNavItem(path);
        
        // If same module, don't reload
        if (this.currentModule === moduleName) {
            console.log(`ℹ️ Module ${moduleName} already loaded`);
            return;
        }
        
        // Emit route change event
        window.eventBus.emit('route:change', { 
            from: this.currentModule, 
            to: moduleName,
            path: path
        });
        
        // Show loading state
        this.showLoading();
        
        try {
            // Unload current module
            if (this.currentModule) {
                this.moduleLoader.unloadModule(this.currentModule);
                this.clearContainer();
            }
            
            // Load new module
            await this.moduleLoader.loadModule(moduleName, this.container);
            this.currentModule = moduleName;
            
            // Emit route loaded event
            window.eventBus.emit('route:loaded', { 
                module: moduleName,
                path: path
            });
            
        } catch (error) {
            console.error(`❌ Failed to load module ${moduleName}:`, error);
            this.showError(error);
        } finally {
            this.hideLoading();
        }
    }
    
    /**
     * Check if user can access a module
     * @param {string} moduleName - Name of the module
     * @returns {Promise<boolean>} True if access is allowed
     */
    async checkAccess(moduleName) {
        // Public modules are always accessible
        if (this.publicModules.includes(moduleName)) {
            return true;
        }
        
        // Check authentication
        const isAuthenticated = window.store.get('user.authenticated');
        if (!isAuthenticated) {
            console.log(`🔒 User not authenticated, cannot access ${moduleName}`);
            return false;
        }
        
        // Check platform access for restricted modules
        if (this.restrictedModules.includes(moduleName)) {
            const hasPlatformAccess = window.store.get('user.platformAccess');
            if (!hasPlatformAccess) {
                console.log(`🔒 No platform access, cannot access ${moduleName}`);
                // Show platform access modal
                window.eventBus.emit('platform:access:required');
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Update active navigation item
     * @param {string} path - Current path
     */
    updateActiveNavItem(path) {
        // Remove active class from all items
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.dataset.route === path) {
                link.classList.add('active');
            }
        });
    }
    
    /**
     * Clear container content
     */
    clearContainer() {
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
    
    /**
     * Show loading state
     */
    showLoading() {
        window.eventBus.emit('loading:start');
        
        if (this.container) {
            this.container.innerHTML = `
                <div class="loading-state">
                    <div class="loading-spinner"></div>
                    <div class="loading-text">Загрузка модуля...</div>
                </div>
            `;
        }
    }
    
    /**
     * Hide loading state
     */
    hideLoading() {
        window.eventBus.emit('loading:end');
    }
    
    /**
     * Show error state
     * @param {Error} error - Error object
     */
    showError(error) {
        if (this.container) {
            this.container.innerHTML = `
                <div class="error-state">
                    <div class="error-icon">❌</div>
                    <h3 class="error-title">Ошибка загрузки</h3>
                    <p class="error-message">${error.message}</p>
                    <button class="btn btn-primary" onclick="window.location.reload()">
                        Обновить страницу
                    </button>
                </div>
            `;
        }
    }
    
    /**
     * Go back in history
     */
    back() {
        history.back();
    }
    
    /**
     * Go forward in history
     */
    forward() {
        history.forward();
    }
    
    /**
     * Reload current route
     */
    async reload() {
        await this.handleRoute(false);
    }
    
    /**
     * Get current module name
     * @returns {string|null} Current module name
     */
    getCurrentModule() {
        return this.currentModule;
    }
    
    /**
     * Get current path
     * @returns {string|null} Current path
     */
    getCurrentPath() {
        return this.currentPath;
    }
}

// Export for direct use
export default Router;
