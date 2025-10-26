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
