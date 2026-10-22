/* Mothlight HOST. Built exactly to PARTY_GAME_BRIEF.md's worked example:
   rules 20s -> 12 x (question 20s -> reveal 7s) with standings 8s after
   reveals 4 and 8 -> podium. Host records the LAST answer per player.

   ⭐ 18 Oct 2026, Astra's review (party/reviews/WHACKBOX-REVIEW-GPT-2026-10-18.md, MOTHLIGHT-D01 to D04):
   - D01 THE BONUS IS EXACT. A correct answer earns 100. It earns 150 in total when the correct answers are FEWER THAN
     HALF of everyone who answered AND at least three people answered. Exactly half earns 100. A missing answer is
     missing: it is not false and it does not count as a respondent. Called "Right with the smaller group" everywhere,
     because the old name "Lone moth" paid two right players in a room of five who were not alone at all.
     Fixtures (party/test/mothlight_rules.js): 1 of 3 and 2 of 5 earn 150; 2 of 4 and 1 of 1 earn 100.
   - D02 the question always runs its full clock, and every phone acknowledges a tap.
   ⭐ 23 Oct 2026 (Stephen, playing with Penny and Jessie): "it shouldnt show what people pick before it reveals and then it
     should give more points if youre first to answer". Picks are HIDDEN until the reveal (the moths land on a shared
     perch under the statement; sides show at the reveal), and the FIRST right answer earns +50, the second +25. The order
     is the order of each player's FINAL answer, so changing your mind sends you to the back of the line.
   - D03 the reveal says the truth and its source; ml-0163, ml-0001, ml-0055 are out of the live deck pending audit.
   - D04 six true and six false, and no two questions in a row from one category when the pool allows it. */
(function(){
'use strict';
function $(id){return document.getElementById(id);}
var root=$('game-root');
root.innerHTML=
 '<div class="ml-screen" id="ml-rules"><div class="ml-timer" id="ml-rt"></div>'+
 '<div class="ml-rules">Read the statement. Choose True or False.\nNobody sees your side until the reveal.\nThe first right answer earns 50 extra, the second 25.\nCorrect answers earn 100. A correct smaller group earns 150.</div>'+
 '<div class="ml-rules-small">You can change your mind until time runs out, but that puts you at the back of the line. The group bonus needs at least three answers.</div>'+
 '<button class="ps-btn" id="ml-next" style="margin-top:28px">Next</button></div>'+
 '<div class="ml-screen" id="ml-q"><div class="ml-timer" id="ml-qt"></div>'+
 '<div class="ml-qnum" id="ml-qn"></div><div class="ml-fact" id="ml-qf"></div>'+
 '<div class="ml-perch" id="ml-perch"><div class="ml-perch-lab" id="ml-perch-lab"></div><div class="ml-moths" id="ml-ml"></div></div>'+
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
/* the moths landing, for every phone (both modes). 23 Oct: during the question only WHO has answered travels (the
   shared perch); the sides travel once, at the reveal. */
function sendMoths(reveal){
  var yes=[],no=[],landed=[],k,a=answers[qi]||{};
  for(k in a){ var chip=[names[k]||'?',pcol(k),psym(k)]; landed.push(chip); (a[k]?yes:no).push(chip); }
  if(reveal) PartyShell.broadcast({t:'moths',q:qi+1,yes:yes,no:no});
  else PartyShell.broadcast({t:'moths',q:qi+1,landed:landed,n:landed.length,of:Object.keys(names).length});
}

/* ⭐ MOTHLIGHT-D01, the whole rule in one place, and exposed so the score fixtures test THIS function. */
function bonusRound(correct,answered){ return answered>=3 && correct>0 && correct*2<answered; }
/* test surface (lower case on purpose: upper case window names are content banks to the static gate) */
var TEST=window.__mothlight=window.__mothlight||{};
TEST.score=function(correct,answered){ return bonusRound(correct,answered)?150:100; };
TEST.speed=speedBonus;

/* ⛔ OUT OF THE LIVE DECK UNTIL AUDITED (MOTHLIGHT-D03, Astra 18 Oct). These are audit flags, not verdicts:
   ml-0163 "Wasps can make honey just like bees." (false) ignores the honey wasps (Brachygastra) that do make honey;
   ml-0001 the collective noun "an eclipse of moths" needs the dictionary page that actually supports it;
   ml-0055 "White chocolate contains no cocoa solids." needs cocoa butter qualified (it IS a cocoa product). */
var QUARANTINE={'ml-0163':1,'ml-0001':1,'ml-0055':1};
var BANK=(window.MOTHLIGHT_BANK||[]).filter(function(q){ return !QUARANTINE[q.id]; });
var QS=[], qi=0, scores={}, answers={}, order={}, names={}, RM=false;
/* 23 Oct: the speed bonus by the order of FINAL answers. Exposed so the fixtures test THIS function. */
function speedBonus(rank){ return rank===0?50:rank===1?25:0; }
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
function renderMoths(reveal){
  var t='',f='',l='',k,n=0,of=Object.keys(names).length;
  for(k in answers[qi]||{}){
    var chip='<div class="ml-moth" data-p="'+k+'" style="border-color:'+pcol(k)+'">'+mark(k)+esc(names[k]||'?')+'</div>';
    n++; l+=chip; if(answers[qi][k]) t+=chip; else f+=chip;
  }
  if(reveal){ $('ml-mt').innerHTML=t; $('ml-mf').innerHTML=f; $('ml-ml').innerHTML=''; $('ml-perch').classList.add('off'); }
  else{ $('ml-mt').innerHTML=''; $('ml-mf').innerHTML=''; $('ml-ml').innerHTML=l; $('ml-perch').classList.remove('off');
    $('ml-perch-lab').textContent=n?(n+' of '+of+' answered'):'Moths land here. Sides show at the reveal.'; }
}

PartyShell.onPlayerMessage(function(pid,msg){
  /* ⛔ ONLY PLAYERS WHO ARE IN THIS GAME. This was the one host module with no
     guard, so somebody who walked in mid round got a moth on the television
     under the name "?" and then vanished from the reveal, the strip and the
     standings. */
  if(!msg||names[pid]===undefined) return;
  if(msg.t==='answer'&&msg.q===qi+1&&$('ml-q').classList.contains('on')){
    answers[qi]=answers[qi]||{}; var changed=answers[qi].hasOwnProperty(pid)&&answers[qi][pid]!==!!msg.v;
    answers[qi][pid]=!!msg.v;
    order[qi]=order[qi]||[]; if(changed||order[qi].indexOf(pid)<0){ var oi=order[qi].indexOf(pid); if(oi>=0) order[qi].splice(oi,1); order[qi].push(pid); }
    renderMoths(); sendMoths();
    /* SHELL-D04: "Saved" only once the host has it */
    PartyShell.sendToPlayer(pid,{t:'ack',q:qi+1,v:!!msg.v});
    snd('pip');  /* a moth just landed, and the room hears the count rise */
  }
});

function startGame(players){
  scores={}; answers={}; order={}; names={};
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
  var res={}, k, rank={}, ri=0, ord=order[qi]||[];
  for(var oi=0;oi<ord.length;oi++) if(a[ord[oi]]===q.answer) rank[ord[oi]]=ri++;   /* right answers in the order they were FINAL */
  for(k in names){
    var got = a.hasOwnProperty(k) ? (a[k]===q.answer ? (bonus?'lone':'right') : 'miss') : 'none';
    var base = got==='lone'?150:got==='right'?100:0;
    var speed = rank.hasOwnProperty(k)?speedBonus(rank[k]):0;
    var pts = base+speed;
    scores[k]=(scores[k]||0)+pts;
    res[k]={got:got,pts:pts,base:base,speed:speed,first:rank.hasOwnProperty(k)?rank[k]+1:0,choice:a.hasOwnProperty(k)?!!a[k]:null};
  }
  renderMoths(true); sendMoths(true);
  snd('reveal', correctIds.length>0);
  var winEl=q.answer?$('ml-true'):$('ml-false'), loseEl=q.answer?$('ml-false'):$('ml-true');
  winEl.classList.add('winner'); loseEl.classList.add('dimmed');
  var moths=document.querySelectorAll('.ml-moth');
  for(var i=0;i<moths.length;i++){ var pid=moths[i].getAttribute('data-p');
    if(res[pid]&&res[pid].pts>0) moths[i].innerHTML+='<span class="pts'+(res[pid].got==='lone'?' lone':'')+'">+'+res[pid].pts+(res[pid].speed?' <i class="ml-first">'+(res[pid].first===1?'1st':'2nd')+'</i>':'')+'</span>'; }
  var firstName='', fk; for(fk in res) if(res[fk].first===1) firstName=names[fk]||'';
  $('ml-src').textContent=(bonus?'Right with the smaller group: +150. ':'')+(firstName?('First right: '+firstName+' +50. '):'')+'Source: '+q.source;
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
