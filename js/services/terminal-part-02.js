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
