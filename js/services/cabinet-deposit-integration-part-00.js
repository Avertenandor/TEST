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
    
    // MCP-MARKER:METHOD:CABINET_DEPOSIT:INIT - Инициализация кабинета
    init: function(userAddress) {
        console.log('💼 Инициализация Genesis Cabinet...');
        this.currentUser = userAddress;
        this.setupEventListeners();
        this.loadUserDeposits();
        console.log('✅ Genesis Cabinet инициализирован');
    },
    
    // MCP-MARKER:METHOD:CABINET_DEPOSIT:SETUP_LISTENERS - Настройка обработчиков событий
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
    
    // MCP-MARKER:METHOD:CABINET_DEPOSIT:LOAD_DEPOSITS - Загрузка депозитов пользователя
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
    
    // MCP-MARKER:METHOD:CABINET_DEPOSIT:SHOW_MODAL - Показ модального окна создания депозита
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
    
    // MCP-MARKER:METHOD:CABINET_DEPOSIT:GENERATE_CONTENT - Генерация контента модального окна
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
    
    // MCP-MARKER:METHOD:CABINET_DEPOSIT:GENERATE_CARD - Генерация карточки плана
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
    
    // MCP-MARKER:METHOD:CABINET_DEPOSIT:SELECT_PLAN - Выбор плана депозита
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
    
    // MCP-MARKER:METHOD:CABINET_DEPOSIT:NEXT_STEP - Переход к следующему шагу мастера
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
    
    // MCP-MARKER:METHOD:CABINET_DEPOSIT:LOAD_PAYMENT - Загрузка шага оплаты
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
    
    // MCP-MARKER:METHOD:CABINET_DEPOSIT:PAYMENT_OPTION - Генерация варианта оплаты
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
