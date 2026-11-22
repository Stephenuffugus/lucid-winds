/* Keepsies service worker (22 Nov 2026, the Play gates): the offline shell. Shape and scars from the number games'
   workers (satellites/brim/sw.js), which the fleet's host law shaped:

   - caches.keys() is origin wide: only keepsies-shell- caches are ever deleted, or this worker wipes every other game.
   - every fetch settles with a real Response: a network that accepts and never answers is given up on after
     NET_TIMEOUT_MS, for navigations and for anything not yet cached, never left pending (the black screen scar).
   - navigations refetch with cache: 'no-cache', because this host serves day old HTML from its HTTP cache.
   - ⛔ A NAVIGATION IS SAVED UNDER ITS OWN PAGE (the fault the Play queue's first five hit on 13 Nov): the game's page
     (a path ending in / or index.html, whatever its query) is the shell; any other page, privacy.html above all, is
     keyed by its own path and offline is answered from its own entry or the offline page, never from the game's.
   - other origins are never touched (the Sunbeam SDK's Firebase scripts, the music streams): the network has them.
   - SHELL_VERSION moves on every deploy that changes a file below, and so does the ?v= on the registration.
   The figures (assets/figures, about 2.9 MB of models) are NEVER precached: a statue's figure is kept only once a match has
   fetched it, and a match draws without one. Every ?v= below, the cache name and the registration move together with
   node tools/stamp.mjs --bump (sw.js is in its file list).
*/

const STAMP = '?v=20261113a';   /* tools/stamp.mjs rewrites this with every other ?v= */
const SHELL_VERSION = 'keepsies-shell-' + STAMP.slice(3) + '-1';   /* bump the -n when sw.js changes without a stamp */
const NET_TIMEOUT_MS = 4000;
const SCOPE = new URL('./', self.location).pathname;   /* only this game's own files are kept as they are fetched; the shared scripts and the music stay the network's */

const SHELL_ASSETS = [
  './',
  './index.html',
  './privacy.html',
  './manifest.webmanifest?v=20261113a',
  './icon-192.png?v=20261113a',
  './icon-512.png?v=20261113a',
  './icon-maskable-512.png?v=20261113a',
  './lib/three.module.min.js',
  './lib/rapier.js',
  './lib/environments/RoomEnvironment.js',
  './lib/loaders/GLTFLoader.js',
  './lib/utils/BufferGeometryUtils.js',
  './src/audio/synth.js?v=20261113a',
  './src/core/damage.js?v=20261113a',
  './src/core/dmath.js?v=20261113a',
  './src/core/framing.js?v=20261113a',
  './src/core/marbleBody.js?v=20261113a',
  './src/core/physics.js?v=20261113a',
  './src/core/rng.js?v=20261113a',
  './src/core/rules-arena.js?v=20261113a',
  './src/core/rules-ringer.js?v=20261113a',
  './src/core/snap.js?v=20261113a',
  './src/core/specials.js?v=20261113a',
  './src/core/spyglass.js?v=20261113a',
  './src/core/statues.js?v=20261113a',
  './src/core/techniques.js?v=20261113a',
  './src/data/astra_r2.json?v=20261113a',
  './src/data/astra_r3.json?v=20261113a',
  './src/data/droptables.json?v=20261113a',
  './src/data/marbles.json?v=20261113a',
  './src/data/marbles.overrides.json?v=20261113a',
  './src/data/tuning.json?v=20261113a',
  './src/game/ai.js?v=20261113a',
  './src/game/arena.js?v=20261113a',
  './src/game/match.js?v=20261113a',
  './src/game/ringer.js?v=20261113a',
  './src/input/cameraCtl.js?v=20261113a',
  './src/input/knuckle.js?v=20261113a',
  './src/input/placement.js?v=20261113a',
  './src/input/pullback.js?v=20261113a',
  './src/main.js?v=20261113a',
  './src/meta/beats.js?v=20261113a',
  './src/meta/collection.js?v=20261113a',
  './src/meta/drops.js?v=20261113a',
  './src/meta/economy.js?v=20261113a',
  './src/meta/onboarding.js?v=20261113a',
  './src/meta/progression.js?v=20261113a',
  './src/meta/provenance.js?v=20261113a',
  './src/meta/ransom.js?v=20261113a',
  './src/meta/save.js?v=20261113a',
  './src/meta/tiers.js?v=20261113a',
  './src/meta/words.js?v=20261113a',
  './src/render/arenaEnv.js?v=20261113a',
  './src/render/art.js?v=20261113a',
  './src/render/ceremony.js?v=20261113a',
  './src/render/figures.js?v=20261113a',
  './src/render/marbleMesh.js?v=20261113a',
  './src/render/plates.js?v=20261113a',
  './src/render/portraits.js?v=20261113a',
  './src/render/quality.js?v=20261113a',
  './src/render/scene.js?v=20261113a',
  './src/render/share.js?v=20261113a',
  './src/render/statues.js?v=20261113a',
  './src/version.json?v=20261113a',
  './assets/env/calibration_target.png?v=20261113a',
  './assets/env/chalk_stroke_r3.png?v=20261113a',
  './assets/env/dirt_albedo.webp?v=20261113a',
  './assets/env/dirt_detail.webp?v=20261113a',
  './assets/env/ground_shadow.png?v=20261113a',
  './assets/env/horizon_strip.webp?v=20261113a',
  './assets/env/lot_panorama.webp?v=20261113a',
  './assets/env/shadow_dark.png?v=20261113a',
  './assets/ui/calibration_0.svg?v=20261113a',
  './assets/ui/calibration_1.svg?v=20261113a',
  './assets/ui/calibration_2.svg?v=20261113a',
  './assets/ui/calibration_3.svg?v=20261113a',
  './assets/ui/contact_lift.png?v=20261113a',
  './assets/ui/icons.svg?v=20261113a',
  './assets/ui/ransom_envelope.svg?v=20261113a'
];

const within = (promise, ms) => Promise.race([promise, new Promise(resolve => setTimeout(() => resolve(null), ms))]);

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(SHELL_VERSION)
      .then(cache => Promise.all(SHELL_ASSETS.map(url =>
        within(fetch(url, { cache: 'no-cache', credentials: 'same-origin' }).catch(() => null), NET_TIMEOUT_MS * 3)
          .then(res => (res && res.ok) ? cache.put(url, res) : null)
          .catch(() => null)
      )))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.indexOf('keepsies-shell-') === 0 && k !== SHELL_VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function offlinePage() {
  return new Response(
    '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">'
    + '<body style="margin:0;height:100vh;display:flex;align-items:center;justify-content:center;background:#0d100c;'
    + 'color:#e8dcc8;font-family:system-ui,sans-serif;text-align:center;padding:24px"><p>Keepsies needs one visit with the internet first.</p></body>',
    { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
}

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (req.headers.has('range')) return;   /* a media range request is the network's; a cached 200 cannot answer it */

  if (req.mode === 'navigate') {
    const shell = /\/(index\.html)?$/.test(url.pathname) ? './index.html' : url.origin + url.pathname;
    event.respondWith(
      within(fetch(req.url, { cache: 'no-cache', credentials: 'same-origin' }).catch(() => null), NET_TIMEOUT_MS)
        .then(res => {
          if (res && res.ok && !res.redirected) {
            const copy = res.clone();
            caches.open(SHELL_VERSION).then(c => c.put(shell, copy)).catch(() => {});
            return res;
          }
          if (res && res.redirected) return Response.redirect(res.url);
          return caches.match(shell, { ignoreSearch: true }).then(hit => hit || res || offlinePage());
        })
    );
    return;
  }

  /* everything else: the cache first, refreshed behind; a miss waits NET_TIMEOUT_MS at most, then a 504 */
  event.respondWith(
    caches.match(req).then(hit => {
      const network = within(fetch(req).then(res => {
        if (res && res.status === 200 && res.type === 'basic' && url.pathname.indexOf(SCOPE) === 0) {
          const copy = res.clone();
          caches.open(SHELL_VERSION).then(c => c.put(req, copy)).catch(() => {});
        }
        return res;
      }).catch(() => null), NET_TIMEOUT_MS * (hit ? 1 : 3)).then(res => res || new Response('', { status: 504 }));
      return hit || network;
    })
  );
});
