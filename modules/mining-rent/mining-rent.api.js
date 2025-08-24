// modules/mining-rent/mining-rent.api.js
// API для работы с арендой майнинговых мощностей

export default class MiningRentAPI {
    constructor(bscApi) {
        this.bscApi = bscApi;
        this.launchDate = new Date('2025-07-21T00:00:00');
        this.tariffs = {
            cpu: 1,        // $1 за ядро в сутки
            ram: 1,        // $1 за GB RAM в сутки
            storage: 0.5   // $0.5 за TB хранилища в сутки
        };
        this.powerLevels = [10, 20, 30, 40, 50]; // Проценты мощности
        this.minDepositsRequired = 3;
        this.countdownInterval = null;
        this.deviceInfo = null;
        this.cache = new Map();
        this.cacheTimeout = 60000; // 1 минута
    }

    /**
     * Инициализация API
     */
    async init() {
        try {
            console.log('[MiningRent] Инициализация API аренды мощностей');
            this.deviceInfo = this.getDeviceInfo();
            this.startCountdown();
            await this.checkUserEligibility();
            console.log('[MiningRent] API готов к работе');
        } catch (error) {
            console.error('[MiningRent] Ошибка инициализации:', error);
        }
    }

    /**
     * Получение информации об устройстве
     */
    getDeviceInfo() {
        const info = {
            cores: navigator.hardwareConcurrency || 4,
            memory: navigator.deviceMemory || 8, // GB
            storage: 1, // TB (по умолчанию)
            platform: navigator.platform || 'Unknown',
            userAgent: navigator.userAgent || 'Unknown',
            language: navigator.language || 'en',
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine
        };
        
        console.log('[MiningRent] Информация об устройстве:', info);
        return info;
    }

    /**
     * Расчет доходности для указанного процента мощности
     */
    calculateEarnings(percentage) {
        if (!this.deviceInfo) {
            this.deviceInfo = this.getDeviceInfo();
        }
        
        const cpuEarnings = (this.deviceInfo.cores * percentage / 100) * this.tariffs.cpu;
        const ramEarnings = (this.deviceInfo.memory * percentage / 100) * this.tariffs.ram;
        const storageEarnings = (this.deviceInfo.storage * percentage / 100) * this.tariffs.storage;
        
        const dailyTotal = cpuEarnings + ramEarnings + storageEarnings;
        
        return {
            cpu: parseFloat(cpuEarnings.toFixed(2)),
            ram: parseFloat(ramEarnings.toFixed(2)),
            storage: parseFloat(storageEarnings.toFixed(2)),
            daily: parseFloat(dailyTotal.toFixed(2)),
            weekly: parseFloat((dailyTotal * 7).toFixed(2)),
            monthly: parseFloat((dailyTotal * 30).toFixed(2)),
            yearly: parseFloat((dailyTotal * 365).toFixed(2))
        };
    }

    /**
     * Получение всех тарифов
     */
    getAllEarnings() {
        const earnings = {};
        this.powerLevels.forEach(level => {
            earnings[level] = this.calculateEarnings(level);
        });
        return earnings;
    }

    /**
     * Проверка доступности программы для пользователя
     */
    async checkUserEligibility() {
        const cacheKey = 'user_eligibility';
        
        try {
            // Проверяем кэш
            if (this.cache.has(cacheKey)) {
                const cached = this.cache.get(cacheKey);
                if (Date.now() - cached.timestamp < this.cacheTimeout) {
                    return cached.data;
                }
            }

            // Проверяем количество активных депозитов
            const deposits = await this.getUserActiveDeposits();
            const isEligible = deposits.length >= this.minDepositsRequired;
            
            const result = {
                isEligible,
                depositsCount: deposits.length,
                depositsRequired: this.minDepositsRequired,
                missingDeposits: Math.max(0, this.minDepositsRequired - deposits.length)
            };

            // Кэшируем результат
            this.cache.set(cacheKey, {
                data: result,
                timestamp: Date.now()
            });

            console.log('[MiningRent] Проверка доступности:', result);
            return result;
        } catch (error) {
            console.error('[MiningRent] Ошибка проверки доступности:', error);
            return {
                isEligible: false,
                depositsCount: 0,
                depositsRequired: this.minDepositsRequired,
                missingDeposits: this.minDepositsRequired
            };
        }
    }

    /**
     * Получение активных депозитов пользователя
     */
    async getUserActiveDeposits() {
        try {
            // Интеграция с существующим сервисом депозитов
            if (window.depositsCabinetService && window.depositsCabinetService.getUserDeposits) {
                const deposits = await window.depositsCabinetService.getUserDeposits();
                return deposits.filter(d => d.status === 'ACTIVE');
            }
            
            // Временная имитация для тестирования
            const mockDeposits = [
                { id: 1, amount: 25, status: 'ACTIVE', plan: 'Тестовый' },
                { id: 2, amount: 100, status: 'ACTIVE', plan: 'Базовый' }
            ];
            
            return mockDeposits;
        } catch (error) {
            console.error('[MiningRent] Ошибка получения депозитов:', error);
            return [];
        }
    }

    /**
     * Запуск обратного отсчета
     */
    startCountdown() {
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
        }
        
        this.updateCountdown();
        this.countdownInterval = setInterval(() => this.updateCountdown(), 1000);
    }

    /**
     * Обновление обратного отсчета
     */
    updateCountdown() {
        const now = new Date();
        const timeLeft = this.launchDate - now;
        
        if (timeLeft <= 0) {
            this.stopCountdown();
            this.onProgramLaunched();
            return;
        }
        
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        
        this.updateCountdownDisplay({ days, hours, minutes, seconds });
        
        return { days, hours, minutes, seconds };
    }

    /**
     * Обновление отображения счетчика
     */
    updateCountdownDisplay(time) {
        const elements = {
            days: document.getElementById('mining-countdown-days'),
            hours: document.getElementById('mining-countdown-hours'),
            minutes: document.getElementById('mining-countdown-minutes'),
            seconds: document.getElementById('mining-countdown-seconds')
        };
        
        if (elements.days) elements.days.textContent = time.days;
        if (elements.hours) elements.hours.textContent = time.hours;
        if (elements.minutes) elements.minutes.textContent = time.minutes;
        if (elements.seconds) elements.seconds.textContent = time.seconds;
    }

    /**
     * Остановка обратного отсчета
     */
    stopCountdown() {
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }
    }

    /**
     * Обработка запуска программы
     */
    onProgramLaunched() {
        console.log('[MiningRent] Программа аренды мощностей запущена!');
        
        const countdownElement = document.getElementById('mining-countdown-container');
        if (countdownElement) {
            countdownElement.innerHTML = `
                <div style="text-align: center; padding: 2rem;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🎉</div>
                    <div style="font-size: 2rem; font-weight: bold; color: #4ade80; margin-bottom: 1rem;">
                        Программа запущена!
                    </div>
                    <div style="font-size: 1.2rem; color: #b0b0b0;">
                        Аренда мощностей теперь доступна
                    </div>
                </div>
            `;
        }
    }

    /**
     * Выбор уровня мощности
     */
    async selectPowerLevel(percentage) {
        try {
            console.log(`[MiningRent] Выбор ${percentage}% мощностей`);
            
            // Проверяем доступность
            const eligibility = await this.checkUserEligibility();
            
            if (!eligibility.isEligible) {
                this.showInsufficientDepositsError(eligibility);
                return false;
            }
            
            // Расчет доходности
            const earnings = this.calculateEarnings(percentage);
            
            // Показываем подтверждение
            const confirmed = await this.showConfirmationDialog(percentage, earnings);
            
            if (confirmed) {
                await this.activateMiningPower(percentage);
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('[MiningRent] Ошибка выбора мощности:', error);
            return false;
        }
    }

    /**
     * Показ ошибки недостаточного количества депозитов
     */
    showInsufficientDepositsError(eligibility) {
        const message = `❌ Для участия в программе аренды мощностей необходимо иметь минимум ${eligibility.depositsRequired} активных депозита!

Текущее количество: ${eligibility.depositsCount}

Пожалуйста, создайте еще ${eligibility.missingDeposits} депозит(а) для участия в программе.`;
        
        alert(message);
        
        // Перенаправляем на страницу депозитов
        if (window.location.hash) {
            window.location.hash = '/deposits';
        }
    }

    /**
     * Показ диалога подтверждения
     */
    async showConfirmationDialog(percentage, earnings) {
        const message = `✅ Вы выбрали ${percentage}% мощностей вашего устройства.

💰 Ожидаемый доход:
• ${earnings.daily} USDT в сутки
• ${earnings.weekly} USDT в неделю
• ${earnings.monthly} USDT в месяц
• ${earnings.yearly} USDT в год

Детали расчета:
• Процессор (${this.deviceInfo.cores} ядер): ${earnings.cpu} USDT/сутки
• RAM (${this.deviceInfo.memory} GB): ${earnings.ram} USDT/сутки
• Хранилище (${this.deviceInfo.storage} TB): ${earnings.storage} USDT/сутки

Продолжить?`;
        
        return confirm(message);
    }

    /**
     * Активация аренды мощностей
     */
    async activateMiningPower(percentage) {
        try {
            console.log(`[MiningRent] Активация ${percentage}% мощностей`);
            
            // Имитация активации
            const activation = {
                percentage,
                startTime: Date.now(),
                earnings: this.calculateEarnings(percentage),
                status: 'active',
                transactionHash: this.generateMockTxHash()
            };
            
            // Сохраняем активацию в localStorage
            localStorage.setItem('mining_rent_activation', JSON.stringify(activation));
            
            alert(`🎉 Аренда ${percentage}% мощностей активирована!

Ожидаемый доход: $${activation.earnings.daily}/день

Средства будут поступать на ваш кошелек ежедневно.`);
            
            return activation;
        } catch (error) {
            console.error('[MiningRent] Ошибка активации:', error);
            throw error;
        }
    }

    /**
     * Получение текущей активации
     */
    getCurrentActivation() {
        try {
            const stored = localStorage.getItem('mining_rent_activation');
            return stored ? JSON.parse(stored) : null;
        } catch (error) {
            console.error('[MiningRent] Ошибка получения активации:', error);
            return null;
        }
    }

    /**
     * Деактивация аренды мощностей
     */
    async deactivateMiningPower() {
        try {
            console.log('[MiningRent] Деактивация аренды мощностей');
            
            localStorage.removeItem('mining_rent_activation');
            
            alert('✅ Аренда мощностей деактивирована. Вы можете снова активировать её в любое время.');
            
            return true;
        } catch (error) {
            console.error('[MiningRent] Ошибка деактивации:', error);
            return false;
        }
    }

    /**
     * Получение статистики заработка
     */
    async getEarningsStats() {
        try {
            const activation = this.getCurrentActivation();
            if (!activation) {
                return {
                    isActive: false,
                    totalEarned: 0,
                    dailyRate: 0,
                    activeDays: 0
                };
            }

            const activeDays = Math.floor((Date.now() - activation.startTime) / (1000 * 60 * 60 * 24));
            const totalEarned = activeDays * activation.earnings.daily;

            return {
                isActive: true,
                totalEarned: parseFloat(totalEarned.toFixed(2)),
                dailyRate: activation.earnings.daily,
                activeDays,
                percentage: activation.percentage,
                startDate: new Date(activation.startTime).toLocaleDateString()
            };
        } catch (error) {
            console.error('[MiningRent] Ошибка получения статистики:', error);
            return {
                isActive: false,
                totalEarned: 0,
                dailyRate: 0,
                activeDays: 0
            };
        }
    }

    // === Вспомогательные методы ===

    generateMockTxHash() {
        const chars = '0123456789abcdef';
        let hash = '0x';
        for (let i = 0; i < 64; i++) {
            hash += chars[Math.floor(Math.random() * chars.length)];
        }
        return hash;
    }

    /**
     * Форматирование времени
     */
    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    /**
     * Проверка совместимости устройства
     */
    checkDeviceCompatibility() {
        const requirements = {
            minCores: 2,
            minMemory: 4, // GB
            supportedPlatforms: ['Win32', 'Linux x86_64', 'MacIntel']
        };

        const compatible = {
            cores: this.deviceInfo.cores >= requirements.minCores,
            memory: this.deviceInfo.memory >= requirements.minMemory,
            platform: requirements.supportedPlatforms.some(p => 
                this.deviceInfo.platform.includes(p)
            )
        };

        return {
            isCompatible: Object.values(compatible).every(v => v),
            details: compatible,
            requirements
        };
    }

    /**
     * Получение рекомендуемого уровня мощности
     */
    getRecommendedPowerLevel() {
        const compatibility = this.checkDeviceCompatibility();
        
        if (!compatibility.isCompatible) {
            return 0;
        }

        // Рекомендация на основе характеристик устройства
        if (this.deviceInfo.cores >= 8 && this.deviceInfo.memory >= 16) {
            return 40; // Мощное устройство
        } else if (this.deviceInfo.cores >= 4 && this.deviceInfo.memory >= 8) {
            return 30; // Среднее устройство
        } else {
            return 20; // Слабое устройство
        }
    }

    /**
     * Очистка кэша
     */
    clearCache() {
        this.cache.clear();
        console.log('[MiningRent] Кэш очищен');
    }

    /**
     * Очистка ресурсов
     */
    destroy() {
        this.stopCountdown();
        this.clearCache();
        console.log('[MiningRent] API остановлен');
    }
}
