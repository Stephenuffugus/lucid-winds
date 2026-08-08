/* THE UNDERSTUDY, phone. A role, and a button for every other player.

   ⛔ YOUR OWN NAME IS NOT ON THE LIST, and it is removed here as well as refused
   by the host. A control a player can see and press that then silently does
   nothing is worse than no control at all: they will press it, watch nothing
   happen, and conclude the game is broken. */
(function(){
'use strict';
function $(id){return document.getElementById(id);}
function esc(s){ return String(s).replace(/[<>&"]/g,function(c){return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c];}); }

var root=$('game-root');
root.innerHTML=
 '<div class="screen" id="usp-wait"><div class="usp-wait" id="usp-wait-t">Eyes up on the big screen.</div>'+
 '<div class="usp-sub" id="usp-wait-s"></div></div>'+

 '<div class="screen usp-play" id="usp-vote">'+
 '<div class="usp-timer" id="usp-t"></div>'+
 '<div class="usp-num" id="usp-n"></div>'+
 '<div class="usp-role" id="usp-role"></div>'+
 '<div class="usp-list" id="usp-list"></div>'+
 '<div class="usp-note" id="usp-note">You can change your mind until time is up.</div></div>'+

 '<div class="screen" id="usp-r"><div class="usp-result" id="usp-rt"></div>'+
 '<div class="usp-sub" id="usp-rs"></div></div>';

function show(id){ var s=root.querySelectorAll('.screen');
  for(var i=0;i<s.length;i++) s[i].classList.remove('on'); $(id).classList.add('on'); }

var curR=0, chosen=null;

function renderList(roster){
  var me=PartyShell.playerId, html='';
  for(var i=0;i<roster.length;i++){
    if(roster[i].id===me) continue;         /* never your own name */
    html+='<button class="usp-pick" data-id="'+roster[i].id+'" '+
      'style="border-color:'+roster[i].color+'">'+
      '<i style="background:'+roster[i].color+'"></i>'+esc(roster[i].name)+'</button>';
  }
  var box=$('usp-list'); box.innerHTML=html;
  var b=box.querySelectorAll('.usp-pick');
  for(var k=0;k<b.length;k++) b[k].addEventListener('click',function(){
    chosen=this.getAttribute('data-id');
    var all=$('usp-list').querySelectorAll('.usp-pick');
    for(var m=0;m<all.length;m++) all[m].classList.toggle('sel',all[m].getAttribute('data-id')===chosen);
    $('usp-note').textContent='Vote in. You can change your mind until time is up.';
    PartyShell.sendToHost({t:'vote',r:curR,v:chosen});
  });
}

PartyShell.onTimer(function(s){
  var t=$('usp-t');
  if(s===null||s===undefined){ t.textContent=''; return; }
  t.textContent=s; t.classList.toggle('low',s<=5);
});

PartyShell.onPhase(function(name,data){
  data=data||{};
  if(name==='rules'){
    $('usp-wait-t').textContent='Eyes up on the big screen.';
    $('usp-wait-s').textContent='You will be deciding who is who.';
    show('usp-wait');
  }
  else if(name==='vote'){
    if(data.num!==curR){ curR=data.num; chosen=null;
      $('usp-note').textContent='You can change your mind until time is up.'; }
    $('usp-n').textContent='ROUND '+data.num+' OF '+data.total;
    $('usp-role').textContent=data.role;
    renderList(data.roster||[]);
    show('usp-vote');
  }
  else if(name==='reveal'){
    var r=(data.results||{})[PartyShell.playerId]||{got:'none',pts:0};
    var el=$('usp-rt'), sub=$('usp-rs');
    if(r.got==='both'){ el.textContent='That is you, and you called it, +'+r.pts; el.className='usp-result both'; }
    else if(r.got==='chosen'){ el.textContent='The room says that is you, +'+r.pts; el.className='usp-result chosen'; }
    else if(r.got==='withroom'){ el.textContent='You read the room, +'+r.pts; el.className='usp-result with'; }
    else if(r.got==='alone'){ el.textContent='You saw it differently'; el.className='usp-result alone'; }
    else { el.textContent='No vote'; el.className='usp-result alone'; }
    sub.textContent=(data.winners&&data.winners.length)
      ? (data.winners.join(' and ')+': '+data.role.toLowerCase())
      : data.role;
    show('usp-r');
  }
  else if(name==='podium'||name==='over'){
    var f=(data.scores||{})[PartyShell.playerId];
    $('usp-wait-t').textContent='The night is over.';
    $('usp-wait-s').textContent=(f===undefined)?'You earned sunbeams.':('You scored '+f+'. You earned sunbeams.');
    show('usp-wait');
  }
});
show('usp-wait');
})();
