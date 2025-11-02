import { emit } from '../../app/pubsub.js';

export default {
    async mount(root, config) {
        console.log('[TERMINAL] Монтирование модуля terminal');

        try {
            // Загружаем HTML шаблон
            const response = await fetch('/modules/terminal/template.html');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const template = await response.text();
            console.log('[TERMINAL] HTML шаблон загружен, длина:', template.length);

            root.innerHTML = template;
            console.log('[TERMINAL] HTML вставлен в DOM');

            // Инициализируем терминал
            this.initTerminal(root);

            console.log('[TERMINAL] Модуль terminal успешно смонтирован');

            return () => {
                console.log('[TERMINAL] Размонтирование модуля terminal');
                this.cleanup(root);
            };
        } catch (error) {
            console.error('[TERMINAL ERROR] Ошибка монтирования:', error);
            root.innerHTML = `
                <div style="padding: 2rem; text-align: center; color: #ff6b6b;">
                    <h3>Ошибка загрузки терминала</h3>
                    <p>${error.message}</p>
                    <button onclick="location.reload()" style="background: #4ecdc4; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
                        Перезагрузить
                    </button>
                </div>
            `;
        }
    },

    initTerminal(root) {
        console.log('[TERMINAL] Инициализация терминала...');

        const connectBtn = root.querySelector('[data-action="connect"]');
        const settingsBtn = root.querySelector('[data-action="settings"]');
        const fullscreenBtn = root.querySelector('[data-action="fullscreen"]');
        const toggleBtn = root.querySelector('[data-action="toggle-terminal"]');
        const timeframeBtns = root.querySelectorAll('[data-timeframe]');
        const terminalWidget = root.querySelector('.genesis-terminal-widget');

        console.log('[TERMINAL] Найденные элементы:', {
            connectBtn: !!connectBtn,
            settingsBtn: !!settingsBtn,
            fullscreenBtn: !!fullscreenBtn,
            toggleBtn: !!toggleBtn,
            terminalWidget: !!terminalWidget,
            timeframeBtns: timeframeBtns.length
        });

        // Кнопка сворачивания/разворачивания
        if (toggleBtn && terminalWidget) {
            console.log('[TERMINAL] Добавляем обработчик для кнопки сворачивания');
            toggleBtn.addEventListener('click', (e) => {
                console.log('[TERMINAL] Клик по кнопке сворачивания');
                e.preventDefault();
                e.stopPropagation();
                this.toggleTerminal(terminalWidget, toggleBtn);
            });
        } else {
            console.warn('[TERMINAL] Кнопка сворачивания или виджет терминала не найдены');
        }

        // Кнопка подключения кошелька
        if (connectBtn) {
            connectBtn.addEventListener('click', () => {
                emit('wallet:connect', { source: 'terminal' });
            });
        }

        // Кнопка настроек
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                emit('terminal:settings', {});
            });
        }

        // Кнопка полного экрана
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => {
                emit('terminal:fullscreen', {});
            });
        }

        // Кнопки временных интервалов
        timeframeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const timeframe = btn.getAttribute('data-timeframe');
                this.switchTimeframe(timeframe, btn);
            });
        });

        this.startDataUpdates(root);
        console.log('[TERMINAL] Инициализация завершена');
    },

    toggleTerminal(widget, button) {
        console.log('[TERMINAL] Переключение состояния терминала');

        const isCollapsed = widget.classList.contains('collapsed');
        const toggleIcon = button.querySelector('.genesis-terminal-toggle-icon');
        const buttonText = button.querySelector('.genesis-terminal-btn-text');

        console.log('[TERMINAL] Текущее состояние:', { isCollapsed, hasIcon: !!toggleIcon, hasText: !!buttonText });

        if (isCollapsed) {
            // Разворачиваем терминал
            console.log('[TERMINAL] Разворачиваем терминал');
            widget.classList.remove('collapsed');
            if (toggleIcon) toggleIcon.textContent = '📉';
            if (buttonText) buttonText.textContent = 'Свернуть';

            // Эмитим событие
            emit('terminal:expanded', {});

            console.log('[TERMINAL] Терминал развернут');
        } else {
            // Сворачиваем терминал
            console.log('[TERMINAL] Сворачиваем терминал');
            widget.classList.add('collapsed');
            if (toggleIcon) toggleIcon.textContent = '📈';
            if (buttonText) buttonText.textContent = 'Развернуть';

            // Эмитим событие
            emit('terminal:collapsed', {});

            console.log('[TERMINAL] Терминал свернут');
        }

        // Плавная прокрутка к терминалу
        setTimeout(() => {
            try {
                widget.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            } catch (error) {
                console.warn('[TERMINAL] Ошибка прокрутки:', error);
            }
        }, 300);
    },

    switchTimeframe(timeframe, activeBtn) {
        const allBtns = document.querySelectorAll('[data-timeframe]');
        allBtns.forEach(btn => btn.classList.remove('genesis-terminal-chart-btn-active'));
        activeBtn.classList.add('genesis-terminal-chart-btn-active');

        emit('terminal:timeframe-change', { timeframe });
    },

    startDataUpdates(root) {
        // Симуляция обновления данных
        setInterval(() => {
            this.updatePrice(root);
            this.updateOrderbook(root);
            this.updateTrades(root);
        }, 3000);
    },

    updatePrice(root) {
        const priceElement = root.querySelector('.genesis-terminal-chart-pair-price');
        if (priceElement) {
            const currentPrice = parseFloat(priceElement.textContent.replace('$', ''));
            const change = (Math.random() - 0.5) * 0.01;
            const newPrice = Math.max(0.1, currentPrice + change);
            priceElement.textContent = '$' + newPrice.toFixed(4);
        }
    },

    updateOrderbook(root) {
        // Обновление книги ордеров
    },

    updateTrades(root) {
        // Обновление сделок
    },

    cleanup(root) {
        root.innerHTML = '';
    }
};
