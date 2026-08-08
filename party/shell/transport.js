/* PartyShell transport layer. Two implementations behind one interface:

   LocalTransport   BroadcastChannel. Same browser, host tab plus phone tabs.
                    Fully working today; this is practice mode and the test rig.
   CloudTransport   Firebase Realtime Database. Written and wired, and DORMANT
                    until the one time console setup in PARTY_CLOUD_SETUP.md is
                    done (create the database, enable anonymous auth, paste the
                    rules). Until then asking for a cloud room fails loudly with
                    a pointer to that document rather than half working.

   Interface (both):
     t = PartyTransport.open(code)
     t.send(msg)        msg is a plain object, delivered to everyone else
     t.onMessage(cb)    cb(msg) for every room message not sent by self
     t.close()
   Every message carries .from (senderId) added here, so the shell can route.

   ⚠ THE CLOUD PATH HAS NEVER RUN AGAINST A REAL DATABASE, because there is not
   one yet. It is written to the documented shape and it is honest about its
   state: it reports connection failures instead of silently pretending. Treat
   the first real room as the test, and read the notes at each step. */
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

/* ---------------- cloud ---------------- */

function loadScript(src){
  return new Promise(function(res,rej){
    var s=document.createElement('script');
    s.src=src; s.async=false;
    s.onload=res;
    s.onerror=function(){ rej(new Error('could not load '+src)); };
    document.head.appendChild(s);
  });
}
function loadSDK(){
  if(window.firebase && firebase.database) return Promise.resolve();
  var list=window.PARTY_FIREBASE_SDK||[];
  return list.reduce(function(p,src){ return p.then(function(){ return loadScript(src); }); },
                     Promise.resolve());
}

function CloudTransport(code){
  /* Rooms live at party/{code}/msgs (push) and party/{code}/meta.

     ⭐ NO HISTORY REPLAY. A room that has been running for ten minutes holds
     thousands of messages, and a phone joining late must not receive all of
     them: it would replay ten minutes of timer ticks and phase changes in one
     burst. So we read the last existing key ONCE, then listen from that key
     forward and skip it. Push keys sort lexicographically by time, which is the
     whole reason this works.

     ⚖ Rooms are removed by the host on closeRoom. Stale rooms from a browser
     that simply died are left for a scheduled sweep rather than a client side
     TTL, because a client cannot be trusted to be alive to run one. */
  var cbs=[], ref=null, liveQuery=null, handler=null, ready=false, queue=[];

  var api={
    id:SELF, kind:'cloud',
    send:function(msg){
      msg.from=SELF;
      if(!ready){ queue.push(msg); return; }
      try{ ref.child('msgs').push(msg); }catch(e){}
    },
    onMessage:function(cb){ cbs.push(cb); },
    close:function(){
      try{ if(liveQuery&&handler) liveQuery.off('child_added',handler); }catch(e){}
    },
    /* the host owns the room and takes it away with it */
    destroy:function(){ try{ ref.remove(); }catch(e){} }
  };

  if(!window.PARTY_FIREBASE)
    throw new Error('Cloud rooms are not configured. See PARTY_CLOUD_SETUP.md');

  loadSDK().then(function(){
    if(!window.firebase||!firebase.database)
      throw new Error('The Firebase database SDK did not load.');
    if(!firebase.apps||!firebase.apps.length) firebase.initializeApp(window.PARTY_FIREBASE);
    return firebase.auth().signInAnonymously();
  }).then(function(){
    ref=firebase.database().ref('party/'+code);
    return ref.child('msgs').orderByKey().limitToLast(1).once('value');
  }).then(function(snap){
    var lastKey=null;
    snap.forEach(function(c){ lastKey=c.key; });
    liveQuery=lastKey ? ref.child('msgs').orderByKey().startAt(lastKey)
                      : ref.child('msgs').orderByKey();
    handler=function(c){
      if(c.key===lastKey) return;              /* the anchor, already seen */
      var m=c.val();
      if(!m||m.from===SELF) return;
      for(var i=0;i<cbs.length;i++) cbs[i](m);
    };
    liveQuery.on('child_added',handler);
    ready=true;
    while(queue.length) api.send(queue.shift());
  })['catch'](function(err){
    /* honest failure: say what went wrong and where the fix is written down,
       rather than leaving a room that looks alive and never delivers anything */
    ready=false;
    var msg='Cloud room failed: '+(err&&err.message||err)+
            '. If the database or anonymous auth is not switched on yet, that is '+
            'expected: see PARTY_CLOUD_SETUP.md.';
    try{ console.error(msg); }catch(e){}
    document.dispatchEvent(new CustomEvent('party-transport-error',{detail:{message:msg}}));
  });

  return api;
}

window.PartyTransport={
  selfId:SELF,
  /* ?cloud=1 opts a page into a real room. Default stays local so a practice
     night never touches the network and never depends on a switch on. */
  open:function(code){
    var wantsCloud=/[?&]cloud=1(&|$)/.test(location.search);
    return wantsCloud ? CloudTransport(code) : LocalTransport(code);
  }
};
})();
