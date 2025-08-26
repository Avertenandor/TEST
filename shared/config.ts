// shared/config.ts
// Централизованная конфигурация для всех модулей

export interface NetworkConfig {
    chainId: number;
    name: string;
}

export interface Addresses {
    plex: string;
    usdt: string;
    system: string;
    access: string;
    pools: string[];
}

export interface Config {
    addresses: Addresses;
    bscscanKeys: string[];
    network: NetworkConfig;
    version: string;
    environment: 'production' | 'development' | 'test';
}

// Получение ключей BSCScan из переменных окружения
const getBscscanKeys = (): string[] => {
    const keys = [
        'ZZ3RSBZPMAPK4FV1HUVWE9X13G9ACJWPJX',
        'ZV525F4QEKK2C3DWNGR69AUF6GG6Y2ZW39',
        'YA5RH81WYSNS41KQPNNCX74FVXN7DJRJR4',
        '2ZJG1N64RZ17GGAMZJU4DKY21GYBERMNY6',
        'ARA9FYMNCIZHTB2PPBSWF686GID9F99P41'
    ];

    // В продакшене можно получать из process.env или других источников
    return keys;
};

export const config: Config = {
    addresses: {
        plex: '0xdf179b6cadbc61ffd86a3d2e55f6d6e083ade6c1',
        usdt: '0x55d398326f99059ff775485246999027b3197955',
        system: '0x399B22170B0AC7BB20bdC86772bFf478f201fFCD',
        access: '0x28915a33562b58500cf8b5b682C89A3396B8Af76',
        pools: [
            '0x41d9650faf3341cbf8947fd8063a1fc88dbf1889',
            '0xc7961e1e762d4b1975a3fcd07b8f70e34726c04e'
        ]
    },
    bscscanKeys: getBscscanKeys(),
    network: {
        chainId: 56,
        name: 'BSC'
    },
    version: '1.4.2',
    environment: 'production'
};

// Экспорт отдельных частей для удобства
export const { addresses, bscscanKeys, network } = config;
