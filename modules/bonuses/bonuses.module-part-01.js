        this.showNotification(`Получен ежедневный бонус: ${amount} PLEX!`, 'success');
    }
    
    showMultiplierEffect(multiplierValue) {
        const effect = document.createElement('div');
        effect.className = 'multiplier-effect';
        effect.innerHTML = `<span>x${multiplierValue}</span>`;
        
        this.container.appendChild(effect);
        
        setTimeout(() => effect.remove(), 2000);
    }
    
    showAchievementUnlocked(achievement) {
        const notification = document.createElement('div');
        notification.className = 'achievement-unlocked-notification';
        notification.innerHTML = `
            <div class="achievement-unlocked-content">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-text">
                    <div class="achievement-title">Достижение разблокировано!</div>
                    <div class="achievement-name">${achievement.name}</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 5000);
    }
    
    showRewardAnimation(reward) {
        const rewardEl = document.createElement('div');
        rewardEl.className = 'reward-animation';
        rewardEl.innerHTML = `
            <div class="reward-content">
                <div class="reward-icon">🎁</div>
                <div class="reward-text">${reward.description}</div>
                <div class="reward-value">+${reward.value} ${reward.currency}</div>
            </div>
        `;
        
        this.container.appendChild(rewardEl);
        
        setTimeout(() => rewardEl.remove(), 4000);
    }
    
    async showConfirmation(title, message) {
        // Простое подтверждение через confirm
        // В будущем можно заменить на красивое модальное окно
        return confirm(`${title}\n\n${message}`);
    }
    
    showNotification(message, type = 'info') {
        if (this.context.eventBus) {
            this.context.eventBus.emit('notification:show', {
                type: type,
                message: message,
                duration: 3000
            });
        }
    }
    
    subscribeToEvents() {
        if (!this.context.eventBus) return;
        
        // Подписка на обновление депозитов (влияет на бонусы)
        this.subscriptions.push(
            this.context.eventBus.on('deposit:created', () => {
                this.checkDepositBonuses();
            })
        );
        
        // Подписка на обновление транзакций
        this.subscriptions.push(
            this.context.eventBus.on('transaction:completed', (data) => {
                this.updateAchievementsProgress();
            })
        );
        
        // Подписка на изменение дня (для ежедневных бонусов)
        this.subscriptions.push(
            this.context.eventBus.on('day:changed', () => {
                this.resetDailyBonuses();
            })
        );
    }
    
    checkDepositBonuses() {
        // Проверяем бонусы за количество депозитов
        const depositCount = window.store.get('deposits.activeCount') || 0;
        
        // Автоматически активируем бонусы за достижения
        if (depositCount >= 5 && !this.state.hasBonus('deposit5')) {
            this.activateBonus('deposit5');
        }
        
        if (depositCount >= 10 && !this.state.hasBonus('deposit10')) {
            this.activateBonus('deposit10');
        }
    }
    
    resetDailyBonuses() {
        // Сбрасываем статус ежедневного бонуса
        this.state.resetDailyBonus();
        this.updateUI();
    }
    
    startAutoUpdate() {
        // Обновляем UI каждую секунду для таймеров
        this.updateInterval = setInterval(() => {
            // Обновляем таймеры активных бонусов
            const timerElements = this.container.querySelectorAll('.bonus-timer');
            timerElements.forEach(timer => {
                const expiresAt = timer.dataset.expires;
                if (expiresAt) {
                    timer.textContent = `Осталось: ${this.formatTimeRemaining(expiresAt)}`;
                }
            });
            
            // Обновляем таймер следующего бонуса
            this.updateNextBonusTimer();
            
        }, 1000);
    }
    
    getFallbackTemplate() {
        return `
            <div class="bonuses-module">
                <div class="module-header">
                    <h2>🎁 Бонусы и достижения</h2>
                    <div class="bonus-stats">
                        <div class="stat-item">
                            <span class="stat-label">Всего бонусов:</span>
                            <span class="stat-value" id="total-bonus-count">0</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Множитель:</span>
                            <span class="stat-value" id="current-multiplier">x1</span>
                        </div>
                    </div>
                </div>
                
                <div class="bonuses-grid">
                    <!-- Ежедневный бонус -->
                    <div class="bonus-section daily-bonus">
                        <h3>Ежедневный бонус</h3>
                        <div class="daily-bonus-content">
                            <div class="bonus-icon">📅</div>
                            <div class="bonus-info">
                                <p>Следующий бонус через:</p>
                                <div class="timer" id="next-bonus-timer">--:--:--</div>
                            </div>
                            <button class="btn btn-primary" id="daily-bonus-btn">
                                Получить бонус
                            </button>
                        </div>
                    </div>
                    
                    <!-- Активные бонусы -->
                    <div class="bonus-section active-bonuses">
                        <h3>Активные бонусы</h3>
                        <div id="active-bonuses-list" class="bonuses-list">
                            <div class="no-bonuses">Нет активных бонусов</div>
                        </div>
                    </div>
                    
                    <!-- Множители -->
                    <div class="bonus-section multipliers">
                        <h3>Множители дохода</h3>
                        <div class="multipliers-grid">
                            <button class="multiplier-btn" data-multiplier="2">
                                <span class="multiplier-value">x2</span>
                                <span class="multiplier-cost">100 PLEX</span>
                            </button>
                            <button class="multiplier-btn" data-multiplier="3">
                                <span class="multiplier-value">x3</span>
                                <span class="multiplier-cost">250 PLEX</span>
                            </button>
                            <button class="multiplier-btn" data-multiplier="5">
                                <span class="multiplier-value">x5</span>
                                <span class="multiplier-cost">500 PLEX</span>
                            </button>
                        </div>
                    </div>
                    
                    <!-- Достижения -->
                    <div class="bonus-section achievements">
                        <h3>Достижения</h3>
                        <div id="achievements-container" class="achievements-list">
                            <!-- Достижения будут загружены динамически -->
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    destroy() {
        console.log('🧹 Destroying Bonuses Module...');
        
        // Останавливаем автообновление
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
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
        
        // Сохранение состояния
        if (this.state) {
            this.state.save();
        }
        
        console.log('✅ Bonuses Module destroyed');
    }
}
