// modules/multipliers/multipliers.module.js
// Модуль множителей GENESIS - система увеличения доходности

export default class MultipliersModule {
    constructor() {
        this.name = 'multipliers';
        this.version = '1.0.0';
        this.dependencies = ['auth', 'platform-access'];
        
        this.container = null;
        this.context = null;
        this.activeMultipliers = [];
        this.totalMultiplier = 1.0;
    }
    
    async init(context) {
        console.log('⚡ Initializing Multipliers Module...');
        
        this.context = context;
        this.container = context.container;
        
        try {
            await this.loadTemplate();
            await this.loadStyles();
            
            this.initMultipliersData();
            this.initEventHandlers();
            this.updateDisplay();
            
            // Запуск таймеров для временных множителей
            this.startMultiplierTimers();
            
            console.log('✅ Multipliers Module initialized successfully');
            return this;
            
        } catch (error) {
            console.error('❌ Failed to initialize Multipliers Module:', error);
            throw error;
        }
    }
    
    async loadTemplate() {
        if (this.container) {
            this.container.innerHTML = `
                <div class="multipliers-container">
                    <div class="page-header">
                        <h2 class="page-title">⚡ Множители доходности</h2>
                        <p class="page-subtitle">Увеличивайте доход с помощью множителей</p>
                    </div>
                    
                    <div class="current-multiplier-card">
                        <div class="multiplier-display">
                            <div class="multiplier-icon">🚀</div>
                            <div class="multiplier-info">
                                <h3>Текущий множитель</h3>
                                <div class="multiplier-value" id="total-multiplier">x1.00</div>
                                <p class="multiplier-description">
                                    Все ваши доходы умножаются на этот коэффициент
                                </p>
                            </div>
                        </div>
                        
                        <div class="multiplier-breakdown">
                            <h4>Активные множители:</h4>
                            <div id="active-multipliers-list" class="active-list">
                                <div class="no-multipliers">Нет активных множителей</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="multipliers-grid">
                        <h3>🎯 Доступные множители</h3>
                        
                        <div class="multiplier-cards">
                            <!-- Временные множители -->
                            <div class="multiplier-card" data-type="daily">
                                <div class="card-header">
                                    <h4>📅 Ежедневный бонус</h4>
                                    <div class="multiplier-badge">x1.5</div>
                                </div>
                                <div class="card-content">
                                    <p>Активируется при ежедневном входе в систему</p>
                                    <div class="duration">
                                        <span class="duration-icon">⏱️</span>
                                        <span>Действует 24 часа</span>
                                    </div>
                                </div>
                                <button class="btn btn-primary" data-action="activate" data-multiplier="daily">
                                    Активировать
                                </button>
                            </div>
                            
                            <div class="multiplier-card" data-type="weekly">
                                <div class="card-header">
                                    <h4>🗓️ Недельный усилитель</h4>
                                    <div class="multiplier-badge">x2.0</div>
                                </div>
                                <div class="card-content">
                                    <p>Мощный множитель на целую неделю</p>
                                    <div class="duration">
                                        <span class="duration-icon">⏱️</span>
                                        <span>Действует 7 дней</span>
                                    </div>
                                    <div class="price">
                                        <span class="price-label">Стоимость:</span>
                                        <span class="price-value">10 USDT</span>
                                    </div>
                                </div>
                                <button class="btn btn-primary" data-action="purchase" data-multiplier="weekly">
                                    Купить
                                </button>
                            </div>
                            
                            <div class="multiplier-card premium" data-type="premium">
                                <div class="card-header">
                                    <h4>💎 Премиум множитель</h4>
                                    <div class="multiplier-badge">x3.0</div>
                                </div>
                                <div class="card-content">
                                    <p>Максимальное увеличение доходности</p>
                                    <div class="duration">
                                        <span class="duration-icon">⏱️</span>
                                        <span>Действует 30 дней</span>
                                    </div>
                                    <div class="price">
                                        <span class="price-label">Стоимость:</span>
                                        <span class="price-value">50 USDT</span>
                                    </div>
                                </div>
                                <button class="btn btn-primary" data-action="purchase" data-multiplier="premium">
                                    Купить
                                </button>
                            </div>
                            
                            <!-- Постоянные множители -->
                            <div class="multiplier-card" data-type="referral">
                                <div class="card-header">
                                    <h4>👥 Реферальный бонус</h4>
                                    <div class="multiplier-badge">+10%</div>
                                </div>
                                <div class="card-content">
                                    <p>За каждого активного реферала</p>
                                    <div class="requirement">
                                        <span>Требование:</span>
                                        <span>Пригласить друзей</span>
                                    </div>
                                    <div class="progress">
                                        <div class="progress-bar">
                                            <div class="progress-fill" style="width: 0%"></div>
                                        </div>
                                        <span class="progress-text">0 / 5 рефералов</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="multiplier-card" data-type="deposit">
                                <div class="card-header">
                                    <h4>💰 Депозитный множитель</h4>
                                    <div class="multiplier-badge">+5%</div>
                                </div>
                                <div class="card-content">
                                    <p>За каждые $100 в депозитах</p>
                                    <div class="requirement">
                                        <span>Текущий объем:</span>
                                        <span id="deposit-volume">$0</span>
                                    </div>
                                    <div class="next-level">
                                        <span>До следующего уровня:</span>
                                        <span id="next-deposit-level">$100</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="multiplier-card" data-type="loyalty">
                                <div class="card-header">
                                    <h4>🏆 Бонус лояльности</h4>
                                    <div class="multiplier-badge">+1% / месяц</div>
                                </div>
                                <div class="card-content">
                                    <p>За каждый месяц в системе</p>
                                    <div class="loyalty-info">
                                        <span>Ваш стаж:</span>
                                        <span id="user-months">0 месяцев</span>
                                    </div>
                                    <div class="loyalty-bonus">
                                        <span>Текущий бонус:</span>
                                        <span id="loyalty-percent">+0%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="multiplier-combos">
                        <h3>🎰 Комбо-множители</h3>
                        <div class="combo-list">
                            <div class="combo-item">
                                <div class="combo-icon">🔥</div>
                                <div class="combo-info">
                                    <h4>Огненная серия</h4>
                                    <p>Активируйте 3 множителя одновременно</p>
                                </div>
                                <div class="combo-reward">
                                    <span class="reward-label">Бонус:</span>
                                    <span class="reward-value">+50%</span>
                                </div>
                            </div>
                            
                            <div class="combo-item">
                                <div class="combo-icon">💎</div>
                                <div class="combo-info">
                                    <h4>Бриллиантовый статус</h4>
                                    <p>Премиум множитель + 10 рефералов</p>
                                </div>
                                <div class="combo-reward">
                                    <span class="reward-label">Бонус:</span>
                                    <span class="reward-value">x5.0</span>
                                </div>
                            </div>
                            
                            <div class="combo-item">
                                <div class="combo-icon">👑</div>
                                <div class="combo-info">
                                    <h4>Королевский множитель</h4>
                                    <p>Все множители активны</p>
                                </div>
                                <div class="combo-reward">
                                    <span class="reward-label">Бонус:</span>
                                    <span class="reward-value">x10.0</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="multiplier-info">
                        <h3>ℹ️ Как работают множители</h3>
                        <div class="info-content">
                            <p>Множители увеличивают доходность от всех ваших депозитов и активностей в системе.</p>
                            <ul>
                                <li>📈 Множители складываются между собой</li>
                                <li>⏰ Временные множители действуют ограниченное время</li>
                                <li>🔄 Постоянные множители работают всегда при выполнении условий</li>
                                <li>🎯 Комбинируйте множители для максимального эффекта</li>
                                <li>💰 Увеличивайте доход в несколько раз!</li>
                            </ul>
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
                .multipliers-container {
                    padding: 2rem;
                    max-width: 1400px;
                    margin: 0 auto;
                }
                
                .current-multiplier-card {
                    background: linear-gradient(135deg, var(--bg-secondary), rgba(255, 107, 53, 0.1));
                    border: 2px solid var(--primary-color);
                    border-radius: 16px;
                    padding: 2rem;
                    margin-bottom: 2rem;
                }
                
                .multiplier-display {
                    display: flex;
                    align-items: center;
                    gap: 2rem;
                    margin-bottom: 2rem;
                }
                
                .multiplier-icon {
                    font-size: 4rem;
                }
                
                .multiplier-info h3 {
                    color: var(--text-primary);
                    margin-bottom: 0.5rem;
                }
                
                .multiplier-value {
                    font-size: 3rem;
                    font-weight: 700;
                    color: var(--primary-color);
                    font-family: 'Orbitron', monospace;
                }
                
                .multiplier-description {
                    color: var(--text-secondary);
                    margin-top: 0.5rem;
                }
                
                .multiplier-breakdown {
                    background: var(--bg-primary);
                    padding: 1.5rem;
                    border-radius: 12px;
                }
                
                .multiplier-breakdown h4 {
                    color: var(--text-primary);
                    margin-bottom: 1rem;
                }
                
                .active-list {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                
                .active-multiplier-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0.75rem;
                    background: var(--bg-secondary);
                    border-radius: 8px;
                }
                
                .multiplier-name {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: var(--text-primary);
                }
                
                .multiplier-effect {
                    font-weight: 600;
                    color: var(--success-color);
                }
                
                .multiplier-timer {
                    font-size: 0.85rem;
                    color: var(--warning-color);
                }
                
                .no-multipliers {
                    text-align: center;
                    color: var(--text-secondary);
                    padding: 1rem;
                }
                
                .multipliers-grid {
                    margin-bottom: 2rem;
                }
                
                .multipliers-grid h3 {
                    color: var(--primary-color);
                    margin-bottom: 1.5rem;
                }
                
                .multiplier-cards {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: 1.5rem;
                }
                
                .multiplier-card {
                    background: var(--bg-secondary);
                    border: 2px solid var(--border-color);
                    border-radius: 12px;
                    padding: 1.5rem;
                    transition: all 0.3s ease;
                }
                
                .multiplier-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
                    border-color: var(--primary-color);
                }
                
                .multiplier-card.premium {
                    background: linear-gradient(135deg, var(--bg-secondary), rgba(255, 215, 0, 0.1));
                    border-color: var(--gold-color);
                }
                
                .card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                }
                
                .card-header h4 {
                    color: var(--text-primary);
                    margin: 0;
                }
                
                .multiplier-badge {
                    background: var(--primary-color);
                    color: white;
                    padding: 0.25rem 0.75rem;
                    border-radius: 20px;
                    font-weight: 700;
                }
                
                .card-content {
                    margin-bottom: 1rem;
                }
                
                .card-content p {
                    color: var(--text-secondary);
                    margin-bottom: 1rem;
                }
                
                .duration,
                .requirement,
                .next-level,
                .loyalty-info,
                .loyalty-bonus {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0.5rem 0;
                    color: var(--text-secondary);
                    font-size: 0.9rem;
                }
                
                .duration-icon {
                    margin-right: 0.5rem;
                }
                
                .price {
                    background: var(--bg-primary);
                    padding: 0.75rem;
                    border-radius: 8px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 1rem;
                }
                
                .price-label {
                    color: var(--text-secondary);
                }
                
                .price-value {
                    font-weight: 700;
                    color: var(--success-color);
                }
                
                .progress {
                    margin-top: 1rem;
