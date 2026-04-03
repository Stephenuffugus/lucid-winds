// ═══ LUCID WINDS — Seed Song ═══
(function(){
'use strict';
var G=window._G;
var _e=G.e,_play=G.play,ms=G.ms,mm=G.mm,mc=G.mc,sm=G.sm,sh=G.sh,_sr=G.sr,_st=G.st,_xt=G.xt;

function GSG(a){
  // Load Grove Studio in fullscreen iframe
  var fr=document.createElement('iframe');
  fr.src='/studio.html';
  fr.style.cssText='width:100%;height:calc(100vh - 40px);border:none;border-radius:8px;background:#060610';
  fr.allow='autoplay';
  a.appendChild(fr);
}

window._gameFns.song=GSG;
})();
