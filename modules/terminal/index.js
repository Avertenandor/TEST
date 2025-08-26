// modules/terminal/index.js
// Модуль терминала для модульной системы GENESIS

import CONFIG from '../../shared/config.js';

class TerminalModule {
    constructor() {
        this.name = 'terminal';
        this.version = '2.0.0';
        this.dependencies = [];
        this.isLoaded = false;
        this.container = null;
        this.state = this.loadState();
    }

    /**
     * Загрузка состояния из localStorage
     */
    loadState() {
        try {
            const saved = localStorage.getItem(CONFIG.terminal.localStorageKey);
            return saved ? JSON.parse(saved) : { ...CONFIG.terminal.defaultState };
        } catch (error) {
            console.warn('Failed to load terminal state:', error);
            return { ...CONFIG.terminal.defaultState };
        }
    }

    /**
     * Сохранение состояния в localStorage
     */
    saveState() {
        try {
            localStorage.setItem(CONFIG.terminal.localStorageKey, JSON.stringify(this.state));
        } catch (error) {
            console.warn('Failed to save terminal state:', error);
        }
    }

    /**
     * Инициализация модуля
     * @param {Object} context - Контекст модуля (container, etc.)
     */
    async init(context) {
        if (this.isLoaded) return;

        try {
            this.container = context.container;
            
            // Загружаем HTML шаблон
            const template = await this.loadTemplate();
            this.container.innerHTML = template;
            
            // Загружаем стили
            await this.loadStyles();
            
            // Загружаем JavaScript модуль терминала
            await this.loadTerminalScript();
            
            // Инициализируем терминал через короткий таймаут для загрузки DOM
            setTimeout(() => {
                if (window.CabinetTerminal) {
                    window.CabinetTerminal.init();
                    this.setupEventListeners();
                    this.applyState();
                }
            }, 100);
            
            this.isLoaded = true;
            console.log('🚀 Terminal module initialized successfully');
            
            // Уведомляем о загрузке модуля
            if (window.eventBus) {
                window.eventBus.emit('terminal:loaded');
            }
            
        } catch (error) {
            console.error('❌ Failed to initialize terminal module:', error);
            throw error;
        }
    }

    /**
     * Применение сохраненного состояния
     */
    applyState() {
        if (!window.CabinetTerminal) return;

        if (this.state.minimized) {
            window.CabinetTerminal.minimize();
        }
        if (this.state.fullscreen) {
            window.CabinetTerminal.fullscreen();
        }
        if (this.state.mute) {
            window.CabinetTerminal.mute();
        }
        if (this.state.filters) {
            window.CabinetTerminal.setFilters(this.state.filters);
        }
    }

    /**
     * Загрузка HTML шаблона
     */
    async loadTemplate() {
        try {
            const response = await fetch('./modules/terminal/terminal.template.html');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return await response.text();
        } catch (error) {
            console.error('Failed to load terminal template:', error);
            // Возвращаем базовый шаблон в случае ошибки
            return `
                <div class="terminal-container">
                    <div class="terminal-error">
                        <h3>❌ Ошибка загрузки терминала</h3>
                        <p>Не удалось загрузить шаблон терминала: ${error.message}</p>
                    </div>
                </div>
            `;
        }
    }

    /**
     * Загрузка стилей
     */
    async loadStyles() {
        return new Promise((resolve, reject) => {
            // Проверяем, не загружены ли уже стили
            const existingLink = document.querySelector('link[href*="terminal.styles.css"]');
            if (existingLink) {
                resolve();
                return;
            }

            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = './modules/terminal/terminal.styles.css';
            link.onload = () => resolve();
            link.onerror = () => {
                console.warn('Failed to load terminal styles, continuing without them');
                resolve(); // Не блокируем инициализацию из-за проблем со стилями
            };
            document.head.appendChild(link);
        });
    }

    /**
     * Загрузка JavaScript модуля терминала
     */
    async loadTerminalScript() {
        return new Promise((resolve, reject) => {
            // Проверяем, не загружен ли уже скрипт
            if (window.CabinetTerminal) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = './modules/terminal/terminal.module.js';
            script.onload = () => resolve();
            script.onerror = () => {
                console.error('Failed to load terminal script');
                reject(new Error('Failed to load terminal script'));
            };
            document.head.appendChild(script);
        });
    }

    /**
     * Настройка прослушивателей событий
     */
    setupEventListeners() {
        if (!window.eventBus) return;

        // Слушаем события от других модулей
        window.eventBus.on('user:balance:updated', (data) => {
            this.onBalanceUpdate(data);
        });

        window.eventBus.on('deposits:updated', (data) => {
            this.onDepositsUpdate(data);
        });

        window.eventBus.on('transaction:completed', (data) => {
            this.onTransactionComplete(data);
        });

        window.eventBus.on('api:call', (data) => {
            this.onApiCall(data.endpoint, data.data);
        });

        window.eventBus.on('error', (error) => {
            this.onError(error);
        });

        window.eventBus.on('system:event', (data) => {
            this.onSystemEvent(data.event, data.data);
        });

        // Слушаем события терминала для сохранения состояния
        window.eventBus.on('terminal:minimize', (minimized) => {
            this.state.minimized = minimized;
            this.saveState();
        });

        window.eventBus.on('terminal:fullscreen', (fullscreen) => {
            this.state.fullscreen = fullscreen;
            this.saveState();
        });

        window.eventBus.on('terminal:mute', (mute) => {
            this.state.mute = mute;
            this.saveState();
        });

        window.eventBus.on('terminal:filters', (filters) => {
            this.state.filters = filters;
            this.saveState();
        });
    }

    /**
     * Методы для взаимодействия с терминалом
     */
    log(message, type = 'info') {
        if (window.CabinetTerminal) {
            window.CabinetTerminal.log(message, type);
        }
    }

    executeCommand(command) {
        if (window.CabinetTerminal) {
            window.CabinetTerminal.executeCommand(command);
        }
    }

    getStats() {
        if (window.CabinetTerminal) {
            return window.CabinetTerminal.stats;
        }
        return null;
    }

    /**
     * Обработчики событий от других модулей
     */
    onBalanceUpdate(balanceData) {
        if (window.CabinetTerminal) {
            window.CabinetTerminal.log('💰 Balance updated', 'success', balanceData);
        }
    }

    onDepositsUpdate(depositsData) {
        if (window.CabinetTerminal) {
            window.CabinetTerminal.log('📊 Deposits updated', 'info', depositsData);
        }
    }

    onTransactionComplete(txData) {
        if (window.CabinetTerminal) {
            window.CabinetTerminal.log(`💸 Transaction ${txData.type}: ${txData.amount}`, 'success', txData);
            window.CabinetTerminal.stats.transactions++;
        }
    }

    onApiCall(endpoint, data) {
        if (window.CabinetTerminal) {
            window.CabinetTerminal.log(`🔗 API: ${endpoint}`, 'api', data);
            window.CabinetTerminal.stats.apiCalls++;
        }
    }

    onError(error) {
        if (window.CabinetTerminal) {
            window.CabinetTerminal.log(`❌ Error: ${error.message}`, 'error', error);
            window.CabinetTerminal.stats.errorCount++;
        }
    }

    onSystemEvent(event, data) {
        if (window.CabinetTerminal) {
            window.CabinetTerminal.log(`⚙️ System: ${event}`, 'system', data);
        }
    }

    /**
     * Очистка ресурсов при выгрузке модуля
     */
    destroy() {
        if (window.eventBus) {
            // Отписываемся от событий
            window.eventBus.off('user:balance:updated');
            window.eventBus.off('deposits:updated');
            window.eventBus.off('transaction:completed');
            window.eventBus.off('api:call');
            window.eventBus.off('error');
            window.eventBus.off('system:event');
            window.eventBus.off('terminal:minimize');
            window.eventBus.off('terminal:fullscreen');
            window.eventBus.off('terminal:mute');
            window.eventBus.off('terminal:filters');
        }

        // Очищаем контейнер
        if (this.container) {
            this.container.innerHTML = '';
        }

        this.isLoaded = false;
        console.log('🗑️ Terminal module destroyed');
    }
}

// Стандартный экспорт модуля
export const module = {
    id: 'terminal',
    
    mount(el, props) {
        const terminalModule = new TerminalModule();
        terminalModule.init({ container: el });
        
        // Сохраняем ссылку на модуль для возможности unmount
        el._terminalModule = terminalModule;
    },
    
    unmount(el) {
        const terminalModule = el._terminalModule;
        if (terminalModule && typeof terminalModule.destroy === 'function') {
            terminalModule.destroy();
        }
        el._terminalModule = null;
    },
    
    canActivate(ctx) {
        return true; // Терминал всегда доступен
    },
    
    init() {
        console.log('Terminal module initialized');
    }
};

// Экспорт по умолчанию для совместимости
export default module;