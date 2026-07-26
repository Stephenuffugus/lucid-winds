/* Nectar Drop service worker — installability + offline art. NETWORK-FIRST (house rule),
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
var CACHE = "nectar-drop-v6";
var NET_TIMEOUT = 4000;

self.addEventListener("install", function (e) { e.waitUntil(self.skipWaiting()); });

self.addEventListener("activate", function (e) {
  e.waitUntil(self.clients.claim().then(function () {
    // Sweep old caches AFTER claiming, and only ours. Delay so any in-flight
    // fetch on the page we just claimed has had time to resolve first.
    return new Promise(function (r) { setTimeout(r, 3000); }).then(function () {
      return caches.keys().then(function (keys) {
        return Promise.all(keys.map(function (k) {
          return (k.indexOf("nectar-drop-") === 0 && k !== CACHE) ? caches["delete"](k) : null;
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
      return caches.match("/satellites/nectar-drop/", { ignoreSearch: true }).then(function (shell) {
        return shell || new Response("Offline", { status: 503, statusText: "Offline" });
      });
    }
    /* ⛔ FAIL HONESTLY. This used to hand back an empty 200-ish body, which for a
       <script> or <img> is worse than failing: an empty script does not throw, so
       the page believes it loaded and breaks somewhere far away instead. A real
       network error lets onerror fire and the app notice. */
    return Response.error();
  });
}

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;

  /* ⛔⛔ CROSS-ORIGIN REQUESTS GO STRAIGHT TO THE NETWORK. NEVER TOUCH THEM.
     Stephen 2026-07-26: "if I open the game and then sign in, then close it and
     open it again from the homescreen, it half loads a slightly expanded splash
     and won't load all the way."

     THIS WAS MY BUG, introduced by the splash-hang fix earlier the same day.
     That fix wrapped EVERY request, including third-party ones. The Sunbeam SDK
     lazy-loads Firebase from gstatic.com, so a signed-in player pulls scripts
     from another origin. Those are never cacheable here (res.type is not
     "basic"), so on a slow launch the 4s timeout fired, fromCache missed, and it
     handed the page an EMPTY 504 body — for a <script> tag. An empty script does
     not throw. It silently "succeeds", firebase never defines, and the app
     half-boots forever.

     Signed-OUT players never load Firebase, which is exactly why only signing in
     triggered it, and why it looked like the bug we thought was fixed.

     A service worker has no business proxying other people's origins. */
  var sameOrigin = true;
  try { sameOrigin = new URL(req.url).origin === self.location.origin; } catch (err) {}
  if (!sameOrigin) return;

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
