// modules/transactions/components/transaction-export.js
// MCP-MARKER:COMPONENT:TRANSACTIONS:EXPORT - Компонент экспорта транзакций

export default class TransactionExport {
    constructor(container, state) {
        this.container = container;
        this.state = state;
        this.init();
    }
    
    // MCP-MARKER:METHOD:TX_EXPORT:INIT - Инициализация
    init() {
        this.render();
        this.attachEventHandlers();
    }
    
    // MCP-MARKER:METHOD:TX_EXPORT:RENDER - Отрисовка интерфейса экспорта
    render() {
        this.container.innerHTML = `
            <div class="export-header">
                <h3>
                    <i class="icon-export"></i>
                    Экспорт данных
                </h3>
                <div class="export-info">
                    Экспортировать отфильтрованные транзакции
                </div>
            </div>
            
            <div class="export-options">
                <div class="export-format">
                    <label>Формат файла:</label>
                    <div class="format-buttons">
                        <button class="format-btn active" data-format="csv">
                            <i class="icon-csv"></i>
                            CSV
                        </button>
                        <button class="format-btn" data-format="json">
                            <i class="icon-json"></i>
                            JSON
                        </button>
                        <button class="format-btn" data-format="pdf">
                            <i class="icon-pdf"></i>
                            PDF
                        </button>
                        <button class="format-btn" data-format="excel">
                            <i class="icon-excel"></i>
                            Excel
                        </button>
                    </div>
                </div>
                
                <div class="export-columns">
                    <label>Выберите поля для экспорта:</label>
                    <div class="columns-grid">
                        <label class="column-checkbox">
                            <input type="checkbox" value="date" checked>
                            <span>Дата</span>
                        </label>
                        <label class="column-checkbox">
                            <input type="checkbox" value="time" checked>
                            <span>Время</span>
                        </label>
                        <label class="column-checkbox">
                            <input type="checkbox" value="type" checked>
                            <span>Тип</span>
                        </label>
                        <label class="column-checkbox">
                            <input type="checkbox" value="amount" checked>
                            <span>Сумма</span>
                        </label>
                        <label class="column-checkbox">
                            <input type="checkbox" value="token" checked>
                            <span>Токен</span>
                        </label>
                        <label class="column-checkbox">
                            <input type="checkbox" value="hash" checked>
                            <span>Хеш</span>
                        </label>
                        <label class="column-checkbox">
                            <input type="checkbox" value="from">
                            <span>От кого</span>
                        </label>
                        <label class="column-checkbox">
                            <input type="checkbox" value="to">
                            <span>Кому</span>
                        </label>
                        <label class="column-checkbox">
                            <input type="checkbox" value="status" checked>
                            <span>Статус</span>
                        </label>
                        <label class="column-checkbox">
                            <input type="checkbox" value="block">
                            <span>Блок</span>
                        </label>
                        <label class="column-checkbox">
                            <input type="checkbox" value="gas">
                            <span>Комиссия</span>
                        </label>
                    </div>
                </div>
                
                <div class="export-actions">
                    <button class="btn-export-download">
                        <i class="icon-download"></i>
                        Скачать файл
                    </button>
                    <button class="btn-export-copy">
                        <i class="icon-copy"></i>
                        Копировать в буфер
                    </button>
                    <button class="btn-export-print">
                        <i class="icon-print"></i>
                        Печать
                    </button>
                </div>
            </div>
            
            <div class="export-preview" style="display: none;">
                <div class="preview-header">
                    <h4>Предпросмотр экспорта</h4>
                    <button class="btn-close-preview">×</button>
                </div>
                <div class="preview-content">
                    <pre id="export-preview-text"></pre>
                </div>
            </div>
        `;
    }
    
    // MCP-MARKER:METHOD:TX_EXPORT:ATTACH_HANDLERS - Привязка обработчиков
    attachEventHandlers() {
        // Выбор формата
        const formatButtons = this.container.querySelectorAll('.format-btn');
        formatButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                formatButtons.forEach(b => b.classList.remove('active'));
                e.target.closest('.format-btn').classList.add('active');
            });
        });
        
        // Кнопка скачивания
        const downloadBtn = this.container.querySelector('.btn-export-download');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.handleExportDownload());
        }
        
        // Кнопка копирования
        const copyBtn = this.container.querySelector('.btn-export-copy');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => this.handleExportCopy());
        }
        
        // Кнопка печати
        const printBtn = this.container.querySelector('.btn-export-print');
        if (printBtn) {
            printBtn.addEventListener('click', () => this.handleExportPrint());
        }
        
        // Закрытие превью
        const closePreviewBtn = this.container.querySelector('.btn-close-preview');
        if (closePreviewBtn) {
            closePreviewBtn.addEventListener('click', () => {
                this.container.querySelector('.export-preview').style.display = 'none';
            });
        }
    }
    
    // MCP-MARKER:METHOD:TX_EXPORT:GET_FORMAT - Получить выбранный формат
    getSelectedFormat() {
        const activeBtn = this.container.querySelector('.format-btn.active');
        return activeBtn ? activeBtn.dataset.format : 'csv';
    }
    
    // MCP-MARKER:METHOD:TX_EXPORT:GET_COLUMNS - Получить выбранные колонки
    getSelectedColumns() {
        const columns = [];
        const checkboxes = this.container.querySelectorAll('.column-checkbox input:checked');
        checkboxes.forEach(cb => columns.push(cb.value));
        return columns;
    }
    
    // MCP-MARKER:METHOD:TX_EXPORT:HANDLE_DOWNLOAD - Обработка скачивания
    async handleExportDownload() {
        try {
            const format = this.getSelectedFormat();
            const columns = this.getSelectedColumns();
            
            if (columns.length === 0) {
                this.showNotification('Выберите хотя бы одно поле для экспорта', 'warning');
                return;
            }
            
            const data = this.prepareExportData(columns);
            
            let content, mimeType, filename;
            
            switch (format) {
                case 'csv':
                    content = this.exportToCSV(data, columns);
                    mimeType = 'text/csv';
                    filename = `transactions_${this.getTimestamp()}.csv`;
                    break;
                    
                case 'json':
                    content = this.exportToJSON(data);
                    mimeType = 'application/json';
                    filename = `transactions_${this.getTimestamp()}.json`;
                    break;
                    
                case 'pdf':
                    await this.exportToPDF(data, columns);
                    return;
                    
                case 'excel':
                    await this.exportToExcel(data, columns);
                    return;
                    
                default:
                    throw new Error('Неизвестный формат');
            }
            
            // Создание и скачивание файла
            this.downloadFile(content, filename, mimeType);
            this.showNotification(`Файл ${filename} скачан успешно`, 'success');
            
        } catch (error) {
            console.error('[TransactionExport] Ошибка экспорта:', error);
            this.showNotification('Ошибка при экспорте данных', 'error');
        }
    }
    
    // MCP-MARKER:METHOD:TX_EXPORT:HANDLE_COPY - Копирование в буфер
    async handleExportCopy() {
        try {
            const format = this.getSelectedFormat();
            const columns = this.getSelectedColumns();
            
            if (columns.length === 0) {
                this.showNotification('Выберите хотя бы одно поле для экспорта', 'warning');
                return;
            }
            
            const data = this.prepareExportData(columns);
            let content;
            
            if (format === 'csv') {
                content = this.exportToCSV(data, columns);
            } else if (format === 'json') {
                content = this.exportToJSON(data);
            } else {
                content = this.exportToText(data, columns);
            }
            
            // Копирование в буфер обмена
            await navigator.clipboard.writeText(content);
            this.showNotification('Данные скопированы в буфер обмена', 'success');
            
            // Показать превью
            this.showPreview(content);
            
        } catch (error) {
            console.error('[TransactionExport] Ошибка копирования:', error);
            this.showNotification('Не удалось скопировать данные', 'error');
        }
    }
    
    // MCP-MARKER:METHOD:TX_EXPORT:HANDLE_PRINT - Печать
    handleExportPrint() {
        const columns = this.getSelectedColumns();
        
        if (columns.length === 0) {
            this.showNotification('Выберите хотя бы одно поле для экспорта', 'warning');
            return;
        }
        
        const data = this.prepareExportData(columns);
        const printContent = this.generatePrintHTML(data, columns);
        
        // Создание временного окна для печати
        const printWindow = window.open('', '_blank');
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    }
    
    // MCP-MARKER:METHOD:TX_EXPORT:PREPARE_DATA - Подготовка данных
    prepareExportData(columns) {
        const transactions = this.state.getFilteredTransactions();
        
        return transactions.map(tx => {
            const data = {};
            const date = new Date(tx.timestamp);
            
            columns.forEach(col => {
                switch (col) {
                    case 'date':
                        data.date = date.toLocaleDateString('ru-RU');
                        break;
                    case 'time':
                        data.time = date.toLocaleTimeString('ru-RU');
                        break;
                    case 'type':
                        data.type = tx.category;
                        break;
                    case 'amount':
                        data.amount = tx.amount.toFixed(2);
                        break;
                    case 'token':
                        data.token = tx.token;
                        break;
                    case 'hash':
                        data.hash = tx.hash;
                        break;
                    case 'from':
                        data.from = tx.from;
                        break;
                    case 'to':
                        data.to = tx.to;
                        break;
                    case 'status':
                        data.status = tx.status;
                        break;
                    case 'block':
                        data.block = tx.blockNumber;
                        break;
                    case 'gas':
                        data.gas = tx.gasUsed ? 
                            (tx.gasUsed * tx.gasPrice / 1e18).toFixed(6) : 
                            'N/A';
                        break;
                }
            });
            
            return data;
        });
    }
    
    // MCP-MARKER:METHOD:TX_EXPORT:TO_CSV - Экспорт в CSV
    exportToCSV(data, columns) {
        const headers = {
            date: 'Дата',
            time: 'Время',
            type: 'Тип',
            amount: 'Сумма',
            token: 'Токен',
            hash: 'Хеш',
            from: 'От кого',
            to: 'Кому',
            status: 'Статус',
            block: 'Блок',
            gas: 'Комиссия'
        };
        
        // Заголовки
        const headerRow = columns.map(col => `"${headers[col]}"`).join(',');
        
        // Строки данных
        const rows = data.map(row => 
            columns.map(col => `"${row[col] || ''}"`).join(',')
        );
        
        return [headerRow, ...rows].join('\n');
    }
    
    // MCP-MARKER:METHOD:TX_EXPORT:TO_JSON - Экспорт в JSON
    exportToJSON(data) {
        return JSON.stringify(data, null, 2);
    }
    
    // MCP-MARKER:METHOD:TX_EXPORT:TO_TEXT - Экспорт в текст
    exportToText(data, columns) {
        const headers = {
            date: 'Дата',
            time: 'Время',
            type: 'Тип',
            amount: 'Сумма',
            token: 'Токен',
            hash: 'Хеш',
            from: 'От кого',
            to: 'Кому',
            status: 'Статус',
            block: 'Блок',
            gas: 'Комиссия'
        };
        
        let text = 'ИСТОРИЯ ТРАНЗАКЦИЙ\n';
        text += '=' . repeat(80) + '\n\n';
        
        data.forEach((tx, index) => {
            text += `Транзакция #${index + 1}\n`;
            text += '-'.repeat(40) + '\n';
            
            columns.forEach(col => {
                text += `${headers[col]}: ${tx[col] || 'N/A'}\n`;
            });
            
            text += '\n';
        });
        
        return text;
    }
    
    // MCP-MARKER:METHOD:TX_EXPORT:TO_PDF - Экспорт в PDF
    async exportToPDF(data, columns) {
        // Для полноценного PDF нужна библиотека jsPDF
        // Здесь простая реализация через печать
        this.showNotification('PDF экспорт доступен через функцию печати', 'info');
        this.handleExportPrint();
    }
    
    // MCP-MARKER:METHOD:TX_EXPORT:TO_EXCEL - Экспорт в Excel
    async exportToExcel(data, columns) {
        // Для Excel можно использовать CSV с расширением .xls
        const csvContent = this.exportToCSV(data, columns);
        this.downloadFile(csvContent, `transactions_${this.getTimestamp()}.xls`, 'application/vnd.ms-excel');
        this.showNotification('Excel файл скачан успешно', 'success');
    }
    
    // MCP-MARKER:METHOD:TX_EXPORT:GENERATE_PRINT - Генерация HTML для печати
    generatePrintHTML(data, columns) {
        const headers = {
            date: 'Дата',
            time: 'Время',
            type: 'Тип',
            amount: 'Сумма',
            token: 'Токен',
            hash: 'Хеш',
            from: 'От кого',
            to: 'Кому',
            status: 'Статус',
            block: 'Блок',
            gas: 'Комиссия'
        };
        
        const tableRows = data.map(row => `
            <tr>
                ${columns.map(col => `<td>${row[col] || ''}</td>`).join('')}
            </tr>
        `).join('');
        
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>История транзакций</title>
                <style>
                    body { font-family: Arial, sans-serif; }
                    h1 { text-align: center; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th, td { padding: 8px; text-align: left; border: 1px solid #ddd; }
                    th { background-color: #f2f2f2; font-weight: bold; }
                    tr:nth-child(even) { background-color: #f9f9f9; }
                    .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <h1>История транзакций GENESIS</h1>
                <p>Дата экспорта: ${new Date().toLocaleString('ru-RU')}</p>
                <p>Количество записей: ${data.length}</p>
                
                <table>
                    <thead>
                        <tr>
                            ${columns.map(col => `<th>${headers[col]}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
                
                <div class="footer">
                    <p>© GENESIS DeFi Platform</p>
                </div>
            </body>
            </html>
        `;
    }
    
    // MCP-MARKER:METHOD:TX_EXPORT:DOWNLOAD_FILE - Скачивание файла
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
    
    // MCP-MARKER:METHOD:TX_EXPORT:SHOW_PREVIEW - Показать превью
    showPreview(content) {
        const preview = this.container.querySelector('.export-preview');
        const previewText = this.container.querySelector('#export-preview-text');
        
        if (preview && previewText) {
            previewText.textContent = content.substring(0, 1000) + 
                (content.length > 1000 ? '\n...\n[Показаны первые 1000 символов]' : '');
            preview.style.display = 'block';
        }
    }
    
    // MCP-MARKER:METHOD:TX_EXPORT:SHOW_NOTIFICATION - Показать уведомление
    showNotification(message, type = 'info') {
        // Используем глобальную систему уведомлений
        if (window.eventBus) {
            window.eventBus.emit('notification:show', { message, type });
        } else {
            console.log(`[${type}] ${message}`);
        }
    }
    
    // MCP-MARKER:METHOD:TX_EXPORT:GET_TIMESTAMP - Получить timestamp
    getTimestamp() {
        const now = new Date();
        return now.toISOString().replace(/[:.]/g, '-').substring(0, 19);
    }
    
    // MCP-MARKER:METHOD:TX_EXPORT:DESTROY - Очистка компонента
    destroy() {
        this.container.innerHTML = '';
    }
}

// Стили для компонента экспорта
const styles = `
<style>
.export-header {
    margin-bottom: 20px;
}

.export-header h3 {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary, #333);
    margin: 0 0 8px 0;
    display: flex;
    align-items: center;
    gap: 10px;
}

.export-info {
    font-size: 14px;
    color: var(--text-secondary, #666);
}

.export-options {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.export-format label,
.export-columns label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: var(--text-secondary, #666);
    margin-bottom: 10px;
}

.format-buttons {
    display: flex;
    gap: 10px;
}

.format-btn {
    flex: 1;
    padding: 12px 20px;
    background: var(--bg-secondary, #f0f0f0);
    border: 2px solid transparent;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    transition: all 0.3s ease;
}

.format-btn:hover {
    background: var(--bg-hover, #e0e0e0);
}

.format-btn.active {
    background: var(--primary-color, #667eea);
    color: white;
    border-color: var(--primary-color, #667eea);
}

.format-btn i {
    font-size: 24px;
}

.columns-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 10px;
}

.column-checkbox {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px;
    background: var(--bg-secondary, #f8f8f8);
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.3s ease;
}

.column-checkbox:hover {
    background: var(--bg-hover, #f0f0f0);
}

.column-checkbox input[type="checkbox"] {
    cursor: pointer;
}

.column-checkbox span {
    font-size: 14px;
    color: var(--text-primary, #333);
}

.export-actions {
    display: flex;
    gap: 10px;
    padding-top: 20px;
    border-top: 1px solid var(--border-color, #e0e0e0);
}

.btn-export-download,
.btn-export-copy,
.btn-export-print {
    flex: 1;
    padding: 12px 20px;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.3s ease;
}

.btn-export-download {
    background: var(--primary-color, #667eea);
    color: white;
}

.btn-export-download:hover {
    background: var(--primary-hover, #5a67d8);
}

.btn-export-copy {
    background: var(--success-color, #22c55e);
    color: white;
}

.btn-export-copy:hover {
    background: var(--success-hover, #16a34a);
}

.btn-export-print {
    background: var(--info-color, #3b82f6);
    color: white;
}

.btn-export-print:hover {
    background: var(--info-hover, #2563eb);
}

.export-preview {
    margin-top: 20px;
    padding: 20px;
    background: var(--bg-secondary, #f8f8f8);
    border-radius: 8px;
    border: 1px solid var(--border-color, #e0e0e0);
}

.preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
}

.preview-header h4 {
    margin: 0;
    font-size: 16px;
    color: var(--text-primary, #333);
}

.btn-close-preview {
    width: 28px;
    height: 28px;
    border: none;
    background: var(--bg-hover, #e0e0e0);
    border-radius: 4px;
    cursor: pointer;
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.preview-content {
    max-height: 300px;
    overflow: auto;
}

.preview-content pre {
    margin: 0;
    font-family: 'Courier New', monospace;
    font-size: 12px;
    white-space: pre-wrap;
    word-wrap: break-word;
}

/* Адаптивность */
@media (max-width: 768px) {
    .format-buttons {
        flex-direction: column;
    }
    
    .export-actions {
        flex-direction: column;
    }
    
    .columns-grid {
        grid-template-columns: 1fr;
    }
}
</style>
`;

// Добавляем стили в документ
if (!document.querySelector('#transaction-export-styles')) {
    const styleElement = document.createElement('div');
    styleElement.id = 'transaction-export-styles';
    styleElement.innerHTML = styles;
    document.head.appendChild(styleElement.firstElementChild);
}
