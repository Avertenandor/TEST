                    try {
                        const accessData = await this.services.platformAccess.checkUserAccessBalance(address);
                        
                        if (accessData.isActive && accessData.daysRemaining > 0) {
                            this.showAuthorizedUI();
                            this.showSuccess(`Авторизация успешна! Доступ: ${accessData.daysRemaining} дней`);
                        } else {
                            this.showAccessPaymentRequired(address);
                        }
                    } catch (error) {
                        console.error('Ошибка проверки доступа:', error);
                        this.showAuthorizedUI();
                        this.showSuccess('Оплата получена! Добро пожаловать!');
                    }
                }
            } catch (error) {
                console.error('Ошибка проверки оплаты:', error);
            }
        }, 5000); // Проверяем каждые 5 секунд
        
        // Останавливаем проверку через 10 минут
        setTimeout(() => clearInterval(checkInterval), 600000);
    },
    
    // MCP-MARKER:SECTION:UI_METHODS - Методы UI
    showAuthForm() {
        const authSection = document.getElementById('genesis-auth-section');
        if (authSection) {
            authSection.style.display = 'block';
        }
    },
    
    showAuthorizedUI() {
        // Показываем индикатор загрузки
        const loadingEl = document.createElement('div');
        loadingEl.className = 'genesis-transition-loading';
        loadingEl.innerHTML = `
            <div class="transition-content">
                <div class="spinner"></div>
                <p>Загрузка личного кабинета...</p>
            </div>
        `;
        document.body.appendChild(loadingEl);
        
        // Скрываем форму авторизации
        const authSection = document.getElementById('genesis-auth-section');
        if (authSection) {
            authSection.style.display = 'none';
        }
        
        // Перенаправляем в модульный кабинет с относительным путем и небольшой задержкой для плавности
        setTimeout(() => {
            window.location.href = 'app.html';
        }, 500);
    },
    
    // MCP-MARKER:METHOD:SHOW_ACCESS_PAYMENT - Показать требование оплаты доступа
    showAccessPaymentRequired(userAddress) {
        // Скрываем форму авторизации
        const authSection = document.getElementById('genesis-auth-section');
        if (authSection) {
            authSection.style.display = 'none';
        }
        
        // Показываем экран требования оплаты доступа
        if (this.services.platformAccess && this.services.platformAccess.showPaymentModal) {
            this.services.platformAccess.showPaymentModal(10);
        } else {
            // Fallback - показываем уведомление
            alert('Требуется оплата доступа к платформе: $10-100 USDT');
            this.showAuthForm();
        }
        
        if (this.services.terminal) {
            this.services.terminal.log('⚠️ Требуется оплата доступа к платформе', 'warning');
        }
    },
    
    showPaymentQR() {
        const qrSection = document.getElementById('qr-section');
        if (qrSection) {
            qrSection.style.display = 'block';
            // Генерируем QR код
            const qrContainer = document.getElementById('genesis-qr-code');
            if (qrContainer) {
                if (window.QRCode) {
                    new window.QRCode(qrContainer, {
                        text: window.GENESIS_CONFIG?.addresses?.system || '0x399B22170B0AC7BB20bdC86772BfF478f201fFCD',
                        width: 200,
                        height: 200,
                        colorDark: '#000000',
                        colorLight: '#ffffff',
                        correctLevel: window.QRCode.CorrectLevel.M
                    });
                } else {
                    // Fallback для QR кода
                    console.warn('⚠️ QRCode не найден, показываем текстовую версию');
                    qrContainer.innerHTML = `
                        <div style="width:200px;height:200px;background:#f0f0f0;display:flex;align-items:center;justify-content:center;border-radius:10px;color:#333;text-align:center;font-size:12px;padding:10px;">
                            📱 QR КОД<br><br>
                            ${window.GENESIS_CONFIG?.addresses?.system || '0x399B22170B0AC7BB20bdC86772BfF478f201fFCD'}
                        </div>
                    `;
                }
            }
        }
    },
    
    updateLoadingStatus(message) {
        const statusEl = document.getElementById('loading-status');
        if (statusEl) {
            statusEl.textContent = message;
        }
    },
    
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('genesis-loading');
        const mainApp = document.getElementById('genesis-app');
        
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                
                // Показываем основное приложение
                if (mainApp) {
                    mainApp.classList.remove('hidden-initially');
                    mainApp.style.display = 'block';
                }
            }, 300);
        }
    },
    
    showError(message) {
        if (this.services.terminal) {
            this.services.terminal.log(message, 'error');
        }
        // Можно добавить показ уведомления
    },
    
    showSuccess(message) {
        if (this.services.terminal) {
            this.services.terminal.log(message, 'success');
        }
        // Можно добавить показ уведомления
    },
    
    updateSystemTime() {
        const timeElements = document.querySelectorAll('[data-time]');
        const now = new Date();
        timeElements.forEach(el => {
            el.textContent = now.toLocaleTimeString();
        });
    },
    
    updateDeviceInfo() {
        // Обновляем информацию об устройстве
        if (window.updateTechInfo) {
            window.updateTechInfo();
        }
    },
    
    // Инициализация анимаций
    initAnimations() {
        // Анимация шагов авторизации
        const steps = document.querySelectorAll('.genesis-step-list li');
        let currentStep = 0;
        
        setInterval(() => {
            steps.forEach((step, index) => {
                step.classList.remove('step-active');
                if (index === currentStep) {
                    step.classList.add('step-active');
                }
            });
            currentStep = (currentStep + 1) % steps.length;
        }, 3000);
    },
    
    // MCP-MARKER:METHOD:CHECK_ACCESS_ON_LOAD - Проверка доступа при загрузке
    async checkPlatformAccessOnLoad() {
        const userAddress = localStorage.getItem('genesis_user_address');
        if (userAddress && this.services.platformAccess) {
            try {
                const accessData = await this.services.platformAccess.checkUserAccessBalance(userAddress);
                
                // Блокируем функции если нет доступа
                const isBlocked = this.services.platformAccess.blockFunctionsIfNoAccess();
                
                if (isBlocked) {
                    console.log('🔒 Функции заблокированы - нет доступа к платформе');
                } else {
                    console.log(`✅ Доступ к платформе активен: ${accessData.daysRemaining} дней`);
                }
                
                return accessData;
            } catch (error) {
                console.error('Ошибка проверки доступа при загрузке:', error);
            }
        }
        return null;
    }
};

// Запускаем приложение при загрузке (только на app.html)
document.addEventListener('DOMContentLoaded', () => {
    // Дополнительные предохранители: не инициализировать на главной и иных страницах
    const path = (location && location.pathname) || '';
    const isAppPage = /app\.html$/i.test(path);
    if (!isAppPage || window.GENESIS_LANDING === true) {
        console.log('⏭️ GenesisApp init skipped on this page');
        return;
    }

    window.GenesisApp.init();
    
    // MCP-MARKER:ACCESS_CHECK_DOM_READY - Проверка доступа при готовности DOM
    // Дополнительная проверка доступа при готовности DOM
    setTimeout(() => {
        window.GenesisApp.checkPlatformAccessOnLoad();
    }, 2000);
});

// Экспортируем для глобального доступа
window.Genesis = window.GenesisApp;

console.log('🎮 GENESIS APP loaded');
