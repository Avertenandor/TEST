/**
 * GENESIS 1.1 - ULTIMATE TERMINAL v3.1 - ROBUST & RELIABLE
 * MCP-MARKER:MODULE:ULTIMATE_TERMINAL - Полнофункциональный терминал с повышенной надежностью
 * MCP-MARKER:FILE:TERMINAL_JS - Полностью переработанная версия для стабильности и полного логирования
 * Создано: 30.07.2025 - ВЕРСИЯ С ПОВЫШЕННОЙ НАДЕЖНОСТЬЮ
 */

// MCP-MARKER:CLASS:GENESIS_ULTIMATE_TERMINAL - Полный терминал с логированием всех действий
window.GenesisTerminal = {
    // MCP-MARKER:SECTION:TERMINAL_CONFIG - Расширенная конфигурация
    config: {
        maxMessages: 2000,
        themes: ['dark', 'light', 'matrix', 'retro', 'cyber', 'neon'],
        currentTheme: 'dark',
        soundEnabled: true,
        autoScroll: true,
        timestampFormat: 'HH:mm:ss',
        filters: {
            info: true, success: true, warning: true, error: true,
            debug: true, system: true, api: true, transaction: true,
            security: true, critical: true
        },
        commands: { maxHistory: 100, autoComplete: true }
    },

    // MCP-MARKER:SECTION:TERMINAL_STATS - Статистика
    stats: {
    messageCount: 0, errorCount: 0, warningCount: 0, successCount: 0,
    criticalCount: 0, apiCalls: 0, transactions: 0,
    startTime: Date.now(), memoryUsage: 0, errorHistory: [],
    typeCounts: { info: 0, success: 0, warning: 0, error: 0, debug: 0, system: 0, api: 0, transaction: 0, security: 0, critical: 0 }
    },

    // MCP-MARKER:SECTION:TERMINAL_STATE - Состояние
    state: {
        isInitialized: false, isMinimized: false, isFullscreen: false,
        isStatsVisible: false, fallbackMode: false, debugLevel: 1,
    monitoringInterval: null,
    lastAction: { name: null, ts: 0 },
    dockMode: 'floating', // floating | dock-bottom | dock-right
    searchQuery: '',
    unreadErrors: 0,
    virtualization: { enabled: false, bufferPx: 300 },
    renderQueue: [],
    renderScheduled: false
    },

    userHasInteracted: false,
    audioContext: null,

    // MCP-MARKER:SECTION:TERMINAL_ELEMENTS - DOM элементы
    elements: {
        container: null, body: null, input: null,
        controls: {}, statsPanel: {}, root: null
    },

    commandHistory: [],
    historyIndex: -1,

    // MCP-MARKER:METHOD:INIT - Безопасная инициализация
    init() {
        // Предотвращаем двойную инициализацию
        if (this.state.isInitialized) return this;
        
        // Перехватываем консоль как можно раньше
        this.setupGlobalErrorHandling();
        
        // Используем console.log, который теперь перехвачен
        console.log('🚀 GENESIS ULTIMATE TERMINAL v3.1 - Initializing...');
        
        this.findAndBindElements();
        if (this.state.fallbackMode) return this;

        this.initializeUI();
        this.attachEventListeners();
        this.initCursorHandling();
        this.loadSettings();
        this.displayStartupMessages();
        // Слить ранние логи, собранные до инициализации
        try {
            const buf = window.__genesisEarlyConsoleBuffer;
            if (Array.isArray(buf) && buf.length) {
                this.log(`🔁 Импорт ранних логов: ${buf.length}`, 'system');
                buf.forEach(entry => {
                    const type = (entry.m || 'log');
                    const text = (entry.args || []).map(a => {
                        try { return typeof a === 'string' ? a : JSON.stringify(a); } catch { return String(a); }
                    }).join(' ');
                    const map = { log: 'info', info: 'info', warn: 'warning', error: 'error', debug: 'debug' };
                    this.log(text, map[type] || 'info');
                });
                window.__genesisEarlyConsoleBuffer = [];
            }
        } catch {}
        
        this.updateStats();
        setInterval(() => this.updateStats(), 1000);
        
        this.startSystemMonitoring();
        
        this.state.isInitialized = true;
        console.log('✅ GENESIS ULTIMATE TERMINAL v3.1 - Ready!');
        
        return this;
    },

    // MCP-MARKER:METHOD:MOUNT - Монтаж в корень (поддержка Shadow DOM)
    mount(root) {
        this.elements.root = root || document;
        return this;
    },

    // MCP-MARKER:METHOD:FIND_AND_BIND_ELEMENTS - Поиск и привязка элементов (усилено)
    findAndBindElements() {
        const root = this.elements.root || document;
        // MCP-MARKER:FIX:TERMINAL:BIND_PRIMARY
        this.elements.container = (root.getElementById ? root.getElementById('genesis-terminal') : null)
            || root.querySelector?.('.genesis-terminal')
            || root.querySelector?.('[data-terminal="container"]');
        this.elements.body = (root.getElementById ? root.getElementById('genesis-terminal-body') : null)
            || root.querySelector?.('.terminal-body')
            || (this.elements.container && this.elements.container.querySelector('.terminal-body'));
        // Если работаем в Shadow DOM и контейнер не найден, используем host
        if (!this.elements.container && root.host) {
            this.elements.container = root.host;
        }
        this.elements.input = (root.getElementById ? root.getElementById('terminalInput') : null)
            || root.querySelector?.('.terminal-input')
            || (this.elements.container && this.elements.container.querySelector('input.terminal-input'));

        if (!this.elements.container || !this.elements.body || !this.elements.input) {
             console.error("❌ CRITICAL: Terminal UI elements not found in DOM. Ensure app.html contains the correct terminal structure.");
             this.state.fallbackMode = true;
             return;
        }

        // Нормализуем класс контейнера для применения общих стилей
        if (!this.elements.container.classList.contains('genesis-terminal')) {
            this.elements.container.classList.add('genesis-terminal');
        }

        // MCP-MARKER:FIX:TERMINAL:BIND_CONTROLS_FALLBACK
        const c = this.elements.controls;
        c.minimize = (root.getElementById ? root.getElementById('terminal-btn-minimize') : null)
            || (this.elements.container && this.elements.container.querySelector('[data-action="minimize"], .terminal-btn-minimize, button[title="Свернуть"]'));
        c.fullscreen = (root.getElementById ? root.getElementById('terminal-btn-fullscreen') : null)
            || (this.elements.container && this.elements.container.querySelector('[data-action="fullscreen"], .terminal-btn-fullscreen, button[title="Полноэкранный режим"]'));
        c.stats = (root.getElementById ? root.getElementById('terminal-btn-stats') : null)
            || (this.elements.container && this.elements.container.querySelector('[data-action="stats"], .terminal-btn-stats, button[title="Статистика"]'));
        c.copy = (root.getElementById ? root.getElementById('terminal-btn-copy') : null)
            || (this.elements.container && this.elements.container.querySelector('[data-action="copy"], .terminal-btn-copy, button[title="Копировать логи"]'));
        c.clear = (root.getElementById ? root.getElementById('terminal-btn-clear') : null)
            || (this.elements.container && this.elements.container.querySelector('[data-action="clear"], .terminal-btn-clear, button[title="Очистить"]'));
        c.export = (root.getElementById ? root.getElementById('terminal-btn-export') : null)
            || (this.elements.container && this.elements.container.querySelector('[data-action="export"], .terminal-btn-export, button[title="Экспорт"]'));
        c.dock = (root.getElementById ? root.getElementById('terminal-btn-dock') : null)
            || (this.elements.container && this.elements.container.querySelector('[data-action="dock"], .terminal-btn-dock, button[title="Режим докинга"]'));

        // Находим элементы статистики (с запасными селекторами)
        const sp = this.elements.statsPanel;
        sp.container = (root.getElementById ? root.getElementById('terminal-stats') : null)
            || (this.elements.container && this.elements.container.querySelector('.terminal-stats'));
        sp.messageCount = (root.getElementById ? root.getElementById('stat-message-count') : null)
            || (sp.container && sp.container.querySelector('[data-stat="message-count"], .stat-message-count'));
        sp.uptime = (root.getElementById ? root.getElementById('stat-uptime') : null)
            || (sp.container && sp.container.querySelector('[data-stat="uptime"], .stat-uptime'));
        sp.errors = (root.getElementById ? root.getElementById('stat-errors') : null)
            || (sp.container && sp.container.querySelector('[data-stat="errors"], .stat-errors'));
        sp.memory = (root.getElementById ? root.getElementById('stat-memory') : null)
            || (sp.container && sp.container.querySelector('[data-stat="memory"], .stat-memory'));

        console.log('🔍 Terminal container and components bound (with fallbacks if needed).');
    },

    // MCP-MARKER:METHOD:SETUP_GLOBAL_ERROR_HANDLING - Гарантированный перехват всех логов
    setupGlobalErrorHandling() {
        const self = this;

        window.addEventListener('error', (event) => {
            self.handleError('javascript', event.error, {
                message: event.message, filename: event.filename, lineno: event.lineno
            });
        });

        window.addEventListener('unhandledrejection', (event) => {
            self.handleError('promise', event.reason, { type: 'unhandledrejection' });
        });

        // Перехват всех методов console
        if (!console.original) {
            console.original = { ...console };
            Object.keys(console.original).forEach(key => {
                if (typeof console.original[key] === 'function') {
                    console[key] = function(...args) {
                        const message = args.map(arg => {
                            try {
                                return typeof arg === 'object' ? JSON.stringify(arg) : String(arg);
                            } catch (e) {
                                return 'Unserializable Object';
                            }
                        }).join(' ');
                        
                        let type = 'info';
                        if (key === 'error') type = 'error';
                        if (key === 'warn') type = 'warning';
                        if (key === 'debug') type = 'debug';
                        
                        if (self.log && self.state.isInitialized) {
                             self.log(message, type, args);
                        }
                        
                        console.original[key].apply(console, args);
                    };
                }
            });
        }
    },

    // MCP-MARKER:METHOD:HANDLE_ERROR - Обработка ошибок
    handleError(source, error, context = {}) {
        const errorInfo = {
            source,
            message: error?.message || String(error),
            stack: error?.stack,
            timestamp: Date.now(),
            context
        };
        this.log(`❌ ${source.toUpperCase()} ERROR: ${errorInfo.message}`, 'critical', errorInfo);
    },

    // MCP-MARKER:METHOD:INITIALIZE_UI - Инициализация UI
    initializeUI() {
        this.setTheme(this.config.currentTheme);
        console.log('🎨 UI initialized');
    },

    // MCP-MARKER:METHOD:ATTACH_EVENT_LISTENERS - Привязка событий
    attachEventListeners() {
        this.elements.input.addEventListener('keydown', (e) => this.handleInput(e));

        // Привязка кнопок (избегаем двойного срабатывания, если есть inline onclick)
        const bindIfNotInline = (el, handler) => {
            if (!el) return;
            if (el.dataset.bound === '1') return;
            const hasInline = !!el.getAttribute('onclick');
            if (hasInline) return; // уже есть inline обработчик — не дублируем
            el.addEventListener('click', handler);
            el.dataset.bound = '1';
        };

        bindIfNotInline(this.elements.controls.minimize, () => this.minimize());
        bindIfNotInline(this.elements.controls.fullscreen, () => this.toggleFullscreen());
        bindIfNotInline(this.elements.controls.stats, () => this.toggleStats());
        bindIfNotInline(this.elements.controls.copy, () => this.copyLogs());
        bindIfNotInline(this.elements.controls.clear, () => this.clear());
        bindIfNotInline(this.elements.controls.export, () => this.exportLogs());
    bindIfNotInline(this.elements.controls.dock, () => this.toggleDockMode());

        // Делегирование кликов по data-action (если разметка другая)
        this.elements.container.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-action]');
            if (!btn) return;
            const action = btn.getAttribute('data-action');
            if (action === 'minimize') return this.minimize();
            if (action === 'fullscreen') return this.toggleFullscreen();
            if (action === 'stats') return this.toggleStats();
            if (action === 'copy') return this.copyLogs();
            if (action === 'clear') return this.clear();
            if (action === 'export') return this.exportLogs();
        });

        const markUserInteraction = () => {
            if (this.userHasInteracted) return;
            this.userHasInteracted = true;
            this.playSound('system'); // Пробный звук для инициализации
            console.log('👤 User interaction detected. Audio enabled.');
        };

        document.addEventListener('click', markUserInteraction, { once: true });
        document.addEventListener('keydown', markUserInteraction, { once: true });
        
        // Синхронизируем подписи/иконки при старте
        this.syncControlIcons();

        console.log('🔗 Event listeners attached to controls (with delegation).');

        // Глобальные горячие клавиши
        this.setupHotkeys();

    // Виртуальный скролл (куллинг)
    this.setupVirtualScroll();
    },

    // MCP-MARKER:METHOD:SETUP_HOTKEYS - Горячие клавиши терминала
    setupHotkeys() {
        const handler = (e) => {
            // Игнорируем в полях ввода, кроме наших F-клавиш
            const tag = (e.target && (e.target.tagName || '')).toLowerCase();
            const isInput = tag === 'input' || tag === 'textarea' || e.target?.isContentEditable;
            const isFKey = e.key === 'F9' || e.key === 'F10';

            try {
                // Ctrl+F — поиск
                if (e.ctrlKey && !e.shiftKey && (e.key === 'f' || e.key === 'F')) {
                    e.preventDefault();
                    const root = this.elements.root || document;
                    const search = (root.getElementById ? root.getElementById('terminal-search') : null) || this.elements.container?.querySelector?.('#terminal-search');
                    if (search) search.focus();
                    return;
                }
                // F9 — свернуть/развернуть
                if (e.key === 'F9') {
                    e.preventDefault();
                    this.minimize();
                    return;
                }
                // F10 — полноэкранный режим
                if (e.key === 'F10') {
                    e.preventDefault();
                    this.toggleFullscreen();
                    return;
                }
                // Ctrl+K — очистка логов
                if (e.ctrlKey && !e.shiftKey && (e.key === 'k' || e.key === 'K')) {
                    e.preventDefault();
                    this.clear();
                    return;
                }
                // Ctrl+Shift+C — копия логов
                if (e.ctrlKey && e.shiftKey && (e.key === 'c' || e.key === 'C')) {
                    e.preventDefault();
                    this.copyLogs();
                    return;
                }
                // Прочее игнорируем, если ввод
                if (isInput && !isFKey) return;
            } catch (err) {
                console.original?.warn?.('Hotkeys handler error:', err);
            }
        };
        // Навешиваем один раз на window, чтобы ловить из Shadow DOM тоже
        if (!this._hotkeysBound) {
            window.addEventListener('keydown', handler, true);
            this._hotkeysBound = true;
        }
    },

    // MCP-MARKER:METHOD:SYNC_CONTROL_ICONS - Синхронизация иконок и подсказок
    syncControlIcons() {
        const m = this.elements.controls.minimize;
        if (m) { m.innerHTML = this.state.isMinimized ? '&#9633;' : '_'; m.title = this.state.isMinimized ? 'Развернуть' : 'Свернуть'; }
        const f = this.elements.controls.fullscreen;
        if (f) { f.innerHTML = this.state.isFullscreen ? '&#11131;' : '&#9974;'; f.title = this.state.isFullscreen ? 'Выйти из полноэкранного режима' : 'Полноэкранный режим'; }
    },
    
    // MCP-MARKER:METHOD:MINIMIZE - Сворачивание/разворачивание (через классы)
    minimize() {
        // Guard to prevent double-trigger from inline onclick + delegated listener
        const now = Date.now();
        if (this.state.lastAction.name === 'minimize' && (now - this.state.lastAction.ts) < 150) {
            return;
        }
        this.state.lastAction = { name: 'minimize', ts: now };
        if (!this.elements.container) {
            // Попробуем найти контейнер заново
            this.elements.container = document.getElementById('genesis-terminal');
            if (!this.elements.container) {
                console.error('Terminal container not found!');
                return;
            }
        }
        
        this.state.isMinimized = !this.state.isMinimized;
        this.elements.container.classList.toggle('minimized', this.state.isMinimized);
    this.elements.container.setAttribute('aria-expanded', String(!this.state.isMinimized));
        // ARIA sync for button
    if (this.elements.controls?.minimize) {
            this.elements.controls.minimize.setAttribute('aria-pressed', String(this.state.isMinimized));
        }
    if (!this.state.isMinimized) this.resetErrorBadge();

        // Вычисляем высоту шапки терминала и управляем высотой контейнера
        try {
            const header = this.elements.container.querySelector('.terminal-header') || this.elements.container.firstElementChild;
            const body = this.elements.body || this.elements.container.querySelector('.terminal-body');
            if (this.state.isMinimized) {
                const h = header ? header.getBoundingClientRect().height : 44;
                this.elements.container.style.height = `${Math.max(40, Math.ceil(h))}px`;
                if (body) body.style.display = 'none';
            } else {
                this.elements.container.style.height = '';
                if (body) body.style.display = '';
            }
        } catch (e) {
            // Безопасный fallback: только класс
        }
        
        // Ищем кнопку заново, если не найдена
        if (!this.elements.controls.minimize) {
            this.elements.controls.minimize = document.getElementById('terminal-btn-minimize');
        }
        
        const btn = this.elements.controls.minimize;
        if (btn) {
            btn.innerHTML = this.state.isMinimized ? '&#9633;' : '_'; // □ или _
            btn.title = this.state.isMinimized ? 'Развернуть' : 'Свернуть';
        }
    this.syncControlIcons();
    this.log(`📱 Терминал ${this.state.isMinimized ? 'свернут' : 'развернут'}`, 'system');
    },
    
    // MCP-MARKER:METHOD:TOGGLE_FULLSCREEN - Полный экран (через классы)
    toggleFullscreen() {
        // Guard against double-trigger
        const now = Date.now();
        if (this.state.lastAction.name === 'fullscreen' && (now - this.state.lastAction.ts) < 150) {
            return;
        }
        this.state.lastAction = { name: 'fullscreen', ts: now };
        if (!this.elements.container) {
            // Попробуем найти контейнер заново
            this.elements.container = document.getElementById('genesis-terminal');
            if (!this.elements.container) {
                console.error('Terminal container not found!');
                return;
            }
        }
        
    this.state.isFullscreen = !this.state.isFullscreen;
        this.elements.container.classList.toggle('fullscreen', this.state.isFullscreen);
        if (this.elements.controls?.fullscreen) {
            this.elements.controls.fullscreen.setAttribute('aria-pressed', String(this.state.isFullscreen));
        }
        
        // Ищем кнопку заново, если не найдена
        if (!this.elements.controls.fullscreen) {
            this.elements.controls.fullscreen = document.getElementById('terminal-btn-fullscreen');
        }
        
        const btn = this.elements.controls.fullscreen;
        if (btn) {
            btn.innerHTML = this.state.isFullscreen ? '&#11131;' : '&#9974;'; // Выход или вход
            btn.title = this.state.isFullscreen ? 'Выйти из полноэкранного режима' : 'Полноэкранный режим';
        }
    this.syncControlIcons();
    this.log(`🔲 Терминал ${this.state.isFullscreen ? 'в полноэкранном режиме' : 'в обычном режиме'}`, 'system');
    },

    // MCP-MARKER:METHOD:APPLY_DOCK_MODE - Применение режима докинга
    applyDockMode() {
