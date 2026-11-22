/* Bubblenaut service worker (22 Nov 2026, the Play gates): the offline shell. Shape and scars from the number games'
   workers (satellites/brim/sw.js), which the fleet's host law shaped:

   - caches.keys() is origin wide: only bubblenaut-shell- caches are ever deleted, or this worker wipes every other game.
   - every fetch settles with a real Response: a network that accepts and never answers is given up on after
     NET_TIMEOUT_MS, for navigations and for anything not yet cached, never left pending (the black screen scar).
   - navigations refetch with cache: 'no-cache', because this host serves day old HTML from its HTTP cache.
   - ⛔ A NAVIGATION IS SAVED UNDER ITS OWN PAGE (the fault the Play queue's first five hit on 13 Nov): the game's page
     (a path ending in / or index.html, whatever its query) is the shell; any other page, privacy.html above all, is
     keyed by its own path and offline is answered from its own entry or the offline page, never from the game's.
   - other origins are never touched (the Sunbeam SDK's Firebase scripts, the music streams): the network has them.
   - SHELL_VERSION moves on every deploy that changes a file below, and so does the ?v= on the registration.
   Precached: the page and what a first launch draws (title, hero, effects, items, the Moss Moon world), about 3 MB. The
   other four worlds' art (about 4.5 MB) is kept as the player reaches each world, never precached.
*/

const SHELL_VERSION = 'bubblenaut-shell-20261122a';
const NET_TIMEOUT_MS = 4000;
const SCOPE = new URL('./', self.location).pathname;   /* only this game's own files are kept as they are fetched; the shared scripts and the music stay the network's */

const SHELL_ASSETS = [
  './',
  './index.html',
  './privacy.html',
  './manifest.webmanifest?v=5',
  './icon-192-v2.png',
  './icon-512-v2.png',
  './art/r1/title.webp',
  './art/r1/hero.webp',
  './art/r1/fx.webp',
  './art/r1/items.webp',
  './art/r1/moss_moon.webp',
  './art/r1/tiles_moss_moon.webp',
  './art/r1/bg_moss_moon.webp'
];

const within = (promise, ms) => Promise.race([promise, new Promise(resolve => setTimeout(() => resolve(null), ms))]);

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(SHELL_VERSION)
      .then(cache => Promise.all(SHELL_ASSETS.map(url =>
        within(fetch(url, { cache: 'no-cache', credentials: 'same-origin' }).catch(() => null), NET_TIMEOUT_MS * 3)
          .then(res => (res && res.ok) ? cache.put(url, res) : null)
          .catch(() => null)
      )))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.indexOf('bubblenaut-shell-') === 0 && k !== SHELL_VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function offlinePage() {
  return new Response(
    '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">'
    + '<body style="margin:0;height:100vh;display:flex;align-items:center;justify-content:center;background:#070b16;'
    + 'color:#e8eef8;font-family:system-ui,sans-serif;text-align:center;padding:24px"><p>Bubblenaut needs one visit with the internet first.</p></body>',
    { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
}

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (req.headers.has('range')) return;   /* a media range request is the network's; a cached 200 cannot answer it */

  if (req.mode === 'navigate') {
    const shell = /\/(index\.html)?$/.test(url.pathname) ? './index.html' : url.origin + url.pathname;
    event.respondWith(
      within(fetch(req.url, { cache: 'no-cache', credentials: 'same-origin' }).catch(() => null), NET_TIMEOUT_MS)
        .then(res => {
          if (res && res.ok && !res.redirected) {
            const copy = res.clone();
            caches.open(SHELL_VERSION).then(c => c.put(shell, copy)).catch(() => {});
            return res;
          }
          if (res && res.redirected) return Response.redirect(res.url);
          return caches.match(shell, { ignoreSearch: true }).then(hit => hit || res || offlinePage());
        })
    );
    return;
  }

  /* everything else: the cache first, refreshed behind; a miss waits NET_TIMEOUT_MS at most, then a 504 */
  event.respondWith(
    caches.match(req).then(hit => {
      const network = within(fetch(req).then(res => {
        if (res && res.status === 200 && res.type === 'basic' && url.pathname.indexOf(SCOPE) === 0) {
          const copy = res.clone();
          caches.open(SHELL_VERSION).then(c => c.put(req, copy)).catch(() => {});
        }
        return res;
      }).catch(() => null), NET_TIMEOUT_MS * (hit ? 1 : 3)).then(res => res || new Response('', { status: 504 }));
      return hit || network;
    })
  );
});
