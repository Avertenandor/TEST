import { emit } from '../../app/pubsub.js';

export default {
    async mount(root, config) {
        console.log('[FOOTER] Монтирование модуля footer');
        
        // Загружаем шаблон
        const response = await fetch('./modules/footer/template.html');
        const template = await response.text();
        
        // Вставляем шаблон в корневой элемент
        root.innerHTML = template;
        
        // Инициализируем функциональность
        this.initFooter(root);
        
        console.log('[FOOTER] Модуль footer успешно смонтирован');
        
        // Возвращаем функцию размонтирования
        return () => {
            console.log('[FOOTER] Размонтирование модуля footer');
            this.cleanup(root);
        };
    },
    
    initFooter(root) {
        // Элементы
        const socialLinks = root.querySelectorAll('.genesis-footer-social-link');
        const footerLinks = root.querySelectorAll('.genesis-footer-link');
        const newsletterForm = root.querySelector('[data-newsletter-form]');
        const scrollLinks = root.querySelectorAll('[data-scroll-to]');
        
        // Социальные сети
        socialLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const href = link.getAttribute('href');
                const platform = this.getSocialPlatform(href);
                
                this.handleSocialClick(platform, href);
            });
        });
        
        // Ссылки футера
        footerLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const action = link.getAttribute('data-action');
                if (action) {
                    e.preventDefault();
                    this.handleFooterLinkClick(action);
                }
            });
        });
        
        // Плавная прокрутка
        scrollLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                const targetId = link.getAttribute('data-scroll-to');
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    const headerHeight = document.querySelector('.genesis-header')?.offsetHeight || 80;
                    const targetPosition = targetElement.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
        
        // Newsletter форма
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleNewsletterSubmit(newsletterForm);
            });
        }
        
        // Анимация статистики при появлении в viewport
        this.initStatsAnimation(root);
        
        // Сохраняем ссылки на обработчики для очистки
        this.eventHandlers = {
            socialLinks: Array.from(socialLinks),
            footerLinks: Array.from(footerLinks),
            newsletterForm,
            scrollLinks: Array.from(scrollLinks)
        };
    },
    
    getSocialPlatform(href) {
        if (href.includes('telegram')) return 'telegram';
        if (href.includes('twitter')) return 'twitter';
        if (href.includes('discord')) return 'discord';
        if (href.includes('github')) return 'github';
        return 'unknown';
    },
    
    handleSocialClick(platform, href) {
        console.log(`[FOOTER] Клик по социальной сети: ${platform}`);
        
        // Эмитим событие для аналитики
        emit('social:click', { platform, href });
        
        // Открываем ссылку в новой вкладке
        window.open(href, '_blank', 'noopener,noreferrer');
        
        // Показываем уведомление
        const platformNames = {
            telegram: 'Telegram',
            twitter: 'Twitter',
            discord: 'Discord',
            github: 'GitHub'
        };
        
        emit('notification:show', {
            type: 'info',
            title: 'Социальная сеть',
            message: `Открыт ${platformNames[platform] || platform}`
        });
    },
    
    handleFooterLinkClick(action) {
        console.log(`[FOOTER] Клик по ссылке футера: ${action}`);
        
        // Эмитим событие для других модулей
        emit('footer:link-click', { action });
        
        // Обрабатываем различные действия
        switch (action) {
            case 'contact-support':
                emit('support:contact', { method: 'support' });
                break;
            case 'join-telegram':
                window.open('https://t.me/genesis_one_io', '_blank');
                break;
            case 'documentation':
                emit('modal:show', {
                    title: 'Документация',
                    content: 'Документация по использованию платформы GENESIS 1.1...'
                });
                break;
            case 'status':
                emit('modal:show', {
                    title: 'Статус системы',
                    content: 'Все системы работают в штатном режиме. Uptime: 99.9%'
                });
                break;
            case 'terms':
                emit('modal:show', {
                    title: 'Условия использования',
                    content: 'Условия использования платформы GENESIS 1.1...'
                });
                break;
            case 'privacy':
                emit('modal:show', {
                    title: 'Политика конфиденциальности',
                    content: 'Политика конфиденциальности платформы GENESIS 1.1...'
                });
                break;
            case 'cookies':
                emit('modal:show', {
                    title: 'Политика cookies',
                    content: 'Политика использования cookies на платформе GENESIS 1.1...'
                });
                break;
            case 'disclaimer':
                emit('modal:show', {
                    title: 'Отказ от ответственности',
                    content: 'Отказ от ответственности платформы GENESIS 1.1...'
                });
                break;
            case 'about':
                emit('modal:show', {
                    title: 'О нас',
                    content: 'Информация о компании GENESIS 1.1...'
                });
                break;
            case 'team':
                emit('modal:show', {
                    title: 'Команда',
                    content: 'Наша команда разработчиков и специалистов...'
                });
                break;
            case 'careers':
                emit('modal:show', {
                    title: 'Карьера',
                    content: 'Вакансии в компании GENESIS 1.1...'
                });
                break;
            case 'press':
                emit('modal:show', {
                    title: 'Пресс-релизы',
                    content: 'Последние новости и пресс-релизы компании...'
                });
                break;
        }
    },
    
    handleNewsletterSubmit(form) {
        const emailInput = form.querySelector('.genesis-footer-newsletter-input');
        const email = emailInput.value.trim();
        
        if (!email) {
            emit('notification:show', {
                type: 'error',
                title: 'Ошибка',
                message: 'Пожалуйста, введите email адрес'
            });
            return;
        }
        
        if (!this.isValidEmail(email)) {
            emit('notification:show', {
                type: 'error',
                title: 'Ошибка',
                message: 'Пожалуйста, введите корректный email адрес'
            });
            return;
        }
        
        console.log('[FOOTER] Подписка на newsletter:', email);
        
        // Эмитим событие для других модулей
        emit('newsletter:subscribe', { email });
        
        // Показываем уведомление об успехе
        emit('notification:show', {
            type: 'success',
            title: 'Подписка оформлена',
            message: 'Спасибо за подписку! Вы будете получать последние новости и обновления.'
        });
        
        // Очищаем форму
        emailInput.value = '';
        
        // Блокируем повторную отправку
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Подписано!';
            
            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<span class="genesis-btn-text">Подписаться</span>';
            }, 3000);
        }
    },
    
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    initStatsAnimation(root) {
        const stats = root.querySelectorAll('.genesis-footer-stat-number');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        stats.forEach(stat => {
            observer.observe(stat);
        });
    },
    
    animateCounter(element) {
        const finalValue = element.textContent;
        const isCurrency = finalValue.includes('$');
        const isPlus = finalValue.includes('+');
        const isPercent = finalValue.includes('%');
        
        // Извлекаем числовое значение
        let numericValue = parseFloat(finalValue.replace(/[$,+%]/g, ''));
        if (isNaN(numericValue)) return;
        
        // Анимация счетчика
        let currentValue = 0;
        const increment = numericValue / 30;
        const duration = 1500;
        const stepTime = duration / 30;
        
        const timer = setInterval(() => {
            currentValue += increment;
            if (currentValue >= numericValue) {
                currentValue = numericValue;
                clearInterval(timer);
            }
            
            // Форматируем значение
            let displayValue = Math.floor(currentValue);
            if (isCurrency) {
                displayValue = '$' + displayValue.toLocaleString();
            } else if (isPercent) {
                displayValue = displayValue.toFixed(1) + '%';
            } else {
                displayValue = displayValue.toLocaleString();
            }
            
            if (isPlus) {
                displayValue += '+';
            }
            
            element.textContent = displayValue;
        }, stepTime);
    },
    
    cleanup(root) {
        // Удаляем обработчики событий
        if (this.eventHandlers) {
            const { socialLinks, footerLinks, newsletterForm, scrollLinks } = this.eventHandlers;
            
            socialLinks.forEach(link => {
                link.removeEventListener('click', this.eventHandlers.socialClick);
            });
            
            footerLinks.forEach(link => {
                link.removeEventListener('click', this.eventHandlers.footerClick);
            });
            
            if (newsletterForm) {
                newsletterForm.removeEventListener('submit', this.eventHandlers.newsletterSubmit);
            }
            
            scrollLinks.forEach(link => {
                link.removeEventListener('click', this.eventHandlers.scrollClick);
            });
        }
        
        // Очищаем содержимое
        root.innerHTML = '';
    }
};