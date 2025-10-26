    }
    
    return { allowed: true, message: 'Депозит разрешен' };
};

// MCP-MARKER:FUNCTION:GET_PLAN_DURATION - Получение длительности плана
window.getPlanDuration = function(planName) {
    const plan = window.getDepositPlanById(planName);
    return plan ? plan.days : 0;
};

// MCP-MARKER:FUNCTION:GET_PLAN_PERCENT - Получение процентной ставки плана
window.getPlanPercent = function(planName) {
    const plan = window.getDepositPlanById(planName);
    return plan ? plan.percentage : 100;
};

// MCP-MARKER:FUNCTION:CALCULATE_PLAN_PROFIT - Расчет прибыли по плану
window.calculatePlanProfit = function(planName, investedAmount) {
    const percent = window.getPlanPercent(planName);
    return (investedAmount * percent / 100) - investedAmount;
};

// MCP-MARKER:FUNCTION:IS_PAYMENT_VALID - Проверка валидности платежа с погрешностью
window.isPaymentValid = function(amount, targetAmount, tolerance = 0.05) {
    if (!amount || !targetAmount || isNaN(amount) || isNaN(targetAmount)) return false;
    const minAmount = targetAmount * (1 - tolerance);
    const maxAmount = targetAmount * (1 + tolerance);
    return amount >= minAmount && amount <= maxAmount;
};

// MCP-MARKER:FUNCTION:FORMAT_ADDRESS - Форматирование адреса
window.formatAddress = function(address, length = 6) {
    if (!address || typeof address !== 'string') return '';
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) return address;
    return `${address.substring(0, length)}...${address.substring(address.length - 4)}`;
};

// MCP-MARKER:FUNCTION:FORMAT_CURRENCY - Форматирование валюты
window.formatCurrency = function(amount, currency = 'USD', decimals = 2) {
    if (!amount || isNaN(amount)) return '0.00';
    
    const options = {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    };
    
    if (['USDT', 'PLEX', 'BNB'].includes(currency)) {
        return `${parseFloat(amount).toLocaleString('en-US', options)} ${currency}`;
    }
    
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency === 'USDT' ? 'USD' : currency,
        ...options
    }).format(amount);
};

// MCP-MARKER:FUNCTION:LEGACY_API_KEYS - Устаревшие функции (обратная совместимость)
window.getCurrentApiKey = function() {
    console.warn('⚠️ getCurrentApiKey() устарела. Используйте getApiKeyForOperation()');
    return window.getApiKeyForOperation('AUTHORIZATION');
};

window.rotateApiKey = function() {
    console.warn('⚠️ rotateApiKey() устарела. Используются специализированные ключи');
    return window.getApiKeyForOperation('AUTHORIZATION');
};

// MCP-MARKER:FUNCTION:SAFE_GET_CONFIG - Безопасное получение конфигурации
window.safeGetConfig = function(path, defaultValue = null) {
    try {
        const keys = path.split('.');
        let value = window.GENESIS_CONFIG;
        
        for (const key of keys) {
            if (value && typeof value === 'object' && key in value) {
                value = value[key];
            } else {
                return defaultValue;
            }
        }
        
        return value;
    } catch (error) {
        console.error('Ошибка получения конфигурации:', error);
        return defaultValue;
    }
};

// MCP-MARKER:FUNCTION:IS_DEVELOPMENT - Проверка режима разработки
window.isDevelopment = function() {
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1' ||
           window.location.hostname.includes('dev') ||
           window.location.hostname.includes('test') ||
           window.location.protocol === 'file:';
};

// MCP-MARKER:FUNCTION:GET_ENVIRONMENT - Получение окружения
window.getEnvironment = function() {
    if (window.isDevelopment()) return 'development';
    if (window.location.hostname.includes('staging')) return 'staging';
    return 'production';
};

// MCP-MARKER:SECTION:DEVELOPMENT_MODE - Настройка режима разработки
if (window.isDevelopment && window.isDevelopment()) {
    window.GENESIS_CONFIG.app.debug = true;
    console.log('🔧 Development mode enabled');
}

// MCP-MARKER:INITIALIZATION:CONFIG_READY - Уведомление о готовности конфигурации
window.GENESIS_CONFIG_READY = true;
document.dispatchEvent(new CustomEvent('genesis-config-ready', {
    detail: { version: window.GENESIS_CONFIG.version }
}));

// Глобальная проверка конфигурации
window.checkConfig = function() {
    const required = ['depositPlans', 'addresses', 'plex', 'usdt', 'bscscan'];
    const missing = required.filter(key => !window.GENESIS_CONFIG[key]);
    
    if (missing.length > 0) {
        console.error('❌ Отсутствуют критические части конфигурации:', missing);
        return false;
    }
    
    console.log('✅ Конфигурация проверена успешно');
    return true;
};

// Автоматическая проверка при загрузке
document.addEventListener('DOMContentLoaded', () => {
    window.checkConfig();
});

// MCP-MARKER:FUNCTION:WAIT_FOR_DEPENDENCIES - Ожидание загрузки зависимостей
window.waitForDependencies = function(dependencies, timeout = 5000) {
    return new Promise((resolve, reject) => {
        const checkInterval = 100;
        let elapsed = 0;
        
        const check = () => {
            const missing = dependencies.filter(dep => !window[dep]);
            
            if (missing.length === 0) {
                resolve();
                return;
            }
            
            elapsed += checkInterval;
            if (elapsed >= timeout) {
                console.warn(`⚠️ Зависимости не загружены: ${missing.join(', ')}`);
                resolve(); // Продолжаем работу даже без зависимостей
                return;
            }
            
            setTimeout(check, checkInterval);
        };
        
        check();
    });
};

// Проверка наличия API ключей при инициализации
if (window.GENESIS_CONFIG.bscscan.apiKeys.AUTHORIZATION === '' ||
    window.GENESIS_CONFIG.bscscan.apiKeys.DEPOSITS === '' ||
    window.GENESIS_CONFIG.bscscan.apiKeys.SUBSCRIPTION === '') {
    console.warn('⚠️ WARNING: BSCScan API keys are not configured! Please set them in .env file');
    console.warn('📝 Copy .env.example to .env and fill in your API keys from https://bscscan.com/myapikey');
}

console.log('⚙️ GENESIS CONFIG loaded v' + window.GENESIS_CONFIG.version + ' (Terminal v' + window.GENESIS_CONFIG.terminal.version + ')');
console.log('🔒 Security: API keys loaded from environment variables');
