import { emit } from '../../app/pubsub.js';

export default {
    async mount(root, config) {
        console.log('[HERO] Монтирование модуля hero');
        
        // Загружаем шаблон
        const response = await fetch('/public/modules/hero/template.html');
        const template = await response.text();
        
        // Вставляем шаблон в корневой элемент
        root.innerHTML = template;
        
        // Инициализируем функциональность
        this.initHero(root);
        
        console.log('[HERO] Модуль hero успешно смонтирован');
        
        // Возвращаем функцию размонтирования
        return () => {
            console.log('[HERO] Размонтирование модуля hero');
            this.cleanup(root);
        };
    },
    
    initHero(root) {
        // Элементы
        const startBtn = root.querySelector('[data-action="start-earning"]');
        const learnBtn = root.querySelector('[data-action="learn-more"]');
        const terminalBtn = root.querySelector('[data-action="open-terminal"]');
        const stats = root.querySelectorAll('.genesis-hero-stat');
        const card = root.querySelector('.genesis-hero-card');
        
        // Кнопка "Начать зарабатывать"
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                emit('auth:open', { type: 'register' });
            });
        }
        
        // Кнопка "Открыть терминал"
        if (terminalBtn) {
            terminalBtn.addEventListener('click', () => {
                this.openTerminal();
            });
        }
        
        // Кнопка "Узнать больше"
        if (learnBtn) {
            learnBtn.addEventListener('click', () => {
                // Плавная прокрутка к секции features
                const featuresSection = document.getElementById('features');
                if (featuresSection) {
                    const headerHeight = document.querySelector('.genesis-header')?.offsetHeight || 80;
                    const targetPosition = featuresSection.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        }
        
        // Анимация статистики при появлении в viewport
        const animateStats = () => {
            stats.forEach((stat, index) => {
                const numberElement = stat.querySelector('.genesis-hero-stat-number');
                if (numberElement) {
                    const finalValue = numberElement.textContent;
                    const isCurrency = finalValue.includes('$');
                    const isPlus = finalValue.includes('+');
                    
                    // Извлекаем числовое значение
                    let numericValue = parseFloat(finalValue.replace(/[$,+]/g, ''));
                    if (isNaN(numericValue)) return;
                    
                    // Анимация счетчика
                    let currentValue = 0;
                    const increment = numericValue / 50; // 50 шагов анимации
                    const duration = 2000; // 2 секунды
                    const stepTime = duration / 50;
                    
                    const timer = setInterval(() => {
                        currentValue += increment;
                        if (currentValue >= numericValue) {
                            currentValue = numericValue;
                            clearInterval(timer);
                        }
                        
                        // Форматируем значение
                        let displayValue = Math.floor(currentValue);
                        if (isCurrency) {
                            displayValue = '$' + displayValue.toLocaleString() + (finalValue.includes('K') ? 'K' : finalValue.includes('M') ? 'M' : '');
                        } else {
                            displayValue = displayValue.toLocaleString() + (finalValue.includes('+') ? '+' : '');
                        }
                        
                        numberElement.textContent = displayValue;
                    }, stepTime);
                }
            });
        };
        
        // Intersection Observer для анимации статистики
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateStats();
                    statsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        const statsContainer = root.querySelector('.genesis-hero-stats');
        if (statsContainer) {
            statsObserver.observe(statsContainer);
        }
        
        // Анимация карточки токена
        if (card) {
            const priceElement = card.querySelector('.genesis-hero-card-price-value');
            const changeElement = card.querySelector('.genesis-hero-card-change-value');
            
            if (priceElement && changeElement) {
                // Симуляция изменения цены
                let currentPrice = 0.85;
                let currentChange = 12.5;
                
                const updatePrice = () => {
                    // Случайное изменение цены
                    const change = (Math.random() - 0.5) * 0.1; // ±5%
                    currentPrice = Math.max(0.1, currentPrice + change);
                    currentChange = ((change / (currentPrice - change)) * 100);
                    
                    // Обновляем отображение
                    priceElement.textContent = '$' + currentPrice.toFixed(2);
                    changeElement.textContent = (currentChange > 0 ? '+' : '') + currentChange.toFixed(1) + '%';
                    
                    // Обновляем стили
                    const changeContainer = changeElement.closest('.genesis-hero-card-change');
                    if (changeContainer) {
                        changeContainer.className = 'genesis-hero-card-change ' + 
                            (currentChange > 0 ? 'genesis-hero-card-change-positive' : 'genesis-hero-card-change-negative');
                    }
                };
                
                // Обновляем цену каждые 5 секунд
                setInterval(updatePrice, 5000);
            }
        }
        
        // Эффект параллакса для фоновых элементов
        const bgElements = root.querySelectorAll('.genesis-hero-bg-element');
        
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            
            bgElements.forEach((element, index) => {
                const speed = 0.5 + (index * 0.2);
                element.style.transform = `translateY(${rate * speed}px)`;
            });
        });
        
        // Сохраняем ссылки на обработчики для очистки
        this.eventHandlers = {
            startBtn,
            learnBtn,
            terminalBtn,
            stats: Array.from(stats)
        };
    },
    
    openTerminal() {
        console.log('[HERO] Открытие терминала');
        
        // Эмитим событие для других модулей
        emit('terminal:open', { source: 'hero' });
        
        // Плавная прокрутка к терминалу
        const terminalSection = document.getElementById('terminal');
        if (terminalSection) {
            const headerHeight = document.querySelector('.genesis-header')?.offsetHeight || 80;
            const targetPosition = terminalSection.offsetTop - headerHeight - 20;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
            
            // Разворачиваем терминал если он свернут
            setTimeout(() => {
                const terminalWidget = terminalSection.querySelector('.genesis-terminal-widget');
                const toggleBtn = terminalSection.querySelector('[data-action="toggle-terminal"]');
                
                if (terminalWidget && terminalWidget.classList.contains('collapsed') && toggleBtn) {
                    // Эмулируем клик по кнопке разворачивания
                    toggleBtn.click();
                }
            }, 1000);
        }
    },
    
    cleanup(root) {
        // Удаляем обработчики событий
        if (this.eventHandlers) {
            const { startBtn, learnBtn, statsObserver, scrollHandler } = this.eventHandlers;
            
            if (startBtn) {
                startBtn.removeEventListener('click', this.eventHandlers.startClick);
            }
            
            if (learnBtn) {
                learnBtn.removeEventListener('click', this.eventHandlers.learnClick);
            }
            
            if (statsObserver) {
                statsObserver.disconnect();
            }
            
            window.removeEventListener('scroll', scrollHandler);
        }
        
        // Очищаем содержимое
        root.innerHTML = '';
    }
};