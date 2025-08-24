// modules/referrals/referrals.api.js
// API для работы с реферальной системой

export default class ReferralsAPI {
    constructor(bscApi) {
        this.bscApi = bscApi;
        this.contractAddress = '0x...' // Адрес контракта рефералов
        this.cache = new Map();
        this.cacheTimeout = 60000; // 1 минута
    }

    /**
     * Получение реферальной ссылки пользователя
     */
    async getReferralLink(userAddress) {
        try {
            const baseUrl = window.location.origin;
            const referralCode = userAddress.slice(0, 6) + '...' + userAddress.slice(-4);
            
            return {
                link: `${baseUrl}/?ref=${userAddress}`,
                code: referralCode,
                qrCode: await this.generateQRCode(`${baseUrl}/?ref=${userAddress}`)
            };
        } catch (error) {
            console.error('Error generating referral link:', error);
            throw error;
        }
    }

    /**
     * Получение статистики рефералов
     */
    async getReferralStats(userAddress) {
        const cacheKey = `referral_stats_${userAddress}`;
        
        try {
            // Проверяем кэш
            if (this.cache.has(cacheKey)) {
                const cached = this.cache.get(cacheKey);
                if (Date.now() - cached.timestamp < this.cacheTimeout) {
                    return cached.data;
                }
            }

            // Имитация данных (в реальном проекте здесь будет запрос к блокчейну)
            const stats = {
                totalReferrals: this.generateRandomCount(0, 25),
                activeReferrals: this.generateRandomCount(0, 15),
                totalEarnings: this.generateRandomAmount(0, 1000),
                monthlyEarnings: this.generateRandomAmount(0, 200),
                averageDailyEarnings: this.generateRandomAmount(0, 10),
                level1Count: this.generateRandomCount(0, 15),
                level2Count: this.generateRandomCount(0, 8),
                level3Count: this.generateRandomCount(0, 3)
            };

            // Кэшируем результат
            this.cache.set(cacheKey, {
                data: stats,
                timestamp: Date.now()
            });

            return stats;
        } catch (error) {
            console.error('Error fetching referral stats:', error);
            return {
                totalReferrals: 0,
                activeReferrals: 0,
                totalEarnings: 0,
                monthlyEarnings: 0,
                averageDailyEarnings: 0,
                level1Count: 0,
                level2Count: 0,
                level3Count: 0
            };
        }
    }

    /**
     * Получение списка рефералов
     */
    async getReferralsList(userAddress, level = 'all', offset = 0, limit = 50) {
        const cacheKey = `referrals_list_${userAddress}_${level}_${offset}_${limit}`;
        
        try {
            // Проверяем кэш
            if (this.cache.has(cacheKey)) {
                const cached = this.cache.get(cacheKey);
                if (Date.now() - cached.timestamp < this.cacheTimeout) {
                    return cached.data;
                }
            }

            // Имитация данных рефералов
            const referrals = this.generateMockReferrals(level, limit);

            // Кэшируем результат
            this.cache.set(cacheKey, {
                data: referrals,
                timestamp: Date.now()
            });

            return referrals;
        } catch (error) {
            console.error('Error fetching referrals list:', error);
            return [];
        }
    }

    /**
     * Получение истории комиссий
     */
    async getCommissionHistory(userAddress, period = 30) {
        const cacheKey = `commission_history_${userAddress}_${period}`;
        
        try {
            // Проверяем кэш
            if (this.cache.has(cacheKey)) {
                const cached = this.cache.get(cacheKey);
                if (Date.now() - cached.timestamp < this.cacheTimeout) {
                    return cached.data;
                }
            }

            // Генерируем историю комиссий
            const history = this.generateCommissionHistory(period);

            // Кэшируем результат
            this.cache.set(cacheKey, {
                data: history,
                timestamp: Date.now()
            });

            return history;
        } catch (error) {
            console.error('Error fetching commission history:', error);
            return [];
        }
    }

    /**
     * Получение уровня лояльности
     */
    async getLoyaltyLevel(userAddress) {
        try {
            const stats = await this.getReferralStats(userAddress);
            const totalRefs = stats.totalReferrals;

            let level = 'bronze';
            let progress = 0;
            let nextLevel = 'silver';
            let nextLevelRefs = 20;

            if (totalRefs >= 100) {
                level = 'platinum';
                progress = 100;
                nextLevel = null;
                nextLevelRefs = null;
            } else if (totalRefs >= 50) {
                level = 'gold';
                progress = ((totalRefs - 50) / 50) * 100;
                nextLevel = 'platinum';
                nextLevelRefs = 100;
            } else if (totalRefs >= 20) {
                level = 'silver';
                progress = ((totalRefs - 20) / 30) * 100;
                nextLevel = 'gold';
                nextLevelRefs = 50;
            } else {
                level = 'bronze';
                progress = (totalRefs / 20) * 100;
                nextLevel = 'silver';
                nextLevelRefs = 20;
            }

            return {
                level,
                progress: Math.min(progress, 100),
                nextLevel,
                nextLevelRefs,
                currentRefs: totalRefs,
                refsToNext: nextLevelRefs ? nextLevelRefs - totalRefs : 0
            };
        } catch (error) {
            console.error('Error getting loyalty level:', error);
            return {
                level: 'bronze',
                progress: 0,
                nextLevel: 'silver',
                nextLevelRefs: 20,
                currentRefs: 0,
                refsToNext: 20
            };
        }
    }

    /**
     * Генерация QR кода
     */
    async generateQRCode(url) {
        try {
            const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
            return qrApiUrl;
        } catch (error) {
            console.error('Error generating QR code:', error);
            return null;
        }
    }

    /**
     * Получение промо материалов
     */
    getPromotionMaterials() {
        return {
            banners: [
                { size: '728x90', url: '/assets/banners/referral_728x90.png' },
                { size: '300x250', url: '/assets/banners/referral_300x250.png' },
                { size: '160x600', url: '/assets/banners/referral_160x600.png' }
            ],
            emailTemplate: `
Привет!

Хочу поделиться с тобой крутой платформой GENESIS для заработка в криптовалюте!

🚀 Что можно делать:
• Депозиты от $25 с автоматическими выплатами
• Пассивный доход от аренды майнинговых мощностей
• Активная торговля с MEV-ботами
• Партнерская программа на 3 уровня

💰 По моей ссылке ты получишь бонусы при регистрации: [REFERRAL_LINK]

Попробуй, не пожалеешь!
            `,
            socialPost: `
🚀 Зарабатываю пассивный доход в криптовалюте с GENESIS!

💎 Депозиты, майнинг, торговля, рефералы - все в одной экосистеме
🔥 Доходность десятки процентов в сутки
⚡ Начни с $25 и получи бонусы по моей ссылке

#GENESIS #криптовалюта #пассивныйдоход #PLEX #BSC

[REFERRAL_LINK]
            `
        };
    }

    // === Вспомогательные методы ===

    generateRandomCount(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    generateRandomAmount(min, max) {
        return +(Math.random() * (max - min) + min).toFixed(2);
    }

    generateMockReferrals(level, limit) {
        const referrals = [];
        const count = Math.min(this.generateRandomCount(0, limit), limit);

        for (let i = 0; i < count; i++) {
            const refLevel = level === 'all' ? this.generateRandomCount(1, 3) : parseInt(level);
            const deposits = this.generateRandomAmount(25, 2500);
            const commission = deposits * this.getCommissionRate(refLevel) / 100;

            referrals.push({
                address: this.generateMockAddress(),
                level: refLevel,
                deposits: deposits,
                commission: commission,
                registrationDate: this.generateRandomDate(),
                isActive: Math.random() > 0.3
            });
        }

        return referrals.sort((a, b) => new Date(b.registrationDate) - new Date(a.registrationDate));
    }

    generateCommissionHistory(period) {
        const history = [];
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - period);

        const daysCount = period || 365;
        for (let i = 0; i < daysCount; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);

            history.push({
                date: date.toISOString().split('T')[0],
                amount: this.generateRandomAmount(0, 20),
                level1: this.generateRandomAmount(0, 10),
                level2: this.generateRandomAmount(0, 5),
                level3: this.generateRandomAmount(0, 2)
            });
        }

        return history;
    }

    generateMockAddress() {
        const chars = '0123456789abcdef';
        let address = '0x';
        for (let i = 0; i < 40; i++) {
            address += chars[Math.floor(Math.random() * chars.length)];
        }
        return address;
    }

    generateRandomDate() {
        const start = new Date(2024, 0, 1);
        const end = new Date();
        const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime());
        return new Date(randomTime).toISOString();
    }

    getCommissionRate(level) {
        const rates = { 1: 15, 2: 10, 3: 5 };
        return rates[level] || 0;
    }

    /**
     * Очистка кэша
     */
    clearCache() {
        this.cache.clear();
        console.log('Referrals API cache cleared');
    }

    /**
     * Получение информации о кэше
     */
    getCacheInfo() {
        return {
            size: this.cache.size,
            timeout: this.cacheTimeout
        };
    }
}
