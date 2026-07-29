// Blobworks pinball service worker — minimal, keeps the game installable + offline-tolerant.
var CACHE='blobworks-v7';
self.addEventListener('install',function(e){ self.skipWaiting(); });
self.addEventListener('activate',function(e){ e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch',function(e){
  if(e.request.method!=='GET')return;
  e.respondWith(
    fetch(e.request).then(function(res){
      try{ var c=res.clone(); caches.open(CACHE).then(function(k){ k.put(e.request,c); }); }catch(x){}
      return res;
    }).catch(function(){ return caches.match(e.request); })
  );
});
