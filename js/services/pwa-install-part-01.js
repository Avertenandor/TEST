                transition: all 0.3s ease;
            }
            
            .pwa-install-modal-close:hover {
                background: rgba(255, 255, 255, 0.1);
                color: var(--primary-color);
                transform: rotate(90deg);
            }
            
            .pwa-install-modal-body {
                padding: 2rem;
                color: var(--text-primary);
            }
            
            .pwa-install-modal-body ol {
                margin: 1rem 0;
                padding-left: 1.5rem;
                line-height: 2;
            }
            
            .pwa-install-modal-body li {
                margin-bottom: 0.5rem;
            }
            
            .pwa-install-modal-footer {
                padding: 1.5rem;
                border-top: 1px solid var(--border-color);
                text-align: center;
            }
            
            /* Анимация пульсации */
            @keyframes pulse {
                0% {
                    transform: scale(1);
                }
                50% {
                    transform: scale(1.1);
                }
                100% {
                    transform: scale(1);
                }
            }
            
            /* Мобильная адаптация */
            @media (max-width: 768px) {
                .pwa-install-button {
                    bottom: 70px;
                    right: 10px;
                    left: 10px;
                    border-radius: 15px;
                }
                
                .pwa-install-modal-content {
                    margin: 1rem;
                }
            }
        `;
        
        document.head.appendChild(styles);
    },

    // MCP-MARKER:METHOD:CHECK_COMPATIBILITY - Проверка совместимости
    checkCompatibility() {
        const features = {
            serviceWorker: 'serviceWorker' in navigator,
            promise: 'Promise' in window,
            fetch: 'fetch' in window,
            notification: 'Notification' in window,
            pushManager: 'PushManager' in window
        };
        
        const unsupported = Object.entries(features)
            .filter(([feature, supported]) => !supported)
            .map(([feature]) => feature);
        
        if (unsupported.length > 0) {
            console.warn('⚠️ Неподдерживаемые функции:', unsupported);
        }
        
        return unsupported.length === 0;
    },

    // MCP-MARKER:METHOD:ADD_TO_HOME_SCREEN - Добавить на главный экран (для iOS)
    addToHomeScreen() {
        // Специальная обработка для iOS
        if (this.state.platform === 'ios' && !this.state.isStandalone) {
            const lastPromptTime = localStorage.getItem('pwa-ios-prompt-time');
            const now = Date.now();
            
            // Показываем подсказку раз в 7 дней
            if (!lastPromptTime || now - lastPromptTime > 7 * 24 * 60 * 60 * 1000) {
                this.showiOSInstallPrompt();
                localStorage.setItem('pwa-ios-prompt-time', now);
            }
        }
    },

    // MCP-MARKER:METHOD:SHOW_IOS_PROMPT - Показать подсказку для iOS
    showiOSInstallPrompt() {
        const prompt = document.createElement('div');
        prompt.className = 'pwa-ios-prompt';
        prompt.innerHTML = `
            <div class="pwa-ios-prompt-content">
                <div class="pwa-ios-prompt-arrow"></div>
                <div class="pwa-ios-prompt-text">
                    Установите приложение: нажмите <span style="font-size: 1.2em;">⎘</span> и выберите<br>
                    "На экран «Домой»" <span style="font-size: 1.2em;">⊕</span>
                </div>
                <button class="pwa-ios-prompt-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        document.body.appendChild(prompt);
        
        // Автоматически скрыть через 10 секунд
        setTimeout(() => {
            prompt.remove();
        }, 10000);
    }
};

// MCP-MARKER:INITIALIZATION:AUTO_INIT - Автоматическая инициализация
document.addEventListener('DOMContentLoaded', () => {
    window.PWAInstallManager.init();
    
    // Проверяем совместимость
    if (!window.PWAInstallManager.checkCompatibility()) {
        console.warn('⚠️ Браузер не полностью поддерживает PWA функции');
    }
    
    // Для iOS показываем подсказку
    window.PWAInstallManager.addToHomeScreen();
});

// Экспорт для других модулей
window.installPWA = () => window.PWAInstallManager.installApp();

console.log('📱 PWA Install Manager загружен');
