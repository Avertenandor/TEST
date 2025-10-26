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
