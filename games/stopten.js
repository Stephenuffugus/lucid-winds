// ═══ LUCID WINDS — Stop at Ten (reflex timing) ═══
(function(){
'use strict';
var G=window._G;
var _e=G.e,_play=G.play,_playWin=G.playWin,ms=G.ms,mm=G.mm,mc=G.mc,sm=G.sm,_sr=G.sr;

window._gameFns=window._gameFns||{};
window._gameFns.stopten=function ST(a){
  var MAX_ATTEMPTS=3;     // session = 3 attempts then summary
  var AUTO_STOP_AT=15;    // force-stop if player walks away
  var startMs=0,elapsed=0,running=false,rafId=0,attempts=0,best=Infinity;
  var sessionDone=false;

  ms(a,'Stop at Ten · <span id="STa">0</span>/'+MAX_ATTEMPTS+' · best <span id="STb">, </span>');
  mm(a);
  var pan=document.createElement('div');
  pan.style.cssText='max-width:420px;margin:0 auto;padding:24px 16px;text-align:center;';
  a.appendChild(pan);
  mc(a).innerHTML='<button class="gb" onclick="_STN()">🌱 NEW ROUND</button>';

  function tiers(delta){
    if(delta<0.005)return {lbl:'PERFECT',col:'#c8a84b',reward:1,sb:3};
    if(delta<=0.015)return {lbl:'SO CLOSE',col:'#7ab356',reward:1,sb:2};
    if(delta<=0.035)return {lbl:'NICE',col:'#7ab356',reward:0,sb:1};
    return {lbl:'MISS',col:'#c47a7a',reward:0,sb:0};
  }

  function tick(){
    if(!running)return;
    elapsed=(Date.now()-startMs)/1000;
    var el=document.getElementById('STclock');
    if(el)el.textContent=elapsed.toFixed(2);
    // Force-stop if player abandoned the round so the clock can't
    // run forever (and so the rAF loop releases CPU).
    if(elapsed>=AUTO_STOP_AT){stop(true);return;}
    rafId=requestAnimationFrame(tick);
  }

  function start(){
    if(running||sessionDone)return;
    startMs=Date.now();elapsed=0;running=true;
    render();
    tick();
  }

  function stop(autoStop){
    if(!running)return;
    running=false;cancelAnimationFrame(rafId);
    elapsed=(Date.now()-startMs)/1000;
    var delta=Math.abs(elapsed-10);
    var t=tiers(delta);
    attempts++;
    if(delta<best)best=delta;
    var ba=document.getElementById('STa');if(ba)ba.textContent=attempts;
    var bb=document.getElementById('STb');if(bb)bb.textContent=isFinite(best)?('±'+best.toFixed(2)+'s'):'—';
    // Reward — drip Sunbeam progress per tier
    if(t.sb>0){for(var i=0;i<t.sb;i++)_e('progress');}
    if(t.lbl==='PERFECT'){_e('game_win');_playWin();_sr('stopten',{w:true,s:Math.round(delta*1000)});}
    else if(t.reward>0){_e('milestone');}
    renderResult(delta,t,autoStop);
    if(autoStop)sm('Auto-stopped at '+AUTO_STOP_AT+'s · '+t.lbl);
    else sm(t.lbl+' · '+elapsed.toFixed(2)+'s (±'+delta.toFixed(2)+')');
    // Session complete?
    if(attempts>=MAX_ATTEMPTS){
      sessionDone=true;
      // If no PERFECT yet, log the session's best as a non-win record
      // so attempts count toward stats instead of vanishing.
      if(isFinite(best)&&best>=0.005){
        _sr('stopten',{w:false,s:Math.round(best*1000)});
      }
      setTimeout(function(){if(document.body.contains(pan))renderSessionSummary();},900);
    }
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

  function renderResult(delta,t,autoStop){
    var el=document.getElementById('STresult');if(!el)return;
    var sign=elapsed>=10?'+':'-';
    var label=autoStop?'TIME OUT':t.lbl;
    var col=autoStop?'#c47a7a':t.col;
    el.innerHTML='<div style="font-family:Bebas Neue,sans-serif;font-size:1.4rem;letter-spacing:0.12em;color:'+col+';text-shadow:0 0 18px '+col+'33;">'+label+'</div>'
      +'<div style="font-family:DM Mono,monospace;font-size:0.75rem;color:var(--cream);opacity:0.8;margin-top:4px;">'+sign+delta.toFixed(2)+'s from 10.00</div>'
      +(t.sb>0?'<div style="font-family:DM Mono,monospace;font-size:0.7rem;color:var(--gold);margin-top:4px;">+'+t.sb+' Sunbeam progress</div>':'');
  }

  function renderSessionSummary(){
    var el=document.getElementById('STresult');if(!el)return;
    var ranking;
    if(best<0.005)ranking={lbl:'GROVE LEGEND',col:'#c8a84b'};
    else if(best<=0.015)ranking={lbl:'KEEN EYE',col:'#7ab356'};
    else if(best<=0.05)ranking={lbl:'STEADY HAND',col:'#7ab356'};
    else if(best<=0.2)ranking={lbl:'GOOD TRY',col:'var(--cream)'};
    else ranking={lbl:'KEEP PRACTICING',col:'var(--muted)'};
    el.innerHTML='<div style="margin-top:18px;padding:14px;background:rgba(26,31,23,0.6);border:1.5px solid rgba(74,124,53,0.25);border-radius:10px;">'
      +'<div style="font-family:Cormorant Garamond,serif;font-size:0.7rem;color:var(--muted);letter-spacing:0.06em;">SESSION COMPLETE</div>'
      +'<div style="font-family:Bebas Neue,sans-serif;font-size:1.3rem;color:'+ranking.col+';letter-spacing:0.12em;margin:6px 0;">'+ranking.lbl+'</div>'
      +'<div style="font-family:DM Mono,monospace;font-size:0.7rem;color:var(--cream);opacity:0.85;">Best: ±'+best.toFixed(2)+'s</div>'
      +'<div style="font-family:DM Mono,monospace;font-size:0.55rem;color:var(--muted);margin-top:8px;">Tap NEW ROUND to play again</div>'
      +'</div>';
  }

  window._STS=function(){start();};
  window._STX=function(){stop(false);};
  window._STN=function(){
    if(running){running=false;cancelAnimationFrame(rafId);}
    attempts=0;best=Infinity;elapsed=0;sessionDone=false;
    var ba=document.getElementById('STa');if(ba)ba.textContent=0;
    var bb=document.getElementById('STb');if(bb)bb.textContent='—';
    render();
  };

  // Cleanup — kill the rAF loop if player exits mid-round so we don't
  // burn CPU running tick() forever on a detached panel.
  var _watchExit=setInterval(function(){
    if(!document.body.contains(pan)){
      running=false;
      if(rafId)cancelAnimationFrame(rafId);
      clearInterval(_watchExit);
    }
  },1000);

  render();
};
})();
