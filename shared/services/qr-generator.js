// shared/utils/qr-generator.js
// QR код генератор для платежей в GENESIS DeFi Platform

export class QRGenerator {
    constructor() {
        this.qrLibraryLoaded = false;
        this.loadingPromise = null;
    }

    // Загрузка библиотеки QRCode.js (попытка нескольких источников)
    async loadQRLibrary() {
        if (this.qrLibraryLoaded) return;
        
        if (this.loadingPromise) {
            return this.loadingPromise;
        }

        this.loadingPromise = new Promise((resolve, reject) => {
            // Если уже есть любой из вариантов
            if (typeof window !== 'undefined' && (window.QRCode || window.qrcode)) {
                this.qrLibraryLoaded = true;
                return resolve();
            }

            const trySources = [
                // Популярная библиотека с API toCanvas
                'https://cdn.jsdelivr.net/npm/qrcode@1.4.4/build/qrcode.min.js',
                // Классическая qrcodejs (конструктор new QRCode)
                'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js'
            ];

            let idx = 0;
            const tryLoad = () => {
                if (idx >= trySources.length) {
                    return reject(new Error('Failed to load any QRCode library'));
                }
                const src = trySources[idx++];
                const script = document.createElement('script');
                script.src = src;
                script.async = true;
                script.onload = () => {
                    if (window.QRCode || window.qrcode) {
                        this.qrLibraryLoaded = true;
                        console.log(`✅ QR library loaded: ${src}`);
                        resolve();
                    } else {
                        tryLoad();
                    }
                };
                script.onerror = () => {
                    console.warn(`⚠️ QR library failed: ${src}`);
                    tryLoad();
                };
                document.head.appendChild(script);
            };

            tryLoad();
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

            // Получаем контейнер (поддержка CSS-селектора/ID/элемента/NodeList)
            let containerElement = container;
            if (typeof container === 'string') {
                // поддержка как '#id', так и 'id'
                containerElement = container.startsWith('#')
                    ? document.querySelector(container)
                    : document.getElementById(container);
            }
            if (containerElement && typeof containerElement.length === 'number' && !containerElement.tagName) {
                // NodeList/HTMLCollection
                containerElement = containerElement[0];
            }

            if (!containerElement) {
                throw new Error('Container element not found');
            }

            // Очищаем контейнер
            containerElement.innerHTML = '';

            // Создаем данные для QR кода
            const qrData = this.createPaymentData(address, amount, token, network);

            // Генерация: предпочтительно через QRCode.toCanvas, иначе через конструктор
            let qrcode = null;
            if (window.QRCode && typeof window.QRCode.toCanvas === 'function') {
                const canvas = document.createElement('canvas');
                canvas.width = 256;
                canvas.height = 256;
                containerElement.appendChild(canvas);
                await new Promise((res, rej) => {
                    window.QRCode.toCanvas(canvas, qrData, { width: 256, margin: 1 }, (err) => {
                        if (err) return rej(err);
                        return res();
                    });
                });
                qrcode = canvas;
            } else if (window.qrcode && typeof window.qrcode.toCanvas === 'function') {
                const canvas = document.createElement('canvas');
                canvas.width = 256;
                canvas.height = 256;
                containerElement.appendChild(canvas);
                await new Promise((res, rej) => {
                    window.qrcode.toCanvas(canvas, qrData, { width: 256, margin: 1 }, (err) => {
                        if (err) return rej(err);
                        return res();
                    });
                });
                qrcode = canvas;
            } else if (window.QRCode) {
                // Классический конструктор
                qrcode = new window.QRCode(containerElement, {
                    text: qrData,
                    width: 256,
                    height: 256,
                    colorDark: '#000000',
                    colorLight: '#ffffff',
                    correctLevel: window.QRCode.CorrectLevel ? window.QRCode.CorrectLevel.H : 0
                });
            } else {
                throw new Error('QRCode library not available after load');
            }

            // Добавляем стили и информацию
            this.styleQRContainer(containerElement, address, amount, token);

            console.log('✅ QR code generated successfully');
            return qrcode;

        } catch (error) {
            console.error('Failed to generate QR code:', error);
            try {
                this.showFallback(container, address, amount, token);
            } catch (e) {
                // ignore fallback errors
            }
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
        let containerElement = container;
        if (typeof container === 'string') {
            containerElement = container.startsWith('#')
                ? document.querySelector(container)
                : document.getElementById(container);
        }
        if (containerElement && typeof containerElement.length === 'number' && !containerElement.tagName) {
            containerElement = containerElement[0];
        }

        if (!containerElement) return;

        containerElement.innerHTML = `
            <div class="qr-fallback">
                <div class="qr-fallback-icon">📱</div>
                <h4>QR код временно недоступен</h4>
                <p>Отправьте <strong>${amount} ${token}</strong> на адрес:</p>
                <div class="qr-fallback-address">
                    <code>${address}</code>
                    <button onclick="window.QRGenerator && window.QRGenerator.copyAddress && window.QRGenerator.copyAddress('${address}')">
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

// Создаём глобальный экземпляр для использования в HTML-обработчиках
if (typeof window !== 'undefined') {
    window.QRGenerator = new QRGenerator();
    // Backward-compatible bridge for legacy calls
    window.generateQRCode = async function(container, data) {
        try {
            // Простейшее: если строка — генерируем QR из текста
            if (typeof data === 'string') {
                await window.QRGenerator.loadQRLibrary();
                let el = container;
                if (typeof container === 'string') {
                    el = container.startsWith('#') ? document.querySelector(container) : document.getElementById(container);
                }
                if (el && typeof el.length === 'number' && !el.tagName) el = el[0];
                if (!el) throw new Error('QR container not found');
                el.innerHTML = '';
                if (window.QRCode && typeof window.QRCode.toCanvas === 'function') {
                    const canvas = document.createElement('canvas');
                    el.appendChild(canvas);
                    await new Promise((res, rej) => window.QRCode.toCanvas(canvas, data, { width: 256, margin: 1 }, (err) => err ? rej(err) : res()));
                    return true;
                }
                if (window.QRCode) {
                    new window.QRCode(el, { text: data, width: 256, height: 256 });
                    return true;
                }
                throw new Error('QRCode library unavailable');
            }

            // Если объект — пробуем платежный QR
            if (data && typeof data === 'object') {
                const opts = { container, ...data };
                await window.QRGenerator.generatePaymentQR(opts);
                return true;
            }
        } catch (e) {
            console.error('generateQRCode bridge failed:', e);
            try { window.QRGenerator.showFallback(container, data?.address || '', data?.amount || '', data?.token || ''); } catch {}
            return false;
        }
    };
}

// Создаем глобальный экземпляр
window.QRGenerator = new QRGenerator();

// Экспортируем для модулей
export default QRGenerator;