// modules/how-it-works/how-it-works.module.js
// Модуль "Как все устроено" - подробное описание работы платформы GENESIS

export default class HowItWorksModule {
    constructor() {
        this.name = 'how-it-works';
        this.version = '1.0.0';
        this.dependencies = [];
        
        this.container = null;
        this.context = null;
        this.activeTab = 'overview';
    }
    
    async init(context) {
        console.log('🛠️ Initializing How It Works Module...');
        
        this.context = context;
        this.container = context.container;
        
        try {
            // 1. Загрузка шаблона
            await this.loadTemplate();
            
            // 2. Загрузка стилей
            await this.loadStyles();
            
            // 3. Инициализация обработчиков
            this.initEventHandlers();
            
            // 4. Отображение первой вкладки
            this.showTab('overview');
            
            console.log('✅ How It Works Module initialized successfully');
            
            return this;
            
        } catch (error) {
            console.error('❌ Failed to initialize How It Works Module:', error);
            throw error;
        }
    }
    
    async loadTemplate() {
        try {
            const response = await fetch('/modules/how-it-works/how-it-works.template.html');
            if (response.ok) {
                const html = await response.text();
                this.container.innerHTML = html;
            } else {
                throw new Error('Failed to load template');
            }
        } catch (error) {
            console.error('Failed to load how-it-works template:', error);
            // Используем встроенный шаблон
            this.container.innerHTML = this.getTemplate();
        }
    }
    
    async loadStyles() {
        const existingLink = document.querySelector(`link[data-module="${this.name}"]`);
        if (existingLink) return;
        
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/modules/how-it-works/how-it-works.styles.css';
        link.dataset.module = this.name;
        document.head.appendChild(link);
    }
    
    initEventHandlers() {
        // Обработчики для табов
        const tabButtons = this.container.querySelectorAll('.tab-button');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabId = e.target.dataset.tab;
                this.showTab(tabId);
            });
        });
        
        // Обработчики для аккордеона FAQ
        const faqItems = this.container.querySelectorAll('.faq-item');
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            if (question) {
                question.addEventListener('click', () => {
                    item.classList.toggle('active');
                });
            }
        });
        
        // Обработчики для кнопок действий
        const actionButtons = this.container.querySelectorAll('.action-button');
        actionButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                this.handleAction(action);
            });
        });
    }
    
    showTab(tabId) {
        // Обновляем активную кнопку
        const tabButtons = this.container.querySelectorAll('.tab-button');
        tabButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabId);
        });
        
        // Показываем нужный контент
        const tabContents = this.container.querySelectorAll('.tab-content');
        tabContents.forEach(content => {
            content.classList.toggle('active', content.id === `tab-${tabId}`);
        });
        
        this.activeTab = tabId;
    }
    
    handleAction(action) {
        switch(action) {
            case 'start-deposit':
                if (this.context.router) {
                    this.context.router.navigate('/deposits');
                }
                break;
                
            case 'view-analytics':
                if (this.context.router) {
                    this.context.router.navigate('/analytics');
                }
                break;
                
            case 'check-bonuses':
                if (this.context.router) {
                    this.context.router.navigate('/bonuses');
                }
                break;
                
            case 'start-mev':
                if (this.context.router) {
                    this.context.router.navigate('/mining-rent');
                }
                break;
                
            case 'view-mev-stats':
                if (this.context.router) {
                    this.context.router.navigate('/analytics');
                }
                break;
                
            default:
                console.log('Unknown action:', action);
        }
    }
    
    getTemplate() {
        return `
            <div class="how-it-works-module">
                <div class="module-header">
                    <h1>🛠️ Как все устроено</h1>
                    <p class="subtitle">Подробное руководство по работе с платформой GENESIS</p>
                </div>
                
                <div class="tabs-container">
                    <div class="tabs-nav">
                        <button class="tab-button active" data-tab="overview">Обзор</button>
                        <button class="tab-button" data-tab="steps">Этапы работы</button>
                        <button class="tab-button" data-tab="mev-bots">MEV-боты</button>
                        <button class="tab-button" data-tab="architecture">Архитектура</button>
                        <button class="tab-button" data-tab="multipliers">Множители</button>
                        <button class="tab-button" data-tab="security">Безопасность</button>
                        <button class="tab-button" data-tab="faq">FAQ</button>
                    </div>
                    
                    <div class="tabs-content">
                        <!-- Вкладка: Обзор -->
                        <div id="tab-overview" class="tab-content active">
                            <div class="info-banner">
                                <div class="info-icon">💎</div>
                                <div class="info-content">
                                    <h3>GENESIS 1.1 - Экосистема криптовалютных доходов</h3>
                                    <p>GENESIS - это децентрализованная платформа на блокчейне BSC, которая предоставляет возможности для получения пассивного и активного дохода через инновационные финансовые инструменты.</p>
                                </div>
                            </div>
                            
                            <!-- Основные типы доходов -->
                            <div class="income-types">
                                <div class="income-type passive">
                                    <div class="income-header">
                                        <span class="income-icon">🏖️</span>
                                        <h4>Пассивный доход</h4>
                                    </div>
                                    <div class="income-content">
                                        <p>Доходы без активного участия:</p>
                                        <ul>
                                            <li><strong>Аренда мощностей устройства</strong> - автоматический доход от вычислительных ресурсов</li>
                                            <li><strong>Депозитные программы</strong> - от 110% до 300% годовых</li>
                                            <li><strong>Партнерская программа 3 уровня</strong> - 5% от вложений и дохода рефералов</li>
                                            <li><strong>Программа лояльности</strong> - дополнительные бонусы за активность</li>
                                            <li><strong>Бонусная программа</strong> - ежедневные подарки и множители</li>
                                        </ul>
                                    </div>
                                </div>
                                
                                <div class="income-type active">
                                    <div class="income-header">
                                        <span class="income-icon">⚡</span>
                                        <h4>Активный доход</h4>
                                    </div>
                                    <div class="income-content">
                                        <p>Доходы от активных операций:</p>
                                        <ul>
                                            <li><strong>MEV-боты</strong> - арбитражные роботы с доходностью десятки процентов в сутки</li>
                                            <li><strong>Множители доходности</strong> - усиление базовых доходов</li>
                                            <li><strong>Волатильность PLEX ONE токена</strong> - доходы от колебаний курса</li>
                                            <li><strong>Торговые стратегии</strong> - профессиональные алгоритмы торговли</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- MEV-боты подробно -->
                            <div class="mev-section">
                                <h4>🤖 MEV-боты: Революция в автоматической торговле</h4>
                                <div class="mev-info">
                                    <div class="mev-stats">
                                        <div class="mev-stat">
                                            <span class="stat-number">6-8</span>
                                            <span class="stat-label">секунд на сделку</span>
                                        </div>
                                        <div class="mev-stat">
                                            <span class="stat-number">24/7</span>
                                            <span class="stat-label">непрерывная работа</span>
                                        </div>
                                        <div class="mev-stat">
                                            <span class="stat-number">5 PLEX</span>
                                            <span class="stat-label">за $1 депозита в день</span>
                                        </div>
                                    </div>
                                    <div class="mev-features">
                                        <div class="mev-feature">
                                            <span class="feature-icon">🔍</span>
                                            <span class="feature-text">Все транзакции видны в блокчейне BSC</span>
                                        </div>
                                        <div class="mev-feature">
                                            <span class="feature-icon">💸</span>
                                            <span class="feature-text">Деньги поступают сразу на ваш кошелек</span>
                                        </div>
                                        <div class="mev-feature">
                                            <span class="feature-icon">🎯</span>
                                            <span class="feature-text">Профессиональные арбитражные алгоритмы</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- PLEX ONE Token -->
                            <div class="plex-section">
                                <h4>🪙 PLEX ONE Token - Сердце экосистемы</h4>
                                <div class="plex-info">
                                    <p><strong>PLEX ONE</strong> - утилити-токен экосистемы GENESIS на блокчейне Binance Smart Chain.</p>
                                    <div class="plex-uses">
                                        <div class="plex-use">
                                            <span class="use-icon">🔑</span>
                                            <span class="use-text">Авторизация в системе (1 PLEX)</span>
                                        </div>
                                        <div class="plex-use">
                                            <span class="use-icon">🤖</span>
                                            <span class="use-text">Аренда MEV-ботов</span>
                                        </div>
                                        <div class="plex-use">
                                            <span class="use-icon">📈</span>
                                            <span class="use-text">Доходы от волатильности</span>
                                        </div>
                                        <div class="plex-use">
                                            <span class="use-icon">💰</span>
                                            <span class="use-text">Депозитные программы (премиум планы)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Минимальные требования -->
                            <div class="requirements-section">
                                <h4>💡 Минимальные требования для старта</h4>
                                <div class="requirements-grid">
                                    <div class="requirement-card">
                                        <div class="req-icon">🔑</div>
                                        <div class="req-content">
                                            <h5>Авторизация</h5>
                                            <p>1 PLEX токен</p>
                                        </div>
                                    </div>
                                    <div class="requirement-card">
                                        <div class="req-icon">💰</div>
                                        <div class="req-content">
                                            <h5>Минимальный депозит</h5>
                                            <p>$25 USDT</p>
                                        </div>
                                    </div>
                                    <div class="requirement-card">
                                        <div class="req-icon">💳</div>
                                        <div class="req-content">
                                            <h5>Ежедневный доступ</h5>
                                            <p>от $10 USDT (1 USDT = 1 день)</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="steps-container">
                                <div class="step-card">
                                    <div class="step-number">1</div>
                                    <div class="step-content">
                                        <h4>Авторизация</h4>
                                        <p>Подключите свой BSC кошелек и оплатите 1 PLEX для активации аккаунта. Это единоразовый платеж для верификации.</p>
                                    </div>
                                </div>
                                
                                <div class="step-card">
                                    <div class="step-number">2</div>
                                    <div class="step-content">
                                        <h4>Доступ к платформе</h4>
                                        <p>Оплачивайте $1 USDT в день для доступа ко всем функциям платформы. Это обеспечивает работу инфраструктуры.</p>
                                    </div>
                                </div>
                                
                                <div class="step-card">
                                    <div class="step-number">3</div>
                                    <div class="step-content">
                                        <h4>Создание депозитов</h4>
                                        <p>Выбирайте из 13 планов депозитов от $25 до $2500. Каждый план имеет свою доходность и срок.</p>
                                    </div>
                                </div>
                                
                                <div class="step-card">
                                    <div class="step-number">4</div>
                                    <div class="step-content">
                                        <h4>Получение дохода</h4>
                                        <p>Получайте ежедневные начисления от 2% до 3.2% в зависимости от выбранного плана.</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="action-buttons">
                                <button class="btn btn-primary action-button" data-action="start-deposit">
                                    💰 Начать инвестировать
                                </button>
                                <button class="btn btn-secondary action-button" data-action="view-analytics">
                                    📊 Смотреть аналитику
                                </button>
                            </div>
                        </div>
                        
                        <!-- Вкладка: Этапы работы -->
                        <div id="tab-steps" class="tab-content">
                            <div class="warning-banner">
                                <div class="warning-icon">⚠️</div>
                                <div class="warning-content">
                                    <h4>Важно знать перед началом</h4>
                                    <ul>
                                        <li>Все операции проводятся в сети BSC (Binance Smart Chain)</li>
                                        <li>Необходим кошелек с поддержкой BSC (MetaMask, Trust Wallet и др.)</li>
                                        <li>Минимальный депозит - $10 USDT или эквивалент в PLEX</li>
                                        <li>Депозиты покупаются последовательно от меньшего к большему</li>
                                    </ul>
                                </div>
                            </div>
                            
                            <h3>Детальная инструкция</h3>
                            
                            <div class="detailed-steps">
                                <div class="detailed-step">
                                    <h4>Шаг 1: Подготовка кошелька</h4>
                                    <p>Убедитесь, что у вас есть:</p>
                                    <ul>
                                        <li>BSC-совместимый кошелек</li>
                                        <li>BNB для оплаты комиссий (минимум 0.01 BNB)</li>
                                        <li>USDT или PLEX для депозитов</li>
                                    </ul>
                                </div>
                                
                                <div class="detailed-step">
                                    <h4>Шаг 2: Регистрация в системе</h4>
                                    <p>Процесс регистрации:</p>
                                    <ol>
                                        <li>Введите адрес вашего BSC кошелька</li>
                                        <li>Отправьте 1 PLEX на адрес системы</li>
                                        <li>Дождитесь подтверждения (1-2 минуты)</li>
                                        <li>Получите доступ к личному кабинету</li>
                                    </ol>
                                </div>
                                
                                <div class="detailed-step">
                                    <h4>Шаг 3: Активация доступа</h4>
                                    <p>Ежедневный доступ к платформе:</p>
                                    <ul>
                                        <li>Стоимость: $1 USDT в день</li>
                                        <li>Можно оплатить на несколько дней вперед</li>
                                        <li>Автоматическая активация после оплаты</li>
                                        <li>Уведомления за 3 дня до окончания</li>
                                    </ul>
                                </div>
                                
                                <div class="detailed-step">
                                    <h4>Шаг 4: Работа с депозитами</h4>
                                    <p>Создание и управление депозитами:</p>
                                    <ul>
                                        <li>Выберите доступный план</li>
                                        <li>Выберите валюту оплаты (USDT или PLEX)</li>
                                        <li>Отправьте средства на указанный адрес</li>
                                        <li>Депозит активируется автоматически</li>
                                        <li>Отслеживайте доход в реальном времени</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Вкладка: MEV-боты -->
                        <div id="tab-mev-bots" class="tab-content">
                            <h3>🤖 MEV-боты - Арбитражные роботы нового поколения</h3>
                            
                            <div class="success-banner">
                                <div class="success-icon">🚀</div>
                                <div class="success-content">
                                    <h4>Автоматический арбитраж 24/7</h4>
                                    <p>MEV-боты выполняют арбитражные операции каждые 6-8 секунд, принося доходность десятки процентов в сутки с полной прозрачностью в блокчейне.</p>
                                </div>
                            </div>
                            
                            <div class="mev-detailed-info">
                                <h4>Как работают MEV-боты:</h4>
                                
                                <div class="mev-workflow">
                                    <div class="mev-workflow-step">
                                        <div class="workflow-icon">🔍</div>
                                        <div class="workflow-content">
                                            <h5>Поиск возможностей</h5>
                                            <p>Боты сканируют блокчейн BSC в поисках арбитражных возможностей между различными DEX площадками</p>
                                        </div>
                                    </div>
                                    
                                    <div class="mev-workflow-step">
                                        <div class="workflow-icon">⚡</div>
                                        <div class="workflow-content">
                                            <h5>Молниеносное выполнение</h5>
                                            <p>При обнаружении прибыльной операции, бот мгновенно выполняет транзакцию (6-8 секунд)</p>
                                        </div>
                                    </div>
                                    
                                    <div class="mev-workflow-step">
