     * Рассчитать ROI
     */
    calculateROI(initialAmount, currentAmount, decimals = 2) {
        if (!initialAmount || initialAmount === 0) return 0;
        const roi = ((currentAmount - initialAmount) / initialAmount) * 100;
        return parseFloat(roi.toFixed(decimals));
    },
    
    // MCP-MARKER:METHOD:DEBUG_UTILITIES - Утилиты отладки
    /**
     * Логирование с префиксом
     */
    log(message, type = 'info', data = null) {
        const timestamp = new Date().toISOString();
        const prefix = `[GENESIS-${type.toUpperCase()}] ${timestamp}:`;
        
        switch (type) {
            case 'error':
                console.error(prefix, message, data);
                break;
            case 'warn':
                console.warn(prefix, message, data);
                break;
            case 'debug':
                if (window.GENESIS_CONFIG?.app?.debug) {
                    console.log(prefix, message, data);
                }
                break;
            default:
                console.log(prefix, message, data);
        }
        
        // Отправляем в терминал если доступен
        if (window.GenesisTerminal && window.GenesisTerminal.log) {
            window.GenesisTerminal.log(message, type);
        }
    },
    
    /**
     * Проверка окружения
     */
    isDevelopment() {
        return window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1' ||
               window.location.hostname.includes('dev') ||
               window.location.hostname.includes('test');
    },
    
    // MCP-MARKER:METHOD:INITIALIZATION - Инициализация
    init() {
        this.log('GenesisUtils initialized', 'info');
        
        // Добавляем глобальные функции для обратной совместимости
        if (!window.weiToUSDT) window.weiToUSDT = this.weiToUSDT;
        if (!window.usdtToWei) window.usdtToWei = this.usdtToWei;
        if (!window.weiToPlex) window.weiToPlex = this.weiToPlex;
        if (!window.plexToWei) window.plexToWei = this.plexToWei;
        if (!window.weiToBNB) window.weiToBNB = this.weiToBNB;
        if (!window.bnbToWei) window.bnbToWei = this.bnbToWei;
        
        return this;
    }
};

// Автоматическая инициализация
document.addEventListener('DOMContentLoaded', () => {
    window.GenesisUtils.init();
});

// Экспорт для совместимости
window.Utils = window.GenesisUtils;

console.log('🛠️ GENESIS UTILS loaded');
