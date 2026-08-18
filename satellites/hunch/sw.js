// HUNCH service worker — offline shell. The game still needs the network for
// /api/claude (the AI calls), but the app frame loads instantly and works offline
// up to the point of submitting a drawing.
//
// Strategy: network-FIRST for the HTML/navigation (so a fresh deploy shows up
// immediately and we never get stuck on a stale UI), cache-first for other
// static assets, with a cache fallback when offline. Bump CACHE on each deploy
// you want to force-refresh.
const CACHE = 'hunch-v6';
/* Only ever delete caches that belong to THIS app. `caches` is shared by the
   whole origin, so an unfiltered sweep deletes every sibling app's cache too. */
const OWNED = /^hunch\-/;
const ASSETS = ['./', './index.html', './data/prompts.js', './manifest.webmanifest', './icons/icon.svg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE && OWNED.test(k)).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.pathname.includes('/api/')) return; // never cache API calls

  // Network-first for page navigations / HTML so the latest UI always wins.
  const isHTML = e.request.mode === 'navigate'
    || (e.request.headers.get('accept') || '').includes('text/html')
    || url.pathname === '/' || url.pathname.endsWith('.html');

  if (isHTML) {
    e.respondWith(
      fetch(e.request).then(resp => {
        if (resp.ok && url.origin === location.origin) {
          const clone = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return resp;
      }).catch(() => caches.match(e.request).then(hit => hit || caches.match('./index.html')))
    );
    return;
  }

  // Cache-first for everything else (static assets).
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(resp => {
      if (resp.ok && url.origin === location.origin) {
        const clone = resp.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return resp;
    }).catch(() => caches.match('./index.html')))
  );
});
