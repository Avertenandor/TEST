/**
 * GENESIS 1.1 - Responsive Helper Functions
 * Вспомогательные функции для адаптивности
 */

(function() {
    'use strict';

    /**
     * Сокращает длинный адрес/хеш до компактного формата
     * @param {string} str - Исходная строка (адрес, хеш)
     * @param {number} prefixLength - Длина начала (по умолчанию 6)
     * @param {number} suffixLength - Длина конца (по умолчанию 6)
     * @returns {string} Сокращённая строка
     */
    function truncateAddress(str, prefixLength = 6, suffixLength = 6) {
        if (!str || str.length <= prefixLength + suffixLength) {
            return str;
        }
        return str.slice(0, prefixLength) + '…' + str.slice(-suffixLength);
    }

    /**
     * Определяет, является ли текущее устройство мобильным
     * @returns {boolean}
     */
    function isMobile() {
        return window.innerWidth <= 767;
    }

    /**
     * Определяет, является ли текущее устройство узким мобильным
     * @returns {boolean}
     */
    function isNarrowMobile() {
        return window.innerWidth <= 480;
    }

    /**
     * Инициализирует сокращение адресов для элементов с data-address
     * Автоматически сокращает адреса на мобильных устройствах
     */
    function initAddressTruncation() {
        // Находим все элементы с атрибутом data-address
        const addressElements = document.querySelectorAll('[data-address]');

        addressElements.forEach(el => {
            const fullAddress = el.dataset.address || el.textContent.trim();

            // Сохраняем полный адрес
            if (!el.dataset.full) {
                el.dataset.full = fullAddress;
            }

            // Функция обновления отображения
            const updateDisplay = () => {
                if (isNarrowMobile()) {
                    // На узких экранах - сокращаем
                    el.textContent = truncateAddress(el.dataset.full, 6, 6);
                    el.title = el.dataset.full; // Подсказка с полным адресом
                } else {
                    // На широких - показываем полностью
                    el.textContent = el.dataset.full;
                }
            };

            // Применяем при загрузке
            updateDisplay();

            // Обновляем при изменении размера окна
            let resizeTimeout;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(updateDisplay, 100);
            });
        });
    }

    /**
     * Инициализирует копирование адресов по клику
     * Автоматически добавляет функционал копирования для элементов с классом .copy-btn
     */
    function initCopyButtons() {
        const copyButtons = document.querySelectorAll('.copy-btn');

        copyButtons.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();

                // Ищем ближайший элемент с адресом
                const container = btn.closest('.system-address-container, .address-container, .step-content');
                const addressElement = container?.querySelector('[data-full], code, .address, .system-address');

                if (!addressElement) {
                    console.warn('Address element not found for copy button');
                    return;
                }

                const textToCopy = addressElement.dataset.full || addressElement.textContent.trim();

                try {
                    // Современный API буфера обмена
                    if (navigator.clipboard && window.isSecureContext) {
                        await navigator.clipboard.writeText(textToCopy);
                    } else {
                        // Фолбэк для старых браузеров
                        const textarea = document.createElement('textarea');
                        textarea.value = textToCopy;
                        textarea.style.position = 'fixed';
                        textarea.style.opacity = '0';
                        document.body.appendChild(textarea);
                        textarea.select();
                        document.execCommand('copy');
                        document.body.removeChild(textarea);
                    }

                    // Визуальная обратная связь
                    const originalIcon = btn.innerHTML;
                    btn.innerHTML = '<span class="copy-icon">✅</span>';
                    btn.classList.add('success');

                    setTimeout(() => {
                        btn.innerHTML = originalIcon;
                        btn.classList.remove('success');
                    }, 2000);

                } catch (err) {
                    console.error('Failed to copy address:', err);

                    // Показываем ошибку
                    const originalIcon = btn.innerHTML;
                    btn.innerHTML = '<span class="copy-icon">❌</span>';
                    btn.classList.add('error');

                    setTimeout(() => {
                        btn.innerHTML = originalIcon;
                        btn.classList.remove('error');
                    }, 2000);
                }
            });
        });
    }

    /**
     * Добавляет safe area padding для iOS устройств
     */
    function applySafeAreaPadding() {
        const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

        if (iOS) {
            document.documentElement.classList.add('ios-device');

            // Проверяем наличие вырезов (notch)
            const hasNotch = window.CSS?.supports('padding-top: env(safe-area-inset-top)');

            if (hasNotch) {
                document.documentElement.classList.add('ios-notch');
            }
        }
    }

    /**
     * Оптимизирует производительность прокрутки на touch-устройствах
     */
    function optimizeScrollPerformance() {
        if ('ontouchstart' in window) {
            // Добавляем momentum scrolling для iOS
            document.body.style.webkitOverflowScrolling = 'touch';

            // Отключаем pull-to-refresh на Android Chrome
            document.body.style.overscrollBehavior = 'none';
        }
    }

    /**
     * Инициализирует адаптивную навигацию по вкладкам на мобилках
     */
    function initMobileTabsScroll() {
        const tabContainers = document.querySelectorAll('.device-tabs, .tabs-container');

        tabContainers.forEach(container => {
            if (isMobile()) {
                // Добавляем индикатор прокрутки
                container.classList.add('scrollable');

                // Автоматически прокручиваем к активной вкладке
                const activeTab = container.querySelector('.tab-btn.active');
                if (activeTab) {
                    setTimeout(() => {
                        activeTab.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                    }, 100);
                }
            }
        });
    }

    /**
     * Предотвращает автозум на iOS при фокусе на input
     */
    function preventIOSAutoZoom() {
        const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

        if (iOS) {
            // Находим все input/textarea с размером шрифта меньше 16px
            const inputs = document.querySelectorAll('input, textarea, select');

            inputs.forEach(input => {
                const fontSize = window.getComputedStyle(input).fontSize;
                const fontSizeValue = parseFloat(fontSize);

                if (fontSizeValue < 16) {
                    // Устанавливаем минимум 16px для предотвращения зума
                    input.style.fontSize = '16px';
                }
            });
        }
    }

    /**
     * Главная функция инициализации
     */
    function init() {
        // Ждём полной загрузки DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initAll);
        } else {
            initAll();
        }
    }

    /**
     * Инициализирует все responsive хелперы
     */
    function initAll() {
        console.log('🎨 Initializing Responsive Helpers...');

        try {
            initAddressTruncation();
            initCopyButtons();
            applySafeAreaPadding();
            optimizeScrollPerformance();
            initMobileTabsScroll();
            preventIOSAutoZoom();

            console.log('✅ Responsive Helpers initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing Responsive Helpers:', error);
        }
    }

    // Экспортируем функции в глобальную область для использования в других скриптах
    window.GENESIS = window.GENESIS || {};
    window.GENESIS.responsive = {
        truncateAddress,
        isMobile,
        isNarrowMobile,
        initAddressTruncation,
        initCopyButtons,
        applySafeAreaPadding,
        optimizeScrollPerformance,
        initMobileTabsScroll,
        preventIOSAutoZoom
    };

    // Автоматическая инициализация
    init();

})();
