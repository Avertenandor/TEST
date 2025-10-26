                            <span class="stats-title">Доход за сегодня</span>
                            <span class="stats-icon">📅</span>
                        </div>
                        <div class="stats-value">$0.00</div>
                    </div>
                </div>
                
                <div class="quick-actions">
                    <button class="btn btn-primary" data-action="create-deposit">
                        💰 Создать депозит
                    </button>
                    <button class="btn btn-secondary" data-action="platform-access">
                        🔑 Пополнить доступ
                    </button>
                </div>
                
                <div id="active-deposits-list" class="active-deposits-section">
                    <!-- Депозиты будут загружены здесь -->
                </div>
                
                <div id="last-activity" class="activity-section">
                    <!-- Последняя активность -->
                </div>
            </div>
        `;
    }
    
    destroy() {
        console.log('🧹 Destroying Dashboard Module...');
        
        // Устанавливаем флаг уничтожения
        this.isDestroyed = true;
        
        // Остановка всех интервалов и таймаутов
        if (this.autoUpdateTimeout) {
            clearTimeout(this.autoUpdateTimeout);
            this.autoUpdateTimeout = null;
        }
        
        if (this.uptimeInterval) {
            clearInterval(this.uptimeInterval);
            this.uptimeInterval = null;
        }
        
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
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
        
        console.log('✅ Dashboard Module destroyed');
    }
}
