# Детальный анализ проблем адаптивности GENESIS Platform

**Дата анализа**: 29 октября 2025
**Версия проекта**: GENESIS 1.4.2
**Анализируемая ветка**: `claude/analyze-responsive-issues-011CUbrPLdr2KWET4f67UP8d`

---

## Исполнительное резюме

Проект GENESIS имеет **хорошую базовую архитектуру адаптивности**, но есть несколько критических и некритических проблем, которые необходимо исправить для улучшения пользовательского опыта на мобильных устройствах.

### Оценка текущего состояния

| Категория | Оценка | Комментарий |
|-----------|--------|-------------|
| **Viewport и Meta-теги** | ✅ 9/10 | Правильно настроены |
| **CSS Breakpoints система** | ✅ 8/10 | Централизованная система есть |
| **Модули адаптивности** | ⚠️ 6/10 | Не все модули адаптивны |
| **Навигация мобильная** | ✅ 8/10 | Бургер-меню реализовано |
| **PWA адаптивность** | ✅ 9/10 | Отличная настройка |
| **Touch интерфейсы** | ⚠️ 5/10 | Требуется улучшение |

**Общая оценка: 7.5/10** - Хорошо, но требуются улучшения.

---

## 1. ✅ Что уже работает хорошо

### 1.1 Viewport и Meta-теги

**index.html:69**
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
```

**app.html:13**
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

✅ **Хорошо**: Viewport теги присутствуют и правильно настроены.

### 1.2 Централизованная система CSS переменных

**shared/styles/variables.css:106-136**
```css
/* Breakpoints */
--breakpoint-xs: 480px;
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
--breakpoint-2xl: 1536px;

/* Container Sizes */
--container-max-width: 1200px;
--container-max-width-wide: 1400px;
--container-max-width-narrow: 800px;

/* Container Padding */
--container-padding: 0 2rem;
--container-padding-tablet: 0 1.5rem;
--container-padding-mobile: 0 1rem;
--container-padding-small-mobile: 0 0.75rem;
```

✅ **Отлично**: Централизованная система переменных для адаптивности.

### 1.3 Адаптивная Layout система

**shared/styles/layout.css** содержит полноценную систему с media queries для:
- Mobile (до 480px)
- Tablet (768px - 1024px)
- Desktop (1200px+)
- Large screens (1920px+)
- Ultra-large (2560px+)

### 1.4 PWA Manifest

**assets/manifest.json** отлично настроен с:
- ✅ Множество размеров иконок (16x16 до 512x512)
- ✅ `orientation: "portrait"` для мобильных
- ✅ Screenshots для desktop и mobile
- ✅ Shortcuts для быстрого доступа

### 1.5 Мобильное меню в Header

**modules/header/style.css:243-336** содержит:
- ✅ Бургер-меню для мобильных
- ✅ Анимации открытия/закрытия
- ✅ Media queries @media (max-width: 768px)

---

## 2. ⚠️ Критические проблемы, требующие исправления

### 2.1 **Dashboard Sidebar - фиксированная ширина**

**Проблема**: `modules/dashboard/dashboard.styles-part-00.css:13-24`

```css
.dashboard-sidebar {
    width: 260px;  /* ❌ ФИКСИРОВАННАЯ ШИРИНА */
    position: fixed;
    height: 100vh;
}

.dashboard-main {
    margin-left: 260px;  /* ❌ ФИКСИРОВАННЫЙ ОТСТУП */
}
```

**Последствия**:
- На планшетах sidebar занимает слишком много места
- На мобильных полностью закрывает контент
- Нет плавного перехода между размерами

**Решение**:
```css
/* Desktop - нормальная ширина */
.dashboard-sidebar {
    width: var(--sidebar-width, 280px);
    position: fixed;
    height: 100vh;
    transition: transform 0.3s ease;
}

.dashboard-main {
    margin-left: var(--sidebar-width, 280px);
    transition: margin-left 0.3s ease;
}

/* Tablet - уменьшенный sidebar */
@media (max-width: 1024px) and (min-width: 769px) {
    .dashboard-sidebar {
        width: var(--sidebar-width-tablet, 220px);
    }

    .dashboard-main {
        margin-left: var(--sidebar-width-tablet, 220px);
    }
}

/* Mobile - overlay sidebar */
@media (max-width: 768px) {
    .dashboard-sidebar {
        transform: translateX(-100%);
        z-index: var(--z-modal, 500);
    }

    .dashboard-sidebar.active {
        transform: translateX(0);
    }

    .dashboard-main {
        margin-left: 0;
        padding: 1rem;
    }
}
```

### 2.2 **Deposits Grid - минимальная ширина слишком большая**

**Проблема**: `modules/deposits/deposits.styles-part-00.css:149-154`

```css
.deposit-plans-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));  /* ❌ 300px минимум */
    gap: 2rem;
}
```

**Последствия**:
- На мобильных устройствах с шириной < 375px карточки вылезают за края
- Горизонтальный скролл на малых экранах

**Решение**:
```css
.deposit-plans-grid {
    display: grid;
    gap: 1.5rem;

    /* Mobile - 1 колонка */
    grid-template-columns: 1fr;
}

/* Tablet - 2 колонки */
@media (min-width: 768px) {
    .deposit-plans-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

/* Desktop - 3 колонки */
@media (min-width: 1024px) {
    .deposit-plans-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}

/* Large Desktop - 4 колонки */
@media (min-width: 1400px) {
    .deposit-plans-grid {
        grid-template-columns: repeat(4, 1fr);
    }
}
```

### 2.3 **Stats Grid - проблема с auto-fit**

**Проблема**: `modules/dashboard/dashboard.styles-part-00.css:221-225`

```css
.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));  /* ❌ */
    gap: 1.5rem;
}
```

**Последствия**:
- На маленьких экранах (< 320px) карточки сжимаются непредсказуемо
- На средних экранах может быть некрасивое распределение

**Решение** (тот же подход что и для deposits):
```css
.stats-grid {
    display: grid;
    gap: 1rem;
    grid-template-columns: 1fr;
}

@media (min-width: 576px) {
    .stats-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (min-width: 1024px) {
    .stats-grid {
        grid-template-columns: repeat(4, 1fr);
    }
}
```

### 2.4 **Touch targets - размер кнопок**

**Проблема**: Многие кнопки не соответствуют минимальному размеру 44x44px для touch интерфейсов.

**Пример**: `modules/dashboard/dashboard.styles-part-00.css:187-199`

```css
.btn-icon {
    width: 40px;   /* ❌ МЕНЬШЕ 44px */
    height: 40px;
}
```

**Решение**:
```css
.btn-icon,
.terminal-btn,
.action-button {
    min-width: 44px;
    min-height: 44px;
    /* ... */
}
```

---

## 3. ⚠️ Некритические проблемы

### 3.1 **Типографика - нет fluid sizing**

**Проблема**: Размеры шрифтов фиксированные, что может быть неоптимально на разных экранах.

**Текущее состояние**: `shared/styles/variables.css:87-94`
```css
--font-size-xs: 0.75rem;
--font-size-sm: 0.875rem;
--font-size-base: 1rem;
--font-size-lg: 1.125rem;
--font-size-xl: 1.25rem;
--font-size-2xl: 1.5rem;
--font-size-3xl: 2rem;
--font-size-4xl: 2.5rem;
```

**Рекомендуемое улучшение**:
```css
/* Используем clamp() для адаптивных размеров */
--font-size-xs: clamp(0.7rem, 1.5vw, 0.75rem);
--font-size-sm: clamp(0.8rem, 1.8vw, 0.875rem);
--font-size-base: clamp(0.875rem, 2vw, 1rem);
--font-size-lg: clamp(1rem, 2.2vw, 1.125rem);
--font-size-xl: clamp(1.1rem, 2.5vw, 1.25rem);
--font-size-2xl: clamp(1.25rem, 3vw, 1.5rem);
--font-size-3xl: clamp(1.5rem, 4vw, 2rem);
--font-size-4xl: clamp(2rem, 5vw, 2.5rem);
```

### 3.2 **History list в Deposits - сложная grid для мобильных**

**Проблема**: `modules/deposits/deposits.styles-part-00.css:421-426`

```css
.history-item {
    display: grid;
    grid-template-columns: auto 1fr auto auto auto;  /* ❌ 5 колонок */
}
```

**Последствия**: На мобильных все данные сжаты и нечитаемы.

**Решение**: Превратить в карточки на мобильных:
```css
/* Desktop - таблица */
@media (min-width: 768px) {
    .history-item {
        display: grid;
        grid-template-columns: auto 1fr auto auto auto;
    }
}

/* Mobile - карточка */
@media (max-width: 767px) {
    .history-item {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding: 1rem;
        background: rgba(26, 26, 46, 0.9);
        border-radius: 8px;
    }

    .history-item > * {
        display: flex;
        justify-content: space-between;
    }

    .history-item > *::before {
        content: attr(data-label);
        font-weight: bold;
        color: var(--text-secondary);
    }
}
```

### 3.3 **Модальные окна - фиксированная ширина**

**Проблема**: `modules/deposits/deposits.styles-part-01.css:33-34`

```css
.modal-content {
    max-width: 600px;
    width: 90%;
}
```

**На очень маленьких экранах**: 90% может быть все еще слишком широко для комфортного чтения.

**Решение**:
```css
.modal-content {
    max-width: 600px;
    width: min(90%, calc(100vw - 2rem));
    max-height: 90vh;
    overflow-y: auto;
}

@media (max-width: 480px) {
    .modal-content {
        width: calc(100vw - 1rem);
        max-width: 100%;
    }
}
```

### 3.4 **Terminal компонент - отсутствие полноэкранного режима на мобильных**

**Текущее состояние**: `css/mobile-part-00.css:298-323` имеет базовую поддержку, но:
- Нет плавного перехода в fullscreen
- Нет кнопки для входа/выхода из fullscreen режима

**Рекомендация**: Добавить JavaScript логику для fullscreen API.

---

## 4. 📊 Анализ Media Queries по файлам

### Модули с хорошей адаптивностью:

| Модуль | Файл | Media Queries | Оценка |
|--------|------|---------------|--------|
| **Layout** | shared/styles/layout.css | ✅ 5 breakpoints | 10/10 |
| **Header** | modules/header/style.css | ✅ 2 breakpoints | 9/10 |
| **Dashboard** | dashboard.styles-part-01.css | ✅ 2 breakpoints | 7/10 |
| **Deposits** | deposits.styles-part-01.css | ✅ 1 breakpoint | 7/10 |
| **Mobile** | css/mobile-part-00.css | ✅ 2 breakpoints | 8/10 |

### Модули без media queries (требуют внимания):

❌ **modules/analytics/** - не проверен
❌ **modules/portfolio/** - не проверен
❌ **modules/transactions/** - не проверен
❌ **modules/bonuses/** - не проверен
❌ **modules/gifts/** - не проверен
❌ **modules/referrals/** - не проверен

**Рекомендация**: Провести аудит всех оставшихся модулей.

---

## 5. 🎯 Приоритетный план исправлений

### Приоритет 1: КРИТИЧНО (1-2 дня)

1. **Исправить Dashboard Sidebar**
   - Файл: `modules/dashboard/dashboard.styles-part-00.css`
   - Добавить overlay режим для мобильных
   - Оценка сложности: 2 часа

2. **Исправить Deposits Grid**
   - Файл: `modules/deposits/deposits.styles-part-00.css`
   - Изменить minmax на мобильную сетку
   - Оценка сложности: 1 час

3. **Увеличить Touch targets**
   - Файлы: все модули
   - Минимум 44x44px для всех кнопок
   - Оценка сложности: 3 часа

### Приоритет 2: ВАЖНО (3-5 дней)

4. **Адаптивная типографика с clamp()**
   - Файл: `shared/styles/variables.css`
   - Оценка сложности: 2 часа

5. **History list карточки**
   - Файл: `modules/deposits/deposits.styles-part-00.css`
   - Оценка сложности: 2 часа

6. **Аудит остальных модулей**
   - analytics, portfolio, transactions, etc.
   - Оценка сложности: 1 день

### Приоритет 3: ЖЕЛАТЕЛЬНО (1 неделя)

7. **Swipe навигация**
   - Добавить gesture support для sidebar
   - Оценка сложности: 4 часа

8. **Fullscreen Terminal API**
   - Файл: `shared/components/terminal/`
   - Оценка сложности: 3 часа

9. **Performance оптимизация**
   - Lazy loading для модулей на медленных сетях
   - Оценка сложности: 1 день

---

## 6. 🧪 Рекомендации по тестированию

### 6.1 Тестовые устройства

**Обязательно протестировать на**:
- iPhone SE (375x667) - минимальный размер iOS
- iPhone 14 Pro (393x852)
- Samsung Galaxy S21 (360x800)
- iPad Mini (768x1024)
- iPad Pro (1024x1366)
- Desktop (1920x1080)

### 6.2 Инструменты

```bash
# Lighthouse для PWA
npm install -g lighthouse
lighthouse https://genesis-one.io --view

# Responsive тесты
npm install -g responsive-cli
responsive -u https://genesis-one.io

# Visual regression (рекомендуется)
npm install -g backstopjs
```

### 6.3 Чек-лист проверки

Для каждого устройства проверить:
- [ ] Viewport корректно настроен (нет zoom)
- [ ] Нет горизонтального скролла
- [ ] Все кнопки >= 44x44px
- [ ] Тексты читаемы (font-size >= 14px)
- [ ] Модальные окна не вылезают за края
- [ ] Sidebar/меню работает корректно
- [ ] Touch gestures работают (swipe, tap)
- [ ] PWA корректно устанавливается

---

## 7. 📝 Code Examples - готовые исправления

### 7.1 Улучшенный Dashboard Sidebar

Создать новый файл: `modules/dashboard/dashboard.responsive.css`

```css
/* ===============================================
   DASHBOARD RESPONSIVE IMPROVEMENTS
   =============================================== */

/* Desktop (по умолчанию) */
.dashboard-sidebar {
    width: var(--sidebar-width, 280px);
    background: rgba(26, 26, 46, 0.95);
    border-right: 1px solid rgba(255, 107, 53, 0.1);
    position: fixed;
    height: 100vh;
    z-index: 100;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow-y: auto;
}

.dashboard-main {
    margin-left: var(--sidebar-width, 280px);
    padding: 2rem;
    transition: margin-left 0.3s ease;
}

/* Tablet (1024px и меньше) */
@media (max-width: 1024px) and (min-width: 769px) {
    .dashboard-sidebar {
        width: var(--sidebar-width-tablet, 240px);
    }

    .dashboard-main {
        margin-left: var(--sidebar-width-tablet, 240px);
        padding: 1.5rem;
    }
}

/* Mobile (768px и меньше) */
@media (max-width: 768px) {
    .dashboard-sidebar {
        /* Sidebar становится overlay */
        transform: translateX(-100%);
        width: min(80vw, 300px);
        z-index: var(--z-modal, 500);
        box-shadow: 2px 0 10px rgba(0, 0, 0, 0.3);
    }

    .dashboard-sidebar.active {
        transform: translateX(0);
    }

    /* Backdrop для overlay */
    .dashboard-sidebar.active::before {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: -1;
        animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }

    .dashboard-main {
        margin-left: 0;
        padding: 1rem;
    }

    /* Мобильный header с кнопкой меню */
    .mobile-dashboard-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        background: rgba(26, 26, 46, 0.95);
        position: sticky;
        top: 0;
        z-index: 90;
    }

    .mobile-menu-toggle {
        display: flex;
        flex-direction: column;
        gap: 4px;
        cursor: pointer;
        padding: 8px;
        background: rgba(255, 107, 53, 0.1);
        border-radius: 8px;
    }

    .mobile-menu-toggle span {
        width: 25px;
        height: 3px;
        background: #ff6b35;
        border-radius: 2px;
        transition: all 0.3s ease;
    }

    .mobile-menu-toggle.active span:nth-child(1) {
        transform: rotate(45deg) translate(6px, 6px);
    }

    .mobile-menu-toggle.active span:nth-child(2) {
        opacity: 0;
    }

    .mobile-menu-toggle.active span:nth-child(3) {
        transform: rotate(-45deg) translate(6px, -6px);
    }
}

/* Small Mobile (480px и меньше) */
@media (max-width: 480px) {
    .dashboard-main {
        padding: 0.75rem;
    }

    .dashboard-sidebar {
        width: 85vw;
    }
}
```

### 7.2 JavaScript для Sidebar toggle

Создать: `modules/dashboard/dashboard.mobile.js`

```javascript
/**
 * Dashboard Mobile Navigation Handler
 */
class DashboardMobileNav {
    constructor() {
        this.sidebar = document.querySelector('.dashboard-sidebar');
        this.toggle = document.querySelector('.mobile-menu-toggle');
        this.main = document.querySelector('.dashboard-main');

        if (!this.sidebar || !this.toggle) {
            console.warn('Dashboard mobile nav elements not found');
            return;
        }

        this.init();
    }

    init() {
        // Toggle button click
        this.toggle.addEventListener('click', () => this.toggleSidebar());

        // Close on backdrop click
        this.sidebar.addEventListener('click', (e) => {
            if (e.target === this.sidebar && this.sidebar.classList.contains('active')) {
                this.closeSidebar();
            }
        });

        // Close on navigation link click (mobile)
        if (window.innerWidth <= 768) {
            const navLinks = this.sidebar.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                link.addEventListener('click', () => this.closeSidebar());
            });
        }

        // Handle window resize
        window.addEventListener('resize', () => this.handleResize());

        // Swipe gesture support
        this.initSwipeGestures();
    }

    toggleSidebar() {
        const isActive = this.sidebar.classList.toggle('active');
        this.toggle.classList.toggle('active');

        // Prevent body scroll when sidebar is open
        document.body.style.overflow = isActive ? 'hidden' : '';
    }

    closeSidebar() {
        this.sidebar.classList.remove('active');
        this.toggle.classList.remove('active');
        document.body.style.overflow = '';
    }

    handleResize() {
        // Auto-close sidebar on desktop
        if (window.innerWidth > 768) {
            this.closeSidebar();
        }
    }

    initSwipeGestures() {
        let startX = 0;
        let currentX = 0;
        let isDragging = false;

        // Swipe to open (from left edge)
        this.main.addEventListener('touchstart', (e) => {
            if (e.touches[0].clientX < 20 && window.innerWidth <= 768) {
                startX = e.touches[0].clientX;
                isDragging = true;
            }
        });

        this.main.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            currentX = e.touches[0].clientX;

            // Open sidebar if swiped right > 50px
            if (currentX - startX > 50) {
                this.sidebar.classList.add('active');
                this.toggle.classList.add('active');
                isDragging = false;
            }
        });

        // Swipe to close (on sidebar)
        this.sidebar.addEventListener('touchstart', (e) => {
            if (this.sidebar.classList.contains('active')) {
                startX = e.touches[0].clientX;
                isDragging = true;
            }
        });

        this.sidebar.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            currentX = e.touches[0].clientX;

            // Close sidebar if swiped left > 50px
            if (startX - currentX > 50) {
                this.closeSidebar();
                isDragging = false;
            }
        });

        this.main.addEventListener('touchend', () => {
            isDragging = false;
        });

        this.sidebar.addEventListener('touchend', () => {
            isDragging = false;
        });
    }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new DashboardMobileNav();
    });
} else {
    new DashboardMobileNav();
}

export default DashboardMobileNav;
```

---

## 8. 🎓 Best Practices для будущих модулей

### 8.1 Чек-лист для каждого нового модуля

При создании нового модуля обязательно:

```css
/* 1. Используй Mobile First подход */
.new-module {
    /* Базовые стили для мобильных */
    padding: 1rem;
}

/* Затем добавляй стили для больших экранов */
@media (min-width: 768px) {
    .new-module {
        padding: 2rem;
    }
}

/* 2. Используй CSS переменные для breakpoints */
.new-module-grid {
    display: grid;
    gap: var(--spacing-md);
    padding: var(--container-padding-mobile);
}

@media (min-width: 768px) {
    .new-module-grid {
        padding: var(--container-padding-tablet);
    }
}

/* 3. Touch targets минимум 44x44px */
.new-module-button {
    min-width: 44px;
    min-height: 44px;
    padding: 0.75rem 1.5rem;
}

/* 4. Адаптивная типографика */
.new-module-title {
    font-size: clamp(1.5rem, 4vw, 2.5rem);
    line-height: var(--line-height-tight);
}

/* 5. Гибкие grid без minmax */
.new-module-cards {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
}

@media (min-width: 640px) {
    .new-module-cards {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (min-width: 1024px) {
    .new-module-cards {
        grid-template-columns: repeat(3, 1fr);
    }
}
```

### 8.2 Тестирование каждого модуля

```javascript
// Добавить в каждый модуль для dev режима
if (process.env.NODE_ENV === 'development') {
    // Responsive check
    const checkResponsive = () => {
        const width = window.innerWidth;
        console.log(`📱 Current width: ${width}px`);

        if (document.body.scrollWidth > width) {
            console.error('❌ Horizontal overflow detected!');
        }

        const buttons = document.querySelectorAll('button, a.btn');
        buttons.forEach(btn => {
            const rect = btn.getBoundingClientRect();
            if (rect.width < 44 || rect.height < 44) {
                console.warn('⚠️ Touch target too small:', btn, `${rect.width}x${rect.height}`);
            }
        });
    };

    window.addEventListener('resize', checkResponsive);
    checkResponsive();
}
```

---

## 9. 📈 Метрики для отслеживания

После внедрения исправлений отслеживать:

| Метрика | Текущее | Цель | Инструмент |
|---------|---------|------|------------|
| **Lighthouse Mobile Score** | ? | >90 | Chrome DevTools |
| **First Contentful Paint** | ? | <2s | Lighthouse |
| **Largest Contentful Paint** | ? | <2.5s | Lighthouse |
| **Cumulative Layout Shift** | ? | <0.1 | Lighthouse |
| **Touch Target Size** | ? | 100% >= 44px | Manual |
| **Horizontal Overflow** | ? | 0 | Manual |
| **Font Size Mobile** | ? | >= 14px | Manual |

---

## 10. 🚀 Заключение

### Резюме

Проект GENESIS имеет **солидную базу адаптивности**, но требует точечных улучшений для достижения отличного пользовательского опыта на всех устройствах.

### Основные выводы:

1. ✅ **Базовая архитектура отличная** - layout система, переменные, PWA
2. ⚠️ **Модули требуют доработки** - dashboard sidebar, deposits grid
3. ⚠️ **Touch интерфейсы недостаточно оптимизированы** - размеры кнопок
4. 📊 **Не все модули проверены** - требуется аудит analytics, portfolio, etc.

### Оценка трудозатрат:

- **Критичные исправления**: 6 часов
- **Важные улучшения**: 2 дня
- **Полный аудит и оптимизация**: 1 неделя

### Следующие шаги:

1. Начать с Приоритета 1 (критичные исправления)
2. Протестировать на реальных устройствах
3. Собрать метрики Lighthouse
4. Провести аудит остальных модулей
5. Внедрить Best Practices для будущих модулей

---

**Подготовлено**: Claude Code Agent
**Контакт**: [GitHub Issues](https://github.com/Avertenandor/TEST/issues)
**Ветка для исправлений**: `claude/fix-responsive-issues-XXXXXX`
