import { emit } from '../../app/pubsub.js';

export default {
    async mount(root, config) {
        console.log('[FAQ] Монтирование модуля faq');
        
        // Загружаем шаблон
        const response = await fetch('./modules/faq/template.html');
        const template = await response.text();
        
        // Вставляем шаблон в корневой элемент
        root.innerHTML = template;
        
        // Инициализируем функциональность
        this.initFAQ(root);
        
        console.log('[FAQ] Модуль faq успешно смонтирован');
        
        // Возвращаем функцию размонтирования
        return () => {
            console.log('[FAQ] Размонтирование модуля faq');
            this.cleanup(root);
        };
    },
    
    initFAQ(root) {
        // Элементы
        const faqItems = root.querySelectorAll('[data-faq-item]');
        const supportBtn = root.querySelector('[data-action="contact-support"]');
        const telegramBtn = root.querySelector('[data-action="join-telegram"]');
        
        // Инициализация аккордеона
        this.initAccordion(faqItems);
        
        // Кнопка "Связаться с поддержкой"
        if (supportBtn) {
            supportBtn.addEventListener('click', () => {
                this.handleSupportClick();
            });
        }
        
        // Кнопка "Telegram канал"
        if (telegramBtn) {
            telegramBtn.addEventListener('click', () => {
                this.handleTelegramClick();
            });
        }
        
        // Анимация появления элементов при скролле
        this.initScrollAnimations(root);
        
        // Сохраняем ссылки на обработчики для очистки
        this.eventHandlers = {
            faqItems: Array.from(faqItems),
            supportBtn,
            telegramBtn
        };
    },
    
    initAccordion(faqItems) {
        faqItems.forEach(item => {
            const toggle = item.querySelector('[data-faq-toggle]');
            const answer = item.querySelector('[data-faq-answer]');
            
            if (toggle && answer) {
                toggle.addEventListener('click', () => {
                    this.toggleFAQItem(item, answer);
                });
            }
        });
    },
    
    toggleFAQItem(item, answer) {
        const isActive = item.classList.contains('active');
        
        // Закрываем все остальные элементы
        const allItems = document.querySelectorAll('[data-faq-item]');
        allItems.forEach(otherItem => {
            if (otherItem !== item) {
                otherItem.classList.remove('active');
                const otherAnswer = otherItem.querySelector('[data-faq-answer]');
                if (otherAnswer) {
                    otherAnswer.style.maxHeight = '0';
                }
            }
        });
        
        // Переключаем текущий элемент
        if (isActive) {
            item.classList.remove('active');
            answer.style.maxHeight = '0';
        } else {
            item.classList.add('active');
            answer.style.maxHeight = answer.scrollHeight + 'px';
            
            // Эмитим событие для аналитики
            const questionText = item.querySelector('.genesis-faq-question-text').textContent;
            emit('faq:question-opened', { question: questionText });
        }
    },
    
    initScrollAnimations(root) {
        const elements = root.querySelectorAll('.genesis-faq-item, .genesis-faq-help');
        
        elements.forEach((element, index) => {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setTimeout(() => {
                            element.style.opacity = '1';
                            element.style.transform = 'translateY(0)';
                        }, index * 100);
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.3 });
            
            observer.observe(element);
            
            // Изначально скрываем элементы
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
            element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        });
    },
    
    handleSupportClick() {
        console.log('[FAQ] Клик по кнопке поддержки');
        
        // Эмитим событие для других модулей
        emit('support:contact', { method: 'support' });
        
        // Показываем модальное окно с контактами поддержки
        emit('modal:show', {
            title: 'Связаться с поддержкой',
            content: `
                <div class="support-contacts">
                    <h4>Способы связи:</h4>
                    <ul>
                        <li><strong>Email:</strong> support@genesis-one.io</li>
                        <li><strong>Telegram:</strong> @genesis_support</li>
                        <li><strong>Discord:</strong> genesis-support</li>
                        <li><strong>Время работы:</strong> 24/7</li>
                    </ul>
                    <p>Среднее время ответа: 5-15 минут</p>
                </div>
            `,
            actions: [
                {
                    text: 'Открыть Telegram',
                    action: () => window.open('https://t.me/genesis_support', '_blank')
                },
                {
                    text: 'Отправить email',
                    action: () => window.open('mailto:support@genesis-one.io', '_blank')
                }
            ]
        });
    },
    
    handleTelegramClick() {
        console.log('[FAQ] Клик по кнопке Telegram');
        
        // Эмитим событие для других модулей
        emit('support:contact', { method: 'telegram' });
        
        // Открываем Telegram канал
        window.open('https://t.me/genesis_one_io', '_blank');
        
        // Показываем уведомление
        emit('notification:show', {
            type: 'success',
            title: 'Telegram канал',
            message: 'Открыт официальный Telegram канал GENESIS 1.1'
        });
    },
    
    cleanup(root) {
        // Удаляем обработчики событий
        if (this.eventHandlers) {
            const { faqItems, supportBtn, telegramBtn } = this.eventHandlers;
            
            faqItems.forEach(item => {
                const toggle = item.querySelector('[data-faq-toggle]');
                if (toggle) {
                    toggle.removeEventListener('click', this.eventHandlers.toggleClick);
                }
            });
            
            if (supportBtn) {
                supportBtn.removeEventListener('click', this.eventHandlers.supportClick);
            }
            
            if (telegramBtn) {
                telegramBtn.removeEventListener('click', this.eventHandlers.telegramClick);
            }
        }
        
        // Очищаем содержимое
        root.innerHTML = '';
    }
};