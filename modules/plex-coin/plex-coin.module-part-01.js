                                        <div class="supply-bar" style="width: 15%; background: var(--success-color);">
                                            <span>15%</span>
                                        </div>
                                        <span class="supply-label">Награды и бонусы</span>
                                    </div>
                                    <div class="supply-item">
                                        <div class="supply-bar" style="width: 10%; background: var(--warning-color);">
                                            <span>10%</span>
                                        </div>
                                        <span class="supply-label">Команда разработки</span>
                                    </div>
                                    <div class="supply-item">
                                        <div class="supply-bar" style="width: 5%; background: var(--accent-color);">
                                            <span>5%</span>
                                        </div>
                                        <span class="supply-label">Маркетинг</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="tokenomics-features">
                                <h4>Особенности токеномики</h4>
                                <ul>
                                    <li>Общая эмиссия: 1,000,000,000 PLEX</li>
                                    <li>Нет функции минтинга новых токенов</li>
                                    <li>Нет комиссий при переводах</li>
                                    <li>Прозрачное распределение</li>
                                    <li>Блокировка токенов команды на 1 год</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Где купить -->
                    <div class="plex-exchanges">
                        <h3>🏪 Где купить PLEX</h3>
                        <div class="exchanges-grid">
                            <div class="exchange-card">
                                <div class="exchange-logo">🥞</div>
                                <h4>PancakeSwap</h4>
                                <p>Основная DEX биржа</p>
                                <button class="btn btn-sm exchange-btn" data-exchange="pancakeswap">
                                    Открыть
                                </button>
                            </div>
                            
                            <div class="exchange-card">
                                <div class="exchange-logo">💩</div>
                                <h4>PooCoin</h4>
                                <p>График и аналитика</p>
                                <button class="btn btn-sm exchange-btn" data-exchange="poocoin">
                                    Открыть
                                </button>
                            </div>
                            
                            <div class="exchange-card">
                                <div class="exchange-logo">📊</div>
                                <h4>DexTools</h4>
                                <p>Профессиональные графики</p>
                                <button class="btn btn-sm exchange-btn" data-exchange="dextools">
                                    Открыть
                                </button>
                            </div>
                            
                            <div class="exchange-card">
                                <div class="exchange-logo">🦎</div>
                                <h4>CoinGecko</h4>
                                <p>Рейтинг и статистика</p>
                                <button class="btn btn-sm exchange-btn" data-exchange="coingecko">
                                    Открыть
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- FAQ -->
                    <div class="plex-faq">
                        <h3>❓ Часто задаваемые вопросы</h3>
                        <div class="faq-list">
                            <div class="faq-item">
                                <h4>Как купить PLEX?</h4>
                                <p>Подключите кошелек к PancakeSwap, выберите пару BNB/PLEX или USDT/PLEX и совершите обмен. Минимальная покупка - 1000 PLEX.</p>
                            </div>
                            
                            <div class="faq-item">
                                <h4>Какой курс PLEX к доллару?</h4>
                                <p>Текущий курс: 1 PLEX ≈ $0.001. Курс может изменяться в зависимости от рыночных условий.</p>
                            </div>
                            
                            <div class="faq-item">
                                <h4>Нужен ли PLEX для работы с платформой?</h4>
                                <p>Да, для авторизации требуется 1 PLEX. Также PLEX можно использовать для создания депозитов и покупки бонусов.</p>
                            </div>
                            
                            <div class="faq-item">
                                <h4>Можно ли майнить PLEX?</h4>
                                <p>Нет, PLEX не майнится. Вся эмиссия выпущена при создании контракта.</p>
                            </div>
                            
                            <div class="faq-item">
                                <h4>Где хранить PLEX?</h4>
                                <p>PLEX можно хранить в любом BSC-совместимом кошельке: MetaMask, Trust Wallet, SafePal и др.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    destroy() {
        console.log('🧹 Destroying PLEX Coin Module...');
        
        // Останавливаем обновления
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        // Удаление стилей
        const link = document.querySelector(`link[data-module="${this.name}"]`);
        if (link) link.remove();
        
        // Очистка контейнера
        if (this.container) {
            this.container.innerHTML = '';
        }
        
        console.log('✅ PLEX Coin Module destroyed');
    }
}
