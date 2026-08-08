/* THE UNDERSTUDY, host screen.

   A role appears. Everybody votes for whoever in the room fits it best, and you
   score for voting with the room rather than for being right, because there is
   no right.

   ⚖⚖ THIS TITLE SHIPPED WITH A CONDITION AND THE CONDITION LIVES IN content.js.
   The genre it borrows from can turn into a room ganging up on one person, so
   every role in the bank is a charming quirk and never a virtue or a failing. If
   a future role would embarrass the quietest person at the table when the room
   agreed on it, it does not belong in this game.

   ⛔ YOU CANNOT VOTE FOR YOURSELF. Without that rule this becomes a race to claim
   the best roles. With it, the game is about how you see each other, which is
   what it is for.

   ⭐ THE CHOSEN PLAYER SCORES TOO. Being recognised has to pay, or the person the
   room keeps picking collects a running joke and no points, and that is a bad
   seat to sit in for ten rounds. */
(function(){
'use strict';
function $(id){return document.getElementById(id);}
function esc(s){ return String(s).replace(/[<>&"]/g,function(c){return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c];}); }
function snd(m,a){ try{ if(window.PartySound) PartySound[m](a); }catch(e){} }
function pcol(pid){ try{ return PartyShell.colorFor(pid); }catch(e){ return '#e8dcc8'; } }

var root=$('game-root');
root.innerHTML=
 '<div class="us-screen" id="us-rules"><div class="us-timer" id="us-rt"></div>'+
 '<div class="us-rules">A role appears, and it belongs to one of you.\n\nVote for whoever fits it best. You cannot vote for yourself.\n\nScore for agreeing with the room, not for being right.\n\nWhoever the room chooses scores as well.</div>'+
 '<button class="ps-btn" id="us-next" style="margin-top:34px">Next</button></div>'+

 '<div class="us-screen" id="us-vote"><div class="us-timer" id="us-vt"></div>'+
 '<div class="us-num" id="us-vn"></div>'+
 '<div class="us-role" id="us-vrole"></div>'+
 '<div class="us-in" id="us-vin"></div><div class="us-strip" id="us-strip1"></div></div>'+

 '<div class="us-screen" id="us-rev"><div class="us-timer" id="us-rvt"></div>'+
 '<div class="us-num" id="us-rn"></div>'+
 '<div class="us-role small" id="us-rrole"></div>'+
 '<div class="us-winner" id="us-rwin"></div>'+
 '<div class="us-tally" id="us-rtally"></div><div class="us-strip" id="us-strip2"></div></div>'+

 '<div class="us-screen us-podium" id="us-pod"><div class="us-num">The night is over</div>'+
 '<div id="us-podrows" class="us-rows"></div>'+
 '<div class="us-earn">Everyone earned sunbeams for playing.</div>'+
 '<div class="us-btnrow">'+
 '<button class="ps-btn" id="us-again">Play again</button>'+
 '<button class="ps-btn ghost" id="us-other">Another game</button>'+
 '<button class="ps-btn ghost" id="us-end">End night</button></div></div>';

function show(id){ var s=root.querySelectorAll('.us-screen');
  for(var i=0;i<s.length;i++) s[i].classList.remove('on'); $(id).classList.add('on'); }

var BANK=window.UNDERSTUDY_BANK||[], QS=[], ri=0, ROUNDS=10;
var scores={}, names={}, order=[], votes={};
var FAST=/[?&]us_fast=1(&|$)/.test(location.search);
var T_RULES=FAST?3:20, T_VOTE=FAST?4:20, T_REV=FAST?3:9;
var VOTED_WITH_ROOM=100, CHOSEN=80;

function pickRoles(){
  var used={}; try{used=JSON.parse(localStorage.getItem('us_used')||'{}');}catch(e){}
  var pool=BANK.filter(function(r){return !used[r.id];});
  if(pool.length<ROUNDS){ used={}; pool=BANK.slice(); }
  QS=[];
  for(var i=0;i<ROUNDS&&pool.length;i++){
    var k=Math.floor(Math.random()*pool.length);
    var r=pool.splice(k,1)[0]; QS.push(r); used[r.id]=1;
  }
  try{localStorage.setItem('us_used',JSON.stringify(used));}catch(e){}
}

function strip(which){
  var ids=order.slice(), rows='';
  ids.sort(function(a,b){return (scores[b]||0)-(scores[a]||0);});
  for(var i=0;i<ids.length;i++) rows+='<span><i style="background:'+pcol(ids[i])+'"></i>'+
    esc(names[ids[i]])+' <b>'+(scores[ids[i]]||0)+'</b></span>';
  var el=$(which); if(el) el.innerHTML=rows;
}

PartyShell.onPlayerMessage(function(pid,msg){
  if(!msg||names[pid]===undefined) return;
  if(msg.t==='vote'&&msg.r===ri+1&&$('us-vote').classList.contains('on')){
    if(msg.v===pid) return;                    /* never yourself */
    if(names[msg.v]===undefined) return;
    var isNew=!votes.hasOwnProperty(pid);
    votes[pid]=msg.v;
    var n=0,k; for(k in votes) n++;
    $('us-vin').textContent=n+' of '+order.length+' have voted';
    if(isNew) snd('pip');
    if(n>=order.length){ PartyShell.stopTimer(); phaseReveal(); }
  }
});

function startGame(players){
  scores={}; names={}; order=[];
  for(var i=0;i<players.length;i++){ names[players[i].id]=players[i].name; scores[players[i].id]=0; order.push(players[i].id); }
  ROUNDS=Math.min(12,Math.max(6,order.length*2));
  pickRoles(); ri=0; phaseRules();
}

function phaseRules(){
  show('us-rules');
  PartyShell.setPhase('rules',{});
  PartyShell.startTimer(T_RULES,function(s){$('us-rt').textContent=s;},phaseVote);
  $('us-next').onclick=function(){ PartyShell.stopTimer(); phaseVote(); };
}

function phaseVote(){
  var r=QS[ri]; if(!r||ri>=ROUNDS){ phasePodium(); return; }
  votes={};
  show('us-vote'); strip('us-strip1');
  $('us-vn').textContent='ROUND '+(ri+1)+' OF '+ROUNDS;
  $('us-vrole').textContent=r.text;
  $('us-vin').textContent='0 of '+order.length+' have voted';
  var roster=[];
  for(var i=0;i<order.length;i++) roster.push({id:order[i],name:names[order[i]],color:pcol(order[i])});
  PartyShell.setPhase('vote',{num:ri+1,total:ROUNDS,role:r.text,roster:roster});
  PartyShell.startTimer(T_VOTE,function(s){ var t=$('us-vt'); t.textContent=s; t.classList.toggle('low',s<=5); },phaseReveal);
}

function phaseReveal(){
  var r=QS[ri], tally={}, k;
  for(k in votes) tally[votes[k]]=(tally[votes[k]]||0)+1;
  var top=0; for(k in tally) if(tally[k]>top) top=tally[k];
  var winners=[]; for(k in tally) if(tally[k]===top) winners.push(k);

  var res={};
  for(var i=0;i<order.length;i++){
    var pid=order[i], pts=0, got='none';
    if(votes.hasOwnProperty(pid)&&tally[votes[pid]]===top&&top>0){ pts+=VOTED_WITH_ROOM; got='withroom'; }
    else if(votes.hasOwnProperty(pid)) got='alone';
    if(winners.indexOf(pid)>=0&&top>0){ pts+=CHOSEN; got=(got==='withroom')?'both':'chosen'; }
    scores[pid]=(scores[pid]||0)+pts;
    res[pid]={got:got,pts:pts,votes:tally[pid]||0};
  }

  show('us-rev');
  snd('reveal', top>0);
  $('us-rn').textContent='ROUND '+(ri+1)+' OF '+ROUNDS;
  $('us-rrole').textContent=r.text;
  /* a tie printed as two big names side by side reads as ONE name: "Bo Del".
     The word between them is what makes it two people. */
  var wl='';
  for(var w=0;w<winners.length;w++){
    if(w) wl+='<em>and</em>';
    wl+='<span style="color:'+pcol(winners[w])+'">'+esc(names[winners[w]])+'</span>';
  }
  $('us-rwin').innerHTML=winners.length?wl:'<span class="us-nobody">Nobody, this time</span>';
  var th='';
  var ids=order.slice().sort(function(a,b){return (tally[b]||0)-(tally[a]||0);});
  for(var t=0;t<ids.length;t++){
    var c=tally[ids[t]]||0;
    th+='<div class="us-trow'+(c===top&&top>0?' won':'')+'">'+
      '<i style="background:'+pcol(ids[t])+'"></i>'+esc(names[ids[t]])+
      '<b>'+c+'</b></div>';
  }
  $('us-rtally').innerHTML=th;
  strip('us-strip2');

  PartyShell.setPhase('reveal',{num:ri+1,role:r.text,results:res,
    winners:winners.map(function(x){return names[x];})});
  PartyShell.startTimer(T_REV,function(s){$('us-rvt').textContent=s;},function(){ ri++; phaseVote(); });
}

function phasePodium(){
  snd('fanfare');
  show('us-pod');
  var ids=order.slice(); ids.sort(function(a,b){return (scores[b]||0)-(scores[a]||0);});
  var html='', results={};
  for(var i=0;i<ids.length;i++){
    html+='<div class="us-row"><span class="place">'+(i+1)+'</span>'+
      '<i style="background:'+pcol(ids[i])+'"></i>'+esc(names[ids[i]])+
      '<b>'+(scores[ids[i]]||0)+'</b></div>';
    results[ids[i]]={score:scores[ids[i]]||0,place:i+1};
  }
  $('us-podrows').innerHTML=html;
  PartyShell.setPhase('podium',{scores:scores,names:names});
  PartyShell.gameComplete(results);
  $('us-again').onclick=function(){ startGame(PartyShell.players()); };
  $('us-other').onclick=function(){ PartyShell.backToPicker(); };
  $('us-end').onclick=function(){ PartyShell.closeRoom(); };
}

document.addEventListener('party-started',function(ev){ startGame(ev.detail.players); });
})();
