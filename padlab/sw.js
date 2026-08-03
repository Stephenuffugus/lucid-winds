/* PadLab service worker
   - App shell: cache-first with background refresh (works fully offline once visited)
   - Sample CDN (jsDelivr): cache-first, never expires (samples are immutable @version)
   Bump SHELL_VERSION whenever you deploy new app code, AND the ?v= on the
   registration in index.html in lockstep (this host edge-pins bare sw.js
   URLs for 7 days — a bare registration never sees updates).

   Host law (see PADLAB_PLAN.md):
   - caches.keys() is ORIGIN-wide: only ever delete padlab-* caches.
   - Every fetch-handler path must settle with a REAL Response. Never
     respondWith(undefined); never leave a navigation hanging on a dead fetch.
   - Navigations refetch with cache:'no-cache' — plain fetch(req) consults the
     HTTP cache, and this host's stale-while-revalidate serves day-old HTML. */

const SHELL_VERSION = "padlab-shell-v5";
const AUDIO_CACHE   = "padlab-audio-v1";
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
      // addAll fails the whole install if any single asset 404s, so add individually
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
          k.indexOf("padlab-") === 0 && k !== SHELL_VERSION && k !== AUDIO_CACHE
        ).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// A response for when everything (network + cache) is gone. A real Response,
// so the browser paints SOMETHING instead of the black screen.
function offlineFallback() {
  return new Response(
    "<!DOCTYPE html><meta charset=utf-8><meta name=viewport content='width=device-width,initial-scale=1'>" +
    "<body style='background:#0E0F12;color:#EEF0F2;font-family:system-ui;display:flex;align-items:center;" +
    "justify-content:center;height:100vh;margin:0;text-align:center'><div><h1 style='color:#F5A623'>PadLab</h1>" +
    "<p>Can't reach the app right now.<br>Check your connection and reload.</p></div></body>",
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

  // Navigations: network-first with a no-cache refetch (never the HTTP cache),
  // a timeout backstop, then shell cache, then a real offline page.
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

  // Streamed instrument/drum samples — cache forever, serve instantly after first play.
  if (url.hostname === "cdn.jsdelivr.net") {
    event.respondWith(
      caches.open(AUDIO_CACHE).then(cache =>
        cache.match(req).then(hit => {
          if (hit) return hit;
          return fetch(req).then(res => {
            if (res && res.status === 200) cache.put(req, res.clone());
            return res;
          });
        })
      ).catch(() => new Response("", { status: 504 }))
    );
    return;
  }

  // Google Fonts — cache so the app looks right offline.
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    event.respondWith(
      caches.open(AUDIO_CACHE).then(cache =>
        cache.match(req).then(hit =>
          hit || fetch(req).then(res => {
            if (res && res.status === 200) cache.put(req, res.clone());
            return res;
          }).catch(() => hit || new Response("", { status: 504 }))
        )
      ).catch(() => new Response("", { status: 504 }))
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

// Lets the page trigger an immediate update: navigator.serviceWorker.controller.postMessage('SKIP_WAITING')
self.addEventListener("message", event => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});
