/* Sky Wolf Studios — workbench gate (2026-07-29)
   Included by IN-DEVELOPMENT games so a direct URL cannot skip the portal's
   gate. Same tester key + same localStorage flag as the portal. Curation,
   not security: the point is that a stranger's first impression is never an
   unfinished game. */
(function(){
  try{ if(localStorage.getItem('sws_dev_ok')==='1') return; }catch(e){}
  function djb2(s){ var h=5381; for(var i=0;i<s.length;i++){ h=(((h*33)>>>0)+s.charCodeAt(i))>>>0; } return h>>>0; }
  function mount(){
    if(document.getElementById('sws-devgate')) return;
    var w=document.createElement('div'); w.id='sws-devgate';
    w.style.cssText='position:fixed;inset:0;z-index:2147483000;background:#0a0d0a;display:flex;align-items:center;justify-content:center;padding:20px;font-family:system-ui,sans-serif;';
    w.innerHTML=
      '<div style="max-width:340px;width:100%;background:#101510;border:1px solid #c8a84b;border-radius:14px;padding:22px;text-align:center;">'+
      '<div style="font-size:1.9rem;">🛠️</div>'+
      '<div style="color:#c8a84b;font-weight:700;letter-spacing:1px;margin:6px 0 2px;">IN DEVELOPMENT</div>'+
      '<div style="color:#e8dcc8;font-size:0.95rem;line-height:1.45;margin-bottom:14px;">This game is still on the Sky Wolf Studios workbench. It will open for everyone when it is ready.</div>'+
      '<input id="sws-devkey" type="text" autocomplete="off" autocapitalize="none" placeholder="Tester key" style="width:100%;box-sizing:border-box;background:#0a0d0a;border:1px solid #3a4436;border-radius:9px;color:#e8dcc8;padding:12px;font-size:1rem;text-align:center;">'+
      '<div style="display:flex;gap:10px;margin-top:12px;">'+
      '<a href="/portal/" style="flex:1;min-height:48px;display:flex;align-items:center;justify-content:center;background:transparent;border:1px solid #3a4436;border-radius:9px;color:#cfd8cf;font-size:0.95rem;text-decoration:none;">Back to the arcade</a>'+
      '<button id="sws-devgo" style="flex:1;min-height:48px;background:#c8a84b;border:none;border-radius:9px;color:#241c06;font-weight:700;font-size:0.95rem;">Unlock</button>'+
      '</div></div>';
    document.body.appendChild(w);
    function tryKey(){
      var inp=document.getElementById('sws-devkey');
      var v=(inp.value||'').trim().toLowerCase();
      if(djb2(v)===3604640980){
        try{ localStorage.setItem('sws_dev_ok','1'); }catch(e){}
        if(w.parentNode) w.parentNode.removeChild(w);
      } else { inp.style.borderColor='#c46a5a'; inp.value=''; inp.placeholder='Not that key'; }
    }
    document.getElementById('sws-devgo').addEventListener('click',tryKey);
    document.getElementById('sws-devkey').addEventListener('keydown',function(ev){ if(ev.key==='Enter')tryKey(); });
  }
  if(document.body) mount();
  else document.addEventListener('DOMContentLoaded',mount);
})();
