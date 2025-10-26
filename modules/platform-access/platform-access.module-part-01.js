            // Подписка на события оплаты
            this.subscriptions.push(
                this.context.eventBus.on('payment:received', async (data) => {
                    if (data.type === 'platform-access') {
                        await this.checkCurrentAccess();
                    }
                })
            );
            
            // Подписка на запросы проверки доступа
            this.subscriptions.push(
                this.context.eventBus.on('access:check:required', async () => {
                    await this.checkCurrentAccess();
                })
            );
        }
    }
    
    showError(message) {
        const errorEl = this.container?.querySelector('.error-message');
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.style.display = 'block';
            setTimeout(() => {
                errorEl.style.display = 'none';
            }, 5000);
        }
    }
    
    showSuccess(message) {
        const successEl = this.container?.querySelector('.success-message');
        if (successEl) {
            successEl.textContent = message;
            successEl.style.display = 'block';
            setTimeout(() => {
                successEl.style.display = 'none';
            }, 5000);
        } else {
            // Fallback на глобальные уведомления
            if (window.eventBus) {
                window.eventBus.emit('notification:show', {
                    type: 'success',
                    title: 'Успешно',
                    message: message
                });
            }
        }
    }
    
    getFallbackTemplate() {
        return `
            <div class="platform-access-container">
                <div class="access-header">
                    <h2>💎 Доступ к платформе</h2>
                    <div class="access-status"></div>
                </div>
                
                <div class="access-info">
                    <div class="access-days"></div>
                </div>
                
                <div class="access-warning" style="display: none;"></div>
                <div class="renewal-reminder" style="display: none;"></div>
                
                <div class="payment-section" style="display: none;">
                    <h3>Оплата доступа</h3>
                    <div class="payment-form">
                        <div class="form-group">
                            <label>Количество дней:</label>
                            <select id="access-days-selector" class="form-control">
                                <option value="1">1 день - $1</option>
                                <option value="7">7 дней - $7</option>
                                <option value="30">30 дней - $30</option>
                            </select>
                        </div>
                        
                        <div class="payment-total">
                            <span>Итого к оплате:</span>
                            <span class="payment-amount">1 USDT</span>
                        </div>
                        
                        <button id="pay-access-button" class="btn btn-primary btn-full">
                            Оплатить доступ
                        </button>
                    </div>
                </div>
                
                <div class="active-access-section" style="display: none;">
                    <div class="access-features">
                        <h3>✅ Ваш доступ активен</h3>
                        <p>Вы можете использовать все функции платформы:</p>
                        <ul>
                            <li>Создание депозитов</li>
                            <li>Просмотр аналитики</li>
                            <li>Управление портфелем</li>
                            <li>Доступ к бонусной системе</li>
                            <li>Реферальная программа</li>
                        </ul>
                    </div>
                </div>
                
                <div class="payment-instructions" style="display: none;"></div>
                
                <div class="message-container">
                    <div class="error-message" style="display: none;"></div>
                    <div class="success-message" style="display: none;"></div>
                </div>
            </div>
        `;
    }
    
    destroy() {
        console.log('🧹 Destroying Platform Access Module...');
        
        // Останавливаем мониторинг
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
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
        
        console.log('✅ Platform Access Module destroyed');
    }
}
