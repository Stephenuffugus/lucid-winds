/* FIRST FROST, host screen.

   Trivia knockout where the people you knock out do not leave. They become the
   Frost, and before every question they vote on how to make the next one worse
   for whoever is still playing.

   ⛔ THE STANDING RULE FROM WHACKBOX_PLAN, AND IT SHAPES THIS FILE: the Frost
   console is the headline and the trivia is the backdrop. That is why the
   questions are fair rather than fiendish, why the chosen power is announced in
   the largest text on the screen, and why the Frost have their own score and
   their own line on the podium. If this ever reads as a trivia game with a
   gimmick, it has drifted.

   Three powers, chosen by Frost majority (ties break toward the first voted):
     CHILL        the clock is cut in half
     FOG          the question stays hidden until half the clock is gone
     DEEP FREEZE  a wrong answer costs two marks instead of one

   Three frost marks and you are frozen. Last living player wins the night.
   The Frost score 40 for every mark their power helps land, so an eliminated
   player is still playing for something. */
(function(){
'use strict';
function $(id){return document.getElementById(id);}
function esc(s){ return String(s).replace(/[<>&"]/g,function(c){return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c];}); }

var root=$('game-root');
root.innerHTML=
 '<div class="fr-screen" id="fr-rules"><div class="fr-timer" id="fr-rt"></div>'+
 '<div class="fr-rules">Answer the question before the clock runs out.\n\nThree wrong answers and the frost takes you.\n\nTaken players do not leave. They become the Frost.\n\nThe Frost choose how to spoil the next question.</div>'+
 '<button class="ps-btn" id="fr-next" style="margin-top:34px">Next</button></div>'+

 '<div class="fr-screen" id="fr-vote"><div class="fr-timer" id="fr-vt2"></div>'+
 '<div class="fr-num">The Frost are choosing</div>'+
 '<div class="fr-powers" id="fr-powers"></div>'+
 '<div class="fr-in" id="fr-votein"></div></div>'+

 '<div class="fr-screen" id="fr-q"><div class="fr-top">'+
 '<div class="fr-num" id="fr-qn"></div><div class="fr-timer" id="fr-qt"></div></div>'+
 '<div class="fr-power" id="fr-curpower"></div>'+
 '<div class="fr-qtext" id="fr-qtext"></div>'+
 '<div class="fr-veil" id="fr-veil">The Frost are hiding this one</div>'+
 '<div class="fr-opts" id="fr-qopts"></div>'+
 '<div class="fr-in" id="fr-qin"></div><div class="fr-marks" id="fr-marks1"></div></div>'+

 '<div class="fr-screen" id="fr-rev"><div class="fr-timer" id="fr-rvt"></div>'+
 '<div class="fr-was">The answer was</div><div class="fr-answer" id="fr-ans"></div>'+
 '<div class="fr-took" id="fr-took"></div><div class="fr-marks" id="fr-marks2"></div></div>'+

 '<div class="fr-screen fr-podium" id="fr-pod"><div class="fr-num" id="fr-podhead">The night is over</div>'+
 '<div class="fr-winline" id="fr-winline"></div>'+
 '<div id="fr-podrows" class="fr-rows"></div>'+
 '<div class="fr-earn">Everyone earned sunbeams for playing.</div>'+
 '<div class="fr-btnrow">'+
 '<button class="ps-btn" id="fr-again">Play again</button>'+
 '<button class="ps-btn ghost" id="fr-other">Another game</button>'+
 '<button class="ps-btn ghost" id="fr-end">End night</button></div></div>';

function show(id){ var s=root.querySelectorAll('.fr-screen');
  for(var i=0;i<s.length;i++) s[i].classList.remove('on'); $(id).classList.add('on'); }

var POWERS=[
  {key:'chill', name:'CHILL',       desc:'The clock is cut in half.'},
  {key:'fog',   name:'FOG',         desc:'The question stays hidden until half the clock is gone.'},
  {key:'freeze',name:'DEEP FREEZE', desc:'A wrong answer costs two marks instead of one.'}
];
var MARKS_OUT=3, MAX_Q=12, WIN_BONUS=300, RIGHT=100, FROST_PAY=40;

function snd(m,a){ try{ if(window.PartySound) PartySound[m](a); }catch(e){} }
var BANK=window.FIRSTFROST_BANK||[], QS=[], qi=0;
var scores={}, names={}, marks={}, frozen={}, order=[], shuffled=[];
var votes={}, power=null, answered={}, veiled=false;
var FAST=/[?&]fr_fast=1(&|$)/.test(location.search);
var T_RULES=FAST?3:20, T_VOTE=FAST?3:10, T_Q=FAST?6:20, T_REV=FAST?2:7;

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
    shuffled.push(shuffle(q.options));
  }
  try{localStorage.setItem('fr_used',JSON.stringify(used));}catch(e){}
}

function living(){ var out=[]; for(var i=0;i<order.length;i++) if(!frozen[order[i]]) out.push(order[i]); return out; }
function ghosts(){ var out=[]; for(var i=0;i<order.length;i++) if(frozen[order[i]]) out.push(order[i]); return out; }

function renderMarks(which){
  var html='';
  for(var i=0;i<order.length;i++){
    var pid=order[i], m=marks[pid]||0;
    var pips='';
    /* ⛔ the state class here is "lit", never "on". The shell, the driver and
       every module treat a bare .on as THE ACTIVE SCREEN, so a pip carrying it
       made document.querySelector('#game-root .on') return a mark dot instead
       of the podium, and the end to end run reported a game that had actually
       finished as stuck. */
    for(var j=0;j<MARKS_OUT;j++) pips+='<span class="fr-pip'+(j<m?' lit':'')+'"></span>';
    html+='<div class="fr-mrow'+(frozen[pid]?' out':'')+'">'+esc(names[pid])+
      '<span class="fr-pips">'+(frozen[pid]?'FROST':pips)+'</span>'+
      '<b>'+(scores[pid]||0)+'</b></div>';
  }
  var el=$(which); if(el) el.innerHTML=html;
}

PartyShell.onPlayerMessage(function(pid,msg){
  if(!msg||names[pid]===undefined) return;
  if(msg.t==='power'&&$('fr-vote').classList.contains('on')){
    if(!frozen[pid]) return;                       /* only the Frost vote */
    votes[pid]=String(msg.v||'');
    $('fr-votein').textContent=Object.keys(votes).length+' of '+ghosts().length+' have chosen';
  }
  else if(msg.t==='answer'&&msg.q===qi+1&&$('fr-q').classList.contains('on')){
    if(frozen[pid]) return;                        /* the frozen do not answer */
    if(answered.hasOwnProperty(pid)) return;       /* one answer only */
    var idx=msg.v|0; if(idx<0||idx>3) return;
    answered[pid]=shuffled[qi][idx];
    $('fr-qin').textContent=Object.keys(answered).length+' of '+living().length+' answered';
    snd('pip');
    PartyShell.sendToPlayer(pid,{t:'locked'});
    if(Object.keys(answered).length>=living().length){ PartyShell.stopTimer(); phaseReveal(); }
  }
});

function startGame(players){
  scores={}; names={}; marks={}; frozen={}; order=[];
  for(var i=0;i<players.length;i++){
    names[players[i].id]=players[i].name; scores[players[i].id]=0;
    marks[players[i].id]=0; frozen[players[i].id]=false; order.push(players[i].id);
  }
  pickQuestions(); qi=0; phaseRules();
}

function phaseRules(){
  show('fr-rules');
  PartyShell.setPhase('rules',{});
  PartyShell.startTimer(T_RULES,function(s){$('fr-rt').textContent=s;},nextRound);
  $('fr-next').onclick=function(){ PartyShell.stopTimer(); nextRound(); };
}

function nextRound(){
  if(qi>=MAX_Q||living().length<=1||!QS[qi]){ phasePodium(); return; }
  if(ghosts().length===0){ power=null; phaseQuestion(); return; }
  phaseVote();
}

function phaseVote(){
  votes={}; show('fr-vote');
  var html='';
  for(var i=0;i<POWERS.length;i++)
    html+='<div class="fr-pw"><div class="fr-pwn">'+POWERS[i].name+'</div>'+
          '<div class="fr-pwd">'+POWERS[i].desc+'</div></div>';
  $('fr-powers').innerHTML=html;
  $('fr-votein').textContent='0 of '+ghosts().length+' have chosen';
  PartyShell.setPhase('vote',{powers:POWERS,frozen:frozen,num:qi+1,total:MAX_Q});
  PartyShell.startTimer(T_VOTE,function(s){$('fr-vt2').textContent=s;},function(){
    var tally={}, best=null, k;
    for(k in votes){ tally[votes[k]]=(tally[votes[k]]||0)+1; }
    for(var i=0;i<POWERS.length;i++){
      var key=POWERS[i].key;
      if(tally[key]&&(best===null||tally[key]>tally[best])) best=key;
    }
    power=best; phaseQuestion();
  });
}

function powerDef(){ for(var i=0;i<POWERS.length;i++) if(POWERS[i].key===power) return POWERS[i]; return null; }

function phaseQuestion(){
  var q=QS[qi]; if(!q){ phasePodium(); return; }
  answered={};
  var def=powerDef();
  var secs=(power==='chill')?Math.ceil(T_Q/2):T_Q;
  veiled=(power==='fog');

  show('fr-q'); renderMarks('fr-marks1');
  $('fr-qn').textContent='QUESTION '+(qi+1)+' OF '+MAX_Q;
  $('fr-curpower').textContent=def?('THE FROST CHOSE '+def.name):'';
  $('fr-curpower').style.visibility=def?'visible':'hidden';
  $('fr-qtext').textContent=q.q;
  $('fr-qtext').style.visibility=veiled?'hidden':'visible';
  $('fr-veil').style.display=veiled?'flex':'none';
  var oh='';
  for(var i=0;i<shuffled[qi].length;i++) oh+='<div class="fr-opt">'+esc(shuffled[qi][i])+'</div>';
  $('fr-qopts').innerHTML=oh;
  $('fr-qin').textContent='0 of '+living().length+' answered';

  PartyShell.setPhase('question',{num:qi+1,total:MAX_Q,q:veiled?null:q.q,
    options:shuffled[qi],power:power,powerName:def?def.name:null,frozen:frozen,veiled:veiled});

  PartyShell.startTimer(secs,function(s){
    var t=$('fr-qt'); t.textContent=s; t.classList.toggle('low',s<=5);
    if(veiled&&s<=Math.floor(secs/2)){
      veiled=false;
      $('fr-qtext').style.visibility='visible';
      $('fr-veil').style.display='none';
      PartyShell.setPhase('question',{num:qi+1,total:MAX_Q,q:QS[qi].q,
        options:shuffled[qi],power:power,powerName:powerDef()?powerDef().name:null,
        frozen:frozen,veiled:false});
    }
  },phaseReveal);
}

function phaseReveal(){
  var q=QS[qi], correct=q.options[0];
  var cost=(power==='freeze')?2:1;
  var res={}, took=[], newlyFrozen=[], froze={}, inflicted=0;

  var live=living();
  for(var i=0;i<live.length;i++){
    var pid=live[i];
    if(answered.hasOwnProperty(pid)&&answered[pid]===correct){
      scores[pid]=(scores[pid]||0)+RIGHT;
      res[pid]={got:'right',pts:RIGHT};
    } else {
      marks[pid]=(marks[pid]||0)+cost; inflicted+=cost;
      res[pid]={got:answered.hasOwnProperty(pid)?'wrong':'none',pts:0,marks:marks[pid]};
      took.push(names[pid]);
      if(marks[pid]>=MARKS_OUT&&!frozen[pid]){
        frozen[pid]=true; froze[pid]=1; newlyFrozen.push(names[pid]);
      }
    }
  }
  /* the Frost are paid for the damage their power helped land.
     ⛔ Keyed by PLAYER ID, never by name: the shell does not stop two people
     calling themselves Sam, and a name match here would have quietly skipped
     paying an innocent ghost while paying the one who just froze. */
  var gh=ghosts();
  if(power&&inflicted>0){
    for(var g=0;g<gh.length;g++){
      if(froze[gh[g]]) continue;                 /* not for your own freezing round */
      scores[gh[g]]=(scores[gh[g]]||0)+FROST_PAY*inflicted;
      res[gh[g]]={got:'frost',pts:FROST_PAY*inflicted};
    }
  }
  for(var h=0;h<gh.length;h++) if(!res[gh[h]]) res[gh[h]]={got:'frost',pts:0};

  show('fr-rev');
  snd('reveal', took.length<live.length);
  /* somebody joined the Frost: the room should feel that, not just read it */
  if(newlyFrozen.length) setTimeout(function(){ snd('thud'); },700);
  $('fr-ans').textContent=correct;
  var line='';
  if(took.length) line+='<div class="fr-tookline">The frost reached '+esc(took.join(', '))+'.</div>';
  if(newlyFrozen.length) line+='<div class="fr-frozeline">'+esc(newlyFrozen.join(' and '))+' joined the Frost.</div>';
  if(!took.length) line+='<div class="fr-tookline">Nobody took a mark that time.</div>';
  $('fr-took').innerHTML=line;
  renderMarks('fr-marks2');

  PartyShell.setPhase('reveal',{num:qi+1,answer:correct,results:res,frozen:frozen,marks:marks});
  PartyShell.startTimer(T_REV,function(s){$('fr-rvt').textContent=s;},function(){
    qi++; nextRound();
  });
}

function phasePodium(){
  snd('fanfare');
  show('fr-pod');
  var live=living(), results={}, winner=null;
  if(live.length===1){ winner=live[0]; scores[winner]=(scores[winner]||0)+WIN_BONUS; }

  var ids=order.slice();
  ids.sort(function(a,b){return (scores[b]||0)-(scores[a]||0);});
  var html='';
  for(var i=0;i<ids.length;i++){
    html+='<div class="fr-row'+(frozen[ids[i]]?' out':'')+'"><span class="place">'+(i+1)+'</span>'+
      esc(names[ids[i]])+(frozen[ids[i]]?'<span class="fr-tag">FROST</span>':'')+
      '<b>'+(scores[ids[i]]||0)+'</b></div>';
    results[ids[i]]={score:scores[ids[i]]||0,place:i+1};
  }
  $('fr-podrows').innerHTML=html;

  /* the coldest ghost gets named, because an eliminated player who scored well
     deserves the screen as much as the survivor does */
  var gh=ghosts(), coldest=null;
  for(var g=0;g<gh.length;g++) if(coldest===null||(scores[gh[g]]||0)>(scores[coldest]||0)) coldest=gh[g];
  var wl='';
  if(winner) wl+='<div class="fr-survivor">'+esc(names[winner])+' outlasted the frost.</div>';
  else wl+='<div class="fr-survivor">The frost took everyone.</div>';
  if(coldest) wl+='<div class="fr-coldest">Coldest of the Frost: '+esc(names[coldest])+'</div>';
  $('fr-winline').innerHTML=wl;

  PartyShell.setPhase('podium',{scores:scores,names:names,frozen:frozen,
    winner:winner?names[winner]:null});
  PartyShell.gameComplete(results);
  $('fr-again').onclick=function(){ startGame(PartyShell.players()); };
  $('fr-other').onclick=function(){ PartyShell.backToPicker(); };
  $('fr-end').onclick=function(){ PartyShell.closeRoom(); };
}

/* read only state hook for the end to end driver. Costs nothing, cannot change
   the game, and is the difference between reading a stall and guessing at it. */
window.__frState=function(){ return {qi:qi,qs:QS.length,living:living().length,
  ghosts:ghosts().length,frozen:frozen,marks:marks,power:power,
  answered:Object.keys(answered).length}; };

document.addEventListener('party-started',function(ev){ startGame(ev.detail.players); });
})();
