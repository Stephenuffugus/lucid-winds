/* window.PartyShell, PLAYER half. Phones send intents and mirror phases.
   Rejoin: the stable playerId token lives in localStorage; on load we join,
   the host re-sends the live phase, and onPhase fires immediately with it. */
(function(){
'use strict';
var T=null, phaseCb=null, msgCb=null, timerCb=null, joined=false,
    lastPhase=null, lastData=null, slug=null;
var lastHeard=0, lostShown=false, myName='', myCode='', joinRefused=false, paused=null;

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
    if(T) T.send(joinMsg(myName));
  }
}
setInterval(function(){
  if(!joined||!lastHeard) return;
  var gone=Date.now()-lastHeard>7000;
  /* a paused room is silent on purpose (the host's page is hidden or asleep): the pause screen already says why, so
     the reconnect screen does not pile on top of it. Knocking carries on underneath. */
  if(gone&&!lostShown&&!paused){
    lostShown=true;
    var el=document.getElementById('ps-lost');
    if(el) el.classList.add('on');
  }
  /* keep knocking while it is away: the host answers a join with the live
     phase, so coming back is automatic and silent */
  if(gone&&T) T.send(joinMsg(myName));
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
var HOST_MSG={hb:1,joined:1,phase:1,timer:1,game:1,over:1,seat:1,bye:1,pause:1,resume:1};

/* shell owned screens that sit ON TOP of whatever the game module is showing.
   A module never knows about these and never has to. */
function overlay(id,on){
  var el=document.getElementById(id);
  if(el) el.classList.toggle('on',!!on);
}

function handle(m){
  if(m.to && m.to!=='*' && m.to!==window.PartyTransport.selfId) return;
  if(HOST_MSG[m.t]) heard();
  if(m.t==='hb') return;
  if(m.t==='bye'){
    /* the room was closed on purpose. Stop the drop watcher before it turns a
       deliberate ending into "waiting for it to come back" forever. */
    joined=false; lostShown=false;
    overlay('ps-lost',false); overlay('ps-seat',false); overlay('ps-bye',true);
    /* a module with something worth keeping (Moongraft's cards) can offer it back on the closed room screen */
    try{ document.dispatchEvent(new CustomEvent('party-bye')); }catch(e){}
    return;
  }
  if(m.t==='seat'){ seatOverlay(m.seat==='next'); return; }
  if(m.t==='pause'){ showPaused(m.why||'away'); return; }
  if(m.t==='resume'){ showPaused(null); return; }
  if(m.t==='joined'){
    /* SHELL-D03: a full room says no, clearly, instead of letting a ninth phone sit on a dead screen */
    if(m.ok===false){ joinRefused=m.full?'full':'refused'; return; }
    joined=true; setNoTv(m.noTv); setSlug(m.game);
    if(m.color){ window.PartyShell.color=m.color; paintMyColour(m.color); }
    if(m.sym) window.PartyShell.symbol=m.sym;
    seatOverlay(m.seat==='next');
    showPaused(m.paused||null);
    document.dispatchEvent(new CustomEvent('party-joined')); }
  else if(m.t==='phase'){ lastPhase=m.name; lastData=m.data; setNoTv(m.noTv); setSlug(m.game);
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

/* ⭐ PHONES GET A BUZZ, NOT A CHIME. Sound belongs to the television: eight
   phones chiming milliseconds apart is the noise a room blames the game for. A
   haptic is private to the hand holding it, so it can confirm a tap landed
   without adding anything to the room. Silently absent on hardware that has no
   vibration, which is most laptops and every practice tab. */
function buzz(ms){ try{ if(navigator.vibrate) navigator.vibrate(ms||18); }catch(e){} }

/* a bar of your own colour along the top of the phone, so a player can look up
   and find themselves on the television without being told which chip is theirs */
function paintMyColour(c){
  var el=document.getElementById('ps-mycolour');
  if(el){ el.style.background=c; el.classList.add('on'); }
}

/* no TV mode (18 Oct 2026): every phone is the room's screen, so a game module reads PartyShell.noTv and shows the
   shared content itself. The shell's own words (Astra's shell copy, 18 Oct) never mention a big screen any more. */
function setNoTv(v){ window.PartyShell.noTv=!!v; seatOverlay(seatNext); }

/* ⭐ YOU PLAY NEXT GAME (SHELL-D03). On a big screen night the newcomer has nothing to watch on the phone, so the
   notice covers it. In phones only mode the phone IS the screen, so the notice becomes a band over a game they can
   watch but not touch (the host ignores a player who is not in the round, so a live button would be a lie). */
var seatNext=false;
function seatOverlay(next){
  seatNext=!!next;
  var el=document.getElementById('ps-seat'), s=document.getElementById('ps-seat-s');
  if(!el) return;
  var watch=seatNext&&window.PartyShell.noTv;
  el.classList.toggle('watch',watch);
  if(s) s.textContent=watch?'Watch this game here. You will join the next one.'
                           :'A game is already running. You will join the next one, and there is nothing to tap until then.';
  overlay('ps-seat',seatNext);
}

/* ⭐ THE ROOM IS PAUSED (SHELL-D02 lite, D11). The host broadcasts it; the phone shows why and stops showing a clock
   that is not moving. Cleared by resume, or by any joined reply that says the room is running. */
function showPaused(why){
  paused=why||null;
  var t=document.getElementById('ps-paused-t'), s=document.getElementById('ps-paused-s');
  if(t) t.textContent=why==='low'?'Waiting for players':'This round is paused';
  if(s) s.textContent=why==='low'?'Too few players are here to keep going. The round carries on when someone comes back.'
                                 :'The host stepped away. The round carries on, with the time it had left, when they are back.';
  overlay('ps-paused',!!why);
  if(why){ lostShown=false; overlay('ps-lost',false); }
}
/* the host's own seat (play.html?seat=1 inside the host page) says so when it joins */
var IS_SEAT=/[?&]seat=1(&|$)/.test(location.search);
function joinMsg(name){ var m={t:'join',name:name}; if(IS_SEAT) m.seat=1; return m; }

window.PartyShell={
  isSeat:IS_SEAT,   /* the host's own seat in no TV mode (it may take a card off the shelf in Moongraft) */
  /* ⭐ ONE WORDING LAW FOR A SAVED CHOICE (SHELL-D04, Astra 18 Oct). Editable and final must never read alike, and
     "Saved" means the host acknowledged it, not that the finger left the glass. Games use these words. */
  SAY:{ sending:'Sending', saved:'Saved. You can change it.', final:'Final answer saved.', allSet:'All set. Finishing soon.' },
  playerId:window.PartyTransport.selfId,
  gameSlug:null,
  color:null,
  buzz:buzz,
  joinRoom:function(code,name){
    myName=name; myCode=code; joinRefused=false;
    return new Promise(function(res,rej){
      T=window.PartyTransport.open(code.toUpperCase());
      T.onMessage(handle);
      var tries=0, iv=setInterval(function(){
        if(joined){ clearInterval(iv); res(); return; }
        if(joinRefused){ clearInterval(iv); rej(new Error(joinRefused)); return; }
        if(++tries>10){ clearInterval(iv); rej(new Error('No room answered to '+code)); return; }
        T.send(joinMsg(name));
      },400);
      T.send(joinMsg(name));
      setInterval(function(){ if(joined) T.send({t:'ping'}); },3000);
      heard();
    });
  },
  onPhase:function(cb){ phaseCb=cb; if(lastPhase) cb(lastPhase,lastData); },
  onMessage:function(cb){ msgCb=cb; },
  sendToHost:function(msg){ if(T){ buzz(); T.send({t:'intent',msg:msg}); } },
  onTimer:function(cb){ timerCb=cb; }
};
})();
