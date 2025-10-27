/**
 * GENESIS 1.1 - PWA Module
 * Service Worker регистрация и обработка обновлений
 */

import { showToast } from './ui.js';

let registration = null;
let updateAvailable = false;

/**
 * Регистрация Service Worker
 * @returns {Promise<ServiceWorkerRegistration|null>}
 */
export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Workers не поддерживаются в этом браузере');
    return null;
  }

  try {
    registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });

    console.log('✅ ServiceWorker зарегистрирован:', registration.scope);

    // Проверка обновлений
    registration.addEventListener('updatefound', handleUpdateFound);

    // Проверить, есть ли ожидающий SW
    if (registration.waiting) {
      handleWaiting(registration.waiting);
    }

    // Слушать изменения контроллера
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('🔄 Controller изменился, перезагрузка...');
      window.location.reload();
    });

    // Периодическая проверка обновлений (каждые 60 секунд)
    setInterval(() => {
      registration.update();
    }, 60000);

    return registration;
  } catch (error) {
    console.error('❌ Ошибка регистрации ServiceWorker:', error);
    return null;
  }
}

/**
 * Обработчик события updatefound
 */
function handleUpdateFound() {
  const newWorker = registration.installing;

  console.log('📦 Найдена новая версия приложения');

  newWorker.addEventListener('statechange', () => {
    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
      // Есть новая версия, готовая к активации
      handleWaiting(newWorker);
    }
  });
}

/**
 * Обработчик ожидающего Service Worker
 * @param {ServiceWorker} worker
 */
function handleWaiting(worker) {
  updateAvailable = true;

  console.log('✨ Новая версия готова к установке');

  // Показать уведомление пользователю
  showUpdateNotification(worker);
}

/**
 * Показать уведомление об обновлении
 * @param {ServiceWorker} worker
 */
function showUpdateNotification(worker) {
  // Создать кастомное уведомление с кнопкой обновления
  const notification = document.createElement('div');
  notification.id = 'update-notification';
  notification.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--surface-elevated);
    border: 1px solid var(--accent);
    border-radius: var(--radius-lg);
    padding: 16px 24px;
    box-shadow: var(--shadow-xl);
    z-index: 10000;
    display: flex;
    align-items: center;
    gap: 16px;
    animation: slideUp 0.3s ease-out;
    max-width: 90%;
    width: 400px;
  `;

  notification.innerHTML = `
    <div style="flex: 1;">
      <div style="font-weight: 600; color: var(--text-0); margin-bottom: 4px;">
        Доступна новая версия
      </div>
      <div style="font-size: 14px; color: var(--text-muted);">
        Обновите страницу для применения изменений
      </div>
    </div>
    <button id="update-btn" style="
      padding: 8px 16px;
      background: var(--accent);
      color: var(--text-0);
      border: none;
      border-radius: var(--radius-md);
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
    ">
      Обновить
    </button>
    <button id="dismiss-btn" style="
      padding: 8px;
      background: transparent;
      color: var(--text-muted);
      border: none;
      cursor: pointer;
      font-size: 20px;
      line-height: 1;
    ">
      ×
    </button>
  `;

  // Добавить анимацию
  if (!document.getElementById('pwa-animations')) {
    const style = document.createElement('style');
    style.id = 'pwa-animations';
    style.textContent = `
      @keyframes slideUp {
        from {
          transform: translate(-50%, 100px);
          opacity: 0;
        }
        to {
          transform: translate(-50%, 0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(notification);

  // Обработчик кнопки "Обновить"
  document.getElementById('update-btn').addEventListener('click', () => {
    worker.postMessage({ type: 'SKIP_WAITING' });
    notification.remove();
  });

  // Обработчик кнопки "Закрыть"
  document.getElementById('dismiss-btn').addEventListener('click', () => {
    notification.remove();
  });
}

/**
 * Проверить, установлено ли приложение как PWA
 * @returns {boolean}
 */
export function isInstalledPWA() {
  // Проверка standalone mode
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  const isIOSStandalone = 'standalone' in window.navigator && window.navigator.standalone;

  return isStandalone || isIOSStandalone;
}

/**
 * Показать промпт установки PWA
 */
let deferredPrompt = null;

export function setupInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (e) => {
    // Предотвратить автоматический промпт Chrome
    e.preventDefault();

    deferredPrompt = e;

    console.log('📱 PWA может быть установлено');

    // Можно показать кастомную кнопку установки
    showInstallButton();
  });

  // Отследить успешную установку
  window.addEventListener('appinstalled', () => {
    console.log('✅ PWA успешно установлено');
    showToast('Приложение установлено!', 'success');
    deferredPrompt = null;
  });
}

/**
 * Показать кнопку установки PWA
 */
function showInstallButton() {
  const installBtn = document.getElementById('install-pwa-btn');

  if (installBtn) {
    installBtn.style.display = 'inline-flex';

    installBtn.addEventListener('click', async () => {
      if (!deferredPrompt) return;

      // Показать промпт
      deferredPrompt.prompt();

      // Дождаться выбора пользователя
      const { outcome } = await deferredPrompt.userChoice;

      console.log(`Пользователь ${outcome === 'accepted' ? 'принял' : 'отклонил'} установку`);

      if (outcome === 'accepted') {
        showToast('Приложение устанавливается...', 'info');
      }

      deferredPrompt = null;
      installBtn.style.display = 'none';
    });
  }
}

/**
 * Получить информацию о Service Worker
 * @returns {object}
 */
export function getServiceWorkerInfo() {
  if (!registration) {
    return {
      supported: 'serviceWorker' in navigator,
      registered: false,
      updateAvailable: false
    };
  }

  return {
    supported: true,
    registered: true,
    scope: registration.scope,
    updateAvailable,
    installing: !!registration.installing,
    waiting: !!registration.waiting,
    active: !!registration.active
  };
}

/**
 * Инициализация PWA функций
 */
export async function initPWA() {
  console.log('🚀 Инициализация PWA...');

  // Регистрация Service Worker
  await registerServiceWorker();

  // Настройка промпта установки
  setupInstallPrompt();

  // Проверка установки
  if (isInstalledPWA()) {
    console.log('✅ Приложение запущено как PWA');
    document.body.classList.add('is-pwa');
  }
}

export default {
  initPWA,
  registerServiceWorker,
  isInstalledPWA,
  setupInstallPrompt,
  getServiceWorkerInfo
};
