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
