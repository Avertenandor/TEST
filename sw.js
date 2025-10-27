/**
 * GENESIS 1.1 - Service Worker
 * Кэширование статики и стратегии работы
 */

const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `genesis-${CACHE_VERSION}`;

// Статические ресурсы для кэширования
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/src/styles/tokens.css',
  '/src/styles/theme-dark.css',
  '/src/js/validators.js',
  '/src/js/clipboard.js',
  '/src/js/ui.js',
  '/src/js/chart.js',
  '/src/js/pwa.js',
  '/public/icons/icon-192.png',
  '/public/icons/icon-512.png',
  '/public/manifest.json'
];

// ===== INSTALL =====
self.addEventListener('install', (event) => {
  console.log(`[SW] Installing ${CACHE_VERSION}...`);

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');

        // Кэшируем файлы по одному для обработки ошибок
        return Promise.allSettled(
          STATIC_ASSETS.map(url =>
            cache.add(url).catch(err => {
              console.warn(`[SW] Failed to cache ${url}:`, err.message);
              return null;
            })
          )
        );
      })
      .then(() => {
        console.log(`[SW] ${CACHE_VERSION} installed`);
        // Skip waiting для немедленной активации
        return self.skipWaiting();
      })
      .catch(err => {
        console.error('[SW] Install failed:', err);
      })
  );
});

// ===== ACTIVATE =====
self.addEventListener('activate', (event) => {
  console.log(`[SW] Activating ${CACHE_VERSION}...`);

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        // Удалить старые кэши
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName.startsWith('genesis-') && cacheName !== CACHE_NAME) {
              console.log('[SW] Removing old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log(`[SW] ${CACHE_VERSION} activated`);
        // Взять контроль над всеми клиентами
        return self.clients.claim();
      })
  );
});

// ===== FETCH =====
self.addEventListener('fetch', (event) => {
  const { request } = event;

  try {
    const url = new URL(request.url);

    // Пропускаем non-GET запросы
    if (request.method !== 'GET') {
      return;
    }

    // Пропускаем chrome-extension и другие протоколы
    if (url.protocol === 'chrome-extension:' || url.protocol === 'moz-extension:') {
      return;
    }

    // Пропускаем внешние API запросы (они должны идти напрямую)
    if (url.origin !== self.location.origin) {
      // Network-only для внешних ресурсов
      event.respondWith(fetch(request));
      return;
    }

    // Определяем стратегию
    const isStaticAsset = STATIC_ASSETS.some(asset => url.pathname === asset || url.pathname.endsWith(asset));

    if (isStaticAsset) {
      // Cache-First для статики
      event.respondWith(cacheFirst(request));
    } else {
      // Network-First (stale-while-revalidate) для остального
      event.respondWith(networkFirst(request));
    }
  } catch (error) {
    console.error('[SW] Fetch error:', error);
  }
});

// ===== CACHE-FIRST STRATEGY =====
async function cacheFirst(request) {
  try {
    // Проверяем кэш
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Если не в кэше, запрашиваем из сети
    const networkResponse = await fetch(request);

    // Кэшируем успешный ответ
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache-First failed:', error);

    // Fallback: пытаемся вернуть из кэша
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Если ничего нет, возвращаем offline-страницу или ошибку
    return new Response('Offline - ресурс недоступен', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({
        'Content-Type': 'text/plain'
      })
    });
  }
}

// ===== NETWORK-FIRST STRATEGY (Stale-While-Revalidate) =====
async function networkFirst(request) {
  try {
    // Пытаемся получить из сети
    const networkResponse = await fetch(request);

    // Кэшируем успешный ответ
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.warn('[SW] Network failed, trying cache:', error.message);

    // Если сеть недоступна, берём из кэша
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Если нет в кэше, возвращаем ошибку
    return new Response('Offline - страница недоступна', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({
        'Content-Type': 'text/html; charset=utf-8'
      })
    });
  }
}

// ===== MESSAGE HANDLER =====
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Received SKIP_WAITING message');
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLIENTS_CLAIM') {
    self.clients.claim();
  }
});

console.log(`[SW] Service Worker ${CACHE_VERSION} loaded`);
