// modules/terminal/index.js
// Инициализация модуля терминала для модульной системы GENESIS

export default class TerminalModule {
    constructor() {
        this.name = 'terminal';
        this.version = '2.0.0';
        this.dependencies = [];
        this.isLoaded = false;
        this.container = null;
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
            
            // Инициализируем терминал через короткий таймаут для загрузки DOM
            setTimeout(() => {
                if (window.CabinetTerminal) {
                    window.CabinetTerminal.init();
                    this.setupEventListeners();
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
        }

        // Очищаем контейнер
        if (this.container) {
            this.container.innerHTML = '';
        }

        this.isLoaded = false;
        console.log('🗑️ Terminal module destroyed');
    }
}
