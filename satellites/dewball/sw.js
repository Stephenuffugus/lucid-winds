/* Dewball service worker.
   Exists so the game is INSTALLABLE (Chrome will not offer "Add to Home Screen"
   without a service worker that has a fetch handler and works offline).

   Strategy is deliberately NETWORK-FIRST, never cache-first. Hostinger already
   ignores no-cache headers on us; a cache-first worker on top of that would pin
   players to a stale build and we would be debugging ghosts. The cache here is a
   pure offline fallback: we always try the network, and only reach for the cache
   when the network fails. Bump CACHE on any shipped change to evict the old shell. */
var CACHE = "dewball-v3";
var SHELL = ["./", "./index.html", "./three.min.js", "./manifest.webmanifest",
             "./icons/icon-192.png", "./icons/icon-512.png"];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function (c) { return c.addAll(SHELL); })
      .then(function () { return self.skipWaiting(); })
      ["catch"](function () { return self.skipWaiting(); })  // a missing asset must not block install
  );
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
    /* 2026-07-27: fetch(req) is NOT "network" — it consults the browser HTTP
       cache first, and the host stamps HTML stale-while-revalidate=86400,
       licensing a DAY-OLD page without a server round trip. That is the
       clear-data-works-then-breaks-again cycle. Navigations revalidate for
       real (304 when unchanged); a navigate Request can't carry RequestInit,
       so refetch by URL and re-issue any redirect as a real one. */
    (req.mode === "navigate"
      ? fetch(req.url, { cache: "no-cache", credentials: "same-origin" }).then(function (res) {
          return (res && res.redirected) ? Response.redirect(res.url, 302) : res;
        })
      : fetch(req)
    ).then(function (res) {
      // refresh the offline copy in the background; only same-origin, only real hits
      if (res && res.status === 200 && res.type === "basic") {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); })["catch"](function () {});
      }
      return res;
    })["catch"](function () {
      return caches.match(req).then(function (hit) {
        return hit || caches.match("./index.html");
      });
    })
  );
});
