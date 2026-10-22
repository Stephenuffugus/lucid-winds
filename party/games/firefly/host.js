/* FIREFLY FUTURES, host screen.

   Round shape: poll (private Yes, No or Pass) -> market (private guesses: how many answers were Yes) -> reveal
   (everything opens at once). Ten rounds, standings after 4 and 8, then podium. Internal phase ids stay 'poll',
   'market', 'reveal'; no player ever reads the word bet or market.

   ⭐ WHY THE GUESSES ARE PRIVATE. Mothlight already owns the public changeable answer, and it is that game's whole
   show. If guesses were public here the two titles would collapse into one feeling. Here the tension is that nobody
   knows anything until the lanterns light, so the reveal is a single loud moment. Both screens say how MANY have
   acted, never what.

   ⭐ 18 Oct 2026, Astra's review (party/reviews/WHACKBOX-REVIEW-GPT-2026-10-18.md, FIREFLY-D01 to D04, the copy table
   B2.4, the no big screen version B2.5), checked against this file first:
   - D01 THE DENOMINATOR. Before: the question was "How many of the N said yes?" with N = everybody in the game, while
     the count only included people who tapped. A missing answer silently counted as a No and the room guessed out of
     the wrong total. Now only saved Yes or No answers count. When the poll closes the room freezes M (answers) and Y
     (Yes); the guess is "How many of these M answers were Yes?" with buttons 0 to M, and scoring uses that M. A
     missing answer or a Pass is left out, never a No. Fewer than three answers voids the round WITHOUT showing the
     count (a total of two gives both answers away) and the same round number gets ONE more question.
   - D02 PRIVACY WITHOUT A PROMISE. Before: "Nobody sees your answer" and "Nobody sees anything until the lanterns
     light", which a total can break by deduction (a total of 0, or of everybody, tells everybody). Now the copy says
     what is true: only the total is shown, and the rules say plainly that in a small room a total can give an answer
     away. Answers are never attached to names on any screen and never travel in a phase payload; each phone hears
     its own answer back privately (sendToPlayer). A quiet Pass is handled exactly like no answer for M and is never
     shown. (Data level: the transport delivers every message to every phone and each phone drops what is not
     addressed to it, so a curious player with developer tools could still read another phone's answer. No SCREEN
     ever shows it. A server held tally is the real fix and is the director's call.)
   - D03 RHYTHM AND SCORE. 15 s to answer, 18 s to guess, 9 s to reveal, ten rounds. Both the answer and the guess are
     editable, with the shared finish window: once every eligible player has saved (after at least 6 s) the room gets
     "All set. Finishing soon." for 3 s, still editable, never restarted. Score: exact 100; the only exact guess 130 in
     total; one away 40; anything else or no guess 0. These were already the numbers here.
   - D04 THE GUESS AS A SAVED ACTION. The phone keeps the question and M on screen, a 3 by 3 grid (0 to 8 fits), the
     selected number, "Sending", then "Guess saved" once this host acknowledges it.
   - D05 (a story beat at the reveal) is a P2 experiment and stays off.
   Fixtures: party/test/firefly_rules.js. No TV: party/test/notv_firefly.js. */
(function(){
'use strict';
function $(id){return document.getElementById(id);}
function esc(s){ return String(s).replace(/[<>&"]/g,function(c){return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c];}); }

var root=$('game-root');
root.innerHTML=
 '<div class="ff-screen" id="ff-rules"><div class="ff-timer" id="ff-rt"></div>'+
 '<div class="ff-rules">Answer Yes or No about yourself. You can also pass.\n'+
 'Guess how many answers were Yes, including yours.\n'+
 'An exact guess earns 100. One away earns 40.\n'+
 'Only the total is shown. Guesses appear at the reveal.</div>'+
 '<div class="ff-rules-small">The only exact guess earns 130 instead of 100.</div>'+
 '<div class="ff-rules-small">Example: four people answer and three say Yes. A guess of 3 earns 100. A guess of 2 or 4 earns 40.</div>'+
 '<div class="ff-rules-small quiet">In a small room a total can give an answer away, so every question here is a light one.</div>'+
 '<button class="ps-btn" id="ff-next" style="margin-top:22px">Start now</button></div>'+

 '<div class="ff-screen" id="ff-poll"><div class="ff-timer" id="ff-pt"></div>'+
 '<div class="ff-num" id="ff-pn"></div><div class="ff-prompt" id="ff-pp"></div>'+
 '<div class="ff-step">Choose Yes or No on your phone.</div>'+
 '<div class="ff-in" id="ff-pin"></div><div class="ff-strip" id="ff-strip1"></div></div>'+

 '<div class="ff-screen" id="ff-mkt"><div class="ff-timer" id="ff-mt"></div>'+
 '<div class="ff-num" id="ff-mn"></div><div class="ff-prompt small" id="ff-mp"></div>'+
 '<div class="ff-ask" id="ff-ask"></div>'+
 '<div class="ff-lanterns" id="ff-lant"></div>'+
 '<div class="ff-in" id="ff-min"></div><div class="ff-strip" id="ff-strip2"></div></div>'+

 '<div class="ff-screen" id="ff-rev"><div class="ff-timer" id="ff-vt"></div>'+
 '<div class="ff-num" id="ff-vn"></div><div class="ff-answerline" id="ff-vline"></div>'+
 '<div class="ff-lanterns" id="ff-vlant"></div><div class="ff-strip" id="ff-strip3"></div></div>'+

 '<div class="ff-screen" id="ff-void"><div class="ff-timer" id="ff-xt"></div>'+
 '<div class="ff-num" id="ff-xn"></div><div class="ff-prompt small" id="ff-xp"></div>'+
 '<div class="ff-ask">Too few answers this time. Let us try another question.</div>'+
 '<div class="ff-strip" id="ff-strip4"></div></div>'+

 '<div class="ff-screen" id="ff-stand"><div class="ff-num">Scores so far</div>'+
 '<div id="ff-standrows" class="ff-rows"></div></div>'+

 '<div class="ff-screen ff-podium" id="ff-pod"><div class="ff-num">Game complete</div>'+
 '<div id="ff-podrows" class="ff-rows"></div>'+
 '<div class="ff-earn">Thanks for playing together.</div>'+
 '<div class="ff-btnrow">'+
 '<button class="ps-btn" id="ff-again">Play again</button>'+
 '<button class="ps-btn ghost" id="ff-other">Another game</button>'+
 '<button class="ps-btn ghost" id="ff-end">End night</button></div></div>';

function show(id){ var s=root.querySelectorAll('.ff-screen');
  for(var i=0;i<s.length;i++) s[i].classList.remove('on'); $(id).classList.add('on'); }
function onScreen(id){ var e=$(id); return !!(e&&e.classList.contains('on')); }

function snd(m,a){ try{ if(window.PartySound) PartySound[m](a); }catch(e){} }
function pcol(pid){ try{ return PartyShell.colorFor(pid); }catch(e){ return '#e8dcc8'; } }
function psym(pid){ try{ return PartyShell.symbolFor?PartyShell.symbolFor(pid):'●'; }catch(e){ return '●'; } }
function cols(){ var o={},k; for(k in names) o[k]=pcol(k); return o; }
function syms(){ var o={},k; for(k in names) o[k]=psym(k); return o; }
function host(list){ try{ if(PartyShell.hostActions) PartyShell.hostActions(list); }catch(e){} }

var BANK=window.FIREFLY_BANK||[], QS=[], SPARE=[], ri=0, ROUNDS=10, MIN_M=3;
var scores={}, names={}, order=[];
var polls={}, bets={}, pollElig=[], betElig=[], M=0, Y=0, retried=false, finishing=false, phaseStart=0, tNow=0;
var FAST=/[?&]ff_fast=1(&|$)/.test(location.search);
var T_RULES=FAST?3:24, T_POLL=FAST?3:15, T_MKT=FAST?4:18, T_REV=FAST?2:9, T_STAND=FAST?2:8, T_VOID=FAST?2:5,
    T_FINISH=FAST?1:3, MIN_READ=FAST?1:6;

/* ⭐ FIREFLY-D01, the whole denominator rule in one place (and exposed to the fixtures). A missing answer is simply
   not in the map; a Pass is 'pass'. Neither counts toward M, and neither is ever a No. */
function tally(p){
  var m=0, y=0, passed=0, k;
  for(k in p){ if(p[k]===true){ m++; y++; } else if(p[k]===false) m++; else if(p[k]==='pass') passed++; }
  return {m:m,y:y,passed:passed};
}
/* ⭐ FIREFLY-D03, one round's score. Exact 100; the only exact guess 130 in total; one away 40; else 0. A missing
   guess is missing: no points, no row in the guesses. */
function scoreRound(yes,b,ids){
  var exact=[], res={}, k, i;
  for(k in b) if(b[k]===yes) exact.push(k);
  var sole=exact.length===1;
  for(i=0;i<ids.length;i++){
    var pid=ids[i];
    if(b.hasOwnProperty(pid)){
      var d=Math.abs(b[pid]-yes);
      if(d===0) res[pid]={got:sole?'sole':'exact',pts:sole?130:100,guess:b[pid]};
      else if(d===1) res[pid]={got:'close',pts:40,guess:b[pid]};
      else res[pid]={got:'miss',pts:0,guess:b[pid]};
    } else res[pid]={got:'none',pts:0,guess:null};
  }
  return {res:res,exact:exact.length};
}
/* test surface (lower case on purpose: upper case window names are content banks to the static gate) */
window.__firefly={tally:tally,score:scoreRound,minAnswers:MIN_M,
  state:function(){ return {ri:ri,total:ROUNDS,att:retried?1:0,m:M,finishing:finishing,text:QS[ri]?QS[ri].text:''}; }};

function pickPrompts(n){
  var used={}; try{used=JSON.parse(localStorage.getItem('ff_used')||'{}');}catch(e){}
  var pool=BANK.filter(function(p){return !used[p.id];});
  if(pool.length<n){ used={}; pool=BANK.slice(); }
  var out=[];
  for(var i=0;i<n&&pool.length;i++){
    var k=Math.floor(Math.random()*pool.length);
    var p=pool.splice(k,1)[0]; out.push(p); used[p.id]=1;
  }
  try{localStorage.setItem('ff_used',JSON.stringify(used));}catch(e){}
  return out;
}

/* the same order and the same place rule everywhere: equal scores share a place */
function ranked(){
  var ids=order.slice();
  ids.sort(function(a,b){ return (scores[b]||0)-(scores[a]||0) || String(names[a]).localeCompare(String(names[b])); });
  var places={}, last=null, place=0;
  for(var i=0;i<ids.length;i++){ var s=scores[ids[i]]||0; if(s!==last){ place=i+1; last=s; } places[ids[i]]=place; }
  return {ids:ids,places:places};
}
function tag(pid){ return '<i class="ff-sym" style="color:'+esc(pcol(pid))+'">'+esc(psym(pid))+'</i>'; }
function strip(which){
  var r=ranked(), rows='';
  for(var i=0;i<r.ids.length;i++) rows+='<span>'+tag(r.ids[i])+esc(names[r.ids[i]])+' <b>'+(scores[r.ids[i]]||0)+'</b></span>';
  var el=$(which); if(el) el.innerHTML=rows;
}

/* one lantern per possible answer 0..m; the lit one is the true count; guesses hang under their number */
function lanternRow(target,m,lit,byNum){
  var html='';
  for(var v=0;v<=m;v++){
    var on=(lit!==null&&lit!==undefined&&v===lit), chips='', list=(byNum&&byNum[v])||[];
    for(var c=0;c<list.length;c++)
      chips+='<span class="ff-chip" style="border-color:'+esc(pcol(list[c].pid))+'">'+tag(list[c].pid)+esc(names[list[c].pid])+
        (list[c].pts?' <b>+'+list[c].pts+'</b>':'')+'</span>';
    html+='<div class="ff-l'+(on?' lit':'')+'"><div class="ff-bulb"></div>'+
          '<div class="ff-lnum">'+v+'</div><div class="ff-chips">'+chips+'</div></div>';
  }
  $(target).innerHTML=html;
  $(target).className='ff-lanterns n'+(m+1);
}

function present(){ return PartyShell.presentPlayers(); }
/* who may act in this phase: present when it opens and in the game (a late arrival plays the next game) */
function snapshot(){ var p=present(), out=[]; for(var i=0;i<p.length;i++) if(names[p[i]]!==undefined) out.push(p[i]); return out; }
function savedIn(map,elig){ var n=0; for(var i=0;i<elig.length;i++) if(map.hasOwnProperty(elig[i])) n++; return n; }
function att(){ return retried?1:0; }
function roundData(extra){
  var q=QS[ri]||{}, d={num:ri+1,att:att(),total:ROUNDS,text:q.text,names:names,cols:cols(),syms:syms(),scores:scores};
  for(var k in (extra||{})) d[k]=extra[k];
  return d;
}
function pollLine(){ return savedIn(polls,pollElig)+' of '+pollElig.length+' answered'; }
function betLine(){ return savedIn(bets,betElig)+' of '+betElig.length+' guesses saved'; }

PartyShell.onPlayerMessage(function(pid,msg){
  if(!msg||names[pid]===undefined||msg.r!==ri+1||(msg.a|0)!==att()) return;
  if(msg.t==='poll'&&onScreen('ff-poll')){
    if(pollElig.indexOf(pid)<0) return;
    var v=(msg.v===true)?true:(msg.v===false)?false:(msg.v==='pass')?'pass':null;
    if(v===null) return;
    polls[pid]=v;
    /* this phone alone hears its own answer back */
    PartyShell.sendToPlayer(pid,{t:'pack',r:ri+1,a:att(),v:v});
    $('ff-pin').textContent=pollLine(); snd('pip');
    PartyShell.broadcast({t:'pcount',r:ri+1,a:att(),n:savedIn(polls,pollElig),of:pollElig.length});
    maybeFinish('poll');
  }
  /* a phone that reloaded asks what it answered or guessed; only it is told */
  else if(msg.t==='mine?'){
    if(polls.hasOwnProperty(pid)) PartyShell.sendToPlayer(pid,{t:'pack',r:ri+1,a:att(),v:polls[pid]});
    if(bets.hasOwnProperty(pid)&&onScreen('ff-mkt')) PartyShell.sendToPlayer(pid,{t:'back',r:ri+1,a:att(),v:bets[pid]});
  }
  else if(msg.t==='bet'&&onScreen('ff-mkt')){
    if(betElig.indexOf(pid)<0) return;
    var g=msg.v|0; if(g<0||g>M) return;
    bets[pid]=g;
    PartyShell.sendToPlayer(pid,{t:'back',r:ri+1,a:att(),v:g});
    $('ff-min').textContent=betLine(); snd('pip');
    PartyShell.broadcast({t:'bcount',r:ri+1,a:att(),n:savedIn(bets,betElig),of:betElig.length});
    maybeFinish('market');
  }
});

/* SHELL-D04: an editable phase never ends the instant the last answer lands. Once every eligible player has saved
   and the room has had a moment to read, everybody gets a short announced window, still editable, never restarted. */
function maybeFinish(kind,left){
  if(left===undefined) left=tNow;
  if(finishing) return;
  var map=kind==='poll'?polls:bets, elig=kind==='poll'?pollElig:betElig, scr=kind==='poll'?'ff-poll':'ff-mkt';
  if(!elig.length||savedIn(map,elig)<elig.length) return;
  if((Date.now()-phaseStart)/1000<MIN_READ) return;   /* the phase timer's tick looks again */
  if(left<=T_FINISH) return;                            /* the clock is already about to end */
  finishing=true;
  setTimeout(function(){
    if(!onScreen(scr)) return;
    PartyShell.stopTimer();
    $(kind==='poll'?'ff-pin':'ff-min').textContent='All set. Finishing soon.';
    PartyShell.broadcast({t:'allset',r:ri+1,a:att()});
    PartyShell.startTimer(T_FINISH,function(s){ var t=$(kind==='poll'?'ff-pt':'ff-mt'); t.textContent=s; t.classList.add('low'); },
      kind==='poll'?closePoll:phaseReveal);
  },0);
}

function startGame(players){
  scores={}; names={}; order=[];
  for(var i=0;i<players.length;i++){
    names[players[i].id]=players[i].name; scores[players[i].id]=0; order.push(players[i].id);
  }
  QS=pickPrompts(ROUNDS); SPARE=pickPrompts(ROUNDS);
  ri=0; retried=false; phaseRules();
}

function phaseRules(){
  show('ff-rules');
  PartyShell.setPhase('rules',{total:ROUNDS});
  PartyShell.startTimer(T_RULES,function(s){$('ff-rt').textContent=s;},phasePoll);
  $('ff-next').onclick=function(){ PartyShell.stopTimer(); phasePoll(); };
  host([{label:'Start now',fn:function(){ PartyShell.stopTimer(); phasePoll(); }}]);
}

function phasePoll(){
  host([]);
  var q=QS[ri]; if(!q||ri>=ROUNDS){ phasePodium(); return; }
  polls={}; bets={}; M=0; Y=0; finishing=false; phaseStart=Date.now(); tNow=T_POLL;
  pollElig=snapshot();
  show('ff-poll'); strip('ff-strip1');
  $('ff-pn').textContent='ROUND '+(ri+1)+' OF '+ROUNDS;
  $('ff-pp').textContent=q.text;
  $('ff-pin').textContent=pollLine();
  PartyShell.setPhase('poll',roundData({eligible:pollElig.length,retry:retried}));
  PartyShell.startTimer(T_POLL,function(s){ var t=$('ff-pt'); t.textContent=s; t.classList.toggle('low',s<=5); tNow=s; maybeFinish('poll',s); },closePoll);
}

/* the poll closes: freeze M and Y, or void a round too small to keep private */
function closePoll(){
  if(!onScreen('ff-poll')) return;
  var t=tally(polls);
  if(t.m<MIN_M){ phaseVoid(); return; }
  M=t.m; Y=t.y;
  phaseMarket();
}

/* D01: fewer than three answers. Nothing about the answers is shown; the same round gets ONE more question. */
function phaseVoid(){
  var q=QS[ri], willRetry=!retried&&SPARE.length>0;
  show('ff-void'); strip('ff-strip4');
  $('ff-xn').textContent='ROUND '+(ri+1)+' OF '+ROUNDS;
  $('ff-xp').textContent=q.text;
  PartyShell.setPhase('void',roundData({retry:willRetry}));
  PartyShell.startTimer(T_VOID,function(s){$('ff-xt').textContent=s;},function(){
    if(willRetry){ QS[ri]=SPARE.shift(); retried=true; phasePoll(); }
    else nextRound();
  });
}

function phaseMarket(){
  var q=QS[ri];
  bets={}; finishing=false; phaseStart=Date.now(); tNow=T_MKT;
  betElig=snapshot();
  show('ff-mkt'); strip('ff-strip2');
  $('ff-mn').textContent='ROUND '+(ri+1)+' OF '+ROUNDS;
  $('ff-mp').textContent=q.text;
  $('ff-ask').textContent='How many of these '+M+' answers were Yes?';
  $('ff-min').textContent=betLine();
  lanternRow('ff-lant',M,null,null);
  /* M is public; Y never travels before the reveal */
  PartyShell.setPhase('market',roundData({m:M,eligible:betElig.length}));
  PartyShell.startTimer(T_MKT,function(s){ var t=$('ff-mt'); t.textContent=s; t.classList.toggle('low',s<=5); tNow=s; maybeFinish('market',s); },phaseReveal);
}

function phaseReveal(){
  if(!onScreen('ff-mkt')) return;
  var q=QS[ri], valid={}, k;
  for(k in bets) if(betElig.indexOf(k)>=0) valid[k]=bets[k];
  var sc=scoreRound(Y,valid,order), byNum={}, marks={};
  for(k in sc.res) scores[k]=(scores[k]||0)+sc.res[k].pts;
  for(k in valid){
    (byNum[valid[k]]=byNum[valid[k]]||[]).push({pid:k,pts:sc.res[k].pts});
    (marks[valid[k]]=marks[valid[k]]||[]).push([names[k],pcol(k),psym(k),sc.res[k].pts]);
  }

  show('ff-rev');
  snd('reveal', sc.exact>0);
  $('ff-vn').textContent='ROUND '+(ri+1)+' OF '+ROUNDS;
  $('ff-vline').innerHTML=esc(q.text)+'<br><b>'+Y+' of '+M+' answers were Yes.</b>';
  lanternRow('ff-vlant',M,Y,byNum);
  strip('ff-strip3');

  PartyShell.setPhase('reveal',roundData({yes:Y,m:M,results:sc.res,marks:marks}));
  PartyShell.startTimer(T_REV,function(s){$('ff-vt').textContent=s;},nextRound);
}

function nextRound(){
  ri++; retried=false;
  if(ri>=ROUNDS) phasePodium();
  else if(ri===4||ri===8) phaseStandings();
  else phasePoll();
}

function rows(target){
  var r=ranked(), html='', results={};
  for(var i=0;i<r.ids.length;i++){
    var id=r.ids[i];
    html+='<div class="ff-row"><span class="place">'+r.places[id]+'</span>'+tag(id)+esc(names[id])+
          '<b>'+(scores[id]||0)+'</b></div>';
    results[id]={score:scores[id]||0,place:r.places[id]};
  }
  $(target).innerHTML=html;
  return results;
}

function phaseStandings(){
  show('ff-stand'); rows('ff-standrows');
  PartyShell.setPhase('standings',{num:ri,total:ROUNDS,scores:scores,names:names,cols:cols(),syms:syms()});
  PartyShell.startTimer(T_STAND,null,phasePoll);
}

function phasePodium(){
  snd('fanfare');
  show('ff-pod');
  var results=rows('ff-podrows');
  PartyShell.setPhase('podium',{scores:scores,names:names,cols:cols(),syms:syms()});
  PartyShell.gameComplete(results);
  $('ff-again').onclick=function(){ startGame(PartyShell.players()); };
  $('ff-other').onclick=function(){ PartyShell.backToPicker(); };
  $('ff-end').onclick=function(){ PartyShell.closeRoom(); };
  host([{label:'Play again',fn:function(){ startGame(PartyShell.players()); }},
        {label:'Another game',ghost:true,fn:function(){ PartyShell.backToPicker(); }},
        {label:'End night',ghost:true,fn:function(){ PartyShell.closeRoom(); }}]);
}

document.addEventListener('party-started',function(ev){ startGame(ev.detail.players); });
})();
