// MCP-MARKER:MODULE:MINING_RENT_SERVICE - Сервис аренды мощностей
// MCP-MARKER:SECTION:MINING_RENT_CORE - Основной функционал аренды мощностей

/**
 * Сервис управления арендой мощностей устройства
 * Запуск программы: 21 июля 2025
 */
// MCP-MARKER:CLASS:MINING_RENT_SERVICE - Класс сервиса аренды мощностей
class MiningRentService {
    // MCP-MARKER:METHOD:MINING:CONSTRUCTOR - Конструктор сервиса
    constructor() {
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
        
        this.debugLog('MiningRentService инициализирован');
    }
    
    /**
     * Логирование для отладки
     */
    // MCP-MARKER:METHOD:MINING:DEBUG_LOG - Логирование сообщений
    debugLog(message, type = 'info') {
        if (window.debugLog) {
            window.debugLog(`[MiningRent] ${message}`, type);
        } else {
            console.log(`[MiningRent] ${message}`);
        }
    }
    
    /**
     * Инициализация сервиса
     */
    // MCP-MARKER:METHOD:MINING:INIT - Инициализация сервиса
    async init() {
        try {
            this.debugLog('Инициализация сервиса аренды мощностей');
            this.deviceInfo = this.getDeviceInfo();
            this.startCountdown();
            await this.checkUserEligibility();
            this.debugLog('Сервис аренды мощностей готов к работе', 'success');
        } catch (error) {
            this.debugLog(`Ошибка инициализации: ${error.message}`, 'error');
        }
    }
    
    /**
     * Получение информации об устройстве
     */
    // MCP-MARKER:METHOD:MINING:GET_DEVICE_INFO - Получение информации об устройстве
    getDeviceInfo() {
        const info = {
            cores: navigator.hardwareConcurrency || 4,
            memory: navigator.deviceMemory || 8, // GB
            storage: 1 // TB (по умолчанию)
        };
        
        this.debugLog(`Информация об устройстве: ${info.cores} ядер, ${info.memory} GB RAM, ${info.storage} TB хранилище`);
        return info;
    }
    
    /**
     * Расчет доходности для указанного процента мощности
     */
    // MCP-MARKER:METHOD:MINING:CALCULATE_EARNINGS - Расчет доходности
    calculateEarnings(percentage) {
        if (!this.deviceInfo) {
            this.deviceInfo = this.getDeviceInfo();
        }
        
        const cpuEarnings = (this.deviceInfo.cores * percentage / 100) * this.tariffs.cpu;
        const ramEarnings = (this.deviceInfo.memory * percentage / 100) * this.tariffs.ram;
        const storageEarnings = (this.deviceInfo.storage * percentage / 100) * this.tariffs.storage;
        
        const dailyTotal = cpuEarnings + ramEarnings + storageEarnings;
        
        return {
            cpu: cpuEarnings.toFixed(2),
            ram: ramEarnings.toFixed(2),
            storage: storageEarnings.toFixed(2),
            daily: dailyTotal.toFixed(2),
            weekly: (dailyTotal * 7).toFixed(2),
            monthly: (dailyTotal * 30).toFixed(2),
            yearly: (dailyTotal * 365).toFixed(2)
        };
    }
    
    /**
     * Проверка доступности программы для пользователя
     */
    // MCP-MARKER:METHOD:MINING:CHECK_ELIGIBILITY - Проверка доступности
    async checkUserEligibility() {
        try {
            // Проверяем количество активных депозитов
            const deposits = await this.getUserActiveDeposits();
            const isEligible = deposits.length >= this.minDepositsRequired;
            
            this.debugLog(`Проверка доступности: ${deposits.length} активных депозитов, требуется ${this.minDepositsRequired}`);
            
            return {
                isEligible,
                depositsCount: deposits.length,
                depositsRequired: this.minDepositsRequired
            };
        } catch (error) {
            this.debugLog(`Ошибка проверки доступности: ${error.message}`, 'error');
            return {
                isEligible: false,
                depositsCount: 0,
                depositsRequired: this.minDepositsRequired
            };
        }
    }
    
    /**
     * Получение активных депозитов пользователя
     */
    async getUserActiveDeposits() {
        // Интеграция с существующим сервисом депозитов
        if (window.depositsCabinetService && window.depositsCabinetService.getUserDeposits) {
            const deposits = await window.depositsCabinetService.getUserDeposits();
            return deposits.filter(d => d.status === 'ACTIVE');
        }
        
        // Временный мок для тестирования
        return [];
    }
    
    /**
     * Запуск обратного отсчета
     */
    // MCP-MARKER:METHOD:MINING:START_COUNTDOWN - Запуск таймера
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
    // MCP-MARKER:METHOD:MINING:ON_LAUNCHED - Обработчик запуска программы
    onProgramLaunched() {
        this.debugLog('Программа аренды мощностей запущена!', 'success');
        
        const countdownElement = document.getElementById('mining-countdown-container');
        if (countdownElement) {
            countdownElement.innerHTML = `
                <div style="text-align: center; padding: 2rem;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🎉</div>
                    <div style="font-size: 2rem; font-weight: bold; color: var(--success-color); margin-bottom: 1rem;">
                        Программа запущена!
                    </div>
                    <div style="font-size: 1.2rem; color: var(--text-secondary);">
                        Аренда мощностей теперь доступна
                    </div>
                </div>
            `;
        }
    }
    
    /**
     * Выбор уровня мощности
     */
    // MCP-MARKER:METHOD:MINING:SELECT_POWER - Выбор уровня мощности
    async selectPowerLevel(percentage) {
        try {
            this.debugLog(`Выбор ${percentage}% мощностей`);
            
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
                this.scrollToCountdown();
                return true;
            }
            
            return false;
        } catch (error) {
            this.debugLog(`Ошибка выбора мощности: ${error.message}`, 'error');
            return false;
        }
    }
    
    /**
     * Показ ошибки недостаточного количества депозитов
     */
    showInsufficientDepositsError(eligibility) {
        const message = `❌ Для участия в программе аренды мощностей необходимо иметь минимум ${eligibility.depositsRequired} активных депозита!

Текущее количество: ${eligibility.depositsCount}

Пожалуйста, создайте еще ${eligibility.depositsRequired - eligibility.depositsCount} депозит(а) для участия в программе.`;
        
        alert(message);
        
        // Перенаправляем на страницу портфеля
        if (window.cabinetApp && window.cabinetApp.loadPage) {
            window.cabinetApp.loadPage('portfolio');
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
    // MCP-MARKER:METHOD:MINING:ACTIVATE_POWER - Активация аренды
    async activateMiningPower(percentage) {
        try {
            this.debugLog(`Активация ${percentage}% мощностей`);
            
            // Сохраняем выбор в localStorage
            localStorage.setItem('mining_power_level', percentage);
            localStorage.setItem('mining_activation_date', new Date().toISOString());
            
            // Показываем уведомление об успешной активации
            this.showSuccessNotification(percentage);
            
            return true;
        } catch (error) {
            this.debugLog(`Ошибка активации: ${error.message}`, 'error');
            return false;
        }
    }
    
    /**
     * Показ уведомления об успешной активации
     */
    showSuccessNotification(percentage) {
        const daysUntilLaunch = Math.ceil((this.launchDate - new Date()) / (1000 * 60 * 60 * 24));
        const earnings = this.calculateEarnings(percentage);
        
        const message = `🚀 Аренда мощностей будет доступна с 21 июля 2025 года!

📊 Ваш выбор: ${percentage}% мощностей
💰 Ожидаемый доход: ${earnings.daily} USDT в сутки

⏰ Осталось: ${daysUntilLaunch} дней до запуска`;
        
        alert(message);
    }
    
    /**
     * Прокрутка к счетчику обратного отсчета
     */
    scrollToCountdown() {
        const countdownElement = document.getElementById('mining-countdown-section');
        if (countdownElement) {
            countdownElement.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
            
            // Добавляем визуальный эффект
            countdownElement.style.animation = 'pulse 2s ease-in-out';
            setTimeout(() => {
                countdownElement.style.animation = '';
            }, 2000);
        }
    }
    
    /**
     * Рендеринг страницы аренды мощностей
     */
    // MCP-MARKER:METHOD:MINING:RENDER_PAGE - Рендеринг страницы
    renderMiningRentPage() {
        const deviceInfo = this.getDeviceInfo();
        
        // Создаем HTML для обратного отсчета
        const countdownHTML = `
            <div id="mining-countdown-section" class="countdown-section">
                <h3>🚀 Запуск программы через</h3>
                <div id="mining-countdown-container" class="countdown-grid">
                    <div class="countdown-item">
                        <div class="countdown-value" id="mining-countdown-days">0</div>
                        <div class="countdown-label">дней</div>
                    </div>
                    <div class="countdown-item">
                        <div class="countdown-value" id="mining-countdown-hours">0</div>
                        <div class="countdown-label">часов</div>
                    </div>
                    <div class="countdown-item">
                        <div class="countdown-value" id="mining-countdown-minutes">0</div>
                        <div class="countdown-label">минут</div>
                    </div>
                    <div class="countdown-item">
                        <div class="countdown-value" id="mining-countdown-seconds">0</div>
                        <div class="countdown-label">секунд</div>
                    </div>
                </div>
                <p class="countdown-description">21 июля 2025 года мы запускаем революционную программу аренды мощностей!</p>
            </div>
        `;
        
        // Создаем HTML для информации об устройстве
        const deviceInfoHTML = `
            <div class="info-section">
                <h3>📱 Информация об устройстве</h3>
                <div class="info-grid">
                    <div class="info-card">
                        <div class="info-icon">🖥️</div>
                        <div class="info-title">Процессор</div>
                        <div class="info-value">${deviceInfo.cores} ядер</div>
                    </div>
                    <div class="info-card">
                        <div class="info-icon">💾</div>
                        <div class="info-title">Оперативная память</div>
                        <div class="info-value">${deviceInfo.memory} GB</div>
                    </div>
                    <div class="info-card">
                        <div class="info-icon">💿</div>
                        <div class="info-title">Хранилище</div>
                        <div class="info-value">${deviceInfo.storage} TB</div>
                    </div>
                </div>
            </div>
        `;
        
        // Создаем HTML для карточек доходности
        const earningsCardsHTML = this.powerLevels.map(percentage => {
            const earnings = this.calculateEarnings(percentage);
            const isPopular = percentage === 30;
            
            return `
                <div class="earnings-card ${isPopular ? 'popular' : ''}">
                    <div class="earnings-icon">${'⚡'.repeat(percentage / 10)}</div>
                    <div class="earnings-title">${percentage}% мощностей</div>
                    <div class="earnings-amount">$${earnings.daily}/сутки</div>
                    <div class="earnings-details">
                        <div class="earnings-period">
                            <span class="period-label">Неделя</span>
                            <span class="period-value">$${earnings.weekly}</span>
                        </div>
                        <div class="earnings-period">
                            <span class="period-label">Месяц</span>
                            <span class="period-value">$${earnings.monthly}</span>
                        </div>
                        <div class="earnings-period">
                            <span class="period-label">Год</span>
                            <span class="period-value">$${earnings.yearly}</span>
                        </div>
                    </div>
                    ${isPopular ? '<div class="popular-badge">Популярно</div>' : ''}
                    <button class="btn btn-primary" onclick="window.miningRentService.selectPowerLevel(${percentage})">
                        Выбрать
                    </button>
                </div>
            `;
        }).join('');
        
        const earningsSectionHTML = `
            <div class="earnings-section">
                <h3>💰 Тарифы и ваша доходность</h3>
                <div class="earnings-grid">
                    ${earningsCardsHTML}
                </div>
            </div>
        `;
        
