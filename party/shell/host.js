/* window.PartyShell, HOST half. The host is authoritative: phones send
   intents, the host decides, the host sets phase. See PARTY_GAME_BRIEF.md. */
(function(){
'use strict';
var T=null, CODE='', SLUG='', PLAYERS={}, phaseCb=null, playerCb=null, msgCb=null,
    curPhase=null, curData=null, timer=null, started=false, MIN_PLAYERS=3;
var ALPHA='ABCDEFGHJKMNPQRSTUVWXYZ23456789';
var completedCount=0, lastResults=null;
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
      color:assignColor(m.from),seat:seat});
    /* rejoin lands in the live phase: re-send current phase to that phone */
    if(curPhase) T.send({t:'phase',to:m.from,name:curPhase,data:curData,game:SLUG});
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
      esc(r[i].name)+(r[i].connected?'':' (away)')+'</div>';
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

window.PartyShell={
  setMinPlayers:function(n){ MIN_PLAYERS=Math.max(2,n|0); renderLobby(); },
  /* podium control: keep the room and its code, go back and pick another title.
     The shell owns the pages, so a shell navigation here is legal where a module
     navigating would not be. */
  backToPicker:function(){
    location.href='host.html?code='+encodeURIComponent(CODE)+
      (/[?&]embed=1(&|$)/.test(location.search)?'&embed=1':'');
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
      var cloud=/[?&]cloud=1(&|$)/.test(location.search);
      $('ps-join-url').textContent=location.host+'/party/play.html'+(cloud?'?cloud=1':'');
      var note=$('ps-transport-note');
      if(note) note.textContent=cloud
        ? 'Cloud room: phones anywhere can join with that address and this code.'
        : 'Practice room: every player joins from a tab in this same browser. Cloud rooms for real phones arrive with the server switch-on.';
      $('ps-lobby').classList.add('on');
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
    T.send({t:'phase',to:'*',name:name,data:curData,game:SLUG});
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
  },
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
