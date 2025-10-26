/**
 * GENESIS 1.4.2 - Конфигурация системы
 * MCP-MARKER:MODULE:SYSTEM_CONFIG - Конфигурация системы
 * MCP-MARKER:FILE:CONFIG_JS - Основной конфигурационный файл
 *
 * БЕЗОПАСНОСТЬ: API ключи загружаются из переменных окружения (.env)
 * Для разработки скопируйте .env.example в .env и заполните реальными значениями
 */

// MCP-MARKER:SECTION:GLOBAL_CONFIG - Глобальная конфигурация
window.GENESIS_CONFIG = {
    version: (typeof __VITE_GENESIS_VERSION__ !== 'undefined' ? __VITE_GENESIS_VERSION__ : '1.4.2'),
    buildDate: '2025-10-26',
    build: 'terminal-v2.1-refactored',
    network: 'BSC',

    // MCP-MARKER:SUBSECTION:SYSTEM_ADDRESSES - Системные адреса из переменных окружения
    addresses: {
        system: (typeof __VITE_SYSTEM_ADDRESS__ !== 'undefined' ? __VITE_SYSTEM_ADDRESS__ : '0x399B22170B0AC7BB20bdC86772bfF478f201fFCD'),
        access: (typeof __VITE_ACCESS_ADDRESS__ !== 'undefined' ? __VITE_ACCESS_ADDRESS__ : '0x28915a33562b58500cf8b5b682C89A3396B8Af76')
    },
    
    // MCP-MARKER:SUBSECTION:PLEX_TOKEN_CONFIG - Конфигурация токена PLEX
    plex: {
        address: '0xdf179b6cAdBC61FFD86A3D2e55f6d6e083ade6c1',
        symbol: 'PLEX',
        name: 'PLEX ONE',
        decimals: 18
    },
    
    // MCP-MARKER:SUBSECTION:USDT_TOKEN_CONFIG - Конфигурация токена USDT
    usdt: {
        address: '0x55d398326f99059ff775485246999027b3197955',
        symbol: 'USDT',
        name: 'Tether USD',
        decimals: 18
    },
    
    // MCP-MARKER:SUBSECTION:BSCSCAN_API_CONFIG - Специализированные BSCScan API ключи из переменных окружения
    bscscan: {
        apiUrl: 'https://api.bscscan.com/api',
        // БЕЗОПАСНОСТЬ: Ключи загружаются из .env файла через Vite define
        // В production сборке эти значения будут заменены во время компиляции
        apiKeys: {
            AUTHORIZATION: (typeof __VITE_BSCSCAN_API_KEY_AUTHORIZATION__ !== 'undefined'
                ? __VITE_BSCSCAN_API_KEY_AUTHORIZATION__
                : ''),  // Авторизация при нажатии кнопки
            DEPOSITS: (typeof __VITE_BSCSCAN_API_KEY_DEPOSITS__ !== 'undefined'
                ? __VITE_BSCSCAN_API_KEY_DEPOSITS__
                : ''),  // Проверка депозитов
            SUBSCRIPTION: (typeof __VITE_BSCSCAN_API_KEY_SUBSCRIPTION__ !== 'undefined'
                ? __VITE_BSCSCAN_API_KEY_SUBSCRIPTION__
                : '')   // Проверка подписки
        },
        rateLimit: 5, // запросов в секунду
        retryAttempts: 3
    },
    
    // MCP-MARKER:SUBSECTION:DEPOSIT_PLANS_CONFIG - Новая система депозитов с валютными ограничениями
    depositPlans: [
        { 
            id: 'trial', 
            name: 'TRIAL', 
            title: 'Пробный',
            plexAmount: 500, 
            usdtAmount: 25.00, 
            percentage: 110, 
            days: 3, 
            order: 0,
            currencies: ['USDT'], // Только USDT
            description: 'Пробный депозит для знакомства с системой'
        },
        { 
            id: 'basic', 
            name: 'BASIC', 
            title: 'Базовый',
            plexAmount: 1000, 
            usdtAmount: 50.00, 
            percentage: 115, 
            days: 7, 
            order: 1,
            currencies: ['USDT'], // Только USDT
            description: 'Базовый депозит для начинающих'
        },
        { 
            id: 'starter', 
            name: 'STARTER', 
            title: 'Стартовый',
            plexAmount: 2001, 
            usdtAmount: 100.05, 
            percentage: 120, 
            days: 10, 
            order: 2,
            currencies: ['USDT'], // Только USDT
            description: 'Основной стартовый депозит'
        },
        { 
            id: 'progressive1', 
            name: 'PROGRESSIVE1', 
            title: 'Прогрессивный 1',
            plexAmount: 4001, 
            usdtAmount: 200.05, 
            percentage: 135, 
            days: 15, 
            order: 3,
            currencies: ['USDT'], // Только USDT
            description: 'Прогрессивный уровень 1'
        },
        { 
            id: 'progressive2', 
            name: 'PROGRESSIVE2', 
            title: 'Прогрессивный 2',
            plexAmount: 6001, 
            usdtAmount: 300.05, 
            percentage: 140, 
            days: 18, 
            order: 4,
            currencies: ['USDT'], // Только USDT
            description: 'Прогрессивный уровень 2'
        },
        { 
            id: 'progressive3', 
            name: 'PROGRESSIVE3', 
            title: 'Прогрессивный 3',
            plexAmount: 8001, 
            usdtAmount: 400.05, 
            percentage: 145, 
            days: 20, 
            order: 5,
            currencies: ['USDT'], // Только USDT
            description: 'Прогрессивный уровень 3'
        },
        { 
            id: 'progressive4', 
            name: 'PROGRESSIVE4', 
            title: 'Прогрессивный 4',
            plexAmount: 10001, 
            usdtAmount: 500.05, 
            percentage: 150, 
            days: 22, 
            order: 6,
            currencies: ['USDT'], // Только USDT
            description: 'Прогрессивный уровень 4'
        },
        { 
            id: 'progressive5', 
            name: 'PROGRESSIVE5', 
            title: 'Прогрессивный 5',
            plexAmount: 12001, 
            usdtAmount: 600.05, 
            percentage: 155, 
            days: 24, 
            order: 7,
            currencies: ['USDT'], // Только USDT
            description: 'Прогрессивный уровень 5'
        },
        { 
            id: 'progressive6', 
            name: 'PROGRESSIVE6', 
            title: 'Прогрессивный 6',
            plexAmount: 14001, 
            usdtAmount: 700.05, 
            percentage: 160, 
            days: 26, 
            order: 8,
            currencies: ['USDT'], // Только USDT
            description: 'Прогрессивный уровень 6'
        },
        { 
            id: 'progressive7', 
            name: 'PROGRESSIVE7', 
            title: 'Прогрессивный 7',
            plexAmount: 16001, 
            usdtAmount: 800.05, 
            percentage: 165, 
            days: 28, 
            order: 9,
            currencies: ['USDT'], // Только USDT
            description: 'Прогрессивный уровень 7'
        },
        { 
            id: 'progressive8', 
            name: 'PROGRESSIVE8', 
            title: 'Прогрессивный 8',
            plexAmount: 18001, 
            usdtAmount: 900.05, 
            percentage: 170, 
            days: 30, 
            order: 10,
            currencies: ['USDT'], // Только USDT
            description: 'Прогрессивный уровень 8'
        },
        { 
            id: 'recommended', 
            name: 'RECOMMENDED', 
            title: 'Рекомендуемый',
            plexAmount: 20001, 
            usdtAmount: 1000.05, 
            percentage: 175, 
            days: 35, 
            order: 11,
            currencies: ['PLEX', 'USDT'], // PLEX или USDT
            description: 'Рекомендуемый уровень для опытных инвесторов'
        },
        { 
            id: 'platinum', 
            name: 'PLATINUM', 
            title: 'Платинум',
            plexAmount: 30001, 
            usdtAmount: 1500.05, 
            percentage: 200, 
            days: 40, 
            order: 12,
            currencies: ['PLEX', 'USDT'], // PLEX или USDT
            description: 'Платиновый уровень с высокими привилегиями'
        },
        { 
            id: 'maximum', 
            name: 'MAXIMUM', 
            title: 'Максимальный',
            plexAmount: 50001, 
            usdtAmount: 2500.05, 
            percentage: 250, 
            days: 45, 
            order: 13,
            currencies: ['PLEX', 'USDT'], // PLEX или USDT
            description: 'Максимальный уровень с премиум условиями'
        }
    ],
    
    // MCP-MARKER:SUBSECTION:PLEX_PRICE_CONFIG - Фиксированная стоимость PLEX
    plexPrice: {
        usd: 0.05, // $0.05 за 1 PLEX токен
        tolerance: 0.05 // ±5% погрешность для всех платежей
    },
    
    // MCP-MARKER:SUBSECTION:TOLERANCES_CONFIG - Допуски и погрешности для новой системы депозитов
    tolerances: {
        PAYMENT_TOLERANCE: 0.05, // 5%
        MIN_AUTH_AMOUNT: 0.95,  // 0.95 PLEX (вместо 1.0)
        MAX_AUTH_AMOUNT: 1.05,  // 1.05 PLEX (вместо 1.0)
        MIN_SUBSCRIPTION: 9.5,   // 9.5 USDT
        MAX_SUBSCRIPTION: 21.0,  // 21.0 USDT
        DEPOSIT_PLANS: {
            // Пробный, базовый и стартовый (только USDT)
            TRIAL: { min: 23.75, max: 26.25, usd: 25.00, currencies: ['USDT'] },
            BASIC: { min: 47.50, max: 52.50, usd: 50.00, currencies: ['USDT'] },
            STARTER: { min: 95.05, max: 105.05, usd: 100.05, currencies: ['USDT'] },
            
            // Прогрессивные уровни (только USDT)
            PROGRESSIVE1: { min: 190.05, max: 210.05, usd: 200.05, currencies: ['USDT'] },
            PROGRESSIVE2: { min: 285.05, max: 315.05, usd: 300.05, currencies: ['USDT'] },
            PROGRESSIVE3: { min: 380.05, max: 420.05, usd: 400.05, currencies: ['USDT'] },
            PROGRESSIVE4: { min: 475.05, max: 525.05, usd: 500.05, currencies: ['USDT'] },
            PROGRESSIVE5: { min: 570.05, max: 630.05, usd: 600.05, currencies: ['USDT'] },
            PROGRESSIVE6: { min: 665.05, max: 735.05, usd: 700.05, currencies: ['USDT'] },
            PROGRESSIVE7: { min: 760.05, max: 840.05, usd: 800.05, currencies: ['USDT'] },
            PROGRESSIVE8: { min: 855.05, max: 945.05, usd: 900.05, currencies: ['USDT'] },
            
            // Премиум уровни (PLEX или USDT)
            RECOMMENDED: { 
                min: 950.05, max: 1050.05, usd: 1000.05, 
                currencies: ['PLEX', 'USDT'],
                plexMin: 19000, plexMax: 21000, plexAmount: 20001
            },
            PLATINUM: { 
                min: 1425.05, max: 1575.05, usd: 1500.05, 
                currencies: ['PLEX', 'USDT'],
                plexMin: 28500, plexMax: 31500, plexAmount: 30001
            },
            MAXIMUM: { 
                min: 2375.05, max: 2625.05, usd: 2500.05, 
                currencies: ['PLEX', 'USDT'],
                plexMin: 47500, plexMax: 52500, plexAmount: 50001
            }
        }
    },
    
    // MCP-MARKER:SUBSECTION:APP_SETTINGS - Настройки приложения
    app: {
        debug: (typeof __VITE_DEBUG_MODE__ !== 'undefined' ? __VITE_DEBUG_MODE__ : false), // Из переменных окружения
        cacheTimeout: 300000, // 5 минут
        apiTimeout: 10000, // 10 секунд
        animationDuration: 300,
        maxRetries: 3,
        offlineMode: true
    },
    
    // MCP-MARKER:SUBSECTION:TERMINAL_SETTINGS - Настройки терминала
    terminal: {
        version: '2.1',
        maxMessages: 2000,
        themes: ['dark', 'light', 'matrix', 'retro', 'cyber', 'neon'],
        defaultTheme: 'dark',
        soundEnabled: true,
        autoScroll: true,
        commandHistory: 100
    }
};

// MCP-MARKER:FUNCTION:GET_API_KEY - Получение специализированного API ключа
window.getApiKeyForOperation = function(operationType) {
    const config = window.GENESIS_CONFIG;
    if (!config || !config.bscscan || !config.bscscan.apiKeys) {
        console.warn('⚠️ BSCScan API ключи не настроены');
        return null;
    }
    return config.bscscan.apiKeys[operationType] || config.bscscan.apiKeys.AUTHORIZATION;
};

// MCP-MARKER:FUNCTION:CONVERT_PLEX_TO_USD - Конвертация PLEX в USD
window.convertPlexToUSD = function(plexAmount) {
    const config = window.GENESIS_CONFIG;
    if (!config || !config.plexPrice || !config.plexPrice.usd) {
        console.warn('⚠️ PLEX цена не установлена, используется fallback');
        return plexAmount * 0.05; // fallback price
    }
    return plexAmount * config.plexPrice.usd;
};

// MCP-MARKER:FUNCTION:CONVERT_USD_TO_PLEX - Конвертация USD в PLEX
window.convertUSDToPlex = function(usdAmount) {
    const config = window.GENESIS_CONFIG;
    if (!config || !config.plexPrice || !config.plexPrice.usd) {
        console.warn('⚠️ PLEX цена не установлена, используется fallback');
        return usdAmount / 0.05; // fallback price
    }
    return usdAmount / config.plexPrice.usd;
};

// MCP-MARKER:FUNCTION:WEI_TO_USDT - Конвертация Wei в USDT (18 decimals)
window.weiToUSDT = function(wei) {
    if (!wei || isNaN(wei)) return 0;
    return parseFloat(wei) / 1e18;
};

// MCP-MARKER:FUNCTION:USDT_TO_WEI - Конвертация USDT в Wei (18 decimals)
window.usdtToWei = function(usdt) {
    if (!usdt || isNaN(usdt)) return '0';
    return Math.floor(parseFloat(usdt) * 1e18).toString();
};

// MCP-MARKER:FUNCTION:WEI_TO_PLEX - Конвертация Wei в PLEX (9 decimals)
window.weiToPlex = function(wei) {
    if (!wei || isNaN(wei)) return 0;
    return parseFloat(wei) / 1e9;
};

// MCP-MARKER:FUNCTION:PLEX_TO_WEI - Конвертация PLEX в Wei (9 decimals)
window.plexToWei = function(plex) {
    if (!plex || isNaN(plex)) return '0';
    return Math.floor(parseFloat(plex) * 1e9).toString();
};

// MCP-MARKER:FUNCTION:WEI_TO_BNB - Конвертация Wei в BNB (18 decimals)
window.weiToBNB = function(wei) {
    if (!wei || isNaN(wei)) return 0;
    return parseFloat(wei) / 1e18;
};

// MCP-MARKER:FUNCTION:BNB_TO_WEI - Конвертация BNB в Wei (18 decimals)
window.bnbToWei = function(bnb) {
    if (!bnb || isNaN(bnb)) return '0';
    return Math.floor(parseFloat(bnb) * 1e18).toString();
};

// MCP-MARKER:FUNCTION:GET_DEPOSIT_PLAN - Получение плана депозита по сумме с поддержкой валют
window.getDepositPlanByAmount = function(amount, currency = 'USDT') {
    const config = window.GENESIS_CONFIG;
    if (!config || !config.depositPlans) return null;
    
    const tolerance = config.plexPrice.tolerance || 0.05;
    
    for (let plan of config.depositPlans) {
        // Проверяем, поддерживает ли план данную валюту
        if (!plan.currencies || !plan.currencies.includes(currency)) {
            continue;
        }
        
        let targetAmount, minAmount, maxAmount;
        
        if (currency === 'USDT') {
            targetAmount = plan.usdtAmount;
        } else if (currency === 'PLEX') {
            targetAmount = plan.plexAmount;
        } else {
            continue;
        }
        
        minAmount = targetAmount * (1 - tolerance);
        maxAmount = targetAmount * (1 + tolerance);
        
        if (amount >= minAmount && amount <= maxAmount) {
            return plan;
        }
    }
    
    return null;
};

// MCP-MARKER:FUNCTION:GET_DEPOSIT_PLAN_BY_ID - Получение плана по ID
window.getDepositPlanById = function(planId) {
    const config = window.GENESIS_CONFIG;
    return config.depositPlans.find(plan => plan.id === planId);
};

// MCP-MARKER:FUNCTION:GET_AVAILABLE_CURRENCIES - Получение доступных валют для плана
window.getAvailableCurrencies = function(planId) {
    const plan = window.getDepositPlanById(planId);
    return plan ? plan.currencies : [];
};

// MCP-MARKER:FUNCTION:VALIDATE_DEPOSIT_SEQUENCE - Проверка последовательности депозитов
window.validateDepositSequence = function(userDeposits, newPlanId) {
    // Тестовый депозит (trial) можно делать всегда
    if (newPlanId === 'trial') {
        return { allowed: true, message: 'Пробный депозит доступен всегда' };
    }
    
    const config = window.GENESIS_CONFIG;
    if (!config || !config.depositPlans) {
        return { allowed: false, message: 'Конфигурация не загружена' };
    }
    
    // Получаем завершенные планы (исключая trial)
    const completedPlans = userDeposits
        .filter(d => d.status === 'COMPLETED' || d.status === 'ACTIVE')
        .map(d => d.planId)
        .filter(p => p !== 'trial');
    
    const newPlan = config.depositPlans.find(p => p.id === newPlanId);
    if (!newPlan) return { allowed: false, message: 'Неизвестный план' };
    
    // Находим максимальный завершенный порядковый номер
    const completedOrders = completedPlans.map(planId => {
        const plan = config.depositPlans.find(p => p.id === planId);
        return plan ? plan.order : -1;
    }).filter(order => order >= 0);
    
    const maxCompletedOrder = completedOrders.length > 0 ? Math.max(...completedOrders) : -1;
    
    // Проверяем последовательность
    if (newPlan.order > maxCompletedOrder + 1) {
        const requiredOrder = maxCompletedOrder + 1;
        const requiredPlan = config.depositPlans.find(p => p.order === requiredOrder);
        return {
            allowed: false,
            message: `Сначала завершите план ${requiredPlan ? requiredPlan.name : 'предыдущий'}`,
            requiredPlan: requiredPlan
        };
