import { emit } from '../../app/pubsub.js';

export default {
    async mount(root, config) {
        console.log('[FEATURES] Монтирование модуля features');
        
        // Загружаем шаблон
        const response = await fetch('./modules/features/template.html');
        const template = await response.text();
        
        // Вставляем шаблон в корневой элемент
        root.innerHTML = template;
        
        // Инициализируем функциональность
        this.initFeatures(root);
        
        console.log('[FEATURES] Модуль features успешно смонтирован');
        
        // Возвращаем функцию размонтирования
        return () => {
            console.log('[FEATURES] Размонтирование модуля features');
            this.cleanup(root);
        };
    },
    
    initFeatures(root) {
        // Элементы
        const featureCards = root.querySelectorAll('.genesis-feature-card');
        const extraItems = root.querySelectorAll('.genesis-feature-extra-item');
        
        // Анимация появления карточек при скролле
        const animateCards = () => {
            featureCards.forEach((card, index) => {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            // Добавляем задержку для последовательной анимации
                            setTimeout(() => {
                                card.style.opacity = '1';
                                card.style.transform = 'translateY(0)';
                            }, index * 200);
                            observer.unobserve(entry.target);
                        }
                    });
                }, { threshold: 0.3 });
                
                observer.observe(card);
                
                // Изначально скрываем карточки
                card.style.opacity = '0';
                card.style.transform = 'translateY(30px)';
                card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            });
        };
        
        // Анимация дополнительных элементов
        const animateExtraItems = () => {
            extraItems.forEach((item, index) => {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            setTimeout(() => {
                                item.style.opacity = '1';
                                item.style.transform = 'translateX(0)';
                            }, index * 150);
                            observer.unobserve(entry.target);
                        }
                    });
                }, { threshold: 0.3 });
                
                observer.observe(item);
                
                // Изначально скрываем элементы
                item.style.opacity = '0';
                item.style.transform = 'translateX(-30px)';
                item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            });
        };
        
        // Интерактивность карточек
        featureCards.forEach(card => {
            // Эффект при наведении
            card.addEventListener('mouseenter', () => {
                const icon = card.querySelector('.genesis-feature-icon');
                if (icon) {
                    icon.style.transform = 'scale(1.1) rotate(5deg)';
                }
            });
            
            card.addEventListener('mouseleave', () => {
                const icon = card.querySelector('.genesis-feature-icon');
                if (icon) {
                    icon.style.transform = 'scale(1) rotate(0deg)';
                }
            });
            
            // Клик по карточке
            card.addEventListener('click', () => {
                const feature = card.getAttribute('data-feature');
                this.handleFeatureClick(feature);
            });
        });
        
        // Интерактивность дополнительных элементов
        extraItems.forEach(item => {
            item.addEventListener('click', () => {
                const title = item.querySelector('h4').textContent;
                this.handleExtraItemClick(title);
            });
        });
        
        // Анимация статистики при появлении в viewport
        const animateStats = () => {
            const stats = root.querySelectorAll('.genesis-feature-stat-value');
            
            stats.forEach(stat => {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            this.animateCounter(stat);
                            observer.unobserve(entry.target);
                        }
                    });
                }, { threshold: 0.5 });
                
                observer.observe(stat);
            });
        };
        
        // Запускаем анимации
        animateCards();
        animateExtraItems();
        animateStats();
        
        // Сохраняем ссылки на обработчики для очистки
        this.eventHandlers = {
            featureCards: Array.from(featureCards),
            extraItems: Array.from(extraItems)
        };
    },
    
    handleFeatureClick(feature) {
        console.log(`[FEATURES] Клик по возможности: ${feature}`);
        
        // Эмитим событие для других модулей
        emit('features:click', { feature });
        
        // Показываем дополнительную информацию
        switch (feature) {
            case 'passive':
                emit('modal:show', {
                    title: 'Пассивный доход',
                    content: 'Подробная информация о пассивных источниках дохода...'
                });
                break;
            case 'active':
                emit('modal:show', {
                    title: 'Активный доход',
                    content: 'Информация об активных способах заработка...'
                });
                break;
            case 'security':
                emit('modal:show', {
                    title: 'Безопасность',
                    content: 'Детали системы безопасности платформы...'
                });
                break;
            case 'convenience':
                emit('modal:show', {
                    title: 'Удобство использования',
                    content: 'Особенности интерфейса и функциональности...'
                });
                break;
        }
    },
    
    handleExtraItemClick(title) {
        console.log(`[FEATURES] Клик по дополнительному элементу: ${title}`);
        
        emit('features:extra-click', { title });
        
        // Показываем детальную информацию
        emit('modal:show', {
            title: title,
            content: `Подробная информация о ${title.toLowerCase()}...`
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
        const increment = numericValue / 30; // 30 шагов анимации
        const duration = 1500; // 1.5 секунды
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
            const { featureCards, extraItems } = this.eventHandlers;
            
            featureCards.forEach(card => {
                card.removeEventListener('mouseenter', this.eventHandlers.mouseEnter);
                card.removeEventListener('mouseleave', this.eventHandlers.mouseLeave);
                card.removeEventListener('click', this.eventHandlers.cardClick);
            });
            
            extraItems.forEach(item => {
                item.removeEventListener('click', this.eventHandlers.extraClick);
            });
        }
        
        // Очищаем содержимое
        root.innerHTML = '';
    }
};