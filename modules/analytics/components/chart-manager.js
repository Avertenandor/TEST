// modules/analytics/components/chart-manager.js
// MCP-MARKER:COMPONENT:ANALYTICS:CHARTS - Менеджер графиков для аналитики

export default class ChartManager {
    constructor(container, state) {
        this.container = container;
        this.state = state;
        this.charts = new Map();
        this.chartInstances = new Map();
        this.chartLibraryLoaded = false;
        
        this.init();
    }
    
    // MCP-MARKER:METHOD:CHART_MANAGER:INIT - Инициализация
    async init() {
        // Загружаем библиотеку Chart.js если еще не загружена
        await this.loadChartLibrary();
    }
    
    // MCP-MARKER:METHOD:CHART_MANAGER:LOAD_LIBRARY - Загрузка Chart.js
    async loadChartLibrary() {
        if (this.chartLibraryLoaded) return;
        
        // Проверяем, загружена ли уже библиотека
        if (window.Chart) {
            this.chartLibraryLoaded = true;
            return;
        }
        
        // Создаем script элемент для загрузки Chart.js
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
            script.async = true;
            
            script.onload = () => {
                this.chartLibraryLoaded = true;
                resolve();
            };
            
            script.onerror = () => {
                console.error('[ChartManager] Ошибка загрузки Chart.js');
                reject(new Error('Failed to load Chart.js'));
            };
            
            document.head.appendChild(script);
        });
    }
    
    // MCP-MARKER:METHOD:CHART_MANAGER:CREATE_CHART - Создание графика
    async createChart(name, config) {
        // Убеждаемся, что библиотека загружена
        await this.loadChartLibrary();
        
        // Находим canvas элемент
        const canvas = this.container.querySelector(`#${name}-chart`);
        if (!canvas) {
            console.error(`[ChartManager] Canvas элемент #${name}-chart не найден`);
            return null;
        }
        
        // Уничтожаем старый график если существует
        if (this.chartInstances.has(name)) {
            this.chartInstances.get(name).destroy();
        }
        
        // Конфигурация по умолчанию
        const defaultConfig = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    cornerRadius: 8,
                    titleFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 13
                    },
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            
                            // Форматирование в зависимости от типа данных
                            const value = context.parsed.y || context.parsed;
                            
                            if (name === 'roi' || label.includes('%')) {
                                label += value.toFixed(2) + '%';
                            } else if (typeof value === 'number') {
                                label += '$' + value.toFixed(2);
                            } else {
                                label += value;
                            }
                            
                            return label;
                        }
                    }
                }
            },
            scales: this.getScalesConfig(config.type)
        };
        
        // Создаем график
        const chartConfig = {
            type: config.type || 'line',
            data: config.data || { labels: [], datasets: [] },
            options: { ...defaultConfig, ...(config.options || {}) }
        };
        
        // Применяем тему
        this.applyTheme(chartConfig);
        
        const chart = new window.Chart(canvas, chartConfig);
        
        // Сохраняем инстанс
        this.chartInstances.set(name, chart);
        this.charts.set(name, config);
        
        return chart;
    }
    
    // MCP-MARKER:METHOD:CHART_MANAGER:UPDATE_CHART - Обновление графика
    updateChart(chart, data) {
        if (!chart) return;
        
        // Обновляем данные
        chart.data = data;
        
        // Применяем анимацию обновления
        chart.update('active');
    }
    
    // MCP-MARKER:METHOD:CHART_MANAGER:CHANGE_TYPE - Изменение типа графика
    changeChartType(chartType) {
        this.chartInstances.forEach((chart, name) => {
            const config = this.charts.get(name);
            
            // Некоторые графики не должны менять тип
            if (name === 'portfolio') return; // Всегда doughnut
            
            // Пересоздаем график с новым типом
            const newConfig = {
                ...config,
                type: chartType
            };
            
            this.createChart(name, newConfig);
        });
    }
    
    // MCP-MARKER:METHOD:CHART_MANAGER:DESTROY_CHART - Уничтожение графика
    destroyChart(name) {
        const chart = this.chartInstances.get(name);
        if (chart) {
            chart.destroy();
            this.chartInstances.delete(name);
            this.charts.delete(name);
        }
    }
    
    // MCP-MARKER:METHOD:CHART_MANAGER:DESTROY_ALL - Уничтожение всех графиков
    destroyAllCharts() {
        this.chartInstances.forEach(chart => {
            chart.destroy();
        });
        
        this.chartInstances.clear();
        this.charts.clear();
    }
    
    // MCP-MARKER:METHOD:CHART_MANAGER:GET_SCALES - Конфигурация осей
    getScalesConfig(type) {
        if (type === 'doughnut' || type === 'pie' || type === 'radar') {
            return {}; // Эти типы не используют оси
        }
        
        return {
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    font: {
                        size: 11
                    }
                }
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                },
                ticks: {
                    font: {
                        size: 11
                    },
                    callback: function(value) {
                        // Форматирование значений на оси Y
                        if (this.chart.canvas.id && this.chart.canvas.id.includes('roi')) {
                            return value + '%';
                        }
                        return '$' + value.toFixed(0);
                    }
                }
            }
        };
    }
    
    // MCP-MARKER:METHOD:CHART_MANAGER:APPLY_THEME - Применение темы
    applyTheme(config) {
        // Определяем темную тему
        const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (isDarkMode) {
            // Цвета для темной темы
            config.options.plugins.legend.labels.color = '#f0f0f0';
            
            if (config.options.scales?.x) {
                config.options.scales.x.ticks.color = '#a0a0a0';
                config.options.scales.x.grid.color = 'rgba(255, 255, 255, 0.05)';
            }
            
            if (config.options.scales?.y) {
                config.options.scales.y.ticks.color = '#a0a0a0';
                config.options.scales.y.grid.color = 'rgba(255, 255, 255, 0.05)';
            }
        }
    }
    
    // MCP-MARKER:METHOD:CHART_MANAGER:EXPORT_CHART - Экспорт графика
    exportChart(name, format = 'png') {
        const chart = this.chartInstances.get(name);
        if (!chart) return null;
        
        const canvas = chart.canvas;
        
        if (format === 'png') {
            return canvas.toDataURL('image/png');
        } else if (format === 'jpeg') {
            return canvas.toDataURL('image/jpeg');
        } else if (format === 'svg') {
            // Для SVG нужна дополнительная обработка
            return this.canvasToSVG(canvas);
        }
        
        return null;
    }
    
    // MCP-MARKER:METHOD:CHART_MANAGER:EXPORT_ALL - Экспорт всех графиков
    exportAllCharts(format = 'png') {
        const exports = {};
        
        this.chartInstances.forEach((chart, name) => {
            exports[name] = this.exportChart(name, format);
        });
        
        return exports;
    }
    
    // MCP-MARKER:METHOD:CHART_MANAGER:CANVAS_TO_SVG - Конвертация в SVG
    canvasToSVG(canvas) {
        // Простая конвертация в SVG (требует дополнительной библиотеки для полной поддержки)
        const dataURL = canvas.toDataURL('image/png');
        const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}">
                <image href="${dataURL}" width="${canvas.width}" height="${canvas.height}"/>
            </svg>
        `;
        return 'data:image/svg+xml;base64,' + btoa(svg);
    }
    
    // MCP-MARKER:METHOD:CHART_MANAGER:RESIZE - Изменение размера графиков
    resizeCharts() {
        this.chartInstances.forEach(chart => {
            chart.resize();
        });
    }
    
    // MCP-MARKER:METHOD:CHART_MANAGER:DESTROY - Очистка компонента
    destroy() {
        this.destroyAllCharts();
    }
}
