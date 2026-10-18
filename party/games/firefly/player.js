/* FIREFLY FUTURES, phone. Renders from phase payloads only, so a phone that locked and rejoined lands in the live
   phase with everything it needs (and asks the host privately for its own answer and guess).

   ⭐ 18 Oct 2026, Astra's review (FIREFLY-D01 to D04, the copy table B2.4, the no big screen version B2.5): this phone
   shows the whole room's view in BOTH modes, phase by phase. The rules with a worked example; the answer (Yes, No or
   a quiet Pass, "Sending" then "Saved"); the guess with the question and the frozen number of answers on screen, a
   0 to M grid, "Your guess" and its acknowledgement, and this phone's OWN answer told to it alone; a round with too
   few answers says so and shows nothing about them; the reveal with the total first, then every guess by name and
   symbol under its number, and this phone's result; the scores; the podium. Nobody's Yes or No is ever on a screen.
   With no shared screen (PartyShell.noTv) this IS the room's screen, and the host plays from it too (its seat). */
(function(){
'use strict';
function $(id){return document.getElementById(id);}
function esc(s){ return String(s).replace(/[<>&"]/g,function(c){return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c];}); }
var root=$('game-root');
root.innerHTML=
 '<div class="screen" id="ffp-wait"><div class="ffp-wait" id="ffp-wait-t">You are ready. The game will appear here.</div></div>'+

 '<div class="screen ffp-scroll" id="ffp-rules"><div class="ffp-timer" id="ffp-t0"></div>'+
 '<div class="ffp-head">Firefly Futures</div><div class="ffp-lead">Here is how to play.</div>'+
 '<div class="ffp-rules">'+
 '<p>Answer Yes or No about yourself. You can also pass.</p>'+
 '<p>Guess how many answers were Yes, including yours.</p>'+
 '<p>An exact guess earns 100. One away earns 40.</p>'+
 '<p>Only the total is shown. Guesses appear at the reveal.</p>'+
 '<p class="ffp-small">The only exact guess earns 130 instead of 100.</p>'+
 '<p class="ffp-small">Example: four people answer and three say Yes. A guess of 3 earns 100. A guess of 2 or 4 earns 40.</p>'+
 '<p class="ffp-small">In a small room a total can give an answer away, so every question here is a light one.</p>'+
 '</div></div>'+

 '<div class="screen ffp-play" id="ffp-poll">'+
 '<div class="ffp-timer" id="ffp-t1"></div><div class="ffp-num" id="ffp-n1"></div>'+
 '<div class="ffp-prompt" id="ffp-p1"></div>'+
 '<div class="ffp-btns">'+
 '<button class="ffp-big yes" id="ffp-yes">YES</button>'+
 '<button class="ffp-big no" id="ffp-no">NO</button></div>'+
 '<button class="ffp-pass" id="ffp-pass">Pass</button>'+
 '<div class="ffp-status" id="ffp-note1" aria-live="polite">Only the total is shown.</div>'+
 '<div class="ffp-count" id="ffp-c1"></div></div>'+

 '<div class="screen ffp-play" id="ffp-mkt">'+
 '<div class="ffp-timer" id="ffp-t2"></div><div class="ffp-num" id="ffp-n2"></div>'+
 '<div class="ffp-qsmall" id="ffp-p2"></div>'+
 '<div class="ffp-ask" id="ffp-ask"></div>'+
 '<div class="ffp-own" id="ffp-own"></div>'+
 '<div class="ffp-grid" id="ffp-grid"></div>'+
 '<div class="ffp-yours" id="ffp-yours"></div>'+
 '<div class="ffp-status" id="ffp-note2" aria-live="polite"></div>'+
 '<div class="ffp-count" id="ffp-c2"></div></div>'+

 '<div class="screen ffp-play" id="ffp-void">'+
 '<div class="ffp-timer" id="ffp-t3"></div><div class="ffp-num" id="ffp-n3"></div>'+
 '<div class="ffp-qsmall" id="ffp-p3"></div>'+
 '<div class="ffp-result miss" id="ffp-vt">Too few answers this time. Let us try another question.</div></div>'+

 '<div class="screen ffp-scroll" id="ffp-r">'+
 '<div class="ffp-timer" id="ffp-t4"></div><div class="ffp-num" id="ffp-n4"></div>'+
 '<div class="ffp-qsmall" id="ffp-p4"></div>'+
 '<div class="ffp-total" id="ffp-yes-line"></div>'+
 '<div class="ffp-marks" id="ffp-marks"></div>'+
 '<div class="ffp-result" id="ffp-rt"></div>'+
 '<div class="ffp-mine" id="ffp-tot"></div>'+
 '<button class="ffp-toggle" id="ffp-tog">Show scores</button>'+
 '<div class="ffp-rows" id="ffp-room" hidden></div></div>'+

 '<div class="screen ffp-scroll" id="ffp-stand"><div class="ffp-head">Scores so far</div><div class="ffp-lead" id="ffp-standafter"></div>'+
 '<div class="ffp-mine" id="ffp-standme"></div><div class="ffp-place" id="ffp-standplace"></div>'+
 '<div class="ffp-rows" id="ffp-standrows"></div></div>'+

 '<div class="screen ffp-scroll" id="ffp-pod"><div class="ffp-head">Game complete</div>'+
 '<div class="ffp-mine" id="ffp-podme"></div><div class="ffp-place" id="ffp-podplace"></div>'+
 '<div class="ffp-rows" id="ffp-podrows"></div>'+
 '<div class="ffp-hint" id="ffp-podhint">Waiting for the host to choose what is next.</div></div>';

function show(id){ var s=root.querySelectorAll('.screen');
  for(var i=0;i<s.length;i++) s[i].classList.remove('on'); $(id).classList.add('on'); }

var SEATED=/[?&]seat=1(&|$)/.test(location.search);
var SAY=PartyShell.SAY||{sending:'Sending',allSet:'All set. Finishing soon.'};
var curR=0, curA=0, curKey='', myPoll=null, pollSaved=false, myBet=null, betSaved=false, showScores=false, M=0;
/* true until this page has handled its first phase: a phone that (re)loaded mid round asks the host for its own
   answer and guess, once, privately (sending vibrates the phone, so it is never sent on an ordinary round) */
var fresh=true;
function me(){ return PartyShell.playerId; }
function send(msg){ msg.r=curR; msg.a=curA; PartyShell.sendToHost(msg); }

/* ---- the answer: Yes, No or a quiet Pass, editable until time runs out ---- */
function paintPoll(){
  $('ffp-yes').classList.toggle('sel',myPoll===true);
  $('ffp-no').classList.toggle('sel',myPoll===false);
  $('ffp-pass').classList.toggle('sel',myPoll==='pass');
}
function answer(v){
  myPoll=v; pollSaved=false; paintPoll();
  $('ffp-note1').textContent=SAY.sending; $('ffp-note1').className='ffp-status sending';
  send({t:'poll',v:v});
}
$('ffp-yes').addEventListener('click',function(){answer(true);});
$('ffp-no').addEventListener('click',function(){answer(false);});
$('ffp-pass').addEventListener('click',function(){answer('pass');});

/* ---- the guess: 0 to M, editable until time runs out ---- */
function buildGrid(m){
  var html='';
  for(var v=0;v<=m;v++) html+='<button class="ffp-numbtn" data-v="'+v+'">'+v+'</button>';
  var g=$('ffp-grid'); g.innerHTML=html;
  var b=g.querySelectorAll('.ffp-numbtn');
  for(var i=0;i<b.length;i++) b[i].addEventListener('click',function(){
    myBet=parseInt(this.getAttribute('data-v'),10); betSaved=false; paintGrid();
    $('ffp-note2').textContent=SAY.sending; $('ffp-note2').className='ffp-status sending';
    send({t:'bet',v:myBet});
  });
}
function paintGrid(){
  var all=$('ffp-grid').querySelectorAll('.ffp-numbtn');
  for(var j=0;j<all.length;j++) all[j].classList.toggle('sel',parseInt(all[j].getAttribute('data-v'),10)===myBet);
  $('ffp-yours').textContent=myBet===null?'':('Your guess: '+myBet);
}
/* this phone's own answer, shown to it alone while it guesses (B2.5) */
function ownLine(){
  if(myPoll===true) return 'You answered Yes.';
  if(myPoll===false) return 'You answered No.';
  if(myPoll==='pass') return 'You passed this one.';
  return 'You did not answer this one.';
}

$('ffp-tog').addEventListener('click',function(){ showScores=!showScores; paintToggle(); });
function paintToggle(){ $('ffp-room').hidden=!showScores; $('ffp-tog').textContent=showScores?'Hide scores':'Show scores'; }

PartyShell.onTimer(function(s){
  var ts=root.querySelectorAll('.ffp-timer');
  for(var i=0;i<ts.length;i++){
    if(s===null||s===undefined){ ts[i].textContent=''; continue; }
    ts[i].textContent=s; ts[i].classList.toggle('low',s<=5);
  }
});

PartyShell.onMessage(function(msg){
  if(!msg||msg.r!==curR||(msg.a|0)!==curA) return;
  if(msg.t==='pack'){
    /* this phone's own answer, told to it alone */
    var mine=(msg.v===myPoll)||myPoll===null;
    if(myPoll===null) myPoll=msg.v;
    if(mine){
      pollSaved=true; paintPoll();
      $('ffp-note1').textContent=myPoll==='pass'?'Passed. You can still answer until time runs out.':'Saved. You can change your answer until time runs out.';
      $('ffp-note1').className='ffp-status saved';
    }
    $('ffp-own').textContent=ownLine();
  }
  else if(msg.t==='back'){
    if(myBet===null) myBet=msg.v;
    if(msg.v===myBet){ betSaved=true; paintGrid();
      $('ffp-note2').textContent='Guess saved. You can change it until time runs out.'; $('ffp-note2').className='ffp-status saved'; }
  }
  else if(msg.t==='pcount'){ $('ffp-c1').textContent=msg.n+' of '+msg.of+' answered'; }
  else if(msg.t==='bcount'){ $('ffp-c2').textContent=msg.n+' of '+msg.of+' guesses saved'; }
  else if(msg.t==='allset'){ $('ffp-c1').textContent=SAY.allSet; $('ffp-c2').textContent=SAY.allSet; }
});

/* one order and one place rule, the same as the host's: equal scores share a place */
function ranked(scores,names){
  var ids=Object.keys(names||{}); scores=scores||{};
  ids.sort(function(a,b){ return (scores[b]||0)-(scores[a]||0) || String(names[a]).localeCompare(String(names[b])); });
  var places={}, last=null, place=0, count={};
  for(var i=0;i<ids.length;i++){ var s=scores[ids[i]]||0; if(s!==last){ place=i+1; last=s; } places[ids[i]]=place; count[place]=(count[place]||0)+1; }
  return {ids:ids,places:places,count:count};
}
function rows(scores,names,cols,symz,extra){
  var r=ranked(scores,names), out='';
  for(var i=0;i<r.ids.length;i++){
    var id=r.ids[i], mine=id===me();
    out+='<div class="ffp-row'+(mine?' me':'')+'"><span class="pl">'+r.places[id]+'</span>'+
      '<i class="ffp-sym" style="color:'+esc((cols||{})[id]||'#e8dcc8')+'">'+esc((symz||{})[id]||'●')+'</i>'+
      '<span class="nm">'+esc(names[id])+(mine?' (you)':'')+'</span>'+
      (extra?'<span class="ex">'+extra(id)+'</span>':'')+
      '<b>'+((scores||{})[id]||0)+'</b></div>';
  }
  return out;
}
function placeLine(scores,names){
  var r=ranked(scores,names), p=r.places[me()];
  if(!p) return '';
  return r.count[p]>1?('Tied for '+p+' of '+r.ids.length):('Place '+p+' of '+r.ids.length);
}
function chip(c){ return '<span class="ffp-chip"><i class="ffp-sym" style="color:'+esc(c[1]||'#e8dcc8')+'">'+esc(c[2]||'●')+'</i>'+
  esc(c[0])+(c[3]?' <b>+'+c[3]+'</b>':'')+'</span>'; }
/* the guesses under their numbers, the true count lit; only numbers somebody guessed, plus the true one */
function marksHTML(m,yes,marks){
  var out='';
  for(var v=0;v<=m;v++){
    var list=(marks||{})[v]||[];
    if(!list.length&&v!==yes) continue;
    var cs=''; for(var i=0;i<list.length;i++) cs+=chip(list[i]);
    out+='<div class="ffp-mrow'+(v===yes?' lit':'')+'"><span class="ffp-mnum">'+v+'</span>'+
      '<span class="ffp-mchips">'+(cs||'<span class="ffp-none">No guesses</span>')+'</span></div>';
  }
  return out;
}

/* a new round, or the retry of one (same number, new question), clears this phone's choices */
function enterRound(data){
  var key=data.num+'.'+(data.att||0);
  if(key!==curKey){ myPoll=null; pollSaved=false; myBet=null; betSaved=false; curKey=key; }
  curR=data.num; curA=data.att||0;
}
function numLine(id,data){ $(id).textContent='ROUND '+data.num+' OF '+data.total; }

PartyShell.onPhase(function(name,data){
  data=data||{};
  handle(name,data);
  fresh=false;
});
function handle(name,data){
  if(name==='rules'){ show('ffp-rules'); }
  else if(name==='poll'){
    enterRound(data);
    numLine('ffp-n1',data);
    $('ffp-p1').textContent=data.text;
    paintPoll();
    if(!pollSaved){ $('ffp-note1').textContent='Only the total is shown.'; $('ffp-note1').className='ffp-status'; }
    $('ffp-c1').textContent='0 of '+(data.eligible||0)+' answered';
    if(fresh&&myPoll===null) send({t:'mine?'});
    show('ffp-poll');
  }
  else if(name==='market'){
    enterRound(data);
    M=data.m|0;
    numLine('ffp-n2',data);
    $('ffp-p2').textContent=data.text;
    $('ffp-ask').textContent='How many of these '+M+' answers were Yes?';
    buildGrid(M); paintGrid();
    if(!betSaved){ $('ffp-note2').textContent='Tap your guess. Include your own Yes, if you answered Yes.'; $('ffp-note2').className='ffp-status'; }
    $('ffp-own').textContent=ownLine();
    $('ffp-c2').textContent='0 of '+(data.eligible||0)+' guesses saved';
    /* a phone that reloaded mid round asks for its own answer and guess; only this phone is told */
    if(fresh&&(myPoll===null||myBet===null)) send({t:'mine?'});
    show('ffp-mkt');
  }
  else if(name==='void'){
    enterRound(data);
    numLine('ffp-n3',data);
    $('ffp-p3').textContent=data.text;
    show('ffp-void');
  }
  else if(name==='reveal'){
    enterRound(data);
    var r=(data.results||{})[me()]||{got:'none',pts:0}, el=$('ffp-rt');
    numLine('ffp-n4',data);
    $('ffp-p4').textContent=data.text;
    $('ffp-yes-line').textContent=data.yes+' of '+data.m+' answers were Yes.';
    $('ffp-marks').innerHTML=marksHTML(data.m,data.yes,data.marks);
    if(r.got==='sole'){ el.textContent='The only exact guess. +130'; el.className='ffp-result sole'; }
    else if(r.got==='exact'){ el.textContent='Exactly right. +100'; el.className='ffp-result exact'; }
    else if(r.got==='close'){ el.textContent='One away. +40'; el.className='ffp-result close'; }
    else if(r.got==='miss'){ el.textContent='You guessed '+r.guess+'. The total was '+data.yes+'.'; el.className='ffp-result miss'; }
    else { el.textContent='No guess saved this round.'; el.className='ffp-result miss'; }
    var tot=(data.scores||{})[me()];
    $('ffp-tot').textContent=tot!==undefined?('Your total is '+tot+'.'):'';
    $('ffp-room').innerHTML=rows(data.scores,data.names,data.cols,data.syms,function(id){
      var x=(data.results||{})[id]; return x&&x.pts?('+'+x.pts):''; });
    paintToggle();
    show('ffp-r');
  }
  else if(name==='standings'){
    var sc=(data.scores||{})[me()];
    $('ffp-standafter').textContent=data.num?('After round '+data.num+' of '+data.total+'.'):'';
    $('ffp-standme').textContent=sc!==undefined?('Your total is '+sc+'.'):'';
    $('ffp-standplace').textContent=sc!==undefined?placeLine(data.scores,data.names):'';
    $('ffp-standrows').innerHTML=rows(data.scores,data.names,data.cols,data.syms);
    show('ffp-stand');
  }
  else if(name==='podium'||name==='over'){
    /* 'over' carries only places; the podium already shows everything, so it stays */
    if(name==='over'&&$('ffp-pod').classList.contains('on')) return;
    if(name==='over'&&!data.names) return;
    var f=(data.scores||{})[me()];
    $('ffp-podme').textContent=f!==undefined?('Your total is '+f+'.'):'';
    $('ffp-podplace').textContent=f!==undefined?placeLine(data.scores,data.names):'';
    $('ffp-podrows').innerHTML=rows(data.scores,data.names,data.cols,data.syms);
    $('ffp-podhint').textContent=SEATED?'Your controls are just below.':'Waiting for the host to choose what is next.';
    show('ffp-pod');
  }
}
show('ffp-wait');
})();
