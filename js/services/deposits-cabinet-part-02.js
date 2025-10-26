                    <p style="color: var(--text-secondary); line-height: 1.6; margin-bottom: 1rem;">
                        ${plan.description}
                    </p>
                    
                    ${userDepositsForPlan.length > 0 ? `
                        <div style="margin-top: 1.5rem;">
                            <h5 style="color: var(--success-color); margin-bottom: 0.5rem;">✅ Ваши депозиты по этому плану:</h5>
                            ${userDepositsForPlan.map(deposit => `
                                <div style="background: var(--bg-secondary); padding: 0.8rem; border-radius: 6px; margin-bottom: 0.5rem;">
                                    <div style="display: flex; justify-content: space-between; align-items: center;">
                                        <span style="color: var(--text-primary);">$${deposit.amount.toFixed(2)} ${deposit.tokenType}</span>
                                        <span style="color: var(--success-color); font-size: 0.8rem;">${deposit.status}</span>
                                    </div>
                                    <div style="color: var(--text-secondary); font-size: 0.8rem; margin-top: 0.3rem;">
                                        ${deposit.timestamp.toLocaleDateString()}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : `
                        <div style="background: rgba(0, 212, 255, 0.1); padding: 1rem; border-radius: 8px; border: 1px solid var(--secondary-color); margin-top: 1rem;">
                            <div style="color: var(--secondary-color); font-weight: 600; margin-bottom: 0.5rem;">💡 Этот план еще не приобретен</div>
                            <div style="color: var(--text-secondary); font-size: 0.9rem;">
                                Вы можете создать депозит по этому плану, если выполнены все условия последовательности.
                            </div>
                        </div>
                    `}
                </div>
                
                <div style="display: flex; gap: 1rem; justify-content: center;">
                    ${userDepositsForPlan.length === 0 && !this.isPlanLocked(plan, this.userDeposits.map(d => d.planId)) ? `
                        <button onclick="window.CabinetDepositService.startDepositProcess('${planId}'); window.CabinetDepositService.closeModal();" 
                                class="btn" style="padding: 0.8rem 1.5rem;">
                            💰 Создать депозит
                        </button>
                    ` : ''}
                    <button onclick="window.CabinetDepositService.closeModal()" 
                            class="btn-outline" style="padding: 0.8rem 1.5rem;">
                        ✕ Закрыть
                    </button>
                </div>
            </div>
        `;
        
        this.showModal('Детали плана', modalContent);
    },
    
    // MCP-MARKER:METHOD:SHOW_MODAL - Показ модального окна
    showModal(title, content) {
        // Удаляем существующее модальное окно
        const existingModal = document.getElementById('deposit-details-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        const modalHTML = `
            <div id="deposit-details-modal" class="modal-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.8); display: flex; justify-content: center; align-items: center; z-index: 1000;">
                <div class="modal-container" style="background: var(--bg-secondary); border-radius: 15px; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5); border: 1px solid var(--border-color); width: 90%; max-width: 800px; max-height: 90vh; overflow-y: auto;">
                    <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; padding: 1.5rem 2rem; border-bottom: 1px solid var(--border-color);">
                        <h3 style="color: var(--primary-color); margin: 0; font-family: 'Orbitron', monospace;">${title}</h3>
                        <button onclick="window.CabinetDepositService.closeModal()" style="background: none; border: none; color: var(--text-secondary); font-size: 2rem; cursor: pointer; line-height: 1; padding: 0; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;">&times;</button>
                    </div>
                    <div class="modal-content" style="padding: 2rem;">
                        ${content}
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    },
    
    // MCP-MARKER:METHOD:CLOSE_MODAL - Закрытие модального окна
    closeModal() {
        const modal = document.getElementById('deposit-details-modal');
        if (modal) {
            modal.remove();
        }
    },
    
    // MCP-MARKER:METHOD:SHOW_NOTIFICATION - Показ уведомления
    showNotification(title, message, type = 'info') {
        if (window.GenesisCabinet && window.GenesisCabinet.showNotification) {
            window.GenesisCabinet.showNotification(title, message, type);
        } else {
            alert(`${title}\n${message}`);
        }
    },
    
    // MCP-MARKER:METHOD:REFRESH_DATA - Обновление данных
    async refreshData() {
        if (this.isLoading) return;
        
        try {
            if (window.GenesisTerminal) {
                window.GenesisTerminal.log('🔄 Обновление данных депозитов...', 'info');
            }
            
            await this.loadUserData();
            
            this.showNotification('✅ Данные обновлены', 'Информация о депозитах успешно обновлена', 'success');
        } catch (error) {
            console.error('Ошибка обновления данных:', error);
            this.showNotification('❌ Ошибка обновления', error.message, 'error');
        }
    },
    
    // MCP-MARKER:UTILITY_METHODS - Утилиты
    
    // Получение иконки плана
    getPlanIcon(planName) {
        const icons = {
            'TRIAL': '🧪',
            'STARTER': '🚀',
            'PROGRESSIVE1': '📈',
            'PROGRESSIVE2': '💫',
            'PROGRESSIVE3': '⭐',
            'PROGRESSIVE4': '🌟',
            'PROGRESSIVE5': '✨',
            'PROGRESSIVE6': '💎',
            'PROGRESSIVE7': '👑',
            'PROGRESSIVE8': '🏆',
            'RECOMMENDED': '🎯',
            'PLATINUM': '🥈',
            'MAXIMUM': '🥇'
        };
        return icons[planName] || '💰';
    },
    
    // Получение цвета плана
    getPlanColor(planId) {
        const colors = {
            'trial': '#00ff41',
            'starter': '#ff6b35', 
            'progressive1': '#ffa726',
            'progressive2': '#ffeb3b',
            'progressive3': '#4caf50',
            'progressive4': '#00bcd4',
            'progressive5': '#2196f3',
            'progressive6': '#3f51b5',
            'progressive7': '#673ab7',
            'progressive8': '#9c27b0',
            'recommended': '#e91e63',
            'platinum': '#ff5722',
            'maximum': '#ffd700'
        };
        return colors[planId] || '#ff6b35';
    },
    
    // Получение статистики для экспорта
    getStatsForExport() {
        const stats = this.calculatePortfolioStats();
        return {
            ...stats,
            depositsCount: this.userDeposits.length,
            lastUpdate: this.lastUpdate,
            userAddress: this.currentUser
        };
    }
};

// MCP-MARKER:GLOBAL_FUNCTIONS - Глобальные функции
window.refreshCabinetDeposits = () => window.CabinetDepositService.refreshData();

console.log('💼 GENESIS Cabinet Deposit Service loaded');
