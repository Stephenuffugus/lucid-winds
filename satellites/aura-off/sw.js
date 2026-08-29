/* AURA OFF — service worker.
 * ===========================================================================
 * OFFLINE IS A BONUS. THE GAME IS NOT ALLOWED TO DEPEND ON THIS FILE.
 * ===========================================================================
 *
 * Four hazards have taken builds in this repo down before. Every one of them
 * is answered by a specific rule below. If you edit this file, keep the rules.
 *
 * 1. A HUNG FETCH IS A PERMANENT BLACK SCREEN.
 *    `respondWith()` takes a promise. If that promise never settles, the page
 *    never paints — not a slow load, a dead tab, forever. A captive-portal
 *    wifi that accepts the connection and then answers nothing does exactly
 *    this. So every network call here goes through `netWithTimeout()`, every
 *    handler has a `.catch`, and the outermost `respondWith` has one more
 *    `.catch` behind it that returns a real Response no matter what.
 *
 * 2. `caches.keys()` IS ORIGIN-WIDE.
 *    This origin hosts a hundred-plus other games. Iterating the cache list
 *    and deleting what this worker does not recognise would wipe them. The
 *    activate handler deletes ONLY names that start with `CACHE_PREFIX` and
 *    are not the current one. Never widen that filter.
 *
 * 3. A STALE NAVIGATION PINS A BUILD FOREVER.
 *    The document is NETWORK-FIRST. Cache-first HTML is how a player ends up
 *    running last month's game with no way to escape it. Versioned static
 *    assets are cache-first, because their URL changes when they change.
 *
 * 4. THE HTTP CACHE LIES.
 *    An edge or browser cache can hand this worker a stale file even on a
 *    "fresh" fetch. Same-scope asset fetches use `cache: 'reload'` to go past
 *    it, and the cache name carries BUILD so a bumped build starts empty.
 *
 * ---------------------------------------------------------------------------
 * WHEN YOU CHANGE ANY SHIPPED FILE, BUMP `BUILD`.
 * That is the whole release ritual. The new worker takes a new cache, fills it
 * from the network, and drops the old one on activate.
 * ---------------------------------------------------------------------------
 */

'use strict';

/** Bump on every deploy. Must match the `build` meta tag in index.html. */
var BUILD = '20260829b';

/** Every cache this worker may ever touch starts with this. NOTHING else. */
var CACHE_PREFIX = 'skywolf:auraoff:';
var CACHE = CACHE_PREFIX + BUILD;

/** How long a network call may hang before we fall back. */
var NET_TIMEOUT_MS = 6000;

/**
 * The shell. Relative URLs, resolved against this worker's own location, so
 * the satellite keeps working whatever directory it is deployed into.
 *
 * Deliberately NOT exhaustive: the engine and data modules are pulled in on
 * first play by the runtime cache below. A precache list that has to be kept
 * in sync by hand goes stale, and a missing entry would fail the whole
 * `addAll()` and leave the player with no worker at all.
 */
var SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './src/main.js',
  './src/ui/style.css',
  './icon-192.png',
  './icon-512.png'
];

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Fetch that is guaranteed to settle. Rejects on timeout rather than hanging,
 * so a caller's `.catch` can fall back to cache. HAZARD 1.
 * @param {Request|string} req
 * @param {Object} [opts]
 * @returns {Promise<Response>}
 */
function netWithTimeout(req, opts) {
  return new Promise(function (resolve, reject) {
    var settled = false;
    var timer = setTimeout(function () {
      if (settled) return;
      settled = true;
      reject(new Error('network timeout'));
    }, NET_TIMEOUT_MS);

    var p;
    try {
      p = fetch(req, opts);
    } catch (e) {
      // fetch can throw synchronously on a malformed request.
      clearTimeout(timer);
      settled = true;
      reject(e);
      return;
    }
    p.then(function (res) {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(res);
    }, function (err) {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      reject(err);
    });
  });
}

/** Open our cache. Resolves to null instead of throwing if storage is gone. */
function openCache() {
  try {
    return caches.open(CACHE).catch(function () { return null; });
  } catch (e) {
    return Promise.resolve(null);
  }
}

/** Cache a response without ever letting a storage failure reach the caller. */
function put(req, res) {
  if (!res || !res.ok || res.status !== 200 || res.type === 'opaque') return;
  var copy;
  try { copy = res.clone(); } catch (e) { return; }
  openCache().then(function (c) {
    if (!c) return;
    try { c.put(req, copy).catch(function () {}); } catch (e) {}
  }).catch(function () {});
}

/** Look something up in our cache. Never throws, resolves undefined on miss. */
function match(req) {
  return openCache().then(function (c) {
    if (!c) return undefined;
    return c.match(req, { ignoreSearch: false }).catch(function () { return undefined; });
  }).catch(function () { return undefined; });
}

/** Last-resort offline document. Only ever seen with an empty cache. */
function offlineDoc() {
  return new Response(
    '<!doctype html><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>Aura Off</title>' +
    '<body style="margin:0;display:grid;place-items:center;min-height:100vh;' +
    'background:#1A0B2E;color:#FDF6EC;font:16px/1.7 system-ui,sans-serif;text-align:center">' +
    '<div style="max-width:26ch"><p style="color:#FFB627">The plaza is offline.</p>' +
    '<p>Reconnect and reload to step up.</p></div>',
    { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
}

/* -------------------------------------------------------------------------- */
/* INSTALL — fill the cache, but never fail the install                        */
/* -------------------------------------------------------------------------- */

self.addEventListener('install', function (event) {
  event.waitUntil(
    openCache().then(function (c) {
      if (!c) return;
      // One at a time, each failure swallowed. `addAll()` is atomic: a single
      // 404 in the list would reject and the worker would never install, which
      // would cost offline support for the sake of one icon.
      return Promise.all(SHELL.map(function (url) {
        return netWithTimeout(new Request(url, { cache: 'reload' }))
          .then(function (res) {
            if (res && res.ok) return c.put(url, res).catch(function () {});
          })
          .catch(function () { /* this one asset simply is not cached */ });
      }));
    }).catch(function () {}).then(function () {
      // Safe here specifically because asset freshness is guaranteed by the
      // build-scoped cache plus network-first navigation, not by the old
      // worker sticking around.
      return self.skipWaiting();
    })
  );
});

/* -------------------------------------------------------------------------- */
/* ACTIVATE — drop ONLY our own old versions. HAZARD 2.                        */
/* -------------------------------------------------------------------------- */

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (names) {
      return Promise.all(names.map(function (name) {
        // The single most important line in this file. `names` contains every
        // other game on this origin. Touch nothing that is not ours, and not
        // the version we are currently running.
        if (name.indexOf(CACHE_PREFIX) !== 0) return null;
        if (name === CACHE) return null;
        return caches.delete(name).catch(function () { return false; });
      }));
    }).catch(function () {}).then(function () {
      return self.clients.claim();
    }).catch(function () {})
  );
});

/* -------------------------------------------------------------------------- */
/* FETCH                                                                       */
/* -------------------------------------------------------------------------- */

/** Network-first. The player must never be pinned to an old build. HAZARD 3. */
function navigationStrategy(event) {
  return netWithTimeout(event.request)
    .then(function (res) {
      if (res && res.ok) put('./index.html', res);
      return res;
    })
    .catch(function () {
      return match('./index.html').then(function (hit) {
        return hit || match(event.request).then(function (h2) {
          return h2 || offlineDoc();
        });
      });
    })
    .catch(function () { return offlineDoc(); });
}

/** Cache-first for our own static assets, revalidating past the HTTP cache. */
function assetStrategy(event) {
  return match(event.request).then(function (hit) {
    if (hit) return hit;
    return netWithTimeout(event.request, { cache: 'reload' })
      .then(function (res) {
        put(event.request, res);
        return res;
      })
      .catch(function () {
        // Try once more without the cache-busting hint — some servers and
        // some webviews reject `cache: 'reload'` outright.
        return netWithTimeout(event.request).then(function (res) {
          put(event.request, res);
          return res;
        });
      });
  });
}

self.addEventListener('fetch', function (event) {
  var req = event.request;

  // Only GET. A POST is nobody's business here.
  if (!req || req.method !== 'GET') return;

  var url;
  try { url = new URL(req.url); } catch (e) { return; }

  // Same origin only — never proxy anyone else's host.
  if (url.origin !== self.location.origin) return;

  // Scope: this satellite's own directory and nothing above it. Other games
  // on this origin must reach the network untouched.
  var base = new URL('./', self.location.href).pathname;
  if (url.pathname.indexOf(base) !== 0) return;

  // Never cache the worker or a range request (media seeking).
  if (url.pathname === self.location.pathname) return;
  if (req.headers && req.headers.get && req.headers.get('range')) return;

  var isNav = req.mode === 'navigate' ||
    (req.destination === 'document') ||
    (req.headers && req.headers.get && (req.headers.get('accept') || '').indexOf('text/html') !== -1 && req.destination === '');

  var handler = isNav ? navigationStrategy(event) : assetStrategy(event);

  // The final guard. Whatever happened above, SOMETHING settles. HAZARD 1.
  event.respondWith(
    handler.catch(function () {
      return match(req).then(function (hit) {
        if (hit) return hit;
        return isNav ? offlineDoc() : new Response('', { status: 504, statusText: 'offline' });
      }).catch(function () {
        return isNav ? offlineDoc() : new Response('', { status: 504, statusText: 'offline' });
      });
    })
  );
});

/* -------------------------------------------------------------------------- */
/* MESSAGES                                                                    */
/* -------------------------------------------------------------------------- */

self.addEventListener('message', function (event) {
  var data = event && event.data;
  if (!data) return;
  if (data === 'skipWaiting' || data.type === 'skipWaiting') {
    try { self.skipWaiting(); } catch (e) {}
  }
  if (data === 'build' || data.type === 'build') {
    try { event.source.postMessage({ type: 'build', build: BUILD, cache: CACHE }); } catch (e) {}
  }
});
