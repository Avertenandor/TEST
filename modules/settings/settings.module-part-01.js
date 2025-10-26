                        <div class="setting-group">
                            <label>Тема оформления</label>
                            <div class="theme-selector">
                                <button type="button" class="theme-btn" data-theme="dark">
                                    🌙 Темная
                                </button>
                                <button type="button" class="theme-btn" data-theme="light">
                                    ☀️ Светлая
                                </button>
                                <button type="button" class="theme-btn" data-theme="matrix">
                                    💚 Матрица
                                </button>
                                <button type="button" class="theme-btn" data-theme="cyber">
                                    🔮 Кибер
                                </button>
                            </div>
                        </div>
                        
                        <div class="setting-group">
                            <label for="language-select">Язык интерфейса</label>
                            <select id="language-select" name="language" class="form-control">
                                <option value="ru">🇷🇺 Русский</option>
                                <option value="en">🇬🇧 English</option>
                                <option value="zh">🇨🇳 中文</option>
                            </select>
                        </div>
                    </div>
                    
                    <!-- Уведомления -->
                    <div class="settings-section">
                        <h3>🔔 Уведомления</h3>
                        
                        <div class="setting-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="notify-deposits" class="notification-toggle" checked>
                                <span>Депозиты и выплаты</span>
                            </label>
                        </div>
                        
                        <div class="setting-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="notify-earnings" class="notification-toggle" checked>
                                <span>Начисления дохода</span>
                            </label>
                        </div>
                        
                        <div class="setting-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="notify-system" class="notification-toggle" checked>
                                <span>Системные сообщения</span>
                            </label>
                        </div>
                        
                        <div class="setting-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="notify-promotions" class="notification-toggle">
                                <span>Акции и предложения</span>
                            </label>
                        </div>
                        
                        <div class="setting-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="sound-toggle" checked>
                                <span>🔊 Звуковые уведомления</span>
                            </label>
                        </div>
                    </div>
                    
                    <!-- Безопасность -->
                    <div class="settings-section">
                        <h3>🔐 Безопасность</h3>
                        
                        <div class="setting-group">
                            <button type="button" id="enable-2fa" class="btn btn-secondary">
                                🔑 Включить двухфакторную аутентификацию
                            </button>
                        </div>
                    </div>
                    
                    <!-- Данные -->
                    <div class="settings-section">
                        <h3>💾 Данные</h3>
                        
                        <div class="setting-group">
                            <button type="button" id="export-data" class="btn btn-secondary">
                                📥 Экспортировать данные
                            </button>
                        </div>
                        
                        <div class="setting-group">
                            <input type="file" id="import-file" accept=".json" style="display: none;">
                            <button type="button" id="import-data" class="btn btn-secondary">
                                📤 Импортировать данные
                            </button>
                        </div>
                        
                        <div class="setting-group">
                            <button type="button" id="clear-cache" class="btn btn-warning">
                                🗑️ Очистить кеш
                            </button>
                        </div>
                        
                        <div class="setting-group">
                            <button type="button" id="reset-settings" class="btn btn-danger">
                                ⚠️ Сбросить настройки
                            </button>
                        </div>
                    </div>
                    
                    <!-- Кнопка сохранения -->
                    <div class="settings-actions">
                        <button type="button" id="save-settings" class="btn btn-primary btn-large">
                            💾 Сохранить изменения
                        </button>
                    </div>
                </form>
                
                <div class="message-container">
                    <div class="success-message" style="display: none;"></div>
                    <div class="error-message" style="display: none;"></div>
                </div>
            </div>
        `;
    }
    
    destroy() {
        console.log('🧹 Destroying Settings Module...');
        
        // Отписка от событий
        this.subscriptions.forEach(unsub => {
            if (typeof unsub === 'function') unsub();
        });
        
        // Сохранение состояния перед уничтожением
        this.state?.save();
        
        // Удаление стилей
        const link = document.querySelector(`link[data-module="${this.name}"]`);
        if (link) link.remove();
        
        // Очистка контейнера
        if (this.container) {
            this.container.innerHTML = '';
        }
        
        console.log('✅ Settings Module destroyed');
    }
}
