                                class="btn-secondary" style="font-size: 0.7rem; padding: 0.3rem 0.6rem;">
                            👁️ Детали
                        </button>
                        <button onclick="window.CabinetDepositService.viewInBlockchain('${deposit.txHash}')" 
                                class="btn-outline" style="font-size: 0.7rem; padding: 0.3rem 0.6rem;">
                            🌐 BSCScan
                        </button>
                    </div>
                </td>
            </tr>
        `;
    },
    
    // MCP-MARKER:METHOD:UPDATE_DEPOSIT_PLANS_GRID - Обновление сетки планов депозитов
    updateDepositPlansGrid() {
        const container = document.getElementById('deposit-plans-grid');
        if (!container) return;
        
        const plans = window.GENESIS_CONFIG.depositPlans;
        const userPlanIds = this.userDeposits.map(d => d.planId);
        
        container.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 1.5rem;">
                ${plans.map(plan => this.renderPlanCard(plan, userPlanIds)).join('')}
            </div>
            
            <div class="stats-card" style="margin-top: 2rem;">
                <h3 style="margin-bottom: 1rem; color: var(--primary-color);">📈 Информация о системе депозитов</h3>
                <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 2rem;">
                    <div>
                        <h4 style="color: var(--text-primary); margin-bottom: 1rem;">🎯 Преимущества GENESIS 1.1:</h4>
                        <ul style="color: var(--text-secondary); line-height: 1.8; margin: 0; padding-left: 1.5rem;">
                            <li>✅ <strong>Последовательная система:</strong> Защита через поэтапное увеличение депозитов</li>
                            <li>✅ <strong>Прозрачность:</strong> Все операции отслеживаются в блокчейне BSC</li>
                            <li>✅ <strong>Автоматизация:</strong> Мгновенная активация после подтверждения</li>
                            <li>✅ <strong>Гибкость:</strong> Выбор валюты оплаты (USDT/PLEX) для премиум планов</li>
                            <li>✅ <strong>Безопасность:</strong> Верифицированные смарт-контракты</li>
                        </ul>
                    </div>
                    <div style="text-align: center; padding: 2rem; background: var(--bg-primary); border-radius: 8px;">
                        <div style="font-size: 3rem; margin-bottom: 1rem;">🔒</div>
                        <h4 style="color: var(--success-color); margin-bottom: 0.5rem;">Система защищена</h4>
                        <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 1rem;">
                            Последовательная покупка планов
                        </p>
                        <div style="background: var(--bg-secondary); padding: 0.8rem; border-radius: 6px; font-family: monospace; font-size: 0.7rem; word-break: break-all;">
                            ${window.GENESIS_CONFIG.addresses.system}
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    // MCP-MARKER:METHOD:RENDER_PLAN_CARD - Отрисовка карточки плана
    renderPlanCard(plan, userPlanIds) {
        const hasThisPlan = userPlanIds.includes(plan.id);
        const isLocked = this.isPlanLocked(plan, userPlanIds);
        const profit = (plan.usdtAmount * plan.percentage / 100) - plan.usdtAmount;
        const dailyProfit = profit / plan.days;
        
        let statusBadge, buttonContent, buttonAction;
        
        if (hasThisPlan) {
            statusBadge = '<div style="background: rgba(0, 255, 65, 0.2); color: var(--success-color); padding: 0.3rem 0.6rem; border-radius: 6px; font-size: 0.8rem;">✅ Приобретен</div>';
            buttonContent = '👁️ Просмотр';
            buttonAction = `window.CabinetDepositService.viewPlanDetails('${plan.id}')`;
        } else if (isLocked) {
            statusBadge = '<div style="background: rgba(255, 165, 0, 0.2); color: var(--warning-color); padding: 0.3rem 0.6rem; border-radius: 6px; font-size: 0.8rem;">🔒 Заблокирован</div>';
            buttonContent = '🔒 Недоступен';
            buttonAction = 'void(0)';
        } else {
            statusBadge = '<div style="background: rgba(0, 212, 255, 0.2); color: var(--secondary-color); padding: 0.3rem 0.6rem; border-radius: 6px; font-size: 0.8rem;">🚀 Доступен</div>';
            buttonContent = '💰 Создать депозит';
            buttonAction = `window.CabinetDepositService.startDepositProcess('${plan.id}')`;
        }
        
        return `
            <div class="stats-card" style="border-left: 4px solid ${this.getPlanColor(plan.id)}; ${isLocked && !hasThisPlan ? 'opacity: 0.7;' : ''}">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                    <div>
                        <h4 style="color: ${this.getPlanColor(plan.id)}; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
                            <span style="font-size: 1.5rem;">${this.getPlanIcon(plan.name)}</span>
                            ${plan.name}
                        </h4>
                        <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem;">
                            ${plan.description}
                        </p>
                        ${statusBadge}
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 1.5rem; font-weight: 700; color: var(--text-primary);">
                            $${plan.usdtAmount.toLocaleString()}
                        </div>
                        <div style="color: var(--success-color); font-size: 0.9rem;">
                            ${plan.percentage}% (${plan.days} дней)
                        </div>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.8rem; margin-bottom: 1.5rem; font-size: 0.8rem;">
                    <div style="text-align: center; padding: 0.6rem; background: var(--bg-primary); border-radius: 6px;">
                        <div style="color: var(--text-secondary); margin-bottom: 0.2rem;">Инвестиция</div>
                        <div style="color: var(--text-primary); font-weight: 600;">$${plan.usdtAmount}</div>
                    </div>
                    <div style="text-align: center; padding: 0.6rem; background: var(--bg-primary); border-radius: 6px;">
                        <div style="color: var(--text-secondary); margin-bottom: 0.2rem;">Прибыль</div>
                        <div style="color: var(--success-color); font-weight: 600;">$${profit.toFixed(2)}</div>
                    </div>
                    <div style="text-align: center; padding: 0.6rem; background: var(--bg-primary); border-radius: 6px;">
                        <div style="color: var(--text-secondary); margin-bottom: 0.2rem;">В день</div>
                        <div style="color: var(--primary-color); font-weight: 600;">$${dailyProfit.toFixed(2)}</div>
                    </div>
                </div>
                
                <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem;">
                    <div style="display: flex; justify-content: space-between; font-size: 0.85rem;">
                        <span style="color: var(--text-secondary);">Валюты:</span>
                        <span style="color: var(--secondary-color); font-weight: 500;">${plan.currencies.join(', ')}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.85rem;">
                        <span style="color: var(--text-secondary);">ROI:</span>
                        <span style="color: var(--warning-color); font-weight: 500;">${plan.percentage - 100}% прибыль</span>
                    </div>
                </div>
                
                <button class="${hasThisPlan || isLocked ? 'btn-outline' : 'btn'}" 
                        onclick="${buttonAction}" 
                        style="width: 100%; font-size: 0.9rem; ${isLocked && !hasThisPlan ? 'opacity: 0.5; cursor: not-allowed;' : ''}"
                        ${isLocked && !hasThisPlan ? 'disabled' : ''}>
                    ${buttonContent}
                </button>
            </div>
        `;
    },
    
    // MCP-MARKER:METHOD:IS_PLAN_LOCKED - Проверка заблокированности плана
    isPlanLocked(plan, userPlanIds) {
        if (plan.id === 'trial') return false; // Пробный план всегда доступен
        
        const allPlans = window.GENESIS_CONFIG.depositPlans;
        const planIndex = allPlans.findIndex(p => p.id === plan.id);
        
        if (planIndex === 0) return false; // Первый план всегда доступен
        
        // Проверяем, что все предыдущие планы куплены
        for (let i = 0; i < planIndex; i++) {
            const prevPlan = allPlans[i];
            if (prevPlan.id !== 'trial' && !userPlanIds.includes(prevPlan.id)) {
                return true;
            }
        }
        
        return false;
    },
    
    // MCP-MARKER:METHOD:UPDATE_NEXT_AVAILABLE_PLAN - Обновление следующего доступного плана
    updateNextAvailablePlan() {
        const userPlanIds = this.userDeposits.map(d => d.planId);
        const allPlans = window.GENESIS_CONFIG.depositPlans;
        
        // Находим следующий доступный план
        let nextPlan = allPlans.find(plan => 
            !userPlanIds.includes(plan.id) && !this.isPlanLocked(plan, userPlanIds)
        );
        
        if (!nextPlan) {
            nextPlan = allPlans[allPlans.length - 1]; // Последний план если все куплены
        }
        
        const updates = {
            'next-available-plan': nextPlan.name,
            'next-plan-status': userPlanIds.includes(nextPlan.id) ? 'Приобретен' : 'Доступен'
        };
        
        Object.entries(updates).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });
        
        const nextPlanInfo = document.getElementById('next-plan-info');
        if (nextPlanInfo) {
            nextPlanInfo.innerHTML = `
                <div>💰 Минимум: $${nextPlan.usdtAmount}</div>
                <div>📊 Доходность: ${nextPlan.percentage}%</div>
            `;
        }
    },
    
    // MCP-MARKER:METHOD:SHOW_CREATE_DEPOSIT_MODAL - Показ модального окна создания депозита
    showCreateDepositModal() {
        if (window.GenesisCabinet && window.GenesisCabinet.showDepositModal) {
            window.GenesisCabinet.showDepositModal();
        } else {
            alert('Функция создания депозита временно недоступна');
        }
    },
    
    // MCP-MARKER:METHOD:START_DEPOSIT_PROCESS - Начало процесса создания депозита
    startDepositProcess(planId) {
        const plan = window.GENESIS_CONFIG.depositPlans.find(p => p.id === planId);
        if (!plan) {
            alert('❌ План депозита не найден');
            return;
        }
        
        if (window.GenesisTerminal) {
            window.GenesisTerminal.log(`💰 Начало создания депозита: ${plan.name}`, 'info');
        }
        
        // Проверяем блокировку плана
        const userPlanIds = this.userDeposits.map(d => d.planId);
        if (this.isPlanLocked(plan, userPlanIds)) {
            alert('🔒 Этот план заблокирован. Сначала приобретите предыдущие планы.');
            return;
        }
        
        // Показываем модальное окно с выбранным планом
        if (window.GenesisCabinet && window.GenesisCabinet.showPurchaseModal) {
            window.GenesisCabinet.showPurchaseModal(planId);
        } else {
            alert('Функция создания депозита временно недоступна');
        }
    },
    
    // MCP-MARKER:METHOD:VIEW_DEPOSIT_DETAILS - Просмотр деталей депозита
    viewDepositDetails(txHash) {
        const deposit = this.userDeposits.find(d => d.txHash === txHash);
        if (!deposit) {
            alert('❌ Депозит не найден');
            return;
        }
        
        const plan = window.GENESIS_CONFIG.depositPlans.find(p => p.id === deposit.planId);
        const now = new Date();
        const daysPassed = Math.floor((now - deposit.timestamp) / (1000 * 60 * 60 * 24));
        const progress = Math.min(100, (daysPassed / plan.days) * 100);
        
        const totalProfit = (deposit.amount * plan.percentage / 100) - deposit.amount;
        const dailyProfit = totalProfit / plan.days;
        const earnedProfit = Math.min(totalProfit, dailyProfit * daysPassed);
        const remainingProfit = totalProfit - earnedProfit;
        
        const modalContent = `
            <div style="max-width: 500px; margin: 0 auto;">
                <h3 style="color: var(--primary-color); margin-bottom: 1.5rem; text-align: center;">
                    💼 Детали депозита: ${plan.name}
                </h3>
                
                <div style="background: var(--bg-primary); padding: 1.5rem; border-radius: 12px; margin-bottom: 1.5rem;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                        <div>
                            <div style="color: var(--text-secondary); font-size: 0.9rem;">Инвестиция:</div>
                            <div style="color: var(--text-primary); font-weight: 600; font-size: 1.2rem;">
                                $${deposit.amount.toFixed(2)} ${deposit.tokenType}
                            </div>
                        </div>
                        <div>
                            <div style="color: var(--text-secondary); font-size: 0.9rem;">Статус:</div>
                            <div style="color: var(--success-color); font-weight: 600;">
                                ${deposit.status === 'ACTIVE' ? '🟢 Активен' : '🔴 Завершен'}
                            </div>
                        </div>
                    </div>
                    
                    <div style="background: var(--bg-secondary); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                        <div style="color: var(--warning-color); font-weight: 600; margin-bottom: 0.5rem;">
                            Прогресс: ${progress.toFixed(1)}%
                        </div>
                        <div style="background: var(--bg-primary); height: 8px; border-radius: 4px; overflow: hidden;">
                            <div style="background: var(--success-color); height: 100%; width: ${progress}%; transition: width 0.3s ease;"></div>
                        </div>
                        <div style="color: var(--text-secondary); font-size: 0.8rem; margin-top: 0.5rem;">
                            ${daysPassed} из ${plan.days} дней прошло
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div style="text-align: center; padding: 0.8rem; background: var(--bg-secondary); border-radius: 6px;">
                            <div style="color: var(--text-secondary); font-size: 0.8rem;">Заработано:</div>
                            <div style="color: var(--success-color); font-weight: 600;">$${earnedProfit.toFixed(2)}</div>
                        </div>
                        <div style="text-align: center; padding: 0.8rem; background: var(--bg-secondary); border-radius: 6px;">
                            <div style="color: var(--text-secondary); font-size: 0.8rem;">Осталось:</div>
                            <div style="color: var(--warning-color); font-weight: 600;">$${remainingProfit.toFixed(2)}</div>
                        </div>
                    </div>
                </div>
                
                <div style="background: var(--bg-primary); padding: 1.5rem; border-radius: 12px; margin-bottom: 1.5rem;">
                    <h4 style="color: var(--secondary-color); margin-bottom: 1rem;">📊 Финансовые показатели</h4>
                    <div style="display: flex; flex-direction: column; gap: 0.8rem;">
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: var(--text-secondary);">Ежедневный доход:</span>
                            <span style="color: var(--primary-color); font-weight: 600;">$${dailyProfit.toFixed(2)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: var(--text-secondary);">Общая прибыль:</span>
                            <span style="color: var(--success-color); font-weight: 600;">$${totalProfit.toFixed(2)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: var(--text-secondary);">Общий возврат:</span>
                            <span style="color: var(--warning-color); font-weight: 600;">$${(deposit.amount + totalProfit).toFixed(2)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: var(--text-secondary);">ROI:</span>
                            <span style="color: var(--gold-color); font-weight: 600;">${((totalProfit / deposit.amount) * 100).toFixed(1)}%</span>
                        </div>
                    </div>
                </div>
                
                <div style="background: var(--bg-primary); padding: 1.5rem; border-radius: 12px; margin-bottom: 1.5rem;">
                    <h4 style="color: var(--text-primary); margin-bottom: 1rem;">🔗 Информация о транзакции</h4>
                    <div style="display: flex; flex-direction: column; gap: 0.8rem;">
                        <div>
                            <div style="color: var(--text-secondary); font-size: 0.8rem;">Hash транзакции:</div>
                            <div style="font-family: monospace; font-size: 0.9rem; color: var(--secondary-color); word-break: break-all;">
                                ${txHash}
                            </div>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: var(--text-secondary);">Дата создания:</span>
                            <span style="color: var(--text-primary);">${deposit.timestamp.toLocaleDateString()}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: var(--text-secondary);">Дата завершения:</span>
                            <span style="color: var(--text-primary);">${deposit.endDate.toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
                
                <div style="display: flex; gap: 1rem; justify-content: center;">
                    <button onclick="window.CabinetDepositService.viewInBlockchain('${txHash}')" 
                            class="btn-secondary" style="padding: 0.8rem 1.5rem;">
                        🌐 Просмотр в BSCScan
                    </button>
                    <button onclick="window.CabinetDepositService.copyDepositInfo('${txHash}')" 
                            class="btn-outline" style="padding: 0.8rem 1.5rem;">
                        📋 Копировать данные
                    </button>
                </div>
            </div>
        `;
        
        this.showModal('Детали депозита', modalContent);
    },
    
    // MCP-MARKER:METHOD:VIEW_IN_BLOCKCHAIN - Просмотр в блокчейне
    viewInBlockchain(txHash) {
        const url = `https://bscscan.com/tx/${txHash}`;
        window.open(url, '_blank');
        
        if (window.GenesisTerminal) {
            window.GenesisTerminal.log(`🌐 Открыт BSCScan для транзакции: ${txHash.substring(0, 10)}...`, 'info');
        }
    },
    
    // MCP-MARKER:METHOD:COPY_DEPOSIT_INFO - Копирование информации о депозите
    copyDepositInfo(txHash) {
        const deposit = this.userDeposits.find(d => d.txHash === txHash);
        if (!deposit) return;
        
        const plan = window.GENESIS_CONFIG.depositPlans.find(p => p.id === deposit.planId);
        const info = `
GENESIS 1.1 - Информация о депозите

План: ${plan.name}
Инвестиция: $${deposit.amount.toFixed(2)} ${deposit.tokenType}
Доходность: ${plan.percentage}%
Срок: ${plan.days} дней
Транзакция: ${txHash}
Дата создания: ${deposit.timestamp.toLocaleDateString()}
Статус: ${deposit.status}

Создано в GENESIS 1.1 DeFi Platform
        `.trim();
        
        navigator.clipboard.writeText(info).then(() => {
            this.showNotification('📋 Скопировано', 'Информация о депозите скопирована в буфер обмена', 'success');
        }).catch(err => {
            console.error('Ошибка копирования:', err);
        });
    },
    
    // MCP-MARKER:METHOD:VIEW_PLAN_DETAILS - Просмотр деталей плана
    viewPlanDetails(planId) {
        const plan = window.GENESIS_CONFIG.depositPlans.find(p => p.id === planId);
        if (!plan) {
            alert('❌ План не найден');
            return;
        }
        
        const userDepositsForPlan = this.userDeposits.filter(d => d.planId === planId);
        const profit = (plan.usdtAmount * plan.percentage / 100) - plan.usdtAmount;
        const dailyProfit = profit / plan.days;
        
        const modalContent = `
            <div style="max-width: 600px; margin: 0 auto;">
                <h3 style="color: var(--primary-color); margin-bottom: 1.5rem; text-align: center;">
                    ${this.getPlanIcon(plan.name)} Детали плана: ${plan.name}
                </h3>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem;">
                    <div style="background: var(--bg-primary); padding: 1.5rem; border-radius: 12px;">
                        <h4 style="color: var(--secondary-color); margin-bottom: 1rem;">📊 Основные параметры</h4>
                        <div style="display: flex; flex-direction: column; gap: 0.8rem;">
                            <div style="display: flex; justify-content: space-between;">
                                <span style="color: var(--text-secondary);">Инвестиция:</span>
                                <span style="color: var(--text-primary); font-weight: 600;">$${plan.usdtAmount}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span style="color: var(--text-secondary);">Доходность:</span>
                                <span style="color: var(--success-color); font-weight: 600;">${plan.percentage}%</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span style="color: var(--text-secondary);">Срок:</span>
                                <span style="color: var(--warning-color); font-weight: 600;">${plan.days} дней</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span style="color: var(--text-secondary);">Валюты:</span>
                                <span style="color: var(--secondary-color); font-weight: 600;">${plan.currencies.join(', ')}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div style="background: var(--bg-primary); padding: 1.5rem; border-radius: 12px;">
                        <h4 style="color: var(--primary-color); margin-bottom: 1rem;">💰 Расчет прибыли</h4>
                        <div style="display: flex; flex-direction: column; gap: 0.8rem;">
                            <div style="display: flex; justify-content: space-between;">
                                <span style="color: var(--text-secondary);">Ежедневно:</span>
                                <span style="color: var(--primary-color); font-weight: 600;">$${dailyProfit.toFixed(2)}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span style="color: var(--text-secondary);">Общая прибыль:</span>
                                <span style="color: var(--success-color); font-weight: 600;">$${profit.toFixed(2)}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span style="color: var(--text-secondary);">Общий возврат:</span>
                                <span style="color: var(--gold-color); font-weight: 600;">$${(plan.usdtAmount + profit).toFixed(2)}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span style="color: var(--text-secondary);">ROI:</span>
                                <span style="color: var(--warning-color); font-weight: 600;">${((profit / plan.usdtAmount) * 100).toFixed(1)}%</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div style="background: var(--bg-primary); padding: 1.5rem; border-radius: 12px; margin-bottom: 1.5rem;">
                    <h4 style="color: var(--text-primary); margin-bottom: 1rem;">📝 Описание</h4>
