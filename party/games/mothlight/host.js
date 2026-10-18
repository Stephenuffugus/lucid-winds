/* Mothlight HOST. Built exactly to PARTY_GAME_BRIEF.md's worked example:
   rules 20s -> 12 x (question 20s -> reveal 7s) with standings 8s after
   reveals 4 and 8 -> podium. Host records the LAST answer per player.

   ⭐ 18 Oct 2026, Astra's review (party/reviews/WHACKBOX-REVIEW-GPT-2026-10-18.md, MOTHLIGHT-D01 to D04):
   - D01 THE BONUS IS EXACT. A correct answer earns 100. It earns 150 in total when the correct answers are FEWER THAN
     HALF of everyone who answered AND at least three people answered. Exactly half earns 100. A missing answer is
     missing: it is not false and it does not count as a respondent. Called "Right with the smaller group" everywhere,
     because the old name "Lone moth" paid two right players in a room of five who were not alone at all.
     Fixtures (party/test/mothlight_rules.js): 1 of 3 and 2 of 5 earn 150; 2 of 4 and 1 of 1 earn 100.
   - D02 the question always runs its full clock (changing sides IS the game), and every phone acknowledges a tap.
   - D03 the reveal says the truth and its source; ml-0163, ml-0001, ml-0055 are out of the live deck pending audit.
   - D04 six true and six false, and no two questions in a row from one category when the pool allows it. */
(function(){
'use strict';
function $(id){return document.getElementById(id);}
var root=$('game-root');
root.innerHTML=
 '<div class="ml-screen" id="ml-rules"><div class="ml-timer" id="ml-rt"></div>'+
 '<div class="ml-rules">Read the statement. Choose True or False.\nEveryone can see where your moth lands.\nYou can change sides until time runs out.\nCorrect answers earn 100. A correct smaller group earns 150.</div>'+
 '<div class="ml-rules-small">The bonus needs at least three answers. Equal groups earn 100.</div>'+
 '<button class="ps-btn" id="ml-next" style="margin-top:28px">Next</button></div>'+
 '<div class="ml-screen" id="ml-q"><div class="ml-timer" id="ml-qt"></div>'+
 '<div class="ml-qnum" id="ml-qn"></div><div class="ml-fact" id="ml-qf"></div>'+
 '<div class="ml-lanterns">'+
 '<div class="ml-lant" id="ml-true"><div class="ml-lamp"></div><div class="ml-lab">TRUE</div><div class="ml-moths" id="ml-mt"></div></div>'+
 '<div class="ml-lant shade" id="ml-false"><div class="ml-lamp"></div><div class="ml-lab">FALSE</div><div class="ml-moths" id="ml-mf"></div></div>'+
 '</div><div class="ml-source" id="ml-src" style="visibility:hidden"></div>'+
 '<div class="ml-strip" id="ml-strip"></div></div>'+
 '<div class="ml-screen" id="ml-stand"><div class="ml-qnum">Scores so far</div><div id="ml-standrows" style="margin-top:20px"></div></div>'+
 '<div class="ml-screen ml-podium" id="ml-pod"><div class="ml-qnum">Game complete</div><div id="ml-podrows" style="margin-top:20px"></div>'+
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
function psym(pid){ try{ return PartyShell.symbolFor?PartyShell.symbolFor(pid):'●'; }catch(e){ return '●'; } }
function cols(){ var o={},k; for(k in names) o[k]=pcol(k); return o; }
function syms(){ var o={},k; for(k in names) o[k]=psym(k); return o; }
function host(list){ try{ if(PartyShell.hostActions) PartyShell.hostActions(list); }catch(e){} }
/* the moths landing, for every phone (MOTHLIGHT-D02, both modes): who is on TRUE and who is on FALSE right now */
function sendMoths(){
  var yes=[],no=[],k,a=answers[qi]||{};
  for(k in a) (a[k]?yes:no).push([names[k]||'?',pcol(k),psym(k)]);
  PartyShell.broadcast({t:'moths',q:qi+1,yes:yes,no:no});
}

/* ⭐ MOTHLIGHT-D01, the whole rule in one place, and exposed so the score fixtures test THIS function. */
function bonusRound(correct,answered){ return answered>=3 && correct>0 && correct*2<answered; }
/* test surface (lower case on purpose: upper case window names are content banks to the static gate) */
var TEST=window.__mothlight=window.__mothlight||{};
TEST.score=function(correct,answered){ return bonusRound(correct,answered)?150:100; };

/* ⛔ OUT OF THE LIVE DECK UNTIL AUDITED (MOTHLIGHT-D03, Astra 18 Oct). These are audit flags, not verdicts:
   ml-0163 "Wasps can make honey just like bees." (false) ignores the honey wasps (Brachygastra) that do make honey;
   ml-0001 the collective noun "an eclipse of moths" needs the dictionary page that actually supports it;
   ml-0055 "White chocolate contains no cocoa solids." needs cocoa butter qualified (it IS a cocoa product). */
var QUARANTINE={'ml-0163':1,'ml-0001':1,'ml-0055':1};
var BANK=(window.MOTHLIGHT_BANK||[]).filter(function(q){ return !QUARANTINE[q.id]; });
var QS=[], qi=0, scores={}, answers={}, names={}, RM=false;
try{RM=matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(e){}
/* test hook, ?ml_fast=1 only: shrinks every timer so a full game runs in
   about 90 seconds for automated drives. Absent on a plain load. */
var FAST=/[?&]ml_fast=1(&|$)/.test(location.search);
var T_RULES=FAST?3:20, T_Q=FAST?3:20, T_REV=FAST?2:7, T_STAND=FAST?2:8;

/* MOTHLIGHT-D04: no two in a row from one category when another is left to take */
function spreadCategories(list){
  var left=list.slice(), out=[];
  while(left.length){
    var prev=out.length?out[out.length-1].category:null, k=0;
    for(var i=0;i<left.length;i++) if(left[i].category!==prev){ k=i; break; }
    out.push(left.splice(k,1)[0]);
  }
  return out;
}
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
  QS=spreadCategories(QS);
  for(var u=0;u<QS.length;u++) used[QS[u].id]=1;
  try{localStorage.setItem('ml_used',JSON.stringify(used));}catch(e){}
}
/* test surfaces only: the deck the shell drew, and a fresh draw (nothing in play calls these) */
TEST.deck=function(){ return QS.map(function(q){ return {id:q.id,answer:q.answer,category:q.category}; }); };
TEST.draw=function(){ pickQuestions(); return TEST.deck(); };
TEST.quarantined=function(){ return Object.keys(QUARANTINE).filter(function(id){ return BANK.some(function(q){ return q.id===id; }); }); };

/* one order and one place rule for every list: equal scores share a place (SHELL-D06 "Tied for {place}") */
function ranked(){
  var ids=Object.keys(names);
  ids.sort(function(a,b){ return (scores[b]||0)-(scores[a]||0) || String(names[a]).localeCompare(String(names[b])); });
  var places={}, last=null, place=0;
  for(var i=0;i<ids.length;i++){ var s=scores[ids[i]]||0; if(s!==last){ place=i+1; last=s; } places[ids[i]]=place; }
  return {ids:ids,places:places};
}
function mark(pid){ return '<i class="ml-sym" style="color:'+pcol(pid)+'">'+psym(pid)+'</i>'; }
function strip(){
  var r=ranked(), rows='';
  for(var i=0;i<r.ids.length;i++) rows+='<span>'+mark(r.ids[i])+esc(names[r.ids[i]])+' <b>'+(scores[r.ids[i]]||0)+'</b></span>';
  $('ml-strip').innerHTML=rows;
}
function standRows(){
  var r=ranked(), rows='';
  for(var i=0;i<r.ids.length;i++){ var id=r.ids[i];
    rows+='<div class="ml-standrow"><span class="place">'+r.places[id]+'</span>'+mark(id)+esc(names[id])+'<b>'+(scores[id]||0)+'</b></div>'; }
  return rows;
}
function renderMoths(){
  var t='',f='',k;
  for(k in answers[qi]||{}){
    var chip='<div class="ml-moth" data-p="'+k+'" style="border-color:'+pcol(k)+'">'+mark(k)+esc(names[k]||'?')+'</div>';
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
    answers[qi]=answers[qi]||{}; answers[qi][pid]=!!msg.v; renderMoths(); sendMoths();
    /* SHELL-D04: "Saved" only once the host has it */
    PartyShell.sendToPlayer(pid,{t:'ack',q:qi+1,v:!!msg.v});
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
  host([{label:'Start now',fn:function(){ PartyShell.stopTimer(); phaseQuestion(); }}]);
}
function phaseQuestion(){
  var q=QS[qi]; if(!q){ phasePodium(); return; }
  show('ml-q'); renderMoths(); strip();
  $('ml-qn').textContent='QUESTION '+(qi+1)+' OF 12';
  $('ml-qf').textContent=q.text;
  $('ml-src').style.visibility='hidden';
  $('ml-true').classList.remove('dimmed','winner'); $('ml-false').classList.remove('dimmed','winner');
  PartyShell.setPhase('question',{num:qi+1,total:12,text:q.text});
  sendMoths();
  host([]);
  /* MOTHLIGHT-D02: the full clock, always. It never ends early because everybody tapped: changing sides is the game */
  PartyShell.startTimer(T_Q,function(s){ var t=$('ml-qt'); t.textContent=s; t.classList.toggle('low',s<=5); },phaseReveal);
}
function phaseReveal(){
  var q=QS[qi], a=answers[qi]||{}, ids=Object.keys(a);
  var correctIds=ids.filter(function(k){return a[k]===q.answer;});
  var bonus=bonusRound(correctIds.length, ids.length);
  var res={}, k;
  for(k in names){
    var got = a.hasOwnProperty(k) ? (a[k]===q.answer ? (bonus?'lone':'right') : 'miss') : 'none';
    var pts = got==='lone'?150:got==='right'?100:0;
    scores[k]=(scores[k]||0)+pts;
    res[k]={got:got,pts:pts,choice:a.hasOwnProperty(k)?!!a[k]:null};
  }
  snd('reveal', correctIds.length>0);
  var winEl=q.answer?$('ml-true'):$('ml-false'), loseEl=q.answer?$('ml-false'):$('ml-true');
  winEl.classList.add('winner'); loseEl.classList.add('dimmed');
  var moths=document.querySelectorAll('.ml-moth');
  for(var i=0;i<moths.length;i++){ var pid=moths[i].getAttribute('data-p');
    if(res[pid]&&res[pid].pts>0) moths[i].innerHTML+='<span class="pts'+(res[pid].got==='lone'?' lone':'')+'">+'+res[pid].pts+'</span>'; }
  $('ml-src').textContent=(bonus?'Right with the smaller group: +150. ':'')+'Source: '+q.source;
  $('ml-src').style.visibility='visible';
  strip();
  PartyShell.setPhase('reveal',{num:qi+1,text:q.text,answer:q.answer,source:q.source,explanation:q.explanation||'',
    bonus:bonus,results:res,names:names,cols:cols(),syms:syms(),scores:scores});
  PartyShell.startTimer(T_REV,function(s){$('ml-qt').textContent=s;},function(){
    qi++;
    if(qi===4||qi===8) phaseStandings(); else phaseQuestion();
  });
}
function phaseStandings(){
  show('ml-stand');
  $('ml-standrows').innerHTML=standRows();
  PartyShell.setPhase('standings',{scores:scores,names:names,cols:cols(),syms:syms()});
  PartyShell.startTimer(T_STAND,null,phaseQuestion);
}
function phasePodium(){
  snd('fanfare');
  show('ml-pod');
  var r=ranked(), results={};
  for(var i=0;i<r.ids.length;i++) results[r.ids[i]]={score:scores[r.ids[i]]||0,place:r.places[r.ids[i]]};
  $('ml-podrows').innerHTML=standRows();
  PartyShell.setPhase('podium',{scores:scores,names:names,cols:cols(),syms:syms()});
  PartyShell.gameComplete(results);
  $('ml-again').onclick=function(){ startGame(PartyShell.players()); };
  $('ml-other').onclick=function(){ PartyShell.backToPicker(); };
  $('ml-end').onclick=function(){ PartyShell.closeRoom(); };
  host([{label:'Play again',fn:function(){ startGame(PartyShell.players()); }},
        {label:'Another game',ghost:true,fn:function(){ PartyShell.backToPicker(); }},
        {label:'End night',ghost:true,fn:function(){ PartyShell.closeRoom(); }}]);
}
document.addEventListener('party-started',function(ev){ startGame(ev.detail.players); });
})();
