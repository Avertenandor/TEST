
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
