}

.metric-details-modal .modal-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
}

.metric-details-modal .modal-content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    border-radius: 12px;
    width: 90%;
    max-width: 500px;
    max-height: 80vh;
    overflow: auto;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    transition: transform 0.3s ease;
}

.metric-details-modal.show .modal-content {
    transform: translate(-50%, -50%) scale(1);
}

.metric-details-modal .modal-header {
    padding: 20px;
    border-bottom: 1px solid #e0e0e0;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.metric-details-modal .modal-header h3 {
    margin: 0;
    font-size: 20px;
    color: #333;
}

.metric-details-modal .modal-close {
    background: none;
    border: none;
    font-size: 28px;
    color: #666;
    cursor: pointer;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: background 0.3s ease;
}

.metric-details-modal .modal-close:hover {
    background: #f0f0f0;
}

.metric-details-modal .modal-body {
    padding: 20px;
}

.detail-current {
    background: #f8f8f8;
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.detail-label {
    font-size: 14px;
    color: #666;
}

.detail-value {
    font-size: 24px;
    font-weight: 600;
    color: #667eea;
}

.detail-description {
    margin-bottom: 20px;
}

.detail-description p {
    font-size: 14px;
    line-height: 1.6;
    color: #666;
}

.detail-chart {
    height: 200px;
    margin-bottom: 20px;
}

.detail-stats {
    display: flex;
    justify-content: space-between;
    gap: 15px;
}

.stat-item {
    flex: 1;
    text-align: center;
    padding: 10px;
    background: #f8f8f8;
    border-radius: 8px;
}

.stat-label {
    display: block;
    font-size: 12px;
    color: #666;
    margin-bottom: 5px;
}

.stat-value {
    display: block;
    font-size: 18px;
    font-weight: 600;
    color: #333;
}

/* Темная тема */
@media (prefers-color-scheme: dark) {
    .metric-details-modal .modal-content {
        background: #2a2a2a;
    }
    
    .metric-details-modal .modal-header {
        border-bottom-color: #4a4a4a;
    }
    
    .metric-details-modal .modal-header h3 {
        color: #f0f0f0;
    }
    
    .metric-details-modal .modal-close {
        color: #a0a0a0;
    }
    
    .metric-details-modal .modal-close:hover {
        background: #3a3a3a;
    }
    
    .detail-current,
    .stat-item {
        background: #3a3a3a;
    }
    
    .detail-label,
    .detail-description p,
    .stat-label {
        color: #a0a0a0;
    }
    
    .detail-value,
    .stat-value {
        color: #f0f0f0;
    }
}
</style>
`;

// Добавляем стили в документ
if (!document.querySelector('#metrics-panel-styles')) {
    const styleElement = document.createElement('div');
    styleElement.id = 'metrics-panel-styles';
    styleElement.innerHTML = styles;
    document.head.appendChild(styleElement.firstElementChild);
}
