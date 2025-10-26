// modules/device/device.module.js
// Модуль информации об устройстве и PWA установки GENESIS

import DeviceAPI from './device.api.js';
import DeviceState from './device.state.js';

export default class DeviceModule {
    constructor() {
        this.name = 'device';
        this.version = '1.0.0';
        this.dependencies = ['auth'];
        
        this.state = null;
        this.api = null;
        this.container = null;
        this.context = null;
        this.subscriptions = [];
        this.updateInterval = null;
    }
    
    async init(context) {
        console.log('📱 Initializing Device Module...');
        
        this.context = context;
        this.container = context.container;
        
        try {
            // Инициализация состояния
            this.state = new DeviceState();
            
            // Инициализация API
            this.api = new DeviceAPI(context.config);
            
            // Загрузка шаблона
            await this.loadTemplate();
            
            // Загрузка стилей
            await this.loadStyles();
            
            // Сбор информации об устройстве
            await this.collectDeviceInfo();
            
            // Инициализация обработчиков
            this.initEventHandlers();
            
            // Подписка на события
            this.subscribeToEvents();
            
            // Первичный рендеринг
            this.render();
            
            // Запуск мониторинга
            this.startMonitoring();
            
            console.log('✅ Device Module initialized successfully');
            return this;
            
        } catch (error) {
            console.error('❌ Failed to initialize Device Module:', error);
            throw error;
        }
    }
    
    async loadTemplate() {
        try {
            const response = await fetch('/modules/device/device.template.html');
            const html = await response.text();
            this.container.innerHTML = html;
        } catch (error) {
            console.error('Failed to load device template:', error);
            this.container.innerHTML = this.getFallbackTemplate();
        }
    }
    
    async loadStyles() {
        const existingLink = document.querySelector(`link[data-module="${this.name}"]`);
        if (existingLink) return;
        
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/modules/device/device.styles.css';
        link.dataset.module = this.name;
        document.head.appendChild(link);
    }
    
    async collectDeviceInfo() {
        // Сбор информации о браузере
        const browserInfo = {
            userAgent: navigator.userAgent,
            language: navigator.language,
            languages: navigator.languages,
            platform: navigator.platform,
            vendor: navigator.vendor,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine,
            doNotTrack: navigator.doNotTrack,
            hardwareConcurrency: navigator.hardwareConcurrency || 'N/A',
            maxTouchPoints: navigator.maxTouchPoints || 0
        };
        
        // Информация об экране
        const screenInfo = {
            width: screen.width,
            height: screen.height,
            availWidth: screen.availWidth,
            availHeight: screen.availHeight,
            colorDepth: screen.colorDepth,
            pixelDepth: screen.pixelDepth,
            orientation: screen.orientation ? screen.orientation.type : 'unknown',
            devicePixelRatio: window.devicePixelRatio || 1
        };
        
        // Информация о памяти (если доступна)
        const memoryInfo = {};
        if (navigator.deviceMemory) {
            memoryInfo.deviceMemory = navigator.deviceMemory + ' GB';
        }
        if (performance && performance.memory) {
            memoryInfo.jsHeapSizeLimit = this.formatBytes(performance.memory.jsHeapSizeLimit);
            memoryInfo.totalJSHeapSize = this.formatBytes(performance.memory.totalJSHeapSize);
            memoryInfo.usedJSHeapSize = this.formatBytes(performance.memory.usedJSHeapSize);
        }
        
        // Информация о батарее (если доступна)
        let batteryInfo = null;
        if (navigator.getBattery) {
            try {
                const battery = await navigator.getBattery();
                batteryInfo = {
                    level: Math.round(battery.level * 100) + '%',
                    charging: battery.charging,
                    chargingTime: battery.chargingTime !== Infinity ? 
                        Math.round(battery.chargingTime / 60) + ' мин' : 'N/A',
                    dischargingTime: battery.dischargingTime !== Infinity ? 
                        Math.round(battery.dischargingTime / 60) + ' мин' : 'N/A'
                };
            } catch (error) {
                console.warn('Battery API not available:', error);
            }
        }
        
        // Информация о соединении
        const connectionInfo = {};
        if (navigator.connection) {
            connectionInfo.effectiveType = navigator.connection.effectiveType;
            connectionInfo.downlink = navigator.connection.downlink + ' Mbps';
            connectionInfo.rtt = navigator.connection.rtt + ' ms';
            connectionInfo.saveData = navigator.connection.saveData;
        }
        
        // Информация о GPU
        let gpuInfo = 'N/A';
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (gl) {
                const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                if (debugInfo) {
                    gpuInfo = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                }
            }
        } catch (error) {
            console.warn('WebGL not available:', error);
        }
        
        // Определение типа устройства
        const deviceType = this.detectDeviceType();
        
        // Определение ОС
        const osInfo = this.detectOS();
        
        // Определение браузера
        const browserName = this.detectBrowser();
        
        // PWA статус
        const pwaStatus = {
            standalone: window.matchMedia('(display-mode: standalone)').matches,
            installed: window.navigator.standalone === true ||
                      window.matchMedia('(display-mode: standalone)').matches,
            installable: 'serviceWorker' in navigator,
            notificationPermission: 'Notification' in window ? 
                Notification.permission : 'not supported'
        };
        
        // Сохранение в состоянии
        this.state.setDeviceInfo({
            browser: browserInfo,
            screen: screenInfo,
            memory: memoryInfo,
            battery: batteryInfo,
            connection: connectionInfo,
            gpu: gpuInfo,
            deviceType: deviceType,
            os: osInfo,
            browserName: browserName,
            pwa: pwaStatus
        });
    }
    
    detectDeviceType() {
        const ua = navigator.userAgent.toLowerCase();
        
        if (/ipad|tablet/i.test(ua)) return 'Планшет';
        if (/mobile|iphone|android/i.test(ua)) return 'Смартфон';
        if (/tv|television|smarttv/i.test(ua)) return 'Smart TV';
        if (/xbox|playstation/i.test(ua)) return 'Игровая консоль';
        
        return 'Компьютер';
    }
    
    detectOS() {
        const ua = navigator.userAgent;
        const platform = navigator.platform;
        
        if (/Win/i.test(platform)) {
            if (/Windows NT 10/i.test(ua)) return 'Windows 10';
            if (/Windows NT 11/i.test(ua)) return 'Windows 11';
            return 'Windows';
        }
        if (/Mac/i.test(platform)) return 'macOS';
        if (/Linux/i.test(platform)) {
            if (/Android/i.test(ua)) return 'Android';
            return 'Linux';
        }
        if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS';
        
        return 'Unknown OS';
    }
    
    detectBrowser() {
        const ua = navigator.userAgent;
        
        if (/Edg/i.test(ua)) return 'Microsoft Edge';
        if (/Chrome/i.test(ua) && !/Edg/i.test(ua)) return 'Google Chrome';
        if (/Firefox/i.test(ua)) return 'Mozilla Firefox';
        if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) return 'Safari';
        if (/Opera|OPR/i.test(ua)) return 'Opera';
        if (/Brave/i.test(ua)) return 'Brave';
        
        return 'Unknown Browser';
    }
    
    initEventHandlers() {
        // PWA установка
        const installBtn = this.container.querySelector('#pwa-install-btn');
        if (installBtn) {
            installBtn.addEventListener('click', () => this.installPWA());
        }
        
        // Кнопка обновления информации
        const refreshBtn = this.container.querySelector('#refresh-device-info');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshDeviceInfo());
        }
        
        // Копирование информации
        const copyBtn = this.container.querySelector('#copy-device-info');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => this.copyDeviceInfo());
        }
        
        // Тест производительности
        const perfTestBtn = this.container.querySelector('#run-performance-test');
        if (perfTestBtn) {
            perfTestBtn.addEventListener('click', () => this.runPerformanceTest());
        }
        
        // Проверка разрешений
        const checkPermBtn = this.container.querySelector('#check-permissions');
        if (checkPermBtn) {
            checkPermBtn.addEventListener('click', () => this.checkPermissions());
        }
        
        // Переключение вкладок
        const tabs = this.container.querySelectorAll('.device-tabs button');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });
    }
    
    subscribeToEvents() {
        // Подписка на глобальные события
        this.subscriptions.push(
            this.context.eventBus.on('device:refresh', () => this.refreshDeviceInfo())
        );
        
        // События PWA
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.state.setPWAPrompt(e);
            this.updatePWAStatus();
        });
        
        window.addEventListener('appinstalled', () => {
            console.log('✅ PWA was installed');
            this.state.setPWAInstalled(true);
            this.updatePWAStatus();
        });
    }
    
    render() {
        const deviceInfo = this.state.getDeviceInfo();
        
        // Обновление основной информации
        this.renderBasicInfo(deviceInfo);
        
        // Обновление технической информации
        this.renderTechnicalInfo(deviceInfo);
        
        // Обновление PWA статуса
        this.renderPWAStatus(deviceInfo.pwa);
        
        // Обновление производительности
        this.renderPerformanceInfo();
    }
    
    renderBasicInfo(info) {
        const container = this.container.querySelector('#basic-info');
        if (!container) return;
        
        container.innerHTML = `
            <div class="info-card">
                <h3>🖥️ Основная информация</h3>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">Тип устройства:</span>
                        <span class="info-value">${info.deviceType}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Операционная система:</span>
                        <span class="info-value">${info.os}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Браузер:</span>
                        <span class="info-value">${info.browserName}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Язык:</span>
                        <span class="info-value">${info.browser.language}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Онлайн статус:</span>
                        <span class="info-value ${info.browser.onLine ? 'text-success' : 'text-danger'}">
                            ${info.browser.onLine ? '✅ Онлайн' : '❌ Офлайн'}
                        </span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Cookies:</span>
                        <span class="info-value ${info.browser.cookieEnabled ? 'text-success' : 'text-danger'}">
                            ${info.browser.cookieEnabled ? '✅ Включены' : '❌ Отключены'}
                        </span>
                    </div>
                </div>
            </div>
            
            <div class="info-card">
                <h3>📱 Экран</h3>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">Разрешение:</span>
                        <span class="info-value">${info.screen.width} × ${info.screen.height}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Рабочая область:</span>
                        <span class="info-value">${info.screen.availWidth} × ${info.screen.availHeight}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Глубина цвета:</span>
                        <span class="info-value">${info.screen.colorDepth} бит</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Pixel Ratio:</span>
                        <span class="info-value">${info.screen.devicePixelRatio}x</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Ориентация:</span>
                        <span class="info-value">${info.screen.orientation}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Touch Points:</span>
                        <span class="info-value">${info.browser.maxTouchPoints}</span>
                    </div>
                </div>
            </div>
            
            ${info.battery ? `
            <div class="info-card">
                <h3>🔋 Батарея</h3>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">Уровень заряда:</span>
                        <span class="info-value">${info.battery.level}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Статус:</span>
                        <span class="info-value ${info.battery.charging ? 'text-success' : ''}">
                            ${info.battery.charging ? '⚡ Заряжается' : '🔌 От батареи'}
                        </span>
                    </div>
                    ${info.battery.charging ? `
                    <div class="info-item">
                        <span class="info-label">До полной зарядки:</span>
                        <span class="info-value">${info.battery.chargingTime}</span>
                    </div>` : `
                    <div class="info-item">
                        <span class="info-label">Время работы:</span>
                        <span class="info-value">${info.battery.dischargingTime}</span>
                    </div>`}
                </div>
            </div>
            ` : ''}
            
            ${info.connection && Object.keys(info.connection).length > 0 ? `
            <div class="info-card">
                <h3>🌐 Соединение</h3>
                <div class="info-grid">
                    ${info.connection.effectiveType ? `
                    <div class="info-item">
                        <span class="info-label">Тип соединения:</span>
                        <span class="info-value">${info.connection.effectiveType}</span>
                    </div>` : ''}
                    ${info.connection.downlink ? `
                    <div class="info-item">
                        <span class="info-label">Скорость:</span>
                        <span class="info-value">${info.connection.downlink}</span>
                    </div>` : ''}
                    ${info.connection.rtt ? `
                    <div class="info-item">
                        <span class="info-label">Задержка:</span>
                        <span class="info-value">${info.connection.rtt}</span>
                    </div>` : ''}
                    ${info.connection.saveData !== undefined ? `
                    <div class="info-item">
                        <span class="info-label">Экономия трафика:</span>
                        <span class="info-value">${info.connection.saveData ? 'Да' : 'Нет'}</span>
                    </div>` : ''}
                </div>
            </div>
            ` : ''}
        `;
    }
    
    renderTechnicalInfo(info) {
        const container = this.container.querySelector('#technical-info');
        if (!container) return;
        
        container.innerHTML = `
            <div class="info-card">
                <h3>⚙️ Техническая информация</h3>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">Платформа:</span>
                        <span class="info-value">${info.browser.platform}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Ядра процессора:</span>
                        <span class="info-value">${info.browser.hardwareConcurrency}</span>
                    </div>
                    ${info.memory.deviceMemory ? `
                    <div class="info-item">
                        <span class="info-label">RAM:</span>
                        <span class="info-value">${info.memory.deviceMemory}</span>
                    </div>` : ''}
                    <div class="info-item">
                        <span class="info-label">GPU:</span>
                        <span class="info-value" title="${info.gpu}">${this.truncateText(info.gpu, 30)}</span>
                    </div>
                </div>
            </div>
            
            ${info.memory.jsHeapSizeLimit ? `
            <div class="info-card">
                <h3>💾 Память JavaScript</h3>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">Лимит:</span>
                        <span class="info-value">${info.memory.jsHeapSizeLimit}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Всего:</span>
                        <span class="info-value">${info.memory.totalJSHeapSize}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Используется:</span>
                        <span class="info-value">${info.memory.usedJSHeapSize}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Процент использования:</span>
                        <span class="info-value">
                            ${this.calculateMemoryUsage()}%
                        </span>
                    </div>
                </div>
            </div>
            ` : ''}
            
            <div class="info-card">
                <h3>🔧 User Agent</h3>
                <div class="user-agent-text">
                    ${info.browser.userAgent}
                </div>
            </div>
        `;
    }
    
    renderPWAStatus(pwaInfo) {
        const container = this.container.querySelector('#pwa-status');
        if (!container) return;
        
        const isInstalled = pwaInfo.installed || pwaInfo.standalone;
        
        container.innerHTML = `
            <div class="pwa-status-card">
                <h3>📱 Progressive Web App</h3>
                
                <div class="pwa-status-grid">
                    <div class="pwa-status-item">
                        <span class="status-icon ${isInstalled ? 'active' : ''}">
                            ${isInstalled ? '✅' : '⭕'}
                        </span>
                        <span class="status-label">Установлено</span>
                    </div>
                    
                    <div class="pwa-status-item">
                        <span class="status-icon ${pwaInfo.installable ? 'active' : ''}">
                            ${pwaInfo.installable ? '✅' : '❌'}
                        </span>
                        <span class="status-label">Поддержка установки</span>
                    </div>
                    
                    <div class="pwa-status-item">
                        <span class="status-icon ${pwaInfo.notificationPermission === 'granted' ? 'active' : ''}">
                            ${pwaInfo.notificationPermission === 'granted' ? '✅' : 
                              pwaInfo.notificationPermission === 'denied' ? '❌' : '⭕'}
                        </span>
                        <span class="status-label">Уведомления</span>
                    </div>
                    
                    <div class="pwa-status-item">
                        <span class="status-icon ${'serviceWorker' in navigator ? 'active' : ''}">
                            ${'serviceWorker' in navigator ? '✅' : '❌'}
                        </span>
                        <span class="status-label">Service Worker</span>
                    </div>
                </div>
                
                ${!isInstalled && pwaInfo.installable ? `
                <div class="pwa-install-section">
                    <p class="pwa-install-text">
                        Установите GENESIS как приложение для быстрого доступа и работы офлайн!
                    </p>
                    <button id="pwa-install-btn" class="btn btn-primary btn-large">
                        <span class="icon">📲</span>
                        Установить приложение
                    </button>
                </div>
                ` : isInstalled ? `
                <div class="pwa-installed-info">
                    <p class="success-message">
                        ✅ GENESIS установлен как приложение
                    </p>
                </div>
                ` : ''}
                
                <div class="pwa-features">
                    <h4>Возможности PWA:</h4>
                    <ul>
                        <li>✓ Работа без интернета</li>
                        <li>✓ Быстрая загрузка</li>
                        <li>✓ Push-уведомления</li>
                        <li>✓ Иконка на рабочем столе</li>
                        <li>✓ Полноэкранный режим</li>
                    </ul>
                </div>
            </div>
        `;
    }
    
    renderPerformanceInfo() {
        const container = this.container.querySelector('#performance-info');
        if (!container) return;
        
        const perfData = this.state.getPerformanceData();
        
        container.innerHTML = `
            <div class="info-card">
                <h3>⚡ Производительность</h3>
                
                <button id="run-performance-test" class="btn btn-secondary">
                    Запустить тест производительности
                </button>
                
                ${perfData ? `
                <div class="performance-results">
                    <div class="perf-metric">
                        <span class="metric-label">CPU Score:</span>
                        <span class="metric-value">${perfData.cpuScore}</span>
                    </div>
                    <div class="perf-metric">
                        <span class="metric-label">Render Time:</span>
                        <span class="metric-value">${perfData.renderTime}ms</span>
                    </div>
                    <div class="perf-metric">
                        <span class="metric-label">FPS:</span>
                        <span class="metric-value">${perfData.fps}</span>
                    </div>
                    <div class="perf-metric">
                        <span class="metric-label">Network Latency:</span>
                        <span class="metric-value">${perfData.networkLatency}ms</span>
                    </div>
                </div>
                ` : ''}
            </div>
        `;
    }
    
    async installPWA() {
        const deferredPrompt = this.state.getPWAPrompt();
        
        if (!deferredPrompt) {
            this.showNotification('Приложение уже установлено или установка недоступна', 'info');
            return;
        }
        
        try {
            // Показываем браузерный диалог установки
            deferredPrompt.prompt();
            
            // Ждем ответа пользователя
            const { outcome } = await deferredPrompt.userChoice;
            
            if (outcome === 'accepted') {
                console.log('✅ User accepted PWA installation');
                this.showNotification('Приложение успешно установлено!', 'success');
            } else {
                console.log('❌ User dismissed PWA installation');
                this.showNotification('Установка отменена', 'warning');
            }
            
            // Сбрасываем prompt
            this.state.setPWAPrompt(null);
            
        } catch (error) {
            console.error('PWA installation error:', error);
            this.showNotification('Ошибка установки приложения', 'error');
        }
    }
    
    async refreshDeviceInfo() {
        this.showLoader();
        
        try {
            await this.collectDeviceInfo();
            this.render();
            this.showNotification('Информация обновлена', 'success');
        } catch (error) {
            console.error('Failed to refresh device info:', error);
            this.showNotification('Ошибка обновления информации', 'error');
        } finally {
            this.hideLoader();
        }
    }
    
    async copyDeviceInfo() {
        const info = this.state.getDeviceInfo();
        const text = this.formatDeviceInfoAsText(info);
        
        try {
            await navigator.clipboard.writeText(text);
            this.showNotification('Информация скопирована в буфер обмена', 'success');
        } catch (error) {
            console.error('Failed to copy device info:', error);
            this.showNotification('Не удалось скопировать информацию', 'error');
        }
    }
    
    formatDeviceInfoAsText(info) {
        return `
GENESIS Device Information
==========================
Device Type: ${info.deviceType}
OS: ${info.os}
Browser: ${info.browserName}
Language: ${info.browser.language}
Screen: ${info.screen.width}×${info.screen.height}
GPU: ${info.gpu}
CPU Cores: ${info.browser.hardwareConcurrency}
${info.memory.deviceMemory ? `RAM: ${info.memory.deviceMemory}` : ''}
${info.battery ? `Battery: ${info.battery.level}` : ''}
User Agent: ${info.browser.userAgent}
        `.trim();
    }
    
    async runPerformanceTest() {
        const btn = this.container.querySelector('#run-performance-test');
        if (btn) {
            btn.disabled = true;
            btn.textContent = 'Тестирование...';
        }
        
        try {
            const results = await this.api.runPerformanceTest();
            this.state.setPerformanceData(results);
            this.renderPerformanceInfo();
            this.showNotification('Тест производительности завершен', 'success');
        } catch (error) {
            console.error('Performance test failed:', error);
            this.showNotification('Ошибка теста производительности', 'error');
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.textContent = 'Запустить тест производительности';
            }
        }
    }
    
    async checkPermissions() {
        const permissions = [
            'notifications',
            'camera',
            'microphone',
            'geolocation',
            'clipboard-read',
            'clipboard-write'
        ];
        
        const results = {};
        
        for (const permission of permissions) {
            try {
                const result = await navigator.permissions.query({ name: permission });
                results[permission] = result.state;
            } catch (error) {
                results[permission] = 'not supported';
            }
        }
        
        this.showPermissionsDialog(results);
    }
    
    showPermissionsDialog(permissions) {
        // Здесь можно показать модальное окно с разрешениями
        console.log('Permissions:', permissions);
        
        const modal = document.createElement('div');
        modal.className = 'permissions-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Разрешения браузера</h3>
                <div class="permissions-list">
                    ${Object.entries(permissions).map(([name, status]) => `
                        <div class="permission-item">
                            <span class="permission-name">${this.translatePermission(name)}</span>
                            <span class="permission-status status-${status}">
                                ${this.translateStatus(status)}
                            </span>
                        </div>
                    `).join('')}
                </div>
                <button class="btn btn-primary" onclick="this.parentElement.parentElement.remove()">
                    Закрыть
                </button>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    translatePermission(name) {
        const translations = {
            'notifications': 'Уведомления',
            'camera': 'Камера',
            'microphone': 'Микрофон',
            'geolocation': 'Геолокация',
            'clipboard-read': 'Чтение буфера',
            'clipboard-write': 'Запись в буфер'
        };
        return translations[name] || name;
    }
    
    translateStatus(status) {
        const translations = {
            'granted': '✅ Разрешено',
            'denied': '❌ Запрещено',
            'prompt': '⚠️ Требуется запрос',
            'not supported': '➖ Не поддерживается'
        };
        return translations[status] || status;
    }
    
    switchTab(tabName) {
        const tabs = this.container.querySelectorAll('.device-tabs button');
        const contents = this.container.querySelectorAll('.tab-content');
        
        tabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        
        contents.forEach(content => {
            content.classList.toggle('active', content.dataset.tab === tabName);
        });
    }
    
    startMonitoring() {
        // Обновление информации каждые 30 секунд
        this.updateInterval = setInterval(() => {
            this.updateDynamicInfo();
        }, 30000);
    }
    
    async updateDynamicInfo() {
        // Обновление динамической информации (батарея, соединение и т.д.)
        if (navigator.getBattery) {
            try {
                const battery = await navigator.getBattery();
                const batteryInfo = {
                    level: Math.round(battery.level * 100) + '%',
                    charging: battery.charging
                };
                
                const currentInfo = this.state.getDeviceInfo();
                currentInfo.battery = { ...currentInfo.battery, ...batteryInfo };
                this.state.setDeviceInfo(currentInfo);
                
                // Обновление UI только если модуль активен
                if (this.context.store.get('ui.currentModule') === this.name) {
                    this.render();
                }
            } catch (error) {
                console.warn('Failed to update battery info:', error);
            }
        }
    }
    
    updatePWAStatus() {
        const deviceInfo = this.state.getDeviceInfo();
        this.renderPWAStatus(deviceInfo.pwa);
    }
    
    calculateMemoryUsage() {
        if (!performance || !performance.memory) return 0;
        
        const used = performance.memory.usedJSHeapSize;
        const total = performance.memory.totalJSHeapSize;
        
        return Math.round((used / total) * 100);
    }
    
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }
    
    getFallbackTemplate() {
        return `
            <div class="device-module">
                <div class="module-header">
                    <h2>📱 Информация об устройстве</h2>
                    <div class="header-actions">
                        <button id="refresh-device-info" class="btn btn-icon">🔄</button>
                        <button id="copy-device-info" class="btn btn-icon">📋</button>
                    </div>
                </div>
                
                <div class="device-tabs">
                    <button class="tab-btn active" data-tab="basic">Основное</button>
                    <button class="tab-btn" data-tab="technical">Техническое</button>
                    <button class="tab-btn" data-tab="pwa">PWA</button>
                    <button class="tab-btn" data-tab="performance">Производительность</button>
                </div>
                
                <div class="tab-content active" data-tab="basic" id="basic-info">
                    <!-- Basic info will be rendered here -->
                </div>
                
                <div class="tab-content" data-tab="technical" id="technical-info">
                    <!-- Technical info will be rendered here -->
                </div>
                
                <div class="tab-content" data-tab="pwa" id="pwa-status">
                    <!-- PWA status will be rendered here -->
                </div>
                
                <div class="tab-content" data-tab="performance" id="performance-info">
                    <!-- Performance info will be rendered here -->
                </div>
            </div>
        `;
    }
    
    showNotification(message, type = 'info') {
        if (this.context && this.context.eventBus) {
            this.context.eventBus.emit('notification:show', { message, type });
        }
    }
    
    showLoader() {
        const loader = document.getElementById('global-loader');
        if (loader) loader.classList.remove('hidden');
    }
    
    hideLoader() {
        const loader = document.getElementById('global-loader');
        if (loader) loader.classList.add('hidden');
    }
    
    destroy() {
        console.log('🧹 Destroying Device Module...');
        
        // Остановка мониторинга
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        // Отписка от событий
        this.subscriptions.forEach(unsub => {
            if (typeof unsub === 'function') unsub();
        });
        
        // Удаление стилей
        const link = document.querySelector(`link[data-module="${this.name}"]`);
        if (link) link.remove();
        
        // Очистка контейнера
        if (this.container) {
            this.container.innerHTML = '';
        }
        
        // Очистка состояния
        if (this.state) this.state.clear();
        
        console.log('✅ Device Module destroyed');
    }
}
