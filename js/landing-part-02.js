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
        document.addEventListener('DOMContentLoaded', function() {
            if (window.__qrInit) return;
            window.__qrInit = true;
            console.log('🚀 Инициализация QR кода');
            
            // Ждем загрузки библиотек
            setTimeout(() => {
                // Генерируем начальный QR код
                generateQRCode();
                
                // Автообновление QR кода каждые 5 минут
                if (!window.__qrIntervalStarted) {
                    window.__qrIntervalStarted = true;
                    setInterval(generateQRCode, 300000);
                }
            }, 1000);
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
