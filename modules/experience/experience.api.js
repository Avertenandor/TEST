// modules/experience/experience.api.js
// API для работы с системой опыта и стажа

export default class ExperienceAPI {
    constructor(bscApi) {
        this.bscApi = bscApi;
        this.experienceData = {
            totalExperience: 0,
            level: 1,
            sections: {
                deposits: { level: 1, exp: 150, maxExp: 1000 },
                transactions: { level: 1, exp: 250, maxExp: 1000 },
                referrals: { level: 0, exp: 0, maxExp: 500 },
                multipliers: { level: 1, exp: 100, maxExp: 1000 },
                mining: { level: 0, exp: 0, maxExp: 1000, locked: true },
                terminal: { level: 0, exp: 0, maxExp: 2000 }
            },
            achievements: [],
            stageBalance: 0.0,
            totalStageEarned: 0.0
        };
        this.cache = new Map();
        this.cacheTimeout = 300000; // 5 минут
        this.expToStageRate = 1000; // 1000 EXP = 1 STAGE
    }

    /**
     * Инициализация API
     */
    async init() {
        try {
            console.log('[Experience] Инициализация API опыта');
            await this.loadExperienceData();
            await this.calculateLevel();
            await this.checkAchievements();
            this.startAutoSave();
            console.log('[Experience] API готов к работе');
        } catch (error) {
            console.error('[Experience] Ошибка инициализации:', error);
        }
    }

    /**
     * Загрузка данных опыта
     */
    async loadExperienceData() {
        try {
            // Загружаем из localStorage
            const stored = localStorage.getItem('genesis_experience_data');
            if (stored) {
                const data = JSON.parse(stored);
                this.experienceData = { ...this.experienceData, ...data };
            }

            // Дополняем реальными данными из блокчейна
            await this.syncWithBlockchain();
            
            console.log('[Experience] Данные опыта загружены:', this.experienceData);
        } catch (error) {
            console.error('[Experience] Ошибка загрузки данных:', error);
        }
    }

    /**
     * Синхронизация с блокчейном
     */
    async syncWithBlockchain() {
        try {
            if (!this.bscApi || !this.bscApi.userAddress) {
                return;
            }

            // Получаем данные о депозитах
            const deposits = await this.getDepositsData();
            this.updateSectionExp('deposits', deposits.count * 50, deposits.active * 25);

            // Получаем данные о транзакциях
            const transactions = await this.getTransactionsData();
            this.updateSectionExp('transactions', transactions.count * 10, 0);

            // Получаем данные о рефералах
            const referrals = await this.getReferralsData();
            this.updateSectionExp('referrals', referrals.count * 100, referrals.active * 50);

            // Получаем данные о множителях
            const multipliers = await this.getMultipliersData();
            this.updateSectionExp('multipliers', multipliers.bought * 50, multipliers.active * 25);

        } catch (error) {
            console.error('[Experience] Ошибка синхронизации:', error);
        }
    }

    /**
     * Получение данных о депозитах
     */
    async getDepositsData() {
        try {
            // Интеграция с депозитным сервисом
            if (window.depositsCabinetService) {
                const deposits = await window.depositsCabinetService.getUserDeposits();
                return {
                    count: deposits.length,
                    active: deposits.filter(d => d.status === 'ACTIVE').length,
                    totalAmount: deposits.reduce((sum, d) => sum + d.amount, 0)
                };
            }
            
            return { count: 2, active: 2, totalAmount: 125 };
        } catch (error) {
            console.error('[Experience] Ошибка получения депозитов:', error);
            return { count: 0, active: 0, totalAmount: 0 };
        }
    }

    /**
     * Получение данных о транзакциях
     */
    async getTransactionsData() {
        try {
            // Получаем историю транзакций
            const transactions = await this.bscApi?.getTransactionHistory() || [];
            return {
                count: transactions.length,
                volume: transactions.reduce((sum, tx) => sum + (tx.value || 0), 0)
            };
        } catch (error) {
            console.error('[Experience] Ошибка получения транзакций:', error);
            return { count: 5, volume: 325 };
        }
    }

    /**
     * Получение данных о рефералах
     */
    async getReferralsData() {
        try {
            // Интеграция с реферальным сервисом
            if (window.referralService) {
                const referrals = await window.referralService.getReferrals();
                return {
                    count: referrals.length,
                    active: referrals.filter(r => r.isActive).length
                };
            }
            
            return { count: 0, active: 0 };
        } catch (error) {
            console.error('[Experience] Ошибка получения рефералов:', error);
            return { count: 0, active: 0 };
        }
    }

    /**
     * Получение данных о множителях
     */
    async getMultipliersData() {
        try {
            // Интеграция с сервисом множителей
            if (window.multipliersService) {
                const multipliers = await window.multipliersService.getUserMultipliers();
                return {
                    bought: multipliers.length,
                    active: multipliers.filter(m => m.isActive).length
                };
            }
            
            return { bought: 1, active: 1 };
        } catch (error) {
            console.error('[Experience] Ошибка получения множителей:', error);
            return { bought: 0, active: 0 };
        }
    }

    /**
     * Обновление опыта в разделе
     */
    updateSectionExp(section, baseExp, bonusExp = 0) {
        if (!this.experienceData.sections[section]) {
            return;
        }

        const newExp = baseExp + bonusExp;
        this.experienceData.sections[section].exp = Math.max(
            this.experienceData.sections[section].exp,
            newExp
        );

        // Пересчитываем уровень раздела
        this.calculateSectionLevel(section);
    }

    /**
     * Расчет уровня раздела
     */
    calculateSectionLevel(section) {
        const sectionData = this.experienceData.sections[section];
        if (!sectionData) return;

        let level = 1;
        let requiredExp = 1000;
        
        while (sectionData.exp >= requiredExp) {
            level++;
            requiredExp *= 1.5; // Каждый уровень требует в 1.5 раза больше опыта
        }

        sectionData.level = level;
        sectionData.maxExp = Math.ceil(requiredExp);
    }

    /**
     * Добавление опыта
     */
    addExperience(amount, section = null, reason = '') {
        if (amount <= 0) return;

        this.experienceData.totalExperience += amount;

        if (section && this.experienceData.sections[section]) {
            this.experienceData.sections[section].exp += amount;
            this.calculateSectionLevel(section);
        }

        // Пересчитываем общий уровень
        this.calculateLevel();

        // Конвертируем в STAGE
        this.convertToStage();

        // Проверяем достижения
        this.checkAchievements();

        // Сохраняем изменения
        this.saveExperienceData();

        console.log(`[Experience] Добавлен опыт: ${amount} (${reason})`);
    }

    /**
     * Расчет общего уровня
     */
    calculateLevel() {
        const totalExp = this.experienceData.totalExperience;
        let level = 1;
        let requiredExp = 1000;
        
        while (totalExp >= requiredExp) {
            level++;
            requiredExp += level * 500; // Каждый уровень требует больше опыта
        }

        const oldLevel = this.experienceData.level;
        this.experienceData.level = level;

        // Проверяем повышение уровня
        if (level > oldLevel) {
            this.onLevelUp(level, oldLevel);
        }
    }

    /**
     * Обработка повышения уровня
     */
    onLevelUp(newLevel, oldLevel) {
        console.log(`[Experience] Повышение уровня! ${oldLevel} → ${newLevel}`);

        // Награда за повышение уровня
        const reward = this.getLevelReward(newLevel);
        if (reward) {
            alert(`🎉 Поздравляем! Достигнут ${newLevel} уровень!\n\n🎁 Награда: ${reward.title}\n${reward.description}`);
        }

        // Проверяем новые достижения
        this.checkAchievements();
    }

    /**
     * Получение награды за уровень
     */
    getLevelReward(level) {
        const rewards = {
            2: { title: '💰 Начинающий инвестор', description: 'Скидка 5% на все депозиты' },
            3: { title: '⚡ Ускоритель', description: 'Доступ к премиум множителям' },
            5: { title: '🏅 Профессионал', description: 'Увеличенные лимиты депозитов (+50%)' },
            10: { title: '🏆 Мастер', description: 'Доступ к эксклюзивным планам' }
        };

        return rewards[level] || null;
    }

    /**
     * Конвертация опыта в STAGE
     */
    convertToStage() {
        const totalStage = Math.floor(this.experienceData.totalExperience / this.expToStageRate);
        const newStage = totalStage - this.experienceData.totalStageEarned;
        
        if (newStage > 0) {
            this.experienceData.stageBalance += newStage;
            this.experienceData.totalStageEarned = totalStage;
            
            console.log(`[Experience] Конвертировано в STAGE: ${newStage}`);
        }
    }

    /**
     * Проверка достижений
     */
    async checkAchievements() {
        const achievements = this.getAvailableAchievements();
        
        for (const achievement of achievements) {
            if (this.checkAchievementCondition(achievement) && 
                !this.experienceData.achievements.includes(achievement.id)) {
                
                this.unlockAchievement(achievement);
            }
        }
    }

    /**
     * Получение доступных достижений
     */
    getAvailableAchievements() {
        return [
            {
                id: 'first_deposit',
                title: 'Первые шаги',
                description: 'Создали первый депозит',
                icon: '🎯',
                reward: 50,
                condition: () => this.experienceData.sections.deposits.exp >= 50
            },
            {
                id: 'investor',
                title: 'Инвестор',
                description: 'Создали 2 депозита',
                icon: '💰',
                reward: 100,
                condition: () => this.experienceData.sections.deposits.exp >= 100
            },
            {
                id: 'accelerator',
                title: 'Ускоритель',
                description: 'Купите 3 множителя',
                icon: '⚡',
                reward: 150,
                condition: () => this.experienceData.sections.multipliers.exp >= 150
            },
            {
                id: 'mentor',
                title: 'Наставник',
                description: 'Пригласите первого реферала',
                icon: '👥',
                reward: 200,
                condition: () => this.experienceData.sections.referrals.exp >= 100
            },
            {
                id: 'deposit_master',
                title: 'Мастер депозитов',
                description: 'Создайте депозиты на $1000',
                icon: '💎',
                reward: 500,
                condition: () => this.experienceData.sections.deposits.exp >= 500
            },
            {
                id: 'genesis_legend',
                title: 'Легенда GENESIS',
                description: 'Достигните 10 уровня',
                icon: '🏆',
                reward: 1000,
                condition: () => this.experienceData.level >= 10
            }
        ];
    }

    /**
     * Проверка условия достижения
     */
    checkAchievementCondition(achievement) {
        try {
            return achievement.condition();
        } catch (error) {
            console.error('[Experience] Ошибка проверки достижения:', error);
            return false;
        }
    }

    /**
     * Разблокировка достижения
     */
    unlockAchievement(achievement) {
        this.experienceData.achievements.push(achievement.id);
        this.addExperience(achievement.reward, null, `Достижение: ${achievement.title}`);
        
        console.log(`[Experience] Достижение разблокировано: ${achievement.title}`);
        
        // Уведомление пользователя
        alert(`🏅 Достижение разблокировано!\n\n${achievement.icon} ${achievement.title}\n${achievement.description}\n\n🎁 Награда: +${achievement.reward} EXP`);
    }

    /**
     * Получение статистики опыта
     */
    getExperienceStats() {
        const nextLevelExp = this.getNextLevelExperience();
        const progressToNext = this.experienceData.totalExperience - this.getCurrentLevelMinExp();
        const progressPercent = (progressToNext / (nextLevelExp - this.getCurrentLevelMinExp())) * 100;

        return {
            totalExperience: this.experienceData.totalExperience,
            level: this.experienceData.level,
            progressToNext,
            nextLevelExp,
            progressPercent: Math.min(100, Math.max(0, progressPercent)),
            stageBalance: this.experienceData.stageBalance,
            totalStageEarned: this.experienceData.totalStageEarned,
            nextStageConversion: this.expToStageRate - (this.experienceData.totalExperience % this.expToStageRate),
            sections: { ...this.experienceData.sections },
            achievements: [...this.experienceData.achievements]
        };
    }

    /**
     * Получение опыта для следующего уровня
     */
    getNextLevelExperience() {
        let requiredExp = 1000;
        for (let i = 1; i < this.experienceData.level; i++) {
            requiredExp += (i + 1) * 500;
        }
        return requiredExp + (this.experienceData.level + 1) * 500;
    }

    /**
     * Получение минимального опыта для текущего уровня
     */
    getCurrentLevelMinExp() {
        let minExp = 0;
        for (let i = 1; i < this.experienceData.level; i++) {
            minExp += 1000 + i * 500;
        }
        return minExp;
    }

    /**
     * Трата STAGE
     */
    spendStage(amount, reason = '') {
        if (amount > this.experienceData.stageBalance) {
            throw new Error('Недостаточно STAGE для операции');
        }

        this.experienceData.stageBalance -= amount;
        this.saveExperienceData();

        console.log(`[Experience] Потрачено STAGE: ${amount} (${reason})`);
        return true;
    }

    /**
     * Сохранение данных опыта
     */
    saveExperienceData() {
        try {
            localStorage.setItem('genesis_experience_data', JSON.stringify(this.experienceData));
        } catch (error) {
            console.error('[Experience] Ошибка сохранения данных:', error);
        }
    }

    /**
     * Автосохранение
     */
    startAutoSave() {
        setInterval(() => {
            this.saveExperienceData();
        }, 30000); // Сохраняем каждые 30 секунд
    }

    /**
     * Сброс данных опыта (для тестирования)
     */
    resetExperience() {
        this.experienceData = {
            totalExperience: 0,
            level: 1,
            sections: {
                deposits: { level: 1, exp: 0, maxExp: 1000 },
                transactions: { level: 1, exp: 0, maxExp: 1000 },
                referrals: { level: 0, exp: 0, maxExp: 500 },
                multipliers: { level: 1, exp: 0, maxExp: 1000 },
                mining: { level: 0, exp: 0, maxExp: 1000, locked: true },
                terminal: { level: 0, exp: 0, maxExp: 2000 }
            },
            achievements: [],
            stageBalance: 0.0,
            totalStageEarned: 0.0
        };
        
        this.saveExperienceData();
        console.log('[Experience] Данные опыта сброшены');
    }

    /**
     * Получение информации о достижениях
     */
    getAchievementsInfo() {
        const allAchievements = this.getAvailableAchievements();
        
        return allAchievements.map(achievement => ({
            ...achievement,
            isEarned: this.experienceData.achievements.includes(achievement.id),
            canEarn: this.checkAchievementCondition(achievement),
            progress: this.getAchievementProgress(achievement)
        }));
    }

    /**
     * Получение прогресса достижения
     */
    getAchievementProgress(achievement) {
        // Здесь можно добавить специфичную логику для каждого достижения
        if (achievement.id === 'deposit_master') {
            return {
                current: 125,
                required: 1000,
                percent: 12.5
            };
        }
        
        return null;
    }

    /**
     * Очистка кэша
     */
    clearCache() {
        this.cache.clear();
        console.log('[Experience] Кэш очищен');
    }

    /**
     * Очистка ресурсов
     */
    destroy() {
        this.saveExperienceData();
        this.clearCache();
        console.log('[Experience] API остановлен');
    }
}
