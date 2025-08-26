// core/error-guard.ts
// Глобальный перехватчик ошибок с белым списком

declare global {
    interface Window {
        __diagBuffer: Array<{
            timestamp: string;
            type: 'error' | 'warning' | 'info';
            message: string;
            stack?: string;
            context?: any;
        }>;
    }
}

// Белый список ошибок, которые не нужно логировать
const WHITELISTED_ERRORS = [
    // MetaMask ошибки
    'MetaMask',
    'inpage.js',
    'ethereum',
    'wallet',
    'user rejected',
    'user denied',
    'user cancelled',
    'user rejected transaction',
    'user denied transaction',
    'user cancelled transaction',

    // Сетевые ошибки
    'network error',
    'connection refused',
    'timeout',
    'aborted',

    // Браузерные ошибки
    'script error',
    'syntax error',
    'reference error',
    'type error',

    // Известные ошибки библиотек
    'qrcode',
    'chart.js',
    'axios',
    'fetch'
];

// Инициализация диагностического буфера
if (!window.__diagBuffer) {
    window.__diagBuffer = [];
}

/**
 * Проверяет, является ли ошибка разрешенной (в белом списке)
 */
function isWhitelistedError(error: Error | string): boolean {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorStack = typeof error === 'string' ? '' : error.stack || '';

    const fullErrorText = `${errorMessage} ${errorStack}`.toLowerCase();

    return WHITELISTED_ERRORS.some(whitelisted =>
        fullErrorText.includes(whitelisted.toLowerCase())
    );
}

/**
 * Логирует ошибку в диагностический буфер
 */
function logError(error: Error | string, context?: any): void {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorStack = typeof error === 'string' ? undefined : error.stack;

    const logEntry = {
        timestamp: new Date().toISOString(),
        type: 'error' as const,
        message: errorMessage,
        stack: errorStack,
        context
    };

    window.__diagBuffer.push(logEntry);

    // Ограничиваем размер буфера
    if (window.__diagBuffer.length > 1000) {
        window.__diagBuffer = window.__diagBuffer.slice(-500);
    }
}

/**
 * Глобальный обработчик ошибок
 */
function globalErrorHandler(event: ErrorEvent): void {
    const error = event.error || new Error(event.message);

    // Проверяем белый список
    if (isWhitelistedError(error)) {
        return; // Игнорируем разрешенные ошибки
    }

    // Логируем ошибку
    logError(error, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        url: event.target?.location?.href
    });

    // В режиме разработки показываем ошибку в консоли
    if (process.env.NODE_ENV === 'development') {
        console.error('🚨 Error caught by error-guard:', error);
    }
}

/**
 * Глобальный обработчик необработанных промисов
 */
function unhandledRejectionHandler(event: PromiseRejectionEvent): void {
    const error = event.reason;

    // Проверяем белый список
    if (isWhitelistedError(error)) {
        return; // Игнорируем разрешенные ошибки
    }

    // Логируем ошибку
    logError(error, {
        type: 'unhandledRejection',
        promise: event.promise
    });

    // В режиме разработки показываем ошибку в консоли
    if (process.env.NODE_ENV === 'development') {
        console.error('🚨 Unhandled promise rejection caught by error-guard:', error);
    }
}

/**
 * Инициализация error guard
 */
export function initErrorGuard(): void {
    // Устанавливаем глобальные обработчики
    window.addEventListener('error', globalErrorHandler);
    window.addEventListener('unhandledrejection', unhandledRejectionHandler);

    // Перехватываем console.error для дополнительного логирования
    const originalConsoleError = console.error;
    console.error = (...args) => {
        const errorMessage = args.join(' ');

        // Проверяем белый список
        if (!isWhitelistedError(errorMessage)) {
            logError(errorMessage, { source: 'console.error' });
        }

        // Вызываем оригинальный console.error
        originalConsoleError.apply(console, args);
    };

    console.log('✅ Error guard initialized');
}

/**
 * Получить диагностический буфер
 */
export function getDiagnosticBuffer(): typeof window.__diagBuffer {
    return window.__diagBuffer;
}

/**
 * Очистить диагностический буфер
 */
export function clearDiagnosticBuffer(): void {
    window.__diagBuffer = [];
}

/**
 * Экспорт диагностических данных
 */
export function exportDiagnostics(): string {
    return JSON.stringify(window.__diagBuffer, null, 2);
}
