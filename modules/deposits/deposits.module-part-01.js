            
            // Закрытие модального окна
            this.closeDepositModal();
            
            // Обновление UI
            this.render();
            
            // Уведомление об успехе
            this.showNotification('Депозит успешно создан! Ожидайте подтверждения оплаты.', 'success');
            
            // Событие для других модулей
            this.context.eventBus.emit('deposit:created', deposit);
            
        } catch (error) {
            console.error('Failed to create deposit:', error);
            this.showNotification('Ошибка создания депозита: ' + error.message, 'error');
        } finally {
            this.hideLoader();
        }
    }
    
    switchTab(tabName) {
        const tabs = this.container.querySelectorAll('.deposits-tabs button');
        const contents = this.container.querySelectorAll('.tab-content');
        
        tabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        
        contents.forEach(content => {
            content.classList.toggle('active', content.dataset.tab === tabName);
        });
        
        // Загрузка данных для выбранной вкладки
        if (tabName === 'history') {
            this.renderDepositHistory();
        }
    }
    
    renderDepositHistory() {
        const container = this.container.querySelector('#deposit-history-list');
        if (!container) return;
        
        const history = this.state.getDepositHistory();
        
        if (history.length === 0) {
            container.innerHTML = '<div class="no-history">История депозитов пуста</div>';
            return;
        }
        
        container.innerHTML = history.map(deposit => `
            <div class="history-item">
                <div class="history-date">${new Date(deposit.createdAt).toLocaleDateString()}</div>
                <div class="history-plan">${deposit.planName}</div>
                <div class="history-amount">${deposit.amount} ${deposit.currency}</div>
                <div class="history-profit text-success">+${deposit.profit} ${deposit.currency}</div>
                <div class="history-status status-${deposit.status.toLowerCase()}">${deposit.status}</div>
            </div>
        `).join('');
    }
    
    calculateStatistics() {
        const activeDeposits = this.state.getActiveDeposits();
        const history = this.state.getDepositHistory();
        
        let totalInvested = 0;
        let totalEarned = 0;
        let dailyIncome = 0;
        
        // Расчет по активным депозитам
        activeDeposits.forEach(deposit => {
            const usdAmount = deposit.currency === 'USDT' ? 
                deposit.amount : 
                window.convertPlexToUSD(deposit.amount);
            
            totalInvested += usdAmount;
            
            const plan = window.getDepositPlanById(deposit.planId);
            if (plan) {
                dailyIncome += (usdAmount * plan.percentage / 100) / plan.days;
            }
        });
        
        // Расчет по истории
        history.forEach(deposit => {
            if (deposit.status === 'COMPLETED') {
                totalEarned += deposit.profit || 0;
            }
        });
        
        this.state.setStatistics({
            totalInvested,
            totalEarned,
            dailyIncome,
            activeDepositsCount: activeDeposits.length
        });
    }
    
    calculateDepositProgress(deposit) {
        const now = Date.now();
        const created = new Date(deposit.createdAt).getTime();
        const plan = window.getDepositPlanById(deposit.planId);
        
        if (!plan) return 0;
        
        const totalDuration = plan.days * 24 * 60 * 60 * 1000; // в миллисекундах
        const elapsed = now - created;
        
        return Math.min(100, Math.floor((elapsed / totalDuration) * 100));
    }
    
    calculateDepositEarnings(deposit) {
        const progress = this.calculateDepositProgress(deposit);
        const plan = window.getDepositPlanById(deposit.planId);
        
        if (!plan) return 0;
        
        const totalProfit = deposit.amount * (plan.percentage - 100) / 100;
        return totalProfit * progress / 100;
    }
    
    // Обработчики событий
    onPaymentConfirmed(data) {
        if (data.type === 'deposit') {
            this.loadData().then(() => this.render());
        }
    }
    
    onDepositCreated(deposit) {
        this.showNotification(`Депозит ${deposit.planName} успешно создан!`, 'success');
    }
    
    onDepositExpired(deposit) {
        this.showNotification(`Депозит ${deposit.planName} завершен. Прибыль начислена!`, 'info');
        this.loadData().then(() => this.render());
    }
    
    updateBalanceDisplay(balance) {
        // Обновление отображения баланса если нужно
    }
    
    // Утилиты
    showNotification(message, type = 'info') {
        if (this.context && this.context.eventBus) {
            this.context.eventBus.emit('notification:show', { message, type });
        }
    }
    
    showLoader() {
        const loader = document.getElementById('global-loader');
        if (loader) loader.classList.remove('hidden');
    }
    
    hideLoader() {
        const loader = document.getElementById('global-loader');
        if (loader) loader.classList.add('hidden');
    }
    
    // Очистка при выгрузке модуля
    destroy() {
        // Отписка от событий
        this.subscriptions.forEach(unsub => unsub());
        
        // Очистка компонентов
        this.components.forEach(component => {
            if (component.destroy) component.destroy();
        });
        
        // Удаление стилей
        const link = document.querySelector(`link[data-module="${this.name}"]`);
        if (link) link.remove();
        
        // Очистка контейнера
        if (this.container) {
            this.container.innerHTML = '';
        }
        
        // Очистка состояния
        if (this.state) this.state.clear();
        
        console.log('✅ Deposits module destroyed');
    }
}
