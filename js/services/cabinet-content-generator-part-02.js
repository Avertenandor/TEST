            <script>
                // Инициализация технической информации
                if (window.GenesisTechInfo) {
                    setTimeout(() => {
                        window.GenesisTechInfo.updateElements();
                        // Расширяем функционал PWA установкой
                        if (window.extendDevicePage) {
                            window.extendDevicePage();
                        }
                    }, 100);
                }
            </script>
        `;
    },

    // MCP-MARKER:METHOD:CABINET:PORTFOLIO_CONTENT - Генерация контента страницы портфеля
    getPortfolioContent() {
        return `
            <div class="page-header">
                <h2 class="page-title">💼 Мой портфель</h2>
                <p class="page-subtitle">Управление активными депозитами и инвестициями</p>
            </div>
            
            <!-- Общая статистика портфеля -->
            <div class="stats-grid mb-2">
                <div class="stats-card">
                    <div class="stats-header">
                        <span class="stats-title">Общая стоимость</span>
                        <span class="stats-icon">💰</span>
                    </div>
                    <div class="stats-value">$0.00</div>
                    <div class="stats-change">USDT</div>
                </div>
                
                <div class="stats-card">
                    <div class="stats-header">
                        <span class="stats-title">Активных депозитов</span>
                        <span class="stats-icon">📈</span>
                    </div>
                    <div class="stats-value">0</div>
                    <div class="stats-change">штук</div>
                </div>
                
                <div class="stats-card">
                    <div class="stats-header">
                        <span class="stats-title">Общий доход</span>
                        <span class="stats-icon">🚀</span>
                    </div>
                    <div class="stats-value">$0.00</div>
                    <div class="stats-change">все время</div>
                </div>
                
                <div class="stats-card">
                    <div class="stats-header">
                        <span class="stats-title">Доход сегодня</span>
                        <span class="stats-icon">📅</span>
                    </div>
                    <div class="stats-value">$0.00</div>
                    <div class="stats-change">за 24 часа</div>
                </div>
            </div>
            
            <!-- Активные депозиты -->
            <div class="active-deposits mb-2">
                <h3 class="active-deposits-title">💼 Активные депозиты</h3>
                <div id="active-deposits-container">
                    <div class="empty-state">
                        <div class="empty-icon">📦</div>
                        <h3>Нет активных депозитов</h3>
                        <p>Создайте свой первый депозит и начните зарабатывать</p>
                        <button class="btn btn-secondary mt-1" onclick="window.CabinetApp.showCreateDepositModal()">
                            💰 Создать депозит
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Доступные планы -->
            <div class="stats-card">
                <h3 class="plans-title">🔓 Доступные депозитные планы</h3>
                <div id="available-plans-container" class="plans-grid">
                    <!-- Планы будут загружены динамически -->
                    <div class="empty-state">
                        <p>Загрузка доступных планов...</p>
                    </div>
                </div>
            </div>
        `;
    },

    // MCP-MARKER:METHOD:CABINET:TRANSACTIONS_CONTENT - Генерация контента страницы транзакций
    getTransactionsContent() {
        return `
            <div class="page-header">
                <h2 class="page-title">📋 История транзакций</h2>
                <p class="page-subtitle">Все ваши операции в системе</p>
            </div>
            
            <div class="stats-card">
                <div class="empty-state">
                    <div class="empty-icon">📋</div>
                    <h3>Нет транзакций</h3>
                    <p>Здесь будут отображаться все ваши операции</p>
                </div>
            </div>
        `;
    },

    // MCP-MARKER:METHOD:CABINET:ANALYTICS_CONTENT - Генерация контента страницы аналитики
    getAnalyticsContent() {
        return `
            <div class="page-header">
                <h2 class="page-title">📈 Аналитика</h2>
                <p class="page-subtitle">Детальная статистика и графики</p>
            </div>
            
            <div class="stats-grid">
                <div class="stats-card">
                    <div class="stats-header">
                        <span class="stats-title">Общий ROI</span>
                        <span class="stats-icon">📊</span>
                    </div>
                    <div class="stats-value">0%</div>
                    <div class="stats-change">за все время</div>
                </div>
                
                <div class="stats-card">
                    <div class="stats-header">
                        <span class="stats-title">Средний доход</span>
                        <span class="stats-icon">📉</span>
                    </div>
                    <div class="stats-value">$0.00</div>
                    <div class="stats-change">в день</div>
                </div>
            </div>
            
            <div class="stats-card">
                <h3 style="color: var(--primary-color); margin-bottom: 1rem;">📈 График доходности</h3>
                <div class="empty-state">
                    <p>Нет данных для отображения</p>
                </div>
            </div>
        `;
    },

    // MCP-MARKER:METHOD:CABINET:BONUSES_CONTENT - Генерация контента страницы бонусов  
    getBonusesContent() {
        return `
            <div class="page-header">
                <h2 class="page-title">🎁 Бонусная система</h2>
                <p class="page-subtitle">Получайте дополнительные награды за активность</p>
            </div>
            
            <div class="bonus-card">
                <h3 class="bonus-title">
                    <span>🎁</span>
                    <span>Доступные бонусы</span>
                </h3>
                
                <div class="bonus-grid">
                    <div class="bonus-item">
                        <div class="bonus-item-header">
                            <div>
                                <h4 class="bonus-item-title">Приветственный бонус</h4>
                                <p class="bonus-item-desc">За регистрацию в системе</p>
                            </div>
                            <div class="bonus-icon">🎉</div>
                        </div>
                        <div class="bonus-reward">
                            <div class="bonus-reward-content">
                                <span>Награда:</span>
                                <span style="color: var(--success-color); font-weight: 600;">100 PLEX</span>
                            </div>
                        </div>
                        <button class="btn btn-success w-100">Получить бонус</button>
                    </div>
                </div>
            </div>
        `;
    },

    // MCP-MARKER:METHOD:CABINET:REFERRALS_CONTENT - Генерация контента страницы рефералов
    getReferralsContent() {
        return `
            <div class="page-header">
                <h2 class="page-title">👥 Реферальная программа</h2>
                <p class="page-subtitle">Приглашайте друзей и получайте бонусы</p>
            </div>
            
            <div class="stats-grid mb-2">
                <div class="stats-card">
                    <div class="stats-header">
                        <span class="stats-title">Приглашено</span>
                        <span class="stats-icon">👥</span>
                    </div>
                    <div class="stats-value">0</div>
                    <div class="stats-change">человек</div>
                </div>
                
                <div class="stats-card">
                    <div class="stats-header">
                        <span class="stats-title">Доход от рефералов</span>
                        <span class="stats-icon">💵</span>
                    </div>
                    <div class="stats-value">$0.00</div>
                    <div class="stats-change">USDT</div>
                </div>
            </div>
            
            <div class="stats-card">
                <h3 style="color: var(--primary-color); margin-bottom: 1rem;">🔗 Ваша реферальная ссылка</h3>
                <div style="background: var(--bg-primary); padding: 1rem; border-radius: 8px; word-break: break-all;">
                    <code>https://genesis.platform/ref/YOUR_ADDRESS</code>
                </div>
                <button class="btn btn-secondary mt-1" onclick="window.CabinetApp.copyReferralLink()">
                    📋 Копировать ссылку
                </button>
            </div>
        `;
    }
};

// MCP-MARKER:INIT:CABINET_CONTENT_GENERATOR - Инициализация генератора контента
console.log('📄 Cabinet Content Generator loaded');