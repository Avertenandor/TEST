/**
 * GENESIS 1.1 - Улучшенная система депозитов
 * MCP-MARKER:MODULE:ENHANCED_DEPOSITS - Улучшенная система депозитов
 * MCP-MARKER:FILE:DEPOSITS_ENHANCED_JS - Файл улучшенных депозитов
 */

// MCP-MARKER:CLASS:ENHANCED_DEPOSIT_SYSTEM - Улучшенная система депозитов
window.EnhancedDepositSystem = {
    
    // MCP-MARKER:PROPERTY:VALIDATION_RULES - Правила валидации
    validationRules: {
        minAmount: 25,
        maxAmount: 2500,
        allowedCurrencies: ['USDT', 'PLEX'],
        addressPattern: /^0x[a-fA-F0-9]{40}$/
    },
    
    // MCP-MARKER:METHOD:VALIDATE_DEPOSIT - Валидация депозита
    async validateDeposit(depositData) {
        const errors = [];
        
        // Проверка адреса
        if (!depositData.address || !this.validationRules.addressPattern.test(depositData.address)) {
            errors.push('Неверный формат BSC адреса');
        }
        
        // Проверка суммы
        if (!depositData.amount || depositData.amount < this.validationRules.minAmount) {
            errors.push(`Минимальная сумма депозита: $${this.validationRules.minAmount}`);
        }
        
        if (depositData.amount > this.validationRules.maxAmount) {
            errors.push(`Максимальная сумма депозита: $${this.validationRules.maxAmount}`);
        }
        
        // Проверка валюты
        if (!depositData.currency || !this.validationRules.allowedCurrencies.includes(depositData.currency)) {
            errors.push(`Разрешенные валюты: ${this.validationRules.allowedCurrencies.join(', ')}`);
        }
        
        // Проверка плана депозита
        const plan = this.getDepositPlan(depositData.planId);
        if (!plan) {
            errors.push('Неверный план депозита');
        } else {
            // Проверка валютных ограничений плана
            if (!plan.currencies.includes(depositData.currency)) {
                errors.push(`План "${plan.title}" поддерживает только: ${plan.currencies.join(', ')}`);
            }
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    },
    
    // MCP-MARKER:METHOD:GET_DEPOSIT_PLAN - Получение плана депозита
    getDepositPlan(planId) {
        const config = window.GENESIS_CONFIG;
        return config.depositPlans.find(plan => plan.id === planId);
    },
    
    // MCP-MARKER:METHOD:CALCULATE_RETURNS - Расчет доходности
    calculateReturns(amount, planId) {
        const plan = this.getDepositPlan(planId);
        if (!plan) return null;
        
        const principal = parseFloat(amount);
        const returns = (principal * plan.percentage / 100) - principal;
        const dailyReturn = returns / plan.days;
        
        return {
            principal: principal,
            totalReturns: returns,
            totalAmount: principal + returns,
            dailyReturn: dailyReturn,
            percentage: plan.percentage,
            days: plan.days,
            plan: plan
        };
    },
    
    // MCP-MARKER:METHOD:CHECK_DEPOSIT_LIMITS - Проверка лимитов депозитов
    async checkDepositLimits(userAddress, newAmount) {
        try {
            // Используем API для проверки лимитов
            const result = await window.GenesisAPI.checkDepositLimitsForAddress(userAddress, newAmount);
            return result;
            
        } catch (error) {
            console.error('Ошибка проверки лимитов:', error);
            return {
                allowed: false,
                reason: 'Ошибка проверки лимитов депозитов',
                currentAmount: 0,
                newAmount: newAmount,
                totalAfter: newAmount
            };
        }
    },
    
    // MCP-MARKER:METHOD:CREATE_DEPOSIT - Создание депозита
    async createDeposit(depositData) {
        try {
            // Валидация
            const validation = await this.validateDeposit(depositData);
            if (!validation.isValid) {
                throw new Error(validation.errors.join('; '));
            }
            
            // Проверка лимитов
            const limitsCheck = await this.checkDepositLimits(depositData.address, depositData.amount);
            if (!limitsCheck.allowed) {
                throw new Error(limitsCheck.reason);
            }
            
            // Расчет доходности
            const returns = this.calculateReturns(depositData.amount, depositData.planId);
            if (!returns) {
                throw new Error('Ошибка расчета доходности');
            }
            
            // Создание транзакции депозита
            const transaction = await window.GenesisTransaction.createTransaction('deposit', {
                ...depositData,
                returns: returns,
                status: 'pending',
                createdAt: new Date(),
                expiresAt: new Date(Date.now() + returns.days * 24 * 60 * 60 * 1000)
            });
            
            // Логирование
            if (window.GenesisTerminal) {
                window.GenesisTerminal.log(
                    `💰 Создан депозит: $${depositData.amount} ${depositData.currency} (План: ${returns.plan.title})`,
                    'success'
                );
            }
            
            return {
                success: true,
                transaction: transaction,
                returns: returns
            };
            
        } catch (error) {
            console.error('Ошибка создания депозита:', error);
            
            if (window.GenesisTerminal) {
                window.GenesisTerminal.log(`❌ Ошибка депозита: ${error.message}`, 'error');
            }
            
            return {
                success: false,
                error: error.message
            };
        }
    },
    
    // MCP-MARKER:METHOD:FORMAT_CURRENCY - Форматирование валюты
    formatCurrency(amount, currency = 'USD') {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency === 'USDT' ? 'USD' : currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    },
    
    // MCP-MARKER:METHOD:GET_AVAILABLE_PLANS - Получение доступных планов
    getAvailablePlans() {
        const config = window.GENESIS_CONFIG;
        return config.depositPlans.sort((a, b) => a.order - b.order);
    },
    
    // MCP-MARKER:METHOD:INIT - Инициализация системы
    init() {
        console.log('🏦 Enhanced Deposit System initialized');
        
        // Добавляем глобальные функции для удобства
        window.validateDeposit = this.validateDeposit.bind(this);
        window.createDeposit = this.createDeposit.bind(this);
        window.calculateReturns = this.calculateReturns.bind(this);
        
        return this;
    }
};

// MCP-MARKER:INITIALIZATION:AUTO_INIT - Автоматическая инициализация
document.addEventListener('DOMContentLoaded', () => {
    window.EnhancedDepositSystem.init();
});

console.log('📦 Enhanced Deposit System loaded successfully');
