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
                    // КРИТИЧНО: На лендинге НЕ делаем тяжелые сетевые запросы - они блокируют загрузку
                    if (window.GENESIS_LANDING) {
                        console.log('🌐 Лендинг: пропускаем сетевые запросы для быстрой загрузки');
                        // Устанавливаем дефолтные значения
                        const ipEl = document.getElementById('network-ip');
                        if (ipEl) ipEl.textContent = 'N/A (на лендинге)';
                        const locationEl = document.getElementById('network-location');
                        if (locationEl) locationEl.textContent = 'Unknown';
                        return;
                    }
                    
                    // КРИТИЧНО: Добавляем таймаут чтобы не блокировать страницу
                    const timeoutMs = 2000; // Уменьшили до 2 секунд максимум
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
                    
                    // Получаем информацию от нескольких API для надежности
                    const apis = [
                        'https://ipapi.co/json/',
                        'https://ipinfo.io/json',
                        'https://api.ipify.org?format=json'
                    ];
                    
                    let networkData = {};
                    
                    for (const api of apis) {
                        try {
                            const response = await Promise.race([
                                fetch(api, { 
                                    signal: controller.signal,
                                    method: 'GET',
                                    cache: 'no-store',
                                    mode: 'cors' // КРИТИЧНО: явно указываем cors
                                }),
                                new Promise((_, reject) => 
                                    setTimeout(() => reject(new Error('Timeout')), timeoutMs)
                                )
                            ]);
                            const data = await response.json();
                            clearTimeout(timeoutId);
                            networkData = { ...networkData, ...data };
                            break; // Используем первый успешный ответ
                        } catch (error) {
                            if (error.name === 'AbortError' || error.message === 'Timeout') {
                                console.warn(`API ${api} timeout - пропускаем`);
                                break; // Не пробуем другие если таймаут
                            } else {
                                console.warn(`API ${api} недоступен:`, error);
                            }
                        }
                    }
                    
                        // IP адрес
                        const ipEl = document.getElementById('network-ip');
                        if (ipEl) ipEl.textContent = data.ip || 'N/A';
                        
                        // Локация
                        const location = [];
                        if (data.city) location.push(data.city);
                        if (data.region) location.push(data.region);
                        if (data.country_name || data.country) location.push(data.country_name || data.country);
                        const locationEl = document.getElementById('network-location');
                        if (locationEl) locationEl.textContent = location.length > 0 ? location.join(', ') : 'Unknown';
                        
                        // Провайдер
                        const providerEl = document.getElementById('network-provider');
                        if (providerEl) providerEl.textContent = data.org || data.isp || 'Unknown';
                        
                        // Организация
                        const orgEl = document.getElementById('network-organization');
                        if (orgEl) orgEl.textContent = data.org || 'Unknown';
                    } catch (error) {
                        clearTimeout(timeoutId);
                        // Если запрос не удался - ставим значения по умолчанию
                        const ipEl = document.getElementById('network-ip');
                        if (ipEl) ipEl.textContent = 'N/A';
                        const locationEl = document.getElementById('network-location');
                        if (locationEl) locationEl.textContent = 'Unknown';
                        const providerEl = document.getElementById('network-provider');
                        if (providerEl) providerEl.textContent = 'Unknown';
                        const orgEl = document.getElementById('network-organization');
                        if (orgEl) orgEl.textContent = 'Unknown';
                    }
                    
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
                    // КРИТИЧНО: Сначала быстрые операции синхронно
                    // Процессор (количество ядер)
                    const cpuCores = navigator.hardwareConcurrency || 'Unknown';
                    const cpuEl = document.getElementById('performance-cpu-cores');
                    if (cpuEl) cpuEl.textContent = `${cpuCores} cores`;
                    
                    // Память устройства
                    if ('deviceMemory' in navigator) {
                        const memEl = document.getElementById('performance-device-memory');
                        if (memEl) memEl.textContent = `${navigator.deviceMemory} GB`;
                    } else {
                        const memEl = document.getElementById('performance-device-memory');
                        if (memEl) memEl.textContent = 'Unknown';
                    }
                    
                    // Память браузера
                    if ('memory' in performance) {
                        const memory = performance.memory;
                        const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);
                        const totalMB = Math.round(memory.totalJSHeapSize / 1024 / 1024);
                        const memBrowserEl = document.getElementById('performance-browser-memory');
                        if (memBrowserEl) memBrowserEl.textContent = `${usedMB}MB / ${totalMB}MB`;
                    } else {
                        const memBrowserEl = document.getElementById('performance-browser-memory');
                        if (memBrowserEl) memBrowserEl.textContent = 'Not Available';
                    }
                    
                    // Время загрузки страницы
                    const pageLoad = performance.timing.loadEventEnd - performance.timing.navigationStart;
                    const pageLoadEl = document.getElementById('performance-page-load');
                    if (pageLoadEl) pageLoadEl.textContent = `${pageLoad}ms`;
                    
                    // Время DOM
                    const domTime = performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart;
                    const domTimeEl = document.getElementById('performance-dom-time');
                    if (domTimeEl) domTimeEl.textContent = `${domTime}ms`;
                    
                    // Время рендеринга
                    const renderTime = performance.timing.loadEventEnd - performance.timing.domContentLoadedEventEnd;
                    const renderTimeEl = document.getElementById('performance-render-time');
                    if (renderTimeEl) renderTimeEl.textContent = `${renderTime}ms`;
                    
                    // FPS (кадры в секунду) - только если НЕ на лендинге
                    if (!window.GENESIS_LANDING) {
                        setTimeout(() => {
                            this.startFPSMonitoring();
                        }, 1000);
                    } else {
                        const fpsEl = document.getElementById('performance-fps');
                        if (fpsEl) fpsEl.textContent = 'N/A (лендинг)';
                    }

                    // WebGL поддержка
                    const canvas = document.createElement('canvas');
                    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
                    const webglEl = document.getElementById('performance-webgl');
                    if (webglEl) webglEl.textContent = gl ? 'Supported' : 'Not Supported';
                    
                    // WebRTC поддержка
                    const webrtcEl = document.getElementById('performance-webrtc');
                    if (webrtcEl) webrtcEl.textContent = 
                        'RTCPeerConnection' in window ? 'Supported' : 'Not Supported';
                    
                    // Service Workers поддержка
                    const swEl = document.getElementById('performance-service-workers');
                    if (swEl) swEl.textContent = 
                        'serviceWorker' in navigator ? 'Supported' : 'Not Supported';
                    
                    // Тип соединения
                    if ('connection' in navigator) {
                        const connection = navigator.connection;
                        const connTypeEl = document.getElementById('network-connection-type');
                        const connSpeedEl = document.getElementById('network-connection-speed');
                        if (connTypeEl) connTypeEl.textContent = connection.effectiveType || 'Unknown';
                        if (connSpeedEl) connSpeedEl.textContent = connection.downlink ? `${connection.downlink} Mbps` : 'Unknown';
                    } else {
                        const connTypeEl = document.getElementById('network-connection-type');
                        const connSpeedEl = document.getElementById('network-connection-speed');
                        if (connTypeEl) connTypeEl.textContent = 'Unknown';
                        if (connSpeedEl) connSpeedEl.textContent = 'Unknown';
                    }
                    
                    // RPC Endpoint
                    const rpcEl = document.getElementById('network-rpc-endpoint');
                    if (rpcEl) rpcEl.textContent = 'https://bsc-dataseed.binance.org/';
                    
                    // Статус Web3
                    const web3El = document.getElementById('network-web3-status');
                    if (web3El) {
                        if (typeof window.ethereum !== 'undefined') {
                            web3El.textContent = '✅ Connected';
                        } else {
                            web3El.textContent = '❌ Not Available';
                        }
                    }
                    
                    // КРИТИЧНО: Тяжелые сетевые операции делаем асинхронно с большой задержкой или НЕ делаем на лендинге
                    if (!window.GENESIS_LANDING) {
                        // Только если НЕ на лендинге - делаем через 3 секунды после загрузки
                        setTimeout(() => {
                            // Пинг до BSC
                            this.measureBSCPing().catch(err => {
                                console.warn('Ошибка измерения BSC ping:', err);
                            });

                            // Задержка сети
                            this.measureNetworkLatency().catch(err => {
                                console.warn('Ошибка измерения latency:', err);
                            });
                        }, 3000); // Увеличили задержку до 3 секунд
                    } else {
                        // На лендинге - сразу устанавливаем N/A
                        const pingEl = document.getElementById('network-bsc-ping');
                        if (pingEl) pingEl.textContent = 'N/A (лендинг)';
                        const latencyEl = document.getElementById('network-latency');
                        if (latencyEl) latencyEl.textContent = 'N/A (лендинг)';
                    }

                } catch (error) {
                    console.warn('Error updating performance info:', error);
                    // Не критично - продолжаем работу
                }
            },
            
            // Мониторинг FPS
            startFPSMonitoring: function() {
                // КРИТИЧНО: На лендинге НЕ запускаем FPS мониторинг - может тормозить
                if (window.GENESIS_LANDING) {
                    const fpsEl = document.getElementById('performance-fps');
                    if (fpsEl) fpsEl.textContent = 'N/A (лендинг)';
                    return;
                }
                
                let frameCount = 0;
                let lastTime = performance.now();
                
                const measureFPS = () => {
                    frameCount++;
                    const currentTime = performance.now();
                    
                    if (currentTime - lastTime >= 1000) {
                        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                        const fpsEl = document.getElementById('performance-fps');
                        if (fpsEl) fpsEl.textContent = `${fps} FPS`;
                        frameCount = 0;
                        lastTime = currentTime;
                    }
                    
                    requestAnimationFrame(measureFPS);
                };
                
                // КРИТИЧНО: Запускаем только после небольшой задержки
                setTimeout(() => {
                    requestAnimationFrame(measureFPS);
                }, 500);
            },
            
            // Измерение пинга до BSC
            measureBSCPing: async function() {
                // КРИТИЧНО: На лендинге НЕ делаем - блокирует загрузку
                if (window.GENESIS_LANDING) {
                    const pingEl = document.getElementById('network-bsc-ping');
                    if (pingEl) pingEl.textContent = 'N/A (лендинг)';
                    return;
                }
                
                try {
                    // КРИТИЧНО: Таймаут 1.5 секунды - еще меньше
                    const timeoutMs = 1500;
                    const startTime = performance.now();
                    const url = 'https://bsc-dataseed.binance.org/?_=' + Date.now();
                    
                    await Promise.race([
                        fetch(url, { method: 'GET', mode: 'no-cors', cache: 'no-store' }),
                        new Promise((_, reject) => 
                            setTimeout(() => reject(new Error('Timeout')), timeoutMs)
                        )
                    ]);
                    
                    const endTime = performance.now();
                    const ping = Math.round(endTime - startTime);
                    const pingEl = document.getElementById('network-bsc-ping');
                    if (pingEl) pingEl.textContent = `${ping}ms`;
                } catch (error) {
                    const pingEl = document.getElementById('network-bsc-ping');
                    if (pingEl) pingEl.textContent = 'n/a';
                }
            },

            // Измерение задержки сети
            measureNetworkLatency: async function() {
                // КРИТИЧНО: На лендинге НЕ делаем - блокирует загрузку
                if (window.GENESIS_LANDING) {
                    const latencyEl = document.getElementById('network-latency');
                    if (latencyEl) latencyEl.textContent = 'N/A (лендинг)';
                    return;
                }
                
                try {
                    // КРИТИЧНО: Таймаут 1.5 секунды - еще меньше
                    const timeoutMs = 1500;
                    const startTime = performance.now();
                    const url = 'https://ipapi.co/json/?_=' + Date.now();
                    
                    await Promise.race([
                        fetch(url, { method: 'HEAD', mode: 'cors', cache: 'no-store' }),
                        new Promise((_, reject) => 
                            setTimeout(() => reject(new Error('Timeout')), timeoutMs)
                        )
                    ]);
                    
                    const endTime = performance.now();
                    const latency = Math.round(endTime - startTime);
                    const latencyEl = document.getElementById('network-latency');
                    if (latencyEl) latencyEl.textContent = `${latency}ms`;
                } catch (error) {
                    const latencyEl = document.getElementById('network-latency');
                    if (latencyEl) latencyEl.textContent = 'n/a';
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
                // КРИТИЧНО: На лендинге только быстрые операции
                if (window.GENESIS_LANDING) {
                    console.log('🌐 Лендинг: инициализация только быстрых операций');
                    // Только быстрые методы
                    this.updateDeviceInfo();
                    this.updateSystemInfo();
                    this.updateStats();
                    
                    // Периодическое обновление статистики (легкое) - реже на лендинге
                    setInterval(() => {
                        this.updateStats();
                    }, 10000); // Увеличили интервал до 10 секунд на лендинге
                    
                    // НЕ запускаем тяжелые сетевые операции на лендинге
                    return;
                }
                
                // Обновить все данные (только если НЕ на лендинге)
                this.updateDeviceInfo();
                this.updateSystemInfo();
                this.updateStats();
                
                // Сетевые операции только после задержки
                setTimeout(() => {
                    this.fetchNetworkInfo().catch(err => {
                        console.warn('Ошибка получения сетевой информации:', err);
                    });
                    this.updatePerformanceInfo();
                }, 2000); // Запускаем через 2 секунды после загрузки
                
                // Периодическое обновление статистики (легкое)
                setInterval(() => {
                    this.updateStats();
                }, 5000);
                
                // Периодическое обновление сетевой информации (тяжелое - реже)
                setInterval(() => {
                    this.fetchNetworkInfo().catch(err => {
                        console.warn('Ошибка периодического обновления сети:', err);
                    });
                }, 60000); // Каждые 60 секунд (было 30)
                
                // Периодическое обновление производительности (тяжелое - реже)
                setInterval(() => {
                    this.updatePerformanceInfo();
                }, 30000); // Каждые 30 секунд (было 10)
            }
        };
        
        // Запуск при загрузке
        // MCP-MARKER:EVENT:DOM_CONTENT_LOADED_INIT - Инициализация при загрузке DOM
        // КРИТИЧНО: Откладываем инициализацию тяжелых операций после полной загрузки
        document.addEventListener('DOMContentLoaded', () => {
            // Быстрые операции сразу
            if (window.GenesisTechData) {
                // Сначала быстрые методы
                window.GenesisTechData.updateDeviceInfo();
                window.GenesisTechData.updateSystemInfo();
            }
            
            // Тяжелые операции откладываем
            setTimeout(() => {
                if (window.GenesisTechData) {
                    window.GenesisTechData.init();
                }
            }, 3000); // 3 секунды после DOMContentLoaded
        });

// ===== Script Block 3 =====
// Анимация "заливки" слов: текст шагов сразу напечатан, каждое слово подсвечивается поочерёдно, затем галочка, пауза 20 сек и новый цикл
                    (function() {
                        function onReady(fn) {
                            if (document.readyState !== 'loading') fn();
                            else document.addEventListener('DOMContentLoaded', fn);
                        }
                        onReady(function() {
                            const steps = document.querySelectorAll('#instructions-steps .step-text');
                            const checkmark = document.getElementById('instructions-checkmark');
                            if (!steps.length || !checkmark) return;
                            const readingSpeed = 250; // мс на слово
                            const pauseBetweenSteps = 400;
                            const pauseAfterAll = 20000; // 20 секунд
                            // MCP-MARKER:FUNCTION:SPLIT_WORDS - Разделение текста на слова для анимации
                            function splitWords(stepEl) {
                                const fullText = stepEl.getAttribute('data-full');
                                const words = fullText.split(' ');
                                stepEl.innerHTML = '';
                                words.forEach(function(word, idx) {
                                    const span = document.createElement('span');
                                    span.textContent = word + (idx < words.length-1 ? ' ' : '');
                                    span.className = 'word-to-fill';
                                    stepEl.appendChild(span);
                                });
                            }
                            // MCP-MARKER:FUNCTION:ANIMATE_WORDS_STEPS - Анимация слов по шагам
                            function animateWords(stepEls, cb) {
                                let stepIdx = 0;
                                // MCP-MARKER:FUNCTION:ANIMATE_STEP - Анимация одного шага
                                function animateStep() {
                                    if (stepIdx >= stepEls.length) { cb && cb(); return; }
                                    const wordSpans = stepEls[stepIdx].querySelectorAll('.word-to-fill');
                                    let wordIdx = 0;
                                    // MCP-MARKER:FUNCTION:FILL_WORD - Заполнение слова в анимации
                                    function fillWord() {
                                        if (wordIdx < wordSpans.length) {
                                            wordSpans[wordIdx].classList.add('word-filled');
                                            wordIdx++;
                                            setTimeout(fillWord, readingSpeed);
                                        } else {
                                            stepIdx++;
                                            setTimeout(animateStep, pauseBetweenSteps);
                                        }
                                    }
                                    fillWord();
                                }
                                animateStep();
                            }
                            // MCP-MARKER:FUNCTION:START_CYCLE - Запуск цикла анимации
                            function startCycle() {
                                // Сброс
                                steps.forEach(splitWords);
                                steps.forEach(function(step) {
                                    step.querySelectorAll('.word-to-fill').forEach(function(w) {
                                        w.classList.remove('word-filled');
                                    });
                                });
                                checkmark.style.display = 'none';
                                // Анимация
                                animateWords(steps, function() {
                                    checkmark.style.display = 'block';
                                    setTimeout(startCycle, pauseAfterAll);
                                });
                            }
                            // Стили для заливки
                            const style = document.createElement('style');
                            style.textContent = `
                                .word-to-fill { transition: color 0.3s, background 0.3s; color: #8b949e; background: none; }
                                .word-to-fill.word-filled { color: #f0f6fc; background: linear-gradient(90deg, #58a6ff22, #22c55e22); border-radius: 4px; }
                            `;
                            document.head.appendChild(style);
                            startCycle();
                        });
                    })();

// ===== Script Block 4 =====
// No-op для обращения к GenesisApp на главной, когда приложение отключено
        window.GenesisApp = window.GenesisApp || {
            showNotification: function(){},
            checkPlatformAccessOnLoad: function(){},
        };
        // MCP-MARKER:FUNCTION:OPEN_TRADING_LINK - Открытие торговых ссылок
        // Универсальная функция для открытия торговых и информационных ссылок
        function openTradingLink(type) {
            // Определяем ссылки локально
            const links = {
                pancakeswap: 'https://pancakeswap.finance/swap?outputCurrency=0xdf179b6cAdBC61FFD86A3D2e55f6d6e083ade6c1',
                bscscan: 'https://bscscan.com/token/0xdf179b6cAdBC61FFD86A3D2e55f6d6e083ade6c1',
                contract: 'https://bscscan.com/address/0xdf179b6cAdBC61FFD86A3D2e55f6d6e083ade6c1',
                holders: 'https://bscscan.com/token/0xdf179b6cAdBC61FFD86A3D2e55f6d6e083ade6c1#balances'
            };
            if (links[type]) {
                window.open(links[type], '_blank');
            } else {
                console.warn('Ссылка не найдена:', type);
            }
        }

        // MCP-MARKER:FUNCTION:COPY_TOKEN_ADDRESS - Копирование адреса токена (удалена старая версия, используется улучшенная ниже)

        // MCP-MARKER:WALLET:INTEGRATION_FUNCTIONS - Функции интеграции с кошельками (удалена старая версия, используется улучшенная ниже)

        // MCP-MARKER:WALLET:TRUST_WALLET_INTEGRATION - Интеграция с Trust Wallet (удалена старая версия, используется улучшенная ниже)
        // MCP-MARKER:WALLET:SAFEPAL_INTEGRATION - Интеграция с SafePal (удалена старая версия, используется улучшенная ниже)

        // MCP-MARKER:INIT:PAGE_LOAD_HANDLER - Обработчик загрузки страницы
        // MCP-MARKER:INIT:QR_CODE_INITIALIZATION - Инициализация QR кода
        // Инициализация при загрузке страницы
        // MCP-MARKER:EVENT:DOM_CONTENT_LOADED_ANIMATIONS - Инициализация анимаций при загрузке
        document.addEventListener('DOMContentLoaded', function() {
            // Анимация появления элементов
            const observerOptions = {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }
                });
            }, observerOptions);

            // КРИТИЧНО: НЕ скрываем карточки по умолчанию - они должны быть видны сразу
            // Анимация применяется только когда элемент входит в viewport
            document.querySelectorAll('.genesis-info-card, .unified-card, .instruction-card').forEach(card => {
                // НЕ устанавливаем opacity: 0 - карточки должны быть видны
                // Только добавляем transition для плавной анимации при появлении
                card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                // Убеждаемся что карточка видна
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
                observer.observe(card);
            });
        });

        // MCP-MARKER:UI:INSTRUCTION_TOGGLE - Переключение инструкций
        // Функция переключения инструкций
        function toggleInstructions() {
            const toggle = document.querySelector('.instruction-toggle');
            const content = document.getElementById('instruction-content');
            
            if (content.classList.contains('active')) {
                content.classList.remove('active');
                toggle.classList.remove('active');
                toggle.querySelector('.toggle-text').textContent = 'Показать пошаговую инструкцию';
            } else {
                content.classList.add('active');
                toggle.classList.add('active');
                toggle.querySelector('.toggle-text').textContent = 'Скрыть инструкцию';
                
                // Анимация появления шагов
                const steps = document.querySelectorAll('.step-item');
                steps.forEach((step, index) => {
                    step.style.animationDelay = `${0.1 * (index + 1)}s`;
                });
            }
        }

        // MCP-MARKER:FUNCTION:COPY_TOKEN_ADDRESS_ENHANCED - Улучшенная функция копирования адреса токена
        // Улучшенная функция копирования адреса токена
        function copyTokenAddress() {
            const address = '0xdf179b6cAdBC61FFD86A3D2e55f6d6e083ade6c1';
            navigator.clipboard.writeText(address).then(() => {
                // Показываем красивое уведомление
                showCopyNotification('Адрес токена скопирован!', 'success');
                
                // Обновляем текст кнопки
                const btn = document.querySelector('.copy-address-btn');
                const originalText = btn.innerHTML;
                btn.innerHTML = '<span class="copy-icon">✅</span><span class="copy-text">Скопировано!</span>';
                btn.style.background = 'linear-gradient(135deg, #28a745, #20c997)';
                
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.style.background = 'linear-gradient(135deg, #4ecdc4, #44a08d)';
                }, 2000);
            }).catch(() => {
                showCopyNotification('Ошибка копирования', 'error');
            });
        }

        // MCP-MARKER:UI:NOTIFICATION_SYSTEM - Система уведомлений
        // MCP-MARKER:FUNCTION:SHOW_NOTIFICATION - Показ уведомлений
        // Функция показа уведомлений
        function showCopyNotification(message, type = 'success') {
            const notification = document.createElement('div');
            notification.className = `copy-notification ${type}`;
            notification.innerHTML = `
                <div class="notification-content">
                    <span class="notification-icon">${type === 'success' ? '✅' : '❌'}</span>
                    <span class="notification-text">${message}</span>
                </div>
            `;
            
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${type === 'success' ? 'linear-gradient(135deg, #28a745, #20c997)' : 'linear-gradient(135deg, #dc3545, #c82333)'};
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 10px;
                z-index: 10000;
                box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
                transform: translateX(100%);
                transition: transform 0.3s ease;
                max-width: 300px;
            `;
            
            document.body.appendChild(notification);
            
            // Анимация появления
            setTimeout(() => {
                notification.style.transform = 'translateX(0)';
            }, 100);
            
            // Автоматическое скрытие
            setTimeout(() => {
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }, 3000);
        }

        // MCP-MARKER:WALLET:ENHANCED_INTEGRATION - Улучшенные функции интеграции с кошельками
        // Улучшенные функции добавления в кошельки
        function addToMetaMask() {
            if (typeof window.ethereum !== 'undefined') {
                // Показываем статус загрузки
                updateWalletStatus('metamask-status', 'Подключение...', 'loading');
                
                window.ethereum.request({
                    method: 'wallet_watchAsset',
                    params: {
                        type: 'ERC20',
                        options: {
                            address: '0xdf179b6cAdBC61FFD86A3D2e55f6d6e083ade6c1',
                            symbol: 'PLEX',
                            decimals: 9,
                            image: 'https://your-token-image-url.com/plex-icon.png'
                        }
                    }
                }).then((success) => {
                    if (success) {
                        updateWalletStatus('metamask-status', 'Добавлен!', 'success');
                        showCopyNotification('PLEX ONE успешно добавлен в MetaMask!', 'success');
                    } else {
                        updateWalletStatus('metamask-status', 'Отменено', 'cancelled');
                    }
                }).catch((error) => {
                    console.error('MetaMask error:', error);
                    updateWalletStatus('metamask-status', 'Ошибка', 'error');
                    showCopyNotification('Ошибка добавления в MetaMask', 'error');
                });
            } else {
                updateWalletStatus('metamask-status', 'Не установлен', 'error');
                showCopyNotification('MetaMask не установлен. Установите MetaMask и попробуйте снова.', 'error');
            }
        }

        function addToTrustWallet() {
            updateWalletStatus('trustwallet-status', 'Открытие...', 'loading');
            
            const trustWalletUrl = `https://link.trustwallet.com/add_asset?asset=c20_0xdf179b6cAdBC61FFD86A3D2e55f6d6e083ade6c1`;
            
            // Пытаемся открыть в приложении
            window.open(trustWalletUrl, '_blank');
            
            // Показываем инструкцию
            setTimeout(() => {
                updateWalletStatus('trustwallet-status', 'Открыто', 'success');
                showCopyNotification('Trust Wallet открыт. Следуйте инструкциям в приложении.', 'success');
            }, 1000);
        }

        function addToSafePal() {
            updateWalletStatus('safepal-status', 'Инструкция', 'info');
            
            // Показываем модальное окно с инструкцией
            showSafePalInstructions();
        }

        // MCP-MARKER:UI:WALLET_STATUS_MANAGER - Менеджер статусов кошельков
        // Функция обновления статуса кошелька
        function updateWalletStatus(elementId, text, status) {
            const element = document.getElementById(elementId);
            if (element) {
                element.textContent = text;
                element.className = `wallet-status ${status}`;
                
                // Анимация обновления
                element.style.animation = 'pulse 0.5s ease';
                setTimeout(() => {
                    element.style.animation = '';
                }, 500);
            }
        }

        // MCP-MARKER:UI:SAFEPAL_MODAL - Модальное окно SafePal
        // Функция показа инструкции для SafePal
        function showSafePalInstructions() {
            const modal = document.createElement('div');
            modal.className = 'safepal-modal';
            modal.innerHTML = `
                <div class="modal-overlay">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>🛡️ Добавление в SafePal</h3>
                            <button class="modal-close" onclick="this.closest('.safepal-modal').remove()">×</button>
                        </div>
                        <div class="modal-body">
                            <div class="instruction-step">
                                <div class="step-number">1</div>
                                <div class="step-text">Откройте приложение SafePal</div>
                            </div>
                            <div class="instruction-step">
                                <div class="step-number">2</div>
                                <div class="step-text">Нажмите на значок "+" или "Добавить токен"</div>
                            </div>
                            <div class="instruction-step">
                                <div class="step-number">3</div>
                                <div class="step-text">Выберите "Импорт токена"</div>
                            </div>
                            <div class="instruction-step">
                                <div class="step-number">4</div>
                                <div class="step-text">Вставьте адрес: <code>0xdf179b6cAdBC61FFD86A3D2e55f6d6e083ade6c1</code></div>
                            </div>
                            <div class="instruction-step">
                                <div class="step-number">5</div>
                                <div class="step-text">Проверьте параметры и подтвердите</div>
                            </div>
                            <div class="modal-actions">
                                <button class="modal-btn" onclick="copyTokenAddress(); this.closest('.safepal-modal').remove();">
                                    📋 Копировать адрес
                                </button>
                                <button class="modal-btn secondary" onclick="this.closest('.safepal-modal').remove();">
                                    Закрыть
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Добавляем стили для модального окна
            const style = document.createElement('style');
            style.textContent = `
                .safepal-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 10000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .modal-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.8);
                    backdrop-filter: blur(10px);
                }
                
                .modal-content {
                    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 20px;
                    padding: 2rem;
                    max-width: 500px;
                    width: 90%;
                    position: relative;
                    z-index: 1;
                    animation: fadeInUp 0.3s ease;
                }
                
                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                    padding-bottom: 1rem;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }
                
                .modal-header h3 {
                    margin: 0;
                    color: #4ecdc4;
                }
                
                .modal-close {
                    background: none;
                    border: none;
                    color: rgba(255, 255, 255, 0.7);
                    font-size: 2rem;
                    cursor: pointer;
                    padding: 0;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    transition: all 0.3s ease;
                }
                
                .modal-close:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: white;
                }
                
                .instruction-step {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 1rem;
                    padding: 1rem;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                }
                
                .instruction-step .step-number {
                    background: linear-gradient(135deg, #4ecdc4, #44a08d);
                    color: white;
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    flex-shrink: 0;
                }
                
                .instruction-step .step-text {
                    color: rgba(255, 255, 255, 0.9);
                    flex: 1;
                }
                
                .instruction-step code {
                    background: rgba(0, 0, 0, 0.3);
                    padding: 0.25rem 0.5rem;
                    border-radius: 4px;
                    font-family: monospace;
                    color: #4ecdc4;
                }
                
                .modal-actions {
                    display: flex;
                    gap: 1rem;
                    margin-top: 2rem;
                    justify-content: center;
                }
                
                .modal-btn {
                    background: linear-gradient(135deg, #4ecdc4, #44a08d);
                    color: white;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 500;
                    transition: all 0.3s ease;
                }
                
                .modal-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(78, 205, 196, 0.4);
                }
                
                .modal-btn.secondary {
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                }
                
                .modal-btn.secondary:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
                
                @media (max-width: 768px) {
                    .modal-content {
                        margin: 1rem;
                        padding: 1.5rem;
                    }
                    
                    .modal-actions {
                        flex-direction: column;
                    }
                }
            `;
            
            document.head.appendChild(style);
            document.body.appendChild(modal);
            
            // Закрытие по клику на оверлей
            modal.querySelector('.modal-overlay').addEventListener('click', (e) => {
                if (e.target === e.currentTarget) {
                    modal.remove();
                }
            });
        }

        // Добавляем стили для статусов кошельков
        const walletStatusStyles = document.createElement('style');
        walletStatusStyles.textContent = `
            .wallet-status.loading {
                background: rgba(255, 193, 7, 0.2);
                color: #ffc107;
                animation: pulse 1s infinite;
            }
            
            .wallet-status.success {
                background: rgba(40, 167, 69, 0.2);
                color: #28a745;
            }
            
            .wallet-status.error {
                background: rgba(220, 53, 69, 0.2);
                color: #dc3545;
            }
            
            .wallet-status.cancelled {
                background: rgba(108, 117, 125, 0.2);
                color: #6c757d;
            }
            
            .wallet-status.info {
                background: rgba(23, 162, 184, 0.2);
                color: #17a2b8;
            }
            
            .notification-content {
                display: flex;
                align-items: center;
                gap: 0.75rem;
            }
            
            .notification-icon {
                font-size: 1.2rem;
            }
            
            .notification-text {
                font-weight: 500;
            }
        `;
        document.head.appendChild(walletStatusStyles);

// ===== Script Block 5 =====
// MCP-MARKER:CONFIG:AUTH_CONFIG - Конфигурация авторизации
        // Конфигурация авторизации
        const AUTH_CONFIG = {
            address: '0x399B22170B0AC7BB20bdC86772BfF478f201fFCD', // Кошелек для авторизации
            network: 'BSC',
            chainId: 56
        };
        
        // MCP-MARKER:FUNCTION:GENERATE_QR_CODE - Генерация QR кода
        // Функция генерации QR кода (идемпотентная, с защитой от параллельных вызовов)
        let __qrGenerating = false;
        let __qrLastFallbackLog = 0;
        async function generateQRCode() {
            if (__qrGenerating) return; // защита от параллельных вызовов
            const qrContainer = document.getElementById('genesis-qr-code');
            if (!qrContainer) {
                console.error('❌ Контейнер QR кода не найден');
                return;
            }
            try {
                __qrGenerating = true;
                const ok = await (window.generateQRCode ? window.generateQRCode(qrContainer, AUTH_CONFIG.address) : Promise.resolve(false));
                if (!ok) throw new Error('Bridge generation failed');
                // Стилизация, если был создан canvas
                const canvas = qrContainer.querySelector('canvas');
                if (canvas) {
                    canvas.style.borderRadius = '10px';
                    canvas.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
                    canvas.style.border = '3px solid #4ecdc4';
                }
            } catch (e) {
                // троттлинг ошибок, чтобы не спамить консоль
                const now = Date.now();
                if (now - __qrLastFallbackLog > 5000) {
                    __qrLastFallbackLog = now;
                    console.error('❌ Ошибка генерации QR кода через мост:', e);
                }
                showFallbackQR();
            } finally {
                __qrGenerating = false;
            }
        }
        
        // MCP-MARKER:FUNCTION:SHOW_FALLBACK_QR - Fallback QR код
        // Fallback функция для QR кода (перезаписывает содержимое контейнера)
        function showFallbackQR() {
            const qrContainer = document.getElementById('genesis-qr-code');
            if (!qrContainer) return;
            
            // очищаем контейнер чтобы избежать накопления узлов
            qrContainer.innerHTML = '';
            console.log('🔄 Используем fallback QR код');
            
            // Создаем изображение с внешним API (улучшенные параметры)
            const img = document.createElement('img');
            img.src = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(AUTH_CONFIG.address)}&color=000000&bgcolor=ffffff&margin=4&ecc=H&format=png`;
            img.alt = 'QR код для авторизации';
            img.style.width = '256px';
            img.style.height = '256px';
            img.style.borderRadius = '10px';
            img.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
            img.style.border = '3px solid #4ecdc4';
            
            // Добавляем обработчик ошибок
            img.onerror = function() {
                console.error('❌ Ошибка загрузки fallback QR кода');
                showTextFallback();
            };
            
            img.onload = function() {
                console.log('✅ Fallback QR код загружен');
            };
            
            qrContainer.appendChild(img);
        }
        
        // MCP-MARKER:FUNCTION:SHOW_TEXT_FALLBACK - Текстовый fallback
        // Текстовый fallback
        function showTextFallback() {
            const qrContainer = document.getElementById('genesis-qr-code');
            if (!qrContainer) return;
            
            console.log('📝 Показываем текстовый fallback');
            
            qrContainer.innerHTML = `
                <div class="qr-text-fallback-container">
                    <div class="qr-fallback-icon">📱</div>
                    <div class="qr-fallback-title">QR код недоступен</div>
                    <div class="qr-fallback-description">Скопируйте адрес вручную:</div>
                    <div class="qr-fallback-address-box">
                        ${AUTH_CONFIG.address}
                    </div>
                    <button onclick="copyAddress()" class="qr-copy-button">📋 Копировать адрес</button>
                </div>
            `;
        }
        
        // MCP-MARKER:FUNCTION:REFRESH_QR_CODE - Обновление QR кода
        // Функция обновления QR кода
        function refreshQRCode() {
            console.log('🔄 Обновляем QR код');
            generateQRCode();
        }
        
        // Функция копирования адреса
        function copyAddress() {
            const address = AUTH_CONFIG.address;
            navigator.clipboard.writeText(address).then(function() {
                console.log('✅ Адрес скопирован в буфер обмена:', address);
                showNotification('Адрес скопирован!', 'success');
            }).catch(function(err) {
                console.error('❌ Ошибка копирования:', err);
                showNotification('Ошибка копирования', 'error');
                
                // Fallback для старых браузеров
                const textArea = document.createElement('textarea');
                textArea.value = address;
                document.body.appendChild(textArea);
                textArea.select();
                try {
                    document.execCommand('copy');
                    showNotification('Адрес скопирован!', 'success');
                } catch (err) {
                    showNotification('Ошибка копирования', 'error');
                }
                document.body.removeChild(textArea);
            });
        }
        
        // Функция показа уведомлений
        function showNotification(message, type = 'info') {
            const notification = document.createElement('div');
            notification.className = `copy-notification ${type}`;
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${type === 'success' ? 'rgba(40, 167, 69, 0.9)' : 'rgba(220, 53, 69, 0.9)'};
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 10px;
                z-index: 10000;
                font-weight: 500;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            `;
            notification.textContent = message;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.remove();
            }, 3000);
        }
        
        // Инициализация при загрузке страницы (однократная)
        // КРИТИЧНО: Откладываем генерацию QR кода чтобы не блокировать загрузку
        document.addEventListener('DOMContentLoaded', function() {
            if (window.__qrInit) return;
            window.__qrInit = true;
            console.log('🚀 Инициализация QR кода (отложенная)');
            
            // КРИТИЧНО: Ждем дольше перед генерацией QR - не блокируем загрузку страницы
            setTimeout(() => {
                // Генерируем начальный QR код асинхронно
                generateQRCode().catch(err => {
                    console.warn('Ошибка генерации QR кода (не критично):', err);
                    // Показываем fallback если основная генерация не удалась
                    showFallbackQR();
                });
                
                // Автообновление QR кода каждые 5 минут
                if (!window.__qrIntervalStarted) {
                    window.__qrIntervalStarted = true;
                    setInterval(() => {
                        generateQRCode().catch(err => {
                            console.warn('Ошибка автообновления QR:', err);
                        });
                    }, 300000);
                }
            }, 3000); // Увеличено с 1 до 3 секунд
        });
        
        // MCP-MARKER:FUNCTION:GENERATE_QR_CODE_ALTERNATIVE - Альтернативная генерация QR
        // Альтернативная функция генерации QR кода
        function generateQRCodeAlternative() {
            const qrContainer = document.getElementById('genesis-qr-code');
            if (!qrContainer) return;
            
            qrContainer.innerHTML = '';
            
            // Используем простой SVG QR код
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('width', '256');
            svg.setAttribute('height', '256');
            svg.setAttribute('viewBox', '0 0 256 256');
            svg.style.borderRadius = '10px';
            svg.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
            svg.style.border = '3px solid #4ecdc4';
            
            // Создаем простой QR код с помощью Canvas API
            const canvas = document.createElement('canvas');
            canvas.width = 256;
            canvas.height = 256;
            const ctx = canvas.getContext('2d');
            
            // Заполняем белым фоном
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, 256, 256);
            
            // Создаем простой паттерн QR кода (для демонстрации)
            ctx.fillStyle = '#000000';
            const size = 8;
            const margin = 32;
            const dataSize = (256 - 2 * margin) / size;
            
            // Рисуем рамку
            for (let i = 0; i < dataSize; i++) {
                for (let j = 0; j < dataSize; j++) {
                    if (i === 0 || i === dataSize - 1 || j === 0 || j === dataSize - 1) {
                        ctx.fillRect(margin + i * size, margin + j * size, size, size);
                    }
                }
            }
            
            // Добавляем адрес текстом
            ctx.fillStyle = '#4ecdc4';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('PLEX ONE', 128, 240);
            
            qrContainer.appendChild(canvas);
        }
        
        // MCP-MARKER:FUNCTION:CREATE_PROPER_QR_CODE - Правильный QR код
        // Функция для создания QR кода с правильным форматом
        function createProperQRCode() {
            const qrContainer = document.getElementById('genesis-qr-code');
            if (!qrContainer) return;
            
            qrContainer.innerHTML = '';
            
            // Создаем данные в правильном формате для кошельков
            const qrData = {
                address: AUTH_CONFIG.address,
                network: AUTH_CONFIG.network,
                chainId: AUTH_CONFIG.chainId,
                token: 'PLEX ONE'
            };
            
            const qrString = JSON.stringify(qrData);
            
            // Используем Google Charts API для создания QR кода
            const img = document.createElement('img');
            img.src = `https://chart.googleapis.com/chart?cht=qr&chs=256x256&chl=${encodeURIComponent(qrString)}&chld=H|0`;
            img.alt = 'QR код для авторизации';
            img.style.width = '256px';
            img.style.height = '256px';
            img.style.borderRadius = '10px';
            img.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
            img.style.border = '3px solid #4ecdc4';
            
            img.onerror = function() {
                console.error('❌ Ошибка загрузки Google Charts QR кода');
                showFallbackQR();
            };
            
            img.onload = function() {
                console.log('✅ Google Charts QR код загружен');
            };
            
            qrContainer.appendChild(img);
        }
        
        // Обработчик для кнопки обновления
        if (typeof refreshQRCode === 'undefined') {
            window.refreshQRCode = refreshQRCode;
        }
        
        // Добавляем функции в глобальную область
        window.createProperQRCode = createProperQRCode;
        window.generateQRCodeAlternative = generateQRCodeAlternative;
        
        // MCP-MARKER:FUNCTION:COPY_AUTH_ADDRESS - Копирование адреса авторизации
        // Функция копирования адреса авторизации
        function copyAuthAddress() {
            const address = AUTH_CONFIG.address;
            
            navigator.clipboard.writeText(address).then(function() {
                console.log('✅ Адрес авторизации скопирован:', address);
                showNotification('Адрес авторизации скопирован!', 'success');
                
                // Анимация кнопки
                const addressBox = document.querySelector('.address-display-box');
                if (addressBox) {
                    addressBox.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        addressBox.style.transform = 'scale(1)';
                    }, 150);
                }
            }).catch(function(err) {
                console.error('❌ Ошибка копирования адреса авторизации:', err);
                showNotification('Ошибка копирования', 'error');
                
                // Fallback для старых браузеров
                const textArea = document.createElement('textarea');
                textArea.value = address;
                document.body.appendChild(textArea);
                textArea.select();
                try {
                    document.execCommand('copy');
                    showNotification('Адрес скопирован!', 'success');
                } catch (err) {
                    showNotification('Ошибка копирования', 'error');
                }
                document.body.removeChild(textArea);
            });
        }
        
        // Добавляем функцию в глобальную область
        window.copyAuthAddress = copyAuthAddress;
        
        // MCP-MARKER:FUNCTION:TEST_COPY_FUNCTIONS - Тестовые функции
        // Тестовая функция для проверки работы копирования
        function testCopyFunctions() {
            console.log('🧪 Тестирование функций копирования...');
            console.log('📋 AUTH_CONFIG.address:', AUTH_CONFIG.address);
            console.log('📋 copyAuthAddress function:', typeof copyAuthAddress);
            console.log('📋 copyAddress function:', typeof copyAddress);
            
            // Тестируем копирование
            copyAuthAddress();
        }
        
        // Добавляем тестовую функцию в глобальную область
        window.testCopyFunctions = testCopyFunctions;
        
        // MCP-MARKER:ANIMATION:AUTH_INSTRUCTIONS - Анимация инструкций авторизации
        // Анимация инструкции авторизации
        // MCP-MARKER:FUNCTION:INIT_AUTH_INSTRUCTION_ANIMATION - Инициализация анимаций инструкций
        function initAuthInstructionAnimation() {
            const steps = document.querySelectorAll('#auth-steps-list li');
            const words = document.querySelectorAll('#auth-steps-list .word');
            let currentStep = 0;
            let currentWord = 0;
            
        // MCP-MARKER:FUNCTION:ANIMATE_WORDS - Анимация слов
            // Функция анимации слов
            function animateWords() {
                // Убираем активность со всех слов
                words.forEach(word => {
                    word.classList.remove('active', 'completed');
                });
                
                // Убираем активность со всех шагов
                steps.forEach(step => {
                    step.classList.remove('step-active');
                });
                
                // Активируем текущий шаг
                if (steps[currentStep]) {
                    steps[currentStep].classList.add('step-active');
                }
                
                // Анимируем слова в текущем шаге
                const currentStepWords = steps[currentStep]?.querySelectorAll('.word');
                if (currentStepWords && currentStepWords[currentWord]) {
                    currentStepWords[currentWord].classList.add('active');
                    
                    // Помечаем предыдущие слова как завершенные
                    for (let i = 0; i < currentWord; i++) {
                        if (currentStepWords[i]) {
                            currentStepWords[i].classList.add('completed');
                        }
                    }
                    
                    currentWord++;
                    
                    // Если все слова в шаге анимированы, переходим к следующему шагу
                    if (currentWord >= currentStepWords.length) {
                        setTimeout(() => {
                            currentStep = (currentStep + 1) % steps.length;
                            currentWord = 0;
                        }, 1000);
                    }
                }
            }
            
            // КРИТИЧНО: На лендинге можем отключить эту анимацию если она тяжелая
            if (!window.GENESIS_LANDING) {
                // Запускаем анимацию только в приложении
                setInterval(animateWords, 800);
                // Запускаем сразу
                animateWords();
            }
        }
        
        // MCP-MARKER:INIT:ANIMATION_INITIALIZATION - Инициализация анимации
            // Инициализация анимации при загрузке страницы - КРИТИЧНО: только если нужно
            document.addEventListener('DOMContentLoaded', function() {
                // На лендинге можем отключить эту анимацию если она тяжелая
                if (!window.GENESIS_LANDING) {
                    // Ждем загрузки всех элементов
                    setTimeout(() => {
                        initAuthInstructionAnimation();
                    }, 2000);
                }
            });
        
        // Добавляем функцию в глобальную область
        window.initAuthInstructionAnimation = initAuthInstructionAnimation;
        
        // MCP-MARKER:INIT:ENHANCED_DEPOSITS - Инициализация улучшенной системы депозитов
        document.addEventListener('DOMContentLoaded', function() {
            // Инициализация депозитной системы
            if (window.EnhancedDepositSystem) {
                initEnhancedDepositUI();
            }
        });
        
        // Функции для работы с депозитной системой
        function initEnhancedDepositUI() {
            loadDepositPlans();
            setupDepositFormHandlers();
            loadUserDepositStats();
        }
        
        function loadDepositPlans() {
            const plansGrid = document.getElementById('deposit-plans-grid');
            if (!plansGrid) return;
            
            const plans = window.EnhancedDepositSystem.getAvailablePlans();
            plansGrid.innerHTML = '';
            
            plans.forEach((plan, index) => {
                const isRecommended = plan.id === 'starter';
                const planCard = createDepositPlanCard(plan, isRecommended);
                plansGrid.appendChild(planCard);
            });
        }
        
        function createDepositPlanCard(plan, isRecommended = false) {
            const card = document.createElement('div');
            card.className = `deposit-plan-card ${isRecommended ? 'recommended' : ''}`;
            
            card.innerHTML = `
                <div class="plan-header">
                    <div class="plan-title">${plan.title}</div>
                    <div class="plan-subtitle">${plan.description}</div>
                    <div class="plan-amount">$${plan.usdtAmount}</div>
                    <div class="plan-percentage">${plan.percentage}% за ${plan.days} дней</div>
                </div>
                <ul class="plan-features">
                    <li>Минимум: $${plan.usdtAmount}</li>
                    <li>Доходность: ${plan.percentage}%</li>
                    <li>Срок: ${plan.days} дней</li>
                    <li>Валюты: ${plan.currencies.join(', ')}</li>
                    <li>Автоматические выплаты</li>
                    <li>Полная гарантия</li>
                </ul>
                <button class="plan-select-btn" onclick="selectDepositPlan('${plan.id}')">
                    💰 Выбрать план
                </button>
            `;
            
            return card;
        }
        
        // MCP-MARKER:FUNCTION:SELECT_DEPOSIT_PLAN - Выбор депозитного плана
        function selectDepositPlan(planId) {
            const formContainer = document.getElementById('deposit-form-container');
            const planSelect = document.getElementById('deposit-plan');
            
            if (formContainer && planSelect) {
                // Показываем форму
                formContainer.style.display = 'block';
                formContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                // Выбираем план
                planSelect.value = planId;
                
                // Загружаем планы в select
                loadPlansIntoSelect();
                
                // Обновляем расчеты
                updateDepositCalculation();
            }
        }
        
        function loadPlansIntoSelect() {
            const planSelect = document.getElementById('deposit-plan');
            if (!planSelect) return;
            
            const plans = window.EnhancedDepositSystem.getAvailablePlans();
            planSelect.innerHTML = '<option value="">Выберите план</option>';
            
            plans.forEach(plan => {
                const option = document.createElement('option');
                option.value = plan.id;
                option.textContent = `${plan.title} - ${plan.percentage}% за ${plan.days} дней`;
                planSelect.appendChild(option);
            });
        }
        
        function setupDepositFormHandlers() {
            const form = document.getElementById('enhanced-deposit-form');
            const amountInput = document.getElementById('deposit-amount');
            const planSelect = document.getElementById('deposit-plan');
            const currencySelect = document.getElementById('deposit-currency');
            
            if (form) {
                form.addEventListener('submit', handleDepositSubmit);
            }
            
            if (amountInput) {
                amountInput.addEventListener('input', updateDepositCalculation);
            }
            
            if (planSelect) {
                planSelect.addEventListener('change', updateDepositCalculation);
            }
            
            if (currencySelect) {
                currencySelect.addEventListener('change', updateDepositCalculation);
            }
        }
        
        function updateDepositCalculation() {
            const amount = parseFloat(document.getElementById('deposit-amount')?.value) || 0;
            const planId = document.getElementById('deposit-plan')?.value;
            
            if (amount > 0 && planId) {
                const returns = window.EnhancedDepositSystem.calculateReturns(amount, planId);
                if (returns) {
                    displayCalculation(returns);
                    checkDepositLimits(amount);
                }
            } else {
                hideCalculation();
            }
        }
        
        function displayCalculation(returns) {
            const calcSection = document.getElementById('deposit-calculation');
            if (!calcSection) return;
            
            calcSection.style.display = 'block';
            
            document.getElementById('calc-principal').textContent = `$${returns.principal.toFixed(2)}`;
            document.getElementById('calc-returns').textContent = `$${returns.totalReturns.toFixed(2)}`;
            document.getElementById('calc-daily').textContent = `$${returns.dailyReturn.toFixed(2)}`;
            document.getElementById('calc-total').textContent = `$${returns.totalAmount.toFixed(2)}`;
            document.getElementById('calc-period').textContent = `${returns.days} дней`;
            document.getElementById('calc-percentage').textContent = `${returns.percentage}%`;
        }
        
        function hideCalculation() {
            const calcSection = document.getElementById('deposit-calculation');
            if (calcSection) {
                calcSection.style.display = 'none';
            }
        }
        
        function checkDepositLimits(newAmount) {
            const address = document.getElementById('deposit-address')?.value;
            if (!address) return;
            
            window.EnhancedDepositSystem.checkDepositLimits(address, newAmount)
                .then(result => {
                    displayLimitsInfo(result);
                })
                .catch(error => {
                    console.error('Ошибка проверки лимитов:', error);
                });
        }
        
        function displayLimitsInfo(limitsResult) {
            const limitsSection = document.getElementById('deposit-limits');
            if (!limitsSection) return;
            
            limitsSection.style.display = 'block';
            
            document.getElementById('current-deposits').textContent = `$${limitsResult.currentAmount.toFixed(2)}`;
            document.getElementById('total-after').textContent = `$${limitsResult.totalAfter.toFixed(2)}`;
            
            const availableLimit = 2500 - limitsResult.totalAfter;
            document.getElementById('available-limit').textContent = `$${availableLimit.toFixed(2)}`;
            
            if (!limitsResult.allowed) {
                showValidationErrors([limitsResult.reason]);
            } else {
                hideValidationErrors();
            }
        }
        
        function showValidationErrors(errors) {
            const errorsSection = document.getElementById('validation-errors');
            const errorsList = document.getElementById('error-list');
            
            if (errorsSection && errorsList) {
                errorsSection.style.display = 'block';
                errorsList.innerHTML = '';
                
                errors.forEach(error => {
                    const li = document.createElement('li');
                    li.textContent = error;
                    errorsList.appendChild(li);
                });
            }
        }
        
        function hideValidationErrors() {
            const errorsSection = document.getElementById('validation-errors');
            if (errorsSection) {
                errorsSection.style.display = 'none';
            }
        }
        
        async function handleDepositSubmit(event) {
            event.preventDefault();
            
            const submitBtn = document.getElementById('create-deposit-btn');
            const btnText = submitBtn.querySelector('.btn-text');
            const btnLoading = submitBtn.querySelector('.btn-loading');
            
            // Показываем загрузку
            btnText.style.display = 'none';
            btnLoading.style.display = 'inline-flex';
            submitBtn.disabled = true;
            
            try {
                const formData = {
                    planId: document.getElementById('deposit-plan').value,
                    amount: parseFloat(document.getElementById('deposit-amount').value),
                    currency: document.getElementById('deposit-currency').value,
                    address: document.getElementById('deposit-address').value
                };
                
                const result = await window.EnhancedDepositSystem.createDeposit(formData);
                
                if (result.success) {
                    alert('✅ Депозит успешно создан! Проверьте свой кошелек для подтверждения транзакции.');
                    closeDepositForm();
                    loadUserDepositStats();
                } else {
                    showValidationErrors([result.error]);
                }
                
            } catch (error) {
                console.error('Ошибка создания депозита:', error);
                showValidationErrors(['Произошла ошибка при создании депозита']);
            } finally {
                // Скрываем загрузку
                btnText.style.display = 'inline';
                btnLoading.style.display = 'none';
                submitBtn.disabled = false;
            }
        }
        
        // MCP-MARKER:FUNCTION:CLOSE_DEPOSIT_FORM - Закрытие формы депозита
    function closeDepositForm() {
            const formContainer = document.getElementById('deposit-form-container');
            if (formContainer) {
                formContainer.style.display = 'none';
                
                // Очищаем форму
                const form = document.getElementById('enhanced-deposit-form');
                if (form) {
                    form.reset();
                    hideCalculation();
                    hideValidationErrors();
            const limits = document.getElementById('deposit-limits');
            if (limits) limits.style.display = 'none';
                }
            }
        }
        
        function loadUserDepositStats() {
            // Заглушка для статистики пользователя
        const elTotal = document.getElementById('total-deposits');
        const elEarnings = document.getElementById('total-earnings');
        const elActive = document.getElementById('active-deposits');
        if (elTotal) elTotal.textContent = '$0';
        if (elEarnings) elEarnings.textContent = '$0';
        if (elActive) elActive.textContent = '0';
        }
        
        // MCP-MARKER:FUNCTION:PASTE_FROM_CLIPBOARD - Вставка из буфера обмена
        function pasteFromClipboard(inputId) {
            navigator.clipboard.readText()
                .then(text => {
                    const input = document.getElementById(inputId);
                    if (input) {
                        input.value = text;
                        input.dispatchEvent(new Event('input'));
                    }
                })
                .catch(err => {
                    console.error('Ошибка вставки из буфера:', err);
                });
        }
        
        // Глобальные функции
        window.selectDepositPlan = selectDepositPlan;
        window.closeDepositForm = closeDepositForm;
        window.pasteFromClipboard = pasteFromClipboard;
        
        // MCP-MARKER:FUNCTION:CHECK_CABINET_ACCESS - Проверка доступа к кабинету
        // Проверяем, есть ли сохраненный адрес пользователя для показа быстрого входа
        function checkCabinetAccess() {
            try {
                const savedAddress = localStorage.getItem('genesis_user_address');
                const authStatus = localStorage.getItem('genesis_auth_status');
                const quickAccess = document.getElementById('quick-cabinet-access');
                const authSection = document.getElementById('genesis-auth-section');
                
                if (savedAddress && quickAccess) {
                    console.log('🏦 Найден сохраненный адрес пользователя, показываем быстрый вход');
                    quickAccess.classList.add('show');
                    
                    // Скрываем основную форму авторизации
                    if (authSection) {
                        authSection.style.opacity = '0.5';
                        authSection.style.pointerEvents = 'none';
                    }
                } else {
                    if (quickAccess) {
                        quickAccess.classList.remove('show');
                    }
                    
                    // Показываем основную форму авторизации
                    if (authSection) {
                        authSection.style.opacity = '1';
                        authSection.style.pointerEvents = 'auto';
                    }
                }
            } catch (error) {
                console.error('Ошибка проверки доступа к кабинету:', error);
            }
        }
        
        // MCP-MARKER:FUNCTION:LOGOUT_FROM_INDEX - Выход с главной страницы
        // Функция выхода для главной страницы (очистка сохраненных данных)
        window.logoutFromIndex = function() {
            if (confirm('Вы уверены, что хотите выйти?')) {
                localStorage.removeItem('genesis_user_address');
                localStorage.removeItem('genesis_auth_status');
                localStorage.removeItem('genesis_user_email');
                localStorage.removeItem('genesis_user_nickname');
                console.log('👋 Выход выполнен, данные очищены');
                checkCabinetAccess(); // Обновляем интерфейс
                
                // Показываем уведомление
                if (window.GenesisApp && window.GenesisApp.showNotification) {
                    window.GenesisApp.showNotification('Выход выполнен', 'Данные авторизации очищены', 'info');
                }
            }
        };
        
        // Проверяем доступ при загрузке страницы
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(() => {
                checkCabinetAccess();
            }, 1000);
        });
        
        // Проверяем доступ при изменении localStorage (если пользователь авторизовался в другой вкладке)
        window.addEventListener('storage', function(e) {
            if (e.key === 'genesis_user_address') {
                checkCabinetAccess();
            }
        });
        
        // Горячие клавиши для навигации
        document.addEventListener('keydown', function(e) {
            // Ctrl + Enter для быстрого входа в кабинет
            if (e.ctrlKey && e.key === 'Enter') {
                const quickAccess = document.getElementById('quick-cabinet-access');
                if (quickAccess && quickAccess.classList.contains('show')) {
                    window.location.href = 'app.html';
                }
            }
        });

// ===== Script Block 6 =====
(function landingBootstrap(){
            function revealLanding(){
                if (window._landingReadyDone) return;
                window._landingReadyDone = true;
                try {
                    const appEl = document.getElementById('genesis-app');
                    if (appEl) appEl.classList.remove('hidden-initially');
                    const loading = document.getElementById('genesis-loading');
                    if (loading){
                        // КРИТИЧНО: АГРЕССИВНОЕ удаление - НЕ показываем loading screen вообще
                        loading.style.cssText = 'display: none !important; pointer-events: none !important; opacity: 0 !important; z-index: -9999 !important; visibility: hidden !important;';
                        loading.classList.add('hidden');
                        loading.classList.remove('show-loading');
                        // Удаляем элемент немедленно
                        setTimeout(() => {
                            if (loading.parentNode) {
                                loading.remove();
                            }
                        }, 50);
                    }
                    const statusEl = document.getElementById('loading-status');
                    if (statusEl) statusEl.textContent = 'Готово';
                } catch {}
            }

            function maybeReveal(){
                if (window._landingReadyDone) return;
                if (document.readyState !== 'loading'){
                    revealLanding();
                }
            }

            // Когда библиотеки готовы — тоже раскрываем
            document.addEventListener('librariesReady', () => revealLanding(), { once: true });

            if (document.readyState === 'loading'){
                document.addEventListener('DOMContentLoaded', () => maybeReveal(), { once: true });
            } else {
                maybeReveal();
            }

            // Fallback на случай задержек
            setTimeout(maybeReveal, 1500);
        })();

