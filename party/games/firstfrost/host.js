/* FIRST FROST, host screen.

   Trivia knockout where the people you knock out do not leave. They become the Frost, and before every question
   they choose the weather that changes it for whoever is still standing.

   ⛔ THE STANDING RULE FROM WHACKBOX_PLAN, AND IT SHAPES THIS FILE: the Frost console is the headline and the trivia
   is the backdrop. That is why the questions are fair rather than fiendish, why the chosen weather is announced in
   the largest text on the screen before any clock runs, and why the Frost have their own points and their own panel
   on the podium. If this ever reads as a trivia game with a gimmick, it has drifted.

   ⭐ 19 Oct 2026, Astra's review (party/reviews/WHACKBOX-REVIEW-GPT-2026-10-18.md, FIRSTFROST-D01 to D04, the copy
   table B4.4, the no big screen version B4.5), checked against this file first. THE LAW, one paragraph, the same on
   every screen:
     Three frost marks turn you into the Frost. A wrong answer or no answer adds one mark; under Deep Freeze it adds
     two, but never past the three that freeze you. A right answer earns 100. Every answer of a question resolves at
     once, then anybody at three marks joins the Frost, then the ending is checked: one player left standing is the
     last survivor and earns 300, once; nobody left standing is "Everyone became the Frost together" (no bonus, no
     invented survivor); twelve questions done names everybody still standing, with no bonus. The Frost frozen at
     the start of a round (and here when its weather vote opens) choose that round's weather in a private vote,
     editable, ten seconds at most, with the shared "All set" closing rule; the most chosen weather wins, a tie
     rotates through Chill, Fog, Deep Freeze starting after the last winner, no votes means no weather. Each of
     those Frost earns 40 weather points for every frost mark that round actually added to a player still standing
     (a mark past the third counts for nothing), whether or not their own choice won. Somebody who freezes this
     round starts choosing next round. A player still standing who was not here when a question opened is away for
     it: no answer, no mark (SHELL-D11), and if nobody still standing is here when a question opens, the game ends
     honestly.
   What Astra had right against the old code (all fixed here):
   - D01 the rules said "Three wrong answers" while Deep Freeze applied two marks, and a third mark past three still
     paid the Frost; endings were not all defined: twelve questions with several standing SHARED the 300 (Astra: no
     bonus at the cap), and "The frost took everyone" printed for any game with nobody left even though no screen
     said why. Answer points and weather points were one combined ranking.
   - D02 Chill and Fog both only removed answering time (Fog hid the QUESTION for half the clock). Now: a 24 s
     question; Chill 12 s; Fog shows the question at once and the four choices after 8 s (16 s to answer); Deep
     Freeze 24 s with two marks. "More reading time" (the host's choice on the rules screen) multiplies all of it by
     1.5. The chosen weather is announced on every screen before the question clock starts.
   - D03 the vote was "the most voted power wins, ties break toward the first voted" (order of arrival, so a tie
     went to whoever tapped first) and the Frost were paid 40 for every mark "their power helped land" including
     marks past the third. Now the tie rotation and the honest count above.
   - D04 a Frost phone during a question read "Your power is in play." and nothing else. Now it shows the weather,
     the question, the choices when they appear, the ledger of everybody still standing, how many final answers are
     in and its own weather points; the rules show both jobs with an example, and freezing says "You are the Frost.
     Choose the next weather."
   - Answers were already one only and checked by stored text; options[0] is the correct one in the bank and the
     room only ever sees a shuffled list. NEW: the tap that selects is apart from the "Final answer" that commits it
     (SHELL-D04, irreversible), acknowledged privately, and a question ends early once everybody here has answered.
   - D05 (a private forecast for the Frost) is a P2 experiment and stays off.
   PRIVACY (reported): no question payload carries which choice is right; under Fog the choices are not in any
   payload until they appear; a vote acknowledgement goes to one phone. Data level, not fixed: a phone's final
   answer and a Frost vote travel to this host as intents on the room's channel, which other phones receive and
   drop; no screen shows them.
   Fixtures: party/test/firstfrost_rules.js. No TV: party/test/notv_firstfrost.js. */
(function(){
'use strict';
function $(id){return document.getElementById(id);}
function esc(s){ return String(s).replace(/[<>&"]/g,function(c){return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c];}); }

var RULES=['Choose your answer before time runs out.','Three frost marks turn you into the Frost.',
  'The Frost keep playing and choose the next weather.','Weather changes the time, the choices, or the marks.'];
var RULE_DETAIL='A wrong answer or no answer adds one mark. Deep Freeze adds two.';
var JOB_LIVE='Choose an option, then tap Final answer. A right answer earns 100.';
var JOB_FROST='Choose the weather for the next question. Every new frost mark that round earns each of the Frost 40 weather points.';
var EXAMPLE='Example: Bo has two frost marks. The Frost choose Deep Freeze and Bo misses, so Bo joins the Frost and chooses the weather from the next round.';

var POWERS=[
  {key:'chill', name:'CHILL',       desc:'Half the answering time.'},
  {key:'fog',   name:'FOG',         desc:'Read the question. The choices appear after a short wait.'},
  {key:'freeze',name:'DEEP FREEZE', desc:'A wrong answer or no answer adds two frost marks.'}
];
var MARKS_OUT=3, MAX_Q=12, WIN_BONUS=300, RIGHT=100, FROST_PAY=40;

var root=$('game-root');
root.innerHTML=
 '<div class="fr-screen" id="fr-rules"><div class="fr-timer" id="fr-rt"></div>'+
 '<div class="fr-rules">'+esc(RULES.join('\n'))+'</div>'+
 '<div class="fr-rules-small">'+esc(RULE_DETAIL)+'</div>'+
 '<div class="fr-jobs"><div class="fr-job"><div class="fr-jobh">Still standing</div><div class="fr-jobt">'+esc(JOB_LIVE)+'</div></div>'+
 '<div class="fr-job frost"><div class="fr-jobh">The Frost</div><div class="fr-jobt">'+esc(JOB_FROST)+'</div></div></div>'+
 '<div class="fr-rules-small">'+esc(EXAMPLE)+'</div>'+
 '<div class="fr-rules-small quiet" id="fr-pace"></div>'+
 '<div class="fr-btnrow"><button class="ps-btn" id="fr-next">Start now</button>'+
 '<button class="ps-btn ghost" id="fr-slow"></button></div></div>'+

 '<div class="fr-screen" id="fr-vote"><div class="fr-timer" id="fr-vt"></div>'+
 '<div class="fr-num" id="fr-vn"></div>'+
 '<div class="fr-head">The Frost are choosing</div>'+
 '<div class="fr-powers" id="fr-powers"></div>'+
 '<div class="fr-in" id="fr-votein"></div><div class="fr-marks" id="fr-marks0"></div></div>'+

 '<div class="fr-screen" id="fr-wx"><div class="fr-num" id="fr-wxn"></div>'+
 '<div class="fr-wxlabel">Weather this round</div>'+
 '<div class="fr-wxname" id="fr-wxname"></div><div class="fr-wxdesc" id="fr-wxdesc"></div>'+
 '<div class="fr-marks" id="fr-marksw"></div></div>'+

 '<div class="fr-screen" id="fr-q"><div class="fr-top">'+
 '<div class="fr-num" id="fr-qn"></div><div class="fr-power" id="fr-curpower"></div><div class="fr-timer" id="fr-qt"></div></div>'+
 '<div class="fr-qtext" id="fr-qtext"></div>'+
 '<div class="fr-veil" id="fr-veil"></div>'+
 '<div class="fr-opts" id="fr-qopts"></div>'+
 '<div class="fr-in" id="fr-qin"></div><div class="fr-marks" id="fr-marks1"></div></div>'+

 '<div class="fr-screen" id="fr-rev"><div class="fr-timer" id="fr-rvt"></div>'+
 '<div class="fr-num" id="fr-rvn"></div>'+
 '<div class="fr-answer" id="fr-ans"></div>'+
 '<div class="fr-scored" id="fr-scored"></div>'+
 '<div class="fr-took" id="fr-took"></div><div class="fr-marks" id="fr-marks2"></div></div>'+

 '<div class="fr-screen fr-podium" id="fr-pod"><div class="fr-num">Game complete</div>'+
 '<div class="fr-winline" id="fr-winline"></div>'+
 '<div class="fr-panels"><div class="fr-panel"><div class="fr-panelh">Survival</div><div id="fr-podrows" class="fr-rows"></div></div>'+
 '<div class="fr-panel frost"><div class="fr-panelh">The Frost</div><div class="fr-most" id="fr-most"></div><div id="fr-frostrows" class="fr-rows"></div></div></div>'+
 '<div class="fr-earn">Thanks for playing together.</div>'+
 '<div class="fr-btnrow">'+
 '<button class="ps-btn" id="fr-again">Play again</button>'+
 '<button class="ps-btn ghost" id="fr-other">Another game</button>'+
 '<button class="ps-btn ghost" id="fr-end">End night</button></div></div>';

function show(id){ var s=root.querySelectorAll('.fr-screen');
  for(var i=0;i<s.length;i++) s[i].classList.remove('on'); $(id).classList.add('on'); }
function onScreen(id){ var e=$(id); return !!(e&&e.classList.contains('on')); }

function snd(m,a){ try{ if(window.PartySound) PartySound[m](a); }catch(e){} }
function pcol(pid){ try{ return PartyShell.colorFor(pid); }catch(e){ return '#e8dcc8'; } }
function psym(pid){ try{ return PartyShell.symbolFor?PartyShell.symbolFor(pid):'●'; }catch(e){ return '●'; } }
function cols(){ var o={},k; for(k in names) o[k]=pcol(k); return o; }
function syms(){ var o={},k; for(k in names) o[k]=psym(k); return o; }
function host(list){ try{ if(PartyShell.hostActions) PartyShell.hostActions(list); }catch(e){} }
function tag(pid){ return '<i class="fr-sym" style="color:'+esc(pcol(pid))+'">'+esc(psym(pid))+'</i>'; }
function plural(n,one,many){ return n===1?one:many; }
function marksWord(n){ return n+' frost '+plural(n,'mark','marks'); }
function newMarks(n){ return n+' new frost '+plural(n,'mark','marks'); }
function listNames(ids){
  var nm=ids.map(function(x){ return names[x]; });
  if(nm.length<=1) return nm.join('');
  return nm.slice(0,-1).join(', ')+' and '+nm[nm.length-1];
}

var QUARANTINE=window.FIRSTFROST_QUARANTINE||{};
var BANK=(window.FIRSTFROST_BANK||[]).filter(function(q){ return !QUARANTINE[q.id]; });
var QS=[], qi=0, shuffled=[];
var scores={}, weather={}, names={}, marks={}, frozen={}, frozeAt={}, order=[];
var votes={}, frostElig=[], power=null, lastWin=null, answers={}, elig=[];
var qLen=24, fogAt=null, optsShown=true, finishing=false, phaseStart=0, tNow=0, over=false, lastRound=null;
var FAST=/[?&]fr_fast=1(&|$)/.test(location.search);
var slow=false;
var T_RULES=FAST?3:20, T_WEATHER=FAST?1:3, T_REV=FAST?2:9, T_FINISH=FAST?1:3, MIN_READ=FAST?0:2;
function tVote(){ return FAST?(slow?6:4):(slow?15:10); }
/* D02: one ordinary answering time; Chill halves it; Fog keeps it but the choices wait; More reading time x1.5 */
function timing(pw,sl){
  var base=FAST?(sl?12:8):(sl?36:24), fog=FAST?(sl?5:3):(sl?12:8);
  if(pw==='chill') return {len:Math.round(base/2),fog:0};
  if(pw==='fog') return {len:base,fog:fog};
  return {len:base,fog:0};
}
function powerDef(k){ for(var i=0;i<POWERS.length;i++) if(POWERS[i].key===k) return POWERS[i]; return null; }

/* ⭐ D01, the whole law of one question in one pure function (the fixtures call it directly).
   o: {live: ids standing when the question opened, elig: those of them here, marks: pid->marks before,
       answers: pid->chosen option text, correct: the stored answer, power, frostElig: the Frost eligible this round}
   A player standing but away is 'away' (no answer, no mark). 'none' is an eligible player who never committed:
   it costs a mark (the game's own rule, said on the rules screen), and it is never reported as a wrong pick. */
function resolveRound(o){
  var cost=o.power==='freeze'?2:1, res={}, applied=0, froze=[], m2={}, k, i;
  for(k in o.marks) m2[k]=o.marks[k]||0;
  for(i=0;i<o.live.length;i++){
    var pid=o.live[i], before=m2[pid]||0;
    if(o.elig.indexOf(pid)<0){ res[pid]={got:'away',pts:0,add:0,marks:before,pick:null}; continue; }
    var has=o.answers.hasOwnProperty(pid), pick=has?o.answers[pid]:null;
    if(has&&pick===o.correct){ res[pid]={got:'right',pts:RIGHT,add:0,marks:before,pick:pick}; continue; }
    var add=Math.max(0,Math.min(cost,MARKS_OUT-before));
    m2[pid]=before+add; applied+=add;
    res[pid]={got:has?'wrong':'none',pts:0,add:add,marks:m2[pid],pick:pick};
    if(m2[pid]>=MARKS_OUT){ res[pid].froze=true; froze.push(pid); }
  }
  var fp=(o.frostElig&&o.frostElig.length)?FROST_PAY*applied:0;   /* per Frost member; nobody to pay, nothing paid */
  for(i=0;i<(o.frostElig||[]).length;i++) res[o.frostElig[i]]={got:'frost',pts:0,weather:fp};
  return {res:res,applied:applied,frostPts:fp,froze:froze,marks:m2};
}
/* D01: the ending, checked after every reveal and before every round */
function endingFor(standing,asked,total){
  if(standing===0) return 'together';
  if(standing===1) return 'last';
  if(asked>=total) return 'cap';
  return null;
}
/* D03: the most chosen weather; a tie rotates Chill, Fog, Deep Freeze starting after the last winner; none is null */
function tally(v,voters,last){
  var count={}, best=0, i, k;
  for(i=0;i<voters.length;i++){ k=v[voters[i]]; if(powerDef(k)){ count[k]=(count[k]||0)+1; if(count[k]>best) best=count[k]; } }
  if(!best) return null;
  var start=0;
  for(i=0;i<POWERS.length;i++) if(POWERS[i].key===last) start=(i+1)%POWERS.length;
  for(i=0;i<POWERS.length;i++){ k=POWERS[(start+i)%POWERS.length].key; if(count[k]===best) return k; }
  return null;
}

function shuffle(a){ var out=a.slice();
  for(var i=out.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=out[i]; out[i]=out[j]; out[j]=t; }
  return out; }

function pickQuestions(){
  var used={}; try{used=JSON.parse(localStorage.getItem('fr_used')||'{}');}catch(e){}
  var pool=BANK.filter(function(q){return !used[q.id];});
  if(pool.length<MAX_Q){ used={}; pool=BANK.slice(); }
  QS=[]; shuffled=[];
  for(var i=0;i<MAX_Q&&pool.length;i++){
    var k=Math.floor(Math.random()*pool.length);
    var q=pool.splice(k,1)[0]; QS.push(q); used[q.id]=1;
    shuffled.push(shuffle(q.options));   /* options[0] is the right one in the bank; the room never sees that order */
  }
  try{localStorage.setItem('fr_used',JSON.stringify(used));}catch(e){}
}

function living(){ var out=[]; for(var i=0;i<order.length;i++) if(!frozen[order[i]]) out.push(order[i]); return out; }
function ghosts(){ var out=[]; for(var i=0;i<order.length;i++) if(frozen[order[i]]) out.push(order[i]); return out; }
function here(){ return PartyShell.presentPlayers(); }
function livingHere(){ var p=here(); return living().filter(function(x){ return p.indexOf(x)>=0; }); }
function ghostsHere(){ var p=here(); return ghosts().filter(function(x){ return p.indexOf(x)>=0; }); }
function savedIn(map,ids){ var n=0; for(var i=0;i<ids.length;i++) if(map.hasOwnProperty(ids[i])) n++; return n; }
/* everyone eligible who is STILL HERE has acted: one person walking out never makes the room sit out every clock */
function allIn(map,ids){ var p=here(), n=0;
  for(var i=0;i<ids.length;i++) if(p.indexOf(ids[i])>=0){ n++; if(!map.hasOwnProperty(ids[i])) return false; }
  return n>0; }
function savedIds(map,ids){ return ids.filter(function(x){ return map.hasOwnProperty(x); }); }

/* the ledger along the bottom: standing players with their marks and points, the Frost with their weather points */
function renderMarks(which){
  var html='';
  for(var i=0;i<order.length;i++){
    var pid=order[i], m=marks[pid]||0, pips='';
    /* ⛔ the state class here is "lit", never "on": the shell and the driver read a bare .on as THE ACTIVE SCREEN */
    for(var j=0;j<MARKS_OUT;j++) pips+='<span class="fr-pip'+(j<m?' lit':'')+'"></span>';
    html+='<div class="fr-mrow'+(frozen[pid]?' out':'')+'">'+tag(pid)+esc(names[pid])+
      (frozen[pid]?'<span class="fr-ftag">FROST</span><b class="wx">'+(weather[pid]||0)+'</b>'
                  :'<span class="fr-pips">'+pips+'</span><b>'+(scores[pid]||0)+'</b>')+'</div>';
  }
  var el=$(which); if(el) el.innerHTML=html;
}
function ledger(){ return {marks:marks,frozen:frozen,scores:scores,weather:weather,names:names,cols:cols(),syms:syms(),order:order}; }
function merge(a,b){ var o={},k; for(k in a) o[k]=a[k]; for(k in b) o[k]=b[k]; return o; }

PartyShell.onPlayerMessage(function(pid,msg){
  if(!msg||names[pid]===undefined) return;
  if(msg.t==='vote'||msg.t==='vmine?'){
    if(!onScreen('fr-vote')||msg.r!==qi+1||frostElig.indexOf(pid)<0) return;
    if(msg.t==='vmine?'){ if(votes.hasOwnProperty(pid)) PartyShell.sendToPlayer(pid,{t:'vback',r:qi+1,v:votes[pid]}); return; }
    if(!powerDef(msg.v)) return;
    votes[pid]=msg.v;                                 /* editable until the vote closes */
    PartyShell.sendToPlayer(pid,{t:'vback',r:qi+1,v:msg.v});
    paintVoteIn(); snd('pip');
    PartyShell.broadcast({t:'vcount',r:qi+1,ids:savedIds(votes,frostElig),of:frostElig.length});
    maybeFinishVote();
    return;
  }
  if(msg.t==='final'||msg.t==='mine?'){
    if(!onScreen('fr-q')||msg.q!==qi+1) return;
    if(msg.t==='mine?'){ if(answers.hasOwnProperty(pid)) ack(pid); return; }
    if(elig.indexOf(pid)<0||!optsShown) return;      /* hidden choices cannot be answered */
    /* ⛔ ONE FINAL ANSWER, EVER. A retry or a reloaded phone gets back the answer this host already holds. */
    if(answers.hasOwnProperty(pid)){ ack(pid); return; }
    var opts=shuffled[qi], idx=msg.v|0, pick=opts[idx];
    if(typeof msg.o==='string'&&msg.o!==pick){ idx=opts.indexOf(msg.o); pick=opts[idx]; }
    if(idx<0||idx>3||pick===undefined) return;
    answers[pid]=pick;
    ack(pid); paintQIn(); snd('pip');
    PartyShell.broadcast({t:'saved',q:qi+1,ids:savedIds(answers,elig),of:elig.length});
    if(allIn(answers,elig)){ PartyShell.stopTimer(); phaseReveal(); }
  }
});
function ack(pid){ PartyShell.sendToPlayer(pid,{t:'fin',q:qi+1,o:answers[pid]}); }

function startGame(players){
  scores={}; weather={}; names={}; marks={}; frozen={}; frozeAt={}; order=[]; lastWin=null; over=false;
  for(var i=0;i<players.length;i++){
    var id=players[i].id;
    names[id]=players[i].name; scores[id]=0; weather[id]=0; marks[id]=0; frozen[id]=false; order.push(id);
  }
  pickQuestions(); qi=0; phaseRules();
}

function paintPace(){
  var t=timing(null,slow);
  $('fr-pace').textContent=(slow?'More reading time is on: ':'')+t.len+' seconds to answer each question.';
  $('fr-slow').textContent=slow?'Standard reading time':'More reading time';
}
function rulesData(){ return {total:MAX_Q,slow:slow,len:timing(null,slow).len,powers:POWERS}; }
function toggleSlow(){ slow=!slow; paintPace(); PartyShell.setPhase('rules',rulesData()); rulesActions(); }
function rulesActions(){
  host([{label:'Start now',fn:function(){ PartyShell.stopTimer(); nextRound(); }},
        {label:slow?'Standard reading time':'More reading time',ghost:true,fn:toggleSlow}]);
}
function phaseRules(){
  show('fr-rules'); paintPace();
  PartyShell.setPhase('rules',rulesData());
  PartyShell.startTimer(T_RULES,function(s){$('fr-rt').textContent=s;},nextRound);
  $('fr-next').onclick=function(){ PartyShell.stopTimer(); nextRound(); };
  $('fr-slow').onclick=toggleSlow;
  rulesActions();
}

function nextRound(){
  host([]);
  if(over) return;
  var end=endingFor(living().length,qi,QS.length);
  if(end){ phasePodium(end); return; }
  frostElig=ghostsHere();          /* frozen at the start of this round AND here when its vote opens */
  power=null;
  if(!frostElig.length){ phaseQuestion(); return; }
  phaseVote();
}

function paintVoteIn(){ $('fr-votein').textContent=savedIn(votes,frostElig)+' of '+frostElig.length+' weather choices saved'; }
function phaseVote(){
  votes={}; finishing=false; phaseStart=Date.now();
  show('fr-vote'); renderMarks('fr-marks0');
  $('fr-vn').textContent='BEFORE QUESTION '+(qi+1)+' OF '+QS.length;
  var html='';
  for(var i=0;i<POWERS.length;i++)
    html+='<div class="fr-pw"><div class="fr-pwn">'+POWERS[i].name+'</div><div class="fr-pwd">'+esc(POWERS[i].desc)+'</div></div>';
  $('fr-powers').innerHTML=html;
  paintVoteIn();
  PartyShell.setPhase('vote',merge(ledger(),{powers:POWERS,num:qi+1,total:QS.length,eligible:frostElig,saved:[]}));
  PartyShell.startTimer(tVote(),function(s){ tNow=s; $('fr-vt').textContent=s; maybeFinishVote(s); },closeVote);
}
/* SHELL-D04: an editable vote never ends the instant the last choice lands; every Frost member here has saved, so a
   short announced window, still editable, never restarted */
function maybeFinishVote(left){
  if(left===undefined) left=tNow;
  if(finishing||!onScreen('fr-vote')) return;
  if(!allIn(votes,frostElig)) return;
  if((Date.now()-phaseStart)/1000<MIN_READ) return;
  if(left<=T_FINISH) return;
  finishing=true;
  setTimeout(function(){
    if(!onScreen('fr-vote')) return;
    PartyShell.stopTimer();
    $('fr-votein').textContent='All set. Finishing soon.';
    PartyShell.broadcast({t:'allset',r:qi+1});
    PartyShell.startTimer(T_FINISH,function(s){ $('fr-vt').textContent=s; },closeVote);
  },0);
}
function closeVote(){
  if(!onScreen('fr-vote')) return;
  power=tally(votes,frostElig,lastWin);
  if(power){ lastWin=power; phaseWeather(); } else phaseQuestion();
}

/* D02: every device sees the weather before the question clock starts */
function phaseWeather(){
  var d=powerDef(power);
  show('fr-wx'); renderMarks('fr-marksw');
  $('fr-wxn').textContent='QUESTION '+(qi+1)+' OF '+QS.length;
  $('fr-wxname').textContent=d.name; $('fr-wxdesc').textContent=d.desc;
  snd('chime');
  PartyShell.setPhase('weather',merge(ledger(),{num:qi+1,total:QS.length,power:power,powerName:d.name,powerDesc:d.desc}));
  PartyShell.startTimer(T_WEATHER,null,phaseQuestion);
}

function paintQIn(){ $('fr-qin').textContent=savedIn(answers,elig)+' of '+elig.length+' final answers saved'; }
function questionData(){
  var q=QS[qi], d=powerDef(power);
  return merge(ledger(),{num:qi+1,total:QS.length,q:q.q,options:optsShown?shuffled[qi]:null,fogAt:optsShown?null:fogAt,
    len:qLen,power:power,powerName:d?d.name:null,powerDesc:d?d.desc:null,eligible:elig,saved:savedIds(answers,elig)});
}
function paintOpts(){
  var oh='';
  if(optsShown) for(var i=0;i<shuffled[qi].length;i++) oh+='<div class="fr-opt">'+esc(shuffled[qi][i])+'</div>';
  $('fr-qopts').innerHTML=oh;
  $('fr-veil').style.display=optsShown?'none':'flex';
}
function phaseQuestion(){
  host([]);
  var q=QS[qi]; if(!q){ phasePodium('cap'); return; }
  elig=livingHere();
  /* nobody still standing is here: say so instead of running questions nobody can answer */
  if(!elig.length){ phasePodium('away'); return; }
  answers={};
  var t=timing(power,slow); qLen=t.len; optsShown=!t.fog; fogAt=t.fog?(t.len-t.fog):null;
  var d=powerDef(power);
  show('fr-q'); renderMarks('fr-marks1');
  $('fr-qn').textContent='QUESTION '+(qi+1)+' OF '+QS.length;
  $('fr-curpower').textContent=d?('Weather this round: '+d.name):'';
  $('fr-curpower').style.visibility=d?'visible':'hidden';
  $('fr-qtext').textContent=q.q;
  $('fr-veil').textContent='The choices are in the fog';
  paintOpts(); paintQIn();
  PartyShell.setPhase('question',questionData());
  PartyShell.startTimer(qLen,function(s){
    var t2=$('fr-qt'); t2.textContent=s; t2.classList.toggle('low',s<=5);
    if(!optsShown&&s<=fogAt){
      optsShown=true; paintOpts();
      PartyShell.setPhase('question',questionData());
    }
  },phaseReveal);
}

function phaseReveal(){
  if(!onScreen('fr-q')) return;                 /* one reveal per question, never two */
  var q=QS[qi], correct=q.options[0];
  var live=living();
  var r=resolveRound({live:live,elig:elig,marks:marks,answers:answers,correct:correct,power:power,frostElig:frostElig});
  var k;
  for(k in r.res){
    var x=r.res[k];
    if(x.got==='right') scores[k]=(scores[k]||0)+x.pts;
    if(x.got==='frost') weather[k]=(weather[k]||0)+x.weather;
  }
  marks=r.marks;
  for(var f=0;f<r.froze.length;f++){ frozen[r.froze[f]]=true; frozeAt[r.froze[f]]=qi+1; }
  /* every Frost member not eligible this round still gets a line, with nothing earned */
  var gh=ghosts();
  for(var g=0;g<gh.length;g++) if(!r.res[gh[g]]) r.res[gh[g]]={got:'frost',pts:0,weather:0,idle:true};
  lastRound=r;

  show('fr-rev');
  snd('reveal', r.applied===0);
  if(r.froze.length) setTimeout(function(){ snd('thud'); },700);
  $('fr-rvn').textContent='QUESTION '+(qi+1)+' OF '+QS.length;
  $('fr-ans').textContent='The answer was '+correct+'.';
  var line='', marked=live.filter(function(p){ return r.res[p]&&r.res[p].add>0&&!r.res[p].froze; }),
      away=live.filter(function(p){ return r.res[p]&&r.res[p].got==='away'; });
  if(r.applied===0) line+='<div class="fr-tookline">'+(away.length?'Everyone here answered correctly.':'Everyone answered correctly.')+'</div>';
  for(var m=0;m<marked.length;m++) line+='<div class="fr-tookline">'+esc(names[marked[m]])+' has '+esc(marksWord(marks[marked[m]]))+'.</div>';
  for(var z=0;z<r.froze.length;z++) line+='<div class="fr-frozeline">'+esc(names[r.froze[z]])+' joins the Frost next round.</div>';
  if(frostElig.length) line+='<div class="fr-wxline">'+(r.applied?(esc(newMarks(r.applied))+'. +'+r.frostPts+' weather points for each of the Frost.'):'No new frost marks this round.')+'</div>';
  $('fr-took').innerHTML=line;
  /* who knew it, who chose what, who did not answer: the room reads its own round */
  var chips='';
  for(var c=0;c<live.length;c++){
    var pid=live[c], x=r.res[pid], what;
    if(x.got==='right') what='right <b>+'+x.pts+'</b>';
    else if(x.got==='wrong') what='chose '+esc(x.pick)+' <i>+'+x.add+'</i>';
    else if(x.got==='none') what='no answer <i>+'+x.add+'</i>';
    else what='away';
    chips+='<span class="fr-sc'+(x.got==='right'?' right':'')+'">'+tag(pid)+esc(names[pid])+' <em>'+what+'</em></span>';
  }
  $('fr-scored').innerHTML=chips;
  renderMarks('fr-marks2');

  PartyShell.setPhase('reveal',merge(ledger(),{num:qi+1,total:QS.length,answer:correct,results:r.res,applied:r.applied,
    frostPts:r.frostPts,froze:r.froze,frostElig:frostElig,power:power,powerName:powerDef(power)?powerDef(power).name:null}));
  PartyShell.startTimer(T_REV,function(s){$('fr-rvt').textContent=s;},function(){ qi++; nextRound(); });
}

/* D01: survival and the Frost's work are two achievements, so two panels, never one combined ranking.
   Survival: everybody still standing shares the top place; the frozen follow, later freezes first; a shared
   question is a shared place. The Frost: by weather points, a tie shares a place. */
function survival(){
  function key(id){ return frozen[id]?(frozeAt[id]||0):1000; }
  var ids=order.slice();
  ids.sort(function(a,b){ return key(b)-key(a) || (scores[b]||0)-(scores[a]||0) || String(names[a]).localeCompare(String(names[b])); });
  var places={}, last=null, place=0;
  for(var i=0;i<ids.length;i++){ var kk=key(ids[i]); if(kk!==last){ place=i+1; last=kk; } places[ids[i]]=place; }
  return {ids:ids,places:places};
}
function frostRank(){
  var ids=ghosts();
  ids.sort(function(a,b){ return (weather[b]||0)-(weather[a]||0) || String(names[a]).localeCompare(String(names[b])); });
  var places={}, last=null, place=0;
  for(var i=0;i<ids.length;i++){ var w=weather[ids[i]]||0; if(w!==last){ place=i+1; last=w; } places[ids[i]]=place; }
  var top=ids.length?(weather[ids[0]]||0):0;
  return {ids:ids,places:places,most:top>0?ids.filter(function(x){ return (weather[x]||0)===top; }):[]};
}
function joinNames(nm){ return nm.length<=1?nm.join(''):nm.slice(0,-1).join(', ')+' and '+nm[nm.length-1]; }
/* the ending, said the same way on every screen (pure: the fixtures call it with plain names) */
function endingText(end,standingNames,total){
  if(end==='last') return [standingNames[0]+' is the last survivor. +'+WIN_BONUS];
  if(end==='together') return ['Everyone became the Frost together.'];
  if(end==='away') return ['Nobody still standing is here.','Still standing: '+joinNames(standingNames)+'.'];
  return [total===12?'Twelve questions complete.':(total+' questions complete.'),'Still standing: '+joinNames(standingNames)+'.'];
}
function endingLines(end,standing){ return endingText(end,standing.map(function(x){ return names[x]; }),QS.length); }

function phasePodium(end){
  if(over) return;
  over=true;
  snd('fanfare');
  show('fr-pod');
  var standing=living();
  if(end==='last') scores[standing[0]]=(scores[standing[0]]||0)+WIN_BONUS;   /* once: over guards a second call */
  var lines=endingLines(end,standing);
  var wl='<div class="fr-survivor">'+esc(lines[0])+'</div>';
  if(lines[1]) wl+='<div class="fr-standing">'+esc(lines[1])+'</div>';
  $('fr-winline').innerHTML=wl;

  var sv=survival(), html='', results={};
  for(var i=0;i<sv.ids.length;i++){
    var id=sv.ids[i];
    html+='<div class="fr-row'+(frozen[id]?' out':'')+'"><span class="place">'+sv.places[id]+'</span>'+tag(id)+
      '<span class="nm">'+esc(names[id])+'</span><span class="how">'+(frozen[id]?('frozen at question '+frozeAt[id]):'still standing')+'</span>'+
      '<b>'+(scores[id]||0)+'</b></div>';
    results[id]={score:(scores[id]||0)+(weather[id]||0),place:sv.places[id]};
  }
  $('fr-podrows').innerHTML=html;
  var fr=frostRank(), fh='';
  for(var j=0;j<fr.ids.length;j++)
    fh+='<div class="fr-row out"><span class="place">'+fr.places[fr.ids[j]]+'</span>'+tag(fr.ids[j])+
      '<span class="nm">'+esc(names[fr.ids[j]])+'</span><b class="wx">'+(weather[fr.ids[j]]||0)+'</b></div>';
  $('fr-frostrows').innerHTML=fh;
  $('fr-most').textContent=!fr.ids.length?'Nobody became the Frost this game.':
    fr.most.length?('Most weather points: '+listNames(fr.most)):'No weather points this game.';

  PartyShell.setPhase('podium',merge(ledger(),{ending:end,lines:lines,frozeAt:frozeAt,
    survival:sv.ids,survivalPlaces:sv.places,frost:fr.ids,frostPlaces:fr.places,most:fr.most}));
  PartyShell.gameComplete(results);
  $('fr-again').onclick=function(){ startGame(PartyShell.players()); };
  $('fr-other').onclick=function(){ PartyShell.backToPicker(); };
  $('fr-end').onclick=function(){ PartyShell.closeRoom(); };
  host([{label:'Play again',fn:function(){ startGame(PartyShell.players()); }},
        {label:'Another game',ghost:true,fn:function(){ PartyShell.backToPicker(); }},
        {label:'End night',ghost:true,fn:function(){ PartyShell.closeRoom(); }}]);
}

/* read only state hook for the end to end driver and the fixtures. Costs nothing and cannot change the game.
   (lower case on purpose: upper case window names are content banks to the static gate) */
window.__frState=function(){ return {qi:qi,qs:QS.length,living:living().length,
  ghosts:ghosts().length,frozen:frozen,marks:marks,power:power,answered:Object.keys(answers).length}; };
window.__firstfrost={resolve:resolveRound,ending:endingFor,endingText:endingText,tally:tally,timing:timing,powers:POWERS,
  quarantine:function(){ return Object.keys(QUARANTINE); },
  dealt:function(){ return QS.map(function(q){ return q.id; }); },
  setSlow:function(v){ slow=!!v; paintPace(); },
  state:function(){ var on=root.querySelector('.fr-screen.on');
    return {qi:qi,total:QS.length,screen:on?on.id:'',power:power,len:qLen,fogAt:fogAt,optsShown:optsShown,
      answer:QS[qi]?QS[qi].options[0]:'',living:living(),ghosts:ghosts(),marks:marks,frozen:frozen,frozeAt:frozeAt,
      scores:scores,weather:weather,frostElig:frostElig,elig:elig,votes:Object.keys(votes).length,over:over,
      completed:PartyShell.completed?PartyShell.completed().n:null,last:lastRound}; }};

document.addEventListener('party-started',function(ev){ startGame(ev.detail.players); });
})();
