/* LIFTING FOG, host screen.

   Eight questions. Four clues lift one at a time and the answer is worth less every time one does: 100, 75, 50, 25.

   ⭐ THE DECISION THAT MAKES IT A GAME: you get ONE answer. A wrong answer scores nothing and ends your question.
   Without that cost, answering at clue 1 would be free and the whole wait or risk shape would collapse into tapping.

   ⭐ The room sees WHO has saved a final answer, never what, and never whether it was right, so an early flurry is
   pressure without being information. Correctness opens for everybody at the common reveal.

   ⭐ 18 Oct 2026, Astra's review (party/reviews/WHACKBOX-REVIEW-GPT-2026-10-18.md, LIFTINGFOG-D01 to D04, the copy
   table B3.4, the no big screen version B3.5), checked against this file first:
   - D01 SELECTION APART FROM SUBMISSION. Before: the first tap on an option WAS the answer, irreversible, before a
     player knew it ("one answer only" was only a line of text). Now a tap selects (on the phone only, nothing is
     sent), and one fixed "Answer now for {points}" button commits it once. This host assigns the points of the tier
     at which it ACCEPTS the answer (never a number the phone declares), returns that tier in a private
     acknowledgement, and a second commit for the same question can never replace the first (it is answered with
     the stored tier). Already right before: the option order never changed between tiers, and the host ignored a
     second answer (silently, then with a 'locked' reply).
   - D02 READING TIME. Before: 24 s, a clue every 6 s. Now four 8 second tiers (32 s), and "More reading time" (a
     host choice on the rules screen, kept for the night) makes each tier 12 s. 9 s reveal, eight questions, scores
     after four. A question ends early only when every eligible player still here has saved a final answer
     (irreversible, so no "All set" window is needed: SHELL-D04 allows it for this game).
   - D03 THE CLUE LADDER. LIFTINGFOG_QUARANTINE (content.js) keeps twelve entries out of the deck, each with its
     reason: Astra's three (lf-0012 owl, lf-0056 vanilla, lf-0100 vacuum flask) and nine more found by reading every
     ladder with the same eye. Astra's 30 candidates are parked NOT LIVE in candidates.review.js.
   - D04 THE REVEAL. The answer, all four clues with what each was worth, and every player's accepted clue and
     points (or what they chose, or no answer). Correctness is checked against the stored option text, never a
     position on a screen.
   - D05 (a private second thought after answering) is a P2 experiment and stays off.
   PRIVACY (reported): no phase payload carries a clue before its tier or which option is correct; the reveal is the
   first payload that names the answer. Data level, not fixed: a phone's final answer reaches this host as an intent
   on the room's channel, which other phones receive and drop; no screen shows it.
   Fixtures: party/test/liftingfog_rules.js. No TV: party/test/notv_liftingfog.js. */
(function(){
'use strict';
function $(id){return document.getElementById(id);}
function esc(s){ return String(s).replace(/[<>&"]/g,function(c){return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c];}); }

var RULES=['Four clues describe one thing.','Earlier answers earn more points.',
  'Each new clue lowers the points: 100, 75, 50, then 25.','Choose an option, then tap Answer now. You get one answer.'];
var EXAMPLE='Example: "I live in the sea" could be Octopus or Lobster, so you might wait. "I have eight arms" leaves only Octopus.';

var root=$('game-root');
root.innerHTML=
 '<div class="lf-screen" id="lf-rules"><div class="lf-timer" id="lf-rt"></div>'+
 '<div class="lf-rules">'+RULES.join('\n')+'</div>'+
 '<div class="lf-rules-small">'+esc(EXAMPLE)+'</div>'+
 '<div class="lf-rules-small quiet" id="lf-pace"></div>'+
 '<div class="lf-btnrow"><button class="ps-btn" id="lf-next">Start now</button>'+
 '<button class="ps-btn ghost" id="lf-slow"></button></div></div>'+

 '<div class="lf-screen" id="lf-q"><div class="lf-top">'+
 '<div class="lf-num" id="lf-qn"></div><div class="lf-worth" id="lf-worth"></div>'+
 '<div class="lf-timer" id="lf-qt"></div></div>'+
 '<div class="lf-nextclue" id="lf-nextc"></div>'+
 '<div class="lf-clues" id="lf-clues"></div>'+
 '<div class="lf-opts" id="lf-qopts"></div>'+
 '<div class="lf-fog" id="lf-fog"></div>'+
 '<div class="lf-in" id="lf-qin"></div><div class="lf-who" id="lf-qwho"></div>'+
 '<div class="lf-strip" id="lf-strip1"></div></div>'+

 '<div class="lf-screen" id="lf-rev"><div class="lf-timer" id="lf-vt"></div>'+
 '<div class="lf-num" id="lf-vn"></div>'+
 '<div class="lf-was" id="lf-vwas">It was</div><div class="lf-answer" id="lf-vans"></div>'+
 '<div class="lf-ladder" id="lf-vladder"></div>'+
 '<div class="lf-scored" id="lf-vscored"></div><div class="lf-strip" id="lf-strip2"></div></div>'+

 '<div class="lf-screen" id="lf-stand"><div class="lf-num">Scores so far</div>'+
 '<div class="lf-after" id="lf-standafter"></div>'+
 '<div id="lf-standrows" class="lf-rows"></div></div>'+

 '<div class="lf-screen lf-podium" id="lf-pod"><div class="lf-num">Game complete</div>'+
 '<div id="lf-podrows" class="lf-rows"></div>'+
 '<div class="lf-earn">Thanks for playing together.</div>'+
 '<div class="lf-btnrow">'+
 '<button class="ps-btn" id="lf-again">Play again</button>'+
 '<button class="ps-btn ghost" id="lf-other">Another game</button>'+
 '<button class="ps-btn ghost" id="lf-end">End night</button></div></div>';

function show(id){ var s=root.querySelectorAll('.lf-screen');
  for(var i=0;i<s.length;i++) s[i].classList.remove('on'); $(id).classList.add('on'); }
function onScreen(id){ var e=$(id); return !!(e&&e.classList.contains('on')); }

function snd(m,a){ try{ if(window.PartySound) PartySound[m](a); }catch(e){} }
function pcol(pid){ try{ return PartyShell.colorFor(pid); }catch(e){ return '#e8dcc8'; } }
function psym(pid){ try{ return PartyShell.symbolFor?PartyShell.symbolFor(pid):'●'; }catch(e){ return '●'; } }
function cols(){ var o={},k; for(k in names) o[k]=pcol(k); return o; }
function syms(){ var o={},k; for(k in names) o[k]=psym(k); return o; }
function host(list){ try{ if(PartyShell.hostActions) PartyShell.hostActions(list); }catch(e){} }

var QUARANTINE=window.LIFTINGFOG_QUARANTINE||{};
var BANK=(window.LIFTINGFOG_BANK||[]).filter(function(q){ return !QUARANTINE[q.id]; });
var QS=[], qi=0, ROUNDS=8;
var scores={}, names={}, answers={}, order=[], shuffled=[], curTier=0, elig=[];
var PTS=[100,75,50,25];
var RM=false; try{RM=matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(e){}
var FAST=/[?&]lf_fast=1(&|$)/.test(location.search);
var T_RULES=FAST?3:20, T_REV=FAST?2:9, T_STAND=FAST?2:8;
/* D02: four tiers. "More reading time" is the host's choice for the night (kept through Play again). */
var slow=false;
function tierLen(){ return FAST?(slow?3:2):(slow?12:8); }
function qLen(){ return tierLen()*4; }
/* which clue is showing with s seconds left on a question of len seconds */
function tierAt(s,len,step){ var t=Math.floor((len-s)/step); return t<0?0:t>3?3:t; }

/* ⭐ D04 + the copy table, one round's results. ans: pid -> {pick, tier}. correct: the stored option text. A missing
   answer is missing ('none', no points); a wrong one names what was chosen. */
function scoreRound(ans,correct,ids){
  var res={}, found=0;
  for(var i=0;i<ids.length;i++){
    var pid=ids[i];
    if(ans.hasOwnProperty(pid)){
      var a=ans[pid];
      if(a.pick===correct){ res[pid]={got:'right',pts:PTS[a.tier],tier:a.tier+1,pick:a.pick}; found++; }
      else res[pid]={got:'wrong',pts:0,tier:a.tier+1,pick:a.pick};
    } else res[pid]={got:'none',pts:0,tier:null,pick:null};
  }
  return {res:res,found:found};
}
/* test surface (lower case on purpose: upper case window names are content banks to the static gate) */
window.__liftingfog={score:scoreRound,points:PTS.slice(),tierAt:tierAt,
  quarantined:function(){ return Object.keys(QUARANTINE).filter(function(id){ return BANK.some(function(q){ return q.id===id; }); }); },
  quarantine:function(){ return Object.keys(QUARANTINE); },
  dealt:function(){ return QS.map(function(q){ return q.id; }); },
  state:function(){ return {qi:qi,total:ROUNDS,tier:curTier,step:tierLen(),len:qLen(),slow:slow,
    answer:QS[qi]?QS[qi].options[0]:'',clues:QS[qi]?QS[qi].clues.slice():[]}; },
  setSlow:function(v){ slow=!!v; paintPace(); }};

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

/* the same order and the same place rule everywhere: equal scores share a place */
function ranked(){
  var ids=order.slice();
  ids.sort(function(a,b){ return (scores[b]||0)-(scores[a]||0) || String(names[a]).localeCompare(String(names[b])); });
  var places={}, last=null, place=0;
  for(var i=0;i<ids.length;i++){ var s=scores[ids[i]]||0; if(s!==last){ place=i+1; last=s; } places[ids[i]]=place; }
  return {ids:ids,places:places};
}
function tag(pid){ return '<i class="lf-sym" style="color:'+esc(pcol(pid))+'">'+esc(psym(pid))+'</i>'; }
function strip(which){
  var r=ranked(), rows='';
  for(var i=0;i<r.ids.length;i++) rows+='<span>'+tag(r.ids[i])+esc(names[r.ids[i]])+' <b>'+(scores[r.ids[i]]||0)+'</b></span>';
  var el=$(which); if(el) el.innerHTML=rows;
}

function renderClues(tier){
  var q=QS[qi], html='';
  for(var i=0;i<=tier&&i<4;i++)
    html+='<div class="lf-clue'+(i===tier?' fresh':'')+'"><span class="lf-cn">'+(i+1)+'</span>'+esc(q.clues[i])+'</div>';
  $('lf-clues').innerHTML=html;
  $('lf-fog').className='lf-fog tier'+tier+(RM?' still':'');
  $('lf-worth').textContent=PTS[tier]+' POINTS';
}
function nextIn(s){ return s-(qLen()-(curTier+1)*tierLen()); }
function paintNext(s){
  $('lf-nextc').textContent=curTier<3?('Next clue in '+Math.max(0,nextIn(s))):'Last clue';
}

/* who may answer this question: in the game and here when it opened (a late arrival plays the next game) */
function snapshot(){ var p=PartyShell.presentPlayers(), out=[]; for(var i=0;i<p.length;i++) if(names[p[i]]!==undefined) out.push(p[i]); return out; }
function savedIds(){ var a=answers[qi]||{}, out=[]; for(var i=0;i<elig.length;i++) if(a.hasOwnProperty(elig[i])) out.push(elig[i]); return out; }
function savedLine(){ return savedIds().length+' of '+elig.length+' final answers saved'; }
/* ⭐ WAIT FOR THE ROOM, NOT FOR A ROSTER. The question ends early when every eligible player STILL HERE has
   answered: one person walking out with their phone must not make the room sit out every remaining clue. */
function allIn(){
  var p=PartyShell.presentPlayers(), a=answers[qi]||{}, here=0;
  for(var i=0;i<elig.length;i++) if(p.indexOf(elig[i])>=0){ here++; if(!a.hasOwnProperty(elig[i])) return false; }
  return here>0;
}
function paintWho(){
  $('lf-qin').textContent=savedLine();
  var ids=savedIds(), html='';
  for(var i=0;i<ids.length;i++) html+='<span class="lf-whochip">'+tag(ids[i])+esc(names[ids[i]])+'</span>';
  $('lf-qwho').innerHTML=html;
}
function questionData(){
  var q=QS[qi];
  return {num:qi+1,total:ROUNDS,options:shuffled[qi],clues:q.clues.slice(0,curTier+1),tier:curTier,
    worth:PTS[curTier],step:tierLen(),len:qLen(),eligible:elig.length,saved:savedIds(),
    names:names,cols:cols(),syms:syms(),scores:scores};
}

function ack(pid){
  var a=(answers[qi]||{})[pid]; if(!a) return;
  PartyShell.sendToPlayer(pid,{t:'fin',q:qi+1,tier:a.tier+1,pts:PTS[a.tier],o:a.pick});
}

PartyShell.onPlayerMessage(function(pid,msg){
  if(!msg||names[pid]===undefined||msg.q!==qi+1) return;
  if(!onScreen('lf-q')) return;
  answers[qi]=answers[qi]||{};
  if(msg.t==='mine?'){ if(answers[qi].hasOwnProperty(pid)) ack(pid); return; }
  if(msg.t!=='final') return;
  if(elig.indexOf(pid)<0) return;
  /* ⛔ ONE ANSWER ONLY, EVER, and TELL THE PHONE SO. A phone that reloaded or retried gets back the answer this host
     already holds, at the tier it was accepted; it can never replace it. */
  if(answers[qi].hasOwnProperty(pid)){ ack(pid); return; }
  var opts=shuffled[qi], idx=msg.v|0, pick=opts[idx];
  /* correctness is the stored option text, never a position: a phone showing a stale list is checked by text */
  if(typeof msg.o==='string'&&msg.o!==pick){ idx=opts.indexOf(msg.o); pick=opts[idx]; }
  if(idx<0||idx>3||pick===undefined) return;
  /* D01: the points are the tier at which THIS host accepts the answer */
  answers[qi][pid]={pick:pick,tier:curTier};
  ack(pid);
  paintWho(); snd('pip');
  PartyShell.broadcast({t:'saved',q:qi+1,ids:savedIds(),of:elig.length});
  if(allIn()){ PartyShell.stopTimer(); phaseReveal(); }
});

function startGame(players){
  scores={}; names={}; answers={}; order=[];
  for(var i=0;i<players.length;i++){
    names[players[i].id]=players[i].name; scores[players[i].id]=0; order.push(players[i].id);
  }
  pickQuestions(); qi=0; phaseRules();
}

function paintPace(){
  $('lf-pace').textContent=slow?'More reading time is on: each clue stays for '+tierLen()+' seconds.':'Each clue stays for '+tierLen()+' seconds.';
  $('lf-slow').textContent=slow?'Standard reading time':'More reading time';
}
function toggleSlow(){
  slow=!slow; paintPace();
  PartyShell.setPhase('rules',{total:ROUNDS,step:tierLen(),slow:slow});
  rulesActions();
}
function rulesActions(){
  host([{label:'Start now',fn:function(){ PartyShell.stopTimer(); phaseQuestion(); }},
        {label:slow?'Standard reading time':'More reading time',ghost:true,fn:toggleSlow}]);
}

function phaseRules(){
  show('lf-rules'); paintPace();
  PartyShell.setPhase('rules',{total:ROUNDS,step:tierLen(),slow:slow});
  PartyShell.startTimer(T_RULES,function(s){$('lf-rt').textContent=s;},phaseQuestion);
  $('lf-next').onclick=function(){ PartyShell.stopTimer(); phaseQuestion(); };
  $('lf-slow').onclick=toggleSlow;
  rulesActions();
}

function phaseQuestion(){
  host([]);
  var q=QS[qi]; if(!q){ phasePodium(); return; }
  show('lf-q'); strip('lf-strip1');
  curTier=0; elig=snapshot(); answers[qi]={};
  $('lf-qn').textContent='QUESTION '+(qi+1)+' OF '+ROUNDS;
  var oh='';
  for(var oi=0;oi<shuffled[qi].length;oi++) oh+='<div class="lf-opt">'+esc(shuffled[qi][oi])+'</div>';
  $('lf-qopts').innerHTML=oh;
  renderClues(0); paintWho(); paintNext(qLen());
  PartyShell.setPhase('question',questionData());
  var len=qLen(), step=tierLen();
  PartyShell.startTimer(len,function(s){
    var t=$('lf-qt'); t.textContent=s; t.classList.toggle('low',s<=5);
    var tier=tierAt(s,len,step);
    if(tier!==curTier){
      curTier=tier; renderClues(tier);
      snd('chime');  /* the fog just lifted and the answer is worth less */
      /* a phone that rejoins mid question needs every clue so far AND the current worth, so every tier change is
         its own full phase payload (only the clues already revealed travel) */
      PartyShell.setPhase('question',questionData());
    }
    paintNext(s);
  },phaseReveal);
}

function phaseReveal(){
  if(!onScreen('lf-q')) return;
  var q=QS[qi], a=answers[qi]||{}, sc=scoreRound(a,q.options[0],order), k;
  for(k in sc.res) scores[k]=(scores[k]||0)+sc.res[k].pts;
  /* every player: the clue they answered at and their points, what they chose, or no answer */
  var html='', ids=order.slice();
  ids.sort(function(x,y){ var rx=sc.res[x], ry=sc.res[y];
    return (ry.pts-rx.pts) || ((rx.got==='none')-(ry.got==='none')) || String(names[x]).localeCompare(String(names[y])); });
  for(var j=0;j<ids.length;j++){
    var pid=ids[j], r=sc.res[pid], line;
    if(r.got==='right') line='clue '+r.tier+' <b>+'+r.pts+'</b>';
    else if(r.got==='wrong') line='chose '+esc(r.pick);
    else line='no answer';
    html+='<span class="lf-sc'+(r.got==='right'?' right':'')+'" style="border-color:'+esc(pcol(pid))+'">'+tag(pid)+
      esc(names[pid])+' <em>'+line+'</em></span>';
  }
  $('lf-vscored').innerHTML=html;
  var lad='';
  for(var c=0;c<4;c++) lad+='<div class="lf-lrow"><span class="lf-lpts">'+PTS[c]+'</span><span class="lf-ltxt">'+esc(q.clues[c])+'</span></div>';
  $('lf-vladder').innerHTML=lad;
  show('lf-rev');
  snd('reveal', sc.found>0);
  $('lf-vn').textContent='QUESTION '+(qi+1)+' OF '+ROUNDS;
  $('lf-vwas').textContent=sc.found?'It was':'This one stayed hidden. It was';
  $('lf-vans').textContent=q.options[0];
  strip('lf-strip2');
  PartyShell.setPhase('reveal',{num:qi+1,total:ROUNDS,answer:q.options[0],clues:q.clues.slice(),points:PTS.slice(),
    found:sc.found,results:sc.res,scores:scores,names:names,cols:cols(),syms:syms()});
  PartyShell.startTimer(T_REV,function(s){$('lf-vt').textContent=s;},function(){
    qi++;
    if(qi>=ROUNDS) phasePodium();
    else if(qi===4) phaseStandings();
    else phaseQuestion();
  });
}

function rows(target){
  var r=ranked(), html='', results={};
  for(var i=0;i<r.ids.length;i++){
    var id=r.ids[i];
    html+='<div class="lf-row"><span class="place">'+r.places[id]+'</span>'+tag(id)+esc(names[id])+
          '<b>'+(scores[id]||0)+'</b></div>';
    results[id]={score:scores[id]||0,place:r.places[id]};
  }
  $(target).innerHTML=html;
  return results;
}

function phaseStandings(){
  show('lf-stand'); rows('lf-standrows');
  $('lf-standafter').textContent='After question '+qi+' of '+ROUNDS+'.';
  PartyShell.setPhase('standings',{num:qi,total:ROUNDS,scores:scores,names:names,cols:cols(),syms:syms()});
  PartyShell.startTimer(T_STAND,null,phaseQuestion);
}

function phasePodium(){
  snd('fanfare');
  show('lf-pod');
  var results=rows('lf-podrows');
  PartyShell.setPhase('podium',{scores:scores,names:names,cols:cols(),syms:syms()});
  PartyShell.gameComplete(results);
  $('lf-again').onclick=function(){ startGame(PartyShell.players()); };
  $('lf-other').onclick=function(){ PartyShell.backToPicker(); };
  $('lf-end').onclick=function(){ PartyShell.closeRoom(); };
  host([{label:'Play again',fn:function(){ startGame(PartyShell.players()); }},
        {label:'Another game',ghost:true,fn:function(){ PartyShell.backToPicker(); }},
        {label:'End night',ghost:true,fn:function(){ PartyShell.closeRoom(); }}]);
}

document.addEventListener('party-started',function(ev){ startGame(ev.detail.players); });
})();
