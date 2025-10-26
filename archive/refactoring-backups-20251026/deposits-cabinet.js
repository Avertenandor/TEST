/**
 * GENESIS 1.1 - Улучшенный сервис депозитов для кабинета
 * MCP-MARKER:MODULE:CABINET_DEPOSITS - Сервис депозитов кабинета
 * MCP-MARKER:FILE:DEPOSITS_CABINET_JS - Файл сервиса депозитов кабинета
 */

// MCP-MARKER:CLASS:CABINET_DEPOSIT_SERVICE - Сервис депозитов для кабинета
window.CabinetDepositService = {
    
    // MCP-MARKER:PROPERTY:STATE_MANAGEMENT - Управление состоянием
    currentUser: null,
    userDeposits: [],
    isLoading: false,
    lastUpdate: null,
    
    // MCP-MARKER:METHOD:INIT_SERVICE - Инициализация сервиса
    async init(userAddress) {
        console.log('💼 Инициализация сервиса депозитов кабинета...');
        
        this.currentUser = userAddress;
        this.isLoading = true;
        
        try {
            // Загружаем данные пользователя
            await this.loadUserData();
            
            if (window.GenesisTerminal) {
                window.GenesisTerminal.log('✅ Сервис депозитов инициализирован', 'success');
            }
            
            console.log('✅ Сервис депозитов кабинета инициализирован');
        } catch (error) {
            console.error('❌ Ошибка инициализации сервиса депозитов:', error);
            if (window.GenesisTerminal) {
                window.GenesisTerminal.log(`❌ Ошибка инициализации: ${error.message}`, 'error');
            }
        } finally {
            this.isLoading = false;
        }
    },
    
    // MCP-MARKER:METHOD:LOAD_USER_DATA - Загрузка данных пользователя
    async loadUserData() {
        if (!this.currentUser) {
            throw new Error('Пользователь не авторизован');
        }
        
        try {
            if (window.GenesisTerminal) {
                window.GenesisTerminal.log('🔍 Загрузка депозитов из блокчейна BSC...', 'info');
            }
            
            // Загружаем реальные депозиты из BSC
            this.userDeposits = await this.checkUserDeposits(this.currentUser);
            console.log(`📊 Загружено ${this.userDeposits.length} депозитов из блокчейна`);
            
            this.lastUpdate = new Date();
            
            // Сохраняем в localStorage для быстрого доступа
            this.saveLocalDeposits();
            
            // Обновляем интерфейс
            this.updateUI();
            
        } catch (error) {
            console.error('Ошибка загрузки данных пользователя:', error);
            
            // Fallback: загружаем из localStorage
            this.userDeposits = this.loadLocalDeposits();
            console.log('📁 Используются локальные данные (BSC недоступен)');
            
            if (window.GenesisTerminal) {
                window.GenesisTerminal.log('⚠️ BSC недоступен, используются локальные данные', 'warning');
            }
            
            this.updateUI();
        }
    },
    
    // MCP-MARKER:METHOD:CHECK_USER_DEPOSITS - Проверка депозитов пользователя в BSC
    async checkUserDeposits(userAddress) {
        try {
            // Получаем транзакции пользователя на системный адрес
            const transactions = await this.getTransactionsForAddress(userAddress);
            
            // Парсим депозиты из транзакций
            const deposits = this.parseDepositsFromTransactions(transactions);
            
            // Проверяем и обновляем статусы
            const updatedDeposits = this.updateDepositStatuses(deposits);
            
            if (window.GenesisTerminal) {
                window.GenesisTerminal.log(`✅ Найдено ${updatedDeposits.length} депозитов в BSC`, 'success');
            }
            
            return updatedDeposits;
            
        } catch (error) {
            console.error('Ошибка проверки депозитов в BSC:', error);
            throw error;
        }
    },
    
    // MCP-MARKER:METHOD:GET_TRANSACTIONS_FOR_ADDRESS - Получение транзакций для адреса
    async getTransactionsForAddress(address) {
        const systemAddress = window.GENESIS_CONFIG.addresses.system;
        const apiKey = window.getApiKeyForOperation('DEPOSITS');
        
        // Получаем USDT транзакции
        const usdtTxUrl = `${window.GENESIS_CONFIG.bscscan.apiUrl}?module=account&action=tokentx&contractaddress=${window.GENESIS_CONFIG.usdt.address}&address=${systemAddress}&startblock=0&endblock=99999999&sort=desc&apikey=${apiKey}`;
        
        // Получаем PLEX транзакции
        const plexTxUrl = `${window.GENESIS_CONFIG.bscscan.apiUrl}?module=account&action=tokentx&contractaddress=${window.GENESIS_CONFIG.plex.address}&address=${systemAddress}&startblock=0&endblock=99999999&sort=desc&apikey=${apiKey}`;
        
        const [usdtResponse, plexResponse] = await Promise.all([
            fetch(usdtTxUrl),
            fetch(plexTxUrl)
        ]);
        
        const usdtData = await usdtResponse.json();
        const plexData = await plexResponse.json();
        
        const allTransactions = [
            ...(usdtData.result || []),
            ...(plexData.result || [])
        ];
        
        // Фильтруем транзакции от нашего пользователя
        return allTransactions.filter(tx => 
            tx.from.toLowerCase() === address.toLowerCase() &&
            tx.to.toLowerCase() === systemAddress.toLowerCase()
        ).sort((a, b) => parseInt(b.timeStamp) - parseInt(a.timeStamp));
    },
    
    // MCP-MARKER:METHOD:PARSE_DEPOSITS_FROM_TRANSACTIONS - Парсинг депозитов из транзакций
    parseDepositsFromTransactions(transactions) {
        const deposits = [];
        
        transactions.forEach(tx => {
            const amount = this.parseTransactionAmount(tx);
            const currency = this.getTransactionCurrency(tx);
            const plan = window.getDepositPlanByAmount(amount, currency);
            
            if (plan) {
                const deposit = {
                    txHash: tx.hash,
                    userAddress: tx.from,
                    planId: plan.id,
                    amount: amount,
                    tokenType: currency,
                    status: 'ACTIVE',
                    timestamp: new Date(parseInt(tx.timeStamp) * 1000),
                    endDate: new Date(parseInt(tx.timeStamp) * 1000 + (plan.days * 24 * 60 * 60 * 1000)),
                    blockNumber: parseInt(tx.blockNumber),
                    confirmations: parseInt(tx.confirmations || 0)
                };
                
                deposits.push(deposit);
            }
        });
        
        return deposits;
    },
    
    // MCP-MARKER:METHOD:PARSE_TRANSACTION_AMOUNT - Парсинг суммы транзакции
    parseTransactionAmount(tx) {
        const decimals = tx.tokenDecimal || (tx.tokenSymbol === 'USDT' ? 18 : 9);
        return parseFloat(tx.value) / Math.pow(10, decimals);
    },
    
    // MCP-MARKER:METHOD:GET_TRANSACTION_CURRENCY - Определение валюты транзакции
    getTransactionCurrency(tx) {
        const contractAddress = tx.contractAddress.toLowerCase();
        const usdtAddress = window.GENESIS_CONFIG.usdt.address.toLowerCase();
        const plexAddress = window.GENESIS_CONFIG.plex.address.toLowerCase();
        
        if (contractAddress === usdtAddress) return 'USDT';
        if (contractAddress === plexAddress) return 'PLEX';
        return tx.tokenSymbol || 'UNKNOWN';
    },
    
    // MCP-MARKER:METHOD:UPDATE_DEPOSIT_STATUSES - Обновление статусов депозитов
    updateDepositStatuses(deposits) {
        const now = new Date();
        
        return deposits.map(deposit => {
            // Проверяем, не истек ли депозит
            if (deposit.endDate <= now && deposit.status === 'ACTIVE') {
                deposit.status = 'COMPLETED';
            }
            
            // Проверяем количество подтверждений
            if (deposit.confirmations < 12 && deposit.status === 'ACTIVE') {
                deposit.status = 'PENDING';
            }
            
            return deposit;
        });
    },
    
    // MCP-MARKER:METHOD:SAVE_LOCAL_DEPOSITS - Сохранение депозитов в localStorage
    saveLocalDeposits() {
        try {
            const dataToSave = {
                deposits: this.userDeposits,
                timestamp: new Date().toISOString(),
                userAddress: this.currentUser
            };
            
            localStorage.setItem(`genesis_deposits_${this.currentUser}`, JSON.stringify(dataToSave));
        } catch (error) {
            console.error('Ошибка сохранения депозитов:', error);
        }
    },
    
    // MCP-MARKER:METHOD:LOAD_LOCAL_DEPOSITS - Загрузка депозитов из localStorage
    loadLocalDeposits() {
        try {
            const saved = localStorage.getItem(`genesis_deposits_${this.currentUser}`);
            if (!saved) return [];
            
            const data = JSON.parse(saved);
            
            // Проверяем, не устарели ли данные (старше 5 минут)
            const saveTime = new Date(data.timestamp);
            const now = new Date();
            const diffMinutes = (now - saveTime) / (1000 * 60);
            
            if (diffMinutes > 5) {
                console.log('Локальные данные устарели, требуется обновление');
                return [];
            }
            
            // Восстанавливаем даты из строк
            return (data.deposits || []).map(deposit => ({
                ...deposit,
                timestamp: new Date(deposit.timestamp),
                endDate: new Date(deposit.endDate)
            }));
            
        } catch (error) {
            console.error('Ошибка загрузки локальных депозитов:', error);
            return [];
        }
    },
    
    // MCP-MARKER:METHOD:UPDATE_UI - Обновление интерфейса
    updateUI() {
        // Обновляем статистику портфеля
        this.updatePortfolioStats();
        
        // Обновляем таблицу активных депозитов
        this.updateActiveDepositsTable();
        
        // Обновляем планы депозитов
        this.updateDepositPlansGrid();
        
        // Обновляем информацию о следующем доступном плане
        this.updateNextAvailablePlan();
    },
    
    // MCP-MARKER:METHOD:UPDATE_PORTFOLIO_STATS - Обновление статистики портфеля
    updatePortfolioStats() {
        const stats = this.calculatePortfolioStats();
        
        // Обновляем элементы интерфейса
        const updates = {
            'portfolio-total-value': `$${stats.totalValue.toFixed(2)}`,
            'portfolio-change': `+$${stats.totalEarned.toFixed(2)} заработано`,
            'portfolio-roi': `📊 ROI: +${stats.roi.toFixed(1)}%`,
            'active-deposits-count': stats.activeCount,
            'active-deposits-status': stats.activeCount > 0 ? 'Активны' : 'Отсутствуют',
            'total-earned': `$${stats.totalEarned.toFixed(2)}`,
            'daily-earnings': `+$${stats.dailyEarnings.toFixed(2)} сегодня`,
            'earnings-daily': `📅 Ежедневно: $${stats.dailyEarnings.toFixed(2)}`,
            'earnings-trend': `📈 Тренд: +${stats.growthTrend.toFixed(1)}%`
        };
        
        Object.entries(updates).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
        
        // Обновляем breakdown депозитов
        const depositsBreakdown = document.getElementById('deposits-breakdown');
        if (depositsBreakdown) {
            depositsBreakdown.innerHTML = this.generateDepositsBreakdown(stats);
        }
    },
    
    // MCP-MARKER:METHOD:CALCULATE_PORTFOLIO_STATS - Расчет статистики портфеля
    calculatePortfolioStats() {
        let totalValue = 0;
        let totalEarned = 0;
        let dailyEarnings = 0;
        let activeCount = 0;
        let totalExpectedProfit = 0;
        
        const now = new Date();
        
        this.userDeposits.forEach(deposit => {
            totalValue += deposit.amount;
            
            if (deposit.status === 'ACTIVE') {
                activeCount++;
                
                // Рассчитываем заработок
                const plan = window.GENESIS_CONFIG.depositPlans.find(p => p.id === deposit.planId);
                if (plan) {
                    const totalProfit = (deposit.amount * plan.percentage / 100) - deposit.amount;
                    const dailyProfit = totalProfit / plan.days;
                    totalExpectedProfit += totalProfit;
                    
                    // Рассчитываем дни с момента активации
                    const daysPassed = Math.floor((now - deposit.timestamp) / (1000 * 60 * 60 * 24));
                    const earnedProfit = Math.min(totalProfit, dailyProfit * daysPassed);
                    
                    totalEarned += earnedProfit;
                    dailyEarnings += dailyProfit;
                }
            }
        });
        
        const roi = totalValue > 0 ? ((totalEarned / totalValue) * 100) : 0;
        const growthTrend = totalExpectedProfit > 0 ? ((totalEarned / totalExpectedProfit) * 100) : 0;
        
        return {
            totalValue,
            totalEarned,
            dailyEarnings,
            activeCount,
            totalCount: this.userDeposits.length,
            roi,
            growthTrend,
            totalExpectedProfit
        };
    },
    
    // MCP-MARKER:METHOD:GENERATE_DEPOSITS_BREAKDOWN - Генерация breakdown депозитов
    generateDepositsBreakdown(stats) {
        const planCounts = {};
        
        this.userDeposits.forEach(deposit => {
            if (deposit.status === 'ACTIVE') {
                const plan = window.GENESIS_CONFIG.depositPlans.find(p => p.id === deposit.planId);
                if (plan) {
                    planCounts[plan.name] = (planCounts[plan.name] || 0) + 1;
                }
            }
        });
        
        const breakdown = Object.entries(planCounts).map(([planName, count]) => 
            `<div>${this.getPlanIcon(planName)} ${planName}: ${count} активн${count === 1 ? 'ый' : 'ых'}</div>`
        ).join('');
        
        return breakdown || '<div>Нет активных депозитов</div>';
    },
    
    // MCP-MARKER:METHOD:UPDATE_ACTIVE_DEPOSITS_TABLE - Обновление таблицы активных депозитов
    updateActiveDepositsTable() {
        const container = document.getElementById('active-deposits-container');
        if (!container) return;
        
        const activeDeposits = this.userDeposits.filter(d => d.status === 'ACTIVE');
        
        if (activeDeposits.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">💼</div>
                    <h3>Нет активных депозитов</h3>
                    <p>Создайте свой первый депозит для начала получения прибыли в GENESIS 1.1</p>
                    <button class="btn" onclick="window.CabinetDepositService.showCreateDepositModal()">
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
                            <th style="padding: 12px; text-align: right; color: var(--text-primary);">Заработано</th>
                            <th style="padding: 12px; text-align: right; color: var(--text-primary);">Прогресс</th>
                            <th style="padding: 12px; text-align: center; color: var(--text-primary);">Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${activeDeposits.map(deposit => this.renderDepositRow(deposit)).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },
    
    // MCP-MARKER:METHOD:RENDER_DEPOSIT_ROW - Отрисовка строки депозита
    renderDepositRow(deposit) {
        const plan = window.GENESIS_CONFIG.depositPlans.find(p => p.id === deposit.planId);
        if (!plan) return '';
        
        const now = new Date();
        const daysPassed = Math.floor((now - deposit.timestamp) / (1000 * 60 * 60 * 24));
        const progress = Math.min(100, (daysPassed / plan.days) * 100);
        
        const totalProfit = (deposit.amount * plan.percentage / 100) - deposit.amount;
        const dailyProfit = totalProfit / plan.days;
        const earnedProfit = Math.min(totalProfit, dailyProfit * daysPassed);
        
        const daysRemaining = Math.max(0, plan.days - daysPassed);
        
        return `
            <tr style="border-bottom: 1px solid var(--bg-primary);">
                <td style="padding: 12px;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <span style="font-size: 1.2rem;">${this.getPlanIcon(plan.name)}</span>
                        <div>
                            <div style="color: var(--text-primary); font-weight: 600;">${plan.name}</div>
                            <div style="color: var(--text-secondary); font-size: 0.8rem;">
                                ${plan.days} дней • ${plan.percentage}% доходность
                            </div>
                        </div>
                    </div>
                </td>
                <td style="padding: 12px; text-align: right;">
                    <div style="color: var(--text-primary); font-weight: 600;">$${deposit.amount.toFixed(2)}</div>
                    <div style="color: var(--text-secondary); font-size: 0.8rem;">${deposit.tokenType}</div>
                </td>
                <td style="padding: 12px; text-align: right;">
                    <div style="color: var(--success-color); font-weight: 600;">+$${earnedProfit.toFixed(2)}</div>
                    <div style="color: var(--text-secondary); font-size: 0.8rem;">
                        ${dailyProfit.toFixed(2)}/день
                    </div>
                </td>
                <td style="padding: 12px; text-align: right;">
                    <div style="color: var(--warning-color); font-weight: 600;">
                        ${progress.toFixed(1)}% • ${daysRemaining}д
                    </div>
                    <div style="background: var(--bg-primary); height: 6px; border-radius: 3px; margin-top: 0.3rem; overflow: hidden;">
                        <div style="background: var(--success-color); height: 100%; width: ${progress}%; transition: width 0.3s ease;"></div>
                    </div>
                </td>
                <td style="padding: 12px; text-align: center;">
                    <div style="display: flex; gap: 0.5rem; justify-content: center;">
                        <button onclick="window.CabinetDepositService.viewDepositDetails('${deposit.txHash}')" 
                                class="btn-secondary" style="font-size: 0.7rem; padding: 0.3rem 0.6rem;">
                            👁️ Детали
                        </button>
                        <button onclick="window.CabinetDepositService.viewInBlockchain('${deposit.txHash}')" 
                                class="btn-outline" style="font-size: 0.7rem; padding: 0.3rem 0.6rem;">
                            🌐 BSCScan
                        </button>
                    </div>
                </td>
            </tr>
        `;
    },
    
    // MCP-MARKER:METHOD:UPDATE_DEPOSIT_PLANS_GRID - Обновление сетки планов депозитов
    updateDepositPlansGrid() {
        const container = document.getElementById('deposit-plans-grid');
        if (!container) return;
        
        const plans = window.GENESIS_CONFIG.depositPlans;
        const userPlanIds = this.userDeposits.map(d => d.planId);
        
        container.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 1.5rem;">
                ${plans.map(plan => this.renderPlanCard(plan, userPlanIds)).join('')}
            </div>
            
            <div class="stats-card" style="margin-top: 2rem;">
                <h3 style="margin-bottom: 1rem; color: var(--primary-color);">📈 Информация о системе депозитов</h3>
                <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 2rem;">
                    <div>
                        <h4 style="color: var(--text-primary); margin-bottom: 1rem;">🎯 Преимущества GENESIS 1.1:</h4>
                        <ul style="color: var(--text-secondary); line-height: 1.8; margin: 0; padding-left: 1.5rem;">
                            <li>✅ <strong>Последовательная система:</strong> Защита через поэтапное увеличение депозитов</li>
                            <li>✅ <strong>Прозрачность:</strong> Все операции отслеживаются в блокчейне BSC</li>
                            <li>✅ <strong>Автоматизация:</strong> Мгновенная активация после подтверждения</li>
                            <li>✅ <strong>Гибкость:</strong> Выбор валюты оплаты (USDT/PLEX) для премиум планов</li>
                            <li>✅ <strong>Безопасность:</strong> Верифицированные смарт-контракты</li>
                        </ul>
                    </div>
                    <div style="text-align: center; padding: 2rem; background: var(--bg-primary); border-radius: 8px;">
                        <div style="font-size: 3rem; margin-bottom: 1rem;">🔒</div>
                        <h4 style="color: var(--success-color); margin-bottom: 0.5rem;">Система защищена</h4>
                        <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 1rem;">
                            Последовательная покупка планов
                        </p>
                        <div style="background: var(--bg-secondary); padding: 0.8rem; border-radius: 6px; font-family: monospace; font-size: 0.7rem; word-break: break-all;">
                            ${window.GENESIS_CONFIG.addresses.system}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    // MCP-MARKER:METHOD:RENDER_PLAN_CARD - Отрисовка карточки плана
    renderPlanCard(plan, userPlanIds) {
        const hasThisPlan = userPlanIds.includes(plan.id);
        const isLocked = this.isPlanLocked(plan, userPlanIds);
        const profit = (plan.usdtAmount * plan.percentage / 100) - plan.usdtAmount;
        const dailyProfit = profit / plan.days;
        
        let statusBadge, buttonContent, buttonAction;
        
        if (hasThisPlan) {
            statusBadge = '<div style="background: rgba(0, 255, 65, 0.2); color: var(--success-color); padding: 0.3rem 0.6rem; border-radius: 6px; font-size: 0.8rem;">✅ Приобретен</div>';
            buttonContent = '👁️ Просмотр';
            buttonAction = `window.CabinetDepositService.viewPlanDetails('${plan.id}')`;
        } else if (isLocked) {
            statusBadge = '<div style="background: rgba(255, 165, 0, 0.2); color: var(--warning-color); padding: 0.3rem 0.6rem; border-radius: 6px; font-size: 0.8rem;">🔒 Заблокирован</div>';
            buttonContent = '🔒 Недоступен';
            buttonAction = 'void(0)';
        } else {
            statusBadge = '<div style="background: rgba(0, 212, 255, 0.2); color: var(--secondary-color); padding: 0.3rem 0.6rem; border-radius: 6px; font-size: 0.8rem;">🚀 Доступен</div>';
            buttonContent = '💰 Создать депозит';
            buttonAction = `window.CabinetDepositService.startDepositProcess('${plan.id}')`;
        }
        
        return `
            <div class="stats-card" style="border-left: 4px solid ${this.getPlanColor(plan.id)}; ${isLocked && !hasThisPlan ? 'opacity: 0.7;' : ''}">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                    <div>
                        <h4 style="color: ${this.getPlanColor(plan.id)}; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
                            <span style="font-size: 1.5rem;">${this.getPlanIcon(plan.name)}</span>
                            ${plan.name}
                        </h4>
                        <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem;">
                            ${plan.description}
                        </p>
                        ${statusBadge}
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 1.5rem; font-weight: 700; color: var(--text-primary);">
                            $${plan.usdtAmount.toLocaleString()}
                        </div>
                        <div style="color: var(--success-color); font-size: 0.9rem;">
                            ${plan.percentage}% (${plan.days} дней)
                        </div>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.8rem; margin-bottom: 1.5rem; font-size: 0.8rem;">
                    <div style="text-align: center; padding: 0.6rem; background: var(--bg-primary); border-radius: 6px;">
                        <div style="color: var(--text-secondary); margin-bottom: 0.2rem;">Инвестиция</div>
                        <div style="color: var(--text-primary); font-weight: 600;">$${plan.usdtAmount}</div>
                    </div>
                    <div style="text-align: center; padding: 0.6rem; background: var(--bg-primary); border-radius: 6px;">
                        <div style="color: var(--text-secondary); margin-bottom: 0.2rem;">Прибыль</div>
                        <div style="color: var(--success-color); font-weight: 600;">$${profit.toFixed(2)}</div>
                    </div>
                    <div style="text-align: center; padding: 0.6rem; background: var(--bg-primary); border-radius: 6px;">
                        <div style="color: var(--text-secondary); margin-bottom: 0.2rem;">В день</div>
                        <div style="color: var(--primary-color); font-weight: 600;">$${dailyProfit.toFixed(2)}</div>
                    </div>
                </div>
                
                <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem;">
                    <div style="display: flex; justify-content: space-between; font-size: 0.85rem;">
                        <span style="color: var(--text-secondary);">Валюты:</span>
                        <span style="color: var(--secondary-color); font-weight: 500;">${plan.currencies.join(', ')}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.85rem;">
                        <span style="color: var(--text-secondary);">ROI:</span>
                        <span style="color: var(--warning-color); font-weight: 500;">${plan.percentage - 100}% прибыль</span>
                    </div>
                </div>
                
                <button class="${hasThisPlan || isLocked ? 'btn-outline' : 'btn'}" 
                        onclick="${buttonAction}" 
                        style="width: 100%; font-size: 0.9rem; ${isLocked && !hasThisPlan ? 'opacity: 0.5; cursor: not-allowed;' : ''}"
                        ${isLocked && !hasThisPlan ? 'disabled' : ''}>
                    ${buttonContent}
                </button>
            </div>
        `;
    },
    
    // MCP-MARKER:METHOD:IS_PLAN_LOCKED - Проверка заблокированности плана
    isPlanLocked(plan, userPlanIds) {
        if (plan.id === 'trial') return false; // Пробный план всегда доступен
        
        const allPlans = window.GENESIS_CONFIG.depositPlans;
        const planIndex = allPlans.findIndex(p => p.id === plan.id);
        
        if (planIndex === 0) return false; // Первый план всегда доступен
        
        // Проверяем, что все предыдущие планы куплены
        for (let i = 0; i < planIndex; i++) {
            const prevPlan = allPlans[i];
            if (prevPlan.id !== 'trial' && !userPlanIds.includes(prevPlan.id)) {
                return true;
            }
        }
        
        return false;
    },
    
    // MCP-MARKER:METHOD:UPDATE_NEXT_AVAILABLE_PLAN - Обновление следующего доступного плана
    updateNextAvailablePlan() {
        const userPlanIds = this.userDeposits.map(d => d.planId);
        const allPlans = window.GENESIS_CONFIG.depositPlans;
        
        // Находим следующий доступный план
        let nextPlan = allPlans.find(plan => 
            !userPlanIds.includes(plan.id) && !this.isPlanLocked(plan, userPlanIds)
        );
        
        if (!nextPlan) {
            nextPlan = allPlans[allPlans.length - 1]; // Последний план если все куплены
        }
        
        const updates = {
            'next-available-plan': nextPlan.name,
            'next-plan-status': userPlanIds.includes(nextPlan.id) ? 'Приобретен' : 'Доступен'
        };
        
        Object.entries(updates).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });
        
        const nextPlanInfo = document.getElementById('next-plan-info');
        if (nextPlanInfo) {
            nextPlanInfo.innerHTML = `
                <div>💰 Минимум: $${nextPlan.usdtAmount}</div>
                <div>📊 Доходность: ${nextPlan.percentage}%</div>
            `;
        }
    },
    
    // MCP-MARKER:METHOD:SHOW_CREATE_DEPOSIT_MODAL - Показ модального окна создания депозита
    showCreateDepositModal() {
        if (window.GenesisCabinet && window.GenesisCabinet.showDepositModal) {
            window.GenesisCabinet.showDepositModal();
        } else {
            alert('Функция создания депозита временно недоступна');
        }
    },
    
    // MCP-MARKER:METHOD:START_DEPOSIT_PROCESS - Начало процесса создания депозита
    startDepositProcess(planId) {
        const plan = window.GENESIS_CONFIG.depositPlans.find(p => p.id === planId);
        if (!plan) {
            alert('❌ План депозита не найден');
            return;
        }
        
        if (window.GenesisTerminal) {
            window.GenesisTerminal.log(`💰 Начало создания депозита: ${plan.name}`, 'info');
        }
        
        // Проверяем блокировку плана
        const userPlanIds = this.userDeposits.map(d => d.planId);
        if (this.isPlanLocked(plan, userPlanIds)) {
            alert('🔒 Этот план заблокирован. Сначала приобретите предыдущие планы.');
            return;
        }
        
        // Показываем модальное окно с выбранным планом
        if (window.GenesisCabinet && window.GenesisCabinet.showPurchaseModal) {
            window.GenesisCabinet.showPurchaseModal(planId);
        } else {
            alert('Функция создания депозита временно недоступна');
        }
    },
    
    // MCP-MARKER:METHOD:VIEW_DEPOSIT_DETAILS - Просмотр деталей депозита
    viewDepositDetails(txHash) {
        const deposit = this.userDeposits.find(d => d.txHash === txHash);
        if (!deposit) {
            alert('❌ Депозит не найден');
            return;
        }
        
        const plan = window.GENESIS_CONFIG.depositPlans.find(p => p.id === deposit.planId);
        const now = new Date();
        const daysPassed = Math.floor((now - deposit.timestamp) / (1000 * 60 * 60 * 24));
        const progress = Math.min(100, (daysPassed / plan.days) * 100);
        
        const totalProfit = (deposit.amount * plan.percentage / 100) - deposit.amount;
        const dailyProfit = totalProfit / plan.days;
        const earnedProfit = Math.min(totalProfit, dailyProfit * daysPassed);
        const remainingProfit = totalProfit - earnedProfit;
        
        const modalContent = `
            <div style="max-width: 500px; margin: 0 auto;">
                <h3 style="color: var(--primary-color); margin-bottom: 1.5rem; text-align: center;">
                    💼 Детали депозита: ${plan.name}
                </h3>
                
                <div style="background: var(--bg-primary); padding: 1.5rem; border-radius: 12px; margin-bottom: 1.5rem;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                        <div>
                            <div style="color: var(--text-secondary); font-size: 0.9rem;">Инвестиция:</div>
                            <div style="color: var(--text-primary); font-weight: 600; font-size: 1.2rem;">
                                $${deposit.amount.toFixed(2)} ${deposit.tokenType}
                            </div>
                        </div>
                        <div>
                            <div style="color: var(--text-secondary); font-size: 0.9rem;">Статус:</div>
                            <div style="color: var(--success-color); font-weight: 600;">
                                ${deposit.status === 'ACTIVE' ? '🟢 Активен' : '🔴 Завершен'}
                            </div>
                        </div>
                    </div>
                    
                    <div style="background: var(--bg-secondary); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                        <div style="color: var(--warning-color); font-weight: 600; margin-bottom: 0.5rem;">
                            Прогресс: ${progress.toFixed(1)}%
                        </div>
                        <div style="background: var(--bg-primary); height: 8px; border-radius: 4px; overflow: hidden;">
                            <div style="background: var(--success-color); height: 100%; width: ${progress}%; transition: width 0.3s ease;"></div>
                        </div>
                        <div style="color: var(--text-secondary); font-size: 0.8rem; margin-top: 0.5rem;">
                            ${daysPassed} из ${plan.days} дней прошло
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div style="text-align: center; padding: 0.8rem; background: var(--bg-secondary); border-radius: 6px;">
                            <div style="color: var(--text-secondary); font-size: 0.8rem;">Заработано:</div>
                            <div style="color: var(--success-color); font-weight: 600;">$${earnedProfit.toFixed(2)}</div>
                        </div>
                        <div style="text-align: center; padding: 0.8rem; background: var(--bg-secondary); border-radius: 6px;">
                            <div style="color: var(--text-secondary); font-size: 0.8rem;">Осталось:</div>
                            <div style="color: var(--warning-color); font-weight: 600;">$${remainingProfit.toFixed(2)}</div>
                        </div>
                    </div>
                </div>
                
                <div style="background: var(--bg-primary); padding: 1.5rem; border-radius: 12px; margin-bottom: 1.5rem;">
                    <h4 style="color: var(--secondary-color); margin-bottom: 1rem;">📊 Финансовые показатели</h4>
                    <div style="display: flex; flex-direction: column; gap: 0.8rem;">
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: var(--text-secondary);">Ежедневный доход:</span>
                            <span style="color: var(--primary-color); font-weight: 600;">$${dailyProfit.toFixed(2)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: var(--text-secondary);">Общая прибыль:</span>
                            <span style="color: var(--success-color); font-weight: 600;">$${totalProfit.toFixed(2)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: var(--text-secondary);">Общий возврат:</span>
                            <span style="color: var(--warning-color); font-weight: 600;">$${(deposit.amount + totalProfit).toFixed(2)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: var(--text-secondary);">ROI:</span>
                            <span style="color: var(--gold-color); font-weight: 600;">${((totalProfit / deposit.amount) * 100).toFixed(1)}%</span>
                        </div>
                    </div>
                </div>
                
                <div style="background: var(--bg-primary); padding: 1.5rem; border-radius: 12px; margin-bottom: 1.5rem;">
                    <h4 style="color: var(--text-primary); margin-bottom: 1rem;">🔗 Информация о транзакции</h4>
                    <div style="display: flex; flex-direction: column; gap: 0.8rem;">
                        <div>
                            <div style="color: var(--text-secondary); font-size: 0.8rem;">Hash транзакции:</div>
                            <div style="font-family: monospace; font-size: 0.9rem; color: var(--secondary-color); word-break: break-all;">
                                ${txHash}
                            </div>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: var(--text-secondary);">Дата создания:</span>
                            <span style="color: var(--text-primary);">${deposit.timestamp.toLocaleDateString()}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: var(--text-secondary);">Дата завершения:</span>
                            <span style="color: var(--text-primary);">${deposit.endDate.toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
                
                <div style="display: flex; gap: 1rem; justify-content: center;">
                    <button onclick="window.CabinetDepositService.viewInBlockchain('${txHash}')" 
                            class="btn-secondary" style="padding: 0.8rem 1.5rem;">
                        🌐 Просмотр в BSCScan
                    </button>
                    <button onclick="window.CabinetDepositService.copyDepositInfo('${txHash}')" 
                            class="btn-outline" style="padding: 0.8rem 1.5rem;">
                        📋 Копировать данные
                    </button>
                </div>
            </div>
        `;
        
        this.showModal('Детали депозита', modalContent);
    },
    
    // MCP-MARKER:METHOD:VIEW_IN_BLOCKCHAIN - Просмотр в блокчейне
    viewInBlockchain(txHash) {
        const url = `https://bscscan.com/tx/${txHash}`;
        window.open(url, '_blank');
        
        if (window.GenesisTerminal) {
            window.GenesisTerminal.log(`🌐 Открыт BSCScan для транзакции: ${txHash.substring(0, 10)}...`, 'info');
        }
    },
    
    // MCP-MARKER:METHOD:COPY_DEPOSIT_INFO - Копирование информации о депозите
    copyDepositInfo(txHash) {
        const deposit = this.userDeposits.find(d => d.txHash === txHash);
        if (!deposit) return;
        
        const plan = window.GENESIS_CONFIG.depositPlans.find(p => p.id === deposit.planId);
        const info = `
GENESIS 1.1 - Информация о депозите

План: ${plan.name}
Инвестиция: $${deposit.amount.toFixed(2)} ${deposit.tokenType}
Доходность: ${plan.percentage}%
Срок: ${plan.days} дней
Транзакция: ${txHash}
Дата создания: ${deposit.timestamp.toLocaleDateString()}
Статус: ${deposit.status}

Создано в GENESIS 1.1 DeFi Platform
        `.trim();
        
        navigator.clipboard.writeText(info).then(() => {
            this.showNotification('📋 Скопировано', 'Информация о депозите скопирована в буфер обмена', 'success');
        }).catch(err => {
            console.error('Ошибка копирования:', err);
        });
    },
    
    // MCP-MARKER:METHOD:VIEW_PLAN_DETAILS - Просмотр деталей плана
    viewPlanDetails(planId) {
        const plan = window.GENESIS_CONFIG.depositPlans.find(p => p.id === planId);
        if (!plan) {
            alert('❌ План не найден');
            return;
        }
        
        const userDepositsForPlan = this.userDeposits.filter(d => d.planId === planId);
        const profit = (plan.usdtAmount * plan.percentage / 100) - plan.usdtAmount;
        const dailyProfit = profit / plan.days;
        
        const modalContent = `
            <div style="max-width: 600px; margin: 0 auto;">
                <h3 style="color: var(--primary-color); margin-bottom: 1.5rem; text-align: center;">
                    ${this.getPlanIcon(plan.name)} Детали плана: ${plan.name}
                </h3>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem;">
                    <div style="background: var(--bg-primary); padding: 1.5rem; border-radius: 12px;">
                        <h4 style="color: var(--secondary-color); margin-bottom: 1rem;">📊 Основные параметры</h4>
                        <div style="display: flex; flex-direction: column; gap: 0.8rem;">
                            <div style="display: flex; justify-content: space-between;">
                                <span style="color: var(--text-secondary);">Инвестиция:</span>
                                <span style="color: var(--text-primary); font-weight: 600;">$${plan.usdtAmount}</span>
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
                                <span style="color: var(--text-secondary);">Валюты:</span>
                                <span style="color: var(--secondary-color); font-weight: 600;">${plan.currencies.join(', ')}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div style="background: var(--bg-primary); padding: 1.5rem; border-radius: 12px;">
                        <h4 style="color: var(--primary-color); margin-bottom: 1rem;">💰 Расчет прибыли</h4>
                        <div style="display: flex; flex-direction: column; gap: 0.8rem;">
                            <div style="display: flex; justify-content: space-between;">
                                <span style="color: var(--text-secondary);">Ежедневно:</span>
                                <span style="color: var(--primary-color); font-weight: 600;">$${dailyProfit.toFixed(2)}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span style="color: var(--text-secondary);">Общая прибыль:</span>
                                <span style="color: var(--success-color); font-weight: 600;">$${profit.toFixed(2)}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span style="color: var(--text-secondary);">Общий возврат:</span>
                                <span style="color: var(--gold-color); font-weight: 600;">$${(plan.usdtAmount + profit).toFixed(2)}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span style="color: var(--text-secondary);">ROI:</span>
                                <span style="color: var(--warning-color); font-weight: 600;">${((profit / plan.usdtAmount) * 100).toFixed(1)}%</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div style="background: var(--bg-primary); padding: 1.5rem; border-radius: 12px; margin-bottom: 1.5rem;">
                    <h4 style="color: var(--text-primary); margin-bottom: 1rem;">📝 Описание</h4>
                    <p style="color: var(--text-secondary); line-height: 1.6; margin-bottom: 1rem;">
                        ${plan.description}
                    </p>
                    
                    ${userDepositsForPlan.length > 0 ? `
                        <div style="margin-top: 1.5rem;">
                            <h5 style="color: var(--success-color); margin-bottom: 0.5rem;">✅ Ваши депозиты по этому плану:</h5>
                            ${userDepositsForPlan.map(deposit => `
                                <div style="background: var(--bg-secondary); padding: 0.8rem; border-radius: 6px; margin-bottom: 0.5rem;">
                                    <div style="display: flex; justify-content: space-between; align-items: center;">
                                        <span style="color: var(--text-primary);">$${deposit.amount.toFixed(2)} ${deposit.tokenType}</span>
                                        <span style="color: var(--success-color); font-size: 0.8rem;">${deposit.status}</span>
                                    </div>
                                    <div style="color: var(--text-secondary); font-size: 0.8rem; margin-top: 0.3rem;">
                                        ${deposit.timestamp.toLocaleDateString()}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : `
                        <div style="background: rgba(0, 212, 255, 0.1); padding: 1rem; border-radius: 8px; border: 1px solid var(--secondary-color); margin-top: 1rem;">
                            <div style="color: var(--secondary-color); font-weight: 600; margin-bottom: 0.5rem;">💡 Этот план еще не приобретен</div>
                            <div style="color: var(--text-secondary); font-size: 0.9rem;">
                                Вы можете создать депозит по этому плану, если выполнены все условия последовательности.
                            </div>
                        </div>
                    `}
                </div>
                
                <div style="display: flex; gap: 1rem; justify-content: center;">
                    ${userDepositsForPlan.length === 0 && !this.isPlanLocked(plan, this.userDeposits.map(d => d.planId)) ? `
                        <button onclick="window.CabinetDepositService.startDepositProcess('${planId}'); window.CabinetDepositService.closeModal();" 
                                class="btn" style="padding: 0.8rem 1.5rem;">
                            💰 Создать депозит
                        </button>
                    ` : ''}
                    <button onclick="window.CabinetDepositService.closeModal()" 
                            class="btn-outline" style="padding: 0.8rem 1.5rem;">
                        ✕ Закрыть
                    </button>
                </div>
            </div>
        `;
        
        this.showModal('Детали плана', modalContent);
    },
    
    // MCP-MARKER:METHOD:SHOW_MODAL - Показ модального окна
    showModal(title, content) {
        // Удаляем существующее модальное окно
        const existingModal = document.getElementById('deposit-details-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        const modalHTML = `
            <div id="deposit-details-modal" class="modal-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.8); display: flex; justify-content: center; align-items: center; z-index: 1000;">
                <div class="modal-container" style="background: var(--bg-secondary); border-radius: 15px; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5); border: 1px solid var(--border-color); width: 90%; max-width: 800px; max-height: 90vh; overflow-y: auto;">
                    <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; padding: 1.5rem 2rem; border-bottom: 1px solid var(--border-color);">
                        <h3 style="color: var(--primary-color); margin: 0; font-family: 'Orbitron', monospace;">${title}</h3>
                        <button onclick="window.CabinetDepositService.closeModal()" style="background: none; border: none; color: var(--text-secondary); font-size: 2rem; cursor: pointer; line-height: 1; padding: 0; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;">&times;</button>
                    </div>
                    <div class="modal-content" style="padding: 2rem;">
                        ${content}
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    },
    
    // MCP-MARKER:METHOD:CLOSE_MODAL - Закрытие модального окна
    closeModal() {
        const modal = document.getElementById('deposit-details-modal');
        if (modal) {
            modal.remove();
        }
    },
    
    // MCP-MARKER:METHOD:SHOW_NOTIFICATION - Показ уведомления
    showNotification(title, message, type = 'info') {
        if (window.GenesisCabinet && window.GenesisCabinet.showNotification) {
            window.GenesisCabinet.showNotification(title, message, type);
        } else {
            alert(`${title}\n${message}`);
        }
    },
    
    // MCP-MARKER:METHOD:REFRESH_DATA - Обновление данных
    async refreshData() {
        if (this.isLoading) return;
        
        try {
            if (window.GenesisTerminal) {
                window.GenesisTerminal.log('🔄 Обновление данных депозитов...', 'info');
            }
            
            await this.loadUserData();
            
            this.showNotification('✅ Данные обновлены', 'Информация о депозитах успешно обновлена', 'success');
        } catch (error) {
            console.error('Ошибка обновления данных:', error);
            this.showNotification('❌ Ошибка обновления', error.message, 'error');
        }
    },
    
    // MCP-MARKER:UTILITY_METHODS - Утилиты
    
    // Получение иконки плана
    getPlanIcon(planName) {
        const icons = {
            'TRIAL': '🧪',
            'STARTER': '🚀',
            'PROGRESSIVE1': '📈',
            'PROGRESSIVE2': '💫',
            'PROGRESSIVE3': '⭐',
            'PROGRESSIVE4': '🌟',
            'PROGRESSIVE5': '✨',
            'PROGRESSIVE6': '💎',
            'PROGRESSIVE7': '👑',
            'PROGRESSIVE8': '🏆',
            'RECOMMENDED': '🎯',
            'PLATINUM': '🥈',
            'MAXIMUM': '🥇'
        };
        return icons[planName] || '💰';
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
    
    // Получение статистики для экспорта
    getStatsForExport() {
        const stats = this.calculatePortfolioStats();
        return {
            ...stats,
            depositsCount: this.userDeposits.length,
            lastUpdate: this.lastUpdate,
            userAddress: this.currentUser
        };
    }
};

// MCP-MARKER:GLOBAL_FUNCTIONS - Глобальные функции
window.refreshCabinetDeposits = () => window.CabinetDepositService.refreshData();

console.log('💼 GENESIS Cabinet Deposit Service loaded');
