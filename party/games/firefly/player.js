/* FIREFLY FUTURES, phone. Renders from phase payloads only, so a phone that
   locked and rejoined lands in the live phase with everything it needs. */
(function(){
'use strict';
function $(id){return document.getElementById(id);}
var root=$('game-root');
root.innerHTML=
 '<div class="screen" id="ffp-wait"><div class="ffp-wait" id="ffp-wait-t">Eyes up on the big screen.</div></div>'+

 '<div class="screen ffp-play" id="ffp-poll">'+
 '<div class="ffp-timer" id="ffp-t1"></div><div class="ffp-num" id="ffp-n1"></div>'+
 '<div class="ffp-prompt" id="ffp-p1"></div>'+
 '<div class="ffp-btns">'+
 '<button class="ffp-big yes" id="ffp-yes">YES</button>'+
 '<button class="ffp-big no" id="ffp-no">NO</button></div>'+
 '<div class="ffp-note" id="ffp-note1">Nobody sees your answer.</div></div>'+

 '<div class="screen ffp-play" id="ffp-mkt">'+
 '<div class="ffp-timer" id="ffp-t2"></div><div class="ffp-num" id="ffp-n2"></div>'+
 '<div class="ffp-ask" id="ffp-ask"></div>'+
 '<div class="ffp-grid" id="ffp-grid"></div>'+
 '<div class="ffp-note" id="ffp-note2">Tap a number. You can change it.</div></div>'+

 '<div class="screen" id="ffp-r"><div class="ffp-result" id="ffp-rt"></div>'+
 '<div class="ffp-sub" id="ffp-rs"></div></div>';

function show(id){ var s=root.querySelectorAll('.screen');
  for(var i=0;i<s.length;i++) s[i].classList.remove('on'); $(id).classList.add('on'); }

var curR=0, myPoll=null, myBet=null;

function sendPoll(v){
  myPoll=v;
  $('ffp-yes').classList.toggle('sel',v===true);
  $('ffp-no').classList.toggle('sel',v===false);
  $('ffp-note1').textContent='Answer in. You can change it until time is up.';
  PartyShell.sendToHost({t:'poll',r:curR,v:v});
}
$('ffp-yes').addEventListener('click',function(){sendPoll(true);});
$('ffp-no').addEventListener('click',function(){sendPoll(false);});

function buildGrid(n){
  var html='';
  for(var v=0;v<=n;v++) html+='<button class="ffp-numbtn" data-v="'+v+'">'+v+'</button>';
  var g=$('ffp-grid'); g.innerHTML=html;
  var b=g.querySelectorAll('.ffp-numbtn');
  for(var i=0;i<b.length;i++) b[i].addEventListener('click',function(){
    var v=parseInt(this.getAttribute('data-v'),10);
    myBet=v;
    var all=$('ffp-grid').querySelectorAll('.ffp-numbtn');
    for(var j=0;j<all.length;j++)
      all[j].classList.toggle('sel',parseInt(all[j].getAttribute('data-v'),10)===v);
    $('ffp-note2').textContent='Bet in. You can change it until time is up.';
    PartyShell.sendToHost({t:'bet',r:curR,v:v});
  });
}

PartyShell.onTimer(function(s){
  var a=$('ffp-t1'), b=$('ffp-t2');
  var txt=(s===null||s===undefined)?'':String(s);
  a.textContent=txt; b.textContent=txt;
  a.classList.toggle('low',s<=5&&s!==null); b.classList.toggle('low',s<=5&&s!==null);
});

PartyShell.onPhase(function(name,data){
  data=data||{};
  if(name==='rules'){ $('ffp-wait-t').textContent='Eyes up on the big screen.'; show('ffp-wait'); }
  else if(name==='poll'){
    curR=data.num; myPoll=null;
    $('ffp-yes').classList.remove('sel'); $('ffp-no').classList.remove('sel');
    $('ffp-n1').textContent='ROUND '+data.num+' OF '+data.total;
    $('ffp-p1').textContent=data.text;
    $('ffp-note1').textContent='Nobody sees your answer.';
    show('ffp-poll');
  }
  else if(name==='market'){
    curR=data.num; myBet=null;
    $('ffp-n2').textContent='ROUND '+data.num+' OF '+data.total;
    $('ffp-ask').textContent='How many of the '+data.n+' said yes?';
    $('ffp-note2').textContent='Tap a number. You can change it.';
    buildGrid(data.n);
    show('ffp-mkt');
  }
  else if(name==='reveal'){
    var me=(data.results||{})[PartyShell.playerId]||{got:'none',pts:0};
    var el=$('ffp-rt'), sub=$('ffp-rs');
    if(me.got==='sole'){ el.textContent='Only you had it, +130'; el.className='ffp-result sole'; }
    else if(me.got==='exact'){ el.textContent='Exactly right, +100'; el.className='ffp-result exact'; }
    else if(me.got==='close'){ el.textContent='One off, +40'; el.className='ffp-result close'; }
    else if(me.got==='miss'){ el.textContent='Not this time'; el.className='ffp-result miss'; }
    else { el.textContent='No bet placed'; el.className='ffp-result miss'; }
    sub.textContent=data.yes+' of '+data.n+' said yes.';
    show('ffp-r');
  }
  else if(name==='standings'){
    var sc=(data.scores||{})[PartyShell.playerId];
    $('ffp-wait-t').textContent=(sc===undefined)?'Standings on the big screen.':('You have '+sc+'. Standings on the big screen.');
    show('ffp-wait');
  }
  else if(name==='podium'||name==='over'){
    var f=(data.scores||{})[PartyShell.playerId];
    $('ffp-wait-t').textContent=(f===undefined)?'The night is over.':('The night is over. You lit '+f+'. You earned sunbeams.');
    show('ffp-wait');
  }
});
show('ffp-wait');
})();
