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
    
