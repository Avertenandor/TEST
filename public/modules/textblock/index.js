import { emit } from '../../app/pubsub.js';

export default {
    async mount(root, config) {
        console.log('[TEXTBLOCK] Монтирование модуля textblock');
        
        // Загружаем шаблон
        const response = await fetch('/modules/textblock/template.html');
        const template = await response.text();
        
        // Вставляем шаблон в корневой элемент
        root.innerHTML = template;
        
        // Инициализируем функциональность
        this.initTextblock(root);
        
        console.log('[TEXTBLOCK] Модуль textblock успешно смонтирован');
        
        // Возвращаем функцию размонтирования
        return () => {
            console.log('[TEXTBLOCK] Размонтирование модуля textblock');
            this.cleanup(root);
        };
    },
    
    initTextblock(root) {
        // Элементы
        const startBtn = root.querySelector('[data-action="start-now"]');
        const learnBtn = root.querySelector('[data-action="learn-more"]');
        const items = root.querySelectorAll('.genesis-textblock-item');
        
        // Кнопка "Начать сейчас"
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                emit('auth:open', { type: 'register' });
            });
        }
        
        // Кнопка "Узнать больше"
        if (learnBtn) {
            learnBtn.addEventListener('click', () => {
                // Плавная прокрутка к секции FAQ
                const faqSection = document.getElementById('faq');
                if (faqSection) {
                    const headerHeight = document.querySelector('.genesis-header')?.offsetHeight || 80;
                    const targetPosition = faqSection.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        }
        
        // Анимация элементов при появлении в viewport
        const animateItems = () => {
            items.forEach((item, index) => {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            // Добавляем задержку для последовательной анимации
                            setTimeout(() => {
                                item.style.opacity = '1';
                                item.style.transform = 'translateY(0)';
                            }, index * 200);
                            observer.unobserve(entry.target);
                        }
                    });
                }, { threshold: 0.3 });
                
                observer.observe(item);
                
                // Изначально скрываем элементы
                item.style.opacity = '0';
                item.style.transform = 'translateY(30px)';
                item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            });
        };
        
        // Анимация CTA секции
        const animateCTA = () => {
            const cta = root.querySelector('.genesis-textblock-cta');
            if (cta) {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            setTimeout(() => {
                                cta.style.opacity = '1';
                                cta.style.transform = 'translateY(0)';
                            }, 800); // Задержка после анимации элементов
                            observer.unobserve(entry.target);
                        }
                    });
                }, { threshold: 0.3 });
                
                observer.observe(cta);
                
                // Изначально скрываем CTA
                cta.style.opacity = '0';
                cta.style.transform = 'translateY(30px)';
                cta.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            }
        };
        
        // Интерактивность элементов
        items.forEach((item, index) => {
            // Эффект при наведении
            item.addEventListener('mouseenter', () => {
                const number = item.querySelector('.genesis-textblock-number');
                if (number) {
                    number.style.transform = 'scale(1.1)';
                }
            });
            
            item.addEventListener('mouseleave', () => {
                const number = item.querySelector('.genesis-textblock-number');
                if (number) {
                    number.style.transform = 'scale(1)';
                }
            });
            
            // Клик по элементу
            item.addEventListener('click', () => {
                this.handleItemClick(index + 1);
            });
        });
        
        // Запускаем анимации
        animateItems();
        animateCTA();
        
        // Сохраняем ссылки на обработчики для очистки
        this.eventHandlers = {
            startBtn,
            learnBtn,
            items: Array.from(items)
        };
    },
    
    handleItemClick(stepNumber) {
        console.log(`[TEXTBLOCK] Клик по шагу: ${stepNumber}`);
        
        // Эмитим событие для других модулей
        emit('textblock:step-click', { step: stepNumber });
        
        // Показываем дополнительную информацию о шаге
        const stepInfo = {
            1: {
                title: 'Регистрация',
                content: 'Простая регистрация через кошелек MetaMask или email. Подтверждение email и настройка двухфакторной аутентификации для безопасности.'
            },
            2: {
                title: 'Пополнение',
                content: 'Пополнение баланса в USDT (BEP-20) или покупка PLEX ONE токенов. Минимальная сумма депозита $25, максимальная $2500.'
            },
            3: {
                title: 'Выбор плана',
                content: 'Выбор подходящего плана депозита или активация аренды MEV-ботов. 14 различных планов с разными условиями и доходностью.'
            },
            4: {
                title: 'Заработок',
                content: 'Автоматические выплаты каждые 24 часа. Мониторинг доходности в реальном времени через личный кабинет.'
            }
        };
        
        const info = stepInfo[stepNumber];
        if (info) {
            emit('modal:show', {
                title: info.title,
                content: info.content
            });
        }
    },
    
    cleanup(root) {
        // Удаляем обработчики событий
        if (this.eventHandlers) {
            const { startBtn, learnBtn, items } = this.eventHandlers;
            
            if (startBtn) {
                startBtn.removeEventListener('click', this.eventHandlers.startClick);
            }
            
            if (learnBtn) {
                learnBtn.removeEventListener('click', this.eventHandlers.learnClick);
            }
            
            items.forEach(item => {
                item.removeEventListener('mouseenter', this.eventHandlers.mouseEnter);
                item.removeEventListener('mouseleave', this.eventHandlers.mouseLeave);
                item.removeEventListener('click', this.eventHandlers.itemClick);
            });
        }
        
        // Очищаем содержимое
        root.innerHTML = '';
    }
};
