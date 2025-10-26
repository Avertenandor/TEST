// modules/bonuses/bonuses.module.js
// Модуль бонусов GENESIS DeFi Platform

import BonusesState from './bonuses.state.js';
import BonusesAPI from './bonuses.api.js';

export default class BonusesModule {
    constructor() {
        this.name = 'bonuses';
        this.version = '1.0.0';
        this.dependencies = ['auth', 'platform-access'];
        
        this.state = null;
        this.api = null;
        this.container = null;
        this.context = null;
        this.subscriptions = [];
        this.updateInterval = null;
    }
    
    async init(context) {
        console.log('🎁 Initializing Bonuses Module...');
        
        this.context = context;
        this.container = context.container;
        
        try {
            // 1. Инициализация состояния
            this.state = new BonusesState();
            this.state.load();
            
            // 2. Инициализация API
            const config = context.config || window.store.get('config');
            this.api = new BonusesAPI(config);
            
            // 3. Загрузка шаблона
            await this.loadTemplate();
            
            // 4. Загрузка стилей
            await this.loadStyles();
            
            // 5. Инициализация обработчиков
            this.initEventHandlers();
            
            // 6. Подписка на события
            this.subscribeToEvents();
            
            // 7. Загрузка данных о бонусах
            await this.loadBonusesData();
            
            // 8. Запуск обновления
            this.startAutoUpdate();
            
            console.log('✅ Bonuses Module initialized successfully');
            
            return this;
            
        } catch (error) {
            console.error('❌ Failed to initialize Bonuses Module:', error);
            throw error;
        }
    }
    
    async loadTemplate() {
        try {
            const response = await fetch('/modules/bonuses/bonuses.template.html');
            const html = await response.text();
            this.container.innerHTML = html;
        } catch (error) {
            console.error('Failed to load bonuses template:', error);
            this.container.innerHTML = this.getFallbackTemplate();
        }
    }
    
    async loadStyles() {
        const existingLink = document.querySelector(`link[data-module="${this.name}"]`);
        if (existingLink) return;
        
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/modules/bonuses/bonuses.styles.css';
        link.dataset.module = this.name;
        document.head.appendChild(link);
    }
    
    initEventHandlers() {
        // Кнопки активации бонусов
        const activateButtons = this.container.querySelectorAll('.bonus-activate-btn');
        activateButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const bonusType = e.target.dataset.bonusType;
                this.activateBonus(bonusType);
            });
        });
        
        // Кнопка сбора ежедневного бонуса
        const dailyBonusBtn = this.container.querySelector('#daily-bonus-btn');
        if (dailyBonusBtn) {
            dailyBonusBtn.addEventListener('click', () => this.claimDailyBonus());
        }
        
        // Кнопки множителей
        const multiplierButtons = this.container.querySelectorAll('.multiplier-btn');
        multiplierButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const multiplier = e.target.dataset.multiplier;
                this.activateMultiplier(multiplier);
            });
        });
        
        // Обновление прогресса достижений
        this.updateAchievementsProgress();
    }
    
    async loadBonusesData() {
        try {
            // Загружаем данные о бонусах пользователя
            const userAddress = window.store.get('user.address');
            if (!userAddress) return;
            
            // Получаем данные с блокчейна или из локального состояния
            const bonusesData = await this.api.getUserBonuses(userAddress);
            
            // Обновляем состояние
            this.state.update(bonusesData);
            
            // Обновляем UI
            this.updateUI();
            
        } catch (error) {
            console.error('Error loading bonuses data:', error);
        }
    }
    
    updateUI() {
        // Обновляем счетчики бонусов
        const totalBonusEl = this.container.querySelector('#total-bonus-count');
        if (totalBonusEl) {
            totalBonusEl.textContent = this.state.getTotalBonuses();
        }
        
        // Обновляем активные бонусы
        const activeBonusesEl = this.container.querySelector('#active-bonuses-list');
        if (activeBonusesEl) {
            activeBonusesEl.innerHTML = this.renderActiveBonuses();
        }
        
        // Обновляем таймер следующего бонуса
        this.updateNextBonusTimer();
        
        // Обновляем множители
        const currentMultiplierEl = this.container.querySelector('#current-multiplier');
        if (currentMultiplierEl) {
            currentMultiplierEl.textContent = `x${this.state.getCurrentMultiplier()}`;
        }
        
        // Обновляем достижения
        this.updateAchievements();
    }
    
    renderActiveBonuses() {
        const activeBonuses = this.state.getActiveBonuses();
        
        if (activeBonuses.length === 0) {
            return '<div class="no-bonuses">Нет активных бонусов</div>';
        }
        
        return activeBonuses.map(bonus => `
            <div class="active-bonus-card">
                <div class="bonus-icon">${bonus.icon}</div>
                <div class="bonus-details">
                    <div class="bonus-name">${bonus.name}</div>
                    <div class="bonus-value">+${bonus.value}%</div>
                    <div class="bonus-timer" data-expires="${bonus.expiresAt}">
                        Осталось: ${this.formatTimeRemaining(bonus.expiresAt)}
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    async activateBonus(bonusType) {
        try {
            // Проверяем доступность бонуса
            if (!this.state.canActivateBonus(bonusType)) {
                this.showNotification('Этот бонус уже активен или недоступен', 'warning');
                return;
            }
            
            // Активируем бонус
            const result = await this.api.activateBonus(bonusType);
            
            if (result.success) {
                // Обновляем состояние
                this.state.addActiveBonus(result.bonus);
                
                // Обновляем UI
                this.updateUI();
                
                // Показываем уведомление
                this.showNotification(`Бонус "${result.bonus.name}" активирован!`, 'success');
                
                // Генерируем событие
                if (this.context.eventBus) {
                    this.context.eventBus.emit('bonus:activated', {
                        type: bonusType,
                        bonus: result.bonus
                    });
                }
            }
            
        } catch (error) {
            console.error('Error activating bonus:', error);
            this.showNotification('Ошибка активации бонуса', 'error');
        }
    }
    
    async claimDailyBonus() {
        try {
            // Проверяем доступность
            if (!this.state.canClaimDailyBonus()) {
                const nextClaim = this.state.getNextDailyBonusTime();
                this.showNotification(
                    `Следующий бонус доступен через ${this.formatTimeRemaining(nextClaim)}`,
                    'info'
                );
                return;
            }
            
            // Собираем бонус
            const result = await this.api.claimDailyBonus();
            
            if (result.success) {
                // Обновляем состояние
                this.state.setDailyBonusClaimed();
                
                // Обновляем UI
                this.updateUI();
                
                // Показываем уведомление с анимацией
                this.showBonusClaimedAnimation(result.amount);
                
                // Генерируем событие
                if (this.context.eventBus) {
                    this.context.eventBus.emit('bonus:daily:claimed', {
                        amount: result.amount,
                        streak: result.streak
                    });
                }
            }
            
        } catch (error) {
            console.error('Error claiming daily bonus:', error);
            this.showNotification('Ошибка получения ежедневного бонуса', 'error');
        }
    }
    
    async activateMultiplier(multiplierValue) {
        try {
            // Проверяем стоимость множителя
            const cost = this.state.getMultiplierCost(multiplierValue);
            
            // Показываем подтверждение
            const confirmed = await this.showConfirmation(
                `Активировать множитель x${multiplierValue}?`,
                `Стоимость: ${cost} PLEX`
            );
            
            if (!confirmed) return;
            
            // Активируем множитель
            const result = await this.api.activateMultiplier(multiplierValue);
            
            if (result.success) {
                // Обновляем состояние
                this.state.setMultiplier(multiplierValue);
                
                // Обновляем UI
                this.updateUI();
                
                // Показываем эффект
                this.showMultiplierEffect(multiplierValue);
                
                // Генерируем событие
                if (this.context.eventBus) {
                    this.context.eventBus.emit('multiplier:activated', {
                        value: multiplierValue,
                        cost: cost
                    });
                }
            }
            
        } catch (error) {
            console.error('Error activating multiplier:', error);
            this.showNotification('Ошибка активации множителя', 'error');
        }
    }
    
    updateAchievementsProgress() {
        const achievements = this.state.getAchievements();
        
        achievements.forEach(achievement => {
            const progressBar = this.container.querySelector(
                `#achievement-${achievement.id} .progress-bar`
            );
            
            if (progressBar) {
                const percentage = (achievement.current / achievement.target) * 100;
                progressBar.style.width = `${Math.min(percentage, 100)}%`;
                
                // Обновляем текст прогресса
                const progressText = this.container.querySelector(
                    `#achievement-${achievement.id} .progress-text`
                );
                if (progressText) {
                    progressText.textContent = `${achievement.current} / ${achievement.target}`;
                }
                
                // Проверяем завершение
                if (achievement.current >= achievement.target && !achievement.claimed) {
                    this.showAchievementUnlocked(achievement);
                }
            }
        });
    }
    
    updateAchievements() {
        const achievementsContainer = this.container.querySelector('#achievements-container');
        if (!achievementsContainer) return;
        
        const achievements = this.state.getAchievements();
        
        achievementsContainer.innerHTML = achievements.map(achievement => `
            <div class="achievement-card ${achievement.completed ? 'completed' : ''}" 
                 id="achievement-${achievement.id}">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-details">
                    <div class="achievement-name">${achievement.name}</div>
                    <div class="achievement-description">${achievement.description}</div>
                    <div class="achievement-progress">
                        <div class="progress-bar-container">
                            <div class="progress-bar" style="width: ${(achievement.current / achievement.target) * 100}%"></div>
                        </div>
                        <span class="progress-text">${achievement.current} / ${achievement.target}</span>
                    </div>
                    ${achievement.completed && !achievement.claimed ? 
                        '<button class="claim-achievement-btn" data-achievement-id="' + achievement.id + '">Получить награду</button>' : 
                        ''
                    }
                </div>
            </div>
        `).join('');
        
        // Добавляем обработчики для кнопок получения наград
        achievementsContainer.querySelectorAll('.claim-achievement-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const achievementId = e.target.dataset.achievementId;
                this.claimAchievementReward(achievementId);
            });
        });
    }
    
    async claimAchievementReward(achievementId) {
        try {
            const result = await this.api.claimAchievementReward(achievementId);
            
            if (result.success) {
                // Обновляем состояние
                this.state.markAchievementClaimed(achievementId);
                
                // Обновляем UI
                this.updateAchievements();
                
                // Показываем награду
                this.showRewardAnimation(result.reward);
                
                // Генерируем событие
                if (this.context.eventBus) {
                    this.context.eventBus.emit('achievement:claimed', {
                        id: achievementId,
                        reward: result.reward
                    });
                }
            }
            
        } catch (error) {
            console.error('Error claiming achievement reward:', error);
            this.showNotification('Ошибка получения награды', 'error');
        }
    }
    
    updateNextBonusTimer() {
        const timerEl = this.container.querySelector('#next-bonus-timer');
        if (!timerEl) return;
        
        const nextBonusTime = this.state.getNextDailyBonusTime();
        
        if (nextBonusTime) {
            const updateTimer = () => {
                const remaining = this.formatTimeRemaining(nextBonusTime);
                timerEl.textContent = remaining;
                
                if (new Date() < new Date(nextBonusTime)) {
                    requestAnimationFrame(updateTimer);
                } else {
                    // Бонус доступен
                    timerEl.textContent = 'Доступен!';
                    timerEl.classList.add('bonus-available');
                }
            };
            
            updateTimer();
        }
    }
    
    formatTimeRemaining(targetTime) {
        const now = new Date();
        const target = new Date(targetTime);
        const diff = target - now;
        
        if (diff <= 0) return 'Доступно';
        
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        if (hours > 0) {
            return `${hours}ч ${minutes}м`;
        } else if (minutes > 0) {
            return `${minutes}м ${seconds}с`;
        } else {
            return `${seconds}с`;
        }
    }
    
    showBonusClaimedAnimation(amount) {
        // Создаем элемент анимации
        const animation = document.createElement('div');
        animation.className = 'bonus-claimed-animation';
        animation.innerHTML = `
            <div class="bonus-amount">+${amount} PLEX</div>
            <div class="bonus-particles"></div>
        `;
        
        this.container.appendChild(animation);
        
        // Удаляем после анимации
        setTimeout(() => animation.remove(), 3000);
        
        // Показываем уведомление
