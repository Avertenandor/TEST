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
            
            <script>
                // Инициализация технической информации
                if (window.GenesisTechInfo) {
                    setTimeout(() => {
                        window.GenesisTechInfo.updateElements();
                        // Расширяем функционал PWA установкой
                        if (window.extendDevicePage) {
                            window.extendDevicePage();
                        }
                    }, 100);
                }
            </script>
        `;
    },

    // MCP-MARKER:METHOD:CABINET:PORTFOLIO_CONTENT - Генерация контента страницы портфеля
    getPortfolioContent() {
        return `
            <div class="page-header">
                <h2 class="page-title">💼 Мой портфель</h2>
                <p class="page-subtitle">Управление активными депозитами и инвестициями</p>
            </div>
            
            <!-- Общая статистика портфеля -->
            <div class="stats-grid mb-2">
                <div class="stats-card">
                    <div class="stats-header">
                        <span class="stats-title">Общая стоимость</span>
                        <span class="stats-icon">💰</span>
                    </div>
                    <div class="stats-value">$0.00</div>
                    <div class="stats-change">USDT</div>
                </div>
                
                <div class="stats-card">
                    <div class="stats-header">
                        <span class="stats-title">Активных депозитов</span>
                        <span class="stats-icon">📈</span>
                    </div>
                    <div class="stats-value">0</div>
                    <div class="stats-change">штук</div>
                </div>
                
                <div class="stats-card">
                    <div class="stats-header">
                        <span class="stats-title">Общий доход</span>
                        <span class="stats-icon">🚀</span>
                    </div>
                    <div class="stats-value">$0.00</div>
                    <div class="stats-change">все время</div>
                </div>
                
                <div class="stats-card">
                    <div class="stats-header">
                        <span class="stats-title">Доход сегодня</span>
                        <span class="stats-icon">📅</span>
                    </div>
                    <div class="stats-value">$0.00</div>
                    <div class="stats-change">за 24 часа</div>
                </div>
            </div>
            
            <!-- Активные депозиты -->
            <div class="active-deposits mb-2">
                <h3 class="active-deposits-title">💼 Активные депозиты</h3>
                <div id="active-deposits-container">
                    <div class="empty-state">
                        <div class="empty-icon">📦</div>
                        <h3>Нет активных депозитов</h3>
                        <p>Создайте свой первый депозит и начните зарабатывать</p>
                        <button class="btn btn-secondary mt-1" onclick="window.CabinetApp.showCreateDepositModal()">
                            💰 Создать депозит
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Доступные планы -->
            <div class="stats-card">
                <h3 class="plans-title">🔓 Доступные депозитные планы</h3>
                <div id="available-plans-container" class="plans-grid">
                    <!-- Планы будут загружены динамически -->
                    <div class="empty-state">
                        <p>Загрузка доступных планов...</p>
                    </div>
                </div>
            </div>
        `;
    },

    // MCP-MARKER:METHOD:CABINET:TRANSACTIONS_CONTENT - Генерация контента страницы транзакций
    getTransactionsContent() {
        return `
            <div class="page-header">
                <h2 class="page-title">📋 История транзакций</h2>
                <p class="page-subtitle">Все ваши операции в системе</p>
            </div>
            
            <div class="stats-card">
                <div class="empty-state">
                    <div class="empty-icon">📋</div>
                    <h3>Нет транзакций</h3>
                    <p>Здесь будут отображаться все ваши операции</p>
                </div>
            </div>
        `;
    },

    // MCP-MARKER:METHOD:CABINET:ANALYTICS_CONTENT - Генерация контента страницы аналитики
    getAnalyticsContent() {
        return `
            <div class="page-header">
                <h2 class="page-title">📈 Аналитика</h2>
                <p class="page-subtitle">Детальная статистика и графики</p>
            </div>
            
            <div class="stats-grid">
                <div class="stats-card">
                    <div class="stats-header">
                        <span class="stats-title">Общий ROI</span>
                        <span class="stats-icon">📊</span>
                    </div>
                    <div class="stats-value">0%</div>
                    <div class="stats-change">за все время</div>
                </div>
                
                <div class="stats-card">
                    <div class="stats-header">
                        <span class="stats-title">Средний доход</span>
                        <span class="stats-icon">📉</span>
                    </div>
                    <div class="stats-value">$0.00</div>
                    <div class="stats-change">в день</div>
                </div>
            </div>
            
            <div class="stats-card">
                <h3 style="color: var(--primary-color); margin-bottom: 1rem;">📈 График доходности</h3>
                <div class="empty-state">
                    <p>Нет данных для отображения</p>
                </div>
            </div>
        `;
    },

    // MCP-MARKER:METHOD:CABINET:BONUSES_CONTENT - Генерация контента страницы бонусов  
    getBonusesContent() {
        return `
            <div class="page-header">
                <h2 class="page-title">🎁 Бонусная система</h2>
                <p class="page-subtitle">Получайте дополнительные награды за активность</p>
            </div>
            
            <div class="bonus-card">
                <h3 class="bonus-title">
                    <span>🎁</span>
                    <span>Доступные бонусы</span>
                </h3>
                
                <div class="bonus-grid">
                    <div class="bonus-item">
                        <div class="bonus-item-header">
                            <div>
                                <h4 class="bonus-item-title">Приветственный бонус</h4>
                                <p class="bonus-item-desc">За регистрацию в системе</p>
                            </div>
                            <div class="bonus-icon">🎉</div>
                        </div>
                        <div class="bonus-reward">
                            <div class="bonus-reward-content">
                                <span>Награда:</span>
                                <span style="color: var(--success-color); font-weight: 600;">100 PLEX</span>
                            </div>
                        </div>
                        <button class="btn btn-success w-100">Получить бонус</button>
                    </div>
                </div>
            </div>
        `;
    },

    // MCP-MARKER:METHOD:CABINET:REFERRALS_CONTENT - Генерация контента страницы рефералов
    getReferralsContent() {
        return `
            <div class="page-header">
                <h2 class="page-title">👥 Реферальная программа</h2>
                <p class="page-subtitle">Приглашайте друзей и получайте бонусы</p>
            </div>
            
            <div class="stats-grid mb-2">
                <div class="stats-card">
                    <div class="stats-header">
                        <span class="stats-title">Приглашено</span>
                        <span class="stats-icon">👥</span>
                    </div>
                    <div class="stats-value">0</div>
                    <div class="stats-change">человек</div>
                </div>
                
                <div class="stats-card">
                    <div class="stats-header">
                        <span class="stats-title">Доход от рефералов</span>
                        <span class="stats-icon">💵</span>
                    </div>
                    <div class="stats-value">$0.00</div>
                    <div class="stats-change">USDT</div>
                </div>
            </div>
            
            <div class="stats-card">
                <h3 style="color: var(--primary-color); margin-bottom: 1rem;">🔗 Ваша реферальная ссылка</h3>
                <div style="background: var(--bg-primary); padding: 1rem; border-radius: 8px; word-break: break-all;">
                    <code>https://genesis.platform/ref/YOUR_ADDRESS</code>
                </div>
                <button class="btn btn-secondary mt-1" onclick="window.CabinetApp.copyReferralLink()">
                    📋 Копировать ссылку
                </button>
            </div>
        `;
    }
};

// MCP-MARKER:INIT:CABINET_CONTENT_GENERATOR - Инициализация генератора контента
console.log('📄 Cabinet Content Generator loaded');