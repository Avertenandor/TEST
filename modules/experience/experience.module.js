// modules/experience/experience.module.js
// Модуль стажа пользователя GENESIS - отслеживание времени в системе

export default class ExperienceModule {
    constructor() {
        this.name = 'experience';
        this.version = '1.0.0';
        this.dependencies = ['auth'];
        
        this.container = null;
        this.context = null;
        this.joinDate = null;
        this.updateInterval = null;
    }
    
    async init(context) {
        console.log('📅 Initializing Experience Module...');
        
        this.context = context;
        this.container = context.container;
        
        try {
            // Загрузка шаблона
            await this.loadTemplate();
            
            // Загрузка стилей
            await this.loadStyles();
            
            // Инициализация данных о стаже
            this.initExperienceData();
            
            // Обновление отображения
            this.updateDisplay();
            
            // Запуск автообновления
            this.startAutoUpdate();
            
            console.log('✅ Experience Module initialized successfully');
            return this;
            
        } catch (error) {
            console.error('❌ Failed to initialize Experience Module:', error);
            throw error;
        }
    }
    
    async loadTemplate() {
        if (this.container) {
            this.container.innerHTML = `
                <div class="experience-container">
                    <div class="page-header">
                        <h2 class="page-title">📅 Стаж в системе</h2>
                        <p class="page-subtitle">Ваше время и достижения в GENESIS</p>
                    </div>
                    
                    <div class="experience-main-card">
                        <div class="experience-display">
                            <div class="experience-icon">⏱️</div>
                            <div class="experience-content">
                                <h3>Вы с нами уже:</h3>
                                <div class="experience-time">
                                    <span id="exp-days" class="time-value">0</span>
                                    <span class="time-label">дней</span>
                                    <span id="exp-hours" class="time-value">0</span>
                                    <span class="time-label">часов</span>
                                    <span id="exp-minutes" class="time-value">0</span>
                                    <span class="time-label">минут</span>
                                </div>
                                <div class="join-date">
                                    Дата регистрации: <span id="join-date-display">-</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="experience-milestones">
                            <h3>🏆 Достижения по стажу</h3>
                            <div class="milestones-grid">
                                <div class="milestone-card" data-days="1">
                                    <div class="milestone-icon">🌱</div>
                                    <div class="milestone-title">Новичок</div>
                                    <div class="milestone-requirement">1 день</div>
                                    <div class="milestone-reward">+1 USDT</div>
                                </div>
                                <div class="milestone-card" data-days="7">
                                    <div class="milestone-icon">📈</div>
                                    <div class="milestone-title">Активный</div>
                                    <div class="milestone-requirement">7 дней</div>
                                    <div class="milestone-reward">+5 USDT</div>
                                </div>
                                <div class="milestone-card" data-days="30">
                                    <div class="milestone-icon">⭐</div>
                                    <div class="milestone-title">Опытный</div>
                                    <div class="milestone-requirement">30 дней</div>
                                    <div class="milestone-reward">+15 USDT</div>
                                </div>
                                <div class="milestone-card" data-days="90">
                                    <div class="milestone-icon">💎</div>
                                    <div class="milestone-title">Профессионал</div>
                                    <div class="milestone-requirement">90 дней</div>
                                    <div class="milestone-reward">+50 USDT</div>
                                </div>
                                <div class="milestone-card" data-days="180">
                                    <div class="milestone-icon">🏅</div>
                                    <div class="milestone-title">Эксперт</div>
                                    <div class="milestone-requirement">180 дней</div>
                                    <div class="milestone-reward">+100 USDT</div>
                                </div>
                                <div class="milestone-card" data-days="365">
                                    <div class="milestone-icon">👑</div>
                                    <div class="milestone-title">Легенда</div>
                                    <div class="milestone-requirement">365 дней</div>
                                    <div class="milestone-reward">+500 USDT</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="experience-benefits">
                            <h3>💡 Преимущества стажа</h3>
                            <ul>
                                <li>🎁 Эксклюзивные подарки за длительное участие</li>
                                <li>⚡ Повышенные множители доходности</li>
                                <li>🏅 Особый статус и ранг в системе</li>
                                <li>💰 Бонусы за непрерывную активность</li>
                                <li>🔓 Доступ к VIP функциям платформы</li>
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
                .experience-container {
                    padding: 2rem;
                    max-width: 1200px;
                    margin: 0 auto;
                }
                
                .experience-main-card {
                    background: var(--bg-secondary);
                    border-radius: 16px;
                    padding: 2rem;
                    border: 1px solid var(--border-color);
                }
                
                .experience-display {
                    display: flex;
                    align-items: center;
                    gap: 2rem;
                    padding: 2rem;
                    background: linear-gradient(135deg, rgba(255, 107, 53, 0.1), rgba(0, 212, 255, 0.1));
                    border-radius: 12px;
                    margin-bottom: 2rem;
                }
                
                .experience-icon {
                    font-size: 4rem;
                }
                
                .experience-content h3 {
                    color: var(--text-primary);
                    margin-bottom: 1rem;
                }
                
                .experience-time {
                    display: flex;
                    align-items: baseline;
                    gap: 0.5rem;
                    margin-bottom: 1rem;
                }
                
                .time-value {
                    font-size: 2.5rem;
                    font-weight: 700;
                    color: var(--primary-color);
                    font-family: 'Orbitron', monospace;
                }
                
                .time-label {
                    color: var(--text-secondary);
                    margin-right: 1rem;
                }
                
                .join-date {
                    color: var(--text-secondary);
                    font-size: 0.9rem;
                }
                
                #join-date-display {
                    color: var(--text-primary);
                    font-weight: 600;
                }
                
                .experience-milestones {
                    margin: 2rem 0;
                }
                
                .experience-milestones h3 {
                    color: var(--primary-color);
                    margin-bottom: 1.5rem;
                }
                
                .milestones-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 1rem;
                }
                
                .milestone-card {
                    background: var(--bg-primary);
                    padding: 1.5rem;
                    border-radius: 12px;
                    text-align: center;
                    border: 2px solid var(--border-color);
                    transition: all 0.3s ease;
                }
                
                .milestone-card.achieved {
                    border-color: var(--success-color);
                    background: rgba(0, 255, 65, 0.1);
                }
                
                .milestone-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
                }
                
                .milestone-icon {
                    font-size: 2rem;
                    margin-bottom: 0.5rem;
                }
                
                .milestone-title {
                    color: var(--text-primary);
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                }
                
                .milestone-requirement {
                    color: var(--text-secondary);
                    font-size: 0.9rem;
                    margin-bottom: 0.5rem;
                }
                
                .milestone-reward {
                    color: var(--success-color);
                    font-weight: 700;
                }
                
                .experience-benefits {
                    background: var(--bg-primary);
                    padding: 1.5rem;
                    border-radius: 12px;
                    margin-top: 2rem;
                }
                
                .experience-benefits h3 {
                    color: var(--primary-color);
                    margin-bottom: 1rem;
                }
                
                .experience-benefits ul {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }
                
                .experience-benefits li {
                    padding: 0.5rem 0;
                    color: var(--text-secondary);
                }
                
                @media (max-width: 768px) {
                    .experience-display {
                        flex-direction: column;
                        text-align: center;
                    }
                    
                    .experience-time {
                        flex-direction: column;
                        align-items: center;
                    }
                    
                    .milestones-grid {
                        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                    }
                }
            </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', styles);
    }
    
    initExperienceData() {
        // Получаем дату регистрации
        let joinDate = localStorage.getItem('genesis_join_date');
        
        if (!joinDate) {
            // Если нет даты, устанавливаем текущую
            joinDate = new Date().toISOString();
            localStorage.setItem('genesis_join_date', joinDate);
        }
        
        this.joinDate = new Date(joinDate);
    }
    
    updateDisplay() {
        if (!this.container) return;
        
        const now = new Date();
        const diff = now - this.joinDate;
        
        // Вычисляем дни, часы, минуты
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        // Обновляем отображение
        const daysEl = this.container.querySelector('#exp-days');
        const hoursEl = this.container.querySelector('#exp-hours');
        const minutesEl = this.container.querySelector('#exp-minutes');
        const joinDateEl = this.container.querySelector('#join-date-display');
        
        if (daysEl) daysEl.textContent = days;
        if (hoursEl) hoursEl.textContent = hours;
        if (minutesEl) minutesEl.textContent = minutes;
        if (joinDateEl) {
            joinDateEl.textContent = this.joinDate.toLocaleDateString('ru-RU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
        
        // Обновляем достижения
        this.updateMilestones(days);
    }
    
    updateMilestones(currentDays) {
        const milestones = this.container?.querySelectorAll('.milestone-card');
        
        milestones?.forEach(milestone => {
            const requiredDays = parseInt(milestone.dataset.days);
            if (currentDays >= requiredDays) {
                milestone.classList.add('achieved');
            } else {
                milestone.classList.remove('achieved');
            }
        });
    }
    
    startAutoUpdate() {
        // Обновляем каждую минуту
        this.updateInterval = setInterval(() => {
            this.updateDisplay();
        }, 60000);
    }
    
    destroy() {
        console.log('🧹 Destroying Experience Module...');
        
        // Останавливаем автообновление
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        // Удаление стилей
        const styles = document.querySelector(`style[data-module="${this.name}"]`);
        if (styles) styles.remove();
        
        // Очистка контейнера
        if (this.container) {
            this.container.innerHTML = '';
        }
        
        console.log('✅ Experience Module destroyed');
    }
}
