/**
 * GENESIS 1.4.2 - Platform Access Configuration
 * MCP-MARKER:MODULE:PLATFORM_ACCESS_CONFIG
 */

export class PlatformAccessConfig {
    constructor() {
        this.dailyCost = 1; // $1 в день
        this.minPayment = 10; // Минимум $10 (10 дней)
        this.maxPayment = 100; // Максимум $100 (100 дней)
        this.tolerance = 0.05; // ±5% погрешность
        this.checkInterval = 60000; // Проверка каждую минуту
        this.warningDays = 3; // Предупреждение за 3 дня
        this.monitoringTimeout = 600000; // 10 минут таймаут мониторинга
        this.monitoringCheckInterval = 30000; // Проверка каждые 30 секунд при мониторинге
    }

    /**
     * Получить адрес для оплаты доступа
     */
    getAccessAddress() {
        return window.GENESIS_CONFIG?.addresses?.access || '';
    }

    /**
     * Получить адрес USDT токена
     */
    getUSDTAddress() {
        return window.GENESIS_CONFIG?.usdt?.address || '';
    }

    /**
     * Проверка валидности суммы платежа
     */
    isValidPaymentAmount(amount) {
        const numAmount = parseFloat(amount);
        return numAmount >= this.minPayment && numAmount <= this.maxPayment;
    }

    /**
     * Расчет количества дней по сумме
     */
    calculateDaysFromAmount(amount) {
        return Math.floor(parseFloat(amount) / this.dailyCost);
    }
}
