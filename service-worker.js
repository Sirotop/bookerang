const CACHE_NAME = 'bookerang-v1';
const ASSETS = [
    '.',
    'index.html',
    'manifest.json',
    './assets/icons/favicon.ico',
    './assets/icons/favicon-16x16.png',
    './assets/icons/favicon-32x32.png',
    './assets/icons/apple-touch-icon.png',
    './assets/icons/apple-touch-icon-180x180.png',
    './assets/icons/icon-192x192.png',
    './assets/icons/icon-512x512.png',
    './assets/icons/maskable-icon-192x192.png',
    './assets/icons/maskable-icon-512x512.png',
    './assets/application-8b441ae0.css',
    './assets/application-d8a8613a.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return Promise.allSettled(
                    ASSETS.map(url =>
                        cache.add(url).catch(error => {
                            console.warn(`Failed to cache ${url}:`, error);
                            return null;
                        })
                    )
                );
            })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                return response || fetch(event.request)
                    .then(response => {
                        if (response.status === 200) {
                            const responseClone = response.clone();
                            caches.open(CACHE_NAME)
                                .then((cache) => {
                                    cache.put(event.request, responseClone);
                                });
                        }
                        return response;
                    })
                    .catch(() => {
                        if (event.request.mode === 'navigate') {
                            return caches.match('index.html');
                        }
                    });
            })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});