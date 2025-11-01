import { emit } from '../../app/pubsub.js';

export default {
    async mount(root, config) {
        console.log('[HEADER] Монтирование модуля header');
        
        // Загружаем шаблон
        const response = await fetch('/public/modules/header/template.html');
        const template = await response.text();
        
        // Вставляем шаблон в корневой элемент
        root.innerHTML = template;
        
        // Инициализируем функциональность
        this.initHeader(root);

        // Устанавливаем корректный отступ под шапку
        const applyHeaderOffset = () => {
            const headerEl = root.querySelector('.genesis-header') || root;
            const h = (headerEl && headerEl.offsetHeight) ? headerEl.offsetHeight : 80;
            document.documentElement.style.setProperty('--header-height', h + 'px');
        };
        applyHeaderOffset();
        window.addEventListener('resize', applyHeaderOffset);
        
        console.log('[HEADER] Модуль header успешно смонтирован');
        
        // Возвращаем функцию размонтирования
        return () => {
            console.log('[HEADER] Размонтирование модуля header');
            this.cleanup(root);
            window.removeEventListener('resize', applyHeaderOffset);
        };
    },
    
    initHeader(root) {
        // Элементы
        const mobileMenuBtn = root.querySelector('[data-action="mobile-menu"]');
        const mobileMenu = root.querySelector('[data-mobile-menu]');
        const authBtn = root.querySelector('[data-action="auth"]');
        const registerBtn = root.querySelector('[data-action="register"]');
        const scrollLinks = root.querySelectorAll('[data-scroll-to]');
        
        // Мобильное меню
        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', () => {
                mobileMenu.classList.toggle('active');
                
                // Анимация иконки
                const icon = mobileMenuBtn.querySelector('.genesis-mobile-menu-icon');
                if (mobileMenu.classList.contains('active')) {
                    icon.style.transform = 'rotate(45deg)';
                    icon.style.background = '#4ecdc4';
                    icon.style.boxShadow = 'none';
                    
                    icon.style.transform = 'rotate(45deg) translate(5px, 5px)';
                    icon.style.background = '#4ecdc4';
                    
                    const before = icon.querySelector('::before') || icon;
                    const after = icon.querySelector('::after') || icon;
                    
                    if (before) before.style.transform = 'rotate(90deg)';
                    if (after) after.style.transform = 'rotate(90deg)';
                } else {
                    icon.style.transform = 'rotate(0deg)';
                    icon.style.background = '#ffffff';
                    
                    const before = icon.querySelector('::before') || icon;
                    const after = icon.querySelector('::after') || icon;
                    
                    if (before) before.style.transform = 'rotate(0deg)';
                    if (after) after.style.transform = 'rotate(0deg)';
                }
            });
            
            // Закрытие меню при клике на ссылку
            const mobileLinks = mobileMenu.querySelectorAll('a');
            mobileLinks.forEach(link => {
                link.addEventListener('click', () => {
                    mobileMenu.classList.remove('active');
                    const icon = mobileMenuBtn.querySelector('.genesis-mobile-menu-icon');
                    icon.style.transform = 'rotate(0deg)';
                    icon.style.background = '#ffffff';
                });
            });
        }
        
        // Кнопки авторизации и регистрации
        if (authBtn) {
            authBtn.addEventListener('click', () => {
                emit('auth:open', { type: 'login' });
            });
        }
        
        if (registerBtn) {
            registerBtn.addEventListener('click', () => {
                emit('auth:open', { type: 'register' });
            });
        }
        
        // Плавная прокрутка к секциям
        scrollLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                const targetId = link.getAttribute('data-scroll-to');
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    const headerHeight = root.offsetHeight;
                    const targetPosition = targetElement.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
        
        // Эффект прозрачности при скролле
        let lastScrollTop = 0;
        const header = root.querySelector('.genesis-header');
        
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (scrollTop > 100) {
                header.style.background = 'rgba(13, 17, 23, 0.98)';
                header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
            } else {
                header.style.background = 'rgba(13, 17, 23, 0.95)';
                header.style.boxShadow = 'none';
            }
            
            // Скрытие/показ при скролле
            if (scrollTop > lastScrollTop && scrollTop > 200) {
                header.style.transform = 'translateY(-100%)';
            } else {
                header.style.transform = 'translateY(0)';
            }
            
            lastScrollTop = scrollTop;
        });
        
        // Сохраняем ссылки на обработчики для очистки
        this.eventHandlers = {
            mobileMenuBtn,
            mobileMenu,
            authBtn,
            registerBtn,
            scrollLinks: Array.from(scrollLinks),
            scrollHandler: () => {
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                
                if (scrollTop > 100) {
                    header.style.background = 'rgba(13, 17, 23, 0.98)';
                    header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
                } else {
                    header.style.background = 'rgba(13, 17, 23, 0.95)';
                    header.style.boxShadow = 'none';
                }
                
                if (scrollTop > lastScrollTop && scrollTop > 200) {
                    header.style.transform = 'translateY(-100%)';
                } else {
                    header.style.transform = 'translateY(0)';
                }
                
                lastScrollTop = scrollTop;
            }
        };
    },
    
    cleanup(root) {
        // Удаляем обработчики событий
        if (this.eventHandlers) {
            const { mobileMenuBtn, mobileMenu, authBtn, registerBtn, scrollLinks, scrollHandler } = this.eventHandlers;
            
            if (mobileMenuBtn) {
                mobileMenuBtn.removeEventListener('click', this.eventHandlers.mobileMenuClick);
            }
            
            if (authBtn) {
                authBtn.removeEventListener('click', this.eventHandlers.authClick);
            }
            
            if (registerBtn) {
                registerBtn.removeEventListener('click', this.eventHandlers.registerClick);
            }
            
            scrollLinks.forEach(link => {
                link.removeEventListener('click', this.eventHandlers.scrollClick);
            });
            
            window.removeEventListener('scroll', scrollHandler);
        }
        
        // Очищаем содержимое
        root.innerHTML = '';
    }
};