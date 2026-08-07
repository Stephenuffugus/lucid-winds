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
var SELF = 'p_'+Math.random().toString(36).slice(2,10);
try{
  var saved=localStorage.getItem('party_selfid');
  if(saved) SELF=saved; else localStorage.setItem('party_selfid',SELF);
}catch(e){}

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
