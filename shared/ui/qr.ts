// shared/ui/qr.ts
// Компонент QR-кода с идемпотентностью и throttle логами

export interface QRProps {
    text: string;
    size?: number;
    color?: string;
    backgroundColor?: string;
    className?: string;
    showLogo?: boolean;
    logoUrl?: string;
    logoSize?: number;
}

export class QR {
    private element: HTMLElement | null = null;
    private props: QRProps;
    private qrCode: any = null;
    private lastText: string = '';
    private throttleTimer: number | null = null;

    constructor(props: QRProps) {
        this.props = {
            size: 200,
            color: '#000000',
            backgroundColor: '#FFFFFF',
            showLogo: false,
            logoSize: 40,
            ...props
        };
    }

    mount(el: HTMLElement): void {
        this.element = el;
        this.render();
    }

    unmount(): void {
        if (this.element) {
            this.clearContainer();
            this.element = null;
        }
    }

    private clearContainer(): void {
        if (!this.element) return;
        
        // Очищаем контейнер идемпотентно
        this.element.innerHTML = '';
        
        // Уничтожаем QR код если он существует
        if (this.qrCode && typeof this.qrCode.clear === 'function') {
            this.qrCode.clear();
        }
        this.qrCode = null;
    }

    private render(): void {
        if (!this.element) return;

        const { text, size, className } = this.props;
        
        // Проверяем, изменился ли текст
        if (text === this.lastText && this.qrCode) {
            this.throttledLog('QR code already rendered with same text, skipping');
            return;
        }

        this.clearContainer();
        
        const baseClass = 'ui-qr';
        const customClass = className || '';

        this.element.innerHTML = `
            <div class="${baseClass} ${customClass}">
                <canvas id="qr-canvas" width="${size}" height="${size}"></canvas>
            </div>
        `;

        this.generateQR();
        this.lastText = text;
    }

    private async generateQR(): Promise<void> {
        if (!this.element) return;

        const { text, size, color, backgroundColor, showLogo, logoUrl, logoSize } = this.props;
        
        try {
            // Загружаем QRCode библиотеку
            const QRCode = await this.loadQRCode();
            
            const canvas = this.element.querySelector('#qr-canvas') as HTMLCanvasElement;
            if (!canvas) return;

            // Создаем QR код
            this.qrCode = new QRCode(canvas, {
                text: text,
                width: size,
                height: size,
                colorDark: color,
                colorLight: backgroundColor,
                correctLevel: QRCode.CorrectLevel.H
            });

            // Добавляем логотип если нужно
            if (showLogo && logoUrl) {
                await this.addLogo(canvas, logoUrl, logoSize);
            }

            this.throttledLog('QR code generated successfully');
            
        } catch (error) {
            this.throttledLog(`Failed to generate QR code: ${error}`, 'error');
        }
    }

    private async loadQRCode(): Promise<any> {
        // Проверяем, загружена ли библиотека
        if (typeof window.QRCode !== 'undefined') {
            return window.QRCode;
        }

        // Загружаем через library-loader
        try {
            const { loadQRCode } = await import('../../core/library-loader');
            return await loadQRCode();
        } catch (error) {
            throw new Error('QRCode library not available');
        }
    }

    private async addLogo(canvas: HTMLCanvasElement, logoUrl: string, logoSize: number): Promise<void> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            img.onload = () => {
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Canvas context not available'));
                    return;
                }

                const centerX = canvas.width / 2;
                const centerY = canvas.height / 2;
                const logoX = centerX - logoSize / 2;
                const logoY = centerY - logoSize / 2;

                // Рисуем белый фон для логотипа
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(logoX - 2, logoY - 2, logoSize + 4, logoSize + 4);

                // Рисуем логотип
                ctx.drawImage(img, logoX, logoY, logoSize, logoSize);
                resolve();
            };

            img.onerror = () => {
                reject(new Error('Failed to load logo image'));
            };

            img.src = logoUrl;
        });
    }

    private throttledLog(message: string, level: 'info' | 'error' = 'info'): void {
        if (this.throttleTimer) {
            clearTimeout(this.throttleTimer);
        }

        this.throttleTimer = window.setTimeout(() => {
            if (level === 'error') {
                console.error(`[QR Component] ${message}`);
            } else {
                console.log(`[QR Component] ${message}`);
            }
            this.throttleTimer = null;
        }, 1000); // Throttle до 1 секунды
    }

    updateProps(newProps: Partial<QRProps>): void {
        this.props = { ...this.props, ...newProps };
        if (this.element) {
            this.render();
        }
    }

    // Метод для обновления только текста
    updateText(text: string): void {
        this.props.text = text;
        if (this.element) {
            this.render();
        }
    }

    // Метод для получения QR кода как изображения
    getAsImage(): string | null {
        if (!this.element) return null;
        
        const canvas = this.element.querySelector('#qr-canvas') as HTMLCanvasElement;
        return canvas ? canvas.toDataURL('image/png') : null;
    }
}

// Функция для создания QR компонента
export function createQR(props: QRProps): QR {
    return new QR(props);
}

// Функция для рендера QR компонента в контейнер
export function renderQR(container: HTMLElement, props: QRProps): QR {
    const qr = new QR(props);
    qr.mount(container);
    return qr;
}

// Глобальные типы
declare global {
    interface Window {
        QRCode: any;
    }
}