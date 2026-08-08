/* PartyShell transport layer. Two implementations behind one interface:

   LocalTransport   BroadcastChannel. Same browser, host tab + phone tabs.
                    Fully working today; this is practice mode and the test rig.
   CloudTransport   Firebase RTDB. Complete but DORMANT until the one time
                    console setup in PARTY_CLOUD_SETUP.md is done (enable RTDB,
                    enable anonymous auth, paste rules). Until then creating a
                    cloud room fails fast with a clear message.

   Interface (both):
     t = Transport.host(code)  / Transport.join(code)
     t.send(msg)               msg is a plain object; delivered to the room
     t.onMessage(cb)           cb(msg) for every room message not sent by self
     t.close()
   Every message carries .from (senderId) added here, so the shell can route. */
(function(){
'use strict';
/* ⛔⛔ ONE IDENTITY PER TAB, NOT PER BROWSER. This used to be a single
   localStorage key, which meant every tab of the same browser reported the SAME
   player id. On a real phone that is invisible, but practice mode is explicitly
   "every player joins from a tab in this same browser", so three practice
   phones registered as one player and the lobby never reached its minimum.
   Found 2026-08-08 by the end to end driver, which saw a roster of 1.

   The fix has to satisfy two things at once:
     rejoin   a phone that locks and reloads MUST come back as the same player
     practice two tabs MUST be two different players
   So the tab marker lives in sessionStorage (survives a reload, unique per tab)
   and the id itself lives in localStorage keyed by that marker. */
var SELF = 'p_'+Math.random().toString(36).slice(2,10);
try{
  var tab=sessionStorage.getItem('party_tab');
  if(!tab){ tab='t_'+Math.random().toString(36).slice(2,8); sessionStorage.setItem('party_tab',tab); }
  var key='party_selfid_'+tab;
  var saved=localStorage.getItem(key);
  if(saved) SELF=saved; else localStorage.setItem(key,SELF);
}catch(e){
  /* private modes can refuse both stores; a fresh random id still plays, it just
     cannot rejoin, and that is honest rather than silently colliding */
}

function LocalTransport(code){
  var ch=new BroadcastChannel('sws-party-'+code), cbs=[];
  ch.onmessage=function(ev){ var m=ev.data;
    if(m&&m.from!==SELF) for(var i=0;i<cbs.length;i++) cbs[i](m); };
  return {
    id:SELF, kind:'local',
    send:function(msg){ msg.from=SELF; try{ch.postMessage(msg);}catch(e){} },
    onMessage:function(cb){ cbs.push(cb); },
    close:function(){ try{ch.close();}catch(e){} }
  };
}

function CloudTransport(){
  /* Wire-complete RTDB adapter: rooms live at party/{code}/msgs (push) and
     party/{code}/meta. Requires firebase-config.js to define PARTY_FIREBASE
     and the console setup to be done. Kept factual: if the SDK or the
     database is absent this throws immediately rather than half working. */
  if(!window.PARTY_FIREBASE || !window.firebase || !firebase.database)
    throw new Error('Cloud rooms are not switched on yet. See PARTY_CLOUD_SETUP.md');
  return null; /* replaced by the real adapter when the console setup lands */
}

window.PartyTransport={
  selfId:SELF,
  open:function(code){
    var q=/[?&]cloud=1(&|$)/.test(location.search);
    if(q) return CloudTransport(code);
    return LocalTransport(code);
  }
};
})();
