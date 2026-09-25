// Pixel Petri's service worker (the game was Tiny World; every internal name kept it): offline play for the installed app (the Google Play listing opens this folder).
// It keeps the files of ONE version of the game. The studio's rules (TUMBLE's sw.js in lucid-winds):
//   - every fetch this worker answers settles with a real Response, on a timer if need be: a hung promise paints a
//     black screen
//   - only caches whose name starts with PREFIX are ever deleted (caches belong to the whole lucidwinds.com origin)
//   - the host caching law (lucidwinds.com): the edge and the browser keep old copies of a file whose URL does not
//     change, and a worker's fetch() reads the browser's HTTP cache. So:
//       * the code lives in a folder named for the stamp (<stamp>/src/, tools/deploy-arcade.mjs): a URL no cache has
//         seen, kept and served from this version's cache only
//       * install fetches everything as <file>?v=VERSION with cache 'reload' and keeps it under its plain name
//       * pages come network first (cache 'no-cache', a timeout), else the kept page
//   - the songs (/music/v1/tiny-world/*.mp3) live outside this folder, so this worker never touches them: offline, a
//     song fails and the game's own synth plays instead
// VERSION and CODE are written by tools/deploy-arcade.mjs: the stamp, and every file under <stamp>/src/. In the repo
// they are 'dev' and empty; index.html then installs no worker unless the URL says ?sw, and a dev worker fetches
// everything network first (a dev loop never sees a stale file), keeping each answer for an offline try.
const PREFIX = 'tinyworld-';
const VERSION = '20260925d';
const CODE = ["20260925d/src/art/sprites.js","20260925d/src/audio/audio.js","20260925d/src/audio/mixer.js","20260925d/src/audio/songs.js","20260925d/src/data/art.json","20260925d/src/data/audio.json","20260925d/src/data/buildings.json","20260925d/src/data/creatures.json","20260925d/src/data/gear.json","20260925d/src/data/land.json","20260925d/src/data/load.js","20260925d/src/data/looks.json","20260925d/src/data/names.json","20260925d/src/data/powers.json","20260925d/src/data/reactions.json","20260925d/src/data/rules.json","20260925d/src/data/sprites.json","20260925d/src/data/starter.json","20260925d/src/data/stickers.json","20260925d/src/data/story.json","20260925d/src/data/strings.json","20260925d/src/data/terrain.json","20260925d/src/data/tray.json","20260925d/src/data/ui.json","20260925d/src/data/weapons.json","20260925d/src/dev/bench.js","20260925d/src/dev/bench.json","20260925d/src/main.js","20260925d/src/render/camera.js","20260925d/src/render/render.js","20260925d/src/sim/ai/decide.js","20260925d/src/sim/ai/move.js","20260925d/src/sim/ai/ufo.js","20260925d/src/sim/combat.js","20260925d/src/sim/commands.js","20260925d/src/sim/content.js","20260925d/src/sim/ents.js","20260925d/src/sim/events.js","20260925d/src/sim/fx.js","20260925d/src/sim/harm.js","20260925d/src/sim/hash.js","20260925d/src/sim/land.js","20260925d/src/sim/math.js","20260925d/src/sim/path.js","20260925d/src/sim/powers.js","20260925d/src/sim/query.js","20260925d/src/sim/reactions.js","20260925d/src/sim/rng.js","20260925d/src/sim/save.js","20260925d/src/sim/sim.js","20260925d/src/sim/spatial.js","20260925d/src/sim/story.js","20260925d/src/sim/undo.js","20260925d/src/sim/update.js","20260925d/src/sim/view.js","20260925d/src/sim/village.js","20260925d/src/sim/world.js","20260925d/src/ui/act.js","20260925d/src/ui/because.js","20260925d/src/ui/book.js","20260925d/src/ui/counts.js","20260925d/src/ui/doll.js","20260925d/src/ui/gesture.js","20260925d/src/ui/hud.js","20260925d/src/ui/input.js","20260925d/src/ui/news.js","20260925d/src/ui/saver.js","20260925d/src/ui/scrap.js","20260925d/src/ui/starter.js","20260925d/src/ui/status.js","20260925d/src/ui/store.js","20260925d/src/ui/text.js","20260925d/src/ui/tray.js","20260925d/src/ui/welcome.js"];
const CACHE = PREFIX + VERSION;
const DEV = VERSION === 'dev';
const TIMEOUT = 6000; // a page, or any file with a kept copy to fall back on
const SLOW = 20000; // a file with no kept copy: the network is the only answer, so it gets longer
const SHELL = ['manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png',
  'fonts/pixelify-sans-latin.woff2', 'fonts/pixelify-sans-latin-ext.woff2'];
const HOME = new URL('./', self.location); // this folder: the page lives at its bare URL
const SHELL_PATHS = new Set(SHELL.map((u) => new URL(u, HOME).pathname));
const STAMPED = /\/\d{8}[a-z]\/src\//;

const timeout = (ms) => new Promise((resolve) => setTimeout(() => resolve(null), ms));
const offline = () => new Response('Pixel Petri is offline and this file was never kept.', { status: 503, headers: { 'content-type': 'text/plain; charset=utf-8' } });
const fresh = (u) => { const url = new URL(u, HOME); url.searchParams.set('v', VERSION); return new Request(url.href, { cache: 'reload' }); };

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    // The page and every code file, or no install at all (the old worker, or none, stays, and the next visit tries
    // again): a worker that kept half the game would open a broken page offline.
    await Promise.all(['./'].concat(CODE).map(async (u) => {
      const res = await fetch(fresh(u));
      if (!res.ok) throw new Error(`${u}: ${res.status}`);
      // The page must be THIS version's page: one from a newer deploy would ask for code this worker never kept.
      if (u === './' && !DEV && !(await res.clone().text()).includes(`./${VERSION}/src/main.js`)) throw new Error('the page is not version ' + VERSION);
      await c.put(new URL(u, HOME).href, res);
    }));
    // The manifest, icons and font if they come: a missing icon never stops the game.
    await Promise.all(SHELL.map((u) => fetch(fresh(u)).then((res) => (res.ok ? c.put(new URL(u, HOME).href, res) : null)).catch(() => null)));
  })().then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.map((k) => (k.indexOf(PREFIX) === 0 && k !== CACHE ? caches.delete(k) : null))))
    .then(() => self.clients.claim()));
});

// A page: the newest copy from the network (revalidated, never a day old copy from the HTTP cache), else the kept one.
// The game's own page is kept only at install, next to the code it names; another page here (privacy.html) is kept
// as it is read. (A dev worker keeps the game's page as it is read too: it has no code of its own to match.)
async function page(req, url) {
  const home = url.pathname === HOME.pathname || url.pathname === HOME.pathname + 'index.html';
  const c = await caches.open(CACHE);
  try {
    const res = await Promise.race([fetch(req.url, { cache: 'no-cache', credentials: 'same-origin' }), timeout(TIMEOUT)]);
    if (res && res.ok) {
      // a navigation may not be answered with a redirected response: send the browser to the final URL instead
      if (res.redirected) return Response.redirect(res.url, 302);
      if (!home || DEV) c.put(home ? HOME.href : url.href, res.clone()).catch(() => {});
      return res;
    }
  } catch (err) { /* offline: the kept page */ }
  const hit = home ? await c.match(HOME.href) : await c.match(req, { ignoreSearch: true });
  return hit || offline();
}

// The code and the shell: this version's kept copy, else the network (kept for next time).
async function kept(req) {
  const c = await caches.open(CACHE);
  const hit = await c.match(req, { ignoreSearch: true });
  if (hit) return hit;
  try {
    const res = await Promise.race([fetch(req), timeout(SLOW)]);
    if (res && res.ok) c.put(req, res.clone()).catch(() => {});
    return res || offline();
  } catch (err) { return offline(); }
}

// Anything else in this folder (version.json, the font licence; everything on a dev server): the network, else the
// kept copy.
async function network(req) {
  const c = await caches.open(CACHE);
  try {
    const res = await Promise.race([fetch(req), timeout(TIMEOUT)]);
    if (res && res.ok) { c.put(req, res.clone()).catch(() => {}); return res; }
    if (res) return res; // a 404 is an answer
  } catch (err) { /* offline: the kept copy */ }
  const hit = await c.match(req, { ignoreSearch: true });
  return hit || offline();
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(HOME.pathname)) return; // not ours: as usual
  if (req.headers.has('range') || /\.mp3$/i.test(url.pathname)) return; // audio: never kept, never answered here
  if (req.mode === 'navigate') e.respondWith(page(req, url));
  else if (!DEV && (STAMPED.test(url.pathname) || SHELL_PATHS.has(url.pathname))) e.respondWith(kept(req));
  else e.respondWith(network(req));
});
