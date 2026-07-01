// ═══════════════════════════════════════════════════════════════════
// LUCID WINDS — Production Service Worker
// Strategy: cache-first for assets, network-first for HTML
// Version tag drives cache busting on deploy
// ═══════════════════════════════════════════════════════════════════

var CACHE_VERSION = 'lw-v16';
var ASSET_CACHE = 'lw-assets-v16';
var GAME_CACHE = 'lw-games-v16';
var TILE_CACHE = 'lw-tiles-v1';
var TILE_MAX_ENTRIES = 1000; // ~25 km² at zoom 16 — fits comfortably

// Assets to precache on install (critical path only)
var PRECACHE = [
  '/assets/backgrounds/bg-game-540x960.jpg',
  '/assets/backgrounds/bg-greenhouse-540x960.jpg',
  '/assets/backgrounds/bg-nursery-540x960.jpg',
  '/assets/backgrounds/bg-wild-540x960.jpg',
  '/assets/onboarding/splash-seed-540x960.jpg',
  '/assets/onboarding/cinema-beat1-weight-540x960.jpg',
  '/assets/onboarding/cinema-beat2-glint-540x960.jpg',
  '/assets/onboarding/cinema-beat3-tendril-540x960.jpg',
  '/word-banks.js',
  // ── /play/ shell core (2026-06-29) ──
  // The portal jukebox and standalone /play/<game>.html shells all pull
  // these four. The big one is shared.css (~315 KB) — render-weight that,
  // uncached over a weak connection, was the multi-second black screen
  // before a game drew. Precaching them on install means the SECOND game a
  // player opens (and every game on a return visit) loads from cache. The
  // ?v stamps must match the shells' <link>/<script> tags; if they drift,
  // runtime cache-first below self-heals (just not pre-warmed). Keep in sync
  // on a shared.css / shell.js / shell.css / sunbeam-sdk.js version bump.
  '/shared.css?v=20260701',
  '/play/shell.css?v=6',
  '/play/shell.js?v=11',
  '/sunbeam-sdk.js?v=2'
];

// ── INSTALL: precache critical assets ──
// Per-file with individual catch — cache.addAll() is atomic, so a single
// 404 (renamed asset, CDN hiccup) would fail install and the SW would
// never activate. Precache is an optimization, not a contract.
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(ASSET_CACHE).then(function(cache) {
      return Promise.all(PRECACHE.map(function(u) {
        return cache.add(u).catch(function(){});
      }));
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

// ── ACTIVATE: clean old cache versions ──
self.addEventListener('activate', function(event) {
  var keep = [ASSET_CACHE, GAME_CACHE, TILE_CACHE];
  event.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.filter(function(name) {
          return keep.indexOf(name) === -1;
        }).map(function(name) {
          return caches.delete(name);
        })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// ── Map tile cache helpers ──
// Stale-while-revalidate: returns cached tile immediately if present and
// kicks off a background refresh; on a miss falls through to network.
// FIFO-trim caps entries at TILE_MAX_ENTRIES (Cache.keys() preserves
// insertion order so oldest are removed first). LRU isn't worth tracking.
function _tileTrim(cache) {
  cache.keys().then(function(keys) {
    if (keys.length <= TILE_MAX_ENTRIES) return;
    var excess = keys.length - TILE_MAX_ENTRIES;
    for (var i = 0; i < excess; i++) cache.delete(keys[i]);
  });
}
function _tileFetchAndCache(req, cache) {
  return fetch(req).then(function(res) {
    if (res && res.ok) {
      var clone = res.clone();
      cache.put(req, clone).then(function(){ _tileTrim(cache); });
    }
    return res;
  });
}

// ── FETCH: route by request type ──
self.addEventListener('fetch', function(event) {
  var url = new URL(event.request.url);

  // Only handle GET requests from our origin or known CDNs
  if (event.request.method !== 'GET') return;

  // Skip non-http(s) requests
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return;

  // ── Map tiles (CartoDB Voyager): stale-while-revalidate, capped at 1000 ──
  // Biggest cellular-data win per the Apr 26 mobile audit. Serves cached
  // tiles instantly on revisit and refreshes in the background.
  if (url.hostname.indexOf('cartocdn.com') !== -1 && /\/\d+\/\d+\/\d+(@\dx)?\.png/.test(url.pathname)) {
    event.respondWith(
      caches.open(TILE_CACHE).then(function(cache) {
        return cache.match(event.request).then(function(cached) {
          if (cached) {
            // Background refresh — don't block the response
            _tileFetchAndCache(event.request, cache).catch(function(){});
            return cached;
          }
          // Cache miss — go to network and cache the result
          return _tileFetchAndCache(event.request, cache);
        });
      })
    );
    return;
  }

  // ── HTML pages: network-first (so deploys go live instantly) ──
  // 2026-06-16 Gate C: a HANGING navigation fetch (common on an iOS PWA
  // cold-launch racing the network) never rejects, so the old .catch never
  // fired and the app hung. Race the network against a 5s timeout: if the
  // network is too slow AND we have a cached copy, serve it; the late network
  // response still refreshes the cache for next launch. Normal + offline paths
  // are unchanged.
  if (event.request.mode === 'navigate' || url.pathname.match(/\.html$/)) {
    event.respondWith(new Promise(function(resolve) {
      var settled = false;
      function done(r) { if (!settled && r) { settled = true; resolve(r); } }
      var timer = setTimeout(function() {
        caches.match(event.request).then(function(c) { done(c); });
      }, 5000);
      fetch(event.request).then(function(response) {
        clearTimeout(timer);
        var clone = response.clone();
        caches.open(ASSET_CACHE).then(function(cache) { cache.put(event.request, clone); });
        done(response);
      }).catch(function() {
        clearTimeout(timer);
        caches.match(event.request).then(function(c) {
          // If there's no cache and the network failed, surface the failure.
          if (c) done(c); else if (!settled) { settled = true; resolve(Response.error()); }
        });
      });
    }));
    return;
  }

  // ── Game scripts (games/*.js) + /play/ shell core JS: cache-first ──
  // Loader stamps ?v=LW_VERSION, so a deploy is a new cache key. On every
  // fresh cache we evict same-path entries from older versions — with
  // ~10 deploys/day the cache would otherwise grow without bound.
  // sunbeam-sdk.js + play/shell.js are ?v-stamped too and load on every
  // /play/ shell, so they ride the same versioned cache-first + evict path
  // (2026-06-29 portal-speed fix).
  if (url.pathname.match(/^\/games\//) || url.pathname === '/sunbeam-sdk.js' || url.pathname === '/play/shell.js') {
    event.respondWith(
      caches.match(event.request).then(function(cached) {
        if (cached) return cached;
        return fetch(event.request).then(function(response) {
          if (response.ok) {
            var clone = response.clone();
            caches.open(GAME_CACHE).then(function(cache) {
              cache.put(event.request, clone).then(function() {
                cache.keys().then(function(keys) {
                  for (var i = 0; i < keys.length; i++) {
                    var ku = new URL(keys[i].url);
                    if (ku.pathname === url.pathname && keys[i].url !== event.request.url) {
                      cache.delete(keys[i]);
                    }
                  }
                });
              });
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // ── music-tracks.js: stale-while-revalidate ──
  // Shared soundtrack manifest, loaded WITHOUT a ?v= stamp by both index.html
  // and the portal. Same reasoning as word-banks.js below: serve cached
  // instantly, refresh in the background so a new track lands on the next load.
  if (url.pathname === '/music-tracks.js' || url.pathname === '/music-player.js') {
    event.respondWith(
      caches.open(ASSET_CACHE).then(function(cache) {
        return cache.match(event.request).then(function(cached) {
          var refresh = fetch(event.request).then(function(response) {
            if (response && response.ok) cache.put(event.request, response.clone());
            return response;
          });
          return cached || refresh;
        });
      })
    );
    return;
  }

  // ── word-banks.js: stale-while-revalidate ──
  // index.html loads it WITHOUT a ?v= stamp, so cache-first would pin it
  // forever. Serve cached instantly, refresh in the background — a bank
  // update lands on the next load.
  if (url.pathname === '/word-banks.js') {
    event.respondWith(
      caches.open(ASSET_CACHE).then(function(cache) {
        return cache.match(event.request).then(function(cached) {
          var refresh = fetch(event.request).then(function(response) {
            if (response && response.ok) cache.put(event.request, response.clone());
            return response;
          });
          return cached || refresh;
        });
      })
    );
    return;
  }

  // ── Static assets (CSS, images, fonts): cache-first ──
  // CSS added 2026-06-29 — shared.css (~315 KB) + play/shell.css are
  // ?v-stamped, so the full-URL cache key busts on a version bump. Until
  // now CSS fell through to network-only, so every /play/ shell re-fetched
  // the whole 315 KB app stylesheet — the core of the portal black screen.
  if (url.pathname.match(/\.(css|jpg|jpeg|png|webp|svg|gif|ico|woff2?|ttf|otf|eot)$/)) {
    event.respondWith(
      caches.match(event.request).then(function(cached) {
        if (cached) return cached;
        return fetch(event.request).then(function(response) {
          if (response.ok) {
            var clone = response.clone();
            caches.open(ASSET_CACHE).then(function(cache) {
              cache.put(event.request, clone);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // ── CDN resources (Leaflet, Firebase, Fonts): cache-first ──
  if (url.hostname === 'cdnjs.cloudflare.com' ||
      url.hostname === 'www.gstatic.com' ||
      url.hostname === 'fonts.gstatic.com' ||
      url.hostname === 'fonts.googleapis.com') {
    event.respondWith(
      caches.match(event.request).then(function(cached) {
        if (cached) return cached;
        return fetch(event.request).then(function(response) {
          if (response.ok) {
            var clone = response.clone();
            caches.open(ASSET_CACHE).then(function(cache) {
              cache.put(event.request, clone);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // ── Everything else: network only (Firebase API calls, GA, Pi SDK) ──
});
