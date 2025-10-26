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
