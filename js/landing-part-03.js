            const address = AUTH_CONFIG.address;
            
            navigator.clipboard.writeText(address).then(function() {
                console.log('✅ Адрес авторизации скопирован:', address);
                showNotification('Адрес авторизации скопирован!', 'success');
                
                // Анимация кнопки
                const addressBox = document.querySelector('.address-display-box');
                if (addressBox) {
                    addressBox.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        addressBox.style.transform = 'scale(1)';
                    }, 150);
                }
            }).catch(function(err) {
                console.error('❌ Ошибка копирования адреса авторизации:', err);
                showNotification('Ошибка копирования', 'error');
                
                // Fallback для старых браузеров
                const textArea = document.createElement('textarea');
                textArea.value = address;
                document.body.appendChild(textArea);
                textArea.select();
                try {
                    document.execCommand('copy');
                    showNotification('Адрес скопирован!', 'success');
                } catch (err) {
                    showNotification('Ошибка копирования', 'error');
                }
                document.body.removeChild(textArea);
            });
        }
        
        // Добавляем функцию в глобальную область
        window.copyAuthAddress = copyAuthAddress;
        
        // MCP-MARKER:FUNCTION:TEST_COPY_FUNCTIONS - Тестовые функции
        // Тестовая функция для проверки работы копирования
        function testCopyFunctions() {
            console.log('🧪 Тестирование функций копирования...');
            console.log('📋 AUTH_CONFIG.address:', AUTH_CONFIG.address);
            console.log('📋 copyAuthAddress function:', typeof copyAuthAddress);
            console.log('📋 copyAddress function:', typeof copyAddress);
            
            // Тестируем копирование
            copyAuthAddress();
        }
        
        // Добавляем тестовую функцию в глобальную область
        window.testCopyFunctions = testCopyFunctions;
        
        // MCP-MARKER:ANIMATION:AUTH_INSTRUCTIONS - Анимация инструкций авторизации
        // Анимация инструкции авторизации
        // MCP-MARKER:FUNCTION:INIT_AUTH_INSTRUCTION_ANIMATION - Инициализация анимаций инструкций
        function initAuthInstructionAnimation() {
            const steps = document.querySelectorAll('#auth-steps-list li');
            const words = document.querySelectorAll('#auth-steps-list .word');
            let currentStep = 0;
            let currentWord = 0;
            
        // MCP-MARKER:FUNCTION:ANIMATE_WORDS - Анимация слов
            // Функция анимации слов
            function animateWords() {
                // Убираем активность со всех слов
                words.forEach(word => {
                    word.classList.remove('active', 'completed');
                });
                
                // Убираем активность со всех шагов
                steps.forEach(step => {
                    step.classList.remove('step-active');
                });
                
                // Активируем текущий шаг
                if (steps[currentStep]) {
                    steps[currentStep].classList.add('step-active');
                }
                
                // Анимируем слова в текущем шаге
                const currentStepWords = steps[currentStep]?.querySelectorAll('.word');
                if (currentStepWords && currentStepWords[currentWord]) {
                    currentStepWords[currentWord].classList.add('active');
                    
                    // Помечаем предыдущие слова как завершенные
                    for (let i = 0; i < currentWord; i++) {
                        if (currentStepWords[i]) {
                            currentStepWords[i].classList.add('completed');
                        }
                    }
                    
                    currentWord++;
                    
                    // Если все слова в шаге анимированы, переходим к следующему шагу
                    if (currentWord >= currentStepWords.length) {
                        setTimeout(() => {
                            currentStep = (currentStep + 1) % steps.length;
                            currentWord = 0;
                        }, 1000);
                    }
                }
            }
            
            // Запускаем анимацию
            setInterval(animateWords, 800);
            
            // Запускаем сразу
            animateWords();
        }
        
        // MCP-MARKER:INIT:ANIMATION_INITIALIZATION - Инициализация анимации
        // Инициализация анимации при загрузке страницы
        document.addEventListener('DOMContentLoaded', function() {
            // Ждем загрузки всех элементов
            setTimeout(() => {
                initAuthInstructionAnimation();
            }, 2000);
        });
        
        // Добавляем функцию в глобальную область
        window.initAuthInstructionAnimation = initAuthInstructionAnimation;
        
        // MCP-MARKER:INIT:ENHANCED_DEPOSITS - Инициализация улучшенной системы депозитов
        document.addEventListener('DOMContentLoaded', function() {
            // Инициализация депозитной системы
            if (window.EnhancedDepositSystem) {
                initEnhancedDepositUI();
            }
        });
        
        // Функции для работы с депозитной системой
        function initEnhancedDepositUI() {
            loadDepositPlans();
            setupDepositFormHandlers();
            loadUserDepositStats();
        }
        
        function loadDepositPlans() {
            const plansGrid = document.getElementById('deposit-plans-grid');
            if (!plansGrid) return;
            
            const plans = window.EnhancedDepositSystem.getAvailablePlans();
            plansGrid.innerHTML = '';
            
            plans.forEach((plan, index) => {
                const isRecommended = plan.id === 'starter';
                const planCard = createDepositPlanCard(plan, isRecommended);
                plansGrid.appendChild(planCard);
            });
        }
        
        function createDepositPlanCard(plan, isRecommended = false) {
            const card = document.createElement('div');
            card.className = `deposit-plan-card ${isRecommended ? 'recommended' : ''}`;
            
            card.innerHTML = `
                <div class="plan-header">
                    <div class="plan-title">${plan.title}</div>
                    <div class="plan-subtitle">${plan.description}</div>
                    <div class="plan-amount">$${plan.usdtAmount}</div>
                    <div class="plan-percentage">${plan.percentage}% за ${plan.days} дней</div>
                </div>
                <ul class="plan-features">
                    <li>Минимум: $${plan.usdtAmount}</li>
                    <li>Доходность: ${plan.percentage}%</li>
                    <li>Срок: ${plan.days} дней</li>
                    <li>Валюты: ${plan.currencies.join(', ')}</li>
                    <li>Автоматические выплаты</li>
                    <li>Полная гарантия</li>
                </ul>
                <button class="plan-select-btn" onclick="selectDepositPlan('${plan.id}')">
                    💰 Выбрать план
                </button>
            `;
            
            return card;
        }
        
        // MCP-MARKER:FUNCTION:SELECT_DEPOSIT_PLAN - Выбор депозитного плана
        function selectDepositPlan(planId) {
            const formContainer = document.getElementById('deposit-form-container');
            const planSelect = document.getElementById('deposit-plan');
            
            if (formContainer && planSelect) {
                // Показываем форму
                formContainer.style.display = 'block';
                formContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                // Выбираем план
                planSelect.value = planId;
                
                // Загружаем планы в select
                loadPlansIntoSelect();
                
                // Обновляем расчеты
                updateDepositCalculation();
            }
        }
        
        function loadPlansIntoSelect() {
            const planSelect = document.getElementById('deposit-plan');
            if (!planSelect) return;
            
            const plans = window.EnhancedDepositSystem.getAvailablePlans();
            planSelect.innerHTML = '<option value="">Выберите план</option>';
            
            plans.forEach(plan => {
                const option = document.createElement('option');
                option.value = plan.id;
                option.textContent = `${plan.title} - ${plan.percentage}% за ${plan.days} дней`;
                planSelect.appendChild(option);
            });
        }
        
        function setupDepositFormHandlers() {
            const form = document.getElementById('enhanced-deposit-form');
            const amountInput = document.getElementById('deposit-amount');
            const planSelect = document.getElementById('deposit-plan');
            const currencySelect = document.getElementById('deposit-currency');
            
            if (form) {
                form.addEventListener('submit', handleDepositSubmit);
            }
            
            if (amountInput) {
                amountInput.addEventListener('input', updateDepositCalculation);
            }
            
            if (planSelect) {
                planSelect.addEventListener('change', updateDepositCalculation);
            }
            
            if (currencySelect) {
                currencySelect.addEventListener('change', updateDepositCalculation);
            }
        }
        
        function updateDepositCalculation() {
            const amount = parseFloat(document.getElementById('deposit-amount')?.value) || 0;
            const planId = document.getElementById('deposit-plan')?.value;
            
            if (amount > 0 && planId) {
                const returns = window.EnhancedDepositSystem.calculateReturns(amount, planId);
                if (returns) {
                    displayCalculation(returns);
                    checkDepositLimits(amount);
                }
            } else {
                hideCalculation();
            }
        }
        
        function displayCalculation(returns) {
            const calcSection = document.getElementById('deposit-calculation');
            if (!calcSection) return;
            
            calcSection.style.display = 'block';
            
            document.getElementById('calc-principal').textContent = `$${returns.principal.toFixed(2)}`;
            document.getElementById('calc-returns').textContent = `$${returns.totalReturns.toFixed(2)}`;
            document.getElementById('calc-daily').textContent = `$${returns.dailyReturn.toFixed(2)}`;
            document.getElementById('calc-total').textContent = `$${returns.totalAmount.toFixed(2)}`;
            document.getElementById('calc-period').textContent = `${returns.days} дней`;
            document.getElementById('calc-percentage').textContent = `${returns.percentage}%`;
        }
        
        function hideCalculation() {
            const calcSection = document.getElementById('deposit-calculation');
            if (calcSection) {
                calcSection.style.display = 'none';
            }
        }
        
        function checkDepositLimits(newAmount) {
            const address = document.getElementById('deposit-address')?.value;
            if (!address) return;
            
            window.EnhancedDepositSystem.checkDepositLimits(address, newAmount)
                .then(result => {
                    displayLimitsInfo(result);
                })
                .catch(error => {
                    console.error('Ошибка проверки лимитов:', error);
                });
        }
        
        function displayLimitsInfo(limitsResult) {
            const limitsSection = document.getElementById('deposit-limits');
            if (!limitsSection) return;
            
            limitsSection.style.display = 'block';
            
            document.getElementById('current-deposits').textContent = `$${limitsResult.currentAmount.toFixed(2)}`;
            document.getElementById('total-after').textContent = `$${limitsResult.totalAfter.toFixed(2)}`;
            
            const availableLimit = 2500 - limitsResult.totalAfter;
            document.getElementById('available-limit').textContent = `$${availableLimit.toFixed(2)}`;
            
            if (!limitsResult.allowed) {
                showValidationErrors([limitsResult.reason]);
            } else {
                hideValidationErrors();
            }
        }
        
        function showValidationErrors(errors) {
            const errorsSection = document.getElementById('validation-errors');
            const errorsList = document.getElementById('error-list');
            
            if (errorsSection && errorsList) {
                errorsSection.style.display = 'block';
                errorsList.innerHTML = '';
                
                errors.forEach(error => {
                    const li = document.createElement('li');
                    li.textContent = error;
                    errorsList.appendChild(li);
                });
            }
        }
        
        function hideValidationErrors() {
            const errorsSection = document.getElementById('validation-errors');
            if (errorsSection) {
                errorsSection.style.display = 'none';
            }
        }
        
        async function handleDepositSubmit(event) {
            event.preventDefault();
            
            const submitBtn = document.getElementById('create-deposit-btn');
            const btnText = submitBtn.querySelector('.btn-text');
            const btnLoading = submitBtn.querySelector('.btn-loading');
            
            // Показываем загрузку
            btnText.style.display = 'none';
            btnLoading.style.display = 'inline-flex';
            submitBtn.disabled = true;
            
            try {
                const formData = {
                    planId: document.getElementById('deposit-plan').value,
                    amount: parseFloat(document.getElementById('deposit-amount').value),
                    currency: document.getElementById('deposit-currency').value,
                    address: document.getElementById('deposit-address').value
                };
                
                const result = await window.EnhancedDepositSystem.createDeposit(formData);
                
                if (result.success) {
                    alert('✅ Депозит успешно создан! Проверьте свой кошелек для подтверждения транзакции.');
                    closeDepositForm();
                    loadUserDepositStats();
                } else {
                    showValidationErrors([result.error]);
                }
                
            } catch (error) {
                console.error('Ошибка создания депозита:', error);
                showValidationErrors(['Произошла ошибка при создании депозита']);
            } finally {
                // Скрываем загрузку
                btnText.style.display = 'inline';
                btnLoading.style.display = 'none';
                submitBtn.disabled = false;
            }
        }
        
        // MCP-MARKER:FUNCTION:CLOSE_DEPOSIT_FORM - Закрытие формы депозита
    function closeDepositForm() {
            const formContainer = document.getElementById('deposit-form-container');
            if (formContainer) {
                formContainer.style.display = 'none';
                
                // Очищаем форму
                const form = document.getElementById('enhanced-deposit-form');
                if (form) {
                    form.reset();
                    hideCalculation();
                    hideValidationErrors();
            const limits = document.getElementById('deposit-limits');
            if (limits) limits.style.display = 'none';
                }
            }
        }
        
        function loadUserDepositStats() {
            // Заглушка для статистики пользователя
        const elTotal = document.getElementById('total-deposits');
        const elEarnings = document.getElementById('total-earnings');
        const elActive = document.getElementById('active-deposits');
        if (elTotal) elTotal.textContent = '$0';
        if (elEarnings) elEarnings.textContent = '$0';
        if (elActive) elActive.textContent = '0';
        }
        
        // MCP-MARKER:FUNCTION:PASTE_FROM_CLIPBOARD - Вставка из буфера обмена
        function pasteFromClipboard(inputId) {
            navigator.clipboard.readText()
                .then(text => {
                    const input = document.getElementById(inputId);
                    if (input) {
                        input.value = text;
                        input.dispatchEvent(new Event('input'));
                    }
                })
                .catch(err => {
                    console.error('Ошибка вставки из буфера:', err);
                });
        }
        
        // Глобальные функции
        window.selectDepositPlan = selectDepositPlan;
        window.closeDepositForm = closeDepositForm;
        window.pasteFromClipboard = pasteFromClipboard;
        
        // MCP-MARKER:FUNCTION:CHECK_CABINET_ACCESS - Проверка доступа к кабинету
        // Проверяем, есть ли сохраненный адрес пользователя для показа быстрого входа
        function checkCabinetAccess() {
            try {
                const savedAddress = localStorage.getItem('genesis_user_address');
                const authStatus = localStorage.getItem('genesis_auth_status');
                const quickAccess = document.getElementById('quick-cabinet-access');
                const authSection = document.getElementById('genesis-auth-section');
                
                if (savedAddress && quickAccess) {
                    console.log('🏦 Найден сохраненный адрес пользователя, показываем быстрый вход');
                    quickAccess.classList.add('show');
                    
                    // Скрываем основную форму авторизации
                    if (authSection) {
                        authSection.style.opacity = '0.5';
                        authSection.style.pointerEvents = 'none';
                    }
                } else {
                    if (quickAccess) {
                        quickAccess.classList.remove('show');
                    }
                    
                    // Показываем основную форму авторизации
                    if (authSection) {
                        authSection.style.opacity = '1';
                        authSection.style.pointerEvents = 'auto';
                    }
                }
            } catch (error) {
                console.error('Ошибка проверки доступа к кабинету:', error);
            }
        }
        
