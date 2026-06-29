// ═══ LUCID WINDS — Seed Song (Music Studio shell wrapper) ═══
// Loads /studio.html in an iframe. The studio itself has no Sunbeam bridge,
// so this game paid ZERO sunbeams (Jun-29 portal audit). studio.html is
// same-origin, so we wire earning from the parent here — no studio edit:
//   • a real creation milestone (Save / Export) pays a puzzle_solved-tier earn
//   • sustained noodling pays a small per-minute pulse, session-capped
// Both run through the shell's _e() -> Sunbeam.earn, so they respect the
// anti-farm + daily caps and work standalone and embedded.
(function(){
'use strict';
var G=window._G;
var _e=G.e,_play=G.play,ms=G.ms,mm=G.mm,mc=G.mc,sm=G.sm,sh=G.sh,_sr=G.sr,_st=G.st,_xt=G.xt;

function GSG(a){
  var fr=document.createElement('iframe');
  fr.src='/studio.html';
  fr.style.cssText='width:100%;height:calc(100vh - 40px);border:none;border-radius:8px;background:#060610';
  fr.allow='autoplay';
  a.appendChild(fr);

  // ── Sunbeam bridge ──────────────────────────────────────────────────
  var SESSION_CAP=10;          // max pulse earns per mount (farm guard)
  var earned=0;                // pulse earns granted this session
  var interacted=false;        // user touched the studio since last pulse tick
  var lastMilestone=0;         // debounce Save/Export earns

  function pulseEarn(){
    if(earned>=SESSION_CAP) return;
    try{ if(_e) _e('milestone'); }catch(e){}     // 1 sunbeam — sustained creation
    earned++;
  }
  function milestoneEarn(){
    var t=Date.now();
    if(t-lastMilestone<15000) return;            // debounce spam-saving
    lastMilestone=t;
    try{ if(_e) _e('puzzle_solved'); }catch(e){} // 3 sunbeams — finished a piece
  }

  // Poll briefly for the studio's GS object, then hook the real creation
  // actions (Save / Export) and watch for hands-on activity. Same-origin,
  // so reaching into the frame is allowed; everything is guarded.
  var tries=0;
  var iv=setInterval(function(){
    tries++;
    var w,doc;
    try{ w=fr.contentWindow; doc=w&&w.document; }catch(e){ clearInterval(iv); return; }
    if(!w||!doc){ if(tries>40){clearInterval(iv);} return; }
    if(w._swsStudioBridged){ clearInterval(iv); return; }
    if(w.GS && (typeof w.GS.save==='function'||typeof w.GS.exportWAV==='function')){
      w._swsStudioBridged=true;
      clearInterval(iv);
      try{
        if(typeof w.GS.save==='function'){ var _s=w.GS.save; w.GS.save=function(){ milestoneEarn(); return _s.apply(this,arguments); }; }
        if(typeof w.GS.exportWAV==='function'){ var _x=w.GS.exportWAV; w.GS.exportWAV=function(){ milestoneEarn(); return _x.apply(this,arguments); }; }
      }catch(e){}
      try{ doc.addEventListener('pointerdown',function(){ interacted=true; },{passive:true}); }catch(e){}
      // Per-minute creation pulse — only pays if the player actually did
      // something since the last tick (so an idle tab earns nothing).
      var pulse=setInterval(function(){
        try{ if(!fr.isConnected){ clearInterval(pulse); return; } }catch(e){}
        if(interacted){ interacted=false; pulseEarn(); }
      },60000);
    } else if(tries>40){ clearInterval(iv); }     // give up after ~20s
  },500);
}

window._gameFns.song=GSG;
})();
