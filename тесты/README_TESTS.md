# GENESIS Complete Testing Suite 🧪

Полноценная система E2E тестирования для сайта https://crypto-processing.net/

## ✨ Возможности

- ✅ **Полное тестирование в Chrome** - проверка всех аспектов сайта
- 🔍 **Мониторинг консоли** - ловит все ошибки, предупреждения и логи
- 📊 **Анализ производительности** - метрики загрузки и использования ресурсов
- 🔐 **Проверка безопасности** - базовые тесты безопасности
- ♿ **Тесты доступности** - проверка WCAG стандартов
- 📦 **Проверка модулей** - тестирование модульной системы
- 📸 **Скриншоты** - автоматическое создание при ошибках
- 📝 **Подробные отчеты** - JSON, HTML и Markdown форматы

## 🚀 Быстрый старт

### Установка

```bash
# Установка зависимостей
npm install

# Для Python тестов (опционально)
pip install playwright pytest
```

### Запуск тестов

```bash
# Запустить все тесты
npm test

# Тест продакшн сайта
npm run test:prod

# Тест локального сервера
npm run test:local

# Запуск с видимым браузером
npm run test:headed

# Быстрый тест (30 секунд)
npm run test:quick

# Только Chrome тест
npm run test:chrome

# Только мониторинг консоли
npm run test:console
```

## 🔧 Настройка для VS Code

### Создайте `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "🧪 Run All Tests",
      "program": "${workspaceFolder}/тесты/run_all_tests.js",
      "cwd": "${workspaceFolder}/тесты",
      "env": {
        "TEST_URL": "https://crypto-processing.net/",
        "HEADLESS": "false"
      }
    },
    {
      "type": "node",
      "request": "launch",
      "name": "🔍 Chrome Complete Test",
      "program": "${workspaceFolder}/тесты/e2e/test_complete_chrome.js",
      "cwd": "${workspaceFolder}/тесты",
      "env": {
        "TEST_URL": "https://crypto-processing.net/"
      }
    },
    {
      "type": "node",
      "request": "launch",
      "name": "📊 Console Monitor",
      "program": "${workspaceFolder}/тесты/e2e/test_console_monitor.js",
      "cwd": "${workspaceFolder}/тесты",
      "env": {
        "TEST_URL": "https://crypto-processing.net/",
        "DURATION": "30000"
      }
    }
  ]
}
```

### Создайте `.vscode/tasks.json`:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Run All Tests",
      "type": "npm",
      "script": "test",
      "path": "тесты/",
      "group": {
        "kind": "test",
        "isDefault": true
      },
      "problemMatcher": []
    },
    {
      "label": "Run Chrome Test",
      "type": "npm",
      "script": "test:chrome",
      "path": "тесты/",
      "group": "test",
      "problemMatcher": []
    },
    {
      "label": "Clean Reports",
      "type": "npm",
      "script": "clean",
      "path": "тесты/",
      "problemMatcher": []
    }
  ]
}
```

## 📋 Что проверяют тесты

### 1. **Console Errors Test**
- ❌ Ошибки JavaScript
- ⚠️ Предупреждения консоли
- 💥 Необработанные исключения
- 🔄 Promise rejections

### 2. **Network Test**
- 🌐 Все HTTP запросы
- ❌ Неудачные запросы
- 🐌 Медленные запросы (>1сек)
- 🔗 Проверка API endpoints

### 3. **DOM Structure Test**
- 🆔 Дублирующиеся ID
- 📝 Проверка форм
- 🖼️ Битые изображения
- 📜 Сырой код на странице
- 🏗️ Структура документа

### 4. **Performance Test**
- ⚡ Page Load Time
- 🎨 First Contentful Paint
- 📊 DOM Content Loaded
- 💾 Использование памяти
- 📦 Размер ресурсов

### 5. **Accessibility Test**
- 🏷️ Alt тексты для изображений
- 🔤 ARIA labels
- 🎨 Контраст текста
- 📑 Структура заголовков
- 🌍 Язык документа

### 6. **Security Test**
- 🔒 HTTPS проверка
- 🛡️ Content Security Policy
- 🔗 Безопасные ссылки
- 📝 Безопасные формы
- 🔑 Чувствительные данные в localStorage

### 7. **Module System Test**
- 📦 Загруженные модули
- 🛣️ Маршруты (routes)
- 📡 Event Bus
- 💾 Store состояние
- ⚙️ Критические модули

### 8. **Code Coverage**
- 📊 Использование JavaScript
- 🎨 Использование CSS
- 📈 Процент покрытия

## 📊 Отчеты

После выполнения тестов отчеты сохраняются в:

- `reports/` - все отчеты
- `screenshots/` - скриншоты при ошибках

### Типы отчетов:

1. **JSON** - полные данные для анализа
2. **HTML** - красивый визуальный отчет
3. **Markdown** - для документации

## 🔍 Анализ ошибок

### Частые ошибки и решения:

| Ошибка | Причина | Решение |
|--------|---------|---------|
| `ERR_CONNECTION_REFUSED` | Сайт недоступен | Проверьте URL или запустите локальный сервер |
| `Timeout exceeded` | Медленная загрузка | Увеличьте TIMEOUT или проверьте сеть |
| `Module not found` | Отсутствуют зависимости | Запустите `npm install` |
| `Chrome not found` | Нет Chrome браузера | Установите Chrome или используйте Chromium |

## 🤖 Интеграция с CI/CD

### GitHub Actions

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm install
        working-directory: ./тесты
      - run: npm test
        working-directory: ./тесты
        env:
          TEST_URL: https://crypto-processing.net/
          HEADLESS: true
      - uses: actions/upload-artifact@v2
        if: always()
        with:
          name: test-reports
          path: тесты/reports/
```

## 🎯 Лучшие практики

1. **Регулярное тестирование** - запускайте тесты после каждого изменения
2. **Мониторинг трендов** - следите за изменением метрик со временем
3. **Приоритизация исправлений** - сначала исправляйте критические ошибки
4. **Документирование** - сохраняйте отчеты для истории
5. **Автоматизация** - интегрируйте в CI/CD pipeline

## 🛠️ Расширение тестов

### Добавление нового теста:

```javascript
// e2e/test_custom.js
class CustomTest {
    async run() {
        // Ваша логика теста
        return { passed: true, details: {} };
    }
}

module.exports = CustomTest;
```

### Добавление в run_all_tests.js:

```javascript
await this.runTest('Custom Test', async () => {
    const CustomTest = require('./e2e/test_custom');
    const test = new CustomTest();
    return await test.run();
});
```

## 📞 Поддержка

- **Issues**: https://github.com/Avertenandor/TEST/issues
- **Documentation**: В папке `docs/`
- **Examples**: В папке `examples/`

## 📝 Лицензия

MIT

---

**GENESIS Testing Suite** - Надежное тестирование для надежной платформы 🚀
