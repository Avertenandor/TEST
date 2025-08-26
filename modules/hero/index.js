/**
 * Hero Module
 * Модуль главного баннера
 */

class HeroModule {
    constructor() {
        this.name = 'hero';
        this.version = '1.0.0';
        this.isLoaded = false;
        this.currentSlide = 0;
        this.slides = [];
        this.autoPlayInterval = null;
    }

    async init() {
        try {
            console.log('🚀 Инициализация модуля Hero...');
            
            // Загрузка стилей
            await this.loadStyles();
            
            // Загрузка шаблона
            await this.loadTemplate();
            
            // Инициализация компонентов
            this.initComponents();
            
            // Запуск анимаций
            this.startAnimations();
            
            // Подписка на события
            this.subscribeToEvents();
            
            this.isLoaded = true;
            console.log('✅ Модуль Hero успешно инициализирован');
            
            // Уведомляем систему о готовности
            window.dispatchEvent(new CustomEvent('module:loaded', {
                detail: { module: this.name, version: this.version }
            }));
            
        } catch (error) {
            console.error('❌ Ошибка инициализации модуля Hero:', error);
            throw error;
        }
    }

    async loadStyles() {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/modules/hero/style.css';
        link.onload = () => console.log('📦 Стили Hero загружены');
        link.onerror = () => console.warn('⚠️ Не удалось загрузить стили Hero');
        document.head.appendChild(link);
    }

    async loadTemplate() {
        try {
            const response = await fetch('/modules/hero/template.html');
            const template = await response.text();
            
            // Вставляем шаблон в контейнер
            const container = document.getElementById('hero-container') || 
                            document.querySelector('[data-module="hero"]');
            
            if (container) {
                container.innerHTML = template;
                console.log('📄 Шаблон Hero загружен');
            } else {
                console.warn('⚠️ Контейнер для Hero не найден');
            }
        } catch (error) {
            console.error('❌ Ошибка загрузки шаблона Hero:', error);
        }
    }

    initComponents() {
        // Инициализация слайдера
        this.initSlider();
        
        // Инициализация кнопок действий
        this.initActionButtons();
        
        // Инициализация счетчиков
        this.initCounters();
        
        // Инициализация анимаций
        this.initAnimations();
    }

    initSlider() {
        const slider = document.querySelector('.hero-slider');
        if (!slider) return;

        this.slides = slider.querySelectorAll('.hero-slide');
        
        if (this.slides.length > 1) {
            // Создаем индикаторы
            this.createIndicators();
            
            // Запускаем автопрокрутку
            this.startAutoPlay();
            
            // Обработчики для кнопок навигации
            const prevBtn = slider.querySelector('.slider-prev');
            const nextBtn = slider.querySelector('.slider-next');
            
            if (prevBtn) {
                prevBtn.addEventListener('click', () => this.prevSlide());
            }
            
            if (nextBtn) {
                nextBtn.addEventListener('click', () => this.nextSlide());
            }
        }
    }

    createIndicators() {
        const indicatorsContainer = document.querySelector('.slider-indicators');
        if (!indicatorsContainer) return;

        this.slides.forEach((_, index) => {
            const indicator = document.createElement('button');
            indicator.className = 'slider-indicator';
            indicator.setAttribute('data-slide', index);
            indicator.addEventListener('click', () => this.goToSlide(index));
            indicatorsContainer.appendChild(indicator);
        });

        this.updateIndicators();
    }

    updateIndicators() {
        const indicators = document.querySelectorAll('.slider-indicator');
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentSlide);
        });
    }

    goToSlide(index) {
        if (index < 0 || index >= this.slides.length) return;
        
        this.slides[this.currentSlide].classList.remove('active');
        this.currentSlide = index;
        this.slides[this.currentSlide].classList.add('active');
        
        this.updateIndicators();
        this.resetAutoPlay();
    }

    nextSlide() {
        const nextIndex = (this.currentSlide + 1) % this.slides.length;
        this.goToSlide(nextIndex);
    }

    prevSlide() {
        const prevIndex = this.currentSlide === 0 ? this.slides.length - 1 : this.currentSlide - 1;
        this.goToSlide(prevIndex);
    }

    startAutoPlay() {
        this.autoPlayInterval = setInterval(() => {
            this.nextSlide();
        }, 5000);
    }

    resetAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.startAutoPlay();
        }
    }

    initActionButtons() {
        const ctaButtons = document.querySelectorAll('.hero-cta');
        
        ctaButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                
                const action = button.getAttribute('data-action');
                const href = button.getAttribute('href');
                
                // Аналитика
                this.trackCTA(action);
                
                // Выполнение действия
                this.executeAction(action, href);
            });
        });
    }

    trackCTA(action) {
        // Отправка аналитики
        if (typeof gtag !== 'undefined') {
            gtag('event', 'click', {
                'event_category': 'hero_cta',
                'event_label': action
            });
        }
        
        // Уведомляем другие модули
        window.dispatchEvent(new CustomEvent('hero:cta_clicked', {
            detail: { action }
        }));
    }

    executeAction(action, href) {
        switch (action) {
            case 'register':
                window.location.href = '/register';
                break;
            case 'learn_more':
                document.querySelector('#features').scrollIntoView({ 
                    behavior: 'smooth' 
                });
                break;
            case 'demo':
                this.showDemo();
                break;
            default:
                if (href) {
                    window.location.href = href;
                }
        }
    }

    showDemo() {
        // Показываем демо-модал или переходим к демо-странице
        window.dispatchEvent(new CustomEvent('demo:show'));
    }

    initCounters() {
        const counters = document.querySelectorAll('.hero-counter');
        
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'));
            const duration = 2000; // 2 секунды
            const step = target / (duration / 16); // 60 FPS
            let current = 0;
            
            const updateCounter = () => {
                current += step;
                if (current < target) {
                    counter.textContent = Math.floor(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target;
                }
            };
            
            // Запускаем анимацию при появлении в viewport
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        updateCounter();
                        observer.unobserve(entry.target);
                    }
                });
            });
            
            observer.observe(counter);
        });
    }

    initAnimations() {
        // Анимация появления элементов
        const animatedElements = document.querySelectorAll('.hero-animate');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, { threshold: 0.1 });
        
        animatedElements.forEach(el => observer.observe(el));
    }

    startAnimations() {
        // Запуск фоновых анимаций
        this.startBackgroundAnimation();
        this.startParticleAnimation();
    }

    startBackgroundAnimation() {
        const background = document.querySelector('.hero-background');
        if (background) {
            background.classList.add('animate');
        }
    }

    startParticleAnimation() {
        const particles = document.querySelectorAll('.particle');
        particles.forEach((particle, index) => {
            particle.style.animationDelay = `${index * 0.1}s`;
            particle.classList.add('animate');
        });
    }

    subscribeToEvents() {
        // Подписка на изменения темы
        window.addEventListener('theme:changed', (e) => {
            this.updateTheme(e.detail.theme);
        });
        
        // Подписка на события авторизации
        window.addEventListener('auth:login', () => {
            this.updateAuthState(true);
        });
        
        window.addEventListener('auth:logout', () => {
            this.updateAuthState(false);
        });
    }

    updateTheme(theme) {
        const hero = document.querySelector('.hero-module');
        if (hero) {
            hero.setAttribute('data-theme', theme);
        }
    }

    updateAuthState(isLoggedIn) {
        const authButtons = document.querySelectorAll('.auth-required');
        const guestButtons = document.querySelectorAll('.guest-only');
        
        authButtons.forEach(btn => {
            btn.style.display = isLoggedIn ? 'block' : 'none';
        });
        
        guestButtons.forEach(btn => {
            btn.style.display = isLoggedIn ? 'none' : 'block';
        });
    }

    destroy() {
        console.log('🗑️ Уничтожение модуля Hero');
        
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
        }
        
        this.isLoaded = false;
    }
}

// Экспорт модуля
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HeroModule;
} else {
    window.HeroModule = HeroModule;
}