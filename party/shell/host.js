/* window.PartyShell, HOST half. The host is authoritative: phones send
   intents, the host decides, the host sets phase. See PARTY_GAME_BRIEF.md. */
(function(){
'use strict';
var T=null, CODE='', SLUG='', PLAYERS={}, phaseCb=null, playerCb=null, msgCb=null,
    curPhase=null, curData=null, timer=null, started=false, MIN_PLAYERS=3;
var ALPHA='ABCDEFGHJKMNPQRSTUVWXYZ23456789';
var completedCount=0, lastResults=null;

function mkCode(){ var c=''; for(var i=0;i<4;i++) c+=ALPHA[Math.floor(Math.random()*ALPHA.length)]; return c; }
function roster(){ var out=[],k; for(k in PLAYERS) out.push({id:k,name:PLAYERS[k].name,connected:PLAYERS[k].alive>0}); return out; }
function pushPlayers(){ if(playerCb) playerCb(roster()); renderLobby(); }

/* presence: phones ping every 3s; 8s of silence reads as disconnected
   (phones lock every session; they come back through the same token) */
setInterval(function(){ var changed=false,k;
  for(k in PLAYERS){ if(PLAYERS[k].alive>0){ PLAYERS[k].alive--; if(PLAYERS[k].alive===0) changed=true; } }
  if(changed) pushPlayers();
},1000);

function handle(m){
  if(m.t==='join'){
    var isNew=!PLAYERS[m.from];
    PLAYERS[m.from]={name:String(m.name||'a moth').slice(0,12),alive:8};
    if(!isNew||!started){ /* fine either way */ }
    /* the phone learns WHICH game module to load from the host, so one shell
       page serves the whole catalogue (it used to hardcode mothlight) */
    T.send({t:'joined',to:m.from,ok:true,started:started,game:SLUG});
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
    rows+='<div class="ps-prow'+(r[i].connected?'':' off')+'">'+esc(r[i].name)+(r[i].connected?'':' (away)')+'</div>';
  $('ps-roster').innerHTML=rows||'<div class="ps-prow dim">nobody yet</div>';
  var n=r.length, btn=$('ps-start');
  btn.disabled=n<MIN_PLAYERS;
  btn.textContent=n<MIN_PLAYERS?('Start ('+n+' of '+MIN_PLAYERS+' needed)'):'Start with '+n+' players';
}
function esc(s){ return String(s).replace(/[<>&"]/g,function(c){return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c];}); }

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
        if(roster().length<MIN_PLAYERS) return;
        started=true; completedCount=0; lastResults=null;
        $('ps-lobby').classList.remove('on');
        document.dispatchEvent(new CustomEvent('party-started',{detail:{players:roster()}}));
      });
      res({code:CODE});
    });
  },
  onPlayers:function(cb){ playerCb=cb; },
  onPlayerMessage:function(cb){ msgCb=cb; },
  sendToPlayer:function(pid,msg){ T.send({t:'game',to:pid,msg:msg}); },
  broadcast:function(msg){ T.send({t:'game',to:'*',msg:msg}); },
  setPhase:function(name,data){ curPhase=name; curData=data||{};
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
  closeRoom:function(){ if(T){ if(T.destroy) T.destroy(); T.close(); } },
  players:roster,
  code:function(){ return CODE; }
};
})();
