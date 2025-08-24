// modules/referrals/referrals.module.js
// Модуль реферальной программы GENESIS DeFi Platform

import ReferralsState from './referrals.state.js';
import ReferralsAPI from './referrals.api.js';

export default class ReferralsModule {
    constructor() {
        this.name = 'referrals';
        this.version = '1.0.0';
        this.dependencies = ['auth', 'platform-access'];
        
        this.state = null;
        this.api = null;
        this.container = null;
        this.context = null;
        this.subscriptions = [];
    }
    
    async init(context) {
        console.log('👥 Initializing Referrals Module...');
        
        this.context = context;
        this.container = context.container;
        
        try {
            // 1. Инициализация состояния
            this.state = new ReferralsState();
            this.state.load();
            
            // 2. Инициализация API
            const config = context.config || window.store.get('config');
            this.api = new ReferralsAPI(config);
            
            // 3. Загрузка шаблона
            await this.loadTemplate();
            
            // 4. Загрузка стилей
            await this.loadStyles();
            
            // 5. Инициализация обработчиков
            this.initEventHandlers();
            
            // 6. Подписка на события
            this.subscribeToEvents();
            
            // 7. Загрузка данных рефералов
            await this.loadReferralsData();
            
            console.log('✅ Referrals Module initialized successfully');
            
            return this;
            
        } catch (error) {
            console.error('❌ Failed to initialize Referrals Module:', error);
            throw error;
        }
    }
    
    async loadTemplate() {
        try {
            const response = await fetch('/modules/referrals/referrals.template.html');
            const html = await response.text();
            this.container.innerHTML = html;
        } catch (error) {
            console.error('Failed to load referrals template:', error);
            this.container.innerHTML = this.getFallbackTemplate();
        }
    }
    
    async loadStyles() {
        const existingLink = document.querySelector(`link[data-module="${this.name}"]`);
        if (existingLink) return;
        
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/modules/referrals/referrals.styles.css';
        link.dataset.module = this.name;
        document.head.appendChild(link);
    }
    
    initEventHandlers() {
        // Кнопка копирования реферальной ссылки
        const copyLinkBtn = this.container.querySelector('#copy-referral-link');
        if (copyLinkBtn) {
            copyLinkBtn.addEventListener('click', () => this.copyReferralLink());
        }
        
        // Кнопка генерации новой ссылки
        const generateLinkBtn = this.container.querySelector('#generate-new-link');
        if (generateLinkBtn) {
            generateLinkBtn.addEventListener('click', () => this.generateNewLink());
        }
        
        // Кнопка вывода реферальных бонусов
        const withdrawBtn = this.container.querySelector('#withdraw-referral-bonus');
        if (withdrawBtn) {
            withdrawBtn.addEventListener('click', () => this.withdrawReferralBonus());
        }
        
        // Поиск рефералов
        const searchInput = this.container.querySelector('#referral-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.searchReferrals(e.target.value));
        }
        
        // Фильтры рефералов
        const filterButtons = this.container.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.target.dataset.filter;
                this.filterReferrals(filter);
            });
        });
        
        // Социальные кнопки шаринга
        const shareButtons = this.container.querySelectorAll('.share-btn');
        shareButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const network = e.target.dataset.network;
                this.shareOnSocialNetwork(network);
            });
        });
    }
    
    async loadReferralsData() {
        try {
            const userAddress = window.store.get('user.address');
            if (!userAddress) return;
            
            // Загружаем данные о рефералах
            const referralsData = await this.api.getUserReferrals(userAddress);
            
            // Обновляем состояние
            this.state.update(referralsData);
            
            // Обновляем UI
            this.updateUI();
            
            // Генерируем реферальную ссылку если её нет
            if (!this.state.getReferralLink()) {
                await this.generateReferralLink();
            }
            
        } catch (error) {
            console.error('Error loading referrals data:', error);
        }
    }
    
    updateUI() {
        // Обновляем статистику
        this.updateStatistics();
        
        // Обновляем список рефералов
        this.updateReferralsList();
        
        // Обновляем дерево рефералов
        this.updateReferralTree();
        
        // Обновляем реферальную ссылку
        this.updateReferralLink();
    }
    
    updateStatistics() {
        const stats = this.state.getStatistics();
        
        // Общее количество рефералов
        const totalRefEl = this.container.querySelector('#total-referrals');
        if (totalRefEl) {
            totalRefEl.textContent = stats.totalReferrals;
        }
        
        // Активные рефералы
        const activeRefEl = this.container.querySelector('#active-referrals');
        if (activeRefEl) {
            activeRefEl.textContent = stats.activeReferrals;
        }
        
        // Общий доход от рефералов
        const totalIncomeEl = this.container.querySelector('#referral-income');
        if (totalIncomeEl) {
            totalIncomeEl.textContent = `${stats.totalIncome} PLEX`;
        }
        
        // Доступно к выводу
        const availableEl = this.container.querySelector('#available-withdrawal');
        if (availableEl) {
            availableEl.textContent = `${stats.availableWithdrawal} PLEX`;
        }
        
        // Уровни рефералов
        const levelsEl = this.container.querySelector('#referral-levels');
        if (levelsEl) {
            levelsEl.innerHTML = this.renderLevelStatistics(stats.levels);
        }
    }
    
    renderLevelStatistics(levels) {
        return Object.entries(levels).map(([level, count]) => `
            <div class="level-stat">
                <span class="level-label">Уровень ${level}:</span>
                <span class="level-count">${count}</span>
            </div>
        `).join('');
    }
    
    updateReferralsList() {
        const listContainer = this.container.querySelector('#referrals-list');
        if (!listContainer) return;
        
        const referrals = this.state.getReferrals();
        
        if (referrals.length === 0) {
            listContainer.innerHTML = `
                <div class="no-referrals">
                    <div class="no-referrals-icon">👥</div>
                    <div class="no-referrals-text">У вас пока нет рефералов</div>
                    <div class="no-referrals-hint">Поделитесь реферальной ссылкой с друзьями</div>
                </div>
            `;
            return;
        }
        
        listContainer.innerHTML = referrals.map(referral => this.renderReferralCard(referral)).join('');
        
        // Добавляем обработчики для карточек
        listContainer.querySelectorAll('.referral-card').forEach(card => {
            card.addEventListener('click', () => {
                const refId = card.dataset.referralId;
                this.showReferralDetails(refId);
            });
        });
    }
    
    renderReferralCard(referral) {
        const statusClass = referral.isActive ? 'active' : 'inactive';
        const statusText = referral.isActive ? 'Активен' : 'Неактивен';
        
        return `
            <div class="referral-card ${statusClass}" data-referral-id="${referral.id}">
                <div class="referral-avatar">
                    ${this.getAvatarIcon(referral.address)}
                </div>
                <div class="referral-info">
                    <div class="referral-address">${this.formatAddress(referral.address)}</div>
                    <div class="referral-meta">
                        <span class="referral-level">Уровень ${referral.level}</span>
                        <span class="referral-date">Присоединился: ${this.formatDate(referral.joinDate)}</span>
                    </div>
                </div>
                <div class="referral-stats">
                    <div class="stat-item">
                        <span class="stat-label">Депозиты:</span>
                        <span class="stat-value">${referral.deposits}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Доход:</span>
                        <span class="stat-value">${referral.income} PLEX</span>
                    </div>
                </div>
                <div class="referral-status">
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </div>
            </div>
        `;
    }
    
    updateReferralTree() {
        const treeContainer = this.container.querySelector('#referral-tree');
        if (!treeContainer) return;
        
        const treeData = this.state.getReferralTree();
        
        if (!treeData || treeData.length === 0) {
            treeContainer.innerHTML = `
                <div class="empty-tree">
                    <p>Дерево рефералов пусто</p>
                </div>
            `;
            return;
        }
        
        // Рендерим дерево рефералов
        treeContainer.innerHTML = this.renderTree(treeData);
    }
    
    renderTree(nodes, level = 1) {
        return `
            <ul class="tree-level level-${level}">
                ${nodes.map(node => `
                    <li class="tree-node">
                        <div class="node-content">
                            <div class="node-avatar">${this.getAvatarIcon(node.address)}</div>
                            <div class="node-info">
                                <div class="node-address">${this.formatAddress(node.address)}</div>
                                <div class="node-stats">
                                    <span class="node-deposits">${node.deposits} депозитов</span>
                                    <span class="node-income">+${node.income} PLEX</span>
                                </div>
                            </div>
                        </div>
                        ${node.children && node.children.length > 0 ? 
                            this.renderTree(node.children, level + 1) : ''
                        }
                    </li>
                `).join('')}
            </ul>
        `;
    }
    
    updateReferralLink() {
        const linkInput = this.container.querySelector('#referral-link-input');
        const qrContainer = this.container.querySelector('#referral-qr-code');
        
        const referralLink = this.state.getReferralLink();
        
        if (linkInput && referralLink) {
            linkInput.value = referralLink;
        }
        
        if (qrContainer && referralLink) {
            // Здесь должна быть генерация QR кода
            qrContainer.innerHTML = `
                <div class="qr-placeholder">
                    <p>QR код реферальной ссылки</p>
                </div>
            `;
        }
    }
    
    async generateReferralLink() {
        try {
            const userAddress = window.store.get('user.address');
            if (!userAddress) return;
            
            const result = await this.api.generateReferralLink(userAddress);
            
            if (result.success) {
                this.state.setReferralLink(result.link);
                this.updateReferralLink();
                this.showNotification('Реферальная ссылка сгенерирована', 'success');
            }
            
        } catch (error) {
            console.error('Error generating referral link:', error);
            this.showNotification('Ошибка генерации ссылки', 'error');
        }
    }
    
    async copyReferralLink() {
        const referralLink = this.state.getReferralLink();
        
        if (!referralLink) {
            this.showNotification('Сначала сгенерируйте реферальную ссылку', 'warning');
            return;
        }
        
        try {
            await navigator.clipboard.writeText(referralLink);
            
            // Обновляем текст кнопки
            const copyBtn = this.container.querySelector('#copy-referral-link');
            if (copyBtn) {
                const originalText = copyBtn.textContent;
                copyBtn.textContent = 'Скопировано!';
                copyBtn.classList.add('copied');
                
                setTimeout(() => {
                    copyBtn.textContent = originalText;
                    copyBtn.classList.remove('copied');
                }, 2000);
            }
            
            this.showNotification('Реферальная ссылка скопирована', 'success');
            
        } catch (error) {
            console.error('Error copying link:', error);
            this.showNotification('Не удалось скопировать ссылку', 'error');
        }
    }
    
    async generateNewLink() {
        const confirmed = confirm('Вы уверены? Старая ссылка перестанет работать.');
        
        if (!confirmed) return;
        
        await this.generateReferralLink();
    }
    
    async withdrawReferralBonus() {
        try {
            const available = this.state.getAvailableWithdrawal();
            
            if (available < 100) {
                this.showNotification('Минимальная сумма для вывода: 100 PLEX', 'warning');
                return;
            }
            
            const confirmed = confirm(`Вывести ${available} PLEX на ваш кошелек?`);
            if (!confirmed) return;
            
            const result = await this.api.withdrawReferralBonus(available);
            
            if (result.success) {
                this.state.resetAvailableWithdrawal();
                this.updateStatistics();
                this.showNotification(`Успешно выведено ${available} PLEX`, 'success');
                
                // Генерируем событие
                if (this.context.eventBus) {
                    this.context.eventBus.emit('referral:withdrawn', {
                        amount: available,
                        txHash: result.txHash
                    });
                }
            }
            
        } catch (error) {
            console.error('Error withdrawing bonus:', error);
            this.showNotification('Ошибка вывода бонуса', 'error');
        }
    }
    
    searchReferrals(query) {
        const referrals = this.state.getReferrals();
        const filtered = referrals.filter(ref => 
            ref.address.toLowerCase().includes(query.toLowerCase())
        );
        
        this.renderFilteredReferrals(filtered);
    }
    
    filterReferrals(filter) {
        const referrals = this.state.getReferrals();
        let filtered = referrals;
        
        switch(filter) {
            case 'active':
                filtered = referrals.filter(ref => ref.isActive);
                break;
            case 'inactive':
                filtered = referrals.filter(ref => !ref.isActive);
                break;
            case 'level1':
                filtered = referrals.filter(ref => ref.level === 1);
                break;
            case 'level2':
                filtered = referrals.filter(ref => ref.level === 2);
                break;
            case 'level3':
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
