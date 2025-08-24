// modules/multipliers/multipliers.api.js
// API для работы с системой множителей

export default class MultipliersAPI {
    constructor(bscApi) {
        this.bscApi = bscApi;
        this.cache = new Map();
        this.cacheTimeout = 30000; // 30 секунд
        this.timers = new Map(); // Для отслеживания таймеров
    }

    /**
     * Получение активных множителей
     */
    async getActiveMultipliers(userAddress) {
        const cacheKey = `active_multipliers_${userAddress}`;
        
        try {
            // Проверяем кэш
            if (this.cache.has(cacheKey)) {
                const cached = this.cache.get(cacheKey);
                if (Date.now() - cached.timestamp < this.cacheTimeout) {
                    return cached.data;
                }
            }

            // Имитация активных множителей
            const activeMultipliers = [
                {
                    id: 'fire_boost',
                    name: 'Огненный',
                    icon: '🔥',
                    multiplier: 2.5,
                    remainingTime: 4 * 3600 + 23 * 60, // 4ч 23м в секундах
                    totalDuration: 6 * 3600, // 6 часов
                    type: 'active',
                    color: 'success'
                },
                {
                    id: 'diamond_boost',
                    name: 'Алмазный',
                    icon: '💎',
                    multiplier: 1.8,
                    remainingTime: 12 * 3600 + 45 * 60, // 12ч 45м
                    totalDuration: 24 * 3600, // 24 часа
                    type: 'secondary',
                    color: 'secondary'
                },
                {
                    id: 'star_boost',
                    name: 'Звездный',
                    icon: '⭐',
                    multiplier: 3.2,
                    remainingTime: 23 * 3600 + 17 * 60, // 23ч 17м
                    totalDuration: 24 * 3600, // 24 часа
                    type: 'warning',
                    color: 'warning'
                }
            ];

            // Кэшируем результат
            this.cache.set(cacheKey, {
                data: activeMultipliers,
                timestamp: Date.now()
            });

            return activeMultipliers;
        } catch (error) {
            console.error('Error fetching active multipliers:', error);
            return [];
        }
    }

    /**
     * Получение эффекта от множителей
     */
    async getMultiplierEffect(userAddress) {
        try {
            const activeMultipliers = await this.getActiveMultipliers(userAddress);
            const baseIncome = 45.20; // Базовый дневной доход

            // Вычисляем общий множитель
            let totalMultiplier = 1;
            activeMultipliers.forEach(mult => {
                totalMultiplier *= mult.multiplier;
            });

            // Добавляем комбо-бонусы
            const comboBonus = this.calculateComboBonus(activeMultipliers);
            totalMultiplier *= (1 + comboBonus / 100);

            const boostedIncome = baseIncome * totalMultiplier;

            return {
                baseIncome,
                boostedIncome,
                totalMultiplier: Math.round(totalMultiplier * 100) / 100,
                comboBonus,
                increase: Math.round(((boostedIncome - baseIncome) / baseIncome) * 100)
            };
        } catch (error) {
            console.error('Error calculating multiplier effect:', error);
            return {
                baseIncome: 45.20,
                boostedIncome: 45.20,
                totalMultiplier: 1,
                comboBonus: 0,
                increase: 0
            };
        }
    }

    /**
     * Получение доступных множителей в магазине
     */
    getAvailableMultipliers() {
        return [
            {
                id: 'turbo',
                name: 'Турбо x2.0',
                icon: '🚀',
                multiplier: 2.0,
                duration: 6 * 3600, // 6 часов в секундах
                priceUSD: 25,
                pricePLEX: 500,
                description: 'Удваивает доходность от всех источников на 6 часов',
                category: 'short',
                color: 'success'
            },
            {
                id: 'lightning',
                name: 'Молния x4.0',
                icon: '⚡',
                multiplier: 4.0,
                duration: 3 * 3600, // 3 часа
                priceUSD: 45,
                pricePLEX: 900,
                description: 'Увеличивает доходность в 4 раза на 3 часа',
                category: 'power',
                color: 'primary'
            },
            {
                id: 'golden',
                name: 'Золотой x1.5',
                icon: '💰',
                multiplier: 1.5,
                duration: 24 * 3600, // 24 часа
                priceUSD: 35,
                pricePLEX: 700,
                description: 'Стабильное увеличение дохода на 50% в течение суток',
                category: 'stable',
                color: 'warning'
            },
            {
                id: 'mega',
                name: 'Мега x10.0',
                icon: '🌟',
                multiplier: 10.0,
                duration: 1 * 3600, // 1 час
                priceUSD: 100,
                pricePLEX: 2000,
                description: 'Максимальное увеличение дохода в 10 раз на час',
                category: 'premium',
                color: 'error',
                isPremium: true
            }
        ];
    }

    /**
     * Активация множителя
     */
    async activateMultiplier(userAddress, multiplierId, paymentMethod = 'PLEX') {
        try {
            const multipliers = this.getAvailableMultipliers();
            const multiplier = multipliers.find(m => m.id === multiplierId);
            
            if (!multiplier) {
                throw new Error('Множитель не найден');
            }

            // Проверяем баланс (имитация)
            const userBalance = await this.getUserBalance(userAddress);
            const price = paymentMethod === 'USD' ? multiplier.priceUSD : multiplier.pricePLEX;
            
            if (paymentMethod === 'PLEX' && userBalance.plex < price) {
                throw new Error('Недостаточно PLEX токенов');
            }
            
            if (paymentMethod === 'USD' && userBalance.usd < price) {
                throw new Error('Недостаточно средств USD');
            }

            // Имитация активации
            const activationData = {
                id: `${multiplierId}_${Date.now()}`,
                multiplierId,
                userAddress,
                activatedAt: Date.now(),
                expiresAt: Date.now() + multiplier.duration * 1000,
                paymentMethod,
                pricePaid: price,
                transactionHash: this.generateMockTxHash()
            };

            // Очищаем кэш активных множителей
            this.cache.delete(`active_multipliers_${userAddress}`);

            return {
                success: true,
                activation: activationData,
                message: `Множитель "${multiplier.name}" успешно активирован!`
            };

        } catch (error) {
            console.error('Error activating multiplier:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Получение истории активации множителей
     */
    async getMultiplierHistory(userAddress, period = 30) {
        const cacheKey = `multiplier_history_${userAddress}_${period}`;
        
        try {
            // Проверяем кэш
            if (this.cache.has(cacheKey)) {
                const cached = this.cache.get(cacheKey);
                if (Date.now() - cached.timestamp < this.cacheTimeout * 2) {
                    return cached.data;
                }
            }

            // Генерируем историю
            const history = this.generateMockHistory(period);
            
            // Кэшируем результат
            this.cache.set(cacheKey, {
                data: history,
                timestamp: Date.now()
            });

            return history;
        } catch (error) {
            console.error('Error fetching multiplier history:', error);
            return [];
        }
    }

    /**
     * Получение статистики по множителям
     */
    async getMultiplierStats(userAddress, period = 30) {
        try {
            const history = await this.getMultiplierHistory(userAddress, period);
            
            const stats = {
                totalActivated: history.length,
                totalSpent: history.reduce((sum, item) => sum + item.cost, 0),
                totalEarned: history.reduce((sum, item) => sum + item.earned, 0),
                averageMultiplier: history.length > 0 ? 
                    history.reduce((sum, item) => sum + item.multiplier, 0) / history.length : 0,
                mostUsed: this.getMostUsedMultiplier(history),
                roi: 0
            };

            // Вычисляем ROI
            if (stats.totalSpent > 0) {
                stats.roi = Math.round(((stats.totalEarned - stats.totalSpent) / stats.totalSpent) * 100);
            }

            return stats;
        } catch (error) {
            console.error('Error calculating multiplier stats:', error);
            return {
                totalActivated: 0,
                totalSpent: 0,
                totalEarned: 0,
                averageMultiplier: 0,
                mostUsed: null,
                roi: 0
            };
        }
    }

    /**
     * Получение баланса пользователя
     */
    async getUserBalance(userAddress) {
        // Имитация баланса
        return {
            plex: this.generateRandomAmount(500, 5000),
            usd: this.generateRandomAmount(100, 1000)
        };
    }

    /**
     * Получение рекомендаций по множителям
     */
    getMultiplierRecommendations(userStats, currentTime = new Date()) {
        const recommendations = [];
        
        // Рекомендация по времени
        const hour = currentTime.getHours();
        if (hour >= 9 && hour <= 11) {
            recommendations.push({
                type: 'timing',
                title: 'Утренний буст',
                description: 'Сейчас оптимальное время для активации мощных множителей',
                suggested: ['lightning', 'mega']
            });
        }

        // Рекомендация по активности
        if (userStats.totalActivated < 5) {
            recommendations.push({
                type: 'beginner',
                title: 'Для новичков',
                description: 'Попробуйте стабильные множители для изучения системы',
                suggested: ['golden', 'turbo']
            });
        }

        // Рекомендация по ROI
        if (userStats.roi < 50) {
            recommendations.push({
                type: 'optimization',
                title: 'Оптимизация доходности',
                description: 'Используйте комбинации множителей для увеличения ROI',
                suggested: ['combo']
            });
        }

        return recommendations;
    }

    // === Вспомогательные методы ===

    calculateComboBonus(activeMultipliers) {
        if (activeMultipliers.length < 2) return 0;
        
        // Простая логика комбо-бонусов
        const types = activeMultipliers.map(m => m.type);
        
        if (types.includes('active') && types.includes('secondary')) {
            return 10; // +10% за комбо Огонь + Алмаз
        }
        
        if (types.includes('warning') && activeMultipliers.length >= 3) {
            return 25; // +25% за тройное комбо
        }
        
        return 5; // Базовый комбо-бонус за любые 2+ множителя
    }

    generateMockHistory(days) {
        const history = [];
        const multipliers = this.getAvailableMultipliers();
        const count = Math.floor(Math.random() * days + 5);

        for (let i = 0; i < count; i++) {
            const multiplier = multipliers[Math.floor(Math.random() * multipliers.length)];
            const activatedAt = new Date();
            activatedAt.setDate(activatedAt.getDate() - Math.floor(Math.random() * days));
            
            const cost = Math.random() > 0.6 ? multiplier.priceUSD : multiplier.pricePLEX * 0.05; // PLEX в USD
            const earned = cost * (1.5 + Math.random() * 2); // ROI от 150% до 350%

            history.push({
                id: `hist_${i}`,
                multiplierId: multiplier.id,
                name: multiplier.name,
                icon: multiplier.icon,
                multiplier: multiplier.multiplier,
                duration: multiplier.duration,
                cost: Math.round(cost * 100) / 100,
                earned: Math.round(earned * 100) / 100,
                activatedAt: activatedAt.toISOString(),
                paymentMethod: Math.random() > 0.6 ? 'USD' : 'PLEX'
            });
        }

        return history.sort((a, b) => new Date(b.activatedAt) - new Date(a.activatedAt));
    }

    getMostUsedMultiplier(history) {
        if (history.length === 0) return null;
        
        const counts = {};
        history.forEach(item => {
            counts[item.multiplierId] = (counts[item.multiplierId] || 0) + 1;
        });
        
        const mostUsedId = Object.keys(counts).reduce((a, b) => 
            counts[a] > counts[b] ? a : b
        );
        
        const multipliers = this.getAvailableMultipliers();
        return multipliers.find(m => m.id === mostUsedId);
    }

    generateRandomAmount(min, max) {
        return Math.round((Math.random() * (max - min) + min) * 100) / 100;
    }

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
        
        if (hours > 0) {
            return `${hours}ч ${minutes}м`;
        }
        return `${minutes}м`;
    }

    /**
     * Очистка кэша
     */
    clearCache() {
        this.cache.clear();
        console.log('Multipliers API cache cleared');
    }

    /**
     * Запуск обновления таймеров
     */
    startTimerUpdates(callback) {
        const interval = setInterval(async () => {
            // Обновляем активные множители каждую минуту
            this.cache.delete('active_multipliers_current');
            if (callback) callback();
        }, 60000); // Каждую минуту

        return interval;
    }

    /**
     * Остановка обновления таймеров
     */
    stopTimerUpdates(interval) {
        if (interval) {
            clearInterval(interval);
        }
    }
}
