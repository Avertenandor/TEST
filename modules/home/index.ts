// modules/home/index.ts
// Главный модуль Home, объединяющий все подмодули

import { HeroModule } from './hero';
import { TokenInfoModule } from './tokenInfo';
import { CtaGridModule } from './ctaGrid';
import './home.module.css';

export interface HomeProps {
    showHero?: boolean;
    showTokenInfo?: boolean;
    showCtaGrid?: boolean;
    showFaq?: boolean;
    showPartners?: boolean;
    showStats?: boolean;
}

export const module = {
    id: 'home',
    route: '/',
    
    mount(el: HTMLElement, props?: HomeProps): void {
        const homeModule = new HomeModule(props);
        homeModule.mount(el);
        
        // Сохраняем ссылку на модуль для возможности unmount
        (el as any)._homeModule = homeModule;
    },
    
    unmount(el: HTMLElement): void {
        const homeModule = (el as any)._homeModule;
        if (homeModule && typeof homeModule.unmount === 'function') {
            homeModule.unmount();
        }
        (el as any)._homeModule = null;
    },
    
    canActivate(ctx?: any): boolean {
        return true; // Home модуль всегда доступен
    },
    
    init(): void {
        console.log('Home module initialized');
    }
};

export class HomeModule {
    private element: HTMLElement | null = null;
    private props: HomeProps;
    private subModules: Map<string, any> = new Map();

    constructor(props: HomeProps = {}) {
        this.props = {
            showHero: true,
            showTokenInfo: true,
            showCtaGrid: true,
            showFaq: true,
            showPartners: true,
            showStats: true,
            ...props
        };
    }

    mount(el: HTMLElement, context?: any): void {
        this.element = el;

        // Создаем структуру страницы
        el.innerHTML = `
      <div class="home">
        ${this.props.showHero ? '<div id="home-hero" class="home__section"></div>' : ''}
        ${this.props.showTokenInfo ? '<div id="home-token-info" class="home__section"></div>' : ''}
        ${this.props.showCtaGrid ? '<div id="home-cta-grid" class="home__section"></div>' : ''}
        ${this.props.showFaq ? '<div id="home-faq" class="home__section"></div>' : ''}
        ${this.props.showPartners ? '<div id="home-partners" class="home__section"></div>' : ''}
        ${this.props.showStats ? '<div id="home-stats" class="home__section"></div>' : ''}
      </div>
    `;

        // Монтируем подмодули
        this.mountSubModules();
    }

    unmount(): void {
        // Размонтируем все подмодули
        this.subModules.forEach(module => {
            if (module && typeof module.unmount === 'function') {
                module.unmount();
            }
        });
        this.subModules.clear();

        if (this.element) {
            this.element.innerHTML = '';
            this.element = null;
        }
    }

    private mountSubModules(): void {
        if (!this.element) return;

        // Монтируем Hero модуль
        if (this.props.showHero) {
            const heroContainer = this.element.querySelector('#home-hero');
            if (heroContainer) {
                const heroModule = new HeroModule();
                heroModule.mount(heroContainer as HTMLElement);
                this.subModules.set('hero', heroModule);
            }
        }

        // Монтируем TokenInfo модуль
        if (this.props.showTokenInfo) {
            const tokenInfoContainer = this.element.querySelector('#home-token-info');
            if (tokenInfoContainer) {
                const tokenInfoModule = new TokenInfoModule();
                tokenInfoModule.mount(tokenInfoContainer as HTMLElement);
                this.subModules.set('tokenInfo', tokenInfoModule);
            }
        }

        // Монтируем CtaGrid модуль
        if (this.props.showCtaGrid) {
            const ctaGridContainer = this.element.querySelector('#home-cta-grid');
            if (ctaGridContainer) {
                const ctaGridModule = new CtaGridModule();
                ctaGridModule.mount(ctaGridContainer as HTMLElement);
                this.subModules.set('ctaGrid', ctaGridModule);
            }
        }

        // Монтируем FAQ модуль (заглушка)
        if (this.props.showFaq) {
            const faqContainer = this.element.querySelector('#home-faq');
            if (faqContainer) {
                this.mountFaqModule(faqContainer as HTMLElement);
            }
        }

        // Монтируем Partners модуль (заглушка)
        if (this.props.showPartners) {
            const partnersContainer = this.element.querySelector('#home-partners');
            if (partnersContainer) {
                this.mountPartnersModule(partnersContainer as HTMLElement);
            }
        }

        // Монтируем Stats модуль (заглушка)
        if (this.props.showStats) {
            const statsContainer = this.element.querySelector('#home-stats');
            if (statsContainer) {
                this.mountStatsModule(statsContainer as HTMLElement);
            }
        }
    }

    private mountFaqModule(container: HTMLElement): void {
        container.innerHTML = `
      <section class="faq">
        <div class="faq__container">
          <div class="faq__header">
            <h2 class="faq__title">Часто задаваемые вопросы</h2>
            <p class="faq__subtitle">Ответы на популярные вопросы о платформе</p>
          </div>
          <div class="faq__content">
            <div class="faq__item">
              <h3 class="faq__question">Что такое PLEX ONE?</h3>
              <p class="faq__answer">PLEX ONE - это инновационный токен, который является основой экосистемы GENESIS. Он используется для инвестиций, торговли и получения доступа к платформе.</p>
            </div>
            <div class="faq__item">
              <h3 class="faq__question">Как начать инвестировать?</h3>
              <p class="faq__answer">Для начала инвестиций необходимо пройти регистрацию, приобрести токены PLEX и выбрать подходящий план депозита.</p>
            </div>
            <div class="faq__item">
              <h3 class="faq__question">Какие гарантии безопасности?</h3>
              <p class="faq__answer">Платформа использует современные технологии блокчейн и криптографические методы для обеспечения безопасности всех операций.</p>
            </div>
          </div>
        </div>
      </section>
    `;
    }

    private mountPartnersModule(container: HTMLElement): void {
        container.innerHTML = `
      <section class="partners">
        <div class="partners__container">
          <div class="partners__header">
            <h2 class="partners__title">Наши партнеры</h2>
            <p class="partners__subtitle">Доверяют нам тысячи пользователей по всему миру</p>
          </div>
          <div class="partners__content">
            <div class="partners__item">
              <div class="partners__logo">🏦</div>
              <h3 class="partners__name">Финансовые институты</h3>
            </div>
            <div class="partners__item">
              <div class="partners__logo">🔒</div>
              <h3 class="partners__name">Безопасность</h3>
            </div>
            <div class="partners__item">
              <div class="partners__logo">🌐</div>
              <h3 class="partners__name">Глобальная сеть</h3>
            </div>
          </div>
        </div>
      </section>
    `;
    }

    private mountStatsModule(container: HTMLElement): void {
        container.innerHTML = `
      <section class="stats">
        <div class="stats__container">
          <div class="stats__header">
            <h2 class="stats__title">Статистика платформы</h2>
            <p class="stats__subtitle">Цифры говорят сами за себя</p>
          </div>
          <div class="stats__content">
            <div class="stats__item">
              <div class="stats__number">10,000+</div>
              <div class="stats__label">Активных пользователей</div>
            </div>
            <div class="stats__item">
              <div class="stats__number">$5M+</div>
              <div class="stats__label">Общий объем инвестиций</div>
            </div>
            <div class="stats__item">
              <div class="stats__number">99.9%</div>
              <div class="stats__label">Время работы серверов</div>
            </div>
            <div class="stats__item">
              <div class="stats__number">24/7</div>
              <div class="stats__label">Поддержка клиентов</div>
            </div>
          </div>
        </div>
      </section>
    `;
    }

    // Обновление пропсов
    updateProps(newProps: Partial<HomeProps>): void {
        this.props = { ...this.props, ...newProps };
        if (this.element) {
            this.mount(this.element);
        }
    }

    // Получение подмодуля
    getSubModule(name: string): any {
        return this.subModules.get(name);
    }

    // Обновление подмодуля
    updateSubModule(name: string, newProps: any): void {
        const module = this.subModules.get(name);
        if (module && typeof module.updateProps === 'function') {
            module.updateProps(newProps);
        }
    }
}

// Экспорт по умолчанию для совместимости
export default module;