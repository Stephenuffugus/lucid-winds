/* Ripcord service worker. One HTML file, three icons, a manifest; that is the
   whole game, so the cache is small and the rules are the fleet's hard-won ones.

   ⛔ caches.keys() is ORIGIN wide. Only ever delete rc-* caches, or this worker
      wipes every other satellite on lucidwinds.com. That failure took the whole
      fleet down once.
   ⛔ Every fetch path must settle with a REAL Response. Never respondWith of
      undefined, never leave a navigation hanging on a dead fetch, or the player
      gets a black screen and the portal bounces them out of it.
   ⛔ Navigations refetch with cache:'no-cache' because this host serves
      stale-while-revalidate and would otherwise hand back yesterday's HTML.
   ⛔ Bump SHELL_VERSION and the ?v= on the registration in index.html together.
      A bare sw.js URL is edge pinned for seven days on this host. */

const SHELL_VERSION  = "rc-shell-v20260830c";
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
      .then(c => c.addAll(SHELL_ASSETS))
      .catch(() => {})          // a missing icon must never block an install
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k.indexOf("rc-") === 0 && k !== SHELL_VERSION)
            .map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function timedFetch(request, ms) {
  return new Promise(resolve => {
    let settled = false;
    const done = r => { if (!settled) { settled = true; resolve(r); } };
    const timer = setTimeout(() => done(null), ms);
    fetch(request).then(r => { clearTimeout(timer); done(r); },
                        () => { clearTimeout(timer); done(null); });
  });
}

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;   // never touch another origin

  // Navigations: network first with a hard timeout, cache as the safety net,
  // and a real Response no matter what happens, because a hung navigation is
  // the black screen bug.
  if (req.mode === "navigate") {
    event.respondWith((async () => {
      const fresh = await timedFetch(new Request(req.url, { cache: "no-cache" }), NAV_TIMEOUT_MS);
      if (fresh && fresh.ok) {
        try { (await caches.open(SHELL_VERSION)).put("./index.html", fresh.clone()); } catch (e) {}
        return fresh;
      }
      const cached = (await caches.match("./index.html")) || (await caches.match("./"));
      if (cached) return cached;
      if (fresh) return fresh;
      return new Response(
        "<!doctype html><meta charset=utf-8><title>Ripcord</title>" +
        "<body style='background:#160F0C;color:#EDE6D8;font:16px system-ui;display:grid;place-items:center;height:100vh;margin:0'>" +
        "<p>Ripcord is offline and has no copy saved yet. Reconnect and reload.</p>",
        { headers: { "Content-Type": "text/html; charset=utf-8" }, status: 200 });
    })());
    return;
  }

  /* ⛔ THE ART MANIFEST IS NEVER SERVED FROM THE CACHE FIRST. Everything below
     is cache-first with runtime caching and no revalidation, which is right for
     a shell that only changes when the build stamp does. The manifest is the one
     file that changes WITHOUT a rebuild: cutting a new part rewrites it. Served
     cache-first, a phone that had loaded it once would never see a part painted
     after that. Network first here, cache only as the offline fallback. */
  if (url.pathname.indexOf("/assets/parts/manifest.json") >= 0) {
    event.respondWith((async () => {
      const net = await timedFetch(req, NAV_TIMEOUT_MS);
      if (net && net.ok) {
        try { (await caches.open(SHELL_VERSION)).put(req, net.clone()); } catch (e) {}
        return net;
      }
      const hit = await caches.match(req);
      return hit || new Response('{"parts":{}}',
        { headers: { "Content-Type": "application/json" }, status: 200 });
    })());
    return;
  }

  // Everything else: cache first, then network, then a real 504 rather than a
  // rejected promise.
  event.respondWith((async () => {
    const hit = await caches.match(req);
    if (hit) return hit;
    const net = await timedFetch(req, NAV_TIMEOUT_MS);
    if (net) {
      if (net.ok) { try { (await caches.open(SHELL_VERSION)).put(req, net.clone()); } catch (e) {} }
      return net;
    }
    return new Response("", { status: 504, statusText: "offline" });
  })());
});
