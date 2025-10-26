// modules/mining-rent/mining-rent.module.js
// Модуль аренды мощностей GENESIS - майнинг и вычислительные ресурсы

export default class MiningRentModule {
    constructor() {
        this.name = 'mining-rent';
        this.version = '1.0.0';
        this.dependencies = ['auth', 'platform-access'];
        
        this.container = null;
        this.context = null;
        this.rentedPower = 0;
        this.miningStats = null;
    }
    
    async init(context) {
        console.log('💻 Initializing Mining Rent Module...');
        
        this.context = context;
        this.container = context.container;
        
        try {
            // Загрузка шаблона и стилей
            await this.loadTemplate();
            await this.loadStyles();
            
            // Инициализация данных
            this.initMiningData();
            
            // Обработчики событий
            this.initEventHandlers();
            
            // Обновление отображения
            this.updateDisplay();
            
            console.log('✅ Mining Rent Module initialized successfully');
            return this;
            
        } catch (error) {
            console.error('❌ Failed to initialize Mining Rent Module:', error);
            throw error;
        }
    }
    
    async loadTemplate() {
        if (this.container) {
            this.container.innerHTML = `
                <div class="mining-rent-container">
                    <div class="page-header">
                        <h2 class="page-title">💻 Аренда мощностей</h2>
                        <p class="page-subtitle">Арендуйте вычислительные мощности для майнинга</p>
                    </div>
                    
                    <div class="mining-stats-grid">
                        <div class="stat-card">
                            <div class="stat-icon">⚡</div>
                            <div class="stat-content">
                                <div class="stat-value" id="total-hashrate">0 TH/s</div>
                                <div class="stat-label">Общий хешрейт</div>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">💰</div>
                            <div class="stat-content">
                                <div class="stat-value" id="daily-income">0 USDT</div>
                                <div class="stat-label">Доход в день</div>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">🔌</div>
                            <div class="stat-content">
                                <div class="stat-value" id="active-contracts">0</div>
                                <div class="stat-label">Активных контрактов</div>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon">📊</div>
                            <div class="stat-content">
                                <div class="stat-value" id="roi-percentage">0%</div>
                                <div class="stat-label">ROI</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mining-plans">
                        <h3>📦 Тарифы аренды мощностей</h3>
                        <div class="plans-grid">
                            <div class="plan-card" data-plan="starter">
                                <div class="plan-header">
                                    <h4>🌱 Стартовый</h4>
                                    <div class="plan-badge">Популярный</div>
                                </div>
                                <div class="plan-specs">
                                    <div class="spec-item">
                                        <span class="spec-label">Мощность:</span>
                                        <span class="spec-value">10 TH/s</span>
                                    </div>
                                    <div class="spec-item">
                                        <span class="spec-label">Срок:</span>
                                        <span class="spec-value">30 дней</span>
                                    </div>
                                    <div class="spec-item">
                                        <span class="spec-label">Доход:</span>
                                        <span class="spec-value">~1.5 USDT/день</span>
                                    </div>
                                </div>
                                <div class="plan-price">
                                    <span class="price-label">Стоимость:</span>
                                    <span class="price-value">30 USDT</span>
                                </div>
                                <button class="btn btn-primary btn-full" data-action="rent" data-plan="starter">
                                    Арендовать
                                </button>
                            </div>
                            
                            <div class="plan-card" data-plan="advanced">
                                <div class="plan-header">
                                    <h4>⚡ Продвинутый</h4>
                                    <div class="plan-badge badge-premium">Выгодно</div>
                                </div>
                                <div class="plan-specs">
                                    <div class="spec-item">
                                        <span class="spec-label">Мощность:</span>
                                        <span class="spec-value">50 TH/s</span>
                                    </div>
                                    <div class="spec-item">
                                        <span class="spec-label">Срок:</span>
                                        <span class="spec-value">60 дней</span>
                                    </div>
                                    <div class="spec-item">
                                        <span class="spec-label">Доход:</span>
                                        <span class="spec-value">~8 USDT/день</span>
                                    </div>
                                </div>
                                <div class="plan-price">
                                    <span class="price-label">Стоимость:</span>
                                    <span class="price-value">120 USDT</span>
                                </div>
                                <button class="btn btn-primary btn-full" data-action="rent" data-plan="advanced">
                                    Арендовать
                                </button>
                            </div>
                            
                            <div class="plan-card premium" data-plan="professional">
                                <div class="plan-header">
                                    <h4>💎 Профессиональный</h4>
                                    <div class="plan-badge badge-vip">VIP</div>
                                </div>
                                <div class="plan-specs">
                                    <div class="spec-item">
                                        <span class="spec-label">Мощность:</span>
                                        <span class="spec-value">200 TH/s</span>
                                    </div>
                                    <div class="spec-item">
                                        <span class="spec-label">Срок:</span>
                                        <span class="spec-value">90 дней</span>
                                    </div>
                                    <div class="spec-item">
                                        <span class="spec-label">Доход:</span>
                                        <span class="spec-value">~35 USDT/день</span>
                                    </div>
                                </div>
                                <div class="plan-price">
                                    <span class="price-label">Стоимость:</span>
                                    <span class="price-value">400 USDT</span>
                                </div>
                                <button class="btn btn-primary btn-full" data-action="rent" data-plan="professional">
                                    Арендовать
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="active-contracts">
                        <h3>📋 Активные контракты</h3>
                        <div class="contracts-list" id="contracts-list">
                            <div class="empty-state">
                                <div class="empty-icon">📭</div>
                                <p>У вас пока нет активных контрактов</p>
                                <p class="text-secondary">Арендуйте мощности для начала майнинга</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mining-info">
                        <h3>ℹ️ Информация о майнинге</h3>
                        <div class="info-grid">
                            <div class="info-card">
                                <h4>🔧 Как это работает</h4>
                                <ol>
                                    <li>Выберите подходящий тариф</li>
                                    <li>Оплатите аренду мощностей</li>
                                    <li>Получайте ежедневный доход</li>
                                    <li>Выводите заработанные средства</li>
                                </ol>
                            </div>
                            <div class="info-card">
                                <h4>💡 Преимущества</h4>
                                <ul>
                                    <li>Не нужно покупать оборудование</li>
                                    <li>Нет расходов на электричество</li>
                                    <li>Круглосуточная работа 24/7</li>
                                    <li>Гарантированная доходность</li>
                                    <li>Моментальный старт майнинга</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    }
    
    async loadStyles() {
        const existingLink = document.querySelector(`link[data-module="${this.name}"]`);
        if (existingLink) return;
        
        const styles = `
            <style data-module="${this.name}">
                .mining-rent-container {
                    padding: 2rem;
                    max-width: 1400px;
                    margin: 0 auto;
                }
                
                .mining-stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1rem;
                    margin-bottom: 2rem;
                }
                
                .stat-card {
                    background: var(--bg-secondary);
                    padding: 1.5rem;
                    border-radius: 12px;
                    border: 1px solid var(--border-color);
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }
                
                .stat-icon {
                    font-size: 2rem;
                }
                
                .stat-value {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: var(--primary-color);
                    font-family: 'Orbitron', monospace;
                }
                
                .stat-label {
                    color: var(--text-secondary);
                    font-size: 0.9rem;
                }
                
                .mining-plans {
                    margin-bottom: 2rem;
                }
                
                .mining-plans h3 {
                    color: var(--primary-color);
                    margin-bottom: 1.5rem;
                }
                
                .plans-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 1.5rem;
                }
                
                .plan-card {
                    background: var(--bg-secondary);
                    border: 2px solid var(--border-color);
                    border-radius: 16px;
                    padding: 2rem;
                    transition: all 0.3s ease;
                    position: relative;
                }
                
                .plan-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
                    border-color: var(--primary-color);
                }
                
                .plan-card.premium {
                    background: linear-gradient(135deg, var(--bg-secondary), rgba(255, 215, 0, 0.1));
                    border-color: var(--gold-color);
                }
                
                .plan-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                }
                
                .plan-header h4 {
                    color: var(--text-primary);
                    margin: 0;
                }
                
                .plan-badge {
                    background: var(--primary-color);
                    color: white;
                    padding: 0.25rem 0.75rem;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    font-weight: 600;
                }
                
                .badge-premium {
                    background: var(--secondary-color);
                }
                
                .badge-vip {
                    background: linear-gradient(90deg, var(--gold-color), var(--primary-color));
                }
                
                .plan-specs {
                    margin-bottom: 1.5rem;
                }
                
                .spec-item {
                    display: flex;
                    justify-content: space-between;
                    padding: 0.5rem 0;
                    border-bottom: 1px solid var(--border-color);
                }
                
                .spec-item:last-child {
                    border-bottom: none;
                }
                
                .spec-label {
                    color: var(--text-secondary);
                }
                
                .spec-value {
                    color: var(--text-primary);
                    font-weight: 600;
                }
                
                .plan-price {
                    background: var(--bg-primary);
                    padding: 1rem;
                    border-radius: 8px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                }
                
                .price-label {
                    color: var(--text-secondary);
                }
                
                .price-value {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: var(--success-color);
                }
                
                .active-contracts {
                    margin-bottom: 2rem;
                }
                
                .active-contracts h3 {
                    color: var(--primary-color);
                    margin-bottom: 1.5rem;
                }
                
                .contracts-list {
                    background: var(--bg-secondary);
                    border-radius: 12px;
                    padding: 1rem;
                    min-height: 200px;
                }
                
                .contract-item {
                    background: var(--bg-primary);
                    padding: 1.5rem;
                    border-radius: 8px;
                    margin-bottom: 1rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .contract-info h5 {
                    color: var(--text-primary);
                    margin-bottom: 0.5rem;
                }
                
                .contract-details {
                    display: flex;
                    gap: 2rem;
                    color: var(--text-secondary);
                    font-size: 0.9rem;
                }
                
                .contract-status {
                    text-align: right;
                }
                
                .status-active {
                    color: var(--success-color);
                    font-weight: 600;
                }
                
                .contract-earnings {
                    font-size: 1.2rem;
                    color: var(--primary-color);
                    font-weight: 700;
                }
                
                .mining-info {
                    margin-top: 2rem;
                }
                
                .mining-info h3 {
                    color: var(--primary-color);
                    margin-bottom: 1.5rem;
                }
                
                .info-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 1.5rem;
                }
                
                .info-card {
                    background: var(--bg-secondary);
                    padding: 1.5rem;
                    border-radius: 12px;
                    border-left: 4px solid var(--primary-color);
                }
                
                .info-card h4 {
                    color: var(--text-primary);
                    margin-bottom: 1rem;
                }
                
                .info-card ol,
                .info-card ul {
                    margin: 0;
                    padding-left: 1.5rem;
