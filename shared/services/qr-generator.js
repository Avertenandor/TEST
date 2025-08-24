// shared/utils/qr-generator.js
// QR код генератор для платежей в GENESIS DeFi Platform

export class QRGenerator {
    constructor() {
        this.qrLibraryLoaded = false;
        this.loadingPromise = null;
    }

    // Загрузка библиотеки QRCode.js
    async loadQRLibrary() {
        if (this.qrLibraryLoaded) return;
        
        if (this.loadingPromise) {
            return this.loadingPromise;
        }

        this.loadingPromise = new Promise((resolve, reject) => {
            // Проверяем, не загружена ли уже библиотека
            if (typeof QRCode !== 'undefined') {
                this.qrLibraryLoaded = true;
                resolve();
                return;
            }

            // Создаем script элемент для загрузки библиотеки
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
            script.async = true;
            
            script.onload = () => {
                this.qrLibraryLoaded = true;
                console.log('✅ QRCode library loaded successfully');
                resolve();
            };
            
            script.onerror = () => {
                console.error('❌ Failed to load QRCode library');
                reject(new Error('Failed to load QRCode library'));
            };
            
            document.head.appendChild(script);
        });

        return this.loadingPromise;
    }

    // Генерация QR кода для платежа
    async generatePaymentQR(options) {
        const {
            container,      // DOM элемент или ID
            address,        // Адрес для оплаты
            amount,         // Сумма
            token,          // Токен (USDT/PLEX)
            network = 'BSC' // Сеть
        } = options;

        try {
            // Загружаем библиотеку если нужно
            await this.loadQRLibrary();

            // Получаем контейнер
            const containerElement = typeof container === 'string' 
                ? document.getElementById(container) 
                : container;

            if (!containerElement) {
                throw new Error('Container element not found');
            }

            // Очищаем контейнер
            containerElement.innerHTML = '';

            // Создаем данные для QR кода
            const qrData = this.createPaymentData(address, amount, token, network);

            // Генерируем QR код
            const qrcode = new QRCode(containerElement, {
                text: qrData,
                width: 256,
                height: 256,
                colorDark: '#000000',
                colorLight: '#ffffff',
                correctLevel: QRCode.CorrectLevel.H
            });

            // Добавляем стили и информацию
            this.styleQRContainer(containerElement, address, amount, token);

            console.log('✅ QR code generated successfully');
            return qrcode;

        } catch (error) {
            console.error('Failed to generate QR code:', error);
            this.showFallback(container, address, amount, token);
            throw error;
        }
    }

    // Создание данных для QR кода
    createPaymentData(address, amount, token, network) {
        // Формат для криптовалютных платежей
        // Для BSC используем стандартный формат
        
        if (token === 'BNB') {
            // Для нативного токена
            return `ethereum:${address}?value=${amount}`;
        } else {
            // Для токенов (USDT, PLEX)
            const tokenData = this.getTokenData(token);
            if (tokenData) {
                // Создаем данные для токена
                return `ethereum:${tokenData.contract}/transfer?address=${address}&uint256=${this.parseAmount(amount, tokenData.decimals)}`;
            }
        }
        
        // Fallback - просто адрес
        return address;
    }

    // Получение данных токена
    getTokenData(token) {
        const tokens = {
            'USDT': {
                contract: '0x55d398326f99059ff775485246999027b3197955',
                decimals: 18,
                symbol: 'USDT'
            },
            'PLEX': {
                contract: '0xdf179b6cAdBC61FFD86A3D2e55f6d6e083ade6c1',
                decimals: 9,
                symbol: 'PLEX'
            }
        };
        
        return tokens[token];
    }

    // Парсинг суммы с учетом decimals
    parseAmount(amount, decimals) {
        const value = parseFloat(amount) * Math.pow(10, decimals);
        return value.toString();
    }

    // Стилизация QR контейнера
    styleQRContainer(container, address, amount, token) {
        // Добавляем класс для стилизации
        container.classList.add('qr-payment-container');
        
        // Добавляем информацию под QR кодом
        const info = document.createElement('div');
        info.className = 'qr-payment-info';
        info.innerHTML = `
            <div class="qr-amount">${amount} ${token}</div>
            <div class="qr-address" title="${address}">
                ${this.formatAddress(address)}
            </div>
            <button class="qr-copy-btn" onclick="window.QRGenerator.copyAddress('${address}')">
                📋 Копировать адрес
            </button>
        `;
        
        container.appendChild(info);
    }

    // Форматирование адреса
    formatAddress(address) {
        if (!address) return '';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }

    // Копирование адреса в буфер обмена
    async copyAddress(address) {
        try {
            await navigator.clipboard.writeText(address);
            
            // Показываем уведомление
            if (window.eventBus) {
                window.eventBus.emit('notification:show', {
                    message: 'Адрес скопирован в буфер обмена',
                    type: 'success'
                });
            } else {
                alert('Адрес скопирован: ' + address);
            }
            
        } catch (error) {
            console.error('Failed to copy address:', error);
            // Fallback для старых браузеров
            this.fallbackCopy(address);
        }
    }

    // Fallback копирование для старых браузеров
    fallbackCopy(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
            document.execCommand('copy');
            alert('Адрес скопирован: ' + text);
        } catch (error) {
            console.error('Fallback copy failed:', error);
            prompt('Скопируйте адрес вручную:', text);
        }
        
        document.body.removeChild(textArea);
    }

    // Показать fallback если QR не генерируется
    showFallback(container, address, amount, token) {
        const containerElement = typeof container === 'string' 
            ? document.getElementById(container) 
            : container;

        if (!containerElement) return;

        containerElement.innerHTML = `
            <div class="qr-fallback">
                <div class="qr-fallback-icon">📱</div>
                <h4>QR код временно недоступен</h4>
                <p>Отправьте <strong>${amount} ${token}</strong> на адрес:</p>
                <div class="qr-fallback-address">
                    <code>${address}</code>
                    <button onclick="window.QRGenerator.copyAddress('${address}')">
                        📋 Копировать
                    </button>
                </div>
            </div>
        `;
    }

    // Генерация QR для депозита
    async generateDepositQR(container, plan, currency = 'USDT') {
        const config = window.store?.get('config') || {};
        const systemAddress = config.addresses?.system || '0x399B22170B0AC7BB20bdC86772bfF478f201fFCD';
        
        const amount = currency === 'USDT' ? plan.usdtAmount : plan.plexAmount;
        
        return this.generatePaymentQR({
            container,
            address: systemAddress,
            amount: amount,
            token: currency,
            network: 'BSC'
        });
    }

    // Генерация QR для платформенного доступа
    async generatePlatformAccessQR(container) {
        const config = window.store?.get('config') || {};
        const accessAddress = config.addresses?.access || '0x28915a33562b58500cf8b5b682C89A3396B8Af76';
        
        return this.generatePaymentQR({
            container,
            address: accessAddress,
            amount: 1,
            token: 'USDT',
            network: 'BSC'
        });
    }

    // Генерация inline QR (base64)
    async generateInlineQR(text, size = 256) {
        try {
            await this.loadQRLibrary();
            
            // Создаем временный контейнер
            const tempContainer = document.createElement('div');
            tempContainer.style.position = 'fixed';
            tempContainer.style.left = '-9999px';
            document.body.appendChild(tempContainer);
            
            // Генерируем QR
            const qrcode = new QRCode(tempContainer, {
                text: text,
                width: size,
                height: size,
                correctLevel: QRCode.CorrectLevel.H
            });
            
            // Ждем генерации
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Получаем изображение
            const img = tempContainer.querySelector('img');
            const base64 = img ? img.src : '';
            
            // Удаляем временный контейнер
            document.body.removeChild(tempContainer);
            
            return base64;
            
        } catch (error) {
            console.error('Failed to generate inline QR:', error);
            return null;
        }
    }
}

// Создаем глобальный экземпляр
window.QRGenerator = new QRGenerator();

// Экспортируем для модулей
export default QRGenerator;