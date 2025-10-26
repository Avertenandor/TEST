/**
 * GENESIS 1.4.2 - Platform Access Monitor
 * MCP-MARKER:MODULE:PLATFORM_ACCESS_MONITOR
 * Мониторинг платежей и статуса доступа
 */

export class PlatformAccessMonitor {
    constructor(config, checker, ui) {
        this.config = config;
        this.checker = checker;
        this.ui = ui;
        this.checkIntervalId = null;
        this.paymentMonitoringInterval = null;
    }

    /**
     * Запуск периодического мониторинга доступа
     */
    startMonitoring() {
        // Останавливаем предыдущий интервал если был
        if (this.checkIntervalId) {
            clearInterval(this.checkIntervalId);
        }

        // Запускаем новый интервал
        this.checkIntervalId = setInterval(async () => {
            const userAddress = localStorage.getItem('genesis_user_address');
            if (userAddress) {
                await this.checkAndUpdate(userAddress);
            }
        }, this.config.checkInterval);

        console.log('🔄 Мониторинг доступа запущен');
    }

    /**
     * Остановка мониторинга
     */
    stopMonitoring() {
        if (this.checkIntervalId) {
            clearInterval(this.checkIntervalId);
            this.checkIntervalId = null;
        }

        if (this.paymentMonitoringInterval) {
            clearInterval(this.paymentMonitoringInterval);
            this.paymentMonitoringInterval = null;
        }
    }

    /**
     * Проверка и обновление статуса доступа
     */
    async checkAndUpdate(userAddress) {
        try {
            // Проверяем доступ
            const accessData = await this.checker.checkUserAccess(userAddress);

            // Обновляем UI
            this.ui.updateAccessStatus(accessData);

            // Проверяем блокировку функций
            if (!accessData.isActive || accessData.daysRemaining <= 0) {
                this.ui.blockFunctions();
            } else {
                this.ui.unblockFunctions();
            }

            // Проверяем предупреждения
            this.checkWarnings(accessData);

        } catch (error) {
            console.error('Ошибка мониторинга доступа:', error);
        }
    }

    /**
     * Проверка и отображение предупреждений
     */
    checkWarnings(accessData) {
        if (!accessData.isActive) {
            if (window.GenesisTerminal) {
                window.GenesisTerminal.log('⚠️ Доступ к платформе неактивен! Требуется оплата.', 'warning');
            }
            return;
        }

        // Предупреждение за N дней до окончания
        if (accessData.daysRemaining <= this.config.warningDays && accessData.daysRemaining > 0) {
            if (window.GenesisTerminal) {
                window.GenesisTerminal.log(
                    `⚠️ Доступ истекает через ${accessData.daysRemaining} дней. Рекомендуется продлить.`,
                    'warning'
                );
            }

            this.ui.showAccessWarning(accessData.daysRemaining);
        }
    }

    /**
     * Мониторинг оплаты
     */
    async startPaymentMonitoring() {
        const userAddress = localStorage.getItem('genesis_user_address');
        if (!userAddress) return;

        if (window.GenesisTerminal) {
            window.GenesisTerminal.log('🔄 Начат мониторинг оплаты доступа...', 'system');
        }

        // Запускаем проверку каждые 30 секунд
        this.paymentMonitoringInterval = setInterval(async () => {
            try {
                const accessData = await this.checker.checkUserAccess(userAddress);

                if (accessData.isActive && accessData.daysRemaining > 0) {
                    // Доступ активирован!
                    this.stopPaymentMonitoring();

                    if (window.GenesisTerminal) {
                        window.GenesisTerminal.log(
                            `✅ Доступ активирован! Дней: ${accessData.daysRemaining}`,
                            'success'
                        );
                    }

                    // Закрываем модальное окно
                    const modal = document.getElementById('access-payment-modal');
                    if (modal) {
                        modal.remove();
                    }

                    // Разблокируем функции
                    this.ui.unblockFunctions();

                    // Показываем уведомление об успехе
                    this.ui.showSuccess(accessData.daysRemaining);

                    // Обновляем UI
                    this.ui.updateAccessStatus(accessData);
                }
            } catch (error) {
                console.error('Ошибка мониторинга оплаты:', error);
            }
        }, this.config.monitoringCheckInterval);

        // Останавливаем мониторинг через 10 минут
        setTimeout(() => {
            this.stopPaymentMonitoring();
            if (window.GenesisTerminal) {
                window.GenesisTerminal.log('⏱️ Мониторинг оплаты завершен по таймауту', 'warning');
            }
        }, this.config.monitoringTimeout);
    }

    /**
     * Остановка мониторинга оплаты
     */
    stopPaymentMonitoring() {
        if (this.paymentMonitoringInterval) {
            clearInterval(this.paymentMonitoringInterval);
            this.paymentMonitoringInterval = null;
        }
    }
}
