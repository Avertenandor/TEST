// modules/terminal/terminal.module.js
// Модуль терминала на основе кода с главной страницы

// Глобальный перехватчик (устанавливается один раз на весь сайт)
(function installGlobalInterceptors(){
    try {
        if (window.__terminalInterceptorsInstalled) return;
        window.__terminalInterceptorsInstalled = true;

        // Ранний буфер логов до инициализации UI
        window.__terminalBuffer = window.__terminalBuffer || [];

        const levels = ['trace','debug','log','info','warn','error'];
        const originalConsole = {};
        levels.forEach(l => { originalConsole[l] = console[l]; });

        // Перехват console.*
        levels.forEach(level => {
            console[level] = function(...args){
                try { originalConsole[level].apply(console, args); } catch {}
                try {
                    const entry = { ts: Date.now(), level, source:'console', message: args.map(a => {
                        try { return typeof a === 'string' ? a : JSON.stringify(a); } catch { return String(a); }
                    }).join(' ')};
                    window.__terminalBuffer.push(entry);
                    if (window.CabinetTerminal?.logFromInterceptor) {
                        window.CabinetTerminal.logFromInterceptor(entry);
                    }
                } catch {}
            };
        });

        // window.onerror
        window.addEventListener('error', function(e){
            try {
                const isResource = e.target && (e.target.tagName === 'IMG' || e.target.tagName === 'SCRIPT' || e.target.tagName === 'LINK');
                const entry = isResource ? {
                    ts: Date.now(), level:'error', source:'resource',
                    message: `Resource load error: <${e.target.tagName.toLowerCase()}> ${e.target.src||e.target.href||''}`
                } : {
                    ts: Date.now(), level:'error', source:'onerror',
                    message: e.message || 'Unhandled error', details: { filename: e.filename, lineno: e.lineno, colno: e.colno }
                };
                window.__terminalBuffer.push(entry);
                window.CabinetTerminal?.logFromInterceptor?.(entry);
            } catch {}
        }, true);

        // unhandledrejection
        window.addEventListener('unhandledrejection', function(e){
            try {
                const reason = e.reason;
                const msg = (reason && (reason.message || reason.toString && reason.toString())) || 'Unhandled promise rejection';
                const entry = { ts: Date.now(), level:'error', source:'unhandledrejection', message: String(msg) };
                window.__terminalBuffer.push(entry);
                window.CabinetTerminal?.logFromInterceptor?.(entry);
            } catch {}
        });

        // fetch
        const originalFetch = window.fetch?.bind(window);
        if (originalFetch) {
            window.fetch = async function(input, init){
                const start = performance.now();
                let url = '';
                try { url = typeof input === 'string' ? input : (input?.url || ''); } catch {}
                const method = (init && init.method) || 'GET';
                try {
                    const resp = await originalFetch(input, init);
                    const dur = Math.round(performance.now() - start);
                    const entry = { ts: Date.now(), level: (resp.ok?'log':'warn'), source:'fetch', message:`${method} ${url} -> ${resp.status} (${dur}ms)` };
                    window.__terminalBuffer.push(entry);
                    window.CabinetTerminal?.logFromInterceptor?.(entry);
                    return resp;
                } catch (err) {
                    const dur = Math.round(performance.now() - start);
                    const entry = { ts: Date.now(), level:'error', source:'fetch', message:`${method} ${url} -> network error (${dur}ms): ${err?.message||err}` };
                    window.__terminalBuffer.push(entry);
                    window.CabinetTerminal?.logFromInterceptor?.(entry);
                    throw err;
                }
            };
        }

        // XHR
        const XHR = window.XMLHttpRequest;
        if (XHR) {
            const open = XHR.prototype.open;
            const send = XHR.prototype.send;
            XHR.prototype.open = function(method, url){
                this.__terminal = { method, url, start: 0 };
                return open.apply(this, arguments);
            };
            XHR.prototype.send = function(body){
                if (this.__terminal) this.__terminal.start = performance.now();
                this.addEventListener('loadend', () => {
                    try {
                        const t = this.__terminal || { method:'GET', url:'' };
                        const dur = t.start ? Math.round(performance.now() - t.start) : 0;
                        const entry = { ts: Date.now(), level:(this.status>=400?'warn':'log'), source:'xhr', message:`${t.method} ${t.url} -> ${this.status} (${dur}ms)` };
                        window.__terminalBuffer.push(entry);
                        window.CabinetTerminal?.logFromInterceptor?.(entry);
                    } catch {}
                });
                return send.apply(this, arguments);
            };
        }

        // Формы: submit/invalid
        window.addEventListener('submit', (e) => {
            try {
                const form = e.target;
                const prevented = e.defaultPrevented;
                const entry = { ts: Date.now(), level: prevented ? 'warn':'info', source:'form', message:`form submit${prevented?' (prevented)':''}: ${form?.name||form?.id||form?.action||''}` };
                window.__terminalBuffer.push(entry);
                window.CabinetTerminal?.logFromInterceptor?.(entry);
            } catch {}
        }, true);
        window.addEventListener('invalid', (e) => {
            try {
                const el = e.target;
                const entry = { ts: Date.now(), level:'warn', source:'form', message:`invalid field: ${el?.name||el?.id||el?.tagName}` };
                window.__terminalBuffer.push(entry);
                window.CabinetTerminal?.logFromInterceptor?.(entry);
            } catch {}
        }, true);
    } catch {}
})();

window.CabinetTerminal = {
    // Конфигурация
    config: {
        maxMessages: 2000,
        themes: ['dark', 'light', 'matrix', 'retro', 'cyber', 'neon'],
        currentTheme: 'dark',
        soundEnabled: false,
        autoScroll: true,
        timestampFormat: 'HH:mm:ss',
        filters: {
            info: true, success: true, warning: true, error: true,
            debug: true, system: true, api: true, transaction: true
        }
    },

    // Буфер и статистика
    messages: [],
    stats: {
        messageCount: 0, errorCount: 0, warningCount: 0, successCount: 0,
        apiCalls: 0, transactions: 0, startTime: Date.now(),
        typeCounts: { info: 0, success: 0, warning: 0, error: 0, debug: 0, system: 0, api: 0, transaction: 0 }
    },

    // Состояние
    state: {
        isInitialized: false,
        isStatsVisible: false,
        autoScroll: true,
        timestamps: true,
        soundNotifications: false
    },

    // DOM элементы
    elements: {
        container: null,
        body: null,
        input: null,
        statsPanel: null
    },

    // История команд
    commandHistory: [],
    historyIndex: -1,

    // Доступные команды
    commands: {
        'help': {
            description: 'Показать справку по командам',
            usage: 'help [command]',
            execute: (args) => this.showHelp(args)
        },
        'clear': {
            description: 'Очистить терминал',
            usage: 'clear',
            execute: () => this.clear()
        },
        'status': {
            description: 'Показать статус системы',
            usage: 'status',
            execute: () => this.showStatus()
        },
        'balance': {
            description: 'Показать баланс кошелька',
            usage: 'balance',
            execute: () => this.showBalance()
        },
        'deposits': {
            description: 'Показать список депозитов',
            usage: 'deposits',
            execute: () => this.showDeposits()
        },
        'history': {
            description: 'Показать историю транзакций',
            usage: 'history [limit]',
            execute: (args) => this.showHistory(args)
        },
        'export': {
            description: 'Экспортировать данные',
            usage: 'export [type]',
            execute: (args) => this.exportData(args)
        },
        'theme': {
            description: 'Сменить тему терминала',
            usage: 'theme [name]',
            execute: (args) => this.changeTheme(args)
        }
    },

    // Инициализация
    init() {
        if (this.state.isInitialized) return;

        this.bindElements();
        this.attachEventListeners();
    this.enableDragAndResize();
    this.installInterceptors();
        this.displayWelcomeMessage();
        this.startUpdateLoop();
        
    // Публичный алиас для совместимости: window.GenesisTerminal
    window.GenesisTerminal = this.getPublicAPI();
        
        this.state.isInitialized = true;
        this.log('🚀 GENESIS Terminal v2.0 initialized', 'system');
        this.log('💼 Cabinet mode active', 'info');
        this.log('Type "help" for available commands', 'info');
    },

    // Привязка DOM элементов
    bindElements() {
        this.elements.container = document.getElementById('cabinet-genesis-terminal');
        this.elements.body = document.getElementById('cabinet-terminal-body');
        this.elements.input = document.getElementById('cabinetTerminalInput');
        this.elements.statsPanel = document.getElementById('cabinet-statsPanel');
    },

    // Привязка событий
    attachEventListeners() {
        // Обработка ввода команд
        if (this.elements.input) {
            this.elements.input.addEventListener('keydown', (e) => this.handleInput(e));
            this.elements.input.addEventListener('input', (e) => this.handleAutocomplete(e.target.value));
        }

        // Обработка автопрокрутки
        if (this.elements.body) {
            this.elements.body.addEventListener('scroll', () => {
                const { scrollTop, scrollHeight, clientHeight } = this.elements.body;
                this.state.autoScroll = scrollTop + clientHeight >= scrollHeight - 10;
            });
        }
    },

    enableDragAndResize() {
        try {
            const root = this.elements.container;
            const header = root?.querySelector('.genesis-terminal-header');
            if (!root || !header) return;
            root.style.position = 'fixed';
            root.style.right = '12px';
            root.style.bottom = '12px';
            root.style.maxWidth = '90vw';
            root.style.maxHeight = '90vh';
            root.style.resize = 'both';
            root.style.overflow = 'auto';

            let dragging = false, startX=0, startY=0, startLeft=0, startTop=0;
            header.style.cursor = 'move';
            header.addEventListener('mousedown', (e)=>{
                dragging = true;
                startX = e.clientX; startY = e.clientY;
                const rect = root.getBoundingClientRect();
                startLeft = rect.left; startTop = rect.top;
                e.preventDefault();
            });
            window.addEventListener('mousemove', (e)=>{
                if (!dragging) return;
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;
                root.style.left = Math.max(0, startLeft + dx) + 'px';
                root.style.top = Math.max(0, startTop + dy) + 'px';
                root.style.right = 'auto';
                root.style.bottom = 'auto';
            });
            window.addEventListener('mouseup', ()=> dragging=false);
        } catch {}
    },

    installInterceptors() {
        // Дренируем ранний буфер в UI
        try {
            if (Array.isArray(window.__terminalBuffer)) {
                window.__terminalBuffer.forEach(e => this.logFromInterceptor(e));
                // не чистим буфер — пусть накапливается для сторонних слушателей
            }
        } catch {}
    },

    // Паблик API для других частей приложения
    getPublicAPI() {
        return {
            clear: () => this.clear(),
            copyAll: () => this.copyAll(),
            exportLogs: () => this.exportLogs(),
            minimize: () => this.minimize(),
            maximize: () => this.maximize(),
            close: () => this.close(),
            open: () => this.open(),
            toggleFullscreen: () => this.toggleFullscreen(),
            toggleStats: () => this.toggleStats(),
            toggleTheme: () => this.toggleTheme(),
            toggleSound: () => this.toggleSound(),
            search: (q) => this.search(q),
            toggleFilter: (k) => this.toggleFilter(k),
            handleInput: (e) => this.handleInput(e),
            handleAutocomplete: (v) => this.handleAutocomplete(v),
            log: (m,t,d) => this.log(m,t,d),
            get errorCount(){ return window.CabinetTerminal?.stats?.errorCount || 0; },
            get messageCount(){ return window.CabinetTerminal?.stats?.messageCount || window.CabinetTerminal?.messages?.length || 0; }
        };
    },

    // Обработка ввода
    handleInput(event) {
        if (event.key === 'Enter') {
            const command = event.target.value.trim();
            if (command) {
                this.executeCommand(command);
                this.commandHistory.push(command);
                this.historyIndex = this.commandHistory.length;
            }
            event.target.value = '';
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            if (this.historyIndex > 0) {
                this.historyIndex--;
                event.target.value = this.commandHistory[this.historyIndex];
            }
        } else if (event.key === 'ArrowDown') {
            event.preventDefault();
            if (this.historyIndex < this.commandHistory.length - 1) {
                this.historyIndex++;
                event.target.value = this.commandHistory[this.historyIndex];
            } else {
                this.historyIndex = this.commandHistory.length;
                event.target.value = '';
            }
        } else if (event.key === 'Tab') {
            event.preventDefault();
            this.handleTabCompletion(event.target);
        }
    },

    // Автодополнение
    handleAutocomplete(value) {
        const autocomplete = document.getElementById('cabinet-autocomplete');
        if (!autocomplete) return;

        if (value.length < 2) {
            autocomplete.style.display = 'none';
            return;
        }

        const matches = Object.keys(this.commands).filter(cmd => 
            cmd.toLowerCase().startsWith(value.toLowerCase())
        );

        if (matches.length > 0) {
            autocomplete.innerHTML = matches.map(cmd => 
                `<div class="autocomplete-item" onclick="window.CabinetTerminal.selectCommand('${cmd}')">${cmd}</div>`
            ).join('');
            autocomplete.style.display = 'block';
        } else {
            autocomplete.style.display = 'none';
        }
    },

    // Выбор команды из автодополнения
    selectCommand(command) {
        if (this.elements.input) {
            this.elements.input.value = command;
            this.elements.input.focus();
        }
        const autocomplete = document.getElementById('cabinet-autocomplete');
        if (autocomplete) {
            autocomplete.style.display = 'none';
        }
    },

    // Выполнение команды
    executeCommand(commandLine) {
        const parts = commandLine.split(' ');
        const command = parts[0].toLowerCase();
        const args = parts.slice(1);

        // Логируем команду
        this.log(`GENESIS > ${commandLine}`, 'system');

        if (this.commands[command]) {
            try {
                this.commands[command].execute(args);
            } catch (error) {
                this.log(`Error executing command: ${error.message}`, 'error');
                this.stats.errorCount++;
            }
        } else {
            this.log(`Command not found: ${command}`, 'error');
            this.log('Type "help" for available commands', 'info');
            this.stats.errorCount++;
        }

        this.updateStats();
    },

    // Логирование сообщений
    log(message, type = 'info', data = null) {
        if (!this.elements.body) return;

        const messageDiv = document.createElement('div');
    messageDiv.className = `terminal-message terminal-${type}`;
    messageDiv.dataset.level = type;

        const timestamp = new Date().toLocaleTimeString();
        const icon = this.getTypeIcon(type);

        messageDiv.innerHTML = `
            <span class="terminal-timestamp">${timestamp}</span>
            <span class="terminal-icon">${icon}</span>
            <span class="terminal-content">${message}</span>
            ${data ? `<div class="terminal-data">${JSON.stringify(data, null, 2)}</div>` : ''}
        `;

        this.elements.body.appendChild(messageDiv);
    // сохраняем в массив
    this.messages.push({ ts: Date.now(), type, message, data });
        this.stats.messageCount++;
        this.stats.typeCounts[type]++;

        if (this.state.autoScroll) {
            this.elements.body.scrollTop = this.elements.body.scrollHeight;
        }
