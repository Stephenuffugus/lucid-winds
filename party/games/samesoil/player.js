/* SAME SOIL, phone. Renders from phase payloads only, so a rejoining phone lands on the right side of the chooser /
   guesser difference.

   ⭐ 18 Oct 2026, Astra's review (SAMESOIL-D01 to D03, the copy table B6.4, the no big screen version B6.5): this
   phone shows the whole room's view in BOTH modes, phase by phase. The rules with the game's length; the chooser's
   choice (select, then "This is my pick"); everybody else sees the pair and who is choosing while they wait; the
   guess (editable, "Sending" then "Guess saved"); the chooser sees their OWN choice, told to this phone alone; the
   reveal with every guess by name and symbol and a score panel; the podium. With no shared screen (PartyShell.noTv)
   this IS the room's screen, and the host plays from it too (its seat). */
(function(){
'use strict';
function $(id){return document.getElementById(id);}
function esc(s){ return String(s).replace(/[<>&"]/g,function(c){return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c];}); }
var root=$('game-root');
root.innerHTML=
 '<div class="screen" id="ssp-wait"><div class="ssp-wait" id="ssp-wait-t">You are ready. The game will appear here.</div>'+
 '<div class="ssp-sub" id="ssp-wait-s"></div></div>'+

 '<div class="screen ssp-scroll" id="ssp-rules"><div class="ssp-timer" id="ssp-rt"></div>'+
 '<div class="ssp-head">Same Soil</div><div class="ssp-lead">Here is how to play.</div>'+
 '<div class="ssp-rules">'+
 '<p>Each round, one person makes a secret choice.</p>'+
 '<p>Pick the option you prefer today.</p>'+
 '<p>Everyone else guesses your choice.</p>'+
 '<p>Your choice is yours. There is no wrong preference.</p>'+
 '<p class="ssp-small">A correct guess earns 100. The chooser earns 40 for each correct guess.</p>'+
 '<p class="ssp-small" id="ssp-len"></p>'+
 '</div></div>'+

 /* the chooser: select, then confirm */
 '<div class="screen ssp-play" id="ssp-pick">'+
 '<div class="ssp-timer" id="ssp-pt"></div><div class="ssp-num" id="ssp-pn"></div>'+
 '<div class="ssp-ask">Which would you pick today?</div>'+
 '<div class="ssp-btns">'+
 '<button class="ssp-big" id="ssp-pa"></button>'+
 '<button class="ssp-big" id="ssp-pb"></button>'+
 '</div>'+
 '<button class="ssp-go" id="ssp-go" disabled>This is my pick</button>'+
 '<div class="ssp-status" id="ssp-ps" aria-live="polite">Your choice stays secret until the reveal.</div></div>'+

 /* everybody else while the chooser decides: the pair, nothing to tap yet */
 '<div class="screen ssp-play" id="ssp-watch">'+
 '<div class="ssp-timer" id="ssp-wt"></div><div class="ssp-num" id="ssp-wn"></div>'+
 '<div class="ssp-ask" id="ssp-wask"></div>'+
 '<div class="ssp-cards"><div class="ssp-card" id="ssp-wa"></div><div class="ssp-or">or</div><div class="ssp-card" id="ssp-wb"></div></div>'+
 '<div class="ssp-status" id="ssp-ws"></div></div>'+

 /* the guessers */
 '<div class="screen ssp-play" id="ssp-guess">'+
 '<div class="ssp-timer" id="ssp-gt"></div><div class="ssp-num" id="ssp-gn"></div>'+
 '<div class="ssp-ask" id="ssp-gask"></div>'+
 '<div class="ssp-btns">'+
 '<button class="ssp-big" id="ssp-ga"></button>'+
 '<button class="ssp-big" id="ssp-gb"></button>'+
 '</div>'+
 '<div class="ssp-status" id="ssp-gs" aria-live="polite">Guess the option they chose.</div>'+
 '<div class="ssp-count" id="ssp-gc"></div></div>'+

 /* the chooser while the room guesses: their own choice, to them alone */
 '<div class="screen ssp-play" id="ssp-mine">'+
 '<div class="ssp-timer" id="ssp-mt"></div><div class="ssp-num" id="ssp-mn"></div>'+
 '<div class="ssp-ask">Everyone is guessing your choice.</div>'+
 '<div class="ssp-cards"><div class="ssp-card" id="ssp-ma"></div><div class="ssp-or">or</div><div class="ssp-card" id="ssp-mb"></div></div>'+
 '<div class="ssp-status" id="ssp-ms">You earn 40 for each correct guess.</div>'+
 '<div class="ssp-count" id="ssp-mc"></div></div>'+

 '<div class="screen ssp-scroll" id="ssp-r">'+
 '<div class="ssp-timer" id="ssp-vt"></div><div class="ssp-num" id="ssp-vn"></div>'+
 '<div class="ssp-said" id="ssp-said"></div>'+
 '<div class="ssp-cards"><div class="ssp-card" id="ssp-va"></div><div class="ssp-or">or</div><div class="ssp-card" id="ssp-vb"></div></div>'+
 '<div class="ssp-result" id="ssp-rt2"></div>'+
 '<div class="ssp-rsub" id="ssp-rs"></div>'+
 '<div class="ssp-mine" id="ssp-total"></div>'+
 '<button class="ssp-toggle" id="ssp-tog">Show scores</button>'+
 '<div class="ssp-rows" id="ssp-room" hidden></div></div>'+

 '<div class="screen ssp-scroll" id="ssp-pod"><div class="ssp-head">Game complete</div>'+
 '<div class="ssp-mine" id="ssp-podme"></div><div class="ssp-place" id="ssp-podplace"></div><div class="ssp-rows" id="ssp-podrows"></div>'+
 '<div class="ssp-hint" id="ssp-podhint">Waiting for the host to choose what is next.</div></div>';

function show(id){ var s=root.querySelectorAll('.screen');
  for(var i=0;i<s.length;i++) s[i].classList.remove('on'); $(id).classList.add('on'); }

var SEATED=/[?&]seat=1(&|$)/.test(location.search);
var SAY=PartyShell.SAY||{sending:'Sending',allSet:'All set. Finishing soon.'};
var curR=0, curKey='', cur={}, sel=null, locked=false, gsel=null, showScores=false;
function me(){ return PartyShell.playerId; }
function label(v){ return v==='a'?cur.a:v==='b'?cur.b:''; }

/* ---- the chooser: select, then confirm (D02) ---- */
function choose(v){
  if(locked) return;
  sel=v;
  $('ssp-pa').classList.toggle('sel',v==='a'); $('ssp-pb').classList.toggle('sel',v==='b');
  $('ssp-go').disabled=false;
}
$('ssp-pa').addEventListener('click',function(){choose('a');});
$('ssp-pb').addEventListener('click',function(){choose('b');});
$('ssp-go').addEventListener('click',function(){
  if(locked||!sel) return;
  locked=true; $('ssp-go').disabled=true;
  $('ssp-ps').textContent=SAY.sending; $('ssp-ps').className='ssp-status sending';
  PartyShell.sendToHost({t:'mine',r:curR,v:sel});
});

/* ---- the guessers: editable until time runs out ---- */
function guess(v){
  gsel=v;
  $('ssp-ga').classList.toggle('sel',v==='a'); $('ssp-gb').classList.toggle('sel',v==='b');
  $('ssp-gs').textContent=SAY.sending; $('ssp-gs').className='ssp-status sending';
  PartyShell.sendToHost({t:'guess',r:curR,v:v});
}
$('ssp-ga').addEventListener('click',function(){guess('a');});
$('ssp-gb').addEventListener('click',function(){guess('b');});

$('ssp-tog').addEventListener('click',function(){
  showScores=!showScores; paintToggle();
});
function paintToggle(){ $('ssp-room').hidden=!showScores; $('ssp-tog').textContent=showScores?'Hide scores':'Show scores'; }

PartyShell.onTimer(function(s){
  var ts=root.querySelectorAll('.ssp-timer');
  for(var i=0;i<ts.length;i++){
    if(s===null||s===undefined){ ts[i].textContent=''; continue; }
    ts[i].textContent=s; ts[i].classList.toggle('low',s<=5);
  }
});

function cards(prefix,chosen){
  $(prefix+'a').textContent=cur.a; $(prefix+'b').textContent=cur.b;
  $(prefix+'a').className='ssp-card'+(chosen==='a'?' won':chosen?' lost':'');
  $(prefix+'b').className='ssp-card'+(chosen==='b'?' won':chosen?' lost':'');
}
function chip(c){ return '<span class="ssp-chip"><i class="ssp-sym" style="color:'+esc(c[1]||'#e8dcc8')+'">'+esc(c[2]||'●')+'</i>'+esc(c[0])+'</span>'; }
function sideChips(list){ var o=''; for(var i=0;i<(list||[]).length;i++) o+=chip(list[i]); return o?'<div class="ssp-chips">'+o+'</div>':''; }

PartyShell.onMessage(function(msg){
  if(!msg||msg.r!==curR) return;
  if(msg.t==='mineok'){
    /* the chooser's own choice, told to this phone alone */
    sel=msg.v; locked=true;
    $('ssp-pa').classList.toggle('sel',sel==='a'); $('ssp-pb').classList.toggle('sel',sel==='b');
    $('ssp-go').disabled=true;
    $('ssp-ps').textContent='Your choice is saved. Let us see what everyone guesses.'; $('ssp-ps').className='ssp-status saved';
    cards('ssp-m',sel);
    $('ssp-ms').innerHTML='<b>You chose '+esc(label(sel))+'.</b> You earn 40 for each correct guess.';
  }
  else if(msg.t==='gack'&&msg.v===gsel){
    $('ssp-gs').textContent='Guess saved. You can change it until time runs out.'; $('ssp-gs').className='ssp-status saved';
  }
  else if(msg.t==='gcount'){
    var line=msg.n+' of '+msg.of+' guesses saved';
    $('ssp-gc').textContent=line; $('ssp-mc').textContent=line;
  }
  else if(msg.t==='allset'){
    $('ssp-gc').textContent=SAY.allSet; $('ssp-mc').textContent=SAY.allSet;
  }
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
    out+='<div class="ssp-row'+(mine?' me':'')+'"><span class="pl">'+r.places[id]+'</span>'+
      '<i class="ssp-sym" style="color:'+esc((cols||{})[id]||'#e8dcc8')+'">'+esc((symz||{})[id]||'●')+'</i>'+
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
function people(n){ return n===1?'1 person':(n+' people'); }

/* a new round, or the retry of one (same number, new pair), clears this phone's selections */
function enterRound(data){
  var key=data.num+'.'+(data.att||0);
  if(key!==curKey){ sel=null; locked=false; gsel=null; curKey=key; }
  curR=data.num; cur=data;
}
function numLine(id,data){ $(id).textContent='ROUND '+data.num+' OF '+data.total; }

PartyShell.onPhase(function(name,data){
  data=data||{};
  if(name==='rules'){
    $('ssp-len').textContent=data.total?('This game: '+data.total+' rounds. Each of you chooses '+data.turns+
      ' times. About '+data.lo+' to '+data.hi+' minutes.'):'';
    show('ssp-rules');
  }
  else if(name==='pick'){
    enterRound(data);
    if(data.subject===me()){
      numLine('ssp-pn',data);
      $('ssp-pa').textContent=data.a; $('ssp-pb').textContent=data.b;
      $('ssp-pa').classList.toggle('sel',sel==='a'); $('ssp-pb').classList.toggle('sel',sel==='b');
      $('ssp-go').disabled=locked||!sel;
      if(!locked){ $('ssp-ps').textContent=data.retry?'Here is another pair. Your choice stays secret until the reveal.':'Your choice stays secret until the reveal.';
        $('ssp-ps').className='ssp-status'; }
      show('ssp-pick');
    } else {
      numLine('ssp-wn',data);
      $('ssp-wask').textContent=data.subjectName+' is choosing.';
      cards('ssp-w',null);
      $('ssp-ws').textContent='What do you think '+data.subjectName+' will choose?';
      show('ssp-watch');
    }
  }
  else if(name==='guess'){
    enterRound(data);
    var line='0 of '+(data.eligible||0)+' guesses saved';
    if(data.subject===me()){
      numLine('ssp-mn',data);
      cards('ssp-m',sel);
      $('ssp-ms').innerHTML=sel?('<b>You chose '+esc(label(sel))+'.</b> You earn 40 for each correct guess.'):'You earn 40 for each correct guess.';
      $('ssp-mc').textContent=line;
      /* a phone that reloaded mid round asks for its own choice; only this phone is told */
      if(!sel) PartyShell.sendToHost({t:'mine?',r:curR});
      show('ssp-mine');
    } else {
      numLine('ssp-gn',data);
      $('ssp-gask').textContent='Which one did '+data.subjectName+' choose?';
      $('ssp-ga').textContent=data.a; $('ssp-gb').textContent=data.b;
      $('ssp-ga').classList.toggle('sel',gsel==='a'); $('ssp-gb').classList.toggle('sel',gsel==='b');
      if(!gsel){ $('ssp-gs').textContent='Guess the option they chose.'; $('ssp-gs').className='ssp-status'; }
      $('ssp-gc').textContent=line;
      show('ssp-guess');
    }
  }
  else if(name==='reveal'){
    enterRound(data);
    var r=(data.results||{})[me()]||{got:'none',pts:0};
    var el=$('ssp-rt2'), sub=$('ssp-rs'), nm=data.subjectName;
    $('ssp-vn').textContent='ROUND '+data.num+' OF '+data.total;
    if(data.skipped){
      $('ssp-said').textContent='No choice was saved.';
      cards('ssp-v',null);
      if(data.subject===me()){ el.textContent='No choice was saved.'; sub.textContent=data.retry?'This round does not count. You get another pair next.':'This round does not count.'; }
      else { el.textContent='This round does not count.'; sub.textContent='Only '+nm+' can choose. No points this round.'; }
      el.className='ssp-result miss';
    } else {
      $('ssp-said').textContent=(data.subject===me()?'You':nm)+' chose';
      cards('ssp-v',data.pick);
      var sides=data.sides||{};
      $('ssp-va').innerHTML='<span class="w">'+esc(data.a)+'</span>'+sideChips(sides.a);
      $('ssp-vb').innerHTML='<span class="w">'+esc(data.b)+'</span>'+sideChips(sides.b);
      if(r.got==='subject'){
        el.textContent=r.knew?(people(r.knew)+' matched your choice. +'+r.pts):'Your choice surprised everyone.';
        el.className='ssp-result subject';
        sub.textContent='';
      } else if(r.got==='right'){ el.textContent='You matched their choice. +100'; el.className='ssp-result right'; sub.textContent=nm+' chose '+label(data.pick)+'.'; }
      else if(r.got==='wrong'){ el.textContent='You guessed '+label(r.guess)+'. They chose '+label(data.pick)+'.'; el.className='ssp-result miss'; sub.textContent=''; }
      else { el.textContent='No guess saved this round.'; el.className='ssp-result miss'; sub.textContent=nm+' chose '+label(data.pick)+'.'; }
    }
    var tot=(data.scores||{})[me()];
    $('ssp-total').textContent=tot!==undefined?('Your total is '+tot+'.'):'';
    $('ssp-room').innerHTML=rows(data.scores,data.names,data.cols,data.syms,function(id){
      var x=(data.results||{})[id]; return x&&x.pts?('+'+x.pts):''; });
    paintToggle();
    show('ssp-r');
  }
  else if(name==='podium'||name==='over'){
    /* 'over' carries only places; the podium already shows everything, so it stays */
    if(name==='over'&&$('ssp-pod').classList.contains('on')) return;
    if(name==='over'&&!data.names) return;
    var f=(data.scores||{})[me()];
    $('ssp-podme').textContent=f!==undefined?('Your total is '+f+'.'):'';
    $('ssp-podplace').textContent=f!==undefined?placeLine(data.scores,data.names):'';
    $('ssp-podrows').innerHTML=rows(data.scores,data.names,data.cols,data.syms);
    $('ssp-podhint').textContent=SEATED?'Your controls are just below.':'Waiting for the host to choose what is next.';
    show('ssp-pod');
  }
});
show('ssp-wait');
})();
