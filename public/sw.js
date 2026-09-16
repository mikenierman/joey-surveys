/* Minimal service worker — shell + static data cache for installable PWA */
const CACHE = 'joey-merch-v1';
const PRECACHE = ['/', '/index.html', '/data/stores.json', '/manifest.json', '/data/programs/joey-circlek.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetched = fetch(request)
        .then((res) => {
          if (res && res.ok && request.url.startsWith(self.location.origin)) {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || fetched;
    })
  );
});

self.addEventListener('push', (event) => {
  const body = event.data ? event.data.text() : 'New merchandising assignment';
  event.waitUntil(
    self.registration.showNotification('JOEY Merch', {
      body,
      icon: '/branding/d2r-mark.png',
    })
  );
});
