/* /play/ service worker — exists so manifest-equipped games (Three Sisters
   first) are INSTALLABLE. Registered only by shells whose page carries a
   <link rel="manifest"> (see shell.js initInstall).
   NETWORK-FIRST, never cache-first (house rule: Hostinger ignores no-cache;
   a cache-first worker would pin players to stale builds). The cache is a
   pure offline fallback. Bump CACHE on any shipped change. */
var CACHE = "sws-play-v1";

self.addEventListener("install", function (e) {
  e.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        return k === CACHE ? null : caches["delete"](k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;
  e.respondWith(
    fetch(req).then(function (res) {
      if (res && res.status === 200 && res.type === "basic") {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); });
      }
      return res;
    })["catch"](function () {
      return caches.match(req, { ignoreSearch: true });
    })
  );
});
