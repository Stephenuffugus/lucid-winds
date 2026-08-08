/* WIDE MARGIN, phone. A dial from 0 to 100.

   ⛔ THREE WAYS TO SET IT, because a slider alone is a bad phone control. You can
   drag the track for a rough sweep, tap the big minus and plus for precision, and
   the number itself is enormous so you always know what you are about to commit.
   A player who wants exactly 47 can get exactly 47 without fighting their thumb,
   and a player who just wants "about three quarters" can throw it there.

   Nothing is sent until it settles, and it can be changed until the clock dies. */
(function(){
'use strict';
function $(id){return document.getElementById(id);}
var root=$('game-root');
root.innerHTML=
 '<div class="screen" id="wmp-wait"><div class="wmp-wait" id="wmp-wait-t">Eyes up on the big screen.</div>'+
 '<div class="wmp-sub" id="wmp-wait-s"></div></div>'+

 '<div class="screen wmp-play" id="wmp-q">'+
 '<div class="wmp-timer" id="wmp-t"></div>'+
 '<div class="wmp-num" id="wmp-n"></div>'+
 '<div class="wmp-q" id="wmp-qt"></div>'+
 '<div class="wmp-value"><span id="wmp-val">50</span><em>%</em></div>'+
 '<div class="wmp-track" id="wmp-track"><div class="wmp-fill" id="wmp-fill"></div>'+
 '<div class="wmp-knob" id="wmp-knob"></div></div>'+
 '<div class="wmp-steps">'+
 '<button class="wmp-step" id="wmp-down">&minus;</button>'+
 '<button class="wmp-step wide" id="wmp-lock">Lock it in</button>'+
 '<button class="wmp-step" id="wmp-up">+</button></div>'+
 '<div class="wmp-note" id="wmp-note">Drag the bar, or nudge it. You can change it until time is up.</div></div>'+

 '<div class="screen" id="wmp-r"><div class="wmp-result" id="wmp-rt"></div>'+
 '<div class="wmp-sub" id="wmp-rs"></div></div>';

function show(id){ var s=root.querySelectorAll('.screen');
  for(var i=0;i<s.length;i++) s[i].classList.remove('on'); $(id).classList.add('on'); }

var val=50, curR=0, dragging=false;

function paint(){
  $('wmp-val').textContent=val;
  $('wmp-fill').style.width=val+'%';
  $('wmp-knob').style.left=val+'%';
}
function setVal(v,send){
  v=Math.max(0,Math.min(100,Math.round(v)));
  if(v===val&&!send) return;
  val=v; paint();
  if(send!==false) PartyShell.sendToHost({t:'guess',r:curR,v:val});
}
function fromEvent(ev){
  var tr=$('wmp-track').getBoundingClientRect();
  var t=(ev.touches&&ev.touches[0])||ev;
  return ((t.clientX-tr.left)/tr.width)*100;
}
function down(ev){ dragging=true; ev.preventDefault(); setVal(fromEvent(ev),false); paint(); }
function move(ev){ if(!dragging) return; ev.preventDefault(); setVal(fromEvent(ev),false); }
function up(){ if(!dragging) return; dragging=false; setVal(val,true); }

var track=$('wmp-track');
track.addEventListener('pointerdown',down);
track.addEventListener('pointermove',move);
window.addEventListener('pointerup',up);
track.addEventListener('touchstart',down,{passive:false});
track.addEventListener('touchmove',move,{passive:false});
window.addEventListener('touchend',up);

$('wmp-down').addEventListener('click',function(){ setVal(val-1,true); });
$('wmp-up').addEventListener('click',function(){ setVal(val+1,true); });
$('wmp-lock').addEventListener('click',function(){
  setVal(val,true);
  $('wmp-note').textContent='In at '+val+'. You can still change it.';
});

PartyShell.onTimer(function(s){
  var t=$('wmp-t');
  if(s===null||s===undefined){ t.textContent=''; return; }
  t.textContent=s; t.classList.toggle('low',s<=5);
});

PartyShell.onPhase(function(name,data){
  data=data||{};
  if(name==='rules'){
    $('wmp-wait-t').textContent='Eyes up on the big screen.';
    $('wmp-wait-s').textContent='You will be guessing a number out of a hundred.';
    show('wmp-wait');
  }
  else if(name==='question'){
    if(data.num!==curR){ curR=data.num; val=50; paint();
      $('wmp-note').textContent='Drag the bar, or nudge it. You can change it until time is up.'; }
    $('wmp-n').textContent='ROUND '+data.num+' OF '+data.total;
    $('wmp-qt').textContent=data.q;
    show('wmp-q');
  }
  else if(name==='reveal'){
    var me=(data.results||{})[PartyShell.playerId]||{got:'none',pts:0};
    var el=$('wmp-rt'), sub=$('wmp-rs');
    if(me.got==='bull'){ el.textContent='Bullseye, +'+me.pts; el.className='wmp-result bull'; }
    else if(me.got==='near'){ el.textContent=(me.closest?'Closest in the room, +':'Close, +')+me.pts; el.className='wmp-result near'; }
    else if(me.got==='far'){ el.textContent='Wide of it this time'; el.className='wmp-result far'; }
    else { el.textContent='No guess'; el.className='wmp-result far'; }
    sub.textContent=(me.guess!==undefined)
      ? ('You said '+me.guess+'. It was '+data.answer+'.')
      : ('It was '+data.answer+'.');
    show('wmp-r');
  }
  else if(name==='standings'){
    var sc=(data.scores||{})[PartyShell.playerId];
    $('wmp-wait-t').textContent=(sc===undefined)?'Standings on the big screen.':('You have '+sc+'. Standings on the big screen.');
    $('wmp-wait-s').textContent='';
    show('wmp-wait');
  }
  else if(name==='podium'||name==='over'){
    var f=(data.scores||{})[PartyShell.playerId];
    $('wmp-wait-t').textContent='The night is over.';
    $('wmp-wait-s').textContent=(f===undefined)?'You earned sunbeams.':('You scored '+f+'. You earned sunbeams.');
    show('wmp-wait');
  }
});
paint();
show('wmp-wait');
})();
