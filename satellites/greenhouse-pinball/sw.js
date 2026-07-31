// Blobworks pinball service worker — minimal, keeps the game installable + offline-tolerant.
var CACHE='blobworks-v8';

/* Never let a hung request hang the page. fetch() only rejects on a hard
   failure; a half-connected phone leaves it pending forever, and a pending
   respondWith paints nothing. Race it, and always resolve to SOMETHING. */
var NET_TIMEOUT = 5000;
function raceNet(p) {
  return new Promise(function (resolve, reject) {
    var done = false;
    var t = setTimeout(function () { if (!done) { done = true; reject(new Error("timeout")); } }, NET_TIMEOUT);
    p.then(function (v) { if (!done) { done = true; clearTimeout(t); resolve(v); } },
           function (e) { if (!done) { done = true; clearTimeout(t); reject(e); } });
  });
}
/* respondWith(undefined) fails the request outright, which looks identical to a
   black screen. Every fallback ends here. */
function lastResort(req) {
  return caches.match(req, { ignoreSearch: true }).then(function (hit) {
    if (hit) return hit;
    if (req.mode === "navigate") {
      return caches.match("./index.html", { ignoreSearch: true }).then(function (shell) {
        return shell || offlineResponse();
      });
    }
    return offlineResponse();
  })["catch"](offlineResponse);
}
function offlineResponse() {
  return new Response(
    '<!DOCTYPE html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
    + '<style>html,body{height:100%;margin:0;background:#0d100c;color:#e8dcc8;font-family:system-ui,-apple-system,sans-serif}'
    + 'main{min-height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:28px;text-align:center}'
    + 'h1{font-size:20px;margin:0;color:#c8a84b}p{margin:0;max-width:19em;line-height:1.5;color:#b9c0a8}'
    + 'a,button{min-height:52px;display:flex;align-items:center;justify-content:center;padding:0 26px;border-radius:13px;'
    + 'border:1px solid #3d5230;background:#1a2415;color:#cfe0c2;font-size:16px;font-weight:700;text-decoration:none;width:min(320px,100%)}'
    + 'button{background:#c8a84b;color:#1a1608;border-color:#e0c76b}</style>'
    + '<main><h1>That did not load</h1><p>The connection went quiet while this was opening. '
    + 'Your games and your sunbeams are safe.</p>'
    + '<button onclick="location.reload()">Try again</button>'
    + '<a href="/portal/">Back to the arcade</a></main>',
    { status: 503, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
}

self.addEventListener('install',function(e){ self.skipWaiting(); });
self.addEventListener('activate',function(e){ e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch',function(e){
  if(e.request.method!=='GET')return;
  e.respondWith(
    raceNet(fetch(e.request)).then(function(res){
      try{ var c=res.clone(); caches.open(CACHE).then(function(k){ k.put(e.request,c); }); }catch(x){}
      return res;
    })["catch"](function(){ return lastResort(e.request); })
  );
});
