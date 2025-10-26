    handleDepositMatured(data) {
        this.state.updateDepositStatus(data.id, 'matured');
        this.calculateDerivedMetrics();
        this.updateUI();
    }
    
    // MCP-MARKER:METHOD:ANALYTICS:UPDATE_TX_METRICS - Обновление метрик транзакций
    updateTransactionMetrics(data) {
        this.state.addTransaction(data);
        this.calculateDerivedMetrics();
        this.updateUI();
    }
    
    // MCP-MARKER:METHOD:ANALYTICS:START_AUTO_UPDATE - Автоматическое обновление
    startAutoUpdate() {
        // Обновляем каждую минуту
        this.updateInterval = setInterval(() => {
            this.loadAnalyticsData();
        }, 60000);
    }
    
    // MCP-MARKER:METHOD:ANALYTICS:STOP_AUTO_UPDATE - Остановка автообновления
    stopAutoUpdate() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }
    
    // MCP-MARKER:METHOD:ANALYTICS:HANDLE_LOGOUT - Обработка выхода
    handleLogout() {
        this.stopAutoUpdate();
        this.state.clear();
    }
    
    // MCP-MARKER:METHOD:ANALYTICS:UPDATE_METRIC - Обновление метрики в UI
    updateMetric(id, value) {
        const element = this.container.querySelector(`#metric-${id}`);
        if (element) {
            if (typeof value === 'number') {
                if (id.includes('roi') || id.includes('percent')) {
                    element.textContent = `${value.toFixed(2)}%`;
                } else if (id.includes('score') || id.includes('count')) {
                    element.textContent = value.toFixed(0);
                } else {
                    element.textContent = `$${value.toFixed(2)}`;
                }
            } else {
                element.textContent = value;
            }
        }
    }
    
    // MCP-MARKER:METHOD:ANALYTICS:RENDER_TOP_DEPOSITS - Рендер таблицы топ депозитов
    renderTopDepositsTable(deposits) {
        if (!deposits || deposits.length === 0) {
            return '<tr><td colspan="4">Нет данных</td></tr>';
        }
        
        return deposits.map(deposit => `
            <tr>
                <td>${deposit.plan}</td>
                <td>$${deposit.amount.toFixed(2)}</td>
                <td>${deposit.percentage}%</td>
                <td>$${deposit.earned.toFixed(2)}</td>
            </tr>
        `).join('');
    }
    
    // MCP-MARKER:METHOD:ANALYTICS:RENDER_TX_TABLE - Рендер таблицы транзакций
    renderRecentTransactionsTable(transactions) {
        if (!transactions || transactions.length === 0) {
            return '<tr><td colspan="4">Нет транзакций</td></tr>';
        }
        
        return transactions.map(tx => `
            <tr>
                <td>${new Date(tx.timestamp).toLocaleDateString('ru-RU')}</td>
                <td>${tx.type}</td>
                <td>${tx.amount > 0 ? '+' : ''}$${tx.amount.toFixed(2)}</td>
                <td><span class="status-badge status-${tx.status}">${tx.status}</span></td>
            </tr>
        `).join('');
    }
    
    // MCP-MARKER:METHOD:ANALYTICS:DOWNLOAD_REPORT - Скачивание отчета
    downloadReport(report) {
        const blob = new Blob([report.content], { type: report.mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `analytics_report_${Date.now()}.${report.extension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        this.showNotification('Отчет успешно загружен');
    }
    
    // MCP-MARKER:METHOD:ANALYTICS:SHOW_LOADER - Показать загрузчик
    showLoader() {
        const loader = this.container.querySelector('.analytics-loader');
        if (loader) {
            loader.style.display = 'flex';
        }
    }
    
    // MCP-MARKER:METHOD:ANALYTICS:HIDE_LOADER - Скрыть загрузчик
    hideLoader() {
        const loader = this.container.querySelector('.analytics-loader');
        if (loader) {
            loader.style.display = 'none';
        }
    }
    
    // MCP-MARKER:METHOD:ANALYTICS:SHOW_ERROR - Показать ошибку
    showError(message) {
        const errorEl = this.container.querySelector('.error-message');
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.style.display = 'block';
            
            setTimeout(() => {
                errorEl.style.display = 'none';
            }, 5000);
        }
    }
    
    // MCP-MARKER:METHOD:ANALYTICS:SHOW_NOTIFICATION - Показать уведомление
    showNotification(message) {
        if (window.eventBus) {
            window.eventBus.emit('notification:show', {
                message,
                type: 'success'
            });
        }
    }
    
    // MCP-MARKER:METHOD:ANALYTICS:DESTROY - Очистка модуля
    destroy() {
        // Останавливаем автообновление
        this.stopAutoUpdate();
        
        // Отписываемся от событий
        this.subscriptions.forEach(unsub => unsub());
        this.subscriptions = [];
        
        // Уничтожаем графики
        const chartManager = this.components.get('chartManager');
        if (chartManager) {
            chartManager.destroyAllCharts();
        }
        
        // Очищаем компоненты
        this.components.forEach(component => {
            if (component.destroy) {
                component.destroy();
            }
        });
        this.components.clear();
        
        // Удаляем стили
        const link = document.querySelector(`link[data-module="${this.name}"]`);
        if (link) {
            link.remove();
        }
        
        // Очищаем контейнер
        if (this.container) {
            this.container.innerHTML = '';
        }
        
        // Очищаем состояние
        if (this.state) {
            this.state.clear();
        }
    }
}
