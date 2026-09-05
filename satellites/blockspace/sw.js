/* Blockspace service worker. Cache-first for the app shell, versioned cache name,
   old caches purged on activate. Navigations always try the network first with a
   short timeout so a deploy reaches a returning player (the host pins bare URLs;
   see the fleet caching law in the memory notes). */
const CACHE='blockspace-20260905c';
const SHELL=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png','./icon-maskable-512.png','./lib/three.module.min.js?v=20260905c'];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('blockspace-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch',e=>{
  const req=e.request; if(req.method!=='GET') return; const url=new URL(req.url); if(url.origin!==location.origin) return;
  if(req.mode==='navigate'){
    e.respondWith((async()=>{ const c=await caches.open(CACHE); try{ const ctrl=new AbortController(); const t=setTimeout(()=>ctrl.abort(),8000); const r=await fetch(req,{cache:'no-cache',signal:ctrl.signal}); clearTimeout(t); if(r&&r.ok){ c.put('./index.html',r.clone()); } return r; }
      catch(err){ return (await c.match('./index.html'))||(await c.match('./'))||new Response('<h1>Blockspace is offline and not cached yet.</h1>',{headers:{'content-type':'text/html'}}); } })());
    return; }
  e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(r=>{ if(r&&r.ok&&url.pathname.includes('/satellites/blockspace/')){ const cp=r.clone(); caches.open(CACHE).then(c=>c.put(req,cp)); } return r; })));
});
self.addEventListener('message',e=>{ if(e.data==='skipWaiting') self.skipWaiting(); });
