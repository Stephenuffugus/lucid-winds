/* BEARING, phone.

   Two consoles. The Lantern sees the spectrum WITH the target on it and a single
   instruction. Everybody else sees the spectrum without it and a pointer to drag.

   ⛔ NOTHING IS EVER TYPED HERE, and that is not an omission. The clue is SPOKEN
   out loud in the room. The house rule is that player text never reaches a
   screen, and speech never touches one, so this game gets the richest input a
   person has with no moderation surface at all. The Lantern's only control is a
   button that says they have said their word. */
(function(){
'use strict';
function $(id){return document.getElementById(id);}
function esc(s){ return String(s).replace(/[<>&"]/g,function(c){return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c];}); }

var root=$('game-root');
root.innerHTML=
 '<div class="screen" id="brp-wait"><div class="brp-wait" id="brp-wait-t">Eyes up on the big screen.</div>'+
 '<div class="brp-sub" id="brp-wait-s"></div></div>'+

 '<div class="screen brp-play" id="brp-lant">'+
 '<div class="brp-timer" id="brp-lt"></div>'+
 '<div class="brp-role">You are the Lantern</div>'+
 '<div class="brp-ends" id="brp-lends"></div>'+
 '<div class="brp-target" id="brp-ltrack"></div>'+
 '<div class="brp-say">Say ONE WORD out loud.<br>Just the one, and nothing else.</div>'+
 '<button class="ps-btn" id="brp-said">I have said it</button>'+
 '<div class="brp-note">Nothing is ever typed in this game. This one is spoken.</div></div>'+

 '<div class="screen brp-play" id="brp-guess">'+
 '<div class="brp-timer" id="brp-gt"></div>'+
 '<div class="brp-role" id="brp-grole"></div>'+
 '<div class="brp-ends" id="brp-gends"></div>'+
 '<div class="brp-value"><span id="brp-val">50</span></div>'+
 '<div class="brp-track" id="brp-track"><div class="brp-fill" id="brp-fill"></div>'+
 '<div class="brp-knob" id="brp-knob"></div></div>'+
 '<div class="brp-steps">'+
 '<button class="brp-step" id="brp-down">&minus;</button>'+
 '<button class="brp-step wide" id="brp-lock">Point here</button>'+
 '<button class="brp-step" id="brp-up">+</button></div>'+
 '<div class="brp-note" id="brp-note">Drag or nudge, then point when you are happy.</div></div>'+

 '<div class="screen" id="brp-r"><div class="brp-result" id="brp-rt"></div>'+
 '<div class="brp-sub" id="brp-rs"></div></div>';

function show(id){ var s=root.querySelectorAll('.screen');
  for(var i=0;i<s.length;i++) s[i].classList.remove('on'); $(id).classList.add('on'); }

var val=50, curR=0, dragging=false, locked=false, iAmLantern=false;
function paint(){
  $('brp-val').textContent=val;
  $('brp-fill').style.width=val+'%';
  $('brp-knob').style.left=val+'%';
}
/* the pointer keeps reporting so a slow thinker still scores at the timer, but
   only Point here commits, and only commits end the round early */
function setVal(v,send,lock){
  v=Math.max(0,Math.min(100,Math.round(v)));
  val=v; paint();
  if(send!==false) PartyShell.sendToHost({t:'point',r:curR,v:val,lock:!!lock||locked});
}
/* the target is handed to this phone alone and never broadcast, so it has to be
   asked for again if the phone locked and came back mid clue */
function drawTarget(t){
  $('brp-ltrack').innerHTML=
    '<span class="brp-band" style="left:'+(t-12)+'%;width:24%"></span>'+
    '<span class="brp-core" style="left:'+(t-5)+'%;width:10%"></span>'+
    '<span class="brp-pin" style="left:'+t+'%"></span>';
}
PartyShell.onMessage(function(msg){
  if(msg&&msg.t==='target'){ drawTarget(msg.v); }
});
function fromEvent(ev){
  var tr=$('brp-track').getBoundingClientRect();
  var t=(ev.touches&&ev.touches[0])||ev;
  return ((t.clientX-tr.left)/tr.width)*100;
}
function down(ev){ dragging=true; ev.preventDefault(); setVal(fromEvent(ev),false); }
function move(ev){ if(!dragging) return; ev.preventDefault(); setVal(fromEvent(ev),false); }
function up(){ if(!dragging) return; dragging=false; setVal(val,true); }
var track=$('brp-track');
track.addEventListener('pointerdown',down);
track.addEventListener('pointermove',move);
window.addEventListener('pointerup',up);
track.addEventListener('touchstart',down,{passive:false});
track.addEventListener('touchmove',move,{passive:false});
window.addEventListener('touchend',up);
$('brp-down').addEventListener('click',function(){ setVal(val-1,true); });
$('brp-up').addEventListener('click',function(){ setVal(val+1,true); });
$('brp-lock').addEventListener('click',function(){
  locked=true; setVal(val,true,true);
  $('brp-lock').textContent='Pointed at '+val;
  $('brp-note').textContent='Pointed. Move it again if you change your mind.'; });
$('brp-said').addEventListener('click',function(){
  this.disabled=true; this.textContent='Said';
  PartyShell.sendToHost({t:'spoken'});
});

PartyShell.onTimer(function(s){
  var txt=(s===null||s===undefined)?'':String(s);
  var a=$('brp-lt'), b=$('brp-gt');
  a.textContent=txt; b.textContent=txt;
  b.classList.toggle('low',s<=5&&s!==null);
});

PartyShell.onPhase(function(name,data){
  data=data||{};
  var me=PartyShell.playerId;
  if(name==='rules'){
    $('brp-wait-t').textContent='Eyes up on the big screen.';
    $('brp-wait-s').textContent='One of you will see a hidden target and say one word.';
    show('brp-wait');
  }
  else if(name==='clue'){
    iAmLantern=(data.lantern===me);
    if(iAmLantern){
      $('brp-said').disabled=false; $('brp-said').textContent='I have said it';
      $('brp-lends').innerHTML='<span>'+esc(data.a)+'</span><span>'+esc(data.b)+'</span>';
      /* the target arrives on its own private message, not in this payload */
      PartyShell.sendToHost({t:'needtarget'});
      show('brp-lant');
    } else {
      $('brp-wait-t').textContent=data.lanternName+' is thinking of a word.';
      $('brp-wait-s').textContent='Listen carefully. They only get one.';
      show('brp-wait');
    }
  }
  else if(name==='guess'){
    if(data.lantern===me){
      $('brp-wait-t').textContent='You have spoken.';
      $('brp-wait-s').textContent='You score whatever the room scores, so hope they heard it the way you meant it.';
      show('brp-wait'); return;
    }
    if(data.num!==curR){ curR=data.num; val=50; locked=false; paint();
      $('brp-lock').textContent='Point here';
      $('brp-note').textContent='Drag or nudge, then point when you are happy.'; }
    $('brp-grole').textContent='Where did they mean?';
    $('brp-gends').innerHTML='<span>'+esc(data.a)+'</span><span>'+esc(data.b)+'</span>';
    show('brp-guess');
  }
  else if(name==='reveal'){
    var r=(data.results||{})[me]||{got:'none',pts:0};
    var el=$('brp-rt'), sub=$('brp-rs');
    if(r.got==='lantern'){ el.textContent='The room scored '+r.pts+', so you do too'; el.className='brp-result lant'; }
    else if(r.got==='bull'){ el.textContent='Dead on, +'+r.pts; el.className='brp-result bull'; }
    else if(r.got==='near'){ el.textContent='Close, +'+r.pts; el.className='brp-result near'; }
    else if(r.got==='far'){ el.textContent='Not this time'; el.className='brp-result far'; }
    else { el.textContent='You did not point'; el.className='brp-result far'; }
    sub.textContent='It was at '+data.target+'.';
    show('brp-r');
  }
  else if(name==='podium'||name==='over'){
    var f=(data.scores||{})[me];
    $('brp-wait-t').textContent='The night is over.';
    $('brp-wait-s').textContent=(f===undefined)?'You earned sunbeams.':('You scored '+f+'. You earned sunbeams.');
    show('brp-wait');
  }
});
paint();
show('brp-wait');
})();
