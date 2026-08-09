/* ⛔ 2026-07-31 BLACK SCREEN SWEEP. Stephen: a game sometimes opens on a black
   screen, and going back sometimes lands on one too. Two defects, in five
   workers, that combine into exactly that:

   1. NO TIMEOUT. fetch() only REJECTS on a hard failure. A hung request (what a
      flaky mobile signal actually produces) never settles, so respondWith()
      never settles, so the browser paints nothing. Forever, until a reload.
   2. ORIGIN-WIDE CACHE DELETION. caches.keys() is scoped to the ORIGIN, not to
      the worker's scope, so `k === CACHE ? null : delete(k)` deleted every OTHER
      worker's cache on lucidwinds.com. Four workers were wiping each other on
      every deploy, which is why the cache fallback in (1) usually had nothing
      to fall back TO.

   Fixes: race every fetch against a timeout, never hand respondWith undefined,
   and only ever delete caches carrying this worker's own prefix. */
/* Dewball service worker.
   Exists so the game is INSTALLABLE (Chrome will not offer "Add to Home Screen"
   without a service worker that has a fetch handler and works offline).

   Strategy is deliberately NETWORK-FIRST, never cache-first. Hostinger already
   ignores no-cache headers on us; a cache-first worker on top of that would pin
   players to a stale build and we would be debugging ghosts. The cache here is a
   pure offline fallback: we always try the network, and only reach for the cache
   when the network fails. Bump CACHE on any shipped change to evict the old shell. */
var CACHE = "dewball-v10";

/* Never let a hung request hang the page. fetch() only rejects on a hard
   failure; a half-connected phone leaves it pending forever, and a pending
   respondWith paints nothing. Race it, and always resolve to SOMETHING. */
var NET_TIMEOUT = 5000;
function raceNet(p) {
  return new Promise(function (resolve, reject) {
    var done = false;
    var t = setTimeout(function () { if (!done) { done = true; reject(new Error("timeout")); } }, NET_TIMEOUT);
    p.then(function (v) { if (!done) { done = true; clearTimeout(t); resolve(v); } },
           function (e) { if (!done) { done = true; clearTimeout(t); reject(e); } });
  });
}
/* respondWith(undefined) fails the request outright, which looks identical to a
   black screen. Every fallback ends here. */
function lastResort(req) {
  return caches.match(req, { ignoreSearch: true }).then(function (hit) {
    if (hit) return hit;
    if (req.mode === "navigate") {
      return caches.match("./index.html", { ignoreSearch: true }).then(function (shell) {
        return shell || offlineResponse();
      });
    }
    return offlineResponse();
  })["catch"](offlineResponse);
}
function offlineResponse() {
  return new Response(
    '<!DOCTYPE html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
    + '<style>html,body{height:100%;margin:0;background:#0d100c;color:#e8dcc8;font-family:system-ui,-apple-system,sans-serif}'
    + 'main{min-height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:28px;text-align:center}'
    + 'h1{font-size:20px;margin:0;color:#c8a84b}p{margin:0;max-width:19em;line-height:1.5;color:#b9c0a8}'
    + 'a,button{min-height:52px;display:flex;align-items:center;justify-content:center;padding:0 26px;border-radius:13px;'
    + 'border:1px solid #3d5230;background:#1a2415;color:#cfe0c2;font-size:16px;font-weight:700;text-decoration:none;width:min(320px,100%)}'
    + 'button{background:#c8a84b;color:#1a1608;border-color:#e0c76b}</style>'
    + '<main><h1>That did not load</h1><p>The connection went quiet while this was opening. '
    + 'Your games and your sunbeams are safe.</p>'
    + '<button onclick="location.reload()">Try again</button>'
    + '<a href="/portal/">Back to the arcade</a></main>',
    { status: 503, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
}

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
        // only OUR caches: caches.keys() is origin-wide.
        return (k.indexOf("dewball-") === 0 && k !== CACHE) ? caches["delete"](k) : null;
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;
  e.respondWith(
    raceNet(
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
    )).then(function (res) {
      // refresh the offline copy in the background; only same-origin, only real hits
      if (res && res.status === 200 && res.type === "basic") {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); })["catch"](function () {});
      }
      return res;
    })["catch"](function () {
      return lastResort(req);
    })
  );
});
