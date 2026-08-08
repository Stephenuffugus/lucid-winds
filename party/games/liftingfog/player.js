/* LIFTING FOG, phone. Four options the whole time, one answer only.
   Renders from phase payloads only, so a rejoining phone lands in the live
   clue with the current worth showing. */
(function(){
'use strict';
function $(id){return document.getElementById(id);}
var root=$('game-root');
root.innerHTML=
 '<div class="screen" id="lfp-wait"><div class="lfp-wait" id="lfp-wait-t">Eyes up on the big screen.</div></div>'+

 '<div class="screen lfp-play" id="lfp-q">'+
 '<div class="lfp-timer" id="lfp-t"></div>'+
 '<div class="lfp-head"><span class="lfp-num" id="lfp-n"></span><span class="lfp-worth" id="lfp-w"></span></div>'+
 '<div class="lfp-clue" id="lfp-c"></div>'+
 '<div class="lfp-opts" id="lfp-opts"></div>'+
 '<div class="lfp-note" id="lfp-note">One answer only. Wait, or be brave.</div></div>'+

 '<div class="screen" id="lfp-r"><div class="lfp-result" id="lfp-rt"></div>'+
 '<div class="lfp-sub" id="lfp-rs"></div></div>';

function show(id){ var s=root.querySelectorAll('.screen');
  for(var i=0;i<s.length;i++) s[i].classList.remove('on'); $(id).classList.add('on'); }

var curQ=0, locked=false, curOpts=[];

function renderOpts(opts){
  var same = curOpts.length===opts.length;
  if(same) for(var i=0;i<opts.length;i++) if(curOpts[i]!==opts[i]) same=false;
  if(same) return;            /* a tier change must never reshuffle under a thumb */
  curOpts=opts.slice();
  var html='';
  for(var j=0;j<opts.length;j++)
    html+='<button class="lfp-opt" data-i="'+j+'">'+
      String(opts[j]).replace(/[<>&"]/g,function(c){return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c];})+'</button>';
  var box=$('lfp-opts'); box.innerHTML=html;
  var b=box.querySelectorAll('.lfp-opt');
  for(var k=0;k<b.length;k++) b[k].addEventListener('click',function(){
    if(locked) return;
    locked=true;
    this.classList.add('sel');
    var all=$('lfp-opts').querySelectorAll('.lfp-opt');
    for(var m=0;m<all.length;m++) all[m].disabled=true;
    $('lfp-note').textContent='Locked in. Watch the big screen.';
    PartyShell.sendToHost({t:'guess',q:curQ,v:parseInt(this.getAttribute('data-i'),10)});
  });
}

PartyShell.onTimer(function(s){
  var t=$('lfp-t');
  if(s===null||s===undefined){ t.textContent=''; return; }
  t.textContent=s; t.classList.toggle('low',s<=5);
});

PartyShell.onPhase(function(name,data){
  data=data||{};
  if(name==='rules'){ $('lfp-wait-t').textContent='Eyes up on the big screen.'; show('lfp-wait'); }
  else if(name==='question'){
    if(data.num!==curQ){ curQ=data.num; locked=false; curOpts=[]; $('lfp-note').textContent='One answer only. Wait, or be brave.'; }
    $('lfp-n').textContent='QUESTION '+data.num+' OF '+data.total;
    $('lfp-w').textContent='WORTH '+data.worth;
    $('lfp-c').textContent=data.clue;
    renderOpts(data.options||[]);
    if(locked){
      var all=$('lfp-opts').querySelectorAll('.lfp-opt');
      for(var i=0;i<all.length;i++) all[i].disabled=true;
    }
    show('lfp-q');
  }
  else if(name==='reveal'){
    var me=(data.results||{})[PartyShell.playerId]||{got:'none',pts:0};
    var el=$('lfp-rt');
    if(me.got==='right'){ el.textContent='Found it, +'+me.pts; el.className='lfp-result right'; }
    else if(me.got==='wrong'){ el.textContent='Not this time'; el.className='lfp-result miss'; }
    else { el.textContent='You held back'; el.className='lfp-result miss'; }
    $('lfp-rs').textContent='It was '+data.answer+'.';
    show('lfp-r');
  }
  else if(name==='standings'){
    var sc=(data.scores||{})[PartyShell.playerId];
    $('lfp-wait-t').textContent=(sc===undefined)?'Standings on the big screen.':('You have '+sc+'. Standings on the big screen.');
    show('lfp-wait');
  }
  else if(name==='podium'||name==='over'){
    var f=(data.scores||{})[PartyShell.playerId];
    $('lfp-wait-t').textContent=(f===undefined)?'The fog has cleared.':('The fog has cleared. You scored '+f+'. You earned sunbeams.');
    show('lfp-wait');
  }
});
PartyShell.onMessage(function(msg){
  if(msg&&msg.t==='locked') $('lfp-note').textContent='Locked in. Watch the big screen.';
});
show('lfp-wait');
})();
