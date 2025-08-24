// shared/utils/validators.js
// Утилиты валидации для GENESIS

/**
 * Валидация BSC адреса
 */
export function isValidBSCAddress(address) {
    if (!address) return false;
    return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Валидация хэша транзакции
 */
export function isValidTxHash(hash) {
    if (!hash) return false;
    return /^0x[a-fA-F0-9]{64}$/.test(hash);
}

/**
 * Валидация email
 */
export function isValidEmail(email) {
    if (!email) return false;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.toLowerCase());
}

/**
 * Валидация суммы
 */
export function isValidAmount(amount, min = 0, max = Infinity) {
    const num = parseFloat(amount);
    if (isNaN(num)) return false;
    return num >= min && num <= max;
}

/**
 * Валидация процента
 */
export function isValidPercent(percent) {
    const num = parseFloat(percent);
    if (isNaN(num)) return false;
    return num >= 0 && num <= 100;
}

/**
 * Валидация даты
 */
export function isValidDate(date) {
    if (!date) return false;
    const d = date instanceof Date ? date : new Date(date);
    return !isNaN(d.getTime());
}

/**
 * Валидация URL
 */
export function isValidURL(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

/**
 * Валидация номера телефона
 */
export function isValidPhone(phone) {
    if (!phone) return false;
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '');
    // Check if it's a valid phone number length (10-15 digits)
    return digits.length >= 10 && digits.length <= 15;
}

/**
 * Валидация пароля
 */
export function isValidPassword(password, requirements = {}) {
    const defaults = {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecial: false
    };
    
    const req = { ...defaults, ...requirements };
    
    if (!password || password.length < req.minLength) {
        return false;
    }
    
    if (req.requireUppercase && !/[A-Z]/.test(password)) {
        return false;
    }
    
    if (req.requireLowercase && !/[a-z]/.test(password)) {
        return false;
    }
    
    if (req.requireNumbers && !/\d/.test(password)) {
        return false;
    }
    
    if (req.requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        return false;
    }
    
    return true;
}

/**
 * Валидация имени пользователя
 */
export function isValidUsername(username) {
    if (!username) return false;
    // Allow letters, numbers, underscore, dash. 3-20 characters
    return /^[a-zA-Z0-9_-]{3,20}$/.test(username);
}

/**
 * Валидация целого числа
 */
export function isValidInteger(value, min = -Infinity, max = Infinity) {
    const num = parseInt(value);
    if (isNaN(num)) return false;
    return num >= min && num <= max && num === parseFloat(value);
}

/**
 * Валидация положительного числа
 */
export function isPositiveNumber(value) {
    const num = parseFloat(value);
    return !isNaN(num) && num > 0;
}

/**
 * Валидация JSON строки
 */
export function isValidJSON(str) {
    try {
        JSON.parse(str);
        return true;
    } catch {
        return false;
    }
}

/**
 * Валидация HEX цвета
 */
export function isValidHexColor(color) {
    if (!color) return false;
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

/**
 * Проверка на пустое значение
 */
export function isEmpty(value) {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim() === '';
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
}

/**
 * Проверка на число
 */
export function isNumber(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
}

/**
 * Валидация диапазона дат
 */
export function isValidDateRange(startDate, endDate) {
    if (!isValidDate(startDate) || !isValidDate(endDate)) {
        return false;
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return start <= end;
}

/**
 * Валидация возраста
 */
export function isValidAge(birthDate, minAge = 18) {
    if (!isValidDate(birthDate)) return false;
    
    const birth = new Date(birthDate);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        return age - 1 >= minAge;
    }
    
    return age >= minAge;
}

/**
 * Валидация файла
 */
export function isValidFile(file, options = {}) {
    const {
        maxSize = 10 * 1024 * 1024, // 10MB default
        allowedTypes = [],
        allowedExtensions = []
    } = options;
    
    if (!file) return false;
    
    // Check size
    if (file.size > maxSize) {
        return false;
    }
    
    // Check MIME type
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
        return false;
    }
    
    // Check extension
    if (allowedExtensions.length > 0) {
        const ext = file.name.split('.').pop().toLowerCase();
        if (!allowedExtensions.includes(ext)) {
            return false;
        }
    }
    
    return true;
}

/**
 * Валидация IBAN
 */
export function isValidIBAN(iban) {
    if (!iban) return false;
    
    // Remove spaces and convert to uppercase
    const cleanIBAN = iban.replace(/\s/g, '').toUpperCase();
    
    // Check length (varies by country, but minimum is 15)
    if (cleanIBAN.length < 15) return false;
    
    // Basic IBAN format check
    return /^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/.test(cleanIBAN);
}

/**
 * Комплексная валидация формы
 */
export function validateForm(data, rules) {
    const errors = {};
    
    for (const field in rules) {
        const value = data[field];
        const fieldRules = rules[field];
        
        // Required check
        if (fieldRules.required && isEmpty(value)) {
            errors[field] = fieldRules.message || `${field} обязательно для заполнения`;
            continue;
        }
        
        // Skip validation if field is empty and not required
        if (isEmpty(value) && !fieldRules.required) {
            continue;
        }
        
        // Custom validator
        if (fieldRules.validator) {
            const result = fieldRules.validator(value, data);
            if (result !== true) {
                errors[field] = result || fieldRules.message || `${field} не прошло валидацию`;
            }
        }
        
        // Built-in validators
        if (fieldRules.type) {
            let isValid = true;
            
            switch (fieldRules.type) {
                case 'email':
                    isValid = isValidEmail(value);
                    break;
                case 'phone':
                    isValid = isValidPhone(value);
                    break;
                case 'url':
                    isValid = isValidURL(value);
                    break;
                case 'bscAddress':
                    isValid = isValidBSCAddress(value);
                    break;
                case 'number':
                    isValid = isNumber(value);
                    break;
                case 'integer':
                    isValid = isValidInteger(value);
                    break;
                case 'positive':
                    isValid = isPositiveNumber(value);
                    break;
            }
            
            if (!isValid) {
                errors[field] = fieldRules.message || `${field} имеет неверный формат`;
            }
        }
        
        // Min/Max length
        if (fieldRules.minLength && value.length < fieldRules.minLength) {
            errors[field] = fieldRules.message || `${field} должно быть не менее ${fieldRules.minLength} символов`;
        }
        
        if (fieldRules.maxLength && value.length > fieldRules.maxLength) {
            errors[field] = fieldRules.message || `${field} должно быть не более ${fieldRules.maxLength} символов`;
        }
        
        // Min/Max value
        if (fieldRules.min !== undefined && parseFloat(value) < fieldRules.min) {
            errors[field] = fieldRules.message || `${field} должно быть не менее ${fieldRules.min}`;
        }
        
        if (fieldRules.max !== undefined && parseFloat(value) > fieldRules.max) {
            errors[field] = fieldRules.message || `${field} должно быть не более ${fieldRules.max}`;
        }
        
        // Pattern
        if (fieldRules.pattern && !fieldRules.pattern.test(value)) {
            errors[field] = fieldRules.message || `${field} имеет неверный формат`;
        }
    }
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}

// Export all validators
export default {
    isValidBSCAddress,
    isValidTxHash,
    isValidEmail,
    isValidAmount,
    isValidPercent,
    isValidDate,
    isValidURL,
    isValidPhone,
    isValidPassword,
    isValidUsername,
    isValidInteger,
    isPositiveNumber,
    isValidJSON,
    isValidHexColor,
    isEmpty,
    isNumber,
    isValidDateRange,
    isValidAge,
    isValidFile,
    isValidIBAN,
    validateForm
};
