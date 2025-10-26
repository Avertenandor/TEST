/**
 * GENESIS 1.4.2 - Smart Error Handler
 * MCP-MARKER:MODULE:ERROR_HANDLER
 *
 * IMPROVEMENTS:
 * - Умная фильтрация ошибок (не все подавляются)
 * - Логирование в debug режиме
 * - Уменьшена агрессивность подавления
 */

class SmartErrorHandler {
    constructor() {
        this.isDebugMode = window.GENESIS_CONFIG?.app?.debug || false;
        this.suppressedErrors = [];
        this.maxSuppressedLog = 100; // Храним последние 100 подавленных ошибок
    }

    /**
     * Проверка - является ли ошибка расширением браузера
     */
    isExtensionError(errorMsg, filename, stack) {
        const extensionPatterns = [
            'chrome-extension://',
            'moz-extension://',
            'webkit://',
            'safari-extension://'
        ];

        return extensionPatterns.some(pattern =>
            (errorMsg && errorMsg.includes(pattern)) ||
            (filename && filename.includes(pattern)) ||
            (stack && stack.includes(pattern))
        );
    }

    /**
     * Проверка - является ли ошибка от MetaMask/кошелька (только инжектированный код)
     */
    isWalletInjectionError(errorMsg, filename, stack) {
        // Только ошибки от инжектированных скриптов кошелька, НЕ наши ошибки взаимодействия
        const walletInjectionPatterns = [
            'inpage.js',
            'contentscript.js'
        ];

        // Проверяем только filename и stack, НЕ сообщение об ошибке
        return walletInjectionPatterns.some(pattern =>
            (filename && filename.includes(pattern)) ||
            (stack && stack.includes(pattern))
        );
    }

    /**
     * Логирование подавленной ошибки в debug режиме
     */
    logSuppressedError(type, errorInfo) {
        if (this.isDebugMode) {
            console.log(
                `%c[SUPPRESSED ${type}]`,
                'color: #888; font-size: 10px;',
                errorInfo
            );
        }

        // Сохраняем для отладки
        this.suppressedErrors.push({
            type,
            timestamp: Date.now(),
            ...errorInfo
        });

        // Ограничиваем размер лога
        if (this.suppressedErrors.length > this.maxSuppressedLog) {
            this.suppressedErrors.shift();
        }
    }

    /**
     * Обработка console.error
     */
    handleConsoleError(originalConsoleError, args) {
        const errorString = args.join(' ');

        // Подавляем ТОЛЬКО ошибки расширений и инжектированных скриптов кошелька
        if (this.isExtensionError(errorString) ||
            this.isWalletInjectionError(errorString)) {

            this.logSuppressedError('CONSOLE', {
                message: errorString
            });
            return; // Подавляем
        }

        // ВСЕ остальные ошибки показываем
        originalConsoleError.apply(console, args);
    }

    /**
     * Обработка unhandled promise rejection
     */
    handleUnhandledRejection(event) {
        const error = event.reason;
        const errorMsg = error?.message || error?.toString() || '';
        const stack = error?.stack || '';

        // Подавляем ТОЛЬКО ошибки расширений и инжектированных скриптов
        if (this.isExtensionError(errorMsg, '', stack) ||
            this.isWalletInjectionError(errorMsg, '', stack)) {

            this.logSuppressedError('PROMISE', {
                message: errorMsg,
                stack: stack.substring(0, 200)
            });

            event.preventDefault();
            return true;
        }

        // Все остальные promise rejection НЕ подавляем
        return false;
    }

    /**
     * Обработка window.onerror
     */
    handleWindowError(event) {
        const errorMsg = event.message || '';
        const filename = event.filename || '';

        // Подавляем ТОЛЬКО ошибки расширений и инжектированных скриптов
        if (this.isExtensionError(errorMsg, filename) ||
            this.isWalletInjectionError(errorMsg, filename)) {

            this.logSuppressedError('WINDOW', {
                message: errorMsg,
                filename: filename
            });

            event.preventDefault();
            event.stopPropagation();
            return false;
        }

        // Все остальные ошибки НЕ подавляем
        return true;
    }

    /**
     * Инициализация обработчиков ошибок
     */
    init() {
        const self = this;

        // Перехват console.error
        const originalConsoleError = console.error;
        console.error = function(...args) {
            self.handleConsoleError(originalConsoleError, args);
        };

        // Обработка unhandled promise rejections
        window.addEventListener('unhandledrejection', function(event) {
            self.handleUnhandledRejection(event);
        });

        // Обработка window.onerror
        window.addEventListener('error', function(event) {
            self.handleWindowError(event);
        }, true); // Используем capture phase

        console.log(
            '[SMART-ERROR-HANDLER] ✅ Умная обработка ошибок активирована' +
            (this.isDebugMode ? ' (DEBUG MODE)' : '')
        );
    }

    /**
     * Получить статистику подавленных ошибок
     */
    getStats() {
        const stats = {
            total: this.suppressedErrors.length,
            byType: {},
            recent: this.suppressedErrors.slice(-10)
        };

        this.suppressedErrors.forEach(err => {
            stats.byType[err.type] = (stats.byType[err.type] || 0) + 1;
        });

        return stats;
    }
}

// Создаем и экспортируем глобальный экземпляр
const errorHandler = new SmartErrorHandler();
window.GenesisErrorHandler = errorHandler;

// Автоматическая инициализация
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => errorHandler.init());
} else {
    errorHandler.init();
}

export default errorHandler;
