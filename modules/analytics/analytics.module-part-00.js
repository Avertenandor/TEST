// modules/analytics/analytics.module.js
// MCP-MARKER:MODULE:ANALYTICS:MAIN - Основной класс модуля аналитики

import AnalyticsAPI from './analytics.api.js';
import AnalyticsState from './analytics.state.js';
import ChartManager from './components/chart-manager.js';
import MetricsPanel from './components/metrics-panel.js';
import ReportsGenerator from './components/reports-generator.js';

export default class AnalyticsModule {
    constructor() {
        this.name = 'analytics';
        this.version = '1.0.0';
        this.dependencies = ['auth', 'platform-access', 'deposits', 'transactions'];
        
        this.state = null;
        this.api = null;
        this.components = new Map();
        this.subscriptions = [];
        this.charts = new Map();
        this.updateInterval = null;
    }
    
    // MCP-MARKER:METHOD:ANALYTICS:INIT - Инициализация модуля
    async init(context) {
        this.context = context;
        this.container = context.container;
        
        try {
            // Инициализация состояния
            this.state = new AnalyticsState();
            await this.state.load();
            
            // Инициализация API
            this.api = new AnalyticsAPI(context.config);
            
            // Загрузка шаблона
            await this.loadTemplate();
            
            // Загрузка стилей
            await this.loadStyles();
            
            // Инициализация компонентов
            await this.initComponents();
            
            // Инициализация обработчиков событий
            this.initEventHandlers();
            
            // Подписка на глобальные события
            this.subscribeToEvents();
            
            // Загрузка и обработка данных
            await this.loadAnalyticsData();
            
            // Инициализация графиков
            await this.initCharts();
            
            // Запуск автоматического обновления
            this.startAutoUpdate();
            
            return this;
            
        } catch (error) {
            console.error('[AnalyticsModule] Ошибка инициализации:', error);
            this.showError('Ошибка загрузки модуля аналитики');
            throw error;
        }
    }
    
    // MCP-MARKER:METHOD:ANALYTICS:LOAD_TEMPLATE - Загрузка HTML шаблона
    async loadTemplate() {
        try {
            const response = await fetch('/modules/analytics/analytics.template.html');
            const html = await response.text();
            this.container.innerHTML = html;
        } catch (error) {
            console.error('[AnalyticsModule] Ошибка загрузки шаблона:', error);
            throw error;
        }
    }
    
    // MCP-MARKER:METHOD:ANALYTICS:LOAD_STYLES - Загрузка стилей модуля
    async loadStyles() {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/modules/analytics/analytics.styles.css';
        link.dataset.module = this.name;
        document.head.appendChild(link);
    }
    
    // MCP-MARKER:METHOD:ANALYTICS:INIT_COMPONENTS - Инициализация компонентов
    async initComponents() {
        // Менеджер графиков
        const chartContainer = this.container.querySelector('#charts-container');
        if (chartContainer) {
            const chartManager = new ChartManager(chartContainer, this.state);
            this.components.set('chartManager', chartManager);
        }
        
        // Панель метрик
        const metricsContainer = this.container.querySelector('#metrics-container');
        if (metricsContainer) {
            const metricsPanel = new MetricsPanel(metricsContainer, this.state);
            this.components.set('metricsPanel', metricsPanel);
        }
        
        // Генератор отчетов
        const reportsContainer = this.container.querySelector('#reports-container');
        if (reportsContainer) {
            const reportsGenerator = new ReportsGenerator(reportsContainer, this.state);
            this.components.set('reportsGenerator', reportsGenerator);
        }
    }
    
    // MCP-MARKER:METHOD:ANALYTICS:INIT_HANDLERS - Инициализация обработчиков
    initEventHandlers() {
        // Переключатели периодов
        const periodButtons = this.container.querySelectorAll('.period-btn');
        periodButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const period = e.target.dataset.period;
                this.handlePeriodChange(period);
            });
        });
        
        // Переключатели типов графиков
        const chartTypeButtons = this.container.querySelectorAll('.chart-type-btn');
        chartTypeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const chartType = e.target.dataset.chartType;
                this.handleChartTypeChange(chartType);
            });
        });
        
        // Кнопка обновления
        const refreshBtn = this.container.querySelector('.btn-refresh');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.handleRefresh());
        }
        
        // Кнопка экспорта
        const exportBtn = this.container.querySelector('.btn-export');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.handleExport());
        }
        
        // Переключатели метрик
        const metricToggles = this.container.querySelectorAll('.metric-toggle');
        metricToggles.forEach(toggle => {
            toggle.addEventListener('change', (e) => {
                const metric = e.target.dataset.metric;
                const enabled = e.target.checked;
                this.handleMetricToggle(metric, enabled);
            });
        });
    }
    
    // MCP-MARKER:METHOD:ANALYTICS:SUBSCRIBE_EVENTS - Подписка на события
    subscribeToEvents() {
        this.subscriptions.push(
            this.context.eventBus.on('deposit:created', (data) => {
                this.handleNewDeposit(data);
            }),
            
            this.context.eventBus.on('deposit:matured', (data) => {
                this.handleDepositMatured(data);
            }),
            
            this.context.eventBus.on('transaction:completed', (data) => {
                this.updateTransactionMetrics(data);
            }),
            
            this.context.eventBus.on('user:logout', () => {
                this.handleLogout();
            })
        );
    }
    
    // MCP-MARKER:METHOD:ANALYTICS:LOAD_DATA - Загрузка данных аналитики
    async loadAnalyticsData() {
        try {
            this.showLoader();
            
            // Получаем адрес пользователя
            const userAddress = this.context.store.get('user.address');
            if (!userAddress) {
                throw new Error('Адрес пользователя не найден');
            }
            
            // Загружаем данные из разных источников
            const [deposits, transactions, portfolio, earnings] = await Promise.all([
                this.api.getDepositsAnalytics(userAddress),
                this.api.getTransactionsAnalytics(userAddress),
                this.api.getPortfolioAnalytics(userAddress),
                this.api.getEarningsAnalytics(userAddress)
            ]);
            
            // Сохраняем в состояние
            this.state.setDepositsData(deposits);
            this.state.setTransactionsData(transactions);
            this.state.setPortfolioData(portfolio);
            this.state.setEarningsData(earnings);
            
            // Вычисляем производные метрики
            this.calculateDerivedMetrics();
            
            // Обновляем UI
            this.updateUI();
            
        } catch (error) {
            console.error('[AnalyticsModule] Ошибка загрузки данных:', error);
            this.showError('Не удалось загрузить данные аналитики');
        } finally {
            this.hideLoader();
        }
    }
    
    // MCP-MARKER:METHOD:ANALYTICS:INIT_CHARTS - Инициализация графиков
    async initCharts() {
        const chartManager = this.components.get('chartManager');
        if (!chartManager) return;
        
        // График доходности
        const earningsChart = await chartManager.createChart('earnings', {
            type: 'line',
            title: 'Доходность по дням',
            data: this.state.getEarningsChartData()
        });
        this.charts.set('earnings', earningsChart);
        
        // График депозитов
        const depositsChart = await chartManager.createChart('deposits', {
            type: 'bar',
            title: 'Активные депозиты',
            data: this.state.getDepositsChartData()
        });
        this.charts.set('deposits', depositsChart);
        
        // График распределения портфеля
        const portfolioChart = await chartManager.createChart('portfolio', {
            type: 'doughnut',
            title: 'Распределение портфеля',
            data: this.state.getPortfolioChartData()
        });
        this.charts.set('portfolio', portfolioChart);
        
        // График ROI
        const roiChart = await chartManager.createChart('roi', {
            type: 'line',
            title: 'ROI (Return on Investment)',
            data: this.state.getROIChartData()
        });
        this.charts.set('roi', roiChart);
        
        // График транзакций
        const transactionsChart = await chartManager.createChart('transactions', {
            type: 'bar',
            title: 'История транзакций',
            data: this.state.getTransactionsChartData()
        });
        this.charts.set('transactions', transactionsChart);
    }
    
    // MCP-MARKER:METHOD:ANALYTICS:CALCULATE_METRICS - Вычисление метрик
    calculateDerivedMetrics() {
        const metrics = this.state.calculateMetrics();
        
        // Основные метрики
        this.updateMetric('total-invested', metrics.totalInvested);
        this.updateMetric('total-earned', metrics.totalEarned);
        this.updateMetric('active-deposits', metrics.activeDeposits);
        this.updateMetric('roi', metrics.roi);
        
        // Средние показатели
        this.updateMetric('avg-deposit', metrics.avgDepositAmount);
        this.updateMetric('avg-daily-income', metrics.avgDailyIncome);
        this.updateMetric('avg-roi', metrics.avgROI);
        
        // Прогнозы
        this.updateMetric('projected-monthly', metrics.projectedMonthlyEarnings);
        this.updateMetric('projected-yearly', metrics.projectedYearlyEarnings);
        
        // Рейтинги и достижения
        this.updateMetric('performance-score', metrics.performanceScore);
        this.updateMetric('risk-level', metrics.riskLevel);
    }
    
    // MCP-MARKER:METHOD:ANALYTICS:UPDATE_UI - Обновление интерфейса
    updateUI() {
        // Обновляем метрики
        const metricsPanel = this.components.get('metricsPanel');
        if (metricsPanel) {
            metricsPanel.update(this.state.getMetrics());
        }
        
        // Обновляем графики
        this.updateCharts();
        
        // Обновляем таблицы
        this.updateTables();
        
        // Обновляем прогресс-бары
        this.updateProgressBars();
    }
    
    // MCP-MARKER:METHOD:ANALYTICS:UPDATE_CHARTS - Обновление графиков
    updateCharts() {
        const chartManager = this.components.get('chartManager');
        if (!chartManager) return;
        
        this.charts.forEach((chart, name) => {
            let data;
            switch (name) {
                case 'earnings':
                    data = this.state.getEarningsChartData();
                    break;
                case 'deposits':
                    data = this.state.getDepositsChartData();
                    break;
                case 'portfolio':
                    data = this.state.getPortfolioChartData();
                    break;
                case 'roi':
                    data = this.state.getROIChartData();
                    break;
                case 'transactions':
                    data = this.state.getTransactionsChartData();
                    break;
            }
            
            if (data) {
                chartManager.updateChart(chart, data);
            }
        });
    }
    
    // MCP-MARKER:METHOD:ANALYTICS:UPDATE_TABLES - Обновление таблиц
    updateTables() {
        // Таблица топ депозитов
        const topDepositsTable = this.container.querySelector('#top-deposits-table');
        if (topDepositsTable) {
            const topDeposits = this.state.getTopDeposits(5);
            topDepositsTable.innerHTML = this.renderTopDepositsTable(topDeposits);
        }
        
        // Таблица последних транзакций
        const recentTransactionsTable = this.container.querySelector('#recent-transactions-table');
        if (recentTransactionsTable) {
            const recentTransactions = this.state.getRecentTransactions(10);
            recentTransactionsTable.innerHTML = this.renderRecentTransactionsTable(recentTransactions);
        }
    }
    
    // MCP-MARKER:METHOD:ANALYTICS:UPDATE_PROGRESS - Обновление прогресс-баров
    updateProgressBars() {
        // Прогресс к следующему уровню
        const levelProgress = this.container.querySelector('#level-progress');
        if (levelProgress) {
            const progress = this.state.getLevelProgress();
            levelProgress.style.width = `${progress}%`;
            levelProgress.textContent = `${progress}%`;
        }
        
        // Прогресс целей
        const goalsProgress = this.container.querySelectorAll('.goal-progress');
        goalsProgress.forEach(bar => {
            const goal = bar.dataset.goal;
            const progress = this.state.getGoalProgress(goal);
            bar.style.width = `${progress}%`;
        });
    }
    
    // MCP-MARKER:METHOD:ANALYTICS:HANDLE_PERIOD - Изменение периода
    handlePeriodChange(period) {
        // Обновляем активную кнопку
        const buttons = this.container.querySelectorAll('.period-btn');
        buttons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.period === period);
        });
        
        // Устанавливаем период
        this.state.setPeriod(period);
        
        // Перезагружаем данные для нового периода
        this.loadAnalyticsData();
    }
    
    // MCP-MARKER:METHOD:ANALYTICS:HANDLE_CHART_TYPE - Изменение типа графика
    handleChartTypeChange(chartType) {
        const chartManager = this.components.get('chartManager');
        if (chartManager) {
            chartManager.changeChartType(chartType);
        }
    }
    
    // MCP-MARKER:METHOD:ANALYTICS:HANDLE_METRIC_TOGGLE - Переключение метрики
    handleMetricToggle(metric, enabled) {
        this.state.setMetricEnabled(metric, enabled);
        this.updateUI();
    }
    
    // MCP-MARKER:METHOD:ANALYTICS:HANDLE_REFRESH - Обновление данных
    async handleRefresh() {
        const refreshBtn = this.container.querySelector('.btn-refresh');
        if (refreshBtn) {
            refreshBtn.classList.add('rotating');
        }
        
        await this.loadAnalyticsData();
        
        if (refreshBtn) {
            setTimeout(() => {
                refreshBtn.classList.remove('rotating');
            }, 1000);
        }
        
        this.showNotification('Данные обновлены');
    }
    
    // MCP-MARKER:METHOD:ANALYTICS:HANDLE_EXPORT - Экспорт отчета
    async handleExport() {
        const reportsGenerator = this.components.get('reportsGenerator');
        if (reportsGenerator) {
            const report = await reportsGenerator.generateReport({
                period: this.state.getPeriod(),
                metrics: this.state.getMetrics(),
                charts: this.state.getAllChartsData()
            });
            
            // Скачиваем отчет
            this.downloadReport(report);
        }
    }
    
    // MCP-MARKER:METHOD:ANALYTICS:HANDLE_NEW_DEPOSIT - Обработка нового депозита
    handleNewDeposit(data) {
        // Добавляем депозит в аналитику
        this.state.addDeposit(data);
        
        // Пересчитываем метрики
        this.calculateDerivedMetrics();
        
        // Обновляем UI
        this.updateUI();
        
        // Показываем уведомление
        this.showNotification(`Новый депозит учтен в аналитике: $${data.amount}`);
    }
    
    // MCP-MARKER:METHOD:ANALYTICS:HANDLE_DEPOSIT_MATURED - Депозит завершен
