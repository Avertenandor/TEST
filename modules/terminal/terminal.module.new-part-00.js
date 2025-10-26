// modules/terminal/terminal.module.js
// Модуль терминала на основе кода с главной страницы

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

    // Статистика
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
        this.displayWelcomeMessage();
        this.startUpdateLoop();
        
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

        const timestamp = new Date().toLocaleTimeString();
        const icon = this.getTypeIcon(type);

        messageDiv.innerHTML = `
            <span class="terminal-timestamp">${timestamp}</span>
            <span class="terminal-icon">${icon}</span>
            <span class="terminal-content">${message}</span>
            ${data ? `<div class="terminal-data">${JSON.stringify(data, null, 2)}</div>` : ''}
        `;

        this.elements.body.appendChild(messageDiv);
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
        }
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
