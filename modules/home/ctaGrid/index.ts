// modules/home/ctaGrid/index.ts
// Модуль CTA Grid для главной страницы

import { Module } from '../../../core/router';
import './ctaGrid.module.css';

export interface CtaItem {
    id: string;
    title: string;
    description: string;
    icon: string;
    link: string;
    color: string;
    external?: boolean;
}

export interface CtaGridProps {
    items?: CtaItem[];
}

export class CtaGridModule implements Module {
    id = 'ctaGrid';
    private element: HTMLElement | null = null;
    private props: CtaGridProps;

    constructor(props: CtaGridProps = {}) {
        this.props = {
            items: [
                {
                    id: 'buy-plex',
                    title: 'Купить PLEX',
                    description: 'Приобретите токены PLEX ONE для участия в экосистеме',
                    icon: '💰',
                    link: '/auth',
                    color: '#e74c3c'
                },
                {
                    id: 'install-app',
                    title: 'Установить приложение',
                    description: 'Скачайте мобильное приложение для удобного доступа',
                    icon: '📱',
                    link: '#',
                    color: '#3498db',
                    external: true
                },
                {
                    id: 'analytics',
                    title: 'График и аналитика',
                    description: 'Изучите динамику цен и торговые показатели',
                    icon: '📈',
                    link: '/analytics',
                    color: '#27ae60'
                },
                {
                    id: 'deposits',
                    title: 'Создать депозит',
                    description: 'Инвестируйте в прибыльные планы депозитов',
                    icon: '🏦',
                    link: '/deposits',
                    color: '#f39c12'
                },
                {
                    id: 'portfolio',
                    title: 'Мой портфель',
                    description: 'Отслеживайте свои инвестиции и доходы',
                    icon: '💼',
                    link: '/portfolio',
                    color: '#9b59b6'
                },
                {
                    id: 'terminal',
                    title: 'Терминал',
                    description: 'Доступ к продвинутым инструментам торговли',
                    icon: '💻',
                    link: '/terminal',
                    color: '#34495e'
                }
            ],
            ...props
        };
    }

    mount(el: HTMLElement, context?: any): void {
        this.element = el;

        el.innerHTML = `
      <section class="cta-grid">
        <div class="cta-grid__container">
          <div class="cta-grid__header">
            <h2 class="cta-grid__title">Быстрый доступ</h2>
            <p class="cta-grid__subtitle">Выберите нужный раздел для начала работы</p>
          </div>
          
          <div class="cta-grid__content">
            ${this.props.items!.map(item => `
              <div class="cta-grid__item" data-item-id="${item.id}">
                <div class="cta-grid__item-icon" style="background: ${item.color}">
                  ${item.icon}
                </div>
                <div class="cta-grid__item-content">
                  <h3 class="cta-grid__item-title">${item.title}</h3>
                  <p class="cta-grid__item-description">${item.description}</p>
                </div>
                <div class="cta-grid__item-arrow">
                  <span>→</span>
                </div>
              </div>
            `).join('')}
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

        // Обработка кликов по элементам
        const items = this.element.querySelectorAll('.cta-grid__item');
        items.forEach(item => {
            item.addEventListener('click', (e) => {
                const target = e.currentTarget as HTMLElement;
                const itemId = target.dataset.itemId;
                const ctaItem = this.props.items!.find(item => item.id === itemId);

                if (ctaItem) {
                    this.handleItemClick(ctaItem);
                }
            });

            // Добавляем hover эффекты
            item.addEventListener('mouseenter', () => {
                item.classList.add('cta-grid__item--hover');
            });

            item.addEventListener('mouseleave', () => {
                item.classList.remove('cta-grid__item--hover');
            });
        });
    }

    private handleItemClick(item: CtaItem): void {
        if (item.external) {
            // Для внешних ссылок открываем в новой вкладке
            window.open(item.link, '_blank');
        } else {
            // Для внутренних ссылок используем навигацию
            if (item.link.startsWith('#')) {
                // Плавная прокрутка к якорю
                const targetElement = document.querySelector(item.link);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            } else {
                // Навигация по маршруту
                window.location.href = item.link;
            }
        }

        // Отправляем аналитическое событие
        this.trackEvent('cta_click', {
            item_id: item.id,
            item_title: item.title,
            link: item.link
        });
    }

    private trackEvent(eventName: string, data: any): void {
        // Здесь можно добавить интеграцию с аналитикой
        console.log(`Event: ${eventName}`, data);

        // Отправляем событие через event bus если доступен
        if (typeof window !== 'undefined' && (window as any).eventBus) {
            (window as any).eventBus.emit('analytics:event', {
                event: eventName,
                data: data,
                timestamp: Date.now()
            });
        }
    }

    // Обновление пропсов
    updateProps(newProps: Partial<CtaGridProps>): void {
        this.props = { ...this.props, ...newProps };
        if (this.element) {
            this.mount(this.element);
        }
    }

    // Добавление нового элемента
    addItem(item: CtaItem): void {
        this.props.items!.push(item);
        if (this.element) {
            this.mount(this.element);
        }
    }

    // Удаление элемента
    removeItem(itemId: string): void {
        const index = this.props.items!.findIndex(item => item.id === itemId);
        if (index !== -1) {
            this.props.items!.splice(index, 1);
            if (this.element) {
                this.mount(this.element);
            }
        }
    }
}

// Экспорт по умолчанию для совместимости с router
export default CtaGridModule;
