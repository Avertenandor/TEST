// MCP-MARKER:MODULE:MINING_RENT_SERVICE - Сервис аренды мощностей
// MCP-MARKER:SECTION:MINING_RENT_CORE - Основной функционал аренды мощностей

/**
 * Сервис управления арендой мощностей устройства
 * Запуск программы: 21 июля 2025
 */
class MiningRentService {
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
        
        // Создаем HTML для информации о безопасности
        const securityHTML = `
            <div class="security-section">
                <h3>🔒 Безопасность</h3>
                <div class="security-grid">
                    <div class="security-card">
                        <h4>Что мы НЕ делаем</h4>
                        <ul>
                            <li>❌ Не получаем доступ к личным данным</li>
                            <li>❌ Не читаем файлы пользователя</li>
                            <li>❌ Не отслеживаем активность</li>
                            <li>❌ Не используем более 50% мощности</li>
                        </ul>
                    </div>
                    <div class="security-card">
                        <h4>Что мы делаем</h4>
                        <ul>
                            <li>✅ Выполняем математические вычисления</li>
                            <li>✅ Работаем с блокчейн-системами</li>
                            <li>✅ Разрабатываем программные продукты</li>
                            <li>✅ Используем только неактивные ресурсы</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
        
        // Создаем HTML для FAQ
        const faqHTML = `
            <div class="faq-section">
                <h3>❓ Часто задаваемые вопросы</h3>
                <div class="faq-list">
                    <div class="faq-item">
                        <h4>🔒 Безопасно ли это?</h4>
                        <p>Да, абсолютно безопасно! Мы используем мощности только для математических вычислений при разработке программных продуктов и валидации блокчейн-систем.</p>
                    </div>
                    <div class="faq-item">
                        <h4>💳 Как происходит оплата?</h4>
                        <p>Оплата производится криптовалютой (PLEX или USDT) ежедневно. Средства автоматически переводятся на ваш криптокошелек в GENESIS 1.1.</p>
                    </div>
                    <div class="faq-item">
                        <h4>📊 Какие требования для участия?</h4>
                        <p>Необходимо иметь минимум 3 активных депозита в системе GENESIS 1.1 (начиная с депозита "Тестовый").</p>
                    </div>
                    <div class="faq-item">
                        <h4>⚡ Можно ли отключить в любой момент?</h4>
                        <p>Да! Вы можете подключить или отключить услугу в любое время через личный кабинет. Никаких обязательств и штрафов нет.</p>
                    </div>
                </div>
            </div>
        `;
        
        // Собираем полную страницу
        const fullHTML = `
            <div class="page-header">
                <h2 class="page-title">💻 Аренда мощностей</h2>
                <p class="page-subtitle">Зарабатывайте на неиспользуемых ресурсах вашего устройства</p>
            </div>
            
            ${countdownHTML}
            ${deviceInfoHTML}
            ${earningsSectionHTML}
            ${securityHTML}
            ${faqHTML}
            
            <div class="action-section">
                <button class="btn btn-secondary" onclick="window.miningRentService.scrollToCountdown()">
                    🚀 Вернуться к счетчику
                </button>
            </div>
        `;
        
        return fullHTML;
    }
    
    /**
     * Очистка ресурсов
     */
    destroy() {
        this.stopCountdown();
        this.debugLog('Сервис аренды мощностей остановлен');
    }
}

// MCP-MARKER:SECTION:MINING_RENT_STYLES - Стили для раздела аренды мощностей
const miningRentStyles = `
    /* Обратный отсчет */
    .countdown-section {
        background: linear-gradient(135deg, var(--primary-color), #f7931e);
        padding: 2rem;
        border-radius: 12px;
        text-align: center;
        color: white;
        margin-bottom: 2rem;
    }
    
    .countdown-section h3 {
        font-size: 1.8rem;
        margin-bottom: 1rem;
        font-family: 'Orbitron', monospace;
    }
    
    .countdown-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 1rem;
        max-width: 400px;
        margin: 1rem auto;
    }
    
    .countdown-item {
        background: rgba(255, 255, 255, 0.2);
        padding: 1rem;
        border-radius: 8px;
        backdrop-filter: blur(10px);
    }
    
    .countdown-value {
        font-size: 2.5rem;
        font-weight: bold;
        font-family: 'Orbitron', monospace;
    }
    
    .countdown-label {
        font-size: 0.9rem;
        opacity: 0.9;
    }
    
    .countdown-description {
        font-size: 1.1rem;
        margin-top: 1.5rem;
        opacity: 0.95;
    }
    
    /* Информация об устройстве */
    .info-section {
        background: var(--bg-secondary);
        padding: 2rem;
        border-radius: 12px;
        margin-bottom: 2rem;
        border: 1px solid var(--border-color);
    }
    
    .info-section h3 {
        color: var(--primary-color);
        margin-bottom: 1.5rem;
        font-size: 1.6rem;
    }
    
    .info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
    }
    
    .info-card {
        background: var(--bg-tertiary);
        padding: 1.5rem;
        border-radius: 8px;
        text-align: center;
        border: 1px solid var(--border-color);
        transition: all 0.3s ease;
    }
    
    .info-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    }
    
    .info-icon {
        font-size: 2rem;
        margin-bottom: 0.5rem;
    }
    
    .info-title {
        color: var(--text-secondary);
        font-size: 0.9rem;
        margin-bottom: 0.5rem;
    }
    
    .info-value {
        color: var(--primary-color);
        font-size: 1.3rem;
        font-weight: 600;
        font-family: 'Orbitron', monospace;
    }
    
    /* Карточки доходности */
    .earnings-section {
        background: var(--bg-secondary);
        padding: 2rem;
        border-radius: 12px;
        margin-bottom: 2rem;
        border: 1px solid var(--border-color);
    }
    
    .earnings-section h3 {
        color: var(--primary-color);
        margin-bottom: 1.5rem;
        font-size: 1.6rem;
    }
    
    .earnings-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 1.5rem;
    }
    
    .earnings-card {
        background: var(--bg-tertiary);
        padding: 1.5rem;
        border-radius: 12px;
        border: 1px solid var(--border-color);
        text-align: center;
        transition: all 0.3s ease;
        position: relative;
    }
    
    .earnings-card:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
    }
    
    .earnings-card.popular {
        border: 2px solid var(--primary-color);
        box-shadow: 0 0 20px rgba(255, 107, 53, 0.2);
    }
    
    .earnings-icon {
        font-size: 2rem;
        margin-bottom: 1rem;
        filter: drop-shadow(0 0 10px rgba(255, 255, 0, 0.3));
    }
    
    .earnings-title {
        font-weight: 600;
        margin-bottom: 1rem;
        font-size: 1.1rem;
        color: var(--text-primary);
    }
    
    .earnings-amount {
        font-size: 1.8rem;
        color: var(--success-color);
        font-weight: 700;
        margin-bottom: 1rem;
        font-family: 'Orbitron', monospace;
    }
    
    .earnings-details {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0.5rem;
        margin-bottom: 1rem;
    }
    
    .earnings-period {
        background: var(--bg-secondary);
        padding: 0.5rem;
        border-radius: 6px;
        border: 1px solid var(--border-color);
    }
    
    .period-label {
        display: block;
        font-size: 0.8rem;
        color: var(--text-secondary);
        margin-bottom: 0.2rem;
    }
    
    .period-value {
        display: block;
        font-size: 0.95rem;
        font-weight: 600;
        color: var(--success-color);
    }
    
    .popular-badge {
        position: absolute;
        top: -10px;
        right: -10px;
        background: var(--primary-color);
        color: white;
        padding: 0.3rem 0.8rem;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 600;
        box-shadow: 0 2px 10px rgba(255, 107, 53, 0.4);
    }
    
    /* Безопасность */
    .security-section {
        background: var(--bg-secondary);
        padding: 2rem;
        border-radius: 12px;
        margin-bottom: 2rem;
        border: 1px solid var(--border-color);
    }
    
    .security-section h3 {
        color: var(--primary-color);
        margin-bottom: 1.5rem;
        font-size: 1.6rem;
    }
    
    .security-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1.5rem;
    }
    
    .security-card {
        background: var(--bg-tertiary);
        padding: 1.5rem;
        border-radius: 8px;
        border: 1px solid var(--border-color);
    }
    
    .security-card h4 {
        color: var(--text-primary);
        margin-bottom: 1rem;
        font-size: 1.1rem;
    }
    
    .security-card ul {
        list-style: none;
        padding: 0;
        margin: 0;
    }
    
    .security-card li {
        padding: 0.5rem 0;
        color: var(--text-secondary);
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
    
    .security-card li:last-child {
        border-bottom: none;
    }
    
    /* FAQ */
    .faq-section {
        background: var(--bg-secondary);
        padding: 2rem;
        border-radius: 12px;
        margin-bottom: 2rem;
        border: 1px solid var(--border-color);
    }
    
    .faq-section h3 {
        color: var(--primary-color);
        margin-bottom: 1.5rem;
        font-size: 1.6rem;
    }
    
    .faq-list {
        display: grid;
        gap: 1rem;
    }
    
    .faq-item {
        background: var(--bg-tertiary);
        padding: 1.5rem;
        border-radius: 8px;
        border: 1px solid var(--border-color);
    }
    
    .faq-item h4 {
        color: var(--text-primary);
        margin-bottom: 0.5rem;
        font-size: 1.1rem;
    }
    
    .faq-item p {
        color: var(--text-secondary);
        line-height: 1.6;
    }
    
    /* Кнопки действий */
    .action-section {
        text-align: center;
        margin-top: 2rem;
    }
    
    /* Анимация пульсации */
    @keyframes pulse {
        0% { 
            transform: scale(1); 
            box-shadow: 0 0 0 0 rgba(255, 107, 53, 0.4);
        }
        50% { 
            transform: scale(1.02); 
            box-shadow: 0 0 20px 10px rgba(255, 107, 53, 0.2);
        }
        100% { 
            transform: scale(1); 
            box-shadow: 0 0 0 0 rgba(255, 107, 53, 0);
        }
    }
    
    /* Адаптивность */
    @media (max-width: 768px) {
        .countdown-grid {
            grid-template-columns: repeat(2, 1fr);
        }
        
        .info-grid {
            grid-template-columns: 1fr;
        }
        
        .earnings-grid {
            grid-template-columns: 1fr;
        }
        
        .security-grid {
            grid-template-columns: 1fr;
        }
        
        .earnings-details {
            grid-template-columns: 1fr;
            gap: 0.3rem;
        }
    }
`;

// MCP-MARKER:SECTION:MINING_RENT_INIT - Инициализация сервиса аренды мощностей
// Создаем глобальный экземпляр сервиса
window.miningRentService = new MiningRentService();

// Добавляем стили в документ
const styleElement = document.createElement('style');
styleElement.textContent = miningRentStyles;
document.head.appendChild(styleElement);

// Экспортируем для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MiningRentService;
}
