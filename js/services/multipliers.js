/**
 * GENESIS 1.1 - Сервис управления множителями
 * MCP-MARKER:MODULE:MULTIPLIERS_SERVICE - Сервис множителей доходности
 * MCP-MARKER:FILE:MULTIPLIERS_JS - Файл сервиса множителей
 * Управление бонусными множителями для увеличения доходности
 */

// MCP-MARKER:CLASS:MULTIPLIERS_SERVICE - Класс сервиса множителей
class MultipliersService {
    // MCP-MARKER:METHOD:CONSTRUCTOR - Конструктор сервиса
    constructor() {
        // MCP-MARKER:PROPERTY:MULTIPLIERS_CONFIG - Конфигурация множителей
        this.multipliers = {
            turbo: {
                id: 'turbo',
                name: 'Турбо',
                icon: '🚀',
                multiplier: 2.0,
                duration: 6, // часов
                costUSDT: 25,
                costPLEX: 500,
                description: 'Удваивает доходность от всех источников',
                color: 'var(--success-color)'
            },
            lightning: {
                id: 'lightning',
                name: 'Молния',
                icon: '⚡',
                multiplier: 4.0,
                duration: 3, // часов
                costUSDT: 45,
                costPLEX: 900,
                description: 'Увеличивает доходность в 4 раза',
                color: 'var(--primary-color)'
            },
            super: {
                id: 'super',
                name: 'Супер',
                icon: '🌟',
                multiplier: 7.5,
                duration: 1, // час
                costUSDT: 85,
                costPLEX: 1700,
                description: 'Максимальный множитель - увеличение в 7.5 раз',
                color: 'var(--warning-color)'
            },
            fire: {
                id: 'fire',
                name: 'Огненный',
                icon: '🔥',
                multiplier: 2.5,
                duration: 4, // часов
                costUSDT: 35,
                costPLEX: 700,
                description: 'Увеличивает доходность в 2.5 раза',
                color: 'var(--error-color)'
            },
            diamond: {
                id: 'diamond',
                name: 'Алмазный',
                icon: '💎',
                multiplier: 1.8,
                duration: 12, // часов
                costUSDT: 30,
                costPLEX: 600,
                description: 'Стабильный множитель на длительное время',
                color: 'var(--secondary-color)'
            },
            star: {
                id: 'star',
                name: 'Звездный',
                icon: '⭐',
                multiplier: 3.2,
                duration: 24, // часов
                costUSDT: 60,
                costPLEX: 1200,
                description: 'Долгосрочный множитель на целые сутки',
                color: 'var(--gold-color)'
            }
        };

        // MCP-MARKER:PROPERTY:ACTIVE_MULTIPLIERS - Активные множители
        this.activeMultipliers = [];
        // MCP-MARKER:PROPERTY:STATISTICS - Статистика использования
        this.statistics = {
            totalActivated: 0,
            totalEarned: 0,
            totalSpentUSDT: 0,
            totalSpentPLEX: 0,
            monthlyActivations: 0,
            todayActivations: 0
        };

        this.init();
    }

    // MCP-MARKER:METHOD:INIT - Инициализация сервиса
    init() {
        console.log('🚀 MultipliersService: Инициализация сервиса множителей');
        this.loadActiveMultipliers();
        this.loadStatistics();
        this.startUpdateTimer();
    }

    // MCP-MARKER:METHOD:LOAD_ACTIVE_MULTIPLIERS - Загрузка активных множителей из localStorage
    loadActiveMultipliers() {
        try {
            const saved = localStorage.getItem('genesis_active_multipliers');
            if (saved) {
                this.activeMultipliers = JSON.parse(saved);
                // Фильтруем истекшие множители
                this.activeMultipliers = this.activeMultipliers.filter(m => {
                    const remaining = this.getRemainingTime(m);
                    return remaining > 0;
                });
                this.saveActiveMultipliers();
            }
        } catch (error) {
            console.error('Ошибка загрузки множителей:', error);
            this.activeMultipliers = [];
        }
    }

    // MCP-MARKER:METHOD:SAVE_ACTIVE_MULTIPLIERS - Сохранение активных множителей
    saveActiveMultipliers() {
        localStorage.setItem('genesis_active_multipliers', JSON.stringify(this.activeMultipliers));
    }

    // MCP-MARKER:METHOD:LOAD_STATISTICS - Загрузка статистики
    loadStatistics() {
        try {
            const saved = localStorage.getItem('genesis_multipliers_stats');
            if (saved) {
                this.statistics = { ...this.statistics, ...JSON.parse(saved) };
            }
        } catch (error) {
            console.error('Ошибка загрузки статистики:', error);
        }
    }

    // MCP-MARKER:METHOD:SAVE_STATISTICS - Сохранение статистики
    saveStatistics() {
        localStorage.setItem('genesis_multipliers_stats', JSON.stringify(this.statistics));
    }

    // MCP-MARKER:METHOD:ACTIVATE_MULTIPLIER - Активация множителя
    async activateMultiplier(multiplierId, paymentMethod = 'USDT') {
        const multiplier = this.multipliers[multiplierId];
        if (!multiplier) {
            throw new Error('Неизвестный множитель');
        }

        // Проверка доступа к платформе
        if (!window.platformAccessService || !window.platformAccessService.hasActiveAccess()) {
            throw new Error('Требуется активный доступ к платформе');
        }

        // Создание записи об активном множителе
        const activeMultiplier = {
            ...multiplier,
            activatedAt: Date.now(),
            expiresAt: Date.now() + (multiplier.duration * 60 * 60 * 1000),
            paymentMethod: paymentMethod,
            transactionHash: null // Будет заполнено после подтверждения транзакции
        };

        // Добавление в список активных
        this.activeMultipliers.push(activeMultiplier);
        this.saveActiveMultipliers();

        // Обновление статистики
        this.statistics.totalActivated++;
        this.statistics.todayActivations++;
        this.statistics.monthlyActivations++;
        
        if (paymentMethod === 'USDT') {
            this.statistics.totalSpentUSDT += multiplier.costUSDT;
        } else {
            this.statistics.totalSpentPLEX += multiplier.costPLEX;
        }
        
        this.saveStatistics();

        console.log(`✅ Множитель ${multiplier.name} активирован!`);
        return activeMultiplier;
    }

    // MCP-MARKER:METHOD:GET_REMAINING_TIME - Получение оставшегося времени множителя
    getRemainingTime(activeMultiplier) {
        const now = Date.now();
        const remaining = activeMultiplier.expiresAt - now;
        return Math.max(0, remaining);
    }

    // MCP-MARKER:METHOD:FORMAT_REMAINING_TIME - Форматирование оставшегося времени
    formatRemainingTime(milliseconds) {
        const hours = Math.floor(milliseconds / (1000 * 60 * 60));
        const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
        
        if (hours > 0) {
            return `${hours}ч ${minutes}м`;
        }
        return `${minutes}м`;
    }

    // MCP-MARKER:METHOD:GET_TOTAL_MULTIPLIER - Получение суммарного множителя
    getTotalMultiplier() {
        let total = 1;
        
        for (const multiplier of this.activeMultipliers) {
            const remaining = this.getRemainingTime(multiplier);
            if (remaining > 0) {
                total *= multiplier.multiplier;
            }
        }
        
        return total;
    }

    // MCP-MARKER:METHOD:APPLY_MULTIPLIERS - Применение множителей к доходу
    applyMultipliers(baseIncome) {
        const totalMultiplier = this.getTotalMultiplier();
        return baseIncome * totalMultiplier;
    }

    // MCP-MARKER:METHOD:GET_ACTIVE_MULTIPLIERS - Получение списка активных множителей
    getActiveMultipliers() {
        return this.activeMultipliers.filter(m => this.getRemainingTime(m) > 0);
    }

    // MCP-MARKER:METHOD:GET_AVAILABLE_MULTIPLIERS - Получение доступных множителей для покупки
    getAvailableMultipliers() {
        return Object.values(this.multipliers);
    }

    // MCP-MARKER:METHOD:GET_STATISTICS - Получение статистики
    getStatistics() {
        return {
            ...this.statistics,
            currentMultiplier: this.getTotalMultiplier(),
            activeCount: this.getActiveMultipliers().length
        };
    }

    // MCP-MARKER:METHOD:START_UPDATE_TIMER - Запуск таймера обновления
    startUpdateTimer() {
        setInterval(() => {
            // Удаление истекших множителей
            const before = this.activeMultipliers.length;
            this.activeMultipliers = this.activeMultipliers.filter(m => {
                return this.getRemainingTime(m) > 0;
            });
            
            if (before !== this.activeMultipliers.length) {
                this.saveActiveMultipliers();
                console.log('🕐 Истекшие множители удалены');
            }
        }, 60000); // Каждую минуту
    }

    // MCP-MARKER:METHOD:RENDER_ACTIVE_MULTIPLIERS - Рендеринг активных множителей
    renderActiveMultipliers() {
        const activeMultipliers = this.getActiveMultipliers();
        
        if (activeMultipliers.length === 0) {
            return `
                <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                    <div style="font-size: 2rem; margin-bottom: 1rem; opacity: 0.5;">😴</div>
                    <p>Нет активных множителей</p>
                    <p style="font-size: 0.9rem;">Активируйте множители для увеличения доходности</p>
                </div>
            `;
        }

        return activeMultipliers.map(m => {
            const remaining = this.getRemainingTime(m);
            const percentage = (remaining / (m.duration * 60 * 60 * 1000)) * 100;
            
            return `
                <div style="text-align: center; padding: 1rem; background: var(--bg-primary); 
                           border-radius: 8px; border: 2px solid ${m.color};">
                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">${m.icon}</div>
                    <h5 style="color: var(--text-primary); margin-bottom: 0.3rem;">${m.name}</h5>
                    <div style="font-size: 1.8rem; font-weight: 700; color: ${m.color}; margin-bottom: 0.3rem;">
                        x${m.multiplier}
                    </div>
                    <div style="color: var(--text-secondary); font-size: 0.8rem;">
                        Осталось: ${this.formatRemainingTime(remaining)}
                    </div>
                    <div style="background: var(--bg-secondary); border-radius: 6px; overflow: hidden; margin-top: 0.5rem;">
                        <div style="background: ${m.color}; height: 4px; width: ${percentage}%;"></div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // MCP-MARKER:METHOD:RENDER_AVAILABLE_MULTIPLIERS - Рендеринг доступных множителей
    renderAvailableMultipliers() {
        return Object.values(this.multipliers).map(m => `
            <div style="padding: 1rem; background: var(--bg-primary); border-radius: 8px; 
                       border: 2px solid var(--border-color);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <span style="font-size: 1.5rem;">${m.icon}</span>
                        <h5 style="color: var(--text-primary);">${m.name} x${m.multiplier}</h5>
                    </div>
                    <span style="background: ${m.color}; color: var(--bg-primary); 
                                padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.8rem;">
                        ${m.duration} час${m.duration > 1 ? 'ов' : ''}
                    </span>
                </div>
                <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 1rem;">
                    ${m.description}
                </p>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <span style="color: var(--success-color); font-weight: 600;">
                        Стоимость: $${m.costUSDT}
                    </span>
                    <span style="color: var(--text-secondary); font-size: 0.8rem;">
                        или ${m.costPLEX} PLEX
                    </span>
                </div>
                <button class="btn" onclick="window.CabinetApp.activateMultiplier('${m.id}')" 
                        style="width: 100%;">
                    ${m.icon} Активировать
                </button>
            </div>
        `).join('');
    }

    // MCP-MARKER:METHOD:CALCULATE_BONUS_INCOME - Расчет дополнительного дохода от множителей
    calculateBonusIncome(baseIncome) {
        const totalMultiplier = this.getTotalMultiplier();
        const bonusIncome = baseIncome * (totalMultiplier - 1);
        return bonusIncome;
    }

    // MCP-MARKER:METHOD:UPDATE_EARNINGS_STATISTICS - Обновление статистики дохода
    updateEarningsStatistics(bonusEarned) {
        this.statistics.totalEarned += bonusEarned;
        this.saveStatistics();
    }
}

// MCP-MARKER:INITIALIZATION:SERVICE_INIT - Инициализация сервиса
window.multipliersService = new MultipliersService();

console.log('✅ Сервис множителей загружен и готов к работе');
