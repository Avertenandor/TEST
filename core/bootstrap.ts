// core/bootstrap.ts
// Инициализация и запуск приложения

import { initErrorGuard } from './error-guard';
import { initLibraryLoader } from './library-loader';
import { Router, Module, RouterContext } from './router';
import { store } from './store';
import { eventBus } from './event-bus';
import { config } from '../shared/config';

export interface AppConfig {
    debug?: boolean;
    enableErrorGuard?: boolean;
    enableLibraryLoader?: boolean;
    enableRouter?: boolean;
}

export class AppBootstrap {
    private router: Router | null = null;
    private config: AppConfig;
    private initialized = false;

    constructor(appConfig: AppConfig = {}) {
        this.config = {
            debug: false,
            enableErrorGuard: true,
            enableLibraryLoader: true,
            enableRouter: true,
            ...appConfig
        };
    }

    /**
     * Инициализация всех core модулей
     */
    async init(): Promise<void> {
        if (this.initialized) {
            console.warn('App already initialized');
            return;
        }

        console.log('🚀 Initializing GENESIS application...');

        try {
            // 1. Инициализация error guard
            if (this.config.enableErrorGuard) {
                initErrorGuard();
                console.log('✅ Error guard initialized');
            }

            // 2. Инициализация library loader
            if (this.config.enableLibraryLoader) {
                initLibraryLoader();
                console.log('✅ Library loader initialized');
            }

            // 3. Инициализация router
            if (this.config.enableRouter) {
                await this.initRouter();
                console.log('✅ Router initialized');
            }

            // 4. Настройка store
            this.setupStore();
            console.log('✅ Store initialized');

            // 5. Настройка event bus
            this.setupEventBus();
            console.log('✅ Event bus initialized');

            // 6. Загрузка конфигурации
            this.loadConfiguration();
            console.log('✅ Configuration loaded');

            this.initialized = true;
            console.log('🎉 Application initialization completed');

            // Отправляем событие о готовности приложения
            eventBus.emit('app:ready', {
                config: this.config,
                timestamp: Date.now()
            });

        } catch (error) {
            console.error('❌ Application initialization failed:', error);
            throw error;
        }
    }

    /**
     * Инициализация роутера
     */
    private async initRouter(): Promise<void> {
        const moduleLoader = async (moduleName: string): Promise<Module> => {
            try {
                // Динамический импорт модуля
                const modulePath = `../modules/${moduleName}/index`;
                const module = await import(modulePath);

                if (!module.default) {
                    throw new Error(`Module ${moduleName} does not have a default export`);
                }

                return module.default;
            } catch (error) {
                console.error(`Failed to load module ${moduleName}:`, error);

                // Возвращаем fallback модуль
                return this.createFallbackModule(moduleName);
            }
        };

        this.router = new Router(moduleLoader);
    }

    /**
     * Создание fallback модуля
     */
    private createFallbackModule(moduleName: string): Module {
        return {
            id: moduleName,
            mount: (el: HTMLElement) => {
                el.innerHTML = `
          <div class="module-error">
            <h2>Ошибка загрузки модуля</h2>
            <p>Не удалось загрузить модуль: ${moduleName}</p>
            <button onclick="window.location.reload()">Перезагрузить страницу</button>
          </div>
        `;
            },
            unmount: () => {
                // Очистка при необходимости
            }
        };
    }

    /**
     * Настройка store
     */
    private setupStore(): void {
        // Устанавливаем начальное состояние
        store.setState({
            app: {
                version: config.version,
                environment: config.environment,
                initialized: true,
                timestamp: Date.now()
            },
            config: {
                addresses: config.addresses,
                network: config.network
            }
        });

        // Включаем отладку если нужно
        if (this.config.debug) {
            store.setDebug(true);
        }

        // Подписываемся на изменения store
        store.subscribe('app', (path, newValue, oldValue) => {
            eventBus.emit('store:changed', {
                path,
                newValue,
                oldValue,
                timestamp: Date.now()
            });
        });
    }

    /**
     * Настройка event bus
     */
    private setupEventBus(): void {
        // Включаем отладку если нужно
        if (this.config.debug) {
            eventBus.setDebug(true);
        }

        // Глобальные обработчики событий
        eventBus.on('app:error', (data) => {
            console.error('Application error:', data);
        });

        eventBus.on('module:loaded', (data) => {
            console.log('Module loaded:', data);
        });

        eventBus.on('module:error', (data) => {
            console.error('Module error:', data);
        });
    }

    /**
     * Загрузка конфигурации
     */
    private loadConfiguration(): void {
        // Сохраняем конфигурацию в store
        store.set('config', {
            addresses: config.addresses,
            network: config.network,
            bscscanKeys: config.bscscanKeys
        });

        // Отправляем событие о загрузке конфигурации
        eventBus.emit('config:loaded', {
            config: config,
            timestamp: Date.now()
        });
    }

    /**
     * Запуск приложения
     */
    async start(): Promise<void> {
        if (!this.initialized) {
            await this.init();
        }

        console.log('🚀 Starting GENESIS application...');

        try {
            // Запускаем роутер
            if (this.router) {
                this.router.start();
            }

            // Отправляем событие о запуске
            eventBus.emit('app:started', {
                timestamp: Date.now(),
                path: window.location.pathname
            });

            console.log('🎉 Application started successfully');

        } catch (error) {
            console.error('❌ Application start failed:', error);
            throw error;
        }
    }

    /**
     * Остановка приложения
     */
    async stop(): Promise<void> {
        console.log('🛑 Stopping GENESIS application...');

        try {
            // Отправляем событие о остановке
            eventBus.emit('app:stopping', {
                timestamp: Date.now()
            });

            // Очищаем все обработчики событий
            eventBus.removeAllHandlers();

            // Сбрасываем store
            store.reset();

            this.initialized = false;
            console.log('✅ Application stopped successfully');

        } catch (error) {
            console.error('❌ Application stop failed:', error);
            throw error;
        }
    }

    /**
     * Получить роутер
     */
    getRouter(): Router | null {
        return this.router;
    }

    /**
     * Получить состояние инициализации
     */
    isInitialized(): boolean {
        return this.initialized;
    }

    /**
     * Получить конфигурацию приложения
     */
    getConfig(): AppConfig {
        return { ...this.config };
    }
}

// Создаем глобальный экземпляр bootstrap
export const appBootstrap = new AppBootstrap();

// Экспортируем для использования в других модулях
export { store, eventBus, config };
