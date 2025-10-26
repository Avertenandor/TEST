/**
 * GENESIS 1.4.2 - Platform Access Checker
 * MCP-MARKER:MODULE:PLATFORM_ACCESS_CHECKER
 * Проверка платежей и расчет доступа пользователя
 */

export class PlatformAccessChecker {
    constructor(config) {
        this.config = config;
        this.userAccessData = null;
    }

    /**
     * Проверка доступа пользователя
     * SECURITY: Убран demo mode bypass для безопасности
     */
    async checkUserAccess(userAddress) {
        if (!userAddress || !window.GenesisUtils?.isValidAddress(userAddress)) {
            throw new Error('Неверный адрес пользователя');
        }

        try {
            if (window.GenesisTerminal) {
                window.GenesisTerminal.log(
                    `💳 Проверка доступа для ${window.GenesisUtils.formatAddress(userAddress)}...`,
                    'info'
                );
            }

            // Используем метод API для проверки платежей за доступ
            const accessData = await window.GenesisAPI.checkAccessPayments(userAddress);

            // Сохраняем данные пользователя
            this.userAccessData = {
                address: userAddress,
                ...accessData,
                lastCheck: Date.now()
            };

            return this.userAccessData;
        } catch (error) {
            console.error('Ошибка проверки доступа:', error);
            if (window.GenesisTerminal) {
                window.GenesisTerminal.log(`❌ Ошибка проверки доступа: ${error.message}`, 'error');
            }

            // При ошибке возвращаем пустой доступ
            return {
                payments: [],
                totalUSDT: 0,
                accessDays: 0,
                isActive: false,
                daysRemaining: 0,
                error: error.message
            };
        }
    }

    /**
     * Расчет оставшихся дней доступа
     */
    calculateRemainingDays(accessData) {
        if (!accessData || !accessData.payments || accessData.payments.length === 0) {
            return 0;
        }

        // Находим последний платеж
        const lastPayment = accessData.payments.reduce((latest, payment) => {
            const paymentTime = parseInt(payment.timeStamp);
            const latestTime = parseInt(latest.timeStamp);
            return paymentTime > latestTime ? payment : latest;
        });

        // Рассчитываем общее количество оплаченных дней
        const totalPaidDays = accessData.accessDays;

        // Время последнего платежа
        const lastPaymentTime = parseInt(lastPayment.timeStamp);

        // Текущее время
        const nowTime = Math.floor(Date.now() / 1000);

        // Время окончания доступа
        const accessEndTime = lastPaymentTime + (totalPaidDays * 86400);

        // Оставшиеся дни
        const remainingSeconds = accessEndTime - nowTime;
        const remainingDays = Math.max(0, Math.ceil(remainingSeconds / 86400));

        return remainingDays;
    }

    /**
     * Проверка активности доступа
     */
    isAccessActive() {
        return this.userAccessData?.isActive === true &&
               (this.userAccessData?.daysRemaining || 0) > 0;
    }

    /**
     * Проверка необходимости предупреждения
     */
    shouldShowWarning() {
        if (!this.userAccessData || !this.userAccessData.isActive) {
            return false;
        }

        const daysRemaining = this.userAccessData.daysRemaining || 0;
        return daysRemaining > 0 && daysRemaining <= this.config.warningDays;
    }

    /**
     * Получить текущие данные доступа
     */
    getAccessData() {
        return this.userAccessData;
    }
}
