/* Flock the World service worker — offline shell + runtime asset cache.

   Host law (learned the hard way across this fleet):
   - caches.keys() is ORIGIN-wide. Only ever delete ftw-* caches, or this
     worker wipes every other satellite on lucidwinds.com.
   - Every fetch path must settle with a REAL Response. Never
     respondWith(undefined), never leave a navigation hanging on a dead fetch,
     or the player gets a black screen the portal then bounces them out of.
   - Navigations refetch with cache:'no-cache' — a plain fetch consults the
     HTTP cache and this host's stale-while-revalidate serves day-old HTML.

   Bump SHELL_VERSION on every deploy, AND the ?v= on the registration in
   index.html in lockstep — this host edge-pins bare sw.js URLs for 7 days. */

const SHELL_VERSION  = "ftw-shell-v20260905c";
const ASSET_CACHE    = "ftw-assets-v1";
const NAV_TIMEOUT_MS = 8000;

const SHELL_ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png",
  "./art/bg/wordmark.webp",
  "./wire-corpus.js"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(SHELL_VERSION)
      // addAll would fail the whole install on any single 404 — add one by one
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
          // ONLY our own caches — other workers on this origin own the rest
          k.indexOf("ftw-") === 0 && k !== SHELL_VERSION && k !== ASSET_CACHE
        ).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// A real Response for when network and cache are both gone, so the browser
// paints something instead of nothing.
function offlineFallback() {
  return new Response(
    "<!DOCTYPE html><meta charset=utf-8><meta name=viewport content='width=device-width,initial-scale=1'>" +
    "<body style='background:#05070b;color:#dfe9f0;font:16px/1.6 system-ui;display:flex;align-items:center;" +
    "justify-content:center;height:100vh;margin:0;text-align:center'><div><h1 style='font-size:20px'>Offline</h1>" +
    "<p>Flock the World could not load and nothing is cached yet.<br>Open it once online and it works offline after that.</p></div>",
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
  if (url.origin !== location.origin) return;                    // other origins: browser handles it
  if (url.pathname.indexOf("/satellites/flock-the-world/") !== 0) return; // our scope only

  // Navigations: network first (no-cache, timed out), cached shell second,
  // a real offline page last. Never a hung respondWith.
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

  // Static assets (art/, sfx/, icons, manifest): cache first, then network,
  // then whatever the shell holds. Art and sfx files never change in place
  // (replacements arrive under new names or ?v= stamps), so cache-first is
  // safe and makes the whole game work offline after one session.
  event.respondWith(
    caches.match(req).then(hit => {
      if (hit) return hit;
      return fetch(req).then(res => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(ASSET_CACHE).then(c => c.put(req, copy)).catch(() => {});
        }
        return res;
      }).catch(() => caches.match("./index.html").then(h => h || offlineFallback()));
    })
  );
});
