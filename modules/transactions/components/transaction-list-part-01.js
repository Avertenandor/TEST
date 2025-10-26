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
