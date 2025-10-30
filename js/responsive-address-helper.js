/**
 * GENESIS 1.1 - Responsive Address Helper
 *
 * Утилита для адаптивного отображения криптовалютных адресов:
 * - Автоматическое сокращение на мобильных устройствах
 * - Полные адреса на десктопе
 * - Копирование в буфер обмена
 */

(function() {
    'use strict';

    /**
     * Truncate address for mobile display
     * @param {string} address - Full blockchain address
     * @param {number} startChars - Characters to show at start (default: 6)
     * @param {number} endChars - Characters to show at end (default: 4)
     * @returns {string} Truncated address
     */
    function truncateAddress(address, startChars = 6, endChars = 4) {
        if (!address || address.length <= startChars + endChars + 3) {
            return address;
        }
        return `${address.slice(0, startChars)}…${address.slice(-endChars)}`;
    }

    /**
     * Check if device is mobile
     * @returns {boolean}
     */
    function isMobileDevice() {
        return window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    /**
     * Apply responsive address formatting
     */
    function applyResponsiveAddresses() {
        const addressSelectors = [
            '.auth-address',
            '.contract-address',
            '.address-display-box code',
            'code[class*="0x"]'
        ];

        addressSelectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(element => {
                const fullAddress = element.textContent.trim();

                // Store full address in data attribute
                if (!element.dataset.fullAddress) {
                    element.dataset.fullAddress = fullAddress;
                }

                // Apply truncation on mobile
                if (isMobileDevice() && fullAddress.startsWith('0x')) {
                    const shortAddress = truncateAddress(fullAddress);
                    element.dataset.shortAddress = shortAddress;
                    element.textContent = shortAddress;
                    element.title = fullAddress; // Show full on hover/long press
                } else {
                    element.textContent = element.dataset.fullAddress || fullAddress;
                }
            });
        });
    }

    /**
     * Copy address to clipboard
     * @param {string} elementId - Element containing address
     */
    window.copyAddressToClipboard = function(elementId) {
        const element = document.getElementById(elementId) || document.querySelector(`.${elementId}`);
        if (!element) return;

        const fullAddress = element.dataset.fullAddress || element.textContent.trim();

        navigator.clipboard.writeText(fullAddress).then(() => {
            showCopyNotification(element, 'Скопировано!');
        }).catch(() => {
            // Fallback для старых браузеров
            fallbackCopyToClipboard(fullAddress);
            showCopyNotification(element, 'Скопировано!');
        });
    };

    /**
     * Fallback copy method for older browsers
     */
    function fallbackCopyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
    }

    /**
     * Show copy notification
     */
    function showCopyNotification(element, message) {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: absolute;
            background: rgba(78, 205, 196, 0.95);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            font-size: 0.875rem;
            font-weight: 600;
            z-index: 10000;
            pointer-events: none;
            animation: fadeInOut 2s ease-in-out;
        `;

        const rect = element.getBoundingClientRect();
        notification.style.top = `${rect.top + window.scrollY - 40}px`;
        notification.style.left = `${rect.left + window.scrollX}px`;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 2000);
    }

    /**
     * Enhanced copy functions for specific addresses
     */
    window.copyAuthAddress = function() {
        const authAddress = document.querySelector('.auth-address');
        if (authAddress) {
            const address = authAddress.dataset.fullAddress || authAddress.textContent;
            navigator.clipboard.writeText(address).then(() => {
                showCopyNotification(authAddress, '✅ Адрес авторизации скопирован');
            });
        }
    };

    window.copyTokenAddress = function() {
        const tokenAddress = document.querySelector('.contract-address');
        if (tokenAddress) {
            const address = tokenAddress.dataset.fullAddress || tokenAddress.textContent;
            navigator.clipboard.writeText(address).then(() => {
                showCopyNotification(tokenAddress, '✅ Адрес контракта скопирован');
            });
        }
    };

    /**
     * Initialize on DOM ready
     */
    function init() {
        applyResponsiveAddresses();

        // Reapply on window resize with debounce
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                applyResponsiveAddresses();
            }, 250);
        });

        // Reapply when DOM changes (for dynamically loaded content)
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.addedNodes.length) {
                    applyResponsiveAddresses();
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        console.log('✅ Responsive Address Helper initialized');
    }

    // Auto-initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Add fadeInOut animation
    if (!document.getElementById('responsive-helper-styles')) {
        const style = document.createElement('style');
        style.id = 'responsive-helper-styles';
        style.textContent = `
            @keyframes fadeInOut {
                0% { opacity: 0; transform: translateY(-10px); }
                15% { opacity: 1; transform: translateY(0); }
                85% { opacity: 1; transform: translateY(0); }
                100% { opacity: 0; transform: translateY(-10px); }
            }

            /* Адреса кликабельны для копирования */
            .auth-address,
            .contract-address,
            .address-display-box code {
                cursor: pointer;
                transition: color 0.2s;
            }

            .auth-address:hover,
            .contract-address:hover,
            .address-display-box:hover code {
                color: #4ecdc4;
            }
        `;
        document.head.appendChild(style);
    }

    // Export to global scope
    window.GenesisResponsiveHelper = {
        truncateAddress,
        isMobileDevice,
        applyResponsiveAddresses,
        copyAddressToClipboard: window.copyAddressToClipboard
    };

})();
