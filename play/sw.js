/* /play/ service worker — exists so manifest-equipped games are INSTALLABLE
   (registered by shell.js initInstall on every shell that carries a
   <link rel="manifest"> — since the 2026-07-26 PWA sweep that is ALL of them).
   NETWORK-FIRST, never cache-first. The cache is a pure offline fallback.
   Bump CACHE on any shipped change.

   ⛔ THE JULY-27 LESSON: fetch(req) inside a worker is NOT "network" —
   it consults the browser HTTP cache first, and this host stamps HTML with
   stale-while-revalidate=86400, which licenses that cache to serve a DAY-OLD
   page without revalidating. Result: installed/portal players got yesterday's
   shells (with yesterday's ?v= stamps) while a typed incognito URL was fresh.
   Pages therefore fetch with cache:"no-cache" — a conditional revalidation
   (304 when unchanged, so it costs headers, not bytes). Subresources keep the
   plain fetch: they are ?v-stamped, and rebuilding no-cors requests from a
   bare URL would break them. */
var CACHE = "sws-play-v2";

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
  // Pages (top-level + iframe navigations) must revalidate with the server.
  // A navigate Request can't carry RequestInit, so refetch by URL; if the
  // host answers with a redirect, re-issue it as a real one — a navigation
  // handed a followed-redirect response is a network error in Chrome.
  var live = req.mode === "navigate"
    ? fetch(req.url, { cache: "no-cache", credentials: "same-origin" }).then(function (res) {
        return (res && res.redirected) ? Response.redirect(res.url, 302) : res;
      })
    : fetch(req);
  e.respondWith(
    live.then(function (res) {
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
