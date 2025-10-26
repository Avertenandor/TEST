
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
