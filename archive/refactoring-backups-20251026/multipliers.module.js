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
                }
                
                .progress-bar {
                    background: var(--bg-primary);
                    height: 8px;
                    border-radius: 4px;
                    overflow: hidden;
                    margin-bottom: 0.5rem;
                }
                
                .progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
                    transition: width 0.5s ease;
                }
                
                .progress-text {
                    font-size: 0.85rem;
                    color: var(--text-secondary);
                }
                
                .multiplier-combos {
                    margin-bottom: 2rem;
                }
                
                .multiplier-combos h3 {
                    color: var(--primary-color);
                    margin-bottom: 1.5rem;
                }
                
                .combo-list {
                    display: grid;
                    gap: 1rem;
                }
                
                .combo-item {
                    background: var(--bg-secondary);
                    padding: 1.5rem;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                    border: 1px solid var(--border-color);
                    transition: all 0.3s ease;
                }
                
                .combo-item:hover {
                    transform: translateX(4px);
                    border-color: var(--primary-color);
                }
                
                .combo-icon {
                    font-size: 2.5rem;
                }
                
                .combo-info {
                    flex: 1;
                }
                
                .combo-info h4 {
                    color: var(--text-primary);
                    margin-bottom: 0.25rem;
                }
                
                .combo-info p {
                    color: var(--text-secondary);
                    font-size: 0.9rem;
                }
                
                .combo-reward {
                    background: var(--bg-primary);
                    padding: 0.75rem 1rem;
                    border-radius: 8px;
                    text-align: center;
                }
                
                .reward-label {
                    display: block;
                    color: var(--text-secondary);
                    font-size: 0.85rem;
                    margin-bottom: 0.25rem;
                }
                
                .reward-value {
                    font-size: 1.2rem;
                    font-weight: 700;
                    color: var(--success-color);
                }
                
                .multiplier-info {
                    background: var(--bg-secondary);
                    padding: 2rem;
                    border-radius: 12px;
                    border-left: 4px solid var(--primary-color);
                }
                
                .multiplier-info h3 {
                    color: var(--primary-color);
                    margin-bottom: 1rem;
                }
                
                .info-content {
                    color: var(--text-secondary);
                }
                
                .info-content ul {
                    margin-top: 1rem;
                    padding-left: 1.5rem;
                }
                
                .info-content li {
                    padding: 0.25rem 0;
                }
                
                @media (max-width: 768px) {
                    .multiplier-display {
                        flex-direction: column;
                        text-align: center;
                    }
                    
                    .multiplier-cards {
                        grid-template-columns: 1fr;
                    }
                    
                    .combo-item {
                        flex-direction: column;
                        text-align: center;
                    }
                    
                    .combo-reward {
                        width: 100%;
                    }
                }
            </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', styles);
    }
    
    initMultipliersData() {
        // Загружаем активные множители
        this.activeMultipliers = JSON.parse(localStorage.getItem('genesis_active_multipliers') || '[]');
        
        // Очищаем истекшие множители
        this.activeMultipliers = this.activeMultipliers.filter(m => {
            if (m.expiresAt) {
                return new Date(m.expiresAt) > new Date();
            }
            return true; // Постоянные множители
        });
        
        // Сохраняем очищенный список
        localStorage.setItem('genesis_active_multipliers', JSON.stringify(this.activeMultipliers));
        
        // Рассчитываем общий множитель
        this.calculateTotalMultiplier();
    }
    
    initEventHandlers() {
        // Обработчики для кнопок активации
        const activateButtons = this.container?.querySelectorAll('[data-action="activate"]');
        activateButtons?.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const multiplierType = e.target.dataset.multiplier;
                this.activateMultiplier(multiplierType);
            });
        });
        
        // Обработчики для кнопок покупки
        const purchaseButtons = this.container?.querySelectorAll('[data-action="purchase"]');
        purchaseButtons?.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const multiplierType = e.target.dataset.multiplier;
                this.purchaseMultiplier(multiplierType);
            });
        });
    }
    
    calculateTotalMultiplier() {
        let baseMultiplier = 1.0;
        let additiveBonus = 0;
        
        this.activeMultipliers.forEach(m => {
            if (m.type === 'multiplicative') {
                baseMultiplier *= m.value;
            } else {
                additiveBonus += m.value;
            }
        });
        
        this.totalMultiplier = baseMultiplier + additiveBonus;
        
        // Сохраняем для использования в других модулях
        localStorage.setItem('genesis_total_multiplier', this.totalMultiplier.toString());
    }
    
    updateDisplay() {
        if (!this.container) return;
        
        // Обновляем общий множитель
        const totalMultiplierEl = this.container.querySelector('#total-multiplier');
        if (totalMultiplierEl) {
            totalMultiplierEl.textContent = `x${this.totalMultiplier.toFixed(2)}`;
        }
        
        // Обновляем список активных множителей
        this.updateActiveMultipliersList();
        
        // Обновляем прогресс постоянных множителей
        this.updatePermanentMultipliers();
    }
    
    updateActiveMultipliersList() {
        const listEl = this.container?.querySelector('#active-multipliers-list');
        if (!listEl) return;
        
        if (this.activeMultipliers.length === 0) {
            listEl.innerHTML = '<div class="no-multipliers">Нет активных множителей</div>';
            return;
        }
        
        listEl.innerHTML = this.activeMultipliers.map(m => {
            const timeLeft = m.expiresAt ? this.getTimeLeft(m.expiresAt) : 'Постоянный';
            
            return `
                <div class="active-multiplier-item">
                    <div class="multiplier-name">
                        <span>${m.icon}</span>
                        <span>${m.name}</span>
                    </div>
                    <div class="multiplier-effect">${m.display}</div>
                    ${m.expiresAt ? `<div class="multiplier-timer">${timeLeft}</div>` : ''}
                </div>
            `;
        }).join('');
    }
    
    updatePermanentMultipliers() {
        // Обновляем реферальный прогресс
        const referrals = parseInt(localStorage.getItem('genesis_referrals_count') || '0');
        const referralProgress = this.container?.querySelector('[data-type="referral"] .progress-fill');
        const referralText = this.container?.querySelector('[data-type="referral"] .progress-text');
        
        if (referralProgress) {
            referralProgress.style.width = `${Math.min(100, (referrals / 5) * 100)}%`;
        }
        if (referralText) {
            referralText.textContent = `${referrals} / 5 рефералов`;
        }
        
        // Обновляем депозитный объем
        const depositVolume = parseFloat(localStorage.getItem('genesis_deposit_volume') || '0');
        const depositVolumeEl = this.container?.querySelector('#deposit-volume');
        const nextLevelEl = this.container?.querySelector('#next-deposit-level');
        
        if (depositVolumeEl) {
            depositVolumeEl.textContent = `$${depositVolume.toFixed(2)}`;
        }
        if (nextLevelEl) {
            const nextLevel = Math.ceil(depositVolume / 100) * 100 || 100;
            nextLevelEl.textContent = `$${nextLevel}`;
        }
        
        // Обновляем стаж
        const joinDate = localStorage.getItem('genesis_join_date');
        if (joinDate) {
            const months = this.getMonthsSince(joinDate);
            const monthsEl = this.container?.querySelector('#user-months');
            const loyaltyEl = this.container?.querySelector('#loyalty-percent');
            
            if (monthsEl) {
                monthsEl.textContent = `${months} месяцев`;
            }
            if (loyaltyEl) {
                loyaltyEl.textContent = `+${months}%`;
            }
        }
    }
    
    getTimeLeft(expiresAt) {
        const now = new Date();
        const expires = new Date(expiresAt);
        const diff = expires - now;
        
        if (diff <= 0) return 'Истек';
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        if (days > 0) return `${days}д ${hours}ч`;
        if (hours > 0) return `${hours}ч ${minutes}м`;
        return `${minutes}м`;
    }
    
    getMonthsSince(dateStr) {
        const date = new Date(dateStr);
        const now = new Date();
        const months = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());
        return Math.max(0, months);
    }
    
    activateMultiplier(type) {
        if (type === 'daily') {
            // Проверяем, не активирован ли уже
            const existing = this.activeMultipliers.find(m => m.id === 'daily');
            if (existing) {
                this.showNotification('Ежедневный бонус уже активен', 'warning');
                return;
            }
            
            // Добавляем множитель
            const multiplier = {
                id: 'daily',
                name: 'Ежедневный бонус',
                icon: '📅',
                type: 'multiplicative',
                value: 1.5,
                display: 'x1.5',
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            };
            
            this.activeMultipliers.push(multiplier);
            localStorage.setItem('genesis_active_multipliers', JSON.stringify(this.activeMultipliers));
            
            this.calculateTotalMultiplier();
            this.updateDisplay();
            
            this.showNotification('Ежедневный бонус активирован!', 'success');
        }
    }
    
    purchaseMultiplier(type) {
        const prices = {
            weekly: 10,
            premium: 50
        };
        
        const price = prices[type];
        if (!price) return;
        
        // Проверка баланса (в реальной версии)
        const balance = parseFloat(localStorage.getItem('genesis_user_balance') || '0');
        if (balance < price) {
            this.showNotification('Недостаточно средств', 'error');
            return;
        }
        
        // Списываем средства
        localStorage.setItem('genesis_user_balance', (balance - price).toString());
        
        // Добавляем множитель
        let multiplier;
        if (type === 'weekly') {
            multiplier = {
                id: 'weekly',
                name: 'Недельный усилитель',
                icon: '🗓️',
                type: 'multiplicative',
                value: 2.0,
                display: 'x2.0',
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            };
        } else if (type === 'premium') {
            multiplier = {
                id: 'premium',
                name: 'Премиум множитель',
                icon: '💎',
                type: 'multiplicative',
                value: 3.0,
                display: 'x3.0',
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            };
        }
        
        if (multiplier) {
            // Удаляем старый если есть
            this.activeMultipliers = this.activeMultipliers.filter(m => m.id !== multiplier.id);
            this.activeMultipliers.push(multiplier);
            
            localStorage.setItem('genesis_active_multipliers', JSON.stringify(this.activeMultipliers));
            
            this.calculateTotalMultiplier();
            this.updateDisplay();
            
            this.showNotification(`${multiplier.name} куплен и активирован!`, 'success');
        }
    }
    
    startMultiplierTimers() {
        // Обновляем таймеры каждую минуту
        this.timerInterval = setInterval(() => {
            this.initMultipliersData(); // Очищаем истекшие
            this.updateDisplay();
        }, 60000);
    }
    
    showNotification(message, type) {
        if (this.context?.eventBus) {
            this.context.eventBus.emit('notification:show', {
                type: type,
                title: type === 'success' ? 'Успешно' : type === 'error' ? 'Ошибка' : 'Внимание',
                message: message
            });
        }
    }
    
    destroy() {
        console.log('🧹 Destroying Multipliers Module...');
        
        // Останавливаем таймеры
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        // Удаляем стили
        const styles = document.querySelector(`style[data-module="${this.name}"]`);
        if (styles) styles.remove();
        
        // Очищаем контейнер
        if (this.container) {
            this.container.innerHTML = '';
        }
        
        console.log('✅ Multipliers Module destroyed');
    }
}
