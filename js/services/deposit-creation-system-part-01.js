                    <button onclick="window.DepositCreationSystem.viewInPortfolio()" 
                            class="btn" style="padding: 1rem 2rem;">
                        💼 Перейти в портфель
                    </button>
                    <button onclick="window.DepositCreationSystem.createAnother()" 
                            class="btn-outline" style="padding: 1rem 2rem;">
                        ➕ Создать ещё
                    </button>
                </div>
            </div>
        `;
    },
    
    // MCP-MARKER:METHOD:SELECT_CURRENCY - Выбор валюты
    selectCurrency(currency) {
        this.selectedCurrency = currency;
        
        // Обновляем UI
        document.querySelectorAll('.currency-card').forEach(card => {
            card.classList.remove('selected');
            card.style.borderColor = 'var(--border-color)';
        });
        
        document.querySelector(`[onclick="window.DepositCreationSystem.selectCurrency('${currency}')"]`).style.borderColor = 'var(--primary-color)';
        
        // Перегенерируем контент для обновления статуса
        document.getElementById('deposit-modal-content').innerHTML = this.generateWizardContent();
        this.attachWizardEventListeners();
        
        if (window.GenesisTerminal) {
            window.GenesisTerminal.log(`💳 Выбрана валюта: ${currency}`, 'info');
        }
    },
    
    // MCP-MARKER:METHOD:GENERATE_PAYMENT_INFO - Генерация информации о платеже
    generatePaymentInfo() {
        const amount = this.selectedCurrency === 'USDT' ? 
            this.selectedPlan.usdtAmount : 
            this.selectedPlan.plexAmount;
            
        const tokenAddress = this.selectedCurrency === 'USDT' ? 
            window.GENESIS_CONFIG.usdt.address : 
            window.GENESIS_CONFIG.plex.address;
        
        this.paymentInfo = {
            amount: amount,
            currency: this.selectedCurrency,
            address: window.GENESIS_CONFIG.addresses.system,
            tokenAddress: tokenAddress,
            network: 'BSC',
            qrCodeData: this.generatePaymentURL(amount, tokenAddress)
        };
        
        // Генерируем QR-код
        setTimeout(() => {
            this.generateQRCode();
        }, 100);
    },
    
    // MCP-MARKER:METHOD:GENERATE_PAYMENT_URL - Генерация URL для платежа
    generatePaymentURL(amount, tokenAddress) {
        // Создаем ссылку для Trust Wallet / MetaMask
        return `https://link.trustwallet.com/send?coin=20000714&address=${window.GENESIS_CONFIG.addresses.system}&amount=${amount}&token_id=${tokenAddress}`;
    },
    
    // MCP-MARKER:METHOD:GENERATE_QR_CODE - Генерация QR-кода
    generateQRCode() {
        const container = document.getElementById('qr-code-container');
        if (!container || !this.paymentInfo) return;
        
        // Временно показываем текстовую версию (в реальном проекте использовать библиотеку QR.js)
        container.innerHTML = `
            <div style="text-align: center; color: #333; font-size: 0.7rem; padding: 1rem; line-height: 1.4;">
                <div style="font-weight: bold; margin-bottom: 0.5rem;">Данные для оплаты:</div>
                <div>Адрес: ...${this.paymentInfo.address.slice(-8)}</div>
                <div>Сумма: ${this.paymentInfo.amount} ${this.paymentInfo.currency}</div>
                <div style="margin-top: 0.5rem; font-size: 0.6rem;">Откройте в кошельке</div>
            </div>
        `;
        
        // В реальном проекте здесь должна быть интеграция с QR.js:
        // const qr = qrcode(0, 'M');
        // qr.addData(this.paymentInfo.qrCodeData);
        // qr.make();
        // container.innerHTML = qr.createImgTag(4);
    },
    
    // MCP-MARKER:METHOD:COPY_TO_CLIPBOARD - Копирование в буфер обмена
    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showNotification('📋 Скопировано', 'Данные скопированы в буфер обмена', 'success');
        }).catch(err => {
            console.error('Ошибка копирования:', err);
            this.showNotification('❌ Ошибка', 'Не удалось скопировать', 'error');
        });
    },
    
    // MCP-MARKER:METHOD:NEXT_STEP - Переход к следующему шагу
    nextStep() {
        if (this.currentStep === 2 && !this.selectedCurrency) {
            this.showError('Выберите валюту для продолжения');
            return;
        }
        
        if (this.currentStep === 4) {
            this.completeDeposit();
            return;
        }
        
        if (this.currentStep < 4) {
            this.currentStep++;
            document.getElementById('deposit-modal-content').innerHTML = this.generateWizardContent();
            this.attachWizardEventListeners();
            
            // Запускаем мониторинг оплаты на шаге 3
            if (this.currentStep === 3) {
                this.startPaymentMonitoring();
            }
        }
    },
    
    // MCP-MARKER:METHOD:PREVIOUS_STEP - Переход к предыдущему шагу
    previousStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            document.getElementById('deposit-modal-content').innerHTML = this.generateWizardContent();
            this.attachWizardEventListeners();
            
            // Останавливаем мониторинг если покидаем шаг 3
            if (this.currentStep !== 3) {
                this.stopPaymentMonitoring();
            }
        }
    },
    
    // MCP-MARKER:METHOD:START_PAYMENT_MONITORING - Запуск мониторинга оплаты
    startPaymentMonitoring() {
        this.stopPaymentMonitoring(); // Останавливаем предыдущий мониторинг
        
        this.transactionMonitoring = setInterval(() => {
            this.checkPaymentStatus();
        }, 30000); // Проверяем каждые 30 секунд
        
        if (window.GenesisTerminal) {
            window.GenesisTerminal.log('🔍 Запущен мониторинг оплаты', 'info');
        }
    },
    
    // MCP-MARKER:METHOD:STOP_PAYMENT_MONITORING - Остановка мониторинга оплаты
    stopPaymentMonitoring() {
        if (this.transactionMonitoring) {
            clearInterval(this.transactionMonitoring);
            this.transactionMonitoring = null;
        }
    },
    
    // MCP-MARKER:METHOD:CHECK_PAYMENT_STATUS - Проверка статуса оплаты
    async checkPaymentStatus() {
        try {
            const userAddress = localStorage.getItem('genesis_user_address');
            if (!userAddress || !this.paymentInfo) return;
            
            // Получаем последние транзакции пользователя
            const transactions = await window.CabinetDepositService.getTransactionsForAddress(userAddress);
            
            // Ищем транзакцию с нужной суммой и валютой
            const matchingTx = transactions.find(tx => {
                const amount = window.CabinetDepositService.parseTransactionAmount(tx);
                const currency = window.CabinetDepositService.getTransactionCurrency(tx);
                
                return currency === this.selectedCurrency && 
                       Math.abs(amount - this.paymentInfo.amount) < (this.paymentInfo.amount * 0.05);
            });
            
            if (matchingTx) {
                this.onPaymentConfirmed(matchingTx);
            }
            
        } catch (error) {
            console.error('Ошибка проверки статуса оплаты:', error);
        }
    },
    
    // MCP-MARKER:METHOD:ON_PAYMENT_CONFIRMED - Обработка подтвержденной оплаты
    onPaymentConfirmed(transaction) {
        this.stopPaymentMonitoring();
        
        const statusElement = document.getElementById('payment-status');
        if (statusElement) {
            statusElement.innerHTML = '✅ Оплата подтверждена!';
            statusElement.style.color = 'var(--success-color)';
        }
        
        if (window.GenesisTerminal) {
            window.GenesisTerminal.log('✅ Оплата подтверждена, депозит активирован', 'success');
        }
        
        // Автоматически переходим к следующему шагу через 2 секунды
        setTimeout(() => {
            this.nextStep();
        }, 2000);
    },
    
    // MCP-MARKER:METHOD:COMPLETE_DEPOSIT - Завершение создания депозита
    completeDeposit() {
        this.closeAllModals();
        
        // Обновляем данные в кабинете
        if (window.CabinetDepositService) {
            window.CabinetDepositService.refreshData();
        }
        
        this.showNotification('🎉 Успех!', 'Депозит успешно создан и активирован', 'success');
        
        // Сбрасываем состояние
        this.resetState();
    },
    
    // MCP-MARKER:METHOD:VIEW_IN_PORTFOLIO - Просмотр в портфеле
    viewInPortfolio() {
        this.closeAllModals();
        
        // Переходим в раздел портфеля
        if (window.cabinetApp && window.cabinetApp.navigateTo) {
            window.cabinetApp.navigateTo('portfolio');
        }
        
        this.resetState();
    },
    
    // MCP-MARKER:METHOD:CREATE_ANOTHER - Создание еще одного депозита
    createAnother() {
        this.resetState();
        this.closeAllModals();
        
        // Показываем список планов для выбора
        if (window.CabinetDepositService && window.CabinetDepositService.showCreateDepositModal) {
            window.CabinetDepositService.showCreateDepositModal();
        }
    },
    
    // MCP-MARKER:METHOD:ATTACH_WIZARD_EVENT_LISTENERS - Привязка обработчиков мастера
    attachWizardEventListeners() {
        // Уже привязываются в HTML через onclick
    },
    
    // MCP-MARKER:METHOD:CLOSE_ALL_MODALS - Закрытие всех модальных окон
    closeAllModals() {
        const modal = document.getElementById('create-deposit-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
        
        this.stopPaymentMonitoring();
    },
    
    // MCP-MARKER:METHOD:RESET_STATE - Сброс состояния
    resetState() {
        this.currentStep = 1;
        this.selectedPlan = null;
        this.selectedCurrency = null;
        this.paymentInfo = null;
        this.stopPaymentMonitoring();
    },
    
    // MCP-MARKER:METHOD:SHOW_ERROR - Показ ошибки
    showError(message) {
        if (window.CabinetDepositService && window.CabinetDepositService.showNotification) {
            window.CabinetDepositService.showNotification('❌ Ошибка', message, 'error');
        } else {
            alert('❌ ' + message);
        }
    },
    
    // MCP-MARKER:METHOD:SHOW_NOTIFICATION - Показ уведомления
    showNotification(title, message, type = 'info') {
        if (window.CabinetDepositService && window.CabinetDepositService.showNotification) {
            window.CabinetDepositService.showNotification(title, message, type);
        } else {
            alert(title + '\n' + message);
        }
    },
    
    // MCP-MARKER:UTILITY_METHODS - Утилиты
    
    // Получение ID планов пользователя
    getUserPlanIds() {
        if (window.CabinetDepositService && window.CabinetDepositService.userDeposits) {
            return window.CabinetDepositService.userDeposits.map(d => d.planId);
        }
        return [];
    },
    
    // Получение иконки плана
    getPlanIcon(planName) {
        const icons = {
            'TRIAL': '🧪',
            'BASIC': '💼',
            'STARTER': '🚀',
            'PROGRESSIVE1': '📈',
            'PROGRESSIVE2': '💫',
            'PROGRESSIVE3': '⭐',
            'PROGRESSIVE4': '🌟',
            'PROGRESSIVE5': '✨',
            'PROGRESSIVE6': '💎',
            'PROGRESSIVE7': '👑',
            'PROGRESSIVE8': '🏆',
            'RECOMMENDED': '🎯',
            'PLATINUM': '🥈',
            'MAXIMUM': '🥇'
        };
        return icons[planName] || '💰';
    }
};

// MCP-MARKER:GLOBAL_FUNCTIONS - Глобальные функции
window.closeDepositModal = () => window.DepositCreationSystem.closeAllModals();

// MCP-MARKER:INITIALIZATION:AUTO_INIT - Автоматическая инициализация
document.addEventListener('DOMContentLoaded', () => {
    window.DepositCreationSystem.init();
});

console.log('💰 GENESIS Deposit Creation System loaded');
