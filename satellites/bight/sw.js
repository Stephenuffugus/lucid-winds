/* BIGHT service worker. The house pattern (docs/fleet/reference-sw.js, Mainstreet rc9):
   - install fetches the core files past the HTTP cache ({cache:'reload'}), then takes over at once (skipWaiting), so an
     update lands on the next open instead of waiting for every tab to close;
   - activate deletes ONLY caches named "bight-..." (caches.keys() is origin wide; never touch another game's cache);
   - a navigation is network first with a 3 second wait, then the cached page; everything else is cache first;
   - every network call races a timer, so a hung fetch can never leave respondWith or an install unsettled.
   VERSION must equal 'BIGHT-' + BUILD in index.html (dev/check.mjs enforces it). */
var VERSION = 'BIGHT-1.0.0-rc3';
var CACHE = 'bight-' + VERSION;
var CORE = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png'];
var PAGE_WAIT = 3000;
var NET_MAX = 20000;
function noop() {}
function within(p, ms) { return new Promise(function (ok, no) { var t = setTimeout(function () { no(new Error('timeout')); }, ms); p.then(function (v) { clearTimeout(t); ok(v); }, function (e) { clearTimeout(t); no(e); }); }); }
function fetchFresh(u, mode) { return within(fetch(u, { cache: mode }), NET_MAX).then(function (r) { if (!r || !r.ok) throw new Error('bad response ' + (r && r.status)); return r; }); }
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) {
    return Promise.all(CORE.map(function (u) {
      var put = fetchFresh(u, 'reload').then(function (r) { return c.put(u, r); });
      return /^\.\/(index\.html)?$/.test(u) ? put : put.catch(noop);
    }));
  }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k.indexOf('bight-') === 0 && k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('message', function (e) { if (e.data === 'skipWaiting') self.skipWaiting(); });
function cachedPage(req) {
  var url = new URL(req.url);
  return caches.open(CACHE).then(function (c) {
    return c.match(req, { ignoreSearch: true }).then(function (hit) {
      if (hit || !/\/(index\.html)?$/.test(url.pathname)) return hit;
      return c.match(new URL('./index.html', self.location.href).href);
    });
  }).catch(function () { return undefined; });
}
function revalidated(req) { try { return new Request(req, { cache: 'no-cache' }); } catch (err) { return req; } }
function page(e) {
  var req = e.request, url = new URL(req.url), key = url.origin + url.pathname, stored = null;
  var net = within(fetch(revalidated(req)), NET_MAX).then(function (res) {
    if (res && res.ok) { var copy = res.clone(); stored = caches.open(CACHE).then(function (c) { return c.put(key, copy); }).catch(noop); }
    return res;
  });
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
    return within(fetch(e.request), NET_MAX).then(function (res) { return res; }, function () { return Response.error(); });
  }));
});
