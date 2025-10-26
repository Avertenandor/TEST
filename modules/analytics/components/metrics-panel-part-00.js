// modules/analytics/components/metrics-panel.js
// MCP-MARKER:COMPONENT:ANALYTICS:METRICS - Панель метрик для аналитики

export default class MetricsPanel {
    constructor(container, state) {
        this.container = container;
        this.state = state;
        this.metrics = new Map();
        this.animationDuration = 1000;
        
        this.init();
    }
    
    // MCP-MARKER:METHOD:METRICS_PANEL:INIT - Инициализация
    init() {
        this.setupMetricElements();
        this.attachEventHandlers();
    }
    
    // MCP-MARKER:METHOD:METRICS_PANEL:SETUP - Настройка элементов метрик
    setupMetricElements() {
        // Находим все элементы метрик
        const metricCards = this.container.querySelectorAll('.metric-card');
        
        metricCards.forEach(card => {
            const valueElement = card.querySelector('.metric-value');
            const changeElement = card.querySelector('.metric-change');
            
            if (valueElement) {
                const metricId = valueElement.id?.replace('metric-', '');
                if (metricId) {
                    this.metrics.set(metricId, {
                        card: card,
                        valueElement: valueElement,
                        changeElement: changeElement,
                        currentValue: 0,
                        targetValue: 0
                    });
                }
            }
        });
    }
    
    // MCP-MARKER:METHOD:METRICS_PANEL:ATTACH_HANDLERS - Привязка обработчиков
    attachEventHandlers() {
        // Клик по метрике для детальной информации
        this.metrics.forEach((metric, id) => {
            metric.card.addEventListener('click', () => {
                this.showMetricDetails(id);
            });
        });
    }
    
    // MCP-MARKER:METHOD:METRICS_PANEL:UPDATE - Обновление метрик
    update(data) {
        if (!data) return;
        
        // Обновляем каждую метрику
        Object.entries(data).forEach(([key, value]) => {
            this.updateMetric(key, value);
        });
        
        // Анимируем изменения
        this.animateMetrics();
        
        // Обновляем индикаторы изменений
        this.updateChangeIndicators();
    }
    
    // MCP-MARKER:METHOD:METRICS_PANEL:UPDATE_METRIC - Обновление одной метрики
    updateMetric(id, value) {
        const metric = this.metrics.get(id);
        if (!metric) return;
        
        // Сохраняем предыдущее значение
        metric.previousValue = metric.currentValue;
        metric.targetValue = value;
        
        // Определяем формат отображения
        const formattedValue = this.formatValue(id, value);
        
        // Если нужна анимация числа
        if (typeof value === 'number' && !isNaN(value)) {
            this.animateNumber(metric, value, formattedValue);
        } else {
            metric.valueElement.textContent = formattedValue;
        }
        
        // Обновляем стиль карточки
        this.updateCardStyle(metric, value);
    }
    
    // MCP-MARKER:METHOD:METRICS_PANEL:ANIMATE_NUMBER - Анимация числа
    animateNumber(metric, targetValue, formattedValue) {
        const startValue = metric.currentValue || 0;
        const duration = this.animationDuration;
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            
            const currentValue = startValue + (targetValue - startValue) * easeOutQuart;
            
            // Форматируем промежуточное значение
            const intermediateFormatted = this.formatValue(metric.valueElement.id.replace('metric-', ''), currentValue);
            metric.valueElement.textContent = intermediateFormatted;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                metric.currentValue = targetValue;
                metric.valueElement.textContent = formattedValue;
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    // MCP-MARKER:METHOD:METRICS_PANEL:FORMAT_VALUE - Форматирование значения
    formatValue(id, value) {
        if (typeof value !== 'number' || isNaN(value)) {
            return value || '—';
        }
        
        // Форматирование в зависимости от типа метрики
        if (id.includes('roi') || id.includes('percent') || id.includes('rate')) {
            return `${value.toFixed(2)}%`;
        } else if (id.includes('count') || id.includes('deposits') || id.includes('transactions')) {
            return Math.round(value).toLocaleString('ru-RU');
        } else if (id.includes('score') || id.includes('level')) {
            return Math.round(value).toString();
        } else {
            // Денежные значения
            return `$${value.toFixed(2).toLocaleString('ru-RU')}`;
        }
    }
    
    // MCP-MARKER:METHOD:METRICS_PANEL:UPDATE_CHANGE - Обновление индикаторов изменений
    updateChangeIndicators() {
        this.metrics.forEach((metric, id) => {
            if (!metric.changeElement) return;
            
            const change = this.calculateChange(metric);
            
            if (change !== null) {
                const isPositive = change > 0;
                const isNegative = change < 0;
                
                // Обновляем класс
                metric.changeElement.className = 'metric-change';
                if (isPositive) {
                    metric.changeElement.classList.add('positive');
                } else if (isNegative) {
                    metric.changeElement.classList.add('negative');
                } else {
                    metric.changeElement.classList.add('neutral');
                }
                
                // Обновляем иконку и текст
                const icon = metric.changeElement.querySelector('i');
                const text = metric.changeElement.querySelector('span');
                
                if (icon) {
                    icon.className = isPositive ? 'icon-arrow-up' : 
                                    isNegative ? 'icon-arrow-down' : 
                                    'icon-arrow-right';
                }
                
                if (text) {
                    const sign = isPositive ? '+' : '';
                    text.textContent = `${sign}${Math.abs(change).toFixed(1)}%`;
                }
            }
        });
    }
    
    // MCP-MARKER:METHOD:METRICS_PANEL:CALCULATE_CHANGE - Расчет изменения
    calculateChange(metric) {
        if (!metric.previousValue || metric.previousValue === 0) {
            return null;
        }
        
        const change = ((metric.targetValue - metric.previousValue) / metric.previousValue) * 100;
        return isFinite(change) ? change : null;
    }
    
    // MCP-MARKER:METHOD:METRICS_PANEL:UPDATE_CARD_STYLE - Обновление стиля карточки
    updateCardStyle(metric, value) {
        // Добавляем визуальные эффекты в зависимости от значения
        const card = metric.card;
        
        // Пульсация при обновлении
        card.classList.add('updating');
        setTimeout(() => {
            card.classList.remove('updating');
        }, 300);
        
        // Подсветка при достижении целей
        if (this.isGoalAchieved(metric.valueElement.id, value)) {
            card.classList.add('goal-achieved');
        }
    }
    
    // MCP-MARKER:METHOD:METRICS_PANEL:IS_GOAL_ACHIEVED - Проверка достижения цели
    isGoalAchieved(metricId, value) {
        const goals = {
            'metric-total-invested': 10000,
            'metric-total-earned': 5000,
            'metric-roi': 150,
            'metric-active-deposits': 10
        };
        
        const goal = goals[metricId];
        return goal && value >= goal;
    }
    
    // MCP-MARKER:METHOD:METRICS_PANEL:SHOW_DETAILS - Показать детали метрики
    showMetricDetails(id) {
        const metric = this.metrics.get(id);
        if (!metric) return;
        
        // Создаем модальное окно с деталями
        const modal = this.createDetailsModal(id, metric);
        document.body.appendChild(modal);
        
        // Анимация появления
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
        
        // Закрытие по клику на оверлей
        modal.querySelector('.modal-overlay').addEventListener('click', () => {
            this.closeDetailsModal(modal);
        });
        
        // Закрытие по кнопке
        modal.querySelector('.modal-close').addEventListener('click', () => {
            this.closeDetailsModal(modal);
        });
    }
    
    // MCP-MARKER:METHOD:METRICS_PANEL:CREATE_MODAL - Создание модального окна
    createDetailsModal(id, metric) {
        const modal = document.createElement('div');
        modal.className = 'metric-details-modal';
        
        const details = this.getMetricDetails(id);
        
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${details.title}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="detail-current">
                        <span class="detail-label">Текущее значение:</span>
                        <span class="detail-value">${metric.valueElement.textContent}</span>
                    </div>
                    <div class="detail-description">
                        <p>${details.description}</p>
                    </div>
                    <div class="detail-chart">
                        <canvas id="metric-detail-chart"></canvas>
                    </div>
                    <div class="detail-stats">
                        <div class="stat-item">
                            <span class="stat-label">Среднее за период:</span>
                            <span class="stat-value">${details.average}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Максимум:</span>
                            <span class="stat-value">${details.max}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Минимум:</span>
                            <span class="stat-value">${details.min}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        return modal;
    }
    
    // MCP-MARKER:METHOD:METRICS_PANEL:GET_DETAILS - Получение деталей метрики
    getMetricDetails(id) {
        const details = {
            'total-invested': {
                title: 'Общие инвестиции',
                description: 'Суммарный объем всех ваших инвестиций в системе GENESIS. Включает активные и завершенные депозиты.',
                average: '$2,500',
                max: '$5,000',
                min: '$100'
            },
            'total-earned': {
                title: 'Общий доход',
                description: 'Суммарный доход от всех источников: депозиты, рефералы, бонусы и награды.',
                average: '$500',
                max: '$1,500',
                min: '$10'
            },
            'roi': {
                title: 'Return on Investment (ROI)',
                description: 'Показатель возврата инвестиций. Рассчитывается как отношение прибыли к вложенным средствам.',
                average: '125%',
                max: '250%',
                min: '80%'
            },
            'active-deposits': {
                title: 'Активные депозиты',
                description: 'Количество депозитов, которые в данный момент генерируют доход.',
                average: '5',
                max: '13',
                min: '1'
            }
        };
        
        return details[id] || {
            title: 'Метрика',
            description: 'Детальная информация о метрике',
            average: '—',
            max: '—',
            min: '—'
        };
    }
    
    // MCP-MARKER:METHOD:METRICS_PANEL:CLOSE_MODAL - Закрытие модального окна
    closeDetailsModal(modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
    
    // MCP-MARKER:METHOD:METRICS_PANEL:ANIMATE_METRICS - Анимация всех метрик
    animateMetrics() {
        // Добавляем эффект волны для метрик
        let delay = 0;
        
        this.metrics.forEach((metric) => {
            setTimeout(() => {
                metric.card.classList.add('animated');
                setTimeout(() => {
                    metric.card.classList.remove('animated');
                }, 500);
            }, delay);
            
            delay += 100;
        });
    }
    
    // MCP-MARKER:METHOD:METRICS_PANEL:EXPORT_DATA - Экспорт данных метрик
    exportData() {
        const data = {};
        
        this.metrics.forEach((metric, id) => {
            data[id] = {
                value: metric.currentValue,
                formatted: metric.valueElement.textContent,
                change: this.calculateChange(metric)
            };
        });
        
        return data;
    }
    
    // MCP-MARKER:METHOD:METRICS_PANEL:DESTROY - Очистка компонента
    destroy() {
        // Удаляем обработчики событий
        this.metrics.forEach((metric) => {
            metric.card.replaceWith(metric.card.cloneNode(true));
        });
        
        // Очищаем данные
        this.metrics.clear();
    }
}

// Стили для панели метрик
const styles = `
<style>
.metric-card {
    cursor: pointer;
    position: relative;
    overflow: hidden;
}

.metric-card.updating {
    animation: pulse 0.3s ease;
}

.metric-card.animated {
    animation: slideIn 0.5s ease;
}

.metric-card.goal-achieved {
    box-shadow: 0 0 20px rgba(102, 126, 234, 0.3);
}

.metric-card.goal-achieved::after {
    content: '🎯';
    position: absolute;
    top: 10px;
    right: 10px;
    font-size: 20px;
    animation: bounce 0.5s ease;
}

@keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.02); }
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
}

/* Модальное окно деталей */
.metric-details-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 10000;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.metric-details-modal.show {
    opacity: 1;
