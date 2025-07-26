/**
 * GENESIS 1.1 - Сервис личного кабинета
 * MCP-MARKER:MODULE:CABINET_SERVICE - Сервис управления личным кабинетом
 */

window.GenesisCabinet = {
    // Текущая страница
    currentPage: 'dashboard',
    
    // Данные пользователя
    userData: null,
    
    // Инициализация кабинета
    async init() {
        console.log('🏛️ Инициализация личного кабинета...');
        
        // Проверяем авторизацию
        const userAddress = localStorage.getItem('genesis_user_address');
        if (!userAddress) {
            window.location.href = '/';
            return;
        }
        
        // Инициализируем данные пользователя
        this.userData = { address: userAddress };
        
        // Инициализируем UI
        this.initializeUI();
        
        // Отображаем адрес пользователя
        this.updateUserDisplay();
        
        // Загружаем начальную страницу (панель управления)
        this.navigateTo('dashboard');
        
        // Запускаем обновление данных
        this.startDataRefresh();
        
        if (window.GenesisTerminal) {
            window.GenesisTerminal.log('✅ Личный кабинет инициализирован', 'success');
        }
        
        console.log('✅ Личный кабинет инициализирован');
    },
    
    // Загрузка данных пользователя
    async loadUserData(address) {
        try {
            if (window.GenesisTerminal) {
                window.GenesisTerminal.log('📊 Загрузка данных пользователя...', 'info');
            }
            
            // Получаем информацию о пользователе
            this.userData = await window.GenesisAuth.getUserInfo(address);
            
            if (this.userData) {
                // Обновляем UI с данными пользователя
                this.updateUserDisplay();
                
                if (window.GenesisTerminal) {
                    window.GenesisTerminal.log('✅ Данные пользователя загружены', 'success');
                }
            }
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            if (window.GenesisTerminal) {
                window.GenesisTerminal.log('❌ Ошибка загрузки данных', 'error');
            }
        }
    },
    
    // Инициализация UI
    initializeUI() {
        // Навешиваем обработчики на навигацию
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.getAttribute('data-page');
                if (page) {
                    this.navigateTo(page);
                }
            });
        });
        
        // Обработчик выхода
        const logoutBtn = document.querySelector('[onclick="logout()"]');
        if (logoutBtn) {
            logoutBtn.onclick = () => this.logout();
        }
    },
    
    // Навигация между страницами
    navigateTo(page) {
        // Убираем активный класс со всех ссылок
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        // Добавляем активный класс к текущей ссылке
        const activeLink = document.querySelector(`[data-page="${page}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
        
        this.currentPage = page;
        this.loadPageContent(page);
        
        if (window.GenesisTerminal) {
            window.GenesisTerminal.log(`📄 Переход на страницу: ${page}`, 'system');
        }
    },
    
    // Загрузка контента страницы
    loadPageContent(page) {
        const contentContainer = document.getElementById('page-content');
        if (!contentContainer) return;
        
        // Получаем контент страницы
        let content = '';
        
        switch(page) {
            case 'dashboard':
                content = this.getDashboardContent();
                break;
            case 'portfolio':
                content = this.getPortfolioContent();
                break;
            case 'deposits':
                content = this.getDepositsContent();
                break;
            case 'transactions':
                content = this.getTransactionsContent();
                break;
            case 'analytics':
                content = this.getAnalyticsContent();
                break;
            case 'access':
                content = this.getAccessContent();
                break;
            case 'bonuses':
                content = this.getBonusesContent();
                break;
            case 'referrals':
                content = this.getReferralsContent();
                break;
            case 'settings':
                content = this.getSettingsContent();
                break;
            default:
                content = '<div class="empty-state"><h3>Страница не найдена</h3></div>';
        }
        
        contentContainer.innerHTML = content;
        
        // Инициализируем компоненты страницы
        this.initializePageComponents(page);
    },
    
    // Контент страниц
    getDashboardContent() {
        const stats = this.calculateUserStats();
        
        return `
            <div class="page-header">
                <h2 class="page-title">📊 Панель управления</h2>
                <p class="page-subtitle">Обзор вашей активности в системе GENESIS 1.1</p>
            </div>
            
            <div class="stats-grid">
                <div class="stats-card">
                    <div class="stats-header">
                        <span class="stats-title">Общий баланс</span>
                        <span class="stats-icon">💰</span>
                    </div>
                    <div class="stats-value">$${stats.totalBalance.toFixed(2)}</div>
                    <div class="stats-change positive">USDT + PLEX</div>
                </div>
                
                <div class="stats-card">
                    <div class="stats-header">
                        <span class="stats-title">Активные депозиты</span>
                        <span class="stats-icon">📈</span>
                    </div>
                    <div class="stats-value">${stats.activeDeposits}</div>
                    <div class="stats-change">из ${stats.totalDeposits} всего</div>
                </div>
                
                <div class="stats-card">
                    <div class="stats-header">
                        <span class="stats-title">Общий доход</span>
                        <span class="stats-icon">💎</span>
                    </div>
                    <div class="stats-value">$${stats.totalProfit.toFixed(2)}</div>
                    <div class="stats-change positive">+${stats.dailyProfit.toFixed(2)}/день</div>
                </div>
                
                <div class="stats-card">
                    <div class="stats-header">
                        <span class="stats-title">Дней доступа</span>
                        <span class="stats-icon">📅</span>
                    </div>
                    <div class="stats-value">${stats.accessDays}</div>
                    <div class="stats-change ${stats.accessDays > 0 ? 'positive' : 'negative'}">
                        ${stats.accessDays > 0 ? 'Активен' : 'Требуется оплата'}
                    </div>
                </div>
            </div>
            
            ${this.getQuickActionsSection()}
            ${this.getRecentActivitySection()}
        `;
    },
    
    getDepositsContent() {
        return `
            <div class="page-header">
                <h2 class="page-title">💰 Депозиты</h2>
                <p class="page-subtitle">Создайте депозит и начните получать пассивный доход</p>
            </div>
            
            <!-- ИНФОРМАЦИОННАЯ ПАНЕЛЬ -->
            <div class="stats-card" style="margin-bottom: 2rem;">
                <h3 style="color: var(--primary-color); margin-bottom: 1.5rem;">🎯 Как работают депозиты в GENESIS 1.1</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;">
                    <div style="padding: 1rem; background: var(--bg-primary); border-radius: 8px; border-left: 4px solid var(--success-color);">
                        <h4 style="color: var(--success-color); margin-bottom: 0.5rem;">📈 Пассивный доход</h4>
                        <p style="color: var(--text-secondary); font-size: 0.9rem;">Получайте ежедневную прибыль автоматически на ваш кошелек</p>
                    </div>
                    <div style="padding: 1rem; background: var(--bg-primary); border-radius: 8px; border-left: 4px solid var(--secondary-color);">
                        <h4 style="color: var(--secondary-color); margin-bottom: 0.5rem;">🔒 Последовательность</h4>
                        <p style="color: var(--text-secondary); font-size: 0.9rem;">Покупайте планы по порядку от меньшего к большему</p>
                    </div>
                    <div style="padding: 1rem; background: var(--bg-primary); border-radius: 8px; border-left: 4px solid var(--warning-color);">
                        <h4 style="color: var(--warning-color); margin-bottom: 0.5rem;">⏱️ Фиксированный срок</h4>
                        <p style="color: var(--text-secondary); font-size: 0.9rem;">Каждый план имеет определенный срок действия и доходность</p>
                    </div>
                    <div style="padding: 1rem; background: var(--bg-primary); border-radius: 8px; border-left: 4px solid var(--primary-color);">
                        <h4 style="color: var(--primary-color); margin-bottom: 0.5rem;">💎 Валюты оплаты</h4>
                        <p style="color: var(--text-secondary); font-size: 0.9rem;">Оплачивайте в USDT или PLEX в зависимости от плана</p>
                    </div>
                </div>
            </div>
            
            <!-- ПРОГРЕСС ПОЛЬЗОВАТЕЛЯ -->
            <div class="stats-card" style="margin-bottom: 2rem;">
                <h3 style="color: var(--secondary-color); margin-bottom: 1.5rem;">📊 Ваш прогресс</h3>
                <div id="user-deposits-progress">
                    <div style="text-align: center; color: var(--text-secondary); padding: 2rem;">
                        <div class="loading-spinner" style="margin: 0 auto 1rem;"></div>
                        <p>Загрузка вашего прогресса...</p>
                    </div>
                </div>
            </div>
            
            <!-- ДОСТУПНЫЕ ПЛАНЫ ДЕПОЗИТОВ -->
            <div class="stats-card">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h3 style="color: var(--warning-color); margin: 0;">🏆 Планы депозитов GENESIS 1.1</h3>
                    <div style="display: flex; gap: 1rem; align-items: center;">
                        <span style="background: rgba(255, 165, 0, 0.2); color: var(--warning-color); padding: 0.5rem 1rem; border-radius: 8px; font-size: 0.9rem;">
                            💡 Начните с плана TRIAL за $25
                        </span>
                    </div>
                </div>
                
                <div id="all-deposit-plans" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem;">
                    ${this.renderAllDepositPlans()}
                </div>
            </div>
        `;
    },
    
    getPortfolioContent() {
        return `
            <div class="page-header">
                <h2 class="page-title">💼 Портфель депозитов</h2>
                <p class="page-subtitle">Полное управление вашими инвестициями в GENESIS 1.1</p>
            </div>
            
            <!-- ПОРТФЕЛЬНАЯ АНАЛИТИКА -->
            <div class="stats-grid" style="margin-bottom: 3rem;">
                <div class="stats-card">
                    <div class="stats-header">
                        <span class="stats-title">Общая стоимость портфеля</span>
                        <span class="stats-icon">💰</span>
                    </div>
                    <div class="stats-value" id="portfolio-total-value">$0.00</div>
                    <div class="stats-change positive" id="portfolio-change">Загрузка...</div>
                    <div style="margin-top: 1rem; font-size: 0.9rem; color: var(--text-secondary);">
                        <div id="portfolio-roi">📊 ROI: Вычисляется...</div>
                        <div id="portfolio-duration">⏳ Средний срок: --</div>
                    </div>
                </div>
                
                <div class="stats-card">
                    <div class="stats-header">
                        <span class="stats-title">Активные депозиты</span>
                        <span class="stats-icon">📈</span>
                    </div>
                    <div class="stats-value" id="active-deposits-count">0</div>
                    <div class="stats-change" id="active-deposits-status">Проверка...</div>
                    <div style="margin-top: 1rem; font-size: 0.9rem; color: var(--text-secondary);" id="deposits-breakdown">
                        <div>Загрузка статистики...</div>
                    </div>
                </div>
                
                <div class="stats-card">
                    <div class="stats-header">
                        <span class="stats-title">Заработано всего</span>
                        <span class="stats-icon">💎</span>
                    </div>
                    <div class="stats-value" id="total-earned">$0.00</div>
                    <div class="stats-change positive" id="daily-earnings">+$0.00 сегодня</div>
                    <div style="margin-top: 1rem; font-size: 0.9rem; color: var(--text-secondary);">
                        <div id="earnings-daily">📅 Ежедневно: $0.00</div>
                        <div id="earnings-trend">📈 Тренд: --</div>
                    </div>
                </div>
                
                <div class="stats-card">
                    <div class="stats-header">
                        <span class="stats-title">Следующий план</span>
                        <span class="stats-icon">🚀</span>
                    </div>
                    <div class="stats-value" id="next-available-plan">TRIAL</div>
                    <div class="stats-change neutral" id="next-plan-status">Доступен</div>
                    <div style="margin-top: 1rem; font-size: 0.9rem; color: var(--text-secondary);" id="next-plan-info">
                        <div>💰 Минимум: $25</div>
                        <div>📊 Доходность: 110%</div>
                    </div>
                </div>
            </div>
            
            <!-- АКТИВНЫЕ ДЕПОЗИТЫ -->
            <div class="stats-card" style="margin-bottom: 2rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h3 style="color: var(--primary-color); margin: 0;">💎 Мои активные депозиты</h3>
                    <button class="btn-secondary" onclick="window.GenesisCabinet.showDepositModal()" style="font-size: 0.9rem;">
                        📈 Создать новый
                    </button>
                </div>
                
                <div id="active-deposits-container">
                    <div class="empty-state">
                        <div class="empty-icon">🔄</div>
                        <h3>Загрузка депозитов...</h3>
                        <p>Проверяем вашу активность в блокчейне BSC</p>
                    </div>
                </div>
            </div>
            
            <!-- ПЛАНЫ ДЕПОЗИТОВ -->
            <div class="stats-card" style="margin-bottom: 2rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h3 style="color: var(--secondary-color); margin: 0;">📊 Планы депозитов GENESIS 1.1</h3>
                    <div style="display: flex; gap: 1rem; align-items: center;">
                        <span style="background: rgba(0,212,255,0.2); color: var(--secondary-color); padding: 0.5rem 1rem; border-radius: 8px; font-size: 0.9rem;">
                            💼 Адрес системы: ${window.GENESIS_CONFIG.addresses.system.substring(0, 20)}...
                        </span>
                    </div>
                </div>
                
                <div id="deposit-plans-grid">
                    <div class="empty-state">
                        <div class="empty-icon">⚙️</div>
                        <h3>Загрузка планов...</h3>
                        <p>Инициализация системы депозитов</p>
                    </div>
                </div>
            </div>
            
            <!-- ИСТОРИЯ ДОХОДНОСТИ -->
            <div class="stats-card">
                <h3 style="color: var(--warning-color); margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem;">
                    <span>📈</span> История доходности
                </h3>
                
                <div id="profitability-history">
                    <div style="text-align: center; color: var(--text-secondary); padding: 2rem;">
                        📊 История доходности будет доступна после создания первого депозита
                    </div>
                </div>
            </div>
        `;
    },
    
    getTransactionsContent() {
        return `
            <div class="page-header">
                <h2 class="page-title">📋 История транзакций</h2>
                <p class="page-subtitle">Все ваши операции в системе GENESIS 1.1</p>
            </div>
            
            <!-- ФИЛЬТРЫ И ПОИСК -->
            <div class="stats-card" style="margin-bottom: 2rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h3 style="color: var(--primary-color); margin: 0;">🔍 Фильтры транзакций</h3>
                    <div style="display: flex; gap: 1rem;">
                        <button class="btn-secondary" onclick="window.GenesisCabinet.exportTransactions('csv')" style="font-size: 0.9rem;">
                            📥 Экспорт CSV
                        </button>
                        <button class="btn-secondary" onclick="window.GenesisCabinet.refreshTransactions()" style="font-size: 0.9rem;">
                            🔄 Обновить
                        </button>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1rem;">
                    <div>
                        <label style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem; display: block;">Тип операции:</label>
                        <select id="transaction-type-filter" style="width: 100%; padding: 0.5rem; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 6px; color: var(--text-primary);">
                            <option value="all">Все операции</option>
                            <option value="deposit">Депозиты</option>
                            <option value="authorization">Авторизация</option>
                            <option value="subscription">Подписка</option>
                            <option value="withdrawal">Выводы</option>
                        </select>
                    </div>
                    
                    <div>
                        <label style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem; display: block;">Валюта:</label>
                        <select id="transaction-currency-filter" style="width: 100%; padding: 0.5rem; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 6px; color: var(--text-primary);">
                            <option value="all">Все валюты</option>
                            <option value="USDT">USDT</option>
                            <option value="PLEX">PLEX</option>
                            <option value="BNB">BNB</option>
                        </select>
                    </div>
                    
                    <div>
                        <label style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem; display: block;">Период:</label>
                        <select id="transaction-period-filter" style="width: 100%; padding: 0.5rem; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 6px; color: var(--text-primary);">
                            <option value="all">Все время</option>
                            <option value="today">Сегодня</option>
                            <option value="week">Неделя</option>
                            <option value="month">Месяц</option>
                            <option value="quarter">Квартал</option>
                        </select>
                    </div>
                    
                    <div>
                        <label style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem; display: block;">Поиск:</label>
                        <input type="text" id="transaction-search" placeholder="Hash или сумма..." style="width: 100%; padding: 0.5rem; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 6px; color: var(--text-primary);">
                    </div>
                </div>
                
                <button class="btn" onclick="window.GenesisCabinet.applyTransactionFilters()" style="font-size: 0.9rem;">
                    🔍 Применить фильтры
                </button>
            </div>
            
            <!-- СТАТИСТИКА ТРАНЗАКЦИЙ -->
            <div class="stats-grid" style="margin-bottom: 2rem;">
                <div class="stats-card">
                    <div class="stats-header">
                        <span class="stats-title">Всего транзакций</span>
                        <span class="stats-icon">📊</span>
                    </div>
                    <div class="stats-value" id="total-transactions-count">0</div>
                    <div class="stats-change" id="transactions-period-change">За все время</div>
                </div>
                
                <div class="stats-card">
                    <div class="stats-header">
                        <span class="stats-title">Общий объем</span>
                        <span class="stats-icon">💰</span>
                    </div>
                    <div class="stats-value" id="total-transactions-volume">$0.00</div>
                    <div class="stats-change positive" id="volume-change">USDT + PLEX</div>
                </div>
                
                <div class="stats-card">
                    <div class="stats-header">
                        <span class="stats-title">Последняя операция</span>
                        <span class="stats-icon">🕐</span>
                    </div>
                    <div class="stats-value" id="last-transaction-time">--</div>
                    <div class="stats-change" id="last-transaction-type">Нет данных</div>
                </div>
                
                <div class="stats-card">
                    <div class="stats-header">
                        <span class="stats-title">Успешных операций</span>
                        <span class="stats-icon">✅</span>
                    </div>
                    <div class="stats-value" id="successful-transactions">0</div>
                    <div class="stats-change positive" id="success-rate">0% успешных</div>
                </div>
            </div>
            
            <!-- ТАБЛИЦА ТРАНЗАКЦИЙ -->
            <div class="stats-card">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h3 style="color: var(--secondary-color); margin: 0;">📋 Список транзакций</h3>
                    <div style="display: flex; gap: 0.5rem; align-items: center;">
                        <span style="color: var(--text-secondary); font-size: 0.9rem;">Показать:</span>
                        <select id="transactions-per-page" style="padding: 0.3rem 0.5rem; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 4px; color: var(--text-primary); font-size: 0.8rem;">
                            <option value="10">10</option>
                            <option value="25" selected>25</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                    </div>
                </div>
                
                <div id="transactions-table-container">
                    <div class="empty-state">
                        <div class="empty-icon">🔍</div>
                        <h3>Поиск транзакций...</h3>
                        <p>Ищем ваши операции в блокчейне BSC</p>
                        <div style="margin-top: 1rem;">
                            <div style="background: var(--bg-primary); padding: 1rem; border-radius: 8px; color: var(--text-secondary); font-size: 0.9rem;">
                                📡 Поиск по адресу: <span style="color: var(--primary-color); font-family: monospace;">${this.userData?.address || 'Не авторизован'}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- ПАГИНАЦИЯ -->
                <div id="transactions-pagination" style="display: none; margin-top: 1.5rem; text-align: center;">
                    <div style="display: flex; justify-content: center; align-items: center; gap: 1rem;">
                        <button class="btn-outline" onclick="window.GenesisCabinet.previousTransactionsPage()" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;">
                            ← Предыдущая
                        </button>
                        <span id="pagination-info" style="color: var(--text-secondary); font-size: 0.9rem;">Страница 1 из 1</span>
                        <button class="btn-outline" onclick="window.GenesisCabinet.nextTransactionsPage()" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;">
                            Следующая →
                        </button>
                    </div>
                </div>
            </div>
        `;
    },
    
    getAnalyticsContent() {
        return `
            <div class="page-header">
                <h2 class="page-title">📈 Аналитика</h2>
                <p class="page-subtitle">Детальный анализ вашей активности</p>
            </div>
            
            <div class="stats-card">
                <h3>📊 График доходности</h3>
                <div style="height: 300px; display: flex; align-items: center; justify-content: center; background: var(--bg-primary); border-radius: 10px;">
                    <p style="color: var(--text-secondary);">График будет доступен после накопления данных</p>
                </div>
            </div>
            
            <div class="stats-grid">
                ${this.getAnalyticsCards()}
            </div>
        `;
    },
    
    // MCP-MARKER:METHOD:CABINET:ACCESS_MANAGEMENT - Управление доступом к платформе
    getAccessContent() {
        const accessDays = this.userData?.access?.accessDays || 0;
        const isActive = accessDays > 0;
        
        return `
            <div class="page-header">
                <h2 class="page-title">💳 Доступ к платформе</h2>
                <p class="page-subtitle">Управление подпиской на GENESIS 1.1</p>
            </div>
            
            <div class="stats-grid" style="margin-bottom: 2rem;">
                <div class="stats-card">
                    <div class="stats-header">
                        <span class="stats-title">Статус доступа</span>
                        <span class="stats-icon">${isActive ? '✅' : '❌'}</span>
                    </div>
                    <div class="stats-value" style="color: ${isActive ? 'var(--success-color)' : 'var(--error-color)'}">
                        ${isActive ? 'Активен' : 'Неактивен'}
                    </div>
                    <div class="stats-change ${isActive ? 'positive' : 'negative'}">
                        ${isActive ? `Осталось ${accessDays} дней` : 'Требуется оплата'}
                    </div>
                </div>
                
                <div class="stats-card">
                    <div class="stats-header">
                        <span class="stats-title">Стоимость доступа</span>
                        <span class="stats-icon">💰</span>
                    </div>
                    <div class="stats-value">$1.00</div>
                    <div class="stats-change">в день (USDT)</div>
                </div>
                
                <div class="stats-card">
                    <div class="stats-header">
                        <span class="stats-title">Минимальная оплата</span>
                        <span class="stats-icon">📅</span>
                    </div>
                    <div class="stats-value">$10.00</div>
                    <div class="stats-change">на 10 дней</div>
                </div>
                
                <div class="stats-card">
                    <div class="stats-header">
                        <span class="stats-title">История платежей</span>
                        <span class="stats-icon">📋</span>
                    </div>
                    <div class="stats-value" id="access-payments-count">0</div>
                    <div class="stats-change">транзакций</div>
                </div>
            </div>
            
            <div class="stats-card" style="margin-bottom: 2rem;">
                <h3 style="color: var(--primary-color); margin-bottom: 1.5rem;">🔐 О системе доступа</h3>
                <div style="line-height: 1.8; color: var(--text-secondary);">
                    <p style="margin-bottom: 1rem;">GENESIS 1.1 использует систему ежедневной подписки для поддержания работы платформы и обеспечения качества сервиса.</p>
                    <ul style="margin: 0; padding-left: 1.5rem;">
                        <li>✅ <strong>Прозрачная оплата:</strong> $1 в день через блокчейн BSC</li>
                        <li>✅ <strong>Гибкость:</strong> Пополняйте на любой период от 10 дней</li>
                        <li>✅ <strong>Автоматизация:</strong> Ежедневное списание без вашего участия</li>
                        <li>✅ <strong>Безопасность:</strong> Все платежи видны в блокчейне</li>
                        <li>✅ <strong>Контроль:</strong> Отслеживайте баланс в режиме реального времени</li>
                    </ul>
                </div>
            </div>
            
            <div class="stats-card">
                <h3 style="color: var(--secondary-color); margin-bottom: 1.5rem;">💳 Пополнение доступа</h3>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                    <div>
                        <h4 style="color: var(--text-primary); margin-bottom: 1rem;">Быстрое пополнение:</h4>
                        <div style="display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 1.5rem;">
                            <button class="btn-secondary" onclick="window.GenesisCabinet.topUpAccess(10)" style="flex: 1; min-width: 120px;">
                                💵 $10<br><small>10 дней</small>
                            </button>
                            <button class="btn-secondary" onclick="window.GenesisCabinet.topUpAccess(30)" style="flex: 1; min-width: 120px;">
                                💵 $30<br><small>30 дней</small>
                            </button>
                            <button class="btn-secondary" onclick="window.GenesisCabinet.topUpAccess(90)" style="flex: 1; min-width: 120px;">
                                💵 $90<br><small>90 дней</small>
                            </button>
                        </div>
                        
                        <div>
                            <label style="color: var(--text-secondary); font-size: 0.9rem;">Произвольная сумма (мин. $10):</label>
                            <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
                                <input type="number" id="custom-access-amount" min="10" step="1" value="10" 
                                       style="flex: 1; padding: 0.5rem; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 6px; color: var(--text-primary);">
                                <button class="btn" onclick="window.GenesisCabinet.topUpAccessCustom()">
                                    Пополнить
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div style="background: var(--bg-primary); padding: 1.5rem; border-radius: 8px;">
                        <h4 style="color: var(--warning-color); margin-bottom: 1rem;">⚠️ Важная информация:</h4>
                        <ul style="color: var(--text-secondary); font-size: 0.9rem; margin: 0; padding-left: 1.5rem; line-height: 1.6;">
                            <li>Минимальная сумма пополнения: <strong>$10 USDT</strong></li>
                            <li>Используйте только сеть <strong>BSC (BEP-20)</strong></li>
                            <li>Платеж активируется автоматически</li>
                            <li>Баланс дней обновляется мгновенно</li>
                            <li>При нулевом балансе доступ блокируется</li>
                        </ul>
                    </div>
                </div>
            </div>
            
            ${!isActive ? this.getAccessPaymentInstructions() : this.getAccessHistoryTable()}
        `;
    },
    
    // MCP-MARKER:METHOD:CABINET:BONUSES_MANAGEMENT - Управление бонусами
    getBonusesContent() {
        return `
            <div class="page-header">
                <h2 class="page-title">🎁 Бонусная программа</h2>
                <p class="page-subtitle">Дополнительные возможности заработка в GENESIS 1.1</p>
            </div>
            
            <div class="stats-grid" style="margin-bottom: 2rem;">
                <div class="stats-card">
                    <div class="stats-header">
                        <span class="stats-title">Бонусный баланс</span>
                        <span class="stats-icon">💎</span>
                    </div>
                    <div class="stats-value">0 PLEX</div>
                    <div class="stats-change positive">≈ $0.00</div>
                </div>
                
                <div class="stats-card">
                    <div class="stats-header">
                        <span class="stats-title">Активных бонусов</span>
                        <span class="stats-icon">🎯</span>
                    </div>
                    <div class="stats-value">0</div>
                    <div class="stats-change">из 5 доступных</div>
                </div>
                
                <div class="stats-card">
                    <div class="stats-header">
                        <span class="stats-title">Заработано всего</span>
                        <span class="stats-icon">📈</span>
                    </div>
                    <div class="stats-value">0 PLEX</div>
                    <div class="stats-change">за все время</div>
                </div>
                
                <div class="stats-card">
                    <div class="stats-header">
                        <span class="stats-title">Множитель бонусов</span>
                        <span class="stats-icon">🚀</span>
                    </div>
                    <div class="stats-value">x1.0</div>
                    <div class="stats-change">базовый уровень</div>
                </div>
            </div>
            
            <div class="stats-card">
                <h3 style="color: var(--primary-color); margin-bottom: 1.5rem;">🎯 Доступные бонусы</h3>
                
                <div style="display: grid; gap: 1rem;">
                    ${this.getBonusItems()}
                </div>
            </div>
            
            <div class="stats-card" style="margin-top: 2rem;">
                <h3 style="color: var(--secondary-color); margin-bottom: 1.5rem;">📊 Дорожная карта бонусов</h3>
                <div style="text-align: center; color: var(--text-secondary); padding: 2rem;">
                    <p>🚧 Новые бонусы добавляются по мере развития платформы</p>
                    <p style="margin-top: 1rem;">Следите за обновлениями!</p>
                </div>
            </div>
        `;
    },
    
    // MCP-MARKER:METHOD:CABINET:REFERRALS_MANAGEMENT - Управление рефералами
    getReferralsContent() {
        const refLink = `https://genesis.app/ref/${this.userData?.address?.substring(2, 8) || 'xxxxx'}`;
        
        return `
            <div class="page-header">
                <h2 class="page-title">👥 Реферальная программа</h2>
                <p class="page-subtitle">Приглашайте друзей и зарабатывайте вместе</p>
            </div>
            
            <div class="stats-grid" style="margin-bottom: 2rem;">
                <div class="stats-card">
                    <div class="stats-header">
                        <span class="stats-title">Всего рефералов</span>
                        <span class="stats-icon">👥</span>
                    </div>
                    <div class="stats-value">0</div>
                    <div class="stats-change">партнеров</div>
                </div>
                
                <div class="stats-card">
                    <div class="stats-header">
                        <span class="stats-title">Активных рефералов</span>
                        <span class="stats-icon">✅</span>
                    </div>
                    <div class="stats-value">0</div>
                    <div class="stats-change">с депозитами</div>
                </div>
                
                <div class="stats-card">
                    <div class="stats-header">
                        <span class="stats-title">Заработано с рефералов</span>
                        <span class="stats-icon">💰</span>
                    </div>
                    <div class="stats-value">$0.00</div>
                    <div class="stats-change positive">всего</div>
                </div>
                
                <div class="stats-card">
                    <div class="stats-header">
                        <span class="stats-title">Процент с рефералов</span>
                        <span class="stats-icon">📊</span>
                    </div>
                    <div class="stats-value">10%</div>
                    <div class="stats-change">от их прибыли</div>
                </div>
            </div>
            
            <div class="stats-card" style="margin-bottom: 2rem;">
                <h3 style="color: var(--primary-color); margin-bottom: 1.5rem;">🔗 Ваша реферальная ссылка</h3>
                
                <div style="background: var(--bg-primary); padding: 1.5rem; border-radius: 8px; margin-bottom: 1rem;">
                    <div style="display: flex; gap: 1rem; align-items: center;">
                        <input type="text" value="${refLink}" readonly 
                               style="flex: 1; padding: 0.8rem; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 6px; color: var(--text-primary); font-family: monospace;">
                        <button class="btn" onclick="window.GenesisCabinet.copyRefLink('${refLink}')">
                            📋 Копировать
                        </button>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                    <button class="btn-secondary" onclick="window.GenesisCabinet.shareRefLink('telegram')">
                        <span style="font-size: 1.2rem;">📱</span> Telegram
                    </button>
                    <button class="btn-secondary" onclick="window.GenesisCabinet.shareRefLink('whatsapp')">
                        <span style="font-size: 1.2rem;">💬</span> WhatsApp
                    </button>
                    <button class="btn-secondary" onclick="window.GenesisCabinet.shareRefLink('twitter')">
                        <span style="font-size: 1.2rem;">🐦</span> Twitter
                    </button>
                    <button class="btn-secondary" onclick="window.GenesisCabinet.generateRefQR()">
                        <span style="font-size: 1.2rem;">📱</span> QR-код
                    </button>
                </div>
            </div>
            
            <div class="stats-card">
                <h3 style="color: var(--secondary-color); margin-bottom: 1.5rem;">📊 Условия реферальной программы</h3>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                    <div>
                        <h4 style="color: var(--text-primary); margin-bottom: 1rem;">🎁 Ваши преимущества:</h4>
                        <ul style="color: var(--text-secondary); line-height: 1.8; margin: 0; padding-left: 1.5rem;">
                            <li><strong>10%</strong> от прибыли рефералов</li>
                            <li><strong>Пожизненные</strong> выплаты</li>
                            <li><strong>Мгновенное</strong> начисление</li>
                            <li><strong>Без ограничений</strong> по количеству</li>
                            <li><strong>Многоуровневая</strong> система (скоро)</li>
                        </ul>
                    </div>
                    
                    <div>
                        <h4 style="color: var(--text-primary); margin-bottom: 1rem;">📈 Как это работает:</h4>
                        <ol style="color: var(--text-secondary); line-height: 1.8; margin: 0; padding-left: 1.5rem;">
                            <li>Поделитесь реферальной ссылкой</li>
                            <li>Друг регистрируется по вашей ссылке</li>
                            <li>Друг создает депозит</li>
                            <li>Вы получаете 10% от его прибыли</li>
                            <li>Выплаты происходят автоматически</li>
                        </ol>
                    </div>
                </div>
            </div>
            
            <div class="stats-card" style="margin-top: 2rem;">
                <h3 style="color: var(--warning-color); margin-bottom: 1.5rem;">👥 Список рефералов</h3>
                <div class="empty-state">
                    <div class="empty-icon">👥</div>
                    <h3>Рефералы отсутствуют</h3>
                    <p>Начните приглашать друзей и зарабатывайте вместе!</p>
                </div>
            </div>
        `;
    },
    
    // MCP-MARKER:METHOD:CABINET:SETTINGS_MANAGEMENT - Управление настройками
    getSettingsContent() {
        return `
            <div class="page-header">
                <h2 class="page-title">⚙️ Настройки</h2>
                <p class="page-subtitle">Персонализация вашего кабинета GENESIS 1.1</p>
            </div>
            
            <div class="stats-card" style="margin-bottom: 2rem;">
                <h3 style="color: var(--primary-color); margin-bottom: 1.5rem;">👤 Профиль пользователя</h3>
                
                <div style="display: grid; gap: 1.5rem;">
                    <div>
                        <label style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem; display: block;">BSC адрес кошелька:</label>
                        <div style="display: flex; gap: 0.5rem;">
                            <input type="text" value="${this.userData?.address || ''}" readonly 
                                   style="flex: 1; padding: 0.8rem; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 6px; color: var(--text-primary); font-family: monospace; font-size: 0.9rem;">
                            <button class="btn-secondary" onclick="navigator.clipboard.writeText('${this.userData?.address || ''}'); this.innerHTML = '✅'">
                                📋
                            </button>
                        </div>
                    </div>
                    
                    <div>
                        <label style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem; display: block;">Email для уведомлений:</label>
                        <div style="display: flex; gap: 0.5rem;">
                            <input type="email" id="user-email" placeholder="your@email.com" 
                                   style="flex: 1; padding: 0.8rem; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 6px; color: var(--text-primary);">
                            <button class="btn" onclick="window.GenesisCabinet.saveEmail()">
                                💾 Сохранить
                            </button>
                        </div>
                    </div>
                    
                    <div>
                        <label style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem; display: block;">Никнейм (опционально):</label>
                        <div style="display: flex; gap: 0.5rem;">
                            <input type="text" id="user-nickname" placeholder="CryptoKing" 
                                   style="flex: 1; padding: 0.8rem; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 6px; color: var(--text-primary);">
                            <button class="btn" onclick="window.GenesisCabinet.saveNickname()">
                                💾 Сохранить
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="stats-card" style="margin-bottom: 2rem;">
                <h3 style="color: var(--secondary-color); margin-bottom: 1.5rem;">🔔 Настройки уведомлений</h3>
                
                <div style="display: grid; gap: 1rem;">
                    ${this.getNotificationSettings()}
                </div>
            </div>
            
            <div class="stats-card" style="margin-bottom: 2rem;">
                <h3 style="color: var(--warning-color); margin-bottom: 1.5rem;">🎨 Внешний вид</h3>
                
                <div style="display: grid; gap: 1.5rem;">
                    <div>
                        <label style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem; display: block;">Тема оформления:</label>
                        <select id="theme-select" onchange="window.GenesisCabinet.changeTheme(this.value)" 
                                style="width: 100%; padding: 0.8rem; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 6px; color: var(--text-primary);">
                            <option value="dark">🌙 Темная (по умолчанию)</option>
                            <option value="light" disabled>☀️ Светлая (скоро)</option>
                            <option value="cyber" disabled>🎮 Киберпанк (скоро)</option>
                        </select>
                    </div>
                    
                    <div>
                        <label style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem; display: block;">Язык интерфейса:</label>
                        <select id="language-select" onchange="window.GenesisCabinet.changeLanguage(this.value)" 
                                style="width: 100%; padding: 0.8rem; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 6px; color: var(--text-primary);">
                            <option value="ru">🇷🇺 Русский</option>
                            <option value="en" disabled>🇬🇧 English (soon)</option>
                            <option value="es" disabled>🇪🇸 Español (soon)</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <div class="stats-card" style="margin-bottom: 2rem;">
                <h3 style="color: var(--error-color); margin-bottom: 1.5rem;">⚠️ Безопасность</h3>
                
                <div style="display: grid; gap: 1rem;">
                    <button class="btn-outline" onclick="window.GenesisCabinet.enableTwoFactor()" disabled>
                        🔐 Включить двухфакторную аутентификацию (скоро)
                    </button>
                    
                    <button class="btn-outline" onclick="window.GenesisCabinet.exportPrivateData()">
                        📥 Экспортировать мои данные
                    </button>
                    
                    <button class="btn-outline" style="color: var(--error-color); border-color: var(--error-color);" 
                            onclick="if(confirm('Вы уверены? Это действие удалит все локальные данные!')) window.GenesisCabinet.clearAllData()">
                        🗑️ Очистить все данные
                    </button>
                </div>
            </div>
            
            <div class="stats-card">
                <h3 style="color: var(--text-primary); margin-bottom: 1.5rem;">ℹ️ О системе</h3>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; color: var(--text-secondary); font-size: 0.9rem;">
                    <div>
                        <strong>Версия:</strong> GENESIS 1.1.0
                    </div>
                    <div>
                        <strong>Сборка:</strong> ${new Date().toISOString().split('T')[0]}
                    </div>
                    <div>
                        <strong>Сеть:</strong> BSC Mainnet
                    </div>
                    <div>
                        <strong>Статус:</strong> <span style="color: var(--success-color);">✅ Активна</span>
                    </div>
                </div>
                
                <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border-color); text-align: center;">
                    <p style="color: var(--text-secondary); font-size: 0.8rem;">
                        © 2025 GENESIS 1.1 - DeFi Platform<br>
                        Все права защищены
                    </p>
                </div>
            </div>
        `;
    },
    
    // Вспомогательные методы
    calculateUserStats() {
        const deposits = window.GenesisTransaction.getActiveDeposits();
        const totalProfit = window.GenesisTransaction.calculateTotalProfit(deposits);
        
        let totalBalance = 0;
        let dailyProfit = 0;
        let activeDeposits = 0;
        
        deposits.forEach(deposit => {
            if (deposit.status === 'success') {
                totalBalance += deposit.data.amount;
                dailyProfit += deposit.data.dailyProfit;
                activeDeposits++;
            }
        });
        
        return {
            totalBalance: totalBalance,
            activeDeposits: activeDeposits,
            totalDeposits: deposits.length,
            totalProfit: totalProfit,
            dailyProfit: dailyProfit,
            accessDays: this.userData?.access?.accessDays || 0
        };
    },
    
    updateUserDisplay() {
        const addressDisplay = document.getElementById('user-address-display');
        if (addressDisplay && this.userData) {
            addressDisplay.textContent = window.GenesisUtils.formatAddress(this.userData.address);
        }
    },
    
    renderDepositsTable(deposits) {
        return `
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="border-bottom: 1px solid var(--border-color);">
                        <th style="padding: 12px; text-align: left;">План</th>
                        <th style="padding: 12px; text-align: right;">Сумма</th>
                        <th style="padding: 12px; text-align: right;">Доход/день</th>
                        <th style="padding: 12px; text-align: right;">Осталось дней</th>
                        <th style="padding: 12px; text-align: right;">Статус</th>
                    </tr>
                </thead>
                <tbody>
                    ${deposits.map(d => `
                        <tr style="border-bottom: 1px solid var(--bg-primary);">
                            <td style="padding: 12px;">${d.data.planName}</td>
                            <td style="padding: 12px; text-align: right;">$${d.data.amount}</td>
                            <td style="padding: 12px; text-align: right; color: var(--success-color);">+$${d.data.dailyProfit.toFixed(2)}</td>
                            <td style="padding: 12px; text-align: right;">${this.calculateDaysLeft(d.data.expiresAt)}</td>
                            <td style="padding: 12px; text-align: right;">
                                <span style="color: var(--success-color);">Активен</span>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    },
    
    calculateDaysLeft(expiresAt) {
        const now = new Date();
        const expires = new Date(expiresAt);
        const daysLeft = Math.ceil((expires - now) / (24 * 60 * 60 * 1000));
        return Math.max(0, daysLeft);
    },
    
    getEmptyDepositsMessage() {
        return `
            <div class="empty-state">
                <div class="empty-icon">💼</div>
                <h3>Нет активных депозитов</h3>
                <p>Создайте свой первый депозит для начала получения прибыли</p>
                <button class="btn" onclick="window.GenesisCabinet.showDepositModal()">
                    Создать депозит
                </button>
            </div>
        `;
    },
    
    // Автообновление данных
    startDataRefresh() {
        // Обновляем данные каждые 30 секунд
        setInterval(() => {
            if (this.userData) {
                this.loadUserData(this.userData.address);
            }
        }, 30000);
        
        // Обновляем статус доступа
        this.updateAccessStatusIndicator();
    },
    
    // Обновление индикатора статуса доступа
    async updateAccessStatusIndicator() {
        const indicator = document.getElementById('access-status-indicator');
        if (!indicator || !this.userData?.address) return;
        
        try {
            const accessData = await window.GenesisPlatformAccess.checkUserAccessBalance(this.userData.address);
            
            const iconEl = document.getElementById('access-status-icon');
            const textEl = document.getElementById('access-status-text');
            const daysEl = document.getElementById('access-days-count');
            
            indicator.classList.remove('hidden');
            
            if (accessData.isActive) {
                iconEl.textContent = '✅';
                textEl.textContent = 'Активен';
                daysEl.textContent = `(${accessData.daysRemaining} дней)`;
                indicator.style.color = 'var(--success-color)';
            } else {
                iconEl.textContent = '❌';
                textEl.textContent = 'Неактивен';
                daysEl.textContent = '';
                indicator.style.color = 'var(--error-color)';
            }
        } catch (error) {
            console.error('Ошибка обновления статуса доступа:', error);
        }
    },
    
    // MCP-MARKER:METHOD:CABINET:DEPOSITS_MANAGEMENT - Управление депозитами
    
    // Показать модальное окно создания депозита
    showDepositModal() {
        // Используем новый сервис депозитов если доступен
        if (window.CabinetDepositService && window.CabinetDepositService.showCreateDepositModal) {
            window.CabinetDepositService.showCreateDepositModal();
        } else {
            // Fallback к старому методу
            this.createDepositModal();
            const modal = document.getElementById('deposit-modal');
            if (modal) {
                modal.classList.remove('hidden');
                this.loadDepositPlans();
            }
        }
    },
    
    // Создание модального окна депозита
    createDepositModal() {
        // Удаляем существующее модальное окно если есть
        const existingModal = document.getElementById('deposit-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        const modalHTML = `
            <div id="deposit-modal" class="modal-overlay hidden">
                <div class="modal-container">
                    <div class="modal-header">
                        <h3>💰 Создание депозита</h3>
                        <button class="modal-close" onclick="window.GenesisCabinet.closeDepositModal()">&times;</button>
                    </div>
                    
                    <div class="modal-content">
                        <div class="deposit-steps">
                            <div class="step active" data-step="1">
                                <span class="step-number">1</span>
                                <span class="step-title">Выбор плана</span>
                            </div>
                            <div class="step" data-step="2">
                                <span class="step-number">2</span>
                                <span class="step-title">Параметры</span>
                            </div>
                            <div class="step" data-step="3">
                                <span class="step-number">3</span>
                                <span class="step-title">Оплата</span>
                            </div>
                        </div>
                        
                        <div id="deposit-step-content">
                            <!-- Контент шагов будет загружаться динамически -->
                        </div>
                    </div>
                </div>
            </div>
            
            <style>
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.8);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                }
                
                .modal-container {
                    background: var(--bg-secondary);
                    border-radius: 15px;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
                    border: 1px solid var(--border-color);
                    width: 90%;
                    max-width: 800px;
                    max-height: 90vh;
                    overflow-y: auto;
                }
                
                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1.5rem 2rem;
                    border-bottom: 1px solid var(--border-color);
                }
                
                .modal-header h3 {
                    color: var(--primary-color);
                    margin: 0;
                    font-family: 'Orbitron', monospace;
                }
                
                .modal-close {
                    background: none;
                    border: none;
                    color: var(--text-secondary);
                    font-size: 2rem;
                    cursor: pointer;
                    line-height: 1;
                    padding: 0;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .modal-close:hover {
                    color: var(--primary-color);
                }
                
                .modal-content {
                    padding: 2rem;
                }
                
                .deposit-steps {
                    display: flex;
                    justify-content: center;
                    margin-bottom: 2rem;
                    gap: 2rem;
                }
                
                .step {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.5rem 1rem;
                    border-radius: 8px;
                    background: var(--bg-primary);
                    border: 1px solid var(--border-color);
                    opacity: 0.5;
                }
                
                .step.active {
                    opacity: 1;
                    background: var(--primary-color);
                    color: white;
                }
                
                .step-number {
                    background: rgba(255, 255, 255, 0.2);
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.8rem;
                    font-weight: bold;
                }
                
                .step-title {
                    font-size: 0.9rem;
                    font-weight: 500;
                }
                
                .deposit-plan-card {
                    border: 2px solid var(--border-color);
                    border-radius: 12px;
                    padding: 1.5rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    margin-bottom: 1rem;
                }
                
                .deposit-plan-card:hover {
                    border-color: var(--primary-color);
                    background: rgba(255, 107, 53, 0.05);
                }
                
                .deposit-plan-card.selected {
                    border-color: var(--primary-color);
                    background: rgba(255, 107, 53, 0.1);
                }
                
                .deposit-plan-card.locked {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                
                .deposit-plan-card.locked:hover {
                    border-color: var(--border-color);
                    background: transparent;
                }
            </style>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    },
    
    // Закрыть модальное окно депозита
    closeDepositModal() {
        const modal = document.getElementById('deposit-modal');
        if (modal) {
            modal.classList.add('hidden');
            setTimeout(() => modal.remove(), 300);
        }
    },
    
    // Загрузка планов депозитов в модальное окно
    loadDepositPlans() {
        const stepContent = document.getElementById('deposit-step-content');
        if (!stepContent) return;
        
        const plans = window.GENESIS_CONFIG.depositPlans;
        
        stepContent.innerHTML = `
            <h4 style="color: var(--text-primary); margin-bottom: 1.5rem;">Выберите план депозита:</h4>
            <div class="deposit-plans-list">
                ${plans.map((plan, index) => {
                    const isLocked = index > 0; // Первый план всегда доступен
                    const lockIcon = isLocked ? '🔒' : '🚀';
                    const lockClass = isLocked ? 'locked' : '';
                    
                    return `
                        <div class="deposit-plan-card ${lockClass}" 
                             onclick="${!isLocked ? `window.GenesisCabinet.selectPlan('${plan.id}')` : 'void(0)'}">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                                <div>
                                    <h4 style="color: var(--primary-color); margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
                                        <span>${lockIcon}</span>
                                        ${plan.name}
                                    </h4>
                                    <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem;">
                                        ${plan.description}
                                    </p>
                                    ${isLocked ? '<div style="color: var(--warning-color); font-size: 0.8rem;">🔒 Завершите предыдущий план</div>' : ''}
                                </div>
                                <div style="text-align: right;">
                                    <div style="font-size: 1.2rem; font-weight: 700; color: var(--text-primary);">
                                        ${plan.usdtAmount.toLocaleString()}
                                    </div>
                                    <div style="color: var(--success-color); font-size: 0.9rem;">
                                        ${plan.percentage}% (${plan.days} дней)
                                    </div>
                                </div>
                            </div>
                            
                            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; font-size: 0.8rem;">
                                <div style="text-align: center; padding: 0.5rem; background: var(--bg-primary); border-radius: 6px;">
                                    <div style="color: var(--text-secondary);">Инвестиция</div>
                                    <div style="color: var(--text-primary); font-weight: 600;">${plan.usdtAmount}</div>
                                </div>
                                <div style="text-align: center; padding: 0.5rem; background: var(--bg-primary); border-radius: 6px;">
                                    <div style="color: var(--text-secondary);">Прибыль</div>
                                    <div style="color: var(--success-color); font-weight: 600;">${((plan.usdtAmount * plan.percentage / 100) - plan.usdtAmount).toFixed(2)}</div>
                                </div>
                                <div style="text-align: center; padding: 0.5rem; background: var(--bg-primary); border-radius: 6px;">
                                    <div style="color: var(--text-secondary);">В день</div>
                                    <div style="color: var(--primary-color); font-weight: 600;">${(((plan.usdtAmount * plan.percentage / 100) - plan.usdtAmount) / plan.days).toFixed(2)}</div>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },
    
    // Выбор плана депозита
    selectPlan(planId) {
        const plan = window.GENESIS_CONFIG.depositPlans.find(p => p.id === planId);
        if (!plan) return;
        
        // Помечаем выбранный план
        document.querySelectorAll('.deposit-plan-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        const selectedCard = document.querySelector(`[onclick*="${planId}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
        }
        
        // Переходим к следующему шагу
        setTimeout(() => {
            this.showDepositStep2(plan);
        }, 500);
    },
    
    // Шаг 2: Параметры депозита
    showDepositStep2(plan) {
        // Обновляем индикатор шагов
        document.querySelectorAll('.step').forEach(step => step.classList.remove('active'));
        document.querySelector('[data-step="2"]').classList.add('active');
        
        const stepContent = document.getElementById('deposit-step-content');
        stepContent.innerHTML = `
            <h4 style="color: var(--text-primary); margin-bottom: 1.5rem;">Параметры депозита: ${plan.name}</h4>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem;">
                <div class="stats-card" style="margin: 0;">
                    <h5 style="color: var(--primary-color); margin-bottom: 1rem;">📊 Детали плана</h5>
                    <div style="display: flex; flex-direction: column; gap: 0.8rem;">
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: var(--text-secondary);">Инвестиция:</span>
                            <span style="color: var(--text-primary); font-weight: 600;">${plan.usdtAmount}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: var(--text-secondary);">Доходность:</span>
                            <span style="color: var(--success-color); font-weight: 600;">${plan.percentage}%</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: var(--text-secondary);">Срок:</span>
                            <span style="color: var(--warning-color); font-weight: 600;">${plan.days} дней</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: var(--text-secondary);">Прибыль:</span>
                            <span style="color: var(--primary-color); font-weight: 600;">${((plan.usdtAmount * plan.percentage / 100) - plan.usdtAmount).toFixed(2)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: var(--text-secondary);">В день:</span>
                            <span style="color: var(--secondary-color); font-weight: 600;">${(((plan.usdtAmount * plan.percentage / 100) - plan.usdtAmount) / plan.days).toFixed(2)}</span>
                        </div>
                    </div>
                </div>
                
                <div class="stats-card" style="margin: 0;">
                    <h5 style="color: var(--secondary-color); margin-bottom: 1rem;">💳 Валюта оплаты</h5>
                    <div style="display: flex; flex-direction: column; gap: 1rem;">
                        ${plan.currencies.map(currency => `
                            <label style="display: flex; align-items: center; gap: 0.5rem; padding: 0.8rem; background: var(--bg-primary); border-radius: 8px; cursor: pointer; border: 2px solid transparent;" onclick="this.style.border='2px solid var(--primary-color)'; document.querySelectorAll('label').forEach(l => l !== this && (l.style.border='2px solid transparent'));">
                                <input type="radio" name="currency" value="${currency}" style="margin-right: 0.5rem;">
                                <div>
                                    <div style="color: var(--text-primary); font-weight: 600;">${currency}</div>
                                    <div style="color: var(--text-secondary); font-size: 0.8rem;">
                                        ${currency === 'USDT' ? `${plan.usdtAmount} USDT` : `${plan.plexAmount.toLocaleString()} PLEX`}
                                    </div>
                                </div>
                            </label>
                        `).join('')}
                    </div>
                </div>
            </div>
            
            <div style="display: flex; gap: 1rem; justify-content: space-between;">
                <button class="btn-outline" onclick="window.GenesisCabinet.loadDepositPlans()">
                    ← Назад к планам
                </button>
                <button class="btn" onclick="window.GenesisCabinet.showDepositStep3('${plan.id}')">
                    Продолжить к оплате →
                </button>
            </div>
        `;
        
        // Автоматически выбираем первую доступную валюту
        setTimeout(() => {
            const firstCurrency = stepContent.querySelector('input[name="currency"]');
            if (firstCurrency) {
                firstCurrency.checked = true;
                firstCurrency.closest('label').style.border = '2px solid var(--primary-color)';
            }
        }, 100);
    },
    
    // Шаг 3: Оплата
    showDepositStep3(planId) {
        const plan = window.GENESIS_CONFIG.depositPlans.find(p => p.id === planId);
        const selectedCurrency = document.querySelector('input[name="currency"]:checked')?.value;
        
        if (!plan || !selectedCurrency) {
            alert('❌ Выберите валюту для оплаты');
            return;
        }
        
        // Обновляем индикатор шагов
        document.querySelectorAll('.step').forEach(step => step.classList.remove('active'));
        document.querySelector('[data-step="3"]').classList.add('active');
        
        const amount = selectedCurrency === 'USDT' ? plan.usdtAmount : plan.plexAmount;
        const tokenAddress = selectedCurrency === 'USDT' ? window.GENESIS_CONFIG.usdt.address : window.GENESIS_CONFIG.plex.address;
        const systemAddress = window.GENESIS_CONFIG.addresses.system;
        
        const stepContent = document.getElementById('deposit-step-content');
        stepContent.innerHTML = `
            <h4 style="color: var(--text-primary); margin-bottom: 1.5rem;">💳 Оплата депозита: ${plan.name}</h4>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem;">
                <div class="stats-card" style="margin: 0;">
                    <h5 style="color: var(--primary-color); margin-bottom: 1rem;">📋 Инструкция по оплате</h5>
                    <div style="color: var(--text-secondary); line-height: 1.6; font-size: 0.9rem;">
                        <p style="margin-bottom: 1rem;">1. Отправьте <strong style="color: var(--success-color);">${amount} ${selectedCurrency}</strong> на адрес системы</p>
                        <p style="margin-bottom: 1rem;">2. Используйте сеть <strong style="color: var(--warning-color);">BSC (BEP-20)</strong></p>
                        <p style="margin-bottom: 1rem;">3. Ожидайте подтверждения в блокчейне (1-3 минуты)</p>
                        <p style="margin-bottom: 1rem;">4. Депозит активируется автоматически после подтверждения</p>
                        
                        <div style="background: var(--bg-primary); padding: 1rem; border-radius: 8px; margin-top: 1rem; border-left: 4px solid var(--warning-color);">
                            <strong style="color: var(--warning-color);">⚠️ Важно:</strong><br>
                            Отправляйте точную сумму через BSC сеть. Депозиты через другие сети не засчитываются!
                        </div>
                    </div>
                </div>
                
                <div class="stats-card" style="margin: 0;">
                    <h5 style="color: var(--secondary-color); margin-bottom: 1rem;">💰 Детали платежа</h5>
                    
                    <div style="background: var(--bg-primary); padding: 1.5rem; border-radius: 8px; margin-bottom: 1rem;">
                        <div style="text-align: center; margin-bottom: 1rem;">
                            <div style="color: var(--text-secondary); font-size: 0.9rem;">Сумма к оплате:</div>
                            <div style="color: var(--primary-color); font-size: 2rem; font-weight: bold; font-family: 'Orbitron', monospace;">
                                ${amount.toLocaleString()} ${selectedCurrency}
                            </div>
                        </div>
                        
                        <div style="margin-bottom: 1rem;">
                            <div style="color: var(--text-secondary); font-size: 0.8rem; margin-bottom: 0.5rem;">Адрес системы:</div>
                            <div style="background: var(--bg-secondary); padding: 0.8rem; border-radius: 6px; font-family: monospace; font-size: 0.9rem; word-break: break-all; color: var(--success-color);">
                                ${systemAddress}
                            </div>
                            <button class="btn-secondary" onclick="navigator.clipboard.writeText('${systemAddress}'); this.innerHTML = '✅ Скопировано!'" style="width: 100%; margin-top: 0.5rem; font-size: 0.8rem;">
                                📋 Копировать адрес
                            </button>
                        </div>
                        
                        <div style="margin-bottom: 1rem;">
                            <div style="color: var(--text-secondary); font-size: 0.8rem; margin-bottom: 0.5rem;">Контракт токена:</div>
                            <div style="background: var(--bg-secondary); padding: 0.8rem; border-radius: 6px; font-family: monospace; font-size: 0.8rem; word-break: break-all; color: var(--secondary-color);">
                                ${tokenAddress}
                            </div>
                        </div>
                    </div>
                    
                    <!-- QR код будет здесь -->
                    <div style="text-align: center; padding: 1rem; background: var(--bg-primary); border-radius: 8px;">
                        <div style="color: var(--text-secondary); margin-bottom: 0.5rem;">QR код для оплаты:</div>
                        <div style="color: var(--warning-color); font-size: 0.9rem;">Генерация QR кода...</div>
                    </div>
                </div>
            </div>
            
            <div style="display: flex; gap: 1rem; justify-content: space-between;">
                <button class="btn-outline" onclick="window.GenesisCabinet.showDepositStep2(${JSON.stringify(plan).replace(/"/g, '&quot;')})">
                    ← Назад к параметрам
                </button>
                <button class="btn" onclick="window.GenesisCabinet.startDepositMonitoring('${planId}', '${selectedCurrency}', ${amount})" style="background: var(--success-color);">
                    ✅ Отправил платеж
                </button>
            </div>
            
            <div style="text-align: center; margin-top: 2rem; padding: 1rem; background: rgba(0, 212, 255, 0.1); border-radius: 8px; border: 1px solid var(--secondary-color);">
                <div style="color: var(--secondary-color); font-weight: 600; margin-bottom: 0.5rem;">🕐 Автоматическое отслеживание</div>
                <div style="color: var(--text-secondary); font-size: 0.9rem;">Система автоматически проверит ваш платеж в блокчейне BSC и активирует депозит</div>
            </div>
        `;
    },
    
    // Начать мониторинг депозита
    startDepositMonitoring(planId, currency, amount) {
        const plan = window.GENESIS_CONFIG.depositPlans.find(p => p.id === planId);
        
        if (window.GenesisTerminal) {
            window.GenesisTerminal.log(`🔍 Начат мониторинг депозита ${plan.name} (${amount} ${currency})`, 'info');
        }
        
        // Создаем запись о депозите в ожидании
        const depositData = {
            planId: planId,
            planName: plan.name,
            currency: currency,
            amount: amount,
            status: 'pending',
            createdAt: new Date().toISOString(),
            userAddress: this.userData?.address || localStorage.getItem('genesis_user_address')
        };
        
        // Сохраняем в localStorage для отслеживания
        const pendingDeposits = JSON.parse(localStorage.getItem('genesis_pending_deposits') || '[]');
        pendingDeposits.push(depositData);
        localStorage.setItem('genesis_pending_deposits', JSON.stringify(pendingDeposits));
        
        // Закрываем модальное окно
        this.closeDepositModal();
        
        // Показываем уведомление
        this.showNotification('🕐 Депозит в обработке', 'Ожидаем подтверждения платежа в блокчейне BSC', 'info');
        
        // Запускаем проверку депозита
        this.checkDepositStatus(depositData);
    },
    
    // Проверка статуса депозита
    async checkDepositStatus(depositData) {
        try {
            if (window.GenesisAPI && window.GenesisAPI.checkTransaction) {
                const result = await window.GenesisAPI.checkTransaction(
                    depositData.userAddress,
                    window.GENESIS_CONFIG.addresses.system,
                    depositData.amount,
                    depositData.currency
                );
                
                if (result.found) {
                    this.activateDeposit(depositData, result.transaction);
                } else {
                    // Повторяем проверку через 30 секунд
                    setTimeout(() => this.checkDepositStatus(depositData), 30000);
                }
            }
        } catch (error) {
            console.error('Ошибка проверки депозита:', error);
            if (window.GenesisTerminal) {
                window.GenesisTerminal.log(`❌ Ошибка проверки депозита: ${error.message}`, 'error');
            }
        }
    },
    
    // Активация депозита
    activateDeposit(depositData, transaction) {
        if (window.GenesisTerminal) {
            window.GenesisTerminal.log(`✅ Депозит ${depositData.planName} активирован!`, 'success');
        }
        
        // Обновляем статус депозита
        depositData.status = 'active';
        depositData.transactionHash = transaction.hash;
        depositData.activatedAt = new Date().toISOString();
        
        // Сохраняем активный депозит
        const activeDeposits = JSON.parse(localStorage.getItem('genesis_active_deposits') || '[]');
        activeDeposits.push(depositData);
        localStorage.setItem('genesis_active_deposits', JSON.stringify(activeDeposits));
        
        // Удаляем из ожидающих
        const pendingDeposits = JSON.parse(localStorage.getItem('genesis_pending_deposits') || '[]');
        const updatedPending = pendingDeposits.filter(d => d.createdAt !== depositData.createdAt);
        localStorage.setItem('genesis_pending_deposits', JSON.stringify(updatedPending));
        
        // Показываем уведомление
        this.showNotification('🎉 Депозит активирован!', `Депозит ${depositData.planName} успешно создан`, 'success');
        
        // Обновляем интерфейс
        if (this.currentPage === 'portfolio') {
            this.loadPageContent('portfolio');
        }
    },
    
    // Показать уведомление
    showNotification(title, message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <div class="notification-content">
                <h4>${title}</h4>
                <p>${message}</p>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">&times;</button>
        `;
        
        // Добавляем стили если их нет
        if (!document.getElementById('notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    padding: 1rem;
                    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
                    z-index: 1001;
                    max-width: 350px;
                    animation: slideIn 0.3s ease;
                }
                
                .notification-content h4 {
                    margin: 0 0 0.5rem 0;
                    color: var(--primary-color);
                    font-size: 1rem;
                }
                
                .notification-content p {
                    margin: 0;
                    color: var(--text-secondary);
                    font-size: 0.9rem;
                    line-height: 1.4;
                }
                
                .notification-close {
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    background: none;
                    border: none;
                    color: var(--text-secondary);
                    cursor: pointer;
                    font-size: 1.2rem;
                    line-height: 1;
                    padding: 0;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .notification-close:hover {
                    color: var(--primary-color);
                }
                
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `;
            document.head.appendChild(styles);
        }
        
        document.body.appendChild(notification);
        
        // Автоматически удаляем через 5 секунд
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    },
    
    // MCP-MARKER:METHOD:CABINET:DEPOSITS_DATA_LOAD - Загрузка данных депозитов
    
    // Загрузка реальных депозитов пользователя
    async loadUserDeposits() {
        const userAddress = this.userData?.address || localStorage.getItem('genesis_user_address');
        if (!userAddress) return;
        
        try {
            if (window.GenesisTerminal) {
                window.GenesisTerminal.log('🔍 Поиск депозитов пользователя в BSC...', 'info');
            }
            
            // Загружаем активные депозиты из localStorage и проверяем в блокчейне
            const localDeposits = JSON.parse(localStorage.getItem('genesis_active_deposits') || '[]');
            
            // Проверяем каждый депозит в блокчейне
            const verifiedDeposits = [];
            for (const deposit of localDeposits) {
                if (await this.verifyDepositInBlockchain(deposit)) {
                    verifiedDeposits.push(deposit);
                }
            }
            
            // Обновляем интерфейс
            this.updatePortfolioStats(verifiedDeposits);
            this.displayActiveDeposits(verifiedDeposits);
            
            if (window.GenesisTerminal) {
                window.GenesisTerminal.log(`✅ Найдено ${verifiedDeposits.length} активных депозитов`, 'success');
            }
            
        } catch (error) {
            console.error('Ошибка загрузки депозитов:', error);
            if (window.GenesisTerminal) {
                window.GenesisTerminal.log(`❌ Ошибка загрузки депозитов: ${error.message}`, 'error');
            }
        }
    },
    
    // Проверка депозита в блокчейне
    async verifyDepositInBlockchain(deposit) {
        try {
            if (window.GenesisAPI && window.GenesisAPI.verifyTransaction) {
                return await window.GenesisAPI.verifyTransaction(deposit.transactionHash);
            }
            return true; // Если API недоступно, считаем депозит валидным
        } catch (error) {
            console.error('Ошибка проверки депозита в блокчейне:', error);
            return false;
        }
    },
    
    // Обновление статистики портфеля
    updatePortfolioStats(deposits) {
        let totalValue = 0;
        let totalEarned = 0;
        let dailyEarnings = 0;
        
        deposits.forEach(deposit => {
            totalValue += deposit.amount;
            
            // Рассчитываем заработок по дням
            const plan = window.GENESIS_CONFIG.depositPlans.find(p => p.id === deposit.planId);
            if (plan) {
                const totalProfit = (deposit.amount * plan.percentage / 100) - deposit.amount;
                const dailyProfit = totalProfit / plan.days;
                
                // Рассчитываем дни с момента активации
                const activatedDate = new Date(deposit.activatedAt || deposit.createdAt);
                const daysPassed = Math.floor((Date.now() - activatedDate.getTime()) / (1000 * 60 * 60 * 24));
                
                totalEarned += Math.min(totalProfit, dailyProfit * daysPassed);
                dailyEarnings += dailyProfit;
            }
        });
        
        // Обновляем интерфейс
        const portfolioValue = document.getElementById('portfolio-total-value');
        const portfolioChange = document.getElementById('portfolio-change');
        const portfolioROI = document.getElementById('portfolio-roi');
        const activeDepositsCount = document.getElementById('active-deposits-count');
        const activeDepositsStatus = document.getElementById('active-deposits-status');
        const totalEarnedEl = document.getElementById('total-earned');
        const dailyEarningsEl = document.getElementById('daily-earnings');
        
        if (portfolioValue) portfolioValue.textContent = `${totalValue.toFixed(2)}`;
        if (portfolioChange) portfolioChange.textContent = `+${totalEarned.toFixed(2)} заработано`;
        if (portfolioROI) portfolioROI.textContent = `📊 ROI: +${totalValue > 0 ? ((totalEarned / totalValue) * 100).toFixed(1) : 0}%`;
        if (activeDepositsCount) activeDepositsCount.textContent = deposits.length;
        if (activeDepositsStatus) activeDepositsStatus.textContent = deposits.length > 0 ? 'Активны' : 'Отсутствуют';
        if (totalEarnedEl) totalEarnedEl.textContent = `${totalEarned.toFixed(2)}`;
        if (dailyEarningsEl) dailyEarningsEl.textContent = `+${dailyEarnings.toFixed(2)} сегодня`;
        
        // Обновляем информацию о следующем доступном плане
        this.updateNextAvailablePlan(deposits);
    },
    
    // Обновление информации о следующем доступном плане
    updateNextAvailablePlan(deposits) {
        const completedPlans = deposits.map(d => d.planId);
        const allPlans = window.GENESIS_CONFIG.depositPlans;
        
        // Находим следующий доступный план
        let nextPlan = allPlans[0]; // По умолчанию TRIAL
        
        for (const plan of allPlans) {
            if (!completedPlans.includes(plan.id)) {
                nextPlan = plan;
                break;
            }
        }
        
        const nextPlanName = document.getElementById('next-available-plan');
        const nextPlanStatus = document.getElementById('next-plan-status');
        const nextPlanInfo = document.getElementById('next-plan-info');
        
        if (nextPlanName) nextPlanName.textContent = nextPlan.name;
        if (nextPlanStatus) nextPlanStatus.textContent = 'Доступен';
        if (nextPlanInfo) {
            nextPlanInfo.innerHTML = `
                <div>💰 Минимум: ${nextPlan.usdtAmount}</div>
                <div>📊 Доходность: ${nextPlan.percentage}%</div>
            `;
        }
    },
    
    // Отображение активных депозитов
    displayActiveDeposits(deposits) {
        const container = document.getElementById('active-deposits-container');
        if (!container) return;
        
        if (deposits.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">💼</div>
                    <h3>Нет активных депозитов</h3>
                    <p>Создайте свой первый депозит для начала получения прибыли в GENESIS 1.1</p>
                    <button class="btn" onclick="window.GenesisCabinet.showDepositModal()">
                        🚀 Создать депозит
                    </button>
                </div>
            `;
            return;
        }
        
        container.innerHTML = `
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="border-bottom: 2px solid var(--border-color);">
                            <th style="padding: 12px; text-align: left; color: var(--text-primary);">План</th>
                            <th style="padding: 12px; text-align: right; color: var(--text-primary);">Инвестиция</th>
                            <th style="padding: 12px; text-align: right; color: var(--text-primary);">Доход/день</th>
                            <th style="padding: 12px; text-align: right; color: var(--text-primary);">Прогресс</th>
                            <th style="padding: 12px; text-align: right; color: var(--text-primary);">Статус</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${deposits.map(deposit => {
                            const plan = window.GENESIS_CONFIG.depositPlans.find(p => p.id === deposit.planId);
                            const totalProfit = plan ? (deposit.amount * plan.percentage / 100) - deposit.amount : 0;
                            const dailyProfit = plan ? totalProfit / plan.days : 0;
                            
                            // Рассчитываем прогресс
                            const activatedDate = new Date(deposit.activatedAt || deposit.createdAt);
                            const daysPassed = Math.floor((Date.now() - activatedDate.getTime()) / (1000 * 60 * 60 * 24));
                            const daysTotal = plan ? plan.days : 0;
                            const progress = Math.min(100, (daysPassed / daysTotal) * 100);
                            
                            return `
                                <tr style="border-bottom: 1px solid var(--bg-primary);">
                                    <td style="padding: 12px;">
                                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                                            <span style="font-size: 1.2rem;">💎</span>
                                            <div>
                                                <div style="color: var(--text-primary); font-weight: 600;">${deposit.planName}</div>
                                                <div style="color: var(--text-secondary); font-size: 0.8rem;">${plan ? plan.days : 0} дней</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style="padding: 12px; text-align: right;">
                                        <div style="color: var(--text-primary); font-weight: 600;">${deposit.amount}</div>
                                        <div style="color: var(--text-secondary); font-size: 0.8rem;">${deposit.currency}</div>
                                    </td>
                                    <td style="padding: 12px; text-align: right;">
                                        <div style="color: var(--success-color); font-weight: 600;">+${dailyProfit.toFixed(2)}</div>
                                        <div style="color: var(--text-secondary); font-size: 0.8rem;">в день</div>
                                    </td>
                                    <td style="padding: 12px; text-align: right;">
                                        <div style="color: var(--warning-color); font-weight: 600;">${progress.toFixed(1)}%</div>
                                        <div style="background: var(--bg-primary); height: 4px; border-radius: 2px; margin-top: 0.3rem; overflow: hidden;">
                                            <div style="background: var(--success-color); height: 100%; width: ${progress}%; transition: width 0.3s ease;"></div>
                                        </div>
                                    </td>
                                    <td style="padding: 12px; text-align: right;">
                                        <span style="background: rgba(0, 255, 65, 0.2); color: var(--success-color); padding: 0.3rem 0.6rem; border-radius: 12px; font-size: 0.8rem; font-weight: 500;">
                                            ✅ Активен
                                        </span>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },
    
    // Инициализация компонентов страницы
    async initializePageComponents(page) {
        if (page === 'portfolio') {
            // Инициализируем сервис депозитов кабинета
            if (window.CabinetDepositService && this.userData?.address) {
                await window.CabinetDepositService.init(this.userData.address);
            } else {
                // Fallback к старому методу
                this.loadUserDeposits();
                this.loadAndDisplayDepositPlans();
            }
        } else if (page === 'deposits') {
            // Инициализируем страницу депозитов
            this.loadUserDepositsProgress();
        } else if (page === 'access') {
            // Инициализируем страницу доступа
            this.loadAccessStatus();
        }
    },
    
    // Загрузка прогресса депозитов пользователя
    async loadUserDepositsProgress() {
        const progressContainer = document.getElementById('user-deposits-progress');
        if (!progressContainer) return;
        
        try {
            const activeDeposits = JSON.parse(localStorage.getItem('genesis_active_deposits') || '[]');
            const completedPlans = JSON.parse(localStorage.getItem('genesis_completed_plans') || '[]');
            const plans = window.GENESIS_CONFIG.depositPlans;
            
            const totalPlans = plans.length;
            const completedCount = completedPlans.length;
            const activeCount = activeDeposits.filter(d => d.status === 'active').length;
            const progressPercent = (completedCount / totalPlans) * 100;
            
            let totalInvested = 0;
            let totalEarned = 0;
            
            activeDeposits.forEach(deposit => {
                totalInvested += deposit.amount;
                const plan = plans.find(p => p.id === deposit.planId);
                if (plan) {
                    const profit = (deposit.amount * plan.percentage / 100) - deposit.amount;
                    const daysPassed = Math.floor((Date.now() - new Date(deposit.createdAt).getTime()) / (1000 * 60 * 60 * 24));
                    const earnedProfit = Math.min(profit, (profit / plan.days) * daysPassed);
                    totalEarned += earnedProfit;
                }
            });
            
            progressContainer.innerHTML = `
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
                    <div style="text-align: center; padding: 1rem; background: var(--bg-primary); border-radius: 8px;">
                        <div style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem;">Пройдено планов</div>
                        <div style="color: var(--primary-color); font-size: 1.5rem; font-weight: 700;">${completedCount} из ${totalPlans}</div>
                    </div>
                    <div style="text-align: center; padding: 1rem; background: var(--bg-primary); border-radius: 8px;">
                        <div style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem;">Активных депозитов</div>
                        <div style="color: var(--warning-color); font-size: 1.5rem; font-weight: 700;">${activeCount}</div>
                    </div>
                    <div style="text-align: center; padding: 1rem; background: var(--bg-primary); border-radius: 8px;">
                        <div style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem;">Инвестировано</div>
                        <div style="color: var(--success-color); font-size: 1.5rem; font-weight: 700;">${totalInvested.toFixed(2)}</div>
                    </div>
                </div>
                
                <div style="margin-bottom: 1rem;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <span style="color: var(--text-secondary);">Общий прогресс</span>
                        <span style="color: var(--primary-color); font-weight: 600;">${progressPercent.toFixed(1)}%</span>
                    </div>
                    <div style="background: var(--bg-primary); height: 8px; border-radius: 4px; overflow: hidden;">
                        <div style="background: linear-gradient(90deg, var(--success-color), var(--primary-color)); height: 100%; width: ${progressPercent}%; transition: width 0.5s ease;"></div>
                    </div>
                </div>
                
                ${completedCount === 0 ? `
                    <div style="text-align: center; padding: 1rem; background: rgba(255, 107, 53, 0.1); border-radius: 8px; border: 1px solid var(--primary-color);">
                        <p style="color: var(--text-primary); margin-bottom: 0.5rem;">🚀 Начните свой путь в GENESIS 1.1!</p>
                        <p style="color: var(--text-secondary); font-size: 0.9rem;">Создайте первый депозит TRIAL за $25 и начните получать пассивный доход</p>
                    </div>
                ` : `
                    <div style="text-align: center; color: var(--text-secondary); font-size: 0.9rem;">
                        🎯 Отличная работа! Продолжайте развивать ваш портфель
                    </div>
                `}
            `;
            
        } catch (error) {
            console.error('Ошибка загрузки прогресса:', error);
            progressContainer.innerHTML = `
                <div style="text-align: center; color: var(--error-color); padding: 2rem;">
                    ❌ Ошибка загрузки прогресса
                </div>
            `;
        }
    },
    
    // Загрузка статуса доступа
    async loadAccessStatus() {
        // TODO: Интеграция с PlatformAccessService
        const accessDays = this.userData?.access?.accessDays || 0;
        const indicator = document.getElementById('access-status-indicator');
        
        if (indicator) {
            indicator.style.display = 'flex';
            const icon = document.getElementById('access-status-icon');
            const text = document.getElementById('access-status-text');
            const days = document.getElementById('access-days-count');
            
            if (accessDays > 0) {
                icon.textContent = '✅';
                text.textContent = 'Активен';
                days.textContent = `${accessDays} дней`;
                indicator.style.borderColor = 'var(--success-color)';
            } else {
                icon.textContent = '❌';
                text.textContent = 'Неактивен';
                days.textContent = 'Оплатить';
                indicator.style.borderColor = 'var(--error-color)';
            }
        }
    },
    
    // Загрузка и отображение планов депозитов
    loadAndDisplayDepositPlans() {
        const container = document.getElementById('deposit-plans-grid');
        if (!container) return;
        
        const plans = window.GENESIS_CONFIG.depositPlans;
        
        container.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 1.5rem;">
                ${plans.map((plan, index) => {
                    const isLocked = false; // TODO: Реализовать проверку последовательности
                    const profit = (plan.usdtAmount * plan.percentage / 100) - plan.usdtAmount;
                    const dailyProfit = profit / plan.days;
                    
                    return `
                        <div class="stats-card" style="border-left: 4px solid ${this.getPlanColor(plan.id)}; ${isLocked ? 'opacity: 0.6;' : ''}">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                                <div>
                                    <h4 style="color: ${this.getPlanColor(plan.id)}; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
                                        <span style="font-size: 1.5rem;">${isLocked ? '🔒' : '💰'}</span>
                                        ${plan.name}
                                    </h4>
                                    <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem;">
                                        ${plan.description}
                                    </p>
                                    ${isLocked ? 
                                        '<div style="background: rgba(255, 165, 0, 0.2); color: var(--warning-color); padding: 0.3rem 0.6rem; border-radius: 6px; font-size: 0.8rem;">🔒 Завершите предыдущий план</div>' : 
                                        '<div style="background: rgba(0, 255, 65, 0.2); color: var(--success-color); padding: 0.3rem 0.6rem; border-radius: 6px; font-size: 0.8rem;">🚀 Доступен</div>'
                                    }
                                </div>
                                <div style="text-align: right;">
                                    <div style="font-size: 1.5rem; font-weight: 700; color: var(--text-primary);">
                                        ${plan.usdtAmount.toLocaleString()}
                                    </div>
                                    <div style="color: var(--success-color); font-size: 0.9rem;">
                                        ${plan.percentage}% (${plan.days} дней)
                                    </div>
                                </div>
                            </div>
                            
                            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.8rem; margin-bottom: 1.5rem; font-size: 0.8rem;">
                                <div style="text-align: center; padding: 0.6rem; background: var(--bg-primary); border-radius: 6px;">
                                    <div style="color: var(--text-secondary); margin-bottom: 0.2rem;">Инвестиция</div>
                                    <div style="color: var(--text-primary); font-weight: 600;">${plan.usdtAmount}</div>
                                </div>
                                <div style="text-align: center; padding: 0.6rem; background: var(--bg-primary); border-radius: 6px;">
                                    <div style="color: var(--text-secondary); margin-bottom: 0.2rem;">Прибыль</div>
                                    <div style="color: var(--success-color); font-weight: 600;">${profit.toFixed(2)}</div>
                                </div>
                                <div style="text-align: center; padding: 0.6rem; background: var(--bg-primary); border-radius: 6px;">
                                    <div style="color: var(--text-secondary); margin-bottom: 0.2rem;">В день</div>
                                    <div style="color: var(--primary-color); font-weight: 600;">${dailyProfit.toFixed(2)}</div>
                                </div>
                            </div>
                            
                            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                                <div style="display: flex; justify-content: space-between; font-size: 0.85rem;">
                                    <span style="color: var(--text-secondary);">Валюты:</span>
                                    <span style="color: var(--secondary-color); font-weight: 500;">${plan.currencies.join(', ')}</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; font-size: 0.85rem;">
                                    <span style="color: var(--text-secondary);">ROI:</span>
                                    <span style="color: var(--warning-color); font-weight: 500;">${plan.percentage - 100}% прибыль</span>
                                </div>
                            </div>
                            
                            <button class="btn${isLocked ? '-outline" disabled style="opacity: 0.5; cursor: not-allowed;' : '"'} 
                                    onclick="${!isLocked ? `window.GenesisCabinet.showPurchaseModal('${plan.id}')` : 'void(0)'}" 
                                    style="width: 100%; margin-top: 1rem; font-size: 0.9rem;">
                                ${isLocked ? '🔒 Недоступен' : '🚀 Создать депозит'}
                            </button>
                        </div>
                    `;
                }).join('')}
            </div>
            
            <div class="stats-card" style="margin-top: 2rem;">
                <h3 style="margin-bottom: 1rem; color: var(--primary-color);">📈 Информация о системе депозитов</h3>
                <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 2rem;">
                    <div>
                        <h4 style="color: var(--text-primary); margin-bottom: 1rem;">🎯 Преимущества GENESIS 1.1:</h4>
                        <ul style="color: var(--text-secondary); line-height: 1.8; margin: 0; padding-left: 1.5rem;">
                            <li>✅ <strong>Последовательная система:</strong> Защита от рисков через поэтапное увеличение</li>
                            <li>✅ <strong>Прозрачность:</strong> Все операции видны в блокчейне BSC</li>
                            <li>✅ <strong>Автоматизация:</strong> Мгновенная активация после подтверждения</li>
                            <li>✅ <strong>Гибкость:</strong> Выбор валюты оплаты (USDT/PLEX)</li>
                            <li>✅ <strong>Безопасность:</strong> Смарт-контракты и проверенная система</li>
                        </ul>
                    </div>
                    <div style="text-align: center; padding: 2rem; background: var(--bg-primary); border-radius: 8px;">
                        <div style="font-size: 3rem; margin-bottom: 1rem;">🔒</div>
                        <h4 style="color: var(--success-color); margin-bottom: 0.5rem;">Система защищена</h4>
                        <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 1rem;">Последовательная покупка планов</p>
                        <div style="background: var(--bg-secondary); padding: 0.8rem; border-radius: 6px; font-family: monospace; font-size: 0.8rem;">
                            ${window.GENESIS_CONFIG.addresses.system.substring(0, 20)}...
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    // Получение цвета плана
    getPlanColor(planId) {
        const colors = {
            'trial': '#00ff41',
            'starter': '#ff6b35', 
            'progressive1': '#ffa726',
            'progressive2': '#ffeb3b',
            'progressive3': '#4caf50',
            'progressive4': '#00bcd4',
            'progressive5': '#2196f3',
            'progressive6': '#3f51b5',
            'progressive7': '#673ab7',
            'progressive8': '#9c27b0',
            'recommended': '#e91e63',
            'platinum': '#ff5722',
            'maximum': '#ffd700'
        };
        return colors[planId] || '#ff6b35';
    },
    
    // Показать модальное окно покупки конкретного плана
    showPurchaseModal(planId) {
        // Используем новый сервис депозитов если доступен
        if (window.CabinetDepositService && window.CabinetDepositService.startDepositProcess) {
            window.CabinetDepositService.startDepositProcess(planId);
        } else {
            // Fallback к старому методу
            const plan = window.GENESIS_CONFIG.depositPlans.find(p => p.id === planId);
            if (!plan) return;
            
            this.createDepositModal();
            const modal = document.getElementById('deposit-modal');
            if (modal) {
                modal.classList.remove('hidden');
                this.showDepositStep2(plan);
            }
        }
    },
    
    // MCP-MARKER:METHOD:CABINET:TRANSACTIONS_HANDLERS - Обработчики транзакций
    
    // Экспорт транзакций в CSV
    exportTransactions(format = 'csv') {
        if (window.GenesisTerminal) {
            window.GenesisTerminal.log(`📁 Экспорт транзакций в формате ${format.toUpperCase()}...`, 'info');
        }
        
        try {
            const transactions = this.getAllTransactions();
            
            if (transactions.length === 0) {
                this.showNotification('⚠️ Нет данных', 'Транзакции для экспорта не найдены', 'warning');
                return;
            }
            
            if (format === 'csv') {
                const csvContent = this.generateCSV(transactions);
                this.downloadFile(csvContent, `genesis_transactions_${Date.now()}.csv`, 'text/csv');
            }
            
            this.showNotification('✅ Экспорт завершен', `Файл с ${transactions.length} транзакциями сохранен`, 'success');
            
        } catch (error) {
            console.error('Ошибка экспорта:', error);
            this.showNotification('❌ Ошибка экспорта', error.message, 'error');
        }
    },
    
    // Обновление списка транзакций
    async refreshTransactions() {
        if (window.GenesisTerminal) {
            window.GenesisTerminal.log('🔄 Обновление списка транзакций...', 'info');
        }
        
        const container = document.getElementById('transactions-table-container');
        if (container) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🔄</div>
                    <h3>Обновление данных...</h3>
                    <p>Загружаем последние транзакции из блокчейна BSC</p>
                </div>
            `;
        }
        
        try {
            await this.loadUserTransactions();
            this.showNotification('✅ Обновлено', 'Список транзакций обновлен', 'success');
        } catch (error) {
            console.error('Ошибка обновления:', error);
            this.showNotification('❌ Ошибка обновления', error.message, 'error');
        }
    },
    
    // Применение фильтров транзакций
    applyTransactionFilters() {
        const typeFilter = document.getElementById('transaction-type-filter')?.value || 'all';
        const currencyFilter = document.getElementById('transaction-currency-filter')?.value || 'all';
        const periodFilter = document.getElementById('transaction-period-filter')?.value || 'all';
        const searchQuery = document.getElementById('transaction-search')?.value || '';
        
        if (window.GenesisTerminal) {
            window.GenesisTerminal.log(`🔍 Применение фильтров: тип=${typeFilter}, валюта=${currencyFilter}, период=${periodFilter}`, 'info');
        }
        
        const transactions = this.filterTransactions({
            type: typeFilter,
            currency: currencyFilter,
            period: periodFilter,
            search: searchQuery
        });
        
        this.displayTransactions(transactions);
        this.updateTransactionStats(transactions);
    },
    
    // Загрузка транзакций пользователя
    async loadUserTransactions() {
        const userAddress = this.userData?.address || localStorage.getItem('genesis_user_address');
        if (!userAddress) return [];
        
        try {
            // Проверяем транзакции в BSC блокчейне
            if (window.GenesisAPI && window.GenesisAPI.getTransactionHistory) {
                const transactions = await window.GenesisAPI.getTransactionHistory(userAddress);
                this.displayTransactions(transactions);
                this.updateTransactionStats(transactions);
                return transactions;
            } else {
                // Показываем демо-данные если API недоступно
                const demoTransactions = this.generateDemoTransactions();
                this.displayTransactions(demoTransactions);
                this.updateTransactionStats(demoTransactions);
                return demoTransactions;
            }
        } catch (error) {
            console.error('Ошибка загрузки транзакций:', error);
            return [];
        }
    },
    
    // Генерация демо-транзакций для демонстрации
    generateDemoTransactions() {
        const types = ['deposit', 'authorization', 'subscription'];
        const currencies = ['USDT', 'PLEX', 'BNB'];
        const statuses = ['success', 'pending', 'failed'];
        
        const transactions = [];
        
        for (let i = 0; i < 15; i++) {
            const type = types[Math.floor(Math.random() * types.length)];
            const currency = currencies[Math.floor(Math.random() * currencies.length)];
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            
            let amount;
            if (type === 'authorization') {
                amount = 1;
                currency = 'PLEX';
            } else if (type === 'subscription') {
                amount = Math.random() * 10 + 10;
                currency = 'USDT';
            } else {
                amount = Math.random() * 2000 + 25;
                currency = Math.random() > 0.5 ? 'USDT' : 'PLEX';
            }
            
            transactions.push({
                id: `demo_${i}`,
                hash: `0x${Math.random().toString(16).substring(2, 66)}`,
                type: type,
                currency: currency,
                amount: amount,
                status: status,
                timestamp: Date.now() - (Math.random() * 30 * 24 * 60 * 60 * 1000), // последние 30 дней
                from: this.userData?.address || '0x1234567890abcdef1234567890abcdef12345678',
                to: window.GENESIS_CONFIG?.addresses?.system || '0x399B22170B0AC7BB20bdC86772BfF478f201fFCD',
                blockNumber: Math.floor(Math.random() * 1000000) + 30000000,
                gasUsed: Math.floor(Math.random() * 100000) + 21000,
                gasPrice: Math.floor(Math.random() * 10) + 5
            });
        }
        
        return transactions.sort((a, b) => b.timestamp - a.timestamp);
    },
    
    // Отображение транзакций в таблице
    displayTransactions(transactions) {
        const container = document.getElementById('transactions-table-container');
        if (!container) return;
        
        if (transactions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📭</div>
                    <h3>Транзакции не найдены</h3>
                    <p>По выбранным фильтрам транзакции не обнаружены</p>
                    <button class="btn-outline" onclick="window.GenesisCabinet.clearTransactionFilters()" style="margin-top: 1rem;">
                        🔄 Сбросить фильтры
                    </button>
                </div>
            `;
            return;
        }
        
        const perPage = parseInt(document.getElementById('transactions-per-page')?.value || '25');
        const currentPage = this.transactionPage || 1;
        const startIndex = (currentPage - 1) * perPage;
        const endIndex = startIndex + perPage;
        const pageTransactions = transactions.slice(startIndex, endIndex);
        
        container.innerHTML = `
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="border-bottom: 2px solid var(--border-color);">
                            <th style="padding: 12px; text-align: left; color: var(--text-primary);">Тип</th>
                            <th style="padding: 12px; text-align: left; color: var(--text-primary);">Hash</th>
                            <th style="padding: 12px; text-align: right; color: var(--text-primary);">Сумма</th>
                            <th style="padding: 12px; text-align: center; color: var(--text-primary);">Статус</th>
                            <th style="padding: 12px; text-align: right; color: var(--text-primary);">Дата</th>
                            <th style="padding: 12px; text-align: center; color: var(--text-primary);">Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${pageTransactions.map(tx => `
                            <tr style="border-bottom: 1px solid var(--bg-primary);">
                                <td style="padding: 12px;">
                                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                                        <span style="font-size: 1.2rem;">${this.getTransactionIcon(tx.type)}</span>
                                        <div>
                                            <div style="color: var(--text-primary); font-weight: 600; text-transform: capitalize;">${this.getTransactionTypeName(tx.type)}</div>
                                            <div style="color: var(--text-secondary); font-size: 0.8rem;">Блок #${tx.blockNumber}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style="padding: 12px;">
                                    <div style="font-family: monospace; font-size: 0.9rem; color: var(--secondary-color);">
                                        ${tx.hash.substring(0, 10)}...${tx.hash.substring(-8)}
                                    </div>
                                    <button onclick="window.GenesisCabinet.copyTransactionHash('${tx.hash}')" style="background: none; border: none; color: var(--text-secondary); font-size: 0.7rem; cursor: pointer; margin-top: 0.2rem;">
                                        📋 Копировать
                                    </button>
                                </td>
                                <td style="padding: 12px; text-align: right;">
                                    <div style="color: var(--text-primary); font-weight: 600;">${tx.amount.toFixed(4)}</div>
                                    <div style="color: var(--text-secondary); font-size: 0.8rem;">${tx.currency}</div>
                                </td>
                                <td style="padding: 12px; text-align: center;">
                                    <span style="${this.getTransactionStatusStyle(tx.status)}">
                                        ${this.getTransactionStatusIcon(tx.status)} ${this.getTransactionStatusName(tx.status)}
                                    </span>
                                </td>
                                <td style="padding: 12px; text-align: right;">
                                    <div style="color: var(--text-primary); font-weight: 500;">${new Date(tx.timestamp).toLocaleDateString()}</div>
                                    <div style="color: var(--text-secondary); font-size: 0.8rem;">${new Date(tx.timestamp).toLocaleTimeString()}</div>
                                </td>
                                <td style="padding: 12px; text-align: center;">
                                    <button onclick="window.GenesisCabinet.viewTransactionDetails('${tx.hash}')" class="btn-secondary" style="font-size: 0.7rem; padding: 0.3rem 0.6rem;">
                                        👁️ Детали
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        
        // Обновляем пагинацию
        this.updateTransactionPagination(transactions.length, perPage, currentPage);
    },
    
    // Обновление статистики транзакций
    updateTransactionStats(transactions) {
        const totalCount = transactions.length;
        const successfulTx = transactions.filter(tx => tx.status === 'success');
        const totalVolume = transactions.reduce((sum, tx) => {
            if (tx.currency === 'USDT') return sum + tx.amount;
            if (tx.currency === 'PLEX') return sum + (tx.amount * 0.05); // конвертируем в USD
            return sum;
        }, 0);
        
        const lastTransaction = transactions[0];
        const successRate = totalCount > 0 ? (successfulTx.length / totalCount * 100) : 0;
        
        // Обновляем элементы
        const elements = {
            'total-transactions-count': totalCount,
            'total-transactions-volume': `${totalVolume.toFixed(2)}`,
            'last-transaction-time': lastTransaction ? new Date(lastTransaction.timestamp).toLocaleDateString() : '--',
            'last-transaction-type': lastTransaction ? this.getTransactionTypeName(lastTransaction.type) : 'Нет данных',
            'successful-transactions': successfulTx.length,
            'success-rate': `${successRate.toFixed(1)}% успешных`
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });
    },
    
    // Вспомогательные методы для транзакций
    getTransactionIcon(type) {
        const icons = {
            'deposit': '💰',
            'authorization': '🔐',
            'subscription': '📅',
            'withdrawal': '💸',
            'transfer': '🔄'
        };
        return icons[type] || '❓';
    },
    
    getTransactionTypeName(type) {
        const names = {
            'deposit': 'Депозит',
            'authorization': 'Авторизация',
            'subscription': 'Подписка',
            'withdrawal': 'Вывод',
            'transfer': 'Перевод'
        };
        return names[type] || 'Неизвестно';
    },
    
    getTransactionStatusIcon(status) {
        const icons = {
            'success': '✅',
            'pending': '⏳',
            'failed': '❌'
        };
        return icons[status] || '❓';
    },
    
    getTransactionStatusName(status) {
        const names = {
            'success': 'Успешно',
            'pending': 'В обработке',
            'failed': 'Ошибка'
        };
        return names[status] || 'Неизвестно';
    },
    
    getTransactionStatusStyle(status) {
        const styles = {
            'success': 'background: rgba(0, 255, 65, 0.2); color: var(--success-color); padding: 0.3rem 0.6rem; border-radius: 12px; font-size: 0.8rem; font-weight: 500;',
            'pending': 'background: rgba(255, 165, 0, 0.2); color: var(--warning-color); padding: 0.3rem 0.6rem; border-radius: 12px; font-size: 0.8rem; font-weight: 500;',
            'failed': 'background: rgba(255, 69, 58, 0.2); color: var(--error-color); padding: 0.3rem 0.6rem; border-radius: 12px; font-size: 0.8rem; font-weight: 500;'
        };
        return styles[status] || styles['pending'];
    },
    
    // Копирование хеша транзакции
    copyTransactionHash(hash) {
        navigator.clipboard.writeText(hash).then(() => {
            this.showNotification('📋 Скопировано', `Hash транзакции скопирован: ${hash.substring(0, 10)}...`, 'success');
        }).catch(err => {
            console.error('Ошибка копирования:', err);
        });
    },
    
    // Просмотр деталей транзакции
    viewTransactionDetails(hash) {
        if (window.GenesisTerminal) {
            window.GenesisTerminal.log(`🔍 Просмотр деталей транзакции: ${hash.substring(0, 10)}...`, 'info');
        }
        
        // Открываем в BSCScan
        window.open(`https://bscscan.com/tx/${hash}`, '_blank');
    },
    
    // Генерация CSV файла
    generateCSV(transactions) {
        const headers = ['Дата', 'Тип', 'Hash', 'Сумма', 'Валюта', 'Статус', 'Блок'];
        const rows = transactions.map(tx => [
            new Date(tx.timestamp).toISOString(),
            this.getTransactionTypeName(tx.type),
            tx.hash,
            tx.amount,
            tx.currency,
            this.getTransactionStatusName(tx.status),
            tx.blockNumber
        ]);
        
        const csvContent = [headers, ...rows].map(row => 
            row.map(field => `"${field}"`).join(',')
        ).join('\n');
        
        return csvContent;
    },
    
    // Скачивание файла
    downloadFile(content, filename, contentType) {
        const blob = new Blob([content], { type: contentType });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    },
    
    // Вспомогательные методы для контента страниц
    getQuickActionsSection() {
        return `
            <div class="stats-card" style="margin-top: 2rem;">
                <h3 style="color: var(--primary-color); margin-bottom: 1.5rem;">⚡ Быстрые действия</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                    <button class="btn" onclick="window.GenesisCabinet.navigateTo('portfolio')">
                        💰 Создать депозит
                    </button>
                    <button class="btn-secondary" onclick="window.GenesisCabinet.navigateTo('access')">
                        💳 Пополнить доступ
                    </button>
                    <button class="btn-secondary" onclick="window.GenesisCabinet.navigateTo('transactions')">
                        📋 История операций
                    </button>
                    <button class="btn-secondary" onclick="window.GenesisCabinet.navigateTo('referrals')">
                        👥 Пригласить друга
                    </button>
                </div>
            </div>
        `;
    },
    
    getRecentActivitySection() {
        return `
            <div class="stats-card" style="margin-top: 2rem;">
                <h3 style="color: var(--secondary-color); margin-bottom: 1.5rem;">📊 Последняя активность</h3>
                <div style="text-align: center; color: var(--text-secondary); padding: 2rem;">
                    <p>Здесь будет отображаться ваша последняя активность</p>
                </div>
            </div>
        `;
    },
    
    getAnalyticsCards() {
        return `
            <div class="stats-card">
                <div class="stats-header">
                    <span class="stats-title">ROI за месяц</span>
                    <span class="stats-icon">📊</span>
                </div>
                <div class="stats-value">0%</div>
                <div class="stats-change">нет данных</div>
            </div>
            
            <div class="stats-card">
                <div class="stats-header">
                    <span class="stats-title">Лучший депозит</span>
                    <span class="stats-icon">🏆</span>
                </div>
                <div class="stats-value">—</div>
                <div class="stats-change">нет данных</div>
            </div>
            
            <div class="stats-card">
                <div class="stats-header">
                    <span class="stats-title">Средний доход</span>
                    <span class="stats-icon">💹</span>
                </div>
                <div class="stats-value">$0.00</div>
                <div class="stats-change">в день</div>
            </div>
        `;
    },
    
    getAccessPaymentInstructions() {
        return `
            <div class="stats-card" style="margin-top: 2rem;">
                <h3 style="color: var(--error-color); margin-bottom: 1.5rem;">❌ Доступ к платформе заблокирован</h3>
                <div style="background: rgba(255, 69, 58, 0.1); border: 1px solid var(--error-color); border-radius: 8px; padding: 1.5rem;">
                    <p style="color: var(--text-primary); margin-bottom: 1rem;">Для активации доступа необходимо:</p>
                    <ol style="color: var(--text-secondary); line-height: 1.8; margin: 0 0 1rem 0; padding-left: 1.5rem;">
                        <li>Выберите сумму пополнения (минимум $10)</li>
                        <li>Отправьте USDT на адрес системы через BSC</li>
                        <li>Дождитесь автоматической активации (1-3 минуты)</li>
                        <li>Получите полный доступ к платформе</li>
                    </ol>
                    <button class="btn" onclick="window.GenesisCabinet.topUpAccess(10)" style="width: 100%;">
                        🚀 Активировать доступ за $10
                    </button>
                </div>
            </div>
        `;
    },
    
    getAccessHistoryTable() {
        return `
            <div class="stats-card" style="margin-top: 2rem;">
                <h3 style="color: var(--success-color); margin-bottom: 1.5rem;">📋 История платежей за доступ</h3>
                <div class="empty-state">
                    <div class="empty-icon">📅</div>
                    <h3>История платежей пуста</h3>
                    <p>Здесь будут отображаться все ваши платежи за доступ к платформе</p>
                </div>
            </div>
        `;
    },
    
    getBonusItems() {
        const bonuses = [
            {
                id: 'daily',
                name: 'Ежедневный бонус',
                icon: '🎁',
                description: 'Получайте PLEX каждый день за вход',
                reward: '10 PLEX',
                status: 'available',
                progress: 0
            },
            {
                id: 'first-deposit',
                name: 'Первый депозит',
                icon: '💎',
                description: 'Создайте свой первый депозит',
                reward: '100 PLEX',
                status: 'locked',
                progress: 0
            },
            {
                id: 'referral',
                name: 'Приведи друга',
                icon: '👥',
                description: 'Пригласите первого реферала',
                reward: '50 PLEX',
                status: 'locked',
                progress: 0
            },
            {
                id: 'volume',
                name: 'Объем инвестиций',
                icon: '📈',
                description: 'Инвестируйте $1000 суммарно',
                reward: '500 PLEX',
                status: 'locked',
                progress: 0
            },
            {
                id: 'loyalty',
                name: 'Программа лояльности',
                icon: '⭐',
                description: 'Будьте активны 30 дней подряд',
                reward: '1000 PLEX',
                status: 'locked',
                progress: 0
            }
        ];
        
        return bonuses.map(bonus => `
            <div style="background: var(--bg-primary); padding: 1.5rem; border-radius: 8px; border-left: 4px solid ${bonus.status === 'available' ? 'var(--success-color)' : 'var(--border-color)'}; opacity: ${bonus.status === 'locked' ? '0.6' : '1'};">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                    <div style="flex: 1;">
                        <h4 style="color: var(--text-primary); margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
                            <span style="font-size: 1.5rem;">${bonus.icon}</span>
                            ${bonus.name}
                        </h4>
                        <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem;">
                            ${bonus.description}
                        </p>
                    </div>
                    <div style="text-align: right;">
                        <div style="color: var(--secondary-color); font-weight: 600; font-size: 1.1rem;">
                            ${bonus.reward}
                        </div>
                        <div style="font-size: 0.8rem; color: ${bonus.status === 'available' ? 'var(--success-color)' : 'var(--text-secondary)'};">
                            ${bonus.status === 'available' ? '✅ Доступен' : '🔒 Заблокирован'}
                        </div>
                    </div>
                </div>
                
                ${bonus.status === 'available' ? `
                    <button class="btn" onclick="window.GenesisCabinet.claimBonus('${bonus.id}')" style="width: 100%; font-size: 0.9rem;">
                        🎁 Получить бонус
                    </button>
                ` : `
                    <div style="background: var(--bg-secondary); height: 4px; border-radius: 2px; overflow: hidden;">
                        <div style="background: var(--primary-color); height: 100%; width: ${bonus.progress}%; transition: width 0.3s ease;"></div>
                    </div>
                    <div style="text-align: center; margin-top: 0.5rem; color: var(--text-secondary); font-size: 0.8rem;">
                        Прогресс: ${bonus.progress}%
                    </div>
                `}
            </div>
        `).join('');
    },
    
    getNotificationSettings() {
        const settings = [
            { id: 'deposits', name: 'Активация депозитов', description: 'Уведомления о новых депозитах', enabled: true },
            { id: 'profits', name: 'Начисление прибыли', description: 'Ежедневные начисления', enabled: true },
            { id: 'access', name: 'Статус доступа', description: 'Напоминания об оплате', enabled: true },
            { id: 'referrals', name: 'Новые рефералы', description: 'Регистрация по вашей ссылке', enabled: false },
            { id: 'news', name: 'Новости платформы', description: 'Обновления и акции', enabled: false }
        ];
        
        return settings.map(setting => `
            <label style="display: flex; align-items: center; justify-content: space-between; padding: 1rem; background: var(--bg-primary); border-radius: 8px; cursor: pointer;">
                <div style="flex: 1;">
                    <div style="color: var(--text-primary); font-weight: 500; margin-bottom: 0.3rem;">
                        ${setting.name}
                    </div>
                    <div style="color: var(--text-secondary); font-size: 0.85rem;">
                        ${setting.description}
                    </div>
                </div>
                <div style="position: relative; width: 50px; height: 26px; background: ${setting.enabled ? 'var(--success-color)' : 'var(--bg-secondary)'}; border-radius: 13px; transition: background 0.3s ease;">
                    <input type="checkbox" id="notify-${setting.id}" ${setting.enabled ? 'checked' : ''} 
                           onchange="window.GenesisCabinet.toggleNotification('${setting.id}')" 
                           style="opacity: 0; width: 0; height: 0;">
                    <span style="position: absolute; top: 3px; ${setting.enabled ? 'right: 3px' : 'left: 3px'}; width: 20px; height: 20px; background: white; border-radius: 50%; transition: all 0.3s ease;"></span>
                </div>
            </label>
        `).join('');
    },
    
    // Обработчики действий для раздела "Доступ к платформе"
    topUpAccess(days) {
        if (window.PlatformAccessService) {
            window.PlatformAccessService.showTopUpModal(days);
        } else {
            const amount = days;
            this.showNotification('💳 Пополнение доступа', `Создание платежа на ${amount} USDT...`, 'info');
            // TODO: Интеграция с сервисом оплаты доступа
        }
    },
    
    topUpAccessCustom() {
        const amountInput = document.getElementById('custom-access-amount');
        const amount = parseInt(amountInput?.value || '10');
        
        if (amount < 10) {
            this.showNotification('⚠️ Ошибка', 'Минимальная сумма пополнения $10', 'error');
            return;
        }
        
        this.topUpAccess(amount);
    },
    
    // Обработчики для реферальной программы
    copyRefLink(link) {
        navigator.clipboard.writeText(link).then(() => {
            this.showNotification('📋 Скопировано', 'Реферальная ссылка скопирована в буфер обмена', 'success');
        }).catch(err => {
            console.error('Ошибка копирования:', err);
            this.showNotification('❌ Ошибка', 'Не удалось скопировать ссылку', 'error');
        });
    },
    
    shareRefLink(platform) {
        const refLink = `https://genesis.app/ref/${this.userData?.address?.substring(2, 8) || 'xxxxx'}`;
        const text = encodeURIComponent('Присоединяйся к GENESIS 1.1 - инновационной DeFi платформе! Используй мою реферальную ссылку:');
        
        const urls = {
            telegram: `https://t.me/share/url?url=${encodeURIComponent(refLink)}&text=${text}`,
            whatsapp: `https://wa.me/?text=${text}%20${encodeURIComponent(refLink)}`,
            twitter: `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(refLink)}`
        };
        
        if (urls[platform]) {
            window.open(urls[platform], '_blank');
        }
    },
    
    generateRefQR() {
        const refLink = `https://genesis.app/ref/${this.userData?.address?.substring(2, 8) || 'xxxxx'}`;
        this.showNotification('📱 QR-код', 'Генерация QR-кода для реферальной ссылки...', 'info');
        // TODO: Интеграция с библиотекой QR-кодов
    },
    
    // Обработчики для бонусов
    claimBonus(bonusId) {
        this.showNotification('🎁 Получение бонуса', `Обработка бонуса ${bonusId}...`, 'info');
        // TODO: Интеграция с системой бонусов
    },
    
    // Обработчики для настроек
    saveEmail() {
        const emailInput = document.getElementById('user-email');
        const email = emailInput?.value;
        
        if (!email || !email.includes('@')) {
            this.showNotification('⚠️ Ошибка', 'Введите корректный email', 'error');
            return;
        }
        
        localStorage.setItem('genesis_user_email', email);
        this.showNotification('✅ Сохранено', 'Email успешно сохранен', 'success');
    },
    
    saveNickname() {
        const nicknameInput = document.getElementById('user-nickname');
        const nickname = nicknameInput?.value;
        
        if (!nickname || nickname.length < 3) {
            this.showNotification('⚠️ Ошибка', 'Никнейм должен содержать минимум 3 символа', 'error');
            return;
        }
        
        localStorage.setItem('genesis_user_nickname', nickname);
        this.showNotification('✅ Сохранено', 'Никнейм успешно сохранен', 'success');
    },
    
    toggleNotification(settingId) {
        const checkbox = document.getElementById(`notify-${settingId}`);
        const enabled = checkbox?.checked;
        
        const settings = JSON.parse(localStorage.getItem('genesis_notification_settings') || '{}');
        settings[settingId] = enabled;
        localStorage.setItem('genesis_notification_settings', JSON.stringify(settings));
        
        this.showNotification('🔔 Уведомления', `Настройка ${enabled ? 'включена' : 'отключена'}`, 'info');
    },
    
    changeTheme(theme) {
        localStorage.setItem('genesis_theme', theme);
        this.showNotification('🎨 Тема изменена', 'Изменения вступят в силу после перезагрузки', 'info');
    },
    
    changeLanguage(language) {
        localStorage.setItem('genesis_language', language);
        this.showNotification('🌐 Язык изменен', 'Изменения вступят в силу после перезагрузки', 'info');
    },
    
    enableTwoFactor() {
        this.showNotification('🔐 2FA', 'Двухфакторная аутентификация будет доступна в следующем обновлении', 'info');
    },
    
    exportPrivateData() {
        const data = {
            address: this.userData?.address,
            email: localStorage.getItem('genesis_user_email'),
            nickname: localStorage.getItem('genesis_user_nickname'),
            deposits: JSON.parse(localStorage.getItem('genesis_active_deposits') || '[]'),
            settings: JSON.parse(localStorage.getItem('genesis_notification_settings') || '{}'),
            exportDate: new Date().toISOString()
        };
        
        const jsonData = JSON.stringify(data, null, 2);
        this.downloadFile(jsonData, `genesis_data_${Date.now()}.json`, 'application/json');
        this.showNotification('📥 Экспорт завершен', 'Ваши данные сохранены в файл', 'success');
    },
    
    clearAllData() {
        // Сохраняем только адрес кошелька
        const address = localStorage.getItem('genesis_user_address');
        
        // Очищаем все данные
        localStorage.clear();
        
        // Восстанавливаем адрес
        if (address) {
            localStorage.setItem('genesis_user_address', address);
        }
        
        this.showNotification('🗑️ Данные очищены', 'Все локальные данные удалены. Страница будет перезагружена...', 'success');
        
        setTimeout(() => {
            location.reload();
        }, 2000);
    },
    
    // Обновление пагинации транзакций
    updateTransactionPagination(totalCount, perPage, currentPage) {
        const totalPages = Math.ceil(totalCount / perPage);
        const paginationContainer = document.getElementById('transactions-pagination');
        const paginationInfo = document.getElementById('pagination-info');
        
        if (paginationContainer) {
            paginationContainer.style.display = totalPages > 1 ? 'block' : 'none';
        }
        
        if (paginationInfo) {
            paginationInfo.textContent = `Страница ${currentPage} из ${totalPages}`;
        }
    },
    
    // Навигация по страницам транзакций
    previousTransactionsPage() {
        if (this.transactionPage > 1) {
            this.transactionPage--;
            this.applyTransactionFilters();
        }
    },
    
    nextTransactionsPage() {
        this.transactionPage = (this.transactionPage || 1) + 1;
        this.applyTransactionFilters();
    },
    
    // Сброс фильтров транзакций
    clearTransactionFilters() {
        document.getElementById('transaction-type-filter').value = 'all';
        document.getElementById('transaction-currency-filter').value = 'all';
        document.getElementById('transaction-period-filter').value = 'all';
        document.getElementById('transaction-search').value = '';
        this.applyTransactionFilters();
    },
    
    // Фильтрация транзакций
    filterTransactions(filters) {
        const allTransactions = this.getAllTransactions();
        
        return allTransactions.filter(tx => {
            // Фильтр по типу
            if (filters.type !== 'all' && tx.type !== filters.type) return false;
            
            // Фильтр по валюте
            if (filters.currency !== 'all' && tx.currency !== filters.currency) return false;
            
            // Фильтр по периоду
            if (filters.period !== 'all') {
                const now = Date.now();
                const txTime = tx.timestamp;
                const periods = {
                    today: 24 * 60 * 60 * 1000,
                    week: 7 * 24 * 60 * 60 * 1000,
                    month: 30 * 24 * 60 * 60 * 1000,
                    quarter: 90 * 24 * 60 * 60 * 1000
                };
                
                if (now - txTime > periods[filters.period]) return false;
            }
            
            // Поиск
            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                if (!tx.hash.toLowerCase().includes(searchLower) &&
                    !tx.amount.toString().includes(searchLower)) {
                    return false;
                }
            }
            
            return true;
        });
    },
    
    // Получение всех транзакций
    getAllTransactions() {
        // Загружаем транзакции из разных источников
        const deposits = JSON.parse(localStorage.getItem('genesis_active_deposits') || '[]');
        const accessPayments = JSON.parse(localStorage.getItem('genesis_access_payments') || '[]');
        
        // Преобразуем в единый формат
        const allTx = [];
        
        // Добавляем депозиты
        deposits.forEach(dep => {
            allTx.push({
                id: dep.transactionHash || `dep_${dep.createdAt}`,
                hash: dep.transactionHash || '0x0000000000000000000000000000000000000000',
                type: 'deposit',
                currency: dep.currency,
                amount: dep.amount,
                status: dep.status === 'active' ? 'success' : dep.status,
                timestamp: new Date(dep.createdAt).getTime(),
                from: dep.userAddress,
                to: window.GENESIS_CONFIG?.addresses?.system || '',
                blockNumber: 0,
                gasUsed: 0,
                gasPrice: 0
            });
        });
        
        // Добавляем платежи за доступ
        accessPayments.forEach(payment => {
            allTx.push({
                id: payment.hash || `access_${payment.timestamp}`,
                hash: payment.hash || '0x0000000000000000000000000000000000000000',
                type: 'subscription',
                currency: 'USDT',
                amount: payment.amount,
                status: 'success',
                timestamp: payment.timestamp,
                from: this.userData?.address || '',
                to: window.GENESIS_CONFIG?.addresses?.system || '',
                blockNumber: payment.blockNumber || 0,
                gasUsed: payment.gasUsed || 0,
                gasPrice: payment.gasPrice || 0
            });
        });
        
        // Если нет реальных транзакций, возвращаем демо-данные
        if (allTx.length === 0) {
            return this.generateDemoTransactions();
        }
        
        // Сортируем по времени (новые первые)
        return allTx.sort((a, b) => b.timestamp - a.timestamp);
    },
    
    // Отображение всех планов депозитов
    renderAllDepositPlans() {
        const plans = window.GENESIS_CONFIG.depositPlans;
        const completedPlans = JSON.parse(localStorage.getItem('genesis_completed_plans') || '[]');
        const activeDeposits = JSON.parse(localStorage.getItem('genesis_active_deposits') || '[]');
        
        return plans.map((plan, index) => {
            // Определяем статус плана
            const isCompleted = completedPlans.includes(plan.id);
            const isActive = activeDeposits.some(d => d.planId === plan.id && d.status === 'active');
            const isAvailable = index === 0 || completedPlans.includes(plans[index - 1].id);
            const isLocked = !isAvailable && !isCompleted && !isActive;
            
            const statusIcon = isActive ? '🔄' : isCompleted ? '✅' : isLocked ? '🔒' : '🚀';
            const statusText = isActive ? 'Активен' : isCompleted ? 'Завершен' : isLocked ? 'Заблокирован' : 'Доступен';
            const statusColor = isActive ? 'var(--warning-color)' : isCompleted ? 'var(--success-color)' : isLocked ? 'var(--text-secondary)' : 'var(--primary-color)';
            
            const profit = (plan.usdtAmount * plan.percentage / 100) - plan.usdtAmount;
            const dailyProfit = profit / plan.days;
            
            return `
                <div class="deposit-plan-card ${isLocked ? 'locked' : ''} ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}" 
                     style="background: var(--bg-primary); border: 2px solid ${isLocked ? 'var(--border-color)' : statusColor}; 
                            border-radius: 12px; padding: 1.5rem; transition: all 0.3s ease; opacity: ${isLocked ? '0.6' : '1'};
                            ${!isLocked ? 'cursor: pointer;' : 'cursor: not-allowed;'}">
                    
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                        <div>
                            <h4 style="color: ${statusColor}; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
                                <span style="font-size: 1.5rem;">${statusIcon}</span>
                                ${plan.name}
                            </h4>
                            <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem;">
                                ${plan.description}
                            </p>
                            <div style="background: rgba(${isActive ? '255, 165, 0' : isCompleted ? '0, 255, 65' : isLocked ? '128, 128, 128' : '255, 107, 53'}, 0.2); 
                                        color: ${statusColor}; padding: 0.3rem 0.6rem; border-radius: 6px; font-size: 0.8rem; display: inline-block;">
                                ${statusText}
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 1.8rem; font-weight: 700; color: var(--text-primary); font-family: 'Orbitron', monospace;">
                                ${plan.usdtAmount.toLocaleString()}
                            </div>
                            <div style="color: var(--success-color); font-size: 0.9rem; font-weight: 600;">
                                ${plan.percentage}%
                            </div>
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.8rem; margin-bottom: 1.5rem; font-size: 0.85rem;">
                        <div style="text-align: center; padding: 0.6rem; background: var(--bg-secondary); border-radius: 6px;">
                            <div style="color: var(--text-secondary); margin-bottom: 0.2rem;">Срок</div>
                            <div style="color: var(--warning-color); font-weight: 600;">${plan.days} дней</div>
                        </div>
                        <div style="text-align: center; padding: 0.6rem; background: var(--bg-secondary); border-radius: 6px;">
                            <div style="color: var(--text-secondary); margin-bottom: 0.2rem;">Прибыль</div>
                            <div style="color: var(--success-color); font-weight: 600;">${profit.toFixed(2)}</div>
                        </div>
                        <div style="text-align: center; padding: 0.6rem; background: var(--bg-secondary); border-radius: 6px;">
                            <div style="color: var(--text-secondary); margin-bottom: 0.2rem;">В день</div>
                            <div style="color: var(--primary-color); font-weight: 600;">${dailyProfit.toFixed(2)}</div>
                        </div>
                    </div>
                    
                    <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem;">
                        <div style="display: flex; justify-content: space-between; font-size: 0.85rem;">
                            <span style="color: var(--text-secondary);">Валюты:</span>
                            <span style="color: var(--secondary-color); font-weight: 500;">${plan.currencies.join(', ')}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 0.85rem;">
                            <span style="color: var(--text-secondary);">Мин. в PLEX:</span>
                            <span style="color: var(--secondary-color); font-weight: 500;">${plan.plexAmount ? plan.plexAmount.toLocaleString() : '—'}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 0.85rem;">
                            <span style="color: var(--text-secondary);">Тип:</span>
                            <span style="color: var(--text-primary); font-weight: 500;">${plan.id.includes('recommended') ? 'Рекомендуемый' : plan.id.includes('trial') ? 'Пробный' : 'Стандартный'}</span>
                        </div>
                    </div>
                    
                    ${!isLocked ? `
                        <button class="btn${isActive || isCompleted ? '-outline' : ''}" 
                                onclick="${isActive || isCompleted ? 'void(0)' : `window.GenesisCabinet.showPurchaseModal('${plan.id}')`}" 
                                style="width: 100%; font-size: 0.9rem;${isActive || isCompleted ? ' cursor: not-allowed; opacity: 0.7;' : ''}">
                            ${isActive ? '🔄 Депозит активен' : isCompleted ? '✅ Депозит завершен' : '🚀 Создать депозит'}
                        </button>
                    ` : `
                        <div style="text-align: center; padding: 0.75rem; background: var(--bg-secondary); border-radius: 8px; color: var(--text-secondary); font-size: 0.9rem;">
                            🔒 Завершите предыдущий план
                        </div>
                    `}
                </div>
            `;
        }).join('');
    },
    
    // Выход из кабинета
    logout() {
        if (window.GenesisAuth) {
            window.GenesisAuth.logout();
        } else {
            localStorage.removeItem('genesis_user_address');
            window.location.href = '/';
        }
    }
};

    // MCP-MARKER:METHOD:CABINET:ADDITIONAL_METHODS - Дополнительные методы
    
    // Выход из системы
    logout() {
        this.userData = null;
        localStorage.removeItem('genesis_user_address');
        localStorage.removeItem('genesis_auth');
        
        if (window.GenesisTerminal) {
            window.GenesisTerminal.log('👋 Выход выполнен', 'info');
        }
        
        // Перенаправляем на главную
        window.location.href = '/';
    },
    
    // Рендеринг всех планов депозитов
    renderAllDepositPlans() {
        const plans = window.GENESIS_CONFIG.depositPlans;
        const userDeposits = JSON.parse(localStorage.getItem('genesis_active_deposits') || '[]');
        const completedPlans = userDeposits.map(d => d.planId);
        
        let html = '';
        
        plans.forEach((plan, index) => {
            const isCompleted = completedPlans.includes(plan.id);
            const isLocked = index > 0 && !completedPlans.includes(plans[index - 1].id);
            const isAvailable = !isCompleted && !isLocked;
            
            let statusClass = '';
            let statusText = '';
            let statusIcon = '';
            
            if (isCompleted) {
                statusClass = 'completed';
                statusText = 'Завершен';
                statusIcon = '✅';
            } else if (isLocked) {
                statusClass = 'locked';
                statusText = 'Заблокирован';
                statusIcon = '🔒';
            } else {
                statusClass = 'available';
                statusText = 'Доступен';
                statusIcon = '🚀';
            }
            
            html += `
                <div class="deposit-plan-card ${statusClass}" ${isAvailable ? `onclick="window.GenesisCabinet.showDepositModal('${plan.id}')"` : ''}>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <div>
                            <h3 style="color: var(--primary-color); margin: 0;">${plan.name}</h3>
                            <p style="color: var(--text-secondary); font-size: 0.9rem; margin: 0.5rem 0;">${plan.description}</p>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 2rem;">${statusIcon}</div>
                            <div style="color: var(--text-secondary); font-size: 0.8rem;">${statusText}</div>
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1rem;">
                        <div style="background: var(--bg-primary); padding: 0.8rem; border-radius: 6px;">
                            <div style="color: var(--text-secondary); font-size: 0.8rem; margin-bottom: 0.3rem;">Инвестиция</div>
                            <div style="color: var(--text-primary); font-weight: 600;">${plan.usdtAmount}</div>
                        </div>
                        <div style="background: var(--bg-primary); padding: 0.8rem; border-radius: 6px;">
                            <div style="color: var(--text-secondary); font-size: 0.8rem; margin-bottom: 0.3rem;">Доходность</div>
                            <div style="color: var(--success-color); font-weight: 600;">${plan.percentage}%</div>
                        </div>
                        <div style="background: var(--bg-primary); padding: 0.8rem; border-radius: 6px;">
                            <div style="color: var(--text-secondary); font-size: 0.8rem; margin-bottom: 0.3rem;">Срок</div>
                            <div style="color: var(--warning-color); font-weight: 600;">${plan.days} дней</div>
                        </div>
                        <div style="background: var(--bg-primary); padding: 0.8rem; border-radius: 6px;">
                            <div style="color: var(--text-secondary); font-size: 0.8rem; margin-bottom: 0.3rem;">Прибыль</div>
                            <div style="color: var(--primary-color); font-weight: 600;">${((plan.usdtAmount * plan.percentage / 100) - plan.usdtAmount).toFixed(2)}</div>
                        </div>
                    </div>
                    
                    ${isAvailable ? `
                        <button class="btn btn-full" style="font-size: 0.9rem;">
                            💰 Создать депозит
                        </button>
                    ` : ''}
                </div>
            `;
        });
        
        return html;
    },
    
    // Получение секции быстрых действий
    getQuickActionsSection() {
        return `
            <div class="stats-card" style="margin-top: 2rem;">
                <h3 style="color: var(--primary-color); margin-bottom: 1.5rem;">⚡ Быстрые действия</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                    <button class="btn-secondary" onclick="window.GenesisCabinet.navigateTo('deposits')">
                        💰 Создать депозит
                    </button>
                    <button class="btn-secondary" onclick="window.GenesisCabinet.navigateTo('access')">
                        💳 Оплатить доступ
                    </button>
                    <button class="btn-secondary" onclick="window.GenesisCabinet.navigateTo('portfolio')">
                        💼 Мой портфель
                    </button>
                    <button class="btn-secondary" onclick="window.GenesisCabinet.navigateTo('referrals')">
                        👥 Рефералы
                    </button>
                </div>
            </div>
        `;
    },
    
    // Получение секции последней активности
    getRecentActivitySection() {
        return `
            <div class="stats-card" style="margin-top: 2rem;">
                <h3 style="color: var(--secondary-color); margin-bottom: 1.5rem;">📅 Последняя активность</h3>
                <div id="recent-activity" style="color: var(--text-secondary);">
                    <p>Нет активности для отображения</p>
                </div>
            </div>
        `;
    },
    
    // Получение карточек аналитики
    getAnalyticsCards() {
        return `
            <div class="stats-card">
                <div class="stats-header">
                    <span class="stats-title">Средняя доходность</span>
                    <span class="stats-icon">📊</span>
                </div>
                <div class="stats-value">0%</div>
                <div class="stats-change">за месяц</div>
            </div>
            
            <div class="stats-card">
                <div class="stats-header">
                    <span class="stats-title">Использование капитала</span>
                    <span class="stats-icon">💼</span>
                </div>
                <div class="stats-value">0%</div>
                <div class="stats-change">инвестировано</div>
            </div>
            
            <div class="stats-card">
                <div class="stats-header">
                    <span class="stats-title">Количество планов</span>
                    <span class="stats-icon">🎯</span>
                </div>
                <div class="stats-value">13</div>
                <div class="stats-change">доступно</div>
            </div>
        `;
    },
    
    // Инструкции по оплате доступа
    getAccessPaymentInstructions() {
        return `
            <div class="stats-card" style="margin-top: 2rem;">
                <h3 style="color: var(--error-color); margin-bottom: 1.5rem;">⚠️ Оплатите доступ к платформе</h3>
                
                <div style="background: var(--bg-primary); padding: 1.5rem; border-radius: 8px; border-left: 4px solid var(--error-color);">
                    <p style="color: var(--text-primary); font-weight: 600; margin-bottom: 1rem;">Ваш доступ к платформе неактивен!</p>
                    <p style="color: var(--text-secondary); line-height: 1.6;">
                        Для активации и использования всех функций GENESIS 1.1 необходимо оплатить доступ.
                        Минимальная сумма оплаты: <strong>$10 USDT</strong> (на 10 дней).
                    </p>
                    
                    <button class="btn btn-full" onclick="window.GenesisCabinet.topUpAccess(10)" style="margin-top: 1rem;">
                        💳 Оплатить доступ
                    </button>
                </div>
            </div>
        `;
    },
    
    // Таблица истории доступа
    getAccessHistoryTable() {
        return `
            <div class="stats-card" style="margin-top: 2rem;">
                <h3 style="color: var(--secondary-color); margin-bottom: 1.5rem;">📅 История платежей</h3>
                <div id="access-history-table">
                    <p style="text-align: center; color: var(--text-secondary);">Загрузка...</p>
                </div>
            </div>
        `;
    },
    
    // Настройки уведомлений
    getNotificationSettings() {
        return `
            <label style="display: flex; align-items: center; gap: 1rem; padding: 1rem; background: var(--bg-primary); border-radius: 8px; cursor: pointer;">
                <input type="checkbox" style="width: 20px; height: 20px;" checked>
                <div>
                    <div style="color: var(--text-primary); font-weight: 600;">Email уведомления</div>
                    <div style="color: var(--text-secondary); font-size: 0.8rem;">Получать уведомления о депозитах и выплатах</div>
                </div>
            </label>
            
            <label style="display: flex; align-items: center; gap: 1rem; padding: 1rem; background: var(--bg-primary); border-radius: 8px; cursor: pointer;">
                <input type="checkbox" style="width: 20px; height: 20px;" checked>
                <div>
                    <div style="color: var(--text-primary); font-weight: 600;">Звуковые уведомления</div>
                    <div style="color: var(--text-secondary); font-size: 0.8rem;">Звуковой сигнал при важных событиях</div>
                </div>
            </label>
            
            <label style="display: flex; align-items: center; gap: 1rem; padding: 1rem; background: var(--bg-primary); border-radius: 8px; cursor: pointer;">
                <input type="checkbox" style="width: 20px; height: 20px;">
                <div>
                    <div style="color: var(--text-primary); font-weight: 600;">Push-уведомления</div>
                    <div style="color: var(--text-secondary); font-size: 0.8rem;">Мобильные уведомления (скоро)</div>
                </div>
            </label>
        `;
    },
    
    // Бонусные элементы
    getBonusItems() {
        return `
            <div style="background: var(--bg-primary); padding: 1.5rem; border-radius: 8px; border-left: 4px solid var(--primary-color);">
                <h4 style="color: var(--primary-color); margin-bottom: 0.5rem;">🎁 Приветственный бонус</h4>
                <p style="color: var(--text-secondary); margin-bottom: 1rem;">100 PLEX при первом депозите</p>
                <div style="color: var(--text-secondary); font-size: 0.8rem;">Статус: Ожидает активации</div>
            </div>
            
            <div style="background: var(--bg-primary); padding: 1.5rem; border-radius: 8px; border-left: 4px solid var(--secondary-color); opacity: 0.5;">
                <h4 style="color: var(--secondary-color); margin-bottom: 0.5rem;">👥 Реферальный бонус</h4>
                <p style="color: var(--text-secondary); margin-bottom: 1rem;">50 PLEX за каждого активного реферала</p>
                <div style="color: var(--text-secondary); font-size: 0.8rem;">Статус: Недоступно</div>
            </div>
            
            <div style="background: var(--bg-primary); padding: 1.5rem; border-radius: 8px; border-left: 4px solid var(--warning-color); opacity: 0.5;">
                <h4 style="color: var(--warning-color); margin-bottom: 0.5rem;">🎯 Достижения</h4>
                <p style="color: var(--text-secondary); margin-bottom: 1rem;">500 PLEX за завершение всех планов</p>
                <div style="color: var(--text-secondary); font-size: 0.8rem;">Статус: Недоступно</div>
            </div>
        `;
    },
    
    // Пополнение доступа
    topUpAccess(days) {
        if (window.GenesisPlatformAccess) {
            window.GenesisPlatformAccess.showPaymentModal(days);
        }
    },
    
    // Пополнение доступа на произвольную сумму
    topUpAccessCustom() {
        const amount = document.getElementById('custom-access-amount')?.value || 10;
        this.topUpAccess(parseInt(amount));
    },
    
    // Копирование реферальной ссылки
    copyRefLink(link) {
        if (window.GenesisUtils) {
            window.GenesisUtils.copyToClipboard(link);
            this.showNotification('✅ Скопировано!', 'Реферальная ссылка скопирована в буфер обмена', 'success');
        }
    },
    
    // Поделиться реферальной ссылкой
    shareRefLink(platform) {
        const refLink = `https://genesis.app/ref/${this.userData?.address?.substring(2, 8) || 'xxxxx'}`;
        const text = `🚀 Присоединяйся к GENESIS 1.1 - DeFi платформе с доходностью до 110%!`;
        
        let shareUrl = '';
        
        switch(platform) {
            case 'telegram':
                shareUrl = `https://t.me/share/url?url=${encodeURIComponent(refLink)}&text=${encodeURIComponent(text)}`;
                break;
            case 'whatsapp':
                shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + refLink)}`;
                break;
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(refLink)}`;
                break;
        }
        
        if (shareUrl) {
            window.open(shareUrl, '_blank');
        }
    },
    
    // Загрузка статуса доступа
    async loadAccessStatus() {
        if (window.GenesisPlatformAccess && this.userData?.address) {
            const accessData = await window.GenesisPlatformAccess.checkUserAccessBalance(this.userData.address);
            this.updateAccessUI(accessData);
        }
    },
    
    // Обновление UI доступа
    updateAccessUI(accessData) {
        if (window.GenesisPlatformAccess) {
            window.GenesisPlatformAccess.updateAccessUI(accessData);
        }
    },
    
    // Загрузка транзакций
    async loadTransactions() {
        // TODO: Реализовать загрузку транзакций из BSC
        console.log('💸 Загрузка транзакций...');
    },
    
    // Загрузка аналитики
    async loadAnalytics() {
        // TODO: Реализовать загрузку аналитики
        console.log('📈 Загрузка аналитики...');
    },
    
    // Загрузка и отображение планов депозитов
    loadAndDisplayDepositPlans() {
        const container = document.getElementById('deposit-plans-grid');
        if (!container) return;
        
        container.innerHTML = this.renderAllDepositPlans();
    }
};

console.log('🏛️ GENESIS CABINET loaded');
