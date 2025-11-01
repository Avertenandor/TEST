import { REGISTRY, pathsOf } from './registry.js';
import { CONFIG } from './config.js';

// Менеджер модулей
class ModuleManager {
  constructor() {
    this.mountedModules = new Map();
    this.intersectionObserver = null;
    this.initIntersectionObserver();
  }

  initIntersectionObserver() {
    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const moduleName = entry.target.getAttribute('data-module');
          if (moduleName && REGISTRY[moduleName]?.lazy) {
            this.mountModule(entry.target, moduleName);
            this.intersectionObserver.unobserve(entry.target);
          }
        }
      });
    }, { threshold: 0.1 });
  }

  async mountModule(element, moduleName) {
    try {
      console.log(`[MODULE] Монтирование модуля: ${moduleName}`);

      const paths = pathsOf(moduleName);

      // Подключаем CSS
      try {
        await this.loadCSS(paths.css);
      } catch (_) {
        // Фолбэк: для окружений, где public/ сервится как корень
        const fallbackCss = paths.css.replace('/public/', '/');
        await this.loadCSS(fallbackCss);
      }

      // Загружаем и монтируем модуль
      let module;
      try {
        module = await import(/* @vite-ignore */ paths.js);
      } catch (e) {
        // Фолбэк: /public → /
        const fallbackJs = paths.js.replace('/public/', '/');
        module = await import(/* @vite-ignore */ fallbackJs);
      }

      // Проверяем наличие default export и метода mount
      let exported = module.default;
      if (!exported && typeof window !== 'undefined') {
        // Фолбэк на глобальные объекты (старые модули могут вешаться в window)
        const globalName = String(moduleName).includes('/')
          ? String(moduleName).split('/').pop()
          : moduleName;
        const candidate = window[`${globalName.charAt(0).toUpperCase()}${globalName.slice(1)}Module`];
        if (candidate) {
          exported = candidate;
        }
      }
      if (!exported) throw new Error(`Модуль ${moduleName} не имеет default export`);

      if (typeof exported.mount !== 'function') {
        throw new Error(`Модуль ${moduleName} не имеет метода mount`);
      }

      const unmount = await exported.mount(element, CONFIG);

      this.mountedModules.set(moduleName, { element, unmount });

      console.log(`[MODULE] Модуль ${moduleName} успешно смонтирован`);
    } catch (error) {
      console.error(`[MODULE ERROR] Ошибка монтирования модуля ${moduleName}:`, error);
      // Показываем ошибку пользователю
      element.innerHTML = `<div style="color: red; padding: 20px;">Ошибка загрузки модуля: ${moduleName}</div>`;
    }
  }

  async loadCSS(cssPath) {
    return new Promise((resolve, reject) => {
      // Проверяем, не подключен ли уже CSS
      const existingLink = document.querySelector(`link[href="${cssPath}"]`);
      if (existingLink) {
        resolve();
        return;
      }

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = cssPath;
      link.onload = resolve;
      link.onerror = () => reject(new Error(`CSS 404: ${cssPath}`));
      document.head.appendChild(link);
    });
  }

  init() {
    console.log('[BOOTSTRAP] Инициализация системы модулей');
    
    // Находим все элементы с data-module
    const moduleElements = document.querySelectorAll('[data-module]');
    
    moduleElements.forEach(element => {
      const moduleName = element.getAttribute('data-module');
      
      if (!REGISTRY[moduleName]) {
        console.error(`[MODULE ERROR] Неизвестный модуль: ${moduleName}`);
        return;
      }

      // Пропускаем отключенные для лендинга модули
      const info = pathsOf(moduleName);
      if (window.GENESIS_LANDING === true && info.disabledOnLanding) {
        console.log(`[BOOTSTRAP] Пропуск модуля на лендинге: ${moduleName}`);
        return;
      }

      if (REGISTRY[moduleName].lazy) {
        // Ленивая загрузка через IntersectionObserver
        this.intersectionObserver.observe(element);
      } else {
        // Немедленная загрузка
        this.mountModule(element, moduleName);
      }
    });
  }

  unmountAll() {
    this.mountedModules.forEach(({ unmount }, moduleName) => {
      try {
        if (typeof unmount === 'function') {
          unmount();
        }
      } catch (error) {
        console.error(`[MODULE ERROR] Ошибка размонтирования модуля ${moduleName}:`, error);
      }
    });
    this.mountedModules.clear();
  }
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
  const moduleManager = new ModuleManager();
  moduleManager.init();
  
  // Делаем менеджер доступным глобально для отладки
  window.moduleManager = moduleManager;
});