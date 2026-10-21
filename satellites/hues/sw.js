/* Hues service worker: offline shell + runtime cache (20 Oct 2026, for the Google Play listing).
   Modelled on Flock the World's worker, which has shipped on Play since September.

   Host law (learned the hard way across this fleet):
   - caches.keys() is ORIGIN-wide. Only ever delete hues-* caches, or this worker
     wipes every other satellite on lucidwinds.com.
   - Every fetch path must settle with a REAL Response. Never respondWith(undefined),
     never leave a navigation hanging on a dead fetch (the black screen).
   - Navigations refetch with cache:'no-cache': a plain fetch consults the HTTP cache
     and this host's stale-while-revalidate serves day-old HTML.

   Bump SHELL_VERSION on every deploy, AND the ?v= on the registration in index.html
   in lockstep: this host edge-pins bare sw.js URLs for 7 days. */

const SHELL_VERSION  = "hues-shell-v20261021b";
const ASSET_CACHE    = "hues-assets-v1";
const FLEET_CACHE    = "hues-fleet-v1";
const NAV_TIMEOUT_MS = 8000;
const SCOPE = self.registration.scope;   /* .../satellites/hues/ on lucidwinds.com and on the github.io mirror */

const SHELL_ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png",
  "./icon.svg"
];

/* Same-origin fleet files Hues loads from outside its folder. They change with fleet deploys
   and carry no version, so they are network first and the cached copy is only the offline answer. */
const FLEET = ["/music-unlocks.js", "/music-catalog.js", "/sunbeam-sdk.js", "/feedback.js"];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(SHELL_VERSION)
      // addAll would fail the whole install on any single 404, so add one by one
      .then(cache => Promise.all(
        SHELL_ASSETS.map(url =>
          fetch(url, { cache: "no-cache", credentials: "same-origin" })
            .then(res => (res && res.ok) ? cache.put(url, res) : null)
            .catch(() => null)
        )
      ))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k =>
          // ONLY our own caches; other workers on this origin own the rest
          k.indexOf("hues-") === 0 && k !== SHELL_VERSION && k !== ASSET_CACHE && k !== FLEET_CACHE
        ).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// A real Response for when network and cache are both gone, so the browser paints something.
function offlineFallback() {
  return new Response(
    "<!DOCTYPE html><meta charset=utf-8><meta name=viewport content='width=device-width,initial-scale=1'>" +
    "<body style='background:#0a0a0c;color:#f3f1ec;font:16px/1.6 system-ui;display:flex;align-items:center;" +
    "justify-content:center;height:100vh;margin:0;text-align:center'><div><h1 style='font-size:20px'>Offline</h1>" +
    "<p>Hues could not load and nothing is saved on this phone yet.<br>Open it once online and it plays offline after that.</p></div>",
    { headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}

function withTimeout(promise, ms) {
  return new Promise(resolve => {
    let settled = false;
    const t = setTimeout(() => { if (!settled) { settled = true; resolve(null); } }, ms);
    promise.then(res => { if (!settled) { settled = true; clearTimeout(t); resolve(res); } },
                 ()  => { if (!settled) { settled = true; clearTimeout(t); resolve(null); } });
  });
}

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;                       // fonts and the rest: the browser handles them

  // Fleet scripts outside our folder: network first (timed out), cached copy offline, else let it fail as a script would.
  if (url.href.indexOf(SCOPE) !== 0) {
    if (FLEET.indexOf(url.pathname) < 0) return;
    event.respondWith(
      withTimeout(fetch(req, { cache: "no-cache" }), NAV_TIMEOUT_MS).then(res => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(FLEET_CACHE).then(c => c.put(url.pathname, copy)).catch(() => {});
          return res;
        }
        return caches.match(url.pathname, { cacheName: FLEET_CACHE })
          .then(hit => hit || new Response("", { status: 504, headers: { "Content-Type": "text/javascript" } }));
      })
    );
    return;
  }

  // Navigations: network first (no-cache, timed out), cached shell second, a real offline page last.
  if (req.mode === "navigate") {
    event.respondWith(
      withTimeout(fetch(req, { cache: "no-cache" }), NAV_TIMEOUT_MS).then(res => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(SHELL_VERSION).then(c => c.put("./index.html", copy)).catch(() => {});
          return res;
        }
        return caches.match("./index.html").then(hit => hit || offlineFallback());
      })
    );
    return;
  }

  // Our own files (icons, manifest, frame art): the cached copy at once, refreshed in the background,
  // so a frame replaced in place still updates on the next visit.
  event.respondWith(
    caches.match(req).then(hit => {
      const net = fetch(req).then(res => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(ASSET_CACHE).then(c => c.put(req, copy)).catch(() => {});
        }
        return res;
      }).catch(() => null);
      if (hit) { event.waitUntil(net); return hit; }
      return net.then(res => res || new Response("", { status: 504 }));
    })
  );
});
