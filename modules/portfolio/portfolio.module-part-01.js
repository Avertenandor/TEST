                    <span class="projection-value">$${(stats.dailyIncome * 7).toFixed(2)}</span>
                </div>
                <div class="projection-item">
                    <span class="projection-label">Ежемесячно:</span>
                    <span class="projection-value">$${stats.projectedMonthly.toFixed(2)}</span>
                </div>
                <div class="projection-item">
                    <span class="projection-label">Ежегодно:</span>
                    <span class="projection-value">$${stats.projectedYearly.toFixed(2)}</span>
                </div>
            </div>
        `;
    }
    
    calculateProgress(deposit) {
        if (deposit.status !== 'ACTIVE') return 100;
        
        const plan = window.getDepositPlanById(deposit.planId);
        if (!plan) return 0;
        
        const now = Date.now();
        const created = new Date(deposit.activatedAt || deposit.createdAt).getTime();
        const duration = plan.days * 24 * 60 * 60 * 1000;
        const elapsed = now - created;
        
        return Math.min(100, Math.floor((elapsed / duration) * 100));
    }
    
    calculateEarned(deposit) {
        if (deposit.status === 'COMPLETED') {
            return deposit.profit || 0;
        }
        
        if (deposit.status !== 'ACTIVE') return 0;
        
        const progress = this.calculateProgress(deposit);
        const plan = window.getDepositPlanById(deposit.planId);
        
        if (!plan) return 0;
        
        const totalProfit = deposit.amount * (plan.percentage - 100) / 100;
        return totalProfit * progress / 100;
    }
    
    switchView(viewType) {
        this.state.setViewType(viewType);
        
        // Обновление активной кнопки
        const buttons = this.container.querySelectorAll('.view-toggle button');
        buttons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === viewType);
        });
        
        // Перерендеринг списка
        this.renderDepositsList();
    }
    
    applyFilter(filter) {
        this.state.setFilter(filter);
        
        // Обновление активной кнопки
        const buttons = this.container.querySelectorAll('.filter-button');
        buttons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        
        // Перерендеринг списка
        this.renderDepositsList();
    }
    
    changeChartPeriod(period) {
        this.state.setChartPeriod(period);
        
        // Обновление активной кнопки
        const buttons = this.container.querySelectorAll('.chart-period');
        buttons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.period === period);
        });
        
        // Перерендеринг графика
        this.renderPerformanceChart();
    }
    
    exportPortfolio() {
        const data = this.state.export();
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `portfolio_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showNotification('Портфолио экспортировано', 'success');
    }
    
    updateBalanceDisplay() {
        // Обновление отображения баланса
        this.renderStatistics();
    }
    
    startAutoUpdate() {
        // Обновление каждые 30 секунд
        this.updateInterval = setInterval(() => {
            this.loadPortfolioData().then(() => this.render());
        }, 30000);
    }
    
    getStoredDeposits(userAddress) {
        try {
            const stored = localStorage.getItem(`deposits_${userAddress}`);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Failed to get stored deposits:', error);
            return [];
        }
    }
    
    showNotification(message, type = 'info') {
        if (this.context && this.context.eventBus) {
            this.context.eventBus.emit('notification:show', { message, type });
        }
    }
    
    destroy() {
        console.log('🧹 Destroying Portfolio Module...');
        
        // Остановка обновлений
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        
        // Отписка от событий
        this.subscriptions.forEach(unsub => unsub());
        
        // Удаление стилей
        const link = document.querySelector(`link[data-module="${this.name}"]`);
        if (link) link.remove();
        
        // Очистка контейнера
        if (this.container) {
            this.container.innerHTML = '';
        }
        
        // Очистка состояния
        if (this.state) this.state.clear();
        
        console.log('✅ Portfolio Module destroyed');
    }
}
