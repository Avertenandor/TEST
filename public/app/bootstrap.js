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
      await this.loadCSS(paths.css);
      
      // Загружаем и монтируем модуль
      const module = await import(paths.js);
      const unmount = await module.default.mount(element, CONFIG);
      
      this.mountedModules.set(moduleName, { element, unmount });
      
      console.log(`[MODULE] Модуль ${moduleName} успешно смонтирован`);
    } catch (error) {
      console.error(`[MODULE ERROR] Ошибка монтирования модуля ${moduleName}:`, error);
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
      link.onerror = reject;
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