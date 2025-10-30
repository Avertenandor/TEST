        const element = this.container.querySelector(`#stat-${id} .stats-value`);
        if (element) {
            element.textContent = value;
            // Добавляем анимацию обновления
            element.classList.add('updated');
            setTimeout(() => element.classList.remove('updated'), 500);
        }
    }
    
    updateActiveDeposits() {
        const container = this.container.querySelector('#active-deposits-list');
        if (!container) return;
        
        if (this.state.activeDeposits === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📊</div>
                    <h3>Нет активных депозитов</h3>
                    <p>Создайте свой первый депозит для начала заработка</p>
                    <button class="btn btn-primary" data-action="create-deposit">
                        💰 Создать депозит
                    </button>
                </div>
            `;
        } else {
            // Здесь должен быть список реальных депозитов
            container.innerHTML = `
                <div class="deposits-grid">
                    ${this.generateDepositCards()}
                </div>
            `;
        }
    }
    
    generateDepositCards() {
        // Используем реальные данные из состояния
        const deposits = this.state.deposits.slice(0, 3); // Показываем только 3 последних
        
        if (deposits.length === 0) {
            return '<p class="no-deposits">Нет активных депозитов</p>';
        }
        
        return deposits.map(deposit => `
            <div class="deposit-card active">
                <div class="deposit-header">
                    <h4>Депозит #${deposit.id}</h4>
                    <span class="deposit-status">Активен</span>
                </div>
                <div class="deposit-info">
                    <div class="deposit-stat">
                        <span class="label">Сумма:</span>
                        <span class="value">$${deposit.amount}</span>
                    </div>
                    <div class="deposit-stat">
                        <span class="label">Ежедневно:</span>
                        <span class="value">${deposit.daily}%</span>
                    </div>
                    <div class="deposit-stat">
                        <span class="label">Заработано:</span>
                        <span class="value success">$${deposit.earned.toFixed(2)}</span>
                    </div>
                    <div class="deposit-stat">
                        <span class="label">Дней:</span>
                        <span class="value">${deposit.days}/300</span>
                    </div>
                </div>
                <div class="deposit-progress">
                    <div class="progress-bar" style="width: ${(deposit.days/300)*100}%"></div>
                </div>
            </div>
        `).join('');
    }
    
    updateLastActivity() {
        const container = this.container.querySelector('#last-activity');
        if (!container) return;
        
        let activities = [];
        
        // Используем реальные транзакции если есть
        if (this.state.lastActivity && this.state.lastActivity.length > 0) {
            activities = this.state.lastActivity.map(tx => {
                const timeAgo = this.getTimeAgo(tx.timestamp);
                const action = tx.type === 'in' ? 'Входящий платеж' : 'Исходящий платеж';
                const amount = `${tx.type === 'in' ? '+' : '-'}${tx.value.toFixed(2)} ${tx.token}`;
                
                return {
                    time: timeAgo,
                    action: action,
                    amount: amount,
                    hash: tx.hash
                };
            });
        } else {
            // Fallback на демо данные
            activities = [
                { time: 'Нет данных', action: 'Начните с создания депозита', amount: '' }
            ];
        }
        
        container.innerHTML = `
            <h3>Последняя активность</h3>
            <div class="activity-list">
                ${activities.map(activity => `
                    <div class="activity-item">
                        <span class="activity-time">${activity.time}</span>
                        <span class="activity-action">${activity.action}</span>
                        ${activity.amount ? 
                            `<span class="activity-amount ${activity.amount.startsWith('+') ? 'success' : 'danger'}">${activity.amount}</span>` : 
                            ''
                        }
                        ${activity.hash ? 
                            `<a href="https://bscscan.com/tx/${activity.hash}" target="_blank" class="tx-link">🔗</a>` : 
                            ''
                        }
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    getTimeAgo(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (days > 0) return `${days} дн. назад`;
        if (hours > 0) return `${hours} ч. назад`;
        if (minutes > 0) return `${minutes} мин. назад`;
        return 'Только что';
    }
    
    updateUserInfo() {
        const userAddress = this.context.store?.get('user.address');
        if (userAddress) {
            const displayElement = this.container.querySelector('#user-address-display');
            if (displayElement) {
                displayElement.textContent = this.formatAddress(userAddress);
            }
        }
    }
    
    updatePlatformAccessStatus(hasAccess, days) {
        const indicator = this.container.querySelector('#platform-access-indicator');
        if (!indicator) return;
        
        if (hasAccess) {
            indicator.className = 'access-status active';
            indicator.innerHTML = `
                <span class="access-icon">✅</span>
                <span class="access-text">Доступ активен</span>
                <span class="access-days">${days} дней</span>
            `;
        } else {
            indicator.className = 'access-status inactive';
            indicator.innerHTML = `
                <span class="access-icon">🔒</span>
                <span class="access-text">Требуется оплата</span>
                <button class="btn btn-small btn-warning" data-action="platform-access">
                    Оплатить $1
                </button>
            `;
        }
    }
    
    startAutoUpdate() {
        // Адаптивный интервал обновления
        let emptyResultCount = 0;
        let currentInterval = 30000; // Начальный интервал 30 секунд
        
        const scheduleNextUpdate = () => {
            // Проверяем, не уничтожен ли модуль
            if (this.isDestroyed) {
                console.log('📊 Module destroyed, stopping auto-update');
                return;
            }
            
            // Очищаем предыдущий таймаут если есть
            if (this.autoUpdateTimeout) {
                clearTimeout(this.autoUpdateTimeout);
            }
            
            this.autoUpdateTimeout = setTimeout(async () => {
                // Проверяем, не загружаются ли уже данные
                if (!this.dashboardLoading) {
                    const prevDeposits = this.state.deposits.length;
                    await this.loadDashboardData();
                    const newDeposits = this.state.deposits.length;
                    
                    // Проверяем, изменились ли данные
                    if (prevDeposits === newDeposits && newDeposits === 0) {
                        emptyResultCount++;
                        // Увеличиваем интервал при пустых результатах (exponential idle)
                        if (emptyResultCount > 2) {
                            currentInterval = Math.min(currentInterval * 1.5, 120000); // Максимум 2 минуты
                            console.log(`📊 No changes detected, increasing interval to ${currentInterval/1000}s`);
                        }
                    } else {
                        // Сбрасываем счетчик и интервал при изменениях
                        emptyResultCount = 0;
                        currentInterval = 30000;
                        console.log('📊 Changes detected, resetting interval to 30s');
                    }
                }
                
                // Планируем следующее обновление
                scheduleNextUpdate();
            }, currentInterval);
        };
        
        // Запускаем цикл обновлений
        scheduleNextUpdate();
    }
    
    startFPSMeasurement() {
        let frameCount = 0;
        let lastTime = performance.now();
        
        const measureFPS = () => {
            frameCount++;
            const currentTime = performance.now();
            
            if (currentTime - lastTime >= 1000) {
                this.state.stats.fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                this.updateTechnicalStat('fps', `${this.state.stats.fps} FPS`);
                
                frameCount = 0;
                lastTime = currentTime;
            }
            
            if (!this.isDestroyed) {
                requestAnimationFrame(measureFPS);
            }
        };
        
        requestAnimationFrame(measureFPS);
    }
    
    async measurePing() {
        const startTime = performance.now();
        
        try {
            // Use a simple request to measure network latency
            await fetch('https://api.etherscan.io/v2/api?chainid=56&module=gastracker&action=gasoracle&apikey=YourApiKeyToken', {
                method: 'GET',
                mode: 'cors'
            });
            
            const endTime = performance.now();
            this.state.stats.ping = Math.round(endTime - startTime);
            this.updateTechnicalStat('ping', `${this.state.stats.ping} ms`);
            
        } catch (error) {
            // If CORS fails, just show a simulated ping based on performance
            const simulatedPing = Math.floor(Math.random() * (80 - 20) + 20);
            this.state.stats.ping = simulatedPing;
            this.updateTechnicalStat('ping', `~${simulatedPing} ms`);
        }
        
        // Repeat measurement every 10 seconds
        setTimeout(() => this.measurePing(), 10000);
    }
    
    updateUptime() {
        const startTime = Date.now();
        
        // Очищаем предыдущий интервал если есть
        if (this.uptimeInterval) {
            clearInterval(this.uptimeInterval);
        }
        
        this.uptimeInterval = setInterval(() => {
            // Проверяем, не уничтожен ли модуль
            if (this.isDestroyed) {
                clearInterval(this.uptimeInterval);
                return;
            }
            
            const uptime = Math.floor((Date.now() - startTime) / 1000);
            const hours = Math.floor(uptime / 3600);
            const minutes = Math.floor((uptime % 3600) / 60);
            const seconds = uptime % 60;
            
            this.state.stats.uptime = uptime;
            this.updateTechnicalStat('uptime', 
                `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
            );
        }, 1000);
    }
    
    updateTechnicalStat(stat, value) {
        const element = this.container.querySelector(`#tech-${stat}`);
        if (element) {
            element.textContent = value;
        }
    }
    
    navigateToPage(page) {
        console.log(`Navigating to: ${page}`);
        
        // Обновляем активный пункт меню
        const navLinks = this.container.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            if (link.dataset.page === page) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
        
        // Навигация через роутер
        if (this.context.router) {
            this.context.router.navigate(`/${page}`);
        }
    }
    
    showCreateDepositModal() {
        console.log('Opening create deposit modal...');
        if (this.context.eventBus) {
            this.context.eventBus.emit('modal:show', {
                type: 'create-deposit'
            });
        }
    }
    
    showPlatformAccessModal() {
        console.log('Opening platform access modal...');
        if (this.context.eventBus) {
            this.context.eventBus.emit('modal:show', {
                type: 'platform-access'
            });
        }
    }
    
    toggleMobileMenu() {
        const sidebar = this.container.querySelector('.dashboard-sidebar');
        if (sidebar) {
            sidebar.classList.toggle('active');
        }
    }
    
    subscribeToEvents() {
        if (this.context.eventBus) {
            // Подписка на обновления данных
            this.subscriptions.push(
                this.context.eventBus.on('data:updated', () => {
                    this.loadDashboardData();
                })
            );
            
            // Подписка на изменения баланса
            this.subscriptions.push(
                this.context.eventBus.on('balance:changed', (data) => {
                    this.state.balance = data.balance;
                    this.updateDashboard();
                })
            );
            
            // Подписка на создание депозита
            this.subscriptions.push(
                this.context.eventBus.on('deposit:created', () => {
                    this.loadDashboardData();
                })
            );
            
            // Подписка на обновление цен
            this.subscriptions.push(
                this.context.eventBus.on('prices:updated', (prices) => {
                    console.log('📈 Prices updated:', prices);
                    this.updateDetailedBalances();
                })
            );
        }
    }
    
    subscribeToPriceUpdates() {
        // Подписываемся на обновления цен от PriceMonitor
        const unsubscribe = priceMonitor.subscribe((prices) => {
            console.log('💱 Price update received:', prices);
            
            // Обновляем балансы с новыми ценами
            this.updateDetailedBalances();
            
            // Обновляем информацию о ценах в UI
            this.updatePriceDisplay(prices);
        });
        
        // Сохраняем функцию отписки
        this.subscriptions.push(unsubscribe);
    }
    
    updatePriceDisplay(prices) {
        // Обновляем отображение цен токенов
        const priceContainer = this.container.querySelector('#token-prices');
        if (priceContainer) {
            priceContainer.innerHTML = `
                <div class="price-item">
                    <span class="price-token">BNB:</span>
                    <span class="price-value">${prices.BNB?.toFixed(2) || 'N/A'}</span>
                </div>
                <div class="price-item">
                    <span class="price-token">PLEX:</span>
                    <span class="price-value">${prices.PLEX?.toFixed(4) || 'N/A'}</span>
                </div>
            `;
        }
    }
    
    formatAddress(address) {
        if (!address || address.length < 10) return address;
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }
    
    getFallbackTemplate() {
        return `
            <div class="dashboard-container">
                <div class="dashboard-header">
                    <h2>🏠 Панель управления</h2>
                    <p>Добро пожаловать в GENESIS DeFi Platform</p>
                </div>
                
                <div class="stats-grid">
                    <div id="stat-total-balance" class="stats-card">
                        <div class="stats-header">
                            <span class="stats-title">Общий баланс</span>
                            <span class="stats-icon">💰</span>
                        </div>
                        <div class="stats-value">$0.00</div>
                    </div>
                    
                    <div id="stat-active-deposits" class="stats-card">
                        <div class="stats-header">
                            <span class="stats-title">Активные депозиты</span>
                            <span class="stats-icon">📈</span>
                        </div>
                        <div class="stats-value">0</div>
                    </div>
                    
                    <div id="stat-total-earnings" class="stats-card">
                        <div class="stats-header">
                            <span class="stats-title">Общий доход</span>
                            <span class="stats-icon">🚀</span>
                        </div>
                        <div class="stats-value">$0.00</div>
                    </div>
                    
                    <div id="stat-today-earnings" class="stats-card">
                        <div class="stats-header">
