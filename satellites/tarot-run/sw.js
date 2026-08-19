/* Tarot Run — service worker
   Network-first for shell (so deploys propagate fast); cache-first for art assets.
*/
const CACHE = 'tarot-run-v2';
/* Only ever delete caches that belong to THIS app. `caches` is shared by the
   whole origin, so an unfiltered sweep deletes every sibling app's cache too. */
const OWNED = /^tarot\-run\-/;
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
  if(url.origin !== self.location.origin) return;
  // network-first for html
  if(url.pathname.endsWith('.html') || url.pathname.endsWith('/')){
    e.respondWith(
      fetch(e.request).then(r => {
        const copy = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return r;
      }).catch(() => caches.match(e.request))
    );
    return;
  }
  // cache-first for everything else (art etc.)
  e.respondWith(
    caches.match(e.request).then(r =>
      r || fetch(e.request).then(resp => {
        if(resp.ok && e.request.method === 'GET'){
          const copy = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return resp;
      })
    )
  );
});
