/**
 * GENESIS 1.1 - PWA Установка
 * MCP-MARKER:MODULE:PWA_INSTALL - Модуль установки PWA
 * MCP-MARKER:FILE:PWA_INSTALL_JS - Управление установкой приложения
 */

// MCP-MARKER:CLASS:PWA_INSTALL_MANAGER - Менеджер установки PWA
window.PWAInstallManager = {
    // MCP-MARKER:PROPERTY:INSTALL_STATE - Состояние установки
    state: {
        deferredPrompt: null,
        isInstalled: false,
        isStandalone: false,
        installSupported: false,
        platform: null
    },

    // MCP-MARKER:METHOD:INIT - Инициализация
    init() {
        console.log('🚀 Инициализация PWA Install Manager');
        
        // Проверяем, установлено ли приложение
        this.checkInstallState();
        
        // Слушаем событие beforeinstallprompt
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('📱 Событие beforeinstallprompt получено');
            e.preventDefault();
            this.state.deferredPrompt = e;
            this.state.installSupported = true;
            this.showInstallButton();
            
            // Логируем в терминал
            if (window.GenesisTerminal) {
                window.GenesisTerminal.log('📱 Приложение готово к установке', 'success');
            }
        });

        // Слушаем изменения в установке
        window.addEventListener('appinstalled', () => {
            console.log('✅ Приложение установлено');
            this.state.isInstalled = true;
            this.hideInstallButton();
            this.showNotification('Приложение установлено!', 'success');
            
            if (window.GenesisTerminal) {
                window.GenesisTerminal.log('✅ GENESIS 1.1 установлен как приложение', 'success');
            }
        });

        // Определяем платформу
        this.detectPlatform();
        
        // Регистрируем Service Worker
        this.registerServiceWorker();
        
        return this;
    },

    // MCP-MARKER:METHOD:CHECK_INSTALL_STATE - Проверка состояния установки
    checkInstallState() {
        // Проверяем standalone режим
        this.state.isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                                  window.navigator.standalone ||
                                  document.referrer.includes('android-app://');
        
        // Проверяем, установлено ли приложение
        if ('getInstalledRelatedApps' in navigator) {
            navigator.getInstalledRelatedApps().then(apps => {
                this.state.isInstalled = apps.length > 0;
                console.log('📱 Установленные связанные приложения:', apps);
            });
        }
        
        if (this.state.isStandalone) {
            console.log('🎯 Приложение запущено в standalone режиме');
            this.hideInstallElements();
        }
    },

    // MCP-MARKER:METHOD:DETECT_PLATFORM - Определение платформы
    detectPlatform() {
        const ua = navigator.userAgent || navigator.vendor || window.opera;
        
        if (/android/i.test(ua)) {
            this.state.platform = 'android';
        } else if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) {
            this.state.platform = 'ios';
        } else if (/windows phone/i.test(ua)) {
            this.state.platform = 'windows-phone';
        } else if (/Mac/i.test(ua)) {
            this.state.platform = 'macos';
        } else if (/Win/i.test(ua)) {
            this.state.platform = 'windows';
        } else if (/Linux/i.test(ua)) {
            this.state.platform = 'linux';
        } else {
            this.state.platform = 'unknown';
        }
        
        console.log('📱 Определена платформа:', this.state.platform);
    },

    // MCP-MARKER:METHOD:REGISTER_SERVICE_WORKER - Регистрация Service Worker
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('✅ Service Worker зарегистрирован:', registration);
                
                // Проверяем обновления
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.showUpdateNotification();
                        }
                    });
                });
            } catch (error) {
                console.error('❌ Ошибка регистрации Service Worker:', error);
            }
        }
    },

    // MCP-MARKER:METHOD:SHOW_INSTALL_BUTTON - Показать кнопку установки
    showInstallButton() {
        // Создаем кнопку если её нет
        let installButton = document.getElementById('pwa-install-button');
        if (!installButton) {
            installButton = this.createInstallButton();
        }
        
        installButton.style.display = 'flex';
        installButton.classList.add('pwa-install-visible');
        
        // Анимация появления
        setTimeout(() => {
            installButton.classList.add('pwa-install-animated');
        }, 100);
    },

    // MCP-MARKER:METHOD:CREATE_INSTALL_BUTTON - Создать кнопку установки
    createInstallButton() {
        const button = document.createElement('div');
        button.id = 'pwa-install-button';
        button.className = 'pwa-install-button';
        button.innerHTML = `
            <div class="pwa-install-icon">📱</div>
            <div class="pwa-install-text">
                <div class="pwa-install-title">Установить приложение</div>
                <div class="pwa-install-subtitle">Быстрый доступ к GENESIS 1.1</div>
            </div>
            <div class="pwa-install-close" onclick="window.PWAInstallManager.hideInstallButton()">×</div>
        `;
        
        button.addEventListener('click', (e) => {
            if (!e.target.classList.contains('pwa-install-close')) {
                this.installApp();
            }
        });
        
        document.body.appendChild(button);
        
        // Добавляем стили
        this.injectStyles();
        
        return button;
    },

    // MCP-MARKER:METHOD:INSTALL_APP - Установить приложение
    async installApp() {
        console.log('🚀 Начало установки приложения');
        
        if (!this.state.deferredPrompt) {
            console.log('❌ Нет сохраненного промпта установки');
            this.showManualInstallInstructions();
            return;
        }
        
        // Показываем промпт установки
        this.state.deferredPrompt.prompt();
        
        // Ждем выбор пользователя
        const { outcome } = await this.state.deferredPrompt.userChoice;
        console.log(`📱 Пользователь выбрал: ${outcome}`);
        
        if (outcome === 'accepted') {
            console.log('✅ Пользователь согласился установить приложение');
            if (window.GenesisTerminal) {
                window.GenesisTerminal.log('🎉 Установка GENESIS 1.1 началась', 'success');
            }
        } else {
            console.log('❌ Пользователь отказался от установки');
            if (window.GenesisTerminal) {
                window.GenesisTerminal.log('❌ Установка отменена пользователем', 'warning');
            }
        }
        
        // Очищаем промпт
        this.state.deferredPrompt = null;
        this.hideInstallButton();
    },

    // MCP-MARKER:METHOD:SHOW_MANUAL_INSTALL - Показать инструкции по установке
    showManualInstallInstructions() {
        let instructions = '';
        
        switch (this.state.platform) {
            case 'ios':
                instructions = `
                    <h3>📱 Установка на iOS</h3>
                    <ol>
                        <li>Нажмите кнопку "Поделиться" <span style="font-size: 1.2em;">⎘</span></li>
                        <li>Выберите "На экран «Домой»" <span style="font-size: 1.2em;">⊕</span></li>
                        <li>Нажмите "Добавить"</li>
                    </ol>
                `;
                break;
            case 'android':
                instructions = `
                    <h3>📱 Установка на Android</h3>
                    <ol>
                        <li>Нажмите меню браузера <span style="font-size: 1.2em;">⋮</span></li>
                        <li>Выберите "Добавить на главный экран"</li>
                        <li>Нажмите "Добавить"</li>
                    </ol>
                `;
                break;
            case 'windows':
            case 'macos':
            case 'linux':
                instructions = `
                    <h3>💻 Установка на компьютер</h3>
                    <p>В адресной строке браузера нажмите на иконку установки <span style="font-size: 1.2em;">⊕</span></p>
                    <p>Или используйте меню браузера → "Установить GENESIS 1.1"</p>
                `;
                break;
            default:
                instructions = `
                    <h3>📱 Установка приложения</h3>
                    <p>Используйте меню вашего браузера для добавления на главный экран</p>
                `;
        }
        
        // Показываем модальное окно с инструкциями
        this.showModal('Как установить GENESIS 1.1', instructions);
    },

    // MCP-MARKER:METHOD:SHOW_MODAL - Показать модальное окно
    showModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'pwa-install-modal';
        modal.innerHTML = `
            <div class="pwa-install-modal-content">
                <div class="pwa-install-modal-header">
                    <h3>${title}</h3>
                    <button class="pwa-install-modal-close" onclick="this.parentElement.parentElement.parentElement.remove()">×</button>
                </div>
                <div class="pwa-install-modal-body">
                    ${content}
                </div>
                <div class="pwa-install-modal-footer">
                    <button class="btn btn-secondary" onclick="this.parentElement.parentElement.parentElement.remove()">Понятно</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Анимация появления
        setTimeout(() => {
            modal.classList.add('pwa-install-modal-visible');
        }, 10);
    },

    // MCP-MARKER:METHOD:HIDE_INSTALL_BUTTON - Скрыть кнопку установки
    hideInstallButton() {
        const button = document.getElementById('pwa-install-button');
        if (button) {
            button.classList.remove('pwa-install-animated');
            setTimeout(() => {
                button.style.display = 'none';
            }, 300);
        }
    },

    // MCP-MARKER:METHOD:HIDE_INSTALL_ELEMENTS - Скрыть элементы установки
    hideInstallElements() {
        // Скрываем все элементы связанные с установкой
        const elements = document.querySelectorAll('.install-prompt, .pwa-install-hint, #pwa-install-button');
        elements.forEach(el => el.style.display = 'none');
    },

    // MCP-MARKER:METHOD:SHOW_UPDATE_NOTIFICATION - Показать уведомление об обновлении
    showUpdateNotification() {
        this.showNotification('Доступно обновление приложения!', 'info', {
            action: () => {
                window.location.reload();
            },
            actionText: 'Обновить'
        });
    },

    // MCP-MARKER:METHOD:SHOW_NOTIFICATION - Показать уведомление
    showNotification(message, type = 'info', options = {}) {
        if (window.CabinetApp && window.CabinetApp.showNotification) {
            window.CabinetApp.showNotification('PWA', message, type);
        } else {
            console.log(`[PWA ${type.toUpperCase()}] ${message}`);
        }
    },

    // MCP-MARKER:METHOD:INJECT_STYLES - Добавить стили
    injectStyles() {
        if (document.getElementById('pwa-install-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'pwa-install-styles';
        styles.textContent = `
            /* Кнопка установки PWA */
            .pwa-install-button {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 50px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                cursor: pointer;
                display: none;
                align-items: center;
                gap: 1rem;
                z-index: 1000;
                transform: translateY(100px);
                transition: all 0.3s ease;
                font-family: 'Rajdhani', sans-serif;
            }
            
            .pwa-install-button.pwa-install-visible {
                display: flex;
            }
            
            .pwa-install-button.pwa-install-animated {
                transform: translateY(0);
            }
            
            .pwa-install-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 30px rgba(0, 0, 0, 0.4);
            }
            
            .pwa-install-icon {
                font-size: 2rem;
                animation: pulse 2s infinite;
            }
            
            .pwa-install-text {
                flex: 1;
            }
            
            .pwa-install-title {
                font-size: 1.1rem;
                font-weight: 600;
                margin-bottom: 0.2rem;
            }
            
            .pwa-install-subtitle {
                font-size: 0.85rem;
                opacity: 0.9;
            }
            
            .pwa-install-close {
                width: 30px;
                height: 30px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.5rem;
                line-height: 1;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .pwa-install-close:hover {
                background: rgba(255, 255, 255, 0.3);
                transform: rotate(90deg);
            }
            
            /* Модальное окно с инструкциями */
            .pwa-install-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 2000;
                opacity: 0;
                transition: opacity 0.3s ease;
                backdrop-filter: blur(5px);
            }
            
            .pwa-install-modal.pwa-install-modal-visible {
                opacity: 1;
            }
            
            .pwa-install-modal-content {
                background: var(--bg-secondary);
                border-radius: 15px;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
                max-width: 500px;
                width: 90%;
                border: 1px solid var(--border-color);
            }
            
            .pwa-install-modal-header {
                padding: 1.5rem;
                border-bottom: 1px solid var(--border-color);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .pwa-install-modal-header h3 {
                color: var(--primary-color);
                margin: 0;
                font-family: 'Orbitron', monospace;
            }
            
            .pwa-install-modal-close {
                background: none;
                border: none;
                color: var(--text-secondary);
                font-size: 2rem;
                cursor: pointer;
                line-height: 1;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
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
