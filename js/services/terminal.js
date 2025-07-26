/**
 * GENESIS 1.1 - Полнофункциональный сервис терминала
 * MCP-MARKER:MODULE:TERMINAL_SERVICE - Сервис терминала
 * MCP-MARKER:FILE:TERMINAL_JS - Основной файл терминала
 */

// MCP-MARKER:CLASS:GENESIS_TERMINAL - Класс терминала
window.GenesisTerminal = {
    // MCP-MARKER:SECTION:TERMINAL_CONFIG - Конфигурация терминала
    config: {
        maxMessages: 2000,
        themes: ['dark', 'light', 'matrix', 'retro', 'cyber', 'neon'],
        currentTheme: 'dark',
        soundEnabled: true,
        autoScroll: true,
        timestampFormat: 'HH:mm:ss',
        filters: {
            info: true,
            success: true,
            warning: true,
            error: true,
            debug: true,
            system: true,
            api: true,
            transaction: true
        },
        commands: {
            maxHistory: 100,
            autoComplete: true
        }
    },
    
    // MCP-MARKER:SECTION:TERMINAL_STATS - Статистика терминала
    stats: {
        messageCount: 0,
        errorCount: 0,
        warningCount: 0,
        successCount: 0,
        apiCalls: 0,
        transactions: 0,
        startTime: Date.now(),
        memoryUsage: 0,
        cpuUsage: 0
    },
    
    // История команд
    commandHistory: [],
    historyIndex: -1,
    
    // MCP-MARKER:SECTION:TERMINAL_STATE - Состояние терминала
    state: {
        isInitialized: false,
        isFullscreen: false,
        isMinimized: false,
        searchQuery: '',
        activeFilters: new Set(['info', 'success', 'warning', 'error', 'debug', 'system', 'api', 'transaction']),
        fallbackMode: false
    },
    
    // MCP-MARKER:METHOD:SAFE_INIT - Безопасная инициализация
    init() {
        try {
            // Проверяем наличие контейнера терминала
            const terminalContainer = document.getElementById('terminal-container') || 
                                    document.querySelector('.terminal-container') ||
                                    document.querySelector('[data-terminal]');
            
            if (!terminalContainer) {
                console.warn('⚠️ Terminal container not found, working in fallback mode');
                this.state.fallbackMode = true;
                this.state.isInitialized = true;
                return this;
            }
            
            // Инициализация UI компонентов
            this.initializeUI();
            this.attachEventListeners();
            this.loadSettings();
            
            this.state.isInitialized = true;
            this.log('🚀 GENESIS Terminal v2.1 инициализирован', 'system');
            
        } catch (error) {
            console.error('❌ Ошибка инициализации терминала:', error);
            this.state.fallbackMode = true;
            this.state.isInitialized = true;
        }
        
        return this;
    },
    
    // MCP-MARKER:METHOD:SAFE_LOG - Безопасное логирование
    log(message, type = 'info', data = null) {
        // Обновляем статистику
        this.stats.messageCount++;
        if (type === 'error') this.stats.errorCount++;
        if (type === 'warning') this.stats.warningCount++;
        if (type === 'success') this.stats.successCount++;
        
        // В режиме fallback просто выводим в консоль
        if (this.state.fallbackMode) {
            const timestamp = new Date().toLocaleTimeString();
            const logMessage = `[${timestamp}] [${type.toUpperCase()}] ${message}`;
            
            switch (type) {
                case 'error':
                    console.error(logMessage, data);
                    break;
                case 'warning':
                    console.warn(logMessage, data);
                    break;
                default:
                    console.log(logMessage, data);
            }
            return;
        }
        
        // Основная логика логирования
        try {
            this.addMessage(message, type, data);
        } catch (error) {
            console.error('Ошибка при добавлении сообщения:', error);
            // Переключаемся в fallback режим
            this.state.fallbackMode = true;
            console.log(`[TERMINAL-${type.toUpperCase()}] ${message}`);
        }
    },
    
    // MCP-MARKER:SECTION:TERMINAL_COMMANDS - Команды терминала
    commands: {
        help: {
            description: 'Показать список команд',
            usage: 'help [команда]',
            handler: (cmd) => {
                if (cmd) {
                    const command = window.GenesisTerminal.commands[cmd.toLowerCase()];
                    if (command) {
                        return `📖 ${cmd.toUpperCase()}
Описание: ${command.description}
Использование: ${command.usage || 'Нет параметров'}`;
                    }
                    return `❌ Команда "${cmd}" не найдена`;
                }
                
                const cmdList = Object.keys(window.GenesisTerminal.commands)
                    .map(cmd => `${cmd} - ${window.GenesisTerminal.commands[cmd].description}`)
                    .join('\n');
                
                return `📚 Доступные команды:
${cmdList}

💡 Введите 'help [команда]' для подробной информации`;
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
        
        stats: {
            description: 'Показать статистику системы',
            usage: 'stats [подробно]',
            handler: (detailed) => {
                const stats = window.GenesisTerminal.stats;
                const uptime = window.GenesisTerminal.getUptime();
                const memory = window.GenesisTerminal.getMemoryUsage();
                
                let result = `📊 Статистика GENESIS 1.1:
⏱️ Время работы: ${uptime}
📝 Сообщений: ${stats.messageCount}
✅ Успешных: ${stats.successCount}
⚠️ Предупреждений: ${stats.warningCount}
❌ Ошибок: ${stats.errorCount}
🌐 API запросов: ${stats.apiCalls}
💱 Транзакций: ${stats.transactions}
💾 Память: ${memory}`;
                
                if (detailed) {
                    result += `\n\n🔧 Системная информация:
🌐 Онлайн: ${navigator.onLine ? 'Да' : 'Нет'}
🔋 Батарея: ${window.GenesisTerminal.getBatteryInfo()}
📱 Платформа: ${navigator.platform}
🌐 Язык: ${navigator.language}
📏 Разрешение: ${screen.width}x${screen.height}`;
                }
                
                return result;
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
        
        sound: {
            description: 'Включить/выключить звук',
            usage: 'sound [on/off]',
            handler: (state) => {
                if (state === 'on' || state === 'off') {
                    window.GenesisTerminal.config.soundEnabled = state === 'on';
                    window.GenesisTerminal.saveSettings();
                    return `🔊 Звук ${state === 'on' ? 'включен' : 'выключен'}`;
                }
                window.GenesisTerminal.toggleSound();
                return `🔊 Звук ${window.GenesisTerminal.config.soundEnabled ? 'включен' : 'выключен'}`;
            }
        },
        
        status: {
            description: 'Проверить статус системы',
            usage: 'status',
            handler: () => {
                const terminal = window.GenesisTerminal;
                const api = window.GenesisAPI;
                const auth = window.GenesisAuth;
                
                let status = `🏥 Статус системы GENESIS 1.1:\n`;
                status += `🖥️ Терминал: ${terminal.state.isInitialized ? '✅ Работает' : '❌ Ошибка'}`;
                status += ` (${terminal.state.fallbackMode ? 'Fallback режим' : 'Полный режим'})\n`;
                status += `🌐 API: ${api ? '✅ Загружен' : '❌ Не найден'}\n`;
                status += `🔐 Авторизация: ${auth ? '✅ Загружена' : '❌ Не найдена'}\n`;
                status += `⚙️ Конфигурация: ${window.GENESIS_CONFIG ? '✅ Загружена' : '❌ Не найдена'}\n`;
                status += `🛠️ Утилиты: ${window.GenesisUtils ? '✅ Загружены' : '❌ Не найдены'}\n`;
                status += `📱 PWA: ${navigator.serviceWorker ? '✅ Поддерживается' : '❌ Не поддерживается'}\n`;
                status += `🌐 Онлайн: ${navigator.onLine ? '✅ Да' : '❌ Нет'}`;
                
                return status;
            }
        }
        
        debug: {
            description: 'Режим отладки',
            usage: 'debug [on/off]',
            handler: (state) => {
                if (state === 'on' || state === 'off') {
                    window.GENESIS_CONFIG.app.debug = state === 'on';
                } else {
                window.GENESIS_CONFIG.app.debug = !window.GENESIS_CONFIG.app.debug;
                }
                return `🐛 Режим отладки ${window.GENESIS_CONFIG.app.debug ? 'включен' : 'выключен'}`;
            }
        },
        
        status: {
            description: 'Статус системы GENESIS',
            usage: 'status',
            handler: async () => {
                const config = window.GENESIS_CONFIG;
                const networkStatus = await window.GenesisTerminal.checkNetworkStatus();
                
                return `🟢 Статус GENESIS 1.1:
📦 Версия: ${config.version}
🌐 Сеть: ${config.network}
🔑 API ключ: #${config.bscscan.currentKeyIndex + 1}
🌍 Онлайн: ${navigator.onLine ? 'Да' : 'Нет'}
📡 Соединение: ${networkStatus}
💾 Кэш: ${window.GenesisTerminal.getCacheStatus()}
🔒 PWA: ${window.GenesisTerminal.getPWAStatus()}`;
            }
        },
        
        reload: {
            description: 'Перезагрузить приложение',
            usage: 'reload',
            handler: () => {
                window.GenesisTerminal.log('🔄 Перезагрузка приложения...', 'system');
                setTimeout(() => window.location.reload(), 1000);
                return '🔄 Перезагрузка через 1 секунду...';
            }
        },
        
        export: {
            description: 'Экспортировать логи',
            usage: 'export [формат]',
            handler: (format = 'txt') => {
                window.GenesisTerminal.exportLogs(format);
                return `📥 Логи экспортированы в формате ${format.toUpperCase()}`;
            }
        },
        
        search: {
            description: 'Поиск в логах',
            usage: 'search [запрос]',
            handler: (query) => {
                if (query) {
                    this.search(query);
                    return `🔍 Поиск: "${query}"`;
                }
                return '🔍 Введите запрос для поиска';
            }
        },
        
        filter: {
            description: 'Управление фильтрами',
            usage: 'filter [тип] [on/off]',
            handler: (type, state) => {
                if (type && state) {
                    if (this.config.filters[type] !== undefined) {
                        this.config.filters[type] = state === 'on';
                        this.toggleFilter(type);
                        return `🔧 Фильтр ${type}: ${state === 'on' ? 'включен' : 'выключен'}`;
                    }
                    return `❌ Неизвестный тип фильтра: ${type}`;
                }
                return `🔧 Доступные фильтры: ${Object.keys(this.config.filters).join(', ')}`;
            }
        },
        
        wallet: {
            description: 'Информация о кошельке',
            usage: 'wallet [адрес]',
            handler: async (address) => {
                if (!address) {
                    return '💼 Введите адрес кошелька для проверки';
                }
                try {
                    const balance = await this.getWalletBalance(address);
                    return `💼 Баланс ${address}: ${balance} BNB`;
                } catch (error) {
                    return `❌ Ошибка: ${error.message}`;
                }
            }
        },
        
        transaction: {
            description: 'Информация о транзакции',
            usage: 'transaction [хэш]',
            handler: async (hash) => {
                if (!hash) {
                    return '💱 Введите хэш транзакции для проверки';
                }
                try {
                    const info = await this.getTransactionInfo(hash);
                    return `💱 Транзакция ${hash}: ${info}`;
                } catch (error) {
                    return `❌ Ошибка: ${error.message}`;
                }
            }
        },
        
        network: {
            description: 'Информация о сети',
            usage: 'network',
            handler: async () => {
                try {
                    const info = await this.getNetworkInfo();
                    return `🌐 Информация о сети:\n${info}`;
                } catch (error) {
                    return `❌ Ошибка: ${error.message}`;
                }
            }
        },
        
        version: {
            description: 'Версия системы',
            usage: 'version',
            handler: () => {
                const config = window.GENESIS_CONFIG;
                return `📦 GENESIS 1.1 v${config.version}
🌐 Сеть: ${config.network}
🔧 Режим: ${config.app.debug ? 'Отладка' : 'Продакшн'}
📅 Дата сборки: ${new Date().toLocaleDateString('ru-RU')}
⏰ Время: ${new Date().toLocaleTimeString('ru-RU')}`;
            }
        }
    },
    
    // MCP-MARKER:METHOD:TERMINAL_INIT - Инициализация терминала
    init() {
        if (this.state.isInitialized) return;
        
        this.body = document.getElementById('genesis-terminal-body');
        this.input = document.getElementById('terminalInput');
        
        if (!this.body || !this.input) {
            console.warn('Терминал не найден в DOM');
            return;
        }
        
        // Загружаем сохраненные настройки
        this.loadSettings();
        
        // Начальное сообщение
        this.log('🚀 GENESIS TERMINAL v2.1 - Инициализация...', 'system');
        this.log(`📦 Версия системы: ${window.GENESIS_CONFIG.version}`, 'info');
        this.log(`🌐 Сеть: ${window.GENESIS_CONFIG.network}`, 'info');
        this.log(`🔧 Режим: ${window.GENESIS_CONFIG.app.debug ? 'Отладка' : 'Продакшн'}`, 'info');
        this.log('✅ Терминал готов к работе. Введите "help" для справки.', 'success');
        
        // Обновляем статистику
        this.updateStats();
        setInterval(() => this.updateStats(), 1000);
        
        // Мониторинг системы
        this.startSystemMonitoring();
        
        this.state.isInitialized = true;
        console.log('✅ Terminal service initialized');
    },
    
    // MCP-MARKER:METHOD:TERMINAL_LOG - Логирование сообщений
    log(message, type = 'info', data = null) {
        const timestamp = new Date().toLocaleTimeString('ru-RU');
        const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Проверяем фильтры
        if (!this.config.filters[type]) return;
        
        // Создаем элемент сообщения
        const messageElement = document.createElement('div');
        messageElement.className = `terminal-message terminal-${type}`;
        messageElement.id = messageId;
        messageElement.setAttribute('data-type', type);
        messageElement.setAttribute('data-timestamp', timestamp);
        
        // Иконки для разных типов
        const icons = {
            info: 'ℹ️',
            success: '✅',
            warning: '⚠️',
            error: '❌',
            debug: '🐛',
            system: '⚙️',
            api: '🌐',
            transaction: '💱'
        };
        
        const icon = icons[type] || '📝';
        
        messageElement.innerHTML = `
            <span class="terminal-timestamp">${timestamp}</span>
            <span class="terminal-icon">${icon}</span>
            <span class="terminal-content">${this.escapeHtml(message)}</span>
            ${data ? `<span class="terminal-data">${JSON.stringify(data, null, 2)}</span>` : ''}
        `;
        
        // Добавляем в терминал
        this.body.appendChild(messageElement);
        
        // Автопрокрутка
        if (this.config.autoScroll) {
        this.body.scrollTop = this.body.scrollHeight;
        }
        
        // Ограничиваем количество сообщений
        this.limitMessages();
        
        // Обновляем статистику
        this.stats.messageCount++;
        if (type === 'error') this.stats.errorCount++;
        if (type === 'warning') this.stats.warningCount++;
        if (type === 'success') this.stats.successCount++;
        if (type === 'api') this.stats.apiCalls++;
        if (type === 'transaction') this.stats.transactions++;
        
        // Звук
        if (this.config.soundEnabled && (type === 'error' || type === 'warning')) {
            this.playSound(type);
        }
        
        // Поиск
        if (this.state.searchQuery) {
            this.highlightSearch(messageElement);
        }
    },
    
    // MCP-MARKER:METHOD:HANDLE_INPUT - Обработка ввода
    handleInput(event) {
        if (event.key === 'Enter') {
            const command = this.input.value.trim();
            if (!command) return;
            
            // Добавляем в историю
            this.commandHistory.push(command);
            if (this.commandHistory.length > this.config.commands.maxHistory) {
                this.commandHistory.shift();
            }
            this.historyIndex = this.commandHistory.length;
            
            // Логируем команду
            this.log(`> ${command}`, 'system');
            
            // Обрабатываем команду
            this.executeCommand(command);
            
            // Очищаем поле
            this.input.value = '';
            
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            // История вверх
            if (this.historyIndex > 0) {
                this.historyIndex--;
                this.input.value = this.commandHistory[this.historyIndex];
            }
        } else if (event.key === 'ArrowDown') {
            event.preventDefault();
            // История вниз
            if (this.historyIndex < this.commandHistory.length - 1) {
                this.historyIndex++;
                this.input.value = this.commandHistory[this.historyIndex];
            } else {
                this.historyIndex = this.commandHistory.length;
                this.input.value = '';
            }
        } else if (event.key === 'Tab') {
            event.preventDefault();
            this.handleTabCompletion();
        }
    },
    
    // Автодополнение
    handleAutocomplete(value) {
        const autocomplete = document.getElementById('autocomplete');
        if (!autocomplete) return;
        
        if (!value) {
            autocomplete.innerHTML = '';
            autocomplete.style.display = 'none';
            return;
        }
        
        const suggestions = Object.keys(this.commands)
            .filter(cmd => cmd.startsWith(value.toLowerCase()))
            .slice(0, 5);
        
        if (suggestions.length > 0) {
            autocomplete.innerHTML = suggestions
                .map(cmd => `<div class="autocomplete-item" onclick="window.GenesisTerminal.selectAutocomplete('${cmd}')">${cmd}</div>`)
                .join('');
            autocomplete.style.display = 'block';
        } else {
            autocomplete.style.display = 'none';
        }
    },
    
    // Выбор автодополнения
    selectAutocomplete(command) {
        this.input.value = command;
        this.input.focus();
        document.getElementById('autocomplete').style.display = 'none';
    },
    
    // Tab completion
    handleTabCompletion() {
        const currentValue = this.input.value;
        const suggestions = Object.keys(this.commands)
            .filter(cmd => cmd.startsWith(currentValue.toLowerCase()));
        
        if (suggestions.length === 1) {
            this.input.value = suggestions[0];
        } else if (suggestions.length > 1) {
            this.log(`🔍 Возможные команды: ${suggestions.join(', ')}`, 'info');
        }
    },
    
    // MCP-MARKER:METHOD:EXECUTE_COMMAND - Выполнение команд
    executeCommand(commandLine) {
        const [cmd, ...args] = commandLine.split(' ');
        const command = this.commands[cmd.toLowerCase()];
        
        if (command) {
            try {
                const result = command.handler(...args);
                if (result instanceof Promise) {
                    result.then(res => this.log(res, 'success'))
                          .catch(err => this.log(`Ошибка: ${err.message}`, 'error'));
                } else {
                    this.log(result, 'success');
                }
            } catch (error) {
                this.log(`❌ Ошибка выполнения: ${error.message}`, 'error');
            }
        } else {
            this.log(`❌ Неизвестная команда: ${cmd}. Введите 'help' для справки.`, 'error');
        }
    },
    
    // Очистка терминала
    clear() {
        this.body.innerHTML = '';
        this.stats.messageCount = 0;
        this.stats.errorCount = 0;
        this.stats.warningCount = 0;
        this.stats.successCount = 0;
        this.updateStats();
    },
    
    // Поиск в логах
    search(query) {
        this.state.searchQuery = query;
        const messages = this.body.querySelectorAll('.terminal-message');
        
        messages.forEach(msg => {
            const content = msg.textContent.toLowerCase();
            if (content.includes(query.toLowerCase())) {
                msg.classList.add('search-highlight');
            } else {
                msg.classList.remove('search-highlight');
            }
        });
        
        this.log(`🔍 Найдено сообщений: ${this.body.querySelectorAll('.search-highlight').length}`, 'info');
    },
    
    // Подсветка поиска
    highlightSearch(element) {
        const content = element.textContent.toLowerCase();
        if (content.includes(this.state.searchQuery.toLowerCase())) {
            element.classList.add('search-highlight');
        }
    },
    
    // Переключение фильтров
    toggleFilter(type) {
        this.config.filters[type] = !this.config.filters[type];
        this.saveSettings();
        
        const messages = this.body.querySelectorAll(`[data-type="${type}"]`);
        messages.forEach(msg => {
            msg.style.display = this.config.filters[type] ? 'block' : 'none';
        });
        
        this.log(`🔧 Фильтр ${type} ${this.config.filters[type] ? 'включен' : 'выключен'}`, 'system');
    },
    
    // Переключение темы
    setTheme(theme) {
        this.config.currentTheme = theme;
        document.body.setAttribute('data-terminal-theme', theme);
        this.saveSettings();
        this.log(`🎨 Тема изменена на: ${theme}`, 'system');
    },
    
    // Переключение звука
    toggleSound() {
        this.config.soundEnabled = !this.config.soundEnabled;
        this.saveSettings();
        this.log(`🔊 Звук ${this.config.soundEnabled ? 'включен' : 'выключен'}`, 'system');
    },
    
    // Переключение полноэкранного режима
    toggleFullscreen() {
        const terminal = document.getElementById('genesis-terminal');
        if (!terminal) return;
        
        this.state.isFullscreen = !this.state.isFullscreen;
        terminal.classList.toggle('fullscreen', this.state.isFullscreen);
        this.log(`⛶ Полноэкранный режим ${this.state.isFullscreen ? 'включен' : 'выключен'}`, 'system');
    },
    
    // Свернуть терминал
    minimize() {
        const terminal = document.getElementById('genesis-terminal');
        if (!terminal) return;
        
        this.state.isMinimized = !this.state.isMinimized;
        terminal.classList.toggle('minimized', this.state.isMinimized);
        this.log(`📱 Терминал ${this.state.isMinimized ? 'свернут' : 'развернут'}`, 'system');
    },
    
    // Переключение панели статистики
    toggleStats() {
        const panel = document.getElementById('statsPanel');
        if (panel) {
            panel.classList.toggle('show');
        }
    },
    
    // Копирование всех логов
    copyAll() {
        const messages = Array.from(this.body.querySelectorAll('.terminal-message'))
            .map(msg => msg.textContent)
            .join('\n');
        
        navigator.clipboard.writeText(messages).then(() => {
            this.log('📋 Все логи скопированы в буфер обмена', 'success');
        }).catch(() => {
            this.log('❌ Ошибка копирования', 'error');
        });
    },
    
    // Экспорт логов
    exportLogs(format = 'txt') {
        const messages = Array.from(this.body.querySelectorAll('.terminal-message'))
            .map(msg => msg.textContent);
        
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
    
    // Обновление статистики
    updateStats() {
        const messageCountEl = document.getElementById('messageCount');
        const uptimeEl = document.getElementById('uptime');
        const memoryEl = document.getElementById('memoryUsage');
        
        if (messageCountEl) messageCountEl.textContent = this.stats.messageCount;
        if (uptimeEl) uptimeEl.textContent = this.getUptime();
        if (memoryEl) memoryEl.textContent = this.getMemoryUsage();
        
        // Обновляем панель статистики
        const totalMessagesEl = document.getElementById('totalMessages');
        const errorCountEl = document.getElementById('errorCount');
        const warningCountEl = document.getElementById('warningCount');
        const apiCallsEl = document.getElementById('apiCalls');
        
        if (totalMessagesEl) totalMessagesEl.textContent = this.stats.messageCount;
        if (errorCountEl) errorCountEl.textContent = this.stats.errorCount;
        if (warningCountEl) warningCountEl.textContent = this.stats.warningCount;
        if (apiCallsEl) apiCallsEl.textContent = this.stats.apiCalls;
    },
    
    // Получение времени работы
    getUptime() {
        const uptime = Date.now() - this.stats.startTime;
        const hours = Math.floor(uptime / 3600000);
        const minutes = Math.floor((uptime % 3600000) / 60000);
        const seconds = Math.floor((uptime % 60000) / 1000);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    },
    
    // Получение использования памяти
    getMemoryUsage() {
        if (performance.memory) {
            const used = Math.round(performance.memory.usedJSHeapSize / 1024);
            const total = Math.round(performance.memory.totalJSHeapSize / 1024);
            return `${used}KB / ${total}KB`;
        }
        return 'N/A';
    },
    
    // Получение информации о батарее
    getBatteryInfo() {
        if (navigator.getBattery) {
            navigator.getBattery().then(battery => {
                return `${Math.round(battery.level * 100)}% ${battery.charging ? '⚡' : ''}`;
            });
        }
        return 'N/A';
    },
    
    // Проверка статуса сети
    async checkNetworkStatus() {
        try {
            const response = await fetch('https://api.bscscan.com/api?module=proxy&action=eth_blockNumber&apikey=demo');
            return '🟢 Подключено';
        } catch {
            return '🔴 Ошибка соединения';
        }
    },
    
    // Получение статуса кэша
    getCacheStatus() {
        if ('caches' in window) {
            return '✅ Доступен';
        }
        return '❌ Недоступен';
    },
    
    // Получение статуса PWA
    getPWAStatus() {
        if ('serviceWorker' in navigator) {
            return '✅ Установлено';
        }
        return '❌ Не установлено';
    },
    
    // Получение баланса кошелька
    async getWalletBalance(address) {
        try {
            const response = await fetch(`https://api.bscscan.com/api?module=account&action=tokenbalance&contractaddress=0xdf179b6cAdBC61FFD86A3D2e55f6d6e083ade6c1&address=${address}&tag=latest&apikey=${window.GENESIS_CONFIG.bscscan.apiKey}`);
            const data = await response.json();
            return (parseInt(data.result) / Math.pow(10, 9)).toFixed(2);
        } catch (error) {
            throw new Error('Ошибка получения баланса');
        }
    },
    
    // Получение информации о транзакции
    async getTransactionInfo(hash) {
        try {
            const response = await fetch(`https://api.bscscan.com/api?module=proxy&action=eth_getTransactionByHash&txhash=${hash}&apikey=${window.GENESIS_CONFIG.bscscan.apiKey}`);
            const data = await response.json();
            return {
                status: data.result ? 'Подтверждена' : 'Не найдена',
                value: data.result ? (parseInt(data.result.value, 16) / Math.pow(10, 18)).toFixed(6) + ' BNB' : 'N/A',
                timestamp: data.result ? new Date(parseInt(data.result.timestamp, 16) * 1000).toLocaleString('ru-RU') : 'N/A'
            };
        } catch (error) {
            throw new Error('Ошибка получения информации о транзакции');
        }
    },
    
    // Получение информации о сети
    async getNetworkInfo() {
        try {
            const response = await fetch('https://api.bscscan.com/api?module=proxy&action=eth_blockNumber&apikey=demo');
            const data = await response.json();
            return {
                rpc: 'https://bsc-dataseed.binance.org/',
                blockNumber: parseInt(data.result, 16),
                blockTime: '3 сек',
                gasPrice: '5'
            };
        } catch (error) {
            return {
                rpc: 'https://bsc-dataseed.binance.org/',
                blockNumber: 'N/A',
                blockTime: '3 сек',
                gasPrice: '5'
            };
        }
    },
    
    // Мониторинг системы
    startSystemMonitoring() {
        setInterval(() => {
            // Мониторинг памяти
            if (performance.memory) {
                this.stats.memoryUsage = performance.memory.usedJSHeapSize;
            }
            
            // Мониторинг сети
            if (!navigator.onLine) {
                this.log('🌐 Соединение с интернетом потеряно', 'warning');
            }
            
            // Мониторинг производительности
            if (performance.now() > 100) {
                this.log('⚠️ Медленная производительность', 'warning');
            }
        }, 30000); // Каждые 30 секунд
    },
    
    // Воспроизведение звука
    playSound(type) {
        try {
            const audio = new Audio();
            if (type === 'error') {
                audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
            } else if (type === 'warning') {
                audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
            }
            audio.play();
        } catch (error) {
            // Игнорируем ошибки воспроизведения
        }
    },
    
    // Ограничение количества сообщений
    limitMessages() {
        const messages = this.body.querySelectorAll('.terminal-message');
        if (messages.length > this.config.maxMessages) {
            const toRemove = messages.length - this.config.maxMessages;
            for (let i = 0; i < toRemove; i++) {
                messages[i].remove();
            }
        }
    },
    
    // Экранирование HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    // Сохранение настроек
    saveSettings() {
        try {
        localStorage.setItem('genesis-terminal-settings', JSON.stringify({
                config: this.config,
                commandHistory: this.commandHistory
        }));
        } catch (error) {
            console.warn('Ошибка сохранения настроек терминала:', error);
        }
    },
    
    // Загрузка настроек
    loadSettings() {
        try {
            const saved = localStorage.getItem('genesis-terminal-settings');
            if (saved) {
                const settings = JSON.parse(saved);
                this.config = { ...this.config, ...settings.config };
                this.commandHistory = settings.commandHistory || [];
                this.historyIndex = this.commandHistory.length;
            }
        } catch (error) {
            console.warn('Ошибка загрузки настроек терминала:', error);
        }
    }
};

// Автоматическая инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        window.GenesisTerminal.init();
    }, 1000);
});

// Экспорт для использования в других модулях
window.GenesisTerminalAPI = {
    log: (message, type, data) => window.GenesisTerminal.log(message, type, data),
    error: (message, data) => window.GenesisTerminal.log(message, 'error', data),
    warning: (message, data) => window.GenesisTerminal.log(message, 'warning', data),
    success: (message, data) => window.GenesisTerminal.log(message, 'success', data),
    info: (message, data) => window.GenesisTerminal.log(message, 'info', data),
    debug: (message, data) => window.GenesisTerminal.log(message, 'debug', data),
    api: (message, data) => window.GenesisTerminal.log(message, 'api', data),
    transaction: (message, data) => window.GenesisTerminal.log(message, 'transaction', data)
};
