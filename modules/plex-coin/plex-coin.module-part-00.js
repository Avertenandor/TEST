// modules/plex-coin/plex-coin.module.js
// Модуль информации о токене PLEX

export default class PlexCoinModule {
    constructor() {
        this.name = 'plex-coin';
        this.version = '1.0.0';
        this.dependencies = [];
        
        this.container = null;
        this.context = null;
        this.updateInterval = null;
    }
    
    async init(context) {
        console.log('🪙 Initializing PLEX Coin Module...');
        
        this.context = context;
        this.container = context.container;
        
        try {
            // 1. Загрузка шаблона
            await this.loadTemplate();
            
            // 2. Загрузка стилей
            await this.loadStyles();
            
            // 3. Инициализация обработчиков
            this.initEventHandlers();
            
            // 4. Загрузка данных о токене
            await this.loadTokenData();
            
            // 5. Запуск обновления цены
            this.startPriceUpdates();
            
            console.log('✅ PLEX Coin Module initialized successfully');
            
            return this;
            
        } catch (error) {
            console.error('❌ Failed to initialize PLEX Coin Module:', error);
            throw error;
        }
    }
    
    async loadTemplate() {
        try {
            const response = await fetch('/modules/plex-coin/plex-coin.template.html');
            if (response.ok) {
                const html = await response.text();
                this.container.innerHTML = html;
            } else {
                throw new Error('Failed to load template');
            }
        } catch (error) {
            console.error('Failed to load plex-coin template:', error);
            // Используем встроенный шаблон
            this.container.innerHTML = this.getTemplate();
        }
    }
    
    async loadStyles() {
        const existingLink = document.querySelector(`link[data-module="${this.name}"]`);
        if (existingLink) return;
        
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/modules/plex-coin/plex-coin.styles.css';
        link.dataset.module = this.name;
        document.head.appendChild(link);
    }
    
    initEventHandlers() {
        // Кнопки действий
        const buyPlexBtn = this.container.querySelector('#buy-plex-btn');
        if (buyPlexBtn) {
            buyPlexBtn.addEventListener('click', () => this.handleBuyPlex());
        }
        
        const checkContractBtn = this.container.querySelector('#check-contract-btn');
        if (checkContractBtn) {
            checkContractBtn.addEventListener('click', () => this.handleCheckContract());
        }
        
        const copyAddressBtn = this.container.querySelector('#copy-address-btn');
        if (copyAddressBtn) {
            copyAddressBtn.addEventListener('click', () => this.handleCopyAddress());
        }
        
        // Кнопки обмена
        const exchangeButtons = this.container.querySelectorAll('.exchange-btn');
        exchangeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const exchange = e.target.dataset.exchange;
                this.openExchange(exchange);
            });
        });
    }
    
    async loadTokenData() {
        try {
            // Здесь должна быть загрузка реальных данных через API
            // Пока используем заглушку
            const tokenData = {
                name: 'PLEX',
                fullName: 'Platform Exchange Token',
                symbol: 'PLEX',
                decimals: 18,
                totalSupply: '1000000000',
                circulatingSupply: '500000000',
                price: 0.001,
                priceChange24h: 2.5,
                marketCap: 500000,
                volume24h: 25000,
                holders: 1250,
                transactions: 15000,
                contractAddress: '0x6653d5cf8d7a7bc3b2165bcf5e887dc5d59c6e61'
            };
            
            this.updateTokenInfo(tokenData);
            
        } catch (error) {
            console.error('Error loading token data:', error);
        }
    }
    
    updateTokenInfo(data) {
        // Обновляем основную информацию
        const priceEl = this.container.querySelector('#plex-price');
        if (priceEl) {
            priceEl.textContent = `$${data.price.toFixed(6)}`;
        }
        
        const changeEl = this.container.querySelector('#price-change');
        if (changeEl) {
            changeEl.textContent = `${data.priceChange24h > 0 ? '+' : ''}${data.priceChange24h.toFixed(2)}%`;
            changeEl.className = data.priceChange24h > 0 ? 'positive' : 'negative';
        }
        
        const marketCapEl = this.container.querySelector('#market-cap');
        if (marketCapEl) {
            marketCapEl.textContent = `$${this.formatNumber(data.marketCap)}`;
        }
        
        const volumeEl = this.container.querySelector('#volume-24h');
        if (volumeEl) {
            volumeEl.textContent = `$${this.formatNumber(data.volume24h)}`;
        }
        
        const supplyEl = this.container.querySelector('#circulating-supply');
        if (supplyEl) {
            supplyEl.textContent = this.formatNumber(data.circulatingSupply);
        }
        
        const holdersEl = this.container.querySelector('#holders-count');
        if (holdersEl) {
            holdersEl.textContent = this.formatNumber(data.holders);
        }
        
        const contractEl = this.container.querySelector('#contract-address');
        if (contractEl) {
            contractEl.textContent = data.contractAddress;
        }
    }
    
    formatNumber(num) {
        if (num >= 1000000000) {
            return (num / 1000000000).toFixed(2) + 'B';
        } else if (num >= 1000000) {
            return (num / 1000000).toFixed(2) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(2) + 'K';
        }
        return num.toString();
    }
    
    startPriceUpdates() {
        // Обновляем цену каждые 30 секунд
        this.updateInterval = setInterval(() => {
            this.loadTokenData();
        }, 30000);
    }
    
    handleBuyPlex() {
        // Открываем страницу покупки PLEX
        window.open('https://pancakeswap.finance/swap?outputCurrency=0x6653d5cf8d7a7bc3b2165bcf5e887dc5d59c6e61', '_blank');
    }
    
    handleCheckContract() {
        // Открываем контракт в BSCScan
        const contractAddress = '0x6653d5cf8d7a7bc3b2165bcf5e887dc5d59c6e61';
        window.open(`https://bscscan.com/token/${contractAddress}`, '_blank');
    }
    
    handleCopyAddress() {
        const contractAddress = '0x6653d5cf8d7a7bc3b2165bcf5e887dc5d59c6e61';
        
        navigator.clipboard.writeText(contractAddress).then(() => {
            // Показываем уведомление
            const btn = this.container.querySelector('#copy-address-btn');
            if (btn) {
                const originalText = btn.textContent;
                btn.textContent = 'Скопировано!';
                btn.classList.add('copied');
                
                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.classList.remove('copied');
                }, 2000);
            }
            
            if (this.context.eventBus) {
                this.context.eventBus.emit('notification:show', {
                    type: 'success',
                    message: 'Адрес контракта скопирован'
                });
            }
        }).catch(err => {
            console.error('Failed to copy address:', err);
        });
    }
    
    openExchange(exchange) {
        const exchanges = {
            pancakeswap: 'https://pancakeswap.finance/swap?outputCurrency=0x6653d5cf8d7a7bc3b2165bcf5e887dc5d59c6e61',
            poocoin: 'https://poocoin.app/tokens/0x6653d5cf8d7a7bc3b2165bcf5e887dc5d59c6e61',
            dextools: 'https://www.dextools.io/app/bsc/pair-explorer/0x6653d5cf8d7a7bc3b2165bcf5e887dc5d59c6e61',
            coingecko: 'https://www.coingecko.com/en/coins/plex'
        };
        
        if (exchanges[exchange]) {
            window.open(exchanges[exchange], '_blank');
        }
    }
    
    getTemplate() {
        return `
            <div class="plex-coin-module">
                <div class="module-header">
                    <h1>🪙 PLEX Монета</h1>
                    <p class="subtitle">Platform Exchange Token - внутренний токен платформы GENESIS</p>
                </div>
                
                <div class="plex-content">
                    <!-- Основная информация -->
                    <div class="plex-main-info">
                        <div class="token-card">
                            <div class="token-header">
                                <div class="token-logo">
                                    <span class="logo-text">PLEX</span>
                                </div>
                                <div class="token-title">
                                    <h2>PLEX Token</h2>
                                    <p>BEP-20 Standard</p>
                                </div>
                            </div>
                            
                            <div class="token-price">
                                <div class="price-main">
                                    <span class="price-label">Текущая цена:</span>
                                    <span class="price-value" id="plex-price">$0.001000</span>
                                </div>
                                <div class="price-change" id="price-change">+2.5%</div>
                            </div>
                            
                            <div class="token-stats">
                                <div class="stat-item">
                                    <span class="stat-label">Рыночная капитализация:</span>
                                    <span class="stat-value" id="market-cap">$500K</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Объем 24ч:</span>
                                    <span class="stat-value" id="volume-24h">$25K</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">В обращении:</span>
                                    <span class="stat-value" id="circulating-supply">500M</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Держателей:</span>
                                    <span class="stat-value" id="holders-count">1,250</span>
                                </div>
                            </div>
                            
                            <div class="token-actions">
                                <button class="btn btn-primary" id="buy-plex-btn">
                                    💰 Купить PLEX
                                </button>
                                <button class="btn btn-secondary" id="check-contract-btn">
                                    📋 Контракт в BSCScan
                                </button>
                            </div>
                        </div>
                        
                        <!-- Контракт -->
                        <div class="contract-info">
                            <h3>📜 Информация о контракте</h3>
                            <div class="contract-details">
                                <div class="contract-item">
                                    <span class="contract-label">Адрес контракта:</span>
                                    <div class="contract-address-wrapper">
                                        <code id="contract-address">0x6653d5cf8d7a7bc3b2165bcf5e887dc5d59c6e61</code>
                                        <button class="copy-btn" id="copy-address-btn">📋</button>
                                    </div>
                                </div>
                                <div class="contract-item">
                                    <span class="contract-label">Сеть:</span>
                                    <span class="contract-value">Binance Smart Chain (BSC)</span>
                                </div>
                                <div class="contract-item">
                                    <span class="contract-label">Стандарт:</span>
                                    <span class="contract-value">BEP-20</span>
                                </div>
                                <div class="contract-item">
                                    <span class="contract-label">Decimals:</span>
                                    <span class="contract-value">18</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Использование PLEX -->
                    <div class="plex-usage">
                        <h3>🎯 Применение PLEX в экосистеме GENESIS</h3>
                        <div class="usage-grid">
                            <div class="usage-card">
                                <div class="usage-icon">🔐</div>
                                <div class="usage-content">
                                    <h4>Авторизация</h4>
                                    <p>Оплата 1 PLEX для активации аккаунта в системе</p>
                                </div>
                            </div>
                            
                            <div class="usage-card">
                                <div class="usage-icon">💰</div>
                                <div class="usage-content">
                                    <h4>Депозиты</h4>
                                    <p>Создание депозитов в PLEX с повышенной доходностью</p>
                                </div>
                            </div>
                            
                            <div class="usage-card">
                                <div class="usage-icon">⚡</div>
                                <div class="usage-content">
                                    <h4>Множители</h4>
                                    <p>Покупка множителей дохода за PLEX</p>
                                </div>
                            </div>
                            
                            <div class="usage-card">
                                <div class="usage-icon">🎁</div>
                                <div class="usage-content">
                                    <h4>Бонусы</h4>
                                    <p>Получение и использование бонусов в PLEX</p>
                                </div>
                            </div>
                            
                            <div class="usage-card">
                                <div class="usage-icon">👥</div>
                                <div class="usage-content">
                                    <h4>Реферальные выплаты</h4>
                                    <p>Начисление реферальных вознаграждений в PLEX</p>
                                </div>
                            </div>
                            
                            <div class="usage-card">
                                <div class="usage-icon">🏆</div>
                                <div class="usage-content">
                                    <h4>Достижения</h4>
                                    <p>Награды за достижения выплачиваются в PLEX</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Преимущества -->
                    <div class="plex-advantages">
                        <h3>✨ Преимущества PLEX</h3>
                        <div class="advantages-list">
                            <div class="advantage-item">
                                <span class="advantage-icon">✅</span>
                                <div class="advantage-content">
                                    <h4>Низкие комиссии</h4>
                                    <p>Минимальные комиссии при транзакциях в сети BSC</p>
                                </div>
                            </div>
                            
                            <div class="advantage-item">
                                <span class="advantage-icon">✅</span>
                                <div class="advantage-content">
                                    <h4>Быстрые транзакции</h4>
                                    <p>Подтверждение транзакций за 3-5 секунд</p>
                                </div>
                            </div>
                            
                            <div class="advantage-item">
                                <span class="advantage-icon">✅</span>
                                <div class="advantage-content">
                                    <h4>Прозрачность</h4>
                                    <p>Все транзакции можно проверить в BSCScan</p>
                                </div>
                            </div>
                            
                            <div class="advantage-item">
                                <span class="advantage-icon">✅</span>
                                <div class="advantage-content">
                                    <h4>Безопасность</h4>
                                    <p>Защита смарт-контрактом и аудит кода</p>
                                </div>
                            </div>
                            
                            <div class="advantage-item">
                                <span class="advantage-icon">✅</span>
                                <div class="advantage-content">
                                    <h4>Ликвидность</h4>
                                    <p>Доступен для обмена на PancakeSwap</p>
                                </div>
                            </div>
                            
                            <div class="advantage-item">
                                <span class="advantage-icon">✅</span>
                                <div class="advantage-content">
                                    <h4>Экосистема</h4>
                                    <p>Интеграция во все сервисы GENESIS</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Токеномика -->
                    <div class="plex-tokenomics">
                        <h3>📊 Токеномика</h3>
                        <div class="tokenomics-content">
                            <div class="supply-info">
                                <h4>Распределение токенов</h4>
                                <div class="supply-chart">
                                    <div class="supply-item">
                                        <div class="supply-bar" style="width: 50%; background: var(--primary-color);">
                                            <span>50%</span>
                                        </div>
                                        <span class="supply-label">Ликвидность и обращение</span>
                                    </div>
                                    <div class="supply-item">
                                        <div class="supply-bar" style="width: 20%; background: var(--secondary-color);">
                                            <span>20%</span>
                                        </div>
                                        <span class="supply-label">Резерв платформы</span>
                                    </div>
                                    <div class="supply-item">
