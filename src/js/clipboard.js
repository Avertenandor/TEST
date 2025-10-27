/**
 * GENESIS 1.1 - Clipboard Utilities
 * Функции для копирования текста в буфер обмена
 */

import { showToast } from './ui.js';

/**
 * Копировать текст в буфер обмена
 * @param {string} text - текст для копирования
 * @returns {Promise<boolean>} - true если успешно скопировано
 */
export async function copy(text) {
  if (!text || typeof text !== 'string') {
    showToast('Нечего копировать', 'error');
    return false;
  }

  try {
    // Современный Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      showToast('Скопировано в буфер обмена', 'success');
      return true;
    }

    // Fallback для старых браузеров
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.top = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);

      if (successful) {
        showToast('Скопировано в буфер обмена', 'success');
        return true;
      } else {
        throw new Error('execCommand failed');
      }
    } catch (err) {
      document.body.removeChild(textArea);
      throw err;
    }
  } catch (error) {
    console.error('Clipboard copy failed:', error);
    showToast('Не удалось скопировать. Попробуйте вручную.', 'error');
    return false;
  }
}

/**
 * Проверить доступность Clipboard API
 * @returns {boolean} - true если Clipboard API доступен
 */
export function isClipboardAvailable() {
  return !!(navigator.clipboard && navigator.clipboard.writeText);
}

/**
 * Добавить обработчик копирования на кнопку
 * @param {HTMLElement} button - кнопка
 * @param {string|Function} textOrGetter - текст или функция возвращающая текст
 */
export function setupCopyButton(button, textOrGetter) {
  if (!button) {
    console.error('setupCopyButton: button is required');
    return;
  }

  button.addEventListener('click', async (e) => {
    e.preventDefault();

    const text = typeof textOrGetter === 'function'
      ? textOrGetter()
      : textOrGetter;

    await copy(text);
  });
}
