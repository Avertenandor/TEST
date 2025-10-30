/**
 * GENESIS Platform - Responsive Design Helpers
 * Вспомогательные функции для улучшения адаптивности
 * Версия: 1.0.0
 */

/**
 * Утилита для truncation длинных адресов кошельков
 * @param {string} address - Полный адрес кошелька
 * @param {number} startChars - Количество символов в начале (по умолчанию 6)
 * @param {number} endChars - Количество символов в конце (по умолчанию 4)
 * @returns {string} Сокращенный адрес
 */
export function truncateAddress(address, startChars = 6, endChars = 4) {
    if (!address || typeof address !== 'string') {
        return '';
    }

    if (address.length <= startChars + endChars) {
        return address;
    }

    return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Создает элемент с truncated адресом и tooltip
 * @param {string} fullAddress - Полный адрес
 * @param {boolean} enableCopy - Включить функцию копирования
 * @returns {HTMLElement}
 */
export function createTruncatedAddressElement(fullAddress, enableCopy = true) {
    const container = document.createElement('div');
    container.className = 'address-container';

    // Создаем элемент с truncated адресом
    const addressDisplay = document.createElement('div');
    addressDisplay.className = 'address-truncated';
    addressDisplay.setAttribute('title', fullAddress);
    addressDisplay.setAttribute('aria-label', `Адрес кошелька: ${fullAddress}`);

    // Проверяем размер экрана
    const deviceType = getDeviceType();

    if (deviceType.isMobile) {
        // На мобильных показываем truncated версию
        const start = document.createElement('span');
        start.className = 'address-start';
        start.textContent = fullAddress.slice(0, 6);

        const dots = document.createElement('span');
        dots.className = 'address-dots';
        dots.textContent = '...';

        const end = document.createElement('span');
        end.className = 'address-end';
        end.textContent = fullAddress.slice(-4);

        addressDisplay.appendChild(start);
        addressDisplay.appendChild(dots);
        addressDisplay.appendChild(end);
    } else {
        // На десктопе показываем полный адрес
        addressDisplay.textContent = fullAddress;
        addressDisplay.className = 'address-display';
    }

    container.appendChild(addressDisplay);

    // Добавляем кнопку копирования, если нужно
    if (enableCopy) {
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn genesis-btn-copy';
        copyBtn.setAttribute('aria-label', 'Копировать адрес');
        copyBtn.innerHTML = `
            <svg class="copy-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            <span class="btn-text">Копировать</span>
        `;

        copyBtn.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(fullAddress);

                // Показываем уведомление об успешном копировании
                copyBtn.innerHTML = `
                    <svg class="copy-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span class="btn-text">Скопировано!</span>
                `;
                copyBtn.classList.add('success');

                setTimeout(() => {
                    copyBtn.innerHTML = `
                        <svg class="copy-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                        <span class="btn-text">Копировать</span>
                    `;
                    copyBtn.classList.remove('success');
                }, 2000);
            } catch (err) {
                console.error('Ошибка копирования:', err);

                // Fallback для старых браузеров
                const textArea = document.createElement('textarea');
                textArea.value = fullAddress;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();

                try {
                    document.execCommand('copy');
                    copyBtn.textContent = 'Скопировано!';
                    setTimeout(() => {
                        copyBtn.textContent = 'Копировать';
                    }, 2000);
                } catch (err) {
                    console.error('Fallback копирование не удалось:', err);
                }

                document.body.removeChild(textArea);
            }
        });

        container.appendChild(copyBtn);
    }

    return container;
}

/**
 * Определяет тип устройства
 * @returns {Object} Информация о типе устройства
 */
export function getDeviceType() {
    const width = window.innerWidth;

    return {
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        isSmallMobile: width < 480,
        isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
        width
    };
}

/**
 * Обработчик изменения размера окна с debounce
 * @param {Function} callback - Функция для выполнения
 * @param {number} delay - Задержка в мс (по умолчанию 250)
 * @returns {Function}
 */
export function debounceResize(callback, delay = 250) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => callback.apply(this, args), delay);
    };
}

/**
 * Адаптивный обработчик для всех элементов с адресами
 */
export function initResponsiveAddresses() {
    const addressElements = document.querySelectorAll('.system-address, .genesis-address, .wallet-address');

    addressElements.forEach(element => {
        const fullAddress = element.textContent.trim();
        const deviceType = getDeviceType();

        // На мобильных обновляем отображение
        if (deviceType.isMobile && fullAddress.length > 20) {
            const truncated = truncateAddress(fullAddress);
            element.textContent = truncated;
            element.setAttribute('title', fullAddress);
            element.setAttribute('data-full-address', fullAddress);

            // Добавляем возможность показать полный адрес по клику
            element.style.cursor = 'pointer';
            if (!element.hasAttribute('data-listener-added')) {
                element.addEventListener('click', function() {
                    if (this.textContent === truncated) {
                        this.textContent = fullAddress;
                    } else {
                        this.textContent = truncated;
                    }
                });
                element.setAttribute('data-listener-added', 'true');
            }
        }
    });
}

/**
 * Улучшает доступность для touch устройств
 */
export function enhanceTouchTargets() {
    const deviceType = getDeviceType();

    if (deviceType.isTouchDevice) {
        // Добавляем класс к body для применения touch-стилей из CSS
        document.body.classList.add('touch-device');
        
        // Все кнопки и интерактивные элементы
        const interactiveElements = document.querySelectorAll('button, a, .clickable, [role="button"]');

        interactiveElements.forEach(element => {
            const rect = element.getBoundingClientRect();
            const minSize = 44; // Минимальный размер для Apple HIG

            if (rect.width < minSize || rect.height < minSize) {
                // Добавляем класс для увеличения области касания
                element.classList.add('touch-target-enhanced');
            }
        });
    }
}

/**
 * Применяет safe area insets для iOS
 */
export function applySafeAreaInsets() {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    if (isIOS) {
        document.documentElement.style.setProperty('--safe-area-inset-top', 'env(safe-area-inset-top)');
        document.documentElement.style.setProperty('--safe-area-inset-right', 'env(safe-area-inset-right)');
        document.documentElement.style.setProperty('--safe-area-inset-bottom', 'env(safe-area-inset-bottom)');
        document.documentElement.style.setProperty('--safe-area-inset-left', 'env(safe-area-inset-left)');
    }
}

/**
 * Инициализация всех улучшений адаптивности
 */
export function initResponsiveEnhancements() {
    // Применяем safe area для iOS
    applySafeAreaInsets();

    // Инициализируем обработку адресов
    initResponsiveAddresses();

    // Улучшаем touch targets
    enhanceTouchTargets();

    // Добавляем информацию о типе устройства в body
    const deviceType = getDeviceType();
    document.body.classList.add(
        deviceType.isMobile ? 'device-mobile' :
        deviceType.isTablet ? 'device-tablet' :
        'device-desktop'
    );

    if (deviceType.isTouchDevice) {
        document.body.classList.add('touch-device');
    }

    // Проверяем наличие кнопки терминала и добавляем класс для fallback
    // для браузеров без поддержки :has()
    const terminalBtn = document.querySelector('.terminal-open-btn, .floating-terminal-btn');
    if (terminalBtn) {
        document.body.classList.add('has-terminal-btn');
    }
    
    // Наблюдаем за добавлением кнопки терминала в DOM
    const observer = new MutationObserver(() => {
        const btn = document.querySelector('.terminal-open-btn, .floating-terminal-btn');
        if (btn) {
            document.body.classList.add('has-terminal-btn');
        } else {
            document.body.classList.remove('has-terminal-btn');
        }
    });
    
    observer.observe(document.body, { childList: true, subtree: true });

    // Обработчик изменения размера окна
    let previousDeviceType = deviceType.isMobile ? 'mobile' : deviceType.isTablet ? 'tablet' : 'desktop';
    
    const handleResize = debounceResize(() => {
        const newDeviceType = getDeviceType();
        const currentDeviceType = newDeviceType.isMobile ? 'mobile' : newDeviceType.isTablet ? 'tablet' : 'desktop';

        // Обновляем классы устройства
        document.body.classList.remove('device-mobile', 'device-tablet', 'device-desktop');
        document.body.classList.add(
            newDeviceType.isMobile ? 'device-mobile' :
            newDeviceType.isTablet ? 'device-tablet' :
            'device-desktop'
        );

        // Переинициализируем адреса только при изменении типа устройства
        if (previousDeviceType !== currentDeviceType) {
            // Сбрасываем атрибуты для повторной инициализации
            const addressElements = document.querySelectorAll('.system-address, .genesis-address, .wallet-address');
            addressElements.forEach(element => {
                element.removeAttribute('data-listener-added');
            });
            initResponsiveAddresses();
            previousDeviceType = currentDeviceType;
        }
    });

    window.addEventListener('resize', handleResize);

    // Обработчик изменения ориентации
    window.addEventListener('orientationchange', () => {
        setTimeout(() => {
            handleResize();
        }, 100);
    });

    console.log('✅ Responsive enhancements initialized');
    console.log('📱 Device type:', deviceType);
}

// Автоматическая инициализация при загрузке DOM
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initResponsiveEnhancements);
    } else {
        initResponsiveEnhancements();
    }
}
