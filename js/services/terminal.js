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
        const mode = this.state.dockMode;
        const host = (this.elements.root && this.elements.root.host) ? this.elements.root.host : this.elements.container;
        if (!host) return;
        host.classList.remove('mode-dock-bottom', 'mode-dock-right');
        // Сбрасываем явные позиции
        if (mode === 'floating') {
            // оставляем текущие left/top, если были заданы пользователем
        } else if (mode === 'dock-bottom') {
            host.classList.add('mode-dock-bottom');
        } else if (mode === 'dock-right') {
            host.classList.add('mode-dock-right');
        }
        try { localStorage.setItem('genesis-terminal-mode', mode); } catch {}
    },

    // MCP-MARKER:METHOD:TOGGLE_DOCK_MODE - Переключение режима докинга
    toggleDockMode() {
        const order = ['floating', 'dock-bottom', 'dock-right'];
        const idx = order.indexOf(this.state.dockMode);
        this.state.dockMode = order[(idx + 1) % order.length];
        this.applyDockMode();
        this.log(`🧷 Режим терминала: ${this.state.dockMode}`, 'system');
    },

    // MCP-MARKER:METHOD:TOGGLE_STATS - Показ/скрытие статистики
    toggleStats() {
        if (!this.elements.statsPanel.container) return;
        this.state.isStatsVisible = !this.state.isStatsVisible;
        this.elements.statsPanel.container.classList.toggle('show', this.state.isStatsVisible);
        this.log(`📊 Статистика ${this.state.isStatsVisible ? 'показана' : 'скрыта'}`, 'system');
    },
    
    // MCP-MARKER:METHOD:PLAY_SOUND - Воспроизведение звуков (Web Audio API)
    playSound(type) {
        if (!this.config.soundEnabled || !this.userHasInteracted) return;
        
        try {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }

            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.15, this.audioContext.currentTime + 0.01);

            if (type === 'error' || type === 'critical') {
                oscillator.type = 'square';
                oscillator.frequency.setValueAtTime(150, this.audioContext.currentTime);
            } else if (type === 'system') {
                 oscillator.type = 'triangle';
                 oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
            } else {
                 oscillator.type = 'sine';
                 oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
            }

            oscillator.start(this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.00001, this.audioContext.currentTime + 0.2);
            oscillator.stop(this.audioContext.currentTime + 0.2);

        } catch (error) {
            console.original.warn(`Audio playback failed: ${error.message}`);
            this.config.soundEnabled = false;
        }
    },

    // MCP-MARKER:METHOD:UPDATE_STATS - Обновление панели статистики
    updateStats() {
        if (!this.state.isStatsVisible || !this.elements.statsPanel.container) return;
        
        this.elements.statsPanel.messageCount.textContent = this.stats.messageCount;
        this.elements.statsPanel.uptime.textContent = this.getUptime();
        this.elements.statsPanel.errors.textContent = `${this.stats.errorCount} / ${this.stats.criticalCount}`;
        this.elements.statsPanel.memory.textContent = this.getMemoryUsage();
    },

    log(message, type = 'info', data = null) {
        if (this.state.fallbackMode) {
            console.original.log(`[FALLBACK] [${type.toUpperCase()}] ${message}`, data);
            return;
        }
        this.stats.messageCount++;
        if (type === 'error') this.stats.errorCount++;
        if (type === 'critical') this.stats.criticalCount++;
        if (type === 'warning') this.stats.warningCount++;
        if (type === 'success') this.stats.successCount++;
    if (type === 'api') this.stats.apiCalls++;
    if (type === 'transaction') this.stats.transactions++;
    if (this.stats.typeCounts && (type in this.stats.typeCounts)) this.stats.typeCounts[type]++;
        if (type === 'error' || type === 'critical') {
            this.stats.errorHistory.push({ timestamp: Date.now(), message, data });
            if (this.stats.errorHistory.length > 50) this.stats.errorHistory.shift();
            // Обновляем бейдж ошибок
            this.state.unreadErrors++;
            this.updateErrorBadge();
        }
        this.addMessage(message, type, data);
    },

    addMessage(message, type, data) {
        if (!this.config.filters[type]) return;
        const timestamp = new Date().toLocaleTimeString('ru-RU');
        const msgEl = document.createElement('div');
        msgEl.className = `terminal-message type-${type}`;
        msgEl.dataset.type = type;
        msgEl.dataset.timestamp = timestamp;
        const icons = { info: 'ℹ️', success: '✅', warning: '⚠️', error: '❌', debug: '🐛', system: '⚙️', api: '🌐', transaction: '💱', security: '🔒', critical: '🚨' };
        msgEl.innerHTML = `<span class="msg-meta"><span class="msg-icon">${icons[type] || '📝'}</span><span class="msg-time">${timestamp}</span></span><span class="msg-text">${this.escapeHtml(message)}</span>`;
        if (data) {
            const dataEl = document.createElement('div');
            dataEl.className = 'msg-data';
            dataEl.textContent = JSON.stringify(data, null, 2);
            msgEl.appendChild(dataEl);
        }
        // Очередь рендера
        this.state.renderQueue.push(msgEl);
        if (!this.state.renderScheduled) {
            this.state.renderScheduled = true;
            requestAnimationFrame(() => this.flushRenderQueue());
        }
        // Обновляем статус-бар, если есть
        try {
            const root = this.elements.root || document;
            const bar = (root.getElementById ? root.getElementById('terminal-status') : null) || this.elements.container?.querySelector?.('#terminal-status');
            if (bar) bar.textContent = `Theme: ${this.config.currentTheme} • Mode: ${this.state.dockMode} • Messages: ${this.stats.messageCount}`;
        } catch {}
        if (this.config.soundEnabled && (type === 'error' || type === 'critical')) this.playSound(type);
    if (this.state.virtualization.enabled) this.applyVirtualCull();
    },

    // MCP-MARKER:METHOD:RENDER:FLUSH - Выгрузка очереди рендера
    flushRenderQueue() {
        try {
            const frag = document.createDocumentFragment();
            for (const el of this.state.renderQueue) frag.appendChild(el);
            this.state.renderQueue.length = 0;
            this.elements.body.appendChild(frag);
            // Автоскролл после вставки
            if (this.config.autoScroll) this.elements.body.scrollTop = this.elements.body.scrollHeight;
            this.limitMessages();
            // Применить фильтры/поиск к новым нодам
            this.applyFilterVisibility();
        } finally {
            this.state.renderScheduled = false;
        }
    },

    displayStartupMessages() {
        this.log('GENESIS ULTIMATE TERMINAL v3.1 - ROBUST & RELIABLE', 'system');
        this.log('Перехват всех console.* логов активирован.', 'security');
        this.log('Введите "help" для просмотра команд.', 'info');
    },

    commands: {
        help: {
            description: 'Показать список команд',
            usage: 'help [команда]',
            handler: (cmd) => {
                if (cmd) {
                    const command = window.GenesisTerminal.commands[cmd.toLowerCase()];
                    if (command) {
                        return `📖 ${cmd.toUpperCase()}\nОписание: ${command.description}\nИспользование: ${command.usage || 'Нет параметров'}`;
                    }
                    return `❌ Команда "${cmd}" не найдена`;
                }
                const cmdList = Object.keys(window.GenesisTerminal.commands).map(cmd => `${cmd} - ${window.GenesisTerminal.commands[cmd].description}`).join('\n');
                return `📚 Доступные команды:\n${cmdList}\n\n💡 Введите 'help [команда]' для подробной информации`;
            }
        },
        virtual: {
            description: 'Включить/выключить упрощенную виртуализацию (куллинг вне экрана)',
            usage: 'virtual [on|off]',
            handler: (action) => {
                if (action === 'on') window.GenesisTerminal.setVirtualization(true);
                else if (action === 'off') window.GenesisTerminal.setVirtualization(false);
                else window.GenesisTerminal.setVirtualization(!window.GenesisTerminal.state.virtualization.enabled);
                return `🧭 Виртуализация: ${window.GenesisTerminal.state.virtualization.enabled ? 'on' : 'off'}`;
            }
        },
        echo: {
            description: 'Выводит текст в лог',
            usage: 'echo <текст>',
            handler: (...parts) => {
                const text = parts.join(' ');
                window.GenesisTerminal.log(text, 'info');
                return `🗣️ ${text}`;
            }
        },
        clear: {
            description: 'Очистить терминал',
            usage: 'clear',
            handler: () => {
                window.GenesisTerminal.clear();
                return '✅ Терминал очищен';
            }
        },
        mode: {
            description: 'Переключить или установить режим (floating|dock-bottom|dock-right)',
            usage: 'mode [режим]',
            handler: (m) => {
                const modes = ['floating', 'dock-bottom', 'dock-right'];
                if (m && modes.includes(m)) {
                    window.GenesisTerminal.state.dockMode = m;
                    window.GenesisTerminal.applyDockMode();
                    return `🧷 Режим установлен: ${m}`;
                }
                window.GenesisTerminal.toggleDockMode();
                return `🧷 Режим переключён: ${window.GenesisTerminal.state.dockMode}`;
            }
        },
        stats: {
            description: 'Показать/скрыть статистику',
            usage: 'stats',
            handler: () => {
                window.GenesisTerminal.toggleStats();
                return `📊 Панель статистики ${window.GenesisTerminal.state.isStatsVisible ? 'показана' : 'скрыта'}`;
            }
        },
        filter: {
            description: 'Включить/выключить фильтр по типу (info|warning|error|debug|success|system|api|transaction|security|critical)',
            usage: 'filter <type> [on|off|toggle]',
            handler: (type, action = 'toggle') => {
                if (!type) return 'Укажите тип: filter <type> [on|off|toggle]';
                const t = type.toLowerCase();
                const valid = Object.prototype.hasOwnProperty.call(window.GenesisTerminal.config.filters, t);
                if (!valid) return `Неизвестный тип: ${type}`;
                if (action === 'on') window.GenesisTerminal.setFilter(t, true);
                else if (action === 'off') window.GenesisTerminal.setFilter(t, false);
                else window.GenesisTerminal.toggleFilter(t);
                return `🧰 Фильтр ${t}: ${window.GenesisTerminal.config.filters[t] ? 'on' : 'off'}`;
            }
        },
        errors: {
            description: 'Показать журнал ошибок',
            usage: 'errors [количество]',
            handler: (count = 10) => {
                const errors = window.GenesisTerminal.stats.errorHistory;
                if (errors.length === 0) return '✅ Ошибок не обнаружено';
                const recentErrors = errors.slice(-count).map((error, index) => {
                    const time = new Date(error.timestamp).toLocaleTimeString();
                    return `${index + 1}. [${time}] ${error.message}`;
                }).join('\n');
                return `📋 Последние ${Math.min(count, errors.length)} ошибок:\n${recentErrors}`;
            }
        },
        theme: {
            description: 'Сменить тему терминала',
            usage: 'theme [название]',
            handler: (theme) => {
                if (theme && window.GenesisTerminal.config.themes.includes(theme)) {
                    window.GenesisTerminal.setTheme(theme);
                    return `🎨 Тема изменена на: ${theme}`;
                }
                return `🎨 Доступные темы: ${window.GenesisTerminal.config.themes.join(', ')}`;
            }
        },
        test: {
            description: 'Тестовые сообщения',
            usage: 'test [error|warning|success|info|debug|critical]',
            handler: (type = 'info') => {
                const message = `Это тестовое сообщение типа: ${type}`;
                window.GenesisTerminal.log(message, type);
                return `🧪 Тест выполнен: ${type}`;
            }
        }
    },

    handleInput(event) {
        if (event.key === 'Enter') {
            const command = this.elements.input.value.trim();
            if (!command) return;
            this.commandHistory.push(command);
            if (this.commandHistory.length > this.config.commands.maxHistory) this.commandHistory.shift();
            this.historyIndex = this.commandHistory.length;
            this.log(`> ${command}`, 'system');
            this.executeCommand(command);
            this.elements.input.value = '';
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            if (this.historyIndex > 0) {
                this.historyIndex--;
                this.elements.input.value = this.commandHistory[this.historyIndex];
            }
        } else if (event.key === 'ArrowDown') {
            event.preventDefault();
            if (this.historyIndex < this.commandHistory.length - 1) {
                this.historyIndex++;
                this.elements.input.value = this.commandHistory[this.historyIndex];
            } else {
                this.historyIndex = this.commandHistory.length;
                this.elements.input.value = '';
            }
        }
    },

    executeCommand(commandLine) {
        const [cmd, ...args] = commandLine.split(' ');
        const command = this.commands[cmd.toLowerCase()];
        if (command) {
            try {
                const result = command.handler(...args);
                if (result) this.log(result, 'success');
            } catch (error) {
                this.log(`❌ Ошибка выполнения: ${error.message}`, 'error');
            }
        } else {
            this.log(`❌ Неизвестная команда: ${cmd}. Введите 'help'.`, 'error');
        }
    },

    clear() {
        if (this.elements.body) this.elements.body.innerHTML = '';
        this.stats.messageCount = 0; this.stats.errorCount = 0;
        this.stats.warningCount = 0; this.stats.successCount = 0;
        this.stats.criticalCount = 0;
        this.log('Терминал очищен', 'system');
    },

    copyLogs() {
        if (!this.elements.body) return;
        let items = Array.from(this.elements.body.querySelectorAll('.terminal-message, [data-log-line], .log-line'));
        let logText = '';
        if (items.length > 0) {
            logText = items
                .map(msg => `[${msg.dataset.timestamp || ''}] [${(msg.dataset.type || 'info').toUpperCase()}] ${msg.textContent}`.trim())
                .join('\n');
        } else {
            // Fallback: берём весь текст терминала
            logText = this.elements.body.textContent || '';
        }
        const doSuccess = () => this.log('📋 Логи скопированы в буфер обмена', 'success');
        const doError = (err) => this.log('Ошибка копирования: ' + (err?.message || err), 'error');
        if (navigator.clipboard?.writeText) {
            navigator.clipboard.writeText(logText).then(doSuccess).catch(err => {
                // Fallback textarea
                try {
                    const ta = document.createElement('textarea');
                    ta.value = logText; ta.style.position = 'fixed'; ta.style.left = '-9999px';
                    document.body.appendChild(ta); ta.focus(); ta.select();
                    const ok = document.execCommand('copy');
                    document.body.removeChild(ta);
                    ok ? doSuccess() : doError('execCommand failed');
                } catch (e) { doError(e); }
            });
        } else {
            try {
                const ta = document.createElement('textarea');
                ta.value = logText; ta.style.position = 'fixed'; ta.style.left = '-9999px';
                document.body.appendChild(ta); ta.focus(); ta.select();
                const ok = document.execCommand('copy');
                document.body.removeChild(ta);
                ok ? doSuccess() : doError('execCommand failed');
            } catch (e) { doError(e); }
        }
    },

    exportLogs(format = 'txt') {
        if (!this.elements.body) return;
        const messages = Array.from(this.elements.body.querySelectorAll('.terminal-message')).map(msg => msg.textContent);
        let content = '';
        let filename = `genesis-logs-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}`;
        if (format === 'json') {
            content = JSON.stringify(messages, null, 2);
            filename += '.json';
        } else {
            content = messages.join('\n');
            filename += '.txt';
        }
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        this.log(`📥 Логи экспортированы: ${filename}`, 'success');
    },

    // MCP-MARKER:METHOD:ERROR_BADGE:UPDATE - Обновить бейдж ошибок в хедере
    updateErrorBadge() {
        try {
            const root = this.elements.root || document;
            const badge = (root.getElementById ? root.getElementById('terminal-error-badge') : null) || this.elements.container?.querySelector?.('#terminal-error-badge');
            if (!badge) return;
            const n = this.state.unreadErrors;
            if (n > 0) { badge.style.display = 'inline-block'; badge.textContent = String(n); }
            else { badge.style.display = 'none'; badge.textContent = '0'; }
        } catch {}
    },

    // MCP-MARKER:METHOD:ERROR_BADGE:RESET - Сбросить счётчик ошибок
    resetErrorBadge() {
        this.state.unreadErrors = 0;
        this.updateErrorBadge();
    },

    getUptime() {
        const uptime = Date.now() - this.stats.startTime;
        const h = Math.floor(uptime / 3600000).toString().padStart(2, '0');
        const m = Math.floor((uptime % 3600000) / 60000).toString().padStart(2, '0');
        const s = Math.floor((uptime % 60000) / 1000).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    },

    getMemoryUsage() {
        return performance.memory ? `${Math.round(performance.memory.usedJSHeapSize / 1024 / 1024)} MB` : 'N/A';
    },

    limitMessages() {
        const limit = this.config.maxMessages;
        while (this.elements.body.children.length > limit) {
            this.elements.body.firstChild.remove();
        }
    },

    // MCP-MARKER:METHOD:ERROR_BADGE:UPDATE - Обновить бейдж ошибок в хедере
    updateErrorBadge() {
        try {
            const root = this.elements.root || document;
            const badge = (root.getElementById ? root.getElementById('terminal-error-badge') : null) || this.elements.container?.querySelector?.('#terminal-error-badge');
            if (!badge) return;
            const n = this.state.unreadErrors;
            if (n > 0) { badge.style.display = 'inline-block'; badge.textContent = String(n); }
            else { badge.style.display = 'none'; badge.textContent = '0'; }
        } catch {}
    },

    // MCP-MARKER:METHOD:ERROR_BADGE:RESET - Сбросить счётчик ошибок
    resetErrorBadge() {
        this.state.unreadErrors = 0;
        this.updateErrorBadge();
    },

    // MCP-MARKER:METHOD:VIRTUAL_SCROLL:SETUP - Настройка куллинга вне экрана
    setupVirtualScroll() {
        const body = this.elements.body;
        if (!body) return;
        const onScroll = () => { if (this.state.virtualization.enabled) this.applyVirtualCull(); };
        if (!this._virtualScrollBound) {
            body.addEventListener('scroll', onScroll, { passive: true });
            this._virtualScrollBound = true;
        }
        // Применяем при инициализации
        if (this.state.virtualization.enabled) this.applyVirtualCull();
    },

    // MCP-MARKER:METHOD:VIRTUAL_SCROLL:APPLY - Скрыть сообщения вне видимой области с буфером
    applyVirtualCull() {
        const body = this.elements.body; if (!body) return;
        const top = body.scrollTop; const height = body.clientHeight; const buffer = this.state.virtualization.bufferPx;
        const minY = Math.max(0, top - buffer); const maxY = top + height + buffer;
        const nodes = body.querySelectorAll('.terminal-message');
        nodes.forEach(el => {
            const y1 = el.offsetTop; const y2 = y1 + el.offsetHeight;
            const visible = (y2 >= minY && y1 <= maxY);
            el.style.visibility = visible ? 'visible' : 'hidden';
        });
    },

    // MCP-MARKER:METHOD:VIRTUAL_SCROLL:ENABLE - Включить/выключить
    setVirtualization(enabled) {
        this.state.virtualization.enabled = !!enabled;
        try { localStorage.setItem('genesis-terminal-virtual', this.state.virtualization.enabled ? 'true' : 'false'); } catch {}
        if (!this.elements.body) return;
        if (this.state.virtualization.enabled) this.applyVirtualCull();
        else {
            // Вернуть видимость всем
            const nodes = this.elements.body.querySelectorAll('.terminal-message');
            nodes.forEach(el => { el.style.visibility = 'visible'; });
        }
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    setTheme(theme) {
        if (this.elements.container) {
            this.elements.container.dataset.theme = theme;
            this.config.currentTheme = theme;
            this.saveSettings();
            this.log(`🎨 Тема изменена на: ${theme}`, 'system');
        }
    },

    startSystemMonitoring() {
        if (this.state.monitoringInterval) return;
        this.state.monitoringInterval = setInterval(() => {
            if (this.state.isStatsVisible) this.updateStats();
        }, 1000);
    },

    stopRealTimeMonitoring() {
        if (this.state.monitoringInterval) {
            clearInterval(this.state.monitoringInterval);
            this.state.monitoringInterval = null;
        }
    },

    loadSettings() {
        try {
            const saved = localStorage.getItem('genesis-terminal-settings');
            if (saved) {
                const settings = JSON.parse(saved);
                this.config = { ...this.config, ...settings.config };
                this.commandHistory = settings.commandHistory || [];
                this.historyIndex = this.commandHistory.length;
            }
            // Загружаем режим докинга
            const dockMode = localStorage.getItem('genesis-terminal-mode');
            if (dockMode) { this.state.dockMode = dockMode; }
            // Загружаем индивидуальные фильтры
            Object.keys(this.config.filters).forEach(k => {
                const v = localStorage.getItem(`genesis-terminal-filter-${k}`);
                if (v === 'true' || v === 'false') this.config.filters[k] = (v === 'true');
            });
        } catch (error) {
            console.original.warn('Ошибка загрузки настроек терминала:', error);
        }
    },

    saveSettings() {
        try {
            localStorage.setItem('genesis-terminal-settings', JSON.stringify({
                config: this.config,
                commandHistory: this.commandHistory
            }));
        } catch (error) {
            console.original.warn('Ошибка сохранения настроек терминала:', error);
        }
    },

    initCursorHandling() {
        if (!this.elements.input) return;
        const input = this.elements.input;
        const cursor = input.parentElement.querySelector('.terminal-custom-cursor');
        const update = () => {
            if (!cursor) return;
            const textMeasure = document.createElement('span');
            textMeasure.style.font = window.getComputedStyle(input).font;
            textMeasure.style.visibility = 'hidden';
            textMeasure.style.position = 'absolute';
            textMeasure.textContent = input.value.substring(0, input.selectionStart);
            document.body.appendChild(textMeasure);
            const textWidth = textMeasure.offsetWidth;
            document.body.removeChild(textMeasure);
            const promptElement = input.parentElement.querySelector('.terminal-prompt');
            const promptWidth = promptElement ? promptElement.offsetWidth : 0;
            const initialOffset = parseFloat(window.getComputedStyle(input).paddingLeft) || 0;
            cursor.style.left = `${initialOffset + promptWidth + textWidth}px`;
        };
        input.addEventListener('input', update);
        input.addEventListener('keydown', () => setTimeout(update, 0));
        input.addEventListener('click', update);
        input.addEventListener('focus', () => { if(cursor) cursor.style.display = 'inline-block'; update(); });
        input.addEventListener('blur', () => { if(cursor) cursor.style.display = 'none'; });
        update();
    }
    ,

    // MCP-MARKER:METHOD:FILTERS:SET - Установить фильтр
    setFilter(type, value) {
        if (!(type in this.config.filters)) return;
        this.config.filters[type] = Boolean(value);
        this.applyFilterVisibility();
        try { localStorage.setItem(`genesis-terminal-filter-${type}`, String(this.config.filters[type])); } catch {}
    }
    ,

    // MCP-MARKER:METHOD:FILTERS:TOGGLE - Переключить фильтр
    toggleFilter(type) {
        if (!(type in this.config.filters)) return;
        this.config.filters[type] = !this.config.filters[type];
        this.applyFilterVisibility();
        try { localStorage.setItem(`genesis-terminal-filter-${type}`, String(this.config.filters[type])); } catch {}
    }
    ,

    // MCP-MARKER:METHOD:FILTERS:APPLY_VISIBILITY - Применить видимость к существующим сообщениям
    applyFilterVisibility() {
        if (!this.elements.body) return;
        const nodes = this.elements.body.querySelectorAll('.terminal-message');
        const q = (this.state.searchQuery || '').toLowerCase();
        nodes.forEach(n => {
            const t = n.dataset.type || 'info';
            const text = (n.textContent || '').toLowerCase();
            const byType = !!this.config.filters[t];
            const byQuery = !q || text.includes(q);
            n.style.display = (byType && byQuery) ? '' : 'none';
        });
    }
    ,

    // MCP-MARKER:METHOD:SEARCH:SET - Установить строку поиска
    setSearchQuery(query) {
        this.state.searchQuery = String(query || '');
        // можно сохранять в sessionStorage, чтобы не мешать старту
        try { sessionStorage.setItem('genesis-terminal-search', this.state.searchQuery); } catch {}
        this.applyFilterVisibility();
    }
    ,

    // MCP-MARKER:METHOD:FILTER_CHIPS:UPDATE - Обновить счётчики на чипсах фильтров
    updateFilterChips() {
        try {
            const root = this.elements.root || document;
            const chips = (root.getElementById ? root.getElementById('terminal-chips') : null) || this.elements.container?.querySelector?.('#terminal-chips');
            if (!chips) return;
            chips.querySelectorAll('.chip').forEach(ch => {
                const t = ch.getAttribute('data-type');
                if (!t) return;
                const count = this.stats.typeCounts?.[t] ?? 0;
                const base = t;
                ch.textContent = count > 0 ? `${base} (${count})` : base;
                if (this.config.filters && t in this.config.filters) ch.classList.toggle('active', !!this.config.filters[t]);
            });
        } catch {}
    }
};

// MCP-MARKER:SECTION:AUTO_INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
    window.GenesisTerminal.init();
});
