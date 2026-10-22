/* SAME SOIL, host screen.

   One player is the chooser. Two things appear. The chooser picks the one they prefer today, everybody else guesses
   what they picked, and then it opens.

   ⭐ THE CHOOSER'S OWN ANSWER IS THE ONLY AUTHORITY. Nobody can ever be told they are wrong about themselves, which
   is the whole reason this is safe to play with a child or with somebody you met an hour ago. Every other title in
   the pack has a right answer that belongs to the world. This one has a right answer that belongs to a person.

   ⭐ IT WORKS AT TWO PLAYERS. A couple on a sofa is a real party size.

   ⭐ 18 Oct 2026, Astra's review (party/reviews/WHACKBOX-REVIEW-GPT-2026-10-18.md, SAMESOIL-D01 to D04 and the copy
   table B6.4), checked against this file first:
   - D01 EQUAL TURNS, TRUTHFUL COUNT. The old count, min(12, ceil(10/n)*n), gave 12 rounds to 7 and 8 players, so five
     of seven (four of eight) people chose twice and the rest once: an invisible 40 point edge per extra turn. Now the
     standard game is 12 rounds for 2, 3, 4 and 6 players, 10 for 5, 14 for 7, 16 for 8, and the Short game is two
     turns each (two players: four each, 8 rounds). The chooser order is shuffled ONCE, then cycled. The rules screen
     says the total, the turns each and a time range before the first round. A chooser who has left the room is
     skipped (never given a made up pick).
   - D02 FINAL AND PRIVATE. The chooser selects, then taps "This is my pick"; only that opens the guessing. A tap
     before it is just a selection on their own phone. The pick is never in a phase payload before the reveal; the
     chooser's phone learns it back privately (sendToPlayer) so a reload still shows their own choice to them alone.
     No pick by the deadline voids the round, and that chooser gets ONE retry with a different pair; no points either
     time. (Data level: the transport delivers every message to every phone and each phone drops what is not
     addressed to it, so a curious player with developer tools could still read it. No SCREEN ever shows it.)
   - D03 light words, 100 per correct guess and 40 to the chooser for each, missing guesses score nothing and count
     for nothing, 16 s to choose, 18 s to guess, 9 s to reveal, and the shared finish window: once every eligible
     guess is saved (and at least 6 s have passed) the room gets "All set. Finishing soon." for 3 s, guesses still
     editable, never restarted by an edit.
   - D04 words stay the release (no art yet). D05 (the reason why) is a P2 experiment and stays off.
   Fixtures: party/test/samesoil_rules.js. */
(function(){
'use strict';
function $(id){return document.getElementById(id);}
function esc(s){ return String(s).replace(/[<>&"]/g,function(c){return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c];}); }

var root=$('game-root');
root.innerHTML=
 '<div class="ss-screen" id="ss-rules"><div class="ss-timer" id="ss-rt"></div>'+
 '<div class="ss-rules">Each round, one person makes a secret choice.\nPick the option you prefer today.\nEveryone else guesses your choice.\nYour choice is yours. There is no wrong preference.</div>'+
 '<div class="ss-rules-small">A correct guess earns 100. The chooser earns 40 for each correct guess.</div>'+
 '<div class="ss-length" id="ss-len"></div>'+
 '<div class="ss-btnrow"><button class="ps-btn" id="ss-next">Start now</button>'+
 '<button class="ps-btn ghost" id="ss-short"></button></div></div>'+

 '<div class="ss-screen" id="ss-pick"><div class="ss-timer" id="ss-pt"></div>'+
 '<div class="ss-num" id="ss-pn"></div>'+
 '<div class="ss-subject" id="ss-psub"></div>'+
 '<div class="ss-pair" id="ss-ppair"></div>'+
 '<div class="ss-in" id="ss-pin"></div><div class="ss-strip" id="ss-strip1"></div></div>'+

 '<div class="ss-screen" id="ss-guess"><div class="ss-timer" id="ss-gt"></div>'+
 '<div class="ss-num" id="ss-gn"></div>'+
 '<div class="ss-subject" id="ss-gsub"></div>'+
 '<div class="ss-pair" id="ss-gpair"></div>'+
 '<div class="ss-in" id="ss-gin"></div><div class="ss-strip" id="ss-strip2"></div></div>'+

 '<div class="ss-screen" id="ss-rev"><div class="ss-timer" id="ss-vt"></div>'+
 '<div class="ss-num" id="ss-vn"></div>'+
 '<div class="ss-said" id="ss-vsaid"></div>'+
 '<div class="ss-pair" id="ss-vpair"></div>'+
 '<div class="ss-knew" id="ss-vknew"></div><div class="ss-strip" id="ss-strip3"></div></div>'+

 '<div class="ss-screen ss-podium" id="ss-pod"><div class="ss-num">Game complete</div>'+
 '<div id="ss-podrows" class="ss-rows"></div>'+
 '<div class="ss-earn">Thanks for playing together.</div>'+
 '<div class="ss-btnrow">'+
 '<button class="ps-btn" id="ss-again">Play again</button>'+
 '<button class="ps-btn ghost" id="ss-other">Another game</button>'+
 '<button class="ps-btn ghost" id="ss-end">End night</button></div></div>';

function show(id){ var s=root.querySelectorAll('.ss-screen');
  for(var i=0;i<s.length;i++) s[i].classList.remove('on'); $(id).classList.add('on'); }

function snd(m,a){ try{ if(window.PartySound) PartySound[m](a); }catch(e){} }
function pcol(pid){ try{ return PartyShell.colorFor(pid); }catch(e){ return '#e8dcc8'; } }
function psym(pid){ try{ return PartyShell.symbolFor?PartyShell.symbolFor(pid):'●'; }catch(e){ return '●'; } }
function cols(){ var o={},k; for(k in names) o[k]=pcol(k); return o; }
function syms(){ var o={},k; for(k in names) o[k]=psym(k); return o; }
function host(list){ try{ if(PartyShell.hostActions) PartyShell.hostActions(list); }catch(e){} }

var BANK=window.SAMESOIL_BANK||[], QS=[], SPARE=[], ri=0;
var scores={}, names={}, order=[], schedule=[], shortGame=false;
var subject=null, subjectPick=null, guesses={}, eligible=[], retried=false, finishing=false, guessStart=0, gLeft=0;
var FAST=/[?&]ss_fast=1(&|$)/.test(location.search);
var T_RULES=FAST?3:24, T_PICK=FAST?3:16, T_GUESS=FAST?4:18, T_REV=FAST?2:9, T_VOID=FAST?2:6, T_FINISH=FAST?1:3, MIN_READ=FAST?1:6;

/* ⭐ SAMESOIL-D01, the whole rule in one place (and exposed to the fixtures). */
var STD={2:12,3:12,4:12,5:10,6:12,7:14,8:16};
function roundsFor(n,short){
  if(short) return n===2?8:2*n;
  return STD[n]||2*n;
}
function shuffle(a){ a=a.slice(); for(var i=a.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=a[i]; a[i]=a[j]; a[j]=t; } return a; }
/* the chooser order is shuffled once, then cycled, so every player chooses exactly rounds/n times */
function buildSchedule(ids,short){
  var R=roundsFor(ids.length,short), turnOrder=shuffle(ids), out=[];
  for(var i=0;i<R;i++) out.push(turnOrder[i%turnOrder.length]);
  return out;
}
/* ⭐ ONE ROUND'S SCORE. A missing guess is missing: it scores nothing and is not counted as a wrong guess. */
function scoreRound(pick,gs,ids,chooser){
  var res={}, knew=0, wrong=0, i;
  for(i=0;i<ids.length;i++){
    var pid=ids[i];
    if(pid===chooser) continue;
    if(gs.hasOwnProperty(pid)){
      if(gs[pid]===pick){ res[pid]={got:'right',pts:100,guess:gs[pid]}; knew++; }
      else { res[pid]={got:'wrong',pts:0,guess:gs[pid]}; wrong++; }
    } else res[pid]={got:'none',pts:0,guess:null};
  }
  res[chooser]={got:'subject',pts:knew*40,knew:knew};
  return {res:res,knew:knew,wrong:wrong};
}
/* test surface (lower case on purpose: upper case window names are content banks to the static gate) */
window.__samesoil={rounds:roundsFor,schedule:buildSchedule,score:scoreRound,
  state:function(){ return {ri:ri,total:schedule.length,subject:subject,picked:subjectPick!==null,finishing:finishing,short:shortGame}; }};

function pickPairs(n){
  var used={}; try{used=JSON.parse(localStorage.getItem('ss_used')||'{}');}catch(e){}
  var pool=BANK.filter(function(p){return !used[p.id];});
  if(pool.length<n){ used={}; pool=BANK.slice(); }
  var out=[];
  for(var i=0;i<n&&pool.length;i++){
    var k=Math.floor(Math.random()*pool.length);
    var p=pool.splice(k,1)[0]; out.push(p); used[p.id]=1;
  }
  try{localStorage.setItem('ss_used',JSON.stringify(used));}catch(e){}
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
function tag(pid){
  return '<i class="ss-sym" style="color:'+esc(pcol(pid))+'">'+esc(psym(pid))+'</i>';
}
function strip(which){
  var r=ranked(), rows='';
  for(var i=0;i<r.ids.length;i++) rows+='<span>'+tag(r.ids[i])+esc(names[r.ids[i]])+' <b>'+(scores[r.ids[i]]||0)+'</b></span>';
  var el=$(which); if(el) el.innerHTML=rows;
}
function pairHTML(q,chosen,bySide){
  function side(key,label){
    var chips='', list=(bySide&&bySide[key])||[];
    for(var i=0;i<list.length;i++)
      chips+='<span class="ss-chip" style="border-color:'+esc(pcol(list[i]))+'">'+tag(list[i])+esc(names[list[i]])+'</span>';
    return '<div class="ss-side'+(chosen===key?' won':(chosen?' lost':''))+'">'+
      '<div class="ss-word">'+esc(label)+'</div><div class="ss-chips">'+chips+'</div></div>';
  }
  return side('a',q.a)+'<div class="ss-or">or</div>'+side('b',q.b);
}
function present(){ return PartyShell.presentPlayers(); }
function isHere(pid){ return present().indexOf(pid)>=0; }
/* who may guess this round: present when the guessing opens, not the chooser */
function snapshotEligible(){
  var p=present(), out=[];
  for(var i=0;i<p.length;i++) if(names[p[i]]!==undefined&&p[i]!==subject) out.push(p[i]);
  return out;
}
function savedCount(){ var n=0; for(var i=0;i<eligible.length;i++) if(guesses.hasOwnProperty(eligible[i])) n++; return n; }
function allIn(){ return eligible.length>0 && savedCount()>=eligible.length; }
function countLine(){ return savedCount()+' of '+eligible.length+' guesses saved'; }
function pairOf(){ return QS[ri]; }

PartyShell.onPlayerMessage(function(pid,msg){
  if(!msg||names[pid]===undefined) return;
  /* D02: only the chooser's explicit "This is my pick" counts, once */
  if(msg.t==='mine'&&msg.r===ri+1&&pid===subject&&subjectPick===null&&$('ss-pick').classList.contains('on')){
    subjectPick=(msg.v==='a')?'a':'b';
    PartyShell.sendToPlayer(pid,{t:'mineok',r:ri+1,v:subjectPick});
    $('ss-pin').textContent=names[subject]+' has made a choice.';
    PartyShell.stopTimer(); phaseGuess();
  }
  /* a chooser's phone that reloaded during the guessing asks what it picked; only it is told */
  else if(msg.t==='mine?'&&msg.r===ri+1&&pid===subject&&subjectPick!==null){
    PartyShell.sendToPlayer(pid,{t:'mineok',r:ri+1,v:subjectPick});
  }
  else if(msg.t==='guess'&&msg.r===ri+1&&pid!==subject&&$('ss-guess').classList.contains('on')){
    if(eligible.indexOf(pid)<0) return;
    guesses[pid]=(msg.v==='a')?'a':'b';
    PartyShell.sendToPlayer(pid,{t:'gack',r:ri+1,v:guesses[pid]});
    $('ss-gin').textContent=countLine(); snd('pip');
    PartyShell.broadcast({t:'gcount',r:ri+1,n:savedCount(),of:eligible.length});
    maybeFinish();
  }
});

/* SHELL-D04: the editable guessing never ends the instant the last guess lands. Once every eligible guess is saved
   and the room has had a moment to read, everybody gets a short announced window, still editable, never restarted. */
function maybeFinish(left){
  if(left===undefined) left=gLeft;
  if(finishing||!allIn()) return;
  var elapsed=(Date.now()-guessStart)/1000;
  if(elapsed<MIN_READ) return;               /* the guess timer's tick looks again */
  if(left<=T_FINISH) return;                 /* the clock is already about to end */
  finishing=true;
  setTimeout(function(){
    if(!$('ss-guess').classList.contains('on')) return;
    PartyShell.stopTimer();
    $('ss-gin').textContent='All set. Finishing soon.';
    PartyShell.broadcast({t:'allset',r:ri+1});
    PartyShell.startTimer(T_FINISH,function(s){ var t=$('ss-gt'); t.textContent=s; t.classList.toggle('low',true); },phaseReveal);
  },0);
}

function startGame(players){
  scores={}; names={}; order=[];
  for(var i=0;i<players.length;i++){ names[players[i].id]=players[i].name; scores[players[i].id]=0; order.push(players[i].id); }
  shortGame=false;
  schedule=buildSchedule(order,shortGame);
  QS=pickPairs(schedule.length); SPARE=pickPairs(order.length);
  ri=0; retried=false; phaseRules();
}
function lengthInfo(){
  var R=schedule.length, n=order.length, k=Math.round(R/Math.max(1,n));
  var lo=Math.max(1,Math.round(R*22/60)), hi=Math.max(lo+1,Math.ceil(R*43/60));
  return {total:R,turns:k,lo:lo,hi:hi,short:shortGame};
}
function paintLength(){
  var L=lengthInfo();
  $('ss-len').textContent='This game: '+L.total+' rounds. Each of you chooses '+L.turns+' times. About '+L.lo+' to '+L.hi+' minutes.';
  $('ss-short').textContent=shortGame?'Standard game':'Short game';
}
function toggleShort(){
  shortGame=!shortGame;
  schedule=buildSchedule(order,shortGame);
  QS=pickPairs(schedule.length);
  paintLength();
  PartyShell.setPhase('rules',lengthInfo());
  rulesActions();
}
function rulesActions(){
  host([{label:'Start now',fn:function(){ PartyShell.stopTimer(); phasePick(); }},
        {label:shortGame?'Standard game':'Short game',ghost:true,fn:toggleShort}]);
}
function phaseRules(){
  show('ss-rules'); paintLength();
  PartyShell.setPhase('rules',lengthInfo());
  PartyShell.startTimer(T_RULES,function(s){$('ss-rt').textContent=s;},phasePick);
  $('ss-next').onclick=function(){ PartyShell.stopTimer(); phasePick(); };
  $('ss-short').onclick=toggleShort;
  rulesActions();
}

function roundData(extra){
  /* att: 0 for a chooser's first pair, 1 for the retry after a round that did not count (the round number stays) */
  var q=pairOf(), d={num:ri+1,att:retried?1:0,total:schedule.length,a:q.a,b:q.b,subject:subject,subjectName:names[subject],
    names:names,cols:cols(),syms:syms(),scores:scores};
  for(var k in (extra||{})) d[k]=extra[k];
  return d;
}

function phasePick(){
  host([]);
  /* a chooser who has left is skipped: no made up pick, no waiting on an empty chair */
  var guard=0;
  while(ri<schedule.length && !isHere(schedule[ri]) && guard++<schedule.length){ ri++; retried=false; }
  if(ri>=schedule.length||!pairOf()){ phasePodium(); return; }
  subject=schedule[ri]; subjectPick=null; guesses={}; eligible=[]; finishing=false;
  var q=pairOf();
  show('ss-pick'); strip('ss-strip1');
  $('ss-pn').textContent='ROUND '+(ri+1)+' OF '+schedule.length;
  $('ss-psub').innerHTML='<b>'+esc(names[subject])+'</b> is choosing';
  $('ss-ppair').innerHTML=pairHTML(q,null,null);
  $('ss-pin').textContent='What do you think '+names[subject]+' will choose?';
  PartyShell.setPhase('pick',roundData({retry:retried}));
  PartyShell.startTimer(T_PICK,function(s){ var t=$('ss-pt'); t.textContent=s; t.classList.toggle('low',s<=5); },
    function(){
      /* ⛔ NEVER INVENT SOMEBODY'S ANSWER ABOUT THEMSELVES. A silent chooser is a round that does not count. */
      if(subjectPick===null){ phaseVoid(); return; }
      phaseGuess();
    });
}

/* D02: no choice by the deadline. The round does not count; the chooser gets one more go with a different pair. */
function phaseVoid(){
  var q=pairOf(), willRetry=!retried && SPARE.length>0;
  show('ss-rev');
  $('ss-vn').textContent='ROUND '+(ri+1)+' OF '+schedule.length;
  $('ss-vsaid').innerHTML='<b>'+esc(names[subject])+'</b>: no choice was saved.';
  $('ss-vpair').innerHTML=pairHTML(q,null,null);
  $('ss-vknew').textContent=willRetry?'This round does not count. We will try another pair.':'This round does not count.';
  strip('ss-strip3');
  var res={},i;
  for(i=0;i<order.length;i++) res[order[i]]={got:'skipped',pts:0};
  PartyShell.setPhase('reveal',roundData({pick:null,skipped:true,retry:willRetry,knew:0,of:0,results:res}));
  PartyShell.startTimer(T_VOID,function(s){$('ss-vt').textContent=s;},function(){
    if(willRetry){ QS[ri]=SPARE.shift(); retried=true; }
    else { ri++; retried=false; }
    phasePick();
  });
}

function phaseGuess(){
  var q=pairOf();
  eligible=snapshotEligible(); guesses={}; finishing=false; guessStart=Date.now(); gLeft=T_GUESS;
  show('ss-guess'); strip('ss-strip2');
  $('ss-gn').textContent='ROUND '+(ri+1)+' OF '+schedule.length;
  $('ss-gsub').innerHTML='Which one did <b>'+esc(names[subject])+'</b> choose?';
  $('ss-gpair').innerHTML=pairHTML(q,null,null);
  $('ss-gin').textContent=countLine();
  /* the pick is NOT in this payload; the chooser's phone hears it privately */
  PartyShell.setPhase('guess',roundData({eligible:eligible.length}));
  PartyShell.sendToPlayer(subject,{t:'mineok',r:ri+1,v:subjectPick});
  PartyShell.startTimer(T_GUESS,function(s){ var t=$('ss-gt'); t.textContent=s; t.classList.toggle('low',s<=5); gLeft=s; maybeFinish(s); },phaseReveal);
}

function phaseReveal(){
  if(!$('ss-guess').classList.contains('on')) return;
  var q=pairOf(), sc=scoreRound(subjectPick,guesses,order,subject), k;
  for(k in sc.res) scores[k]=(scores[k]||0)+sc.res[k].pts;
  var bySide={a:[],b:[]};
  for(k in guesses) if(eligible.indexOf(k)>=0) bySide[guesses[k]].push(k);
  var subjPts=sc.res[subject].pts, nm=names[subject];

  show('ss-rev');
  snd('reveal', sc.knew>0);
  $('ss-vn').textContent='ROUND '+(ri+1)+' OF '+schedule.length;
  $('ss-vsaid').innerHTML='<b>'+esc(nm)+'</b> chose';
  $('ss-vpair').innerHTML=pairHTML(q,subjectPick,bySide);
  $('ss-vknew').textContent=knewLine(sc.knew,nm)+(subjPts?(' '+nm+' earns '+subjPts+'.'):'');
  strip('ss-strip3');

  var sideNames={a:[],b:[]};
  for(k in bySide) for(var i=0;i<bySide[k].length;i++){ var p=bySide[k][i]; sideNames[k].push([names[p],pcol(p),psym(p)]); }
  PartyShell.setPhase('reveal',roundData({pick:subjectPick,knew:sc.knew,of:eligible.length,results:sc.res,sides:sideNames}));
  PartyShell.startTimer(T_REV,function(s){$('ss-vt').textContent=s;},function(){ ri++; retried=false; phasePick(); });
}
function knewLine(n,nm){
  if(n===0) return 'Nobody guessed '+nm+'’s choice this time.';
  return (n===1?'1 person':(n+' people'))+' guessed '+nm+'’s choice.';
}

function phasePodium(){
  snd('fanfare');
  show('ss-pod');
  var r=ranked(), html='', results={};
  for(var i=0;i<r.ids.length;i++){
    var id=r.ids[i];
    html+='<div class="ss-row"><span class="place">'+r.places[id]+'</span>'+tag(id)+esc(names[id])+
          '<b>'+(scores[id]||0)+'</b></div>';
    results[id]={score:scores[id]||0,place:r.places[id]};
  }
  $('ss-podrows').innerHTML=html;
  PartyShell.setPhase('podium',{scores:scores,names:names,cols:cols(),syms:syms()});
  PartyShell.gameComplete(results);
  $('ss-again').onclick=function(){ startGame(PartyShell.players()); };
  $('ss-other').onclick=function(){ PartyShell.backToPicker(); };
  $('ss-end').onclick=function(){ PartyShell.closeRoom(); };
  host([{label:'Play again',fn:function(){ startGame(PartyShell.players()); }},
        {label:'Another game',ghost:true,fn:function(){ PartyShell.backToPicker(); }},
        {label:'End night',ghost:true,fn:function(){ PartyShell.closeRoom(); }}]);
}

document.addEventListener('party-started',function(ev){ startGame(ev.detail.players); });
})();
