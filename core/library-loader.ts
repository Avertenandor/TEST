// core/library-loader.ts
// Загрузчик библиотек с fallback на локальные бандлы

interface LibraryConfig {
    name: string;
    cdnUrl: string;
    localPath: string;
    globalName?: string;
    checkFunction?: string;
}

interface AxiosResponse<T = any> {
    data: T;
    status: number;
    ok: boolean;
    statusText?: string;
}

interface AxiosConfig {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
    timeout?: number;
}

// Конфигурация библиотек
const LIBRARIES: LibraryConfig[] = [
    {
        name: 'qrcode',
        cdnUrl: 'https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js',
        localPath: '/assets/vendor/qrcode.min.js',
        globalName: 'QRCode'
    },
    {
        name: 'chart',
        cdnUrl: 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js',
        localPath: '/assets/vendor/chart.umd.js',
        globalName: 'Chart'
    },
    {
        name: 'axios',
        cdnUrl: 'https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js',
        localPath: '/assets/vendor/axios.min.js',
        globalName: 'axios'
    }
];

// Кэш загруженных библиотек
const loadedLibraries = new Map<string, any>();

/**
 * Проверяет, загружена ли библиотека
 */
function isLibraryLoaded(config: LibraryConfig): boolean {
    if (config.globalName) {
        return typeof (window as any)[config.globalName] !== 'undefined';
    }
    return loadedLibraries.has(config.name);
}

/**
 * Загружает скрипт
 */
function loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
        document.head.appendChild(script);
    });
}

/**
 * Загружает библиотеку с fallback
 */
async function loadLibrary(config: LibraryConfig): Promise<any> {
    // Проверяем, не загружена ли уже
    if (isLibraryLoaded(config)) {
        return (config.globalName ? (window as any)[config.globalName] : null) || loadedLibraries.get(config.name);
    }

    try {
        // Сначала пробуем локальный путь
        await loadScript(config.localPath);
        console.log(`✅ Loaded ${config.name} from local path`);
    } catch (localError) {
        console.warn(`⚠️ Failed to load ${config.name} from local path, trying CDN`);

        try {
            // Fallback на CDN
            await loadScript(config.cdnUrl);
            console.log(`✅ Loaded ${config.name} from CDN`);
        } catch (cdnError) {
            console.error(`❌ Failed to load ${config.name} from both local and CDN`);
            throw new Error(`Library ${config.name} could not be loaded`);
        }
    }

    // Получаем библиотеку из глобального объекта
    const library = config.globalName ? (window as any)[config.globalName] : null;
    if (library) {
        loadedLibraries.set(config.name, library);
        return library;
    }

    throw new Error(`Library ${config.name} not found after loading`);
}

/**
 * Axios fallback с исправленным API и обработкой ошибок
 */
function createAxiosFallback(): any {
    const axiosFallback = {
        get: async (url: string, config?: AxiosConfig): Promise<AxiosResponse> => {
            const response = await fetch(url, {
                method: 'GET',
                ...config
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            let data;
            try {
                data = await response.json();
            } catch (error) {
                throw new Error(`Failed to parse JSON response: ${error}`);
            }

            return {
                data,
                status: response.status,
                ok: response.ok,
                statusText: response.statusText
            };
        },

        post: async (url: string, data?: any, config?: AxiosConfig): Promise<AxiosResponse> => {
            const response = await fetch(url, {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json',
                    ...config?.headers
                },
                ...config
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            let responseData;
            try {
                responseData = await response.json();
            } catch (error) {
                throw new Error(`Failed to parse JSON response: ${error}`);
            }

            return {
                data: responseData,
                status: response.status,
                ok: response.ok,
                statusText: response.statusText
            };
        },

        put: async (url: string, data?: any, config?: AxiosConfig): Promise<AxiosResponse> => {
            const response = await fetch(url, {
                method: 'PUT',
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json',
                    ...config?.headers
                },
                ...config
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            let responseData;
            try {
                responseData = await response.json();
            } catch (error) {
                throw new Error(`Failed to parse JSON response: ${error}`);
            }

            return {
                data: responseData,
                status: response.status,
                ok: response.ok,
                statusText: response.statusText
            };
        },

        delete: async (url: string, config?: AxiosConfig): Promise<AxiosResponse> => {
            const response = await fetch(url, {
                method: 'DELETE',
                ...config
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            let data;
            try {
                data = await response.json();
            } catch (error) {
                throw new Error(`Failed to parse JSON response: ${error}`);
            }

            return {
                data,
                status: response.status,
                ok: response.ok,
                statusText: response.statusText
            };
        },

        defaults: {
            headers: {
                common: {}
            }
        }
    };

    return axiosFallback;
}

/**
 * Загружает QRCode библиотеку
 */
export async function loadQRCode(): Promise<any> {
    try {
        return await loadLibrary(LIBRARIES.find(lib => lib.name === 'qrcode')!);
    } catch (error) {
        console.error('Failed to load QRCode library:', error);
        throw error;
    }
}

/**
 * Загружает Chart.js библиотеку
 */
export async function loadChart(): Promise<any> {
    try {
        return await loadLibrary(LIBRARIES.find(lib => lib.name === 'chart')!);
    } catch (error) {
        console.error('Failed to load Chart.js library:', error);
        throw error;
    }
}

/**
 * Загружает или создает Axios
 */
export async function loadAxios(): Promise<any> {
    try {
        // Сначала пробуем загрузить настоящий Axios
        return await loadLibrary(LIBRARIES.find(lib => lib.name === 'axios')!);
    } catch (error) {
        console.warn('Axios not available, using fallback implementation');
        return createAxiosFallback();
    }
}

/**
 * Загружает все библиотеки
 */
export async function loadAllLibraries(): Promise<{
    qrcode: any;
    chart: any;
    axios: any;
}> {
    const [qrcode, chart, axios] = await Promise.all([
        loadQRCode(),
        loadChart(),
        loadAxios()
    ]);

    return { qrcode, chart, axios };
}

/**
 * Проверяет доступность библиотек
 */
export function checkLibrariesAvailability(): {
    qrcode: boolean;
    chart: boolean;
    axios: boolean;
} {
    return {
        qrcode: isLibraryLoaded(LIBRARIES.find(lib => lib.name === 'qrcode')!),
        chart: isLibraryLoaded(LIBRARIES.find(lib => lib.name === 'chart')!),
        axios: isLibraryLoaded(LIBRARIES.find(lib => lib.name === 'axios')!)
    };
}

/**
 * Инициализация загрузчика библиотек
 */
export function initLibraryLoader(): void {
    console.log('📚 Library loader initialized');

    // Предзагружаем критически важные библиотеки
    loadAllLibraries().catch(error => {
        console.error('Failed to preload libraries:', error);
    });
}