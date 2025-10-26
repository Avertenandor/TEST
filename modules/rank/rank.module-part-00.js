// modules/rank/rank.module.js
// Модуль системы рангов GENESIS - достижения и статусы пользователей

export default class RankModule {
    constructor() {
        this.name = 'rank';
        this.version = '1.0.0';
        this.dependencies = ['auth'];
        
        this.container = null;
        this.context = null;
        this.currentRank = null;
        this.userPoints = 0;
    }
    
    async init(context) {
        console.log('🏅 Initializing Rank Module...');
        
        this.context = context;
        this.container = context.container;
        
        try {
            // Загрузка шаблона
            await this.loadTemplate();
            
            // Загрузка стилей
            await this.loadStyles();
            
            // Инициализация данных о ранге
            this.initRankData();
            
            // Обновление отображения
            this.updateDisplay();
            
            console.log('✅ Rank Module initialized successfully');
            return this;
            
        } catch (error) {
            console.error('❌ Failed to initialize Rank Module:', error);
            throw error;
        }
    }
    
    async loadTemplate() {
        if (this.container) {
            this.container.innerHTML = `
                <div class="rank-container">
                    <div class="page-header">
                        <h2 class="page-title">🏅 Система рангов</h2>
                        <p class="page-subtitle">Ваш статус и достижения в GENESIS</p>
                    </div>
                    
                    <div class="current-rank-card">
                        <div class="rank-badge">
                            <div id="rank-icon" class="rank-icon">🥉</div>
                            <div class="rank-info">
                                <h3 id="rank-name">Новичок</h3>
                                <p id="rank-description">Начинающий участник системы</p>
                            </div>
                        </div>
                        
                        <div class="rank-progress">
                            <div class="progress-header">
                                <span>Прогресс до следующего ранга</span>
                                <span id="rank-points">0 / 100 очков</span>
                            </div>
                            <div class="progress-bar">
                                <div id="rank-progress-fill" class="progress-fill" style="width: 0%"></div>
                            </div>
                            <div class="next-rank-info">
                                <span>Следующий ранг:</span>
                                <span id="next-rank-name">Участник</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="ranks-ladder">
                        <h3>📊 Лестница рангов</h3>
                        <div class="ranks-list">
                            <div class="rank-item" data-rank="1">
                                <div class="rank-item-icon">🥉</div>
                                <div class="rank-item-info">
                                    <div class="rank-item-name">Новичок</div>
                                    <div class="rank-item-requirement">0 очков</div>
                                </div>
                                <div class="rank-item-benefits">
                                    <span>Базовый доступ</span>
                                </div>
                            </div>
                            
                            <div class="rank-item" data-rank="2">
                                <div class="rank-item-icon">🥈</div>
                                <div class="rank-item-info">
                                    <div class="rank-item-name">Участник</div>
                                    <div class="rank-item-requirement">100 очков</div>
                                </div>
                                <div class="rank-item-benefits">
                                    <span>+5% к доходности</span>
                                </div>
                            </div>
                            
                            <div class="rank-item" data-rank="3">
                                <div class="rank-item-icon">🥇</div>
                                <div class="rank-item-info">
                                    <div class="rank-item-name">Активный</div>
                                    <div class="rank-item-requirement">500 очков</div>
                                </div>
                                <div class="rank-item-benefits">
                                    <span>+10% к доходности</span>
                                </div>
                            </div>
                            
                            <div class="rank-item" data-rank="4">
                                <div class="rank-item-icon">💎</div>
                                <div class="rank-item-info">
                                    <div class="rank-item-name">Профессионал</div>
                                    <div class="rank-item-requirement">1500 очков</div>
                                </div>
                                <div class="rank-item-benefits">
                                    <span>+15% к доходности</span>
                                </div>
                            </div>
                            
                            <div class="rank-item" data-rank="5">
                                <div class="rank-item-icon">⭐</div>
                                <div class="rank-item-info">
                                    <div class="rank-item-name">Эксперт</div>
                                    <div class="rank-item-requirement">5000 очков</div>
                                </div>
                                <div class="rank-item-benefits">
                                    <span>+20% к доходности</span>
                                </div>
                            </div>
                            
                            <div class="rank-item" data-rank="6">
                                <div class="rank-item-icon">👑</div>
                                <div class="rank-item-info">
                                    <div class="rank-item-name">Легенда</div>
                                    <div class="rank-item-requirement">10000 очков</div>
                                </div>
                                <div class="rank-item-benefits">
                                    <span>+30% к доходности</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="points-sources">
                        <h3>💰 Как заработать очки</h3>
                        <div class="sources-grid">
                            <div class="source-card">
                                <div class="source-icon">💵</div>
                                <div class="source-title">Депозиты</div>
                                <div class="source-points">+10 очков за каждый</div>
                            </div>
                            <div class="source-card">
                                <div class="source-icon">📅</div>
                                <div class="source-title">Ежедневный вход</div>
                                <div class="source-points">+1 очко в день</div>
                            </div>
                            <div class="source-card">
                                <div class="source-icon">👥</div>
                                <div class="source-title">Рефералы</div>
                                <div class="source-points">+50 очков за реферала</div>
                            </div>
                            <div class="source-card">
                                <div class="source-icon">🏆</div>
                                <div class="source-title">Достижения</div>
                                <div class="source-points">+5-100 очков</div>
                            </div>
                            <div class="source-card">
                                <div class="source-icon">💰</div>
                                <div class="source-title">Объем инвестиций</div>
                                <div class="source-points">+1 очко за $10</div>
                            </div>
                            <div class="source-card">
                                <div class="source-icon">🎁</div>
                                <div class="source-title">Бонусы</div>
                                <div class="source-points">Различные</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="rank-benefits">
                        <h3>🎯 Преимущества высокого ранга</h3>
                        <ul>
                            <li>📈 Повышенная доходность от депозитов</li>
                            <li>🎁 Эксклюзивные подарки и бонусы</li>
                            <li>⚡ Приоритетная поддержка</li>
                            <li>🔓 Доступ к VIP функциям</li>
                            <li>💎 Особый статус в системе</li>
                            <li>🚀 Ранний доступ к новым возможностям</li>
                        </ul>
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
                .rank-container {
                    padding: 2rem;
                    max-width: 1200px;
                    margin: 0 auto;
                }
                
                .current-rank-card {
                    background: linear-gradient(135deg, var(--bg-secondary), rgba(255, 215, 0, 0.1));
                    border: 2px solid var(--gold-color);
                    border-radius: 16px;
                    padding: 2rem;
                    margin-bottom: 2rem;
                }
                
                .rank-badge {
                    display: flex;
                    align-items: center;
                    gap: 2rem;
                    margin-bottom: 2rem;
                }
                
                .rank-icon {
                    font-size: 4rem;
                }
                
                .rank-info h3 {
                    color: var(--gold-color);
                    font-size: 2rem;
                    margin-bottom: 0.5rem;
                }
                
                .rank-info p {
                    color: var(--text-secondary);
                }
                
                .rank-progress {
                    background: var(--bg-primary);
                    padding: 1.5rem;
                    border-radius: 12px;
                }
                
                .progress-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 1rem;
                    color: var(--text-secondary);
                }
                
                #rank-points {
                    color: var(--primary-color);
                    font-weight: 600;
                }
                
                .progress-bar {
                    background: var(--bg-secondary);
                    height: 12px;
                    border-radius: 6px;
                    overflow: hidden;
                    margin-bottom: 1rem;
                }
                
                .progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, var(--gold-color), var(--primary-color));
                    transition: width 0.5s ease;
                }
                
                .next-rank-info {
                    display: flex;
                    justify-content: space-between;
                    color: var(--text-secondary);
                }
                
                #next-rank-name {
                    color: var(--text-primary);
                    font-weight: 600;
                }
                
                .ranks-ladder {
                    margin-bottom: 2rem;
                }
                
                .ranks-ladder h3 {
                    color: var(--primary-color);
                    margin-bottom: 1.5rem;
                }
                
                .ranks-list {
                    display: grid;
                    gap: 1rem;
                }
                
                .rank-item {
                    background: var(--bg-secondary);
                    padding: 1.5rem;
                    border-radius: 12px;
                    border: 2px solid var(--border-color);
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                    transition: all 0.3s ease;
                }
                
                .rank-item.current {
                    border-color: var(--gold-color);
                    background: rgba(255, 215, 0, 0.1);
                }
                
                .rank-item.achieved {
                    opacity: 1;
                }
                
                .rank-item.locked {
                    opacity: 0.5;
                }
                
                .rank-item:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
                }
                
                .rank-item-icon {
                    font-size: 2.5rem;
                }
                
                .rank-item-info {
                    flex: 1;
                }
                
                .rank-item-name {
                    color: var(--text-primary);
                    font-weight: 600;
                    font-size: 1.1rem;
                    margin-bottom: 0.25rem;
                }
                
                .rank-item-requirement {
                    color: var(--text-secondary);
                    font-size: 0.9rem;
                }
                
                .rank-item-benefits {
                    background: var(--bg-primary);
                    padding: 0.5rem 1rem;
                    border-radius: 20px;
                    color: var(--success-color);
                    font-weight: 600;
                    font-size: 0.9rem;
                }
                
                .points-sources {
                    margin-bottom: 2rem;
                }
                
                .points-sources h3 {
                    color: var(--primary-color);
                    margin-bottom: 1.5rem;
                }
                
                .sources-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1rem;
                }
                
                .source-card {
                    background: var(--bg-secondary);
                    padding: 1.5rem;
                    border-radius: 12px;
                    text-align: center;
                    border: 1px solid var(--border-color);
                    transition: all 0.3s ease;
                }
                
                .source-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
                    border-color: var(--primary-color);
                }
                
                .source-icon {
                    font-size: 2rem;
                    margin-bottom: 0.5rem;
                }
                
                .source-title {
                    color: var(--text-primary);
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                }
                
                .source-points {
                    color: var(--success-color);
                    font-size: 0.9rem;
                }
                
                .rank-benefits {
                    background: var(--bg-secondary);
                    padding: 2rem;
                    border-radius: 12px;
                    border-left: 4px solid var(--gold-color);
                }
                
                .rank-benefits h3 {
                    color: var(--primary-color);
                    margin-bottom: 1rem;
                }
                
                .rank-benefits ul {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }
                
                .rank-benefits li {
                    padding: 0.5rem 0;
                    color: var(--text-secondary);
                }
                
                @media (max-width: 768px) {
                    .rank-badge {
                        flex-direction: column;
                        text-align: center;
                    }
                    
                    .rank-item {
                        flex-direction: column;
                        text-align: center;
                    }
                    
                    .sources-grid {
                        grid-template-columns: 1fr 1fr;
                    }
                }
            </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', styles);
    }
    
    initRankData() {
        // Загружаем данные о ранге из localStorage
        this.userPoints = parseInt(localStorage.getItem('genesis_rank_points') || '0');
        
        // Определяем текущий ранг
