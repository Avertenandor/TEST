/**
 * GENESIS External Errors Shield v2.0
 * Защита от ошибок внешних скриптов и расширений браузера
 * 
 * Этот модуль предотвращает загрязнение консоли ошибками от:
 * - Расширений браузера (MetaMask, кошельки)
 * - Систем мониторинга (New Relic, Sentry)
 * - Внешних фреймворков и UI (Claude.ai, Next.js)
 * - Permissions Policy violations
 */

(function() {
    'use strict';
    
    // Список паттернов внешних ошибок для игнорирования
    const EXTERNAL_ERROR_PATTERNS = [
        // MetaMask и Web3 кошельки
        'inpage.js',
        'MetaMask',
        'ethereum',
        'web3',
        'fm.<anonymous>',
        'Generator.next',
        
        // Системы мониторинга и аналитики
        'newrelic',
        'sentry',
        'bugsnag',
        'datadog',
        'gtag',
        'analytics',
        'gtm.js',
        'fbevents.js',
        
        // Claude.ai и другие внешние UI фреймворки
        '4118-07aa55f66c5b5e64',
        'library.cb87358',
        '_next',
        'webpack',
        
        // Permissions Policy нарушения
        'Permissions policy violation',
        'unload is not allowed',
        'interest-cohort',
        'document-domain',
        
        // Расширения браузеров
        'chrome-extension://',
        'moz-extension://',
        'edge-extension://',
        'safari-extension://',
        
        // Другие известные внешние источники
        'recaptcha',
        'googleapis',
        'gstatic',
        'doubleclick',
        'google-analytics',
        'googletagmanager'
    ];
    
    // Сохраняем оригинальные методы
    const originalAddEventListener = window.addEventListener;
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    
    // Функция проверки, является ли ошибка внешней
    function isExternalError(errorInfo) {
        const checkString = (str) => {
            if (!str) return false;
            const lowerStr = str.toLowerCase();
            return EXTERNAL_ERROR_PATTERNS.some(pattern => 
                lowerStr.includes(pattern.toLowerCase())
            );
        };
        
        // Проверяем различные источники информации об ошибке
        if (typeof errorInfo === 'string') {
            return checkString(errorInfo);
        }
        
        if (errorInfo && typeof errorInfo === 'object') {
            return checkString(errorInfo.message) ||
                   checkString(errorInfo.stack) ||
                   checkString(errorInfo.filename) ||
                   checkString(errorInfo.source) ||
                   checkString(errorInfo.reason?.toString());
        }
        
        return false;
    }
    
    // Перехват window.addEventListener для фильтрации unload
    window.addEventListener = function(type, listener, options) {
        // Блокируем unload события от внешних источников
        if (type === 'unload' || type === 'beforeunload') {
            const stack = new Error().stack || '';
            if (isExternalError(stack)) {
                console.info('[🛡️ External Shield] Blocked external unload event');
                return;
            }
        }
        return originalAddEventListener.apply(this, arguments);
    };
    
    // Усиленная защита от ошибок
    window.addEventListener('error', function(event) {
        const errorInfo = {
            message: event.message,
            filename: event.filename,
            stack: event.error?.stack
        };
        
        if (isExternalError(errorInfo)) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            
            // Логируем в специальную группу для отладки (свернутую)
            if (window.GENESIS_DEBUG_MODE) {
                console.groupCollapsed('[🛡️ External Shield] Suppressed external error');
                console.log('Message:', event.message);
                console.log('Source:', event.filename);
                console.groupEnd();
            }
            
            return false;
        }
    }, true);
    
    // Защита от unhandled promise rejections
    window.addEventListener('unhandledrejection', function(event) {
        const errorInfo = {
            message: event.reason?.toString(),
            stack: event.reason?.stack,
            reason: event.reason
        };
        
        if (isExternalError(errorInfo)) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            
            if (window.GENESIS_DEBUG_MODE) {
                console.groupCollapsed('[🛡️ External Shield] Suppressed promise rejection');
                console.log('Reason:', event.reason);
                console.groupEnd();
            }
            
            return false;
        }
    }, true);
    
    // Фильтрация console.error и console.warn
    console.error = function() {
        const args = Array.prototype.slice.call(arguments);
        const errorString = args.map(arg => {
            if (typeof arg === 'object') {
                return JSON.stringify(arg);
            }
            return String(arg);
        }).join(' ');
        
        if (!isExternalError(errorString)) {
            return originalConsoleError.apply(console, arguments);
        } else if (window.GENESIS_DEBUG_MODE) {
            console.groupCollapsed('[🛡️ External Shield] Filtered console.error');
            originalConsoleError.apply(console, arguments);
            console.groupEnd();
        }
    };
    
    console.warn = function() {
        const args = Array.prototype.slice.call(arguments);
        const warnString = args.map(arg => {
            if (typeof arg === 'object') {
                return JSON.stringify(arg);
            }
            return String(arg);
        }).join(' ');
        
        // Специальная обработка для Permissions Policy
        if (warnString.includes('[Violation]') || warnString.includes('Permissions policy')) {
            if (window.GENESIS_DEBUG_MODE) {
                console.groupCollapsed('[🛡️ External Shield] Permissions Policy violation');
                originalConsoleWarn.apply(console, arguments);
                console.groupEnd();
            }
            return;
        }
        
        if (!isExternalError(warnString)) {
            return originalConsoleWarn.apply(console, arguments);
        } else if (window.GENESIS_DEBUG_MODE) {
            console.groupCollapsed('[🛡️ External Shield] Filtered console.warn');
            originalConsoleWarn.apply(console, arguments);
            console.groupEnd();
        }
    };
    
    // Защита от попыток переопределить нашу защиту
    Object.freeze(window.addEventListener);
    Object.freeze(console.error);
    Object.freeze(console.warn);
    
    // Информационное сообщение
    console.log(
        '%c🛡️ GENESIS External Errors Shield v2.0 Activated',
        'color: #00ff41; font-weight: bold; font-size: 12px;'
    );
    
    // Режим отладки можно включить через консоль:
    // window.GENESIS_DEBUG_MODE = true;
    window.GENESIS_DEBUG_MODE = false;
    
    // Экспорт для тестирования
    window.GENESIS_SHIELD = {
        version: '2.0',
        patterns: EXTERNAL_ERROR_PATTERNS,
        isExternalError: isExternalError,
        debugMode: function(enable) {
            window.GENESIS_DEBUG_MODE = !!enable;
            console.log(`[🛡️ External Shield] Debug mode ${enable ? 'enabled' : 'disabled'}`);
        }
    };
})();