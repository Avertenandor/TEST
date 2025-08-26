/**
 * Header Module
 * Модуль заголовка сайта
 */

class HeaderModule {
    constructor() {
        this.name = 'header';
        this.version = '1.0.0';
        this.isLoaded = false;
    }

    async init() {
        try {
            console.log('🚀 Инициализация модуля Header...');
            
            // Загрузка стилей
            await this.loadStyles();
            
            // Загрузка шаблона
            await this.loadTemplate();
            
            // Инициализация компонентов
            this.initComponents();
            
            // Подписка на события
            this.subscribeToEvents();
            
            this.isLoaded = true;
            console.log('✅ Модуль Header успешно инициализирован');
            
            // Уведомляем систему о готовности
            window.dispatchEvent(new CustomEvent('module:loaded', {
                detail: { module: this.name, version: this.version }
            }));
            
        } catch (error) {
            console.error('❌ Ошибка инициализации модуля Header:', error);
            throw error;
        }
    }

    async loadStyles() {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/modules/header/style.css';
        link.onload = () => console.log('📦 Стили Header загружены');
        link.onerror = () => console.warn('⚠️ Не удалось загрузить стили Header');
        document.head.appendChild(link);
    }

    async loadTemplate() {
        try {
            const response = await fetch('/modules/header/template.html');
            const template = await response.text();
            
            // Вставляем шаблон в контейнер
            const container = document.getElementById('header-container') || 
                            document.querySelector('[data-module="header"]');
            
            if (container) {
                container.innerHTML = template;
                console.log('📄 Шаблон Header загружен');
            } else {
                console.warn('⚠️ Контейнер для Header не найден');
            }
        } catch (error) {
            console.error('❌ Ошибка загрузки шаблона Header:', error);
        }
    }

    initComponents() {
        // Инициализация навигации
        this.initNavigation();
        
        // Инициализация мобильного меню
        this.initMobileMenu();
        
        // Инициализация поиска
        this.initSearch();
    }

    initNavigation() {
        const nav = document.querySelector('.header-nav');
        if (nav) {
            // Обработка активных ссылок
            const links = nav.querySelectorAll('a');
            links.forEach(link => {
                link.addEventListener('click', (e) => {
                    links.forEach(l => l.classList.remove('active'));
                    link.classList.add('active');
                });
            });
        }
    }

    initMobileMenu() {
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        const mobileMenu = document.querySelector('.mobile-menu');
        
        if (mobileToggle && mobileMenu) {
            mobileToggle.addEventListener('click', () => {
                mobileMenu.classList.toggle('active');
                mobileToggle.classList.toggle('active');
            });
        }
    }

    initSearch() {
        const searchInput = document.querySelector('.header-search input');
        const searchResults = document.querySelector('.search-results');
        
        if (searchInput) {
            let searchTimeout;
            
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.performSearch(e.target.value);
                }, 300);
            });
        }
    }

    async performSearch(query) {
        if (query.length < 2) return;
        
        try {
            // Здесь будет логика поиска
            console.log('🔍 Поиск:', query);
            
            // Уведомляем другие модули о поиске
            window.dispatchEvent(new CustomEvent('search:performed', {
                detail: { query }
            }));
        } catch (error) {
            console.error('❌ Ошибка поиска:', error);
        }
    }

    subscribeToEvents() {
        // Подписка на события авторизации
        window.addEventListener('auth:login', () => {
            this.updateAuthState(true);
        });
        
        window.addEventListener('auth:logout', () => {
            this.updateAuthState(false);
        });
        
        // Подписка на изменения темы
        window.addEventListener('theme:changed', (e) => {
            this.updateTheme(e.detail.theme);
        });
    }

    updateAuthState(isLoggedIn) {
        const authElements = document.querySelectorAll('.auth-required');
        const guestElements = document.querySelectorAll('.guest-only');
        
        authElements.forEach(el => {
            el.style.display = isLoggedIn ? 'block' : 'none';
        });
        
        guestElements.forEach(el => {
            el.style.display = isLoggedIn ? 'none' : 'block';
        });
    }

    updateTheme(theme) {
        document.body.setAttribute('data-theme', theme);
    }

    destroy() {
        console.log('🗑️ Уничтожение модуля Header');
        this.isLoaded = false;
    }
}

// Экспорт модуля
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HeaderModule;
} else {
    window.HeaderModule = HeaderModule;
}