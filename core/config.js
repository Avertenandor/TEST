// core/config.js
// Модульная конфигурация GENESIS

const config = {
    // Централизованная версия приложения
    version: '1.4.2',
    buildDate: new Date().toISOString().split('T')[0],
    buildTime: new Date().toISOString(),
    build: 'modular-v1.4.2',
    environment: 'production', // production | development | test
    network: 'BSC',
    
    // System addresses
    addresses: {
        system: '0x399B22170B0AC7BB20bdC86772bfF478f201fFCD',
        access: '0x28915a33562b58500cf8b5b682C89A3396B8Af76'
    },
    
    // PLEX token
    plex: {
        address: '0xdf179b6cadbc61ffd86a3d2e55f6d6e083ade6c1',
        symbol: 'PLEX',
        name: 'PLEX ONE',
        decimals: 18,
        testMode: true,
        fallbackBalance: '1000000000000000000' // 1 PLEX в wei для тестового режима
    },
    
    // USDT token
    usdt: {
        address: '0x55d398326f99059ff775485246999027b3197955',
        symbol: 'USDT',
        name: 'Tether USD',
        decimals: 18
    },
    
    // BSCScan API
    bscscan: {
        apiUrl: 'https://api.bscscan.com/api',
        apiKeys: {
            PRIMARY: 'ZZ3RSBZPMAPK4FV1HUVWE9X13G9ACJWPJX',
            SECONDARY: 'ZV525F4QEKK2C3DWNGR69AUF6GG6Y2ZW39',
            AUTHORIZATION: 'YA5RH81WYSNS41KQPNNCX74FVXN7DJRJR4',
            DEPOSITS: '2ZJG1N64RZ17GGAMZJU4DKY21GYBERMNY6',
            SUBSCRIPTION: 'ARA9FYMNCIZHTB2PPBSWF686GID9F99P41'
        },
        keyRotation: true,
        currentKeyIndex: 0,
        rateLimit: 5,
        retryAttempts: 3,
        timeout: 30000
    },
    
    // Deposit plans
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
            currencies: ['USDT'],
            description: 'Пробный депозит для знакомства с системой'
        },
        { 
            id: 'starter', 
            name: 'STARTER', 
            title: 'Стартовый',
            plexAmount: 2001, 
            usdtAmount: 100.05, 
            percentage: 120, 
            days: 10, 
            order: 1,
            currencies: ['USDT'],
            description: 'Первый обязательный депозит'
        },
        { 
            id: 'progressive1', 
            name: 'PROGRESSIVE1', 
            title: 'Прогрессивный 1',
            plexAmount: 4001, 
            usdtAmount: 200.05, 
            percentage: 135, 
            days: 15, 
            order: 2,
            currencies: ['USDT'],
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
            order: 3,
            currencies: ['USDT'],
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
            order: 4,
            currencies: ['USDT'],
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
            order: 5,
            currencies: ['USDT'],
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
            order: 6,
            currencies: ['USDT'],
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
            order: 7,
            currencies: ['USDT'],
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
            order: 8,
            currencies: ['USDT'],
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
            order: 9,
            currencies: ['USDT'],
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
            order: 10,
            currencies: ['PLEX', 'USDT'],
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
            order: 11,
            currencies: ['PLEX', 'USDT'],
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
            order: 12,
            currencies: ['PLEX', 'USDT'],
            description: 'Максимальный уровень с премиум условиями'
        }
    ],
    
    // PLEX price
    plexPrice: {
        usd: 0.05,
        tolerance: 0.05
    },
    
    // Module routes
    routes: {
        '/': 'dashboard',
        '/auth': 'auth',
        '/deposits': 'deposits',
        '/portfolio': 'portfolio',
        '/transactions': 'transactions',
        '/analytics': 'analytics',
        '/bonuses': 'bonuses',
        '/gifts': 'gifts',
        '/referrals': 'referrals',
        '/multipliers': 'multipliers',
        '/mining-rent': 'mining-rent',
        '/my-device': 'my-device',
        '/plex-coin': 'plex-coin',
        '/settings': 'settings',
        '/experience': 'experience',
        '/rank': 'rank',
        '/how-it-works': 'how-it-works',
        '/platform-access': 'platform-access'
    },
    
    // App settings
    app: {
        debug: false,
        cacheTimeout: 300000,
        apiTimeout: 10000,
        animationDuration: 300,
        maxRetries: 3,
        offlineMode: true
    },
    
    // Module settings
    modules: {
        lazyLoad: true,
        cache: true,
        debug: false
    },
    
    // Terminal settings
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

// Export for ES6 modules
export default config;

// Export individual parts if needed
export const addresses = config.addresses;
export const depositPlans = config.depositPlans;
export const routes = config.routes;
export const bscscan = config.bscscan;
