                <td>${tx.status || 'completed'}</td>
            </tr>
        `).join('');
    }
    
    // MCP-MARKER:METHOD:REPORTS:HELPERS - Вспомогательные методы
    getReportTypeName(type) {
        const types = {
            'summary': 'Сводный отчет',
            'deposits': 'Отчет по депозитам',
            'transactions': 'Отчет по транзакциям',
            'earnings': 'Отчет по доходам',
            'portfolio': 'Отчет по портфелю'
        };
        return types[type] || type;
    }
    
    getPeriodName(period) {
        const periods = {
            'day': 'За день',
            'week': 'За неделю',
            'month': 'За месяц',
            'quarter': 'За квартал',
            'year': 'За год',
            'all': 'За все время'
        };
        return periods[period] || period;
    }
    
    generateFilename(type, period, extension) {
        const timestamp = new Date().toISOString().split('T')[0];
        return `genesis_${type}_${period}_${timestamp}.${extension}`;
    }
    
    // MCP-MARKER:METHOD:REPORTS:SAVE_HISTORY - Сохранение истории отчетов
    saveReportToHistory(report) {
        const history = this.getReportsHistory();
        history.unshift({
            filename: report.filename,
            type: report.type,
            period: report.period,
            format: report.format,
            timestamp: report.timestamp,
            size: new Blob([report.content]).size
        });
        
        // Храним только последние 10 отчетов
        if (history.length > 10) {
            history.pop();
        }
        
        localStorage.setItem('genesis_reports_history', JSON.stringify(history));
    }
    
    getReportsHistory() {
        const saved = localStorage.getItem('genesis_reports_history');
        return saved ? JSON.parse(saved) : [];
    }
    
    // MCP-MARKER:METHOD:REPORTS:UPDATE_RECENT - Обновление списка отчетов
    updateRecentReports() {
        const listContainer = this.container.querySelector('#reports-list');
        if (!listContainer) return;
        
        const history = this.getReportsHistory();
        
        if (history.length === 0) {
            listContainer.innerHTML = '<p>Нет сохраненных отчетов</p>';
            return;
        }
        
        listContainer.innerHTML = history.map(report => `
            <div class="report-item">
                <span class="report-name">${report.filename}</span>
                <span class="report-date">${new Date(report.timestamp).toLocaleDateString('ru-RU')}</span>
                <span class="report-size">${this.formatFileSize(report.size)}</span>
            </div>
        `).join('');
    }
    
    formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
    
    // MCP-MARKER:METHOD:REPORTS:DESTROY - Очистка компонента
    destroy() {
        if (this.container) {
            this.container.innerHTML = '';
        }
        this.templates.clear();
    }
}
