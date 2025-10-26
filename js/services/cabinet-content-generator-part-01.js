                    <div class="stats-change">контрактов</div>
                </div>
                
                <div class="stats-card">
                    <div class="stats-header">
                        <span class="stats-title">ROI майнинга</span>
                        <span class="stats-icon">📈</span>
                    </div>
                    <div class="stats-value">0%</div>
                    <div class="stats-change">за месяц</div>
                </div>
            </div>
            
            <!-- ДОСТУПНЫЕ ТАРИФЫ -->
            <div class="stats-card" style="margin-bottom: 2rem;">
                <h3 style="color: var(--primary-color); margin-bottom: 1.5rem;">🏭 Тарифы аренды мощностей</h3>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
                    <!-- Стартовый тариф -->
                    <div style="background: var(--bg-primary); padding: 1.5rem; border-radius: 12px; border: 1px solid var(--border-color); transition: all 0.3s ease;">
                        <div style="text-align: center; margin-bottom: 1rem;">
                            <h3 style="color: var(--secondary-color); margin-bottom: 0.5rem;">⚡ Стартовый</h3>
                            <div style="font-size: 2.5rem; font-weight: 700; color: var(--text-primary);">10 TH/s</div>
                        </div>
                        
                        <div style="background: var(--bg-secondary); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                            <div style="display: grid; gap: 0.5rem; font-size: 0.9rem;">
                                <div style="display: flex; justify-content: space-between;">
                                    <span style="color: var(--text-secondary);">Стоимость:</span>
                                    <span style="color: var(--primary-color); font-weight: 600;">$100/месяц</span>
                                </div>
                                <div style="display: flex; justify-content: space-between;">
                                    <span style="color: var(--text-secondary);">Доход:</span>
                                    <span style="color: var(--success-color); font-weight: 600;">~$5-7/день</span>
                                </div>
                                <div style="display: flex; justify-content: space-between;">
                                    <span style="color: var(--text-secondary);">Окупаемость:</span>
                                    <span style="color: var(--warning-color); font-weight: 600;">~20 дней</span>
                                </div>
                            </div>
                        </div>
                        
                        <ul style="list-style: none; padding: 0; margin: 0 0 1rem 0; font-size: 0.9rem;">
                            <li style="margin-bottom: 0.5rem; color: var(--text-secondary);">✅ Идеально для начала</li>
                            <li style="margin-bottom: 0.5rem; color: var(--text-secondary);">✅ Стабильный доход</li>
                            <li style="margin-bottom: 0.5rem; color: var(--text-secondary);">✅ Быстрая окупаемость</li>
                        </ul>
                        
                        <button class="btn btn-secondary" style="width: 100%;" onclick="window.CabinetApp.rentMiningPower('starter')">
                            Арендовать
                        </button>
                    </div>
                    
                    <!-- Профессиональный тариф -->
                    <div style="background: var(--bg-primary); padding: 1.5rem; border-radius: 12px; border: 2px solid var(--primary-color); position: relative;">
                        <div style="position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: var(--primary-color); color: white; padding: 0.3rem 1rem; border-radius: 20px; font-size: 0.8rem; font-weight: 600;">
                            ПОПУЛЯРНЫЙ
                        </div>
                        
                        <div style="text-align: center; margin-bottom: 1rem;">
                            <h3 style="color: var(--primary-color); margin-bottom: 0.5rem;">🚀 Профессиональный</h3>
                            <div style="font-size: 2.5rem; font-weight: 700; color: var(--text-primary);">50 TH/s</div>
                        </div>
                        
                        <div style="background: var(--bg-secondary); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                            <div style="display: grid; gap: 0.5rem; font-size: 0.9rem;">
                                <div style="display: flex; justify-content: space-between;">
                                    <span style="color: var(--text-secondary);">Стоимость:</span>
                                    <span style="color: var(--primary-color); font-weight: 600;">$450/месяц</span>
                                </div>
                                <div style="display: flex; justify-content: space-between;">
                                    <span style="color: var(--text-secondary);">Доход:</span>
                                    <span style="color: var(--success-color); font-weight: 600;">~$25-35/день</span>
                                </div>
                                <div style="display: flex; justify-content: space-between;">
                                    <span style="color: var(--text-secondary);">Окупаемость:</span>
                                    <span style="color: var(--warning-color); font-weight: 600;">~15 дней</span>
                                </div>
                            </div>
                        </div>
                        
                        <ul style="list-style: none; padding: 0; margin: 0 0 1rem 0; font-size: 0.9rem;">
                            <li style="margin-bottom: 0.5rem; color: var(--text-secondary);">✅ Оптимальное решение</li>
                            <li style="margin-bottom: 0.5rem; color: var(--text-secondary);">✅ Высокий доход</li>
                            <li style="margin-bottom: 0.5rem; color: var(--text-secondary);">✅ Приоритетная поддержка</li>
                        </ul>
                        
                        <button class="btn" style="width: 100%;" onclick="window.CabinetApp.rentMiningPower('professional')">
                            Арендовать сейчас
                        </button>
                    </div>
                    
                    <!-- Корпоративный тариф -->
                    <div style="background: linear-gradient(135deg, var(--bg-primary), rgba(156, 39, 176, 0.1)); padding: 1.5rem; border-radius: 12px; border: 2px solid var(--accent-color);">
                        <div style="text-align: center; margin-bottom: 1rem;">
                            <h3 style="color: var(--accent-color); margin-bottom: 0.5rem;">💎 Корпоративный</h3>
                            <div style="font-size: 2.5rem; font-weight: 700; color: var(--text-primary);">200 TH/s</div>
                        </div>
                        
                        <div style="background: var(--bg-secondary); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                            <div style="display: grid; gap: 0.5rem; font-size: 0.9rem;">
                                <div style="display: flex; justify-content: space-between;">
                                    <span style="color: var(--text-secondary);">Стоимость:</span>
                                    <span style="color: var(--accent-color); font-weight: 600;">$1,500/месяц</span>
                                </div>
                                <div style="display: flex; justify-content: space-between;">
                                    <span style="color: var(--text-secondary);">Доход:</span>
                                    <span style="color: var(--success-color); font-weight: 600;">~$100-140/день</span>
                                </div>
                                <div style="display: flex; justify-content: space-between;">
                                    <span style="color: var(--text-secondary);">Окупаемость:</span>
                                    <span style="color: var(--warning-color); font-weight: 600;">~12 дней</span>
                                </div>
                            </div>
                        </div>
                        
                        <ul style="list-style: none; padding: 0; margin: 0 0 1rem 0; font-size: 0.9rem;">
                            <li style="margin-bottom: 0.5rem; color: var(--text-secondary);">✅ Максимальная прибыль</li>
                            <li style="margin-bottom: 0.5rem; color: var(--text-secondary);">✅ VIP поддержка 24/7</li>
                            <li style="margin-bottom: 0.5rem; color: var(--text-secondary);">✅ Бонусные мощности +10%</li>
                        </ul>
                        
                        <button class="btn" style="width: 100%; background: linear-gradient(135deg, var(--accent-color), var(--primary-color));" onclick="window.CabinetApp.rentMiningPower('corporate')">
                            Получить максимум
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- КАЛЬКУЛЯТОР ДОХОДНОСТИ -->
            <div class="stats-card" style="margin-bottom: 2rem;">
                <h3 style="color: var(--secondary-color); margin-bottom: 1.5rem;">🧮 Калькулятор доходности</h3>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                    <div>
                        <label style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem; display: block;">Выберите мощность (TH/s):</label>
                        <input type="range" id="mining-power-slider" min="10" max="500" value="50" step="10" 
                               style="width: 100%; margin-bottom: 1rem;" 
                               oninput="window.CabinetApp.updateMiningCalculator(this.value)">
                        <div style="text-align: center; font-size: 2rem; font-weight: 700; color: var(--primary-color); margin-bottom: 1rem;">
                            <span id="mining-power-value">50</span> TH/s
                        </div>
                    </div>
                    
                    <div style="background: var(--bg-primary); padding: 1.5rem; border-radius: 12px;">
                        <h4 style="color: var(--text-primary); margin-bottom: 1rem;">Прогноз доходности:</h4>
                        <div style="display: grid; gap: 0.8rem;">
                            <div style="display: flex; justify-content: space-between;">
                                <span style="color: var(--text-secondary);">Стоимость аренды:</span>
                                <span style="color: var(--primary-color); font-weight: 600;" id="mining-cost">$450/месяц</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span style="color: var(--text-secondary);">Доход в день:</span>
                                <span style="color: var(--success-color); font-weight: 600;" id="mining-daily">$25-35</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span style="color: var(--text-secondary);">Доход в месяц:</span>
                                <span style="color: var(--success-color); font-weight: 600;" id="mining-monthly">$750-1050</span>
                            </div>
                            <div style="height: 1px; background: var(--border-color);"></div>
                            <div style="display: flex; justify-content: space-between; font-size: 1.1rem;">
                                <span style="color: var(--warning-color); font-weight: 600;">Чистая прибыль:</span>
                                <span style="color: var(--warning-color); font-weight: 700;" id="mining-profit">$300-600/месяц</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- ПРЕИМУЩЕСТВА -->
            <div class="stats-card">
                <h3 style="color: var(--warning-color); margin-bottom: 1.5rem;">🎯 Почему выбирают нашу аренду</h3>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;">
                    <div style="padding: 1rem; background: var(--bg-primary); border-radius: 8px; text-align: center;">
                        <span style="font-size: 2rem;">🛡️</span>
                        <h4 style="color: var(--text-primary); margin: 0.5rem 0;">Надежность</h4>
                        <p style="color: var(--text-secondary); font-size: 0.9rem; margin: 0;">
                            Гарантированный аптайм 99.9%
                        </p>
                    </div>
                    
                    <div style="padding: 1rem; background: var(--bg-primary); border-radius: 8px; text-align: center;">
                        <span style="font-size: 2rem;">💰</span>
                        <h4 style="color: var(--text-primary); margin: 0.5rem 0;">Выгода</h4>
                        <p style="color: var(--text-secondary); font-size: 0.9rem; margin: 0;">
                            Доход выше рыночного на 20%
                        </p>
                    </div>
                    
                    <div style="padding: 1rem; background: var(--bg-primary); border-radius: 8px; text-align: center;">
                        <span style="font-size: 2rem;">⚡</span>
                        <h4 style="color: var(--text-primary); margin: 0.5rem 0;">Мощность</h4>
                        <p style="color: var(--text-secondary); font-size: 0.9rem; margin: 0;">
                            Новейшее оборудование ASIC
                        </p>
                    </div>
                    
                    <div style="padding: 1rem; background: var(--bg-primary); border-radius: 8px; text-align: center;">
                        <span style="font-size: 2rem;">🌍</span>
                        <h4 style="color: var(--text-primary); margin: 0.5rem 0;">Экология</h4>
                        <p style="color: var(--text-secondary); font-size: 0.9rem; margin: 0;">
                            100% зеленая энергия
                        </p>
                    </div>
                </div>
            </div>
        `;
    },
    
    // MCP-MARKER:METHOD:CABINET:MY_DEVICE_CONTENT - Генерация контента страницы "Мое устройство"
    getMyDeviceContent() {
        return `
            <div class="page-header">
                <h2 class="page-title">📱 Информация об устройстве</h2>
                <p class="page-subtitle">Детальная информация о вашем устройстве и системе</p>
            </div>
            
            <!-- Основная информационная сетка -->
            <div class="genesis-info-grid">
                <!-- Карточка браузера и системы -->
                <div class="genesis-info-card genesis-panel-glass">
                    <span class="tech-card-checkmark">✓</span>
                    <h3>🌐 Браузер и система</h3>
                    
                    <div class="info-item">
                        <span class="info-label">Браузер:</span>
                        <span class="info-value" id="browser-name">Загрузка...</span>
                    </div>
                    
                    <div class="info-item">
                        <span class="info-label">Платформа:</span>
                        <span class="info-value" id="platform">Загрузка...</span>
                    </div>
                    
                    <div class="info-item">
                        <span class="info-label">Язык системы:</span>
                        <span class="info-value" id="language">Загрузка...</span>
                    </div>
                    
                    <div class="info-item">
                        <span class="info-label">Cookies:</span>
                        <span class="info-value" id="cookies">Загрузка...</span>
                    </div>
                    
                    <div class="info-item">
                        <span class="info-label">Процессорные ядра:</span>
                        <span class="info-value" id="cores">Загрузка...</span>
                    </div>
                    
                    <div class="info-item">
                        <span class="info-label">Оперативная память:</span>
                        <span class="info-value" id="device-memory">Загрузка...</span>
                    </div>
                </div>
                
                <!-- Карточка экрана -->
                <div class="genesis-info-card genesis-panel-glass">
                    <span class="tech-card-checkmark">✓</span>
                    <h3>🖥️ Экран и отображение</h3>
                    
                    <div class="info-item">
                        <span class="info-label">Разрешение экрана:</span>
                        <span class="info-value" id="screen-resolution">Загрузка...</span>
                    </div>
                    
                    <div class="info-item">
                        <span class="info-label">Размер окна:</span>
                        <span class="info-value" id="window-size">Загрузка...</span>
                    </div>
                    
                    <div class="info-item">
                        <span class="info-label">Глубина цвета:</span>
                        <span class="info-value" id="color-depth">Загрузка...</span>
                    </div>
                    
                    <div class="info-item">
                        <span class="info-label">Pixel Ratio:</span>
                        <span class="info-value" id="pixel-ratio">Загрузка...</span>
                    </div>
                    
                    <div class="info-item">
                        <span class="info-label">Ориентация:</span>
                        <span class="info-value" id="orientation">Загрузка...</span>
                    </div>
                    
                    <div class="info-item">
                        <span class="info-label">WebGL:</span>
                        <span class="info-value" id="webgl-info">Загрузка...</span>
                    </div>
                </div>
                
                <!-- Карточка времени и локации -->
                <div class="genesis-info-card genesis-panel-glass">
                    <span class="tech-card-checkmark">✓</span>
                    <h3>🌍 Время и местоположение</h3>
                    
                    <div class="info-item">
                        <span class="info-label">Часовой пояс:</span>
                        <span class="info-value" id="timezone">Загрузка...</span>
                    </div>
                    
                    <div class="info-item">
                        <span class="info-label">UTC смещение:</span>
                        <span class="info-value" id="utc-offset">Загрузка...</span>
                    </div>
                    
                    <div class="info-item">
                        <span class="info-label">Локаль:</span>
                        <span class="info-value" id="locale">Загрузка...</span>
                    </div>
                    
                    <div class="info-item">
                        <span class="info-label">Текущее время:</span>
                        <span class="info-value" id="current-time">Загрузка...</span>
                    </div>
                    
                    <div class="info-item">
                        <span class="info-label">Геолокация:</span>
                        <span class="info-value" id="geolocation">
                            <button class="btn btn-secondary" style="padding: 0.25rem 0.75rem; font-size: 0.8rem;" onclick="window.GenesisTechInfo.requestGeolocation()">
                                📍 Запросить
                            </button>
                        </span>
                    </div>
                </div>
                
                <!-- Карточка сети -->
                <div class="genesis-info-card genesis-panel-glass">
                    <span class="tech-card-checkmark">✓</span>
                    <h3>🌐 Сеть и подключение</h3>
                    
                    <div class="info-item">
                        <span class="info-label">Статус сети:</span>
                        <span class="info-value" id="online-status">Загрузка...</span>
                    </div>
                    
                    <div class="info-item">
                        <span class="info-label">Тип соединения:</span>
                        <span class="info-value" id="connection-type">Загрузка...</span>
                    </div>
                    
                    <div class="info-item">
                        <span class="info-label">Скорость загрузки:</span>
                        <span class="info-value" id="downlink">Загрузка...</span>
                    </div>
                    
                    <div class="info-item">
                        <span class="info-label">Задержка (RTT):</span>
                        <span class="info-value" id="rtt">Загрузка...</span>
                    </div>
                    
                    <div class="info-item">
                        <span class="info-label">IP адрес:</span>
                        <span class="info-value" id="ip-address">Загрузка...</span>
                    </div>
                </div>
                
                <!-- Карточка батареи и ресурсов -->
                <div class="genesis-info-card genesis-panel-glass">
                    <span class="tech-card-checkmark">✓</span>
                    <h3>🔋 Батарея и ресурсы</h3>
                    
                    <div class="info-item">
                        <span class="info-label">Уровень заряда:</span>
                        <span class="info-value" id="battery-level">Загрузка...</span>
                    </div>
                    
                    <div class="info-item">
                        <span class="info-label">Статус зарядки:</span>
                        <span class="info-value" id="battery-charging">Загрузка...</span>
                    </div>
                    
                    <div class="info-item">
                        <span class="info-label">Память JS:</span>
                        <span class="info-value" id="js-memory">Загрузка...</span>
                    </div>
                    
                    <div class="info-item">
                        <span class="info-label">Хранилище:</span>
                        <span class="info-value" id="storage-info">Загрузка...</span>
                    </div>
                </div>
                
                <!-- Карточка безопасности -->
                <div class="genesis-info-card genesis-panel-glass">
                    <span class="tech-card-checkmark">✓</span>
                    <h3>🔒 Безопасность</h3>
                    
                    <div class="info-item">
                        <span class="info-label">Do Not Track:</span>
                        <span class="info-value" id="dnt">Загрузка...</span>
                    </div>
                    
                    <div class="info-item">
                        <span class="info-label">HTTPS статус:</span>
                        <span class="info-value" id="https-status">Загрузка...</span>
                    </div>
                    
                    <div class="info-item">
                        <span class="info-label">WebDriver:</span>
                        <span class="info-value" id="webdriver">Загрузка...</span>
                    </div>
                    
                    <div class="info-item">
                        <span class="info-label">Плагины:</span>
                        <span class="info-value" id="plugins-count">Загрузка...</span>
                    </div>
                </div>
            </div>
            
            <!-- PWA установка (добавляется через device-page-extension.js) -->
            
            <!-- Уведомление о конфиденциальности -->
            <div class="privacy-notice">
                <div class="privacy-icon">🔐</div>
                <div class="privacy-content">
                    <h4>Конфиденциальность ваших данных</h4>
                    <p>
                        Вся информация об устройстве собирается и используется исключительно в рамках вашего браузера.
                        Мы не передаем эти данные на сервер и не делимся ими с третьими лицами.
                    </p>
                    <div class="privacy-features">
                        <span class="privacy-feature">✅ Локальный сбор данных</span>
                        <span class="privacy-feature">✅ Без отправки на сервер</span>
                        <span class="privacy-feature">✅ Полная анонимность</span>
                        <span class="privacy-feature">✅ Вы контролируете доступ</span>
                    </div>
                </div>
            </div>
            
            <!-- Действия -->
            <div class="stats-card" style="margin-top: 2rem;">
                <h3 style="color: var(--primary-color); margin-bottom: 1.5rem;">⚡ Действия</h3>
                
                <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                    <button class="btn btn-secondary" onclick="window.GenesisTechInfo.refreshData()">
                        🔄 Обновить данные
                    </button>
                    
                    <button class="btn btn-outline" onclick="window.GenesisTechInfo.exportData()">
                        📥 Экспортировать отчет
                    </button>
                    
                    <button class="btn btn-outline" onclick="window.CabinetApp.navigateTo('settings')">
                        ⚙️ Настройки приватности
                    </button>
                </div>
            </div>
            
