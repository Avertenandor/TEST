    gap: 10px;
    padding-top: 20px;
    border-top: 1px solid var(--border-color, #e0e0e0);
}

.btn-apply-filters,
.btn-reset-filters {
    flex: 1;
    padding: 10px 20px;
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

.btn-apply-filters {
    background: var(--primary-color, #667eea);
    color: white;
}

.btn-apply-filters:hover {
    background: var(--primary-hover, #5a67d8);
}

.btn-reset-filters {
    background: var(--bg-secondary, #f0f0f0);
    color: var(--text-primary, #333);
}

.btn-reset-filters:hover {
    background: var(--bg-hover, #e0e0e0);
}

/* Адаптивность */
@media (max-width: 768px) {
    .filter-grid {
        grid-template-columns: 1fr;
    }
    
    .filter-actions {
        flex-direction: column;
    }
}
</style>
`;

// Добавляем стили в документ
if (!document.querySelector('#transaction-filter-styles')) {
    const styleElement = document.createElement('div');
    styleElement.id = 'transaction-filter-styles';
    styleElement.innerHTML = styles;
    document.head.appendChild(styleElement.firstElementChild);
}
