/* WIDE MARGIN, host screen.

   A question with a real percentage answer appears. Everybody sets a dial from 0 to 100 AT THE SAME TIME and saves
   it, then every saved guess lands on one number line and the truth slides in.

   ⭐ WHY SIMULTANEOUS, when the game this borrows from has one person guess while everyone else watches. With eight
   players that original shape means one person plays and seven wait, seven eighths of the round. Here everybody
   acts every round, and the reveal is eight markers scattered across a line, which is both funnier and the best ten
   foot readout in the pack.

   ⛔ Guesses stay private until the reveal, exactly like Firefly Futures. If the markers appeared as they landed the
   room would anchor on the first one and the spread, which IS the show, would collapse.

   ⭐ 18 Oct 2026, Astra's review (party/reviews/WHACKBOX-REVIEW-GPT-2026-10-18.md, WIDEMARGIN-D01 to D04 and the
   copy table B7.4), checked against this file first:
   - D02 WRONG HERE: the copy promised "Being close still pays" and "nobody ever scores zero for a thoughtful guess"
     while award() returned 0 past 30 points away. Now every SAVED guess scores: 150 within 3, 100 within 7, 70
     within 12, 40 within 20, 15 within 30, 5 beyond. EVERY player tied for closest earns 50 extra (the old code
     already shared ties, but only for a guess that scored, so a room that all guessed far away had no closest at
     all); no saved guess, no bonus. The reveal shows the base and the bonus apart.
   - D03 WRONG HERE: every drag and nudge was sent and counted ("so nobody who never presses anything scores zero"),
     so an unsaved dial scored at the buzzer, and only a lock ended the round early. Now a guess counts only once
     SAVED; the dial is a local draft until then (an untouched 50 is not a guess, a 50 saved on purpose is); saving
     again changes it ("Save changes"); a missing guess stays missing (no points, never in the closest). 26 s to
     guess, 10 rounds, 10 s reveals, and the shared finish window: once every eligible guess is saved (and at least
     6 s have passed) the room gets "All set. Finishing soon." for 3 s, still editable, never restarted by an edit.
   - D01 (content.js): the categories migrated to the declared nine, rounding half up (wm-0006 68 became 69), and a
     QUARANTINE of the entries that drift, have no record or carry a brand name; never dealt. The reveal says
     "About {answer}%" unless the answer is exact (WIDEMARGIN_EXACT). The bank has no explanations, so none are
     invented; the source is shown.
   - D04 the deck never deals two entries of one family (the same fact asked twice, or two halves of one fact), at
     most two science questions (gases and chemistry), no other topic more than three times, at least four topics,
     and no two neighbours from the same topic;
     the reveal shows the truth first, then the room's markers slide in, each with its distance, and equal guesses
     stack readably.
   - D05 (a private confidence note) is a P2 experiment and stays off.
   Fixtures: party/test/widemargin_rules.js. */
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

/* "25% means 25 out of 100": the same hundred squares on the TV and every phone (WIDEMARGIN-D03) */
function hundredHTML(cls){
  var h='<div class="'+cls+'" aria-label="25 of 100 squares filled">';
  for(var i=0;i<100;i++) h+='<i'+(i<25?' class="on"':'')+'></i>';
  return h+'</div>';
}

var RULES='Guess a percentage from 0 to 100.\nSet your number and tap Save guess.\nCloser guesses earn more. The closest earn 50 extra.\nEvery saved guess earns at least 5 points.';

var root=$('game-root');
root.innerHTML=
 '<div class="wm-screen" id="wm-rules"><div class="wm-timer" id="wm-rt"></div>'+
 '<div class="wm-rules">'+esc(RULES)+'</div>'+
 '<div class="wm-teach">'+hundredHTML('wm-hundred')+'<div class="wm-teach-t">25% means 25 out of 100.</div></div>'+
 '<div class="wm-length" id="wm-len"></div>'+
 '<button class="ps-btn" id="wm-next">Start now</button></div>'+

 '<div class="wm-screen" id="wm-q"><div class="wm-timer" id="wm-qt"></div>'+
 '<div class="wm-num" id="wm-qn"></div>'+
 '<div class="wm-question" id="wm-qtext"></div>'+
 '<div class="wm-line" id="wm-qline"></div>'+
 '<div class="wm-in" id="wm-qin"></div><div class="wm-strip" id="wm-strip1"></div></div>'+

 '<div class="wm-screen" id="wm-rev"><div class="wm-timer" id="wm-vt"></div>'+
 '<div class="wm-num" id="wm-vn"></div>'+
 '<div class="wm-question small" id="wm-vtext"></div>'+
 '<div class="wm-truth" id="wm-vtruth"></div>'+
 '<div class="wm-src" id="wm-vsrc"></div>'+
 '<div class="wm-line" id="wm-vline"></div>'+
 '<div class="wm-dists" id="wm-vdist"></div><div class="wm-strip" id="wm-strip2"></div></div>'+

 '<div class="wm-screen" id="wm-stand"><div class="wm-num" id="wm-standn">Scores so far</div>'+
 '<div id="wm-standrows" class="wm-rows"></div></div>'+

 '<div class="wm-screen wm-podium" id="wm-pod"><div class="wm-num">Game complete</div>'+
 '<div id="wm-podrows" class="wm-rows"></div>'+
 '<div class="wm-earn">Thanks for playing together.</div>'+
 '<div class="wm-btnrow">'+
 '<button class="ps-btn" id="wm-again">Play again</button>'+
 '<button class="ps-btn ghost" id="wm-other">Another game</button>'+
 '<button class="ps-btn ghost" id="wm-end">End night</button></div></div>';

function show(id){ var s=root.querySelectorAll('.wm-screen');
  for(var i=0;i<s.length;i++) s[i].classList.remove('on'); $(id).classList.add('on'); }

var QUARANTINE=window.WIDEMARGIN_QUARANTINE||{}, FAMILY=window.WIDEMARGIN_FAMILY||{}, EXACT=window.WIDEMARGIN_EXACT||{};
var BANK=(window.WIDEMARGIN_BANK||[]).filter(function(q){ return !QUARANTINE[q.id]; });
var QS=[], ri=0, ROUNDS=10, STAND_AFTER=5;
var scores={}, names={}, order=[], guesses={}, eligible=[];
var finishing=false, qStart=0, qLeft=0;
var FAST=/[?&]wm_fast=1(&|$)/.test(location.search);
var T_RULES=FAST?3:24, T_Q=FAST?4:26, T_REV=FAST?3:10, T_STAND=FAST?2:8, T_FINISH=FAST?1:3, MIN_READ=FAST?1:6;

/* ⭐ WIDEMARGIN-D02: every SAVED guess earns something, at every distance from 0 to 100. Distance is absolute
   percentage points against the stored whole number answer. */
function award(diff){
  if(diff<=3)  return 150;
  if(diff<=7)  return 100;
  if(diff<=12) return 70;
  if(diff<=20) return 40;
  if(diff<=30) return 15;
  return 5;
}
var CLOSEST_BONUS=50;
/* ONE ROUND'S SCORE, in one place (and exposed to the fixtures). Only eligible players count. A missing guess is
   missing: no points, and never part of the closest. Every player tied for closest gets the bonus. */
function scoreRound(answer,gs,elig,ids){
  var res={}, best=null, i, pid;
  for(i=0;i<elig.length;i++){ pid=elig[i];
    if(gs.hasOwnProperty(pid)){ var d0=Math.abs(gs[pid]-answer); if(best===null||d0<best) best=d0; } }
  for(i=0;i<elig.length;i++){ pid=elig[i];
    if(!gs.hasOwnProperty(pid)){ res[pid]={got:'none',pts:0,base:0,bonus:0,guess:null}; continue; }
    var diff=Math.abs(gs[pid]-answer), base=award(diff), closest=(diff===best), bonus=closest?CLOSEST_BONUS:0;
    res[pid]={got:diff<=3?'bull':(diff<=30?'near':'far'),pts:base+bonus,base:base,bonus:bonus,diff:diff,guess:gs[pid],closest:closest};
  }
  for(i=0;i<(ids||[]).length;i++) if(!res[ids[i]]) res[ids[i]]={got:'out',pts:0,base:0,bonus:0,guess:null};
  return {res:res,best:best};
}

/* ⭐ WIDEMARGIN-D04: a deck of ten where one answer never teaches the next. At most one entry per family, at most
   two science questions (the gases and the chemistry), no topic more than three times, at least four topics, and no
   two neighbours from the same topic, whenever the pool allows. Entries seen recently on this host are skipped until the pool runs dry. */
var SCIENCE_CAP=2, TOPIC_CAP=3, MIN_TOPICS=4;
function shuffle(a){ a=a.slice(); for(var i=a.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=a[i]; a[i]=a[j]; a[j]=t; } return a; }
function buildDeck(pool,n){
  var best=null;
  for(var attempt=0;attempt<60;attempt++){
    var fams={}, per={}, deck=[], s=shuffle(pool);
    for(var i=0;i<s.length&&deck.length<n;i++){
      var q=s[i], f=FAMILY[q.id], c=q.category;
      if(f&&fams[f]) continue;
      /* no topic more than three times (science, the gases and the chemistry, at most twice) */
      if((per[c]||0)>=(c==='science'?SCIENCE_CAP:TOPIC_CAP)) continue;
      deck.push(q); if(f) fams[f]=1; per[c]=(per[c]||0)+1;
    }
    var topics={}; for(var k=0;k<deck.length;k++) topics[deck[k].category]=1;
    var nt=Object.keys(topics).length;
    if(!best||deck.length>best.deck.length||(deck.length===best.deck.length&&nt>best.nt)) best={deck:deck,nt:nt};
    if(deck.length>=n&&nt>=MIN_TOPICS) break;
  }
  return spread(best.deck);
}
/* order the deck so neighbours differ in topic: always take from the topic with the most left that is not the one
   just played (a first come order cornered itself, 50 neighbouring pairs in 300 decks; with no topic over three of
   ten this way never has to repeat) */
function spread(deck){
  var by={}, k, out=[], prev=null;
  for(var i=0;i<deck.length;i++){ (by[deck[i].category]=by[deck[i].category]||[]).push(deck[i]); }
  while(out.length<deck.length){
    var pick=null;
    for(k in by) if(by[k].length&&k!==prev&&(!pick||by[k].length>by[pick].length)) pick=k;
    if(!pick) for(k in by) if(by[k].length){ pick=k; break; }
    out.push(by[pick].shift()); prev=pick;
  }
  return out;
}
function pickQuestions(){
  var used={}; try{used=JSON.parse(localStorage.getItem('wm_used')||'{}');}catch(e){}
  var pool=BANK.filter(function(q){return !used[q.id];});
  QS=buildDeck(pool,ROUNDS);
  if(QS.length<ROUNDS){ used={}; QS=buildDeck(BANK,ROUNDS); }
  for(var i=0;i<QS.length;i++) used[QS[i].id]=1;
  try{localStorage.setItem('wm_used',JSON.stringify(used));}catch(e){}
}
function truthText(q){ return (EXACT[q.id]?'':'About ')+q.answer+'%'; }

/* test surface (lower case on purpose: upper case window names are content banks to the static gate) */
window.__widemargin={award:award,score:scoreRound,deck:function(n){ return buildDeck(BANK,n||ROUNDS); },
  live:function(){ return BANK.map(function(q){ return q.id; }); },
  quarantined:function(){ return Object.keys(QUARANTINE).filter(function(id){ return BANK.some(function(q){ return q.id===id; }); }); },
  family:function(id){ return FAMILY[id]||null; },
  state:function(){ return {ri:ri,total:ROUNDS,deck:QS.map(function(q){ return q.id; }),eligible:eligible.slice(),
    saved:Object.keys(guesses).length,finishing:finishing}; }};

/* the same order and the same place rule everywhere: equal scores share a place */
function ranked(){
  var ids=order.slice();
  ids.sort(function(a,b){ return (scores[b]||0)-(scores[a]||0) || String(names[a]).localeCompare(String(names[b])); });
  var places={}, last=null, place=0;
  for(var i=0;i<ids.length;i++){ var s=scores[ids[i]]||0; if(s!==last){ place=i+1; last=s; } places[ids[i]]=place; }
  return {ids:ids,places:places};
}
function tag(pid){ return '<i class="wm-sym" style="color:'+esc(pcol(pid))+'">'+esc(psym(pid))+'</i>'; }
function strip(which){
  var r=ranked(), rows='';
  for(var i=0;i<r.ids.length;i++) rows+='<span>'+tag(r.ids[i])+esc(names[r.ids[i]])+' <b>'+(scores[r.ids[i]]||0)+'</b></span>';
  var el=$(which); if(el) el.innerHTML=rows;
}

/* THE NUMBER LINE. Ticks always; markers only once it is safe to show them.

   ⛔ THE FIRST VERSION LOOKED FINE IN CODE AND WAS UNREADABLE ON SCREEN. Markers were stacked 34px apart while a
   marker is nearly a hundred pixels tall, so four guesses near the same number rendered as one pile of overlapping
   pills with the names printed through each other. So: a marker is ONE compact chip carrying its symbol, name and
   number on a single line, each chip gets its own stem from the axis to wherever it ended up, and the stack step
   shrinks to fit the line's height (eight identical guesses stay readable on a 720p screen, D04). */
function lineHTML(marks,q){
  var rows=0, r, m;
  if(marks) for(r=0;r<marks.length;r++) rows=Math.max(rows,marks[r].row+1);
  /* the reveal also carries the distance list under the line, so a short screen gets a shorter line (at 720p the
     source used to sit behind the score strip); a deep stack (eight equal guesses) gets compact chips and the
     height it needs, so every name stays readable (seen 18 Oct: eight chips at 50 overlapping at 720p) */
  var tight=rows>=4, chip=tight?30:40;
  var H=Math.round(window.innerHeight*(marks?0.27:0.34));
  if(marks) H=Math.max(H,24+rows*chip);
  H=Math.max(140,Math.min(400,Math.round(window.innerHeight*0.44),H));
  var html='<div class="wm-track'+(tight?' tight':'')+'" style="height:'+H+'px">';
  var ticks=[0,25,50,75,100];
  for(var t=0;t<ticks.length;t++)
    html+='<span class="wm-tick" style="left:'+ticks[t]+'%"><i></i><b>'+ticks[t]+'</b></span>';
  /* the truth is the gold line; its number is the big one above (a label here ran into the source line) */
  if(q) html+='<span class="wm-truthmark" style="left:'+q.answer+'%"><i style="height:'+(H-8)+'px"></i></span>';
  if(marks&&marks.length){
    var step=Math.max(16,Math.min(chip,Math.floor((H-24)/Math.max(1,rows))));
    for(m=0;m<marks.length;m++){
      var lift=14+marks[m].row*step;
      html+='<span class="wm-stem" style="left:'+marks[m].v+'%;height:'+lift+'px;background:'+esc(marks[m].c)+';animation-delay:'+(0.5+m*0.08)+'s"></span>'+
        '<span class="wm-mark" style="left:'+marks[m].v+'%;bottom:'+lift+'px;border-color:'+esc(marks[m].c)+';animation-delay:'+(0.5+m*0.08)+'s">'+
        '<i class="wm-sym" style="color:'+esc(marks[m].c)+'">'+esc(marks[m].s)+'</i>'+esc(marks[m].n)+'<b>'+marks[m].v+'</b></span>';
    }
  }
  return html+'</div>';
}
function layout(list){
  /* one row per marker, so guesses that land near each other stagger upwards instead of hiding one another. At ten
     feet a hidden marker reads as a player who never guessed at all. */
  var sorted=list.slice().sort(function(a,b){return a.v-b.v;});
  var placed=[];
  for(var i=0;i<sorted.length;i++){
    var r=0;
    while(true){
      var clash=false;
      for(var j=0;j<placed.length;j++)
        if(placed[j].row===r && Math.abs(placed[j].v-sorted[i].v)<16){ clash=true; break; }
      if(!clash) break;
      r++;
    }
    sorted[i].row=r; placed.push(sorted[i]);
  }
  return sorted;
}

function present(){ return PartyShell.presentPlayers(); }
/* who may guess this round: in the room when the question opens */
function snapshotEligible(){
  var p=present(), out=[];
  for(var i=0;i<p.length;i++) if(names[p[i]]!==undefined) out.push(p[i]);
  return out;
}
function savedCount(){ var n=0; for(var i=0;i<eligible.length;i++) if(guesses.hasOwnProperty(eligible[i])) n++; return n; }
function allIn(){ return eligible.length>0 && savedCount()>=eligible.length; }
function countLine(){ return savedCount()+' of '+eligible.length+' guesses saved'; }

PartyShell.onPlayerMessage(function(pid,msg){
  if(!msg||names[pid]===undefined) return;
  /* D03: a guess counts only when SAVED; saving again changes it. Drafts never leave the phone. */
  if(msg.t==='save'&&msg.r===ri+1&&$('wm-q').classList.contains('on')){
    if(eligible.indexOf(pid)<0) return;
    var v=Math.max(0,Math.min(100,Math.round(+msg.v||0)));
    guesses[pid]=v;
    PartyShell.sendToPlayer(pid,{t:'gack',r:ri+1,v:v});
    $('wm-qin').textContent=countLine(); snd('pip');
    PartyShell.broadcast({t:'gcount',r:ri+1,n:savedCount(),of:eligible.length});
    maybeFinish();
  }
});

/* SHELL-D04: the editable guessing never ends the instant the last guess lands. Once every eligible guess is saved
   and the room has had a moment, everybody gets a short announced window, still editable, never restarted. */
function maybeFinish(left){
  if(left===undefined) left=qLeft;
  if(finishing||!allIn()) return;
  if((Date.now()-qStart)/1000<MIN_READ) return;   /* the question timer's tick looks again */
  if(left<=T_FINISH) return;                      /* the clock is already about to end */
  finishing=true;
  setTimeout(function(){
    if(!$('wm-q').classList.contains('on')) return;
    PartyShell.stopTimer();
    $('wm-qin').textContent='All set. Finishing soon.';
    PartyShell.broadcast({t:'allset',r:ri+1});
    PartyShell.startTimer(T_FINISH,function(s){ var t=$('wm-qt'); t.textContent=s; t.classList.toggle('low',true); },phaseReveal);
  },0);
}

function startGame(players){
  scores={}; names={}; order=[];
  for(var i=0;i<players.length;i++){ names[players[i].id]=players[i].name; scores[players[i].id]=0; order.push(players[i].id); }
  pickQuestions(); ri=0; phaseRules();
}
function lengthInfo(){
  var lo=Math.max(1,Math.round(ROUNDS*22/60)), hi=Math.ceil((T_RULES+ROUNDS*(T_Q+T_REV)+T_STAND)/60);
  return {total:ROUNDS,lo:lo,hi:Math.max(lo+1,hi)};
}
function phaseRules(){
  show('wm-rules');
  var L=lengthInfo();
  $('wm-len').textContent='This game: '+L.total+' questions. About '+L.lo+' to '+L.hi+' minutes.';
  PartyShell.setPhase('rules',L);
  PartyShell.startTimer(T_RULES,function(s){$('wm-rt').textContent=s;},phaseQuestion);
  $('wm-next').onclick=function(){ PartyShell.stopTimer(); phaseQuestion(); };
  host([{label:'Start now',fn:function(){ PartyShell.stopTimer(); phaseQuestion(); }}]);
}

function phaseQuestion(){
  host([]);
  var q=QS[ri]; if(!q||ri>=ROUNDS){ phasePodium(); return; }
  eligible=snapshotEligible(); guesses={}; finishing=false; qStart=Date.now(); qLeft=T_Q;
  show('wm-q'); strip('wm-strip1');
  $('wm-qn').textContent='ROUND '+(ri+1)+' OF '+ROUNDS;
  $('wm-qtext').textContent=q.q;
  $('wm-qline').innerHTML=lineHTML(null,null);
  $('wm-qin').textContent=countLine();
  /* the answer is NOT in this payload; nobody's guess is either, only the count */
  PartyShell.setPhase('question',{num:ri+1,total:ROUNDS,q:q.q,eligible:eligible.length,
    names:names,cols:cols(),syms:syms(),scores:scores});
  PartyShell.startTimer(T_Q,function(s){ var t=$('wm-qt'); t.textContent=s; t.classList.toggle('low',s<=5); qLeft=s; maybeFinish(s); },phaseReveal);
}

function phaseReveal(){
  if(!$('wm-q').classList.contains('on')) return;
  var q=QS[ri], sc=scoreRound(q.answer,guesses,eligible,order), k, marks=[], i;
  for(k in sc.res) scores[k]=(scores[k]||0)+sc.res[k].pts;
  for(i=0;i<eligible.length;i++){
    var pid=eligible[i], x=sc.res[pid];
    if(x&&x.guess!==null) marks.push({id:pid,v:x.guess,n:names[pid],c:pcol(pid),s:psym(pid),row:0,
      diff:x.diff,base:x.base,bonus:x.bonus,pts:x.pts});
  }
  var lay=layout(marks);

  show('wm-rev');
  snd('reveal', sc.best!==null&&sc.best<=12);
  $('wm-vn').textContent='ROUND '+(ri+1)+' OF '+ROUNDS;
  $('wm-vtext').textContent=q.q;
  $('wm-vtruth').innerHTML='<span>'+esc(truthText(q))+'</span>';
  $('wm-vline').innerHTML=lineHTML(lay,q);
  /* every saved guess with its distance, closest first; the bonus apart from the base */
  var byDist=marks.slice().sort(function(a,b){ return a.diff-b.diff || String(a.n).localeCompare(String(b.n)); }), d='';
  for(i=0;i<byDist.length;i++)
    d+='<span>'+tag(byDist[i].id)+esc(byDist[i].n)+' <em>'+byDist[i].diff+' away</em> <b>+'+byDist[i].base+
      (byDist[i].bonus?' +'+byDist[i].bonus:'')+'</b></span>';
  if(!byDist.length) d='<span>No guesses were saved this round.</span>';
  $('wm-vdist').innerHTML=d;
  $('wm-vsrc').textContent='Source: '+q.source;
  strip('wm-strip2');

  var mk=[]; for(i=0;i<lay.length;i++) mk.push({id:lay[i].id,v:lay[i].v,n:lay[i].n,c:lay[i].c,s:lay[i].s,diff:lay[i].diff,base:lay[i].base,bonus:lay[i].bonus,pts:lay[i].pts});
  PartyShell.setPhase('reveal',{num:ri+1,total:ROUNDS,answer:q.answer,exact:!!EXACT[q.id],truth:truthText(q),q:q.q,source:q.source,
    results:sc.res,best:sc.best,marks:mk,names:names,cols:cols(),syms:syms(),scores:scores});
  PartyShell.startTimer(T_REV,function(s){$('wm-vt').textContent=s;},function(){
    ri++;
    if(ri>=ROUNDS) phasePodium();
    else if(ri===STAND_AFTER) phaseStandings();
    else phaseQuestion();
  });
}

function rows(target){
  var r=ranked(), html='';
  for(var i=0;i<r.ids.length;i++){
    var id=r.ids[i];
    html+='<div class="wm-row"><span class="place">'+r.places[id]+'</span>'+tag(id)+esc(names[id])+
      '<b>'+(scores[id]||0)+'</b></div>';
  }
  $(target).innerHTML=html;
  return r;
}

function phaseStandings(){
  show('wm-stand');
  $('wm-standn').textContent='Scores so far, after round '+ri+' of '+ROUNDS;
  rows('wm-standrows');
  PartyShell.setPhase('standings',{after:ri,total:ROUNDS,scores:scores,names:names,cols:cols(),syms:syms()});
  PartyShell.startTimer(T_STAND,null,phaseQuestion);
}

function phasePodium(){
  snd('fanfare');
  show('wm-pod');
  var r=rows('wm-podrows'), results={};
  for(var i=0;i<r.ids.length;i++) results[r.ids[i]]={score:scores[r.ids[i]]||0,place:r.places[r.ids[i]]};
  PartyShell.setPhase('podium',{scores:scores,names:names,cols:cols(),syms:syms()});
  PartyShell.gameComplete(results);
  $('wm-again').onclick=function(){ startGame(PartyShell.players()); };
  $('wm-other').onclick=function(){ PartyShell.backToPicker(); };
  $('wm-end').onclick=function(){ PartyShell.closeRoom(); };
  host([{label:'Play again',fn:function(){ startGame(PartyShell.players()); }},
        {label:'Another game',ghost:true,fn:function(){ PartyShell.backToPicker(); }},
        {label:'End night',ghost:true,fn:function(){ PartyShell.closeRoom(); }}]);
}

document.addEventListener('party-started',function(ev){ startGame(ev.detail.players); });
})();
