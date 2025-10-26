/**
 * GENESIS 1.4.2 - Platform Access Service (Refactored)
 * MCP-MARKER:MODULE:PLATFORM_ACCESS_REFACTORED
 *
 * УЛУЧШЕНИЯ:
 * - Убран demo mode bypass (security fix)
 * - Разбито на модули (config, checker, ui, monitor)
 * - Улучшена структура кода
 * - Уменьшен размер файла с 983 до ~200 строк основного кода
 */

import { PlatformAccessConfig } from './platform-access/config.js';
import { PlatformAccessChecker } from './platform-access/checker.js';
import { PlatformAccessUI } from './platform-access/ui.js';
import { PlatformAccessMonitor } from './platform-access/monitor.js';

class GenesisPlatformAccessService {
    constructor() {
        this.config = new PlatformAccessConfig();
        this.checker = new PlatformAccessChecker(this.config);
        this.ui = new PlatformAccessUI(this.config);
        this.monitor = new PlatformAccessMonitor(this.config, this.checker, this.ui);
    }

    /**
     * Инициализация системы доступа
     */
    async init() {
        console.log('💳 Инициализация системы оплаты доступа (refactored)...');

        if (window.GenesisTerminal) {
            window.GenesisTerminal.log('💳 Система доступа: инициализация...', 'system');
        }

        // Запускаем периодическую проверку
        this.monitor.startMonitoring();

        return true;
    }

    /**
     * Проверка доступа пользователя
     */
    async checkUserAccessBalance(userAddress) {
        return await this.checker.checkUserAccess(userAddress);
    }

    /**
     * Генерация данных для QR кода оплаты
     */
    generateAccessPaymentQR(amount = 10) {
        if (!this.config.isValidPaymentAmount(amount)) {
            console.warn(`⚠️ Неверная сумма: ${amount}. Допустимо: $${this.config.minPayment}-$${this.config.maxPayment}`);
            amount = this.config.minPayment;
        }

        const accessAddress = this.config.getAccessAddress();
        const usdtAddress = this.config.getUSDTAddress();

        // Формируем данные для QR кода
        const qrData = {
            address: accessAddress,
            amount: amount,
            token: 'USDT',
            purpose: 'platform_access'
        };

        // Создаем простую ссылку для кошелька
        const transferUrl = `https://link.trustwallet.com/send?coin=20000714&address=${accessAddress}&amount=${amount}&token_id=${usdtAddress}`;

        return {
            url: transferUrl,
            qrData: transferUrl,
            amount: amount,
            currency: 'USDT',
            address: accessAddress,
            days: this.config.calculateDaysFromAmount(amount),
            description: `Оплата доступа к платформе на ${this.config.calculateDaysFromAmount(amount)} дней`
        };
    }

    /**
     * Показать модальное окно оплаты
     */
    showPaymentModal(defaultAmount = 10) {
        const modal = document.createElement('div');
        modal.id = 'access-payment-modal';
        modal.className = 'modal-overlay';

        const paymentData = this.generateAccessPaymentQR(defaultAmount);

        modal.innerHTML = `
            <div class="modal-content access-payment-modal">
                <div class="modal-header">
                    <h2>💳 Оплата доступа к платформе</h2>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
                </div>

                <div class="modal-body">
                    <div class="payment-info">
                        <div class="payment-details">
                            <h3>Стоимость доступа</h3>
                            <div class="price-info">
                                <div class="price-item">
                                    <span>Стоимость:</span>
                                    <strong>$1 в день</strong>
                                </div>
                                <div class="price-item">
                                    <span>Минимум:</span>
                                    <strong>$10 (10 дней)</strong>
                                </div>
                                <div class="price-item">
                                    <span>К оплате:</span>
                                    <strong>$${defaultAmount} (${defaultAmount} дней)</strong>
                                </div>
                            </div>
                        </div>

                        <div class="payment-qr">
                            <h3>QR код для оплаты</h3>
                            <div id="access-payment-qr" class="qr-container"></div>
                            <div class="payment-address">
                                <label>Адрес для оплаты:</label>
                                <div class="address-container">
                                    <code class="payment-address-value">${paymentData.address}</code>
                                    <button class="copy-btn" onclick="window.GenesisUtils.copyToClipboard('${paymentData.address}')">📋</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="payment-instructions">
                        <h3>Инструкция по оплате</h3>
                        <ol>
                            <li>Отправьте от <strong>$10 до $100 USDT</strong> на указанный адрес</li>
                            <li>Каждый $1 USDT = 1 день доступа к платформе</li>
                            <li>Доступ активируется автоматически в течение 1-2 минут</li>
                            <li>При нулевом балансе все функции блокируются</li>
                        </ol>
                    </div>

                    <div class="payment-amounts">
                        <h3>Быстрая оплата</h3>
                        <div class="amount-buttons">
                            <button class="amount-btn" onclick="window.GenesisPlatformAccess.updatePaymentAmount(10)">$10 (10 дней)</button>
                            <button class="amount-btn" onclick="window.GenesisPlatformAccess.updatePaymentAmount(30)">$30 (30 дней)</button>
                            <button class="amount-btn" onclick="window.GenesisPlatformAccess.updatePaymentAmount(60)">$60 (60 дней)</button>
                            <button class="amount-btn" onclick="window.GenesisPlatformAccess.updatePaymentAmount(100)">$100 (100 дней)</button>
                        </div>
                    </div>
                </div>

                <div class="modal-footer">
                    <button class="btn-secondary" onclick="this.closest('.modal-overlay').remove()">Закрыть</button>
                    <button class="btn-primary" onclick="window.GenesisPlatformAccess.startPaymentMonitoring()">Отслеживать оплату</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Генерируем QR код
        this.ui.generateQRCode('access-payment-qr', paymentData.qrData);

        // Анимация появления
        setTimeout(() => {
            modal.classList.add('show');
        }, 100);
    }

    /**
     * Обновить сумму оплаты в модальном окне
     */
    updatePaymentAmount(amount) {
        const modal = document.getElementById('access-payment-modal');
        if (!modal) return;

        const paymentData = this.generateAccessPaymentQR(amount);

        // Обновляем сумму к оплате
        const amountElement = modal.querySelector('.price-item:last-child strong');
        if (amountElement) {
            amountElement.textContent = `$${amount} (${amount} дней)`;
        }

        // Обновляем адрес (если изменился)
        const addressElement = modal.querySelector('.payment-address-value');
        if (addressElement) {
            addressElement.textContent = paymentData.address;
        }

        // Обновляем QR код
        this.ui.generateQRCode('access-payment-qr', paymentData.qrData);

        // Подсвечиваем выбранную кнопку
        modal.querySelectorAll('.amount-btn').forEach(btn => btn.classList.remove('active'));
        if (event && event.target) {
            event.target.classList.add('active');
        }
    }

    /**
     * Запуск мониторинга оплаты
     */
    async startPaymentMonitoring() {
        await this.monitor.startPaymentMonitoring();
    }

    /**
     * Получить статус доступа
     */
    getAccessStatus() {
        return this.checker.getAccessData();
    }

    /**
     * Блокировка функций при отсутствии доступа
     */
    blockFunctionsIfNoAccess() {
        const accessData = this.checker.getAccessData();
        if (!accessData || !accessData.isActive) {
            this.ui.blockFunctions();
            return true;
        }
        return false;
    }

    /**
     * Разблокировка функций
     */
    unblockFunctions() {
        this.ui.unblockFunctions();
    }

    /**
     * Очистка ресурсов
     */
    destroy() {
        this.monitor.stopMonitoring();

        // Удаляем уведомления
        const notifications = document.querySelectorAll('.access-notification');
        notifications.forEach(notification => notification.remove());

        console.log('🧹 Система доступа очищена');
    }
}

// Экспортируем и создаем глобальный экземпляр
const platformAccessService = new GenesisPlatformAccessService();

// Для обратной совместимости с существующим кодом
window.GenesisPlatformAccess = platformAccessService;

export default platformAccessService;

console.log('💳 GENESIS PLATFORM ACCESS loaded (refactored, modular, secure)');
