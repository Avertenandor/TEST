// modules/bonuses/bonuses.state.js
// Управление состоянием бонусов

export default class BonusesState {
    constructor() {
        this.activeBonuses = [];
        this.dailyBonusClaimed = false;
        this.lastClaimTime = null;
        this.currentMultiplier = 1;
        this.achievements = [];
        this.totalBonusesCollected = 0;
        
        this.initDefaultAchievements();
    }
    
    initDefaultAchievements() {
        this.achievements = [
            {
                id: 'first-deposit',
                name: 'Первый депозит',
                description: 'Создайте свой первый депозит',
                icon: '🎯',
                target: 1,
                current: 0,
                completed: false,
                claimed: false,
                reward: { value: 50, currency: 'PLEX', description: '50 PLEX' }
            },
            {
                id: 'five-deposits',
                name: 'Растущий портфель',
                description: 'Создайте 5 депозитов',
                icon: '📈',
                target: 5,
                current: 0,
                completed: false,
                claimed: false,
                reward: { value: 200, currency: 'PLEX', description: '200 PLEX' }
            },
            {
                id: 'ten-deposits',
                name: 'Серьезный инвестор',
                description: 'Создайте 10 депозитов',
                icon: '🏆',
                target: 10,
                current: 0,
                completed: false,
                claimed: false,
                reward: { value: 500, currency: 'PLEX', description: '500 PLEX' }
            },
            {
                id: 'daily-streak-7',
                name: 'Недельная серия',
                description: 'Собирайте ежедневный бонус 7 дней подряд',
                icon: '🔥',
                target: 7,
                current: 0,
                completed: false,
                claimed: false,
                reward: { value: 100, currency: 'PLEX', description: '100 PLEX' }
            },
            {
                id: 'total-earnings-1000',
                name: 'Первая тысяча',
                description: 'Заработайте 1000 PLEX',
                icon: '💰',
                target: 1000,
                current: 0,
                completed: false,
                claimed: false,
                reward: { value: 300, currency: 'PLEX', description: '300 PLEX' }
            }
        ];
    }
    
    load() {
        const saved = localStorage.getItem('genesis_bonuses_state');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                Object.assign(this, data);
            } catch (error) {
                console.error('Error loading bonuses state:', error);
            }
        }
    }
    
    save() {
        const data = {
            activeBonuses: this.activeBonuses,
            dailyBonusClaimed: this.dailyBonusClaimed,
            lastClaimTime: this.lastClaimTime,
            currentMultiplier: this.currentMultiplier,
            achievements: this.achievements,
            totalBonusesCollected: this.totalBonusesCollected
        };
        
        localStorage.setItem('genesis_bonuses_state', JSON.stringify(data));
    }
    
    update(data) {
        if (data.activeBonuses) this.activeBonuses = data.activeBonuses;
        if (data.achievements) this.achievements = data.achievements;
        if (data.multiplier) this.currentMultiplier = data.multiplier;
        if (data.totalBonuses) this.totalBonusesCollected = data.totalBonuses;
        
        this.save();
    }
    
    getTotalBonuses() {
        return this.totalBonusesCollected;
    }
    
    getActiveBonuses() {
        // Фильтруем истекшие бонусы
        const now = new Date();
        this.activeBonuses = this.activeBonuses.filter(bonus => 
            new Date(bonus.expiresAt) > now
        );
        
        return this.activeBonuses;
    }
    
    addActiveBonus(bonus) {
        // Добавляем время истечения если его нет
        if (!bonus.expiresAt) {
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + (bonus.duration || 24));
            bonus.expiresAt = expiresAt.toISOString();
        }
        
        this.activeBonuses.push(bonus);
        this.save();
    }
    
    canActivateBonus(bonusType) {
        // Проверяем, не активен ли уже этот бонус
        return !this.activeBonuses.some(b => b.type === bonusType);
    }
    
    hasBonus(bonusType) {
        return this.activeBonuses.some(b => b.type === bonusType);
    }
    
    canClaimDailyBonus() {
        if (!this.lastClaimTime) return true;
        
        const lastClaim = new Date(this.lastClaimTime);
        const now = new Date();
        
        // Проверяем, прошло ли 24 часа
        const hoursDiff = (now - lastClaim) / (1000 * 60 * 60);
        return hoursDiff >= 24;
    }
    
    getNextDailyBonusTime() {
        if (!this.lastClaimTime) return new Date().toISOString();
        
        const nextClaim = new Date(this.lastClaimTime);
        nextClaim.setHours(nextClaim.getHours() + 24);
        
        return nextClaim.toISOString();
    }
    
    setDailyBonusClaimed() {
        this.dailyBonusClaimed = true;
        this.lastClaimTime = new Date().toISOString();
        this.totalBonusesCollected++;
        
        // Обновляем достижение за ежедневные бонусы
        const streakAchievement = this.achievements.find(a => a.id === 'daily-streak-7');
        if (streakAchievement && !streakAchievement.completed) {
            streakAchievement.current++;
            if (streakAchievement.current >= streakAchievement.target) {
                streakAchievement.completed = true;
            }
        }
        
        this.save();
    }
    
    resetDailyBonus() {
        // Проверяем серию ежедневных бонусов
        const now = new Date();
        const lastClaim = this.lastClaimTime ? new Date(this.lastClaimTime) : null;
        
        if (lastClaim) {
            const daysDiff = Math.floor((now - lastClaim) / (1000 * 60 * 60 * 24));
            if (daysDiff > 1) {
                // Серия прервана
                const streakAchievement = this.achievements.find(a => a.id === 'daily-streak-7');
                if (streakAchievement && !streakAchievement.completed) {
                    streakAchievement.current = 0;
                }
            }
        }
        
        this.dailyBonusClaimed = false;
        this.save();
    }
    
    getCurrentMultiplier() {
        return this.currentMultiplier;
    }
    
    setMultiplier(value) {
        this.currentMultiplier = value;
        this.save();
    }
    
    getMultiplierCost(multiplierValue) {
        const costs = {
            2: 100,
            3: 250,
            5: 500,
            10: 1000
        };
        
        return costs[multiplierValue] || 0;
    }
    
    getAchievements() {
        return this.achievements;
    }
    
    updateAchievementProgress(achievementId, progress) {
        const achievement = this.achievements.find(a => a.id === achievementId);
        if (achievement) {
            achievement.current = progress;
            if (achievement.current >= achievement.target) {
                achievement.completed = true;
            }
            this.save();
        }
    }
    
    markAchievementClaimed(achievementId) {
        const achievement = this.achievements.find(a => a.id === achievementId);
        if (achievement) {
            achievement.claimed = true;
            this.save();
        }
    }
    
    clear() {
        this.activeBonuses = [];
        this.dailyBonusClaimed = false;
        this.lastClaimTime = null;
        this.currentMultiplier = 1;
        this.totalBonusesCollected = 0;
        this.initDefaultAchievements();
        
        localStorage.removeItem('genesis_bonuses_state');
    }
}
