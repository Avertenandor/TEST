# GENESIS Website Test Suite

Полный набор тестов для проверки функциональности, производительности и качества сайта GENESIS DeFi Platform.

## Структура тестов

```
тесты/
├── e2e/                          # End-to-end тесты
│   ├── test_landing_chrome.py    # Базовые проверки в Chrome
│   ├── test_full_landing.py      # Полная проверка лендинга
│   ├── test_console_monitor.py   # Мониторинг консоли браузера
│   └── test_functional.py       # Функциональные тесты
├── unit/                         # Unit тесты
│   └── test_js_modules.py        # Тесты JavaScript модулей
├── performance/                  # Performance тесты
│   └── test_performance.py       # Core Web Vitals, A11y, SEO
├── _artifacts/                   # Артефакты тестов (логи, отчеты)
├── config.py                     # Конфигурация тестов
└── run_all_tests.py              # Мастер-скрипт запуска всех тестов
```

## Быстрый запуск

### Все тесты сразу
```powershell
python тесты/run_all_tests.py --url https://crypto-processing.net/ --headless 1
```

### Отдельные типы тестов
```powershell
# Базовые e2e проверки
python тесты/e2e/test_landing_chrome.py --url https://crypto-processing.net/ --headless 0

# Полная проверка лендинга
python тесты/e2e/test_full_landing.py --url https://crypto-processing.net/ --headless 0

# Мониторинг консоли
python тесты/e2e/test_console_monitor.py --url https://crypto-processing.net/ --headless 1

# Функциональные тесты
python тесты/e2e/test_functional.py --url https://crypto-processing.net/ --headless 0

# Unit тесты JavaScript
python тесты/unit/test_js_modules.py --url https://crypto-processing.net/ --headless 1

# Performance тесты
python тесты/performance/test_performance.py --url https://crypto-processing.net/ --headless 1
```

## Что проверяют тесты

### E2E тесты
- ✅ Загрузка всех секций и элементов страницы
- ✅ Корректность QR-кода и fallback механизмов
- ✅ Навигация и работа кнопок
- ✅ Модульный терминал (отсутствие дубликатов)
- ✅ Адаптивность на разных разрешениях
- ✅ Переходы между страницами (лендинг → кабинет)

### Console Monitor
- ✅ Отсутствие критических JavaScript ошибок
- ✅ Корректность сетевых запросов (отсутствие 404/500)
- ✅ Performance timing
- ✅ Логирование всех консольных сообщений

### Functional тесты
- ✅ Процесс авторизации через QR/адрес
- ✅ Переход в личный кабинет
- ✅ Работа модульной системы кабинета
- ✅ API терминала в кабинете

### JavaScript Unit тесты
- ✅ Bootstrap системы и API терминала
- ✅ QR функции (генерация, обновление, копирование)
- ✅ Конфигурация AUTH_CONFIG
- ✅ DOM элементы и CSS загрузка
- ✅ Перехватчики консоли и fetch

### Performance тесты
- ✅ Core Web Vitals (LCP, FCP, загрузка)
- ✅ Accessibility (alt-теги, формы, заголовки, ARIA)
- ✅ SEO (meta-теги, заголовки, Open Graph)
- ✅ PWA (manifest, service worker, иконки)

## Параметры запуска

### Обязательные
- `--url` - URL сайта для тестирования
- `--timeout` - Таймаут в миллисекундах (по умолчанию 25000)
- `--headless` - Запуск в headless режиме (1 - да, 0 - нет)

### Переменные окружения
```powershell
$env:BROWSER_CHANNEL = 'chrome'      # Использовать системный Chrome
$env:GENESIS_SITE_URL = 'https://crypto-processing.net/'
$env:HEADLESS = '1'                  # Headless по умолчанию
```

## Артефакты

Все тесты сохраняют артефакты в `тесты/_artifacts/`:
- `console_*.json` - Логи консоли браузера
- `network_*.json` - Логи сетевых запросов
- `*_test_*.json` - Подробные отчеты тестов
- `master_report_*.json` - Сводный отчет всех тестов

## Интерпретация результатов

### Статусы
- `PASS` - Тест прошел успешно
- `FAIL` - Тест провален (есть критические ошибки)
- `SKIP` - Тест пропущен (файл не найден, ошибка запуска)

### Пороги успешности
- **Performance**: ≥70% (время загрузки, размер ресурсов)
- **Accessibility**: ≥70% (alt-теги, формы, структура)
- **SEO**: ≥70% (meta-теги, заголовки, разметка)

### Критичные ошибки
- JavaScript ошибки типа `uncaught`, `reference`, `syntax`
- HTTP ошибки 4xx/5xx на критичных ресурсах
- Отсутствие модульного терминала
- Наличие статических терминалов-дубликатов

## Требования

- Python 3.8+
- Playwright (`pip install playwright`)
- Браузерные бинари (`playwright install chromium`)
- Системный Chrome (для канала 'chrome')

## Интеграция в CI/CD

```yaml
# GitHub Actions пример
- name: Run GENESIS Tests
  run: |
    python -m pip install playwright
    playwright install chromium
    python тесты/run_all_tests.py --url ${{ env.SITE_URL }} --headless 1 --json
```

## Troubleshooting

### Playwright не находит Chrome
```powershell
$env:BROWSER_CHANNEL = 'chromium'  # Fallback на Chromium
```

### Timeout ошибки
```powershell
python тесты/run_all_tests.py --timeout 45000  # Увеличить таймаут
```

### Проблемы с headless
```powershell
python тесты/run_all_tests.py --headless 0  # Запуск с UI для отладки
```

## Структура
- `content_map.json` — эталонная карта секций и их идентификаторов.
- `extract_monolith_content.py` — утилита: извлечение секций из монолитного файла.
- `extract_modular_content.py` — утилита: извлечение из модульной структуры.
- `compare_content.py` — сравнение и отчёт различий.
- `tests_run_all.py` — оркестратор полного набора проверок.
- `reports/` — артефакты сравнения (JSON + Markdown отчёты).

## Запуск
```bash
python tests_run_all.py
```

## Выходные артефакты
- `reports/diff_summary.json` — структурные отличия.
- `reports/diff_report.md` — человекочитаемый отчёт.

## Критерии прохождения
- Нет критических пропусков секций.
- Модульная версия >= по количеству элементов (планов, бонусов и др.).
- Все ключевые маркеры (MCP-MARKER) из монолита покрыты либо улучшены.
