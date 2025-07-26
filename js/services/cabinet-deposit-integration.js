/**
 * GENESIS 1.1 - Полная интеграция депозитов в кабинете
 * MCP-MARKER:MODULE:CABINET_DEPOSIT_INTEGRATION - Интеграция депозитов в кабинете
 * MCP-MARKER:FILE:CABINET_DEPOSIT_INTEGRATION_JS - Файл интеграции депозитов
 */

// MCP-MARKER:CLASS:GENESIS_CABINET - Основной объект кабинета с депозитами
window.GenesisCabinet = {
    
    // MCP-MARKER:PROPERTY:CABINET_STATE - Состояние кабинета
    currentUser: null,
    selectedPlan: null,
    activeModal: null,
    transactionInProgress: false,
    
    // MCP-MARKER:METHOD:INIT_CABINET - Инициализация кабинета
    init: function(userAddress) {
        console.log('💼 Инициализация Genesis Cabinet...');
        this.currentUser = userAddress;
        this.setupEventListeners();
        this.loadUserDeposits();
        console.log('✅ Genesis Cabinet инициализирован');
    },
    
    // MCP-MARKER:METHOD:SETUP_EVENT_LISTENERS - Настройка обработчиков событий
    setupEventListeners: function() {
        // Обработчики для модальных окон
        document.addEventListener('click', (e) => {
            if (e.target.closest('.modal-overlay') && !e.target.closest('.modal-container')) {
                this.closeAllModals();
            }
        });
        
        // Обработчик ESC для закрытия модальных окон
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.activeModal) {
                this.closeAllModals();
            }
        });
        
        console.log('🎯 Обработчики событий настроены');
    },
    
    // MCP-MARKER:METHOD:LOAD_USER_DEPOSITS - Загрузка депозитов пользователя
    loadUserDeposits: async function() {
        if (!this.currentUser) return;
        
        try {
            if (window.CabinetDepositService) {
                await window.CabinetDepositService.init(this.currentUser);
            }
        } catch (error) {
            console.error('Ошибка загрузки депозитов:', error);
        }
    },
    
    // MCP-MARKER:METHOD:SHOW_DEPOSIT_MODAL - Показ модального окна создания депозита
    showDepositModal: function(selectedPlanId = null) {
        console.log('💰 Открываем модальное окно создания депозита');
        
        this.selectedPlan = selectedPlanId;
        const modal = document.getElementById('create-deposit-modal');
        const content = document.getElementById('deposit-modal-content');
        
        if (!modal || !content) {
            alert('❌ Модальное окно не найдено. Обновите страницу.');
            return;
        }
        
        // Генерируем контент модального окна
        content.innerHTML = this.generateDepositModalContent();
        
        // Показываем модальное окно
        modal.classList.remove('hidden');
        this.activeModal = 'create-deposit';
        
        // Если план уже выбран, сразу показываем его детали
        if (selectedPlanId) {
            this.selectDepositPlan(selectedPlanId);
        }
    },
    
    // MCP-MARKER:METHOD:GENERATE_DEPOSIT_MODAL_CONTENT - Генерация контента модального окна
    generateDepositModalContent: function() {
        if (!window.GENESIS_CONFIG || !window.GENESIS_CONFIG.depositPlans) {
            return `
                <div class="empty-state">
                    <div class="empty-icon">❌</div>
                    <h3>Ошибка конфигурации</h3>
                    <p>Планы депозитов не загружены. Обновите страницу.</p>
                </div>
            `;
        }
        
        const plans = window.GENESIS_CONFIG.depositPlans;
        const userPlanIds = this.getUserPlanIds();
        
        return `
            <div class="deposit-wizard">
                <div class="wizard-steps" style="display: flex; justify-content: center; margin-bottom: 2rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem;">
                    <div class="step active" data-step="1">
                        <span class="step-number">1</span>
                        <span class="step-title">Выбор плана</span>
                    </div>
                    <div class="step" data-step="2">
                        <span class="step-number">2</span>
                        <span class="step-title">Оплата</span>
                    </div>
                    <div class="step" data-step="3">
                        <span class="step-number">3</span>
                        <span class="step-title">Подтверждение</span>
                    </div>
                </div>
                
                <div id="step-1" class="wizard-step active">
                    <h4 style="color: var(--primary-color); margin-bottom: 1.5rem; text-align: center;">
                        📊 Выберите план депозита
                    </h4>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem; max-height: 400px; overflow-y: auto;">
                        ${plans.map(plan => this.generatePlanOptionCard(plan, userPlanIds)).join('')}
                    </div>
                    
                    <div style="margin-top: 1.5rem; padding: 1rem; background: var(--bg-primary); border-radius: 8px; border-left: 4px solid var(--secondary-color);">
                        <h5 style="color: var(--secondary-color); margin-bottom: 0.5rem;">ℹ️ Важная информация:</h5>
                        <ul style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.6; margin: 0; padding-left: 1.5rem;">
                            <li>Депозиты покупаются последовательно (снизу вверх)</li>
                            <li>Заблокированные планы откроются после покупки предыдущих</li>
                            <li>Премиум планы поддерживают оплату PLEX токенами</li>
                            <li>Все операции проверяются в блокчейне BSC</li>
                        </ul>
                    </div>
                </div>
                
                <div id="step-2" class="wizard-step hidden">
                    <div id="payment-details">
                        <!-- Детали оплаты будут загружены динамически -->
                    </div>
                </div>
                
                <div id="step-3" class="wizard-step hidden">
                    <div id="confirmation-details">
                        <!-- Подтверждение будет загружено динамически -->
                    </div>
                </div>
            </div>
            
            <style>
                .wizard-steps {
                    display: flex;
                    justify-content: center;
                    gap: 2rem;
                }
                
                .step {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: var(--text-secondary);
                    font-size: 0.9rem;
                }
                
                .step.active {
                    color: var(--primary-color);
                }
                
                .step-number {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    background: var(--bg-primary);
                    border: 2px solid var(--border-color);
                    font-weight: 600;
                    font-size: 0.8rem;
                }
                
                .step.active .step-number {
                    background: var(--primary-color);
                    border-color: var(--primary-color);
                    color: white;
                }
                
                .wizard-step {
                    min-height: 400px;
                }
                
                .wizard-step.hidden {
                    display: none;
                }
                
                .plan-option-card {
                    background: var(--bg-primary);
                    border: 2px solid var(--border-color);
                    border-radius: 8px;
                    padding: 1rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                
                .plan-option-card:hover:not(.disabled) {
                    border-color: var(--primary-color);
                    transform: translateY(-2px);
                }
                
                .plan-option-card.selected {
                    border-color: var(--primary-color);
                    background: rgba(255, 107, 53, 0.1);
                }
                
                .plan-option-card.disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                
                .plan-option-card.purchased {
                    border-color: var(--success-color);
                    background: rgba(0, 255, 65, 0.1);
                }
            </style>
        `;
    },
    
    // MCP-MARKER:METHOD:GENERATE_PLAN_OPTION_CARD - Генерация карточки плана
    generatePlanOptionCard: function(plan, userPlanIds) {
        const hasThisPlan = userPlanIds.includes(plan.id);
        const isLocked = this.isPlanLocked(plan, userPlanIds);
        const profit = (plan.usdtAmount * plan.percentage / 100) - plan.usdtAmount;
        const dailyProfit = profit / plan.days;
        
        let cardClass = 'plan-option-card';
        let statusBadge = '';
        
        if (hasThisPlan) {
            cardClass += ' purchased';
            statusBadge = '<div style="background: var(--success-color); color: white; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.7rem; font-weight: 600;">✅ ПРИОБРЕТЕН</div>';
        } else if (isLocked) {
            cardClass += ' disabled';
            statusBadge = '<div style="background: var(--warning-color); color: var(--bg-primary); padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.7rem; font-weight: 600;">🔒 ЗАБЛОКИРОВАН</div>';
        } else {
            statusBadge = '<div style="background: var(--secondary-color); color: var(--bg-primary); padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.7rem; font-weight: 600;">🚀 ДОСТУПЕН</div>';
        }
        
        const clickHandler = hasThisPlan || isLocked ? '' : `onclick="window.GenesisCabinet.selectDepositPlan('${plan.id}')"`;
        
        return `
            <div class="${cardClass}" ${clickHandler} id="plan-card-${plan.id}">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                    <div>
                        <h5 style="color: var(--primary-color); margin: 0 0 0.3rem 0; display: flex; align-items: center; gap: 0.5rem;">
                            <span style="font-size: 1.2rem;">${this.getPlanIcon(plan.name)}</span>
                            ${plan.name}
                        </h5>
                        <p style="color: var(--text-secondary); font-size: 0.8rem; margin: 0;">${plan.description}</p>
                    </div>
                    ${statusBadge}
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                    <div style="text-align: center; padding: 0.5rem; background: var(--bg-secondary); border-radius: 4px;">
                        <div style="font-size: 1.1rem; font-weight: 600; color: var(--text-primary);">$${plan.usdtAmount}</div>
                        <div style="font-size: 0.7rem; color: var(--text-secondary);">Инвестиция</div>
                    </div>
                    <div style="text-align: center; padding: 0.5rem; background: var(--bg-secondary); border-radius: 4px;">
                        <div style="font-size: 1.1rem; font-weight: 600; color: var(--success-color);">${plan.percentage}%</div>
                        <div style="font-size: 0.7rem; color: var(--text-secondary);">${plan.days} дней</div>
                    </div>
                </div>
                
                <div style="font-size: 0.8rem; color: var(--text-secondary); text-align: center;">
                    💰 Прибыль: <span style="color: var(--success-color); font-weight: 600;">$${profit.toFixed(2)}</span> 
                    • В день: <span style="color: var(--warning-color); font-weight: 600;">$${dailyProfit.toFixed(2)}</span>
                </div>
                
                <div style="margin-top: 1rem; font-size: 0.8rem; color: var(--secondary-color); text-align: center;">
                    Валюты: ${plan.currencies.join(', ')}
                </div>
            </div>
        `;
    },
    
    // MCP-MARKER:METHOD:SELECT_DEPOSIT_PLAN - Выбор плана депозита
    selectDepositPlan: function(planId) {
        console.log('📋 Выбран план:', planId);
        
        const plan = window.GENESIS_CONFIG.depositPlans.find(p => p.id === planId);
        if (!plan) {
            alert('❌ План не найден');
            return;
        }
        
        // Проверяем доступность плана
        const userPlanIds = this.getUserPlanIds();
        if (this.isPlanLocked(plan, userPlanIds)) {
            alert('🔒 Этот план заблокирован. Сначала приобретите предыдущие планы.');
            return;
        }
        
        if (userPlanIds.includes(planId)) {
            alert('✅ Этот план уже приобретен');
            return;
        }
        
        this.selectedPlan = plan;
        
        // Обновляем визуальное выделение
        document.querySelectorAll('.plan-option-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        const selectedCard = document.getElementById(`plan-card-${planId}`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
        }
        
        // Переходим к следующему шагу
        setTimeout(() => {
            this.nextWizardStep();
        }, 500);
    },
    
    // MCP-MARKER:METHOD:NEXT_WIZARD_STEP - Переход к следующему шагу мастера
    nextWizardStep: function() {
        const currentStep = document.querySelector('.wizard-step.active');
        const currentStepNumber = parseInt(currentStep.id.split('-')[1]);
        
        if (currentStepNumber === 1 && !this.selectedPlan) {
            alert('⚠️ Сначала выберите план депозита');
            return;
        }
        
        const nextStepNumber = currentStepNumber + 1;
        const nextStep = document.getElementById(`step-${nextStepNumber}`);
        
        if (!nextStep) return;
        
        // Скрываем текущий шаг
        currentStep.classList.remove('active');
        currentStep.classList.add('hidden');
        
        // Показываем следующий шаг
        nextStep.classList.remove('hidden');
        nextStep.classList.add('active');
        
        // Обновляем индикаторы шагов
        document.querySelectorAll('.step').forEach(step => {
            step.classList.remove('active');
        });
        document.querySelector(`[data-step="${nextStepNumber}"]`).classList.add('active');
        
        // Загружаем контент для нового шага
        if (nextStepNumber === 2) {
            this.loadPaymentStep();
        } else if (nextStepNumber === 3) {
            this.loadConfirmationStep();
        }
    },
    
    // MCP-MARKER:METHOD:LOAD_PAYMENT_STEP - Загрузка шага оплаты
    loadPaymentStep: function() {
        if (!this.selectedPlan) return;
        
        const paymentContainer = document.getElementById('payment-details');
        const plan = this.selectedPlan;
        
        paymentContainer.innerHTML = `
            <h4 style="color: var(--primary-color); margin-bottom: 1.5rem; text-align: center;">
                💳 Оплата депозита: ${plan.name}
            </h4>
            
            <div style="background: var(--bg-primary); padding: 1.5rem; border-radius: 12px; margin-bottom: 2rem; border: 1px solid var(--border-color);">
                <h5 style="color: var(--text-primary); margin-bottom: 1rem;">📊 Детали депозита:</h5>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div>
                        <div style="color: var(--text-secondary); font-size: 0.9rem;">План:</div>
                        <div style="color: var(--primary-color); font-weight: 600;">${plan.name}</div>
                    </div>
                    <div>
                        <div style="color: var(--text-secondary); font-size: 0.9rem;">Инвестиция:</div>
                        <div style="color: var(--text-primary); font-weight: 600;">$${plan.usdtAmount}</div>
                    </div>
                    <div>
                        <div style="color: var(--text-secondary); font-size: 0.9rem;">Доходность:</div>
                        <div style="color: var(--success-color); font-weight: 600;">${plan.percentage}%</div>
                    </div>
                    <div>
                        <div style="color: var(--text-secondary); font-size: 0.9rem;">Срок:</div>
                        <div style="color: var(--warning-color); font-weight: 600;">${plan.days} дней</div>
                    </div>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: ${plan.currencies.length > 1 ? '1fr 1fr' : '1fr'}; gap: 1.5rem;">
                ${plan.currencies.map(currency => this.generatePaymentOption(plan, currency)).join('')}
            </div>
            
            <div style="margin-top: 2rem; padding: 1rem; background: rgba(255, 165, 0, 0.1); border-radius: 8px; border: 1px solid var(--warning-color);">
                <h5 style="color: var(--warning-color); margin-bottom: 0.5rem;">⚠️ Важные моменты:</h5>
                <ul style="color: var(--text-secondary); font-size: 0.9rem; line-height: 1.6; margin: 0; padding-left: 1.5rem;">
                    <li>Отправляйте точную сумму на указанный адрес</li>
                    <li>Депозит активируется автоматически после подтверждения в блокчейне</li>
                    <li>Процесс подтверждения может занять до 3-5 минут</li>
                    <li>Не отправляйте средства с биржевых кошельков</li>
                </ul>
            </div>
            
            <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 2rem;">
                <button onclick="window.GenesisCabinet.previousWizardStep()" class="btn-outline">
                    ← Назад
                </button>
                <button onclick="window.GenesisCabinet.checkPaymentStatus()" class="btn" id="check-payment-btn">
                    🔍 Проверить оплату
                </button>
            </div>
        `;
    },
    
    // MCP-MARKER:METHOD:GENERATE_PAYMENT_OPTION - Генерация варианта оплаты
    generatePaymentOption: function(plan, currency) {
        const amount = currency === 'USDT' ? plan.usdtAmount : plan.plexAmount;
        const address = currency === 'USDT' ? 
            window.GENESIS_CONFIG.addresses.system : 
            window.GENESIS_CONFIG.plex.address;
        
        return `
            <div class="payment-option" style="background: var(--bg-primary); padding: 1.5rem; border-radius: 12px; border: 2px solid var(--border-color); cursor: pointer;" onclick="window.GenesisCabinet.selectPaymentCurrency('${currency}')">
                <div style="text-align: center; margin-bottom: 1rem;">
                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">
                        ${currency === 'USDT' ? '💰' : '🪙'}
                    </div>
                    <h5 style="color: var(--primary-color); margin: 0;">Оплата ${currency}</h5>
                </div>
                
                <div style="background: var(--bg-secondary); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                    <div style="text-align: center;">
                        <div style="color: var(--text-secondary); font-size: 0.9rem;">К оплате:</div>
                        <div style="color: var(--text-primary); font-size: 1.5rem; font-weight: 700; font-family: 'Orbitron', monospace;">
                            ${amount.toFixed(currency === 'USDT' ? 2 : 0)} ${currency}
                        </div>
                    </div>
                </div>
                
                <div style="background: var(--bg-secondary); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                    <div style="color: var(--text-secondary); font-size: 0.8rem; margin-bottom: 0.3rem;">Адрес для оплаты:</div>
                    <div style="font-family: monospace; font-size: 0.85rem; color: var(--secondary-color); word-break: break-all; padding: 0.5rem; background: var(--bg-primary); border-radius: 4px;">
                        ${address}
                    </div>
                    <button onclick="window.GenesisCabinet.copyToClipboard('${address}', 'Адрес скопирован!')" class="btn-secondary" style="width: 100%; margin-top: 0.5rem; font-size: 0.8rem;">
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
    
    // MCP-MARKER:METHOD:SELECT_PAYMENT_CURRENCY - Выбор валюты оплаты
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
    
    // MCP-MARKER:METHOD:COPY_TO_CLIPBOARD - Копирование в буфер обмена
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
    
    // MCP-MARKER:METHOD:GENERATE_QR_CODE - Генерация QR кода
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
    
    // MCP-MARKER:METHOD:CHECK_PAYMENT_STATUS - Проверка статуса оплаты
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
    
    // MCP-MARKER:METHOD:VERIFY_PAYMENT - Верификация платежа
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
    
    // MCP-MARKER:METHOD:LOAD_CONFIRMATION_STEP - Загрузка шага подтверждения
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
    
    // MCP-MARKER:METHOD:PREVIOUS_WIZARD_STEP - Переход к предыдущему шагу
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
    
    // MCP-MARKER:METHOD:VIEW_PORTFOLIO - Переход к портфелю
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
    
    // MCP-MARKER:METHOD:CLOSE_DEPOSIT_MODAL - Закрытие модального окна депозита
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
    
    // MCP-MARKER:METHOD:CLOSE_ALL_MODALS - Закрытие всех модальных окон
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
    
    // MCP-MARKER:METHOD:SHOW_PURCHASE_MODAL - Показ модального окна покупки плана
    showPurchaseModal: function(planId) {
        console.log('🛒 Показ модального окна покупки для плана:', planId);
        this.showDepositModal(planId);
    },
    
    // MCP-MARKER:METHOD:SHOW_NOTIFICATION - Показ уведомления
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
    
    getUserPlanIds: function() {
        // Получаем ID планов пользователя из депозитов
        if (window.CabinetDepositService && window.CabinetDepositService.userDeposits) {
            return window.CabinetDepositService.userDeposits.map(d => d.planId);
        }
        
        // Временная имитация для демонстрации
        return ['trial']; // Предполагаем что у пользователя есть только trial
    },
    
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
    
    generateMockTxHash: function() {
        const chars = '0123456789abcdef';
        let hash = '0x';
        for (let i = 0; i < 64; i++) {
            hash += chars[Math.floor(Math.random() * chars.length)];
        }
        return hash;
    }
};

// MCP-MARKER:GLOBAL_FUNCTIONS - Глобальные функции для совместимости

// Закрытие модальных окон (для кнопок в HTML)
window.closeDepositModal = () => window.GenesisCabinet.closeDepositModal();
window.closeConfirmModal = () => window.GenesisCabinet.closeAllModals();
window.closeTransactionResultModal = () => window.GenesisCabinet.closeAllModals();

// Функции для экстренных действий
window.clearCacheAndReload = function() {
    if (confirm('🧹 Очистить кэш браузера и перезагрузить страницу?')) {
        localStorage.clear();
        sessionStorage.clear();
        location.reload(true);
    }
};

window.enableDevAccess = function() {
    const password = prompt('🔧 Введите пароль разработчика:');
    if (password === 'genesis2025') {
        window.GENESIS_CONFIG.app.debug = true;
        alert('✅ Режим разработчика активирован');
        console.log('🔧 Developer mode enabled');
    } else {
        alert('❌ Неверный пароль');
    }
};

// Функция выхода из кабинета
window.logout = function() {
    if (confirm('🚪 Выйти из кабинета?')) {
        localStorage.removeItem('genesis_user_address');
        location.reload();
    }
};

// MCP-MARKER:INITIALIZATION - Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    console.log('💼 Genesis Cabinet Integration loaded');
    
    // Интеграция с основным приложением кабинета
    if (window.cabinetApp) {
        const originalCheckAuth = window.cabinetApp.checkAuth;
        window.cabinetApp.checkAuth = async function() {
            await originalCheckAuth.call(this);
            if (this.isAuthenticated && this.currentUser) {
                window.GenesisCabinet.init(this.currentUser);
            }
        };
    }
    
    // Показываем экстренные действия через 10 секунд если загрузка не завершена
    setTimeout(() => {
        const emergencyActions = document.getElementById('emergency-actions');
        const loadingScreen = document.getElementById('loading-screen');
        
        if (emergencyActions && loadingScreen && !loadingScreen.classList.contains('hidden')) {
            emergencyActions.classList.remove('hidden');
        }
    }, 10000);
});

console.log('💼 Genesis Cabinet Deposit Integration loaded successfully');
