/* Mothlight PLAYER (phone). Renders from phase payloads only, so a phone
   that locked and rejoined lands in the live phase with everything it needs. */
(function(){
'use strict';
function $(id){return document.getElementById(id);}
var root=$('game-root');
root.innerHTML=
 '<div class="screen" id="mlp-wait"><div class="mlp-wait" id="mlp-wait-t">Eyes up on the big screen.</div></div>'+
 '<div class="screen" id="mlp-q" style="justify-content:flex-start;padding-top:max(18px,env(safe-area-inset-top))">'+
 '<div class="mlp-timer" id="mlp-t"></div><div class="mlp-qnum" id="mlp-n"></div>'+
 '<div class="mlp-fact" id="mlp-f"></div>'+
 '<div class="mlp-btns">'+
 '<button class="mlp-btn true" id="mlp-true">TRUE</button>'+
 '<button class="mlp-btn false" id="mlp-false">FALSE</button>'+
 '</div></div>'+
 '<div class="screen" id="mlp-r"><div class="mlp-result" id="mlp-rt"></div></div>';

function show(id){ var s=root.querySelectorAll('.screen'); for(var i=0;i<s.length;i++)s[i].classList.remove('on'); $(id).classList.add('on'); }
var curQ=0, sel=null;

function pick(v){
  sel=v;
  $('mlp-true').classList.toggle('sel',v===true);
  $('mlp-false').classList.toggle('sel',v===false);
  PartyShell.sendToHost({t:'answer',q:curQ,v:v});
}
$('mlp-true').addEventListener('click',function(){pick(true);});
$('mlp-false').addEventListener('click',function(){pick(false);});

PartyShell.onTimer(function(s){
  var t=$('mlp-t');
  if(s===null||s===undefined){ t.textContent=''; return; }
  t.textContent=s; t.classList.toggle('low',s<=5);
});
PartyShell.onPhase(function(name,data){
  if(name==='rules'){ $('mlp-wait-t').textContent='Eyes up on the big screen.'; show('mlp-wait'); }
  else if(name==='question'){
    curQ=data.num; sel=null;
    $('mlp-true').classList.remove('sel'); $('mlp-false').classList.remove('sel');
    $('mlp-n').textContent='QUESTION '+data.num+' OF '+data.total;
    $('mlp-f').textContent=data.text;
    show('mlp-q');
  }
  else if(name==='reveal'){
    var me=(data.results||{})[PartyShell.playerId]||{got:'none',pts:0};
    var el=$('mlp-rt');
    if(me.got==='lone'){ el.textContent='Lone moth, +150'; el.className='mlp-result lone'; }
    else if(me.got==='right'){ el.textContent='Right, +100'; el.className='mlp-result right'; }
    else if(me.got==='miss'){ el.textContent='Not this time'; el.className='mlp-result miss'; }
    else { el.textContent='No answer'; el.className='mlp-result miss'; }
    show('mlp-r');
  }
  else if(name==='standings'){ $('mlp-wait-t').textContent='Standings on the big screen.'; show('mlp-wait'); }
  else if(name==='podium'||name==='over'){
    var sc=(data.scores||{})[PartyShell.playerId];
    $('mlp-wait-t').textContent=(sc!==undefined)?('The night is over. You lit '+sc+'.'):'The night is over.';
    show('mlp-wait');
  }
});
show('mlp-wait');
})();
