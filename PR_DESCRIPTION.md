# UI/UX Production Refactor

**PR Title:** `feat(ui): unify entrypoint, dark theme, stepper, wallet validation, trust badges, manual chart, pwa, rpc-thrift`

Полный рефакторинг UI/UX согласно техническому заданию. Все изменения нацелены на production-ready код с единым стилем, доступностью и оптимизацией производительности.

## 📦 Что сделано

### 1️⃣ Структура проекта унифицирована
- ✅ Создана новая структура: `/src/styles/`, `/src/js/`, `/public/icons/`
- ✅ Единый entry point: `index.html` в корне
- ✅ `diagnostics.html` защищён guard'ом (доступен только с `?dev=1`)
- ✅ Старый `index.html` сохранён как бэкап

### 2️⃣ CSS Design System
- ✅ `tokens.css` - единый источник правды для всех переменных
- ✅ `theme-dark.css` - тёмная тема с компонентами
- ✅ Responsive font scaling
- ✅ Компоненты: `.card`, `.btn`, `.chip`, `.badge`, `.stepper`, `.skeleton`

### 3️⃣ Типографика и семантика
- ✅ Один `<h1>` на страницу (SEO-friendly)
- ✅ Иерархия заголовков: H1 → H2 → H3
- ✅ Все bullet-символы (•) заменены на семантические `<ul><li>`

### 4️⃣ Степпер авторизации (4 шага)
- ✅ Шаг 1: Ввод адреса кошелька с инлайн-валидацией
- ✅ Шаг 2: Оплата с QR-кодом и rate-limiting (15 сек)
- ✅ Шаг 3: Проверка транзакции
- ✅ Шаг 4: Завершение и переход в кабинет
- ✅ Состояния: idle, in-progress, success, error

### 5️⃣ Валидация адресов BSC
- ✅ `validators.js` - проверка Ethereum-compatible адресов
- ✅ Инлайн-валидация с debounce 500мс
- ✅ Визуальная обратная связь (зелёная/красная рамка + текст)

### 6️⃣ Копирование адресов
- ✅ `clipboard.js` - современный Clipboard API + fallback
- ✅ Toast-уведомления при успехе/ошибке

### 7️⃣ BscScan бейджи доверия
- ✅ Показываются только при наличии валидного contract address
- ✅ Ссылки: Contract, Read, Write
- ✅ Скрыты по умолчанию

### 8️⃣ График цены (ручное обновление)
- ✅ `chart.js` - лёгкий SVG sparkline
- ✅ Обновление только по клику пользователя
- ✅ Без автоматических фоновых запросов
- ✅ Skeleton state при загрузке

### 9️⃣ QuickNode оптимизация
- ✅ Rate-limiting: 15 секунд между запросами
- ✅ Кэширование: 60 секунд TTL в localStorage
- ✅ Только ручные действия пользователя
- ✅ Лог запросов в консоль

### 🔟 PWA (Progressive Web App)
- ✅ `manifest.json` с иконками 192x192 и 512x512
- ✅ `sw.js` переписан с нуля:
  - Cache-First для статики
  - Network-First для динамического контента
  - Автоочистка старых кэшей
- ✅ `pwa.js` - регистрация SW + обработка обновлений
- ✅ Уведомление об обновлениях с кнопкой "Обновить"

### 1️⃣1️⃣ Тех-панель без прочерков
- ✅ Skeleton loaders вместо "-"
- ✅ Реальные данные: браузер, язык, timezone, connection
- ✅ Заполнение после загрузки

### 1️⃣2️⃣ Кнопки и состояния
- ✅ Hover, focus-visible, disabled, loading (spinning)
- ✅ ARIA-атрибуты для доступности
- ✅ Анимации и transitions

### 1️⃣3️⃣ Доступность (a11y)
- ✅ `lang="ru"` на корневом HTML
- ✅ ARIA labels, roles, live regions
- ✅ Focus-visible стили
- ✅ Keyboard navigation

### 1️⃣4️⃣ E2E тесты (Playwright)
- ✅ 11 комплексных тестов:
  1. Один H1
  2. Семантические списки
  3. Валидация адреса
  4. Rate-limiting
  5. PWA manifest
  6. Trust badges
  7. Stepper (4 шага)
  8. График с кнопкой обновления
  9. Тех-панель без прочерков
  10. Состояния кнопок
  11. Diagnostics guard

## 🎯 Критерии приёмки (выполнены)

- [x] Один `index.html` в корне
- [x] `diagnostics.html` только при `?dev=1`
- [x] Один H1, чистая иерархия H2/H3
- [x] Везде `<ul><li>`, символов • нет
- [x] Степпер с реальными текстами и состояниями
- [x] Один QR, инлайн-валидация, копирование
- [x] CTA имеют все состояния
- [x] Бейджи BscScan кликабельные
- [x] График с ручным обновлением
- [x] QuickNode: rate-limit 15s, кэш 60s
- [x] PWA: manifest + SW
- [x] Тех-панель без "-"
- [x] Playwright UI-тесты зелёные

## 🧪 Как тестировать

### Локальный запуск:
```bash
# Установка зависимостей (если нужно)
npm install

# Запуск dev-сервера
npm run dev

# Запуск E2E тестов
npm run test:e2e
```

### Чек-лист ручного тестирования:
1. Открыть `/` - должен загрузиться новый index.html
2. Ввести невалидный адрес → красная рамка + текст ошибки
3. Ввести валидный адрес (0x…) → зелёная подсказка + кнопка активна
4. Нажать "Далее" → переход к шагу 2 с QR-кодом
5. Попробовать нажать "Проверить оплату" дважды подряд → должен быть rate-limit
6. Нажать "Обновить график" → график должен загрузиться
7. Посмотреть тех-панель → данные без прочерков
8. Попробовать открыть `/diagnostics.html` → редирект на `/`
9. Открыть `/diagnostics.html?dev=1` → страница загружается
10. Проверить PWA: A2HS должен работать

## 📊 Производительность

- Lighthouse (ожидается):
  - Performance: 90+
  - Accessibility: 95+
  - Best Practices: 95+
  - SEO: 100
- axe DevTools: 0 критичных ошибок

## 🔗 Связанные задачи

- Closes #N/A (укажите номер issue, если есть)

## 📝 Примечания

- Все изменения обратно совместимы
- Старый `index.html` сохранён как `.backup`
- `app.html` оставлен без изменений (для кабинета)
- Все новые модули используют ES6 modules

## 🚀 Готовность к мержу

- [x] Все тесты пройдены
- [x] Код отревьюен самостоятельно
- [x] Документация обновлена (в коде)
- [x] Breaking changes отсутствуют
- [x] 11 атомарных коммитов с чёткими сообщениями

---

**Готово к продакшену!** 🎉

## 📋 Структура коммитов

1. `feat(ui): add CSS tokens and dark theme` - Система дизайна
2. `feat(wallet): add BSC address validation` - Валидация адресов
3. `feat(ux): add clipboard utilities with toast notifications` - Копирование
4. `feat(ui): add UI utilities (stepper, loading, toasts)` - UI утилиты
5. `feat(chart): add lightweight SVG sparkline chart` - График
6. `feat(pwa): add PWA registration and update handling` - PWA функции
7. `feat(pwa): add manifest.json and icons` - Манифест
8. `feat(pwa): rewrite service worker with cache strategies` - Service Worker
9. `feat(ui): create new unified index.html with auth stepper` - Новый index.html
10. `fix(security): add dev guard to diagnostics.html` - Guard для diagnostics
11. `test(e2e): add Playwright UI tests for auth flow` - E2E тесты

## 🔗 Ссылка для создания PR

https://github.com/Avertenandor/TEST/compare/main...claude/ui-ux-prod-refactor-011CUY5Fg1TGj5z5joQhF9dG
