const CACHE_NAME = 'bookerang-v1';
const ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './assets/icons/favicon.ico',
    './assets/icons/favicon-16x16.png',
    './assets/icons/favicon-32x32.png',
    './assets/icons/apple-touch-icon.png',
    './assets/icons/apple-touch-icon-180x180.png',
    './assets/icons/icon-192x192.png',
    './assets/icons/icon-512x512.png',
    './assets/icons/maskable-icon-192x192.png',
    './assets/icons/maskable-icon-512x512.png',
    './assets/application.css',
    './assets/application.js',
    './assets/rails-ujs.js',
    './assets/stimulus.min.js',
    './assets/stimulus-autoloader.js',
    './assets/stimulus-loading.js',
    './assets/turbo.min.js'
];

// Install service worker and cache all assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(ASSETS))
    );
});

// Fetch assets from cache first, then network
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cached version or fetch from network
                return response || fetch(event.request)
                    .then(response => {
                        // Cache new successful responses
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
                        // Return offline page if network request fails
                        if (event.request.mode === 'navigate') {
                            return caches.match('./index.html');
                        }
                    });
            })
    );
});

// Clean up old caches
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