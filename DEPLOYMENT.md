# 🚀 Инструкция по деплою на GitHub Pages

## Текущая конфигурация

- **Кастомный домен:** `crypto-processing.net` (настроен через CNAME)
- **GitHub репозиторий:** `Avertenandor/TEST`
- **Базовый путь:** `/` (корневой, так как используется кастомный домен)

## Подготовка к деплою

### 1. Установка зависимостей

```bash
npm install
```

### 2. Сборка проекта

```bash
npm run build
```

Это создаст оптимизированную сборку в папке `dist/` с:
- Минифицированным кодом
- Удаленными console.log (только в продакшене)
- Оптимизированными ресурсами

### 3. Проверка сборки локально

```bash
npm run preview
```

Откроется локальный сервер для проверки.

## Автоматический деплой через GitHub Actions

Проект настроен на автоматический деплой при пуше в `main` ветку.

Workflow файл: `.github/workflows/deploy-pages.yml`

### Настройка GitHub Pages

1. Зайдите в Settings → Pages репозитория
2. Убедитесь, что выбрано:
   - **Source:** GitHub Actions
   - **Branch:** main
3. Если используете кастомный домен:
   - Введите домен в поле Custom domain
   - Сохраните

## Ручной деплой (если нужно)

1. Соберите проект:
   ```bash
   npm run build
   ```

2. Переключитесь на ветку `gh-pages`:
   ```bash
   git checkout -b gh-pages
   git checkout main
   ```

3. Скопируйте содержимое `dist/` в корень репозитория:
   ```bash
   cp -r dist/* .
   ```

4. Закоммитьте и запушьте:
   ```bash
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin main
   ```

## Важные замечания

- ✅ Все console.log автоматически удаляются в продакшен сборке
- ✅ CSP настроен для работы с внешними ресурсами
- ✅ Кастомный домен настроен через CNAME
- ✅ GitHub Actions автоматически деплоит при пуше в main

## Переменные окружения (для локальной разработки)

Создайте `.env` файл (не коммитьте его!):

```env
VITE_BSCSCAN_API_KEY_AUTHORIZATION=your_key_here
VITE_BSCSCAN_API_KEY_DEPOSITS=your_key_here
VITE_BSCSCAN_API_KEY_SUBSCRIPTION=your_key_here
VITE_SYSTEM_ADDRESS=0x...
VITE_ACCESS_ADDRESS=0x...
VITE_DEBUG_MODE=false
VITE_GENESIS_VERSION=1.4.2
```

## Проверка после деплоя

1. Откройте `https://crypto-processing.net/`
2. Проверьте консоль браузера на ошибки
3. Проверьте работу всех функций
4. Проверьте мобильную версию

---

**Последнее обновление:** 2025-01-13

