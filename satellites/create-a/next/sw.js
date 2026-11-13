/* Create-A service worker: the game works with the network off.
   The page itself is fetched network first (an online player gets a new build at once), with the cache as the fallback
   (and after 4 s of a slow network the cached page answers). Icons and the manifest: the cache answers, refreshed behind.
   The Google font is cached the first time it loads (and the page falls back to a rounded system font without it). */
const CACHE = 'create-a-m2-1';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'icons/apple-touch-icon.png'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
const put = (req, res) => { if (res && res.ok) { const cp = res.clone(); caches.open(CACHE).then((c) => c.put(req, cp)); } return res; };
const cachedPage = (req) => caches.match(req, { ignoreSearch: true }).then((h) => h || caches.match('index.html')).then((h) => h || caches.match('./'));
self.addEventListener('fetch', (e) => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const font = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  if (font) { // cache first, empty stylesheet when offline and never cached
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => put(req, res))
      .catch(() => url.hostname === 'fonts.googleapis.com' ? new Response('', { headers: { 'Content-Type': 'text/css' } }) : Response.error())));
    return;
  }
  if (url.origin !== location.origin) return;
  const page = req.mode === 'navigate' || /\/$|\.html$/.test(url.pathname);
  if (page) { // network first, the cache when offline or slow
    e.respondWith(new Promise((resolve) => {
      let done = false; const fin = (r) => { if (!done && r) { done = true; resolve(r); } };
      const net = fetch(req).then((res) => { put(req.mode === 'navigate' ? new Request(url.origin + url.pathname) : req, res); if (res.ok) fin(res); else cachedPage(req).then((h) => fin(h || res)); return res; })
        .catch(() => cachedPage(req).then((h) => fin(h || Response.error())));
      setTimeout(() => { if (!done) cachedPage(req).then((h) => { if (h) fin(h); else net.then(fin); }); }, 4000);
    }));
    return;
  }
  // the other files: the cache at once, refreshed from the network behind
  e.respondWith(caches.match(req).then((hit) => {
    const net = fetch(req).then((res) => put(req, res)).catch(() => hit);
    return hit || net;
  }));
});
