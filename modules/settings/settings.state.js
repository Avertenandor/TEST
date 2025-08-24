// modules/settings/settings.state.js
// Управление состоянием настроек

export default class SettingsState {
    constructor() {
        this.settings = {
            // Внешний вид
            theme: 'dark',
            language: 'ru',
            fontSize: 'medium',
            animations: true,
            
            // Уведомления
            notifications: {
                deposits: true,
                earnings: true,
                system: true,
                promotions: false
            },
            sound: true,
            vibration: true,
            
            // Безопасность
            twoFactorAuth: false,
            autoLock: false,
            autoLockTime: 5, // минут
            
            // Отображение данных
            currency: 'USD',
            dateFormat: 'DD.MM.YYYY',
            timeFormat: '24h',
            numberFormat: 'space', // space | comma | dot
            
            // Производительность
            lowPowerMode: false,
            dataFetchInterval: 30, // секунд
            
            // Приватность
            analytics: true,
            crashReports: true
        };
        
        this.storageKey = 'genesis_settings';
    }
    
    /**
     * Загрузка настроек из localStorage
     */
    load() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                const parsed = JSON.parse(saved);
                // Мержим с дефолтными настройками чтобы добавить новые поля
                this.settings = { ...this.settings, ...parsed };
                console.log('✅ Settings loaded from localStorage');
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    }
    
    /**
     * Сохранение настроек в localStorage
     */
    save() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.settings));
            console.log('✅ Settings saved to localStorage');
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    }
    
    /**
     * Получить значение настройки
     * @param {string} key - Ключ настройки (поддерживает вложенность через точку)
     * @returns {*} Значение настройки
     */
    getSetting(key) {
        const keys = key.split('.');
        let value = this.settings;
        
        for (const k of keys) {
            value = value?.[k];
            if (value === undefined) break;
        }
        
        return value;
    }
    
    /**
     * Установить значение настройки
     * @param {string} key - Ключ настройки (поддерживает вложенность через точку)
     * @param {*} value - Новое значение
     */
    setSetting(key, value) {
        const keys = key.split('.');
        const lastKey = keys.pop();
        
        let target = this.settings;
        for (const k of keys) {
            if (!target[k]) {
                target[k] = {};
            }
            target = target[k];
        }
        
        target[lastKey] = value;
        this.save();
    }
    
    /**
     * Получить все настройки
     * @returns {Object} Все настройки
     */
    getAll() {
        return { ...this.settings };
    }
    
    /**
     * Установить все настройки
     * @param {Object} settings - Новые настройки
     */
    setAll(settings) {
        this.settings = { ...this.settings, ...settings };
        this.save();
    }
    
    /**
     * Сбросить настройки на значения по умолчанию
     */
    reset() {
        this.settings = {
            theme: 'dark',
            language: 'ru',
            fontSize: 'medium',
            animations: true,
            notifications: {
                deposits: true,
                earnings: true,
                system: true,
                promotions: false
            },
            sound: true,
            vibration: true,
            twoFactorAuth: false,
            autoLock: false,
            autoLockTime: 5,
            currency: 'USD',
            dateFormat: 'DD.MM.YYYY',
            timeFormat: '24h',
            numberFormat: 'space',
            lowPowerMode: false,
            dataFetchInterval: 30,
            analytics: true,
            crashReports: true
        };
        
        this.save();
    }
    
    /**
     * Экспорт настроек в JSON
     * @returns {string} JSON строка с настройками
     */
    export() {
        return JSON.stringify(this.settings, null, 2);
    }
    
    /**
     * Импорт настроек из JSON
     * @param {string} json - JSON строка с настройками
     * @returns {boolean} Успешность импорта
     */
    import(json) {
        try {
            const imported = JSON.parse(json);
            this.settings = { ...this.settings, ...imported };
            this.save();
            return true;
        } catch (error) {
            console.error('Failed to import settings:', error);
            return false;
        }
    }
    
    /**
     * Проверка включена ли настройка
     * @param {string} key - Ключ настройки
     * @returns {boolean}
     */
    isEnabled(key) {
        const value = this.getSetting(key);
        return value === true || value === 'enabled' || value === 'on';
    }
    
    /**
     * Переключение булевой настройки
     * @param {string} key - Ключ настройки
     */
    toggle(key) {
        const current = this.getSetting(key);
        if (typeof current === 'boolean') {
            this.setSetting(key, !current);
        }
    }
}
