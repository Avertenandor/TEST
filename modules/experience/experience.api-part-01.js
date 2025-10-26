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
