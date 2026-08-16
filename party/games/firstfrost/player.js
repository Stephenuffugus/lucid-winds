/* FIRST FROST, phone. Two consoles in one module: the living answer questions,
   the Frost pick the power. Which one you see comes from the frozen map inside
   the phase payload, so a rejoining phone always wakes up on the right console. */
(function(){
'use strict';
function $(id){return document.getElementById(id);}
function esc(s){ return String(s).replace(/[<>&"]/g,function(c){return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c];}); }

var root=$('game-root');
root.innerHTML=
 '<div class="screen" id="frp-wait"><div class="frp-wait" id="frp-wait-t">Eyes up on the big screen.</div>'+
 '<div class="frp-sub" id="frp-wait-s"></div></div>'+

 '<div class="screen frp-play" id="frp-q">'+
 '<div class="frp-timer" id="frp-t"></div>'+
 '<div class="frp-head"><span class="frp-num" id="frp-n"></span><span class="frp-pw" id="frp-pw"></span></div>'+
 '<div class="frp-q" id="frp-qt"></div>'+
 '<div class="frp-opts" id="frp-opts"></div>'+
 '<div class="frp-note" id="frp-note">One answer only.</div></div>'+

 '<div class="screen frp-play" id="frp-vote">'+
 '<div class="frp-timer" id="frp-vt"></div>'+
 '<div class="frp-ghosthead">You are the Frost</div>'+
 '<div class="frp-ghostsub">Choose how to spoil the next question.</div>'+
 '<div class="frp-opts" id="frp-pwopts"></div>'+
 '<div class="frp-note" id="frp-vnote">The most voted power wins.</div></div>'+

 '<div class="screen" id="frp-r"><div class="frp-result" id="frp-rt"></div>'+
 '<div class="frp-sub" id="frp-rs"></div></div>';

function show(id){ var s=root.querySelectorAll('.screen');
  for(var i=0;i<s.length;i++) s[i].classList.remove('on'); $(id).classList.add('on'); }

var curQ=0, locked=false, curOpts=[], votedPower=null, iAmFrost=false;

function renderOpts(opts){
  var same=curOpts.length===opts.length;
  if(same) for(var i=0;i<opts.length;i++) if(curOpts[i]!==opts[i]) same=false;
  if(same) return;                 /* the fog lifting must not move a button */
  curOpts=opts.slice();
  var html='';
  for(var j=0;j<opts.length;j++) html+='<button class="frp-opt" data-i="'+j+'">'+esc(opts[j])+'</button>';
  var box=$('frp-opts'); box.innerHTML=html;
  var b=box.querySelectorAll('.frp-opt');
  for(var k=0;k<b.length;k++) b[k].addEventListener('click',function(){
    if(locked) return;
    locked=true; this.classList.add('sel');
    var all=$('frp-opts').querySelectorAll('.frp-opt');
    for(var m=0;m<all.length;m++) all[m].disabled=true;
    $('frp-note').textContent='Locked in. Watch the big screen.';
    PartyShell.sendToHost({t:'answer',q:curQ,v:parseInt(this.getAttribute('data-i'),10)});
  });
}

function renderPowers(powers){
  var html='';
  for(var i=0;i<powers.length;i++)
    html+='<button class="frp-opt pw" data-k="'+powers[i].key+'">'+
      '<span class="frp-pwn">'+esc(powers[i].name)+'</span>'+
      '<span class="frp-pwd">'+esc(powers[i].desc)+'</span></button>';
  var box=$('frp-pwopts'); box.innerHTML=html;
  var b=box.querySelectorAll('.frp-opt');
  for(var k=0;k<b.length;k++) b[k].addEventListener('click',function(){
    votedPower=this.getAttribute('data-k');
    var all=$('frp-pwopts').querySelectorAll('.frp-opt');
    for(var m=0;m<all.length;m++) all[m].classList.toggle('sel',all[m].getAttribute('data-k')===votedPower);
    $('frp-vnote').textContent='Vote in. You can change it until time is up.';
    PartyShell.sendToHost({t:'power',v:votedPower});
  });
}

PartyShell.onTimer(function(s){
  var txt=(s===null||s===undefined)?'':String(s);
  var a=$('frp-t'), b=$('frp-vt');
  a.textContent=txt; b.textContent=txt;
  a.classList.toggle('low',s<=5&&s!==null); b.classList.toggle('low',s<=5&&s!==null);
});

PartyShell.onPhase(function(name,data){
  data=data||{};
  var fz=data.frozen||{};
  if(fz.hasOwnProperty(PartyShell.playerId)) iAmFrost=!!fz[PartyShell.playerId];

  if(name==='rules'){
    $('frp-wait-t').textContent='Eyes up on the big screen.';
    $('frp-wait-s').textContent='';
    show('frp-wait');
  }
  else if(name==='vote'){
    if(iAmFrost){
      votedPower=null; renderPowers(data.powers||[]);
      $('frp-vnote').textContent='The most voted power wins.';
      show('frp-vote');
    } else {
      $('frp-wait-t').textContent='The Frost are choosing.';
      $('frp-wait-s').textContent='Whatever they pick lands on you next.';
      show('frp-wait');
    }
  }
  else if(name==='question'){
    if(iAmFrost){
      $('frp-wait-t').textContent='Your power is in play.';
      $('frp-wait-s').textContent=data.powerName?('The Frost chose '+data.powerName+'.'):'';
      show('frp-wait'); return;
    }
    if(data.num!==curQ){ curQ=data.num; locked=false; curOpts=[]; $('frp-note').textContent='One answer only.'; }
    $('frp-n').textContent='QUESTION '+data.num+' OF '+data.total;
    $('frp-pw').textContent=data.powerName||'';
    $('frp-qt').textContent=data.veiled?'The Frost are hiding this one.':(data.q||'');
    $('frp-qt').className='frp-q'+(data.veiled?' veiled':'');
    renderOpts(data.options||[]);
    if(locked){
      var all=$('frp-opts').querySelectorAll('.frp-opt');
      for(var i=0;i<all.length;i++) all[i].disabled=true;
    }
    show('frp-q');
  }
  else if(name==='reveal'){
    var me=(data.results||{})[PartyShell.playerId]||{got:'none',pts:0};
    var el=$('frp-rt'), sub=$('frp-rs');
    if(me.got==='right'){ el.textContent='Right, +'+me.pts; el.className='frp-result right'; }
    else if(me.got==='frost'){
      el.textContent=me.pts>0?('The frost bit, +'+me.pts):'No damage that time';
      el.className='frp-result frost';
    }
    else if(me.got==='wrong'||me.got==='none'){
      var m=me.marks||0;
      el.textContent=(m>=3)?'The frost has you':('Wrong. '+m+' of 3 marks');
      el.className='frp-result miss';
    }
    sub.textContent='The answer was '+data.answer+'.';
    show('frp-r');
  }
  else if(name==='podium'||name==='over'){
    var f=(data.scores||{})[PartyShell.playerId];
    var sv=data.survivors||[];
    $('frp-wait-t').textContent=data.winner?(data.winner+' outlasted the frost.')
      :(sv.length>1?'The questions ran out first.':'The frost took everyone.');
    $('frp-wait-s').textContent=(f===undefined)?'You earned sunbeams.':('You scored '+f+'. You earned sunbeams.');
    show('frp-wait');
  }
});
/* the host answers a second tap from a rejoined phone with this, so the player
   is told they already answered instead of pressing a button that does nothing */
PartyShell.onMessage(function(msg){
  if(msg&&msg.t==='locked'){ locked=true; $('frp-note').textContent='Locked in. Watch the big screen.'; }
});
show('frp-wait');
})();
