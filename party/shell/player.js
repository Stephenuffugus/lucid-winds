/* window.PartyShell, PLAYER half. Phones send intents and mirror phases.
   Rejoin: the stable playerId token lives in localStorage; on load we join,
   the host re-sends the live phase, and onPhase fires immediately with it. */
(function(){
'use strict';
var T=null, phaseCb=null, msgCb=null, timerCb=null, joined=false,
    lastPhase=null, lastData=null, slug=null;
var lastHeard=0, lostShown=false, myName='', myCode='';

/* HOST DROP. WHACKBOX_PLAN: "a dropped host mid-round must not destroy the
   party". A phone cannot fix a dead TV, but it can stop lying about it and it
   can come back on its own. So: notice the silence, say something honest, keep
   knocking, and slide straight back into the live phase when the big screen
   returns. The player never retypes the code. */
function heard(){
  lastHeard=Date.now();
  if(lostShown){
    lostShown=false;
    var el=document.getElementById('ps-lost');
    if(el) el.classList.remove('on');
    /* ⛔ HEARING THE BIG SCREEN IS NOT THE SAME AS BEING KNOWN TO IT. A host
       that came back is a FRESH host with an empty roster, so the phone must
       re-register or it sits there looking connected while the lobby shows an
       empty room. Coming out of the lost state always knocks once more. */
    if(T) T.send({t:'join',name:myName});
  }
}
setInterval(function(){
  if(!joined||!lastHeard) return;
  var gone=Date.now()-lastHeard>7000;
  if(gone&&!lostShown){
    lostShown=true;
    var el=document.getElementById('ps-lost');
    if(el) el.classList.add('on');
  }
  /* keep knocking while it is away: the host answers a join with the live
     phase, so coming back is automatic and silent */
  if(gone&&T) T.send({t:'join',name:myName});
},1000);

/* Which game module this phone should be running. The host announces it on
   every joined and every phase, so one phone page serves the whole catalogue
   and a room that switches games pulls the new module without a retype. */
function setSlug(s){
  if(!s || s===slug) return;
  slug=s; window.PartyShell.gameSlug=s;
  document.dispatchEvent(new CustomEvent('party-game',{detail:{slug:s}}));
}

/* ⛔ ONLY THE HOST'S OWN MESSAGE TYPES COUNT AS A HEARTBEAT. Every phone sees
   every other phone on the shared bus (join, ping, intent all arrive here), so
   counting "any traffic" meant three phones kept each other convinced the big
   screen was alive and NOBODY ever noticed it had died. Caught by the host drop
   test, which is exactly the failure it was written to catch. */
var HOST_MSG={hb:1,joined:1,phase:1,timer:1,game:1,over:1};

function handle(m){
  if(m.to && m.to!=='*' && m.to!==window.PartyTransport.selfId) return;
  if(HOST_MSG[m.t]) heard();
  if(m.t==='hb') return;
  if(m.t==='joined'){ joined=true; setSlug(m.game);
    document.dispatchEvent(new CustomEvent('party-joined')); }
  else if(m.t==='phase'){ lastPhase=m.name; lastData=m.data; setSlug(m.game);
    if(phaseCb) phaseCb(m.name,m.data); }
  else if(m.t==='game'){ if(msgCb) msgCb(m.msg); }
  else if(m.t==='timer'){ if(timerCb) timerCb(m.s); }
  else if(m.t==='over'){
    claimSunbeams(m.results||{});
    if(phaseCb) phaseCb('over',m.results||{});
  }
}

/* ⭐ EACH PHONE CLAIMS FOR ITSELF, and only ever for itself. The host screen is
   just another browser, so letting it report everyone's earnings would mean
   anybody with a host page could mint for anyone. The host reports PLACE, the
   server decides the AMOUNT, and the claim doc id makes a replay collide
   instead of paying twice.
   ⛔ Dormant with cloud rooms: on the practice transport there is no server and
   nothing mints, which is honest rather than a fake number. */
function claimSunbeams(results){
  var mine=results[window.PartyTransport.selfId];
  if(!mine) return;
  if(!window.firebase||!firebase.functions||!firebase.apps||!firebase.apps.length) return;
  try{
    firebase.functions().httpsCallable('partyComplete')({
      code:myCode, game:slug, place:mine.place,
      players:Object.keys(results).length
    })['catch'](function(){ /* the game is over either way; never block on this */ });
  }catch(e){}
}

window.PartyShell={
  playerId:window.PartyTransport.selfId,
  gameSlug:null,
  joinRoom:function(code,name){
    myName=name; myCode=code;
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
      heard();
    });
  },
  onPhase:function(cb){ phaseCb=cb; if(lastPhase) cb(lastPhase,lastData); },
  onMessage:function(cb){ msgCb=cb; },
  sendToHost:function(msg){ if(T) T.send({t:'intent',msg:msg}); },
  onTimer:function(cb){ timerCb=cb; }
};
})();
