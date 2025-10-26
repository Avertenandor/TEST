/**
 * GENESIS 1.1 - Восстановленный контент недостающих разделов кабинета
 * MCP-MARKER:MODULE:CABINET_CONTENT_RESTORED - Восстановленный генератор контента
 * Дата создания: 02.08.2025
 * 
 * Этот файл содержит полный контент для разделов, которые были утрачены
 */

// Проверяем существование основного генератора
if (!window.CabinetContentGenerator) {
    console.error('❌ CabinetContentGenerator не найден! Создаем новый объект.');
    window.CabinetContentGenerator = {};
}

// Расширяем основной генератор недостающими методами
Object.assign(window.CabinetContentGenerator, {
    
    // MCP-MARKER:METHOD:CABINET:PLEX_COIN_CONTENT - Генерация контента страницы PLEX Coin
    getPlexCoinContent() {
        return `
            <div class="page-header">
                <h2 class="page-title">💎 PLEX ONE - Основа экосистемы GENESIS</h2>
                <p class="page-subtitle">Утилитарный токен с реальной ценностью и применением</p>
            </div>
            
            <!-- ОСНОВНАЯ ИНФОРМАЦИЯ О ТОКЕНЕ -->
            <div class="stats-grid" style="margin-bottom: 2rem;">
                <div class="stats-card">
                    <div class="stats-header">
                        <span class="stats-title">Текущий курс</span>
                        <span class="stats-icon">💱</span>
                    </div>
                    <div class="stats-value">$0.01</div>
                    <div class="stats-change positive">+2.5% за 24ч</div>
                </div>
                
                <div class="stats-card">
                    <div class="stats-header">
                        <span class="stats-title">Ваш баланс</span>
                        <span class="stats-icon">💰</span>
                    </div>
                    <div class="stats-value">0</div>
                    <div class="stats-change">PLEX</div>
                </div>
                
                <div class="stats-card">
                    <div class="stats-header">
                        <span class="stats-title">Рыночная капитализация</span>
                        <span class="stats-icon">📊</span>
                    </div>
                    <div class="stats-value">$1.5M</div>
                    <div class="stats-change">USD</div>
                </div>
                
                <div class="stats-card">
                    <div class="stats-header">
                        <span class="stats-title">В обращении</span>
                        <span class="stats-icon">🔄</span>
                    </div>
                    <div class="stats-value">150M</div>
                    <div class="stats-change">из 1B PLEX</div>
                </div>
            </div>
            
            <!-- ИНФОРМАЦИЯ О КОНТРАКТЕ -->
            <div class="stats-card" style="margin-bottom: 2rem;">
                <h3 style="color: var(--primary-color); margin-bottom: 1.5rem;">📋 Информация о смарт-контракте</h3>
                
                <div style="background: var(--bg-primary); padding: 1.5rem; border-radius: 12px;">
                    <div style="display: grid; gap: 1rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="color: var(--text-secondary);">Сеть:</span>
                            <span style="color: var(--secondary-color); font-weight: 600;">Binance Smart Chain (BSC)</span>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="color: var(--text-secondary);">Адрес контракта:</span>
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <code style="background: var(--bg-secondary); padding: 0.3rem 0.6rem; border-radius: 4px; font-size: 0.85rem; color: var(--primary-color);">
                                    ${window.GENESIS_CONFIG?.CONTRACT_ADDRESSES?.PLEX || '0x3F6...e9eD'}
                                </code>
                                <button class="btn-icon" onclick="window.Utils.copyToClipboard('${window.GENESIS_CONFIG?.CONTRACT_ADDRESSES?.PLEX || '0x3F6b3595ecF70735D3f48D69b09C4E4506DB3F47'}')" title="Копировать адрес">
                                    📋
                                </button>
                            </div>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="color: var(--text-secondary);">Стандарт:</span>
                            <span style="color: var(--text-primary); font-weight: 600;">BEP-20</span>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="color: var(--text-secondary);">Десятичные знаки:</span>
                            <span style="color: var(--text-primary); font-weight: 600;">18</span>
                        </div>
                        
                        <div style="display: flex; gap: 1rem; margin-top: 0.5rem;">
                            <a href="https://bscscan.com/token/${window.GENESIS_CONFIG?.CONTRACT_ADDRESSES?.PLEX || '0x3F6b3595ecF70735D3f48D69b09C4E4506DB3F47'}" 
                               target="_blank" 
                               class="btn btn-outline" 
                               style="flex: 1;">
                                🔍 Просмотреть на BSCScan
                            </a>
                            <button class="btn btn-secondary" style="flex: 1;" onclick="window.CabinetApp.addTokenToWallet()">
                                🦊 Добавить в MetaMask
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- ПРИМЕНЕНИЕ ТОКЕНА -->
            <div class="stats-card" style="margin-bottom: 2rem;">
                <h3 style="color: var(--secondary-color); margin-bottom: 1.5rem;">🎯 Применение PLEX в экосистеме</h3>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem;">
                    <div style="background: var(--bg-primary); padding: 1.5rem; border-radius: 12px; border-left: 4px solid var(--primary-color);">
                        <h4 style="color: var(--primary-color); margin-bottom: 0.8rem;">🔐 Авторизация в системе</h4>
                        <p style="color: var(--text-secondary); font-size: 0.9rem; margin: 0;">
                            Для входа в систему требуется оплата 1 PLEX. Это защищает платформу от спама и ботов.
                        </p>
                    </div>
                    
                    <div style="background: var(--bg-primary); padding: 1.5rem; border-radius: 12px; border-left: 4px solid var(--success-color);">
                        <h4 style="color: var(--success-color); margin-bottom: 0.8rem;">💰 Оплата депозитов</h4>
                        <p style="color: var(--text-secondary); font-size: 0.9rem; margin: 0;">
                            Планы 11-13 можно оплачивать в PLEX с дополнительными бонусами к доходности.
                        </p>
                    </div>
                    
                    <div style="background: var(--bg-primary); padding: 1.5rem; border-radius: 12px; border-left: 4px solid var(--warning-color);">
                        <h4 style="color: var(--warning-color); margin-bottom: 0.8rem;">⚡ Покупка множителей</h4>
                        <p style="color: var(--text-secondary); font-size: 0.9rem; margin: 0;">
                            Активируйте множители доходности за PLEX и увеличивайте прибыль до x10.
                        </p>
                    </div>
                    
                    <div style="background: var(--bg-primary); padding: 1.5rem; border-radius: 12px; border-left: 4px solid var(--secondary-color);">
                        <h4 style="color: var(--secondary-color); margin-bottom: 0.8rem;">🎁 Награды и бонусы</h4>
                        <p style="color: var(--text-secondary); font-size: 0.9rem; margin: 0;">
                            Получайте PLEX за активность, привлечение партнеров и достижения.
                        </p>
                    </div>
                    
                    <div style="background: var(--bg-primary); padding: 1.5rem; border-radius: 12px; border-left: 4px solid var(--accent-color);">
                        <h4 style="color: var(--accent-color); margin-bottom: 0.8rem;">🏪 Внутренний магазин</h4>
                        <p style="color: var(--text-secondary); font-size: 0.9rem; margin: 0;">
                            Обменивайте PLEX на эксклюзивные услуги и преимущества в экосистеме.
                        </p>
                    </div>
                    
                    <div style="background: var(--bg-primary); padding: 1.5rem; border-radius: 12px; border-left: 4px solid var(--gold-color);">
                        <h4 style="color: var(--gold-color); margin-bottom: 0.8rem;">👑 VIP статус</h4>
                        <p style="color: var(--text-secondary); font-size: 0.9rem; margin: 0;">
                            Держатели крупных сумм PLEX получают VIP привилегии и повышенную доходность.
                        </p>
                    </div>
                </div>
            </div>
            
            <!-- ТОКЕНОМИКА -->
            <div class="stats-card" style="margin-bottom: 2rem;">
                <h3 style="color: var(--warning-color); margin-bottom: 1.5rem;">📊 Токеномика PLEX</h3>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                    <div>
                        <h4 style="color: var(--text-primary); margin-bottom: 1rem;">Распределение токенов</h4>
                        <div style="background: var(--bg-primary); padding: 1rem; border-radius: 12px;">
                            <div style="margin-bottom: 1rem;">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                    <span style="color: var(--text-secondary);">Публичная продажа:</span>
                                    <span style="color: var(--primary-color); font-weight: 600;">40%</span>
                                </div>
                                <div style="height: 8px; background: var(--bg-secondary); border-radius: 4px; overflow: hidden;">
                                    <div style="width: 40%; height: 100%; background: var(--primary-color);"></div>
                                </div>
                            </div>
                            
                            <div style="margin-bottom: 1rem;">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                    <span style="color: var(--text-secondary);">Экосистема и награды:</span>
                                    <span style="color: var(--success-color); font-weight: 600;">30%</span>
                                </div>
                                <div style="height: 8px; background: var(--bg-secondary); border-radius: 4px; overflow: hidden;">
                                    <div style="width: 30%; height: 100%; background: var(--success-color);"></div>
                                </div>
                            </div>
                            
                            <div style="margin-bottom: 1rem;">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                    <span style="color: var(--text-secondary);">Команда и развитие:</span>
                                    <span style="color: var(--secondary-color); font-weight: 600;">20%</span>
                                </div>
                                <div style="height: 8px; background: var(--bg-secondary); border-radius: 4px; overflow: hidden;">
                                    <div style="width: 20%; height: 100%; background: var(--secondary-color);"></div>
                                </div>
                            </div>
                            
                            <div>
                                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                    <span style="color: var(--text-secondary);">Резерв ликвидности:</span>
                                    <span style="color: var(--warning-color); font-weight: 600;">10%</span>
                                </div>
                                <div style="height: 8px; background: var(--bg-secondary); border-radius: 4px; overflow: hidden;">
                                    <div style="width: 10%; height: 100%; background: var(--warning-color);"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <h4 style="color: var(--text-primary); margin-bottom: 1rem;">Механизмы дефляции</h4>
                        <div style="background: var(--bg-primary); padding: 1.5rem; border-radius: 12px;">
                            <ul style="list-style: none; padding: 0; margin: 0;">
                                <li style="display: flex; align-items: start; gap: 0.5rem; margin-bottom: 0.8rem;">
                                    <span style="color: var(--success-color);">🔥</span>
                                    <span style="color: var(--text-secondary); font-size: 0.9rem;">
                                        <strong style="color: var(--text-primary);">Сжигание 2%</strong> от каждой транзакции внутри экосистемы
                                    </span>
                                </li>
                                <li style="display: flex; align-items: start; gap: 0.5rem; margin-bottom: 0.8rem;">
                                    <span style="color: var(--warning-color);">💎</span>
                                    <span style="color: var(--text-secondary); font-size: 0.9rem;">
                                        <strong style="color: var(--text-primary);">Блокировка токенов</strong> при покупке долгосрочных депозитов
                                    </span>
                                </li>
                                <li style="display: flex; align-items: start; gap: 0.5rem; margin-bottom: 0.8rem;">
                                    <span style="color: var(--secondary-color);">📈</span>
                                    <span style="color: var(--text-secondary); font-size: 0.9rem;">
                                        <strong style="color: var(--text-primary);">Выкуп с рынка</strong> - 20% прибыли платформы идет на выкуп
                                    </span>
                                </li>
                                <li style="display: flex; align-items: start; gap: 0.5rem;">
                                    <span style="color: var(--primary-color);">⚡</span>
                                    <span style="color: var(--text-secondary); font-size: 0.9rem;">
                                        <strong style="color: var(--text-primary);">Стейкинг</strong> с повышенными наградами за долгосрочное хранение
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- ОБМЕН И ПОКУПКА -->
            <div class="stats-card">
                <h3 style="color: var(--success-color); margin-bottom: 1.5rem;">💱 Где купить PLEX</h3>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
                    <div style="background: var(--bg-primary); padding: 1.5rem; border-radius: 12px; text-align: center;">
                        <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNGM0JBMkYiLz4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0xMiAxNkgxNlYyNEgxMlYxNlpNMTggMTZIMjJWMjRIMThWMTZaTTI0IDE2SDI4VjI0SDI0VjE2WiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+" 
                             alt="PancakeSwap" 
                             style="width: 60px; height: 60px; margin-bottom: 1rem;">
                        <h4 style="color: var(--text-primary); margin-bottom: 0.5rem;">PancakeSwap</h4>
                        <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 1rem;">
                            Основная пара PLEX/USDT с высокой ликвидностью
                        </p>
                        <a href="https://pancakeswap.finance/swap?outputCurrency=${window.GENESIS_CONFIG?.CONTRACT_ADDRESSES?.PLEX || '0x3F6b3595ecF70735D3f48D69b09C4E4506DB3F47'}" 
                           target="_blank" 
                           class="btn btn-primary" 
                           style="width: 100%;">
                            Купить на PancakeSwap
                        </a>
                    </div>
                    
                    <div style="background: var(--bg-primary); padding: 1.5rem; border-radius: 12px; text-align: center;">
                        <div style="width: 60px; height: 60px; background: linear-gradient(135deg, var(--primary-color), var(--secondary-color)); border-radius: 50%; margin: 0 auto 1rem; display: flex; align-items: center; justify-content: center; font-size: 2rem;">
                            💱
                        </div>
                        <h4 style="color: var(--text-primary); margin-bottom: 0.5rem;">Внутренний обменник</h4>
                        <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 1rem;">
                            Прямой обмен USDT на PLEX внутри платформы
                        </p>
                        <button class="btn btn-secondary" style="width: 100%;" onclick="window.CabinetApp.showInternalExchange()">
                            Открыть обменник
                        </button>
                    </div>
                    
                    <div style="background: var(--bg-primary); padding: 1.5rem; border-radius: 12px; text-align: center;">
                        <div style="width: 60px; height: 60px; background: var(--bg-secondary); border-radius: 50%; margin: 0 auto 1rem; display: flex; align-items: center; justify-content: center; font-size: 2rem;">
                            🏪
                        </div>
                        <h4 style="color: var(--text-primary); margin-bottom: 0.5rem;">P2P маркет</h4>
                        <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 1rem;">
                            Покупка напрямую у других пользователей
                        </p>
                        <button class="btn btn-outline" style="width: 100%;" onclick="window.CabinetApp.navigateTo('p2p-market')">
                            Перейти в P2P
                        </button>
                    </div>
                </div>
            </div>
        `;
    },
    
    // MCP-MARKER:METHOD:CABINET:SETTINGS_CONTENT - Генерация контента страницы настроек
    getSettingsContent() {
        return `
            <div class="page-header">
                <h2 class="page-title">⚙️ Настройки аккаунта</h2>
                <p class="page-subtitle">Управление профилем и параметрами безопасности</p>
            </div>
            
            <!-- ОСНОВНЫЕ НАСТРОЙКИ -->
            <div class="stats-card" style="margin-bottom: 2rem;">
                <h3 style="color: var(--primary-color); margin-bottom: 1.5rem;">👤 Профиль пользователя</h3>
                
                <div style="display: grid; gap: 1.5rem;">
                    <div>
                        <label style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem; display: block;">BSC адрес кошелька</label>
                        <div style="display: flex; gap: 1rem;">
                            <input type="text" 
                                   value="${localStorage.getItem('userAddress') || '0x...'}" 
                                   readonly 
                                   style="flex: 1; padding: 0.8rem; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-primary); font-family: monospace;">
                            <button class="btn btn-outline" onclick="window.Utils.copyToClipboard(localStorage.getItem('userAddress'))">
                                📋 Копировать
                            </button>
                        </div>
                    </div>
                    
                    <div>
                        <label style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem; display: block;">Никнейм (опционально)</label>
                        <div style="display: flex; gap: 1rem;">
                            <input type="text" 
                                   id="settings-nickname"
                                   placeholder="Введите никнейм" 
                                   value="${localStorage.getItem('userNickname') || ''}"
                                   style="flex: 1; padding: 0.8rem; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-primary);">
                            <button class="btn btn-primary" onclick="window.CabinetApp.saveNickname()">
                                💾 Сохранить
                            </button>
                        </div>
                    </div>
                    
                    <div>
                        <label style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem; display: block;">Email для уведомлений</label>
                        <div style="display: flex; gap: 1rem;">
                            <input type="email" 
                                   id="settings-email"
                                   placeholder="your@email.com" 
                                   value="${localStorage.getItem('userEmail') || ''}"
                                   style="flex: 1; padding: 0.8rem; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-primary);">
                            <button class="btn btn-primary" onclick="window.CabinetApp.saveEmail()">
                                💾 Сохранить
                            </button>
                        </div>
                        <p style="color: var(--text-secondary); font-size: 0.8rem; margin-top: 0.5rem;">
                            * Email используется только для важных уведомлений о депозитах и выплатах
                        </p>
                    </div>
                </div>
            </div>
            
            <!-- НАСТРОЙКИ БЕЗОПАСНОСТИ -->
            <div class="stats-card" style="margin-bottom: 2rem;">
                <h3 style="color: var(--warning-color); margin-bottom: 1.5rem;">🔐 Безопасность</h3>
                
                <div style="display: grid; gap: 1rem;">
                    <!-- 2FA -->
                    <div style="background: var(--bg-primary); padding: 1.5rem; border-radius: 12px; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h4 style="color: var(--text-primary); margin-bottom: 0.3rem;">Двухфакторная аутентификация (2FA)</h4>
                            <p style="color: var(--text-secondary); font-size: 0.9rem; margin: 0;">
                                Дополнительная защита аккаунта через Google Authenticator
                            </p>
                        </div>
                        <button class="btn btn-outline" onclick="window.CabinetApp.toggle2FA()">
                            ${localStorage.getItem('2faEnabled') === 'true' ? '🔓 Отключить' : '🔒 Включить'}
                        </button>
                    </div>
                    
                    <!-- PIN-код -->
                    <div style="background: var(--bg-primary); padding: 1.5rem; border-radius: 12px; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h4 style="color: var(--text-primary); margin-bottom: 0.3rem;">PIN-код для операций</h4>
                            <p style="color: var(--text-secondary); font-size: 0.9rem; margin: 0;">
                                Требовать PIN при создании депозитов и выводе средств
                            </p>
                        </div>
                        <button class="btn btn-outline" onclick="window.CabinetApp.setupPIN()">
                            ${localStorage.getItem('pinEnabled') === 'true' ? '✏️ Изменить' : '➕ Установить'}
                        </button>
                    </div>
                    
                    <!-- Сессия -->
                    <div style="background: var(--bg-primary); padding: 1.5rem; border-radius: 12px; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h4 style="color: var(--text-primary); margin-bottom: 0.3rem;">Автовыход из системы</h4>
                            <p style="color: var(--text-secondary); font-size: 0.9rem; margin: 0;">
                                Автоматический выход после 30 минут неактивности
                            </p>
                        </div>
                        <label class="switch">
                            <input type="checkbox" 
                                   ${localStorage.getItem('autoLogout') !== 'false' ? 'checked' : ''}
                                   onchange="window.CabinetApp.toggleAutoLogout(this.checked)">
                            <span class="slider"></span>
                        </label>
                    </div>
                </div>
            </div>
            
            <!-- НАСТРОЙКИ УВЕДОМЛЕНИЙ -->
            <div class="stats-card" style="margin-bottom: 2rem;">
                <h3 style="color: var(--secondary-color); margin-bottom: 1.5rem;">🔔 Уведомления</h3>
                
                <div style="display: grid; gap: 1rem;">
                    <!-- Email уведомления -->
                    <div style="background: var(--bg-primary); padding: 1.5rem; border-radius: 12px;">
                        <h4 style="color: var(--text-primary); margin-bottom: 1rem;">📧 Email уведомления</h4>
                        
                        <div style="display: grid; gap: 0.8rem;">
                            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                                <input type="checkbox" 
                                       ${localStorage.getItem('emailNotifyDeposits') !== 'false' ? 'checked' : ''}
                                       onchange="window.CabinetApp.updateNotificationSettings('emailNotifyDeposits', this.checked)">
                                <span style="color: var(--text-secondary);">Создание и завершение депозитов</span>
                            </label>
                            
                            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                                <input type="checkbox" 
                                       ${localStorage.getItem('emailNotifyPayments') !== 'false' ? 'checked' : ''}
                                       onchange="window.CabinetApp.updateNotificationSettings('emailNotifyPayments', this.checked)">
                                <span style="color: var(--text-secondary);">Ежедневные выплаты</span>
                            </label>
                            
                            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                                <input type="checkbox" 
                                       ${localStorage.getItem('emailNotifyBonuses') !== 'false' ? 'checked' : ''}
                                       onchange="window.CabinetApp.updateNotificationSettings('emailNotifyBonuses', this.checked)">
                                <span style="color: var(--text-secondary);">Получение бонусов и наград</span>
                            </label>
                            
                            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                                <input type="checkbox" 
                                       ${localStorage.getItem('emailNotifyNews') === 'true' ? 'checked' : ''}
                                       onchange="window.CabinetApp.updateNotificationSettings('emailNotifyNews', this.checked)">
                                <span style="color: var(--text-secondary);">Новости и обновления платформы</span>
                            </label>
                        </div>
                    </div>
                    
                    <!-- Push уведомления -->
                    <div style="background: var(--bg-primary); padding: 1.5rem; border-radius: 12px;">
                        <h4 style="color: var(--text-primary); margin-bottom: 1rem;">📱 Push-уведомления в браузере</h4>
                        
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <p style="color: var(--text-secondary); font-size: 0.9rem; margin: 0;">
                                Мгновенные уведомления о важных событиях
                            </p>
                            <button class="btn btn-secondary" onclick="window.CabinetApp.requestPushPermission()">
                                ${Notification.permission === 'granted' ? '✅ Включены' : '🔔 Включить'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- ИНТЕРФЕЙС -->
            <div class="stats-card" style="margin-bottom: 2rem;">
                <h3 style="color: var(--accent-color); margin-bottom: 1.5rem;">🎨 Интерфейс</h3>
                
                <div style="display: grid; gap: 1rem;">
                    <!-- Тема -->
                    <div>
                        <label style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.8rem; display: block;">Тема оформления</label>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem;">
                            <button class="theme-selector ${localStorage.getItem('theme') === 'dark' || !localStorage.getItem('theme') ? 'active' : ''}" 
                                    onclick="window.CabinetApp.setTheme('dark')">
                                <span style="font-size: 2rem;">🌙</span>
                                <span>Темная</span>
                            </button>
                            <button class="theme-selector ${localStorage.getItem('theme') === 'light' ? 'active' : ''}" 
                                    onclick="window.CabinetApp.setTheme('light')">
                                <span style="font-size: 2rem;">☀️</span>
                                <span>Светлая</span>
                            </button>
                            <button class="theme-selector ${localStorage.getItem('theme') === 'auto' ? 'active' : ''}" 
                                    onclick="window.CabinetApp.setTheme('auto')">
                                <span style="font-size: 2rem;">🌓</span>
                                <span>Авто</span>
                            </button>
                        </div>
                    </div>
                    
                    <!-- Язык -->
                    <div>
                        <label style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem; display: block;">Язык интерфейса</label>
                        <select style="width: 100%; padding: 0.8rem; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-primary);"
                                onchange="window.CabinetApp.setLanguage(this.value)">
                            <option value="ru" ${localStorage.getItem('language') === 'ru' || !localStorage.getItem('language') ? 'selected' : ''}>🇷🇺 Русский</option>
                            <option value="en" ${localStorage.getItem('language') === 'en' ? 'selected' : ''}>🇬🇧 English</option>
                            <option value="es" ${localStorage.getItem('language') === 'es' ? 'selected' : ''}>🇪🇸 Español</option>
                            <option value="de" ${localStorage.getItem('language') === 'de' ? 'selected' : ''}>🇩🇪 Deutsch</option>
                            <option value="zh" ${localStorage.getItem('language') === 'zh' ? 'selected' : ''}>🇨🇳 中文</option>
                        </select>
                    </div>
                    
                    <!-- Анимации -->
                    <div style="background: var(--bg-primary); padding: 1.5rem; border-radius: 12px; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h4 style="color: var(--text-primary); margin-bottom: 0.3rem;">Анимации интерфейса</h4>
                            <p style="color: var(--text-secondary); font-size: 0.9rem; margin: 0;">
                                Плавные переходы и эффекты
                            </p>
                        </div>
                        <label class="switch">
                            <input type="checkbox" 
                                   ${localStorage.getItem('animations') !== 'false' ? 'checked' : ''}
                                   onchange="window.CabinetApp.toggleAnimations(this.checked)">
                            <span class="slider"></span>
                        </label>
                    </div>
                </div>
            </div>
            
            <!-- ДОПОЛНИТЕЛЬНО -->
            <div class="stats-card">
                <h3 style="color: var(--gold-color); margin-bottom: 1.5rem;">🔧 Дополнительно</h3>
                
                <div style="display: grid; gap: 1rem;">
                    <button class="btn btn-outline" onclick="window.CabinetApp.exportUserData()">
                        📥 Экспортировать данные аккаунта
                    </button>
                    
                    <button class="btn btn-outline" onclick="window.CabinetApp.clearCache()">
                        🧹 Очистить кэш приложения
                    </button>
                    
                    <button class="btn btn-outline" style="color: var(--error-color); border-color: var(--error-color);" 
                            onclick="if(confirm('Вы уверены? Это действие удалит все локальные данные!')) window.CabinetApp.resetAccount()">
                        ⚠️ Сбросить все настройки
                    </button>
                </div>
                
                <div style="margin-top: 2rem; padding: 1rem; background: var(--bg-primary); border-radius: 8px;">
                    <p style="color: var(--text-secondary); font-size: 0.85rem; margin: 0; text-align: center;">
                        Версия приложения: <strong>1.1.0</strong> | 
                        Последнее обновление: <strong>02.08.2025</strong>
                    </p>
                </div>
            </div>
            
            <style>
                .switch {
                    position: relative;
                    display: inline-block;
                    width: 50px;
                    height: 28px;
                }
                
                .switch input {
                    opacity: 0;
                    width: 0;
                    height: 0;
                }
                
                .slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: var(--bg-secondary);
                    transition: 0.4s;
                    border-radius: 34px;
                }
                
                .slider:before {
                    position: absolute;
                    content: "";
                    height: 20px;
                    width: 20px;
                    left: 4px;
                    bottom: 4px;
                    background-color: white;
                    transition: 0.4s;
                    border-radius: 50%;
                }
                
                input:checked + .slider {
                    background-color: var(--primary-color);
                }
                
                input:checked + .slider:before {
                    transform: translateX(22px);
                }
                
                .theme-selector {
                    padding: 1rem;
                    background: var(--bg-primary);
                    border: 2px solid var(--border-color);
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.5rem;
                    color: var(--text-primary);
                }
                
                .theme-selector:hover {
                    border-color: var(--primary-color);
                    transform: translateY(-2px);
                }
                
                .theme-selector.active {
                    border-color: var(--primary-color);
                    background: rgba(255, 107, 53, 0.1);
                }
            </style>
        `;
    },
    
    // MCP-MARKER:METHOD:CABINET:EXPERIENCE_CONTENT - Генерация контента страницы стажа
    getExperienceContent() {
        const startDate = localStorage.getItem('firstLogin') || Date.now();
        const daysInSystem = Math.floor((Date.now() - new Date(startDate)) / (1000 * 60 * 60 * 24));
        
        return `
            <div class="page-header">
                <h2 class="page-title">📅 Стаж в системе GENESIS</h2>
                <p class="page-subtitle">Ваша история и достижения в экосистеме</p>
            </div>
            
            <!-- ОБЩАЯ СТАТИСТИКА СТАЖА -->
            <div class="stats-grid" style="margin-bottom: 2rem;">
                <div class="stats-card">
                    <div class="stats-header">
                        <span class="stats-title">Дней в системе</span>
                        <span class="stats-icon">📅</span>
                    </div>
                    <div class="stats-value">${daysInSystem}</div>
                    <div class="stats-change">дней</div>
                </div>
                
                <div class="stats-card">
                    <div class="stats-header">
                        <span class="stats-title">Монеты стажа</span>
                        <span class="stats-icon">🪙</span>
                    </div>
                    <div class="stats-value">0</div>
                    <div class="stats-change">монет</div>
                </div>
                
                <div class="stats-card">
                    <div class="stats-header">
                        <span class="stats-title">Текущая серия</span>
                        <span class="stats-icon">🔥</span>
                    </div>
                    <div class="stats-value">0</div>
                    <div class="stats-change">дней подряд</div>
                </div>
                
                <div class="stats-card">
                    <div class="stats-header">
                        <span class="stats-title">Лучшая серия</span>
                        <span class="stats-icon">🏆</span>
                    </div>
                    <div class="stats-value">0</div>
                    <div class="stats-change">рекорд дней</div>
                </div>
            </div>
            
            <!-- КАЛЕНДАРЬ АКТИВНОСТИ -->
            <div class="stats-card" style="margin-bottom: 2rem;">
                <h3 style="color: var(--primary-color); margin-bottom: 1.5rem;">📆 Календарь активности</h3>
                
                <div style="background: var(--bg-primary); padding: 1.5rem; border-radius: 12px;">
                    <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 0.5rem; margin-bottom: 1rem;">
                        ${['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => `
                            <div style="text-align: center; color: var(--text-secondary); font-size: 0.85rem; font-weight: 600;">
                                ${day}
                            </div>
                        `).join('')}
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 0.5rem;">
                        ${Array.from({length: 35}, (_, i) => {
                            const isToday = i === new Date().getDate() + 2;
                            const hasActivity = Math.random() > 0.3;
                            const color = hasActivity ? (Math.random() > 0.5 ? 'var(--success-color)' : 'var(--primary-color)') : 'var(--bg-secondary)';
                            
                            return `
                                <div style="aspect-ratio: 1; background: ${color}; border-radius: 8px; display: flex; align-items: center; justify-content: center; position: relative; ${isToday ? 'border: 2px solid var(--warning-color);' : ''}">
                                    ${isToday ? '<span style="position: absolute; top: -20px; left: 50%; transform: translateX(-50%); font-size: 0.7rem; color: var(--warning-color);">Сегодня</span>' : ''}
                                    ${hasActivity ? '<span style="font-size: 0.8rem;">✓</span>' : ''}
                                </div>
                            `;
                        }).join('')}
                    </div>
                    
                    <div style="display: flex; gap: 2rem; margin-top: 1.5rem; justify-content: center;">
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                            <div style="width: 20px; height: 20px; background: var(--success-color); border-radius: 4px;"></div>
                            <span style="color: var(--text-secondary); font-size: 0.85rem;">Высокая активность</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                            <div style="width: 20px; height: 20px; background: var(--primary-color); border-radius: 4px;"></div>
                            <span style="color: var(--text-secondary); font-size: 0.85rem;">Обычная активность</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                            <div style="width: 20px; height: 20px; background: var(--bg-secondary); border-radius: 4px;"></div>
                            <span style="color: var(--text-secondary); font-size: 0.85rem;">Нет активности</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- УРОВНИ СТАЖА -->
            <div class="stats-card" style="margin-bottom: 2rem;">
                <h3 style="color: var(--secondary-color); margin-bottom: 1.5rem;">🎖️ Уровни стажа</h3>
                
                <div style="display: grid; gap: 1rem;">
                    ${[
                        { level: 1, name: 'Новичок', days: 0, icon: '🌱', color: 'var(--text-secondary)', reward: '100 монет стажа' },
                        { level: 2, name: 'Участник', days: 7, icon: '🌿', color: 'var(--success-color)', reward: '250 монет + множитель x0.1 на 24ч' },
                        { level: 3, name: 'Активный', days: 30, icon: '🌳', color: 'var(--primary-color)', reward: '500 монет + бонус 5 PLEX' },
                        { level: 4, name: 'Опытный', days: 90, icon: '🏆', color: 'var(--warning-color)', reward: '1000 монет + множитель x0.25 на 48ч' },
                        { level: 5, name: 'Ветеран', days: 180, icon: '⭐', color: 'var(--secondary-color)', reward: '2500 монет + бонус 50 PLEX' },
                        { level: 6, name: 'Мастер', days: 365, icon: '💎', color: 'var(--accent-color)', reward: '5000 монет + множитель x0.5 на 72ч' },
                        { level: 7, name: 'Легенда', days: 730, icon: '👑', color: 'var(--gold-color)', reward: '$100 USDT + VIP статус навсегда' }
                    ].map(level => {
                        const isUnlocked = daysInSystem >= level.days;
                        const progress = isUnlocked ? 100 : (daysInSystem / level.days * 100);
                        
                        return `
                            <div style="background: var(--bg-primary); padding: 1.5rem; border-radius: 12px; border: 2px solid ${isUnlocked ? level.color : 'var(--border-color)'}; ${!isUnlocked ? 'opacity: 0.6;' : ''}">
                                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                                    <div style="display: flex; align-items: center; gap: 1rem;">
                                        <span style="font-size: 2.5rem;">${level.icon}</span>
                                        <div>
                                            <h4 style="color: ${level.color}; margin-bottom: 0.3rem;">Уровень ${level.level}: ${level.name}</h4>
                                            <p style="color: var(--text-secondary); font-size: 0.9rem; margin: 0;">
                                                Требуется: ${level.days} дней
                                            </p>
                                        </div>
                                    </div>
                                    ${isUnlocked ? `
                                        <span style="background: ${level.color}; color: var(--bg-primary); padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.85rem; font-weight: 600;">
                                            ✓ Достигнут
                                        </span>
                                    ` : ''}
                                </div>
                                
                                <div style="margin-bottom: 1rem;">
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                        <span style="color: var(--text-secondary); font-size: 0.85rem;">Прогресс</span>
                                        <span style="color: var(--text-secondary); font-size: 0.85rem;">${Math.min(progress, 100).toFixed(0)}%</span>
                                    </div>
                                    <div style="height: 8px; background: var(--bg-secondary); border-radius: 4px; overflow: hidden;">
                                        <div style="width: ${Math.min(progress, 100)}%; height: 100%; background: ${level.color}; transition: width 0.5s ease;"></div>
                                    </div>
                                </div>
                                
                                <div style="background: var(--bg-secondary); padding: 0.8rem; border-radius: 8px;">
                                    <span style="color: var(--text-secondary); font-size: 0.85rem;">Награда:</span>
                                    <span style="color: var(--text-primary); font-size: 0.9rem; margin-left: 0.5rem;">${level.reward}</span>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
            
            <!-- ЕЖЕДНЕВНЫЕ ЗАДАНИЯ -->
            <div class="stats-card">
                <h3 style="color: var(--warning-color); margin-bottom: 1.5rem;">🎯 Ежедневные задания для стажа</h3>
                
                <div style="display: grid; gap: 1rem;">
                    ${[
                        { task: 'Войти в систему', reward: '10 монет', completed: true, icon: '✅' },
                        { task: 'Проверить активные депозиты', reward: '15 монет', completed: false, icon: '📊' },
                        { task: 'Посетить раздел аналитики', reward: '20 монет', completed: false, icon: '📈' },
                        { task: 'Поделиться реферальной ссылкой', reward: '25 монет', completed: false, icon: '🔗' },
                        { task: 'Выполнить все задания', reward: 'Бонус x2 к монетам', completed: false, icon: '🎁' }
                    ].map((task, index) => `
                        <div style="background: var(--bg-primary); padding: 1rem; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; ${task.completed ? 'opacity: 0.7;' : ''}">
                            <div style="display: flex; align-items: center; gap: 1rem;">
                                <span style="font-size: 1.5rem;">${task.icon}</span>
                                <div>
                                    <h5 style="color: var(--text-primary); margin-bottom: 0.2rem;">${task.task}</h5>
                                    <span style="color: var(--text-secondary); font-size: 0.85rem;">Награда: ${task.reward}</span>
                                </div>
                            </div>
                            ${task.completed ? `
                                <span style="color: var(--success-color); font-weight: 600;">✓ Выполнено</span>
                            ` : `
                                <button class="btn btn-outline" style="padding: 0.5rem 1rem; font-size: 0.9rem;" onclick="window.CabinetApp.completeDaily(${index})">
                                    Выполнить
                                </button>
                            `}
                        </div>
                    `).join('')}
                </div>
                
                <div style="margin-top: 1.5rem; padding: 1rem; background: var(--bg-primary); border-radius: 8px; text-align: center;">
                    <p style="color: var(--text-secondary); font-size: 0.9rem; margin: 0;">
                        💡 Совет: Выполняйте задания каждый день, чтобы не потерять серию активности!
                    </p>
                </div>
            </div>
        `;
    },
    
    // MCP-MARKER:METHOD:CABINET:RANK_CONTENT - Генерация контента страницы ранга
    getRankContent() {
        return `
            <div class="page-header">
                <h2 class="page-title">🏅 Ранговая система GENESIS</h2>
                <p class="page-subtitle">Повышайте свой статус и получайте эксклюзивные привилегии</p>
            </div>
            
            <!-- ТЕКУЩИЙ РАНГ -->
            <div class="stats-card" style="margin-bottom: 2rem; background: linear-gradient(135deg, var(--bg-secondary), rgba(156, 39, 176, 0.1));">
                <div style="text-align: center; padding: 2rem;">
                    <div style="font-size: 5rem; margin-bottom: 1rem;">🥉</div>
                    <h2 style="color: var(--primary-color); margin-bottom: 0.5rem; font-size: 2rem;">Бронзовый инвестор</h2>
                    <p style="color: var(--text-secondary); font-size: 1.1rem;">Ранг 1 из 10</p>
                    
                    <div style="margin: 2rem 0;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                            <span style="color: var(--text-secondary);">Прогресс до следующего ранга</span>
                            <span style="color: var(--primary-color); font-weight: 600;">15%</span>
                        </div>
                        <div style="height: 12px; background: var(--bg-primary); border-radius: 6px; overflow: hidden;">
                            <div style="width: 15%; height: 100%; background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));"></div>
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-top: 2rem;">
                        <div style="background: var(--bg-primary); padding: 1rem; border-radius: 8px;">
                            <div style="color: var(--text-secondary); font-size: 0.85rem;">Общий оборот</div>
                            <div style="color: var(--primary-color); font-size: 1.5rem; font-weight: 700;">$0</div>
                        </div>
                        <div style="background: var(--bg-primary); padding: 1rem; border-radius: 8px;">
                            <div style="color: var(--text-secondary); font-size: 0.85rem;">Монеты ранга</div>
                            <div style="color: var(--warning-color); font-size: 1.5rem; font-weight: 700;">0</div>
                        </div>
                        <div style="background: var(--bg-primary); padding: 1rem; border-radius: 8px;">
                            <div style="color: var(--text-secondary); font-size: 0.85rem;">Партнеров</div>
                            <div style="color: var(--success-color); font-size: 1.5rem; font-weight: 700;">0</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- ПРИВИЛЕГИИ ТЕКУЩЕГО РАНГА -->
            <div class="stats-card" style="margin-bottom: 2rem;">
                <h3 style="color: var(--primary-color); margin-bottom: 1.5rem;">🎁 Ваши текущие привилегии</h3>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;">
                    <div style="background: var(--bg-primary); padding: 1.5rem; border-radius: 12px; text-align: center;">
                        <span style="font-size: 2rem;">💰</span>
                        <h4 style="color: var(--text-primary); margin: 0.5rem 0;">Базовая доходность</h4>
                        <p style="color: var(--text-secondary); font-size: 0.9rem;">Стандартные проценты по депозитам</p>
                    </div>
                    
                    <div style="background: var(--bg-primary); padding: 1.5rem; border-radius: 12px; text-align: center;">
                        <span style="font-size: 2rem;">📊</span>
                        <h4 style="color: var(--text-primary); margin: 0.5rem 0;">Лимит депозитов</h4>
                        <p style="color: var(--text-secondary); font-size: 0.9rem;">До $1,000 на план</p>
                    </div>
                    
                    <div style="background: var(--bg-primary); padding: 1.5rem; border-radius: 12px; text-align: center;">
                        <span style="font-size: 2rem;">🎯</span>
                        <h4 style="color: var(--text-primary); margin: 0.5rem 0;">Реферальный бонус</h4>
                        <p style="color: var(--text-secondary); font-size: 0.9rem;">5% от депозитов партнеров</p>
                    </div>
                </div>
            </div>
            
            <!-- ВСЕ РАНГИ -->
            <div class="stats-card">
                <h3 style="color: var(--secondary-color); margin-bottom: 1.5rem;">🏆 Система рангов</h3>
                
                <div style="display: grid; gap: 1rem;">
                    ${[
                        { rank: 1, name: 'Бронзовый инвестор', icon: '🥉', color: '#CD7F32', turnover: 0, partners: 0, bonus: '5%', limit: '$1,000' },
                        { rank: 2, name: 'Серебряный трейдер', icon: '🥈', color: '#C0C0C0', turnover: 5000, partners: 3, bonus: '7%', limit: '$2,500' },
                        { rank: 3, name: 'Золотой партнер', icon: '🥇', color: '#FFD700', turnover: 15000, partners: 7, bonus: '10%', limit: '$5,000' },
                        { rank: 4, name: 'Платиновый лидер', icon: '💎', color: '#E5E5E5', turnover: 50000, partners: 15, bonus: '12%', limit: '$10,000' },
                        { rank: 5, name: 'Рубиновый менеджер', icon: '♦️', color: '#E0115F', turnover: 100000, partners: 25, bonus: '15%', limit: '$25,000' },
                        { rank: 6, name: 'Изумрудный директор', icon: '♣️', color: '#50C878', turnover: 250000, partners: 50, bonus: '17%', limit: '$50,000' },
                        { rank: 7, name: 'Сапфировый президент', icon: '🔷', color: '#0F52BA', turnover: 500000, partners: 100, bonus: '20%', limit: '$100,000' },
                        { rank: 8, name: 'Бриллиантовый амбассадор', icon: '💠', color: '#B9F2FF', turnover: 1000000, partners: 200, bonus: '25%', limit: '$250,000' },
                        { rank: 9, name: 'Королевский советник', icon: '👑', color: '#FFD700', turnover: 2500000, partners: 500, bonus: '30%', limit: '$500,000' },
                        { rank: 10, name: 'Легенда GENESIS', icon: '🌟', color: '#FFD700', turnover: 5000000, partners: 1000, bonus: '50%', limit: 'Без лимита' }
                    ].map(r => {
                        const isAchieved = r.rank === 1;
                        const isCurrent = r.rank === 1;
                        
                        return `
                            <div style="background: var(--bg-primary); padding: 1.5rem; border-radius: 12px; border: 2px solid ${isCurrent ? 'var(--primary-color)' : (isAchieved ? 'var(--success-color)' : 'var(--border-color)')}; ${!isAchieved && !isCurrent ? 'opacity: 0.7;' : ''}">
                                <div style="display: flex; justify-content: space-between; align-items: start;">
                                    <div style="display: flex; gap: 1rem;">
                                        <span style="font-size: 2.5rem;">${r.icon}</span>
                                        <div>
                                            <h4 style="color: ${r.color}; margin-bottom: 0.3rem;">
                                                Ранг ${r.rank}: ${r.name}
                                                ${isCurrent ? ' <span style="background: var(--primary-color); color: white; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.7rem; margin-left: 0.5rem;">ТЕКУЩИЙ</span>' : ''}
                                            </h4>
                                            <div style="display: grid; gap: 0.3rem; margin-top: 0.5rem;">
                                                <div style="color: var(--text-secondary); font-size: 0.85rem;">
                                                    📊 Оборот: <span style="color: var(--text-primary); font-weight: 600;">$${r.turnover.toLocaleString()}</span>
                                                </div>
                                                <div style="color: var(--text-secondary); font-size: 0.85rem;">
                                                    👥 Партнеров: <span style="color: var(--text-primary); font-weight: 600;">${r.partners}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div style="text-align: right;">
                                        <div style="color: var(--text-secondary); font-size: 0.8rem;">Реф. бонус</div>
                                        <div style="color: var(--success-color); font-size: 1.2rem; font-weight: 700;">${r.bonus}</div>
                                        <div style="color: var(--text-secondary); font-size: 0.8rem; margin-top: 0.5rem;">Лимит</div>
                                        <div style="color: var(--warning-color); font-size: 0.9rem; font-weight: 600;">${r.limit}</div>
                                    </div>
                                </div>
                                
                                ${r.rank > 5 ? `
                                    <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">
                                        <div style="color: var(--gold-color); font-size: 0.85rem; font-weight: 600;">🎁 Специальные привилегии:</div>
                                        <div style="color: var(--text-secondary); font-size: 0.8rem; margin-top: 0.3rem;">
                                            ${r.rank === 6 ? 'Персональный менеджер, приоритетные выплаты' : ''}
                                            ${r.rank === 7 ? 'VIP поддержка 24/7, эксклюзивные предложения' : ''}
                                            ${r.rank === 8 ? 'Участие в управлении платформой, спецпроекты' : ''}
                                            ${r.rank === 9 ? 'Доля от прибыли платформы, закрытые мероприятия' : ''}
                                            ${r.rank === 10 ? 'Пожизненный пассивный доход, статус совладельца' : ''}
                                        </div>
                                    </div>
                                ` : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    },
    
    // MCP-MARKER:METHOD:CABINET:HOW_IT_WORKS_CONTENT - Генерация контента страницы "Как это работает"
    getHowItWorksContent() {
        return `
            <div class="page-header">
                <h2 class="page-title">❓ Как работает GENESIS</h2>
                <p class="page-subtitle">Подробное руководство по использованию платформы</p>
            </div>
            
            <!-- БЫСТРЫЙ СТАРТ -->
            <div class="stats-card" style="margin-bottom: 2rem; background: linear-gradient(135deg, var(--bg-secondary), rgba(255, 107, 53, 0.1));">
                <h3 style="color: var(--primary-color); margin-bottom: 1.5rem;">🚀 Быстрый старт за 3 шага</h3>
                
                <div style="display: grid; gap: 1rem;">
                    <div style="display: flex; gap: 1.5rem; align-items: start;">
                        <div style="background: var(--primary-color); color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0;">
                            1
                        </div>
                        <div>
                            <h4 style="color: var(--text-primary); margin-bottom: 0.5rem;">Пополните доступ к платформе</h4>
                            <p style="color: var(--text-secondary); font-size: 0.9rem; margin: 0;">
                                Оплатите $1 USDT для получения доступа к функционалу платформы на 24 часа
                            </p>
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 1.5rem; align-items: start;">
                        <div style="background: var(--primary-color); color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0;">
                            2
                        </div>
                        <div>
                            <h4 style="color: var(--text-primary); margin-bottom: 0.5rem;">Выберите депозитный план</h4>
                            <p style="color: var(--text-secondary); font-size: 0.9rem; margin: 0;">
                                Начните с плана STARTER за $25 и постепенно открывайте доступ к более выгодным планам
                            </p>
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 1.5rem; align-items: start;">
                        <div style="background: var(--primary-color); color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0;">
                            3
                        </div>
                        <div>
                            <h4 style="color: var(--text-primary); margin-bottom: 0.5rem;">Получайте ежедневный доход</h4>
                            <p style="color: var(--text-secondary); font-size: 0.9rem; margin: 0;">
                                Выплаты начисляются каждый день автоматически на ваш BSC кошелек
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- ПРИНЦИП РАБОТЫ -->
            <div class="stats-card" style="margin-bottom: 2rem;">
                <h3 style="color: var(--secondary-color); margin-bottom: 1.5rem;">⚙️ Принцип работы платформы</h3>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;">
                    <div style="background: var(--bg-primary); padding: 1.5rem; border-radius: 12px;">
                        <div style="text-align: center; margin-bottom: 1rem;">
                            <span style="font-size: 3rem;">🏦</span>
                        </div>
                        <h4 style="color: var(--text-primary); text-align: center; margin-bottom: 0.8rem;">Инвестиционный пул</h4>
                        <p style="color: var(--text-secondary); font-size: 0.9rem; text-align: center;">
                            Средства участников объединяются в единый пул для максимальной эффективности
                        </p>
                    </div>
                    
                    <div style="background: var(--bg-primary); padding: 1.5rem; border-radius: 12px;">
                        <div style="text-align: center; margin-bottom: 1rem;">
                            <span style="font-size: 3rem;">🤖</span>
                        </div>
                        <h4 style="color: var(--text-primary); text-align: center; margin-bottom: 0.8rem;">MEV-боты и арбитраж</h4>
                        <p style="color: var(--text-secondary); font-size: 0.9rem; text-align: center;">
                            Автоматические системы извлекают прибыль из неэффективностей рынка 24/7
                        </p>
                    </div>
                    
                    <div style="background: var(--bg-primary); padding: 1.5rem; border-radius: 12px;">
                        <div style="text-align: center; margin-bottom: 1rem;">
                            <span style="font-size: 3rem;">💸</span>
                        </div>
                        <h4 style="color: var(--text-primary); text-align: center; margin-bottom: 0.8rem;">Распределение прибыли</h4>
                        <p style="color: var(--text-secondary); font-size: 0.9rem; text-align: center;">
                            Ежедневные выплаты пропорционально вашим активным депозитам
                        </p>
                    </div>
                </div>
            </div>
            
            <!-- ДЕПОЗИТНАЯ СИСТЕМА -->
            <div class="stats-card" style="margin-bottom: 2rem;">
                <h3 style="color: var(--warning-color); margin-bottom: 1.5rem;">💰 Депозитная система</h3>
                
                <div style="background: var(--bg-primary); padding: 1.5rem; border-radius: 12px; margin-bottom: 1rem;">
                    <h4 style="color: var(--text-primary); margin-bottom: 1rem;">Последовательное открытие планов</h4>
                    <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 1rem;">
                        Система построена на принципе постепенного роста. Вы начинаете с минимального депозита и открываете доступ к более выгодным планам по мере развития.
                    </p>
                    
                    <div style="display: flex; align-items: center; gap: 1rem; overflow-x: auto; padding: 1rem 0;">
                        ${[1, 2, 3, 4, 5].map((n, i) => `
                            <div style="text-align: center; flex-shrink: 0;">
                                <div style="width: 60px; height: 60px; background: ${i === 0 ? 'var(--success-color)' : 'var(--bg-secondary)'}; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 0.5rem; font-weight: 700; color: ${i === 0 ? 'white' : 'var(--text-secondary)'};">
                                    ${n}
                                </div>
                                <div style="color: var(--text-secondary); font-size: 0.8rem;">План ${n}</div>
                            </div>
                            ${i < 4 ? '<div style="color: var(--text-secondary);">→</div>' : ''}
                        `).join('')}
                        <div style="color: var(--text-secondary); font-size: 1.5rem;">...</div>
                        <div style="text-align: center; flex-shrink: 0;">
                            <div style="width: 60px; height: 60px; background: var(--gold-color); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 0.5rem; font-weight: 700; color: var(--bg-primary);">
                                13
                            </div>
                            <div style="color: var(--text-secondary); font-size: 0.8rem;">План 13</div>
                        </div>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;">
                    <div style="background: var(--bg-primary); padding: 1rem; border-radius: 8px;">
                        <h5 style="color: var(--primary-color); margin-bottom: 0.5rem;">📈 Рост доходности</h5>
                        <p style="color: var(--text-secondary); font-size: 0.85rem; margin: 0;">
                            Чем выше план, тем больше процент ежедневной прибыли: от 0.3% до 0.9%
                        </p>
                    </div>
                    
                    <div style="background: var(--bg-primary); padding: 1rem; border-radius: 8px;">
                        <h5 style="color: var(--success-color); margin-bottom: 0.5rem;">⏱️ Срок работы</h5>
                        <p style="color: var(--text-secondary); font-size: 0.85rem; margin: 0;">
                            Каждый депозит работает определенный срок: от 20 до 100 дней
                        </p>
                    </div>
                    
                    <div style="background: var(--bg-primary); padding: 1rem; border-radius: 8px;">
                        <h5 style="color: var(--warning-color); margin-bottom: 0.5rem;">💎 Валюта оплаты</h5>
                        <p style="color: var(--text-secondary); font-size: 0.85rem; margin: 0;">
                            Планы 1-10: только USDT<br>Планы 11-13: USDT или PLEX
                        </p>
                    </div>
                </div>
            </div>
            
            <!-- БОНУСНАЯ СИСТЕМА -->
            <div class="stats-card" style="margin-bottom: 2rem;">
                <h3 style="color: var(--success-color); margin-bottom: 1.5rem;">🎁 Бонусы и множители</h3>
                
                <div style="display: grid; gap: 1rem;">
                    <div style="background: var(--bg-primary); padding: 1.5rem; border-radius: 12px;">
                        <h4 style="color: var(--text-primary); margin-bottom: 0.8rem;">⚡ Множители доходности</h4>
                        <p style="color: var(--text-secondary); font-size: 0.9rem;">
                            Активируйте временные множители от x2 до x10 для увеличения ежедневной прибыли. Множители можно купить за PLEX или получить в качестве бонуса.
                        </p>
                    </div>
                    
                    <div style="background: var(--bg-primary); padding: 1.5rem; border-radius: 12px;">
                        <h4 style="color: var(--text-primary); margin-bottom: 0.8rem;">👥 Реферальные бонусы</h4>
                        <p style="color: var(--text-secondary); font-size: 0.9rem;">
                            Приглашайте партнеров и получайте от 5% до 50% от их депозитов в зависимости от вашего ранга. Дополнительные награды за активных партнеров.
                        </p>
                    </div>
                    
                    <div style="background: var(--bg-primary); padding: 1.5rem; border-radius: 12px;">
                        <h4 style="color: var(--text-primary); margin-bottom: 0.8rem;">🏆 Достижения и награды</h4>
                        <p style="color: var(--text-secondary); font-size: 0.9rem;">
                            Выполняйте задания, повышайте ранг, увеличивайте стаж и получайте монеты GENESIS, которые можно обменять на ценные бонусы.
                        </p>
                    </div>
                </div>
            </div>
            
            <!-- FAQ -->
            <div class="stats-card">
                <h3 style="color: var(--accent-color); margin-bottom: 1.5rem;">❓ Часто задаваемые вопросы</h3>
                
                <div style="display: grid; gap: 1rem;">
                    ${[
                        {
                            q: 'Как начать зарабатывать?',
                            a: 'Пройдите авторизацию за 1 PLEX, пополните доступ к платформе за $1 USDT, затем создайте первый депозит от $25.'
                        },
                        {
                            q: 'Когда начисляются выплаты?',
                            a: 'Выплаты начисляются ежедневно в 00:00 UTC автоматически на ваш BSC кошелек.'
                        },
                        {
                            q: 'Можно ли вывести депозит досрочно?',
                            a: 'Нет, депозиты работают фиксированный срок. После окончания срока тело депозита возвращается автоматически.'
                        },
                        {
                            q: 'Сколько депозитов можно создать?',
                            a: 'Вы можете иметь по одному активному депозиту каждого плана. Всего доступно 13 планов.'
                        },
                        {
                            q: 'Что такое доступ к платформе?',
                            a: 'Это ежедневная плата $1 USDT за использование платформы. Без активного доступа создание депозитов невозможно.'
                        },
                        {
                            q: 'Где купить токен PLEX?',
                            a: 'PLEX можно купить на PancakeSwap, во внутреннем обменнике или получить в качестве бонусов.'
                        }
                    ].map((faq, index) => `
                        <div style="background: var(--bg-primary); padding: 1.5rem; border-radius: 12px;">
                            <h5 style="color: var(--text-primary); margin-bottom: 0.8rem; display: flex; align-items: center; gap: 0.5rem;">
                                <span style="color: var(--primary-color);">Q:</span> ${faq.q}
                            </h5>
                            <p style="color: var(--text-secondary); font-size: 0.9rem; margin: 0; padding-left: 1.5rem;">
                                <span style="color: var(--success-color); font-weight: 600;">A:</span> ${faq.a}
                            </p>
                        </div>
                    `).join('')}
                </div>
                
                <div style="margin-top: 2rem; padding: 1.5rem; background: var(--bg-primary); border-radius: 12px; text-align: center;">
                    <h4 style="color: var(--primary-color); margin-bottom: 1rem;">🤝 Нужна помощь?</h4>
                    <p style="color: var(--text-secondary); margin-bottom: 1rem;">
                        Наша служба поддержки готова ответить на любые вопросы
                    </p>
                    <div style="display: flex; gap: 1rem; justify-content: center;">
                        <button class="btn btn-primary" onclick="window.open('https://t.me/genesis_support', '_blank')">
                            💬 Telegram поддержка
                        </button>
                        <button class="btn btn-outline" onclick="window.CabinetApp.showEmailSupport()">
                            📧 Email поддержка
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
});

// MCP-MARKER:INIT:CABINET_CONTENT_RESTORED - Инициализация восстановленного генератора
console.log('📄 Cabinet Content Restored loaded - все недостающие методы добавлены');

// Проверяем наличие всех методов
const requiredMethods = [
    'getGiftsContent',
    'getMultipliersContent', 
    'getMiningRentContent',
    'getMyDeviceContent',
    'getPlexCoinContent',
    'getSettingsContent',
    'getExperienceContent',
    'getRankContent',
    'getHowItWorksContent'
];

const missingMethods = requiredMethods.filter(method => !window.CabinetContentGenerator[method]);

if (missingMethods.length === 0) {
    console.log('✅ Все методы генератора контента успешно восстановлены!');
} else {
    console.error('❌ Отсутствуют методы:', missingMethods);
}
