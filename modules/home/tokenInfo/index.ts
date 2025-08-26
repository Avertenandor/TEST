// modules/home/tokenInfo/index.ts
// Модуль TokenInfo для отображения информации о PLEX токене

import { Module } from '../../../core/router';
import { config } from '../../../shared/config';
import './tokenInfo.module.css';

export interface TokenInfoProps {
    showDetails?: boolean;
    showPrice?: boolean;
}

export class TokenInfoModule implements Module {
    id = 'tokenInfo';
    private element: HTMLElement | null = null;
    private props: TokenInfoProps;

    constructor(props: TokenInfoProps = {}) {
        this.props = {
            showDetails: true,
            showPrice: true,
            ...props
        };
    }

    mount(el: HTMLElement, context?: any): void {
        this.element = el;

        el.innerHTML = `
      <section class="token-info">
        <div class="token-info__container">
          <div class="token-info__header">
            <h2 class="token-info__title">PLEX ONE Token</h2>
            <div class="token-info__logo">🪙</div>
          </div>
          
          <div class="token-info__content">
            <div class="token-info__card">
              <div class="token-info__label">Контракт</div>
              <div class="token-info__value token-info__address">
                <span class="token-info__address-text">${config.addresses.plex}</span>
                <button class="token-info__copy-btn" data-address="${config.addresses.plex}">
                  📋
                </button>
              </div>
            </div>
            
            <div class="token-info__card">
              <div class="token-info__label">Decimals</div>
              <div class="token-info__value">18</div>
            </div>
            
            <div class="token-info__card">
              <div class="token-info__label">Сеть</div>
              <div class="token-info__value">${config.network.name} (Chain ID: ${config.network.chainId})</div>
            </div>
            
            ${this.props.showPrice ? `
              <div class="token-info__card">
                <div class="token-info__label">Текущая цена</div>
                <div class="token-info__value token-info__price">
                  <span class="token-info__price-amount">$0.05</span>
                  <span class="token-info__price-change token-info__price-change--positive">+2.5%</span>
                </div>
              </div>
            ` : ''}
            
            ${this.props.showDetails ? `
              <div class="token-info__card">
                <div class="token-info__label">Общий supply</div>
                <div class="token-info__value">1,000,000,000 PLEX</div>
              </div>
              
              <div class="token-info__card">
                <div class="token-info__label">Циркулирующий supply</div>
                <div class="token-info__value">750,000,000 PLEX</div>
              </div>
            ` : ''}
          </div>
          
          <div class="token-info__actions">
            <a href="/plex-coin" class="token-info__btn" data-route="/plex-coin">
              Подробнее о токене
            </a>
            <a href="/analytics" class="token-info__btn token-info__btn--secondary" data-route="/analytics">
              Графики и аналитика
            </a>
          </div>
        </div>
      </section>
    `;

        this.bindEvents();
    }

    unmount(): void {
        if (this.element) {
            this.element.innerHTML = '';
            this.element = null;
        }
    }

    private bindEvents(): void {
        if (!this.element) return;

        // Обработка копирования адреса
        const copyButtons = this.element.querySelectorAll('.token-info__copy-btn');
        copyButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const target = e.target as HTMLElement;
                const address = target.dataset.address;
                if (address) {
                    this.copyToClipboard(address);
                    this.showCopyNotification();
                }
            });
        });

        // Обработка навигации
        const navButtons = this.element.querySelectorAll('[data-route]');
        navButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const target = e.target as HTMLElement;
                const route = target.dataset.route;
                if (route) {
                    e.preventDefault();
                    window.location.href = route;
                }
            });
        });
    }

    private async copyToClipboard(text: string): Promise<void> {
        try {
            await navigator.clipboard.writeText(text);
            console.log('Address copied to clipboard');
        } catch (error) {
            console.error('Failed to copy address:', error);
            // Fallback для старых браузеров
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        }
    }

    private showCopyNotification(): void {
        // Создаем уведомление о копировании
        const notification = document.createElement('div');
        notification.className = 'token-info__notification';
        notification.textContent = 'Адрес скопирован!';

        if (this.element) {
            this.element.appendChild(notification);

            // Удаляем уведомление через 2 секунды
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 2000);
        }
    }

    // Обновление пропсов
    updateProps(newProps: Partial<TokenInfoProps>): void {
        this.props = { ...this.props, ...newProps };
        if (this.element) {
            this.mount(this.element);
        }
    }
}

// Экспорт по умолчанию для совместимости с router
export default TokenInfoModule;
