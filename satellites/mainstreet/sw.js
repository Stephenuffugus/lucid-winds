/* MAINSTREET service worker. Versioned cache name, precache from art/manifest.json.
   Registration is skipped when window.SWS_EMBED is true (docs/FLEET.md); a vendored copy keeps this file at its own scope.
   On activate, delete ONLY caches whose name starts with "mainstreet-". Never touch another game's cache.
   rc9: an update lands on the next open. Install fetches the core files past the HTTP cache ({cache:'reload'}), so the edge
   cannot hand a new worker a stale page, then takes over at once (skipWaiting). The page itself (a navigation) is network
   first with a 3 second wait and falls back to the cached copy; everything else stays cache first. Every network call here
   races a timer, so a hung fetch can never leave respondWith or an install unsettled. */
var VERSION = 'DECK4-MS1-1.0.0-rc10';
var CACHE = 'mainstreet-' + VERSION;
var CORE = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './music/manifest.json'];
var PAGE_WAIT = 3000;      /* a navigation waits this long for the network before the cached page answers */
var NET_MAX = 20000;       /* no network call in this worker outlives this */
function noop() {}
function within(p, ms) { return new Promise(function (ok, no) { var t = setTimeout(function () { no(new Error('timeout')); }, ms); p.then(function (v) { clearTimeout(t); ok(v); }, function (e) { clearTimeout(t); no(e); }); }); }
function fetchFresh(u, mode) { return within(fetch(u, { cache: mode }), NET_MAX).then(function (r) { if (!r || !r.ok) throw new Error('bad response ' + (r && r.status)); return r; }); }
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) {
    /* the page itself must precache, or the old worker keeps the game; the rest is best effort */
    return Promise.all(CORE.map(function (u) {
      var put = fetchFresh(u, 'reload').then(function (r) { return c.put(u, r); });
      return /^\.\/(index\.html)?$/.test(u) ? put : put.catch(noop);
    })).then(function () {
      return fetchFresh('./art/manifest.json', 'no-cache').then(function (r) {
        var copy = r.clone();
        return r.json().then(function (j) { return c.put('./art/manifest.json', copy).then(function () { return Promise.all((j.files || []).map(function (f) { var u = './art/' + f.name; return fetchFresh(u, 'no-cache').then(function (res) { return c.put(u, res); }).catch(noop); })); }); });
      }).catch(noop);
    });
  }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k.indexOf('mainstreet-') === 0 && k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('message', function (e) { if (e.data === 'skipWaiting') self.skipWaiting(); });
/* the cached copy of a page: its own path (query ignored), else the game's page when the path is the game's folder or index.html */
function cachedPage(req) {
  var url = new URL(req.url);
  return caches.open(CACHE).then(function (c) {
    return c.match(req, { ignoreSearch: true }).then(function (hit) {
      if (hit || !/\/(index\.html)?$/.test(url.pathname)) return hit;
      return c.match(new URL('./index.html', self.location.href).href);
    });
  }).catch(function () { return undefined; });
}
/* the host lets an edge or the browser serve index.html up to a day stale (max-age=300, stale-while-revalidate=86400), so the
   page is asked for with cache:'no-cache': one revalidation per open, a 304 when nothing changed */
function revalidated(req) { try { return new Request(req, { cache: 'no-cache' }); } catch (err) { return req; } }
function page(e) {
  var req = e.request, url = new URL(req.url), key = url.origin + url.pathname, stored = null;
  var net = within(fetch(revalidated(req)), NET_MAX).then(function (res) {
    if (res && res.ok) { var copy = res.clone(); stored = caches.open(CACHE).then(function (c) { return c.put(key, copy); }).catch(noop); }
    return res;
  });
  /* a slow network that answers after the cached page did still refreshes the cache for the next open */
  e.waitUntil(net.then(function () { return stored; }, noop));
  return within(net, PAGE_WAIT).then(function (res) {
    if (res.ok || res.type === 'opaqueredirect') return res;
    return cachedPage(req).then(function (hit) { return hit || res; });
  }, function () {
    return cachedPage(req).then(function (hit) { return hit || net.catch(function () { return Response.error(); }); });
  });
}
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  var url = new URL(e.request.url); if (url.origin !== self.location.origin) return;
  if (e.request.mode === 'navigate') { e.respondWith(page(e)); return; }
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(function (hit) {
    if (hit) return hit;
    return within(fetch(e.request), NET_MAX).then(function (res) {
      if (res && res.ok && (url.pathname.indexOf('/art/') >= 0 || url.pathname.indexOf('/music/') >= 0)) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(e.request, copy); }); }
      return res;
    }, function () { return Response.error(); });
  }));
});
