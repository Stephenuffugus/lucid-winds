/* Glyph Forge — service worker
   Caches the game shell for offline play. Art-slots are NOT cached on first
   visit (too large); they cache on use, so the first online session captures
   them, and subsequent offline sessions render with all hydrated art.
*/
/* Bump this string on every deploy — `activate` purges any cache whose key
   != CACHE, so a new value force-evicts the old shell and the fresh
   index.html is fetched. (Unrelated to the localStorage save key.) */
const CACHE = 'gf-shell-2026-07-05-b25';
/* Only ever delete caches that belong to THIS app. `caches` is shared by the
   whole origin, so an unfiltered sweep deletes every sibling app's cache too. */
const OWNED = /^gf\-/;
const SHELL = [
  './',
  './index.html',
  './manifest.json',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE && OWNED.test(k)).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // network-first for the html so we get updates fast
  if(url.pathname.endsWith('.html') || url.pathname.endsWith('/')){
    e.respondWith(
      fetch(e.request).then(r => {
        const copy = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return r;
      }).catch(() => caches.match(e.request, {ignoreSearch:true}) || caches.match('./index.html'))
    );
    return;
  }
  // cache-first for art and assets
  e.respondWith(
    caches.match(e.request).then(r =>
      r || fetch(e.request).then(resp => {
        const copy = resp.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return resp;
      })
    )
  );
});
