// ═══════════════════════════════════════════════════════════════════
// LUCID WINDS — Production Service Worker
// Strategy: cache-first for assets, network-first for HTML
// Version tag drives cache busting on deploy
// ═══════════════════════════════════════════════════════════════════

var CACHE_VERSION = 'lw-v3';
var ASSET_CACHE = 'lw-assets-v3';
var GAME_CACHE = 'lw-games-v3';

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
  '/word-banks.js'
];

// ── INSTALL: precache critical assets ──
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(ASSET_CACHE).then(function(cache) {
      return cache.addAll(PRECACHE);
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

// ── ACTIVATE: clean old cache versions ──
self.addEventListener('activate', function(event) {
  var keep = [ASSET_CACHE, GAME_CACHE];
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

// ── FETCH: route by request type ──
self.addEventListener('fetch', function(event) {
  var url = new URL(event.request.url);

  // Only handle GET requests from our origin or known CDNs
  if (event.request.method !== 'GET') return;

  // Skip non-http(s) requests
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return;

  // ── HTML pages: network-first (so deploys go live instantly) ──
  if (event.request.mode === 'navigate' || url.pathname.match(/\.html$/)) {
    event.respondWith(
      fetch(event.request).then(function(response) {
        // Cache a copy for offline fallback
        var clone = response.clone();
        caches.open(ASSET_CACHE).then(function(cache) {
          cache.put(event.request, clone);
        });
        return response;
      }).catch(function() {
        // Offline — serve cached version
        return caches.match(event.request);
      })
    );
    return;
  }

  // ── Game scripts (games/*.js): cache-first, load once ──
  if (url.pathname.match(/^\/games\//)) {
    event.respondWith(
      caches.match(event.request).then(function(cached) {
        if (cached) return cached;
        return fetch(event.request).then(function(response) {
          if (response.ok) {
            var clone = response.clone();
            caches.open(GAME_CACHE).then(function(cache) {
              cache.put(event.request, clone);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // ── Static assets (images, fonts, word-banks.js): cache-first ──
  if (url.pathname.match(/\.(jpg|jpeg|png|webp|svg|gif|ico|woff2?|ttf|otf|eot)$/) ||
      url.pathname === '/word-banks.js') {
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
