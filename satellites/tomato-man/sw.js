/* Tomato Man service worker — offline app shell for standalone install.
   Bump CACHE to force-refresh the cached shell on a new release. */
const CACHE = 'tomato-man-v3';
/* Only ever delete caches that belong to THIS app. `caches` is shared by the
   whole origin, so an unfiltered sweep deletes every sibling app's cache too. */
const OWNED = /^tomato\-man\-/;
const SHELL = [
  './', 'index.html', 'manifest.webmanifest',
  'thumbnail.png', 'icon-192.png', 'icon-512.png', 'icon-512-maskable.png'
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL).catch(() => {})));
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE && OWNED.test(k)).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== location.origin) return; // leave cross-origin alone

  // The page itself: network-first so online players always get the latest build,
  // cache fallback so it still launches with no connection.
  if (req.mode === 'navigate') {
    e.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        (await caches.open(CACHE)).put('index.html', fresh.clone());
        return fresh;
      } catch (_) {
        return (await caches.match('index.html')) || (await caches.match('./')) || Response.error();
      }
    })());
    return;
  }

  // Static assets: cache-first, fill the cache on first network hit.
  e.respondWith((async () => {
    const cached = await caches.match(req);
    if (cached) return cached;
    try {
      const fresh = await fetch(req);
      if (fresh && fresh.status === 200) (await caches.open(CACHE)).put(req, fresh.clone());
      return fresh;
    } catch (_) {
      return cached || Response.error();
    }
  })());
});
