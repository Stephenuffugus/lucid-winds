/* Jimothy service worker — installability + offline art. NETWORK-FIRST (house rule),
   so a deploy goes live the moment it lands; the cache is only the fallback. */
var CACHE = "jimothy-v28";
self.addEventListener("install", function (e) { e.waitUntil(self.skipWaiting()); });
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.map(function (k) { return k === CACHE ? null : caches["delete"](k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (e) {
  var req = e.request; if (req.method !== "GET") return;
  e.respondWith(fetch(req).then(function (res) {
    if (res && res.status === 200 && res.type === "basic") {
      var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); });
    }
    return res;
  })["catch"](function () { return caches.match(req, { ignoreSearch: true }); }));
});
