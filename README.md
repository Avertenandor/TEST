# 🚀 GENESIS DeFi Platform v1.1

Professional DeFi monitoring and investment platform built on Binance Smart Chain (BSC).

![GENESIS Platform](https://img.shields.io/badge/Version-1.1-blue)
![BSC Network](https://img.shields.io/badge/Network-BSC-yellow)
![License](https://img.shields.io/badge/License-MIT-green)

## 📋 Overview

GENESIS is a comprehensive DeFi platform that provides:

- Real-time portfolio monitoring
- Automated deposit management  
- BSC blockchain integration
- PWA support for mobile devices
- Enterprise-level security

## 🌟 Features

### Core Functionality

- **🔐 BSC Authorization** - Secure authentication via BSC wallet
- **💰 Deposit System** - 13 investment plans ($10-$1000)
- **📊 Real-time Analytics** - Portfolio performance tracking
- **📱 PWA Support** - Install as mobile/desktop app
- **🔄 Auto-payments** - Daily platform access fees
- **📈 Transaction History** - Complete audit trail

### Technical Features

- **Modular Architecture** - ES6 modules with lazy loading
- **State Management** - Reactive state with event bus
- **Security** - XSS protection, input sanitization
- **Performance** - Optimized bundle, caching strategies
- **Monitoring** - Built-in performance analytics

## 🛠️ Tech Stack

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Blockchain**: Binance Smart Chain (BSC)
- **APIs**: BSCScan API integration
- **PWA**: Service Worker, Web App Manifest
- **Build Tools**: Node.js, Terser, Clean-CSS
- **Testing**: Jest, ESLint

## 📦 Installation

### Prerequisites

- Node.js 14.0+
- npm 6.0+
- Modern web browser
- BSC wallet (MetaMask recommended)

### Setup

1. Clone the repository:

```bash
git clone https://github.com/Avertenandor/TEST.git
cd GENESIS-Website-Clean
```

2. Install dependencies:

```bash
npm install
```

3. Configure the platform:

- Copy `js/config.js.example` to `js/config.js` (if exists)
- Update BSC contract addresses
- Add BSCScan API keys

4. Run development server:

```bash
npm run dev
```

5. Build for production:

```bash
npm run build
```

## 🚀 Usage

### Development

```bash
# Start development server
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

### Production Build

```bash
# Create optimized build
npm run build

# Files will be in dist/ directory
```

### Deployment

1. Build the project: `npm run build`
2. Upload `dist/` contents to your web server
3. Configure HTTPS (required for PWA)
4. Set up proper CORS headers
5. Test all functionality

## 📁 Project Structure

```
GENESIS-Website-Clean/
├── index.html                # Landing page (маркетинг)
├── app.html                  # SPA контейнер (модульная архитектура)
├── manifest.json             # PWA manifest
├── sw.js                     # Service Worker
├── core/                     # Ядро SPA
│   ├── bootstrap.js         # Инициализация приложения
│   ├── router.js            # Роутер модулей
│   ├── module-loader.js     # Динамическая загрузка модулей
│   ├── event-bus.js         # Шина событий
│   └── store.js             # Глобальное состояние
├── modules/                  # ES6-модули разделов
│   ├── home/                # Главная (landing) в SPA
│   ├── dashboard/           # Панель управления
│   ├── deposits/            # Депозиты
│   └── ...                  # Другие разделы
├── shared/                   # Общие компоненты/сервисы/стили
├── css/                      # Статические стили
├── assets/                   # Изображения и медиа
└── tests/                    # Тесты
```

### 🧱 Modular Architecture (SPA)
- Точка входа: `app.html`
- Маршруты SPA: управляются `core/router.js`
- Разделы вынесены в модули (`/modules/<name>`), загрузка — динамическая
- Новый маршрут: `/home` (модуль `modules/home`) — главная в SPA без потери контента

Примечание: публичная главная `index.html` остаётся для SEO и маркетинга; SPA-доступ — через `/home` или пункт меню «Главная».

## 🔧 Configuration

### Environment Variables

Create `.env` file in root directory:

```env
NODE_ENV=development
BSC_NETWORK=mainnet
API_TIMEOUT=30000
```

### Platform Configuration

Edit `js/config.js`:

```javascript
window.GENESIS_CONFIG = {
  addresses: {
    system: '0x...', // System wallet
    access: '0x...', // Platform access wallet
    plex: '0x...',   // PLEX token contract
    usdt: '0x...'    // USDT token contract
  },
  api: {
    bscscan: ['API_KEY_1', 'API_KEY_2', 'API_KEY_3']
  }
};
```

## 🧪 Testing

### Run All Tests

```bash
npm test
```

### Run Specific Test File

```bash
npm test -- config.test.js
```

### Generate Coverage Report

```bash
npm run test:coverage
```

### Test Structure

- `tests/setup.js` - Test environment configuration
- `tests/*.test.js` - Test files
- `jest.config.js` - Jest configuration

## 📊 API Documentation

### Authorization Service

```javascript
// Check if user is authenticated
const isAuth = GenesisAuthService.isAuthenticated;

// Authenticate user
const result = await GenesisAuthService.authenticate(walletAddress);
```

### Deposit Creation

```javascript
// Start deposit creation
DepositCreationSystem.selectPlan(planId);
DepositCreationSystem.selectCurrency('USDT');
await DepositCreationSystem.generatePaymentInfo();
```

### Platform Access

```javascript
// Check platform access
const access = await GenesisPlatformAccess.checkAccess(userAddress);
```

## 🔒 Security

### Implemented Security Measures

- Content Security Policy (CSP)
- XSS Protection via HTML sanitization
- Input validation and sanitization
- Secure event handling (no inline handlers)
- Protected global objects
- HTTPS enforcement
- Rate limiting for API calls

### Security Best Practices

1. Always validate user input
2. Use `safeSetHTML()` instead of `innerHTML`
3. Sanitize all dynamic content
4. Keep dependencies updated
5. Regular security audits

## 🎨 Customization

### Themes

Platform supports multiple themes:

- Dark (default)
- Light
- Matrix
- Retro
- Cyber
- Neon

### Adding New Sections

1. Create new section file in `cabinet/js/sections/`
2. Extend `BaseSection` class
3. Register in navigation system
4. Add MCP markers for tracking

## 📱 PWA Features

### Installation

Users can install the platform as an app:

- Desktop: Chrome menu → Install GENESIS
- Mobile: Browser menu → Add to Home Screen

### Offline Support

- Service Worker caches critical assets
- Offline fallback pages
- Background sync for transactions

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/NewFeature`
3. Commit changes: `git commit -m 'Add NewFeature'`
4. Push to branch: `git push origin feature/NewFeature`
5. Submit pull request

### Code Style

- Follow ESLint configuration
- Use 2-space indentation
- Add JSDoc comments
- Include tests for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Development**: GENESIS Team
- **Design**: UI/UX Team
- **Testing**: QA Team
- **Documentation**: Tech Writers

## 📞 Support

- **GitHub Issues**: [Report bugs](https://github.com/Avertenandor/TEST/issues)
- **Documentation**: [Wiki](https://github.com/Avertenandor/TEST/wiki)
- **Community**: [Discord](https://discord.gg/genesis)

## 🎯 Roadmap

### Version 1.2 (Q2 2025)

- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] API for third-party integration

### Version 1.3 (Q3 2025)

- [ ] Cross-chain support
- [ ] Automated trading strategies
- [ ] Social features
- [ ] Governance token

## ⚡ Performance

### Metrics

- **Initial Load**: < 1.5s
- **Time to Interactive**: < 2s
- **Lighthouse Score**: 95+
- **Bundle Size**: < 500KB (minified)

### Optimization

- Code splitting
- Lazy loading
- Image optimization
- Caching strategies
- CDN integration

---

**Built with ❤️ by GENESIS Team**

*Last updated: July 31, 2025*
