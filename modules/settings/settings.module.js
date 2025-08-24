// modules/settings/settings.module.js
// Модуль настроек платформы GENESIS DeFi

import SettingsState from './settings.state.js';

export default class SettingsModule {
    constructor() {
        this.name = 'settings';
        this.version = '1.0.0';
        this.dependencies = ['auth'];
        
        this.state = null;
        this.container = null;
        this.context = null;
        this.subscriptions = [];
    }
    
    async init(context) {
        console.log('⚙️ Initializing Settings Module...');
        
        this.context = context;
        this.container = context.container;
        
        try {
            // 1. Инициализация состояния
            this.state = new SettingsState();
            this.state.load();
            
            // 2. Загрузка шаблона
            await this.loadTemplate();
            
            // 3. Загрузка стилей
            await this.loadStyles();
            
            // 4. Инициализация обработчиков событий
            this.initEventHandlers();
            
            // 5. Подписка на события
            this.subscribeToEvents();
            
            // 6. Применение сохраненных настроек
            this.applySettings();
            
            console.log('✅ Settings Module initialized successfully');
            
            return this;
            
        } catch (error) {
            console.error('❌ Failed to initialize Settings Module:', error);
            throw error;
        }
    }
    
    async loadTemplate() {
        try {
            const response = await fetch('/modules/settings/settings.template.html');
            const html = await response.text();
            this.container.innerHTML = html;
        } catch (error) {
            console.error('Failed to load settings template:', error);
            this.container.innerHTML = this.getFallbackTemplate();
        }
    }
    
    async loadStyles() {
        const existingLink = document.querySelector(`link[data-module="${this.name}"]`);
        if (existingLink) return;
        
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/modules/settings/settings.styles.css';
        link.dataset.module = this.name;
        document.head.appendChild(link);
    }
    
    initEventHandlers() {
        // Тема оформления
        const themeButtons = this.container.querySelectorAll('[data-theme]');
        themeButtons.forEach(btn => {
            btn.addEventListener('click', () => this.changeTheme(btn.dataset.theme));
        });
        
        // Язык интерфейса
        const languageSelect = this.container.querySelector('#language-select');
        if (languageSelect) {
            languageSelect.addEventListener('change', (e) => this.changeLanguage(e.target.value));
        }
        
        // Уведомления
        const notificationToggles = this.container.querySelectorAll('.notification-toggle');
        notificationToggles.forEach(toggle => {
            toggle.addEventListener('change', () => this.updateNotificationSettings());
        });
        
        // Звуки
        const soundToggle = this.container.querySelector('#sound-toggle');
        if (soundToggle) {
            soundToggle.addEventListener('change', (e) => this.toggleSound(e.target.checked));
        }
        
        // Безопасность
        const security2FA = this.container.querySelector('#enable-2fa');
        if (security2FA) {
            security2FA.addEventListener('click', () => this.enable2FA());
        }
        
        // Экспорт данных
        const exportBtn = this.container.querySelector('#export-data');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportData());
        }
        
        // Импорт данных
        const importBtn = this.container.querySelector('#import-data');
        const importFile = this.container.querySelector('#import-file');
        if (importBtn && importFile) {
            importBtn.addEventListener('click', () => importFile.click());
            importFile.addEventListener('change', (e) => this.importData(e.target.files[0]));
        }
        
        // Очистка кеша
        const clearCacheBtn = this.container.querySelector('#clear-cache');
        if (clearCacheBtn) {
            clearCacheBtn.addEventListener('click', () => this.clearCache());
        }
        
        // Сброс настроек
        const resetBtn = this.container.querySelector('#reset-settings');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetSettings());
        }
        
        // Сохранение изменений
        const saveBtn = this.container.querySelector('#save-settings');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveSettings());
        }
    }
    
    changeTheme(theme) {
        console.log(`Changing theme to: ${theme}`);
        
        // Удаляем все классы тем
        document.body.classList.remove('theme-dark', 'theme-light', 'theme-matrix', 'theme-cyber');
        
        // Добавляем новый класс темы
        document.body.classList.add(`theme-${theme}`);
        
        // Сохраняем в состоянии
        this.state.setSetting('theme', theme);
        
        // Обновляем UI
        this.updateThemeButtons(theme);
        
        // Событие для других модулей
        if (this.context.eventBus) {
            this.context.eventBus.emit('theme:changed', { theme });
        }
        
        this.showNotification('Тема изменена', 'success');
    }
    
    updateThemeButtons(activeTheme) {
        const themeButtons = this.container.querySelectorAll('[data-theme]');
        themeButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === activeTheme);
        });
    }
    
    changeLanguage(language) {
        console.log(`Changing language to: ${language}`);
        
        this.state.setSetting('language', language);
        
        // Здесь должна быть логика смены языка
        // Для демо просто показываем уведомление
        this.showNotification(`Язык изменен на: ${language}`, 'info');
        
        if (this.context.eventBus) {
            this.context.eventBus.emit('language:changed', { language });
        }
    }
    
    updateNotificationSettings() {
        const settings = {
            deposits: this.container.querySelector('#notify-deposits')?.checked,
            earnings: this.container.querySelector('#notify-earnings')?.checked,
            system: this.container.querySelector('#notify-system')?.checked,
            promotions: this.container.querySelector('#notify-promotions')?.checked
        };
        
        this.state.setSetting('notifications', settings);
        console.log('Notification settings updated:', settings);
    }
    
    toggleSound(enabled) {
        console.log(`Sound ${enabled ? 'enabled' : 'disabled'}`);
        this.state.setSetting('sound', enabled);
        
        if (this.context.eventBus) {
            this.context.eventBus.emit('sound:toggle', { enabled });
        }
    }
    
    async enable2FA() {
        console.log('Enabling 2FA...');
        
        // Здесь должна быть логика включения 2FA
        // Для демо показываем модальное окно
        this.showModal({
            title: 'Двухфакторная аутентификация',
            content: `
                <div class="2fa-setup">
                    <p>Для включения 2FA отсканируйте QR код в приложении Google Authenticator:</p>
                    <div class="qr-placeholder">
                        [QR код будет здесь]
                    </div>
                    <p>Или введите ключ вручную:</p>
                    <code>XXXX-XXXX-XXXX-XXXX</code>
                </div>
            `,
            actions: [
                { text: 'Отмена', action: 'close' },
                { text: 'Подтвердить', action: 'confirm2FA', primary: true }
            ]
        });
    }
    
    async exportData() {
        console.log('Exporting data...');
        
        try {
            // Собираем все данные для экспорта
            const exportData = {
                version: '1.0.0',
                timestamp: Date.now(),
                settings: this.state.getAll(),
                user: {
                    address: this.context.store?.get('user.address'),
                    platformAccess: this.context.store?.get('user.platformAccess'),
                    accessDays: this.context.store?.get('user.accessDays')
                },
                deposits: this.context.store?.get('deposits'),
                portfolio: this.context.store?.get('portfolio')
            };
            
            // Создаем blob и скачиваем файл
            const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                type: 'application/json'
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `genesis-backup-${Date.now()}.json`;
            a.click();
            
            URL.revokeObjectURL(url);
            
            this.showNotification('Данные успешно экспортированы', 'success');
            
        } catch (error) {
            console.error('Export failed:', error);
            this.showNotification('Ошибка экспорта данных', 'error');
        }
    }
    
    async importData(file) {
        if (!file) return;
        
        console.log('Importing data from file:', file.name);
        
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            
            // Проверка версии
            if (data.version !== '1.0.0') {
                throw new Error('Несовместимая версия файла');
            }
            
            // Импорт настроек
            if (data.settings) {
                Object.entries(data.settings).forEach(([key, value]) => {
                    this.state.setSetting(key, value);
                });
            }
            
            // Применение настроек
            this.applySettings();
            
            this.showNotification('Данные успешно импортированы', 'success');
            
            // Перезагрузка для применения всех изменений
            setTimeout(() => window.location.reload(), 1000);
            
        } catch (error) {
            console.error('Import failed:', error);
            this.showNotification('Ошибка импорта данных', 'error');
        }
    }
    
    async clearCache() {
        console.log('Clearing cache...');
        
        try {
            // Очистка localStorage
            const keysToKeep = ['genesis_user_address', 'genesis_settings'];
            const allKeys = Object.keys(localStorage);
            
            allKeys.forEach(key => {
                if (!keysToKeep.includes(key)) {
                    localStorage.removeItem(key);
                }
            });
            
            // Очистка Service Worker кеша
            if ('caches' in window) {
                const cacheNames = await caches.keys();
                await Promise.all(
                    cacheNames.map(cacheName => caches.delete(cacheName))
                );
            }
            
            this.showNotification('Кеш успешно очищен', 'success');
            
        } catch (error) {
            console.error('Clear cache failed:', error);
            this.showNotification('Ошибка очистки кеша', 'error');
        }
    }
    
    resetSettings() {
        console.log('Resetting settings...');
        
        this.showModal({
            title: 'Сброс настроек',
            content: 'Вы уверены, что хотите сбросить все настройки на значения по умолчанию?',
            actions: [
                { text: 'Отмена', action: 'close' },
                { 
                    text: 'Сбросить', 
                    action: () => {
                        this.state.reset();
                        this.applySettings();
                        this.showNotification('Настройки сброшены', 'info');
                        window.location.reload();
                    },
                    danger: true 
                }
            ]
        });
    }
    
    saveSettings() {
        console.log('Saving settings...');
        
        // Собираем все текущие настройки из формы
        const formData = new FormData(this.container.querySelector('#settings-form'));
        
        // Сохраняем в состоянии
        for (let [key, value] of formData.entries()) {
            this.state.setSetting(key, value);
        }
        
        // Применяем настройки
        this.applySettings();
        
        this.showNotification('Настройки сохранены', 'success');
    }
    
    applySettings() {
        const settings = this.state.getAll();
        
        // Применяем тему
        if (settings.theme) {
            this.changeTheme(settings.theme);
        }
        
        // Применяем язык
        if (settings.language) {
            const languageSelect = this.container?.querySelector('#language-select');
            if (languageSelect) {
                languageSelect.value = settings.language;
            }
        }
        
        // Применяем настройки уведомлений
        if (settings.notifications) {
            Object.entries(settings.notifications).forEach(([type, enabled]) => {
                const checkbox = this.container?.querySelector(`#notify-${type}`);
                if (checkbox) {
                    checkbox.checked = enabled;
                }
            });
        }
        
        // Применяем настройки звука
        if (typeof settings.sound === 'boolean') {
            const soundToggle = this.container?.querySelector('#sound-toggle');
            if (soundToggle) {
                soundToggle.checked = settings.sound;
            }
        }
        
        // Обновляем глобальное состояние
        if (this.context.store) {
            this.context.store.set('settings', settings);
        }
    }
    
    subscribeToEvents() {
        if (this.context.eventBus) {
            // Подписка на изменения настроек от других модулей
            this.subscriptions.push(
                this.context.eventBus.on('settings:update', (data) => {
                    Object.entries(data).forEach(([key, value]) => {
                        this.state.setSetting(key, value);
                    });
                    this.applySettings();
                })
            );
        }
    }
    
    showNotification(message, type = 'info') {
        if (this.context.eventBus) {
            this.context.eventBus.emit('notification:show', { message, type });
        }
    }
    
    showModal(options) {
        if (this.context.eventBus) {
            this.context.eventBus.emit('modal:show', options);
        }
    }
    
    getFallbackTemplate() {
        return `
            <div class="settings-container">
                <div class="settings-header">
                    <h2>⚙️ Настройки</h2>
                    <p>Персонализируйте работу платформы под себя</p>
                </div>
                
                <form id="settings-form" class="settings-form">
                    <!-- Внешний вид -->
                    <div class="settings-section">
                        <h3>🎨 Внешний вид</h3>
                        
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
