        const ranks = [
            { level: 1, name: 'Новичок', icon: '🥉', points: 0, bonus: 0, description: 'Начинающий участник системы' },
            { level: 2, name: 'Участник', icon: '🥈', points: 100, bonus: 5, description: 'Активный участник' },
            { level: 3, name: 'Активный', icon: '🥇', points: 500, bonus: 10, description: 'Опытный пользователь' },
            { level: 4, name: 'Профессионал', icon: '💎', points: 1500, bonus: 15, description: 'Профессиональный инвестор' },
            { level: 5, name: 'Эксперт', icon: '⭐', points: 5000, bonus: 20, description: 'Эксперт системы' },
            { level: 6, name: 'Легенда', icon: '👑', points: 10000, bonus: 30, description: 'Легендарный участник' }
        ];
        
        // Находим текущий ранг
        for (let i = ranks.length - 1; i >= 0; i--) {
            if (this.userPoints >= ranks[i].points) {
                this.currentRank = ranks[i];
                this.nextRank = ranks[i + 1] || null;
                break;
            }
        }
        
        if (!this.currentRank) {
            this.currentRank = ranks[0];
            this.nextRank = ranks[1];
        }
    }
    
    updateDisplay() {
        if (!this.container) return;
        
        // Обновляем текущий ранг
        const rankIcon = this.container.querySelector('#rank-icon');
        const rankName = this.container.querySelector('#rank-name');
        const rankDescription = this.container.querySelector('#rank-description');
        const rankPoints = this.container.querySelector('#rank-points');
        const progressFill = this.container.querySelector('#rank-progress-fill');
        const nextRankName = this.container.querySelector('#next-rank-name');
        
        if (rankIcon) rankIcon.textContent = this.currentRank.icon;
        if (rankName) rankName.textContent = this.currentRank.name;
        if (rankDescription) rankDescription.textContent = this.currentRank.description;
        
        if (this.nextRank) {
            const pointsNeeded = this.nextRank.points - this.currentRank.points;
            const pointsProgress = this.userPoints - this.currentRank.points;
            const progressPercent = (pointsProgress / pointsNeeded) * 100;
            
            if (rankPoints) {
                rankPoints.textContent = `${this.userPoints} / ${this.nextRank.points} очков`;
            }
            if (progressFill) {
                progressFill.style.width = `${Math.min(100, progressPercent)}%`;
            }
            if (nextRankName) {
                nextRankName.textContent = this.nextRank.name;
            }
        } else {
            // Максимальный ранг достигнут
            if (rankPoints) rankPoints.textContent = `${this.userPoints} очков (MAX)`;
            if (progressFill) progressFill.style.width = '100%';
            if (nextRankName) nextRankName.textContent = 'Максимальный ранг';
        }
        
        // Обновляем список рангов
        const rankItems = this.container.querySelectorAll('.rank-item');
        rankItems.forEach(item => {
            const rankLevel = parseInt(item.dataset.rank);
            
            item.classList.remove('current', 'achieved', 'locked');
            
            if (rankLevel === this.currentRank.level) {
                item.classList.add('current');
            } else if (rankLevel < this.currentRank.level) {
                item.classList.add('achieved');
            } else {
                item.classList.add('locked');
            }
        });
    }
    
    addPoints(points, reason) {
        this.userPoints += points;
        localStorage.setItem('genesis_rank_points', this.userPoints.toString());
        
        // Проверяем повышение ранга
        this.initRankData();
        this.updateDisplay();
        
        // Эмитим событие
        if (this.context?.eventBus) {
            this.context.eventBus.emit('rank:points:added', {
                points,
                reason,
                total: this.userPoints,
                rank: this.currentRank
            });
        }
    }
    
    destroy() {
        console.log('🧹 Destroying Rank Module...');
        
        // Удаление стилей
        const styles = document.querySelector(`style[data-module="${this.name}"]`);
        if (styles) styles.remove();
        
        // Очистка контейнера
        if (this.container) {
            this.container.innerHTML = '';
        }
        
        console.log('✅ Rank Module destroyed');
    }
}
