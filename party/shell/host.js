/* window.PartyShell, HOST half. The host is authoritative: phones send
   intents, the host decides, the host sets phase. See PARTY_GAME_BRIEF.md. */
(function(){
'use strict';
var T=null, CODE='', SLUG='', PLAYERS={}, phaseCb=null, playerCb=null, msgCb=null,
    curPhase=null, curData=null, timer=null, started=false, MIN_PLAYERS=3;
var ALPHA='ABCDEFGHJKMNPQRSTUVWXYZ23456789';
var completedCount=0, lastResults=null;
/* ⭐ NO TV MODE (18 Oct 2026, Stephen: "can we make everyones screen the screen to watch? that way we dont have to
   cram aropund a screen?"). Every phone shows the room's screen itself, and the HOST PLAYS TOO.
   How the host plays: the host page loads play.html?seat=1 in an iframe (#ps-seat-frame). That seat is an ordinary
   phone in every way that matters: it joins the room through the same transport with its own player id (transport.js
   keeps a separate tab marker for seat=1), it runs the game's player.js unchanged in its own document, and the room
   logic keeps running here in the host page underneath it. The host's only extra is the host bar (#ps-hostbar), which
   shows the controls a module hands over with PartyShell.hostActions (Start now, Play again, Another game, End night).
   Phones learn the mode from the noTv flag on joined and on every phase. A title must say it is ready
   (catalogue noTv:true); the others keep the big screen and the lobby says so. */
var NOTV=false, NOTV_OK=false, SEAT=null, ACTIONS=[], seatName='';
/* who is actually IN the game that is running. A phone that arrives mid round is
   in the room but not in the round, and it has to be told that, because every
   module drops messages from somebody it does not know and the player just sees
   a live screen where nothing they press does anything. */
var PARTICIPANTS={};

/* ⭐ EVERY PLAYER GETS A COLOUR, AND IT IS THE SHELL'S JOB. At ten feet, four
   names in the same cream text are four identical shapes: reading the room
   means reading, and reading is slow. A colour is instant, and because the
   shell owns it every title gets the same one for the same person, so "I am the
   blue one" holds all night and across games.

   Chosen to be distinct on a dark screen and to stay clear of the gold that
   every score in the pack is already printed in. */
var PCOLS=['#8fd0f0','#7ab356','#e08a4a','#c98fb8',
           '#f0d264','#6fd4c0','#b0a0f0','#e88a8a'];
var colorOf={}, colorNext=0;
function assignColor(id){
  if(!colorOf[id]){ colorOf[id]=PCOLS[colorNext%PCOLS.length]; colorNext++; }
  return colorOf[id];
}

function mkCode(){ var c=''; for(var i=0;i<4;i++) c+=ALPHA[Math.floor(Math.random()*ALPHA.length)]; return c; }
function roster(){ var out=[],k;
  for(k in PLAYERS) out.push({id:k,name:PLAYERS[k].name,
    connected:PLAYERS[k].alive>0, color:assignColor(k)});
  return out; }
/* ⭐ THE ROOM IS WHO IS IN THE ROOM. Five of the nine titles end a round early
   once everybody has acted, and that early end is the difference between a party
   and a group of people watching a clock. Measured against the roster it is
   measured against ghosts: one person leaves and the room waits out the full
   timer on every round for the rest of the night. Modules ask for this, not for
   roster(). */
function present(){ var out=[],k;
  for(k in PLAYERS) if(PLAYERS[k].alive>0) out.push(k);
  return out; }
function pushPlayers(){ if(playerCb) playerCb(roster()); renderLobby(); }

/* presence: phones ping every 3s; 8s of silence reads as disconnected
   (phones lock every session; they come back through the same token) */
setInterval(function(){ var changed=false,k;
  for(k in PLAYERS){
    PLAYERS[k].alive--;
    if(PLAYERS[k].alive===0) changed=true;
    /* ⛔ PRUNE IN THE LOBBY ONLY, NEVER MID GAME. A phone that locks during a
       round must keep its seat, its name and its score, so a running game never
       forgets anybody. But somebody who wandered off before Start must not hold
       the room hostage: they count toward the minimum, they hold a slot on the
       television, and a phone that leaves and comes back in a NEW TAB is a new
       id, so three real people can quietly become a lobby of six. */
    if(!started && PLAYERS[k].alive<=-25){ delete PLAYERS[k]; changed=true; }
  }
  if(changed) pushPlayers();
},1000);

function handle(m){
  if(m.t==='join'){
    var isNew=!PLAYERS[m.from];
    PLAYERS[m.from]={name:String(m.name||'a moth').slice(0,12),alive:8};
    if(m.seat) SEAT=m.from;   /* the host's own seat (no TV mode) */
    if(!isNew||!started){ /* fine either way */ }
    /* the phone learns WHICH game module to load from the host, so one shell
       page serves the whole catalogue (it used to hardcode mothlight) */
    /* the phone is told its own colour so a player can find themselves on the
       big screen, which is the entire point of having one */
    /* ⛔ A LATE ARRIVAL IS IN THE ROOM BUT NOT IN THE ROUND. Every module drops
       messages from an id it does not know, so without this the newcomer gets
       the real question with real buttons and every tap does nothing. Told the
       truth, they wait thirty seconds and join the next one. */
    var seat=(started&&!PARTICIPANTS[m.from])?'next':'in';
    T.send({t:'joined',to:m.from,ok:true,started:started,game:SLUG,
      color:assignColor(m.from),seat:seat,noTv:NOTV});
    /* rejoin lands in the live phase: re-send current phase to that phone */
    if(curPhase) T.send({t:'phase',to:m.from,name:curPhase,data:curData,game:SLUG,noTv:NOTV});
    pushPlayers();
  } else if(m.t==='ping'){ if(PLAYERS[m.from]){ var was=PLAYERS[m.from].alive<=0; PLAYERS[m.from].alive=8; if(was)pushPlayers(); } }
  else if(m.t==='intent'){ if(msgCb&&started) msgCb(m.from,m.msg); }
}

/* ---- lobby chrome (shell-owned) ---- */
function $(id){return document.getElementById(id);}
function renderLobby(){
  var el=$('ps-lobby'); if(!el||started) return;
  var r=roster(), rows='';
  for(var i=0;i<r.length;i++)
    rows+='<div class="ps-prow'+(r[i].connected?'':' off')+'">'+
      '<span class="ps-dot" style="background:'+r[i].color+'"></span>'+
      esc(r[i].name)+(r[i].id===SEAT?' (you)':'')+(r[i].connected?'':' (away)')+'</div>';
  $('ps-roster').innerHTML=rows||'<div class="ps-prow dim">nobody yet</div>';
  /* ⛔ COUNT PHONES THAT ARE ACTUALLY ANSWERING. Counting the roster let a room
     of two start a four player title on the strength of two people who had
     already closed their tab. */
  var n=present().length, btn=$('ps-start');
  btn.disabled=n<MIN_PLAYERS;
  btn.textContent=n<MIN_PLAYERS?('Start ('+n+' of '+MIN_PLAYERS+' needed)'):'Start with '+n+' players';
}
function esc(s){ return String(s).replace(/[<>&"]/g,function(c){return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c];}); }
function seatEverybody(ids){
  PARTICIPANTS={};
  for(var i=0;i<ids.length;i++) PARTICIPANTS[ids[i]]=1;
  try{ T.send({t:'seat',to:'*',seat:'in'}); }catch(e){}
}

/* ---- no TV mode: the mode switch, the host's seat, the host bar ---- */
function roomFlags(){ var s=location.search, out='';
  if(/[?&]cloud=1(&|$)/.test(s)) out+='&cloud=1';
  if(/[?&]local=1(&|$)/.test(s)) out+='&local=1';
  return out; }
function phoneSized(){ return Math.min(window.innerWidth||0, window.innerHeight||0) < 600; }
function savedName(){ try{ return localStorage.getItem('party_name')||''; }catch(e){ return ''; } }
/* ⛔ A FRESH IFRAME, NEVER A RE-POINTED ONE. Setting src on a loaded frame adds a history entry to the host's tab, so
   the phone's Back button would walk through the seat's pages instead of leaving. The first load of a new frame
   replaces its blank start page, and a rename uses location.replace. */
function seatJoin(name){
  name=String(name||'').replace(/^\s+|\s+$/g,'').slice(0,12);
  if(!name||!CODE) return;
  seatName=name;
  try{ localStorage.setItem('party_name',name); }catch(e){}
  var url='play.html?seat=1&r='+CODE+'&n='+encodeURIComponent(name)+roomFlags();
  var f=$('ps-seat-frame');
  if(f){ try{ f.contentWindow.location.replace(url); }catch(e){ f.src=url; } }
  else{
    f=document.createElement('iframe');
    f.id='ps-seat-frame'; f.title='Your seat'; f.setAttribute('allow','autoplay');
    f.src=url; document.body.appendChild(f);
  }
  paintMode();
}
function seatLeave(){
  var f=$('ps-seat-frame'); if(f&&f.parentNode) f.parentNode.removeChild(f);
  if(SEAT&&PLAYERS[SEAT]&&!started) delete PLAYERS[SEAT];
  SEAT=null; seatName='';
  document.body.classList.remove('notv-playing');
  if(T) pushPlayers();
}
function setMode(on){
  NOTV=!!(on&&NOTV_OK);
  window.PartyShell.noTv=NOTV;
  if(!NOTV) seatLeave();
  else if(!$('ps-seat-frame')&&savedName()) seatJoin(savedName());
  paintMode(); renderBar();
}
function paintMode(){
  var box=$('ps-mode'), row=$('ps-seatrow'), note=$('ps-mode-note'), inp=$('ps-seat-name'), go=$('ps-seat-go');
  if(box) box.hidden=!NOTV_OK;
  var bp=$('ps-mode-phones'), bt=$('ps-mode-tv');
  if(bp){ bp.classList.toggle('on',NOTV); bp.setAttribute('aria-pressed',NOTV?'true':'false'); }
  if(bt){ bt.classList.toggle('on',!NOTV); bt.setAttribute('aria-pressed',NOTV?'false':'true'); }
  if(row) row.hidden=!NOTV;
  var seated=!!$('ps-seat-frame');
  if(inp&&!inp.value) inp.value=seatName||savedName();
  if(go) go.textContent=seated?'Rename':'Play from this phone';
  if(note){
    var ready=[], cat=window.WHACKBOX_CATALOGUE||[];
    for(var i=0;i<cat.length;i++) if(cat[i].noTv) ready.push(cat[i].name);
    note.textContent = NOTV ? (seated ? 'Everyone watches the game on their own phone, and you play from this one.'
                                      : 'Type your name to play from this phone too.')
      : NOTV_OK ? 'The game plays on this screen and the phones are the controllers.'
      : phoneSized() ? 'This game needs one big screen everyone can see. '+(ready.length?ready.join(', ')+' plays on phones alone.':'')
      : '';
    note.hidden=!note.textContent;
  }
}
/* the bar stays up for the whole game on the host's phone, because the room's sound plays from that phone and its
   sound switch lives here (the floating one sat on top of the seat's headings, seen in the podium shot) */
function renderBar(){
  var bar=$('ps-hostbar'); if(!bar) return;
  var on=NOTV&&started&&!!$('ps-seat-frame');
  bar.innerHTML='';
  if(on){
    var mu=document.createElement('button'), snd=window.PartySound;
    var paint=function(){ var s=snd?snd.isOn():false; mu.textContent=s?'♪':'✕'; mu.classList.toggle('off',!s);
      mu.setAttribute('aria-label',s?'Sound on':'Sound off'); };
    mu.type='button'; mu.className='ps-hb-mute'; paint();
    mu.addEventListener('click',function(){ if(snd){ snd.toggle(); paint(); } });
    bar.appendChild(mu);
  }
  if(on) for(var i=0;i<ACTIONS.length;i++){
    var a=ACTIONS[i], b=document.createElement('button');
    b.type='button'; b.className='ps-hb-btn'+(a.ghost?' ghost':''); b.textContent=a.label;
    b.addEventListener('click',(function(fn){ return function(){ if(fn) fn(); }; })(a.fn));
    bar.appendChild(b);
  }
  document.body.classList.toggle('notv-bar',on);
}

window.PartyShell={
  setMinPlayers:function(n){ MIN_PLAYERS=Math.max(2,n|0); renderLobby(); },
  /* podium control: keep the room and its code, go back and pick another title.
     The shell owns the pages, so a shell navigation here is legal where a module
     navigating would not be. */
  backToPicker:function(){
    location.href='host.html?code='+encodeURIComponent(CODE)+
      (/[?&]embed=1(&|$)/.test(location.search)?'&embed=1':'')+
      (/[?&]cloud=1(&|$)/.test(location.search)?'&cloud=1':'')+   /* a room stays the kind it was when the game changes */
      (/[?&]local=1(&|$)/.test(location.search)?'&local=1':'');
  },
  createRoom:function(gameSlug){
    return new Promise(function(res){
      SLUG=gameSlug||'';
      /* a code can be handed in on the URL so switching games from the podium
         keeps the room alive and phones never retype anything */
      var carried=(location.search.match(/[?&]code=([A-Za-z0-9]{4})/)||[])[1];
      CODE=carried?carried.toUpperCase():mkCode();
      T=window.PartyTransport.open(CODE);
      T.onMessage(handle);
      $('ps-code').textContent=CODE;
      /* a cloud room's phones must open a cloud page, so the flag rides on the
         address the TV is showing rather than being something to remember */
      /* 18 Oct 2026, Stephen: typing lucidwinds.com/party/play.html is too much friction. A real room shows a QR
         (it carries the room and the code, so a phone lands in the room) and the short address lucidwinds.com/join. */
      var cloud=window.PartyTransport.isCloud();
      var joinHref=location.protocol+'//'+location.host+'/party/play.html?r='+CODE+
        (/[?&]cloud=1(&|$)/.test(location.search)?'&cloud=1':'');   /* a forced real room (the test rig) stays forced */
      $('ps-join-url').textContent=cloud ? location.host.replace(/^www\./,'')+'/join'
                                         : location.host+'/party/play.html?local=1';
      var qr=$('ps-qr');
      if(qr && cloud && window.qrcode){
        try{ var q=qrcode(0,'M'); q.addData(joinHref); q.make();
             qr.innerHTML=q.createSvgTag({cellSize:6,margin:2,scalable:true}); qr.hidden=false; }catch(e){ qr.hidden=true; }
      }
      var note=$('ps-transport-note');
      if(note) note.textContent=cloud
        ? 'Phones anywhere can join: scan the square, or open that address and type the code.'
        : 'Practice room: every player joins from a tab in this same browser.';
      $('ps-lobby').classList.add('on');
      /* no TV mode: offered only for a title that is ready for it, and the default when the host page is on a
         phone (nobody hosts on a phone to stare at it alone) */
      var cat=window.WHACKBOX_CATALOGUE||[], ent=null;
      for(var ci=0;ci<cat.length;ci++) if(cat[ci].slug===SLUG) ent=cat[ci];
      NOTV_OK=!!(ent&&ent.noTv);
      var mp=$('ps-mode-phones'), mt=$('ps-mode-tv'), sg=$('ps-seat-go'), sn=$('ps-seat-name');
      if(mp) mp.addEventListener('click',function(){ setMode(true); });
      if(mt) mt.addEventListener('click',function(){ setMode(false); });
      if(sg) sg.addEventListener('click',function(){ seatJoin(sn?sn.value:''); });
      if(sn) sn.addEventListener('keydown',function(e){ if(e.key==='Enter'){ e.preventDefault(); seatJoin(sn.value); } });
      setMode(NOTV_OK&&phoneSized());
      /* HEARTBEAT. Without it a phone cannot tell "the host is thinking" from
         "the host is gone", so it sits on a dead screen forever and the party
         quietly ends with nobody being told. */
      setInterval(function(){ try{ T.send({t:'hb',to:'*'}); }catch(e){} },2000);
      T.send({t:'hb',to:'*'});
      $('ps-start').addEventListener('click',function(){
        var here=present();
        if(here.length<MIN_PLAYERS) return;
        started=true; completedCount=0; lastResults=null;
        seatEverybody(here);
        $('ps-lobby').classList.remove('on');
        /* no TV mode: the host's phone becomes their seat; the room logic runs on underneath it */
        if(NOTV&&$('ps-seat-frame')) document.body.classList.add('notv-playing');
        renderBar();
        /* only phones that are here get a row on the television and a score */
        var line=roster().filter(function(p){ return p.connected; });
        document.dispatchEvent(new CustomEvent('party-started',{detail:{players:line}}));
      });
      /* ⛔ A LOBBY WITH ONE DISABLED BUTTON IS A TRAP. First Frost needs four
         players. If the fourth never gets their phone on, the television has no
         back, no other game and no start anyway, and the only way out is
         somebody walking over to reload the tab and losing the room code. This
         keeps the code and goes back to the menu. */
      var back=$('ps-lobby-back');
      if(back) back.addEventListener('click',function(){ window.PartyShell.backToPicker(); });
      res({code:CODE});
    });
  },
  /* who is in the round AND in the room. Modules count against this, never
     against the roster they captured when the game started. */
  presentPlayers:function(){
    var out=[],k;
    for(k in PLAYERS) if(PLAYERS[k].alive>0&&PARTICIPANTS[k]) out.push(k);
    return out;
  },
  onPlayers:function(cb){ playerCb=cb; },
  onPlayerMessage:function(cb){ msgCb=cb; },
  sendToPlayer:function(pid,msg){ T.send({t:'game',to:pid,msg:msg}); },
  broadcast:function(msg){ T.send({t:'game',to:'*',msg:msg}); },
  setPhase:function(name,data){ curPhase=name; curData=data||{};
    /* every title opens on 'rules', so that is where a new game begins as far as
       the shell is concerned. Play again has to re-seat the room or somebody who
       arrived during the last game stays stuck on "in for the next one" through
       the next one as well. */
    if(name==='rules') seatEverybody(present());
    T.send({t:'phase',to:'*',name:name,data:curData,game:SLUG,noTv:NOTV});
    if(phaseCb) phaseCb(name,curData); },
  onPhase:function(cb){ phaseCb=cb; },
  startTimer:function(seconds,onTick,onDone){
    this.stopTimer(); var left=seconds;
    /* a quiet pulse under anything long enough to read, so the room is not in
       silence while people think. Short phases (a reveal) stay clean. */
    if(window.PartySound) PartySound.bed(seconds>8);
    T.send({t:'timer',to:'*',s:left}); if(onTick)onTick(left);
    timer=setInterval(function(){ left--;
      T.send({t:'timer',to:'*',s:Math.max(0,left)});
      if(onTick)onTick(Math.max(0,left));
      /* the last five seconds are the same in every title, so the shell owns
         them; a module that forgot would be the only silent one in the pack */
      if(window.PartySound && left>0 && left<=5) PartySound.tick(left);
      if(left<=0){ clearInterval(timer); timer=null;
        if(window.PartySound) PartySound.bed(false);
        if(onDone)onDone(); }
    },1000);
  },
  stopTimer:function(){ if(timer){clearInterval(timer);timer=null;}
    if(window.PartySound) PartySound.bed(false);
    T.send({t:'timer',to:'*',s:null}); },
  /* the end of a game is "gameComplete fired", not "a screen id contains pod".
     Moongraft ends on a gallery and the id heuristic called a finished game
     stuck. This also lets a harness assert the real contract: exactly once,
     with every participant present. */
  completed:function(){ return {n:completedCount, results:lastResults}; },
  gameComplete:function(results){
    completedCount++; lastResults=results;
    /* Server-authoritative minting happens here once the cloud transport is
       switched on (Cloud Function mints for EVERY participant; amounts are
       never client-decided). On the local practice transport there is no
       server, so nothing mints and that is honest. */
    T.send({t:'over',to:'*',results:results});
  },
  /* ⛔ SAY GOODBYE BEFORE YOU GO. A phone reads seven seconds of host silence as
     a DROP, so ending the night without a word left every phone in the room on
     "Lost the big screen. Waiting for it to come back. You do not need to do
     anything." forever, which is a comforting lie about a room that no longer
     exists. The send needs a beat to actually leave before the channel closes. */
  closeRoom:function(){
    if(!T) return;
    try{ T.send({t:'bye',to:'*'}); }catch(e){}
    var t=T;
    setTimeout(function(){ try{ if(t.destroy) t.destroy(); t.close(); }catch(e){} },500);
    /* no TV mode: the host's seat now says the night is over, so the bar offers the way on */
    if(NOTV){
      ACTIONS=[{label:'Pick a new game',fn:function(){ var f=roomFlags(); location.href='host.html'+(f?'?'+f.slice(1):''); }}];
      renderBar();
    }
  },
  /* no TV mode: the controls the big screen would have shown the host (Start now, Play again, Another game, End
     night). A module passes [{label, fn, ghost}] whenever they change, [] when there are none. Shown only in no TV
     mode, on the host's phone, under its seat; on a big screen the module's own buttons are the controls. */
  hostActions:function(list){ ACTIONS=list||[]; renderBar(); },
  noTv:false,
  /* ⛔ PLAY AGAIN IS A NEW GAME, SO IT TAKES A NEW REGISTER. Its only consumer
     is every module's Play again button, and handing it the raw roster carried
     everybody who had already left into the next game as a permanent row on the
     television with a frozen score and a seat in every "n of N" count. Anybody
     who wandered back in during the podium is picked up here as well, which is
     the same rule read from the other end. */
  players:function(){
    var out=roster().filter(function(p){ return p.connected; });
    /* if the whole room happens to be mid reconnect, replaying with nobody is
       worse than replaying with the last known register */
    return out.length?out:roster();
  },
  allPlayers:roster,
  colorFor:function(id){ return colorOf[id]||'#e8dcc8'; },
  code:function(){ return CODE; }
};
})();
