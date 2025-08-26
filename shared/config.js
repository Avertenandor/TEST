// shared/config.js
// Централизованная конфигурация проекта

export const CONFIG = {
    network: { 
        chainId: 56, 
        name: 'BSC' 
    },
    addresses: {
        plex: '0xdf179b6cadbc61ffd86a3d2e55f6d6e083ade6c1',
        usdt: '0x55d398326f99059ff775485246999027b3197955',
        pools: [
            '0x41d9650faf3341cbf8947fd8063a1fc88dbf1889',
            '0xc7961e1e762d4b1975a3fcd07b8f70e34726c04e'
        ],
        systemAuth: '0x399B22170B0AC7BB20bdC86772BfF478f201fFCD',
        access: '0x28915a33562b58500cf8b5b682C89A3396B8Af76'
    },
    api: { 
        bscscan: (window.__ENV?.BSCSCAN_KEYS ?? []) 
    },
    terminal: {
        localStorageKey: 'terminal:ui',
        defaultState: {
            minimized: false,
            fullscreen: false,
            mute: false,
            filters: {}
        }
    },
    modules: {
        home: {
            showHero: true,
            showTokenInfo: true,
            showCtaGrid: true,
            showFaq: true,
            showPartners: true,
            showStats: true
        }
    }
};

// Глобальные типы для TypeScript
if (typeof window !== 'undefined') {
    window.__ENV = window.__ENV || {};
    window.__CONFIG = CONFIG;
}

// Экспорт для совместимости
export default CONFIG;