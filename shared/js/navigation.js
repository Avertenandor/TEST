/**
 * Адаптивная навигация GENESIS
 */

class Navigation {
    constructor() {
        this.toggle = document.querySelector('.nav-toggle');
        this.menu = document.querySelector('.nav-menu');
        this.overlay = this.createOverlay();
        this.body = document.body;

        this.init();
    }

    createOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'nav-overlay';
        document.body.appendChild(overlay);
        return overlay;
    }

    init() {
        if (!this.toggle || !this.menu) {
            console.warn('Navigation elements not found');
            return;
        }

        // Клик по бургеру
        this.toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleMenu();
        });

        // Клик по overlay
        this.overlay.addEventListener('click', () => {
            this.closeMenu();
        });

        // Клик по ссылкам меню (закрывать на мобильных)
        const links = this.menu.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth < 768) {
                    this.closeMenu();
                }
            });
        });

        // Закрытие при изменении размера окна
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 768) {
                this.closeMenu();
            }
        });

        // Закрытие по ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.menu.classList.contains('active')) {
                this.closeMenu();
            }
        });

        // Активная ссылка
        this.highlightActiveLink();
        window.addEventListener('hashchange', () => {
            this.highlightActiveLink();
        });
    }

    toggleMenu() {
        const isActive = this.menu.classList.contains('active');

        if (isActive) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }

    openMenu() {
        this.toggle.classList.add('active');
        this.menu.classList.add('active');
        this.overlay.classList.add('active');
        this.body.style.overflow = 'hidden'; // Запретить прокрутку
    }

    closeMenu() {
        this.toggle.classList.remove('active');
        this.menu.classList.remove('active');
        this.overlay.classList.remove('active');
        this.body.style.overflow = ''; // Вернуть прокрутку
    }

    highlightActiveLink() {
        const currentHash = window.location.hash || '#/home';
        const links = this.menu.querySelectorAll('a');

        links.forEach(link => {
            const href = link.getAttribute('href');

            if (href === currentHash) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
}

// Инициализация при загрузке DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.genesisNavigation = new Navigation();
    });
} else {
    window.genesisNavigation = new Navigation();
}

export default Navigation;
