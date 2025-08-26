# GENESIS Website Clean - Модульная архитектура

## Обзор

Проект преобразован в полностью модульную систему с использованием TypeScript. Каждый раздел сайта теперь является отдельным модулем с четким контрактом.

## Архитектура

### Core модули

- **error-guard.ts** - Глобальный перехватчик ошибок с белым списком
- **library-loader.ts** - Загрузчик библиотек с fallback на локальные бандлы
- **router.ts** - Роутер с ленивой загрузкой модулей и гвардами
- **store.ts** - Глобальное хранилище состояния
- **event-bus.ts** - Система событий для коммуникации между модулями
- **bootstrap.ts** - Инициализация и запуск приложения

### Shared модули

- **config.ts** - Централизованная конфигурация
- **services/bscscan.ts** - Сервис для работы с BSCScan API

### Модули главной страницы

- **modules/home/hero/** - Заголовок и CTA
- **modules/home/tokenInfo/** - Информация о PLEX токене
- **modules/home/ctaGrid/** - Сетка кнопок действий
- **modules/home/index.ts** - Главный модуль, объединяющий все подмодули

## Контракт модуля

```typescript
export interface Module {
  id: string;
  route?: string;
  mount(el: HTMLElement, props?: any): Promise<void> | void;
  unmount?(): void;
  canActivate?(ctx: RouterContext): boolean | Promise<boolean>;
  init?(): void;
}
```

## Установка и запуск

### Требования

- Node.js 18+
- npm или yarn

### Установка зависимостей

```bash
npm install
```

### Разработка

```bash
npm run dev
```

### Сборка

```bash
npm run build
```

### Тесты

```bash
npm test
```

## Структура файлов

```
├── core/                    # Основные модули
│   ├── error-guard.ts      # Перехватчик ошибок
│   ├── library-loader.ts   # Загрузчик библиотек
│   ├── router.ts           # Роутер
│   ├── store.ts            # Хранилище состояния
│   ├── event-bus.ts        # Система событий
│   └── bootstrap.ts        # Инициализация
├── shared/                 # Общие модули
│   ├── config.ts           # Конфигурация
│   └── services/           # Сервисы
├── modules/                # Модули приложения
│   └── home/               # Модули главной страницы
│       ├── hero/           # Hero секция
│       ├── tokenInfo/      # Информация о токене
│       ├── ctaGrid/        # Сетка CTA
│       └── index.ts        # Главный модуль
├── tests/                  # Тесты
│   └── smoke.test.ts       # Smoke тесты
├── vite.config.ts          # Конфигурация Vite
├── tsconfig.json           # Конфигурация TypeScript
├── package.json            # Зависимости
├── index-modular.html      # Новая главная страница
└── app.html                # SPA приложение
```

## Ключевые особенности

### 1. Модульность

- Каждый раздел - отдельный модуль
- Четкий контракт модулей
- Возможность переиспользования

### 2. TypeScript

- Полная типизация
- Современный синтаксис
- Лучшая поддержка IDE

### 3. Error Handling

- Белый список ошибок
- Логирование в `window.__diagBuffer`
- Graceful degradation

### 4. Library Loading

- Fallback на локальные бандлы
- CDN как резервный источник
- Исправленный Axios fallback

### 5. Конфигурация

- Централизованные адреса
- BSCScan ключи из переменных окружения
- Сетевые настройки

## Использование модулей

### Создание нового модуля

```typescript
import { Module } from '../../core/router';

export class MyModule implements Module {
  id = 'my-module';
  
  mount(el: HTMLElement, props?: any): void {
    el.innerHTML = '<div>My module content</div>';
  }
  
  unmount(): void {
    // Очистка ресурсов
  }
}

export default MyModule;
```

### Регистрация в роутере

```typescript
// В core/router.ts
{ path: '/my-route', module: 'my-module', public: true }
```

### Использование в HTML

```html
<script type="module">
  import { MyModule } from './modules/my-module/index.ts';
  
  const module = new MyModule();
  module.mount(document.getElementById('container'));
</script>
```

## Тестирование

### Smoke тесты

```bash
npm test
```

Тесты проверяют:

- Mount/unmount модулей без ошибок
- Корректность конфигурации
- Работу error guard
- Axios fallback возвращает объект, а не Promise

## PWA и Service Worker

- Кэширование vendor библиотек
- Offline fallback для основных страниц
- Автоматическое обновление

## Безопасность

- Content Security Policy
- Валидация входных данных
- Защита от XSS
- Безопасная работа с API ключами

## Производительность

- Ленивая загрузка модулей
- Оптимизация бандлов
- Минификация CSS/JS
- Кэширование ресурсов

## Совместимость

- Современные браузеры (ES2020+)
- Fallback для старых браузеров
- Адаптивный дизайн
- Поддержка мобильных устройств

## Развертывание

### Production

```bash
npm run build
```

### Development

```bash
npm run dev
```

### Preview

```bash
npm run preview
```

## Мониторинг

- Логирование ошибок в `window.__diagBuffer`
- Аналитика событий через event bus
- Метрики производительности
- Отслеживание состояния модулей

## Поддержка

Для вопросов и предложений создавайте issues в репозитории.

## Лицензия

MIT License
