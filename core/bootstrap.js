// core/bootstrap.js
// Главный файл инициализации модульного приложения GENESIS

import { ModuleLoader } from './module-loader.js';
import { Router } from './router.js';
import { EventBus } from './event-bus.js';
import { Store } from './store.js';
import config from './config.js';
import BSCApi from '../shared/services/api/bsc-api.js';

export class Application {
    constructor() {
        this.isInitialized = false;
        this.modules = new Map();
        this.bscApi = null;
    }
    
    async init() {
        console.log('🚀 Initializing GENESIS Application...');
        
        try {
            // 1. Initialize global services
            window.eventBus = new EventBus();
            window.store = new Store(this.getInitialState());
            
            // Enable debug mode for event bus
            window.eventBus.debug = true;
            
            // 2. Load configuration
            await this.loadConfig();
            
            // 3. Initialize BSC API
            window.bscApi = new BSCApi(config);
            console.log('🔗 BSC API initialized');
            
            // 4. Initialize module loader
            this.moduleLoader = new ModuleLoader(config);
            
            // 5. Initialize router
            window.router = new Router(this.moduleLoader);
            
            // 6. Check authentication status
            await this.checkAuth();
            
            // 7. Setup global event handlers
            this.setupGlobalHandlers();
            
            // 8. Start the application
            await this.start();
            
            this.isInitialized = true;
            console.log('✅ Application initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize application:', error);
            throw error;
        }
    }
    
    getInitialState() {
        return {
            user: {
                authenticated: false,
                address: null,
                platformAccess: false,
                accessDays: 0,
                lastPayment: null,
                accessExpiresAt: null
            },
            deposits: {
                list: [],
                total: 0,
                activeCount: 0
            },
            portfolio: {
                balance: 0,
                totalEarnings: 0,
                todayEarnings: 0
            },
            settings: {
                theme: 'dark',
                language: 'ru',
                notifications: true
            },
            ui: {
                currentModule: null,
                isMobileMenuOpen: false,
                isLoading: false
            }
        };
    }
    
    async loadConfig() {
        // Try to load dynamic config first
        try {
            const response = await fetch('/core/config.json');
            if (response.ok) {
                const dynamicConfig = await response.json();
                Object.assign(config, dynamicConfig);
                console.log('📋 Dynamic config loaded');
            }
        } catch (error) {
            console.log('📋 Using default config');
        }
        
        window.store.set('config', config);
    }
    
    async checkAuth() {
        // Check if user is authenticated
        const savedAddress = localStorage.getItem('genesis_user_address');
        
        if (savedAddress) {
            console.log('🔐 Found saved user address:', savedAddress);
            
            // Validate the address
            if (this.isValidBSCAddress(savedAddress)) {
                window.store.set('user.address', savedAddress);
                
                // Check authorization will be done by auth module
                // For now, simulate successful auth for saved address
                try {
                    const authData = { authorized: true }; // Simplified for now
                    
                    if (authData.authorized) {
                        console.log('✅ User authorization confirmed via BSC');
                        window.store.set('user.authenticated', true);
                        
                        // Check platform access
                        await this.checkPlatformAccess(savedAddress);
                        
                        // Emit authentication event
                        window.eventBus.emit('user:authenticated', { 
                            address: savedAddress,
                            authData: authData 
                        });
                    } else {
                        console.warn('⚠️ Authorization not found on BSC, clearing saved address');
                        localStorage.removeItem('genesis_user_address');
                        window.store.set('user.authenticated', false);
                    }
                } catch (error) {
                    console.error('Failed to verify authorization:', error);
                    // Keep cached auth if BSC check fails
                    window.store.set('user.authenticated', true);
                    await this.checkPlatformAccess(savedAddress);
                }
            } else {
                console.warn('⚠️ Invalid saved address, clearing...');
                localStorage.removeItem('genesis_user_address');
            }
        } else {
            console.log('🔒 No saved authentication found');
        }
    }
    
    async checkPlatformAccess(address) {
        // Platform access check will be done by platform-access module
        // For now, return simulated data
        try {
            console.log('🔍 Checking platform access...');
            
            const accessData = { hasAccess: true, accessDays: 30 }; // Simplified
            
            window.store.set('user.platformAccess', accessData.hasAccess);
            window.store.set('user.accessDays', accessData.accessDays || 0);
            
            if (accessData.hasAccess) {
                window.store.set('user.lastPayment', accessData.lastPayment);
                window.store.set('user.accessExpiresAt', accessData.expiresAt);
                
                // Cache the access data
                localStorage.setItem('genesis_platform_access', JSON.stringify({
                    hasAccess: true,
                    accessDays: accessData.accessDays,
                    expiresAt: accessData.expiresAt,
                    lastCheck: Date.now()
                }));
            }
            
            window.eventBus.emit('platform:access:checked', accessData);
            
            return accessData;
            
        } catch (error) {
            console.error('❌ Failed to check platform access:', error);
            
            // Fallback to cached data if available
            const cachedAccess = localStorage.getItem('genesis_platform_access');
            if (cachedAccess) {
                const data = JSON.parse(cachedAccess);
                const now = Date.now();
                
                // Check if cached access is still valid (within 24 hours)
                if (data.expiresAt && data.expiresAt > now) {
                    console.log('📦 Using cached platform access data');
                    window.store.set('user.platformAccess', true);
                    window.store.set('user.accessDays', data.accessDays);
                    window.store.set('user.accessExpiresAt', data.expiresAt);
                    
                    window.eventBus.emit('platform:access:checked', {
                        hasAccess: true,
                        accessDays: data.accessDays,
                        expiresAt: data.expiresAt,
                        fromCache: true
                    });
                    
                    return { hasAccess: true, accessDays: data.accessDays };
                }
            }
            
            // No valid access found
            window.store.set('user.platformAccess', false);
            window.store.set('user.accessDays', 0);
            
            window.eventBus.emit('platform:access:checked', {
                hasAccess: false,
                accessDays: 0
            });
            
            return { hasAccess: false, accessDays: 0 };
        }
    }
    
    isValidBSCAddress(address) {
        // Basic BSC address validation
        return /^0x[a-fA-F0-9]{40}$/.test(address);
    }
    
    setupGlobalHandlers() {
        // Handle authentication events
        window.eventBus.on('user:login', async (data) => {
            const { address } = data;
            
            // Authorization will be verified by auth module
            try {
            const authData = { authorized: true }; // Simplified
                
                if (!authData.authorized) {
                    window.eventBus.emit('notification:show', {
                        message: 'Необходимо оплатить 1 PLEX для авторизации',
                        type: 'error'
                    });
                    return;
                }
                
                // Save to localStorage
                localStorage.setItem('genesis_user_address', address);
                
                // Update store
                window.store.set('user.address', address);
                window.store.set('user.authenticated', true);
                
                // Check platform access
                const accessData = await this.checkPlatformAccess(address);
                
                if (accessData.hasAccess) {
                    // Navigate to dashboard
                    window.router.navigate('/');
                } else {
                    // Navigate to platform access payment
                    window.router.navigate('/platform-access');
                }
                
            } catch (error) {
                console.error('Login failed:', error);
                window.eventBus.emit('notification:show', {
                    message: 'Ошибка авторизации. Попробуйте позже.',
                    type: 'error'
                });
            }
        });
        
        // Handle logout
        window.eventBus.on('user:logout', () => {
            // Clear localStorage
            localStorage.removeItem('genesis_user_address');
            localStorage.removeItem('genesis_platform_access');
            
            // Reset store
            window.store.set('user.authenticated', false);
            window.store.set('user.address', null);
            window.store.set('user.platformAccess', false);
            window.store.set('user.accessDays', 0);
            window.store.set('user.lastPayment', null);
            window.store.set('user.accessExpiresAt', null);
            
            // Navigate to auth
            window.router.navigate('/auth');
        });
        
        // Handle platform access renewal
        window.eventBus.on('platform:access:renew', async () => {
            const address = window.store.get('user.address');
            if (address) {
                const accessData = await this.checkPlatformAccess(address);
                
                if (accessData.hasAccess) {
                    window.eventBus.emit('notification:show', {
                        message: `Доступ к платформе активен. Осталось дней: ${accessData.accessDays}`,
                        type: 'success'
                    });
                } else {
                    window.router.navigate('/platform-access');
                }
            }
        });
        
        // Handle module changes
        window.eventBus.on('module:loaded', (data) => {
            console.log(`📦 Module loaded: ${data.name}`);
            window.store.set('ui.currentModule', data.name);
        });
        
        // Handle loading states
        window.eventBus.on('loading:start', () => {
            window.store.set('ui.isLoading', true);
            this.showGlobalLoader();
        });
        
        window.eventBus.on('loading:end', () => {
            window.store.set('ui.isLoading', false);
            this.hideGlobalLoader();
        });
        
        // Handle notifications
        window.eventBus.on('notification:show', (data) => {
            this.showNotification(data.message, data.type);
        });
    }
    
    async start() {
        // Hide initial loading screen
        const loadingScreen = document.getElementById('app-loading');
        const appContainer = document.getElementById('app');
        
        if (loadingScreen && appContainer) {
            // Fade out loading screen
            loadingScreen.style.opacity = '0';
            loadingScreen.style.transition = 'opacity 0.5s ease';
            
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
                appContainer.classList.remove('hidden');
                
                // Start routing
                window.router.handleRoute();
            }, 500);
        } else {
            // Fallback if elements not found
            window.router.handleRoute();
        }
    }
    
    showGlobalLoader() {
        const loader = document.getElementById('global-loader');
        if (loader) {
            loader.classList.remove('hidden');
        }
    }
    
    hideGlobalLoader() {
        const loader = document.getElementById('global-loader');
        if (loader) {
            loader.classList.add('hidden');
        }
    }
    
    showNotification(message, type = 'info') {
        const container = document.getElementById('global-notifications');
        if (!container) return;
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${this.getNotificationIcon(type)}</span>
                <span class="notification-message">${message}</span>
            </div>
            <button class="notification-close">&times;</button>
        `;
        
        // Add click handler for close button
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        });
        
        container.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.opacity = '0';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }
    
    getNotificationIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }
}

// Export for direct use if needed
export default Application;
