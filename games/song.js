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

// Persistent per-day Sunbeam cap (30/day/game, SUNBEAM_EARN_POLICY.md). The
// per-mount RUN_BUDGET/SESSION_CAP below are closure-local and reset every time
// the player re-selects Song from the picker — a 2-tap re-select cycle used to
// farm ~12 sunbeams/min. This localStorage backstop survives remounts so the
// day's total is honored no matter how many times Song is opened (2026-07-05 ruling).
var SONG_DAILY_CAP=30;
function _songDayKey(){ var d=new Date(); return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate(); }
function _songDaySpent(){
  try{ var r=localStorage.getItem('lw_song_earn'); if(r){ var p=JSON.parse(r); if(p&&p.day===_songDayKey()) return p.v||0; } }catch(e){}
  return 0;
}
function _songAddDaySpent(n){
  try{ localStorage.setItem('lw_song_earn', JSON.stringify({day:_songDayKey(), v:_songDaySpent()+n})); }catch(e){}
}

function GSG(a){
  var fr=document.createElement('iframe');
  fr.src='/studio.html?v=20260719'; // bump on studio.html edits (host caches HTML)
  fr.style.cssText='width:100%;height:calc(100vh - 40px);border:none;border-radius:8px;background:#060610';
  fr.allow='autoplay';
  a.appendChild(fr);

  // ── Sunbeam bridge ──────────────────────────────────────────────────
  var SESSION_CAP=10;          // max pulse earns per mount (farm guard)
  var RUN_BUDGET=12;           // max sunbeam VALUE per mount (SUNBEAM_EARN_POLICY.md 12/run;
                               // pulse=1, save/export=3 → save-spam caps at 4 milestones)
  var earned=0;                // pulse earns granted this session
  var spent=0;                 // sunbeam value paid this mount (budget tracker)
  var interacted=false;        // user touched the studio since last pulse tick
  var lastMilestone=0;         // debounce Save/Export earns

  function pulseEarn(){
    if(earned>=SESSION_CAP||spent+1>RUN_BUDGET) return;
    if(_songDaySpent()+1>SONG_DAILY_CAP) return; // persistent daily cap (survives remounts)
    try{ if(_e) _e('milestone'); }catch(e){}     // 1 sunbeam — sustained creation
    earned++;spent++;_songAddDaySpent(1);
  }
  function milestoneEarn(){
    var t=Date.now();
    if(t-lastMilestone<15000) return;            // debounce spam-saving
    if(spent+3>RUN_BUDGET) return;               // run budget spent — save still works, just no earn
    if(_songDaySpent()+3>SONG_DAILY_CAP) return; // persistent daily cap (survives remounts)
    lastMilestone=t;
    try{ if(_e) _e('puzzle_solved'); }catch(e){} // 3 sunbeams — finished a piece
    spent+=3;_songAddDaySpent(3);
  }

  // Poll briefly for the studio's GS object, then hook the real creation
  // actions (Save / Export) and watch for hands-on activity. Same-origin,
  // so reaching into the frame is allowed; everything is guarded.
  // The bounded poll RESTARTS on the iframe's load event, so a slow
  // device/network that parses studio.html after the first ~20s window
  // still gets bridged (Jul-04 triage: bridge silently gave up before).
  var tries=0,iv=null;
  function attachHooks(w,doc){
    w._swsStudioBridged=true;
    try{
      if(typeof w.GS.save==='function'){ var _s=w.GS.save; w.GS.save=function(){ milestoneEarn(); return _s.apply(this,arguments); }; }
      if(typeof w.GS.exportWAV==='function'){ var _x=w.GS.exportWAV; w.GS.exportWAV=function(){ milestoneEarn(); return _x.apply(this,arguments); }; }
    }catch(e){}
    try{ doc.addEventListener('pointerdown',function(){ interacted=true; },{passive:true}); }catch(e){}
  }
  function startPoll(){
    if(iv){ clearInterval(iv); iv=null; }
    tries=0;
    iv=setInterval(function(){
      tries++;
      var w,doc;
      try{ w=fr.contentWindow; doc=w&&w.document; }catch(e){ clearInterval(iv); iv=null; return; }
      if(!w||!doc){ if(tries>40){clearInterval(iv);iv=null;} return; }
      if(w._swsStudioBridged){ clearInterval(iv); iv=null; return; }
      if(w.GS && (typeof w.GS.save==='function'||typeof w.GS.exportWAV==='function')){
        clearInterval(iv); iv=null;
        attachHooks(w,doc);
      } else if(tries>40){ clearInterval(iv); iv=null; }  // pause; load event re-arms
    },500);
  }
  startPoll();
  fr.addEventListener('load',function(){
    // Re-arm on every real studio load (first load, slow load, reload).
    // Skip about:blank — the hub back button blanks the frame on exit.
    try{ if(!/studio/.test(fr.contentWindow.location.pathname)) return; }catch(e){}
    startPoll();
  });
  // Per-minute creation pulse — only pays if the player actually did
  // something since the last tick (so an idle tab earns nothing).
  // Started once per mount; survives an iframe reload (hooks re-attach).
  var pulse=setInterval(function(){
    try{ if(!fr.isConnected){ clearInterval(pulse); if(iv){clearInterval(iv);iv=null;} return; } }catch(e){}
    if(interacted){ interacted=false; pulseEarn(); }
  },60000);
  if(window._lwRegisterGameCleanup)window._lwRegisterGameCleanup(function(){ if(iv){clearInterval(iv);iv=null;} clearInterval(pulse); });
}

window._gameFns.song=GSG;
})();
