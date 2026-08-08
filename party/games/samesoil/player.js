/* SAME SOIL, phone. Two big buttons, and which question they are answering
   depends on whether this phone is the subject. Renders from phase payloads
   only, so a rejoining phone lands on the right side of that difference. */
(function(){
'use strict';
function $(id){return document.getElementById(id);}
var root=$('game-root');
root.innerHTML=
 '<div class="screen" id="ssp-wait"><div class="ssp-wait" id="ssp-wait-t">Eyes up on the big screen.</div>'+
 '<div class="ssp-sub" id="ssp-wait-s"></div></div>'+

 '<div class="screen ssp-play" id="ssp-two">'+
 '<div class="ssp-timer" id="ssp-t"></div>'+
 '<div class="ssp-num" id="ssp-n"></div>'+
 '<div class="ssp-ask" id="ssp-ask"></div>'+
 '<div class="ssp-btns">'+
 '<button class="ssp-big" id="ssp-a"></button>'+
 '<button class="ssp-big" id="ssp-b"></button>'+
 '</div>'+
 '<div class="ssp-note" id="ssp-note"></div></div>'+

 '<div class="screen" id="ssp-r"><div class="ssp-result" id="ssp-rt"></div>'+
 '<div class="ssp-sub" id="ssp-rs"></div></div>';

function show(id){ var s=root.querySelectorAll('.screen');
  for(var i=0;i<s.length;i++) s[i].classList.remove('on'); $(id).classList.add('on'); }

var curR=0, mode=null, sent=false;

function send(v){
  if(!mode) return;
  sent=true;
  $('ssp-a').classList.toggle('sel',v==='a');
  $('ssp-b').classList.toggle('sel',v==='b');
  $('ssp-note').textContent=(mode==='mine')
    ? 'That is your answer. Nobody can argue with it.'
    : 'Guess in. You can change it until time is up.';
  PartyShell.sendToHost({t:mode,r:curR,v:v});
}
$('ssp-a').addEventListener('click',function(){send('a');});
$('ssp-b').addEventListener('click',function(){send('b');});

PartyShell.onTimer(function(s){
  var t=$('ssp-t');
  if(s===null||s===undefined){ t.textContent=''; return; }
  t.textContent=s; t.classList.toggle('low',s<=5);
});

function setTwo(data,asked,note,which){
  curR=data.num; mode=which; sent=false;
  $('ssp-a').classList.remove('sel'); $('ssp-b').classList.remove('sel');
  $('ssp-n').textContent='ROUND '+data.num+' OF '+data.total;
  $('ssp-ask').textContent=asked;
  $('ssp-a').textContent=data.a;
  $('ssp-b').textContent=data.b;
  $('ssp-note').textContent=note;
  show('ssp-two');
}

PartyShell.onPhase(function(name,data){
  data=data||{};
  var me=PartyShell.playerId;
  if(name==='rules'){
    $('ssp-wait-t').textContent='Eyes up on the big screen.';
    $('ssp-wait-s').textContent='';
    show('ssp-wait');
  }
  else if(name==='pick'){
    if(data.subject===me)
      setTwo(data,'Which of these is more you?','Only you decide this one.','mine');
    else {
      $('ssp-wait-t').textContent=data.subjectName+' is choosing.';
      $('ssp-wait-s').textContent='Have a think about what they will say.';
      show('ssp-wait');
    }
  }
  else if(name==='guess'){
    if(data.subject===me){
      $('ssp-wait-t').textContent='They are guessing you.';
      $('ssp-wait-s').textContent='You score for every person who gets it right.';
      show('ssp-wait');
    } else setTwo(data,'Which is more '+data.subjectName+'?','Tap the one you think they picked.','guess');
  }
  else if(name==='reveal'){
    var r=(data.results||{})[me]||{got:'none',pts:0};
    var el=$('ssp-rt'), sub=$('ssp-rs');
    if(r.got==='subject'){
      el.textContent=(r.knew?('They knew you, +'+r.pts):'Nobody had you that time');
      el.className='ssp-result subject';
    } else if(r.got==='right'){ el.textContent='You knew them, +100'; el.className='ssp-result right'; }
    else if(r.got==='wrong'){ el.textContent='Not this time'; el.className='ssp-result miss'; }
    else { el.textContent='No guess'; el.className='ssp-result miss'; }
    sub.textContent=data.subjectName+' said '+(data.pick==='a'?data.a:data.b)+'.';
    show('ssp-r');
  }
  else if(name==='podium'||name==='over'){
    var f=(data.scores||{})[me];
    $('ssp-wait-t').textContent='The night is over.';
    $('ssp-wait-s').textContent=(f===undefined)?'You earned sunbeams.':('You scored '+f+'. You earned sunbeams.');
    show('ssp-wait');
  }
});
show('ssp-wait');
})();
