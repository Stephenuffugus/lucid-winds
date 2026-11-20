// SHINGLE service worker. The page: network first, so a new build shows on the next load; the cached copy when the
// network fails or takes longer than 4 s (a phone on a weak signal still opens the game). Manifest and icon: cache first.
var CACHE = 'shingle-v2';
var SHELL = ['./', './index.html', './manifest.webmanifest', './icon.svg'];
self.addEventListener('install', function (e) { e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); })); });
self.addEventListener('activate', function (e) { e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); })); });
function isPage(req) { return req.mode === 'navigate' || /\/(index\.html)?$/.test(new URL(req.url).pathname); }
function pageResponse(req) {
  var cached = caches.match('./index.html');
  var net = fetch(req).then(function (res) {
    if (res.ok) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put('./index.html', copy); }); }
    return res;
  });
  return new Promise(function (resolve, reject) {
    var done = false;
    var finish = function (r) { if (!done && r) { done = true; resolve(r); } };
    var t = setTimeout(function () { cached.then(finish); }, 4000);
    net.then(function (res) { clearTimeout(t); finish(res); }, function () { clearTimeout(t); cached.then(function (r) { if (r) finish(r); else if (!done) { done = true; reject(new Error('offline and not cached')); } }); });
  });
}
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  if (isPage(req)) { e.respondWith(pageResponse(req)); return; }
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(function (r) {
    return r || fetch(req).then(function (res) {
      if (res.ok) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); }
      return res;
    });
  }));
});
