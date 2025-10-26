                filtered = referrals.filter(ref => ref.level === 3);
                break;
            case 'top':
                filtered = referrals.sort((a, b) => b.income - a.income).slice(0, 10);
                break;
        }
        
        // Обновляем активную кнопку фильтра
        this.setActiveFilter(filter);
        
        // Отображаем отфильтрованные результаты
        this.renderFilteredReferrals(filtered);
    }
    
    setActiveFilter(filter) {
        const filterButtons = this.container.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            if (btn.dataset.filter === filter) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }
    
    renderFilteredReferrals(referrals) {
        const listContainer = this.container.querySelector('#referrals-list');
        if (!listContainer) return;
        
        if (referrals.length === 0) {
            listContainer.innerHTML = `
                <div class="no-results">
                    <p>Нет рефералов по выбранному фильтру</p>
                </div>
            `;
            return;
        }
        
        listContainer.innerHTML = referrals.map(referral => 
            this.renderReferralCard(referral)
        ).join('');
    }
    
    shareOnSocialNetwork(network) {
        const referralLink = this.state.getReferralLink();
        
        if (!referralLink) {
            this.showNotification('Сначала сгенерируйте реферальную ссылку', 'warning');
            return;
        }
        
        const text = 'Присоединяйтесь к GENESIS DeFi Platform!';
        let shareUrl = '';
        
        switch(network) {
            case 'telegram':
                shareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(text)}`;
                break;
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(text)}`;
                break;
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`;
                break;
            case 'whatsapp':
                shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + referralLink)}`;
                break;
        }
        
        if (shareUrl) {
            window.open(shareUrl, '_blank', 'width=600,height=400');
        }
    }
    
    showReferralDetails(referralId) {
        const referral = this.state.getReferralById(referralId);
        
        if (!referral) return;
        
        // Здесь можно показать модальное окно с деталями реферала
        console.log('Showing details for referral:', referral);
    }
    
    formatAddress(address) {
        if (!address) return '';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }
    
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }
    
    getAvatarIcon(address) {
        // Генерируем иконку на основе адреса
        const icons = ['👤', '👨', '👩', '🧑', '👦', '👧'];
        const index = parseInt(address.slice(-1), 16) % icons.length;
        return icons[index];
    }
    
    showNotification(message, type = 'info') {
        if (this.context.eventBus) {
            this.context.eventBus.emit('notification:show', {
                type: type,
                message: message,
                duration: 3000
            });
        }
    }
    
    subscribeToEvents() {
        if (!this.context.eventBus) return;
        
        // Подписка на создание депозита реферала
        this.subscriptions.push(
            this.context.eventBus.on('referral:deposit:created', (data) => {
                this.handleReferralDeposit(data);
            })
        );
        
        // Подписка на регистрацию нового реферала
        this.subscriptions.push(
            this.context.eventBus.on('referral:registered', (data) => {
                this.handleNewReferral(data);
            })
        );
    }
    
    handleReferralDeposit(data) {
        // Обновляем статистику когда реферал создает депозит
        this.state.updateReferralStats(data.referralId, {
            deposits: data.deposits,
            income: data.income
        });
        
        this.updateUI();
        
        // Показываем уведомление
        this.showNotification(`Ваш реферал создал депозит! +${data.bonus} PLEX`, 'success');
    }
    
    handleNewReferral(data) {
        // Добавляем нового реферала
        this.state.addReferral(data.referral);
        
        this.updateUI();
        
        // Показываем уведомление
        this.showNotification('У вас новый реферал!', 'success');
    }
    
    getFallbackTemplate() {
        return `
            <div class="referrals-module">
                <div class="module-header">
                    <h2>👥 Реферальная программа</h2>
                    <div class="header-stats">
                        <div class="stat-item">
                            <span class="stat-label">Всего рефералов:</span>
                            <span class="stat-value" id="total-referrals">0</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Доход:</span>
                            <span class="stat-value" id="referral-income">0 PLEX</span>
                        </div>
                    </div>
                </div>
                
                <div class="referral-link-section">
                    <h3>Ваша реферальная ссылка</h3>
                    <div class="link-container">
                        <input type="text" id="referral-link-input" readonly placeholder="Генерация ссылки...">
                        <button class="btn btn-primary" id="copy-referral-link">Копировать</button>
                    </div>
                    <div id="referral-qr-code" class="qr-code"></div>
                </div>
                
                <div class="referrals-list-section">
                    <h3>Ваши рефералы</h3>
                    <div id="referrals-list" class="referrals-list">
                        <div class="no-referrals">У вас пока нет рефералов</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    destroy() {
        console.log('🧹 Destroying Referrals Module...');
        
        // Отписка от событий
        this.subscriptions.forEach(unsub => {
            if (typeof unsub === 'function') unsub();
        });
        
        // Удаление стилей
        const link = document.querySelector(`link[data-module="${this.name}"]`);
        if (link) link.remove();
        
        // Очистка контейнера
        if (this.container) {
            this.container.innerHTML = '';
        }
        
        // Сохранение состояния
        if (this.state) {
            this.state.save();
        }
        
        console.log('✅ Referrals Module destroyed');
    }
}
