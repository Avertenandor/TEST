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
        const timeframeBtns = root.querySelectorAll('[data-timeframe]');
        
        if (connectBtn) {
            connectBtn.addEventListener('click', () => {
                emit('wallet:connect', { source: 'terminal' });
            });
        }
        
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                emit('terminal:settings', {});
            });
        }
        
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => {
                emit('terminal:fullscreen', {});
            });
        }
        
        timeframeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const timeframe = btn.getAttribute('data-timeframe');
                this.switchTimeframe(timeframe, btn);
            });
        });
        
        this.startDataUpdates(root);
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