/* GAUGE service worker: the offline shell (plans/gauge/HANDOFF-GAUGE.md P3; CATALOG-PLAN D2; the shape and scars of
   the catalog's earlier workers).

   The fleet's host law, learned the hard way:
   - caches.keys() is origin wide: only gauge- caches are ever deleted, or this worker wipes every other game.
   - every fetch settles with a real Response: a network that accepts and never answers is given up on after
     NET_TIMEOUT_MS, for navigations and for anything not yet cached, never left pending (the black screen scar).
   - navigations refetch with cache: 'no-cache', because this host serves day old HTML from its HTTP cache.
   - SHELL_VERSION moves with GAUGE's stamp, and so does the ?v= on the registration in main.js.
   - ⛔ a module imported at two addresses must be precached at both: core.js imports pure.js and STAMP.js at CORE's stamp;
     GAUGE's engine.js ALSO imports pure.js at GAUGE's stamp, so pure.js is precached at both addresses (CREASE's scar). */

const SHELL_VERSION = 'gauge-shell-20260916h';
const NET_TIMEOUT_MS = 4000;

const SHELL_ASSETS = [
  './',
  './index.html',
  './main.js?v=20260916h',
  './engine.js?v=20260916h',
  './decimal.js?v=20260916h',
  './content.js?v=20260916h',
  './config.js?v=20260916h',
  './case.js?v=20260916h',
  './sprites.js?v=20260916h',
  './manifest.webmanifest?v=20260916h',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
  '../math/core/core.css?v=20260916h',
  '../math/core/core.js?v=20260916h',
  '../math/core/pure.js?v=20260916h',
  '../math/core/pure.js?v=20260915e',
  '../math/core/STAMP.js?v=20260915e'
];

/* a promise, or null after ms: the one way a silent network is given up on */
const within = (promise, ms) => Promise.race([promise, new Promise(resolve => setTimeout(() => resolve(null), ms))]);

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(SHELL_VERSION)
      /* one by one, so a single missing file cannot fail the whole install */
      .then(cache => Promise.all(SHELL_ASSETS.map(url =>
        within(fetch(url, { cache: 'no-cache', credentials: 'same-origin' }).catch(() => null), NET_TIMEOUT_MS * 2)
          .then(res => (res && res.ok) ? cache.put(url, res) : null)
          .catch(() => null)
      )))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.indexOf('gauge-') === 0 && k !== SHELL_VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* a real page for a first visit with no network, so the browser paints something */
function offlinePage() {
  return new Response(
    '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">'
    + '<body style="margin:0;height:100vh;display:flex;align-items:center;justify-content:center;background:#efe8da;'
    + 'color:#26282b;font-family:system-ui,sans-serif;text-align:center"><p>Gauge needs one visit with the internet first.</p></body>',
    { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
}

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  /* a page: the network first, no older than the host's copy, for NET_TIMEOUT_MS at most; then the cached shell */
  if (req.mode === 'navigate') {
    event.respondWith(
      within(fetch(req.url, { cache: 'no-cache', credentials: 'same-origin' }).catch(() => null), NET_TIMEOUT_MS)
        .then(res => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(SHELL_VERSION).then(c => c.put('./index.html', copy)).catch(() => {});
            return res;
          }
          return caches.match('./index.html').then(hit => hit || res || offlinePage());
        })
    );
    return;
  }

  /* everything else: the cache first, refreshed behind; a miss waits NET_TIMEOUT_MS at most, then a 504 */
  event.respondWith(
    caches.match(req).then(hit => {
      const network = within(fetch(req).then(res => {
        if (res && res.status === 200) {
          const copy = res.clone();
          caches.open(SHELL_VERSION).then(c => c.put(req, copy)).catch(() => {});
        }
        return res;
      }).catch(() => null), NET_TIMEOUT_MS).then(res => res || new Response('', { status: 504 }));
      return hit || network;
    })
  );
});
