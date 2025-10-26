/**
 * GENESIS 1.1 - Генератор контента страниц кабинета
 * MCP-MARKER:MODULE:CABINET_CONTENT_GENERATOR - Генератор контента страниц
 */

window.CabinetContentGenerator = {
    
    // MCP-MARKER:METHOD:CABINET:GIFTS_CONTENT - Генерация контента страницы подарков
    getGiftsContent() {
        return `
            <div class="page-header">
                <h2 class="page-title">🎈 Подарочная система</h2>
                <p class="page-subtitle">Уникальные бонусы и награды за вашу активность</p>
            </div>
            
            <!-- СТАТИСТИКА ПОДАРКОВ -->
            <div class="stats-grid" style="margin-bottom: 2rem;">
                <div class="stats-card">
                    <div class="stats-header">
                        <span class="stats-title">Получено подарков</span>
                        <span class="stats-icon">🎁</span>
                    </div>
                    <div class="stats-value">0</div>
                    <div class="stats-change">всего</div>
                </div>
                
                <div class="stats-card">
                    <div class="stats-header">
                        <span class="stats-title">Доступно сейчас</span>
                        <span class="stats-icon">🎈</span>
                    </div>
                    <div class="stats-value">2</div>
                    <div class="stats-change positive">новые</div>
                </div>
                
                <div class="stats-card">
                    <div class="stats-header">
                        <span class="stats-title">Ценность подарков</span>
                        <span class="stats-icon">💎</span>
                    </div>
                    <div class="stats-value">$0.00</div>
                    <div class="stats-change">в USDT</div>
                </div>
                
                <div class="stats-card">
                    <div class="stats-header">
                        <span class="stats-title">До следующего</span>
                        <span class="stats-icon">⏰</span>
                    </div>
                    <div class="stats-value">3 дня</div>
                    <div class="stats-change">осталось</div>
                </div>
            </div>
            
            <!-- ДОСТУПНЫЕ ПОДАРКИ -->
            <div class="stats-card" style="margin-bottom: 2rem;">
                <h3 style="color: var(--primary-color); margin-bottom: 1.5rem;">🎁 Доступные подарки</h3>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
                    <!-- Подарок за регистрацию -->
                    <div style="background: var(--bg-primary); padding: 1.5rem; border-radius: 12px; border: 2px solid var(--success-color); position: relative; overflow: hidden;">
                        <div style="position: absolute; top: 1rem; right: 1rem; background: var(--success-color); color: var(--bg-primary); padding: 0.3rem 0.6rem; border-radius: 20px; font-size: 0.8rem; font-weight: 600;">
                            ДОСТУПЕН
                        </div>
                        
                        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                            <span style="font-size: 3rem;">🎉</span>
                            <div>
                                <h4 style="color: var(--text-primary); margin-bottom: 0.3rem;">Приветственный бонус</h4>
                                <p style="color: var(--text-secondary); font-size: 0.9rem; margin: 0;">За регистрацию в системе</p>
                            </div>
                        </div>
                        
                        <div style="background: var(--bg-secondary); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <span style="color: var(--text-secondary);">Награда:</span>
                                <span style="color: var(--success-color); font-weight: 600;">100 PLEX</span>
                            </div>
                        </div>
                        
                        <button class="btn btn-success" style="width: 100%;" onclick="window.CabinetApp.claimGift('welcome')">
                            🎁 Получить подарок
                        </button>
                    </div>
                    
                    <!-- Подарок за первый депозит -->
                    <div style="background: var(--bg-primary); padding: 1.5rem; border-radius: 12px; border: 2px solid var(--secondary-color); position: relative; overflow: hidden;">
                        <div style="position: absolute; top: 1rem; right: 1rem; background: var(--secondary-color); color: var(--bg-primary); padding: 0.3rem 0.6rem; border-radius: 20px; font-size: 0.8rem; font-weight: 600;">
                            СКОРО
                        </div>
                        
                        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                            <span style="font-size: 3rem;">🚀</span>
                            <div>
                                <h4 style="color: var(--text-primary); margin-bottom: 0.3rem;">Первый депозит</h4>
                                <p style="color: var(--text-secondary); font-size: 0.9rem; margin: 0;">За создание первого депозита</p>
                            </div>
                        </div>
                        
                        <div style="background: var(--bg-secondary); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <span style="color: var(--text-secondary);">Награда:</span>
                                <span style="color: var(--secondary-color); font-weight: 600;">+10% к первому депозиту</span>
                            </div>
                        </div>
                        
                        <button class="btn btn-secondary" style="width: 100%;" disabled>
                            🔒 Создайте первый депозит
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- СИСТЕМА ПОДАРКОВ -->
            <div class="stats-card" style="margin-bottom: 2rem;">
                <h3 style="color: var(--secondary-color); margin-bottom: 1.5rem;">🎯 Как работают подарки</h3>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;">
                    <div style="padding: 1rem; background: var(--bg-primary); border-radius: 8px; border-left: 4px solid var(--primary-color);">
                        <h4 style="color: var(--primary-color); margin-bottom: 0.5rem;">📅 Регулярные подарки</h4>
                        <p style="color: var(--text-secondary); font-size: 0.9rem; margin: 0;">Новые подарки появляются каждую неделю</p>
                    </div>
                    
                    <div style="padding: 1rem; background: var(--bg-primary); border-radius: 8px; border-left: 4px solid var(--success-color);">
                        <h4 style="color: var(--success-color); margin-bottom: 0.5rem;">🎯 За достижения</h4>
                        <p style="color: var(--text-secondary); font-size: 0.9rem; margin: 0;">Выполняйте задания и получайте награды</p>
                    </div>
                    
                    <div style="padding: 1rem; background: var(--bg-primary); border-radius: 8px; border-left: 4px solid var(--warning-color);">
                        <h4 style="color: var(--warning-color); margin-bottom: 0.5rem;">⏰ Ограниченное время</h4>
                        <p style="color: var(--text-secondary); font-size: 0.9rem; margin: 0;">Успейте забрать подарки вовремя</p>
                    </div>
                    
                    <div style="padding: 1rem; background: var(--bg-primary); border-radius: 8px; border-left: 4px solid var(--secondary-color);">
                        <h4 style="color: var(--secondary-color); margin-bottom: 0.5rem;">💎 Уникальность</h4>
                        <p style="color: var(--text-secondary); font-size: 0.9rem; margin: 0;">Каждый подарок можно получить только раз</p>
                    </div>
                </div>
            </div>
            
            <!-- ПРЕДСТОЯЩИЕ ПОДАРКИ -->
            <div class="stats-card">
                <h3 style="color: var(--warning-color); margin-bottom: 1.5rem;">🎁 Предстоящие подарки</h3>
                
                <div style="display: grid; gap: 1rem;">
                    <!-- Недельный подарок -->
                    <div style="display: flex; align-items: center; gap: 1.5rem; padding: 1.5rem; background: var(--bg-primary); border-radius: 12px; border: 1px solid var(--border-color); opacity: 0.7;">
                        <span style="font-size: 2.5rem;">📆</span>
                        <div style="flex: 1;">
                            <h4 style="color: var(--text-primary); margin-bottom: 0.3rem;">Недельный бонус</h4>
                            <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem;">Награда за активность в течение недели</p>
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <span style="color: var(--warning-color); font-size: 0.85rem;">Доступен через: 3 дня</span>
                                <span style="background: var(--bg-secondary); padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.8rem;">
                                    Награда: 200 PLEX
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Месячный подарок -->
                    <div style="display: flex; align-items: center; gap: 1.5rem; padding: 1.5rem; background: var(--bg-primary); border-radius: 12px; border: 1px solid var(--border-color); opacity: 0.7;">
                        <span style="font-size: 2.5rem;">🏆</span>
                        <div style="flex: 1;">
                            <h4 style="color: var(--text-primary); margin-bottom: 0.3rem;">Месячный джекпот</h4>
                            <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem;">Главный приз за активность в течение месяца</p>
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <span style="color: var(--warning-color); font-size: 0.85rem;">Доступен через: 15 дней</span>
                                <span style="background: var(--bg-secondary); padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.8rem;">
                                    Награда: 1000 PLEX
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Специальный подарок -->
                    <div style="display: flex; align-items: center; gap: 1.5rem; padding: 1.5rem; background: var(--bg-primary); border-radius: 12px; border: 1px solid var(--gold-color); opacity: 0.7;">
                        <span style="font-size: 2.5rem;">👑</span>
                        <div style="flex: 1;">
                            <h4 style="color: var(--gold-color); margin-bottom: 0.3rem;">VIP подарок</h4>
                            <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem;">Эксклюзивная награда для топ-инвесторов</p>
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <span style="color: var(--warning-color); font-size: 0.85rem;">Требуется: депозит от $1000</span>
                                <span style="background: linear-gradient(135deg, var(--gold-color), var(--accent-color)); padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.8rem; color: var(--bg-primary);">
                                    Награда: x2 множитель
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    // MCP-MARKER:METHOD:CABINET:MULTIPLIERS_CONTENT - Генерация контента страницы множителей
    getMultipliersContent() {
        return `
            <div class="page-header">
                <h2 class="page-title">⚡ Множители доходности</h2>
                <p class="page-subtitle">Увеличивайте свою прибыль с помощью специальных множителей</p>
            </div>
            
            <!-- АКТИВНЫЕ МНОЖИТЕЛИ -->
            <div class="multiplier-grid">
                <div class="stats-card">
                    <h3 style="color: var(--primary-color); margin-bottom: 1.5rem;">🚀 Активные множители</h3>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
                        <div class="multiplier-card multiplier-card-active">
                            <div class="multiplier-icon">⚡</div>
                            <h4 class="multiplier-title">Базовый</h4>
                            <div class="multiplier-value" style="color: var(--success-color);">x1.0</div>
                            <div class="multiplier-time">Постоянный</div>
                        </div>
                        
                        <div class="multiplier-card multiplier-card-default">
                            <div class="multiplier-icon opacity-50">🔥</div>
                            <h4 class="multiplier-title">Бустер</h4>
                            <div class="multiplier-value opacity-50">x2.0</div>
                            <div class="multiplier-time">Не активен</div>
                        </div>
                        
                        <div class="multiplier-card multiplier-card-default">
                            <div class="multiplier-icon opacity-50">💎</div>
                            <h4 class="multiplier-title">Премиум</h4>
                            <div class="multiplier-value opacity-50">x3.0</div>
                            <div class="multiplier-time">Не активен</div>
                        </div>
                        
                        <div class="multiplier-card multiplier-card-default">
                            <div class="multiplier-icon opacity-50">👑</div>
                            <h4 class="multiplier-title">VIP</h4>
                            <div class="multiplier-value opacity-50">x5.0</div>
                            <div class="multiplier-time">Не активен</div>
                        </div>
                    </div>
                    
                    <!-- Общий множитель -->
                    <div style="background: var(--bg-primary); padding: 1.5rem; border-radius: 12px; text-align: center; border: 2px solid var(--primary-color);">
                        <h4 style="color: var(--text-secondary); margin-bottom: 0.5rem;">Общий множитель:</h4>
                        <div style="font-size: 3rem; font-weight: 700; color: var(--primary-color); font-family: 'Orbitron', monospace;">x1.0</div>
                        <p style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 0.5rem;">
                            Применяется ко всем активным депозитам
                        </p>
                    </div>
                </div>
                
                <div class="stats-card">
                    <h3 style="color: var(--secondary-color); margin-bottom: 1.5rem;">📊 Эффект множителей</h3>
                    
                    <div class="effect-grid">
                        <div class="effect-item">
                            <div class="effect-label">Базовый доход</div>
                            <div class="effect-value">$10/день</div>
                        </div>
                        <div class="effect-item">
                            <div class="effect-label">С множителем</div>
                            <div class="effect-value" style="color: var(--success-color);">$10/день</div>
                        </div>
                        <div class="effect-item">
                            <div class="effect-label">Бонус</div>
                            <div class="effect-value" style="color: var(--warning-color);">+$0/день</div>
                        </div>
                    </div>
                    
                    <div style="margin-top: 1.5rem; padding: 1rem; background: var(--bg-primary); border-radius: 8px;">
                        <h5 style="color: var(--text-primary); margin-bottom: 0.8rem;">Пример расчета с x3 множителем:</h5>
                        <div style="display: grid; gap: 0.5rem; font-size: 0.9rem;">
                            <div style="display: flex; justify-content: space-between;">
                                <span style="color: var(--text-secondary);">Базовый доход:</span>
                                <span>$100/день</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span style="color: var(--text-secondary);">Множитель:</span>
                                <span style="color: var(--warning-color);">x3.0</span>
                            </div>
                            <div style="height: 1px; background: var(--border-color); margin: 0.5rem 0;"></div>
                            <div style="display: flex; justify-content: space-between; font-weight: 600;">
                                <span style="color: var(--success-color);">Итоговый доход:</span>
                                <span style="color: var(--success-color);">$300/день</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- ДОСТУПНЫЕ МНОЖИТЕЛИ -->
            <div class="stats-card" style="margin-bottom: 2rem;">
                <h3 style="color: var(--warning-color); margin-bottom: 1.5rem;">🛒 Доступные для покупки</h3>
                
                <div class="available-grid">
                    <!-- x2 Множитель -->
                    <div class="multiplier-shop-card">
                        <div class="multiplier-header">
                            <div class="multiplier-name">
                                <span style="font-size: 1.5rem;">🔥</span>
                                <h4 style="margin: 0;">Бустер x2</h4>
                            </div>
                            <span class="multiplier-badge" style="background: var(--success-color);">Популярный</span>
                        </div>
                        
                        <p class="multiplier-description">
                            Удваивает доход от всех активных депозитов на 7 дней
                        </p>
                        
                        <div class="multiplier-price">
                            <div>
                                <div class="multiplier-cost">$50 USDT</div>
                                <div class="multiplier-alt">или 5,000 PLEX</div>
                            </div>
                            <div style="text-align: right;">
                                <div style="font-size: 0.8rem; color: var(--text-secondary);">Срок:</div>
                                <div style="font-weight: 600;">7 дней</div>
                            </div>
                        </div>
                        
                        <button class="btn btn-success" style="width: 100%;" onclick="window.CabinetApp.purchaseMultiplier('booster')">
                            Купить множитель
                        </button>
                    </div>
                    
                    <!-- x3 Множитель -->
                    <div class="multiplier-shop-card">
                        <div class="multiplier-header">
                            <div class="multiplier-name">
                                <span style="font-size: 1.5rem;">💎</span>
                                <h4 style="margin: 0;">Премиум x3</h4>
                            </div>
                            <span class="multiplier-badge" style="background: var(--secondary-color);">Выгодно</span>
                        </div>
                        
                        <p class="multiplier-description">
                            Утраивает доход от всех депозитов на 14 дней
                        </p>
                        
                        <div class="multiplier-price">
                            <div>
                                <div class="multiplier-cost">$150 USDT</div>
                                <div class="multiplier-alt">или 15,000 PLEX</div>
                            </div>
                            <div style="text-align: right;">
                                <div style="font-size: 0.8rem; color: var(--text-secondary);">Срок:</div>
                                <div style="font-weight: 600;">14 дней</div>
                            </div>
                        </div>
                        
                        <button class="btn btn-secondary" style="width: 100%;" onclick="window.CabinetApp.purchaseMultiplier('premium')">
                            Купить множитель
                        </button>
                    </div>
                    
                    <!-- x5 Множитель -->
                    <div class="multiplier-shop-card" style="border-color: var(--gold-color);">
                        <div class="multiplier-header">
                            <div class="multiplier-name">
                                <span style="font-size: 1.5rem;">👑</span>
                                <h4 style="margin: 0; color: var(--gold-color);">VIP x5</h4>
                            </div>
                            <span class="multiplier-badge" style="background: var(--gold-color); color: var(--bg-primary);">Эксклюзив</span>
                        </div>
                        
                        <p class="multiplier-description">
                            Максимальный множитель! Пятикратное увеличение дохода на 30 дней
                        </p>
                        
                        <div class="multiplier-price">
                            <div>
                                <div class="multiplier-cost" style="color: var(--gold-color);">$500 USDT</div>
                                <div class="multiplier-alt">или 50,000 PLEX</div>
                            </div>
                            <div style="text-align: right;">
                                <div style="font-size: 0.8rem; color: var(--text-secondary);">Срок:</div>
                                <div style="font-weight: 600; color: var(--gold-color);">30 дней</div>
                            </div>
                        </div>
                        
                        <button class="btn" style="width: 100%; background: linear-gradient(135deg, var(--gold-color), var(--accent-color));" onclick="window.CabinetApp.purchaseMultiplier('vip')">
                            Купить VIP множитель
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- СПЕЦИАЛЬНЫЕ ПРЕДЛОЖЕНИЯ -->
            <div class="stats-card">
                <h3 style="color: var(--accent-color); margin-bottom: 1.5rem;">🎯 Специальные акции</h3>
                
                <div style="display: grid; gap: 1rem;">
                    <!-- Акция недели -->
                    <div class="promo-card promo-card-success">
                        <h4 class="promo-title">🎉 Акция недели</h4>
                        <p class="promo-description">
                            При покупке любого множителя получите +1 день бесплатно!
                        </p>
                        <div class="promo-footer">
                            <span class="promo-timer" style="color: var(--success-color);">⏰ До конца: 3 дня</span>
                            <button class="btn-secondary promo-btn">Подробнее</button>
                        </div>
                    </div>
                    
                    <!-- Комбо предложение -->
                    <div class="promo-card promo-card-secondary">
                        <h4 class="promo-title">💫 Комбо-пакет</h4>
                        <p class="promo-description">
                            Купите депозит + множитель и получите скидку 20% на множитель
                        </p>
                        <div class="promo-footer">
                            <span class="promo-permanent">♾️ Постоянная акция</span>
                            <button class="btn-secondary promo-btn">Узнать больше</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    
    // MCP-MARKER:METHOD:CABINET:MINING_RENT_CONTENT - Генерация контента страницы аренды мощностей
    getMiningRentContent() {
        return `
            <div class="page-header">
                <h2 class="page-title">💻 Аренда мощностей майнинга</h2>
                <p class="page-subtitle">Арендуйте вычислительные мощности для увеличения дохода</p>
            </div>
            
            <!-- СТАТИСТИКА МАЙНИНГА -->
            <div class="stats-grid" style="margin-bottom: 2rem;">
                <div class="stats-card">
                    <div class="stats-header">
                        <span class="stats-title">Арендовано мощностей</span>
                        <span class="stats-icon">⚡</span>
                    </div>
                    <div class="stats-value">0 TH/s</div>
                    <div class="stats-change">терахешей</div>
                </div>
                
                <div class="stats-card">
                    <div class="stats-header">
                        <span class="stats-title">Доход от майнинга</span>
                        <span class="stats-icon">💰</span>
                    </div>
                    <div class="stats-value">$0.00</div>
                    <div class="stats-change">в день</div>
                </div>
                
                <div class="stats-card">
                    <div class="stats-header">
                        <span class="stats-title">Активных контрактов</span>
                        <span class="stats-icon">📋</span>
                    </div>
                    <div class="stats-value">0</div>
