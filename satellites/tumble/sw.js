// TUMBLE service worker (OPUS_PROMPT: cache first for local assets, network for the CDN with a
// cache fallback). Studio rules this file keeps:
//   - every fetch path settles with a real Response (a hung promise paints a black screen)
//   - only caches whose name starts with this game's prefix are ever deleted (caches are origin wide)
//   - the host caching law (lucidwinds.com, measured 2026-07-27): the edge and the browser keep old copies of
//     un-versioned files, and fetch() inside a worker reads the browser HTTP cache. So:
//       * this file is registered as sw.js?v=VERSION (index.html), bumped with VERSION here and in src/config.js
//       * install fetches every local file as <file>?v=VERSION (a URL no cache has seen) and stores it under the
//         plain name, so a new version never inherits a stale copy
//       * pages are fetched network first with cache: 'no-cache'; local files are served from this version's
//         cache only (no background refresh, which could put a stale edge copy over a fresh one)
const PREFIX = 'tumble-';
const VERSION = '20260921g';
const LOCAL = PREFIX + 'local-' + VERSION;
const CDN = PREFIX + 'cdn-v1';
const TIMEOUT = 6000;

const PRECACHE = [
  './', 'index.html', 'manifest.webmanifest', 'sw.js',
  'src/app.js', 'src/game.js', 'src/ui.js', 'src/screens.js', 'src/room.js', 'src/render.js', 'src/table.js',
  'src/play.js', 'src/physics.js', 'src/session.js', 'src/loadgen.js', 'src/economy.js', 'src/save.js',
  'src/audio.js', 'src/input.js', 'src/atlas.js', 'src/geo.js', 'src/config.js', 'src/mathx.js',
  'src/silhouettes.js', 'src/textures.js', 'src/debug.js', 'src/unlockall.js', 'src/pick.js', 'src/coins.js',
  'engine/sockgen.js', 'engine/sha256.js', 'engine/color.js', 'engine/flat.js', 'engine/atlas-worker.js',
  'assets/geo/placeholder.js', 'assets/geo/manifest.json',
  'data/hero-socks.json', 'data/lore.json', 'data/unlocks.json', 'data/clothesline.json',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png',
];

// the pinned engine files from the import map: fetched at install, so a second launch works offline even though
// the first visit loaded them before this worker existed
const CDN_PRECACHE = [
  'https://cdn.jsdelivr.net/npm/three@0.186.0/build/three.module.js',
  'https://cdn.jsdelivr.net/npm/three@0.186.0/build/three.core.js',
  'https://cdn.jsdelivr.net/npm/three@0.186.0/examples/jsm/geometries/RoundedBoxGeometry.js',
  'https://cdn.jsdelivr.net/npm/three@0.186.0/examples/jsm/environments/RoomEnvironment.js',
  'https://cdn.jsdelivr.net/npm/@dimforge/rapier3d-compat@0.20.0/dist/rapier.mjs',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    Promise.all([
      caches.open(LOCAL).then((c) => Promise.all(PRECACHE.map((u) => {
        const url = new URL(u, self.location);
        const fresh = new URL(url);
        fresh.searchParams.set('v', VERSION);
        return fetch(new Request(fresh.href, { cache: 'reload' }))
          .then((res) => (res && res.ok ? c.put(url.href, res) : null))
          .catch(() => null);
      }))),
      caches.open(CDN).then((c) => Promise.all(CDN_PRECACHE.map((u) => c.match(u).then((hit) => hit || c.add(new Request(u, { mode: 'cors' }))).catch(() => null)))),
    ]).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.map((k) => (k.indexOf(PREFIX) === 0 && k !== LOCAL && k !== CDN ? caches.delete(k) : null))))
      .then(() => self.clients.claim())
  );
});

function timeout(ms) {
  return new Promise((resolve) => setTimeout(() => resolve(null), ms));
}

function offline() {
  return new Response('TUMBLE is offline and this file was never cached.', { status: 503, headers: { 'content-type': 'text/plain' } });
}

async function cacheFirst(req) {
  const c = await caches.open(LOCAL);
  const hit = await c.match(req, { ignoreSearch: true });
  if (hit) return hit;
  try {
    const res = await Promise.race([fetch(req), timeout(TIMEOUT)]);
    if (res && res.ok) { const copy = res.clone(); caches.open(LOCAL).then((c) => c.put(req, copy)); }
    return res || offline();
  } catch (err) {
    return offline();
  }
}

// A page: the newest copy from the network (revalidated, never a day old copy from the HTTP cache), else the cache.
async function pageFirst(req) {
  try {
    const res = await Promise.race([fetch(req.url, { cache: 'no-cache', credentials: 'same-origin' }), timeout(TIMEOUT)]);
    if (res && res.ok) {
      // a navigation may not be answered with a redirected response: send the browser to the final URL instead
      if (res.redirected) return Response.redirect(res.url, 302);
      const copy = res.clone();
      caches.open(LOCAL).then((c) => c.put(new URL('./', self.location).href, copy));
      return res;
    }
  } catch (err) { /* offline: the cached shell */ }
  const hit = (await caches.match(req, { ignoreSearch: true })) || (await caches.match(new URL('./', self.location).href));
  return hit || offline();
}

async function networkFirst(req) {
  try {
    const res = await Promise.race([fetch(req), timeout(TIMEOUT)]);
    if (res && (res.ok || res.type === 'opaque')) {
      const copy = res.clone();
      caches.open(CDN).then((c) => c.put(req, copy));
      return res;
    }
  } catch (err) { /* fall through to the cache */ }
  const hit = await caches.match(req);
  return hit || offline();
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === self.location.origin) {
    if (!url.pathname.startsWith(new URL('./', self.location).pathname)) return;
    e.respondWith(req.mode === 'navigate' ? pageFirst(req) : cacheFirst(req));
  } else if (/cdn\.jsdelivr\.net|fonts\.(googleapis|gstatic)\.com/.test(url.hostname)) {
    e.respondWith(networkFirst(req));
  }
});
