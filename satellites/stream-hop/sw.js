/* Jimothy service worker — installability + offline art. NETWORK-FIRST (house rule),
   so a deploy goes live the moment it lands; the cache is only the fallback.

   2026-07-25 splash-freeze fix. Three bugs made the installed app hang on the
   splash screen until browser data was cleared:

   1. NO TIMEOUT. `fetch()` only rejects on hard network failure. On a slow or
      half-connected network (and Hostinger LiteSpeed under load) the promise
      just sits there, so respondWith never settles and the splash spins
      forever. The cache was right there and never got used. Now every request
      races a 4s timer and falls back to cache when the network dawdles.

   2. respondWith(undefined). `caches.match()` resolves to undefined on a miss,
      and handing undefined to respondWith fails the request outright. Now
      every path returns a real Response.

   3. ACTIVATE RACE. skipWaiting + clients.claim means a new SW takes over a
      LIVE page mid-boot, and activate immediately deleted every other cache.
      A page still pulling assets found its cache deleted underneath it, hit
      bug 2, and died. Deploying constantly made this fire constantly. Cache
      cleanup now runs after the claim, on a delay, and only touches our own
      versioned caches. */
var CACHE = "jimothy-v81";
var NET_TIMEOUT = 4000;

self.addEventListener("install", function (e) { e.waitUntil(self.skipWaiting()); });

self.addEventListener("activate", function (e) {
  e.waitUntil(self.clients.claim().then(function () {
    // Sweep old caches AFTER claiming, and only ours. Delay so any in-flight
    // fetch on the page we just claimed has had time to resolve first.
    return new Promise(function (r) { setTimeout(r, 3000); }).then(function () {
      return caches.keys().then(function (keys) {
        return Promise.all(keys.map(function (k) {
          return (k.indexOf("jimothy-") === 0 && k !== CACHE) ? caches["delete"](k) : null;
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
      return caches.match("/satellites/stream-hop/", { ignoreSearch: true }).then(function (shell) {
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

    /* 2026-07-27: fetch(req) is NOT "network" — it consults the browser HTTP
       cache first, and the host stamps HTML stale-while-revalidate=86400,
       licensing a DAY-OLD page without a server round trip. That is the
       clear-data-works-then-breaks-again cycle. Navigations revalidate for
       real (304 when unchanged); a navigate Request can't carry RequestInit,
       so refetch by URL and re-issue any redirect as a real one. */
    var live = req.mode === "navigate"
      ? fetch(req.url, { cache: "no-cache", credentials: "same-origin" }).then(function (res) {
          return (res && res.redirected) ? Response.redirect(res.url, 302) : res;
        })
      : fetch(req);
    live.then(function (res) {
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
