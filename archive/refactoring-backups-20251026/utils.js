/**
 * GENESIS 1.1 - Утилиты
 * MCP-MARKER:MODULE:GENESIS_UTILS - Утилиты системы
 * MCP-MARKER:FILE:UTILS_JS - Файл утилит
 */

// MCP-MARKER:CLASS:GENESIS_UTILS - Класс утилит
window.GenesisUtils = {
    
    // MCP-MARKER:METHOD:ADDRESS_VALIDATION - Валидация адресов
    /**
     * Проверяет валидность BSC адреса
     */
    isValidAddress(address) {
        if (!address || typeof address !== 'string') return false;
        return /^0x[a-fA-F0-9]{40}$/.test(address);
    },
    
    /**
     * Форматирует адрес для отображения
     */
    formatAddress(address, length = 6) {
        if (!this.isValidAddress(address)) return '';
        return `${address.substring(0, length)}...${address.substring(address.length - 4)}`;
    },
    
    // MCP-MARKER:METHOD:TOKEN_CONVERSION - Конвертация токенов
    /**
     * Конвертирует Wei в BNB (18 decimals)
     */
    weiToBNB(wei) {
        if (!wei || isNaN(wei)) return 0;
        return parseFloat(wei) / 1e18;
    },
    
    /**
     * Конвертирует BNB в Wei (18 decimals)
     */
    bnbToWei(bnb) {
        if (!bnb || isNaN(bnb)) return '0';
        return Math.floor(parseFloat(bnb) * 1e18).toString();
    },
    
    /**
     * Конвертирует Wei в USDT (18 decimals)
     */
    weiToUSDT(wei) {
        if (!wei || isNaN(wei)) return 0;
        return parseFloat(wei) / 1e18;
    },
    
    /**
     * Конвертирует USDT в Wei (18 decimals)
     */
    usdtToWei(usdt) {
        if (!usdt || isNaN(usdt)) return '0';
        return Math.floor(parseFloat(usdt) * 1e18).toString();
    },
    
    /**
     * Конвертирует Wei в PLEX (9 decimals)
     */
    weiToPlex(wei) {
        if (!wei || isNaN(wei)) return 0;
        return parseFloat(wei) / 1e9;
    },
    
    /**
     * Конвертирует PLEX в Wei (9 decimals)
     */
    plexToWei(plex) {
        if (!plex || isNaN(plex)) return '0';
        return Math.floor(parseFloat(plex) * 1e9).toString();
    },
    
    // MCP-MARKER:METHOD:CURRENCY_FORMATTING - Форматирование валют
    /**
     * Форматирует сумму в валюте
     */
    formatCurrency(amount, currency = 'USD', decimals = 2) {
        if (!amount || isNaN(amount)) return '0.00';
        
        const options = {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        };
        
        // Для криптовалют не используем символы валют
        if (['USDT', 'PLEX', 'BNB'].includes(currency)) {
            return `${parseFloat(amount).toLocaleString('en-US', options)} ${currency}`;
        }
        
        // Для фиатных валют используем символы
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency === 'USDT' ? 'USD' : currency,
            ...options
        }).format(amount);
    },
    
    /**
     * Форматирует число с разделителями тысяч
     */
    formatNumber(number, decimals = 2) {
        if (!number || isNaN(number)) return '0';
        return parseFloat(number).toLocaleString('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    },
    
    // MCP-MARKER:METHOD:TIME_UTILITIES - Утилиты времени
    /**
     * Форматирует время в читаемый вид
     */
    formatTime(timestamp) {
        if (!timestamp) return '';
        const date = new Date(timestamp * 1000);
        return date.toLocaleString('ru-RU', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    },
    
    /**
     * Получить относительное время (назад)
     */
    getRelativeTime(timestamp) {
        const now = Date.now();
        const then = timestamp * 1000;
        const diff = now - then;
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 1) return 'только что';
        if (minutes < 60) return `${minutes} мин назад`;
        if (hours < 24) return `${hours} ч назад`;
        if (days < 7) return `${days} дн назад`;
        
        return this.formatTime(timestamp);
    },
    
    /**
     * Рассчитать оставшееся время
     */
    getRemainingTime(endTimestamp) {
        const now = Date.now();
        const end = endTimestamp * 1000;
        const diff = end - now;
        
        if (diff <= 0) return 'Завершен';
        
        const days = Math.floor(diff / 86400000);
        const hours = Math.floor((diff % 86400000) / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        
        if (days > 0) return `${days}д ${hours}ч`;
        if (hours > 0) return `${hours}ч ${minutes}м`;
        return `${minutes}м`;
    },
    
    // MCP-MARKER:METHOD:CLIPBOARD_UTILITIES - Утилиты буфера обмена
    /**
     * Копирует текст в буфер обмена
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showToast('Скопировано в буфер обмена', 'success');
            return true;
        } catch (error) {
            console.error('Ошибка копирования:', error);
            // Fallback для старых браузеров
            try {
                const textArea = document.createElement('textarea');
                textArea.value = text;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                this.showToast('Скопировано в буфер обмена', 'success');
                return true;
            } catch (fallbackError) {
                this.showToast('Ошибка копирования', 'error');
                return false;
            }
        }
    },
    
    // MCP-MARKER:METHOD:VALIDATION_UTILITIES - Утилиты валидации
    /**
     * Валидация суммы депозита
     */
    validateDepositAmount(amount, currency = 'USDT') {
        const config = window.GENESIS_CONFIG;
        if (!config) return { valid: false, error: 'Конфигурация не загружена' };
        
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            return { valid: false, error: 'Введите корректную сумму' };
        }
        
        const plan = window.getDepositPlanByAmount(numAmount, currency);
        if (!plan) {
            return { valid: false, error: 'Сумма не соответствует ни одному плану' };
        }
        
        return { valid: true, plan: plan };
    },
    
    /**
     * Проверка платежного допуска
     */
    isAmountInTolerance(amount, targetAmount, tolerance = 0.05) {
        const minAmount = targetAmount * (1 - tolerance);
        const maxAmount = targetAmount * (1 + tolerance);
        return amount >= minAmount && amount <= maxAmount;
    },
    
    // MCP-MARKER:METHOD:STORAGE_UTILITIES - Утилиты хранения
    /**
     * Безопасное получение из localStorage
     */
    getLocalStorage(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Ошибка чтения localStorage:', error);
            return defaultValue;
        }
    },
    
    /**
     * Безопасное сохранение в localStorage
     */
    setLocalStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Ошибка записи localStorage:', error);
            return false;
        }
    },
    
    /**
     * Очистка старых данных из localStorage
     */
    cleanupStorage() {
        const keysToClean = [
            'genesis_cache',
            'genesis_temp_data',
            'genesis_old_deposits'
        ];
        
        keysToClean.forEach(key => {
            try {
                localStorage.removeItem(key);
            } catch (error) {
                console.error(`Ошибка удаления ${key}:`, error);
            }
        });
    },
    
    // MCP-MARKER:METHOD:UI_UTILITIES - Утилиты UI
    /**
     * Показать toast уведомление
     */
    showToast(message, type = 'info', duration = 3000) {
        // Удаляем существующий toast
        const existingToast = document.querySelector('.genesis-toast');
        if (existingToast) {
            existingToast.remove();
        }
        
        const toast = document.createElement('div');
        toast.className = `genesis-toast genesis-toast-${type}`;
        toast.innerHTML = `
            <div class="genesis-toast-content">
                <span class="genesis-toast-icon">${this.getToastIcon(type)}</span>
                <span class="genesis-toast-message">${message}</span>
            </div>
        `;
        
        // Добавляем стили если их нет
        if (!document.getElementById('genesis-toast-styles')) {
            const styles = document.createElement('style');
            styles.id = 'genesis-toast-styles';
            styles.textContent = `
                .genesis-toast {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: var(--bg-secondary, #1a1a2e);
                    border: 1px solid var(--border-color, #333344);
                    border-radius: 8px;
                    padding: 12px 16px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                    z-index: 10000;
                    max-width: 300px;
                    animation: slideInRight 0.3s ease;
                }
                
                .genesis-toast-success { border-left: 4px solid #00ff41; }
                .genesis-toast-error { border-left: 4px solid #ff4757; }
                .genesis-toast-warning { border-left: 4px solid #ffa726; }
                .genesis-toast-info { border-left: 4px solid #00d4ff; }
                
                .genesis-toast-content {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .genesis-toast-icon {
                    font-size: 16px;
                }
                
                .genesis-toast-message {
                    color: var(--text-primary, #ffffff);
                    font-size: 14px;
                    line-height: 1.4;
                }
                
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `;
            document.head.appendChild(styles);
        }
        
        document.body.appendChild(toast);
        
        // Автоматически удаляем через указанное время
        setTimeout(() => {
            if (toast.parentElement) {
                toast.style.animation = 'slideInRight 0.3s ease reverse';
                setTimeout(() => toast.remove(), 300);
            }
        }, duration);
    },
    
    /**
     * Получить иконку для toast
     */
    getToastIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    },
    
    /**
     * Показать индикатор загрузки
     */
    showLoading(element, message = 'Загрузка...') {
        if (!element) return;
        
        const loader = document.createElement('div');
        loader.className = 'genesis-loader';
        loader.innerHTML = `
            <div class="genesis-loader-spinner"></div>
            <div class="genesis-loader-text">${message}</div>
        `;
        
        // Добавляем стили загрузчика если их нет
        if (!document.getElementById('genesis-loader-styles')) {
            const styles = document.createElement('style');
            styles.id = 'genesis-loader-styles';
            styles.textContent = `
                .genesis-loader {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem;
                    color: var(--text-secondary, #b0b0b0);
                }
                
                .genesis-loader-spinner {
                    width: 24px;
                    height: 24px;
                    border: 2px solid var(--border-color, #333344);
                    border-top: 2px solid var(--primary-color, #ff6b35);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin-bottom: 0.5rem;
                }
                
                .genesis-loader-text {
                    font-size: 0.9rem;
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(styles);
        }
        
        element.innerHTML = '';
        element.appendChild(loader);
    },
    
    /**
     * Скрыть индикатор загрузки
     */
    hideLoading(element) {
        if (!element) return;
        const loader = element.querySelector('.genesis-loader');
        if (loader) {
            loader.remove();
        }
    },
    
    // MCP-MARKER:METHOD:MATH_UTILITIES - Математические утилиты
    /**
     * Безопасное деление
     */
    safeDivide(a, b, defaultValue = 0) {
        if (!b || b === 0) return defaultValue;
        return a / b;
    },
    
    /**
     * Рассчитать процент
     */
    calculatePercentage(value, total, decimals = 2) {
        if (!total || total === 0) return 0;
        return parseFloat(((value / total) * 100).toFixed(decimals));
    },
    
    /**
     * Рассчитать ROI
     */
    calculateROI(initialAmount, currentAmount, decimals = 2) {
        if (!initialAmount || initialAmount === 0) return 0;
        const roi = ((currentAmount - initialAmount) / initialAmount) * 100;
        return parseFloat(roi.toFixed(decimals));
    },
    
    // MCP-MARKER:METHOD:DEBUG_UTILITIES - Утилиты отладки
    /**
     * Логирование с префиксом
     */
    log(message, type = 'info', data = null) {
        const timestamp = new Date().toISOString();
        const prefix = `[GENESIS-${type.toUpperCase()}] ${timestamp}:`;
        
        switch (type) {
            case 'error':
                console.error(prefix, message, data);
                break;
            case 'warn':
                console.warn(prefix, message, data);
                break;
            case 'debug':
                if (window.GENESIS_CONFIG?.app?.debug) {
                    console.log(prefix, message, data);
                }
                break;
            default:
                console.log(prefix, message, data);
        }
        
        // Отправляем в терминал если доступен
        if (window.GenesisTerminal && window.GenesisTerminal.log) {
            window.GenesisTerminal.log(message, type);
        }
    },
    
    /**
     * Проверка окружения
     */
    isDevelopment() {
        return window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1' ||
               window.location.hostname.includes('dev') ||
               window.location.hostname.includes('test');
    },
    
    // MCP-MARKER:METHOD:INITIALIZATION - Инициализация
    init() {
        this.log('GenesisUtils initialized', 'info');
        
        // Добавляем глобальные функции для обратной совместимости
        if (!window.weiToUSDT) window.weiToUSDT = this.weiToUSDT;
        if (!window.usdtToWei) window.usdtToWei = this.usdtToWei;
        if (!window.weiToPlex) window.weiToPlex = this.weiToPlex;
        if (!window.plexToWei) window.plexToWei = this.plexToWei;
        if (!window.weiToBNB) window.weiToBNB = this.weiToBNB;
        if (!window.bnbToWei) window.bnbToWei = this.bnbToWei;
        
        return this;
    }
};

// Автоматическая инициализация
document.addEventListener('DOMContentLoaded', () => {
    window.GenesisUtils.init();
});

// Экспорт для совместимости
window.Utils = window.GenesisUtils;

console.log('🛠️ GENESIS UTILS loaded');
