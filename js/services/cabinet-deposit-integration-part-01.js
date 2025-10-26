                        📋 Копировать адрес
                    </button>
                </div>
                
                <div style="text-align: center;">
                    <div id="qr-${currency}" style="margin-bottom: 1rem;">
                        <!-- QR код будет генерироваться здесь -->
                    </div>
                    <button onclick="window.GenesisCabinet.generateQRCode('${address}', '${amount}', '${currency}')" class="btn-outline" style="font-size: 0.8rem;">
                        📱 Показать QR код
                    </button>
                </div>
            </div>
        `;
    },
    
    // MCP-MARKER:METHOD:CABINET_DEPOSIT:SELECT_CURRENCY - Выбор валюты оплаты
    selectPaymentCurrency: function(currency) {
        console.log('💱 Выбрана валюта оплаты:', currency);
        
        // Убираем выделение с других вариантов
        document.querySelectorAll('.payment-option').forEach(option => {
            option.style.borderColor = 'var(--border-color)';
        });
        
        // Выделяем выбранный вариант
        event.currentTarget.style.borderColor = 'var(--primary-color)';
        
        this.selectedCurrency = currency;
        
        // Включаем кнопку проверки платежа
        const checkBtn = document.getElementById('check-payment-btn');
        if (checkBtn) {
            checkBtn.style.opacity = '1';
            checkBtn.disabled = false;
        }
    },
    
    // MCP-MARKER:METHOD:CABINET_DEPOSIT:COPY_CLIPBOARD - Копирование в буфер обмена
    copyToClipboard: function(text, message = 'Скопировано!') {
        navigator.clipboard.writeText(text).then(() => {
            this.showNotification('📋 ' + message, '', 'success');
        }).catch(err => {
            console.error('Ошибка копирования:', err);
            // Fallback для старых браузеров
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showNotification('📋 ' + message, '', 'success');
        });
    },
    
    // MCP-MARKER:METHOD:CABINET_DEPOSIT:GENERATE_QR - Генерация QR кода
    generateQRCode: function(address, amount, currency) {
        const qrContainer = document.getElementById(`qr-${currency}`);
        if (!qrContainer) return;
        
        // Простая генерация QR кода через API
        const qrData = currency === 'USDT' ? 
            `${address}` : 
            `${address}?amount=${amount}`;
        
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`;
        
        qrContainer.innerHTML = `
            <div style="text-align: center;">
                <img src="${qrUrl}" alt="QR код для оплаты" style="border-radius: 8px; border: 2px solid var(--border-color);">
                <div style="color: var(--text-secondary); font-size: 0.8rem; margin-top: 0.5rem;">
                    QR код для ${currency} оплаты
                </div>
            </div>
        `;
    },
    
    // MCP-MARKER:METHOD:CABINET_DEPOSIT:CHECK_PAYMENT - Проверка статуса оплаты
    checkPaymentStatus: async function() {
        if (!this.selectedPlan || !this.selectedCurrency) {
            alert('⚠️ Сначала выберите план и валюту оплаты');
            return;
        }
        
        const checkBtn = document.getElementById('check-payment-btn');
        if (checkBtn) {
            checkBtn.innerHTML = '🔄 Проверяем...';
            checkBtn.disabled = true;
        }
        
        try {
            console.log('🔍 Проверяем статус оплаты...');
            
            if (window.GenesisTerminal) {
                window.GenesisTerminal.log(`🔍 Проверка оплаты ${this.selectedPlan.name} в ${this.selectedCurrency}...`, 'info');
            }
            
            // Проверяем транзакции через API
            const result = await this.verifyPayment();
            
            if (result.success) {
                this.showNotification('✅ Оплата найдена!', 'Депозит будет активирован в течение нескольких минут', 'success');
                this.nextWizardStep();
            } else {
                this.showNotification('⏳ Оплата не найдена', 'Попробуйте еще раз через несколько минут', 'warning');
            }
            
        } catch (error) {
            console.error('Ошибка проверки оплаты:', error);
            this.showNotification('❌ Ошибка проверки', error.message, 'error');
        } finally {
            if (checkBtn) {
                checkBtn.innerHTML = '🔍 Проверить оплату';
                checkBtn.disabled = false;
            }
        }
    },
    
    // MCP-MARKER:METHOD:CABINET_DEPOSIT:VERIFY_PAYMENT - Верификация платежа
    verifyPayment: async function() {
        try {
            // Имитация проверки платежа (в реальном проекте здесь будет BSC API)
            if (window.GenesisAPI && window.GenesisAPI.checkPayment) {
                return await window.GenesisAPI.checkPayment({
                    userAddress: this.currentUser,
                    planId: this.selectedPlan.id,
                    currency: this.selectedCurrency,
                    amount: this.selectedCurrency === 'USDT' ? 
                        this.selectedPlan.usdtAmount : 
                        this.selectedPlan.plexAmount
                });
            }
            
            // Симуляция для демонстрации (удалить в продакшене)
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // 30% шанс найти "оплату" для демонстрации
            const found = Math.random() > 0.7;
            
            return {
                success: found,
                transactionHash: found ? this.generateMockTxHash() : null,
                message: found ? 'Оплата найдена' : 'Оплата не найдена'
            };
            
        } catch (error) {
            console.error('Ошибка верификации:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },
    
    // MCP-MARKER:METHOD:CABINET_DEPOSIT:LOAD_CONFIRM - Загрузка шага подтверждения
    loadConfirmationStep: function() {
        const confirmationContainer = document.getElementById('confirmation-details');
        const plan = this.selectedPlan;
        
        confirmationContainer.innerHTML = `
            <div style="text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 1rem; animation: pulse 2s infinite;">🎉</div>
                <h4 style="color: var(--success-color); margin-bottom: 1rem;">
                    Депозит успешно создан!
                </h4>
                <p style="color: var(--text-secondary); margin-bottom: 2rem;">
                    Ваш депозит по плану <strong style="color: var(--primary-color);">${plan.name}</strong> активирован и начал приносить прибыль
                </p>
            </div>
            
            <div style="background: var(--bg-primary); padding: 1.5rem; border-radius: 12px; margin-bottom: 2rem; border: 1px solid var(--success-color);">
                <h5 style="color: var(--success-color); margin-bottom: 1rem; text-align: center;">📊 Детали вашего депозита:</h5>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div style="text-align: center; padding: 1rem; background: var(--bg-secondary); border-radius: 8px;">
                        <div style="color: var(--text-secondary); font-size: 0.9rem;">Инвестировано:</div>
                        <div style="color: var(--text-primary); font-size: 1.2rem; font-weight: 600;">
                            $${plan.usdtAmount} ${this.selectedCurrency || 'USDT'}
                        </div>
                    </div>
                    <div style="text-align: center; padding: 1rem; background: var(--bg-secondary); border-radius: 8px;">
                        <div style="color: var(--text-secondary); font-size: 0.9rem;">Доходность:</div>
                        <div style="color: var(--success-color); font-size: 1.2rem; font-weight: 600;">
                            ${plan.percentage}% (${plan.days} дней)
                        </div>
                    </div>
                </div>
                
                <div style="margin-top: 1rem; text-align: center; padding: 1rem; background: var(--bg-secondary); border-radius: 8px;">
                    <div style="color: var(--text-secondary); font-size: 0.9rem;">Ожидаемая прибыль:</div>
                    <div style="color: var(--gold-color); font-size: 1.5rem; font-weight: 700; font-family: 'Orbitron', monospace;">
                        $${((plan.usdtAmount * plan.percentage / 100) - plan.usdtAmount).toFixed(2)}
                    </div>
                    <div style="color: var(--warning-color); font-size: 0.9rem; margin-top: 0.3rem;">
                        (~$${(((plan.usdtAmount * plan.percentage / 100) - plan.usdtAmount) / plan.days).toFixed(2)} в день)
                    </div>
                </div>
            </div>
            
            <div style="background: rgba(0, 212, 255, 0.1); padding: 1.5rem; border-radius: 12px; margin-bottom: 2rem; border: 1px solid var(--secondary-color);">
                <h5 style="color: var(--secondary-color); margin-bottom: 1rem;">📱 Что дальше?</h5>
                <ul style="color: var(--text-secondary); line-height: 1.8; margin: 0; padding-left: 1.5rem;">
                    <li>Ваш депозит уже начал работать и приносить прибыль</li>
                    <li>Следите за прогрессом в разделе "Портфель"</li>
                    <li>Прибыль начисляется каждый день автоматически</li>
                    <li>Через ${plan.days} дней депозит завершится и средства поступят на ваш баланс</li>
                </ul>
            </div>
            
            <div style="display: flex; gap: 1rem; justify-content: center;">
                <button onclick="window.GenesisCabinet.viewPortfolio()" class="btn">
                    📊 Мой портфель
                </button>
                <button onclick="window.GenesisCabinet.closeDepositModal()" class="btn-outline">
                    ✅ Готово
                </button>
            </div>
            
            <style>
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.7; }
                    100% { opacity: 1; }
                }
            </style>
        `;
    },
    
    // MCP-MARKER:METHOD:CABINET_DEPOSIT:PREV_STEP - Переход к предыдущему шагу
    previousWizardStep: function() {
        const currentStep = document.querySelector('.wizard-step.active');
        const currentStepNumber = parseInt(currentStep.id.split('-')[1]);
        
        if (currentStepNumber === 1) return;
        
        const prevStepNumber = currentStepNumber - 1;
        const prevStep = document.getElementById(`step-${prevStepNumber}`);
        
        if (!prevStep) return;
        
        // Скрываем текущий шаг
        currentStep.classList.remove('active');
        currentStep.classList.add('hidden');
        
        // Показываем предыдущий шаг
        prevStep.classList.remove('hidden');
        prevStep.classList.add('active');
        
        // Обновляем индикаторы шагов
        document.querySelectorAll('.step').forEach(step => {
            step.classList.remove('active');
        });
        document.querySelector(`[data-step="${prevStepNumber}"]`).classList.add('active');
    },
    
    // MCP-MARKER:METHOD:CABINET_DEPOSIT:VIEW_PORTFOLIO - Переход к портфелю
    viewPortfolio: function() {
        this.closeDepositModal();
        
        // Переключаемся на страницу портфеля
        if (window.cabinetApp && window.cabinetApp.navigateTo) {
            window.cabinetApp.navigateTo('portfolio');
        }
        
        // Обновляем данные
        if (window.CabinetDepositService && window.CabinetDepositService.refreshData) {
            window.CabinetDepositService.refreshData();
        }
    },
    
    // MCP-MARKER:METHOD:CABINET_DEPOSIT:CLOSE_MODAL - Закрытие модального окна депозита
    closeDepositModal: function() {
        const modal = document.getElementById('create-deposit-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
        
        this.activeModal = null;
        this.selectedPlan = null;
        this.selectedCurrency = null;
        
        console.log('🚪 Модальное окно депозита закрыто');
    },
    
    // MCP-MARKER:METHOD:CABINET_DEPOSIT:CLOSE_ALL - Закрытие всех модальных окон
    closeAllModals: function() {
        const modals = [
            'create-deposit-modal',
            'confirm-deposit-modal', 
            'transaction-result-modal'
        ];
        
        modals.forEach(modalId => {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.add('hidden');
            }
        });
        
        this.activeModal = null;
        this.selectedPlan = null;
        this.selectedCurrency = null;
    },
    
    // MCP-MARKER:METHOD:CABINET_DEPOSIT:SHOW_PURCHASE - Показ модального окна покупки плана
    showPurchaseModal: function(planId) {
        console.log('🛒 Показ модального окна покупки для плана:', planId);
        this.showDepositModal(planId);
    },
    
    // MCP-MARKER:METHOD:CABINET_DEPOSIT:NOTIFICATION - Показ уведомления
    showNotification: function(title, message = '', type = 'info') {
        // Создаем уведомление
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 1rem;
            min-width: 300px;
            max-width: 400px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        const color = {
            'success': 'var(--success-color)',
            'error': 'var(--error-color)',
            'warning': 'var(--warning-color)',
            'info': 'var(--secondary-color)'
        }[type] || 'var(--primary-color)';
        
        notification.style.borderLeftColor = color;
        notification.style.borderLeftWidth = '4px';
        
        notification.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div style="flex: 1;">
                    <div style="color: ${color}; font-weight: 600; margin-bottom: ${message ? '0.5rem' : '0'};">
                        ${title}
                    </div>
                    ${message ? `<div style="color: var(--text-secondary); font-size: 0.9rem;">${message}</div>` : ''}
                </div>
                <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: var(--text-secondary); font-size: 1.2rem; cursor: pointer; padding: 0; margin-left: 1rem;">×</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Анимация появления
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Автоматическое скрытие
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, type === 'error' ? 7000 : 4000);
        
        // Логирование в терминал
        if (window.GenesisTerminal) {
            const prefix = {
                'success': '✅',
                'error': '❌', 
                'warning': '⚠️',
                'info': 'ℹ️'
            }[type] || 'ℹ️';
            
            window.GenesisTerminal.log(`${prefix} ${title}${message ? ': ' + message : ''}`, type);
        }
    },
    
    // MCP-MARKER:UTILITY_METHODS - Утилиты
    
    // MCP-MARKER:METHOD:CABINET_DEPOSIT:GET_USER_PLANS - Получение ID планов пользователя
    getUserPlanIds: function() {
        // Получаем ID планов пользователя из депозитов
        if (window.CabinetDepositService && window.CabinetDepositService.userDeposits) {
            return window.CabinetDepositService.userDeposits.map(d => d.planId);
        }
        
        // Временная имитация для демонстрации
        return ['trial']; // Предполагаем что у пользователя есть только trial
    },
    
    // MCP-MARKER:METHOD:CABINET_DEPOSIT:IS_PLAN_LOCKED - Проверка блокировки плана
    isPlanLocked: function(plan, userPlanIds) {
        if (plan.id === 'trial') return false;
        
        const allPlans = window.GENESIS_CONFIG.depositPlans;
        const planIndex = allPlans.findIndex(p => p.id === plan.id);
        
        if (planIndex === 0) return false;
        
        for (let i = 0; i < planIndex; i++) {
            const prevPlan = allPlans[i];
            if (prevPlan.id !== 'trial' && !userPlanIds.includes(prevPlan.id)) {
                return true;
            }
        }
        
        return false;
    },
    
    // MCP-MARKER:METHOD:CABINET_DEPOSIT:GET_PLAN_ICON - Получение иконки плана
    getPlanIcon: function(planName) {
        const icons = {
            'TRIAL': '🧪',
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
    },
    
    // MCP-MARKER:METHOD:CABINET_DEPOSIT:MOCK_TX_HASH - Генерация тестового хеша транзакции
    generateMockTxHash: function() {
        const chars = '0123456789abcdef';
        let hash = '0x';
        for (let i = 0; i < 64; i++) {
            hash += chars[Math.floor(Math.random() * chars.length)];
        }
        return hash;
    }
};

// MCP-MARKER:SECTION:GLOBAL_FUNCTIONS - Глобальные функции для совместимости

// MCP-MARKER:FUNCTION:CLOSE_MODALS - Закрытие модальных окон (для кнопок в HTML)
window.closeDepositModal = () => window.GenesisCabinet.closeDepositModal();
window.closeConfirmModal = () => window.GenesisCabinet.closeAllModals();
window.closeTransactionResultModal = () => window.GenesisCabinet.closeAllModals();

