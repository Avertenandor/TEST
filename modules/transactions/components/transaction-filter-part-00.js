// modules/transactions/components/transaction-filter.js
// MCP-MARKER:COMPONENT:TRANSACTIONS:FILTER - Компонент фильтров транзакций

export default class TransactionFilter {
    constructor(container) {
        this.container = container;
        this.filters = {
            dateFrom: null,
            dateTo: null,
            token: 'all',
            status: 'all',
            minAmount: null,
            maxAmount: null
        };
        this.onFilterChange = null;
        this.isExpanded = false;
        
        this.init();
    }
    
    // MCP-MARKER:METHOD:TX_FILTER:INIT - Инициализация
    init() {
        this.render();
        this.attachEventHandlers();
    }
    
    // MCP-MARKER:METHOD:TX_FILTER:RENDER - Отрисовка фильтров
    render() {
        const today = new Date().toISOString().split('T')[0];
        const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
        
        this.container.innerHTML = `
            <div class="filter-header">
                <h3>Расширенные фильтры</h3>
                <button class="filter-toggle" id="filter-toggle">
                    <i class="icon-chevron-down"></i>
                </button>
            </div>
            
            <div class="filter-content ${this.isExpanded ? 'expanded' : ''}" id="filter-content">
                <div class="filter-grid">
                    <!-- Период -->
                    <div class="filter-group">
                        <label>Период</label>
                        <div class="date-range">
                            <input 
                                type="date" 
                                id="filter-date-from" 
                                class="filter-input"
                                value="${weekAgo}"
                                max="${today}"
                            />
                            <span class="date-separator">—</span>
                            <input 
                                type="date" 
                                id="filter-date-to" 
                                class="filter-input"
                                value="${today}"
                                max="${today}"
                            />
                        </div>
                    </div>
                    
                    <!-- Быстрые периоды -->
                    <div class="filter-group">
                        <label>Быстрый выбор</label>
                        <div class="quick-periods">
                            <button class="period-btn" data-period="today">Сегодня</button>
                            <button class="period-btn" data-period="week">Неделя</button>
                            <button class="period-btn" data-period="month">Месяц</button>
                            <button class="period-btn" data-period="all">Все время</button>
                        </div>
                    </div>
                    
                    <!-- Токен -->
                    <div class="filter-group">
                        <label for="filter-token">Токен</label>
                        <select id="filter-token" class="filter-select">
                            <option value="all">Все токены</option>
                            <option value="USDT">USDT</option>
                            <option value="PLEX">PLEX</option>
                            <option value="BNB">BNB</option>
                        </select>
                    </div>
                    
                    <!-- Статус -->
                    <div class="filter-group">
                        <label for="filter-status">Статус</label>
                        <select id="filter-status" class="filter-select">
                            <option value="all">Все статусы</option>
                            <option value="pending">Ожидание</option>
                            <option value="confirmed">Подтверждена</option>
                            <option value="completed">Выполнена</option>
                            <option value="failed">Ошибка</option>
                        </select>
                    </div>
                    
                    <!-- Диапазон сумм -->
                    <div class="filter-group">
                        <label>Сумма ($)</label>
                        <div class="amount-range">
                            <input 
                                type="number" 
                                id="filter-min-amount" 
                                class="filter-input"
                                placeholder="От"
                                min="0"
                                step="0.01"
                            />
                            <span class="amount-separator">—</span>
                            <input 
                                type="number" 
                                id="filter-max-amount" 
                                class="filter-input"
                                placeholder="До"
                                min="0"
                                step="0.01"
                            />
                        </div>
                    </div>
                </div>
                
                <div class="filter-actions">
                    <button class="btn-apply-filters">
                        <i class="icon-check"></i>
                        Применить
                    </button>
                    <button class="btn-reset-filters">
                        <i class="icon-reset"></i>
                        Сбросить
                    </button>
                </div>
            </div>
        `;
    }
    
    // MCP-MARKER:METHOD:TX_FILTER:ATTACH_HANDLERS - Привязка обработчиков
    attachEventHandlers() {
        // Переключение видимости
        const toggleBtn = this.container.querySelector('#filter-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggleFilters());
        }
        
        // Быстрые периоды
        const periodButtons = this.container.querySelectorAll('.period-btn');
        periodButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const period = e.target.dataset.period;
                this.setQuickPeriod(period);
            });
        });
        
        // Применить фильтры
        const applyBtn = this.container.querySelector('.btn-apply-filters');
        if (applyBtn) {
            applyBtn.addEventListener('click', () => this.applyFilters());
        }
        
        // Сбросить фильтры
        const resetBtn = this.container.querySelector('.btn-reset-filters');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetFilters());
        }
        
        // Enter в полях ввода
        const inputs = this.container.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.applyFilters();
                }
            });
        });
    }
    
    // MCP-MARKER:METHOD:TX_FILTER:TOGGLE - Переключение видимости
    toggleFilters() {
        this.isExpanded = !this.isExpanded;
        
        const content = this.container.querySelector('#filter-content');
        const icon = this.container.querySelector('#filter-toggle i');
        
        if (content) {
            content.classList.toggle('expanded', this.isExpanded);
        }
        
        if (icon) {
            icon.className = this.isExpanded ? 'icon-chevron-up' : 'icon-chevron-down';
        }
    }
    
    // MCP-MARKER:METHOD:TX_FILTER:SET_PERIOD - Установка быстрого периода
    setQuickPeriod(period) {
        const today = new Date();
        const dateFrom = this.container.querySelector('#filter-date-from');
        const dateTo = this.container.querySelector('#filter-date-to');
        
        if (!dateFrom || !dateTo) return;
        
        dateTo.value = today.toISOString().split('T')[0];
        
        switch (period) {
            case 'today':
                dateFrom.value = today.toISOString().split('T')[0];
                break;
                
            case 'week':
                const weekAgo = new Date(today.getTime() - 7 * 86400000);
                dateFrom.value = weekAgo.toISOString().split('T')[0];
                break;
                
            case 'month':
                const monthAgo = new Date(today.getTime() - 30 * 86400000);
                dateFrom.value = monthAgo.toISOString().split('T')[0];
                break;
                
            case 'all':
                dateFrom.value = '';
                dateTo.value = '';
                break;
        }
        
        // Подсветка активной кнопки
        const buttons = this.container.querySelectorAll('.period-btn');
        buttons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.period === period);
        });
    }
    
    // MCP-MARKER:METHOD:TX_FILTER:APPLY - Применение фильтров
    applyFilters() {
        // Собираем значения
        this.filters.dateFrom = this.container.querySelector('#filter-date-from')?.value || null;
        this.filters.dateTo = this.container.querySelector('#filter-date-to')?.value || null;
        this.filters.token = this.container.querySelector('#filter-token')?.value || 'all';
        this.filters.status = this.container.querySelector('#filter-status')?.value || 'all';
        
        const minAmount = this.container.querySelector('#filter-min-amount')?.value;
        const maxAmount = this.container.querySelector('#filter-max-amount')?.value;
        
        this.filters.minAmount = minAmount ? parseFloat(minAmount) : null;
        this.filters.maxAmount = maxAmount ? parseFloat(maxAmount) : null;
        
        // Вызываем колбэк
        if (this.onFilterChange) {
            this.onFilterChange(this.filters);
        }
        
        // Показываем индикатор активных фильтров
        this.updateFilterIndicator();
    }
    
    // MCP-MARKER:METHOD:TX_FILTER:RESET - Сброс фильтров
    resetFilters() {
        // Сбрасываем значения в UI
        const today = new Date().toISOString().split('T')[0];
        const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
        
        const dateFrom = this.container.querySelector('#filter-date-from');
        const dateTo = this.container.querySelector('#filter-date-to');
        const token = this.container.querySelector('#filter-token');
        const status = this.container.querySelector('#filter-status');
        const minAmount = this.container.querySelector('#filter-min-amount');
        const maxAmount = this.container.querySelector('#filter-max-amount');
        
        if (dateFrom) dateFrom.value = weekAgo;
        if (dateTo) dateTo.value = today;
        if (token) token.value = 'all';
        if (status) status.value = 'all';
        if (minAmount) minAmount.value = '';
        if (maxAmount) maxAmount.value = '';
        
        // Сбрасываем внутренние фильтры
        this.filters = {
            dateFrom: null,
            dateTo: null,
            token: 'all',
            status: 'all',
            minAmount: null,
            maxAmount: null
        };
        
        // Убираем подсветку с кнопок периодов
        const buttons = this.container.querySelectorAll('.period-btn');
        buttons.forEach(btn => btn.classList.remove('active'));
        
        // Вызываем колбэк
        if (this.onFilterChange) {
            this.onFilterChange(this.filters);
        }
        
        // Обновляем индикатор
        this.updateFilterIndicator();
    }
    
    // MCP-MARKER:METHOD:TX_FILTER:UPDATE_INDICATOR - Обновление индикатора
    updateFilterIndicator() {
        const hasActiveFilters = 
            this.filters.token !== 'all' ||
            this.filters.status !== 'all' ||
            this.filters.minAmount !== null ||
            this.filters.maxAmount !== null;
        
        const header = this.container.querySelector('.filter-header h3');
        if (header) {
            if (hasActiveFilters) {
                header.innerHTML = 'Расширенные фильтры <span class="filter-badge">Активны</span>';
            } else {
                header.innerHTML = 'Расширенные фильтры';
            }
        }
    }
    
    // MCP-MARKER:METHOD:TX_FILTER:DESTROY - Очистка компонента
    destroy() {
        this.container.innerHTML = '';
    }
}

// Стили для компонента фильтров
const styles = `
<style>
.filter-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
}

.filter-header h3 {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary, #333);
    margin: 0;
}

.filter-badge {
    display: inline-block;
    margin-left: 10px;
    padding: 2px 8px;
    background: var(--primary-color, #667eea);
    color: white;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
}

.filter-toggle {
    width: 32px;
    height: 32px;
    border: none;
    background: var(--bg-secondary, #f0f0f0);
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
}

.filter-toggle:hover {
    background: var(--bg-hover, #e0e0e0);
}

.filter-content {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease;
}

.filter-content.expanded {
    max-height: 500px;
}

.filter-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    padding: 20px 0;
}

.filter-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.filter-group label {
    font-size: 13px;
    font-weight: 500;
    color: var(--text-secondary, #666);
}

.filter-input,
.filter-select {
    padding: 8px 12px;
    border: 2px solid var(--border-color, #e0e0e0);
    border-radius: 8px;
    font-size: 14px;
    transition: border-color 0.3s ease;
}

.filter-input:focus,
.filter-select:focus {
    outline: none;
    border-color: var(--primary-color, #667eea);
}

.date-range,
.amount-range {
    display: flex;
    align-items: center;
    gap: 10px;
}

.date-separator,
.amount-separator {
    color: var(--text-secondary, #666);
}

.quick-periods {
    display: flex;
    gap: 8px;
}

.period-btn {
    flex: 1;
    padding: 8px 12px;
    background: var(--bg-secondary, #f0f0f0);
    border: 2px solid transparent;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
}

.period-btn:hover {
    background: var(--bg-hover, #e0e0e0);
}

.period-btn.active {
    background: var(--primary-color, #667eea);
    color: white;
    border-color: var(--primary-color, #667eea);
}

.filter-actions {
    display: flex;
