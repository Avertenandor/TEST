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
