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
        this.generateQRCode('access-payment-qr', paymentData.qrData);
        
        // Анимация появления
        setTimeout(() => {
            modal.classList.add('show');
        }, 100);
    },
    
    // MCP-MARKER:METHOD:UPDATE_PAYMENT_AMOUNT - Обновить сумму оплаты
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
        this.generateQRCode('access-payment-qr', paymentData.qrData);
        
        // Подсвечиваем выбранную кнопку
        modal.querySelectorAll('.amount-btn').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
    },
    
    // MCP-MARKER:METHOD:GENERATE_QR_CODE - Генерация QR кода
    generateQRCode(containerId, data) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        // Очищаем контейнер
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
            // Fallback если QRCode не загружен
            container.innerHTML = `
                <div class="qr-fallback">
                    <div class="qr-placeholder">📱 QR КОД</div>
                    <p>Используйте адрес выше для оплаты</p>
                </div>
            `;
        }
    },
    
    // MCP-MARKER:METHOD:START_PAYMENT_MONITORING - Мониторинг оплаты
    async startPaymentMonitoring() {
        const userAddress = localStorage.getItem('genesis_user_address');
        if (!userAddress) return;
        
        if (window.GenesisTerminal) {
            window.GenesisTerminal.log('🔄 Начат мониторинг оплаты доступа...', 'system');
        }
        
        // Запускаем проверку каждые 30 секунд
        const monitoringInterval = setInterval(async () => {
            try {
                const accessData = await this.checkUserAccessBalance(userAddress);
                
                if (accessData.isActive && accessData.daysRemaining > 0) {
                    // Доступ активирован!
                    clearInterval(monitoringInterval);
                    
                    if (window.GenesisTerminal) {
                        window.GenesisTerminal.log(`✅ Доступ активирован! Дней: ${accessData.daysRemaining}`, 'success');
                    }
                    
                    // Закрываем модальное окно
                    const modal = document.getElementById('access-payment-modal');
                    if (modal) {
                        modal.remove();
                    }
                    
                    // Разблокируем функции
                    this.unblockFunctions();
                    
                    // Показываем уведомление об успехе
                    this.showSuccessNotification(accessData.daysRemaining);
                    
                    // Обновляем UI
                    this.updateAccessUI(accessData);
                }
            } catch (error) {
                console.error('Ошибка мониторинга оплаты:', error);
            }
        }, 30000);
        
        // Останавливаем мониторинг через 10 минут
        setTimeout(() => {
            clearInterval(monitoringInterval);
            if (window.GenesisTerminal) {
                window.GenesisTerminal.log('⏱️ Мониторинг оплаты завершен по таймауту', 'warning');
            }
        }, 600000);
    },
    
    // MCP-MARKER:METHOD:SHOW_SUCCESS - Показать уведомление об успехе
    showSuccessNotification(daysRemaining) {
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
        
        // Автоматически скрываем через 5 секунд
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    },
    
    // MCP-MARKER:METHOD:GET_ACCESS_STATUS - Получить статус доступа
    getAccessStatus() {
        return this.userAccessData;
    },
    
    // MCP-MARKER:METHOD:DESTROY - Очистка ресурсов
    destroy() {
        if (this.checkIntervalId) {
            clearInterval(this.checkIntervalId);
            this.checkIntervalId = null;
        }
        
        // Удаляем уведомления
        const notifications = document.querySelectorAll('.access-notification');
        notifications.forEach(notification => notification.remove());
        
        console.log('🧹 Система доступа очищена');
    }
};

// MCP-MARKER:STYLES:ACCESS_NOTIFICATIONS - Стили для уведомлений доступа
// Добавляем стили для уведомлений
const accessStyles = document.createElement('style');
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
    
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        border-bottom: 1px solid #333;
    }
    
    .modal-header h2 {
        margin: 0;
        color: #ff6b35;
        font-size: 1.3rem;
    }
    
    .modal-close {
        background: none;
        border: none;
        color: #999;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0;
        width: 30px;
        height: 30px;
    }
    
    .modal-close:hover {
        color: white;
    }
    
    .modal-body {
        padding: 1.5rem;
        color: white;
    }
    
    .payment-info {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
        margin-bottom: 2rem;
    }
    
    .payment-details h3, .payment-qr h3 {
        color: #ff6b35;
        margin-bottom: 1rem;
    }
    
    .price-info {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .price-item {
        display: flex;
        justify-content: space-between;
        padding: 0.5rem 0;
        border-bottom: 1px solid #333;
    }
    
    .qr-container {
        background: white;
        padding: 1rem;
        border-radius: 10px;
        text-align: center;
        margin-bottom: 1rem;
    }
    
    .qr-fallback {
        background: #f0f0f0;
        padding: 2rem;
        border-radius: 10px;
        text-align: center;
        color: #333;
    }
    
    .qr-placeholder {
        font-size: 2rem;
        margin-bottom: 0.5rem;
    }
    
    .address-container {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        background: rgba(0, 0, 0, 0.3);
        padding: 0.8rem;
        border-radius: 5px;
        margin-top: 0.5rem;
    }
    
    .payment-address-value {
        flex: 1;
        color: #00d4ff;
        font-family: monospace;
        font-size: 0.9rem;
        word-break: break-all;
    }
    
    .copy-btn {
        background: #ff6b35;
        color: white;
        border: none;
        padding: 0.3rem 0.5rem;
        border-radius: 3px;
        cursor: pointer;
        font-size: 0.8rem;
    }
    
    .payment-instructions ol {
        padding-left: 1.2rem;
    }
    
    .payment-instructions li {
        margin-bottom: 0.5rem;
        line-height: 1.5;
    }
    
    .amount-buttons {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
    }
    
    .amount-btn {
        background: rgba(255, 107, 53, 0.1);
        color: #ff6b35;
        border: 1px solid #ff6b35;
        padding: 0.8rem;
        border-radius: 5px;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .amount-btn:hover, .amount-btn.active {
        background: #ff6b35;
        color: white;
    }
    
    .modal-footer {
        padding: 1.5rem;
        border-top: 1px solid #333;
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
    }
    
    .btn-primary, .btn-secondary {
        padding: 0.8rem 1.5rem;
        border-radius: 5px;
        border: none;
        cursor: pointer;
        font-size: 0.9rem;
        transition: background 0.3s ease;
    }
    
    .btn-primary {
        background: #ff6b35;
        color: white;
    }
    
    .btn-primary:hover {
        background: #e55a2b;
    }
    
    .btn-secondary {
        background: #333;
        color: white;
    }
    
    .btn-secondary:hover {
        background: #444;
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
        
        .payment-info {
            grid-template-columns: 1fr;
            gap: 1rem;
        }
        
        .amount-buttons {
            grid-template-columns: 1fr;
        }
        
        .modal-footer {
            flex-direction: column;
        }
    }
`;

document.head.appendChild(accessStyles);

console.log('💳 GENESIS PLATFORM ACCESS loaded');
