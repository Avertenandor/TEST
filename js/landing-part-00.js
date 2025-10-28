// ===== Script Block 1 =====
// Флаг: мы на лендинге, отключаем тяжёлые сетевые проверки
        window.GENESIS_LANDING = true;
        (function() {
            // List of application routes
            const appRoutes = [
                '/home',
                '/dashboard',
                '/auth',
                '/deposits',
                '/portfolio',
                '/transactions',
                '/analytics',
                '/bonuses',
                '/gifts',
                '/referrals',
                '/multipliers',
                '/mining-rent',
                '/my-device',
                '/plex-coin',
                '/settings',
                '/experience',
                '/rank',
                '/how-it-works',
                '/terminal',
                '/platform-access'
            ];
            
            // Get current path
            const currentPath = window.location.pathname;
            
            // Check if this is an app route
            if (appRoutes.includes(currentPath)) {
                // Redirect to app.html with the current path
                window.location.replace('/app.html');
                // The app.html will handle the routing based on the pathname
            }
        })();

// ===== Script Block 2 =====
// Инициализация технических данных
        // MCP-MARKER:OBJECT:GENESIS_TECH_DATA - Объект технических данных
        window.GenesisTechData = {
            // Обновление данных устройства
            // MCP-MARKER:METHOD:UPDATE_DEVICE_INFO - Метод обновления информации об устройстве
            updateDeviceInfo: function() {
                try {
                    // Платформа
                    const platform = navigator.platform || 'Unknown';
                    document.getElementById('device-platform').textContent = platform;
                    
                    // Операционная система
                    const userAgent = navigator.userAgent;
                    let os = 'Unknown';
                    if (userAgent.includes('Windows')) {
                        if (userAgent.includes('Windows NT 10.0')) os = 'Windows 10/11';
                        else if (userAgent.includes('Windows NT 6.3')) os = 'Windows 8.1';
                        else if (userAgent.includes('Windows NT 6.2')) os = 'Windows 8';
                        else if (userAgent.includes('Windows NT 6.1')) os = 'Windows 7';
                        else os = 'Windows';
                    } else if (userAgent.includes('Mac OS X')) {
                        os = 'macOS';
                    } else if (userAgent.includes('Linux')) {
                        os = 'Linux';
                    } else if (userAgent.includes('Android')) {
                        os = 'Android';
                    } else if (userAgent.includes('iOS')) {
                        os = 'iOS';
                    }
                    document.getElementById('device-os').textContent = os;
                    
                    // Браузер и версия
                    let browser = 'Unknown';
                    let version = 'Unknown';
                    if (userAgent.includes('Chrome')) {
                        browser = 'Chrome';
                        version = userAgent.match(/Chrome\/(\d+)/)?.[1] || 'Unknown';
                    } else if (userAgent.includes('Firefox')) {
                        browser = 'Firefox';
                        version = userAgent.match(/Firefox\/(\d+)/)?.[1] || 'Unknown';
                    } else if (userAgent.includes('Safari')) {
                        browser = 'Safari';
                        version = userAgent.match(/Version\/(\d+)/)?.[1] || 'Unknown';
                    } else if (userAgent.includes('Edge')) {
                        browser = 'Edge';
                        version = userAgent.match(/Edge\/(\d+)/)?.[1] || 'Unknown';
                    } else if (userAgent.includes('Opera')) {
                        browser = 'Opera';
                        version = userAgent.match(/Opera\/(\d+)/)?.[1] || 'Unknown';
                    }
                    document.getElementById('device-browser').textContent = browser;
                    document.getElementById('device-browser-version').textContent = version;
                    
                    // Разрешение экрана
                    const resolution = `${window.screen.width}x${window.screen.height}`;
                    document.getElementById('device-resolution').textContent = resolution;
                    
                    // Размер окна
                    const viewport = `${window.innerWidth}x${window.innerHeight}`;
                    document.getElementById('device-viewport').textContent = viewport;
                    
                    // Плотность пикселей
                    const pixelRatio = window.devicePixelRatio || 1;
                    document.getElementById('device-pixel-ratio').textContent = `${pixelRatio}x`;
                    
                    // Цветовая глубина
                    const colorDepth = window.screen.colorDepth || 'Unknown';
                    document.getElementById('device-color-depth').textContent = `${colorDepth} bit`;
                    
                    // Язык системы
                    const language = navigator.language || navigator.userLanguage || 'Unknown';
                    document.getElementById('device-language').textContent = language;
                    
                    // Часовой пояс
                    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                    document.getElementById('device-timezone').textContent = timezone;
                    
                    // Время загрузки
                    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
                    document.getElementById('device-load-time').textContent = `${loadTime}ms`;
                    
                    // Показать галочку
                    setTimeout(() => {
                        const checkmark = document.querySelector('.genesis-info-card:first-child .tech-card-checkmark');
                        if (checkmark) {
                            checkmark.style.opacity = '1';
                            checkmark.classList.add('show');
                        }
                    }, 500);
                } catch (error) {
                    console.error('Error updating device info:', error);
                }
            },
            
            // Получение IP и сетевой информации
            fetchNetworkInfo: async function() {
                try {
                    // Получаем информацию от нескольких API для надежности
                    const apis = [
                        'https://ipapi.co/json/',
                        'https://ipinfo.io/json',
                        'https://api.ipify.org?format=json'
                    ];
                    
                    let networkData = {};
                    
                    for (const api of apis) {
                        try {
                            const response = await fetch(api);
                            const data = await response.json();
                            networkData = { ...networkData, ...data };
                            break; // Используем первый успешный ответ
                        } catch (error) {
                            console.warn(`API ${api} недоступен:`, error);
                        }
                    }
                    
                    // IP адрес
                    document.getElementById('network-ip').textContent = networkData.ip || 'N/A';
                    
                    // Локация
                    const location = [];
                    if (networkData.city) location.push(networkData.city);
                    if (networkData.region) location.push(networkData.region);
                    if (networkData.country_name || networkData.country) location.push(networkData.country_name || networkData.country);
                    document.getElementById('network-location').textContent = location.length > 0 ? location.join(', ') : 'Unknown';
                    
                    // Провайдер
                    document.getElementById('network-provider').textContent = networkData.org || networkData.isp || 'Unknown';
                    
                    // Организация
                    document.getElementById('network-organization').textContent = networkData.org || 'Unknown';
                    
                    // User Agent
                    document.getElementById('network-user-agent').textContent = navigator.userAgent.substring(0, 50) + '...';
                    
                    // Протокол соединения
                    document.getElementById('security-protocol').textContent = window.location.protocol;
                    
                    // Шифрование
                    document.getElementById('security-encryption').textContent = window.location.protocol === 'https:' ? 'TLS/SSL' : 'None';
                    
                    // Do Not Track
                    document.getElementById('security-dnt').textContent = navigator.doNotTrack === '1' ? 'Enabled' : 'Disabled';
                    
                    // Cookies
                    document.getElementById('security-cookies').textContent = navigator.cookieEnabled ? 'Enabled' : 'Disabled';
                    
                    // Local Storage
                    try {
                        localStorage.setItem('test', 'test');
                        localStorage.removeItem('test');
                        document.getElementById('security-local-storage').textContent = 'Available';
                    } catch (e) {
                        document.getElementById('security-local-storage').textContent = 'Not Available';
                    }
                    
                    // Session Storage
                    try {
                        sessionStorage.setItem('test', 'test');
                        sessionStorage.removeItem('test');
                        document.getElementById('security-session-storage').textContent = 'Available';
                    } catch (e) {
                        document.getElementById('security-session-storage').textContent = 'Not Available';
                    }
                    
                    // IndexedDB
                    document.getElementById('security-indexeddb').textContent = 'indexedDB' in window ? 'Available' : 'Not Available';
                    
                    // Web Workers
                    document.getElementById('security-web-workers').textContent = 'Worker' in window ? 'Available' : 'Not Available';
                    
                    // Content Security Policy
                    const csp = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
                    document.getElementById('security-csp').textContent = csp ? 'Enabled' : 'Not Set';
                    
                } catch (error) {
                    console.error('Error fetching network info:', error);
                    document.getElementById('network-ip').textContent = 'N/A';
                    document.getElementById('network-location').textContent = 'Unknown';
                }
            },
            
            // Обновление информации о производительности
            updatePerformanceInfo: function() {
                try {
                    // Процессор (количество ядер)
                    const cpuCores = navigator.hardwareConcurrency || 'Unknown';
                    document.getElementById('performance-cpu-cores').textContent = `${cpuCores} cores`;
                    
                    // Память устройства
                    if ('deviceMemory' in navigator) {
                        document.getElementById('performance-device-memory').textContent = `${navigator.deviceMemory} GB`;
                    } else {
                        document.getElementById('performance-device-memory').textContent = 'Unknown';
                    }
                    
                    // Память браузера
                    if ('memory' in performance) {
                        const memory = performance.memory;
                        const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);
                        const totalMB = Math.round(memory.totalJSHeapSize / 1024 / 1024);
                        document.getElementById('performance-browser-memory').textContent = `${usedMB}MB / ${totalMB}MB`;
                    } else {
                        document.getElementById('performance-browser-memory').textContent = 'Not Available';
                    }
                    
                    // Время загрузки страницы
                    const pageLoad = performance.timing.loadEventEnd - performance.timing.navigationStart;
                    document.getElementById('performance-page-load').textContent = `${pageLoad}ms`;
                    
                    // Время DOM
                    const domTime = performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart;
                    document.getElementById('performance-dom-time').textContent = `${domTime}ms`;
                    
                    // Время рендеринга
                    const renderTime = performance.timing.loadEventEnd - performance.timing.domContentLoadedEventEnd;
                    document.getElementById('performance-render-time').textContent = `${renderTime}ms`;
                    
                    // FPS (кадры в секунду)
                    this.startFPSMonitoring();
                    
                    // WebGL поддержка
                    const canvas = document.createElement('canvas');
                    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
                    document.getElementById('performance-webgl').textContent = gl ? 'Supported' : 'Not Supported';
                    
                    // WebRTC поддержка
                    document.getElementById('performance-webrtc').textContent = 
                        'RTCPeerConnection' in window ? 'Supported' : 'Not Supported';
                    
                    // Service Workers поддержка
                    document.getElementById('performance-service-workers').textContent = 
                        'serviceWorker' in navigator ? 'Supported' : 'Not Supported';
                    
                    // Тип соединения
                    if ('connection' in navigator) {
                        const connection = navigator.connection;
                        document.getElementById('network-connection-type').textContent = connection.effectiveType || 'Unknown';
                        document.getElementById('network-connection-speed').textContent = connection.downlink ? `${connection.downlink} Mbps` : 'Unknown';
                    } else {
                        document.getElementById('network-connection-type').textContent = 'Unknown';
                        document.getElementById('network-connection-speed').textContent = 'Unknown';
                    }
                    
                    // RPC Endpoint
                    document.getElementById('network-rpc-endpoint').textContent = 'https://bsc-dataseed.binance.org/';
                    
                    // Статус Web3
                    if (typeof window.ethereum !== 'undefined') {
                        document.getElementById('network-web3-status').textContent = '✅ Connected';
                    } else {
                        document.getElementById('network-web3-status').textContent = '❌ Not Available';
                    }
                    
                    // Пинг до BSC
                    this.measureBSCPing();

                    // Задержка сети
                    this.measureNetworkLatency();

                } catch (error) {
                    console.error('Error updating performance info:', error);
                }
            },
            
            // Мониторинг FPS
            startFPSMonitoring: function() {
                let frameCount = 0;
                let lastTime = performance.now();
                
                const measureFPS = () => {
                    frameCount++;
                    const currentTime = performance.now();
                    
                    if (currentTime - lastTime >= 1000) {
                        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                        document.getElementById('performance-fps').textContent = `${fps} FPS`;
                        frameCount = 0;
                        lastTime = currentTime;
                    }
                    
                    requestAnimationFrame(measureFPS);
                };
                
                requestAnimationFrame(measureFPS);
            },
            
            // Измерение пинга до BSC
            measureBSCPing: async function() {
                try {
                    const startTime = performance.now();
            const url = 'https://bsc-dataseed.binance.org/?_=' + Date.now();
            await fetch(url, { method: 'GET', mode: 'no-cors', cache: 'no-store' });
                    const endTime = performance.now();
                    const ping = Math.round(endTime - startTime);
                    document.getElementById('network-bsc-ping').textContent = `${ping}ms`;
                } catch (error) {
            document.getElementById('network-bsc-ping').textContent = 'n/a';
                }
            },

            // Измерение задержки сети
            measureNetworkLatency: async function() {
                try {
                    const startTime = performance.now();
                    const url = 'https://ipapi.co/json/?_=' + Date.now();
                    await fetch(url, { method: 'HEAD', mode: 'cors', cache: 'no-store' });
                    const endTime = performance.now();
                    const latency = Math.round(endTime - startTime);
                    document.getElementById('network-latency').textContent = `${latency}ms`;
                } catch (error) {
                    document.getElementById('network-latency').textContent = 'n/a';
                }
            },
            
            // Обновление системных данных
            updateSystemInfo: function() {
                // Адреса уже заполнены в HTML
                
                // Показать галочку
                setTimeout(() => {
                    const checkmark = document.querySelector('.genesis-info-card:nth-child(4) .tech-card-checkmark');
                    if (checkmark) {
                        checkmark.style.opacity = '1';
                        checkmark.classList.add('show');
                    }
                }, 1000);
            },
            
            // Обновление статистики
            updateStats: function() {
                // Время сессии
                const sessionTime = document.getElementById('stats-session-time');
                if (sessionTime) {
                    sessionTime.textContent = document.getElementById('uptime')?.textContent || '00:00:00';
                }
                
                // API запросы
                const apiCalls = document.getElementById('stats-api-calls');
                if (apiCalls) {
                    apiCalls.textContent = window.GenesisAPI?.requestCount || '0';
                }
                
                // Логи терминала
                const terminalLogs = document.getElementById('stats-terminal-logs');
                if (terminalLogs) {
                    terminalLogs.textContent = document.getElementById('messageCount')?.textContent || '0';
                }
                
                // Ошибки
                const errors = document.getElementById('stats-errors');
                if (errors) {
                    errors.textContent = window.GenesisTerminal?.errorCount || '0';
                }
                
                // Кэш
                this.updateCacheSize();
                
                // Память браузера
                if ('memory' in performance) {
                    const memory = performance.memory;
                    const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);
                    const elMem = document.getElementById('stats-memory-usage');
                    if (elMem) elMem.textContent = `${usedMB} MB`;
                }

                // Загрузка CPU (симуляция)
                const cpuUsage = Math.floor(Math.random() * 30) + 5; // 5-35%
                const elCpu = document.getElementById('stats-cpu-usage');
                if (elCpu) elCpu.textContent = `${cpuUsage}%`;

                // Активные вкладки (симуляция)
                const activeTabs = Math.floor(Math.random() * 10) + 1; // 1-10
                const elTabs = document.getElementById('stats-active-tabs');
                if (elTabs) elTabs.textContent = activeTabs;

                // Время последнего обновления
                const now = new Date();
                const elLast = document.getElementById('stats-last-update');
                if (elLast) elLast.textContent = now.toLocaleTimeString();
                
                // Показать галочку
                setTimeout(() => {
                    const checkmark = document.querySelector('.genesis-info-card:nth-child(5) .tech-card-checkmark');
                    if (checkmark) {
                        checkmark.style.opacity = '1';
                        checkmark.classList.add('show');
                    }
                }, 1500);
            },
            
            // Обновление размера кэша
            updateCacheSize: async function() {
                try {
                    if ('storage' in navigator && 'estimate' in navigator.storage) {
                        const estimate = await navigator.storage.estimate();
                        const usageInKB = Math.round((estimate.usage || 0) / 1024);
                        document.getElementById('stats-cache-size').textContent = `${usageInKB} KB`;
                    }
                } catch (error) {
                    document.getElementById('stats-cache-size').textContent = 'N/A';
                }
            },
            
            // Инициализация
            // MCP-MARKER:METHOD:GENESIS_TECH_INIT - Метод инициализации технических данных
            init: function() {
                // Обновить все данные
                this.updateDeviceInfo();
                this.fetchNetworkInfo();
                this.updatePerformanceInfo();
                this.updateSystemInfo();
                this.updateStats();
                
                // Периодическое обновление статистики
                setInterval(() => {
                    this.updateStats();
                }, 5000);
                
                // Периодическое обновление сетевой информации
                setInterval(() => {
                    this.fetchNetworkInfo();
                }, 30000); // Каждые 30 секунд
                
