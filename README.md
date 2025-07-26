# 🏦 GENESIS 1.1 - DeFi Platform

<div align="center">
  <img src="assets/preview.png" alt="GENESIS 1.1 Preview" width="600">
  
  [![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/Avertenandor/TEST)
  [![Version](https://img.shields.io/badge/version-1.1-blue)](https://github.com/Avertenandor/TEST)
  [![License](https://img.shields.io/badge/license-MIT-yellow)](LICENSE)
</div>

## 📋 О проекте

**GENESIS 1.1** - это современная DeFi платформа на базе BSC (Binance Smart Chain), реализованная как Progressive Web Application (PWA) без серверной инфраструктуры.

### 🚀 Ключевые особенности

- **100% Frontend** - работает без серверной части
- **BSC Integration** - полная интеграция с Binance Smart Chain
- **PWA Ready** - установка как приложение в один клик
- **Real-time Terminal** - встроенный терминал для мониторинга
- **MCP Architecture** - уникальная система маркеров для навигации по коду

## 🎯 Функционал

### Для пользователей
- ✅ Авторизация через BSC кошелек
- ✅ Система депозитов (13 планов от $25 до $2500)
- ✅ Мониторинг транзакций в реальном времени
- ✅ Множители доходности (до x5)
- ✅ Детальная аналитика портфеля
- ✅ QR-коды для удобной оплаты

### Технические возможности
- 🔧 Интеграция с BSCScan API (3 специализированных ключа)
- 🔧 Поддержка токенов USDT и PLEX
- 🔧 Защита от ошибок MetaMask
- 🔧 Автоматическое обновление данных
- 🔧 Кеширование для оптимизации

## 📁 Структура проекта

```
GEN1.1/
├── index.html              # Главная страница
├── cabinet.html            # Личный кабинет
├── cabinet-part2.js        # Дополнительный код кабинета
├── js/                     # JavaScript модули
│   ├── config.js          # Конфигурация системы
│   ├── app.js             # Основное приложение
│   ├── models.js          # Модели данных
│   └── services/          # Сервисы
│       ├── api.js         # BSCScan API
│       ├── auth.js        # Авторизация
│       ├── platform-access.js    # Управление доступом
│       ├── deposits-enhanced.js  # Система депозитов
│       ├── multipliers.js        # Множители
│       ├── terminal.js          # Терминал
│       └── utils.js             # Утилиты
├── css/                    # Стили
├── assets/                 # Ресурсы
└── docs/                   # Документация
```

## 🛠 Технологии

- **Frontend**: Pure HTML/CSS/JavaScript (без фреймворков)
- **Blockchain**: BSC (Binance Smart Chain)
- **Tokens**: USDT, PLEX ONE
- **APIs**: BSCScan API, IPAPI, QR Server API
- **PWA**: Service Workers, Web App Manifest

## 🚀 Быстрый старт

### 1. Клонирование репозитория
```bash
git clone https://github.com/Avertenandor/TEST.git
cd TEST
```

### 2. Запуск локального сервера
```bash
# Используйте любой статический сервер
npx http-server -p 8080

# Или Python
python -m http.server 8080

# Или Node.js
npm install -g live-server
live-server --port=8080
```

### 3. Открыть в браузере
```
http://localhost:8080
```

## 💡 Использование

1. **Авторизация**: Введите адрес BSC кошелька
2. **Пополнение доступа**: Минимум $10 USDT для активации платформы
3. **Создание депозита**: Выберите план и оплатите через QR-код
4. **Мониторинг**: Следите за доходностью в реальном времени

## 🔧 Конфигурация

Основные настройки находятся в `js/config.js`:

```javascript
window.GENESIS_CONFIG = {
    addresses: {
        system: "0x...",  // Системный кошелек
    },
    bscscan: {
        apiKeys: {
            DEPOSITS: "...",
            AUTH: "...",
            GENERAL: "..."
        }
    }
};
```

## 📊 MCP Архитектура

Проект использует уникальную систему MCP-маркеров для навигации:

- **351 маркер** для быстрого поиска кода
- **100% покрытие** основных файлов
- **Индексация** в `mcp-index.json`

Пример маркера:
```javascript
// MCP-MARKER:MODULE:CABINET_CONTROLLER - Контроллер личного кабинета
```

## 🐛 Известные проблемы

- ⚠️ Файл `cabinet.html` требует восстановления (обрыв на строке 2520)
- 🔄 Система платформенного доступа в разработке
- 🔄 MEV-бот функционал планируется

## 📈 Roadmap

- [ ] Полная интеграция системы оплаты доступа
- [ ] Добавление MEV-бот функционала
- [ ] Расширение аналитики портфеля
- [ ] Мультиязычная поддержка
- [ ] Темная тема

## 🤝 Вклад в проект

Мы приветствуем вклад в развитие проекта! Пожалуйста:

1. Fork репозитория
2. Создайте feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit изменения (`git commit -m 'Add AmazingFeature'`)
4. Push в branch (`git push origin feature/AmazingFeature`)
5. Откройте Pull Request

## 📝 Лицензия

Этот проект лицензирован под MIT License - см. файл [LICENSE](LICENSE) для деталей.

## 🙏 Благодарности

- BSC Community
- Всем контрибьюторам проекта
- Пользователям платформы

---

<div align="center">
  <strong>GENESIS 1.1</strong> - Будущее DeFi уже здесь! 🚀
</div>
