// modules/home/home.module.js
// Модуль главной страницы сайта (Landing/Home) в модульной архитектуре

export default class HomeModule {
    constructor() {
        this.name = 'home';
        this.version = '1.0.0';
        this.dependencies = [];
        this.container = null;
        this.context = null;
    }

    async init(context) {
        this.context = context;
        this.container = context.container;
        try {
            // 1) Стили подключаем раньше, чтобы избежать "мигания" без стилей
            await this.loadStyles();
            // 2) Грузим шаблон (при отсутствии собственного — извлекаем из актуального index.html)
            await this.loadTemplate();
            this.bindInteractions();
            return this;
        } catch (err) {
            console.error('Home module init failed:', err);
            this.container.innerHTML = this.getFallbackHTML();
            return this;
        }
    }

    async loadTemplate() {
        // Пытаемся загрузить отдельный шаблон для Home
        try {
            const resp = await fetch('./modules/home/home.template.html', { cache: 'no-store' });
            if (resp.ok) {
                const html = await resp.text();
                this.container.innerHTML = html;
                return;
            }
        } catch (e) {
            // continue to fallback
        }

        // Fallback: извлечь основное содержимое из index.html (без <head>)
        try {
            const resp = await fetch('/index.html', { cache: 'no-store' });
            if (resp.ok) {
                const html = await resp.text();
                const extracted = this.extractMainFromIndex(html);
                this.container.innerHTML = extracted || this.getFallbackHTML();
                return;
            }
        } catch (e) {
            console.warn('Fallback index.html load failed:', e);
        }

        // Последний резерв
        this.container.innerHTML = this.getFallbackHTML();
    }

    async loadStyles() {
        // Базовые стили модуля
        const ensureLink = (href, dataKey) => {
            if (!document.querySelector(`link[data-module="${dataKey}"]`)) {
                const l = document.createElement('link');
                l.rel = 'stylesheet';
                l.href = href;
                l.dataset.module = dataKey;
                document.head.appendChild(l);
            }
        };

        // 1) Стили лендинга (аутентичный вид)
        ensureLink('./css/styles.css', 'home-styles');
        ensureLink('./css/mobile.css', 'home-mobile');
        ensureLink('./css/pwa-visibility-fix.css', 'home-pwa-fix');

        // 2) Локальные стили модуля (тонкая правка без влияния на другие страницы)
        ensureLink('./modules/home/home.styles.css', 'home-local');

        // 3) Шрифты: preconnect (безопасно, если уже есть — дубликатов не будет)
        if (!document.querySelector('link[data-module="fonts-preconnect-1"]')) {
            const f1 = document.createElement('link');
            f1.rel = 'preconnect';
            f1.href = 'https://fonts.googleapis.com';
            f1.dataset.module = 'fonts-preconnect-1';
            document.head.appendChild(f1);
        }
        if (!document.querySelector('link[data-module="fonts-preconnect-2"]')) {
            const f2 = document.createElement('link');
            f2.rel = 'preconnect';
            f2.href = 'https://fonts.gstatic.com';
            f2.crossOrigin = 'anonymous';
            f2.dataset.module = 'fonts-preconnect-2';
            document.head.appendChild(f2);
        }
    }

    bindInteractions() {
        // Примеры: плавной прокрутки к секциям, клики по CTA
    const cta = this.container.querySelector('[data-action="open-app"]');
        if (cta) {
            cta.addEventListener('click', (e) => {
                e.preventDefault();
                // Перейти в приложение (dashboard)
        if (window.router) window.router.navigate('/dashboard');
            });
        }
    }

    extractMainFromIndex(indexHTML) {
        try {
            // Безопасный парсинг: создаем DOM во временном контейнере
            const tpl = document.createElement('template');
            tpl.innerHTML = indexHTML;
            const doc = tpl.content;

            // Пробуем найти крупные контейнеры контента
            const candidates = [
                // приоритет: актуальная верстка проекта
                '#genesis-app',
                '#main', '#root', 'main', '#content', '.landing', '.page', '.wrapper'
            ];
            for (const sel of candidates) {
                const el = doc.querySelector(sel);
                if (el) return el.innerHTML;
            }

            // Если не нашли, пробуем взять всё тело, исключив скрипты
            const body = doc.querySelector('body');
            if (body) {
                const clone = body.cloneNode(true);
                clone.querySelectorAll('script').forEach(s => s.remove());
                return clone.innerHTML;
            }
        } catch (e) {
            console.warn('extractMainFromIndex failed:', e);
        }
        return '';
    }

    getFallbackHTML() {
        return `
            <section class="home-fallback">
                <div class="container">
                    <h1>GENESIS 1.1</h1>
                    <p>Добро пожаловать на платформу GENESIS. Используйте меню слева для навигации.</p>
                    <button class="btn btn-primary" data-action="open-app">Открыть приложение</button>
                </div>
            </section>
        `;
    }

    destroy() {
        // Очистка слушателей при необходимости
    }
}
