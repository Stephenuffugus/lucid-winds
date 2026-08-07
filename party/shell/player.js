/* window.PartyShell, PLAYER half. Phones send intents and mirror phases.
   Rejoin: the stable playerId token lives in localStorage; on load we join,
   the host re-sends the live phase, and onPhase fires immediately with it. */
(function(){
'use strict';
var T=null, phaseCb=null, msgCb=null, timerCb=null, joined=false,
    lastPhase=null, lastData=null;

function handle(m){
  if(m.to && m.to!=='*' && m.to!==window.PartyTransport.selfId) return;
  if(m.t==='joined'){ joined=true; document.dispatchEvent(new CustomEvent('party-joined')); }
  else if(m.t==='phase'){ lastPhase=m.name; lastData=m.data; if(phaseCb) phaseCb(m.name,m.data); }
  else if(m.t==='game'){ if(msgCb) msgCb(m.msg); }
  else if(m.t==='timer'){ if(timerCb) timerCb(m.s); }
  else if(m.t==='over'){ if(phaseCb) phaseCb('over',m.results||{}); }
}

window.PartyShell={
  playerId:window.PartyTransport.selfId,
  joinRoom:function(code,name){
    return new Promise(function(res,rej){
      T=window.PartyTransport.open(code.toUpperCase());
      T.onMessage(handle);
      var tries=0, iv=setInterval(function(){
        if(joined){ clearInterval(iv); res(); return; }
        if(++tries>10){ clearInterval(iv); rej(new Error('No room answered to '+code)); return; }
        T.send({t:'join',name:name});
      },400);
      T.send({t:'join',name:name});
      setInterval(function(){ if(joined) T.send({t:'ping'}); },3000);
    });
  },
  onPhase:function(cb){ phaseCb=cb; if(lastPhase) cb(lastPhase,lastData); },
  onMessage:function(cb){ msgCb=cb; },
  sendToHost:function(msg){ if(T) T.send({t:'intent',msg:msg}); },
  onTimer:function(cb){ timerCb=cb; }
};
})();
