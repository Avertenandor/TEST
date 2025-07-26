// MCP-BREADCRUMB:GEN1.1 > sw.js
// MCP-TAGS:javascript, service-worker, cache, offline, pwa
/**
 * GENESIS 1.1 - Service Worker
 * MCP-MARKER:MODULE:SERVICE_WORKER - Service Worker
 * MCP-MARKER:FILE:SW_JS - Основной файл Service Worker
 * Обеспечивает офлайн функциональность и кэширование
 */

// MCP-MARKER:SECTION:CACHE_CONFIG - Конфигурация кэша
const CACHE_NAME = 'genesis-v1.1.0';
const urlsToCache = [
    '/',
    '/index.html',
    '/cabinet.html',
    '/css/styles.css',
    '/css/mobile.css',
    '/css/pwa-visibility-fix.css',
    '/css/fonts-local.css',
    '/js/config.js',
    '/js/app.js',
    '/js/models.js',
    '/js/services/api.js',
    '/js/services/auth.js',
    '/js/services/cabinet.js',
    '/js/services/terminal.js',
    '/js/services/transaction.js',
    '/js/services/utils.js',
    '/assets/favicon.ico',
    '/assets/manifest.json',
    '/assets/icons/favicon-16x16.png',
    '/assets/icons/favicon-32x32.png',
    '/assets/icons/favicon-48x48.png'
];

// Установка Service Worker
self.addEventListener('install', event => {
    // MCP-MARKER:FUNCTION:INSTALL_EVENT - Установка Service Worker
    console.log('[ServiceWorker] Install');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[ServiceWorker] Caching app shell');
                // Кэшируем файлы по одному для лучшей обработки ошибок
                return Promise.allSettled(
                    urlsToCache.map(url => 
                        cache.add(url).catch(error => {
                            console.warn(`[ServiceWorker] Failed to cache ${url}:`, error);
                            return null;
                        })
                    )
                );
            })
            .catch(error => {
                console.error('[ServiceWorker] Cache failed:', error);
            })
    );
    
    // Активируем новый Service Worker сразу
    self.skipWaiting();
});

// Активация Service Worker
self.addEventListener('activate', event => {
    // MCP-MARKER:FUNCTION:ACTIVATE_EVENT - Активация Service Worker
    console.log('[ServiceWorker] Activate');
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[ServiceWorker] Removing old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    
    // Берем контроль над всеми клиентами
    self.clients.claim();
});

// Обработка запросов
self.addEventListener('fetch', event => {
    // MCP-MARKER:FUNCTION:FETCH_EVENT - Обработка fetch-запросов
    const { request } = event;
    const url = new URL(request.url);
    
    // Пропускаем запросы к внешним API и не-GET запросы
    if (url.origin !== location.origin || 
        url.pathname.includes('/api/') || 
        request.method !== 'GET') {
        return;
    }
    
    // Стратегия: Network First с fallback на кэш
    event.respondWith(
        fetch(request)
            .then(response => {
                // Проверяем валидность ответа
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }
                
                // Клонируем ответ для кэша
                const responseToCache = response.clone();
                
                caches.open(CACHE_NAME)
                    .then(cache => {
                        cache.put(request, responseToCache);
                    })
                    .catch(error => {
                        console.warn('[ServiceWorker] Failed to cache response:', error);
                    });
                
                return response;
            })
            .catch(error => {
                console.log('[ServiceWorker] Network failed, trying cache:', error);
                
                // Если сеть недоступна, пытаемся взять из кэша
                return caches.match(request)
                    .then(response => {
                        if (response) {
                            console.log('[ServiceWorker] Serving from cache:', request.url);
                            return response;
                        }
                        
                        // Возвращаем офлайн страницу для навигационных запросов
                        if (request.mode === 'navigate') {
                            return caches.match('/index.html');
                        }
                        
                        // Для других запросов возвращаем пустой ответ
                        return new Response('', {
                            status: 404,
                            statusText: 'Not Found'
                        });
                    })
                    .catch(cacheError => {
                        console.error('[ServiceWorker] Cache match failed:', cacheError);
                        
                        // Последний fallback - офлайн страница
                        if (request.mode === 'navigate') {
                            return caches.match('/index.html');
                        }
                        
                        return new Response('', {
                            status: 503,
                            statusText: 'Service Unavailable'
                        });
                    });
            })
    );
});

// Обработка push уведомлений
self.addEventListener('push', event => {
    // MCP-MARKER:FUNCTION:PUSH_EVENT - Обработка push-уведомлений
    console.log('[ServiceWorker] Push received');
    
    const options = {
        body: event.data ? event.data.text() : 'Новое уведомление от GENESIS',
        icon: '/assets/icons/icon-192x192.png',
        badge: '/assets/icons/favicon-32x32.png',
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'Открыть кабинет',
                icon: '/assets/icons/shortcut-cabinet.png'
            },
            {
                action: 'close',
                title: 'Закрыть',
                icon: '/assets/icons/favicon-32x32.png'
            }
        ],
        requireInteraction: false,
        silent: false
    };
    
    event.waitUntil(
        self.registration.showNotification('GENESIS 1.1', options)
            .catch(error => {
                console.error('[ServiceWorker] Failed to show notification:', error);
            })
    );
});

// Обработка клика по уведомлению
self.addEventListener('notificationclick', event => {
    // MCP-MARKER:FUNCTION:NOTIFICATION_CLICK_EVENT - Клик по уведомлению
    console.log('[ServiceWorker] Notification click received');
    
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/cabinet.html')
                .catch(error => {
                    console.error('[ServiceWorker] Failed to open window:', error);
                })
        );
    }
});

// Обработка сообщений от клиента
self.addEventListener('message', event => {
    // MCP-MARKER:FUNCTION:MESSAGE_EVENT - Сообщения от клиента
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.delete(CACHE_NAME)
                .then(() => {
                    console.log('[ServiceWorker] Cache cleared');
                    return self.clients.matchAll();
                })
                .then(clients => {
                    clients.forEach(client => {
                        client.postMessage({
                            type: 'CACHE_CLEARED'
                        });
                    });
                })
                .catch(error => {
                    console.error('[ServiceWorker] Failed to clear cache:', error);
                })
        );
    }
    
    if (event.data && event.data.type === 'GET_CACHE_STATUS') {
        event.waitUntil(
            caches.keys()
                .then(cacheNames => {
                    event.ports[0].postMessage({
                        type: 'CACHE_STATUS',
                        caches: cacheNames
                    });
                })
                .catch(error => {
                    console.error('[ServiceWorker] Failed to get cache status:', error);
                    event.ports[0].postMessage({
                        type: 'CACHE_STATUS_ERROR',
                        error: error.message
                    });
                })
        );
    }
});

// Синхронизация в фоне
self.addEventListener('sync', event => {
    // MCP-MARKER:FUNCTION:SYNC_EVENT - Фоновая синхронизация
    console.log('[ServiceWorker] Sync event:', event.tag);
    
    if (event.tag === 'sync-deposits') {
        event.waitUntil(syncDeposits());
    }
});

// Функция синхронизации депозитов
async function syncDeposits() {
    // MCP-MARKER:FUNCTION:SYNC_DEPOSITS - Синхронизация депозитов
    try {
        const cache = await caches.open(CACHE_NAME);
        // Здесь можно добавить логику синхронизации с сервером
        console.log('[ServiceWorker] Deposits synced');
    } catch (error) {
        console.error('[ServiceWorker] Sync failed:', error);
    }
}

// Обработка ошибок Service Worker
self.addEventListener('error', event => {
    // MCP-MARKER:FUNCTION:ERROR_EVENT - Ошибка Service Worker
    console.error('[ServiceWorker] Error:', event.error);
});

self.addEventListener('unhandledrejection', event => {
    // MCP-MARKER:FUNCTION:UNHANDLED_REJECTION - Необработанное исключение
    console.error('[ServiceWorker] Unhandled rejection:', event.reason);
});

console.log('[ServiceWorker] Loaded version:', CACHE_NAME);