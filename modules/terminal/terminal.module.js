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

        // Звуковое уведомление
        if (this.state.soundNotifications && (type === 'error' || type === 'warning')) {
            this.playNotificationSound();
        }

        // Ограничиваем количество сообщений
        if (this.stats.messageCount > this.config.maxMessages) {
            const firstMessage = this.elements.body.firstElementChild;
            if (firstMessage) {
                firstMessage.remove();
                this.stats.messageCount--;
            }
            if (this.messages.length > this.config.maxMessages) {
                this.messages.shift();
            }
        }
    },

    // Приём из глобальных перехватчиков
    logFromInterceptor(entry){
        const levelMap = { trace:'debug', debug:'debug', log:'info', info:'info', warn:'warning', error:'error' };
        const t = levelMap[entry.level] || 'info';
        const src = entry.source ? ` [${entry.source}]` : '';
        this.log(`${src} ${entry.message}`, t, entry.details);
    },

    // Получение иконки для типа сообщения
    getTypeIcon(type) {
        const icons = {
            info: 'ℹ️',
            success: '✅',
            warning: '⚠️',
            error: '❌',
            debug: '🐛',
            system: '⚙️',
            api: '🔗',
            transaction: '💸'
        };
        return icons[type] || 'ℹ️';
    },

    // Системные действия
    clear() {
        if (this.elements.body) this.elements.body.innerHTML = '';
        this.messages = [];
        this.stats.messageCount = 0; this.stats.errorCount = 0; this.stats.warningCount = 0; this.stats.successCount = 0;
        Object.keys(this.stats.typeCounts).forEach(k => this.stats.typeCounts[k]=0);
        this.updateStats?.();
    },

    async copyAll() {
        try {
            const text = this.messages.map(m => {
                const ts = new Date(m.ts).toISOString();
                return `[${ts}] ${m.type.toUpperCase()} ${m.message}${m.data? ' '+JSON.stringify(m.data):''}`;
            }).join('\n');
            await navigator.clipboard.writeText(text);
            this.log('📋 Logs copied to clipboard', 'success');
        } catch (e) {
            this.log('❌ Failed to copy logs', 'error', { error: String(e) });
        }
    },

    exportLogs() {
        try {
            const blob = new Blob([JSON.stringify(this.messages, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = `genesis-logs-${Date.now()}.json`;
            document.body.appendChild(a); a.click(); a.remove();
            URL.revokeObjectURL(url);
            this.log('📥 Logs exported', 'success');
        } catch (e) { this.log('❌ Export failed', 'error'); }
    },

    minimize() {
        const root = this.elements.container;
        if (!root) return;

        const isMinimized = root.classList.contains('is-minimized');

        if (isMinimized) {
            // Разворачиваем
            this.maximize();
        } else {
            // Сворачиваем
            root.classList.add('is-minimized');
            const body = this.elements.body;
            const inputWrap = root.querySelector('.genesis-terminal-input-wrapper');
            const toolbar = root.querySelector('.genesis-terminal-toolbar');
            const info = root.querySelector('.terminal-info-panels');
            const quick = root.querySelector('.terminal-quick-commands');

            [body, inputWrap, toolbar, info, quick].forEach(el => {
                if (el) el.style.display = 'none';
            });

            // Меняем иконку кнопки
            const minimizeBtn = root.querySelector('[title="Свернуть"]');
            if (minimizeBtn) {
                minimizeBtn.innerHTML = '⬜<span class="tooltip">Развернуть</span>';
                minimizeBtn.setAttribute('title', 'Развернуть');
            }

            // Уменьшаем размер терминала
            root.style.height = 'auto';

            this.log('Терминал свернут', 'system');
        }
    },

    maximize() {
        const root = this.elements.container;
        if (!root) return;

        root.classList.remove('is-minimized');
        const body = this.elements.body;
        const inputWrap = root.querySelector('.genesis-terminal-input-wrapper');
        const toolbar = root.querySelector('.genesis-terminal-toolbar');
        const info = root.querySelector('.terminal-info-panels');
        const quick = root.querySelector('.terminal-quick-commands');

        [body, inputWrap, toolbar, info, quick].forEach(el => {
            if (el) el.style.display = '';
        });

        // Меняем иконку кнопки
        const minimizeBtn = root.querySelector('[title="Развернуть"]');
        if (minimizeBtn) {
            minimizeBtn.innerHTML = '—<span class="tooltip">Свернуть</span>';
            minimizeBtn.setAttribute('title', 'Свернуть');
        }

        // Восстанавливаем размер
        root.style.height = '';

        this.log('Терминал развернут', 'system');
    },

    close() {
        const root = this.elements.container;
        if (!root) return;

        root.classList.add('is-closed');
        root.style.display = 'none';

        // Создаем кнопку для открытия терминала
        this.createOpenButton();

        this.log('Терминал закрыт', 'system');
    },

    open() {
        const root = this.elements.container;
        if (!root) return;

        root.classList.remove('is-closed');
        root.style.display = '';

        // Удаляем кнопку открытия
        this.removeOpenButton();

        this.log('Терминал открыт', 'system');
    },

    createOpenButton() {
        // Проверяем, не существует ли уже кнопка
        let openBtn = document.getElementById('terminal-open-button');
        if (openBtn) return;

        openBtn = document.createElement('button');
        openBtn.id = 'terminal-open-button';
        openBtn.className = 'terminal-open-btn';
        openBtn.innerHTML = '⚡ Открыть терминал';
        openBtn.title = 'Открыть GENESIS Terminal';
        openBtn.onclick = () => this.open();

        // Добавляем стили для кнопки
        openBtn.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: linear-gradient(135deg, rgba(78, 205, 196, 0.9), rgba(78, 205, 196, 0.7));
            border: 2px solid rgba(78, 205, 196, 1);
            border-radius: 30px;
            padding: 12px 24px;
            color: #ffffff;
            font-weight: 600;
            cursor: pointer;
            z-index: 9999;
            box-shadow: 0 4px 15px rgba(78, 205, 196, 0.4);
            transition: all 0.3s ease;
            font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
            font-size: 14px;
        `;

        // Добавляем эффекты при наведении
        openBtn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 6px 20px rgba(78, 205, 196, 0.6)';
        });

        openBtn.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 4px 15px rgba(78, 205, 196, 0.4)';
        });

        document.body.appendChild(openBtn);
    },

    removeOpenButton() {
        const openBtn = document.getElementById('terminal-open-button');
        if (openBtn) {
            openBtn.remove();
        }
    },

    toggleFullscreen() {
        const root = this.elements.container; if (!root) return;
        root.classList.toggle('is-fullscreen');
        if (root.classList.contains('is-fullscreen')) {
            root.style.left='0'; root.style.top='0'; root.style.right='0'; root.style.bottom='0';
            root.style.width='100vw'; root.style.height='100vh';
        }
    },

    toggleStats() {
        this.state.isStatsVisible = !this.state.isStatsVisible;
        if (this.elements.statsPanel) {
            this.elements.statsPanel.style.display = this.state.isStatsVisible ? 'block' : 'none';
        }
    },

    toggleTheme() {
        const idx = this.config.themes.indexOf(this.config.currentTheme);
        const next = this.config.themes[(idx+1)%this.config.themes.length];
        this.setTheme(next);
    },

    setTheme(theme){
        this.config.currentTheme = theme;
        const root = this.elements.container;
        if (!root) return;
        this.config.themes.forEach(t => root.classList.remove(`theme-${t}`));
        root.classList.add(`theme-${theme}`);
    },

    toggleAutoScroll(){ this.state.autoScroll = !this.state.autoScroll; },
    toggleTimestamps(){ this.state.timestamps = !this.state.timestamps; },
    toggleSound(){ this.state.soundNotifications = !this.state.soundNotifications; },
    playNotificationSound(){ /* опционально добавить звук */ },

    search(query){
        const q = (query||'').toLowerCase();
        if (!this.elements.body) return;
        Array.from(this.elements.body.children).forEach(row => {
            const text = row.textContent?.toLowerCase()||'';
            row.style.display = q && !text.includes(q) ? 'none' : '';
        });
    },

    toggleFilter(level){
        this.config.filters[level] = !this.config.filters[level];
        if (!this.elements.body) return;
        Array.from(this.elements.body.children).forEach(row => {
            const lv = row.dataset.level;
            if (lv && this.config.filters.hasOwnProperty(lv)) {
                row.style.display = this.config.filters[lv] ? '' : 'none';
            }
        });
    },

    // Команды
    showHelp(args) {
        if (args.length > 0) {
            const command = args[0].toLowerCase();
            if (this.commands[command]) {
                const cmd = this.commands[command];
                this.log(`Help for "${command}":`, 'info');
                this.log(`Description: ${cmd.description}`, 'info');
                this.log(`Usage: ${cmd.usage}`, 'info');
            } else {
                this.log(`Command not found: ${command}`, 'error');
            }
        } else {
            this.log('Available commands:', 'info');
            Object.keys(this.commands).forEach(cmd => {
                this.log(`  ${cmd.padEnd(12)} - ${this.commands[cmd].description}`, 'info');
            });
        }
    },

    showStatus() {
        this.log('System Status:', 'success');
        this.log('  Network: BSC (Connected)', 'success');
        this.log('  Wallet: Connected', 'success');
        this.log('  API: Online', 'success');
        this.log('  Platform: Operational', 'success');
        this.log(`  Session time: ${this.getSessionTime()}`, 'info');
        this.log(`  Messages: ${this.stats.messageCount}`, 'info');
        this.log(`  Errors: ${this.stats.errorCount}`, this.stats.errorCount > 0 ? 'warning' : 'info');
    },

    showBalance() {
        this.log('Wallet Balance:', 'success');
        // Здесь должны быть реальные данные от API
        const balanceData = {
            USDT: '1,250.50',
            PLEX: '5,000.00',
            BNB: '0.125'
        };
        
        Object.keys(balanceData).forEach(token => {
            this.log(`  ${token}: ${balanceData[token]}`, 'info');
        });
        
        this.stats.apiCalls++;
    },

    showDeposits() {
        this.log('Active Deposits:', 'success');
        // Здесь должны быть реальные данные от API
        const deposits = [
            { id: '001', amount: '$25.00', plan: 'Test Plan', status: 'Active' },
            { id: '002', amount: '$100.00', plan: 'Basic Plan', status: 'Active' }
        ];
        
        deposits.forEach(deposit => {
            this.log(`  #${deposit.id}: ${deposit.amount} - ${deposit.plan} (${deposit.status})`, 'info');
        });
        
        const total = deposits.reduce((sum, dep) => sum + parseFloat(dep.amount.replace('$', '')), 0);
        this.log(`Total: $${total.toFixed(2)}`, 'success');
        
        this.stats.apiCalls++;
    },

    showHistory(args) {
        const limit = args.length > 0 ? parseInt(args[0]) || 10 : 10;
        this.log(`Recent Transactions (last ${limit}):`, 'success');
        
        // Здесь должны быть реальные данные от API
        const transactions = [
            { date: '2025-08-14 14:30', type: 'Deposit', amount: '$100.00', status: 'Completed' },
            { date: '2025-08-13 10:15', type: 'Withdrawal', amount: '$50.00', status: 'Completed' },
            { date: '2025-08-12 16:20', type: 'Deposit', amount: '$25.00', status: 'Completed' }
        ];
        
        transactions.slice(0, limit).forEach(tx => {
            this.log(`  ${tx.date} - ${tx.type} ${tx.amount} (${tx.status})`, 'info');
        });
        
        this.stats.apiCalls++;
    },

    exportData(args) {
        const type = args.length > 0 ? args[0].toLowerCase() : 'logs';
        
        switch (type) {
            case 'logs':
                this.exportLogs();
                break;
            case 'balance':
                this.log('Balance export not implemented yet', 'warning');
                break;
            case 'deposits':
                this.log('Deposits export not implemented yet', 'warning');
                break;
            case 'history':
                this.log('History export not implemented yet', 'warning');
                break;
            default:
                this.log(`Unknown export type: ${type}`, 'error');
                this.log('Available types: logs, balance, deposits, history', 'info');
        }
    },

    changeTheme(args) {
        if (args.length === 0) {
            this.log('Available themes:', 'info');
            this.config.themes.forEach(theme => {
                const current = theme === this.config.currentTheme ? ' (current)' : '';
                this.log(`  ${theme}${current}`, 'info');
            });
            return;
        }

        const theme = args[0].toLowerCase();
        if (this.config.themes.includes(theme)) {
            this.setTheme(theme);
            this.log(`Theme changed to: ${theme}`, 'success');
        } else {
            this.log(`Unknown theme: ${theme}`, 'error');
            this.log(`Available themes: ${this.config.themes.join(', ')}`, 'info');
        }
    },

    // Управление терминалом
    clear() {
        if (this.elements.body) {
            this.elements.body.innerHTML = '';
            this.stats.messageCount = 0;
            this.log('Terminal cleared', 'system');
        }
    },

    toggleStats() {
        if (this.elements.statsPanel) {
            this.state.isStatsVisible = !this.state.isStatsVisible;
            this.elements.statsPanel.classList.toggle('show', this.state.isStatsVisible);
            this.updateStatsPanel();
        }
    },

    toggleTheme() {
        const currentIndex = this.config.themes.indexOf(this.config.currentTheme);
        const nextIndex = (currentIndex + 1) % this.config.themes.length;
        const nextTheme = this.config.themes[nextIndex];
        this.setTheme(nextTheme);
        this.log(`Theme changed to: ${nextTheme}`, 'system');
    },

    setTheme(theme) {
        if (this.elements.container && this.config.themes.includes(theme)) {
            // Удаляем старые классы тем
            this.config.themes.forEach(t => {
                this.elements.container.classList.remove(`theme-${t}`);
            });
            
            // Добавляем новую тему
            this.elements.container.classList.add(`theme-${theme}`);
            this.config.currentTheme = theme;
            
            // Обновляем селект в настройках
            const themeSelect = document.getElementById('terminalTheme');
            if (themeSelect) {
                themeSelect.value = theme;
            }
        }
    },

    toggleSound() {
        this.state.soundNotifications = !this.state.soundNotifications;
        this.log(`Sound notifications: ${this.state.soundNotifications ? 'enabled' : 'disabled'}`, 'system');
    },

    toggleAutoScroll() {
        this.state.autoScroll = !this.state.autoScroll;
        this.log(`Auto-scroll: ${this.state.autoScroll ? 'enabled' : 'disabled'}`, 'system');
    },

    toggleTimestamps() {
        this.state.timestamps = !this.state.timestamps;
        // Можно добавить логику для скрытия/показа временных меток
        this.log(`Timestamps: ${this.state.timestamps ? 'enabled' : 'disabled'}`, 'system');
    },

    toggleFilter(type) {
        if (this.config.filters.hasOwnProperty(type)) {
            this.config.filters[type] = !this.config.filters[type];
            this.applyFilters();
        }
    },

    copyAll() {
        if (this.elements.body) {
            const text = this.elements.body.innerText;
            navigator.clipboard.writeText(text).then(() => {
                this.log('Terminal content copied to clipboard', 'success');
            }).catch(() => {
                this.log('Failed to copy content', 'error');
            });
        }
    },

    exportLogs() {
        if (this.elements.body) {
            const text = this.elements.body.innerText;
            const blob = new Blob([text], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `genesis-terminal-logs-${new Date().toISOString().slice(0, 10)}.txt`;
            a.click();
            
            URL.revokeObjectURL(url);
            this.log('Logs exported successfully', 'success');
        }
    },

    search(query) {
        // Простая реализация поиска
        if (!this.elements.body || !query) return;

        const messages = this.elements.body.querySelectorAll('.terminal-message');
        messages.forEach(message => {
            const content = message.textContent.toLowerCase();
            const found = content.includes(query.toLowerCase());
            message.style.display = found ? 'flex' : 'none';
        });
    },

    // Вспомогательные функции
    applyFilters() {
        if (!this.elements.body) return;

        const messages = this.elements.body.querySelectorAll('.terminal-message');
        messages.forEach(message => {
            const type = Array.from(message.classList).find(cls => cls.startsWith('terminal-'))?.replace('terminal-', '');
            if (type && this.config.filters.hasOwnProperty(type)) {
                message.style.display = this.config.filters[type] ? 'flex' : 'none';
            }
        });
    },

    updateStats() {
        // Обновляем счетчики в интерфейсе
        const elements = {
            'cabinet-messageCount': this.stats.messageCount,
            'cabinet-uptime': this.getSessionTime(),
            'cabinet-memoryUsage': this.getMemoryUsage(),
            'cabinet-totalMessages': this.stats.messageCount,
            'cabinet-errorCount': this.stats.errorCount,
            'cabinet-warningCount': this.stats.warningCount,
            'cabinet-apiCalls': this.stats.apiCalls,
            'cabinet-transactions': this.stats.transactions,
            'cabinet-sessionTime': this.getSessionTime()
        };

        Object.keys(elements).forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = elements[id];
            }
        });
    },

    updateStatsPanel() {
        if (!this.state.isStatsVisible) return;
        this.updateStats();
    },

    getSessionTime() {
        const elapsed = Date.now() - this.stats.startTime;
        const hours = Math.floor(elapsed / 3600000);
        const minutes = Math.floor((elapsed % 3600000) / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    },

    getMemoryUsage() {
        if (performance.memory) {
            const used = Math.round(performance.memory.usedJSHeapSize / 1024);
            return `${used}KB`;
        }
        return 'N/A';
    },

    displayWelcomeMessage() {
        this.log('🚀 GENESIS Terminal v2.0 - Cabinet Mode', 'system');
        this.log('📡 Connected to BSC network', 'success');
        this.log('💼 User session initialized', 'info');
        this.log('Type "help" for available commands', 'info');
        this.log('═══════════════════════════════════════', 'system');
    },

    startUpdateLoop() {
        setInterval(() => {
            this.updateStats();
        }, 1000);
    },

    playNotificationSound() {
        if (!this.state.soundNotifications) return;
        
        // Простое звуковое уведомление
        try {
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmsdCUOVyvLNewsFKnbE79yOQQwUXrvq7KpYEwlCod/xwWkeDEOWyvLNeSsFJHjE79+OQQwUXbrq7KpYEwlCoeDxwWkeDEOWyvPMeSsFJHfE79+OQQwYXbvk6apVFApCn9/xwmseDDuR2e3FdCk=' );
            audio.volume = 0.1;
            audio.play();
        } catch (e) {
            // Игнорируем ошибки звука
        }
    }
};

// Автоинициализация при загрузке модуля
if (typeof module !== 'undefined') {
    module.exports = window.CabinetTerminal;
}
