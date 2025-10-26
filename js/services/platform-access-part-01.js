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
