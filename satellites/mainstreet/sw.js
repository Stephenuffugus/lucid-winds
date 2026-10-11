/* MAINSTREET service worker. Cache-first, versioned name, precache from art/manifest.json.
   Registration is skipped when window.SWS_EMBED is true (docs/FLEET.md); a vendored copy has this file removed.
   On activate, delete ONLY caches whose name starts with "mainstreet-". Never touch another game's cache. */
var VERSION = 'DECK3-MS1-1.0.0-rc6';
var CACHE = 'mainstreet-' + VERSION;
var CORE = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './music/manifest.json'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) {
    return Promise.all(CORE.map(function (u) { return c.add(u).catch(function () {}); })).then(function () {
      return fetch('./art/manifest.json', { cache: 'no-cache' }).then(function (r) {
        if (!r.ok) return; var copy = r.clone();
        return r.json().then(function (j) { return c.put('./art/manifest.json', copy).then(function () { return Promise.all((j.files || []).map(function (f) { return c.add('./art/' + f.name).catch(function () {}); })); }); });
      }).catch(function () {});
    });
  }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k.indexOf('mainstreet-') === 0 && k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('message', function (e) { if (e.data === 'skipWaiting') self.skipWaiting(); });
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  var url = new URL(e.request.url); if (url.origin !== self.location.origin) return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(function (hit) {
    if (hit) return hit;
    return fetch(e.request).then(function (res) {
      if (res && res.ok && (url.pathname.indexOf('/art/') >= 0 || url.pathname.indexOf('/music/') >= 0)) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(e.request, copy); }); }
      return res;
    });
  }));
});
