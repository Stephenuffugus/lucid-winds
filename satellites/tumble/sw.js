// TUMBLE service worker (OPUS_PROMPT: cache first for local assets, network for the CDN with a
// cache fallback). Studio rules this file keeps:
//   - every fetch path settles with a real Response (a hung promise paints a black screen)
//   - only caches whose name starts with this game's prefix are ever deleted (caches are origin wide)
const PREFIX = 'tumble-';
const VERSION = '20260917b';
const LOCAL = PREFIX + 'local-' + VERSION;
const CDN = PREFIX + 'cdn-v1';
const TIMEOUT = 6000;

const PRECACHE = [
  './', 'index.html', 'manifest.json', 'sw.js',
  'src/app.js', 'src/game.js', 'src/ui.js', 'src/screens.js', 'src/room.js', 'src/render.js', 'src/table.js',
  'src/play.js', 'src/physics.js', 'src/session.js', 'src/loadgen.js', 'src/economy.js', 'src/save.js',
  'src/audio.js', 'src/input.js', 'src/atlas.js', 'src/geo.js', 'src/config.js', 'src/mathx.js',
  'src/silhouettes.js', 'src/textures.js', 'src/debug.js',
  'engine/sockgen.js', 'engine/sha256.js', 'engine/color.js', 'engine/flat.js', 'engine/atlas-worker.js',
  'assets/geo/placeholder.js', 'assets/geo/manifest.json',
  'data/hero-socks.json', 'data/lore.json', 'data/unlocks.json', 'data/clothesline.json',
  'icons/icon-192.png', 'icons/icon-512.png',
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
      caches.open(LOCAL).then((c) => Promise.all(PRECACHE.map((u) => c.add(new Request(u, { cache: 'reload' })).catch(() => null)))),
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
  const hit = await caches.match(req, { ignoreSearch: true });
  if (hit) {
    // refresh in the background so the next launch has the newest file
    fetch(req).then((res) => { if (res && res.ok) caches.open(LOCAL).then((c) => c.put(req, res)); }).catch(() => null);
    return hit;
  }
  try {
    const res = await Promise.race([fetch(req), timeout(TIMEOUT)]);
    if (res && res.ok) { const copy = res.clone(); caches.open(LOCAL).then((c) => c.put(req, copy)); }
    return res || offline();
  } catch (err) {
    return offline();
  }
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
    e.respondWith(cacheFirst(req));
  } else if (/cdn\.jsdelivr\.net|fonts\.(googleapis|gstatic)\.com/.test(url.hostname)) {
    e.respondWith(networkFirst(req));
  }
});
