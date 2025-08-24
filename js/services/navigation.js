/**
 * Navigation Module - Модуль навигации для GENESIS
 * MCP-MARKER:MODULE:NAVIGATION - Модуль навигации
 */

window.GenesisNavigation = {
    initialized: false,
    currentRoute: null,
    
    // Конфигурация меню
    menuConfig: [
        { 
            id: 'dashboard', 
            title: 'Панель управления', 
            icon: '📊', 
            module: 'dashboard',
            active: true 
        },
        { 
            id: 'how', 
            title: 'Как все устроено', 
            icon: '🔧', 
            module: 'how-it-works' 
        },
        { 
            id: 'portfolio', 
            title: 'Портфель', 
            icon: '💼', 
            module: 'portfolio' 
        },
        { 
            id: 'bonuses', 
            title: 'Бонусы', 
            icon: '🎁', 
            module: 'bonuses' 
        },
        { 
            id: 'gifts', 
            title: 'Подарки', 
            icon: '🎀', 
            module: 'gifts' 
        },
        { 
            id: 'multipliers', 
            title: 'Множители', 
            icon: '⚡', 
            module: 'multipliers' 
        },
        { 
            id: 'referrals', 
            title: 'Рефералы', 
            icon: '👥', 
            module: 'referrals' 
        },
        { 
            id: 'settings', 
            title: 'Настройки', 
            icon: '⚙️', 
            module: 'settings' 
        }
    ],
    
    // Инициализация навигации
    init() {
        console.log('🧭 Инициализация навигации...');
        
        try {
            this.render();
            this.attachEventListeners();
            this.setActiveRoute('dashboard');
            this.initialized = true;
            console.log('✅ Навигация инициализирована');
        } catch (error) {
            console.error('❌ Ошибка инициализации навигации:', error);
        }
    },
    
    // Рендеринг навигации
    render() {
        const navContainer = document.getElementById('app-navigation');
        if (!navContainer) {
            throw new Error('Контейнер навигации не найден');
        }
        
        const menuHTML = this.menuConfig.map(item => `
            <div class="nav-item ${item.active ? 'active' : ''}" 
                 data-route="${item.id}" 
                 data-module="${item.module}">
                <span class="nav-icon">${item.icon}</span>
                <span class="nav-title">${item.title}</span>
            </div>
        `).join('');
        
        navContainer.innerHTML = `
            <div class="nav-header">
                <div class="nav-logo">GENESIS</div>
                <div class="nav-version">v1.4.2</div>
            </div>
            <div class="nav-menu">
                ${menuHTML}
            </div>
            <div class="nav-footer">
                <div class="nav-status">
                    <span class="status-indicator"></span>
                    <span>Подключено</span>
                </div>
            </div>
        `;
        
        this.addStyles();
    },
    
    // Добавление стилей
    addStyles() {
        if (document.getElementById('nav-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'nav-styles';
        style.textContent = `
            .sidebar {
                width: 280px;
                height: 100vh;
                background: linear-gradient(135deg, #1e1e2e 0%, #262640 100%);
                border-right: 1px solid #333344;
                display: flex;
                flex-direction: column;
                padding: 0;
                position: fixed;
                left: 0;
                top: 0;
                z-index: 1000;
            }
            
            .nav-header {
                padding: 20px;
                border-bottom: 1px solid #333344;
                text-align: center;
            }
            
            .nav-logo {
                font-size: 24px;
                font-weight: 700;
                color: #ff6b35;
                font-family: 'Orbitron', monospace;
            }
            
            .nav-version {
                font-size: 12px;
                color: #888;
                margin-top: 5px;
            }
            
            .nav-menu {
                flex: 1;
                padding: 20px 0;
                overflow-y: auto;
            }
            
            .nav-item {
                display: flex;
                align-items: center;
                padding: 12px 20px;
                margin: 2px 10px;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s ease;
                color: #b0b0b0;
                user-select: none;
            }
            
            .nav-item:hover {
                background: rgba(255, 107, 53, 0.1);
                color: #ff6b35;
                transform: translateX(4px);
            }
            
            .nav-item.active {
                background: rgba(255, 107, 53, 0.2);
                color: #ff6b35;
                border-left: 3px solid #ff6b35;
            }
            
            .nav-icon {
                width: 20px;
                margin-right: 12px;
                font-size: 16px;
            }
            
            .nav-title {
                font-size: 14px;
                font-weight: 500;
            }
            
            .nav-footer {
                padding: 20px;
                border-top: 1px solid #333344;
            }
            
            .nav-status {
                display: flex;
                align-items: center;
                font-size: 12px;
                color: #888;
            }
            
            .status-indicator {
                width: 8px;
                height: 8px;
                background: #4CAF50;
                border-radius: 50%;
                margin-right: 8px;
                animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
                0% { opacity: 1; }
                50% { opacity: 0.5; }
                100% { opacity: 1; }
            }
            
            /* Адаптация основного контента */
            .main-content {
                margin-left: 280px;
                min-height: 100vh;
                padding: 20px;
                background: #0f0f1a;
            }
        `;
        document.head.appendChild(style);
    },
    
    // Обработчики событий
    attachEventListeners() {
        const navContainer = document.getElementById('app-navigation');
        if (!navContainer) return;
        
        navContainer.addEventListener('click', (e) => {
            const navItem = e.target.closest('.nav-item');
            if (navItem) {
                const route = navItem.dataset.route;
                const module = navItem.dataset.module;
                this.navigateTo(route, module);
            }
        });
    },
    
    // Навигация к маршруту
    navigateTo(route, module) {
        console.log(`🧭 Переход к: ${route} (${module})`);
        
        // Убираем активный класс со всех элементов
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Добавляем активный класс к выбранному элементу
        const activeItem = document.querySelector(`[data-route="${route}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }
        
        this.currentRoute = route;
        
        // Загружаем контент модуля
        this.loadModuleContent(module);
        
        // Обновляем URL (без перезагрузки)
        history.pushState({ route, module }, '', `#${route}`);
    },
    
    // Загрузка контента модуля
    loadModuleContent(module) {
        const container = document.getElementById('app-container');
        if (!container) return;
        
        // Показываем заглушку с информацией о модуле
        container.innerHTML = `
            <div style="
                padding: 40px;
                text-align: center;
                color: #b0b0b0;
                background: rgba(255, 107, 53, 0.05);
                border-radius: 12px;
                border: 1px solid rgba(255, 107, 53, 0.2);
            ">
                <h2 style="color: #ff6b35; margin-bottom: 20px;">
                    ${this.getModuleTitle(module)}
                </h2>
                <p>Модуль "${module}" готов к разработке</p>
                <div style="margin-top: 20px; font-size: 14px; opacity: 0.7;">
                    Текущий маршрут: ${this.currentRoute}
                </div>
            </div>
        `;
    },
    
    // Получение названия модуля
    getModuleTitle(module) {
        const item = this.menuConfig.find(i => i.module === module);
        return item ? item.title : module;
    },
    
    // Установка активного маршрута
    setActiveRoute(route) {
        const item = this.menuConfig.find(i => i.id === route);
        if (item) {
            this.navigateTo(route, item.module);
        }
    }
};

// Экспорт для использования
console.log('📦 Модуль навигации загружен');
