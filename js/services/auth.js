/**
 * GENESIS 1.1 - Сервис авторизации
 * MCP-MARKER:MODULE:AUTH_SERVICE - Сервис авторизации
 * MCP-MARKER:FILE:AUTH_JS - Основной файл авторизации
 */

// MCP-MARKER:CLASS:GENESIS_AUTH - Класс авторизации
window.GenesisAuth = {
    // MCP-MARKER:PROPERTY:CURRENT_USER - Текущий пользователь
    currentUser: null,
    
    // MCP-MARKER:METHOD:VALIDATE_ADDRESS - Валидация BSC адреса
    isValidAddress(address) {
        return /^0x[a-fA-F0-9]{40}$/.test(address);
    },
    
    // Проверка авторизации с обновленным API
    async checkAuthorization(userAddress) {
        if (!this.isValidAddress(userAddress)) {
            throw new Error('Неверный формат адреса');
        }
        
        try {
            // Логируем начало проверки
            if (window.GenesisTerminal) {
                window.GenesisTerminal.log(`🔍 Проверка авторизации для ${window.GenesisUtils.formatAddress(userAddress)}...`, 'info');
            }
            
            // Проверяем оплату через обновленный API
            const authResult = await window.GenesisAPI.checkAuthorizationPayment(userAddress);
            
            if (authResult.isAuthorized) {
                // Сохраняем данные пользователя
                this.currentUser = {
                    address: userAddress,
                    authorized: true,
                    authorizedAt: new Date(),
                    authPayment: authResult.payment,
                    authAmount: authResult.amount
                };
                
                // Сохраняем в localStorage
                localStorage.setItem('genesis_auth', JSON.stringify(this.currentUser));
                
                if (window.GenesisTerminal) {
                    window.GenesisTerminal.log(`✅ Авторизация подтверждена! Оплачено: ${authResult.amount.toFixed(4)} PLEX`, 'success');
                }
                
                return true;
            } else {
                if (window.GenesisTerminal) {
                    const message = authResult.error ? 
                        `❌ Ошибка: ${authResult.error}` :
                        '⚠️ Оплата не найдена. Отправьте 1 PLEX (±5%) на системный адрес.';
                    window.GenesisTerminal.log(message, 'warning');
                }
                
                return false;
            }
        } catch (error) {
            console.error('Auth check error:', error);
            if (window.GenesisTerminal) {
                window.GenesisTerminal.log(`❌ Ошибка проверки: ${error.message}`, 'error');
            }
            return false;
        }
    },
    
    // Проверка доступа (оплаченные дни) с обновленным API
    async checkAccess(userAddress) {
        try {
            if (window.GenesisTerminal) {
                window.GenesisTerminal.log('🔍 Проверка оплаченного доступа...', 'info');
            }
            
            const accessData = await window.GenesisAPI.checkAccessPayments(userAddress);
            
            if (accessData.isActive && accessData.daysRemaining > 0) {
                if (window.GenesisTerminal) {
                    window.GenesisTerminal.log(`✅ Доступ активен: ${accessData.daysRemaining} дней (всего оплачено: ${accessData.accessDays} дней)`, 'success');
                }
            } else if (accessData.accessDays > 0) {
                if (window.GenesisTerminal) {
                    window.GenesisTerminal.log(`⚠️ Подписка истекла. Оплатите доступ в USDT (10-20$ = 10-20 дней).`, 'warning');
                }
            } else {
                if (window.GenesisTerminal) {
                    window.GenesisTerminal.log('⚠️ Нет активного доступа. Оплатите доступ в USDT.', 'warning');
                }
            }
            
            return accessData;
        } catch (error) {
            console.error('Access check error:', error);
            if (window.GenesisTerminal) {
                window.GenesisTerminal.log(`❌ Ошибка проверки доступа: ${error.message}`, 'error');
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
    
    // Валидация адреса (расширенная проверка)
    async validateAddress(address) {
        if (!this.isValidAddress(address)) {
            return false;
        }
        
        try {
            // Проверяем, что адрес существует в сети
            const balance = await window.GenesisAPI.getBalance(address);
            return balance >= 0; // Адрес валиден если удалось получить баланс
        } catch (error) {
            return false;
        }
    },
    
    // Получить сохраненную авторизацию
    getSavedAuth() {
        try {
            const saved = localStorage.getItem('genesis_auth');
            if (saved) {
                const auth = JSON.parse(saved);
                // Проверяем срок действия (30 дней)
                const authDate = new Date(auth.authorizedAt);
                const daysPassed = (Date.now() - authDate.getTime()) / (1000 * 60 * 60 * 24);
                
                if (daysPassed <= 30) {
                    this.currentUser = auth;
                    return auth;
                } else {
                    // Авторизация устарела
                    this.logout();
                    return null;
                }
            }
        } catch (error) {
            console.error('Error loading saved auth:', error);
        }
        return null;
    },
    
    // Выход
    logout() {
        this.currentUser = null;
        localStorage.removeItem('genesis_auth');
        localStorage.removeItem('genesis_user_address');
        
        if (window.GenesisTerminal) {
            window.GenesisTerminal.log('👋 Выход выполнен', 'info');
        }
        
        // Перенаправляем на главную
        window.location.href = '/';
    },
    
    // Мониторинг платежа
    async monitorPayment(userAddress, callback, timeout = 600000) {
        const startTime = Date.now();
        const checkInterval = 5000; // 5 секунд
        
        if (window.GenesisTerminal) {
            window.GenesisTerminal.log('🔄 Начат мониторинг платежа...', 'system');
        }
        
        const check = async () => {
            // Проверяем таймаут
            if (Date.now() - startTime > timeout) {
                if (window.GenesisTerminal) {
                    window.GenesisTerminal.log('⏱️ Таймаут мониторинга платежа', 'warning');
                }
                return;
            }
            
            // Проверяем оплату
            const isAuthorized = await this.checkAuthorization(userAddress);
            
            if (isAuthorized) {
                if (callback) callback(true);
            } else {
                // Продолжаем проверку
                setTimeout(check, checkInterval);
            }
        };
        
        // Запускаем проверку
        setTimeout(check, checkInterval);
    },
    
    // Проверка прав доступа к функциям
    hasAccess(feature = 'basic') {
        if (!this.currentUser || !this.currentUser.authorized) {
            return false;
        }
        
        // Здесь можно добавить проверку различных уровней доступа
        const accessLevels = {
            basic: true, // Базовый доступ после авторизации
            deposits: true, // Доступ к депозитам
            referrals: true, // Реферальная система
            vip: false // VIP функции (требуют дополнительной оплаты)
        };
        
        return accessLevels[feature] || false;
    },
    
    // Получение информации о пользователе с обновленным API
    async getUserInfo(address) {
        try {
            const [
                bnbBalance,
                plexBalance,
                deposits,
                accessData,
                authData
            ] = await Promise.all([
                window.GenesisAPI.getBalance(address),
                window.GenesisAPI.getTokenBalance(address, window.GENESIS_CONFIG.plex.address),
                window.GenesisAPI.getUserDeposits(address),
                window.GenesisAPI.checkAccessPayments(address),
                window.GenesisAPI.checkAuthorizationPayment(address)
            ]);
            
            // Подсчитываем статистику депозитов
            const depositStats = {
                total: deposits.length,
                active: deposits.filter(d => d.status === 'ACTIVE').length,
                completed: deposits.filter(d => d.status === 'COMPLETED').length,
                totalInvested: deposits.reduce((sum, d) => sum + d.amount, 0),
                expectedProfit: deposits.reduce((sum, d) => sum + (d.expectedProfit || 0), 0),
                hasTestDeposit: deposits.some(d => d.planId === 'test')
            };
            
            // Определяем следующий доступный план
            const nextPlan = this.getNextAvailablePlan(deposits);
            
            return {
                address: address,
                authorization: authData,
                balances: {
                    bnb: bnbBalance,
                    plex: plexBalance
                },
                deposits: deposits,
                depositStats: depositStats,
                access: accessData,
                nextAvailablePlan: nextPlan,
                overallStatus: this.getUserStatus(authData, accessData, depositStats)
            };
        } catch (error) {
            console.error('Error getting user info:', error);
            return null;
        }
    },
    
    // Определение следующего доступного плана
    getNextAvailablePlan(userDeposits) {
        const validation = window.validateDepositSequence;
        if (!validation) return null;
        
        const config = window.GENESIS_CONFIG;
        
        // Проверяем каждый план
        for (let plan of config.depositPlans) {
            const result = validation(userDeposits, plan.id);
            if (result.allowed) {
                return plan;
            }
        }
        
        return null; // Все планы завершены
    },
    
    // Определение общего статуса пользователя
    getUserStatus(authData, accessData, depositStats) {
        if (!authData.isAuthorized) {
            return {
                level: 'BLOCKED',
                message: 'Необходима авторизация (1 PLEX)',
                color: 'red'
            };
        }
        
        if (!accessData.isActive) {
            return {
                level: 'LIMITED',
                message: 'Ограниченный доступ (нужна подписка)',
                color: 'orange'
            };
        }
        
        if (depositStats.total === 0) {
            return {
                level: 'SUBSCRIBER',
                message: 'Подписчик (можно делать депозиты)',
                color: 'blue'
            };
        }
        
        if (depositStats.active > 0) {
            return {
                level: 'ACTIVE_INVESTOR',
                message: `Активный инвестор (${depositStats.active} депозитов)`,
                color: 'green'
            };
        }
        
        return {
            level: 'INVESTOR',
            message: `Инвестор (${depositStats.completed} завершенных)`,
            color: 'green'
        };
    },
    
    // Создание QR кода для оплаты
    generatePaymentQR(container, amount = 1, token = 'PLEX') {
        const systemAddress = window.GENESIS_CONFIG.addresses.system;
        
        // Создаем данные для QR
        const qrData = systemAddress;
        
        // Генерируем QR код
        if (window.QRCode) {
            // Очищаем контейнер
            container.innerHTML = '';
            
            new window.QRCode(container, {
                text: qrData,
                width: 200,
                height: 200,
                colorDark: '#000000',
                colorLight: '#ffffff',
                correctLevel: window.QRCode.CorrectLevel.M
            });
            
            // Добавляем информацию
            const info = document.createElement('div');
            info.className = 'qr-payment-info';
            info.innerHTML = `
                <p>Отправьте <strong>${amount} ${token}</strong></p>
                <p>на адрес:</p>
                <code>${window.GenesisUtils.formatAddress(systemAddress, 8)}</code>
            `;
            container.appendChild(info);
        }
    }
};

// Автоматическая проверка сохраненной авторизации при загрузке
document.addEventListener('DOMContentLoaded', () => {
    const savedAuth = window.GenesisAuth.getSavedAuth();
    if (savedAuth) {
        console.log('✅ Восстановлена сохраненная авторизация');
    }
});

console.log('🔐 GENESIS AUTH loaded');
