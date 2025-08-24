/**
 * GENESIS 1.1 - Полнофункциональный сервис технической информации устройства
 * MCP-MARKER:MODULE:TECH_INFO_SERVICE - Сервис технической информации
 */

// MCP-MARKER:FIX:IDEMPOTENT_CLASS - Защита от повторного объявления класса
if (typeof window.GenesisTechInfo === 'undefined') {
    class GenesisTechInfo {
        // MCP-MARKER:METHOD:TECH_INFO:CONSTRUCTOR - Инициализация сервиса
        constructor() {
            this.techData = {};
            this.updateInterval = null;
            this.geolocationWatchId = null;
            this.storageQuota = null;
            this.init();
        }

        // MCP-MARKER:METHOD:TECH_INFO:INIT - Основная инициализация
        init() {
            console.log('🔧 Инициализация сервиса технической информации GENESIS 1.1');
            this.collectTechData();
            this.startAutoUpdate();
            this.setupEventListeners();
        }

        // MCP-MARKER:METHOD:TECH_INFO:SETUP_LISTENERS - Настройка слушателей событий
        setupEventListeners() {
            // Слушаем изменения размера окна
            window.addEventListener('resize', () => {
                this.techData.windowSize = `${window.innerWidth} × ${window.innerHeight}`;
                this.updateElements();
            });

            // Слушаем изменения ориентации экрана
            if (screen.orientation) {
                screen.orientation.addEventListener('change', () => {
                    this.techData.orientation = screen.orientation.type;
                    this.updateElements();
                });
            }

            // Слушаем изменения сетевого статуса
            window.addEventListener('online', () => {
                this.techData.onlineStatus = '🟢 Онлайн';
                this.updateElements();
            });

            window.addEventListener('offline', () => {
                this.techData.onlineStatus = '🔴 Офлайн';
                this.updateElements();
            });

            // Слушаем изменения соединения
            if (navigator.connection) {
                navigator.connection.addEventListener('change', () => {
                    this.updateConnectionInfo();
                    this.updateElements();
                });
            }
        }

        // MCP-MARKER:METHOD:TECH_INFO:COLLECT_DATA - Сбор технической информации
        collectTechData() {
            try {
                this.techData = {
                    // Браузер и система
                    browserName: this.getBrowserInfo(),
                    platform: this.getPlatformInfo(),
                    language: navigator.language || 'Unknown',
                    cookies: navigator.cookieEnabled ? '✅ Включены' : '❌ Отключены',
                    cores: navigator.hardwareConcurrency || 'Unknown',
                    
                    // Экран и отображение
                    screenResolution: `${screen.width} × ${screen.height}`,
                    windowSize: `${window.innerWidth} × ${window.innerHeight}`,
                    colorDepth: `${screen.colorDepth} бит`,
                    pixelRatio: window.devicePixelRatio || 1,
                    orientation: this.getOrientation(),
                    
                    // Время и локация
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    utcOffset: this.getUTCOffset(),
                    locale: Intl.DateTimeFormat().resolvedOptions().locale,
                    currentTime: new Date().toLocaleString('ru-RU'),
                    
                    // Сеть и подключение
                    onlineStatus: navigator.onLine ? '🟢 Онлайн' : '🔴 Офлайн',
                    connectionType: this.getConnectionType(),
                    downlink: this.getDownlink(),
                    rtt: this.getRTT(),
                    ipAddress: 'Загрузка...',
                    
                    // Безопасность
                    dnt: navigator.doNotTrack === '1' ? '✅ Включен' : '❌ Отключен',
                    httpsStatus: location.protocol === 'https:' ? '🔒 Защищено' : '⚠️ Небезопасно',
                    webdriver: navigator.webdriver ? '⚠️ Обнаружен' : '✅ Не обнаружен',
                    pluginsCount: this.getPluginsInfo(),
                    
                    // WebGL и графика
                    webglInfo: this.getWebGLInfo(),
                    
                    // Память и ресурсы
                    deviceMemory: this.getDeviceMemory(),
                    jsMemory: this.getJSMemory(),
                    storageInfo: 'Загрузка...',
                    
                    // Батарея (будет обновлено асинхронно)
                    batteryLevel: 'Загрузка...',
                    batteryCharging: 'Загрузка...',
                    
                    // Геолокация
                    geolocation: 'Не запрошено'
                };

                // Асинхронные операции
                this.getBatteryInfo();
                this.getIPAddress();
                this.getStorageInfo();
                this.updateConnectionInfo();

                console.log('✅ Техническая информация собрана');
                return this.techData;
            } catch (error) {
                console.error('❌ Ошибка сбора технической информации:', error);
                return {};
            }
        }

        // MCP-MARKER:METHOD:TECH_INFO:GET_BROWSER - Определение браузера
        getBrowserInfo() {
            const ua = navigator.userAgent;
            let browser = 'Unknown';
            let version = '';

            if (ua.includes('Chrome') && !ua.includes('Edg')) {
                browser = 'Chrome';
                version = ua.match(/Chrome\/(\d+)/)?.[1] || '';
            } else if (ua.includes('Firefox')) {
                browser = 'Firefox';
                version = ua.match(/Firefox\/(\d+)/)?.[1] || '';
            } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
                browser = 'Safari';
                version = ua.match(/Version\/(\d+)/)?.[1] || '';
            } else if (ua.includes('Edg')) {
                browser = 'Edge';
                version = ua.match(/Edg\/(\d+)/)?.[1] || '';
            } else if (ua.includes('MSIE') || ua.includes('Trident/')) {
                browser = 'Internet Explorer';
                version = ua.match(/MSIE (\d+)/)?.[1] || ua.match(/rv:(\d+)/)?.[1] || '';
            }

            return version ? `${browser} ${version}` : browser;
        }

        // MCP-MARKER:METHOD:TECH_INFO:GET_PLATFORM - Информация о платформе
        getPlatformInfo() {
            const platform = navigator.platform || 'Unknown';
            const os = this.getOperatingSystem();
            return `${platform} (${os})`;
        }

        getOperatingSystem() {
            const ua = navigator.userAgent;
            if (ua.includes('Windows')) return 'Windows';
            if (ua.includes('Mac')) return 'macOS';
            if (ua.includes('Linux')) return 'Linux';
            if (ua.includes('Android')) return 'Android';
            if (ua.includes('iOS')) return 'iOS';
            return 'Unknown';
        }

        getOrientation() {
            if (screen.orientation) {
                return screen.orientation.type;
            }
            return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
        }

        getUTCOffset() {
            const offset = new Date().getTimezoneOffset();
            const hours = Math.abs(Math.floor(offset / 60));
            const minutes = Math.abs(offset % 60);
            const sign = offset > 0 ? '-' : '+';
            return `UTC${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        }

        getConnectionType() {
            if (navigator.connection) {
                const type = navigator.connection.effectiveType || navigator.connection.type;
                const speed = navigator.connection.downlink;
                return `${type} (${speed} Mbps)`;
            }
            return 'Unknown';
        }

        getDownlink() {
            if (navigator.connection && navigator.connection.downlink) {
                return `${navigator.connection.downlink} Mbps`;
            }
            return 'Unknown';
        }

        getRTT() {
            if (navigator.connection && navigator.connection.rtt) {
                return `${navigator.connection.rtt} ms`;
            }
            return 'Unknown';
        }

        updateConnectionInfo() {
            if (navigator.connection) {
                this.techData.connectionType = this.getConnectionType();
                this.techData.downlink = this.getDownlink();
                this.techData.rtt = this.getRTT();
            }
        }

        getPluginsInfo() {
            if (navigator.plugins && navigator.plugins.length > 0) {
                const plugins = Array.from(navigator.plugins).map(p => p.name).join(', ');
                return `${navigator.plugins.length} (${plugins.substring(0, 50)}${plugins.length > 50 ? '...' : ''})`;
            }
            return '0';
        }

        // MCP-MARKER:METHOD:TECH_INFO:GET_WEBGL - Информация о WebGL
        getWebGLInfo() {
            try {
                const canvas = document.createElement('canvas');
                const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
                if (gl) {
                    const renderer = gl.getParameter(gl.RENDERER);
                    const vendor = gl.getParameter(gl.VENDOR);
                    const version = gl.getParameter(gl.VERSION);
                    return `${renderer} (${vendor})`;
                } else {
                    return '❌ Не поддерживается';
                }
            } catch (e) {
                return '❌ Ошибка';
            }
        }

        getDeviceMemory() {
            if (navigator.deviceMemory) {
                return `${navigator.deviceMemory} GB`;
            }
            return 'Unknown';
        }

        getJSMemory() {
            if (performance.memory) {
                const used = (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2);
                const total = (performance.memory.totalJSHeapSize / 1024 / 1024).toFixed(2);
                const limit = (performance.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2);
                return `${used} MB / ${total} MB (лимит: ${limit} MB)`;
            }
            return 'Unknown';
        }

        // MCP-MARKER:METHOD:TECH_INFO:GET_BATTERY - Информация о батарее
        async getBatteryInfo() {
            if (navigator.getBattery) {
                try {
                    const battery = await navigator.getBattery();
                    const level = (battery.level * 100).toFixed(0);
                    const charging = battery.charging ? '🔌 Заряжается' : '🔋 На батарее';
                    const timeToCharge = battery.chargingTime !== Infinity ? `${Math.floor(battery.chargingTime / 60)} мин` : '∞';
                    const timeToDischarge = battery.dischargingTime !== Infinity ? `${Math.floor(battery.dischargingTime / 60)} мин` : '∞';
                    
                    this.techData.batteryLevel = `${level}%`;
                    this.techData.batteryCharging = `${charging} (${battery.charging ? timeToCharge : timeToDischarge})`;
                    
                    this.updateElements();
                    
                    // Слушаем изменения батареи
                    battery.addEventListener('levelchange', () => {
                        const newLevel = (battery.level * 100).toFixed(0);
                        this.techData.batteryLevel = `${newLevel}%`;
                        this.updateElements();
                    });
                    
                    battery.addEventListener('chargingchange', () => {
                        const newCharging = battery.charging ? '🔌 Заряжается' : '🔋 На батарее';
                        const time = battery.charging ? 
                            (battery.chargingTime !== Infinity ? `${Math.floor(battery.chargingTime / 60)} мин` : '∞') :
                            (battery.dischargingTime !== Infinity ? `${Math.floor(battery.dischargingTime / 60)} мин` : '∞');
                        this.techData.batteryCharging = `${newCharging} (${time})`;
                        this.updateElements();
                    });
                } catch (error) {
                    this.techData.batteryLevel = 'Недоступно';
                    this.techData.batteryCharging = 'Недоступно';
                }
            } else {
                this.techData.batteryLevel = 'Не поддерживается';
                this.techData.batteryCharging = 'Не поддерживается';
            }
        }

        // MCP-MARKER:METHOD:TECH_INFO:GET_IP - Получение IP адреса
        async getIPAddress() {
            // На лендинге не делаем внешние IP-запросы, чтобы не нарушать CSP и не шуметь
            if (window.GENESIS_LANDING) {
                this.techData.ipAddress = 'Недоступно (landing)';
                this.updateElements();
                return;
            }
            try {
                const response = await fetch('https://api.ipify.org?format=json');
                const data = await response.json();
                this.techData.ipAddress = data.ip;
                this.updateElements();
            } catch (error) {
                try {
                    // Альтернативный API
                    const response = await fetch('https://api.myip.com');
                    const data = await response.json();
                    this.techData.ipAddress = data.ip;
                    this.updateElements();
                } catch (error2) {
                    this.techData.ipAddress = 'Недоступно локально';
                    this.updateElements();
                }
            }
        }

        // MCP-MARKER:METHOD:TECH_INFO:GET_STORAGE - Информация о хранилище
        async getStorageInfo() {
            if ('storage' in navigator && 'estimate' in navigator.storage) {
                try {
                    const estimate = await navigator.storage.estimate();
                    const used = (estimate.usage / 1024 / 1024).toFixed(2);
                    const quota = (estimate.quota / 1024 / 1024).toFixed(2);
                    const percentage = ((estimate.usage / estimate.quota) * 100).toFixed(1);
                    
                    this.techData.storageInfo = `${used} MB / ${quota} MB (${percentage}%)`;
                    this.updateElements();
                } catch (error) {
                    this.techData.storageInfo = 'Ошибка получения';
                    this.updateElements();
                }
            } else {
                this.techData.storageInfo = 'Не поддерживается';
                this.updateElements();
            }
        }

        // MCP-MARKER:METHOD:TECH_INFO:UPDATE_ELEMENTS - Обновление элементов на странице
        updateElements() {
            // Маппинг данных к элементам на странице
            const elementMapping = {
                'browserName': 'browser-name',
                'platform': 'platform',
                'language': 'language',
                'cookies': 'cookies',
                'cores': 'cores',
                'screenResolution': 'screen-resolution',
                'windowSize': 'window-size',
                'colorDepth': 'color-depth',
                'pixelRatio': 'pixel-ratio',
                'orientation': 'orientation',
                'timezone': 'timezone',
                'utcOffset': 'utc-offset',
                'locale': 'locale',
                'currentTime': 'current-time',
                'geolocation': 'geolocation',
                'onlineStatus': 'online-status',
                'connectionType': 'connection-type',
                'downlink': 'downlink',
                'rtt': 'rtt',
                'ipAddress': 'ip-address',
                'batteryLevel': 'battery-level',
                'batteryCharging': 'battery-charging',
                'deviceMemory': 'device-memory',
                'jsMemory': 'js-memory',
                'storageInfo': 'storage-info',
                'dnt': 'dnt',
                'httpsStatus': 'https-status',
                'webdriver': 'webdriver',
                'pluginsCount': 'plugins-count',
                'webglInfo': 'webgl-info'
            };

            Object.entries(elementMapping).forEach(([dataKey, elementId]) => {
                const element = document.getElementById(elementId);
                if (element && this.techData[dataKey]) {
                    element.textContent = this.techData[dataKey];
                    element.classList.add('updated');
                    
                    // Добавляем анимацию обновления
                    element.style.animation = 'none';
                    element.offsetHeight; // Trigger reflow
                    element.style.animation = 'techUpdate 0.3s ease-in-out';
                }
            });
        }

        startAutoUpdate() {
            // Обновляем время каждую секунду
            this.updateInterval = setInterval(() => {
                this.techData.currentTime = new Date().toLocaleString('ru-RU');
                this.techData.onlineStatus = navigator.onLine ? '🟢 Онлайн' : '🔴 Офлайн';
                this.updateElements();
            }, 1000);
        }

        stopAutoUpdate() {
            if (this.updateInterval) {
                clearInterval(this.updateInterval);
                this.updateInterval = null;
            }
        }

        // MCP-MARKER:METHOD:TECH_INFO:REQUEST_GEO - Запрос геолокации
        async requestGeolocation() {
            if (!navigator.geolocation) {
                this.techData.geolocation = 'Не поддерживается';
                this.updateElements();
                return;
            }

            this.techData.geolocation = 'Запрос разрешения...';
            this.updateElements();

            try {
                const position = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 60000
                    });
                });

                const { latitude, longitude, accuracy } = position.coords;
                this.techData.geolocation = `${latitude.toFixed(6)}, ${longitude.toFixed(6)} (±${accuracy.toFixed(0)}м)`;
                
                // Начинаем отслеживание изменений
                this.geolocationWatchId = navigator.geolocation.watchPosition(
                    (pos) => {
                        const { latitude, longitude, accuracy } = pos.coords;
                        this.techData.geolocation = `${latitude.toFixed(6)}, ${longitude.toFixed(6)} (±${accuracy.toFixed(0)}м)`;
                        this.updateElements();
                    },
                    (error) => {
                        this.techData.geolocation = `Ошибка: ${error.message}`;
                        this.updateElements();
                    },
                    { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
                );

                this.updateElements();
            } catch (error) {
                this.techData.geolocation = `Ошибка: ${error.message}`;
                this.updateElements();
            }
        }

        // MCP-MARKER:METHOD:TECH_INFO:REFRESH - Обновление данных
        refreshData() {
            console.log('🔄 Обновление технических данных...');
            this.collectTechData();
            this.updateElements();
            
            // Показываем уведомление
            if (window.GenesisNotifications) {
                window.GenesisNotifications.show('✅ Технические данные обновлены', 'success');
            }
        }

        // MCP-MARKER:METHOD:TECH_INFO:EXPORT - Экспорт данных
        exportData() {
            const data = {
                timestamp: new Date().toISOString(),
                deviceInfo: this.techData,
                userAgent: navigator.userAgent,
                screenInfo: {
                    width: screen.width,
                    height: screen.height,
                    colorDepth: screen.colorDepth,
                    pixelDepth: screen.pixelDepth
                },
                windowInfo: {
                    width: window.innerWidth,
                    height: window.innerHeight,
                    devicePixelRatio: window.devicePixelRatio
                }
            };

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `genesis-tech-info-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
            a.click();
            URL.revokeObjectURL(url);

            if (window.GenesisNotifications) {
                window.GenesisNotifications.show('📥 Данные экспортированы', 'success');
            }
        }

        getData() {
            return this.techData;
        }

        // Метод для обновления данных вручную (совместимость)
        refresh() {
            this.refreshData();
        }
    }

    window.GenesisTechInfo = new GenesisTechInfo();

    // Глобальные функции для совместимости
    window.updateTechInfo = function() {
        if (window.GenesisTechInfo) {
            window.GenesisTechInfo.refreshData();
        }
    };

    // Добавляем CSS анимацию для обновления
    const style = document.createElement('style');
    style.textContent = `
@keyframes techUpdate {
    0% { background-color: rgba(255, 107, 53, 0.1); }
    50% { background-color: rgba(255, 107, 53, 0.2); }
    100% { background-color: transparent; }
}

.tech-card-checkmark {
    position: absolute;
    top: 10px;
    right: 10px;
    color: #00ff41;
    font-weight: bold;
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
}
`;
    document.head.appendChild(style);
}

// Экспортируем для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GenesisTechInfo;
} 