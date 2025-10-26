                    color: var(--text-secondary);
                }
                
                .info-card li {
                    padding: 0.25rem 0;
                }
                
                .empty-state {
                    text-align: center;
                    padding: 3rem;
                    color: var(--text-secondary);
                }
                
                .empty-icon {
                    font-size: 3rem;
                    margin-bottom: 1rem;
                    opacity: 0.5;
                }
                
                .text-secondary {
                    color: var(--text-secondary);
                }
                
                .btn-full {
                    width: 100%;
                }
                
                @media (max-width: 768px) {
                    .mining-stats-grid {
                        grid-template-columns: 1fr 1fr;
                    }
                    
                    .plans-grid {
                        grid-template-columns: 1fr;
                    }
                    
                    .info-grid {
                        grid-template-columns: 1fr;
                    }
                    
                    .contract-item {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 1rem;
                    }
                    
                    .contract-details {
                        flex-direction: column;
                        gap: 0.5rem;
                    }
                }
            </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', styles);
    }
    
    initMiningData() {
        // Загружаем данные о майнинге
        this.rentedPower = parseFloat(localStorage.getItem('genesis_mining_power') || '0');
        this.miningStats = JSON.parse(localStorage.getItem('genesis_mining_stats') || '{}');
        
        // Обновляем статистику
        this.calculateMiningStats();
    }
    
    initEventHandlers() {
        // Обработчики для кнопок аренды
        const rentButtons = this.container?.querySelectorAll('[data-action="rent"]');
        rentButtons?.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const plan = e.target.dataset.plan;
                this.rentPlan(plan);
            });
        });
    }
    
    calculateMiningStats() {
        // Расчет статистики майнинга
        const contracts = JSON.parse(localStorage.getItem('genesis_mining_contracts') || '[]');
        
        let totalHashrate = 0;
        let dailyIncome = 0;
        let activeContracts = 0;
        
        contracts.forEach(contract => {
            if (this.isContractActive(contract)) {
                totalHashrate += contract.hashrate;
                dailyIncome += contract.dailyIncome;
                activeContracts++;
            }
        });
        
        // ROI расчет
        const totalInvested = contracts.reduce((sum, c) => sum + c.price, 0);
        const totalEarned = contracts.reduce((sum, c) => sum + (c.earned || 0), 0);
        const roi = totalInvested > 0 ? ((totalEarned / totalInvested) * 100).toFixed(1) : 0;
        
        this.miningStats = {
            totalHashrate,
            dailyIncome,
            activeContracts,
            roi
        };
        
        // Сохраняем
        localStorage.setItem('genesis_mining_stats', JSON.stringify(this.miningStats));
    }
    
    isContractActive(contract) {
        const now = new Date();
        const endDate = new Date(contract.endDate);
        return now < endDate;
    }
    
    updateDisplay() {
        if (!this.container) return;
        
        // Обновляем статистику
        const hashrateEl = this.container.querySelector('#total-hashrate');
        const incomeEl = this.container.querySelector('#daily-income');
        const contractsEl = this.container.querySelector('#active-contracts');
        const roiEl = this.container.querySelector('#roi-percentage');
        
        if (hashrateEl) hashrateEl.textContent = `${this.miningStats.totalHashrate || 0} TH/s`;
        if (incomeEl) incomeEl.textContent = `${this.miningStats.dailyIncome || 0} USDT`;
        if (contractsEl) contractsEl.textContent = this.miningStats.activeContracts || 0;
        if (roiEl) roiEl.textContent = `${this.miningStats.roi || 0}%`;
        
        // Обновляем список контрактов
        this.updateContractsList();
    }
    
    updateContractsList() {
        const listEl = this.container?.querySelector('#contracts-list');
        if (!listEl) return;
        
        const contracts = JSON.parse(localStorage.getItem('genesis_mining_contracts') || '[]');
        const activeContracts = contracts.filter(c => this.isContractActive(c));
        
        if (activeContracts.length === 0) {
            listEl.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📭</div>
                    <p>У вас пока нет активных контрактов</p>
                    <p class="text-secondary">Арендуйте мощности для начала майнинга</p>
                </div>
            `;
            return;
        }
        
        listEl.innerHTML = activeContracts.map(contract => `
            <div class="contract-item">
                <div class="contract-info">
                    <h5>${contract.name}</h5>
                    <div class="contract-details">
                        <span>⚡ ${contract.hashrate} TH/s</span>
                        <span>📅 До ${new Date(contract.endDate).toLocaleDateString()}</span>
                        <span>💰 ${contract.dailyIncome} USDT/день</span>
                    </div>
                </div>
                <div class="contract-status">
                    <div class="status-active">✅ Активен</div>
                    <div class="contract-earnings">+${contract.earned || 0} USDT</div>
                </div>
            </div>
        `).join('');
    }
    
    rentPlan(planId) {
        // Логика аренды плана
        const plans = {
            starter: { name: 'Стартовый', hashrate: 10, days: 30, price: 30, dailyIncome: 1.5 },
            advanced: { name: 'Продвинутый', hashrate: 50, days: 60, price: 120, dailyIncome: 8 },
            professional: { name: 'Профессиональный', hashrate: 200, days: 90, price: 400, dailyIncome: 35 }
        };
        
        const plan = plans[planId];
        if (!plan) return;
        
        // Проверка баланса (в реальной версии)
        // ...
        
        // Создаем контракт
        const contract = {
            id: Date.now(),
            name: plan.name,
            hashrate: plan.hashrate,
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + plan.days * 24 * 60 * 60 * 1000).toISOString(),
            price: plan.price,
            dailyIncome: plan.dailyIncome,
            earned: 0
        };
        
        // Сохраняем контракт
        const contracts = JSON.parse(localStorage.getItem('genesis_mining_contracts') || '[]');
        contracts.push(contract);
        localStorage.setItem('genesis_mining_contracts', JSON.stringify(contracts));
        
        // Обновляем статистику
        this.calculateMiningStats();
        this.updateDisplay();
        
        // Уведомление
        if (this.context?.eventBus) {
            this.context.eventBus.emit('notification:show', {
                type: 'success',
                title: 'Успешно',
                message: `Контракт "${plan.name}" активирован!`
            });
        }
    }
    
    destroy() {
        console.log('🧹 Destroying Mining Rent Module...');
        
        const styles = document.querySelector(`style[data-module="${this.name}"]`);
        if (styles) styles.remove();
        
        if (this.container) {
            this.container.innerHTML = '';
        }
        
        console.log('✅ Mining Rent Module destroyed');
    }
}
