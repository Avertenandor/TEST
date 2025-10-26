/**
 * GENESIS 1.4.2 - Platform Access UI
 * MCP-MARKER:MODULE:PLATFORM_ACCESS_UI
 * UI компоненты для системы доступа
 */

export class PlatformAccessUI {
    constructor(config) {
        this.config = config;
        this.initStyles();
    }

    /**
     * Инициализация стилей
     */
    initStyles() {
        if (document.getElementById('platform-access-styles')) {
            return; // Стили уже добавлены
        }

        const accessStyles = document.createElement('style');
        accessStyles.id = 'platform-access-styles';
        accessStyles.textContent = `
            .access-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                max-width: 400px;
                background: rgba(0, 0, 0, 0.9);
                border-radius: 10px;
                padding: 0;
                z-index: 1001;
                transform: translateX(100%);
                transition: transform 0.3s ease;
                border: 1px solid #333;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            }

            .access-notification.show {
                transform: translateX(0);
            }

            .access-notification.error {
                border-color: #ff4757;
            }

            .access-notification.warning {
                border-color: #ffa726;
            }

            .access-notification.success {
                border-color: #00ff41;
            }

            .notification-content {
                display: flex;
                align-items: center;
                gap: 1rem;
                padding: 1rem;
            }

            .notification-icon {
                font-size: 1.5rem;
                flex-shrink: 0;
            }

            .notification-text {
                flex: 1;
                color: white;
            }

            .notification-text strong {
                display: block;
                margin-bottom: 0.5rem;
                font-size: 1rem;
            }

            .notification-text p {
                margin: 0;
                font-size: 0.9rem;
                opacity: 0.8;
            }

            .notification-btn, .notification-close {
                background: #ff6b35;
                color: white;
                border: none;
                padding: 0.5rem 1rem;
                border-radius: 5px;
                cursor: pointer;
                font-size: 0.9rem;
                transition: background 0.3s ease;
            }

            .notification-btn:hover {
                background: #e55a2b;
            }

            .notification-close {
                background: transparent;
                color: #999;
                padding: 0.25rem 0.5rem;
                margin-left: 0.5rem;
            }

            .notification-close:hover {
                color: white;
                background: rgba(255, 255, 255, 0.1);
            }

            /* Модальное окно - стили */
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
                opacity: 0;
                transition: opacity 0.3s ease;
            }

            .modal-overlay.show {
                opacity: 1;
            }

            .access-payment-modal {
                background: #1a1a2e;
                border-radius: 15px;
                max-width: 600px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
                border: 1px solid #333;
            }

            @media (max-width: 768px) {
                .access-notification {
                    top: 10px;
                    right: 10px;
                    left: 10px;
                    max-width: none;
                }

                .access-payment-modal {
                    width: 95%;
                    margin: 1rem;
                }
            }
        `;
        document.head.appendChild(accessStyles);
    }

    /**
     * Обновление UI статуса доступа
     */
    updateAccessStatus(accessData) {
        const accessStatusEl = document.getElementById('access-status');
        const accessDaysEl = document.getElementById('access-days-remaining');
        const accessBalanceEl = document.getElementById('access-balance');

        if (accessStatusEl) {
            accessStatusEl.textContent = accessData.isActive ? 'Активен' : 'Неактивен';
            accessStatusEl.className = `access-status ${accessData.isActive ? 'active' : 'inactive'}`;
        }

        if (accessDaysEl) {
            accessDaysEl.textContent = accessData.daysRemaining || 0;
        }

        if (accessBalanceEl) {
            accessBalanceEl.textContent = `$${(accessData.totalUSDT || 0).toFixed(2)}`;
        }

        // Обновляем прогресс-бар если есть
        const progressBar = document.getElementById('access-progress');
        if (progressBar && accessData.accessDays > 0) {
            const usedDays = accessData.accessDays - accessData.daysRemaining;
            const progressPercent = (usedDays / accessData.accessDays) * 100;
            progressBar.style.width = `${Math.min(100, Math.max(0, progressPercent))}%`;
        }
    }

    /**
     * Показать уведомление о требовании доступа
     */
    showAccessRequired() {
        const existingNotification = document.getElementById('access-required-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.id = 'access-required-notification';
        notification.className = 'access-notification error';
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">🔒</div>
                <div class="notification-text">
                    <strong>Доступ к платформе заблокирован</strong>
                    <p>Оплатите доступ от $10 USDT (10 дней) для продолжения работы</p>
                </div>
                <button class="notification-btn" onclick="window.GenesisPlatformAccess.showPaymentModal()">
                    Оплатить доступ
                </button>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
    }

    /**
     * Показать предупреждение об истечении доступа
     */
    showAccessWarning(daysRemaining) {
        const existingWarning = document.getElementById('access-warning-notification');
        if (existingWarning) {
            existingWarning.remove();
        }

        const warning = document.createElement('div');
        warning.id = 'access-warning-notification';
        warning.className = 'access-notification warning';
        warning.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">⚠️</div>
                <div class="notification-text">
                    <strong>Доступ истекает через ${daysRemaining} дней</strong>
                    <p>Продлите доступ, чтобы избежать блокировки функций</p>
                </div>
                <button class="notification-btn" onclick="window.GenesisPlatformAccess.showPaymentModal()">
                    Продлить
                </button>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        document.body.appendChild(warning);

        setTimeout(() => {
            warning.classList.add('show');
        }, 100);

        setTimeout(() => {
            if (warning.parentElement) {
                warning.remove();
            }
        }, 10000);
    }

    /**
     * Показать уведомление об успехе
     */
    showSuccess(daysRemaining) {
        const notification = document.createElement('div');
        notification.className = 'access-notification success';
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">✅</div>
                <div class="notification-text">
                    <strong>Доступ успешно активирован!</strong>
                    <p>Доступ к платформе: ${daysRemaining} дней</p>
                </div>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    /**
     * Скрыть уведомление о требовании доступа
     */
    hideAccessRequired() {
        const notification = document.getElementById('access-required-notification');
        if (notification) {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }
    }

    /**
     * Блокировка функций
     */
    blockFunctions() {
        // Блокируем доступ к депозитам
        const depositButtons = document.querySelectorAll('.deposit-btn, .create-deposit-btn');
        depositButtons.forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = '0.5';
            btn.title = 'Требуется оплата доступа к платформе';
        });

        // Блокируем навигацию в кабинете
        const cabinetLinks = document.querySelectorAll('.cabinet-nav-link');
        cabinetLinks.forEach(link => {
            if (!link.getAttribute('data-page') || link.getAttribute('data-page') === 'access') {
                return;
            }
            link.style.pointerEvents = 'none';
            link.style.opacity = '0.5';
            link.title = 'Требуется оплата доступа к платформе';
        });

        this.showAccessRequired();
    }

    /**
     * Разблокировка функций
     */
    unblockFunctions() {
        const depositButtons = document.querySelectorAll('.deposit-btn, .create-deposit-btn');
        depositButtons.forEach(btn => {
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.title = '';
        });

        const cabinetLinks = document.querySelectorAll('.cabinet-nav-link');
        cabinetLinks.forEach(link => {
            link.style.pointerEvents = 'auto';
            link.style.opacity = '1';
            link.title = '';
        });

        this.hideAccessRequired();
    }

    /**
     * Генерация QR кода
     */
    generateQRCode(containerId, data) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';

        if (window.QRCode) {
            try {
                new window.QRCode(container, {
                    text: data,
                    width: 200,
                    height: 200,
                    colorDark: '#000000',
                    colorLight: '#ffffff',
                    correctLevel: window.QRCode.CorrectLevel.M
                });
            } catch (error) {
                console.error('Ошибка генерации QR кода:', error);
                container.innerHTML = `
                    <div class="qr-fallback">
                        <div class="qr-placeholder">📱 QR КОД</div>
                        <p>Используйте адрес выше для оплаты</p>
                    </div>
                `;
            }
        } else {
            container.innerHTML = `
                <div class="qr-fallback">
                    <div class="qr-placeholder">📱 QR КОД</div>
                    <p>Используйте адрес выше для оплаты</p>
                </div>
            `;
        }
    }
}
