/* window.PartyShell, HOST half. The host is authoritative: phones send
   intents, the host decides, the host sets phase. See PARTY_GAME_BRIEF.md. */
(function(){
'use strict';
var T=null, CODE='', PLAYERS={}, phaseCb=null, playerCb=null, msgCb=null,
    curPhase=null, curData=null, timer=null, started=false, MIN_PLAYERS=3;
var ALPHA='ABCDEFGHJKMNPQRSTUVWXYZ23456789';

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
    T.send({t:'joined',to:m.from,ok:true,started:started});
    /* rejoin lands in the live phase: re-send current phase to that phone */
    if(curPhase) T.send({t:'phase',to:m.from,name:curPhase,data:curData});
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
  createRoom:function(gameSlug){
    return new Promise(function(res){
      CODE=mkCode(); T=window.PartyTransport.open(CODE);
      T.onMessage(handle);
      $('ps-code').textContent=CODE;
      $('ps-join-url').textContent=location.host+'/party/play.html';
      $('ps-lobby').classList.add('on');
      $('ps-start').addEventListener('click',function(){
        if(roster().length<MIN_PLAYERS) return;
        started=true; $('ps-lobby').classList.remove('on');
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
    T.send({t:'phase',to:'*',name:name,data:curData});
    if(phaseCb) phaseCb(name,curData); },
  onPhase:function(cb){ phaseCb=cb; },
  startTimer:function(seconds,onTick,onDone){
    this.stopTimer(); var left=seconds;
    T.send({t:'timer',to:'*',s:left}); if(onTick)onTick(left);
    timer=setInterval(function(){ left--;
      T.send({t:'timer',to:'*',s:Math.max(0,left)});
      if(onTick)onTick(Math.max(0,left));
      if(left<=0){ clearInterval(timer); timer=null; if(onDone)onDone(); }
    },1000);
  },
  stopTimer:function(){ if(timer){clearInterval(timer);timer=null;} T.send({t:'timer',to:'*',s:null}); },
  gameComplete:function(results){
    /* Server-authoritative minting happens here once the cloud transport is
       switched on (Cloud Function mints for EVERY participant; amounts are
       never client-decided). On the local practice transport there is no
       server, so nothing mints and that is honest. */
    T.send({t:'over',to:'*',results:results});
  },
  closeRoom:function(){ if(T)T.close(); },
  players:roster
};
})();
