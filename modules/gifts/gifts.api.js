// modules/gifts/gifts.api.js
// API для работы с системой подарков

export default class GiftsAPI {
    constructor(config) {
        this.config = config;
        this.bscApiKey = config?.api?.bscScanKey;
        this.systemAddress = config?.systemAddress;
    }
    
    // Получить список доступных подарков
    async getAvailableGifts() {
        try {
            // В реальной версии здесь будет запрос к блокчейну или API
            // Сейчас возвращаем тестовые данные
            
            const userAddress = window.store?.get('user.address');
            if (!userAddress) return [];
            
            // Получаем данные о пользователе для определения доступных подарков
            const userStats = await this.getUserStats(userAddress);
            
            // Список всех возможных подарков
            const allGifts = [
                {
                    id: 'first_deposit',
                    name: 'Первый депозит',
                    description: 'Награда за создание первого депозита',
                    icon: '💰',
                    reward: '5 USDT',
                    condition: 'Создайте первый депозит',
                    available: userStats.depositsCount === 0,
                    claimed: userStats.claimedGifts?.includes('first_deposit'),
                    progress: userStats.depositsCount > 0 ? 100 : 0
                },
                {
                    id: 'five_deposits',
                    name: 'Пять депозитов',
                    description: 'Награда за создание 5 депозитов',
                    icon: '🎯',
                    reward: '10 USDT',
                    condition: 'Создайте 5 депозитов',
                    available: userStats.depositsCount >= 5,
                    claimed: userStats.claimedGifts?.includes('five_deposits'),
                    progress: Math.min(100, (userStats.depositsCount / 5) * 100)
                },
                {
                    id: 'week_activity',
                    name: 'Неделя активности',
                    description: 'Награда за активность в течение 7 дней',
                    icon: '📅',
                    reward: '7 USDT',
                    condition: 'Будьте активны 7 дней подряд',
                    available: userStats.activityDays >= 7,
                    claimed: userStats.claimedGifts?.includes('week_activity'),
                    progress: Math.min(100, (userStats.activityDays / 7) * 100)
                },
                {
                    id: 'referral_master',
                    name: 'Мастер рефералов',
                    description: 'Награда за привлечение 3 рефералов',
                    icon: '👥',
                    reward: '15 USDT',
                    condition: 'Пригласите 3 активных рефералов',
                    available: userStats.referralsCount >= 3,
                    claimed: userStats.claimedGifts?.includes('referral_master'),
                    progress: Math.min(100, (userStats.referralsCount / 3) * 100)
                },
                {
                    id: 'profit_100',
                    name: 'Первая сотня',
                    description: 'Награда за получение $100 прибыли',
                    icon: '💵',
                    reward: '20 USDT',
                    condition: 'Получите $100 общей прибыли',
                    available: userStats.totalProfit >= 100,
                    claimed: userStats.claimedGifts?.includes('profit_100'),
                    progress: Math.min(100, (userStats.totalProfit / 100) * 100)
                },
                {
                    id: 'month_member',
                    name: 'Месяц в системе',
                    description: 'Награда за месяц участия в системе',
                    icon: '🏆',
                    reward: '30 USDT',
                    condition: 'Будьте участником системы 30 дней',
                    available: userStats.memberDays >= 30,
                    claimed: userStats.claimedGifts?.includes('month_member'),
                    progress: Math.min(100, (userStats.memberDays / 30) * 100)
                }
            ];
            
            return allGifts;
            
        } catch (error) {
            console.error('Error getting available gifts:', error);
            return [];
        }
    }
    
    // Проверить доступность ежедневного подарка
    async checkDailyGift() {
        try {
            const lastClaim = localStorage.getItem('genesis_daily_gift_last_claim');
            const streak = parseInt(localStorage.getItem('genesis_daily_gift_streak') || '0');
            
            if (!lastClaim) {
                return {
                    available: true,
                    reward: this.calculateDailyReward(streak),
                    streak: streak,
                    nextAvailable: null
                };
            }
            
            const lastClaimDate = new Date(lastClaim);
            const now = new Date();
            const diffHours = (now - lastClaimDate) / (1000 * 60 * 60);
            
            if (diffHours >= 24) {
                // Проверяем, не прервалась ли серия
                const diffDays = Math.floor(diffHours / 24);
                const newStreak = diffDays > 1 ? 0 : streak;
                
                return {
                    available: true,
                    reward: this.calculateDailyReward(newStreak),
                    streak: newStreak,
                    nextAvailable: null
                };
            } else {
                // Подарок еще недоступен
                const nextAvailable = new Date(lastClaimDate.getTime() + 24 * 60 * 60 * 1000);
                
                return {
                    available: false,
                    reward: this.calculateDailyReward(streak),
                    streak: streak,
                    nextAvailable: nextAvailable
                };
            }
            
        } catch (error) {
            console.error('Error checking daily gift:', error);
            return {
                available: false,
                nextAvailable: null,
                streak: 0
            };
        }
    }
    
    // Рассчитать награду за ежедневный подарок
    calculateDailyReward(streak) {
        // Базовая награда + бонус за серию дней
        const baseReward = 0.5;
        const streakBonus = Math.min(streak * 0.1, 2); // Максимум 2 USDT бонуса
        return baseReward + streakBonus;
    }
    
    // Получить ежедневный подарок
    async claimDailyGift() {
        try {
            const dailyGift = await this.checkDailyGift();
            
            if (!dailyGift.available) {
                return {
                    success: false,
                    message: 'Ежедневный подарок еще недоступен'
                };
            }
            
            // Сохраняем время получения
            const now = new Date();
            localStorage.setItem('genesis_daily_gift_last_claim', now.toISOString());
            
            // Обновляем серию
            const newStreak = (dailyGift.streak || 0) + 1;
            localStorage.setItem('genesis_daily_gift_streak', newStreak.toString());
            
            // Добавляем награду к балансу (в реальной версии это будет транзакция)
            const currentBalance = parseFloat(localStorage.getItem('genesis_user_balance') || '0');
            const newBalance = currentBalance + dailyGift.reward;
            localStorage.setItem('genesis_user_balance', newBalance.toString());
            
            return {
                success: true,
                reward: dailyGift.reward,
                newStreak: newStreak,
                newBalance: newBalance
            };
            
        } catch (error) {
            console.error('Error claiming daily gift:', error);
            return {
                success: false,
                message: 'Ошибка при получении подарка'
            };
        }
    }
    
    // Получить подарок по ID
    async claimGift(giftId) {
        try {
            // Проверяем, не был ли подарок уже получен
            const claimedGifts = JSON.parse(localStorage.getItem('genesis_claimed_gifts') || '[]');
            
            if (claimedGifts.includes(giftId)) {
                return {
                    success: false,
                    message: 'Этот подарок уже получен'
                };
            }
            
            // Получаем информацию о подарке
            const gifts = await this.getAvailableGifts();
            const gift = gifts.find(g => g.id === giftId);
            
            if (!gift) {
                return {
                    success: false,
                    message: 'Подарок не найден'
                };
            }
            
            if (!gift.available) {
                return {
                    success: false,
                    message: 'Подарок еще недоступен'
                };
            }
            
            // Добавляем в список полученных
            claimedGifts.push(giftId);
            localStorage.setItem('genesis_claimed_gifts', JSON.stringify(claimedGifts));
            
            // Добавляем награду (в реальной версии это будет транзакция)
            const rewardAmount = parseFloat(gift.reward.replace(/[^\d.]/g, ''));
            const currentBalance = parseFloat(localStorage.getItem('genesis_user_balance') || '0');
            const newBalance = currentBalance + rewardAmount;
            localStorage.setItem('genesis_user_balance', newBalance.toString());
            
            return {
                success: true,
                reward: gift.reward,
                newBalance: newBalance
            };
            
        } catch (error) {
            console.error('Error claiming gift:', error);
            return {
                success: false,
                message: 'Ошибка при получении подарка'
            };
        }
    }
    
    // Получить статистику пользователя для определения доступных подарков
    async getUserStats(userAddress) {
        try {
            // В реальной версии здесь будет запрос к блокчейну
            // Сейчас используем локальные данные
            
            const stats = {
                depositsCount: parseInt(localStorage.getItem('genesis_deposits_count') || '0'),
                referralsCount: parseInt(localStorage.getItem('genesis_referrals_count') || '0'),
                activityDays: parseInt(localStorage.getItem('genesis_activity_days') || '1'),
                memberDays: this.calculateMemberDays(),
                totalProfit: parseFloat(localStorage.getItem('genesis_total_profit') || '0'),
                claimedGifts: JSON.parse(localStorage.getItem('genesis_claimed_gifts') || '[]')
            };
            
            return stats;
            
        } catch (error) {
            console.error('Error getting user stats:', error);
            return {
                depositsCount: 0,
                referralsCount: 0,
                activityDays: 0,
                memberDays: 0,
                totalProfit: 0,
                claimedGifts: []
            };
        }
    }
    
    // Рассчитать количество дней в системе
    calculateMemberDays() {
        const joinDate = localStorage.getItem('genesis_join_date');
        if (!joinDate) {
            // Если нет даты присоединения, устанавливаем текущую
            const now = new Date();
            localStorage.setItem('genesis_join_date', now.toISOString());
            return 0;
        }
        
        const join = new Date(joinDate);
        const now = new Date();
        const diffTime = Math.abs(now - join);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays;
    }
}
