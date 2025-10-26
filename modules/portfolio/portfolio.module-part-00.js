// modules/portfolio/portfolio.module.js
import PortfolioState from './portfolio.state.js';

export default class PortfolioModule {
    constructor() {
        this.name = 'portfolio';
        this.version = '1.0.0';
        this.dependencies = ['auth'];
        
        this.state = null;
        this.container = null;
        this.context = null;
        this.subscriptions = [];
        this.chartInstance = null;
        this.updateInterval = null;
    }
    
    async init(context) {
        console.log('📊 Initializing Portfolio Module...');
        
        this.context = context;
        this.container = context.container;
        
        try {
            // Инициализация состояния
            this.state = new PortfolioState();
            
            // Загрузка шаблона
            await this.loadTemplate();
            
            // Загрузка стилей
            await this.loadStyles();
            
            // Инициализация обработчиков
            this.initEventHandlers();
            
            // Подписка на события
            this.subscribeToEvents();
            
            // Загрузка данных портфолио
            await this.loadPortfolioData();
            
            // Рендеринг
            this.render();
            
            // Запуск автообновления
            this.startAutoUpdate();
            
            console.log('✅ Portfolio Module initialized');
            return this;
            
        } catch (error) {
            console.error('❌ Failed to initialize Portfolio Module:', error);
            throw error;
        }
    }
    
    async loadTemplate() {
        try {
            const response = await fetch('/modules/portfolio/portfolio.template.html');
            const html = await response.text();
            this.container.innerHTML = html;
        } catch (error) {
            console.error('Failed to load portfolio template:', error);
            this.container.innerHTML = '<div class="error">Не удалось загрузить шаблон портфолио</div>';
        }
    }
    
    async loadStyles() {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/modules/portfolio/portfolio.styles.css';
        link.dataset.module = this.name;
        document.head.appendChild(link);
    }
    
    initEventHandlers() {
        // Переключение вида (таблица/карточки)
        const viewToggle = this.container.querySelectorAll('.view-toggle button');
        viewToggle.forEach(btn => {
            btn.addEventListener('click', () => this.switchView(btn.dataset.view));
        });
        
        // Фильтры
        const filterButtons = this.container.querySelectorAll('.filter-button');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => this.applyFilter(btn.dataset.filter));
        });
        
        // Период графика
        const chartPeriods = this.container.querySelectorAll('.chart-period');
        chartPeriods.forEach(btn => {
            btn.addEventListener('click', () => this.changeChartPeriod(btn.dataset.period));
        });
        
        // Экспорт данных
        const exportBtn = this.container.querySelector('#export-portfolio');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportPortfolio());
        }
    }
    
    subscribeToEvents() {
        if (this.context.eventBus) {
            // Подписка на создание депозита
            this.subscriptions.push(
                this.context.eventBus.on('deposit:created', () => {
                    this.loadPortfolioData();
                })
            );
            
            // Подписка на изменение баланса
            this.subscriptions.push(
                this.context.eventBus.on('balance:changed', (data) => {
                    this.state.updateBalance(data.balance);
                    this.updateBalanceDisplay();
                })
            );
            
            // Подписка на завершение депозита
            this.subscriptions.push(
                this.context.eventBus.on('deposit:completed', () => {
                    this.loadPortfolioData();
                })
            );
        }
    }
    
    async loadPortfolioData() {
        try {
            const userAddress = this.context.store?.get('user.address');
            if (!userAddress) {
                console.warn('No user address found');
                return;
            }
            
            // Загрузка депозитов из localStorage (в реальной системе из блокчейна)
            const deposits = this.getStoredDeposits(userAddress);
            
            // Расчет статистики портфолио
            const stats = this.calculatePortfolioStats(deposits);
            this.state.setStatistics(stats);
            
            // Сохранение депозитов
            this.state.setDeposits(deposits);
            
            // Расчет распределения активов
            const distribution = this.calculateAssetDistribution(deposits);
            this.state.setAssetDistribution(distribution);
            
        } catch (error) {
            console.error('Failed to load portfolio data:', error);
        }
    }
    
    calculatePortfolioStats(deposits) {
        let totalInvested = 0;
        let totalEarned = 0;
        let activeDeposits = 0;
        let completedDeposits = 0;
        let totalProfit = 0;
        let dailyIncome = 0;
        
        deposits.forEach(deposit => {
            const usdAmount = deposit.currency === 'USDT' ? 
                deposit.amount : 
                window.convertPlexToUSD(deposit.amount);
            
            if (deposit.status === 'ACTIVE') {
                totalInvested += usdAmount;
                activeDeposits++;
                
                const plan = window.getDepositPlanById(deposit.planId);
                if (plan) {
                    const dayProfit = (usdAmount * (plan.percentage - 100) / 100) / plan.days;
                    dailyIncome += dayProfit;
                }
            } else if (deposit.status === 'COMPLETED') {
                completedDeposits++;
                const profit = deposit.profit || 0;
                const usdProfit = deposit.currency === 'USDT' ? 
                    profit : 
                    window.convertPlexToUSD(profit);
                totalEarned += usdProfit;
                totalProfit += usdProfit;
            }
        });
        
        // Расчет ROI
        const roi = totalInvested > 0 ? (totalProfit / totalInvested * 100) : 0;
        
        // Расчет среднего дохода
        const avgDailyIncome = activeDeposits > 0 ? dailyIncome : 0;
        
        return {
            totalInvested,
            totalEarned,
            totalProfit,
            activeDeposits,
            completedDeposits,
            totalDeposits: deposits.length,
            roi,
            dailyIncome,
            avgDailyIncome,
            projectedMonthly: dailyIncome * 30,
            projectedYearly: dailyIncome * 365
        };
    }
    
    calculateAssetDistribution(deposits) {
        const distribution = {
            USDT: 0,
            PLEX: 0
        };
        
        deposits.forEach(deposit => {
            if (deposit.status === 'ACTIVE') {
                const usdAmount = deposit.currency === 'USDT' ? 
                    deposit.amount : 
                    window.convertPlexToUSD(deposit.amount);
                
                distribution[deposit.currency] += usdAmount;
            }
        });
        
        return distribution;
    }
    
    render() {
        this.renderStatistics();
        this.renderAssetDistribution();
        this.renderDepositsList();
        this.renderPerformanceChart();
        this.renderProjections();
    }
    
    renderStatistics() {
        const stats = this.state.getStatistics();
        
        // Обновление статистических карточек
        this.updateStatCard('total-invested', `$${stats.totalInvested.toFixed(2)}`);
        this.updateStatCard('total-earned', `$${stats.totalEarned.toFixed(2)}`);
        this.updateStatCard('total-profit', `$${stats.totalProfit.toFixed(2)}`);
        this.updateStatCard('roi', `${stats.roi.toFixed(2)}%`);
        this.updateStatCard('daily-income', `$${stats.dailyIncome.toFixed(2)}`);
        this.updateStatCard('active-deposits', stats.activeDeposits);
    }
    
    updateStatCard(id, value) {
        const element = this.container.querySelector(`#${id}`);
        if (element) {
            element.textContent = value;
        }
    }
    
    renderAssetDistribution() {
        const container = this.container.querySelector('#asset-distribution');
        if (!container) return;
        
        const distribution = this.state.getAssetDistribution();
        const total = distribution.USDT + distribution.PLEX;
        
        if (total === 0) {
            container.innerHTML = `
                <div class="no-assets">
                    <p>Нет активных инвестиций</p>
                </div>
            `;
            return;
        }
        
        const usdtPercent = (distribution.USDT / total * 100).toFixed(1);
        const plexPercent = (distribution.PLEX / total * 100).toFixed(1);
        
        container.innerHTML = `
            <div class="distribution-chart">
                <div class="chart-donut">
                    <svg viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#333" stroke-width="20"/>
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#4ade80" stroke-width="20"
                                stroke-dasharray="${usdtPercent * 2.51} 251"
                                transform="rotate(-90 50 50)"/>
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#ff6b35" stroke-width="20"
                                stroke-dasharray="${plexPercent * 2.51} 251"
                                stroke-dashoffset="${-usdtPercent * 2.51}"
                                transform="rotate(-90 50 50)"/>
                    </svg>
                    <div class="chart-center">
                        <div class="total-value">$${total.toFixed(2)}</div>
                        <div class="total-label">Всего</div>
                    </div>
                </div>
                <div class="distribution-legend">
                    <div class="legend-item">
                        <span class="legend-color" style="background: #4ade80"></span>
                        <span class="legend-label">USDT</span>
                        <span class="legend-value">${usdtPercent}%</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-color" style="background: #ff6b35"></span>
                        <span class="legend-label">PLEX</span>
                        <span class="legend-value">${plexPercent}%</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderDepositsList() {
        const container = this.container.querySelector('#deposits-list');
        if (!container) return;
        
        const deposits = this.state.getFilteredDeposits();
        
        if (deposits.length === 0) {
            container.innerHTML = `
                <div class="no-deposits">
                    <p>Нет депозитов для отображения</p>
                    <button class="btn btn-primary" onclick="window.router.navigate('/deposits')">
                        Создать депозит
                    </button>
                </div>
            `;
            return;
        }
        
        const viewType = this.state.getViewType();
        
        if (viewType === 'table') {
            this.renderDepositsTable(container, deposits);
        } else {
            this.renderDepositsCards(container, deposits);
        }
    }
    
    renderDepositsTable(container, deposits) {
        container.innerHTML = `
            <table class="deposits-table">
                <thead>
                    <tr>
                        <th>План</th>
                        <th>Сумма</th>
                        <th>Валюта</th>
                        <th>Статус</th>
                        <th>Прогресс</th>
                        <th>Заработано</th>
                        <th>Дата создания</th>
                    </tr>
                </thead>
                <tbody>
                    ${deposits.map(deposit => this.renderDepositRow(deposit)).join('')}
                </tbody>
            </table>
        `;
    }
    
    renderDepositRow(deposit) {
        const plan = window.getDepositPlanById(deposit.planId);
        const progress = this.calculateProgress(deposit);
        const earned = this.calculateEarned(deposit);
        
        return `
            <tr class="deposit-row ${deposit.status.toLowerCase()}">
                <td>${plan ? plan.title : deposit.planId}</td>
                <td>${deposit.amount}</td>
                <td>${deposit.currency}</td>
                <td><span class="status-badge status-${deposit.status.toLowerCase()}">${deposit.status}</span></td>
                <td>
                    <div class="progress-cell">
                        <div class="progress-bar" style="width: ${progress}%"></div>
                        <span>${progress}%</span>
                    </div>
                </td>
                <td class="earned">+${earned.toFixed(2)}</td>
                <td>${new Date(deposit.createdAt).toLocaleDateString()}</td>
            </tr>
        `;
    }
    
    renderDepositsCards(container, deposits) {
        container.innerHTML = `
            <div class="deposits-grid">
                ${deposits.map(deposit => this.renderDepositCard(deposit)).join('')}
            </div>
        `;
    }
    
    renderDepositCard(deposit) {
        const plan = window.getDepositPlanById(deposit.planId);
        const progress = this.calculateProgress(deposit);
        const earned = this.calculateEarned(deposit);
        
        return `
            <div class="deposit-card ${deposit.status.toLowerCase()}">
                <div class="card-header">
                    <h3>${plan ? plan.title : deposit.planId}</h3>
                    <span class="status-badge status-${deposit.status.toLowerCase()}">${deposit.status}</span>
                </div>
                <div class="card-body">
                    <div class="card-stat">
                        <span>Инвестировано:</span>
                        <strong>${deposit.amount} ${deposit.currency}</strong>
                    </div>
                    <div class="card-stat">
                        <span>Заработано:</span>
                        <strong class="earned">+${earned.toFixed(2)} ${deposit.currency}</strong>
                    </div>
                    <div class="card-stat">
                        <span>Прогресс:</span>
                        <div class="progress-bar-container">
                            <div class="progress-bar" style="width: ${progress}%"></div>
                        </div>
                        <span>${progress}%</span>
                    </div>
                    <div class="card-stat">
                        <span>Создан:</span>
                        <span>${new Date(deposit.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderPerformanceChart() {
        const container = this.container.querySelector('#performance-chart');
        if (!container) return;
        
        // Заглушка для графика
        container.innerHTML = `
            <div class="chart-placeholder">
                <p>📈 График доходности появится после первых начислений</p>
            </div>
        `;
    }
    
    renderProjections() {
        const container = this.container.querySelector('#projections');
        if (!container) return;
        
        const stats = this.state.getStatistics();
        
        container.innerHTML = `
            <h3>Прогноз доходов</h3>
            <div class="projections-grid">
                <div class="projection-item">
                    <span class="projection-label">Ежедневно:</span>
                    <span class="projection-value">$${stats.dailyIncome.toFixed(2)}</span>
                </div>
                <div class="projection-item">
                    <span class="projection-label">Еженедельно:</span>
