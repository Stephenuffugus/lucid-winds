/* Flipbook service worker — installability + offline art. NETWORK-FIRST (house rule),
   so a deploy goes live the moment it lands; the cache is only the fallback.

   2026-07-25 splash-freeze sweep. Three bugs in the old copy-pasted template
   hung the INSTALLED app on its splash screen until browser data was cleared
   (found in Jimothy, identical here):

   1. NO TIMEOUT. `fetch()` only rejects on hard network failure. On a slow or
      half-connected network the promise never settles, so respondWith never
      settles, so the splash spins forever while a good cache sits unused.
   2. respondWith(undefined). `caches.match()` resolves to undefined on a miss,
      and handing undefined to respondWith fails the request outright.
   3. ACTIVATE RACE. skipWaiting + clients.claim takes over a LIVE page mid-boot,
      and activate deleted every cache immediately, so a page still pulling
      assets lost its cache underneath it and hit bug 2. Fired on every deploy. */
var CACHE = "flipbook-v4";
var NET_TIMEOUT = 4000;

self.addEventListener("install", function (e) { e.waitUntil(self.skipWaiting()); });

self.addEventListener("activate", function (e) {
  e.waitUntil(self.clients.claim().then(function () {
    // Sweep old caches AFTER claiming, and only ours. Delay so any in-flight
    // fetch on the page we just claimed has had time to resolve first.
    return new Promise(function (r) { setTimeout(r, 3000); }).then(function () {
      return caches.keys().then(function (keys) {
        return Promise.all(keys.map(function (k) {
          return (k.indexOf("flipbook-") === 0 && k !== CACHE) ? caches["delete"](k) : null;
        }));
      });
    });
  }));
});

function fromCache(req) {
  return caches.match(req, { ignoreSearch: true }).then(function (hit) {
    if (hit) return hit;
    // A navigation with no exact hit still has somewhere to go: the app shell.
    if (req.mode === "navigate") {
      return caches.match("/satellites/flipbook/", { ignoreSearch: true }).then(function (shell) {
        return shell || new Response("Offline", { status: 503, statusText: "Offline" });
      });
    }
    return new Response("", { status: 504, statusText: "Offline and not cached" });
  });
}

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;

  e.respondWith(new Promise(function (resolve) {
    var settled = false;
    function done(res) { if (!settled) { settled = true; resolve(res); } }

    // Network-first, but only for as long as the network is actually trying.
    var timer = setTimeout(function () {
      if (!settled) fromCache(req).then(done);
    }, NET_TIMEOUT);

    fetch(req).then(function (res) {
      clearTimeout(timer);
      if (res && res.status === 200 && res.type === "basic") {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); })["catch"](function () {});
      }
      // If the timeout already served from cache, the fresh copy is still
      // cached above for next time. Nothing to do but drop this one.
      done(res);
    })["catch"](function () {
      clearTimeout(timer);
      fromCache(req).then(done);
    });
  }));
});
