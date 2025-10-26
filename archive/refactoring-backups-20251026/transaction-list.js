// modules/transactions/components/transaction-list.js
// MCP-MARKER:COMPONENT:TRANSACTIONS:LIST - Компонент списка транзакций

export default class TransactionList {
    constructor(container, state) {
        this.container = container;
        this.state = state;
        this.currentPage = 1;
        this.itemsPerPage = 20;
    }
    
    // MCP-MARKER:METHOD:TX_LIST:RENDER - Отрисовка списка
    render(transactions) {
        if (!transactions || transactions.length === 0) {
            this.showEmptyState();
            return;
        }
        
        // Пагинация
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageTransactions = transactions.slice(startIndex, endIndex);
        
        // Генерация HTML
        const html = `
            <div class="transaction-items">
                ${pageTransactions.map(tx => this.renderTransaction(tx)).join('')}
            </div>
            ${this.renderPagination(transactions.length)}
        `;
        
        this.container.innerHTML = html;
        this.attachEventHandlers();
    }
    
    // MCP-MARKER:METHOD:TX_LIST:RENDER_TX - Отрисовка одной транзакции
    renderTransaction(tx) {
        const date = new Date(tx.timestamp);
        const dateStr = date.toLocaleDateString('ru-RU');
        const timeStr = date.toLocaleTimeString('ru-RU', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        const typeClass = this.getTypeClass(tx.type);
        const statusClass = this.getStatusClass(tx.status);
        const amountClass = tx.type === 'withdrawal' ? 'amount-positive' : 'amount-negative';
        
        return `
            <div class="transaction-item ${typeClass}" data-hash="${tx.hash}">
                <div class="tx-icon">
                    ${this.getTypeIcon(tx.type)}
                </div>
                
                <div class="tx-info">
                    <div class="tx-type">${tx.category}</div>
                    <div class="tx-hash">${this.truncateHash(tx.hash)}</div>
                    <div class="tx-datetime">
                        <span class="tx-date">${dateStr}</span>
                        <span class="tx-time">${timeStr}</span>
                    </div>
                </div>
                
                <div class="tx-amount ${amountClass}">
                    <div class="amount-value">
                        ${tx.type === 'withdrawal' ? '+' : '-'}$${tx.amount.toFixed(2)}
                    </div>
                    <div class="amount-token">${tx.token}</div>
                </div>
                
                <div class="tx-status">
                    <span class="status-badge ${statusClass}">
                        ${this.getStatusText(tx.status)}
                    </span>
                </div>
                
                <div class="tx-actions">
                    <button class="btn-view-details" data-hash="${tx.hash}" title="Детали">
                        <i class="icon-info"></i>
                    </button>
                    <a href="https://bscscan.com/tx/${tx.hash}" 
                       target="_blank" 
                       class="btn-view-bsc" 
                       title="Открыть в BSCScan">
                        <i class="icon-external"></i>
                    </a>
                </div>
            </div>
        `;
    }
    
    // MCP-MARKER:METHOD:TX_LIST:RENDER_PAGINATION - Отрисовка пагинации
    renderPagination(totalItems) {
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);
        
        if (totalPages <= 1) return '';
        
        let pages = [];
        
        // Кнопка "Предыдущая"
        pages.push(`
            <button class="page-btn ${this.currentPage === 1 ? 'disabled' : ''}" 
                    data-page="${this.currentPage - 1}"
                    ${this.currentPage === 1 ? 'disabled' : ''}>
                <i class="icon-chevron-left"></i>
            </button>
        `);
        
        // Номера страниц
        for (let i = 1; i <= Math.min(totalPages, 5); i++) {
            pages.push(`
                <button class="page-btn ${i === this.currentPage ? 'active' : ''}" 
                        data-page="${i}">
                    ${i}
                </button>
            `);
        }
        
        if (totalPages > 5) {
            pages.push('<span class="page-dots">...</span>');
            pages.push(`
                <button class="page-btn ${totalPages === this.currentPage ? 'active' : ''}" 
                        data-page="${totalPages}">
                    ${totalPages}
                </button>
            `);
        }
        
        // Кнопка "Следующая"
        pages.push(`
            <button class="page-btn ${this.currentPage === totalPages ? 'disabled' : ''}" 
                    data-page="${this.currentPage + 1}"
                    ${this.currentPage === totalPages ? 'disabled' : ''}>
                <i class="icon-chevron-right"></i>
            </button>
        `);
        
        return `
            <div class="transaction-pagination">
                <div class="pagination-info">
                    Показано ${Math.min(totalItems, this.itemsPerPage)} из ${totalItems} транзакций
                </div>
                <div class="pagination-controls">
                    ${pages.join('')}
                </div>
            </div>
        `;
    }
    
    // MCP-MARKER:METHOD:TX_LIST:ATTACH_HANDLERS - Привязка обработчиков
    attachEventHandlers() {
        // Обработчики для деталей
        const detailButtons = this.container.querySelectorAll('.btn-view-details');
        detailButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const hash = e.currentTarget.dataset.hash;
                this.showTransactionDetails(hash);
            });
        });
        
        // Обработчики для пагинации
        const pageButtons = this.container.querySelectorAll('.page-btn:not(.disabled)');
        pageButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = parseInt(e.currentTarget.dataset.page);
                this.goToPage(page);
            });
        });
    }
    
    // MCP-MARKER:METHOD:TX_LIST:SHOW_DETAILS - Показать детали транзакции
    showTransactionDetails(hash) {
        // Найти транзакцию
        const allTx = this.state.getAllTransactions();
        const tx = allTx.find(t => t.hash === hash);
        
        if (!tx) return;
        
        // Показать модальное окно
        const modal = document.getElementById('transaction-details-modal');
        const detailsContainer = document.getElementById('transaction-details');
        
        if (modal && detailsContainer) {
            detailsContainer.innerHTML = this.renderTransactionDetails(tx);
            modal.style.display = 'block';
            
            // Закрытие модального окна
            const closeBtn = modal.querySelector('.modal-close');
            const overlay = modal.querySelector('.modal-overlay');
            
            const closeModal = () => {
                modal.style.display = 'none';
            };
            
            closeBtn.addEventListener('click', closeModal);
            overlay.addEventListener('click', closeModal);
        }
    }
    
    // MCP-MARKER:METHOD:TX_LIST:RENDER_DETAILS - Отрисовка деталей транзакции
    renderTransactionDetails(tx) {
        const date = new Date(tx.timestamp);
        
        return `
            <div class="tx-details">
                <div class="detail-row">
                    <span class="detail-label">Тип операции:</span>
                    <span class="detail-value">${tx.category}</span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">Сумма:</span>
                    <span class="detail-value">
                        $${tx.amount.toFixed(2)} ${tx.token}
                    </span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">Хеш транзакции:</span>
                    <span class="detail-value hash">
                        ${tx.hash}
                        <button class="btn-copy" data-copy="${tx.hash}">
                            <i class="icon-copy"></i>
                        </button>
                    </span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">От кого:</span>
                    <span class="detail-value">
                        ${this.truncateAddress(tx.from)}
                        <button class="btn-copy" data-copy="${tx.from}">
                            <i class="icon-copy"></i>
                        </button>
                    </span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">Кому:</span>
                    <span class="detail-value">
                        ${this.truncateAddress(tx.to)}
                        <button class="btn-copy" data-copy="${tx.to}">
                            <i class="icon-copy"></i>
                        </button>
                    </span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">Дата и время:</span>
                    <span class="detail-value">
                        ${date.toLocaleDateString('ru-RU')} 
                        ${date.toLocaleTimeString('ru-RU')}
                    </span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">Блок:</span>
                    <span class="detail-value">${tx.blockNumber}</span>
                </div>
                
                <div class="detail-row">
                    <span class="detail-label">Статус:</span>
                    <span class="detail-value">
                        <span class="status-badge ${this.getStatusClass(tx.status)}">
                            ${this.getStatusText(tx.status)}
                        </span>
                    </span>
                </div>
                
                ${tx.gasUsed ? `
                    <div class="detail-row">
                        <span class="detail-label">Комиссия:</span>
                        <span class="detail-value">
                            ${(tx.gasUsed * tx.gasPrice / 1e18).toFixed(6)} BNB
                        </span>
                    </div>
                ` : ''}
                
                <div class="detail-actions">
                    <a href="https://bscscan.com/tx/${tx.hash}" 
                       target="_blank" 
                       class="btn btn-primary">
                        Открыть в BSCScan
                        <i class="icon-external"></i>
                    </a>
                </div>
            </div>
        `;
    }
    
    // MCP-MARKER:METHOD:TX_LIST:GO_TO_PAGE - Переход на страницу
    goToPage(page) {
        this.currentPage = page;
        const transactions = this.state.getFilteredTransactions();
        this.render(transactions);
    }
    
    // MCP-MARKER:METHOD:TX_LIST:SHOW_EMPTY - Показать пустое состояние
    showEmptyState() {
        this.container.innerHTML = `
            <div class="empty-state">
                <i class="icon-empty"></i>
                <h3>Транзакций не найдено</h3>
                <p>У вас пока нет транзакций или они не соответствуют выбранным фильтрам</p>
            </div>
        `;
    }
    
    // MCP-MARKER:METHOD:TX_LIST:GET_TYPE_CLASS - Получить класс типа
    getTypeClass(type) {
        const classes = {
            'deposit': 'tx-deposit',
            'withdrawal': 'tx-withdrawal',
            'platform': 'tx-platform',
            'bnb': 'tx-bnb'
        };
        return classes[type] || 'tx-default';
    }
    
    // MCP-MARKER:METHOD:TX_LIST:GET_TYPE_ICON - Получить иконку типа
    getTypeIcon(type) {
        const icons = {
            'deposit': '<i class="icon-arrow-down"></i>',
            'withdrawal': '<i class="icon-arrow-up"></i>',
            'platform': '<i class="icon-platform"></i>',
            'bnb': '<i class="icon-bnb"></i>'
        };
        return icons[type] || '<i class="icon-transaction"></i>';
    }
    
    // MCP-MARKER:METHOD:TX_LIST:GET_STATUS_CLASS - Получить класс статуса
    getStatusClass(status) {
        const classes = {
            'pending': 'status-pending',
            'confirmed': 'status-confirmed',
            'completed': 'status-completed',
            'success': 'status-success',
            'failed': 'status-failed'
        };
        return classes[status] || 'status-unknown';
    }
    
    // MCP-MARKER:METHOD:TX_LIST:GET_STATUS_TEXT - Получить текст статуса
    getStatusText(status) {
        const texts = {
            'pending': 'Ожидание',
            'confirmed': 'Подтверждена',
            'completed': 'Выполнена',
            'success': 'Успешно',
            'failed': 'Ошибка'
        };
        return texts[status] || status;
    }
    
    // MCP-MARKER:METHOD:TX_LIST:TRUNCATE_HASH - Сократить хеш
    truncateHash(hash) {
        if (!hash) return '';
        return `${hash.substring(0, 10)}...${hash.substring(hash.length - 8)}`;
    }
    
    // MCP-MARKER:METHOD:TX_LIST:TRUNCATE_ADDRESS - Сократить адрес
    truncateAddress(address) {
        if (!address) return '';
        return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    }
    
    // MCP-MARKER:METHOD:TX_LIST:DESTROY - Очистка компонента
    destroy() {
        this.container.innerHTML = '';
    }
}

// Дополнительные стили для компонента списка
const styles = `
<style>
.transaction-items {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.transaction-item {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 15px;
    background: var(--bg-secondary, #f8f8f8);
    border-radius: 10px;
    transition: all 0.3s ease;
    border: 2px solid transparent;
}

.transaction-item:hover {
    background: var(--bg-hover, #f0f0f0);
    transform: translateX(5px);
    border-color: var(--primary-color, #667eea);
}

.tx-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    color: white;
}

.tx-deposit .tx-icon {
    background: linear-gradient(135deg, #667eea, #764ba2);
}

.tx-withdrawal .tx-icon {
    background: linear-gradient(135deg, #4facfe, #00f2fe);
}

.tx-platform .tx-icon {
    background: linear-gradient(135deg, #f093fb, #f5576c);
}

.tx-info {
    flex: 1;
}

.tx-type {
    font-weight: 600;
    color: var(--text-primary, #333);
    margin-bottom: 4px;
}

.tx-hash {
    font-size: 12px;
    color: var(--text-secondary, #666);
    font-family: monospace;
}

.tx-datetime {
    display: flex;
    gap: 10px;
    font-size: 12px;
    color: var(--text-secondary, #666);
    margin-top: 4px;
}

.tx-amount {
    text-align: right;
}

.amount-value {
    font-size: 18px;
    font-weight: 600;
}

.amount-positive {
    color: #22c55e;
}

.amount-negative {
    color: #ef4444;
}

.amount-token {
    font-size: 12px;
    color: var(--text-secondary, #666);
}

.tx-status {
    width: 100px;
    text-align: center;
}

.status-badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
}

.status-pending {
    background: #fef3c7;
    color: #92400e;
}

.status-confirmed,
.status-completed,
.status-success {
    background: #d1fae5;
    color: #065f46;
}

.status-failed {
    background: #fee2e2;
    color: #991b1b;
}

.tx-actions {
    display: flex;
    gap: 8px;
}

.btn-view-details,
.btn-view-bsc {
    width: 32px;
    height: 32px;
    border: none;
    background: var(--primary-color, #667eea);
    color: white;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn-view-details:hover,
.btn-view-bsc:hover {
    background: var(--primary-hover, #5a67d8);
    transform: scale(1.1);
}

/* Пагинация */
.transaction-pagination {
    margin-top: 30px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.pagination-info {
    color: var(--text-secondary, #666);
    font-size: 14px;
}

.pagination-controls {
    display: flex;
    gap: 8px;
}

.page-btn {
    min-width: 36px;
    height: 36px;
    border: 2px solid var(--border-color, #e0e0e0);
    background: white;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.3s ease;
}

.page-btn:hover:not(.disabled) {
    border-color: var(--primary-color, #667eea);
    background: var(--bg-hover, #f0f0f0);
}

.page-btn.active {
    background: var(--primary-color, #667eea);
    color: white;
    border-color: var(--primary-color, #667eea);
}

.page-btn.disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.page-dots {
    padding: 0 8px;
    color: var(--text-secondary, #666);
}

/* Детали транзакции */
.tx-details {
    padding: 10px;
}

.detail-row {
    display: flex;
    justify-content: space-between;
    padding: 12px 0;
    border-bottom: 1px solid var(--border-color, #e0e0e0);
}

.detail-row:last-child {
    border-bottom: none;
}

.detail-label {
    font-weight: 500;
    color: var(--text-secondary, #666);
}

.detail-value {
    text-align: right;
    color: var(--text-primary, #333);
    font-weight: 500;
}

.detail-value.hash {
    font-family: monospace;
    font-size: 12px;
    word-break: break-all;
}

.btn-copy {
    margin-left: 8px;
    padding: 4px 8px;
    background: var(--primary-color, #667eea);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
}

.detail-actions {
    margin-top: 20px;
    text-align: center;
}

.btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    background: var(--primary-color, #667eea);
    color: white;
    text-decoration: none;
    border-radius: 8px;
    font-weight: 500;
    transition: all 0.3s ease;
}

.btn-primary:hover {
    background: var(--primary-hover, #5a67d8);
    transform: translateY(-2px);
}

/* Адаптивность */
@media (max-width: 768px) {
    .transaction-item {
        flex-direction: column;
        align-items: flex-start;
    }
    
    .tx-actions {
        width: 100%;
        justify-content: flex-end;
        margin-top: 10px;
    }
    
    .transaction-pagination {
        flex-direction: column;
        gap: 15px;
    }
}
</style>
`;

// Добавляем стили в документ
if (!document.querySelector('#transaction-list-styles')) {
    const styleElement = document.createElement('div');
    styleElement.id = 'transaction-list-styles';
    styleElement.innerHTML = styles;
    document.head.appendChild(styleElement.firstElementChild);
}
