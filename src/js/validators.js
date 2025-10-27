/**
 * GENESIS 1.1 - Validators
 * Функции валидации для BSC адресов и других данных
 */

/**
 * Проверка валидности BSC адреса (Ethereum-compatible)
 * @param {string} address - адрес для проверки
 * @returns {boolean} - true если адрес валиден
 */
export function isHexAddressBSC(address) {
  if (!address || typeof address !== 'string') {
    return false;
  }

  // BSC адрес должен начинаться с 0x и содержать 40 hex символов
  const hexPattern = /^0x[a-fA-F0-9]{40}$/;
  return hexPattern.test(address);
}

/**
 * Debounce функция для отложенного выполнения
 * @param {Function} fn - функция для вызова
 * @param {number} ms - задержка в миллисекундах (по умолчанию 300мс)
 * @returns {Function} - debounced функция
 */
export function debounce(fn, ms = 300) {
  let timeoutId;

  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
}

/**
 * Normalize адрес (lowercase + trim)
 * @param {string} address - адрес для нормализации
 * @returns {string} - нормализованный адрес
 */
export function normalizeAddress(address) {
  if (!address || typeof address !== 'string') {
    return '';
  }
  return address.trim().toLowerCase();
}

/**
 * Валидация email
 * @param {string} email - email для проверки
 * @returns {boolean} - true если email валиден
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

/**
 * Валидация числа
 * @param {string|number} value - значение для проверки
 * @returns {boolean} - true если число валидно
 */
export function isValidNumber(value) {
  if (value === null || value === undefined || value === '') {
    return false;
  }

  const num = Number(value);
  return !isNaN(num) && isFinite(num);
}

/**
 * Валидация положительного числа
 * @param {string|number} value - значение для проверки
 * @returns {boolean} - true если число положительное
 */
export function isPositiveNumber(value) {
  return isValidNumber(value) && Number(value) > 0;
}
