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
                                        <div class="workflow-icon">💸</div>
                                        <div class="workflow-content">
                                            <h5>Прямое поступление</h5>
                                            <p>Прибыль сразу поступает на ваш кошелек без промежуточных операций</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="mev-stats-detailed">
                                    <h4>Статистика работы MEV-ботов:</h4>
                                    <div class="stats-grid">
                                        <div class="stat-detailed">
                                            <span class="stat-icon">⏱️</span>
                                            <span class="stat-title">Скорость операций</span>
                                            <span class="stat-value">6-8 секунд</span>
                                            <span class="stat-description">Время выполнения одной арбитражной операции</span>
                                        </div>
                                        
                                        <div class="stat-detailed">
                                            <span class="stat-icon">🔄</span>
                                            <span class="stat-title">Непрерывная работа</span>
                                            <span class="stat-value">24/7</span>
                                            <span class="stat-description">Боты работают круглосуточно без перерывов</span>
                                        </div>
                                        
                                        <div class="stat-detailed">
                                            <span class="stat-icon">💰</span>
                                            <span class="stat-title">Стоимость аренды</span>
                                            <span class="stat-value">5 PLEX</span>
                                            <span class="stat-description">За каждый доллар депозита в сутки</span>
                                        </div>
                                        
                                        <div class="stat-detailed">
                                            <span class="stat-icon">📈</span>
                                            <span class="stat-title">Доходность</span>
                                            <span class="stat-value">10-50%+</span>
                                            <span class="stat-description">В сутки в зависимости от рыночной активности</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="mev-transparency">
                                    <h4>Полная прозрачность:</h4>
                                    <ul>
                                        <li>🔍 <strong>Все транзакции видны</strong> - каждая операция записана в блокчейне BSC</li>
                                        <li>📊 <strong>Реальная статистика</strong> - отслеживайте все операции в реальном времени</li>
                                        <li>🔐 <strong>Ваши ключи под контролем</strong> - боты не имеют доступа к вашим приватным ключам</li>
                                        <li>💸 <strong>Прямые поступления</strong> - деньги идут сразу на ваш кошелек</li>
                                    </ul>
                                </div>
                                
                                <div class="mev-activation">
                                    <h4>Как активировать MEV-бота:</h4>
                                    <ol>
                                        <li>Создайте депозит любого размера</li>
                                        <li>Оплатите аренду: 5 PLEX за каждый $1 депозита в день</li>
                                        <li>Активируйте бота в разделе "Аренда мощностей"</li>
                                        <li>Получайте доходы на свой кошелек автоматически</li>
                                    </ol>
                                </div>
                            </div>
                            
                            <div class="action-buttons">
                                <button class="btn btn-primary action-button" data-action="start-mev">
                                    🤖 Арендовать MEV-бота
                                </button>
                                <button class="btn btn-secondary action-button" data-action="view-mev-stats">
                                    📊 Статистика работы
                                </button>
                            </div>
                        </div>
                        
                        <!-- Вкладка: Архитектура -->
                        <div id="tab-architecture" class="tab-content">
                            <h3>Техническая архитектура платформы</h3>
                            
                            <div class="architecture-info">
                                <div class="arch-card">
                                    <div class="arch-icon">🔗</div>
                                    <div class="arch-content">
                                        <h4>Blockchain интеграция</h4>
                                        <p>Прямая интеграция с BSC через BSCScan API для мониторинга транзакций в реальном времени.</p>
                                    </div>
                                </div>
                                
                                <div class="arch-card">
                                    <div class="arch-icon">📱</div>
                                    <div class="arch-content">
                                        <h4>PWA технология</h4>
                                        <p>Progressive Web App - работает как приложение на любом устройстве без установки из магазина.</p>
                                    </div>
                                </div>
                                
                                <div class="arch-card">
                                    <div class="arch-icon">🔒</div>
                                    <div class="arch-content">
                                        <h4>Безопасность</h4>
                                        <p>Все операции проходят через смарт-контракты. Приватные ключи никогда не покидают ваш кошелек.</p>
                                    </div>
                                </div>
                                
                                <div class="arch-card">
                                    <div class="arch-icon">⚡</div>
                                    <div class="arch-content">
                                        <h4>Производительность</h4>
                                        <p>Модульная архитектура с ленивой загрузкой обеспечивает мгновенный отклик интерфейса.</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="tech-stack">
                                <h4>Технологический стек:</h4>
                                <div class="tech-badges">
                                    <span class="tech-badge">JavaScript ES6+</span>
                                    <span class="tech-badge">Web3.js</span>
                                    <span class="tech-badge">BSCScan API</span>
                                    <span class="tech-badge">Service Workers</span>
                                    <span class="tech-badge">IndexedDB</span>
                                    <span class="tech-badge">WebCrypto API</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Вкладка: Множители -->
                        <div id="tab-multipliers" class="tab-content">
                            <h3>Система множителей дохода</h3>
                            
                            <div class="multiplier-explanation">
                                <p>Множители позволяют увеличить вашу ежедневную прибыль от депозитов. Активируйте множитель и получайте больше!</p>
                                
                                <div class="multiplier-cards">
                                    <div class="multiplier-card">
                                        <div class="multiplier-icon">x2</div>
                                        <div class="multiplier-content">
                                            <h4>Двойной доход</h4>
                                            <p>Удваивает ежедневные начисления</p>
                                            <p class="multiplier-cost">Стоимость: 100 PLEX</p>
                                            <p class="multiplier-duration">Длительность: 7 дней</p>
                                        </div>
                                    </div>
                                    
                                    <div class="multiplier-card">
                                        <div class="multiplier-icon">x3</div>
                                        <div class="multiplier-content">
                                            <h4>Тройной доход</h4>
                                            <p>Утраивает ежедневные начисления</p>
                                            <p class="multiplier-cost">Стоимость: 250 PLEX</p>
                                            <p class="multiplier-duration">Длительность: 7 дней</p>
                                        </div>
                                    </div>
                                    
                                    <div class="multiplier-card">
                                        <div class="multiplier-icon">x5</div>
                                        <div class="multiplier-content">
                                            <h4>Пятикратный доход</h4>
                                            <p>Увеличивает начисления в 5 раз</p>
                                            <p class="multiplier-cost">Стоимость: 500 PLEX</p>
                                            <p class="multiplier-duration">Длительность: 7 дней</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="example-card">
                                    <h4>Пример расчета с множителем x3:</h4>
                                    <div class="calculation">
                                        <div class="calc-step">
                                            <span class="calc-label">Базовый доход:</span>
                                            <span class="calc-value">$5 в день</span>
                                        </div>
                                        <div class="calc-step">
                                            <span class="calc-label">Множитель:</span>
                                            <span class="calc-value">x3</span>
                                        </div>
                                        <div class="calc-divider"></div>
                                        <div class="calc-step multiplier-example">
                                            <span class="calc-label">Итоговый доход:</span>
                                            <span class="calc-value">$15 в день</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="multiplier-info">
                                    <h4>Важно знать:</h4>
                                    <ul>
                                        <li>Множители действуют на все активные депозиты</li>
                                        <li>Можно активировать только один множитель одновременно</li>
                                        <li>Множитель начинает действовать сразу после активации</li>
                                        <li>Нельзя отменить или приостановить активный множитель</li>
                                    </ul>
                                </div>
                            </div>
                            
                            <div class="action-buttons">
                                <button class="btn btn-primary action-button" data-action="check-bonuses">
                                    ⚡ Активировать множитель
                                </button>
                            </div>
                        </div>
                        
                        <!-- Вкладка: Безопасность -->
                        <div id="tab-security" class="tab-content">
                            <h3>Безопасность платформы</h3>
                            
                            <div class="success-banner">
                                <div class="success-icon">🔒</div>
                                <div class="success-content">
                                    <h4>Ваши средства в безопасности</h4>
                                    <p>Платформа GENESIS использует передовые технологии безопасности для защиты ваших инвестиций.</p>
                                </div>
                            </div>
                            
                            <div class="security-features">
                                <div class="security-item">
                                    <h4>🔐 Децентрализация</h4>
                                    <p>Все операции проходят через блокчейн BSC. Никто не может изменить или отменить транзакции.</p>
                                </div>
                                
                                <div class="security-item">
                                    <h4>🔑 Контроль приватных ключей</h4>
                                    <p>Ваши приватные ключи никогда не передаются на сервер. Все подписи транзакций происходят локально.</p>
                                </div>
                                
                                <div class="security-item">
                                    <h4>🛡️ Смарт-контракты</h4>
                                    <p>Автоматическое исполнение условий через проверенные смарт-контракты без участия третьих лиц.</p>
                                </div>
                                
                                <div class="security-item">
                                    <h4>📱 2FA аутентификация</h4>
                                    <p>Двухфакторная аутентификация через подтверждение транзакций в блокчейне.</p>
                                </div>
                                
                                <div class="security-item">
                                    <h4>🔍 Прозрачность</h4>
                                    <p>Все транзакции можно проверить в BSCScan. Полная прозрачность всех операций.</p>
                                </div>
                                
                                <div class="security-item">
                                    <h4>💾 Резервное копирование</h4>
                                    <p>Автоматическое сохранение данных в IndexedDB для восстановления после сбоев.</p>
                                </div>
                            </div>
                            
                            <div class="security-tips">
                                <h4>Советы по безопасности:</h4>
                                <ul>
                                    <li>Никогда не передавайте свой приватный ключ или seed-фразу</li>
                                    <li>Всегда проверяйте адрес перед отправкой средств</li>
                                    <li>Используйте только официальный сайт платформы</li>
                                    <li>Сохраняйте хеши всех транзакций</li>
                                    <li>Регулярно проверяйте баланс и историю операций</li>
                                </ul>
                            </div>
                        </div>
                        
                        <!-- Вкладка: FAQ -->
                        <div id="tab-faq" class="tab-content">
                            <h3>Часто задаваемые вопросы</h3>
                            
                            <div class="faq-list">
                                <div class="faq-item">
                                    <div class="faq-question">
                                        <span class="faq-icon">❓</span>
                                        <span>Что такое пассивный доход в GENESIS 1.1?</span>
                                    </div>
                                    <div class="faq-answer">
                                        <p>Пассивный доход включает: доход от аренды мощностей устройства, доход от депозитов, доход от партнерской программы 3 уровня (5% от вложений и дохода), доход от программы лояльности и бонусной программы.</p>
                                    </div>
                                </div>
                                
                                <div class="faq-item">
                                    <div class="faq-question">
                                        <span class="faq-icon">❓</span>
                                        <span>Что такое активный доход в GENESIS 1.1?</span>
                                    </div>
                                    <div class="faq-answer">
                                        <p>Активный доход включает: доход от множителей и доход от волатильности PLEX ONE токена. Также доступны MEV-боты с доходностью десятки процентов в сутки.</p>
                                    </div>
                                </div>
                                
                                <div class="faq-item">
                                    <div class="faq-question">
                                        <span class="faq-icon">❓</span>
                                        <span>Как работают MEV-боты?</span>
                                    </div>
                                    <div class="faq-answer">
                                        <p>MEV-боты совершают сделку каждые 6-8 секунд, все транзакции видны в блокчейне, деньги поступают сразу на ваш кошелек. Стоимость: 5 PLEX за каждый доллар депозита в сутки.</p>
                                    </div>
                                </div>
                                
                                <div class="faq-item">
                                    <div class="faq-question">
                                        <span class="faq-icon">❓</span>
                                        <span>Что такое PLEX ONE токен?</span>
                                    </div>
                                    <div class="faq-answer">
                                        <p>PLEX ONE - утилити-токен экосистемы GENESIS, работающий на блокчейне Binance Smart Chain. Используется для авторизации, аренды роботов и получения доходов от волатильности.</p>
                                    </div>
                                </div>
                                
                                <div class="faq-item">
                                    <div class="faq-question">
                                        <span class="faq-icon">❓</span>
                                        <span>Минимальная сумма для начала работы?</span>
                                    </div>
                                    <div class="faq-answer">
                                        <p>Для авторизации нужен 1 PLEX токен. Минимальный депозит составляет $25. Ежедневные платежи за доступ - от $10 USDT (1 USDT = 1 день доступа).</p>
                                    </div>
                                </div>
                                
                                <div class="faq-item">
                                    <div class="faq-question">
                                        <span class="faq-icon">❓</span>
                                        <span>Что такое PLEX?</span>
                                    </div>
                                    <div class="faq-answer">
                                        <p>PLEX - это внутренний токен платформы GENESIS. Используется для авторизации, покупки множителей и других операций. 1 PLEX примерно равен $0.001 USD.</p>
                                    </div>
                                </div>
                                
                                <div class="faq-item">
                                    <div class="faq-question">
                                        <span class="faq-icon">❓</span>
                                        <span>Почему нужно платить $1 в день?</span>
                                    </div>
                                    <div class="faq-answer">
                                        <p>Ежедневная оплата покрывает расходы на инфраструктуру: сервера, API запросы к блокчейну, хранение данных и техническую поддержку. Это обеспечивает стабильную работу платформы 24/7.</p>
                                    </div>
                                </div>
                                
                                <div class="faq-item">
                                    <div class="faq-question">
                                        <span class="faq-icon">❓</span>
                                        <span>Как быстро активируется депозит?</span>
                                    </div>
                                    <div class="faq-answer">
                                        <p>Депозит активируется автоматически после 3 подтверждений в сети BSC. Обычно это занимает 1-2 минуты. В периоды высокой нагрузки может занять до 5 минут.</p>
                                    </div>
                                </div>
                                
                                <div class="faq-item">
                                    <div class="faq-question">
                                        <span class="faq-icon">❓</span>
                                        <span>Можно ли вывести депозит досрочно?</span>
                                    </div>
                                    <div class="faq-answer">
                                        <p>Нет, депозиты имеют фиксированный срок и не могут быть выведены досрочно. После окончания срока тело депозита и вся прибыль возвращаются на ваш кошелек автоматически.</p>
                                    </div>
                                </div>
                                
                                <div class="faq-item">
                                    <div class="faq-question">
                                        <span class="faq-icon">❓</span>
                                        <span>Какая минимальная сумма для вывода?</span>
                                    </div>
                                    <div class="faq-answer">
                                        <p>Минимальная сумма для вывода составляет $10 USDT или 10000 PLEX. Комиссия сети оплачивается отдельно.</p>
                                    </div>
                                </div>
                                
                                <div class="faq-item">
                                    <div class="faq-question">
                                        <span class="faq-icon">❓</span>
                                        <span>Как работает реферальная программа?</span>
                                    </div>
                                    <div class="faq-answer">
                                        <p>Вы получаете 5% от депозитов рефералов 1-го уровня, 3% от 2-го уровня и 1% от 3-го уровня. Бонусы начисляются автоматически на ваш баланс.</p>
                                    </div>
                                </div>
                                
                                <div class="faq-item">
                                    <div class="faq-question">
                                        <span class="faq-icon">❓</span>
                                        <span>Что делать если транзакция не подтверждается?</span>
                                    </div>
                                    <div class="faq-answer">
                                        <p>Проверьте статус транзакции в BSCScan по хешу. Если транзакция подтверждена в блокчейне, но не отображается в системе, обратитесь в поддержку с хешем транзакции.</p>
                                    </div>
                                </div>
                                
                                <div class="faq-item">
                                    <div class="faq-question">
                                        <span class="faq-icon">❓</span>
                                        <span>Можно ли использовать платформу с мобильного?</span>
                                    </div>
                                    <div class="faq-answer">
                                        <p>Да, платформа полностью адаптирована для мобильных устройств. Вы можете установить ее как PWA приложение для быстрого доступа с главного экрана.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    destroy() {
        console.log('🧹 Destroying How It Works Module...');
        
        // Удаление стилей
        const link = document.querySelector(`link[data-module="${this.name}"]`);
        if (link) link.remove();
        
        // Очистка контейнера
        if (this.container) {
            this.container.innerHTML = '';
        }
        
        console.log('✅ How It Works Module destroyed');
    }
}
