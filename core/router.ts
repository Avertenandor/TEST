// core/router.ts
// Router для управления навигацией между модулями

export interface Module {
    id: string;
    route?: string;
    mount(el: HTMLElement, props?: any): Promise<void> | void;
    unmount?(): void;
    canActivate?(ctx: RouterContext): boolean | Promise<boolean>;
    init?(): void;
}

export interface RouterContext {
    path: string;
    params: Record<string, string>;
    query: Record<string, string>;
    user?: any;
}

export interface RouteConfig {
    path: string;
    module: string;
    public?: boolean;
    restricted?: boolean;
    guards?: Array<(ctx: RouterContext) => boolean | Promise<boolean>>;
}

export class Router {
    private currentModule: Module | null = null;
    private currentPath: string | null = null;
    private container: HTMLElement | null = null;
    private navigationContainer: HTMLElement | null = null;
    private moduleLoader: (moduleName: string) => Promise<Module>;
    private routes: Map<string, RouteConfig> = new Map();
    private publicModules: Set<string> = new Set();
    private restrictedModules: Set<string> = new Set();

    constructor(moduleLoader: (moduleName: string) => Promise<Module>) {
        this.moduleLoader = moduleLoader;
        this.initRoutes();
        this.init();
    }

    private initRoutes(): void {
        // Базовые маршруты
        const routeConfigs: RouteConfig[] = [
            { path: '/', module: 'dashboard', public: false },
            { path: '/home', module: 'home', public: true },
            { path: '/auth', module: 'auth', public: true },
            { path: '/deposits', module: 'deposits', public: false, restricted: true },
            { path: '/portfolio', module: 'portfolio', public: false, restricted: true },
            { path: '/transactions', module: 'transactions', public: false },
            { path: '/analytics', module: 'analytics', public: false, restricted: true },
            { path: '/bonuses', module: 'bonuses', public: false },
            { path: '/gifts', module: 'gifts', public: false },
            { path: '/referrals', module: 'referrals', public: false },
            { path: '/multipliers', module: 'multipliers', public: false },
            { path: '/mining-rent', module: 'mining-rent', public: false },
            { path: '/my-device', module: 'device', public: false },
            { path: '/plex-coin', module: 'plex-coin', public: false },
            { path: '/settings', module: 'settings', public: false },
            { path: '/experience', module: 'experience', public: false },
            { path: '/rank', module: 'rank', public: false },
            { path: '/how-it-works', module: 'how-it-works', public: true },
            { path: '/terminal', module: 'terminal', public: false },
            { path: '/platform-access', module: 'platform-access', public: false, restricted: true }
        ];

        // Регистрируем маршруты
        routeConfigs.forEach(config => {
            this.routes.set(config.path, config);
            if (config.public) {
                this.publicModules.add(config.module);
            }
            if (config.restricted) {
                this.restrictedModules.add(config.module);
            }
        });
    }

    private init(): void {
        // Получаем контейнеры
        this.container = document.getElementById('app-container');
        this.navigationContainer = document.getElementById('app-navigation');

        if (!this.container) {
            console.error('❌ App container not found');
            return;
        }

        // Обработка браузерной навигации
        window.addEventListener('popstate', () => {
            this.handleRoute(false);
        });

        // Обработка кликов по ссылкам
        document.addEventListener('click', (event) => {
            const target = event.target as HTMLElement;

            // Проверяем data-route атрибут
            const routeLink = target.closest('[data-route]');
            if (routeLink) {
                event.preventDefault();
                const route = (routeLink as HTMLElement).dataset.route!;
                this.navigate(route);
                return;
            }

            // Проверяем обычные ссылки
            const anchor = target.closest('a');
            if (anchor && anchor.href && anchor.href.startsWith(window.location.origin)) {
                const url = new URL(anchor.href);
                if (this.routes.has(url.pathname)) {
                    event.preventDefault();
                    this.navigate(url.pathname);
                }
            }
        });

        // Строим навигацию
        this.buildNavigation();
    }

    /**
     * Строит навигационное меню
     */
    private buildNavigation(): void {
        if (!this.navigationContainer) return;

        const navItems = [
            { path: '/home', icon: '🏠', text: 'Главная' },
            { path: '/', icon: '📊', text: 'Панель управления' },
            { path: '/how-it-works', icon: '🛠️', text: 'Как все устроено' },
            { path: '/deposits', icon: '💰', text: 'Депозиты' },
            { path: '/portfolio', icon: '💼', text: 'Портфель' },
            { path: '/transactions', icon: '📋', text: 'Транзакции' },
            { path: '/analytics', icon: '📈', text: 'Аналитика' },
            { path: '/bonuses', icon: '🎁', text: 'Бонусы' },
            { path: '/gifts', icon: '🎯', text: 'Подарки' },
            { path: '/referrals', icon: '👥', text: 'Рефералы' },
            { path: '/multipliers', icon: '⚡', text: 'Множители' },
            { path: '/mining-rent', icon: '⛏️', text: 'Аренда майнинга' },
            { path: '/my-device', icon: '💻', text: 'Мое устройство' },
            { path: '/plex-coin', icon: '🪙', text: 'PLEX Coin' },
            { path: '/settings', icon: '⚙️', text: 'Настройки' },
            { path: '/experience', icon: '🏆', text: 'Опыт' },
            { path: '/rank', icon: '🥇', text: 'Ранг' },
            { path: '/terminal', icon: '💻', text: 'Терминал' },
            { path: '/platform-access', icon: '🔐', text: 'Доступ к платформе' }
        ];

        this.navigationContainer.innerHTML = navItems
            .map(item => `
        <a href="${item.path}" data-route="${item.path}" class="nav-item">
          <span class="nav-icon">${item.icon}</span>
          <span class="nav-text">${item.text}</span>
        </a>
      `)
            .join('');
    }

    /**
     * Обрабатывает маршрут
     */
    private async handleRoute(updateHistory: boolean = true): Promise<void> {
        const path = window.location.pathname;
        const routeConfig = this.routes.get(path);

        if (!routeConfig) {
            console.warn(`Route not found: ${path}`);
            this.navigate('/home');
            return;
        }

        // Проверяем права доступа
        const canAccess = await this.checkAccess(routeConfig);
        if (!canAccess) {
            console.warn(`Access denied to route: ${path}`);
            this.navigate('/auth');
            return;
        }

        // Обновляем историю браузера
        if (updateHistory) {
            window.history.pushState({}, '', path);
        }

        // Загружаем и монтируем модуль
        await this.loadAndMountModule(routeConfig.module, path);
    }

    /**
     * Проверяет доступ к маршруту
     */
    private async checkAccess(routeConfig: RouteConfig): Promise<boolean> {
        // Публичные модули доступны всем
        if (routeConfig.public) {
            return true;
        }

        // Проверяем аутентификацию
        const user = this.getCurrentUser();
        if (!user) {
            return false;
        }

        // Проверяем ограничения
        if (routeConfig.restricted) {
            const hasAccess = await this.checkPlatformAccess(user);
            if (!hasAccess) {
                return false;
            }
        }

        // Проверяем гварды
        if (routeConfig.guards) {
            const context = this.createRouterContext();
            for (const guard of routeConfig.guards) {
                const result = await guard(context);
                if (!result) {
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Загружает и монтирует модуль
     */
    private async loadAndMountModule(moduleName: string, path: string): Promise<void> {
        try {
            // Размонтируем текущий модуль
            if (this.currentModule && this.currentModule.unmount) {
                this.currentModule.unmount();
            }

            // Загружаем новый модуль
            const module = await this.moduleLoader(moduleName);

            if (!this.container) {
                throw new Error('Container not found');
            }

            // Очищаем контейнер
            this.container.innerHTML = '';

            // Создаем контекст
            const context = this.createRouterContext();

            // Проверяем canActivate
            if (module.canActivate) {
                const canActivate = await module.canActivate(context);
                if (!canActivate) {
                    throw new Error(`Module ${moduleName} cannot be activated`);
                }
            }

            // Инициализируем модуль
            if (module.init) {
                module.init();
            }

            // Монтируем модуль
            await module.mount(this.container, context);

            this.currentModule = module;
            this.currentPath = path;

            console.log(`✅ Module ${moduleName} mounted successfully`);

        } catch (error) {
            console.error(`❌ Failed to load module ${moduleName}:`, error);

            // Показываем ошибку пользователю
            if (this.container) {
                this.container.innerHTML = `
          <div class="error-container">
            <h2>Ошибка загрузки модуля</h2>
            <p>Не удалось загрузить модуль: ${moduleName}</p>
            <button onclick="window.location.reload()">Перезагрузить страницу</button>
          </div>
        `;
            }
        }
    }

    /**
     * Создает контекст роутера
     */
    private createRouterContext(): RouterContext {
        const url = new URL(window.location.href);
        const params: Record<string, string> = {};
        const query: Record<string, string> = {};

        // Парсим query параметры
        url.searchParams.forEach((value, key) => {
            query[key] = value;
        });

        return {
            path: url.pathname,
            params,
            query,
            user: this.getCurrentUser()
        };
    }

    /**
     * Получает текущего пользователя
     */
    private getCurrentUser(): any {
        // Здесь должна быть логика получения пользователя из store
        return null;
    }

    /**
     * Проверяет доступ к платформе
     */
    private async checkPlatformAccess(_user: any): Promise<boolean> {
        // Здесь должна быть логика проверки доступа к платформе
        return false;
    }

    /**
     * Навигация к маршруту
     */
    public navigate(path: string): void {
        window.history.pushState({}, '', path);
        this.handleRoute(false);
    }

    /**
     * Получает текущий путь
     */
    public getCurrentPath(): string | null {
        return this.currentPath;
    }

    /**
     * Получает текущий модуль
     */
    public getCurrentModule(): Module | null {
        return this.currentModule;
    }

    /**
     * Запускает роутер
     */
    public start(): void {
        this.handleRoute(false);
    }
}
