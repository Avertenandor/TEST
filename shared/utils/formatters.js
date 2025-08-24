// shared/utils/formatters.js
// Утилиты форматирования данных для GENESIS

/**
 * Форматирование чисел с разделителями тысяч
 */
export function formatNumber(number, decimals = 2) {
    if (number === null || number === undefined) return '0';
    
    const num = parseFloat(number);
    if (isNaN(num)) return '0';
    
    return num.toLocaleString('ru-RU', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}

/**
 * Форматирование суммы в USD
 */
export function formatUSD(amount, showSign = true) {
    const formatted = formatNumber(amount, 2);
    return showSign ? `$${formatted}` : formatted;
}

/**
 * Форматирование суммы в USDT
 */
export function formatUSDT(amount) {
    return `${formatNumber(amount, 2)} USDT`;
}

/**
 * Форматирование суммы в PLEX
 */
export function formatPLEX(amount) {
    return `${formatNumber(amount, 2)} PLEX`;
}

/**
 * Форматирование процентов
 */
export function formatPercent(value, decimals = 2) {
    if (value === null || value === undefined) return '0%';
    
    const num = parseFloat(value);
    if (isNaN(num)) return '0%';
    
    return `${formatNumber(num, decimals)}%`;
}

/**
 * Форматирование даты
 */
export function formatDate(date, format = 'full') {
    if (!date) return '';
    
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return '';
    
    const options = {
        full: {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        },
        short: {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        },
        time: {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        },
        date: {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }
    };
    
    return d.toLocaleString('ru-RU', options[format] || options.full);
}

/**
 * Форматирование времени до события
 */
export function formatTimeUntil(timestamp) {
    const now = Date.now();
    const target = parseInt(timestamp);
    const diff = target - now;
    
    if (diff <= 0) return 'Истекло';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
        return `${days} дн. ${hours} ч.`;
    } else if (hours > 0) {
        return `${hours} ч. ${minutes} мин.`;
    } else {
        return `${minutes} мин.`;
    }
}

/**
 * Форматирование длительности
 */
export function formatDuration(seconds) {
    if (!seconds || seconds < 0) return '0 сек.';
    
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    const parts = [];
    if (days > 0) parts.push(`${days} дн.`);
    if (hours > 0) parts.push(`${hours} ч.`);
    if (minutes > 0) parts.push(`${minutes} мин.`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs} сек.`);
    
    return parts.join(' ');
}

/**
 * Форматирование BSC адреса
 */
export function formatAddress(address, showFull = false) {
    if (!address) return '';
    
    if (showFull) {
        return address;
    }
    
    if (address.length <= 10) {
        return address;
    }
    
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Форматирование хэша транзакции
 */
export function formatTxHash(hash, showFull = false) {
    return formatAddress(hash, showFull);
}

/**
 * Форматирование размера файла
 */
export function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Форматирование множителя
 */
export function formatMultiplier(value) {
    if (!value || value === 1) return '1x';
    return `${formatNumber(value, 1)}x`;
}

/**
 * Форматирование ранга
 */
export function formatRank(rank) {
    const ranks = {
        'beginner': 'Новичок',
        'bronze': 'Бронза',
        'silver': 'Серебро',
        'gold': 'Золото',
        'platinum': 'Платина',
        'diamond': 'Алмаз',
        'master': 'Мастер',
        'grandmaster': 'Грандмастер',
        'legend': 'Легенда'
    };
    
    return ranks[rank] || rank;
}

/**
 * Форматирование статуса
 */
export function formatStatus(status) {
    const statuses = {
        'active': 'Активен',
        'inactive': 'Неактивен',
        'pending': 'Ожидание',
        'completed': 'Завершен',
        'cancelled': 'Отменен',
        'expired': 'Истек'
    };
    
    return statuses[status] || status;
}

/**
 * Форматирование типа депозита
 */
export function formatDepositType(type) {
    const types = {
        'standard': 'Стандартный',
        'premium': 'Премиум',
        'vip': 'VIP',
        'elite': 'Элитный'
    };
    
    return types[type] || type;
}

/**
 * Склонение числительных
 */
export function pluralize(number, forms) {
    // forms = ['день', 'дня', 'дней']
    const n = Math.abs(number) % 100;
    const n1 = n % 10;
    
    if (n > 10 && n < 20) {
        return forms[2];
    }
    if (n1 > 1 && n1 < 5) {
        return forms[1];
    }
    if (n1 === 1) {
        return forms[0];
    }
    
    return forms[2];
}

/**
 * Форматирование с склонением
 */
export function formatWithPlural(number, forms) {
    return `${formatNumber(number, 0)} ${pluralize(number, forms)}`;
}

// Export all formatters as default object too
export default {
    formatNumber,
    formatUSD,
    formatUSDT,
    formatPLEX,
    formatPercent,
    formatDate,
    formatTimeUntil,
    formatDuration,
    formatAddress,
    formatTxHash,
    formatFileSize,
    formatMultiplier,
    formatRank,
    formatStatus,
    formatDepositType,
    pluralize,
    formatWithPlural
};
