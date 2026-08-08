/* WIDE MARGIN, host screen.

   A question with a real percentage answer appears. Everybody drags a dial from
   0 to 100 AT THE SAME TIME, then every marker lands on one number line and the
   truth slides in.

   ⭐ WHY SIMULTANEOUS, when the game this borrows from has one person guess while
   everyone else watches. With eight players that original shape means one person
   plays and seven wait, seven eighths of the round. Here everybody acts every
   round, and the reveal is eight coloured markers scattered across a line, which
   is both funnier and the best ten foot readout in the pack.

   ⭐ NOBODY EVER SCORES ZERO FOR A THOUGHTFUL GUESS. The bands are generous and
   wide on purpose: a player who reasons their way to within twenty still takes
   something home, because the whole charm of the format is that being close is a
   real achievement and being wrong is funny rather than punishing.

   ⛔ Guesses stay private until the reveal, exactly like Firefly Futures. If the
   markers appeared as they landed the room would anchor on the first one and the
   spread, which IS the show, would collapse. */
(function(){
'use strict';
function $(id){return document.getElementById(id);}
function esc(s){ return String(s).replace(/[<>&"]/g,function(c){return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c];}); }
function snd(m,a){ try{ if(window.PartySound) PartySound[m](a); }catch(e){} }
function pcol(pid){ try{ return PartyShell.colorFor(pid); }catch(e){ return '#e8dcc8'; } }

var root=$('game-root');
root.innerHTML=
 '<div class="wm-screen" id="wm-rules"><div class="wm-timer" id="wm-rt"></div>'+
 '<div class="wm-rules">A question with a real answer between nothing and everything.\n\nEverybody drags to the number they believe, at the same time.\n\nClosest to the truth takes the most.\n\nBeing close still pays, so guess bravely.</div>'+
 '<button class="ps-btn" id="wm-next" style="margin-top:34px">Next</button></div>'+

 '<div class="wm-screen" id="wm-q"><div class="wm-timer" id="wm-qt"></div>'+
 '<div class="wm-num" id="wm-qn"></div>'+
 '<div class="wm-question" id="wm-qtext"></div>'+
 '<div class="wm-line" id="wm-qline"></div>'+
 '<div class="wm-in" id="wm-qin"></div><div class="wm-strip" id="wm-strip1"></div></div>'+

 '<div class="wm-screen" id="wm-rev"><div class="wm-timer" id="wm-vt"></div>'+
 '<div class="wm-num" id="wm-vn"></div>'+
 '<div class="wm-question small" id="wm-vtext"></div>'+
 '<div class="wm-truth" id="wm-vtruth"></div>'+
 '<div class="wm-line" id="wm-vline"></div>'+
 '<div class="wm-src" id="wm-vsrc"></div><div class="wm-strip" id="wm-strip2"></div></div>'+

 '<div class="wm-screen" id="wm-stand"><div class="wm-num">Standings</div>'+
 '<div id="wm-standrows" class="wm-rows"></div></div>'+

 '<div class="wm-screen wm-podium" id="wm-pod"><div class="wm-num">The night is over</div>'+
 '<div id="wm-podrows" class="wm-rows"></div>'+
 '<div class="wm-earn">Everyone earned sunbeams for playing.</div>'+
 '<div class="wm-btnrow">'+
 '<button class="ps-btn" id="wm-again">Play again</button>'+
 '<button class="ps-btn ghost" id="wm-other">Another game</button>'+
 '<button class="ps-btn ghost" id="wm-end">End night</button></div></div>';

function show(id){ var s=root.querySelectorAll('.wm-screen');
  for(var i=0;i<s.length;i++) s[i].classList.remove('on'); $(id).classList.add('on'); }

var BANK=window.WIDEMARGIN_BANK||[], QS=[], ri=0, ROUNDS=10;
var scores={}, names={}, order=[], guesses={};
var FAST=/[?&]wm_fast=1(&|$)/.test(location.search);
var T_RULES=FAST?3:20, T_Q=FAST?4:22, T_REV=FAST?3:9, T_STAND=FAST?2:8;

/* Generous and wide on purpose. A player who reasons to within twenty has done
   something real and should not go home with nothing. */
function award(diff){
  if(diff<=3)  return 150;
  if(diff<=7)  return 100;
  if(diff<=12) return 70;
  if(diff<=20) return 40;
  if(diff<=30) return 15;
  return 0;
}
var CLOSEST_BONUS=50;

function pickQuestions(){
  var used={}; try{used=JSON.parse(localStorage.getItem('wm_used')||'{}');}catch(e){}
  var pool=BANK.filter(function(q){return !used[q.id];});
  if(pool.length<ROUNDS){ used={}; pool=BANK.slice(); }
  QS=[];
  for(var i=0;i<ROUNDS&&pool.length;i++){
    var k=Math.floor(Math.random()*pool.length);
    var q=pool.splice(k,1)[0]; QS.push(q); used[q.id]=1;
  }
  try{localStorage.setItem('wm_used',JSON.stringify(used));}catch(e){}
}

function strip(which){
  var ids=order.slice(), rows='';
  ids.sort(function(a,b){return (scores[b]||0)-(scores[a]||0);});
  for(var i=0;i<ids.length;i++) rows+='<span><i style="background:'+pcol(ids[i])+'"></i>'+
    esc(names[ids[i]])+' <b>'+(scores[ids[i]]||0)+'</b></span>';
  var el=$(which); if(el) el.innerHTML=rows;
}

/* THE NUMBER LINE. Ticks always; markers only once it is safe to show them.

   ⛔ THE FIRST VERSION LOOKED FINE IN CODE AND WAS UNREADABLE ON SCREEN. Markers
   were stacked 34px apart while a marker is nearly a hundred pixels tall, so
   four guesses near the same number rendered as one pile of overlapping pills
   with the names printed through each other, and the top of the pile climbed
   into the giant answer above it. The gate passed. The screenshot did not.

   So: a marker is ONE compact chip carrying its number and its name on a single
   line, the stack spacing is larger than the chip, and each chip gets its own
   stem drawn from the axis up to wherever it ended up. */
function lineHTML(marks,truth){
  var html='<div class="wm-track">';
  var ticks=[0,25,50,75,100];
  for(var t=0;t<ticks.length;t++)
    html+='<span class="wm-tick" style="left:'+ticks[t]+'%"><i></i><b>'+ticks[t]+'</b></span>';
  if(truth!==null&&truth!==undefined)
    html+='<span class="wm-truthmark" style="left:'+truth+'%"><i></i><b>'+truth+'</b></span>';
  if(marks) for(var m=0;m<marks.length;m++){
    var lift=30+marks[m].row*40;
    html+='<span class="wm-stem" style="left:'+marks[m].v+'%;height:'+lift+'px;background:'+marks[m].col+'"></span>'+
      '<span class="wm-mark" style="left:'+marks[m].v+'%;bottom:'+lift+'px;'+
      'background:'+marks[m].col+'"><b>'+marks[m].v+'</b>'+esc(marks[m].n)+'</span>';
  }
  return html+'</div>';
}
function layout(list){
  /* one row per marker, so guesses that land near each other stagger upwards
     instead of hiding one another. At ten feet a hidden marker reads as a
     player who never guessed at all. */
  var sorted=list.slice().sort(function(a,b){return a.v-b.v;});
  var placed=[];
  for(var i=0;i<sorted.length;i++){
    var r=0;
    while(true){
      var clash=false;
      for(var j=0;j<placed.length;j++)
        if(placed[j].row===r && Math.abs(placed[j].v-sorted[i].v)<11){ clash=true; break; }
      if(!clash) break;
      r++;
    }
    sorted[i].row=r; placed.push(sorted[i]);
  }
  return sorted;
}

PartyShell.onPlayerMessage(function(pid,msg){
  if(!msg||names[pid]===undefined) return;
  if(msg.t==='guess'&&msg.r===ri+1&&$('wm-q').classList.contains('on')){
    var v=Math.max(0,Math.min(100,msg.v|0));
    var isNew=!guesses.hasOwnProperty(pid);
    guesses[pid]=v;
    var n=0,k; for(k in guesses) n++;
    $('wm-qin').textContent=n+' of '+order.length+' have guessed';
    if(isNew) snd('pip');
    if(n>=order.length){ PartyShell.stopTimer(); phaseReveal(); }
  }
});

function startGame(players){
  scores={}; names={}; order=[];
  for(var i=0;i<players.length;i++){ names[players[i].id]=players[i].name; scores[players[i].id]=0; order.push(players[i].id); }
  pickQuestions(); ri=0; phaseRules();
}

function phaseRules(){
  show('wm-rules');
  PartyShell.setPhase('rules',{});
  PartyShell.startTimer(T_RULES,function(s){$('wm-rt').textContent=s;},phaseQuestion);
  $('wm-next').onclick=function(){ PartyShell.stopTimer(); phaseQuestion(); };
}

function phaseQuestion(){
  var q=QS[ri]; if(!q||ri>=ROUNDS){ phasePodium(); return; }
  guesses={};
  show('wm-q'); strip('wm-strip1');
  $('wm-qn').textContent='ROUND '+(ri+1)+' OF '+ROUNDS;
  $('wm-qtext').textContent=q.q;
  $('wm-qline').innerHTML=lineHTML(null,null);
  $('wm-qin').textContent='0 of '+order.length+' have guessed';
  PartyShell.setPhase('question',{num:ri+1,total:ROUNDS,q:q.q});
  PartyShell.startTimer(T_Q,function(s){ var t=$('wm-qt'); t.textContent=s; t.classList.toggle('low',s<=5); },phaseReveal);
}

function phaseReveal(){
  var q=QS[ri], res={}, marks=[], best=999, k;
  for(k in guesses){ var d=Math.abs(guesses[k]-q.answer); if(d<best) best=d; }

  for(var i=0;i<order.length;i++){
    var pid=order[i];
    if(!guesses.hasOwnProperty(pid)){ res[pid]={got:'none',pts:0}; continue; }
    var diff=Math.abs(guesses[pid]-q.answer);
    var pts=award(diff);
    var closest=(diff===best);
    if(closest&&pts>0) pts+=CLOSEST_BONUS;
    scores[pid]=(scores[pid]||0)+pts;
    res[pid]={got:diff<=3?'bull':(pts>0?'near':'far'),pts:pts,diff:diff,
      guess:guesses[pid],closest:closest};
    marks.push({v:guesses[pid],n:names[pid],col:pcol(pid),row:0});
  }

  show('wm-rev');
  snd('reveal', best<=12);
  $('wm-vn').textContent='ROUND '+(ri+1)+' OF '+ROUNDS;
  $('wm-vtext').textContent=q.q;
  $('wm-vtruth').innerHTML='<span>'+q.answer+'</span> per cent';
  $('wm-vline').innerHTML=lineHTML(layout(marks),q.answer);
  $('wm-vsrc').textContent='Source: '+q.source;
  strip('wm-strip2');

  PartyShell.setPhase('reveal',{num:ri+1,answer:q.answer,q:q.q,source:q.source,results:res});
  PartyShell.startTimer(T_REV,function(s){$('wm-vt').textContent=s;},function(){
    ri++;
    if(ri>=ROUNDS) phasePodium();
    else if(ri===5) phaseStandings();
    else phaseQuestion();
  });
}

function rows(target){
  var ids=order.slice(); ids.sort(function(a,b){return (scores[b]||0)-(scores[a]||0);});
  var html='';
  for(var i=0;i<ids.length;i++)
    html+='<div class="wm-row"><span class="place">'+(i+1)+'</span>'+
      '<i style="background:'+pcol(ids[i])+'"></i>'+esc(names[ids[i]])+
      '<b>'+(scores[ids[i]]||0)+'</b></div>';
  $(target).innerHTML=html;
  return ids;
}

function phaseStandings(){
  show('wm-stand'); rows('wm-standrows');
  PartyShell.setPhase('standings',{scores:scores,names:names});
  PartyShell.startTimer(T_STAND,null,phaseQuestion);
}

function phasePodium(){
  snd('fanfare');
  show('wm-pod');
  var ids=rows('wm-podrows'), results={};
  for(var i=0;i<ids.length;i++) results[ids[i]]={score:scores[ids[i]]||0,place:i+1};
  PartyShell.setPhase('podium',{scores:scores,names:names});
  PartyShell.gameComplete(results);
  $('wm-again').onclick=function(){ startGame(PartyShell.players()); };
  $('wm-other').onclick=function(){ PartyShell.backToPicker(); };
  $('wm-end').onclick=function(){ PartyShell.closeRoom(); };
}

document.addEventListener('party-started',function(ev){ startGame(ev.detail.players); });
})();
