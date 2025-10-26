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
    // MCP-MARKER:METHOD:MINING:DESTROY - Очистка ресурсов
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
