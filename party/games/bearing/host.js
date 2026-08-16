/* BEARING, host screen.

   A line runs between two opposites. One player, the Lantern, can see a hidden
   target on it. They say ONE WORD OUT LOUD. Everybody else drags a pointer to
   where they think the target is.

   ⭐⭐ THE SPOKEN CLUE IS THE WHOLE POINT, AND IT IS ALSO THE RULE. The house rule
   is that player TEXT never reaches a screen. Speaking never touches a screen at
   all, so the funniest input a person has is available to us with no moderation
   surface: nothing is typed, sent, stored or displayed. The Lantern's phone only
   ever says "say one word out loud". This title exists to prove that door is
   open, because most of the party genre is behind it.

   ⭐ THE LANTERN SCORES WHAT THE ROOM SCORES. A clue giver paid for their own
   accuracy would just describe the target; paid for the room's accuracy, they
   have to think about how OTHER people hear a word, which is the actual game. */
(function(){
'use strict';
function $(id){return document.getElementById(id);}
function esc(s){ return String(s).replace(/[<>&"]/g,function(c){return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c];}); }
function snd(m,a){ try{ if(window.PartySound) PartySound[m](a); }catch(e){} }
function pcol(pid){ try{ return PartyShell.colorFor(pid); }catch(e){ return '#e8dcc8'; } }

var root=$('game-root');
root.innerHTML=
 '<div class="br-screen" id="br-rules"><div class="br-timer" id="br-rt"></div>'+
 '<div class="br-rules">A line runs between two opposites, and one of you can see the target.\n\nThat person says ONE WORD out loud. Just the one.\n\nEverybody else moves a pointer to where they think it is.\n\nThe one who spoke scores whatever the room scores.</div>'+
 '<button class="ps-btn" id="br-next" style="margin-top:34px">Next</button></div>'+

 '<div class="br-screen" id="br-clue"><div class="br-timer" id="br-ct"></div>'+
 '<div class="br-num" id="br-cn"></div>'+
 '<div class="br-lantern" id="br-clant"></div>'+
 '<div class="br-spec" id="br-cspec"></div>'+
 '<div class="br-in">Listen. One word is all you get.</div></div>'+

 '<div class="br-screen" id="br-guess"><div class="br-timer" id="br-gt"></div>'+
 '<div class="br-num" id="br-gn"></div>'+
 '<div class="br-lantern" id="br-glant"></div>'+
 '<div class="br-spec" id="br-gspec"></div>'+
 '<div class="br-in" id="br-gin"></div><div class="br-strip" id="br-strip1"></div></div>'+

 '<div class="br-screen" id="br-rev"><div class="br-timer" id="br-vt"></div>'+
 '<div class="br-num" id="br-vn"></div>'+
 '<div class="br-spec" id="br-vspec"></div>'+
 '<div class="br-verdict" id="br-vverdict"></div><div class="br-strip" id="br-strip2"></div></div>'+

 '<div class="br-screen br-podium" id="br-pod"><div class="br-num">The night is over</div>'+
 '<div id="br-podrows" class="br-rows"></div>'+
 '<div class="br-earn">Everyone earned sunbeams for playing.</div>'+
 '<div class="br-btnrow">'+
 '<button class="ps-btn" id="br-again">Play again</button>'+
 '<button class="ps-btn ghost" id="br-other">Another game</button>'+
 '<button class="ps-btn ghost" id="br-end">End night</button></div></div>';

function show(id){ var s=root.querySelectorAll('.br-screen');
  for(var i=0;i<s.length;i++) s[i].classList.remove('on'); $(id).classList.add('on'); }

var BANK=window.BEARING_BANK||[], QS=[], ri=0, ROUNDS=10;
var scores={}, names={}, order=[], lantern=null, target=50, guesses={}, locks={};
var FAST=/[?&]br_fast=1(&|$)/.test(location.search);
var T_RULES=FAST?3:20, T_CLUE=FAST?3:18, T_GUESS=FAST?4:22, T_REV=FAST?3:9;

function award(diff){
  if(diff<=5)  return 150;
  if(diff<=12) return 100;
  if(diff<=20) return 50;
  if(diff<=30) return 20;
  return 0;
}

function pickPairs(){
  var used={}; try{used=JSON.parse(localStorage.getItem('br_used')||'{}');}catch(e){}
  var pool=BANK.filter(function(p){return !used[p.id];});
  if(pool.length<ROUNDS){ used={}; pool=BANK.slice(); }
  QS=[];
  for(var i=0;i<ROUNDS&&pool.length;i++){
    var k=Math.floor(Math.random()*pool.length);
    var p=pool.splice(k,1)[0]; QS.push(p); used[p.id]=1;
  }
  try{localStorage.setItem('br_used',JSON.stringify(used));}catch(e){}
}

function strip(which){
  var ids=order.slice(), rows='';
  ids.sort(function(a,b){return (scores[b]||0)-(scores[a]||0);});
  for(var i=0;i<ids.length;i++) rows+='<span><i style="background:'+pcol(ids[i])+'"></i>'+
    esc(names[ids[i]])+' <b>'+(scores[ids[i]]||0)+'</b></span>';
  var el=$(which); if(el) el.innerHTML=rows;
}

/* the spectrum. The target band is only ever drawn once the round is over. */
function specHTML(q,marks,showTarget){
  var html='<div class="br-ends"><span>'+esc(q.a)+'</span><span>'+esc(q.b)+'</span></div>'+
           '<div class="br-track">';
  if(showTarget){
    html+='<span class="br-band wide" style="left:'+(target-20)+'%;width:40%"></span>'+
          '<span class="br-band mid" style="left:'+(target-12)+'%;width:24%"></span>'+
          '<span class="br-band core" style="left:'+(target-5)+'%;width:10%"></span>'+
          '<span class="br-bullseye" style="left:'+target+'%"></span>';
  }
  if(marks) for(var m=0;m<marks.length;m++){
    var lift=26+marks[m].row*40;
    html+='<span class="br-stem" style="left:'+marks[m].v+'%;height:'+lift+'px;background:'+marks[m].col+'"></span>'+
      '<span class="br-mark" style="left:'+marks[m].v+'%;bottom:'+lift+'px;background:'+marks[m].col+'">'+
      esc(marks[m].n)+'</span>';
  }
  return html+'</div>';
}
function layout(list){
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

/* wait for the room, not for the roster taken at kick off */
function here(){
  var p=PartyShell.presentPlayers(), out=[];
  for(var i=0;i<p.length;i++) if(names[p[i]]!==undefined&&p[i]!==lantern) out.push(p[i]);
  return out;
}
function allLocked(){
  var h=here(), got=0;
  for(var i=0;i<h.length;i++) if(locks.hasOwnProperty(h[i])) got++;
  return h.length>0 && got>=h.length;
}
/* ⛔ THE TARGET IS THE GAME'S ONE SECRET AND IT USED TO RIDE ON A BROADCAST.
   setPhase goes to every phone; only the Lantern's phone chose to draw it. It
   now goes to one phone, by name, and is handed back on request so a Lantern
   whose phone locked can still see what they are describing. */
function tellLantern(){
  if(lantern) PartyShell.sendToPlayer(lantern,{t:'target',r:ri+1,v:target});
}

PartyShell.onPlayerMessage(function(pid,msg){
  if(!msg||names[pid]===undefined) return;
  if(msg.t==='needtarget'&&pid===lantern&&$('br-clue').classList.contains('on')){ tellLantern(); return; }
  if(msg.t==='spoken'&&pid===lantern&&$('br-clue').classList.contains('on')){
    /* the Lantern says they have said their word. Nothing typed ever arrives. */
    PartyShell.stopTimer(); phaseGuess();
  }
  else if(msg.t==='point'&&msg.r===ri+1&&pid!==lantern&&$('br-guess').classList.contains('on')){
    var v=Math.max(0,Math.min(100,msg.v|0));
    guesses[pid]=v;
    /* the first drag of a dial is not an answer, and the phone says so: only a
       deliberate Point here ends the round early. An unlocked dial still counts
       when the clock runs out, so nobody scores zero for thinking too long. */
    if(msg.lock&&!locks.hasOwnProperty(pid)){ locks[pid]=1; snd('pip'); }
    var n=0,k; for(k in locks) n++;
    $('br-gin').textContent=n+' of '+here().length+' have pointed';
    if(allLocked()){ PartyShell.stopTimer(); phaseReveal(); }
  }
});

function startGame(players){
  scores={}; names={}; order=[];
  for(var i=0;i<players.length;i++){ names[players[i].id]=players[i].name; scores[players[i].id]=0; order.push(players[i].id); }
  /* everybody holds the lantern the same number of times */
  ROUNDS=Math.min(12,Math.max(order.length,Math.ceil(10/order.length)*order.length));
  pickPairs(); ri=0; phaseRules();
}

function phaseRules(){
  show('br-rules');
  PartyShell.setPhase('rules',{});
  PartyShell.startTimer(T_RULES,function(s){$('br-rt').textContent=s;},phaseClue);
  $('br-next').onclick=function(){ PartyShell.stopTimer(); phaseClue(); };
}

function phaseClue(){
  var q=QS[ri]; if(!q||ri>=ROUNDS){ phasePodium(); return; }
  lantern=order[ri%order.length]; guesses={}; locks={};
  /* kept away from the very ends, where a clue is trivially easy */
  target=8+Math.floor(Math.random()*85);
  show('br-clue');
  $('br-cn').textContent='ROUND '+(ri+1)+' OF '+ROUNDS;
  $('br-clant').innerHTML='<b style="color:'+pcol(lantern)+'">'+esc(names[lantern])+'</b> can see it';
  $('br-cspec').innerHTML=specHTML(q,null,false);
  PartyShell.setPhase('clue',{num:ri+1,total:ROUNDS,a:q.a,b:q.b,
    lantern:lantern,lanternName:names[lantern]});
  tellLantern();
  PartyShell.startTimer(T_CLUE,function(s){$('br-ct').textContent=s;},phaseGuess);
}

function phaseGuess(){
  var q=QS[ri];
  show('br-guess'); strip('br-strip1');
  $('br-gn').textContent='ROUND '+(ri+1)+' OF '+ROUNDS;
  $('br-glant').innerHTML='<b style="color:'+pcol(lantern)+'">'+esc(names[lantern])+'</b> has spoken';
  $('br-gspec').innerHTML=specHTML(q,null,false);
  $('br-gin').textContent='0 of '+here().length+' have pointed';
  PartyShell.setPhase('guess',{num:ri+1,total:ROUNDS,a:q.a,b:q.b,
    lantern:lantern,lanternName:names[lantern]});
  PartyShell.startTimer(T_GUESS,function(s){ var t=$('br-gt'); t.textContent=s; t.classList.toggle('low',s<=5); },phaseReveal);
}

function phaseReveal(){
  var q=QS[ri], res={}, marks=[], total=0, n=0;
  for(var i=0;i<order.length;i++){
    var pid=order[i];
    if(pid===lantern) continue;
    if(!guesses.hasOwnProperty(pid)){ res[pid]={got:'none',pts:0}; continue; }
    var diff=Math.abs(guesses[pid]-target);
    var pts=award(diff);
    scores[pid]=(scores[pid]||0)+pts;
    res[pid]={got:diff<=5?'bull':(pts>0?'near':'far'),pts:pts,diff:diff,guess:guesses[pid]};
    marks.push({v:guesses[pid],n:names[pid],col:pcol(pid),row:0});
    total+=pts; n++;
  }
  /* ⭐ the Lantern is paid for how well the ROOM did, never for their own
     accuracy, because that is what makes them think about how somebody else
     hears a word instead of just describing the target */
  var lanternPts=n?Math.round(total/n):0;
  scores[lantern]=(scores[lantern]||0)+lanternPts;
  res[lantern]={got:'lantern',pts:lanternPts,roomAvg:lanternPts};

  show('br-rev');
  snd('reveal', lanternPts>=100);
  $('br-vn').textContent='ROUND '+(ri+1)+' OF '+ROUNDS;
  $('br-vspec').innerHTML=specHTML(q,layout(marks),true);
  $('br-vverdict').innerHTML='<b style="color:'+pcol(lantern)+'">'+esc(names[lantern])+'</b> '+
    (lanternPts>=100?'read the room':(lanternPts>=50?'got them close':'lost them'))+
    ', and scores '+lanternPts;
  strip('br-strip2');

  PartyShell.setPhase('reveal',{num:ri+1,target:target,a:q.a,b:q.b,
    lantern:lantern,lanternName:names[lantern],results:res});
  PartyShell.startTimer(T_REV,function(s){$('br-vt').textContent=s;},function(){ ri++; phaseClue(); });
}

function phasePodium(){
  snd('fanfare');
  show('br-pod');
  var ids=order.slice(); ids.sort(function(a,b){return (scores[b]||0)-(scores[a]||0);});
  var html='', results={};
  for(var i=0;i<ids.length;i++){
    html+='<div class="br-row"><span class="place">'+(i+1)+'</span>'+
      '<i style="background:'+pcol(ids[i])+'"></i>'+esc(names[ids[i]])+
      '<b>'+(scores[ids[i]]||0)+'</b></div>';
    results[ids[i]]={score:scores[ids[i]]||0,place:i+1};
  }
  $('br-podrows').innerHTML=html;
  PartyShell.setPhase('podium',{scores:scores,names:names});
  PartyShell.gameComplete(results);
  $('br-again').onclick=function(){ startGame(PartyShell.players()); };
  $('br-other').onclick=function(){ PartyShell.backToPicker(); };
  $('br-end').onclick=function(){ PartyShell.closeRoom(); };
}

document.addEventListener('party-started',function(ev){ startGame(ev.detail.players); });
})();
