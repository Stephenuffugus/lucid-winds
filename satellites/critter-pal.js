/* ═══════════════════ SKY WOLF CRITTER PAL ═══════════════════
   Summon the player's newest Create A Critter creation as a cheering
   companion in ANY studio game. Zero network, zero Firestore, zero new
   assets: critters live in localStorage on this origin (cac_nursery),
   so same-origin satellites read them for free. Cross-origin games get
   the same payload from the portal via postMessage {sws:'critterPal'}.

   Usage (same-origin satellite):
     <script src="/satellites/critter-pal.js"></script>
     CritterPal.mount({ cheers:['Nice shot!','Go go go!'] });

   Usage (cross-origin game): listen for the portal message —
     window.addEventListener('message', e => {
       if (e.data && e.data.sws === 'critterPal') use(e.data.pal);
     });                       // pal = { name, drawing (dataURL PNG) }
*/
(function(){
  'use strict';
  function latest(){
    try{
      var n=JSON.parse(localStorage.getItem('cac_nursery')||'[]');
      if(!n.length) return null;
      var r=n[n.length-1];
      if(!r||!r.drawing) return null;
      return { name:r.name||'Your critter', drawing:r.drawing,
               personality:(r.profile&&r.profile.personality)||'' };
    }catch(e){ return null; }
  }
  var mounted=null;
  function mount(opts){
    opts=opts||{};
    var pal=opts.pal||latest();
    if(!pal||mounted) return null;
    var corner=opts.corner||'bl';
    var css=document.createElement('style');
    css.textContent='@keyframes cpal-bob{0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-7px) rotate(2deg)}}'
      +'@keyframes cpal-cheer{0%{opacity:0;transform:translate(-50%,4px)}15%,80%{opacity:1;transform:translate(-50%,0)}100%{opacity:0;transform:translate(-50%,-6px)}}';
    document.head.appendChild(css);
    var box=document.createElement('div');
    box.style.cssText='position:fixed;'+(corner==='br'?'right:10px;':'left:10px;')
      +'bottom:calc(10px + env(safe-area-inset-bottom,0px));z-index:2147483000;'
      +'pointer-events:none;width:64px;text-align:center;';
    var img=document.createElement('img');
    img.src=pal.drawing;
    img.alt=pal.name;
    img.style.cssText='width:64px;height:64px;object-fit:contain;background:rgba(255,255,255,.88);'
      +'border-radius:16px;box-shadow:0 3px 12px rgba(0,0,0,.28);animation:cpal-bob 2.6s ease-in-out infinite;';
    var bub=document.createElement('div');
    bub.style.cssText='position:absolute;bottom:72px;left:50%;transform:translateX(-50%);'
      +'background:#fffdf8;color:#4a3f5c;border-radius:999px;padding:5px 12px;font:700 12px/1.2 '
      +'ui-rounded,-apple-system,sans-serif;white-space:nowrap;box-shadow:0 3px 10px rgba(0,0,0,.2);'
      +'opacity:0;pointer-events:none;';
    box.appendChild(bub); box.appendChild(img);
    document.body.appendChild(box);
    var cheers=opts.cheers||['Go go go!','You can do it!','Wheee!','Nice one!'];
    function cheer(msg){
      bub.textContent=msg||cheers[Math.floor(Math.random()*cheers.length)];
      bub.style.animation='none';
      void bub.offsetWidth;
      bub.style.animation='cpal-cheer 2.4s ease forwards';
    }
    var auto=opts.autoCheer===false?null:setInterval(function(){
      if(document.hidden) return;
      cheer();
    }, opts.autoCheerMs||50000);
    setTimeout(function(){ cheer('Hi, it’s '+pal.name+'!'); },1500);
    mounted={ cheer:cheer, remove:function(){ if(auto)clearInterval(auto); box.remove(); mounted=null; } };
    return mounted;
  }
  window.CritterPal={ get:latest, mount:mount };
})();
