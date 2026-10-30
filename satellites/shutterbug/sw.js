/* Shutterbug's service worker (BUILD-PLAN.md section 1.5, T1.11). Its scope is the game's own folder: the fleet's root
   files (/music-unlocks.js and the three it loads) are never intercepted, cached or answered, and it only ever deletes
   shutterbug- caches (caches.keys() is origin wide and every satellite shares the origin). BUILD equals the page's
   SB.BUILD and CACHE's version the registration's ?v= (the host caching law: the lint and deploy.sh hold them together). */
var BUILD = 'sb-m0-3';
var CACHE = 'shutterbug-v1';
var SHELL = ['./', './index.html', './manifest.json', './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png'];

self.addEventListener('install', function (e) {
  /* one by one, never addAll: one miss never fails the whole install */
  e.waitUntil(caches.open(CACHE).then(function (c) {
    return Promise.all(SHELL.map(function (u) { return c.add(new Request(u, { cache: 'reload' })).catch(function () {}); }));
  }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k.indexOf('shutterbug-') === 0 && k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (!req.url.startsWith(self.registration.scope)) return;
  if (req.method !== 'GET') return;
  if (req.mode === 'navigate') { e.respondWith(navigate(req)); return; }
  if (/\/music\/[^/]+\.mp3$/.test(new URL(req.url).pathname)) { e.respondWith(lazy(req)); return; }
  e.respondWith(caches.match(req).then(function (hit) { return hit || fetch(req).catch(function () { return new Response('', { status: 504 }); }); }));
});

/* a navigation: the network with no-cache and an 8 s limit, else the cached shell; it always settles with a Response */
function navigate(req) {
  var limit = new Promise(function (resolve) { setTimeout(function () { resolve(null); }, 8000); });
  var net = fetch(req, { cache: 'no-cache' }).then(function (r) { return r && r.ok ? r : null; }).catch(function () { return null; });
  return Promise.race([net, limit]).then(function (r) {
    if (r) return r;
    return caches.match('./index.html').then(function (hit) { return hit || caches.match('./'); }).then(function (hit) {
      return hit || new Response('Shutterbug is offline and not installed yet.', { status: 503, headers: { 'content-type': 'text/plain' } });
    });
  });
}

/* the game's own tracks under its scope, cached on first play (DESIGN 11, QUESTIONS Q37) */
function lazy(req) {
  return caches.open(CACHE).then(function (c) {
    return c.match(req).then(function (hit) {
      return hit || fetch(req).then(function (r) { if (r && r.ok) c.put(req, r.clone()); return r; }).catch(function () { return new Response('', { status: 504 }); });
    });
  });
}
