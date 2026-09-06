/* WHISTLESTOP service worker — offline shell, single app file.

   Host law (learned the hard way across this fleet):
   - caches.keys() is ORIGIN-wide. Only ever delete whistlestop-* caches, or
     this worker wipes PadLab and every other satellite on lucidwinds.com.
   - Every fetch path must settle with a REAL Response. Never
     respondWith(undefined), never leave a navigation hanging on a dead fetch,
     or the player gets a black screen the portal then bounces them out of.
   - Navigations refetch with cache:'no-cache' — a plain fetch consults the
     HTTP cache and this host's stale-while-revalidate serves day-old HTML.

   Bump SHELL_VERSION on every deploy, AND the ?v= on the registration in
   index.html in lockstep — this host edge-pins bare sw.js URLs for 7 days. */

const SHELL_VERSION = "whistlestop-shell-20260906b";
const SFX_CACHE     = "whistlestop-unused-v1"; // no recorded audio: every sound is synthesised
const NAV_TIMEOUT_MS = 8000;

const SHELL_ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png"
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
          k.indexOf("whistlestop-") === 0 && k !== SHELL_VERSION && k !== SFX_CACHE
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
    "<body style='background:#8E6B44;color:#FBF3E2;font-family:system-ui;display:flex;align-items:center;" +
    "justify-content:center;height:100vh;margin:0;text-align:center'><div><h1 style='color:#3A2B1B'>WHISTLESTOP</h1>" +
    "<p>Cannot reach the rug right now.<br>Check your connection and reload.</p></div></body>",
    { status: 503, headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}

function navTimeout(ms) {
  return new Promise(resolve => setTimeout(() => resolve(null), ms));
}

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Navigations: network-first with a no-cache refetch, a timeout backstop,
  // then the shell cache, then a real offline page.
  if (req.mode === "navigate") {
    event.respondWith(
      Promise.race([
        fetch(req.url, { cache: "no-cache", credentials: "same-origin" })
          .then(res => {
            if (res && res.redirected) return Response.redirect(res.url);
            if (res && res.ok) {
              const copy = res.clone();
              caches.open(SHELL_VERSION).then(c => c.put("./index.html", copy)).catch(() => {});
              return res;
            }
            return res || null;
          })
          .catch(() => null),
        navTimeout(NAV_TIMEOUT_MS)
      ]).then(res =>
        res ||
        caches.match("./index.html").then(hit =>
          hit || caches.match("./").then(h2 => h2 || offlineFallback())
        )
      )
    );
    return;
  }

  // Same-origin subresources (manifest, icons) — cache-first, refresh behind.
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(req).then(hit => {
        const network = fetch(req).then(res => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(SHELL_VERSION).then(c => c.put(req, copy)).catch(() => {});
          }
          return res;
        }).catch(() => hit || new Response("", { status: 504 }));
        return hit || network;
      })
    );
  }
});

self.addEventListener("message", event => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});
