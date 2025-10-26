/**
 * GENESIS 1.1 - Система создания депозитов
 * MCP-MARKER:MODULE:DEPOSIT_CREATION_SYSTEM - Система создания депозитов
 * MCP-MARKER:FILE:DEPOSIT_CREATION_SYSTEM_JS - Файл системы создания депозитов
 */

// MCP-MARKER:CLASS:DEPOSIT_CREATION_SYSTEM - Система создания депозитов
window.DepositCreationSystem = {
    
    // MCP-MARKER:PROPERTY:CREATION_STATE - Состояние создания депозита
    currentStep: 1,
    selectedPlan: null,
    selectedCurrency: null,
    paymentInfo: null,
    transactionMonitoring: null,
    
    // MCP-MARKER:METHOD:INIT_SYSTEM - Инициализация системы
    init() {
        console.log('💰 Инициализация системы создания депозитов...');
        this.setupEventListeners();
        console.log('✅ Система создания депозитов готова');
    },
    
    // MCP-MARKER:METHOD:SETUP_EVENT_LISTENERS - Настройка обработчиков событий
    setupEventListeners() {
        // Обработчики для закрытия модальных окон
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    },
    
    // MCP-MARKER:METHOD:START_DEPOSIT_CREATION - Начало создания депозита
    startDepositCreation(planId) {
        const plan = window.getDepositPlanById(planId);
        if (!plan) {
            this.showError('План депозита не найден');
            return;
        }
        
        // Проверяем последовательность планов
        const userPlanIds = this.getUserPlanIds();
        const validationResult = window.validateDepositSequence(userPlanIds.map(id => ({ planId: id, status: 'COMPLETED' })), planId);
        
        if (!validationResult.allowed) {
            this.showError(validationResult.message);
            return;
        }
        
        this.selectedPlan = plan;
        this.currentStep = 1;
        this.showDepositCreationModal();
        
        if (window.GenesisTerminal) {
            window.GenesisTerminal.log(`💰 Начато создание депозита: ${plan.name}`, 'info');
        }
    },
    
    // MCP-MARKER:METHOD:SHOW_DEPOSIT_CREATION_MODAL - Показ модального окна создания
    showDepositCreationModal() {
        const modal = document.getElementById('create-deposit-modal');
        const content = document.getElementById('deposit-modal-content');
        
        if (!modal || !content) {
            this.showError('Модальное окно не найдено');
            return;
        }
        
        content.innerHTML = this.generateWizardContent();
        modal.classList.remove('hidden');
        
        // Добавляем обработчики для кнопок
        this.attachWizardEventListeners();
    },
    
    // MCP-MARKER:METHOD:GENERATE_WIZARD_CONTENT - Генерация контента мастера
    generateWizardContent() {
        const steps = [
            { number: 1, title: 'Выбор плана', icon: '📋', active: this.currentStep === 1 },
            { number: 2, title: 'Выбор валюты', icon: '💳', active: this.currentStep === 2 },
            { number: 3, title: 'Оплата', icon: '🔗', active: this.currentStep === 3 },
            { number: 4, title: 'Подтверждение', icon: '✅', active: this.currentStep === 4 }
        ];
        
        const stepsHTML = steps.map(step => `
            <div class="wizard-step ${step.active ? 'active' : ''} ${step.number < this.currentStep ? 'completed' : ''}" 
                 style="display: flex; flex-direction: column; align-items: center; padding: 1rem; border-radius: 8px; 
                        background: ${step.active ? 'var(--primary-color)' : step.number < this.currentStep ? 'var(--success-color)' : 'var(--bg-primary)'}; 
                        color: ${step.active || step.number < this.currentStep ? 'white' : 'var(--text-secondary)'}; 
                        border: 2px solid ${step.active ? 'var(--primary-color)' : step.number < this.currentStep ? 'var(--success-color)' : 'var(--border-color)'};">
                <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">${step.icon}</div>
                <div style="font-weight: 600; font-size: 0.9rem; text-align: center;">${step.title}</div>
                <div style="font-size: 0.8rem; margin-top: 0.3rem;">Шаг ${step.number}</div>
            </div>
        `).join('');
        
        return `
            <div class="deposit-wizard-container">
                <!-- Прогресс-бар шагов -->
                <div class="wizard-steps" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border-color);">
                    ${stepsHTML}
                </div>
                
                <!-- Контент текущего шага -->
                <div class="wizard-content" style="min-height: 400px;">
                    ${this.getStepContent()}
                </div>
                
                <!-- Навигационные кнопки -->
                <div class="wizard-navigation" style="display: flex; justify-content: space-between; margin-top: 2rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">
                    <button id="wizard-back" class="btn-outline" 
                            onclick="window.DepositCreationSystem.previousStep()" 
                            style="visibility: ${this.currentStep > 1 ? 'visible' : 'hidden'}">
                        ← Назад
                    </button>
                    <button id="wizard-next" class="btn" 
                            onclick="window.DepositCreationSystem.nextStep()">
                        ${this.currentStep === 4 ? 'Завершить' : 'Далее →'}
                    </button>
                </div>
            </div>
        `;
    },
    
    // MCP-MARKER:METHOD:GET_STEP_CONTENT - Получение контента шага
    getStepContent() {
        switch (this.currentStep) {
            case 1:
                return this.getStep1Content();
            case 2:
                return this.getStep2Content();
            case 3:
                return this.getStep3Content();
            case 4:
                return this.getStep4Content();
            default:
                return '<div>Неизвестный шаг</div>';
        }
    },
    
    // MCP-MARKER:METHOD:GET_STEP1_CONTENT - Контент шага 1: Выбор плана
    getStep1Content() {
        if (!this.selectedPlan) return '<div>План не выбран</div>';
        
        const profit = (this.selectedPlan.usdtAmount * this.selectedPlan.percentage / 100) - this.selectedPlan.usdtAmount;
        const dailyProfit = profit / this.selectedPlan.days;
        
        return `
            <div class="step-content">
                <h3 style="color: var(--primary-color); margin-bottom: 1.5rem; text-align: center;">
                    📋 Подтверждение выбранного плана
                </h3>
                
                <div style="background: var(--bg-primary); padding: 2rem; border-radius: 12px; border: 2px solid var(--primary-color); margin-bottom: 2rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                        <div>
                            <h4 style="color: var(--primary-color); margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
                                <span style="font-size: 2rem;">${this.getPlanIcon(this.selectedPlan.name)}</span>
                                ${this.selectedPlan.name}
                            </h4>
                            <p style="color: var(--text-secondary); margin: 0;">${this.selectedPlan.description}</p>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 1.8rem; font-weight: 700; color: var(--text-primary);">
                                $${this.selectedPlan.usdtAmount.toLocaleString()}
                            </div>
                            <div style="color: var(--success-color); font-size: 1rem; font-weight: 600;">
                                ${this.selectedPlan.percentage}% за ${this.selectedPlan.days} дней
                            </div>
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 1.5rem;">
                        <div style="text-align: center; padding: 1rem; background: var(--bg-secondary); border-radius: 8px;">
                            <div style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem;">Инвестиция</div>
                            <div style="color: var(--text-primary); font-weight: 600; font-size: 1.1rem;">$${this.selectedPlan.usdtAmount}</div>
                        </div>
                        <div style="text-align: center; padding: 1rem; background: var(--bg-secondary); border-radius: 8px;">
                            <div style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem;">Общая прибыль</div>
                            <div style="color: var(--success-color); font-weight: 600; font-size: 1.1rem;">$${profit.toFixed(2)}</div>
                        </div>
                        <div style="text-align: center; padding: 1rem; background: var(--bg-secondary); border-radius: 8px;">
                            <div style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem;">Ежедневно</div>
                            <div style="color: var(--primary-color); font-weight: 600; font-size: 1.1rem;">$${dailyProfit.toFixed(2)}</div>
                        </div>
                        <div style="text-align: center; padding: 1rem; background: var(--bg-secondary); border-radius: 8px;">
                            <div style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem;">Общий возврат</div>
                            <div style="color: var(--warning-color); font-weight: 600; font-size: 1.1rem;">$${(this.selectedPlan.usdtAmount + profit).toFixed(2)}</div>
                        </div>
                    </div>
                    
                    <div style="background: var(--bg-secondary); padding: 1rem; border-radius: 8px;">
                        <h5 style="color: var(--secondary-color); margin-bottom: 0.8rem;">💰 Доступные валюты для оплаты:</h5>
                        <div style="display: flex; gap: 1rem;">
                            ${this.selectedPlan.currencies.map(currency => `
                                <div style="display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background: var(--bg-primary); border-radius: 6px; border: 1px solid var(--border-color);">
                                    <span style="font-size: 1.2rem;">${currency === 'USDT' ? '💵' : '🪙'}</span>
                                    <span style="color: var(--text-primary); font-weight: 600;">${currency}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
                
                <div style="background: rgba(0, 212, 255, 0.1); padding: 1rem; border-radius: 8px; border: 1px solid var(--secondary-color);">
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                        <span style="font-size: 1.2rem;">ℹ️</span>
                        <span style="color: var(--secondary-color); font-weight: 600;">Важная информация</span>
                    </div>
                    <ul style="color: var(--text-secondary); margin: 0; padding-left: 1.5rem; line-height: 1.6;">
                        <li>Депозит активируется автоматически после подтверждения платежа</li>
                        <li>Доходность начисляется ежедневно в течение ${this.selectedPlan.days} дней</li>
                        <li>Все операции отслеживаются в блокчейне BSC</li>
                        <li>Минимальные комиссии сети BSC (~$0.10-0.50)</li>
                    </ul>
                </div>
            </div>
        `;
    },
    
    // MCP-MARKER:METHOD:GET_STEP2_CONTENT - Контент шага 2: Выбор валюты
    getStep2Content() {
        if (!this.selectedPlan) return '<div>План не выбран</div>';
        
        return `
            <div class="step-content">
                <h3 style="color: var(--primary-color); margin-bottom: 1.5rem; text-align: center;">
                    💳 Выберите валюту для оплаты
                </h3>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
                    ${this.selectedPlan.currencies.map(currency => `
                        <div class="currency-card ${this.selectedCurrency === currency ? 'selected' : ''}" 
                             onclick="window.DepositCreationSystem.selectCurrency('${currency}')"
                             style="background: var(--bg-primary); padding: 2rem; border-radius: 12px; border: 2px solid ${this.selectedCurrency === currency ? 'var(--primary-color)' : 'var(--border-color)'}; cursor: pointer; transition: all 0.3s ease; position: relative;">
                            
                            ${this.selectedCurrency === currency ? '<div style="position: absolute; top: 1rem; right: 1rem; color: var(--success-color); font-size: 1.5rem;">✓</div>' : ''}
                            
                            <div style="text-align: center; margin-bottom: 1.5rem;">
                                <div style="font-size: 3rem; margin-bottom: 0.5rem;">${currency === 'USDT' ? '💵' : '🪙'}</div>
                                <h4 style="color: var(--text-primary); margin-bottom: 0.5rem;">${currency}</h4>
                                <p style="color: var(--text-secondary); font-size: 0.9rem; margin: 0;">
                                    ${currency === 'USDT' ? 'Tether USD - Стабильная монета' : 'PLEX ONE - Токен платформы'}
                                </p>
                            </div>
                            
                            <div style="background: var(--bg-secondary); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                    <span style="color: var(--text-secondary);">Сумма к оплате:</span>
                                    <span style="color: var(--text-primary); font-weight: 600;">
                                        ${currency === 'USDT' ? 
                                            `$${this.selectedPlan.usdtAmount}` : 
                                            `${this.selectedPlan.plexAmount.toLocaleString()} PLEX`
                                        }
                                    </span>
                                </div>
                                ${currency === 'PLEX' ? `
                                    <div style="display: flex; justify-content: space-between; font-size: 0.8rem;">
                                        <span style="color: var(--text-secondary);">≈ USD:</span>
                                        <span style="color: var(--secondary-color);">$${(this.selectedPlan.plexAmount * 0.05).toFixed(2)}</span>
                                    </div>
                                ` : ''}
                            </div>
                            
                            <div style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.4;">
                                ${currency === 'USDT' ? 
                                    '• Комиссия сети: ~$0.10-0.50<br>• Мгновенные переводы<br>• Стабильная стоимость' :
                                    '• Комиссия сети: ~$0.10-0.50<br>• Бонусы за использование PLEX<br>• Дополнительные привилегии'
                                }
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                ${this.selectedCurrency ? `
                    <div style="background: rgba(0, 255, 65, 0.1); padding: 1rem; border-radius: 8px; border: 1px solid var(--success-color);">
                        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                            <span style="font-size: 1.2rem;">✅</span>
                            <span style="color: var(--success-color); font-weight: 600;">Валюта выбрана: ${this.selectedCurrency}</span>
                        </div>
                        <p style="color: var(--text-secondary); margin: 0; font-size: 0.9rem;">
                            На следующем шаге вы получите QR-код и инструкции для оплаты
                        </p>
                    </div>
                ` : `
                    <div style="background: rgba(255, 165, 0, 0.1); padding: 1rem; border-radius: 8px; border: 1px solid var(--warning-color);">
                        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                            <span style="font-size: 1.2rem;">⚠️</span>
                            <span style="color: var(--warning-color); font-weight: 600;">Выберите валюту для продолжения</span>
                        </div>
                        <p style="color: var(--text-secondary); margin: 0; font-size: 0.9rem;">
                            Выберите одну из доступных валют для оплаты депозита
                        </p>
                    </div>
                `}
            </div>
        `;
    },
    
    // MCP-MARKER:METHOD:GET_STEP3_CONTENT - Контент шага 3: Оплата
    getStep3Content() {
        if (!this.selectedPlan || !this.selectedCurrency) {
            return '<div>Недостаточно данных для генерации платежа</div>';
        }
        
        this.generatePaymentInfo();
        
        return `
            <div class="step-content">
                <h3 style="color: var(--primary-color); margin-bottom: 1.5rem; text-align: center;">
                    🔗 Оплата депозита
                </h3>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem;">
                    <!-- QR-код для оплаты -->
                    <div style="text-align: center;">
                        <h4 style="color: var(--secondary-color); margin-bottom: 1rem;">📱 QR-код для оплаты</h4>
                        <div style="background: white; padding: 1rem; border-radius: 12px; display: inline-block; margin-bottom: 1rem;">
                            <div id="qr-code-container" style="width: 200px; height: 200px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; color: #666;">
                                QR-код генерируется...
                            </div>
                        </div>
                        <div style="font-size: 0.8rem; color: var(--text-secondary);">
                            Отсканируйте в мобильном кошельке
                        </div>
                    </div>
                    
                    <!-- Детали платежа -->
                    <div>
                        <h4 style="color: var(--warning-color); margin-bottom: 1rem;">💰 Детали платежа</h4>
                        <div style="background: var(--bg-primary); padding: 1.5rem; border-radius: 12px; margin-bottom: 1rem;">
                            <div style="margin-bottom: 1rem;">
                                <div style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.3rem;">Адрес получателя:</div>
                                <div style="font-family: monospace; font-size: 0.85rem; color: var(--text-primary); background: var(--bg-secondary); padding: 0.5rem; border-radius: 6px; word-break: break-all;">
                                    ${window.GENESIS_CONFIG.addresses.system}
                                </div>
                                <button onclick="window.DepositCreationSystem.copyToClipboard('${window.GENESIS_CONFIG.addresses.system}')" 
                                        class="btn-secondary" style="margin-top: 0.5rem; font-size: 0.8rem; padding: 0.3rem 0.8rem;">
                                    📋 Копировать адрес
                                </button>
                            </div>
                            
                            <div style="margin-bottom: 1rem;">
                                <div style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.3rem;">Сумма к оплате:</div>
                                <div style="font-size: 1.2rem; font-weight: 600; color: var(--primary-color);">
                                    ${this.selectedCurrency === 'USDT' ? 
                                        `${this.selectedPlan.usdtAmount} USDT` : 
                                        `${this.selectedPlan.plexAmount.toLocaleString()} PLEX`
                                    }
                                </div>
                                <button onclick="window.DepositCreationSystem.copyToClipboard('${this.selectedCurrency === 'USDT' ? this.selectedPlan.usdtAmount : this.selectedPlan.plexAmount}')" 
                                        class="btn-secondary" style="margin-top: 0.5rem; font-size: 0.8rem; padding: 0.3rem 0.8rem;">
                                    📋 Копировать сумму
                                </button>
                            </div>
                            
                            <div style="margin-bottom: 1rem;">
                                <div style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.3rem;">Сеть:</div>
                                <div style="color: var(--secondary-color); font-weight: 600;">BSC (BEP-20)</div>
                            </div>
                            
                            <div>
                                <div style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.3rem;">Токен контракт:</div>
                                <div style="font-family: monospace; font-size: 0.8rem; color: var(--text-primary); background: var(--bg-secondary); padding: 0.5rem; border-radius: 6px; word-break: break-all;">
                                    ${this.selectedCurrency === 'USDT' ? 
                                        window.GENESIS_CONFIG.usdt.address : 
                                        window.GENESIS_CONFIG.plex.address
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Инструкции -->
                <div style="background: rgba(255, 107, 53, 0.1); padding: 1.5rem; border-radius: 12px; border: 1px solid var(--primary-color); margin-bottom: 2rem;">
                    <h5 style="color: var(--primary-color); margin-bottom: 1rem;">📝 Инструкции по оплате</h5>
                    <ol style="color: var(--text-secondary); line-height: 1.6; margin: 0; padding-left: 1.5rem;">
                        <li>Откройте мобильный кошелек (Trust Wallet, MetaMask, Binance Chain Wallet)</li>
                        <li>Выберите сеть BSC (BEP-20)</li>
                        <li>Отсканируйте QR-код или скопируйте адрес получателя</li>
                        <li>Убедитесь, что сумма точно соответствует указанной выше</li>
                        <li>Подтвердите транзакцию в кошельке</li>
                        <li>Дождитесь подтверждения (обычно 1-2 минуты)</li>
                    </ol>
                </div>
                
                <!-- Мониторинг статуса -->
                <div style="background: var(--bg-primary); padding: 1.5rem; border-radius: 12px; border: 1px solid var(--border-color);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <h5 style="color: var(--secondary-color); margin: 0;">🔍 Статус оплаты</h5>
                        <button onclick="window.DepositCreationSystem.checkPaymentStatus()" 
                                class="btn-outline" style="font-size: 0.8rem; padding: 0.5rem 1rem;">
                            🔄 Проверить
                        </button>
                    </div>
                    <div id="payment-status" style="color: var(--warning-color); font-weight: 600;">
                        ⏳ Ожидание оплаты...
                    </div>
                    <div style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 0.5rem;">
                        Автоматическая проверка каждые 30 секунд
                    </div>
                </div>
            </div>
        `;
    },
    
    // MCP-MARKER:METHOD:GET_STEP4_CONTENT - Контент шага 4: Подтверждение
    getStep4Content() {
        return `
            <div class="step-content">
                <h3 style="color: var(--success-color); margin-bottom: 1.5rem; text-align: center;">
                    ✅ Депозит успешно создан!
                </h3>
                
                <div style="text-align: center; margin-bottom: 2rem;">
                    <div style="font-size: 4rem; margin-bottom: 1rem; animation: pulse 2s infinite;">🎉</div>
                    <h4 style="color: var(--text-primary); margin-bottom: 0.5rem;">Поздравляем!</h4>
                    <p style="color: var(--text-secondary);">Ваш депозит ${this.selectedPlan?.name} успешно активирован</p>
                </div>
                
                <div style="background: var(--bg-primary); padding: 2rem; border-radius: 12px; border: 2px solid var(--success-color); margin-bottom: 2rem;">
                    <h5 style="color: var(--success-color); margin-bottom: 1rem;">📊 Сводка депозита</h5>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
                        <div>
                            <div style="color: var(--text-secondary); font-size: 0.9rem;">План:</div>
                            <div style="color: var(--text-primary); font-weight: 600;">${this.selectedPlan?.name}</div>
                        </div>
                        <div>
                            <div style="color: var(--text-secondary); font-size: 0.9rem;">Инвестиция:</div>
                            <div style="color: var(--text-primary); font-weight: 600;">
                                ${this.selectedCurrency === 'USDT' ? 
                                    `$${this.selectedPlan?.usdtAmount}` : 
                                    `${this.selectedPlan?.plexAmount.toLocaleString()} PLEX`
                                }
                            </div>
                        </div>
                        <div>
                            <div style="color: var(--text-secondary); font-size: 0.9rem;">Срок:</div>
                            <div style="color: var(--text-primary); font-weight: 600;">${this.selectedPlan?.days} дней</div>
                        </div>
                        <div>
                            <div style="color: var(--text-secondary); font-size: 0.9rem;">Доходность:</div>
                            <div style="color: var(--success-color); font-weight: 600;">${this.selectedPlan?.percentage}%</div>
                        </div>
                    </div>
                </div>
                
                <div style="display: flex; gap: 1rem; justify-content: center;">
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
