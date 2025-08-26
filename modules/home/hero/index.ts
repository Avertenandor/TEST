// modules/home/hero/index.ts
// Модуль Hero для главной страницы

import { Module } from '../../../core/router';
import './hero.module.css';

export interface HeroProps {
    title?: string;
    subtitle?: string;
    description?: string;
    ctaText?: string;
    ctaLink?: string;
}

export class HeroModule implements Module {
    id = 'hero';
    private element: HTMLElement | null = null;
    private props: HeroProps;

    constructor(props: HeroProps = {}) {
        this.props = {
            title: 'GENESIS - Инновационная платформа для заработка',
            subtitle: 'PLEX ONE Token',
            description: 'Присоединяйтесь к революционной платформе, которая изменит ваш подход к инвестициям и заработку в криптовалютном мире.',
            ctaText: 'Начать зарабатывать',
            ctaLink: '/auth',
            ...props
        };
    }

    mount(el: HTMLElement, context?: any): void {
        this.element = el;

        el.innerHTML = `
      <section class="hero">
        <div class="hero__container">
          <div class="hero__content">
            <h1 class="hero__title">${this.props.title}</h1>
            <h2 class="hero__subtitle">${this.props.subtitle}</h2>
            <p class="hero__description">${this.props.description}</p>
            <div class="hero__actions">
              <a href="${this.props.ctaLink}" class="hero__cta" data-route="${this.props.ctaLink}">
                ${this.props.ctaText}
              </a>
              <a href="/how-it-works" class="hero__secondary" data-route="/how-it-works">
                Узнать больше
              </a>
            </div>
          </div>
          <div class="hero__visual">
            <div class="hero__image">
              <div class="hero__logo">🚀</div>
            </div>
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

        // Обработка кликов по CTA кнопкам
        const ctaButtons = this.element.querySelectorAll('[data-route]');
        ctaButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const target = e.target as HTMLElement;
                const route = target.dataset.route;
                if (route) {
                    e.preventDefault();
                    // Используем навигацию через window.location для совместимости
                    window.location.href = route;
                }
            });
        });
    }

    // Обновление пропсов
    updateProps(newProps: Partial<HeroProps>): void {
        this.props = { ...this.props, ...newProps };
        if (this.element) {
            this.mount(this.element);
        }
    }
}

// Экспорт по умолчанию для совместимости с router
export default HeroModule;
