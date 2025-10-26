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
