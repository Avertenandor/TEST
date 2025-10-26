/**
 * GENESIS 1.1 - Система оплаты доступа к платформе
 * MCP-MARKER:MODULE:PLATFORM_ACCESS - Сервис оплаты доступа к платформе
 * MCP-MARKER:FILE:PLATFORM_ACCESS_JS - Система ежедневной оплаты доступа
 */

// MCP-MARKER:CLASS:GENESIS_PLATFORM_ACCESS - Класс управления доступом к платформе
window.GenesisPlatformAccess = {
    // MCP-MARKER:PROPERTY:ACCESS_CONFIG - Конфигурация доступа
    config: {
        dailyCost: 1, // $1 в день
        minPayment: 10, // Минимум $10 (10 дней)
        maxPayment: 100, // Максимум $100 (100 дней)
        tolerance: 0.05, // ±5% погрешность
        checkInterval: 60000, // Проверка каждую минуту
        warningDays: 3 // Предупреждение за 3 дня
    },
    
    // Данные пользователя
    userAccessData: null,
    
    // Интервал проверки
    checkIntervalId: null,
    
    // MCP-MARKER:METHOD:INIT_ACCESS_SYSTEM - Инициализация системы доступа
    async init() {
        console.log('💳 Инициализация системы оплаты доступа...');
        
        if (window.GenesisTerminal) {
            window.GenesisTerminal.log('💳 Система доступа: инициализация...', 'system');
        }
        
        // Запускаем периодическую проверку
        this.startAccessMonitoring();
        
        return true;
    },
    
    // MCP-MARKER:METHOD:CHECK_USER_ACCESS - Проверка доступа пользователя
    async checkUserAccessBalance(userAddress) {
        if (!userAddress || !window.GenesisUtils.isValidAddress(userAddress)) {
            throw new Error('Неверный адрес пользователя');
        }
        
        try {
            if (window.GenesisTerminal) {
                window.GenesisTerminal.log(`💳 Проверка доступа для ${window.GenesisUtils.formatAddress(userAddress)}...`, 'info');
            }
            
            // ДЕМО РЕЖИМ: Для тестового адреса всегда разрешаем доступ
            if (userAddress === '0x1234567890123456789012345678901234567890' || 
                userAddress.toLowerCase() === '0x1234567890123456789012345678901234567890') {
                console.log('🧪 Demo mode: Platform access granted for test address');
                
                const demoAccessData = {
                    payments: [{
                        timeStamp: Math.floor(Date.now() / 1000).toString(),
                        value: '100000000000000000000', // 100 USDT
                        hash: 'demo_payment_hash'
                    }],
                    totalUSDT: 100,
                    accessDays: 100,
                    isActive: true,
                    daysRemaining: 100,
                    lastCheck: Date.now()
                };
                
                this.userAccessData = {
                    address: userAddress,
                    ...demoAccessData
                };
                
                return this.userAccessData;
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
            
            // ДЕМО РЕЖИМ: При ошибке API также разрешаем доступ для тестового адреса
            if (userAddress === '0x1234567890123456789012345678901234567890' || 
                userAddress.toLowerCase() === '0x1234567890123456789012345678901234567890') {
                console.log('🧪 Demo mode: API error, but granting access for test address');
                
                return {
                    payments: [],
                    totalUSDT: 100,
                    accessDays: 100,
                    isActive: true,
                    daysRemaining: 100,
                    error: null
                };
            }
            
            return {
                payments: [],
                totalUSDT: 0,
                accessDays: 0,
                isActive: false,
                daysRemaining: 0,
                error: error.message
            };
        }
    },
    
    // MCP-MARKER:METHOD:CALCULATE_REMAINING_DAYS - Расчет оставшихся дней
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
    },
    
    // MCP-MARKER:METHOD:BLOCK_FUNCTIONS - Блокировка функций при отсутствии доступа
    blockFunctionsIfNoAccess() {
        if (!this.userAccessData || !this.userAccessData.isActive) {
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
                    return; // Не блокируем страницу оплаты доступа
                }
                link.style.pointerEvents = 'none';
                link.style.opacity = '0.5';
                link.title = 'Требуется оплата доступа к платформе';
            });
            
            // Показываем уведомление
            this.showAccessRequiredNotification();
            
            return true; // Функции заблокированы
        }
        
        return false; // Доступ есть, функции не заблокированы
    },
    
    // MCP-MARKER:METHOD:UNBLOCK_FUNCTIONS - Разблокировка функций
    unblockFunctions() {
        // Разблокируем кнопки депозитов
        const depositButtons = document.querySelectorAll('.deposit-btn, .create-deposit-btn');
        depositButtons.forEach(btn => {
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.title = '';
        });
        
        // Разблокируем навигацию
        const cabinetLinks = document.querySelectorAll('.cabinet-nav-link');
        cabinetLinks.forEach(link => {
            link.style.pointerEvents = 'auto';
            link.style.opacity = '1';
            link.title = '';
        });
        
        // Скрываем уведомления о блокировке
        this.hideAccessRequiredNotification();
    },
    
    // MCP-MARKER:METHOD:GENERATE_ACCESS_QR - Генерация QR кода для оплаты доступа
    generateAccessPaymentQR(amount = 10) {
        const accessAddress = window.GENESIS_CONFIG.addresses.access;
        const usdtAddress = window.GENESIS_CONFIG.usdt.address;
        
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
            days: amount, // $1 = 1 день
            description: `Оплата доступа к платформе на ${amount} дней`
        };
    },
    
    // MCP-MARKER:METHOD:START_MONITORING - Запуск мониторинга доступа
    startAccessMonitoring() {
        // Останавливаем предыдущий интервал если был
        if (this.checkIntervalId) {
            clearInterval(this.checkIntervalId);
        }
        
        // Запускаем новый интервал
        this.checkIntervalId = setInterval(async () => {
            const userAddress = localStorage.getItem('genesis_user_address');
            if (userAddress) {
                await this.checkAndUpdateAccessStatus(userAddress);
            }
        }, this.config.checkInterval);
        
        console.log('🔄 Мониторинг доступа запущен');
    },
    
    // MCP-MARKER:METHOD:CHECK_UPDATE_STATUS - Проверка и обновление статуса
    async checkAndUpdateAccessStatus(userAddress) {
        try {
            // Проверяем доступ
            const accessData = await this.checkUserAccessBalance(userAddress);
            
            // Обновляем UI
            this.updateAccessUI(accessData);
            
            // Проверяем блокировку функций
            const isBlocked = this.blockFunctionsIfNoAccess();
            
            if (!isBlocked) {
                this.unblockFunctions();
            }
            
            // Проверяем предупреждения
            this.checkAccessWarnings(accessData);
            
        } catch (error) {
            console.error('Ошибка мониторинга доступа:', error);
        }
    },
    
    // MCP-MARKER:METHOD:UPDATE_ACCESS_UI - Обновление UI статуса доступа
    updateAccessUI(accessData) {
        // Обновляем элементы отображения статуса доступа
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
            accessBalanceEl.textContent = `$${accessData.totalUSDT.toFixed(2)}`;
        }
        
        // Обновляем прогресс-бар если есть
        const progressBar = document.getElementById('access-progress');
        if (progressBar && accessData.accessDays > 0) {
            const usedDays = accessData.accessDays - accessData.daysRemaining;
            const progressPercent = (usedDays / accessData.accessDays) * 100;
            progressBar.style.width = `${Math.min(100, Math.max(0, progressPercent))}%`;
        }
    },
    
    // MCP-MARKER:METHOD:CHECK_WARNINGS - Проверка предупреждений
    checkAccessWarnings(accessData) {
        if (!accessData.isActive) {
            // Доступ уже неактивен
            if (window.GenesisTerminal) {
                window.GenesisTerminal.log('⚠️ Доступ к платформе неактивен! Требуется оплата.', 'warning');
            }
            return;
        }
        
        // Предупреждение за N дней до окончания
        if (accessData.daysRemaining <= this.config.warningDays && accessData.daysRemaining > 0) {
            if (window.GenesisTerminal) {
                window.GenesisTerminal.log(`⚠️ Доступ истекает через ${accessData.daysRemaining} дней. Рекомендуется продлить.`, 'warning');
            }
            
            this.showAccessWarningNotification(accessData.daysRemaining);
        }
    },
    
    // MCP-MARKER:METHOD:SHOW_ACCESS_REQUIRED - Показать уведомление о необходимости доступа
    showAccessRequiredNotification() {
        // Удаляем предыдущее уведомление если есть
        const existingNotification = document.getElementById('access-required-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Создаем новое уведомление
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
        
        // Добавляем в DOM
        document.body.appendChild(notification);
        
        // Анимация появления
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
    },
    
    // MCP-MARKER:METHOD:SHOW_WARNING - Показать предупреждение
    showAccessWarningNotification(daysRemaining) {
        // Удаляем предыдущее предупреждение
        const existingWarning = document.getElementById('access-warning-notification');
        if (existingWarning) {
            existingWarning.remove();
        }
        
        // Создаем предупреждение
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
        
        // Автоматически скрываем через 10 секунд
        setTimeout(() => {
            if (warning.parentElement) {
                warning.remove();
            }
        }, 10000);
    },
    
    // MCP-MARKER:METHOD:HIDE_NOTIFICATIONS - Скрыть уведомления
    hideAccessRequiredNotification() {
        const notification = document.getElementById('access-required-notification');
        if (notification) {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }
    },
    
    // MCP-MARKER:METHOD:SHOW_PAYMENT_MODAL - Показать модальное окно оплаты
    showPaymentModal(defaultAmount = 10) {
        // Создаем модальное окно
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
