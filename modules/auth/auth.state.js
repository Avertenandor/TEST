// modules/auth/auth.state.js
// Управление состоянием авторизации

export default class AuthState {
    constructor() {
        this.isAuthenticated = false;
        this.userAddress = null;
        this.authTime = null;
        this.authTransactionHash = null;
        this.sessionId = null;
        
        // Ключи для localStorage
        this.STORAGE_KEYS = {
            AUTH_STATE: 'genesis_auth_state',
            USER_ADDRESS: 'genesis_user_address',
            SESSION_ID: 'genesis_session_id'
        };
    }
    
    /**
     * Установка состояния авторизации
     * @param {string} address - BSC адрес пользователя
     * @param {string} transactionHash - Хеш транзакции авторизации (опционально)
     */
    setAuthenticated(address, transactionHash = null) {
        this.isAuthenticated = true;
        this.userAddress = address;
        this.authTime = Date.now();
        this.authTransactionHash = transactionHash;
        this.sessionId = this.generateSessionId();
        
        // Сохраняем в localStorage
        this.save();
        
        console.log('✅ Authentication state saved for:', this.formatAddress(address));
    }
    
    /**
     * Сохранение состояния в localStorage
     */
    save() {
        const stateData = {
            isAuthenticated: this.isAuthenticated,
            userAddress: this.userAddress,
            authTime: this.authTime,
            authTransactionHash: this.authTransactionHash,
            sessionId: this.sessionId
        };
        
        try {
            // Сохраняем полное состояние
            localStorage.setItem(this.STORAGE_KEYS.AUTH_STATE, JSON.stringify(stateData));
            
            // Дублируем адрес отдельно для совместимости
            if (this.userAddress) {
                localStorage.setItem(this.STORAGE_KEYS.USER_ADDRESS, this.userAddress);
            }
            
            // Сохраняем ID сессии
            if (this.sessionId) {
                localStorage.setItem(this.STORAGE_KEYS.SESSION_ID, this.sessionId);
            }
            
        } catch (error) {
            console.error('Failed to save auth state:', error);
        }
    }
    
    /**
     * Загрузка состояния из localStorage
     */
    load() {
        try {
            // Загружаем полное состояние
            const savedState = localStorage.getItem(this.STORAGE_KEYS.AUTH_STATE);
            
            if (savedState) {
                const data = JSON.parse(savedState);
                
                // Проверяем валидность сохраненных данных
                if (this.isValidSavedState(data)) {
                    Object.assign(this, data);
                    console.log('📂 Loaded auth state for:', this.formatAddress(data.userAddress));
                    return true;
                }
            }
            
            // Fallback: пытаемся загрузить только адрес (для обратной совместимости)
            const savedAddress = localStorage.getItem(this.STORAGE_KEYS.USER_ADDRESS);
            if (savedAddress && this.isValidAddress(savedAddress)) {
                this.userAddress = savedAddress;
                this.isAuthenticated = true;
                this.authTime = Date.now();
                this.sessionId = this.generateSessionId();
                console.log('📂 Loaded legacy auth for:', this.formatAddress(savedAddress));
                return true;
            }
            
        } catch (error) {
            console.error('Failed to load auth state:', error);
        }
        
        return false;
    }
    
    /**
     * Очистка состояния и localStorage
     */
    clear() {
        this.isAuthenticated = false;
        this.userAddress = null;
        this.authTime = null;
        this.authTransactionHash = null;
        this.sessionId = null;
        
        // Очищаем localStorage
        Object.values(this.STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        
        console.log('🧹 Auth state cleared');
    }
    
    /**
     * Проверка, не истекла ли сессия
     * @param {number} maxAge - Максимальный возраст сессии в миллисекундах (по умолчанию 7 дней)
     * @returns {boolean}
     */
    isSessionValid(maxAge = 7 * 24 * 60 * 60 * 1000) {
        if (!this.isAuthenticated || !this.authTime) {
            return false;
        }
        
        const age = Date.now() - this.authTime;
        return age < maxAge;
    }
    
    /**
     * Обновление времени последней активности
     */
    updateActivity() {
        if (this.isAuthenticated) {
            this.authTime = Date.now();
            this.save();
        }
    }
    
    /**
     * Получение информации о сессии
     * @returns {Object}
     */
    getSessionInfo() {
        if (!this.isAuthenticated) {
            return null;
        }
        
        return {
            address: this.userAddress,
            sessionId: this.sessionId,
            authTime: new Date(this.authTime),
            sessionAge: Date.now() - this.authTime,
            transactionHash: this.authTransactionHash
        };
    }
    
    /**
     * Генерация уникального ID сессии
     * @returns {string}
     */
    generateSessionId() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 9);
        return `genesis-${timestamp}-${random}`;
    }
    
    /**
     * Валидация сохраненного состояния
     * @param {Object} data - Данные для проверки
     * @returns {boolean}
     */
    isValidSavedState(data) {
        return (
            data &&
            typeof data.isAuthenticated === 'boolean' &&
            typeof data.userAddress === 'string' &&
            this.isValidAddress(data.userAddress) &&
            typeof data.authTime === 'number'
        );
    }
    
    /**
     * Валидация BSC адреса
     * @param {string} address - Адрес для проверки
     * @returns {boolean}
     */
    isValidAddress(address) {
        return /^0x[a-fA-F0-9]{40}$/.test(address);
    }
    
    /**
     * Форматирование адреса для отображения
     * @param {string} address - Полный адрес
     * @returns {string}
     */
    formatAddress(address) {
        if (!address || address.length < 10) return address;
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }
    
    /**
     * Экспорт состояния для отладки
     * @returns {Object}
     */
    export() {
        return {
            isAuthenticated: this.isAuthenticated,
            userAddress: this.userAddress,
            authTime: this.authTime,
            authTransactionHash: this.authTransactionHash,
            sessionId: this.sessionId,
            isSessionValid: this.isSessionValid(),
            formattedAddress: this.formatAddress(this.userAddress)
        };
    }
}
