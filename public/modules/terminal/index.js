import { emit } from '../../app/pubsub.js';

export default {
    async mount(root, config) {
        console.log('[TERMINAL] Монтирование модуля terminal');
        
        const response = await fetch('./modules/terminal/template.html');
        const template = await response.text();
        root.innerHTML = template;
        
        this.initTerminal(root);
        
        console.log('[TERMINAL] Модуль terminal успешно смонтирован');
        
        return () => {
            console.log('[TERMINAL] Размонтирование модуля terminal');
            this.cleanup(root);
        };
    },
    
    initTerminal(root) {
        const connectBtn = root.querySelector('[data-action="connect"]');
        const settingsBtn = root.querySelector('[data-action="settings"]');
        const fullscreenBtn = root.querySelector('[data-action="fullscreen"]');
        const toggleBtn = root.querySelector('[data-action="toggle-terminal"]');
        const timeframeBtns = root.querySelectorAll('[data-timeframe]');
        const terminalWidget = root.querySelector('.genesis-terminal-widget');
        
        // Кнопка сворачивания/разворачивания
        if (toggleBtn && terminalWidget) {
            toggleBtn.addEventListener('click', () => {
                this.toggleTerminal(terminalWidget, toggleBtn);
            });
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
    },
    
    toggleTerminal(widget, button) {
        const isCollapsed = widget.classList.contains('collapsed');
        const toggleIcon = button.querySelector('.genesis-terminal-toggle-icon');
        const buttonText = button.querySelector('.genesis-terminal-btn-text');
        
        if (isCollapsed) {
            // Разворачиваем терминал
            widget.classList.remove('collapsed');
            toggleIcon.textContent = '📉';
            buttonText.textContent = 'Свернуть';
            
            // Эмитим событие
            emit('terminal:expanded', {});
            
            console.log('[TERMINAL] Терминал развернут');
        } else {
            // Сворачиваем терминал
            widget.classList.add('collapsed');
            toggleIcon.textContent = '📈';
            buttonText.textContent = 'Развернуть';
            
            // Эмитим событие
            emit('terminal:collapsed', {});
            
            console.log('[TERMINAL] Терминал свернут');
        }
        
        // Плавная прокрутка к терминалу
        setTimeout(() => {
            widget.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
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