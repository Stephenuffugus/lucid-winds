/* BEARING, host screen.

   A line runs between two opposites. One player, the Lantern, can see a hidden
   target on it. They say ONE WORD OUT LOUD. Everybody else saves a position on
   the line where they think the target is.

   ⭐⭐ THE SPOKEN CLUE IS THE WHOLE POINT, AND IT IS ALSO THE RULE. The house rule
   is that player TEXT never reaches a screen. Speaking never touches a screen at
   all, so the funniest input a person has is available to us with no moderation
   surface: nothing is typed, sent, stored or displayed. The Lantern's phone only
   ever says "say one word". This title exists to prove that door is open,
   because most of the party genre is behind it. It also means the room must be
   ONE room: phones only is not remote play, and the rules say so.

   ⭐ THE LANTERN SCORES THE ROOM'S AVERAGE. A clue giver paid for their own
   accuracy would just describe the target; paid for the room's accuracy, they
   have to think about how OTHER people hear a word, which is the actual game.

   ⭐ 18 Oct 2026, Astra's review (party/reviews/WHACKBOX-REVIEW-GPT-2026-10-18.md, BEARING-D01 to D04 and the copy
   table B8.4), checked against this file first:
   - D01 already true here: the target is a whole number from 8 to 92 and only ever travels to the Lantern's phone
     on its own message (never in a phase payload; audit_static section 10 holds that). New: the rules carry the
     spoken clue's limits (no numbers, no words from the two ends, explanations wait for the reveal) and a worked
     example; the Lantern may tap "Need another pair" ONCE per round before giving the clue, no penalty (a new pair,
     a new spot, a fresh clock); and a Lantern who never says they have given the clue VOIDS the round (no points
     for anybody; it used to fall through to the guessing with nothing said), with ONE retry for that Lantern so the
     turns stay equal. (Data level: the transport delivers every message to every phone and each phone drops what
     is not addressed to it, so a curious player with developer tools could read the spot. No SCREEN shows it.)
   - D02 the bands were already 150 / 100 / 50 / 20 within 5 / 12 / 20 / 30. WRONG HERE: the old round count,
     min(12, max(n, ceil(10/n)*n)), gave 7 and 8 players 12 rounds, so some held the Lantern twice and some once,
     and the Lantern's average divided by the guesses that ARRIVED, so a Lantern profited when only their best
     reader answered. Now: two full Lantern cycles (6 to 16 rounds for 3 to 8 players), one cycle as the Short game,
     the order shuffled once then cycled, an absent Lantern skipped; the average is over every ELIGIBLE guesser (in
     the room when the guessing opened), a missing position counting 0, rounded half up, and no valid guess at all
     pays nothing. The Lantern is never scored as a guesser.
   - D03 a position counts only once SAVED (an untouched or unsaved pointer is not a guess; it used to count at the
     buzzer). Saving again changes it. 24 s to give the clue, 24 s to place, 10 s to reveal, and the shared finish
     window: once every eligible position is saved (and at least 6 s have passed) the room gets "All set. Finishing
     soon." for 3 s, still editable, never restarted by an edit.
   - D04 pairs that are categories or matters of taste are quarantined below (Morning to Night by name, and the
     others the same test catches); the reveal shows the spot, the bands, every saved position by name and symbol
     and the Lantern's average, in words that never say a Lantern "lost" anybody.
   - D05 (the explanation moment) is a P2 experiment and stays off.
   Fixtures: party/test/bearing_rules.js. */
(function(){
'use strict';
function $(id){return document.getElementById(id);}
function esc(s){ return String(s).replace(/[<>&"]/g,function(c){return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c];}); }
function snd(m,a){ try{ if(window.PartySound) PartySound[m](a); }catch(e){} }
function pcol(pid){ try{ return PartyShell.colorFor(pid); }catch(e){ return '#e8dcc8'; } }
function psym(pid){ try{ return PartyShell.symbolFor?PartyShell.symbolFor(pid):'●'; }catch(e){ return '●'; } }
function cols(){ var o={},k; for(k in names) o[k]=pcol(k); return o; }
function syms(){ var o={},k; for(k in names) o[k]=psym(k); return o; }
function host(list){ try{ if(PartyShell.hostActions) PartyShell.hostActions(list); }catch(e){} }

var root=$('game-root');
root.innerHTML=
 '<div class="br-screen" id="br-rules"><div class="br-timer" id="br-rt"></div>'+
 '<div class="br-rules">One person sees a secret spot between two ideas.\nThey say one word to help everyone find that spot.\nEveryone else saves a position on the line.\nCloser guesses score more. The clue giver earns the average.</div>'+
 '<div class="br-rules-small">No numbers or words from the two ends. Save explanations for the reveal.</div>'+
 '<div class="br-example" id="br-ex"></div>'+
 '<div class="br-length" id="br-len"></div>'+
 '<div class="br-btnrow"><button class="ps-btn" id="br-next">Start now</button>'+
 '<button class="ps-btn ghost" id="br-short"></button></div></div>'+

 '<div class="br-screen" id="br-clue"><div class="br-timer" id="br-ct"></div>'+
 '<div class="br-num" id="br-cn"></div>'+
 '<div class="br-lantern" id="br-clant"></div>'+
 '<div class="br-spec" id="br-cspec"></div>'+
 '<div class="br-in" id="br-cin">Listen for one word.</div><div class="br-strip" id="br-strip0"></div></div>'+

 '<div class="br-screen" id="br-guess"><div class="br-timer" id="br-gt"></div>'+
 '<div class="br-num" id="br-gn"></div>'+
 '<div class="br-lantern" id="br-glant"></div>'+
 '<div class="br-spec" id="br-gspec"></div>'+
 '<div class="br-in" id="br-gin"></div><div class="br-strip" id="br-strip1"></div></div>'+

 '<div class="br-screen" id="br-rev"><div class="br-timer" id="br-vt"></div>'+
 '<div class="br-num" id="br-vn"></div>'+
 '<div class="br-spec" id="br-vspec"></div>'+
 '<div class="br-verdict" id="br-vverdict"></div>'+
 '<div class="br-avg" id="br-vavg"></div><div class="br-strip" id="br-strip2"></div></div>'+

 '<div class="br-screen br-podium" id="br-pod"><div class="br-num">Game complete</div>'+
 '<div id="br-podrows" class="br-rows"></div>'+
 '<div class="br-earn">Thanks for playing together.</div>'+
 '<div class="br-btnrow">'+
 '<button class="ps-btn" id="br-again">Play again</button>'+
 '<button class="ps-btn ghost" id="br-other">Another game</button>'+
 '<button class="ps-btn ghost" id="br-end">End night</button></div></div>';

function show(id){ var s=root.querySelectorAll('.br-screen');
  for(var i=0;i<s.length;i++) s[i].classList.remove('on'); $(id).classList.add('on'); }

/* ⭐ BEARING-D04: a pair is a spectrum when a room can place almost anything along it and mostly agree, with a real
   middle. These are categories (two kinds of a thing, with nothing between), matters of taste, or ends that are not
   opposites, so the clue would fight the axis instead of being interpreted. Morning to Night is Astra's named case. */
var QUARANTINE={
  'br-0015':'Morning to Night: two times of day, no shared middle',
  'br-0043':'Winter to Summer: seasons, the middle is two different places',
  'br-0070':'Weekday to Weekend: a category with nothing between',
  'br-0038':'Underrated to Overrated: a matter of taste, not a position',
  'br-0037':'Sour to Creamy: not opposites, many things are both or neither',
  'br-0058':'Salty to Fresh: not opposites',
  'br-0056':'Everyday shoes to Best shoes: two kinds of shoe',
  'br-0051':'Homemade to Shop bought: a category with nothing between',
  'br-0059':'Handmade to Machine made: a category with nothing between'
};
var BANK=(window.BEARING_BANK||[]).filter(function(p){ return !QUARANTINE[p.id]; });
var QS=[], SPARE=[], ri=0;
var scores={}, names={}, order=[], schedule=[], shortGame=false;
var lantern=null, target=50, guesses={}, eligible=[], spoken=false, swapped=false, retried=false, att=0;
var finishing=false, guessStart=0, gLeft=0;
var FAST=/[?&]br_fast=1(&|$)/.test(location.search);
var T_RULES=FAST?3:28, T_CLUE=FAST?3:24, T_GUESS=FAST?4:24, T_REV=FAST?3:10, T_VOID=FAST?2:6, T_FINISH=FAST?1:3, MIN_READ=FAST?1:6;

function award(diff){
  if(diff<=5)  return 150;
  if(diff<=12) return 100;
  if(diff<=20) return 50;
  if(diff<=30) return 20;
  return 0;
}
/* ⭐ BEARING-D02, the rules in one place (and exposed to the fixtures) */
function roundsFor(n,short){ return short?n:2*n; }
function shuffle(a){ a=a.slice(); for(var i=a.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=a[i]; a[i]=a[j]; a[j]=t; } return a; }
/* the Lantern order is shuffled once, then cycled, so every player holds it exactly rounds/n times */
function buildSchedule(ids,short){
  var R=roundsFor(ids.length,short), turnOrder=shuffle(ids), out=[];
  for(var i=0;i<R;i++) out.push(turnOrder[i%turnOrder.length]);
  return out;
}
/* ONE ROUND'S SCORE. Only eligible guessers count; a missing position is missing (0 points, and 0 in the Lantern's
   average, so a Lantern cannot profit from only their best reader answering). Rounded half up. No valid position
   at all pays nobody anything. */
function scoreRound(tgt,gs,elig,lant,ids){
  var res={}, sum=0, valid=0, i;
  for(i=0;i<elig.length;i++){
    var pid=elig[i];
    if(pid===lant) continue;
    if(gs.hasOwnProperty(pid)){
      var diff=Math.abs(gs[pid]-tgt), pts=award(diff);
      res[pid]={got:diff<=5?'bull':(pts>0?'near':'far'),pts:pts,diff:diff,guess:gs[pid]};
      sum+=pts; valid++;
    } else res[pid]={got:'none',pts:0,guess:null};
  }
  for(i=0;i<(ids||[]).length;i++) if(ids[i]!==lant&&!res[ids[i]]) res[ids[i]]={got:'out',pts:0,guess:null};
  var n=0; for(i=0;i<elig.length;i++) if(elig[i]!==lant) n++;
  var avg=(valid&&n)?Math.floor(sum/n+0.5):0;
  res[lant]={got:'lantern',pts:avg,roomAvg:avg,valid:valid,of:n};
  return {res:res,avg:avg,valid:valid,of:n};
}
/* test surface (lower case on purpose: upper case window names are content banks to the static gate) */
window.__bearing={rounds:roundsFor,schedule:buildSchedule,score:scoreRound,award:award,
  quarantined:function(){ return Object.keys(QUARANTINE).filter(function(id){ return BANK.some(function(p){ return p.id===id; }); }); },
  state:function(){ return {ri:ri,total:schedule.length,schedule:schedule.slice(),lantern:lantern,att:att,spoken:spoken,swapped:swapped,retried:retried,
    finishing:finishing,short:shortGame,eligible:eligible.slice(),saved:Object.keys(guesses).length}; }};

function pickPairs(n){
  var used={}; try{used=JSON.parse(localStorage.getItem('br_used')||'{}');}catch(e){}
  var pool=BANK.filter(function(p){return !used[p.id];});
  if(pool.length<n){ used={}; pool=BANK.slice(); }
  var out=[];
  for(var i=0;i<n&&pool.length;i++){
    var k=Math.floor(Math.random()*pool.length);
    var p=pool.splice(k,1)[0]; out.push(p); used[p.id]=1;
  }
  try{localStorage.setItem('br_used',JSON.stringify(used));}catch(e){}
  return out;
}
/* a pair for a swap or a retry: never one already in tonight's list */
function sparePair(){
  if(!SPARE.length) SPARE=pickPairs(order.length+2);
  var inUse={}, i; for(i=0;i<QS.length;i++) if(QS[i]) inUse[QS[i].id]=1;
  while(SPARE.length){ var p=SPARE.shift(); if(!inUse[p.id]) return p; }
  return null;
}
function newTarget(){ return 8+Math.floor(Math.random()*85); }   /* 8 to 92: never in the trivially easy ends */

/* the same order and the same place rule everywhere: equal scores share a place */
function ranked(){
  var ids=order.slice();
  ids.sort(function(a,b){ return (scores[b]||0)-(scores[a]||0) || String(names[a]).localeCompare(String(names[b])); });
  var places={}, last=null, place=0;
  for(var i=0;i<ids.length;i++){ var s=scores[ids[i]]||0; if(s!==last){ place=i+1; last=s; } places[ids[i]]=place; }
  return {ids:ids,places:places};
}
function tag(pid){ return '<i class="br-sym" style="color:'+esc(pcol(pid))+'">'+esc(psym(pid))+'</i>'; }
function strip(which){
  var r=ranked(), rows='';
  for(var i=0;i<r.ids.length;i++) rows+='<span>'+tag(r.ids[i])+esc(names[r.ids[i]])+' <b>'+(scores[r.ids[i]]||0)+'</b></span>';
  var el=$(which); if(el) el.innerHTML=rows;
}

/* the spectrum. The target and its bands are only ever drawn once the round is over. */
function specHTML(q,marks,tgt){
  var html='<div class="br-ends"><span>'+esc(q.a)+'</span><span>'+esc(q.b)+'</span></div>'+
           '<div class="br-track">';
  if(tgt!==null&&tgt!==undefined){
    html+=bandSpan('wide',tgt,30)+bandSpan('mid',tgt,20)+bandSpan('near',tgt,12)+bandSpan('core',tgt,5)+
          '<span class="br-bullseye" style="left:'+tgt+'%"></span>';
  }
  if(marks) for(var m=0;m<marks.length;m++){
    var lift=26+marks[m].row*44;
    html+='<span class="br-stem" style="left:'+marks[m].v+'%;height:'+lift+'px;background:'+esc(marks[m].c)+'"></span>'+
      '<span class="br-mark" style="left:'+marks[m].v+'%;bottom:'+lift+'px;border-color:'+esc(marks[m].c)+'">'+
      '<i class="br-sym" style="color:'+esc(marks[m].c)+'">'+esc(marks[m].s)+'</i>'+esc(marks[m].n)+'</span>';
  }
  return html+'</div><div class="br-scale"><span>0</span><span>50</span><span>100</span></div>'+
    ((tgt!==null&&tgt!==undefined)?'<div class="br-legend">'+LEGEND+'</div>':'');
}
/* a scoring band, kept inside the line (a spot at 80 used to paint its outer band past the 100 end) */
function bandSpan(cls,tgt,w){
  var l=Math.max(0,tgt-w), r=Math.min(100,tgt+w);
  return '<span class="br-band '+cls+'" style="left:'+l+'%;width:'+(r-l)+'%"></span>';
}
var LEGEND='Gold: within 5 scores 150. Then within 12 scores 100, within 20 scores 50, within 30 scores 20.';
function layout(list){
  var sorted=list.slice().sort(function(a,b){return a.v-b.v;});
  var placed=[];
  for(var i=0;i<sorted.length;i++){
    var r=0;
    while(true){
      var clash=false;
      for(var j=0;j<placed.length;j++)
        if(placed[j].row===r && Math.abs(placed[j].v-sorted[i].v)<12){ clash=true; break; }
      if(!clash) break;
      r++;
    }
    sorted[i].row=r; placed.push(sorted[i]);
  }
  return sorted;
}
/* the worked example, the same on the TV and every phone (BEARING-D01) */
function exampleHTML(){
  return '<div class="br-ex-head">Example</div>'+
    '<div class="br-ends"><span>Quiet</span><span>Noisy</span></div>'+
    '<div class="br-track br-ex-track"><span class="br-bullseye" style="left:14%"></span>'+
    '<span class="br-ex-word" style="left:14%">Library</span></div>'+
    '<div class="br-ex-line">The secret spot is near Quiet, so the clue giver says: Library.</div>'+
    '<div class="br-ex-line">Play together in one room. The clue is spoken out loud. If someone cannot hear it, show the word the way your room agrees, on paper or by sign.</div>';
}

function present(){ return PartyShell.presentPlayers(); }
function isHere(pid){ return present().indexOf(pid)>=0; }
/* who may guess this round: in the room when the guessing opens, never the Lantern */
function snapshotEligible(){
  var p=present(), out=[];
  for(var i=0;i<p.length;i++) if(names[p[i]]!==undefined&&p[i]!==lantern) out.push(p[i]);
  return out;
}
function savedCount(){ var n=0; for(var i=0;i<eligible.length;i++) if(guesses.hasOwnProperty(eligible[i])) n++; return n; }
function allIn(){ return eligible.length>0 && savedCount()>=eligible.length; }
function countLine(){ return savedCount()+' of '+eligible.length+' positions saved'; }

/* ⛔ THE TARGET IS THE GAME'S ONE SECRET. setPhase goes to every phone, so it never rides there; it goes to the
   Lantern's phone alone, by name, and is handed back on request so a Lantern whose phone locked can still see what
   they are describing. */
function tellLantern(){
  if(lantern) PartyShell.sendToPlayer(lantern,{t:'target',r:ri+1,att:att,v:target});
}

PartyShell.onPlayerMessage(function(pid,msg){
  if(!msg||names[pid]===undefined) return;
  var inClue=$('br-clue').classList.contains('on'), inGuess=$('br-guess').classList.contains('on');
  if(msg.t==='needtarget'&&pid===lantern&&(inClue||inGuess)){ tellLantern(); return; }
  /* the Lantern says they have given their clue. Nothing typed ever arrives. */
  if(msg.t==='spoken'&&pid===lantern&&inClue&&msg.r===ri+1&&(msg.att===undefined||msg.att===att)){
    spoken=true; PartyShell.stopTimer(); phaseGuess(); return;
  }
  /* D01: one new pair per round, before the clue, no penalty */
  if(msg.t==='newpair'&&pid===lantern&&inClue&&msg.r===ri+1&&!spoken&&!swapped){
    var p=sparePair(); if(!p) return;
    swapped=true; QS[ri]=p; PartyShell.stopTimer(); enterClue(); return;
  }
  /* D03: a position counts only when SAVED; saving again changes it */
  if(msg.t==='point'&&msg.r===ri+1&&pid!==lantern&&inGuess){
    if(eligible.indexOf(pid)<0) return;
    var v=Math.max(0,Math.min(100,Math.round(+msg.v||0)));
    guesses[pid]=v;
    PartyShell.sendToPlayer(pid,{t:'pack',r:ri+1,v:v});
    $('br-gin').textContent=countLine(); snd('pip');
    PartyShell.broadcast({t:'gcount',r:ri+1,n:savedCount(),of:eligible.length});
    maybeFinish();
  }
});

/* SHELL-D04: the editable placing never ends the instant the last position lands. Once every eligible position is
   saved and the room has had a moment, everybody gets a short announced window, still editable, never restarted. */
function maybeFinish(left){
  if(left===undefined) left=gLeft;
  if(finishing||!allIn()) return;
  if((Date.now()-guessStart)/1000<MIN_READ) return;   /* the guess timer's tick looks again */
  if(left<=T_FINISH) return;                          /* the clock is already about to end */
  finishing=true;
  setTimeout(function(){
    if(!$('br-guess').classList.contains('on')) return;
    PartyShell.stopTimer();
    $('br-gin').textContent='All set. Finishing soon.';
    PartyShell.broadcast({t:'allset',r:ri+1});
    PartyShell.startTimer(T_FINISH,function(s){ var t=$('br-gt'); t.textContent=s; t.classList.toggle('low',true); },phaseReveal);
  },0);
}

function startGame(players){
  scores={}; names={}; order=[];
  for(var i=0;i<players.length;i++){ names[players[i].id]=players[i].name; scores[players[i].id]=0; order.push(players[i].id); }
  shortGame=false;
  schedule=buildSchedule(order,shortGame);
  QS=pickPairs(schedule.length); SPARE=pickPairs(order.length+2);
  ri=0; retried=false; phaseRules();
}
function lengthInfo(){
  var R=schedule.length, n=order.length, k=Math.round(R/Math.max(1,n));
  var lo=Math.max(1,Math.round(R*30/60)), hi=Math.max(lo+1,Math.ceil(R*60/60));
  return {total:R,turns:k,lo:lo,hi:hi,short:shortGame};
}
function paintLength(){
  var L=lengthInfo();
  $('br-len').textContent='This game: '+L.total+' rounds. Each of you gives the clue '+(L.turns===1?'once':(L.turns+' times'))+'. About '+L.lo+' to '+L.hi+' minutes.';
  $('br-short').textContent=shortGame?'Standard game':'Short game';
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
  host([{label:'Start now',fn:function(){ PartyShell.stopTimer(); phaseClue(); }},
        {label:shortGame?'Standard game':'Short game',ghost:true,fn:toggleShort}]);
}
function phaseRules(){
  show('br-rules'); paintLength();
  $('br-ex').innerHTML=exampleHTML();
  PartyShell.setPhase('rules',lengthInfo());
  PartyShell.startTimer(T_RULES,function(s){$('br-rt').textContent=s;},phaseClue);
  $('br-next').onclick=function(){ PartyShell.stopTimer(); phaseClue(); };
  $('br-short').onclick=toggleShort;
  rulesActions();
}

/* a new Lantern turn: the next scheduled Lantern who is still here */
function phaseClue(){
  host([]);
  var guard=0;
  while(ri<schedule.length && !isHere(schedule[ri]) && guard++<schedule.length){ ri++; retried=false; }
  if(ri>=schedule.length||!QS[ri]){ phasePodium(); return; }
  lantern=schedule[ri]; swapped=false; att=0;
  enterClue();
}
/* one clue attempt: a fresh spot, nobody's position, a full clock (also after "Need another pair" or a void retry) */
function enterClue(){
  var q=QS[ri];
  att++; target=newTarget(); guesses={}; eligible=[]; spoken=false; finishing=false;
  show('br-clue'); strip('br-strip0');
  $('br-cn').textContent='ROUND '+(ri+1)+' OF '+schedule.length;
  $('br-clant').innerHTML=tag(lantern)+'<b>'+esc(names[lantern])+'</b> can see the secret spot.';
  $('br-cspec').innerHTML=specHTML(q,null,null);
  $('br-cin').textContent=swapped?'A new pair. Listen for one word.':'Listen for one word.';
  /* the spot is NOT in this payload; the Lantern's phone hears it privately */
  PartyShell.setPhase('clue',{num:ri+1,att:att,total:schedule.length,a:q.a,b:q.b,lantern:lantern,lanternName:names[lantern],
    canSwap:!swapped,retry:retried,names:names,cols:cols(),syms:syms(),scores:scores});
  tellLantern();
  PartyShell.startTimer(T_CLUE,function(s){ var t=$('br-ct'); t.textContent=s; t.classList.toggle('low',s<=5); },
    function(){
      /* ⛔ D01: a Lantern who never gave the clue: the round does not count (never a guess at a word nobody said) */
      if(!spoken){ phaseVoid(); return; }
      phaseGuess();
    });
}

/* no clue by the deadline: nobody scores, and that Lantern gets one more go with a different pair */
function phaseVoid(){
  /* a Lantern who has left the room gets no retry: the next Lantern goes instead */
  var q=QS[ri], spare=(!retried&&isHere(lantern))?sparePair():null, willRetry=!!spare;
  show('br-rev'); strip('br-strip2');
  $('br-vn').textContent='ROUND '+(ri+1)+' OF '+schedule.length;
  $('br-vspec').innerHTML=specHTML(q,null,null);
  $('br-vverdict').innerHTML=tag(lantern)+'<b>'+esc(names[lantern])+'</b> did not give a clue.';
  $('br-vavg').textContent=willRetry?'This round does not count. They get another pair.':'This round does not count.';
  var res={}, i;
  for(i=0;i<order.length;i++) res[order[i]]={got:'skipped',pts:0};
  PartyShell.setPhase('reveal',{num:ri+1,att:att,total:schedule.length,a:q.a,b:q.b,lantern:lantern,lanternName:names[lantern],
    skipped:true,retry:willRetry,results:res,names:names,cols:cols(),syms:syms(),scores:scores});
  PartyShell.startTimer(T_VOID,function(s){$('br-vt').textContent=s;},function(){
    if(willRetry){ QS[ri]=spare; retried=true; swapped=false; enterClue(); }
    else { ri++; retried=false; phaseClue(); }
  });
}

function phaseGuess(){
  var q=QS[ri];
  eligible=snapshotEligible(); guesses={}; finishing=false; guessStart=Date.now(); gLeft=T_GUESS;
  show('br-guess'); strip('br-strip1');
  $('br-gn').textContent='ROUND '+(ri+1)+' OF '+schedule.length;
  $('br-glant').innerHTML=tag(lantern)+'<b>'+esc(names[lantern])+'</b> has given the clue.';
  $('br-gspec').innerHTML=specHTML(q,null,null);
  $('br-gin').textContent=countLine();
  PartyShell.setPhase('guess',{num:ri+1,att:att,total:schedule.length,a:q.a,b:q.b,lantern:lantern,lanternName:names[lantern],
    eligible:eligible.length,names:names,cols:cols(),syms:syms(),scores:scores});
  tellLantern();
  PartyShell.startTimer(T_GUESS,function(s){ var t=$('br-gt'); t.textContent=s; t.classList.toggle('low',s<=5); gLeft=s; maybeFinish(s); },phaseReveal);
}

function verdictLine(sc){
  var bulls=[], k;
  for(k in sc.res) if(sc.res[k].got==='bull') bulls.push(names[k]);
  if(bulls.length===1) return esc(bulls[0])+' found the spot.';
  if(bulls.length===2) return esc(bulls[0])+' and '+esc(bulls[1])+' found the spot.';
  if(bulls.length>2) return bulls.length+' people found the spot.';
  if(!sc.valid) return 'Nobody saved a position this round.';
  return sc.avg>=50?'The guesses landed close together.':'The guesses spread out this time.';
}
function phaseReveal(){
  if(!$('br-guess').classList.contains('on')) return;
  var q=QS[ri], sc=scoreRound(target,guesses,eligible,lantern,order), k, marks=[];
  for(k in sc.res) scores[k]=(scores[k]||0)+sc.res[k].pts;
  for(var i=0;i<eligible.length;i++){
    var pid=eligible[i];
    if(guesses.hasOwnProperty(pid)) marks.push({id:pid,v:guesses[pid],n:names[pid],c:pcol(pid),s:psym(pid),row:0,pts:sc.res[pid].pts});
  }
  var lay=layout(marks);
  var avgLine=sc.valid?(', the clue giver, earns the room average: '+sc.avg+'.'):', the clue giver: no positions were saved, so nobody scores this round.';

  show('br-rev');
  snd('reveal', sc.avg>=100);
  $('br-vn').textContent='ROUND '+(ri+1)+' OF '+schedule.length;
  $('br-vspec').innerHTML=specHTML(q,lay,target);
  $('br-vverdict').innerHTML=verdictLine(sc)+' <span class="br-at">The secret spot was '+target+'.</span>';
  $('br-vavg').innerHTML=tag(lantern)+esc(names[lantern])+esc(avgLine);
  strip('br-strip2');

  var mk=[]; for(i=0;i<lay.length;i++) mk.push({id:lay[i].id,v:lay[i].v,n:lay[i].n,c:lay[i].c,s:lay[i].s,pts:lay[i].pts});
  PartyShell.setPhase('reveal',{num:ri+1,att:att,total:schedule.length,a:q.a,b:q.b,lantern:lantern,lanternName:names[lantern],
    target:target,results:sc.res,avg:sc.avg,valid:sc.valid,of:sc.of,marks:mk,verdict:verdictLine(sc),
    names:names,cols:cols(),syms:syms(),scores:scores});
  PartyShell.startTimer(T_REV,function(s){$('br-vt').textContent=s;},function(){ ri++; retried=false; phaseClue(); });
}

function phasePodium(){
  snd('fanfare');
  show('br-pod');
  var r=ranked(), html='', results={};
  for(var i=0;i<r.ids.length;i++){
    var id=r.ids[i];
    html+='<div class="br-row"><span class="place">'+r.places[id]+'</span>'+tag(id)+esc(names[id])+
      '<b>'+(scores[id]||0)+'</b></div>';
    results[id]={score:scores[id]||0,place:r.places[id]};
  }
  $('br-podrows').innerHTML=html;
  PartyShell.setPhase('podium',{scores:scores,names:names,cols:cols(),syms:syms()});
  PartyShell.gameComplete(results);
  $('br-again').onclick=function(){ startGame(PartyShell.players()); };
  $('br-other').onclick=function(){ PartyShell.backToPicker(); };
  $('br-end').onclick=function(){ PartyShell.closeRoom(); };
  host([{label:'Play again',fn:function(){ startGame(PartyShell.players()); }},
        {label:'Another game',ghost:true,fn:function(){ PartyShell.backToPicker(); }},
        {label:'End night',ghost:true,fn:function(){ PartyShell.closeRoom(); }}]);
}

document.addEventListener('party-started',function(ev){ startGame(ev.detail.players); });
})();
