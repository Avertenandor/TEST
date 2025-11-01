import { emit } from '../../../app/pubsub.js';

export default {
    async mount(root, config) {
        console.log('[CABINET/SHELL] Монтирование модуля cabinet/shell');
        
        const response = await fetch('/public/modules/cabinet/shell/template.html');
        const template = await response.text();
        root.innerHTML = template;
        
        this.initShell(root);
        
        console.log('[CABINET/SHELL] Модуль cabinet/shell успешно смонтирован');
        
        return () => {
            console.log('[CABINET/SHELL] Размонтирование модуля cabinet/shell');
            this.cleanup(root);
        };
    },
    
    initShell(root) {
        const navLinks = root.querySelectorAll('.genesis-cabinet-nav-link');
        const menuBtn = root.querySelector('[data-action="toggle-sidebar"]');
        const logoutBtn = root.querySelector('[data-action="logout"]');
        const notificationsBtn = root.querySelector('[data-action="notifications"]');
        const contentArea = root.querySelector('[data-content-area]');
        
        // Навигация
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                this.switchSection(section, link);
            });
        });
        
        // Мобильное меню
        if (menuBtn) {
            menuBtn.addEventListener('click', () => {
                const sidebar = root.querySelector('.genesis-cabinet-sidebar');
                sidebar.classList.toggle('open');
            });
        }
        
        // Выход
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.handleLogout();
            });
        }
        
        // Уведомления
        if (notificationsBtn) {
            notificationsBtn.addEventListener('click', () => {
                this.handleNotifications();
            });
        }
        
        // Загружаем дашборд по умолчанию
        this.loadSection('dashboard', contentArea);
        
        // Слушаем события от других модулей
        this.listenToEvents();
    },
    
    switchSection(section, activeLink) {
        // Обновляем активную ссылку
        const allLinks = document.querySelectorAll('.genesis-cabinet-nav-link');
        allLinks.forEach(link => link.classList.remove('genesis-cabinet-nav-link-active'));
        activeLink.classList.add('genesis-cabinet-nav-link-active');
        
        // Обновляем заголовок страницы
        const pageTitle = document.querySelector('.genesis-cabinet-page-title');
        if (pageTitle) {
            const titles = {
                dashboard: 'Дашборд',
                profile: 'Профиль',
                balances: 'Балансы',
                deposits: 'Депозиты',
                rewards: 'Награды',
                referrals: 'Рефералы',
                transactions: 'Транзакции',
                settings: 'Настройки'
            };
            pageTitle.textContent = titles[section] || 'Страница';
        }
        
        // Закрываем мобильное меню
        const sidebar = document.querySelector('.genesis-cabinet-sidebar');
        if (sidebar) {
            sidebar.classList.remove('open');
        }
        
        // Загружаем контент секции
        const contentArea = document.querySelector('[data-content-area]');
        if (contentArea) {
            this.loadSection(section, contentArea);
        }
        
        // Эмитим событие
        emit('cabinet:section-change', { section });
    },
    
    async loadSection(section, contentArea) {
        try {
            // Показываем загрузку
            contentArea.innerHTML = `
                <div class="genesis-cabinet-loading">
                    <div class="genesis-cabinet-loading-spinner"></div>
                    <p>Загрузка ${section}...</p>
                </div>
            `;
            
            // Загружаем модуль секции
            const modulePath = `./modules/cabinet/${section}/index.js`;
            const module = await import(modulePath);
            
            // Создаем контейнер для модуля
            const moduleContainer = document.createElement('div');
            moduleContainer.setAttribute('data-module', `cabinet/${section}`);
            contentArea.innerHTML = '';
            contentArea.appendChild(moduleContainer);
            
            // Монтируем модуль
            await module.default.mount(moduleContainer, {});
            
        } catch (error) {
            console.error(`[CABINET/SHELL] Ошибка загрузки секции ${section}:`, error);
            
            // Показываем ошибку
            contentArea.innerHTML = `
                <div class="genesis-cabinet-error">
                    <h3>Ошибка загрузки</h3>
                    <p>Не удалось загрузить раздел "${section}". Попробуйте обновить страницу.</p>
                    <button class="genesis-btn genesis-btn-primary" onclick="location.reload()">
                        Обновить страницу
                    </button>
                </div>
            `;
        }
    },
    
    handleLogout() {
        if (confirm('Вы уверены, что хотите выйти из аккаунта?')) {
            emit('auth:logout', {});
            
            // Перенаправляем на главную страницу
            setTimeout(() => {
                window.location.href = '/';
            }, 1000);
        }
    },
    
    handleNotifications() {
        emit('notifications:show', {});
        
        // Показываем модальное окно с уведомлениями
        emit('modal:show', {
            title: 'Уведомления',
            content: `
                <div class="notifications-list">
                    <div class="notification-item">
                        <span class="notification-icon">💰</span>
                        <div class="notification-content">
                            <h4>Новый депозит</h4>
                            <p>Ваш депозит на $100 успешно создан</p>
                            <span class="notification-time">2 минуты назад</span>
                        </div>
                    </div>
                    <div class="notification-item">
                        <span class="notification-icon">🎁</span>
                        <div class="notification-content">
                            <h4>Бонус получен</h4>
                            <p>Вы получили бонус за активность</p>
                            <span class="notification-time">1 час назад</span>
                        </div>
                    </div>
                    <div class="notification-item">
                        <span class="notification-icon">👥</span>
                        <div class="notification-content">
                            <h4>Новый реферал</h4>
                            <p>К вам присоединился новый реферал</p>
                            <span class="notification-time">3 часа назад</span>
                        </div>
                    </div>
                </div>
            `
        });
    },
    
    listenToEvents() {
        // Слушаем события авторизации
        document.addEventListener('auth:logout', () => {
            console.log('[CABINET/SHELL] Пользователь вышел из системы');
        });
        
        // Слушаем события уведомлений
        document.addEventListener('notifications:update', (e) => {
            const badge = document.querySelector('.genesis-cabinet-notifications-badge');
            if (badge) {
                badge.textContent = e.detail.count || '0';
            }
        });
    },
    
    cleanup(root) {
        root.innerHTML = '';
    }
};