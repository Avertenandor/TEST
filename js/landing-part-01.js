                // Периодическое обновление производительности
                setInterval(() => {
                    this.updatePerformanceInfo();
                }, 10000); // Каждые 10 секунд
            }
        };
        
        // Запуск при загрузке
        // MCP-MARKER:EVENT:DOM_CONTENT_LOADED_INIT - Инициализация при загрузке DOM
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                window.GenesisTechData.init();
            }, 1000);
        });

// ===== Script Block 3 =====
// Анимация "заливки" слов: текст шагов сразу напечатан, каждое слово подсвечивается поочерёдно, затем галочка, пауза 20 сек и новый цикл
                    (function() {
                        function onReady(fn) {
                            if (document.readyState !== 'loading') fn();
                            else document.addEventListener('DOMContentLoaded', fn);
                        }
                        onReady(function() {
                            var steps = document.querySelectorAll('#instructions-steps .step-text');
                            var checkmark = document.getElementById('instructions-checkmark');
                            if (!steps.length || !checkmark) return;
                            var readingSpeed = 250; // мс на слово
                            var pauseBetweenSteps = 400;
                            var pauseAfterAll = 20000; // 20 секунд
                            // MCP-MARKER:FUNCTION:SPLIT_WORDS - Разделение текста на слова для анимации
                            function splitWords(stepEl) {
                                var fullText = stepEl.getAttribute('data-full');
                                var words = fullText.split(' ');
                                stepEl.innerHTML = '';
                                words.forEach(function(word, idx) {
                                    var span = document.createElement('span');
                                    span.textContent = word + (idx < words.length-1 ? ' ' : '');
                                    span.className = 'word-to-fill';
                                    stepEl.appendChild(span);
                                });
                            }
                            // MCP-MARKER:FUNCTION:ANIMATE_WORDS_STEPS - Анимация слов по шагам
                            function animateWords(stepEls, cb) {
                                var stepIdx = 0;
                                // MCP-MARKER:FUNCTION:ANIMATE_STEP - Анимация одного шага
                                function animateStep() {
                                    if (stepIdx >= stepEls.length) { cb && cb(); return; }
                                    var wordSpans = stepEls[stepIdx].querySelectorAll('.word-to-fill');
                                    var wordIdx = 0;
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
                            var style = document.createElement('style');
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
            const links = {
                ...PLEX_TOKEN_CONFIG.tradingLinks,
                ...PLEX_TOKEN_CONFIG.bscScanLinks
            };
            if (links[type]) {
                window.open(links[type], '_blank');
            } else {
                alert('Ссылка не найдена или не задана!');
            }
        }

        // MCP-MARKER:FUNCTION:COPY_TOKEN_ADDRESS - Копирование адреса токена
        // MCP-MARKER:FUNCTION:COPY_ADDRESS - Копирование адреса
        // Функция копирования адреса токена
        function copyTokenAddress() {
            const address = '0xdf179b6cAdBC61FFD86A3D2e55f6d6e083ade6c1';
            navigator.clipboard.writeText(address).then(() => {
                // Показываем уведомление об успешном копировании
                const notification = document.createElement('div');
                notification.className = 'copy-notification';
                notification.textContent = 'Адрес скопирован!';
                notification.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: #4ecdc4;
                    color: white;
                    padding: 10px 20px;
                    border-radius: 5px;
                    z-index: 10000;
                    animation: slideIn 0.3s ease;
                `;
                document.body.appendChild(notification);
                setTimeout(() => {
                    notification.remove();
                }, 2000);
            });
        }

        // MCP-MARKER:WALLET:INTEGRATION_FUNCTIONS - Функции интеграции с кошельками
        // Функции добавления в кошельки
        // MCP-MARKER:WALLET:METAMASK_INTEGRATION - Интеграция с MetaMask
        function addToMetaMask() {
            if (typeof window.ethereum !== 'undefined') {
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
                        alert('PLEX ONE успешно добавлен в MetaMask!');
                    }
                }).catch(console.error);
            } else {
                alert('MetaMask не установлен. Установите MetaMask и попробуйте снова.');
            }
        }

        // MCP-MARKER:WALLET:TRUST_WALLET_INTEGRATION - Интеграция с Trust Wallet
        function addToTrustWallet() {
            const trustWalletUrl = `https://link.trustwallet.com/add_asset?asset=c20_0xdf179b6cAdBC61FFD86A3D2e55f6d6e083ade6c1`;
            window.open(trustWalletUrl, '_blank');
        }

        // MCP-MARKER:WALLET:SAFEPAL_INTEGRATION - Интеграция с SafePal
        function addToSafePal() {
            alert('Для добавления в SafePal:\n1. Откройте SafePal\n2. Нажмите "Добавить токен"\n3. Вставьте адрес: 0xdf179b6cAdBC61FFD86A3D2e55f6d6e083ade6c1\n4. Подтвердите добавление');
        }

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

            // Наблюдаем за всеми карточками
            document.querySelectorAll('.genesis-info-card, .unified-card, .instruction-card').forEach(card => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
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
