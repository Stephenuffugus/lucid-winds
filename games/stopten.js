// ═══ LUCID WINDS — Stop at Ten (reflex timing) ═══
(function(){
'use strict';
var G=window._G;
var _e=G.e,_play=G.play,_playWin=G.playWin,ms=G.ms,mm=G.mm,mc=G.mc,sm=G.sm,_sr=G.sr;

window._gameFns=window._gameFns||{};
window._gameFns.stopten=function ST(a){
  var startMs=0,elapsed=0,running=false,rafId=0,attempts=0,best=Infinity;

  ms(a,'Stop at Ten · <span id="STa">0</span>/3 · best <span id="STb">—</span>');
  mm(a);
  var pan=document.createElement('div');
  pan.style.cssText='max-width:420px;margin:0 auto;padding:24px 16px;text-align:center;';
  a.appendChild(pan);
  mc(a).innerHTML='<button class="gb" onclick="_STN()">🌱 NEW ROUND</button>';

  function tiers(delta){
    if(delta<=0.01)return {lbl:'PERFECT',col:'#c8a84b',reward:1,sb:3};
    if(delta<=0.10)return {lbl:'EXCELLENT',col:'#7ab356',reward:1,sb:2};
    if(delta<=0.25)return {lbl:'GOOD',col:'#7ab356',reward:0,sb:1};
    if(delta<=0.50)return {lbl:'CLOSE',col:'#c8a84b',reward:0,sb:0};
    return {lbl:'MISS',col:'#c47a7a',reward:0,sb:0};
  }

  function tick(){
    if(!running)return;
    elapsed=(Date.now()-startMs)/1000;
    var el=document.getElementById('STclock');
    if(el)el.textContent=elapsed.toFixed(2);
    rafId=requestAnimationFrame(tick);
  }

  function start(){
    if(running)return;
    startMs=Date.now();elapsed=0;running=true;
    render();
    tick();
  }

  function stop(){
    if(!running)return;
    running=false;cancelAnimationFrame(rafId);
    elapsed=(Date.now()-startMs)/1000;
    var delta=Math.abs(elapsed-10);
    var t=tiers(delta);
    attempts++;
    if(delta<best)best=delta;
    var ba=document.getElementById('STa');if(ba)ba.textContent=attempts;
    var bb=document.getElementById('STb');if(bb)bb.textContent=isFinite(best)?('±'+best.toFixed(2)+'s'):'—';
    // Reward
    if(t.sb>0){for(var i=0;i<t.sb;i++)_e('progress');}
    if(t.lbl==='PERFECT'){_e('game_win');_playWin();_sr('stopten',{w:true,s:Math.round(delta*1000)});}
    else if(t.reward>0){_e('milestone');}
    renderResult(delta,t);
    sm(t.lbl+' · '+elapsed.toFixed(2)+'s (±'+delta.toFixed(2)+')');
  }

  function render(){
    var h='';
    h+='<div style="font-family:Cormorant Garamond,serif;font-size:clamp(0.85rem,3vw,1rem);color:var(--muted);letter-spacing:0.04em;margin-bottom:10px;">Stop the clock at exactly 10.00</div>';
    h+='<div id="STclock" style="font-family:DM Mono,monospace;font-size:clamp(3.2rem,14vw,5rem);font-weight:500;color:'+(running?'var(--gold)':'var(--cream)')+';letter-spacing:0.04em;margin:18px 0;text-shadow:0 0 18px rgba(200,168,75,0.25);transition:color 0.15s;">'+elapsed.toFixed(2)+'</div>';
    h+='<div style="font-family:DM Mono,monospace;font-size:0.55rem;color:var(--muted);opacity:0.65;margin-bottom:20px;">SECONDS</div>';
    if(!running){
      h+='<button onclick="_STS()" style="min-width:140px;min-height:64px;padding:14px 28px;font-family:Bebas Neue,sans-serif;font-size:1.1rem;letter-spacing:0.14em;background:linear-gradient(180deg,rgba(122,179,86,0.25),rgba(74,124,53,0.2));border:2px solid var(--sage);color:var(--sage);border-radius:12px;cursor:pointer;box-shadow:0 3px 12px rgba(0,0,0,0.4);">▶ START</button>';
    }else{
      h+='<button onclick="_STX()" style="min-width:140px;min-height:64px;padding:14px 28px;font-family:Bebas Neue,sans-serif;font-size:1.1rem;letter-spacing:0.14em;background:linear-gradient(180deg,rgba(200,168,75,0.3),rgba(180,140,50,0.2));border:2px solid var(--gold);color:var(--gold);border-radius:12px;cursor:pointer;box-shadow:0 3px 16px rgba(200,168,75,0.35);">■ STOP</button>';
    }
    h+='<div id="STresult" style="min-height:56px;margin-top:18px;"></div>';
    pan.innerHTML=h;
  }

  function renderResult(delta,t){
    var el=document.getElementById('STresult');if(!el)return;
    var sign=elapsed>=10?'+':'-';
    el.innerHTML='<div style="font-family:Bebas Neue,sans-serif;font-size:1.4rem;letter-spacing:0.12em;color:'+t.col+';text-shadow:0 0 18px '+t.col+'33;">'+t.lbl+'</div>'
      +'<div style="font-family:DM Mono,monospace;font-size:0.75rem;color:var(--cream);opacity:0.8;margin-top:4px;">'+sign+delta.toFixed(2)+'s from 10.00</div>'
      +(t.sb>0?'<div style="font-family:DM Mono,monospace;font-size:0.7rem;color:var(--gold);margin-top:4px;">+'+t.sb+' Sunbeam progress</div>':'');
  }

  window._STS=function(){start();};
  window._STX=function(){stop();};
  window._STN=function(){if(running){running=false;cancelAnimationFrame(rafId);}attempts=0;best=Infinity;elapsed=0;var ba=document.getElementById('STa');if(ba)ba.textContent=0;var bb=document.getElementById('STb');if(bb)bb.textContent='—';render();};

  render();
};
})();
