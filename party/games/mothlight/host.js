/* Mothlight HOST. Built exactly to PARTY_GAME_BRIEF.md's worked example:
   rules 20s -> 12 x (question 20s -> reveal 7s) with standings 8s after
   reveals 4 and 8 -> podium. Host records the LAST answer per player.
   Lone moth = correct while the correct side is a strict minority of
   everyone who answered: +150 instead of +100. */
(function(){
'use strict';
function $(id){return document.getElementById(id);}
var root=$('game-root');
root.innerHTML=
 '<div class="ml-screen" id="ml-rules"><div class="ml-timer" id="ml-rt"></div>'+
 '<div class="ml-rules">A fact appears. True or false?\n\nYour moth lands on your answer for all to see.\n\nChange your mind any time before the timer ends.\n\nRight answers score. Brave right answers score more.</div>'+
 '<button class="ps-btn" id="ml-next" style="margin-top:34px">Next</button></div>'+
 '<div class="ml-screen" id="ml-q"><div class="ml-timer" id="ml-qt"></div>'+
 '<div class="ml-qnum" id="ml-qn"></div><div class="ml-fact" id="ml-qf"></div>'+
 '<div class="ml-lanterns">'+
 '<div class="ml-lant" id="ml-true"><div class="ml-lamp"></div><div class="ml-lab">TRUE</div><div class="ml-moths" id="ml-mt"></div></div>'+
 '<div class="ml-lant shade" id="ml-false"><div class="ml-lamp"></div><div class="ml-lab">FALSE</div><div class="ml-moths" id="ml-mf"></div></div>'+
 '</div><div class="ml-source" id="ml-src" style="visibility:hidden"></div>'+
 '<div class="ml-strip" id="ml-strip"></div></div>'+
 '<div class="ml-screen" id="ml-stand"><div class="ml-qnum">Standings</div><div id="ml-standrows" style="margin-top:20px"></div></div>'+
 '<div class="ml-screen ml-podium" id="ml-pod"><div class="ml-qnum">The night is over</div><div id="ml-podrows" style="margin-top:20px"></div>'+
 /* ⛔ THE FIRST TITLE IN THE CATALOGUE WAS THE ONE YOU COULD NOT LEAVE. Every
    other podium in the pack offers all three; this one offered Play again and
    nothing else, so switching games or ending the night meant walking over and
    reloading the television, which loses the room code. */
 '<div class="ml-btnrow">'+
 '<button class="ps-btn" id="ml-again">Play again</button>'+
 '<button class="ps-btn ghost" id="ml-other">Another game</button>'+
 '<button class="ps-btn ghost" id="ml-end">End night</button></div></div>';

function show(id){ var s=document.querySelectorAll('.ml-screen'); for(var i=0;i<s.length;i++)s[i].classList.remove('on'); $(id).classList.add('on'); }
function esc(s){ return String(s).replace(/[<>&"]/g,function(c){return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c];}); }

function snd(m,a){ try{ if(window.PartySound) PartySound[m](a); }catch(e){} }
function pcol(pid){ try{ return PartyShell.colorFor(pid); }catch(e){ return '#e8dcc8'; } }
var BANK=window.MOTHLIGHT_BANK||[], QS=[], qi=0, scores={}, answers={}, names={}, RM=false;
try{RM=matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(e){}
/* test hook, ?ml_fast=1 only: shrinks every timer so a full game runs in
   about 90 seconds for automated drives. Absent on a plain load. */
var FAST=/[?&]ml_fast=1(&|$)/.test(location.search);
var T_RULES=FAST?3:20, T_Q=FAST?3:20, T_REV=FAST?2:7, T_STAND=FAST?2:8;

function pickQuestions(){
  /* no repeats across recent games on this device; and every game draws
     exactly 6 true + 6 false so the room can never learn to spam one answer
     (the bank itself skews true, selection is where balance is enforced) */
  var used={}; try{used=JSON.parse(localStorage.getItem('ml_used')||'{}');}catch(e){}
  var pool=BANK.filter(function(q){return !used[q.id];});
  if(pool.filter(function(q){return q.answer;}).length<6 ||
     pool.filter(function(q){return !q.answer;}).length<6){ used={}; pool=BANK.slice(); }
  function draw(fromPool,n){ var out=[]; var p=fromPool.slice();
    for(var i=0;i<n&&p.length;i++){ var k=Math.floor(Math.random()*p.length); out.push(p.splice(k,1)[0]); }
    return out; }
  var ts=draw(pool.filter(function(q){return q.answer;}),6);
  var fs=draw(pool.filter(function(q){return !q.answer;}),6);
  QS=ts.concat(fs);
  for(var i=QS.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=QS[i]; QS[i]=QS[j]; QS[j]=t; }
  for(var u=0;u<QS.length;u++) used[QS[u].id]=1;
  try{localStorage.setItem('ml_used',JSON.stringify(used));}catch(e){}
}
function strip(){
  var ids=Object.keys(names), rows='';
  ids.sort(function(a,b){return (scores[b]||0)-(scores[a]||0);});
  for(var i=0;i<ids.length;i++) rows+='<span><i style="background:'+pcol(ids[i])+'"></i>'+
    esc(names[ids[i]])+' <b>'+(scores[ids[i]]||0)+'</b></span>';
  $('ml-strip').innerHTML=rows;
}
function renderMoths(){
  var t='',f='',k;
  for(k in answers[qi]||{}){
    var chip='<div class="ml-moth" data-p="'+k+'" style="border-color:'+pcol(k)+'">'+
      '<i style="background:'+pcol(k)+'"></i>'+esc(names[k]||'?')+'</div>';
    if(answers[qi][k]) t+=chip; else f+=chip;
  }
  $('ml-mt').innerHTML=t; $('ml-mf').innerHTML=f;
}

PartyShell.onPlayerMessage(function(pid,msg){
  /* ⛔ ONLY PLAYERS WHO ARE IN THIS GAME. This was the one host module with no
     guard, so somebody who walked in mid round got a moth on the television
     under the name "?" and then vanished from the reveal, the strip and the
     standings. */
  if(!msg||names[pid]===undefined) return;
  if(msg.t==='answer'&&msg.q===qi+1&&$('ml-q').classList.contains('on')){
    answers[qi]=answers[qi]||{}; answers[qi][pid]=!!msg.v; renderMoths();
    snd('pip');  /* a moth just landed, and the room hears the count rise */
  }
});

function startGame(players){
  scores={}; answers={}; names={};
  for(var i=0;i<players.length;i++){ names[players[i].id]=players[i].name; scores[players[i].id]=0; }
  pickQuestions(); qi=0; phaseRules();
}
function phaseRules(){
  show('ml-rules');
  PartyShell.setPhase('rules',{});
  PartyShell.startTimer(T_RULES,function(s){$('ml-rt').textContent=s;},phaseQuestion);
  $('ml-next').onclick=function(){ PartyShell.stopTimer(); phaseQuestion(); };
}
function phaseQuestion(){
  var q=QS[qi]; if(!q){ phasePodium(); return; }
  show('ml-q'); renderMoths(); strip();
  $('ml-qn').textContent='QUESTION '+(qi+1)+' OF 12';
  $('ml-qf').textContent=q.text;
  $('ml-src').style.visibility='hidden';
  $('ml-true').classList.remove('dimmed','winner'); $('ml-false').classList.remove('dimmed','winner');
  PartyShell.setPhase('question',{num:qi+1,total:12,text:q.text});
  PartyShell.startTimer(T_Q,function(s){ var t=$('ml-qt'); t.textContent=s; t.classList.toggle('low',s<=5); },phaseReveal);
}
function phaseReveal(){
  var q=QS[qi], a=answers[qi]||{}, ids=Object.keys(a);
  var correctIds=ids.filter(function(k){return a[k]===q.answer;});
  var lone=correctIds.length>0 && correctIds.length*2<ids.length;
  var res={}, k;
  for(k in names){
    var got = a.hasOwnProperty(k) ? (a[k]===q.answer ? (lone?'lone':'right') : 'miss') : 'none';
    var pts = got==='lone'?150:got==='right'?100:0;
    scores[k]=(scores[k]||0)+pts; res[k]={got:got,pts:pts};
  }
  snd('reveal', correctIds.length>0);
  var winEl=q.answer?$('ml-true'):$('ml-false'), loseEl=q.answer?$('ml-false'):$('ml-true');
  winEl.classList.add('winner'); loseEl.classList.add('dimmed');
  var moths=document.querySelectorAll('.ml-moth');
  for(var i=0;i<moths.length;i++){ var pid=moths[i].getAttribute('data-p');
    if(res[pid]&&res[pid].pts>0) moths[i].innerHTML+='<span class="pts'+(res[pid].got==='lone'?' lone':'')+'">+'+res[pid].pts+'</span>'; }
  $('ml-src').textContent='Source: '+q.source; $('ml-src').style.visibility='visible';
  strip();
  PartyShell.setPhase('reveal',{num:qi+1,answer:q.answer,source:q.source,results:res});
  PartyShell.startTimer(T_REV,function(s){$('ml-qt').textContent=s;},function(){
    qi++;
    if(qi===4||qi===8) phaseStandings(); else phaseQuestion();
  });
}
function phaseStandings(){
  show('ml-stand');
  var ids=Object.keys(names); ids.sort(function(a,b){return (scores[b]||0)-(scores[a]||0);});
  var rows=''; for(var i=0;i<ids.length;i++)
    rows+='<div class="ml-standrow"><span class="place">'+(i+1)+'</span>'+esc(names[ids[i]])+'<b>'+(scores[ids[i]]||0)+'</b></div>';
  $('ml-standrows').innerHTML=rows;
  PartyShell.setPhase('standings',{scores:scores,names:names});
  PartyShell.startTimer(T_STAND,null,phaseQuestion);
}
function phasePodium(){
  snd('fanfare');
  show('ml-pod');
  var ids=Object.keys(names); ids.sort(function(a,b){return (scores[b]||0)-(scores[a]||0);});
  var rows='', results={};
  for(var i=0;i<ids.length;i++){
    rows+='<div class="ml-standrow"><span class="place">'+(i+1)+'</span>'+esc(names[ids[i]])+'<b>'+(scores[ids[i]]||0)+'</b></div>';
    results[ids[i]]={score:scores[ids[i]]||0,place:i+1};
  }
  $('ml-podrows').innerHTML=rows;
  PartyShell.setPhase('podium',{scores:scores,names:names});
  PartyShell.gameComplete(results);
  $('ml-again').onclick=function(){ startGame(PartyShell.players()); };
  $('ml-other').onclick=function(){ PartyShell.backToPicker(); };
  $('ml-end').onclick=function(){ PartyShell.closeRoom(); };
}
document.addEventListener('party-started',function(ev){ startGame(ev.detail.players); });
})();
