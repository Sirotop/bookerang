const CACHE_NAME = 'bookerang-v1';
const ASSETS_TO_CACHE = [
    '.',
    './index.html',
    './manifest.json',
    // Android icons
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    '/icons/maskable-icon-192x192.png',
    '/icons/maskable-icon-512x512.png',
    // iOS icons
    '/icons/apple-touch-icon.png',
    '/icons/apple-touch-icon-180x180.png',
    // Favicons
    '/icons/favicon-16x16.png',
    '/icons/favicon-32x32.png',
];

// Install event: cache all static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Cache opened');
                // Use Promise.allSettled instead of Promise.all to handle missing files gracefully
                return Promise.allSettled(
                    ASSETS_TO_CACHE.map(url =>
                        cache.add(url).catch(error => {
                            console.warn(`Failed to cache ${url}:`, error);
                            return null;
                        })
                    )
                );
            })
            .then(() => {
                return self.skipWaiting();
            })
    );
});

// Your existing activate event handler remains the same
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((cacheName) => {
                            return cacheName !== CACHE_NAME;
                        })
                        .map((cacheName) => {
                            return caches.delete(cacheName);
                        })
                );
            })
            .then(() => {
                return self.clients.claim();
            })
    );
});

// Modified fetch event handler with improved offline experience
self.addEventListener('fetch', (event) => {
    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    // Handle GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    // Special handling for icon requests
    if (event.request.url.includes('/icons/')) {
        event.respondWith(
            caches.match(event.request)
                .then((cachedResponse) => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    // For icons, try the network and cache the result
                    return fetch(event.request)
                        .then((response) => {
                            if (!response || response.status !== 200) {
                                return response;
                            }
                            const responseToCache = response.clone();
                            caches.open(CACHE_NAME)
                                .then((cache) => {
                                    cache.put(event.request, responseToCache);
                                });
                            return response;
                        })
                        .catch(() => {
                            // For failed icon requests, return a default icon if available
                            return caches.match('/icons/icon-192x192.png');
                        });
                })
        );
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }

                return fetch(event.request)
                    .then((response) => {
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch(() => {
                        // Return a more user-friendly offline page
                        if (event.request.mode === 'navigate') {
                            return new Response(
                                `
                                <html>
                                    <head>
                                        <title>Offline - Bookerang</title>
                                        <style>
                                            body { 
                                                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                                                padding: 2rem;
                                                text-align: center;
                                                color: #B85042;
                                                background: #E7E8D1;
                                            }
                                            h1 { margin-bottom: 1rem; }
                                        </style>
                                    </head>
                                    <body>
                                        <h1>You're offline</h1>
                                        <p>Please check your internet connection and try again.</p>
                                    </body>
                                </html>
                                `,
                                {
                                    headers: { 'Content-Type': 'text/html' }
                                }
                            );
                        }
                        return new Response('Offline content not available');
                    });
            })
    );
});

// Your existing message event handler remains the same
self.addEventListener('message', (event) => {
    if (event.data === 'skipWaiting') {
        self.skipWaiting();
    }
});

// Modified push notification handler with better icon handling
self.addEventListener('push', (event) => {
    if (event.data) {
        const options = {
            body: event.data.text(),
            icon: '/icons/notification-icon-96x96.png',
            badge: '/icons/notification-icon-72x72.png',
            vibrate: [100, 50, 100],
            data: {
                dateOfArrival: Date.now(),
                primaryKey: 1
            }
        };

        event.waitUntil(
            self.registration.showNotification('Bookerang', options)
        );
    }
});

// Your existing sync event handler remains the same
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-books') {
        event.waitUntil(Promise.resolve());
    }
});