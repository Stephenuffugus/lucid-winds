/* LIFTING FOG, host screen.

   Eight questions. Each one runs 24 seconds and lifts a clue every 6 seconds,
   and the answer is worth less every time it does: 100, 75, 50, 25.

   ⭐ THE DECISION THAT MAKES IT A GAME: you get ONE answer. A wrong guess scores
   nothing and locks you out of the rest of that question. Without that cost,
   guessing at clue 1 would be free and the whole press your luck shape would
   collapse into random tapping.

   ⭐ The room sees HOW MANY have locked in but never who was right, so an early
   flurry of confident answers is pressure without being information.

   When everybody has answered, the question ends early. Dead air is the enemy
   of a party game. */
(function(){
'use strict';
function $(id){return document.getElementById(id);}
function esc(s){ return String(s).replace(/[<>&"]/g,function(c){return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c];}); }

var root=$('game-root');
root.innerHTML=
 '<div class="lf-screen" id="lf-rules"><div class="lf-timer" id="lf-rt"></div>'+
 '<div class="lf-rules">Something in the fog tells you what it is, one clue at a time.\n\nName it early and it is worth the most.\n\nEvery clue that lifts makes it worth less.\n\nYou get one answer only, so be sure before you tap.</div>'+
 '<button class="ps-btn" id="lf-next" style="margin-top:34px">Next</button></div>'+

 '<div class="lf-screen" id="lf-q"><div class="lf-top">'+
 '<div class="lf-num" id="lf-qn"></div><div class="lf-worth" id="lf-worth"></div>'+
 '<div class="lf-timer" id="lf-qt"></div></div>'+
 '<div class="lf-clues" id="lf-clues"></div>'+
 '<div class="lf-opts" id="lf-qopts"></div>'+
 '<div class="lf-fog" id="lf-fog"></div>'+
 '<div class="lf-in" id="lf-qin"></div><div class="lf-strip" id="lf-strip1"></div></div>'+

 '<div class="lf-screen" id="lf-rev"><div class="lf-timer" id="lf-vt"></div>'+
 '<div class="lf-num" id="lf-vn"></div>'+
 '<div class="lf-was">It was</div><div class="lf-answer" id="lf-vans"></div>'+
 '<div class="lf-scored" id="lf-vscored"></div><div class="lf-strip" id="lf-strip2"></div></div>'+

 '<div class="lf-screen" id="lf-stand"><div class="lf-num">Standings</div>'+
 '<div id="lf-standrows" class="lf-rows"></div></div>'+

 '<div class="lf-screen lf-podium" id="lf-pod"><div class="lf-num">The fog has cleared</div>'+
 '<div id="lf-podrows" class="lf-rows"></div>'+
 '<div class="lf-earn">Everyone earned sunbeams for playing.</div>'+
 '<div class="lf-btnrow">'+
 '<button class="ps-btn" id="lf-again">Play again</button>'+
 '<button class="ps-btn ghost" id="lf-other">Another game</button>'+
 '<button class="ps-btn ghost" id="lf-end">End night</button></div></div>';

function show(id){ var s=root.querySelectorAll('.lf-screen');
  for(var i=0;i<s.length;i++) s[i].classList.remove('on'); $(id).classList.add('on'); }

function snd(m,a){ try{ if(window.PartySound) PartySound[m](a); }catch(e){} }
function pcol(pid){ try{ return PartyShell.colorFor(pid); }catch(e){ return '#e8dcc8'; } }
var BANK=window.LIFTINGFOG_BANK||[], QS=[], qi=0, ROUNDS=8;
var scores={}, names={}, answers={}, order=[], shuffled=[], curTier=0;
var PTS=[100,75,50,25];
var RM=false; try{RM=matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(e){}
var FAST=/[?&]lf_fast=1(&|$)/.test(location.search);
var T_RULES=FAST?3:20, T_Q=FAST?8:24, T_REV=FAST?2:7, T_STAND=FAST?2:8;
var STEP=T_Q/4;

function shuffle(a){ var out=a.slice();
  for(var i=out.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=out[i]; out[i]=out[j]; out[j]=t; }
  return out; }

function pickQuestions(){
  var used={}; try{used=JSON.parse(localStorage.getItem('lf_used')||'{}');}catch(e){}
  var pool=BANK.filter(function(q){return !used[q.id];});
  if(pool.length<ROUNDS){ used={}; pool=BANK.slice(); }
  QS=[]; shuffled=[];
  for(var i=0;i<ROUNDS&&pool.length;i++){
    var k=Math.floor(Math.random()*pool.length);
    var q=pool.splice(k,1)[0]; QS.push(q); used[q.id]=1;
    /* options[0] is the correct one in the bank; the room must never see that */
    shuffled.push(shuffle(q.options));
  }
  try{localStorage.setItem('lf_used',JSON.stringify(used));}catch(e){}
}

function strip(which){
  var ids=order.slice(), rows='';
  ids.sort(function(a,b){return (scores[b]||0)-(scores[a]||0);});
  for(var i=0;i<ids.length;i++) rows+='<span><i style="background:'+pcol(ids[i])+'"></i>'+
    esc(names[ids[i]])+' <b>'+(scores[ids[i]]||0)+'</b></span>';
  var el=$(which); if(el) el.innerHTML=rows;
}

function renderClues(tier){
  var q=QS[qi], html='';
  for(var i=0;i<=tier&&i<4;i++)
    html+='<div class="lf-clue'+(i===tier?' fresh':'')+'">'+esc(q.clues[i])+'</div>';
  $('lf-clues').innerHTML=html;
  $('lf-fog').className='lf-fog tier'+tier+(RM?' still':'');
  $('lf-worth').textContent='WORTH '+PTS[tier];
}

/* ⭐ WAIT FOR THE ROOM, NOT FOR THE ROSTER TAKEN AT KICK OFF. Ending the question
   the moment everybody has answered is what keeps this fast, and it was measured
   against the list of players captured when the game started. One person walking
   out with their phone meant the whole room then sat out the full 24 seconds on
   every remaining question. Count who is actually here. */
function here(){
  var p=PartyShell.presentPlayers(), out=[];
  for(var i=0;i<p.length;i++) if(names[p[i]]!==undefined) out.push(p[i]);
  return out;
}
function allIn(store){
  var h=here(), got=0;
  for(var i=0;i<h.length;i++) if(store.hasOwnProperty(h[i])) got++;
  return h.length>0 && got>=h.length;
}

PartyShell.onPlayerMessage(function(pid,msg){
  if(!msg||names[pid]===undefined) return;
  if(msg.t!=='guess'||msg.q!==qi+1) return;
  if(!$('lf-q').classList.contains('on')) return;
  answers[qi]=answers[qi]||{};
  /* ⛔ ONE ANSWER ONLY, EVER, and TELL THE PHONE SO. A phone that locked and
     rejoined has forgotten it already answered, so it will happily let its owner
     tap a second option. The host was right to ignore it and silent about it,
     which looked to the player exactly like a broken button. */
  if(answers[qi].hasOwnProperty(pid)){ PartyShell.sendToPlayer(pid,{t:'locked'}); return; }
  var idx=msg.v|0; if(idx<0||idx>3) return;
  answers[qi][pid]={pick:shuffled[qi][idx],tier:curTier};
  $('lf-qin').textContent=Object.keys(answers[qi]).length+' of '+here().length+' locked in';
  snd('pip');
  PartyShell.sendToPlayer(pid,{t:'locked'});
  if(allIn(answers[qi])){ PartyShell.stopTimer(); phaseReveal(); }
});

function startGame(players){
  scores={}; names={}; answers={}; order=[];
  for(var i=0;i<players.length;i++){
    names[players[i].id]=players[i].name; scores[players[i].id]=0; order.push(players[i].id);
  }
  pickQuestions(); qi=0; phaseRules();
}

function phaseRules(){
  show('lf-rules');
  PartyShell.setPhase('rules',{});
  PartyShell.startTimer(T_RULES,function(s){$('lf-rt').textContent=s;},phaseQuestion);
  $('lf-next').onclick=function(){ PartyShell.stopTimer(); phaseQuestion(); };
}

function phaseQuestion(){
  var q=QS[qi]; if(!q){ phasePodium(); return; }
  show('lf-q'); strip('lf-strip1');
  curTier=0;
  $('lf-qn').textContent='QUESTION '+(qi+1)+' OF '+ROUNDS;
  $('lf-qin').textContent='0 of '+here().length+' locked in';
  var oh='';
  for(var oi=0;oi<shuffled[qi].length;oi++) oh+='<div class="lf-opt">'+esc(shuffled[qi][oi])+'</div>';
  $('lf-qopts').innerHTML=oh;
  renderClues(0);
  PartyShell.setPhase('question',{num:qi+1,total:ROUNDS,options:shuffled[qi],
    clue:q.clues[0],tier:0,worth:PTS[0]});
  PartyShell.startTimer(T_Q,function(s){
    var t=$('lf-qt'); t.textContent=s; t.classList.toggle('low',s<=5);
    var tier=Math.floor((T_Q-s)/STEP); if(tier>3) tier=3; if(tier<0) tier=0;
    if(tier!==curTier){
      curTier=tier; renderClues(tier);
      snd('chime');  /* the fog just lifted and the answer is worth less */
      /* a phone that rejoins mid question needs the clue AND the current worth,
         so every tier change is its own full phase payload */
      PartyShell.setPhase('question',{num:qi+1,total:ROUNDS,options:shuffled[qi],
        clue:QS[qi].clues[tier],tier:tier,worth:PTS[tier]});
    }
  },phaseReveal);
}

function phaseReveal(){
  var q=QS[qi], a=answers[qi]||{}, res={}, scored=[];
  for(var i=0;i<order.length;i++){
    var pid=order[i], got='none', pts=0;
    if(a.hasOwnProperty(pid)){
      if(a[pid].pick===q.options[0]){ got='right'; pts=PTS[a[pid].tier]; }
      else got='wrong';
    }
    scores[pid]=(scores[pid]||0)+pts;
    res[pid]={got:got,pts:pts};
    if(pts>0) scored.push({n:names[pid],p:pts,col:pcol(pid)});
  }
  scored.sort(function(x,y){return y.p-x.p;});
  var html='';
  for(var j=0;j<scored.length;j++)
    html+='<span class="lf-sc" style="border-color:'+scored[j].col+'"><i style="background:'+
      scored[j].col+'"></i>'+esc(scored[j].n)+' <b>+'+scored[j].p+'</b></span>';
  $('lf-vscored').innerHTML=html||'<span class="lf-none">Nobody found it that time.</span>';
  show('lf-rev');
  snd('reveal', scored.length>0);
  $('lf-vn').textContent='QUESTION '+(qi+1)+' OF '+ROUNDS;
  $('lf-vans').textContent=q.options[0];
  strip('lf-strip2');
  PartyShell.setPhase('reveal',{num:qi+1,answer:q.options[0],results:res});
  PartyShell.startTimer(T_REV,function(s){$('lf-vt').textContent=s;},function(){
    qi++;
    if(qi>=ROUNDS) phasePodium();
    else if(qi===4) phaseStandings();
    else phaseQuestion();
  });
}

function rows(target){
  var ids=order.slice(); ids.sort(function(a,b){return (scores[b]||0)-(scores[a]||0);});
  var html='';
  for(var i=0;i<ids.length;i++)
    html+='<div class="lf-row"><span class="place">'+(i+1)+'</span>'+esc(names[ids[i]])+
          '<b>'+(scores[ids[i]]||0)+'</b></div>';
  $(target).innerHTML=html;
  return ids;
}

function phaseStandings(){
  show('lf-stand'); rows('lf-standrows');
  PartyShell.setPhase('standings',{scores:scores,names:names});
  PartyShell.startTimer(T_STAND,null,phaseQuestion);
}

function phasePodium(){
  snd('fanfare');
  show('lf-pod');
  var ids=rows('lf-podrows'), results={};
  for(var i=0;i<ids.length;i++) results[ids[i]]={score:scores[ids[i]]||0,place:i+1};
  PartyShell.setPhase('podium',{scores:scores,names:names});
  PartyShell.gameComplete(results);
  $('lf-again').onclick=function(){ startGame(PartyShell.players()); };
  $('lf-other').onclick=function(){ PartyShell.backToPicker(); };
  $('lf-end').onclick=function(){ PartyShell.closeRoom(); };
}

document.addEventListener('party-started',function(ev){ startGame(ev.detail.players); });
})();
