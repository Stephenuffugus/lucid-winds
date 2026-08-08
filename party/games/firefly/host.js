/* FIREFLY FUTURES, host screen.

   Round shape: poll (private) -> market (private bets) -> reveal (everything
   opens at once). Ten rounds, standings after 4 and 8, then podium.

   ⭐ WHY THE BETS ARE PRIVATE. Mothlight already owns the public changeable
   answer, and it is that game's whole show. If bets were public here the two
   titles would collapse into one feeling. Here the tension is that nobody knows
   anything until the lanterns light, so the reveal is a single loud moment
   instead of a slow drift. Both screens say how MANY have answered, never what.

   Scoring: exact +100, off by one +40, and +30 more if you were the only exact
   guess in the room. Never negative. */
(function(){
'use strict';
function $(id){return document.getElementById(id);}
function esc(s){ return String(s).replace(/[<>&"]/g,function(c){return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c];}); }

var root=$('game-root');
root.innerHTML=
 '<div class="ff-screen" id="ff-rules"><div class="ff-timer" id="ff-rt"></div>'+
 '<div class="ff-rules">A question about you appears. Answer it honestly.\n\nThen the room bets on how many of you said yes.\n\nGuess the count exactly and you score the most.\n\nNobody sees anything until the lanterns light.</div>'+
 '<button class="ps-btn" id="ff-next" style="margin-top:34px">Next</button></div>'+

 '<div class="ff-screen" id="ff-poll"><div class="ff-timer" id="ff-pt"></div>'+
 '<div class="ff-num" id="ff-pn"></div><div class="ff-prompt" id="ff-pp"></div>'+
 '<div class="ff-step">Answer on your phone</div>'+
 '<div class="ff-in" id="ff-pin"></div><div class="ff-strip" id="ff-strip1"></div></div>'+

 '<div class="ff-screen" id="ff-mkt"><div class="ff-timer" id="ff-mt"></div>'+
 '<div class="ff-num" id="ff-mn"></div><div class="ff-prompt small" id="ff-mp"></div>'+
 '<div class="ff-ask" id="ff-ask"></div>'+
 '<div class="ff-lanterns" id="ff-lant"></div>'+
 '<div class="ff-in" id="ff-min"></div><div class="ff-strip" id="ff-strip2"></div></div>'+

 '<div class="ff-screen" id="ff-rev"><div class="ff-timer" id="ff-vt"></div>'+
 '<div class="ff-num" id="ff-vn"></div><div class="ff-answerline" id="ff-vline"></div>'+
 '<div class="ff-lanterns" id="ff-vlant"></div><div class="ff-strip" id="ff-strip3"></div></div>'+

 '<div class="ff-screen" id="ff-stand"><div class="ff-num">Standings</div>'+
 '<div id="ff-standrows" class="ff-rows"></div></div>'+

 '<div class="ff-screen ff-podium" id="ff-pod"><div class="ff-num">The night is over</div>'+
 '<div id="ff-podrows" class="ff-rows"></div>'+
 '<div class="ff-earn">Everyone earned sunbeams for playing.</div>'+
 '<div class="ff-btnrow">'+
 '<button class="ps-btn" id="ff-again">Play again</button>'+
 '<button class="ps-btn ghost" id="ff-other">Another game</button>'+
 '<button class="ps-btn ghost" id="ff-end">End night</button></div></div>';

function show(id){ var s=root.querySelectorAll('.ff-screen');
  for(var i=0;i<s.length;i++) s[i].classList.remove('on'); $(id).classList.add('on'); }

var BANK=window.FIREFLY_BANK||[], QS=[], ri=0, ROUNDS=10;
var scores={}, names={}, polls={}, bets={}, order=[];
var FAST=/[?&]ff_fast=1(&|$)/.test(location.search);
var T_RULES=FAST?3:20, T_POLL=FAST?3:12, T_MKT=FAST?3:18, T_REV=FAST?2:8, T_STAND=FAST?2:8;

function pickPrompts(){
  var used={}; try{used=JSON.parse(localStorage.getItem('ff_used')||'{}');}catch(e){}
  var pool=BANK.filter(function(p){return !used[p.id];});
  if(pool.length<ROUNDS){ used={}; pool=BANK.slice(); }
  QS=[];
  for(var i=0;i<ROUNDS&&pool.length;i++){
    var k=Math.floor(Math.random()*pool.length);
    var p=pool.splice(k,1)[0]; QS.push(p); used[p.id]=1;
  }
  try{localStorage.setItem('ff_used',JSON.stringify(used));}catch(e){}
}

function strip(which){
  var ids=order.slice(), rows='';
  ids.sort(function(a,b){return (scores[b]||0)-(scores[a]||0);});
  for(var i=0;i<ids.length;i++) rows+='<span>'+esc(names[ids[i]])+' <b>'+(scores[ids[i]]||0)+'</b></span>';
  var el=$(which); if(el) el.innerHTML=rows;
}
/* how many have acted, never what they chose */
function inCount(el,done,what){ $(el).textContent=done+' of '+order.length+' '+what; }

function lanternRow(target,counts,trueCount,betsByNum){
  /* one lantern per possible answer 0..N. counts/betsByNum are optional. */
  var n=order.length, html='';
  for(var v=0;v<=n;v++){
    var lit=(trueCount!==null&&trueCount!==undefined&&v===trueCount);
    var chips='';
    if(betsByNum&&betsByNum[v]) for(var c=0;c<betsByNum[v].length;c++)
      chips+='<span class="ff-chip">'+esc(betsByNum[v][c])+'</span>';
    html+='<div class="ff-l'+(lit?' lit':'')+'"><div class="ff-bulb"></div>'+
          '<div class="ff-lnum">'+v+'</div><div class="ff-chips">'+chips+'</div></div>';
  }
  $(target).innerHTML=html;
}

PartyShell.onPlayerMessage(function(pid,msg){
  if(!msg||names[pid]===undefined) return;
  if(msg.t==='poll'&&msg.r===ri+1&&$('ff-poll').classList.contains('on')){
    polls[ri]=polls[ri]||{}; polls[ri][pid]=!!msg.v;
    inCount('ff-pin',Object.keys(polls[ri]).length,'answered');
  } else if(msg.t==='bet'&&msg.r===ri+1&&$('ff-mkt').classList.contains('on')){
    var v=msg.v|0; if(v<0||v>order.length) return;
    bets[ri]=bets[ri]||{}; bets[ri][pid]=v;
    inCount('ff-min',Object.keys(bets[ri]).length,'have bet');
  }
});

function startGame(players){
  scores={}; names={}; polls={}; bets={}; order=[];
  for(var i=0;i<players.length;i++){
    names[players[i].id]=players[i].name; scores[players[i].id]=0; order.push(players[i].id);
  }
  pickPrompts(); ri=0; phaseRules();
}

function phaseRules(){
  show('ff-rules');
  PartyShell.setPhase('rules',{});
  PartyShell.startTimer(T_RULES,function(s){$('ff-rt').textContent=s;},phasePoll);
  $('ff-next').onclick=function(){ PartyShell.stopTimer(); phasePoll(); };
}

function phasePoll(){
  var q=QS[ri]; if(!q){ phasePodium(); return; }
  show('ff-poll'); strip('ff-strip1');
  $('ff-pn').textContent='ROUND '+(ri+1)+' OF '+ROUNDS;
  $('ff-pp').textContent=q.text;
  inCount('ff-pin',0,'answered');
  PartyShell.setPhase('poll',{num:ri+1,total:ROUNDS,text:q.text});
  PartyShell.startTimer(T_POLL,function(s){ var t=$('ff-pt'); t.textContent=s; t.classList.toggle('low',s<=5); },phaseMarket);
}

function phaseMarket(){
  var q=QS[ri];
  show('ff-mkt'); strip('ff-strip2');
  $('ff-mn').textContent='ROUND '+(ri+1)+' OF '+ROUNDS;
  $('ff-mp').textContent=q.text;
  $('ff-ask').textContent='How many of the '+order.length+' said yes?';
  inCount('ff-min',0,'have bet');
  lanternRow('ff-lant',null,null,null);
  PartyShell.setPhase('market',{num:ri+1,total:ROUNDS,text:q.text,n:order.length});
  PartyShell.startTimer(T_MKT,function(s){ var t=$('ff-mt'); t.textContent=s; t.classList.toggle('low',s<=5); },phaseReveal);
}

function phaseReveal(){
  var q=QS[ri], p=polls[ri]||{}, b=bets[ri]||{}, k;
  var yes=0; for(k in p) if(p[k]) yes++;

  /* exact guessers first, because the sole bonus depends on the count of them */
  var exact=[]; for(k in b) if(b[k]===yes) exact.push(k);
  var sole=exact.length===1;

  var res={}, betsByNum={};
  for(var i=0;i<order.length;i++){
    var pid=order[i], got='none', pts=0;
    if(b.hasOwnProperty(pid)){
      var d=Math.abs(b[pid]-yes);
      if(d===0){ got=sole?'sole':'exact'; pts=sole?130:100; }
      else if(d===1){ got='close'; pts=40; }
      else { got='miss'; pts=0; }
      betsByNum[b[pid]]=betsByNum[b[pid]]||[];
      betsByNum[b[pid]].push(names[pid]);
    }
    scores[pid]=(scores[pid]||0)+pts;
    res[pid]={got:got,pts:pts,bet:b.hasOwnProperty(pid)?b[pid]:null};
  }

  show('ff-rev');
  $('ff-vn').textContent='ROUND '+(ri+1)+' OF '+ROUNDS;
  $('ff-vline').innerHTML=esc(q.text)+'<br><b>'+yes+' of '+order.length+' said yes</b>';
  lanternRow('ff-vlant',null,yes,betsByNum);
  strip('ff-strip3');

  PartyShell.setPhase('reveal',{num:ri+1,yes:yes,n:order.length,text:q.text,results:res});
  PartyShell.startTimer(T_REV,function(s){$('ff-vt').textContent=s;},function(){
    ri++;
    if(ri>=ROUNDS) phasePodium();
    else if(ri===4||ri===8) phaseStandings();
    else phasePoll();
  });
}

function rows(target){
  var ids=order.slice(); ids.sort(function(a,b){return (scores[b]||0)-(scores[a]||0);});
  var html='';
  for(var i=0;i<ids.length;i++)
    html+='<div class="ff-row"><span class="place">'+(i+1)+'</span>'+esc(names[ids[i]])+
          '<b>'+(scores[ids[i]]||0)+'</b></div>';
  $(target).innerHTML=html;
  return ids;
}

function phaseStandings(){
  show('ff-stand'); rows('ff-standrows');
  PartyShell.setPhase('standings',{scores:scores,names:names});
  PartyShell.startTimer(T_STAND,null,phasePoll);
}

function phasePodium(){
  show('ff-pod');
  var ids=rows('ff-podrows'), results={};
  for(var i=0;i<ids.length;i++) results[ids[i]]={score:scores[ids[i]]||0,place:i+1};
  PartyShell.setPhase('podium',{scores:scores,names:names});
  PartyShell.gameComplete(results);
  $('ff-again').onclick=function(){ startGame(PartyShell.players()); };
  $('ff-other').onclick=function(){ PartyShell.backToPicker(); };
  $('ff-end').onclick=function(){ PartyShell.closeRoom(); };
}

document.addEventListener('party-started',function(ev){ startGame(ev.detail.players); });
})();
