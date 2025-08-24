// modules/gifts/gifts.module.js
// Модуль подарков GENESIS - система наград и подарков

import GiftsAPI from './gifts.api.js';
import GiftsState from './gifts.state.js';

export default class GiftsModule {
    constructor() {
        this.name = 'gifts';
        this.version = '1.0.0';
        this.dependencies = ['auth', 'platform-access'];
        
        this.state = null;
        this.api = null;
        this.container = null;
        this.context = null;
        this.subscriptions = [];
    }
    
    async init(context) {
        console.log('🎁 Initializing Gifts Module...');
        
        this.context = context;
        this.container = context.container;
        
        try {
            // 1. Инициализация состояния
            this.state = new GiftsState();
            this.state.load();
            
            // 2. Инициализация API
            const config = context.config || window.store?.get('config');
            this.api = new GiftsAPI(config);
            
            // 3. Загрузка шаблона
            await this.loadTemplate();
            
            // 4. Загрузка стилей
            await this.loadStyles();
            
            // 5. Инициализация обработчиков
            this.initEventHandlers();
            
            // 6. Подписка на события
            this.subscribeToEvents();
            
            // 7. Загрузка данных о подарках
            await this.loadGifts();
            
            console.log('✅ Gifts Module initialized successfully');
            return this;
            
        } catch (error) {
            console.error('❌ Failed to initialize Gifts Module:', error);
            throw error;
        }
    }
    
    async loadTemplate() {
        try {
            const response = await fetch('/modules/gifts/gifts.template.html');
            if (response.ok) {
                const html = await response.text();
                if (this.container) {
                    this.container.innerHTML = html;
                }
            } else {
                throw new Error('Failed to load template');
            }
        } catch (error) {
            console.error('Failed to load gifts template:', error);
            // Используем fallback шаблон
            if (this.container) {
                this.container.innerHTML = this.getFallbackTemplate();
            }
        }
    }
    
    async loadStyles() {
        const existingLink = document.querySelector(`link[data-module="${this.name}"]`);
        if (existingLink) return;
        
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/modules/gifts/gifts.styles.css';
        link.dataset.module = this.name;
        document.head.appendChild(link);
    }
    
    initEventHandlers() {
        // Обработчики для кнопок получения подарков
        const claimButtons = this.container?.querySelectorAll('.claim-gift-btn');
        claimButtons?.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const giftId = e.target.dataset.giftId;
                this.claimGift(giftId);
            });
        });
        
        // Обработчик для ежедневного подарка
        const dailyGiftBtn = this.container?.querySelector('#claim-daily-gift');
        if (dailyGiftBtn) {
            dailyGiftBtn.addEventListener('click', this.claimDailyGift.bind(this));
        }
    }
    
    async loadGifts() {
        try {
            // Загружаем доступные подарки
            const gifts = await this.api.getAvailableGifts();
            this.state.setGifts(gifts);
            
            // Обновляем UI
            this.renderGifts(gifts);
            
            // Проверяем ежедневный подарок
            await this.checkDailyGift();
            
        } catch (error) {
            console.error('Error loading gifts:', error);
            this.showError('Не удалось загрузить подарки');
        }
    }
    
    renderGifts(gifts) {
        const container = this.container?.querySelector('.gifts-grid');
        if (!container) return;
        
        if (!gifts || gifts.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🎁</div>
                    <h3>Нет доступных подарков</h3>
                    <p>Подарки появятся при выполнении определенных условий</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = gifts.map(gift => `
            <div class="gift-card ${gift.claimed ? 'claimed' : ''}" data-gift-id="${gift.id}">
                <div class="gift-icon">${gift.icon || '🎁'}</div>
                <div class="gift-content">
                    <h3 class="gift-title">${gift.name}</h3>
                    <p class="gift-description">${gift.description}</p>
                    <div class="gift-reward">
                        <span class="reward-label">Награда:</span>
                        <span class="reward-value">${gift.reward}</span>
                    </div>
                    <div class="gift-condition">
                        <span class="condition-label">Условие:</span>
                        <span class="condition-value">${gift.condition}</span>
                    </div>
                    ${gift.claimed ? 
                        '<div class="gift-status claimed">✅ Получено</div>' :
                        gift.available ?
                            `<button class="btn btn-primary claim-gift-btn" data-gift-id="${gift.id}">
                                Получить подарок
                            </button>` :
                            '<div class="gift-status locked">🔒 Недоступно</div>'
                    }
                </div>
                ${gift.progress !== undefined ? `
                    <div class="gift-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${gift.progress}%"></div>
                        </div>
                        <span class="progress-text">${gift.progress}%</span>
                    </div>
                ` : ''}
            </div>
        `).join('');
        
        // Переинициализируем обработчики для новых элементов
        this.initEventHandlers();
    }
    
    async checkDailyGift() {
        try {
            const dailyGift = await this.api.checkDailyGift();
            const dailySection = this.container?.querySelector('.daily-gift-section');
            
            if (!dailySection) return;
            
            if (dailyGift.available) {
                dailySection.innerHTML = `
                    <div class="daily-gift-card available">
                        <h3>🎁 Ежедневный подарок</h3>
                        <p>Ваш ежедневный подарок доступен!</p>
                        <div class="daily-reward">
                            <span class="reward-icon">💰</span>
                            <span class="reward-amount">${dailyGift.reward} USDT</span>
                        </div>
                        <button id="claim-daily-gift" class="btn btn-success">
                            Получить подарок
                        </button>
                    </div>
                `;
            } else {
                const timeUntilNext = this.getTimeUntilNext(dailyGift.nextAvailable);
                dailySection.innerHTML = `
                    <div class="daily-gift-card claimed">
                        <h3>🎁 Ежедневный подарок</h3>
                        <p>Вы уже получили ежедневный подарок</p>
                        <div class="next-gift-timer">
                            <span>Следующий подарок через:</span>
                            <span class="timer">${timeUntilNext}</span>
                        </div>
                        <div class="streak-info">
                            <span>Дней подряд: </span>
                            <span class="streak-count">${dailyGift.streak || 0}</span>
                        </div>
                    </div>
                `;
                
                // Запускаем таймер обратного отсчета
                this.startDailyGiftTimer(dailyGift.nextAvailable);
            }
            
            // Переинициализируем обработчики
            this.initEventHandlers();
            
        } catch (error) {
            console.error('Error checking daily gift:', error);
        }
    }
    
    getTimeUntilNext(nextTime) {
        if (!nextTime) return '00:00:00';
        
        const now = new Date();
        const next = new Date(nextTime);
        const diff = next - now;
        
        if (diff <= 0) return '00:00:00';
        
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    startDailyGiftTimer(nextTime) {
        const timerEl = this.container?.querySelector('.timer');
        if (!timerEl) return;
        
        const interval = setInterval(() => {
            const timeRemaining = this.getTimeUntilNext(nextTime);
            timerEl.textContent = timeRemaining;
            
            if (timeRemaining === '00:00:00') {
                clearInterval(interval);
                this.checkDailyGift(); // Перепроверяем доступность
            }
        }, 1000);
        
        // Сохраняем интервал для очистки при уничтожении модуля
        this.dailyTimerInterval = interval;
    }
    
    async claimDailyGift() {
        try {
            const result = await this.api.claimDailyGift();
            
            if (result.success) {
                this.showSuccess(`Получено ${result.reward} USDT!`);
                
                // Обновляем состояние
                this.state.addClaimedGift({
                    type: 'daily',
                    reward: result.reward,
                    date: new Date()
                });
                
                // Перезагружаем ежедневный подарок
                await this.checkDailyGift();
                
                // Эмитим событие для обновления баланса
                if (this.context.eventBus) {
                    this.context.eventBus.emit('balance:updated', {
                        amount: result.reward,
                        type: 'gift'
                    });
                }
            } else {
                this.showError(result.message || 'Не удалось получить подарок');
            }
        } catch (error) {
            console.error('Error claiming daily gift:', error);
            this.showError('Ошибка при получении подарка');
        }
    }
    
    async claimGift(giftId) {
        if (!giftId) return;
        
        try {
            const result = await this.api.claimGift(giftId);
            
            if (result.success) {
                this.showSuccess(`Получен подарок: ${result.reward}!`);
                
                // Обновляем состояние
                this.state.markGiftClaimed(giftId);
                
                // Перезагружаем список подарков
                await this.loadGifts();
                
                // Эмитим событие
                if (this.context.eventBus) {
                    this.context.eventBus.emit('gift:claimed', {
                        giftId,
                        reward: result.reward
                    });
                }
            } else {
                this.showError(result.message || 'Не удалось получить подарок');
            }
        } catch (error) {
            console.error('Error claiming gift:', error);
            this.showError('Ошибка при получении подарка');
        }
    }
    
    subscribeToEvents() {
        if (this.context.eventBus) {
            // Подписка на события достижений
            this.subscriptions.push(
                this.context.eventBus.on('achievement:unlocked', async (data) => {
                    // Проверяем, есть ли новые подарки за достижение
                    await this.loadGifts();
                })
            );
            
            // Подписка на события депозитов
            this.subscriptions.push(
                this.context.eventBus.on('deposit:created', async () => {
                    // Проверяем подарки за создание депозитов
                    await this.loadGifts();
                })
            );
        }
    }
    
    showError(message) {
        if (this.context.eventBus) {
            this.context.eventBus.emit('notification:show', {
                type: 'error',
                title: 'Ошибка',
                message
            });
        }
    }
    
    showSuccess(message) {
        if (this.context.eventBus) {
            this.context.eventBus.emit('notification:show', {
                type: 'success',
                title: 'Успешно',
                message
            });
        }
    }
    
    getFallbackTemplate() {
        return `
            <div class="gifts-container">
                <div class="page-header">
                    <h2 class="page-title">🎁 Подарки</h2>
                    <p class="page-subtitle">Получайте награды за активность в системе</p>
                </div>
                
                <div class="daily-gift-section">
                    <!-- Ежедневный подарок -->
                </div>
                
                <div class="gifts-section">
                    <h3>Доступные подарки</h3>
                    <div class="gifts-grid">
                        <!-- Подарки будут загружены сюда -->
                    </div>
                </div>
                
                <div class="gift-history">
                    <h3>История подарков</h3>
                    <div class="history-list">
                        <div class="empty-state">
                            <p>История подарков пуста</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    destroy() {
        console.log('🧹 Destroying Gifts Module...');
        
        // Останавливаем таймер
        if (this.dailyTimerInterval) {
            clearInterval(this.dailyTimerInterval);
        }
        
        // Отписка от событий
        this.subscriptions.forEach(unsub => {
            if (typeof unsub === 'function') unsub();
        });
        
        // Удаление стилей
        const link = document.querySelector(`link[data-module="${this.name}"]`);
        if (link) link.remove();
        
        // Очистка контейнера
        if (this.container) {
            this.container.innerHTML = '';
        }
        
        console.log('✅ Gifts Module destroyed');
    }
}
