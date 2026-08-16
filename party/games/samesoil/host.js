/* SAME SOIL, host screen.

   One player is the subject. Two things appear. The subject picks which is more
   them, everybody else predicts what they picked, and then it opens.

   ⭐ THE SUBJECT'S OWN ANSWER IS THE ONLY AUTHORITY. Nobody can ever be told
   they are wrong about themselves, which is the whole reason this is safe to
   play with a child or with somebody you met an hour ago. Every other title in
   the pack has a right answer that belongs to the world. This one has a right
   answer that belongs to a person.

   ⭐ IT WORKS AT TWO PLAYERS, and nothing else in the pack does. That is the
   point of keeping it: a couple on a sofa is a real party size.

   Scoring: a predictor who matches scores 100. The subject scores 40 for every
   person who knew them, so being read well pays, and a subject can never lose
   by answering honestly. */
(function(){
'use strict';
function $(id){return document.getElementById(id);}
function esc(s){ return String(s).replace(/[<>&"]/g,function(c){return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c];}); }

var root=$('game-root');
root.innerHTML=
 '<div class="ss-screen" id="ss-rules"><div class="ss-timer" id="ss-rt"></div>'+
 '<div class="ss-rules">One of you is the subject each round.\n\nThe subject picks which of two things is more them.\n\nEverybody else guesses what they picked.\n\nThe subject is always right about themselves.</div>'+
 '<button class="ps-btn" id="ss-next" style="margin-top:34px">Next</button></div>'+

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

 '<div class="ss-screen ss-podium" id="ss-pod"><div class="ss-num">The night is over</div>'+
 '<div id="ss-podrows" class="ss-rows"></div>'+
 '<div class="ss-earn">Everyone earned sunbeams for playing.</div>'+
 '<div class="ss-btnrow">'+
 '<button class="ps-btn" id="ss-again">Play again</button>'+
 '<button class="ps-btn ghost" id="ss-other">Another game</button>'+
 '<button class="ps-btn ghost" id="ss-end">End night</button></div></div>';

function show(id){ var s=root.querySelectorAll('.ss-screen');
  for(var i=0;i<s.length;i++) s[i].classList.remove('on'); $(id).classList.add('on'); }

function snd(m,a){ try{ if(window.PartySound) PartySound[m](a); }catch(e){} }
function pcol(pid){ try{ return PartyShell.colorFor(pid); }catch(e){ return '#e8dcc8'; } }
var BANK=window.SAMESOIL_BANK||[], QS=[], ri=0, ROUNDS=10;
var scores={}, names={}, order=[], subject=null, subjectPick=null, guesses={};
var FAST=/[?&]ss_fast=1(&|$)/.test(location.search);
var T_RULES=FAST?3:20, T_PICK=FAST?3:14, T_GUESS=FAST?3:16, T_REV=FAST?2:8;

function pickPairs(){
  var used={}; try{used=JSON.parse(localStorage.getItem('ss_used')||'{}');}catch(e){}
  var pool=BANK.filter(function(p){return !used[p.id];});
  if(pool.length<ROUNDS){ used={}; pool=BANK.slice(); }
  QS=[];
  for(var i=0;i<ROUNDS&&pool.length;i++){
    var k=Math.floor(Math.random()*pool.length);
    var p=pool.splice(k,1)[0]; QS.push(p); used[p.id]=1;
  }
  try{localStorage.setItem('ss_used',JSON.stringify(used));}catch(e){}
}

function strip(which){
  var ids=order.slice(), rows='';
  ids.sort(function(a,b){return (scores[b]||0)-(scores[a]||0);});
  for(var i=0;i<ids.length;i++) rows+='<span><i style="background:'+pcol(ids[i])+'"></i>'+
    esc(names[ids[i]])+' <b>'+(scores[ids[i]]||0)+'</b></span>';
  var el=$(which); if(el) el.innerHTML=rows;
}
function pairHTML(q,chosen,counts){
  function side(key,label){
    var chips='';
    if(counts&&counts[key]) for(var i=0;i<counts[key].length;i++)
      chips+='<span class="ss-chip" style="border-color:'+counts[key][i].col+'"><i style="background:'+
        counts[key][i].col+'"></i>'+esc(counts[key][i].n)+'</span>';
    return '<div class="ss-side'+(chosen===key?' won':(chosen?' lost':''))+'">'+
      '<div class="ss-word">'+esc(label)+'</div><div class="ss-chips">'+chips+'</div></div>';
  }
  return side('a',q.a)+'<div class="ss-or">or</div>'+side('b',q.b);
}

/* wait for the room, not for the roster taken at kick off */
function here(excl){
  var p=PartyShell.presentPlayers(), out=[];
  for(var i=0;i<p.length;i++) if(names[p[i]]!==undefined&&p[i]!==excl) out.push(p[i]);
  return out;
}
function allIn(store,excl){
  var h=here(excl), got=0;
  for(var i=0;i<h.length;i++) if(store.hasOwnProperty(h[i])) got++;
  return h.length>0 && got>=h.length;
}

PartyShell.onPlayerMessage(function(pid,msg){
  if(!msg||names[pid]===undefined) return;
  if(msg.t==='mine'&&msg.r===ri+1&&pid===subject&&$('ss-pick').classList.contains('on')){
    subjectPick=(msg.v==='a')?'a':'b';
    $('ss-pin').textContent=esc(names[subject])+' has decided';
    /* nobody else learns it yet, and the host moves on the moment it lands so
       the room is not watching a clock for no reason */
    PartyShell.stopTimer(); phaseGuess();
  }
  else if(msg.t==='guess'&&msg.r===ri+1&&pid!==subject&&$('ss-guess').classList.contains('on')){
    guesses[pid]=(msg.v==='a')?'a':'b';
    var n=0,k; for(k in guesses) n++;
    $('ss-gin').textContent=n+' of '+here(subject).length+' have guessed'; snd('pip');
    if(allIn(guesses,subject)){ PartyShell.stopTimer(); phaseReveal(); }
  }
});

function startGame(players){
  scores={}; names={}; order=[];
  for(var i=0;i<players.length;i++){ names[players[i].id]=players[i].name; scores[players[i].id]=0; order.push(players[i].id); }
  /* every player is the subject at least once before anybody is twice */
  ROUNDS=Math.min(12,Math.max(order.length,Math.ceil(10/order.length)*order.length));
  pickPairs(); ri=0; phaseRules();
}

function phaseRules(){
  show('ss-rules');
  PartyShell.setPhase('rules',{});
  PartyShell.startTimer(T_RULES,function(s){$('ss-rt').textContent=s;},phasePick);
  $('ss-next').onclick=function(){ PartyShell.stopTimer(); phasePick(); };
}

function phasePick(){
  var q=QS[ri]; if(!q||ri>=ROUNDS){ phasePodium(); return; }
  subject=order[ri%order.length]; subjectPick=null; guesses={};
  show('ss-pick'); strip('ss-strip1');
  $('ss-pn').textContent='ROUND '+(ri+1)+' OF '+ROUNDS;
  $('ss-psub').innerHTML='<b>'+esc(names[subject])+'</b> is choosing';
  $('ss-ppair').innerHTML=pairHTML(q,null,null);
  $('ss-pin').textContent='Everyone else, eyes up and think';
  PartyShell.setPhase('pick',{num:ri+1,total:ROUNDS,a:q.a,b:q.b,
    subject:subject,subjectName:names[subject]});
  PartyShell.startTimer(T_PICK,function(s){ var t=$('ss-pt'); t.textContent=s; t.classList.toggle('low',s<=5); },
    function(){
      /* ⛔ NEVER INVENT SOMEBODY'S ANSWER ABOUT THEMSELVES. This used to flip a
         coin when the subject's phone was quiet, and the room then guessed,
         scored, and was told "Sam said butter" when Sam had said nothing. This
         is the one title whose entire rule, printed twice in this file's own
         header, is that the subject is the only authority on themselves. A
         silent subject is a skipped round and the screen says so. */
      if(!subjectPick){ phaseSkip(); return; }
      phaseGuess();
    });
}

function phaseSkip(){
  show('ss-rev');
  var q=QS[ri];
  $('ss-vn').textContent='ROUND '+(ri+1)+' OF '+ROUNDS;
  $('ss-vsaid').innerHTML='<b>'+esc(names[subject])+'</b> did not say';
  $('ss-vpair').innerHTML=pairHTML(q,null,null);
  $('ss-vknew').textContent='Only they can answer that one, so it goes back in the soil.';
  strip('ss-strip3');
  var res={},i;
  for(i=0;i<order.length;i++) res[order[i]]={got:'skipped',pts:0};
  PartyShell.setPhase('reveal',{num:ri+1,pick:null,a:q.a,b:q.b,skipped:true,
    subject:subject,subjectName:names[subject],knew:0,of:order.length-1,results:res});
  PartyShell.startTimer(T_REV,function(s){$('ss-vt').textContent=s;},function(){ ri++; phasePick(); });
}

function phaseGuess(){
  var q=QS[ri];
  show('ss-guess'); strip('ss-strip2');
  $('ss-gn').textContent='ROUND '+(ri+1)+' OF '+ROUNDS;
  $('ss-gsub').innerHTML='Which is more <b>'+esc(names[subject])+'</b>?';
  $('ss-gpair').innerHTML=pairHTML(q,null,null);
  $('ss-gin').textContent='0 of '+(order.length-1)+' have guessed';
  PartyShell.setPhase('guess',{num:ri+1,total:ROUNDS,a:q.a,b:q.b,
    subject:subject,subjectName:names[subject]});
  PartyShell.startTimer(T_GUESS,function(s){ var t=$('ss-gt'); t.textContent=s; t.classList.toggle('low',s<=5); },phaseReveal);
}

function phaseReveal(){
  var q=QS[ri], res={}, counts={a:[],b:[]}, knew=0;
  for(var i=0;i<order.length;i++){
    var pid=order[i];
    if(pid===subject){ res[pid]={got:'subject',pts:0}; continue; }
    if(guesses.hasOwnProperty(pid)){
      counts[guesses[pid]].push({n:names[pid],col:pcol(pid)});
      if(guesses[pid]===subjectPick){ scores[pid]=(scores[pid]||0)+100; knew++; res[pid]={got:'right',pts:100}; }
      else res[pid]={got:'wrong',pts:0};
    } else res[pid]={got:'none',pts:0};
  }
  var subjPts=knew*40;
  scores[subject]=(scores[subject]||0)+subjPts;
  res[subject]={got:'subject',pts:subjPts,knew:knew};

  show('ss-rev');
  snd('reveal', knew>0);
  $('ss-vn').textContent='ROUND '+(ri+1)+' OF '+ROUNDS;
  $('ss-vsaid').innerHTML='<b>'+esc(names[subject])+'</b> said';
  $('ss-vpair').innerHTML=pairHTML(q,subjectPick,counts);
  var others=order.length-1;
  $('ss-vknew').textContent=others?(knew+' of '+others+' knew that, and '+names[subject]+' scores '+subjPts):'';
  strip('ss-strip3');

  PartyShell.setPhase('reveal',{num:ri+1,pick:subjectPick,a:q.a,b:q.b,
    subject:subject,subjectName:names[subject],knew:knew,of:others,results:res});
  PartyShell.startTimer(T_REV,function(s){$('ss-vt').textContent=s;},function(){ ri++; phasePick(); });
}

function phasePodium(){
  snd('fanfare');
  show('ss-pod');
  var ids=order.slice(); ids.sort(function(a,b){return (scores[b]||0)-(scores[a]||0);});
  var html='', results={};
  for(var i=0;i<ids.length;i++){
    html+='<div class="ss-row"><span class="place">'+(i+1)+'</span>'+esc(names[ids[i]])+
          '<b>'+(scores[ids[i]]||0)+'</b></div>';
    results[ids[i]]={score:scores[ids[i]]||0,place:i+1};
  }
  $('ss-podrows').innerHTML=html;
  PartyShell.setPhase('podium',{scores:scores,names:names});
  PartyShell.gameComplete(results);
  $('ss-again').onclick=function(){ startGame(PartyShell.players()); };
  $('ss-other').onclick=function(){ PartyShell.backToPicker(); };
  $('ss-end').onclick=function(){ PartyShell.closeRoom(); };
}

document.addEventListener('party-started',function(ev){ startGame(ev.detail.players); });
})();
