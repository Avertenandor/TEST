/**
 * GENESIS 1.1 - Enhanced Interactions
 * Интерактивные 3D эффекты и улучшения UX
 *
 * Особенности:
 * - Паралакс эффекты при движении мыши
 * - 3D наклон карточек
 * - Магнитные кнопки
 * - Частицы и конфетти
 * - Плавные переходы
 */

(function() {
    'use strict';

    // ========================================
    // 1. ИНИЦИАЛИЗАЦИЯ
    // ========================================

    const EnhancedInteractions = {
        init() {
            this.setupParallax();
            this.setup3DCards();
            this.setupMagneticButtons();
            this.setupSmoothScroll();
            this.setupIntersectionObserver();
            this.setupParticleEffects();
            this.setupBuyButtonEffects();
            this.setupCursorEffects();
            console.log('✨ Enhanced Interactions initialized');
        }
    };

    // ========================================
    // 2. ПАРАЛАКС ЭФФЕКТ ПРИ ДВИЖЕНИИ МЫШИ
    // ========================================

    EnhancedInteractions.setupParallax = function() {
        const parallaxElements = document.querySelectorAll('[data-parallax]');

        if (parallaxElements.length === 0 || window.innerWidth < 768) return;

        document.addEventListener('mousemove', (e) => {
            const mouseX = e.clientX / window.innerWidth;
            const mouseY = e.clientY / window.innerHeight;

            parallaxElements.forEach((el) => {
                const speed = el.dataset.parallax || 10;
                const x = (mouseX - 0.5) * speed;
                const y = (mouseY - 0.5) * speed;

                el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
            });
        });
    };

    // ========================================
    // 3. 3D НАКЛОН КАРТОЧЕК
    // ========================================

    EnhancedInteractions.setup3DCards = function() {
        const cards = document.querySelectorAll('.token-info__card, .genesis-info-card, .unified-card');

        if (cards.length === 0 || window.innerWidth < 768) return;

        cards.forEach((card) => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = (y - centerY) / 10;
                const rotateY = (centerX - x) / 10;

                card.style.transform = `
                    perspective(1000px)
                    rotateX(${rotateX}deg)
                    rotateY(${rotateY}deg)
                    translateZ(10px)
                `;

                // Добавляем световой эффект
                const lightX = (x / rect.width) * 100;
                const lightY = (y / rect.height) * 100;
                card.style.background = `
                    radial-gradient(
                        circle at ${lightX}% ${lightY}%,
                        rgba(78, 205, 196, 0.1),
                        transparent 50%
                    ),
                    var(--bg-elevated)
                `;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
                card.style.background = '';
                card.style.transition = 'all 0.5s ease';

                setTimeout(() => {
                    card.style.transition = '';
                }, 500);
            });
        });
    };

    // ========================================
    // 4. МАГНИТНЫЕ КНОПКИ
    // ========================================

    EnhancedInteractions.setupMagneticButtons = function() {
        const magneticButtons = document.querySelectorAll('.btn-magnetic, .genesis-btn-neon, .genesis-btn-large');

        if (magneticButtons.length === 0 || window.innerWidth < 768) return;

        magneticButtons.forEach((button) => {
            button.addEventListener('mousemove', (e) => {
                const rect = button.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;

                const distance = Math.sqrt(x * x + y * y);
                const maxDistance = 50;

                if (distance < maxDistance) {
                    const strength = (maxDistance - distance) / maxDistance;
                    const moveX = x * strength * 0.3;
                    const moveY = y * strength * 0.3;

                    button.style.transform = `translate(${moveX}px, ${moveY}px)`;
                }
            });

            button.addEventListener('mouseleave', () => {
                button.style.transform = 'translate(0, 0)';
                button.style.transition = 'transform 0.3s ease';

                setTimeout(() => {
                    button.style.transition = '';
                }, 300);
            });
        });
    };

    // ========================================
    // 5. ПЛАВНЫЙ СКРОЛЛ
    // ========================================

    EnhancedInteractions.setupSmoothScroll = function() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href === '#') return;

                e.preventDefault();
                const target = document.querySelector(href);

                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    };

    // ========================================
    // 6. INTERSECTION OBSERVER ДЛЯ АНИМАЦИЙ
    // ========================================

    EnhancedInteractions.setupIntersectionObserver = function() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');

                    // Добавляем анимацию в зависимости от data-атрибута
                    const animationType = entry.target.dataset.animate || 'fadeInUp';
                    entry.target.style.animation = `${animationType} 0.8s ease-out forwards`;

                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Наблюдаем за всеми элементами с data-animate
        document.querySelectorAll('[data-animate]').forEach((el) => {
            el.style.opacity = '0';
            observer.observe(el);
        });

        // Также наблюдаем за карточками и секциями
        document.querySelectorAll('.token-info__card, .genesis-info-card, .unified-card, .genesis-section').forEach((el) => {
            if (!el.dataset.animate) {
                el.dataset.animate = 'fadeInUp';
                el.style.opacity = '0';
                observer.observe(el);
            }
        });
    };

    // ========================================
    // 7. ЭФФЕКТЫ ЧАСТИЦ
    // ========================================

    EnhancedInteractions.setupParticleEffects = function() {
        // Создаем частицы при клике на кнопки
        document.addEventListener('click', (e) => {
            const target = e.target.closest('button, .btn, .genesis-btn');
            if (!target) return;

            this.createParticles(e.clientX, e.clientY);
        });
    };

    EnhancedInteractions.createParticles = function(x, y, count = 8) {
        const colors = ['#4ecdc4', '#ff6b6b', '#ffd700', '#54a0ff'];

        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.cssText = `
                position: fixed;
                left: ${x}px;
                top: ${y}px;
                width: 6px;
                height: 6px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                border-radius: 50%;
                pointer-events: none;
                z-index: 9999;
                box-shadow: 0 0 10px currentColor;
            `;

            document.body.appendChild(particle);

            const angle = (Math.PI * 2 * i) / count;
            const velocity = 50 + Math.random() * 50;
            const moveX = Math.cos(angle) * velocity;
            const moveY = Math.sin(angle) * velocity;

            particle.style.setProperty('--particle-x', moveX);
            particle.style.setProperty('--particle-y', moveY);

            // Анимация
            particle.animate([
                { transform: 'translate(0, 0) scale(1)', opacity: 1 },
                { transform: `translate(${moveX}px, ${moveY}px) scale(0)`, opacity: 0 }
            ], {
                duration: 800,
                easing: 'cubic-bezier(0, 0.5, 0.5, 1)'
            }).onfinish = () => particle.remove();
        }
    };

    // ========================================
    // 8. УЛУЧШЕНИЯ КНОПКИ "КУПИТЬ PLEX"
    // ========================================

    EnhancedInteractions.setupBuyButtonEffects = function() {
        const buyButtons = document.querySelectorAll('#buy-token-btn, #buy-plex-btn, .genesis-btn-buy, .btn-buy-plex');

        buyButtons.forEach((button) => {
            // Добавляем пульсацию
            button.style.animation = 'pulseBorder 2s ease-in-out infinite';

            // Конфетти при клике
            button.addEventListener('click', (e) => {
                if (e.target.closest('button')) {
                    this.createConfetti();
                }
            });

            // Добавляем ripple эффект
            button.addEventListener('click', function(e) {
                const ripple = document.createElement('span');
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;

                ripple.style.cssText = `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    left: ${x}px;
                    top: ${y}px;
                    background: rgba(255, 255, 255, 0.5);
                    border-radius: 50%;
                    transform: scale(0);
                    pointer-events: none;
                `;

                this.appendChild(ripple);

                ripple.animate([
                    { transform: 'scale(0)', opacity: 1 },
                    { transform: 'scale(2)', opacity: 0 }
                ], {
                    duration: 600,
                    easing: 'ease-out'
                }).onfinish = () => ripple.remove();
            });
        });
    };

    // ========================================
    // 9. КОНФЕТТИ ЭФФЕКТ
    // ========================================

    EnhancedInteractions.createConfetti = function() {
        const colors = ['#4ecdc4', '#ff6b6b', '#ffd700', '#54a0ff', '#ff9ff3', '#feca57'];
        const confettiCount = 50;

        for (let i = 0; i < confettiCount; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.cssText = `
                    position: fixed;
                    top: -10px;
                    left: ${Math.random() * 100}vw;
                    width: ${5 + Math.random() * 10}px;
                    height: ${5 + Math.random() * 10}px;
                    background: ${colors[Math.floor(Math.random() * colors.length)]};
                    pointer-events: none;
                    z-index: 9999;
                    opacity: ${0.7 + Math.random() * 0.3};
                    border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
                `;

                document.body.appendChild(confetti);

                const fallDuration = 2000 + Math.random() * 2000;
                const xMovement = -50 + Math.random() * 100;

                confetti.animate([
                    {
                        transform: 'translateY(0) translateX(0) rotate(0deg)',
                        opacity: 1
                    },
                    {
                        transform: `translateY(100vh) translateX(${xMovement}px) rotate(${360 * (Math.random() > 0.5 ? 1 : -1)}deg)`,
                        opacity: 0
                    }
                ], {
                    duration: fallDuration,
                    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                }).onfinish = () => confetti.remove();
            }, i * 30);
        }
    };

    // ========================================
    // 10. КАСТОМНЫЙ КУРСОР
    // ========================================

    EnhancedInteractions.setupCursorEffects = function() {
        // Только для desktop
        if (window.innerWidth < 1024) return;

        const cursor = document.createElement('div');
        const cursorFollower = document.createElement('div');

        cursor.className = 'custom-cursor';
        cursorFollower.className = 'custom-cursor-follower';

        cursor.style.cssText = `
            position: fixed;
            width: 10px;
            height: 10px;
            background: var(--accent-primary);
            border-radius: 50%;
            pointer-events: none;
            z-index: 10000;
            mix-blend-mode: difference;
            transition: transform 0.1s ease;
        `;

        cursorFollower.style.cssText = `
            position: fixed;
            width: 40px;
            height: 40px;
            border: 2px solid var(--accent-primary);
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            opacity: 0.5;
            transition: all 0.3s ease;
        `;

        document.body.appendChild(cursor);
        document.body.appendChild(cursorFollower);

        let mouseX = 0, mouseY = 0;
        let followerX = 0, followerY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursor.style.left = mouseX + 'px';
            cursor.style.top = mouseY + 'px';
        });

        // Плавное следование
        function updateFollower() {
            followerX += (mouseX - followerX) * 0.1;
            followerY += (mouseY - followerY) * 0.1;
            cursorFollower.style.left = followerX + 'px';
            cursorFollower.style.top = followerY + 'px';
            requestAnimationFrame(updateFollower);
        }
        updateFollower();

        // Изменение при наведении на интерактивные элементы
        document.querySelectorAll('a, button, .btn, input, textarea').forEach((el) => {
            el.addEventListener('mouseenter', () => {
                cursor.style.transform = 'scale(1.5)';
                cursorFollower.style.transform = 'scale(1.5)';
            });
            el.addEventListener('mouseleave', () => {
                cursor.style.transform = 'scale(1)';
                cursorFollower.style.transform = 'scale(1)';
            });
        });
    };

    // ========================================
    // 11. ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ
    // ========================================

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            EnhancedInteractions.init();
        });
    } else {
        EnhancedInteractions.init();
    }

    // Экспортируем для глобального доступа
    window.EnhancedInteractions = EnhancedInteractions;

})();
